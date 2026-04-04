---
name: pr-review
description: PR 생성 → 자동 리뷰 → 피드백 반영/반박 → 머지까지 자동 수행하는 스킬. "PR 올려줘", "PR 생성해줘", "PR 만들어줘", "pr-review" 등의 요청에 반드시 사용한다.
---

# PR 자동 리뷰 & 머지 스킬

PR 생성부터 리뷰, 피드백 반영, 머지까지 전체 흐름을 자동 수행한다.

## 입력

- `target`: 머지 타겟 브랜치 (기본값: `dev`). 사용자가 명시하면 해당 브랜치 사용.

## 사전 조건 확인

실행 전 반드시 확인:

1. 현재 브랜치가 `target`과 다른지 확인. 같으면 중단하고 사용자에게 알린다.
2. `git diff {target}...HEAD`로 변경사항이 있는지 확인. 없으면 중단.
3. 커밋되지 않은 변경사항이 있으면 사용자에게 알린다.

## Step 1: PR 생성

1. `git log {target}..HEAD --oneline`으로 커밋 목록 확인
2. `git diff {target}...HEAD --stat`으로 변경 파일 확인
3. 커밋 내역과 변경사항을 분석하여 PR 제목/본문 작성
   - 제목: 70자 이내, 한글
   - 본문: `## Summary` + 변경사항 요약 (bullet points)
4. `gh pr create --base {target}` 실행
5. PR URL을 사용자에게 보여준다

## Step 2: 리뷰 실행

**두 에이전트를 병렬로 실행한다** (Agent 도구 사용):

### Agent A: 아키텍처 리뷰

- `.claude/agents/reviewer/arch.md` 파일을 읽고 그 기준을 따른다
- PR diff에 포함된 파일을 대상으로 아키텍처 규칙 검사
- 프롬프트:

```
이 PR의 변경사항을 아키텍처 관점에서 리뷰하라.

리뷰 기준: .claude/agents/reviewer/arch.md 파일을 읽고 그 규칙을 기반으로 검사하라.

대상: git diff {target}...HEAD 로 변경된 파일들

출력 형식 (JSON 배열):
[
  {
    "id": 1,
    "severity": "Critical|Major|Minor",
    "category": "arch",
    "file": "파일 경로",
    "line": 라인번호(선택),
    "issue": "문제 설명",
    "suggestion": "수정 제안"
  }
]

위반 사항이 없으면 빈 배열 [] 을 반환하라.
```

### Agent B: 시맨틱/접근성 리뷰

- `.claude/agents/semantic-markup/AGENT.md` 파일을 읽고 그 기준을 따른다
- PR diff에 포함된 `.svelte` 파일만 대상
- 프롬프트:

```
이 PR의 변경사항을 시맨틱 마크업 및 웹접근성 관점에서 리뷰하라.

리뷰 기준: .claude/agents/semantic-markup/AGENT.md 파일을 읽고 그 규칙을 기반으로 검사하라.

대상: git diff {target}...HEAD 로 변경된 .svelte 파일들

출력 형식 (JSON 배열):
[
  {
    "id": 1,
    "severity": "Critical|Major|Minor",
    "category": "a11y",
    "file": "파일 경로",
    "line": 라인번호(선택),
    "issue": "문제 설명",
    "suggestion": "수정 제안"
  }
]

위반 사항이 없으면 빈 배열 [] 을 반환하라.
.svelte 파일이 변경 대상에 없으면 빈 배열 [] 을 반환하라.
```

## Step 3: 리뷰 코멘트 작성

두 에이전트 결과를 합산하여 PR 코멘트를 작성한다.

### 항목이 있을 때

```markdown
## 자동 리뷰 결과

### 아키텍처

| #   | 심각도 | 파일        | 문제 | 제안 |
| --- | ------ | ----------- | ---- | ---- |
| 1   | Major  | src/lib/... | ...  | ...  |

### 시맨틱/접근성

| #   | 심각도 | 파일           | 문제 | 제안 |
| --- | ------ | -------------- | ---- | ---- |
| 1   | Minor  | src/routes/... | ...  | ...  |

<!-- REVIEW_DATA
[전체 JSON 배열]
-->

> Reviewed by: arch-reviewer + semantic-markup-reviewer agents
```

`gh pr comment {PR번호} --body "..."` 로 작성한다.

### 항목이 없을 때

```markdown
## 자동 리뷰 결과

LGTM — 리뷰 항목 없음.

> Reviewed by: arch-reviewer + semantic-markup-reviewer agents
```

이 경우 **Step 4를 건너뛰고** 바로 Step 5로 진행한다.

## Step 4: 피드백 반영

리뷰 항목이 있을 때만 실행한다. **피드백 반영 에이전트를 실행한다** (Agent 도구 사용):

프롬프트:

```
아래 리뷰 항목들을 하나씩 검증하고 처리하라.

리뷰 항목:
{Step 3에서 합산된 JSON 배열}

각 항목에 대해:

1. 해당 파일의 코드를 읽고 컨텍스트를 파악한다
2. 리뷰 지적이 타당한지 판단한다:
   - 타당한 경우: 코드를 수정하고 커밋한다. 커밋 메시지는 프로젝트 커밋 컨벤션을 따른다.
   - 불필요한 경우: 구체적인 반박 사유를 작성한다.

처리 결과를 아래 형식으로 반환하라 (JSON 배열):
[
  {
    "id": 1,
    "action": "fixed|rejected",
    "commit_sha": "abc1234 (fixed일 때만)",
    "comment": "반영 내용 설명 또는 반박 사유"
  }
]

주의사항:
- 수정 시 기존 기능을 깨뜨리지 않도록 한다
- 수정 후 반드시 git push 한다
- 커밋 컨벤션: .claude/skills/commit-convention/SKILL.md 파일을 읽고 따른다
```

에이전트 결과를 받으면 각 항목에 대해 PR 리코멘트를 작성한다:

- fixed: `"반영 완료 (커밋: {sha}) — {설명}"`
- rejected: `"반박: {사유}"`

마지막에 최종 요약 코멘트를 작성한다:

```markdown
## 피드백 처리 완료

- 반영: N건
- 반박: N건

{각 항목별 한 줄 요약}
```

## Step 5: 머지

```bash
gh pr merge {PR번호} --squash --delete-branch
```

머지 완료 후 사용자에게 결과를 알린다:

- PR URL
- 리뷰 항목 수
- 반영/반박 건수
- 머지 커밋 정보
