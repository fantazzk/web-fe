<!--
  페이지: 결과 공유 카드
  설명: 경매/드래프트 완료 후 팀별 로스터와 낙찰가를 보여주는 결과 화면.
        이미지 카드 자동 생성(PNG 다운로드), 결과 페이지 URL 공유,
        OG 태그로 디시/카톡 링크 미리보기 지원. (Feature: Result Share Card)
-->
<svelte:head>
	<title>결과 | FANTAZZK</title>
	<!-- TODO: SSR load 함수에서 결과 데이터를 받아 동적 title/description/OG 태그로 교체 (#14 Phase 2) -->
	<!-- TODO: og:image — /api/og/result/[id] Vercel OG 이미지 엔드포인트 구현 (#14 Phase 3) -->
</svelte:head>

<h1>결과 공유 카드</h1>
