<script lang="ts">
	interface Props {
		tag: string;
		name: string;
		number?: string;
		stats: Array<{ label: string }>;
	}

	let { tag, name, number, stats }: Props = $props();
</script>

<div class="flex flex-col gap-3 border border-gray-700 p-5">
	<div class="flex w-full items-center justify-between">
		<span
			class="border border-accent px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-accent"
		>
			{tag}
		</span>
		{#if number}
			<span class="font-mono text-base font-semibold text-dim">{number}</span>
		{/if}
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
