<script lang="ts">
	import type { SandboxPlayerType } from '$lib/domain/sandbox';
	import type { GameType } from '$lib/domain/template';
	import { POSITIONS_BY_GAME } from '$lib/domain/template';
	import PlayerCard from './PlayerCard.svelte';

	interface Props {
		pool: readonly SandboxPlayerType[];
		gameType: GameType;
		positionFilter: string;
		onFilterChange: (position: string) => void;
		onDropToPool: (playerId: string) => void;
	}

	let { pool, gameType, positionFilter, onFilterChange, onDropToPool }: Props = $props();

	let positions = $derived(POSITIONS_BY_GAME[gameType]);
	let hasPositions = $derived(positions.length > 0);
	let filteredPool = $derived(
		positionFilter === 'ALL' ? pool : pool.filter((p) => p.position === positionFilter)
	);

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
		if (playerId) onDropToPool(playerId);
	}
</script>

<div
	class="flex flex-col gap-3 border-t border-gray-700 p-4
		{dragOverCount > 0 ? 'bg-accent/5' : ''}"
	ondragover={handleDragOver}
	ondragenter={handleDragEnter}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="region"
	aria-label="선수풀 — 선수를 여기로 드래그하여 배정 해제"
>
	<!-- Header + Position Filter -->
	<div class="flex items-center gap-4">
		<span class="font-mono text-xs font-semibold tracking-[2px] text-muted">
			선수풀 ({pool.length}명)
		</span>
		{#if hasPositions}
			<div class="flex gap-1">
				<button
					class="px-2.5 py-1 font-mono text-xs transition-colors
						{positionFilter === 'ALL'
						? 'bg-accent font-semibold text-bg-primary'
						: 'text-muted hover:text-gray-50'}"
					onclick={() => onFilterChange('ALL')}
				>
					전체
				</button>
				{#each positions as pos (pos.value)}
					<button
						class="px-2.5 py-1 font-mono text-xs transition-colors
							{positionFilter === pos.value
							? 'bg-accent font-semibold text-bg-primary'
							: 'text-muted hover:text-gray-50'}"
						onclick={() => onFilterChange(pos.value)}
					>
						{pos.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Player Grid -->
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
		{#each filteredPool as player (player.id)}
			<PlayerCard {player} />
		{:else}
			<div class="col-span-full py-8 text-center font-mono text-xs text-dim">
				{positionFilter === 'ALL' ? '모든 선수가 배정되었습니다' : '해당 포지션의 선수가 없습니다'}
			</div>
		{/each}
	</div>
</div>
