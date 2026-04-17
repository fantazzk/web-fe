# Bun 마이그레이션 가이드

## Bun이란?

[Bun](https://bun.sh)은 Zig로 작성된 올인원 JavaScript/TypeScript 런타임이다. Node.js와 호환되면서 패키지 매니저, 번들러, 테스트 러너를 단일 바이너리에 통합했다.

핵심 특징:

- **JavaScriptCore 엔진**: Safari의 JS 엔진을 사용하며, V8 대비 시작 시간이 빠르다
- **네이티브 TypeScript 지원**: 별도 트랜스파일 없이 `.ts` 파일을 직접 실행한다
- **내장 패키지 매니저**: npm/pnpm/yarn 호환 패키지 매니저가 내장되어 있다
- **Node.js API 호환**: 대부분의 Node.js 내장 모듈(`fs`, `path`, `http` 등)을 지원한다

## 마이그레이션 목적

### 1. 의존성 설치 속도 개선

pnpm 대비 bun install이 유의미하게 빠르다. 특히 CI 환경에서 캐시 미스 시 체감 차이가 크다.

| 시나리오              | pnpm | bun                      |
| --------------------- | ---- | ------------------------ |
| 클린 설치 (캐시 없음) | 느림 | 빠름 (네이티브 resolver) |
| 락파일 기반 설치      | 보통 | 빠름                     |

### 2. 도구 체인 단순화

Node.js + pnpm + npx 조합 대신 `bun` 하나로 런타임, 패키지 관리, 스크립트 실행을 처리한다.

```bash
# 기존
pnpm install
pnpm run dev
pnpm exec vitest

# 변경 후
bun install
bun run dev
bun run test
```

### 3. DX(Developer Experience) 개선

- `bun run` 스크립트 실행 시 셸 프로세스 오버헤드가 적다
- 락파일(`bun.lock`)이 텍스트 기반으로 diff 가독성이 좋다
- 에러 메시지와 설치 로그가 간결하다

## 변경 사항

### 삭제된 파일

- `pnpm-lock.yaml` — bun.lock으로 대체

### 추가된 파일

- `bun.lock` — bun 패키지 매니저 락파일

### 변경 없는 파일

- `package.json` — 스크립트가 모두 범용 명령어(`vite`, `svelte-kit`, `vitest`)를 사용하므로 수정 불필요

## 개발 명령어 매핑

| 작업           | 기존 (pnpm)       | 변경 후 (bun)        |
| -------------- | ----------------- | -------------------- |
| 의존성 설치    | `pnpm install`    | `bun install`        |
| 개발 서버      | `pnpm dev`        | `bun run dev`        |
| 프로덕션 빌드  | `pnpm build`      | `bun run build`      |
| 타입 체크      | `pnpm check`      | `bun run check`      |
| 테스트         | `pnpm test`       | `bun run test`       |
| 테스트 (watch) | `pnpm test:watch` | `bun run test:watch` |
| 린트           | `pnpm lint`       | `bun run lint`       |
| 포맷           | `pnpm format`     | `bun run format`     |

## 주의사항

### Node.js 호환성

Bun은 Node.js API를 대부분 지원하지만 100% 호환은 아니다. 주요 차이점:

- **`node:worker_threads`** 등 일부 모듈은 부분 지원
- **네이티브 애드온** (`.node` 파일)은 지원하지 않는 경우가 있음
- 이 프로젝트에서는 네이티브 애드온을 사용하지 않으므로 문제없음

### husky / lint-staged

`bun install` 실행 시 `prepare` 스크립트(`husky`)가 정상 실행된다. `lint-staged`도 bun 환경에서 동일하게 동작한다.

## 설치 방법

bun이 설치되지 않은 경우:

```bash
curl -fsSL https://bun.sh/install | bash
```

설치 후 셸을 재시작하거나 `source ~/.zshrc`를 실행한다.
