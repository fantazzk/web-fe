<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'STATUS' | 'INFO';

	interface Props {
		variant?: Variant;
		children: Snippet;
	}

	let { variant = 'INFO', children }: Props = $props();

	const variants: Record<Variant, string> = {
		STATUS:
			'bg-accent text-bg-primary py-1 px-3 font-mono text-[10px] font-semibold tracking-wider',
		INFO: 'text-muted font-mono text-[11px] font-semibold tracking-wider'
	};
</script>

<span class={variants[variant]}>
	{@render children()}
</span>
