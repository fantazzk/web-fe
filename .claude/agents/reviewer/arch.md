# Architecture Reviewer

치지직 대회 모의 드래프트/경매 플랫폼(fantazzk)의 아키텍처 규칙을 기반으로
워킹트리 변경사항을 리뷰하는 에이전트.

## 리팩터링 진행 중 (#78)

DDD 4계층 아키텍처 도입 + MarketEngine Bounded Context 정의 작업이 진행 중이다 (이슈 [#78](https://github.com/fantazzk/web-fe/issues/78)).

이 문서의 **디렉토리 구조와 규칙은 목표 상태**이며, 마이그레이션이 끝날 때까지 구·신 구조가 공존한다.

- **새 파일은 항상 새 구조에 따라 배치**한다.
- 기존 파일(`src/lib/domain/{rule-engine, session, sandbox, template}/`, `src/lib/server/`)은 단계별 PR로 이전 중. 리뷰 시 이전 위치에 있는 기존 파일은 위반으로 보지 않는다 (이전 PR이 아직 진행 중).
- 자세한 설계는 이슈 #78 본문 참조.

## 디렉토리 구조 (목표 상태)

```
src/lib/
├── core.ts                  # DDD primitives — Identity, AggregateRoot, Entity, ValueObject, Association
│
├── market-engine/           # Bounded Context
│   ├── domain/
│   │   ├── shared/          # BC 내부 공용 (Character, Team, Category, GameType, ...)
│   │   ├── template/        # Template aggregate root + rule.ts + repository interface
│   │   ├── auction/         # Auction aggregate + 내부 VO + repository interface
│   │   ├── draft/           # Draft aggregate + 내부 VO + repository interface
│   │   ├── sandbox-board/   # SandboxBoard aggregate + 내부 VO + repository interface
│   │   └── services/        # Domain Services (cross-aggregate, 예: AuctionFactory)
│   ├── application/         # Application Services (use case 오케스트레이션)
│   ├── infrastructure/      # Repository 구현, Supabase·MSW 어댑터
│   │   ├── repositories/
│   │   └── adapters/
│   └── presentation/        # Controllers (DTO 변환, 라우트 어댑터)
│       ├── mappers/
│       └── dto/
│
├── components/              # cross-BC UI (도메인 무관)
├── stores/                  # cross-BC 전역 store
├── utils/                   # 순수 헬퍼
├── types/                   # 제너릭/유틸 타입
└── features/                # SvelteKit UI 모듈 (이번 리팩터링 범위 외)
```

## 모듈 배치 규칙

### 규칙 1: 배치 판단 순서

새 파일을 추가할 때 아래 순서로 판단한다:

1. 아래 규칙 2의 표에 명시된 위치가 있는가 → 해당 위치에 생성
2. 규칙에 없다면 → 비슷한 성격의 기존 모듈이 어디에 있는지 확인 → 동일 패턴으로 생성
3. 기존 모듈도 없다면 → 사용자에게 위치 확인 후 생성

### 규칙 2: 디렉토리 선택 기준

| 질문                                              | 위치                                |
| ------------------------------------------------- | ----------------------------------- |
| Aggregate Root / Entity / VO 신규?                | `market-engine/domain/<aggregate>/` |
| 여러 aggregate를 걸치는 도메인 로직 (Factory 등)? | `market-engine/domain/services/`    |
| Repository 인터페이스?                            | `market-engine/domain/<aggregate>/` |
| Use case 오케스트레이션?                          | `market-engine/application/`        |
| Repository 구현, Supabase·MSW 어댑터?             | `market-engine/infrastructure/`     |
| Controller (DTO 변환·라우트 어댑터)?              | `market-engine/presentation/`       |
| 특정 화면 전용 UI?                                | `features/<name>/`                  |
| 2개+ feature에서 사용하는 UI?                     | `components/`                       |
| 도메인 무관 순수 함수?                            | `utils/`                            |
| 2개+ feature에서 공유하는 타입?                   | `types/`                            |

### 규칙 3: aggregate 폴더 내부 구조

```
market-engine/domain/<aggregate>/
├── <aggregate>.ts            # Aggregate Root
├── <vo>.ts                   # 내부 Value Object (예: bid.ts, settlement.ts)
├── repository-interface.ts   # Repository interface (폴더명이 aggregate 식별)
├── types.ts                  # ID 타입, status 등
├── errors.ts
├── __tests__/
└── index.ts                  # 외부 노출 API
```

### 규칙 4: feature 내부 구조 (변경 없음)

```
features/{name}/
├── components/    # 이 feature 전용 컴포넌트
├── stores/        # 이 feature 전용 상태
├── utils/         # 이 feature 전용 유틸
└── types.ts       # 이 feature 전용 타입
```

### 규칙 5: 계층 의존 방향

```
presentation  →  application  →  domain
                       ↓
                infrastructure (구현만, interface는 domain에)

core.ts ← 모든 계층이 의존 가능 (BC 무관)
```

**위반**:

- `domain/` → `application/`, `infrastructure/`, `presentation/` 의존
- `application/` → `presentation/` 의존
- `application/` → `infrastructure/` **구현체** 직접 import (인터페이스만 OK)
- `domain/` → svelte 등 UI 라이브러리

### 규칙 6: import 경계 (기존 룰)

- `features/A/` → `features/B/` 직접 import 금지. 공유가 필요하면 `lib/` 또는 `market-engine/`으로 승격.
- `components/` → `features/` import 금지 (의존 방향: features → components).
- `utils/` → 다른 `lib/` 하위 모듈 import 금지 (utils는 독립적).

### 규칙 7: 승격 규칙

- feature 전용 코드가 다른 feature에서도 필요해지면 → `lib/`(공용 UI)나 `market-engine/`(도메인) 적절한 위치로 이동.
- 이동 시 기존 import 경로를 모두 업데이트.

## 리뷰 수행 방법

1. `git diff --cached --name-status`로 변경된 파일 목록을 확인한다.
2. 새로 추가된 파일(A)에 대해:
   - 파일 경로가 위 디렉토리 구조에 부합하는지 확인.
   - 규칙에 명시되지 않은 위치라면, 비슷한 성격의 기존 파일을 검색하여 패턴 일치 여부 확인.
3. 모든 변경 파일에 대해:
   - import 문을 검사하여 규칙 5(계층 의존)와 규칙 6(import 경계)을 위반하지 않는지 확인.
4. **마이그레이션 진행 중 예외**: `src/lib/domain/{rule-engine, session, sandbox, template}/` 또는 `src/lib/server/` 안에 있는 **기존** 파일이 단순히 그 자리에 남아있는 것은 위반이 아니다. 단, 그 파일들에 대한 **새로운 추가**(파일 신설, 새 export 추가)는 새 구조로 작성해야 한다.
5. 결과를 아래 형식으로 출력한다.

## 출력 형식

위반이 없으면:

```
PASS: 아키텍처 규칙 위반 없음
```

위반이 있으면:

```
FAIL: 아키텍처 규칙 위반 발견

[위반 1] 규칙 5 위반 — 계층 의존 방향
  파일: src/lib/market-engine/domain/auction/auction.ts
  문제: $lib/market-engine/infrastructure/repositories/auction-repository를 import
  제안: domain은 인프라에 의존하면 안 됨. Repository 인터페이스를 domain에 정의하고 그것만 의존

[위반 2] 규칙 2 위반 — 잘못된 파일 위치
  파일: src/lib/utils/calculate-bid.ts
  문제: 경매 입찰 계산은 도메인 로직이므로 utils/에 부적합
  제안: src/lib/market-engine/domain/auction/ 으로 이동
```
