---
name: jeff-pro-sync-api-spec
description: Use when backend OpenAPI spec PR is open and needs to be merged and synced to frontend types, MSW handlers, and mock factories. Triggered by '/sync-api-spec' or when user mentions API spec sync, OpenAPI sync, swagger sync.
---

# Sync API Spec

백엔드 CI가 생성한 OpenAPI spec PR을 머지하고, 워크트리에서 프론트엔드 타입/MSW 핸들러/mock 팩토리를 동기화한 뒤 자동 PR 생성 및 머지까지 완료한다. 사용자에게 중간 보고하지 않는다.

## 전제 조건

- 백엔드 repo(`fantazzk/server`) CI가 `automation/openapi-sync` 브랜치로 PR을 생성
- PR 내용: `docs/swagger/fantazzk.yaml` 파일 추가/변경
- 대상 브랜치: `dev`

## 전체 흐름

```
Step 1: OpenAPI PR 탐색 및 dev에 머지 (1차 dev 머지)
    ↓
Step 2: /wt 스킬로 워크트리 분리
    ↓
Step 3: yaml 파싱 및 diff 분석
    ↓
Step 4: 타입 파일 업데이트 (src/lib/types/api.ts)
    ↓
Step 5: MSW 핸들러 업데이트 (src/mocks/handlers.ts)
    ↓
Step 6: Mock 팩토리 업데이트 (src/mocks/factories.ts)
    ↓
Step 7: 타입 체크 → 커밋 → dev rebase → PR 생성 → 즉시 머지 (2차 dev 머지)
    ↓
Step 8: 워크트리 정리
```

---

## Step 1: OpenAPI PR 탐색 및 머지

### 1-1. PR 검색

```bash
gh pr list --search "openapi" --state open --json number,title,headRefName,files
```

`automation/openapi-sync` 브랜치의 PR을 찾는다. 없으면 사용자에게 알리고 중단.

### 1-2. PR diff 확인

```bash
gh pr diff <PR_NUMBER>
```

### 1-3. 머지 (1차 dev 머지)

```bash
gh pr merge <PR_NUMBER> --merge
```

### 1-4. dev 브랜치 최신화

```bash
git checkout dev && git pull origin dev
```

---

## Step 2: 워크트리 분리

`/wt` 스킬을 호출하여 작업 환경을 분리한다.

```
/wt sync-api-spec "OpenAPI spec 동기화"
```

이후 모든 작업은 워크트리 내에서 수행한다.

---

## Step 3: yaml 파싱 및 diff 분석

`docs/swagger/fantazzk.yaml` 파일을 읽고 현재 프론트엔드 코드와의 차이를 분석한다.

### 비교 대상

| yaml (source of truth)                  | 프론트엔드 파일                      |
| --------------------------------------- | ------------------------------------ |
| `paths`                                 | `src/mocks/handlers.ts` 핸들러 목록  |
| `components.schemas` (Request/Response) | `src/lib/types/api.ts` 타입 정의     |
| `components.schemas` (Response 기본값)  | `src/mocks/factories.ts` 팩토리 함수 |

### diff 결과 분류

- **NEW**: yaml에 있지만 프론트엔드에 없음 → 추가
- **CHANGED**: 양쪽 다 있지만 스키마가 다름 → 수정
- **REMOVED**: 프론트엔드에 있지만 yaml에 없음 → 삭제하지 않음 (프론트 전용 엔드포인트일 수 있음)

**REMOVED 항목은 자동 삭제하지 않는다.** yaml에 아직 반영되지 않은 프론트엔드 전용 엔드포인트(`/bid`, `/settle`, `/pick` 등)일 수 있다.

---

## Step 4: 타입 파일 업데이트

**파일**: `src/lib/types/api.ts`

### 규칙

1. yaml `components.schemas`에서 Request/Response 타입 추출
2. NEW/CHANGED 항목만 반영
3. **코딩 컨벤션 준수**:
   - 문자열 리터럴 유니온은 대문자 케이스 (`'AUCTION'`, `'DRAFT'`, `'SNAKE'`)
   - `enum` → TypeScript 문자열 리터럴 유니온
   - optional 필드는 `?` 사용
4. 기존 `ApiResponse<T>`, `ApiError` 공통 타입은 수정하지 않는다
5. 섹션 구분 주석(`// ─── Template API ───` 등) 패턴 유지

### 타입 매핑

| OpenAPI                   | TypeScript                   |
| ------------------------- | ---------------------------- |
| `string`                  | `string`                     |
| `string` + `format: uuid` | `string`                     |
| `string` + `enum`         | 리터럴 유니온 (`'A' \| 'B'`) |
| `integer` / `int32`       | `number`                     |
| `boolean`                 | `boolean`                    |
| `array` + `items.$ref`    | `TypeName[]`                 |
| `object`                  | `Record<string, unknown>`    |
| `$ref`                    | 참조된 타입명                |

---

## Step 5: MSW 핸들러 업데이트

**파일**: `src/mocks/handlers.ts`

### 규칙

1. yaml `paths`에서 엔드포인트 추출
2. path + method → MSW v2 핸들러 매핑:
   - `GET` → `http.get(...)`, `POST` → `http.post(...)`, `PUT` → `http.put(...)`, `DELETE` → `http.delete(...)`
   - path parameter `{param}` → MSW `:param`
3. 응답은 factories 팩토리 함수를 `success()` 래퍼로 감싸서 반환
4. POST 201 응답은 `{ status: 201 }` 옵션 추가
5. 헤더 파라미터(`X-Room-Action-Token` 등)는 mock이므로 별도 처리 안 함
6. 기존 패턴 유지:
   - `const BASE_URL = import.meta.env['PUBLIC_API_URL'] ?? '';`
   - 섹션 주석, `success()` import from `./factories`

### 팩토리 함수 네이밍

| 응답 형태                  | 팩토리 함수명               |
| -------------------------- | --------------------------- |
| `FooResponse`              | `createFooResponse()`       |
| `FooResponse[]`            | `createFooListResponse()`   |
| 상세 조회 (`:id` 파라미터) | `createFooDetailResponse()` |

---

## Step 6: Mock 팩토리 업데이트

**파일**: `src/mocks/factories.ts`

### 규칙

1. 새 Response 타입마다 팩토리 함수 추가:
   ```typescript
   export function createFooResponse(overrides?: Partial<FooResponse>): FooResponse {
   	return {
   		field1: '기본값',
   		field2: 0,
   		...overrides
   	};
   }
   ```
2. **기본값**: 의미 있는 더미 데이터 (선수명, 대회명 등 한글/영문), 현실적 숫자, enum은 첫 번째 값, array는 2~3개
3. 기존 `success()`, `error()` 래퍼는 수정하지 않는다
4. `$lib/types/api`에서 타입 import

---

## Step 7: 타입 체크 → 커밋 → dev rebase → PR 생성 → 머지

### 7-1. 타입 체크

```bash
bun run check
```

에러가 있으면 수정한다.

### 7-2. 커밋

commit-convention 스킬을 따른다. 예시:

```
설정(api): OpenAPI spec 동기화 — 타입/핸들러/팩토리 업데이트
```

### 7-3. dev rebase

Step 1에서 OpenAPI PR을 dev에 머지했으므로 dev가 변경된 상태다. 워크트리 브랜치를 dev 최신 위에 rebase한다.

```bash
git fetch origin dev
git rebase origin/dev
```

충돌 발생 시 해결 후 `git rebase --continue`.

### 7-4. PR 생성 (변경 요약을 본문에 작성)

```bash
git push origin sync-api-spec
gh pr create --base dev --head sync-api-spec --title "설정(api): OpenAPI spec 동기화" --body "<변경 요약>"
```

PR 본문에 다음 형식으로 변경 사항을 작성한다:

```markdown
## sync-api-spec

### 머지된 OpenAPI PR

- #<number> — <title>

### 타입 변경 (src/lib/types/api.ts)

- 추가: FooRequest, BarResponse
- 수정: RoomResponse (draftPosition 필드 추가)

### 핸들러 변경 (src/mocks/handlers.ts)

- 추가: PUT /api/v1/rooms/:code/draft-position
- 추가: DELETE /api/v1/rooms/:code/draft-position

### 팩토리 변경 (src/mocks/factories.ts)

- 추가: createRoomSessionResponse()
- 수정: createRoomResponse() (mode, teamCount 기본값 추가)
```

### 7-5. 즉시 머지 (2차 dev 머지)

```bash
gh pr merge <NEW_PR_NUMBER> --merge
```

---

## Step 8: 워크트리 정리

```
/wt done
```

---

## 주의사항

- **yaml이 source of truth**: 타입 불일치 시 yaml 기준으로 프론트엔드를 맞춘다
- **프론트 전용 타입 보존**: yaml에 없는 프론트엔드 전용 타입(`BidRequest`, `PickRequest` 등)은 삭제하지 않는다
- **사용자에게 보고하지 않는다**: 모든 변경 요약은 PR 본문에 작성한다
- **dev rebase 필수**: 1차 머지(OpenAPI PR)로 dev가 변경되므로, 2차 PR 전에 반드시 rebase
- **import 경계 준수**: `types/api.ts`는 `$lib/types/`, mock 파일은 `src/mocks/`
