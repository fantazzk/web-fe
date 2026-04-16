<script lang="ts">
	import type { SandboxCaptainType, SandboxPlayerType } from '$lib/domain/sandbox';
	import PlayerCard from './PlayerCard.svelte';

	interface Props {
		captain: SandboxCaptainType;
		players: readonly SandboxPlayerType[];
		onDrop: (playerId: string, captainId: string) => void;
	}

	let { captain, players, onDrop }: Props = $props();
	let dragOverCount = $state(0);

	function handleDragOver(e: DragEvent): void {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
	}

	function handleDragEnter(e: DragEvent): void {
		e.preventDefault();
		dragOverCount++;
	}

	function handleDragLeave(): void {
		dragOverCount--;
	}

	function handleDrop(e: DragEvent): void {
		e.preventDefault();
		dragOverCount = 0;
		const playerId = e.dataTransfer?.getData('application/x-player-id');
		if (playerId) onDrop(playerId, captain.id);
	}
</script>

<div
	class="flex min-w-[200px] flex-col border border-gray-700
		{dragOverCount > 0 ? 'border-accent bg-accent/5' : 'bg-bg-elevated'}"
	ondragover={handleDragOver}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="group"
	aria-label="{captain.name} 감독"
>
	<!-- Header -->
	<div class="flex items-center justify-between border-b border-gray-700 px-4 py-3">
		<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">
			{captain.name.toUpperCase()}
		</span>
		<span class="font-mono text-xs text-muted">{players.length}명</span>
	</div>

	<!-- Player list -->
	<div
		class="flex flex-1 flex-col gap-1 overflow-y-auto p-2"
		role="list"
		aria-label="{captain.name} 로스터"
	>
		{#each players as player (player.id)}
			<PlayerCard {player} />
		{:else}
			<div class="flex flex-1 items-center justify-center p-4" role="listitem">
				<span class="font-mono text-xs text-dim">선수를 드래그하세요</span>
			</div>
		{/each}
	</div>
</div>
