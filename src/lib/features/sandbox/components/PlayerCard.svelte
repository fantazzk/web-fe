<script lang="ts">
	import type { SandboxPlayerType } from '$lib/domain/sandbox';

	interface Props {
		player: SandboxPlayerType;
		draggable?: boolean;
	}

	let { player, draggable = true }: Props = $props();

	function handleDragStart(e: DragEvent): void {
		if (!e.dataTransfer) return;
		e.dataTransfer.setData('application/x-player-id', player.id);
		e.dataTransfer.effectAllowed = 'move';
	}
</script>

<div
	class="flex items-center gap-3 border border-gray-700 bg-bg-primary px-3 py-2 font-mono text-sm transition-colors
		{draggable ? 'cursor-grab hover:border-accent active:cursor-grabbing' : ''}"
	draggable={draggable ? 'true' : 'false'}
	ondragstart={handleDragStart}
	role="listitem"
>
	<span class="w-8 text-center text-xs font-semibold text-accent">{player.tier}</span>
	<span class="flex-1 text-gray-50">{player.name}</span>
	{#if player.position}
		<span class="text-xs text-muted">{player.position}</span>
	{/if}
</div>
