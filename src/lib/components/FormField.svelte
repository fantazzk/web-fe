<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		children: Snippet;
	}

	let { label, children }: Props = $props();
</script>

<div class="flex flex-col gap-2">
	<span class="font-mono text-xs font-bold tracking-wider text-gray-50">
		{label}
	</span>
	{@render children()}
</div>
