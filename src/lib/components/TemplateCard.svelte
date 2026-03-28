<script lang="ts">
	import Badge from './Badge.svelte';

	interface Props {
		tag: string;
		name: string;
		stats: Array<{ label: string }>;
	}

	let { tag, name, stats }: Props = $props();
</script>

<div class="flex flex-col gap-3 border border-gray-700 p-5">
	<div class="flex w-full items-center justify-between">
		<Badge variant="INFO">{tag}</Badge>
	</div>
	<span class="font-heading text-base font-semibold text-gray-50">
		{name}
	</span>
	<div class="flex gap-4">
		{#each stats as stat, i (i)}
			<span class="font-mono text-[11px] font-semibold tracking-wider text-muted">
				{stat.label}
			</span>
		{/each}
	</div>
</div>
