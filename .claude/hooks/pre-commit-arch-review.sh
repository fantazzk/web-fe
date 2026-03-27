#!/bin/bash
# 아키텍처 리뷰 훅
# PreToolUse(Bash)에서 git commit 감지 시 실행
# 위반 발견 시 exit 2로 커밋을 차단하고 사유를 Claude에 전달
#
# jq 의존성 없이 동작 (python3 -c json 파싱 사용)

set -e

INPUT=$(cat)

# JSON에서 command, cwd 추출 (jq 없이)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

# git commit 명령이 아니면 통과
if ! echo "$COMMAND" | grep -qE '^\s*git\s+commit'; then
  exit 0
fi

CWD=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('cwd',''))" 2>/dev/null || echo "")
if [ -n "$CWD" ]; then
  cd "$CWD"
fi

# staged 파일이 없으면 통과
STAGED=$(git diff --cached --name-status 2>/dev/null || true)
if [ -z "$STAGED" ]; then
  exit 0
fi

VIOLATIONS=""

# --- 검사 1: 새 파일 위치 확인 ---
NEW_FILES=$(echo "$STAGED" | grep '^A' | awk '{print $2}')
for FILE in $NEW_FILES; do
  # src/lib/ 하위 파일만 검사
  if [[ "$FILE" != src/lib/* ]]; then
    continue
  fi

  REL=${FILE#src/lib/}

  # 허용된 최상위 디렉토리 확인
  TOP_DIR=$(echo "$REL" | cut -d'/' -f1)
  case "$TOP_DIR" in
    domain|server|features|components|stores|utils|types|assets) ;;
    *)
      VIOLATIONS+="[위치] 허용되지 않은 디렉토리: $FILE\n  src/lib/ 하위는 domain/, server/, features/, components/, stores/, utils/, types/ 만 허용\n\n"
      ;;
  esac
done

# --- 검사 2: import 경계 위반 ---
CHANGED_FILES=$(echo "$STAGED" | awk '{print $NF}')

# 2-1: domain/ → svelte import 금지
for FILE in $CHANGED_FILES; do
  if [[ "$FILE" != src/lib/domain/* ]]; then
    continue
  fi

  FILE_DIFF=$(git diff --cached --unified=0 -- "$FILE" 2>/dev/null | grep '^+' | grep -v '^+++' || true)
  SVELTE_IMPORT=$(echo "$FILE_DIFF" | grep -E "from\s+['\"]svelte" || true)

  if [ -n "$SVELTE_IMPORT" ]; then
    VIOLATIONS+="[import] domain/에서 svelte import 금지: $FILE\n  $SVELTE_IMPORT\n  domain/은 순수 로직만 포함해야 함\n\n"
  fi
done

# 2-2: features 간 직접 import 금지
for FILE in $CHANGED_FILES; do
  if [[ "$FILE" != src/lib/features/* ]]; then
    continue
  fi

  FEATURE_NAME=$(echo "$FILE" | sed 's|src/lib/features/||' | cut -d'/' -f1)

  FILE_DIFF=$(git diff --cached --unified=0 -- "$FILE" 2>/dev/null | grep '^+' | grep -v '^+++' || true)
  CROSS_IMPORT=$(echo "$FILE_DIFF" | grep -E "from\s+['\"].*features/" | grep -v "features/$FEATURE_NAME" || true)

  if [ -n "$CROSS_IMPORT" ]; then
    VIOLATIONS+="[import] features 간 직접 import 금지: $FILE\n  $CROSS_IMPORT\n  공유가 필요하면 lib/ 공용으로 승격\n\n"
  fi
done

# 2-3: components/ → features/ import 금지
for FILE in $CHANGED_FILES; do
  if [[ "$FILE" != src/lib/components/* ]]; then
    continue
  fi

  FILE_DIFF=$(git diff --cached --unified=0 -- "$FILE" 2>/dev/null | grep '^+' | grep -v '^+++' || true)
  FEAT_IMPORT=$(echo "$FILE_DIFF" | grep -E "from\s+['\"].*features/" || true)

  if [ -n "$FEAT_IMPORT" ]; then
    VIOLATIONS+="[import] components/에서 features/ import 금지: $FILE\n  $FEAT_IMPORT\n  의존성 방향: features → components\n\n"
  fi
done

# 2-4: utils/ → lib/ 하위 모듈 import 금지
for FILE in $CHANGED_FILES; do
  if [[ "$FILE" != src/lib/utils/* ]]; then
    continue
  fi

  FILE_DIFF=$(git diff --cached --unified=0 -- "$FILE" 2>/dev/null | grep '^+' | grep -v '^+++' || true)
  LIB_IMPORT=$(echo "$FILE_DIFF" | grep -E "from\s+['\"](\\\$lib/(domain|server|features|components|stores))" || true)

  if [ -n "$LIB_IMPORT" ]; then
    VIOLATIONS+="[import] utils/는 독립적이어야 함: $FILE\n  $LIB_IMPORT\n  utils/는 다른 lib/ 모듈을 import하지 않음\n\n"
  fi
done

# --- 결과 ---
if [ -n "$VIOLATIONS" ]; then
  {
    echo "아키텍처 규칙 위반이 발견되어 커밋을 차단합니다."
    echo ""
    echo "위반 사항:"
    echo -e "$VIOLATIONS"
    echo "위반을 수정한 후 다시 커밋해주세요."
    echo "규칙 상세: .claude/agents/reviewer/arch.md"
  } >&2
  exit 2
fi

exit 0
