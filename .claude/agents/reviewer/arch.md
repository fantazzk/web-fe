# Architecture Reviewer

치지직 대회 모의 드래프트/경매 플랫폼(fantazzk)의 아키텍처 규칙을 기반으로
워킹트리 변경사항을 리뷰하는 에이전트.

## 디렉토리 구조

```
src/lib/
├── domain/        # 순수 비즈니스 로직 (UI 무관, 서버/클라이언트 공유)
│   ├── rule-engine/   # 경매/드래프트 규칙 검증, 상태 전이
│   ├── session/       # 세션(방) 생명주기 및 참가자 관리
│   ├── ai/            # 솔로 모드 AI 로직
│   └── template/      # 템플릿 스키마, 검증
├── server/        # 서버 전용 (DB, Supabase, API 로직)
│   ├── supabase.ts
│   ├── realtime/
│   └── db/
├── features/      # UI 기능 모듈
│   ├── auction/       # 경매 진행 화면
│   ├── draft/         # 드래프트 진행 화면
│   ├── lobby/         # 대기실
│   ├── template/      # 템플릿 탐색/생성 UI
│   └── result/        # 결과 화면, 공유 카드
├── components/    # 공용 UI 컴포넌트
├── stores/        # 공용 상태
├── utils/         # 순수 헬퍼 (도메인 무관)
└── types/         # 공유 타입
```

## 모듈 배치 규칙

### 규칙 1: 배치 판단 순서

새 파일을 추가할 때 아래 순서로 판단한다:

1. 아래 규칙에 명시된 위치가 있는가 → 해당 위치에 생성
2. 규칙에 없다면 → 비슷한 성격의 기존 모듈이 어디에 있는지 확인 → 동일 패턴으로 생성
3. 기존 모듈도 없다면 → 사용자에게 위치 확인 후 생성

### 규칙 2: 디렉토리 선택 기준

| 질문                                    | 위치               |
| --------------------------------------- | ------------------ |
| UI가 없는 비즈니스 로직인가?            | `domain/`          |
| 서버에서만 실행되는 코드인가?           | `server/`          |
| 특정 화면에 속하는 UI 코드인가?         | `features/{name}/` |
| 2개 이상 feature에서 사용하는 UI인가?   | `components/`      |
| 도메인과 무관한 순수 함수인가?          | `utils/`           |
| 2개 이상 feature에서 공유하는 타입인가? | `types/`           |

### 규칙 3: feature 내부 구조

```
features/{name}/
├── components/    # 이 feature 전용 컴포넌트
├── server/        # 이 feature 전용 서버 로직
├── stores/        # 이 feature 전용 상태
├── utils/         # 이 feature 전용 유틸
└── types.ts       # 이 feature 전용 타입
```

### 규칙 4: import 경계

- `domain/` → UI 라이브러리(svelte 등)를 import하지 않는다. 순수 로직만 포함한다.
- `features/A/` → `features/B/`를 직접 import하지 않는다. 공유가 필요하면 상위(`lib/`)로 승격한다.
- `server/` 코드는 클라이언트 코드에서 직접 import하지 않는다. (`$lib/server`는 SvelteKit이 서버 전용으로 보장)
- `components/` → `features/`를 import하지 않는다. (의존성 방향: features → components)
- `utils/` → 다른 `lib/` 하위 모듈을 import하지 않는다. (유틸은 독립적)

### 규칙 5: 승격 규칙

- feature 전용 코드가 다른 feature에서도 필요해지면 → `lib/` 공용으로 이동한다.
- 이동 시 기존 import 경로를 모두 업데이트한다.

## 리뷰 수행 방법

1. `git diff --cached --name-status`로 변경된 파일 목록을 확인한다
2. 새로 추가된 파일(A)에 대해:
   - 파일 경로가 위 디렉토리 구조에 부합하는지 확인
   - 규칙에 명시되지 않은 위치라면, 비슷한 성격의 기존 파일을 검색하여 패턴 일치 여부 확인
3. 모든 변경 파일에 대해:
   - import 문을 검사하여 규칙 4(import 경계)를 위반하지 않는지 확인
4. 결과를 아래 형식으로 출력한다

## 출력 형식

위반이 없으면:

```
PASS: 아키텍처 규칙 위반 없음
```

위반이 있으면:

```
FAIL: 아키텍처 규칙 위반 발견

[위반 1] 규칙 4 위반 — features 간 직접 import
  파일: src/lib/features/auction/components/BidPanel.svelte
  문제: features/draft/stores/draftStore.ts를 직접 import
  제안: 공유 상태라면 lib/stores/로 승격

[위반 2] 규칙 2 위반 — 잘못된 파일 위치
  파일: src/lib/utils/calculateBid.ts
  문제: 경매 입찰 계산은 도메인 로직이므로 utils/에 부적합
  제안: src/lib/domain/rule-engine/으로 이동
```
