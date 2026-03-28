# 공용 컴포넌트 추출 설계

## 개요

`chzzk-mock-mvp-wireframes.pen` 와이어프레임(6개 화면)에서 반복되는 UI 패턴을 분석하여 8개의 Atomic 레벨 공용 컴포넌트를 `src/lib/components/`에 추출한다.

## 출처

- 홈 대시보드, 경매방, 드래프트방, 결과 공유 카드, 멀티플레이어 로비, 템플릿 생성

## 파일 구조

```
src/lib/components/
├── Button.svelte
├── Badge.svelte
├── IconButton.svelte
├── SectionHeader.svelte
├── PlayerCard.svelte
├── TemplateCard.svelte
├── ResultListItem.svelte
├── FormField.svelte
└── index.ts          # barrel export
```

플랫 구조. 컴포넌트가 20개 이상이 될 때 폴더화 검토.

## 디자인 토큰 전략

Tailwind v4의 `@theme` 블록에서 `--color-*`로 정의한 변수는 자동으로 유틸리티 클래스를 생성한다. arbitrary property 문법(`text-[--color-*]`)을 사용하지 않고 네이티브 유틸리티 클래스를 활용한다.

### 추가할 의미론적 별칭 (`layout.css` @theme)

```css
/* 액센트 (테마별 오버라이드 대상) */
--color-accent: #c9a962;
--color-accent-light: #ffd166;
--color-accent-20: #c9a96220;

/* 텍스트 의미론적 */
--color-muted: var(--color-gray-300);
--color-subtle: var(--color-gray-400);
--color-dim: var(--color-gray-600);
```

### 테마 시스템

`<html data-theme="gold">` 속성으로 테마를 전환한다. `@theme`에 등록된 `--color-accent*` 변수를 `[data-theme]` 셀렉터에서 오버라이드하면, `text-accent`, `bg-accent` 등의 유틸리티가 자동으로 새 색상을 반영한다.

```css
/* layout.css — @theme 아래에 추가 */

[data-theme='pink'] {
	--color-accent: #ec4899;
	--color-accent-light: #f9a8d4;
	--color-accent-20: #ec489920;
}

[data-theme='cyan'] {
	--color-accent: #06b6d4;
	--color-accent-light: #67e8f9;
	--color-accent-20: #06b6d420;
}

[data-theme='magenta'] {
	--color-accent: #d946ef;
	--color-accent-light: #e879f9;
	--color-accent-20: #d946ef20;
}

[data-theme='orange'] {
	--color-accent: #f97316;
	--color-accent-light: #fdba74;
	--color-accent-20: #f9731620;
}
```

| 테마        | accent    | accent-light | accent-20   |
| ----------- | --------- | ------------ | ----------- |
| gold (기본) | `#c9a962` | `#ffd166`    | `#c9a96220` |
| pink        | `#ec4899` | `#f9a8d4`    | `#ec489920` |
| cyan        | `#06b6d4` | `#67e8f9`    | `#06b6d420` |
| magenta     | `#d946ef` | `#e879f9`    | `#d946ef20` |
| orange      | `#f97316` | `#fdba74`    | `#f9731620` |

**전환 방법**: `document.documentElement.dataset.theme = 'pink'`

**컴포넌트 영향 없음**: 모든 컴포넌트가 `text-accent`, `bg-accent`, `border-accent` 등 의미론적 클래스를 사용하므로 테마 전환 시 코드 변경 불필요.

### 토큰 매핑 테이블

| 용도            | CSS 변수 (`@theme`)    | Tailwind 유틸리티 클래스                  |
| --------------- | ---------------------- | ----------------------------------------- |
| 액센트          | `--color-accent`       | `text-accent` `bg-accent` `border-accent` |
| 액센트 (밝은)   | `--color-accent-light` | `text-accent-light`                       |
| 액센트 (20%)    | `--color-accent-20`    | `bg-accent-20`                            |
| muted 텍스트    | `--color-muted`        | `text-muted`                              |
| subtle 텍스트   | `--color-subtle`       | `text-subtle`                             |
| dim 텍스트      | `--color-dim`          | `text-dim`                                |
| 배경 (primary)  | `--color-bg-primary`   | `bg-bg-primary`                           |
| 배경 (elevated) | `--color-bg-elevated`  | `bg-bg-elevated`                          |
| 표면            | `--color-bg-surface`   | `bg-bg-surface`                           |
| 흰색 텍스트     | `--color-gray-50`      | `text-gray-50`                            |
| 기본 텍스트     | `--color-gray-200`     | `text-gray-200`                           |
| 보더            | `--color-gray-700`     | `border-gray-700`                         |
| 라운드          | `--radius-sm/md/lg`    | `rounded-sm` `rounded-md` `rounded-lg`    |
| 디스플레이 폰트 | `--font-display`       | `font-display`                            |
| 헤딩 폰트       | `--font-heading`       | `font-heading`                            |
| 본문 폰트       | `--font-body`          | `font-body`                               |
| 모노 폰트       | `--font-mono`          | `font-mono`                               |

## 컴포넌트 상세

### 1. Button

용도: 전체 화면의 CTA, 액션 버튼

```svelte
<Button variant="PRIMARY" size="MD" href="/start">QUICK START</Button>
<Button variant="SECONDARY">CANCEL</Button>
```

| Prop       | 타입                                  | 기본값      | 설명                            |
| ---------- | ------------------------------------- | ----------- | ------------------------------- |
| `variant`  | `'PRIMARY' \| 'SECONDARY' \| 'GHOST'` | `'PRIMARY'` | 스타일 변형                     |
| `size`     | `'SM' \| 'MD'`                        | `'MD'`      | SM: h-9 px-4, MD: h-11 px-6     |
| `disabled` | `boolean`                             | `false`     |                                 |
| `href`     | `string \| undefined`                 | `undefined` | 있으면 `<a>`, 없으면 `<button>` |

**스타일 규칙:**

- 공통: `font-mono text-xs font-semibold tracking-wider inline-flex items-center justify-center`
- PRIMARY: `bg-accent text-bg-primary`
- SECONDARY: `border border-gray-700 text-gray-50`
- GHOST: `text-muted`

### 2. Badge

용도: 경매방 LIVE 상태, 홈 대시보드 태그

```svelte
<Badge variant="STATUS">LIVE</Badge>
<Badge variant="INFO">LOL</Badge>
```

| Prop      | 타입                 | 기본값   |
| --------- | -------------------- | -------- |
| `variant` | `'STATUS' \| 'INFO'` | `'INFO'` |

**스타일 규칙:**

- STATUS: `bg-accent text-bg-primary py-1 px-3 font-mono text-[10px] font-semibold tracking-wider`
- INFO: `text-muted font-mono text-[11px] font-semibold tracking-wider`

### 3. IconButton

용도: Sidebar 네비게이션 아이콘, 설정 버튼

```svelte
<IconButton icon="home" active />
<IconButton icon="settings" />
```

| Prop       | 타입      | 기본값                       |
| ---------- | --------- | ---------------------------- |
| `icon`     | `string`  | — (lucide 아이콘 이름, 필수) |
| `active`   | `boolean` | `false`                      |
| `size`     | `number`  | `48`                         |
| `iconSize` | `number`  | `20`                         |

**스타일 규칙:**

- 컨테이너: `{size}x{size}px`, `rounded-sm`, flex center
- active: `bg-bg-primary/8`
- inactive: transparent
- 아이콘: `{iconSize}x{iconSize}px`, 색상은 CSS `currentColor` 상속

> 참고: lucide 아이콘은 `lucide-svelte` 패키지 또는 SVG sprite 방식으로 구현. 패키지 선택은 구현 단계에서 결정.

### 4. SectionHeader

용도: 홈 대시보드 "POPULAR TEMPLATES", "RECENT COMMUNITY RESULTS"

```svelte
<SectionHeader title="POPULAR TEMPLATES" actionText="VIEW ALL →" actionHref="/templates" />
```

| Prop         | 타입                  |
| ------------ | --------------------- |
| `title`      | `string` (필수)       |
| `actionText` | `string \| undefined` |
| `actionHref` | `string \| undefined` |

**스타일 규칙:**

- 컨테이너: `flex justify-between items-center w-full`
- title: `font-heading text-2xl font-semibold tracking-wider text-gray-50`
- action: `font-mono text-xs font-semibold tracking-wider text-accent`

### 5. PlayerCard

용도: 경매방 Player Pool, 드래프트방 선수 목록

```svelte
<PlayerCard position="TOP" name="KIIN" team="DK" selected />
```

| Prop       | 타입      | 기본값   |
| ---------- | --------- | -------- |
| `position` | `string`  | — (필수) |
| `name`     | `string`  | — (필수) |
| `team`     | `string`  | — (필수) |
| `selected` | `boolean` | `false`  |

**스타일 규칙:**

- 컨테이너: `flex flex-col items-center justify-center gap-1.5 p-3 border`
- selected: `border-accent`, position `text-accent`
- default: `border-gray-700`, position `text-muted`
- position: `font-mono text-[10px] font-semibold tracking-wider`
- name: `font-heading text-sm font-semibold text-gray-50`
- team: `font-mono text-[10px] text-muted`

### 6. TemplateCard

용도: 홈 대시보드 Popular Templates 그리드

```svelte
<TemplateCard
	tag="AUCTION"
	name="스트리머 랭킹전 시즌 2"
	stats={[{ label: 'LOL' }, { label: '8팀' }, { label: '1.2K' }]}
/>
```

| Prop    | 타입                              |
| ------- | --------------------------------- |
| `tag`   | `string` (필수)                   |
| `name`  | `string` (필수)                   |
| `stats` | `Array<{ label: string }>` (필수) |

**스타일 규칙:**

- 컨테이너: `flex flex-col gap-3 p-5 border border-gray-700`
- 상단: tag(Badge INFO 변형) + 우측 액션
- name: `font-heading text-base font-semibold text-gray-50`
- stats: `font-mono text-[11px] font-semibold tracking-wider text-muted` gap-4

### 7. ResultListItem

용도: 홈 대시보드 Recent Community Results

```svelte
<ResultListItem userName="닉네임" templateName="LCK 모의 경매" time="2분 전" />
```

| Prop           | 타입            |
| -------------- | --------------- |
| `userName`     | `string` (필수) |
| `templateName` | `string` (필수) |
| `time`         | `string` (필수) |

**스타일 규칙:**

- 컨테이너: `flex items-center justify-between px-4 py-3 border border-gray-700`
- 좌측: 유저 아바타(placeholder) + userName + templateName, gap-3
- 우측: `font-mono text-[11px] text-subtle`

### 8. FormField

용도: 템플릿 생성 화면 입력 필드

```svelte
<FormField label="대회 이름">
	<input type="text" class="..." />
</FormField>
```

| Prop    | 타입            |
| ------- | --------------- |
| `label` | `string` (필수) |

**스타일 규칙:**

- 컨테이너: `flex flex-col gap-2`
- label: `font-mono text-xs font-bold tracking-wider text-gray-50`
- 자식(slot): 입력 요소를 slot으로 받음

## import 경계 준수

- `src/lib/components/` 내 컴포넌트는 `features/` import 금지
- 순수 UI 컴포넌트로, 도메인 로직 의존 없음
- svelte import 사용 가능 (domain/ 규칙과 무관)

## 구현 순서

0. layout.css @theme에 의미론적 별칭 추가 (accent/accent-light/accent-20, muted, subtle, dim) + 테마 셀렉터 (pink, cyan, magenta, orange)
1. Button, Badge (가장 기본, 다른 컴포넌트에서 재사용)
2. IconButton, SectionHeader
3. PlayerCard, TemplateCard, ResultListItem
4. FormField
5. index.ts barrel export
