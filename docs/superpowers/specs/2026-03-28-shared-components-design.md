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

기존 `layout.css` `@theme` 블록의 CSS 변수를 Tailwind v4 arbitrary property 문법으로 직접 참조한다. 의미론적 별칭을 추가하지 않는다.

| 용도            | CSS 변수                      | Tailwind 클래스                                   |
| --------------- | ----------------------------- | ------------------------------------------------- |
| 금색 (accent)   | `--color-gold-500`            | `bg-[--color-gold-500]` `text-[--color-gold-500]` |
| 밝은 금색       | `--color-gold-300`            | `text-[--color-gold-300]`                         |
| 배경 (primary)  | `--color-bg-primary`          | `bg-[--color-bg-primary]`                         |
| 배경 (elevated) | `--color-bg-elevated`         | `bg-[--color-bg-elevated]`                        |
| 표면            | `--color-bg-surface`          | `bg-[--color-bg-surface]`                         |
| 보더            | `--color-gray-700`            | `border-[--color-gray-700]`                       |
| 텍스트 (밝음)   | `--color-gray-50`             | `text-[--color-gray-50]`                          |
| 텍스트 (기본)   | `--color-gray-200`            | `text-[--color-gray-200]`                         |
| 텍스트 (muted)  | `--color-gray-300`            | `text-[--color-gray-300]`                         |
| 텍스트 (dim)    | `--color-gray-400`            | `text-[--color-gray-400]`                         |
| 라운드          | `--radius-sm` / `--radius-md` | `rounded-[--radius-sm]`                           |
| 디스플레이 폰트 | `--font-display`              | `font-[--font-display]`                           |
| 헤딩 폰트       | `--font-heading`              | `font-[--font-heading]`                           |
| 본문 폰트       | `--font-body`                 | `font-[--font-body]`                              |
| 모노 폰트       | `--font-mono`                 | `font-[--font-mono]`                              |

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

- 공통: `font-[--font-mono] text-xs font-semibold tracking-wider inline-flex items-center justify-center`
- PRIMARY: `bg-[--color-gold-500] text-[--color-bg-primary]`
- SECONDARY: `border border-[--color-gray-700] text-[--color-gray-50]`
- GHOST: `text-[--color-gray-300]`

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

- STATUS: `bg-[--color-gold-500] text-[--color-bg-primary] py-1 px-3 font-[--font-mono] text-[10px] font-semibold tracking-wider`
- INFO: `text-[--color-gray-300] font-[--font-mono] text-[11px] font-semibold tracking-wider`

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

- 컨테이너: `{size}x{size}px`, `rounded-[--radius-sm]`, flex center
- active: `bg-[--color-bg-primary]/[0.08]`
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
- title: `font-[--font-heading] text-2xl font-semibold tracking-wider text-[--color-gray-50]`
- action: `font-[--font-mono] text-xs font-semibold tracking-wider text-[--color-gold-500]`

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
- selected: `border-[--color-gold-500]`, position `text-[--color-gold-500]`
- default: `border-[--color-gray-700]`, position `text-[--color-gray-300]`
- position: `font-[--font-mono] text-[10px] font-semibold tracking-wider`
- name: `font-[--font-heading] text-sm font-semibold text-[--color-gray-50]`
- team: `font-[--font-mono] text-[10px] text-[--color-gray-300]`

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

- 컨테이너: `flex flex-col gap-3 p-5 border border-[--color-gray-700]`
- 상단: tag(Badge INFO 변형) + 우측 액션
- name: `font-[--font-heading] text-base font-semibold text-[--color-gray-50]`
- stats: `font-[--font-mono] text-[11px] font-semibold tracking-wider text-[--color-gray-300]` gap-4

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

- 컨테이너: `flex items-center justify-between px-4 py-3 border border-[--color-gray-700]`
- 좌측: 유저 아바타(placeholder) + userName + templateName, gap-3
- 우측: `font-[--font-mono] text-[11px] text-[--color-gray-400]`

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
- label: `font-[--font-mono] text-xs font-bold tracking-wider text-[--color-gray-50]`
- 자식(slot): 입력 요소를 slot으로 받음

## import 경계 준수

- `src/lib/components/` 내 컴포넌트는 `features/` import 금지
- 순수 UI 컴포넌트로, 도메인 로직 의존 없음
- svelte import 사용 가능 (domain/ 규칙과 무관)

## 구현 순서

1. Button, Badge (가장 기본, 다른 컴포넌트에서 재사용)
2. IconButton, SectionHeader
3. PlayerCard, TemplateCard, ResultListItem
4. FormField
5. index.ts barrel export
