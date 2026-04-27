# fantazzk

## 프로젝트 개요

fantazzk — 치지직 대회 모의 드래프트/경매 통합 플랫폼. 유저가 대회 템플릿을 만들고, 솔로(AI 상대) 또는 멀티플레이어(링크 공유)로 모의 경매/드래프트를 진행하며, 결과를 공유 카드로 커뮤니티에 바이럴한다.

## 기술 스택

- **Framework**: SvelteKit (Svelte 5 Rune mode)
- **Package Manager**: bun
- **Styling**: Tailwind CSS v4 (Vite 플러그인)
- **Theming**: `data-theme` 속성 기반 액센트 색상 전환 (gold/pink/cyan/magenta/orange)
- **TypeScript**: 엄격 모드 (noUnusedLocals, noUncheckedIndexedAccess, verbatimModuleSyntax 등)
- **Testing**: bun test (내장 테스트 러너)

## 명령어

```bash
bun run dev            # 개발 서버 (localhost:5173)
bun run build          # 프로덕션 빌드
bun run check          # svelte-check + TypeScript 타입 검사
bun run test           # bun test 테스트 실행
bun run test:watch     # 파일 변경 시 자동 재실행
bun run lint           # Prettier + ESLint 검사
bun run format         # Prettier 자동 포맷
```

## 리팩터링 진행 중 (#78)

DDD 4계층 아키텍처 도입 + MarketEngine Bounded Context 정의 작업이 진행 중이다 (이슈 [#78](https://github.com/fantazzk/web-fe/issues/78)). 아래 **"아키텍처" 섹션은 목표 상태**이며, 마이그레이션이 끝날 때까지 구·신 구조가 공존한다.

- **새 코드는 항상 새 구조에 따라 작성**한다 (예: 새 도메인 로직 → `src/lib/market-engine/domain/...`).
- 기존 코드(`src/lib/domain/{rule-engine, session, sandbox, template}/`, `src/lib/server/`)는 단계별 PR로 이전 중.
- 자세한 설계는 이슈 #78 본문 참조.

## 아키텍처 (목표 상태)

```
src/lib/
├── core.ts                  # DDD primitives — Identity, AggregateRoot, Entity, ValueObject, Association
│
├── market-engine/           # Bounded Context (현재 단일 BC)
│   ├── domain/              # 비즈니스 규칙 (UI·인프라 무관)
│   │   ├── shared/          # BC 내부 공용 (Character, Team, Category, GameType, ...)
│   │   ├── template/        # Template aggregate
│   │   ├── auction/         # Auction aggregate
│   │   ├── draft/           # Draft aggregate
│   │   ├── sandbox-board/   # SandboxBoard aggregate
│   │   └── services/        # Domain Services (cross-aggregate, 예: Factory)
│   ├── application/         # Application Services (use case 오케스트레이션)
│   ├── infrastructure/      # Repository 구현, Supabase·MSW 어댑터
│   └── presentation/        # Controllers (DTO 변환, 라우트 어댑터)
│
├── components/              # cross-BC UI (도메인 무관)
├── stores/                  # cross-BC 전역 store
├── utils/                   # 순수 헬퍼
├── types/                   # 제너릭/유틸 타입
└── features/                # SvelteKit UI 모듈 (이번 리팩터링 범위 외)
```

### 모듈 배치 규칙

| 질문                                                   | 위치                                |
| ------------------------------------------------------ | ----------------------------------- |
| Aggregate Root / Entity / VO 신규 추가?                | `market-engine/domain/<aggregate>/` |
| 여러 aggregate를 걸치는 도메인 로직 (예: Factory)?     | `market-engine/domain/services/`    |
| Repository 인터페이스?                                 | `market-engine/domain/<aggregate>/` |
| Use case 오케스트레이션 (load → domain method → save)? | `market-engine/application/`        |
| Repository 구현, Supabase 어댑터?                      | `market-engine/infrastructure/`     |
| Controller (DTO 변환·라우트 어댑터)?                   | `market-engine/presentation/`       |
| 특정 화면 전용 UI?                                     | `features/<name>/`                  |
| 2개+ feature 공용 UI?                                  | `components/`                       |
| 도메인 무관 순수 함수?                                 | `utils/`                            |

### 계층 의존 룰 (위반 시 커밋 차단)

```
presentation  →  application  →  domain
                       ↓
                infrastructure (구현만, interface는 domain에)

core.ts ← 모든 계층이 의존 가능 (BC 무관)
```

**금지 (계층)**:

- `domain/` → `application/`, `infrastructure/`, `presentation/`
- `application/` → `presentation/`
- `application/` → `infrastructure/` **구현** 직접 의존 (인터페이스 import만 OK)
- `domain/` → svelte (UI 라이브러리)

**금지 (기존 룰 유지)**:

- `features/A/` → `features/B/` 직접 import (공유 필요 시 `lib/`으로 승격)
- `components/` → `features/` import
- `utils/` → 다른 `lib/` 모듈 import

자세한 규칙: `.claude/agents/reviewer/arch.md`

## 커밋 컨벤션

한글 커밋, 이모지 미사용, 본문 최대 3줄.

```
<타입>(<범위>): <제목>

<본문>
```

타입: `기능`, `수정`, `개선`, `설정`, `문서`, `테스트`, `정리`

자세한 규칙: `.claude/skills/commit-convention/SKILL.md`

## 코딩 컨벤션

- **문자열 리터럴 유니온**: 대문자 케이스 (`'WAITING'`, `'HUMAN'`, `'AUCTION'`)
- **도메인 모델**: 불변 클래스 (readonly + 메서드가 새 인스턴스 반환)
- **테스트**: 비즈니스 규칙 검증 위주, 필드 저장 확인 등 노이즈 테스트 지양

### Tailwind v4 컨벤션

- `@theme`의 `--color-*` → 유틸리티 자동 생성. `text-accent` O, `text-[--color-accent]` X
- 테마 가변 색상은 `accent`/`accent-light`/`accent-20` 사용 (하드코딩 금지)
- 의미론적 토큰: `muted`(#777), `subtle`(#666), `dim`(#444)

## API 연동

- **OpenAPI spec**: `docs/swagger/fantazzk.yaml` — 백엔드 CI가 자동 생성, source of truth
- **MSW mock**: `src/mocks/` — handlers.ts, factories.ts, browser.ts, node.ts
- **동기화 스킬**: `/sync-api-spec` — OpenAPI PR 머지 → 타입/핸들러/팩토리 자동 동기화

## 자동화

- **lint-staged** (husky pre-commit): 커밋 시 ESLint fix + Prettier 자동 실행
- **아키텍처 리뷰 훅** (Claude Code PreToolUse): `git commit` 전 import 경계/파일 위치 자동 검사
