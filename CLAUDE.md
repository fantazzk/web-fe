# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

fantazzk — 치지직 대회 모의 드래프트/경매 통합 플랫폼. 유저가 대회 템플릿을 만들고, 솔로(AI 상대) 또는 멀티플레이어(링크 공유)로 모의 경매/드래프트를 진행하며, 결과를 공유 카드로 커뮤니티에 바이럴한다.

## 기술 스택

- **Framework**: SvelteKit (Svelte 5 Rune mode)
- **Package Manager**: bun
- **Styling**: Tailwind CSS v4 (Vite 플러그인)
- **Theming**: `data-theme` 속성 기반 액센트 색상 전환 (gold/pink/cyan/magenta/orange)
- **Adapter**: @sveltejs/adapter-vercel
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

## 아키텍처

```
src/lib/
├── domain/        # 순수 비즈니스 로직 (UI 무관, 서버/클라이언트 공유 가능)
│   ├── rule-engine/   # 경매/드래프트 규칙 검증, 상태 전이
│   ├── session/       # 세션(방) 생명주기 및 참가자 관리
│   ├── ai/            # 솔로 모드 AI 입찰/픽 전략
│   └── template/      # 템플릿 스키마, 검증
├── server/        # 서버 전용 (Supabase, DB 쿼리, Realtime)
├── features/      # UI 기능 모듈 (각각 components/, stores/, types.ts 포함)
│   ├── auction/       # 경매 진행 화면
│   ├── draft/         # 드래프트 진행 화면
│   ├── lobby/         # 대기실 (방 생성, 참가자 목록)
│   ├── template/      # 템플릿 탐색/생성 UI
│   └── result/        # 결과 화면, 공유 카드
├── components/    # 공용 UI (2개+ feature에서 사용하는 것)
├── stores/        # 공용 상태
├── utils/         # 순수 헬퍼 (도메인 무관)
└── types/         # 공유 타입
```

### 모듈 배치 규칙

새 파일 추가 시: **규칙 확인 → 기존 패턴 참조 → 사용자 확인** 순서로 판단.

| 질문                   | 위치               |
| ---------------------- | ------------------ |
| UI 없는 비즈니스 로직? | `domain/`          |
| 서버에서만 실행?       | `server/`          |
| 특정 화면 전용 UI?     | `features/{name}/` |
| 2개+ feature 공용 UI?  | `components/`      |
| 도메인 무관 순수 함수? | `utils/`           |

### import 경계 (위반 시 커밋 차단됨)

- `domain/` → svelte import 금지 (순수 로직)
- `features/A/` → `features/B/` 직접 import 금지 (공유 필요 시 `lib/`으로 승격)
- `components/` → `features/` import 금지
- `utils/` → 다른 `lib/` 모듈 import 금지

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

## 자동화

- **lint-staged** (husky pre-commit): 커밋 시 ESLint fix + Prettier 자동 실행
- **아키텍처 리뷰 훅** (Claude Code PreToolUse): `git commit` 전 import 경계/파일 위치 자동 검사
