<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props {
		icon: string;
		active?: boolean;
		size?: number;
		iconSize?: number;
	}

	let {
		icon,
		active = false,
		size = 48,
		iconSize = 20,
		...rest
	}: Props & Omit<HTMLButtonAttributes, keyof Props> = $props();
</script>

<button
	class="inline-flex items-center justify-center rounded-sm {active ? 'bg-bg-primary/8' : ''}"
	style:width="{size}px"
	style:height="{size}px"
	{...rest}
>
	<svg
		width={iconSize}
		height={iconSize}
		stroke="currentColor"
		fill="none"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<use href="/icons/lucide-sprite.svg#{icon}" />
	</svg>
</button>
