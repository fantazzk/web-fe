<script lang="ts">
	interface Props {
		position: string;
		name: string;
		team: string;
		selected?: boolean;
	}

	let { position, name, team, selected = false }: Props = $props();
</script>

<div
	class="flex flex-col items-center justify-center gap-1.5 border p-3 {selected
		? 'border-accent'
		: 'border-gray-700'}"
>
	<span
		class="font-mono text-[10px] font-semibold tracking-wider {selected
			? 'text-accent'
			: 'text-muted'}"
	>
		{position}
	</span>
	<span class="font-heading text-sm font-semibold text-gray-50">
		{name}
	</span>
	<span class="font-mono text-[10px] text-muted">
		{team}
	</span>
</div>
