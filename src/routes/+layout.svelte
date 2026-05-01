<script lang="ts">
	import './layout.css';
	import { DEFAULT_DESCRIPTION, SITE_URL } from '$lib/seo/constants.ts';

	let { children } = $props();

	const jsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: 'FANTAZZK',
		url: SITE_URL,
		applicationCategory: 'GameApplication',
		operatingSystem: 'Web',
		description: DEFAULT_DESCRIPTION,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }
	});

	const jsonLdScript = `<script type="application/ld+json">${jsonLd}<` + `/script>`;
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdScript}
</svelte:head>

{@render children()}
