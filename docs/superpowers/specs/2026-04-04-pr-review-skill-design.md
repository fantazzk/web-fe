# PR 자동 리뷰 & 피드백 반영 스킬 설계

## 개요

"PR 올려줘" 요청 시 PR 생성 → 리뷰 → 피드백 반영 → 머지까지 자동 수행하는 Claude Code 스킬.

## 트리거

- `/pr-review`
- "PR 올려줘", "PR 생성해줘", "PR 만들어줘" 등

## 입력

| 파라미터 | 기본값 | 설명             |
| -------- | ------ | ---------------- |
| target   | `dev`  | 머지 타겟 브랜치 |

## 실행 흐름

```
Step 1: PR 생성
  ├─ git diff {target}...HEAD로 변경사항 확인
  ├─ 변경 내역 기반 PR 제목/본문 작성
  └─ gh pr create --base {target}

Step 2: 리뷰 (병렬 에이전트 2개)
  ├─ Agent A: .claude/agents/reviewer/arch.md 기준
  │   → 파일 배치, import 경계 검사
  └─ Agent B: .claude/agents/semantic-markup/AGENT.md 기준
      → .svelte 파일 대상 시맨틱/접근성 검사

Step 3: 리뷰 코멘트
  ├─ 두 에이전트 결과를 합산
  ├─ 심각도별(Critical/Major/Minor) 테이블로 PR 코멘트 작성
  ├─ 기계 파싱용 JSON 블록 포함
  └─ 항목 없으면 "LGTM" 코멘트

Step 4: 피드백 반영 (항목이 있을 때만)
  ├─ 각 항목의 타당성을 코드 컨텍스트와 함께 검증
  ├─ 타당한 항목:
  │   ├─ 코드 수정
  │   ├─ 커밋 + push
  │   └─ "반영 완료 (커밋: {sha})" 리코멘트
  ├─ 불필요한 항목:
  │   └─ "반박: {구체적 사유}" 리코멘트
  └─ 최종 요약 코멘트 (반영 N건, 반박 N건)

Step 5: 머지
  └─ gh pr merge --squash --delete-branch
```

## 리뷰 코멘트 형식

```markdown
## 자동 리뷰 결과

### 아키텍처 (arch.md)

| #   | 심각도 | 파일 | 문제 | 제안 |
| --- | ------ | ---- | ---- | ---- |

### 시맨틱/접근성 (AGENT.md)

| #   | 심각도 | 파일 | 문제 | 제안 |
| --- | ------ | ---- | ---- | ---- |

<!-- REVIEW_DATA
[{"id":1,"severity":"Major","category":"arch",...}]
-->
```

## 안전장치

- PR 생성 전 변경사항이 없으면 중단
- 리뷰 항목이 없으면 Step 4 스킵, 바로 머지
- 피드백 반영 실패 시 PR은 열린 상태로 유지
- concurrency: 같은 브랜치에서 중복 실행 방지

## 파일 위치

- 스킬: `.claude/skills/pr-review/SKILL.md`
- 에이전트(기존): `.claude/agents/reviewer/arch.md`, `.claude/agents/semantic-markup/AGENT.md`
