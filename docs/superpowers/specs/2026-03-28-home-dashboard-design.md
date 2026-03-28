# 홈 대시보드 UI 설계

## 개요

와이어프레임(홈 대시보드 프레임)을 기반으로 `src/routes/+page.svelte`에 메인 랜딩 페이지를 구현한다.

## 페이지 레이아웃

```
┌──────┬──────────────────────────────────────┐
│      │  Hero Section                        │
│  S   │  ┌─────────────────────┬───────────┐ │
│  i   │  │ label / title / desc│  image    │ │
│  d   │  │ stats / CTA button  │           │ │
│  e   │  └─────────────────────┴───────────┘ │
│  b   │                                      │
│  a   │  POPULAR TEMPLATES      VIEW ALL →   │
│  r   │  ┌──────┐ ┌──────┐ ┌──────┐        │
│      │  │ Card │ │ Card │ │ Card │        │
│      │  └──────┘ └──────┘ └──────┘        │
│      │                                      │
│      │  RECENT COMMUNITY RESULTS    🔴 LIVE │
│      │  ┌──────────────────────────────┐   │
│      │  │ ResultListItem × 3           │   │
│      │  └──────────────────────────────┘   │
└──────┴──────────────────────────────────────┘
```

전체: `flex h-screen`, Sidebar 고정폭(80px) + Main 영역 `flex-1 overflow-y-auto`

## 새 컴포넌트: Sidebar

위치: `src/lib/components/Sidebar.svelte`

```svelte
<Sidebar logo="CD">
	{#snippet nav()}
		<IconButton icon="home" active />
		<IconButton icon="layout-grid" />
		<IconButton icon="history" />
		<IconButton icon="user" />
	{/snippet}
	{#snippet footer()}
		<IconButton icon="settings" />
	{/snippet}
</Sidebar>
```

### Props

| Prop     | 타입       | 기본값      | 설명                           |
| -------- | ---------- | ----------- | ------------------------------ |
| `logo`   | `string`   | — (필수)    | 로고 텍스트 (Playfair Display) |
| `nav`    | `Snippet`  | — (필수)    | 네비게이션 영역                |
| `footer` | `Snippet?` | `undefined` | 하단 영역                      |

### 스타일

- 컨테이너: `w-20 bg-accent h-full flex flex-col items-center justify-between py-8`
- 상단: logo + nav, `flex flex-col items-center gap-8`
- nav 내부: `flex flex-col gap-6`
- logo: `font-display text-[28px] font-bold text-bg-primary`

## Hero Section

`+page.svelte`에 인라인. 별도 컴포넌트 미추출 (홈 전용).

- 컨테이너: `flex items-center gap-10 p-8 border border-gray-50 h-[260px]`
- 좌측 (`flex-1`): vertical, gap-4
  - label: `text-accent font-mono text-xs font-semibold tracking-[2px]`
  - title: `font-heading text-4xl font-bold text-gray-50`
  - desc: `text-muted font-mono text-[13px] leading-relaxed`
  - stats: `flex gap-6`, `text-muted font-mono text-[11px] font-semibold tracking-wider`
  - CTA: `<Button variant="PRIMARY" size="MD">QUICK START</Button>`
- 우측: `w-[280px] h-full bg-gray-800` (이미지 placeholder)

## Popular Templates 섹션

- `<SectionHeader title="POPULAR TEMPLATES" actionText="VIEW ALL →" actionHref="/templates" />`
- 그리드: `flex gap-6`, TemplateCard × 3 (`flex-1`)

## Recent Community Results 섹션

- 헤더: `<SectionHeader>` + `<Badge variant="STATUS">LIVE</Badge>`
  - SectionHeader는 actionText 대신 Badge를 보여야 하므로, 이 섹션만 헤더를 인라인으로 작성
- 리스트: `flex flex-col gap-2`, ResultListItem × 3

## 목업 데이터

`+page.svelte` 상단에 상수로 정의. 백엔드 연동 시 `+page.ts` load 함수로 교체.

```ts
const templates = [
  { tag: 'AUCTION', name: '스트리머 랭킹전 시즌 2', stats: [...] },
  { tag: 'DRAFT', name: '발로란트 프로 경매전', stats: [...] },
  { tag: 'DRAFT', name: '배그 스쿼드 드래프트', stats: [...] },
];

const results = [
  { userName: '닉네임1', templateName: 'LCK 모의 경매', time: '2분 전' },
  ...
];
```

## 사용하는 공용 컴포넌트

| 컴포넌트         | 용도                   |
| ---------------- | ---------------------- |
| `Sidebar` (신규) | 좌측 네비게이션        |
| `IconButton`     | Sidebar 네비 아이콘    |
| `Button`         | Hero CTA               |
| `Badge`          | LIVE 상태, 템플릿 태그 |
| `SectionHeader`  | 섹션 타이틀            |
| `TemplateCard`   | 인기 템플릿 카드       |
| `ResultListItem` | 최근 결과 항목         |

## 구현 순서

1. Sidebar 컴포넌트 생성 + index.ts에 export 추가
2. +page.svelte 전체 레이아웃 (Sidebar + Main)
3. Hero Section
4. Popular Templates 섹션
5. Recent Results 섹션
