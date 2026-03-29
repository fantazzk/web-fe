<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const SITE_NAME = 'FANTAZZK';
	const SITE_URL = 'https://fantazzk-rho.vercel.app';
	const DEFAULT_TITLE = 'FANTAZZK — 치지직 대회 모의 드래프트/경매 시뮬레이터';
	const DEFAULT_DESCRIPTION =
		'자낳대 모의경매, 치지직 드래프트를 직접 체험하세요. 나만의 드림팀을 경매하고 결과를 공유하는 모의 드래프트 시뮬레이터.';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />

	<!-- 기본 메타 -->
	<meta name="description" content={DEFAULT_DESCRIPTION} />

	<!-- Open Graph -->
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="ko_KR" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:title" content={DEFAULT_TITLE} />
	<meta property="og:description" content={DEFAULT_DESCRIPTION} />
	<!-- TODO: og:image — 로고(#17) 완성 후 기본 OG 이미지(1200x630) 추가 -->
	<!-- <meta property="og:image" content="{SITE_URL}/og-default.png" /> -->
	<!-- <meta property="og:image:width" content="1200" /> -->
	<!-- <meta property="og:image:height" content="630" /> -->

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={DEFAULT_TITLE} />
	<meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
	<!-- TODO: twitter:image — og:image와 동일, 로고(#17) 완성 후 추가 -->
</svelte:head>
{@render children()}
