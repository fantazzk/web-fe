<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		logo: string;
		nav: Snippet;
		footer?: Snippet;
	}

	let { logo, nav, footer }: Props = $props();
</script>

<aside class="flex h-full w-20 flex-col items-center justify-between bg-accent py-8">
	<div class="flex flex-col items-center gap-8">
		<span class="font-display text-[28px] font-bold text-bg-primary">{logo}</span>
		<nav class="flex flex-col gap-6" aria-label="메인 네비게이션">
			{@render nav()}
		</nav>
	</div>
	{#if footer}
		<div class="flex flex-col items-center">
			{@render footer()}
		</div>
	{/if}
</aside>
