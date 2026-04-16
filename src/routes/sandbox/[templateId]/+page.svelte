<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components';
	import { SandboxBoard } from '$lib/domain/sandbox';
	import * as cache from '$lib/utils/cache';
	import { sandboxStore } from '$lib/features/sandbox/stores/sandbox-store.svelte';
	import type { TemplateSnapshotType, ResultSnapshotType } from '$lib/types/snapshot';
	import type { GameType } from '$lib/domain/template';
	import CaptainRoster from '$lib/features/sandbox/components/CaptainRoster.svelte';
	import PlayerPool from '$lib/features/sandbox/components/PlayerPool.svelte';

	const templateId = $page.params.templateId;

	let templateName = $state('');
	let gameType = $state<GameType>('LEAGUE_OF_LEGENDS');
	let loaded = $state(false);
	let error = $state(false);

	onMount(() => {
		const entry = cache.get<TemplateSnapshotType>(`template:${templateId}`);
		if (!entry) {
			error = true;
			return;
		}
		templateName = entry.data.name;
		gameType = entry.data.gameType;
		const board = SandboxBoard.create({
			templateId,
			captainsCount: entry.data.captainsCount,
			players: entry.data.players
		});
		sandboxStore.init(board);
		loaded = true;
	});

	function handleDropToRoster(playerId: string, captainId: string): void {
		if (!sandboxStore.board) return;
		try {
			const next = sandboxStore.board.assign(playerId, captainId);
			sandboxStore.apply(next);
		} catch (e) {
			if (!(e instanceof Error) || !('code' in e) || e.code !== 'PLAYER_NOT_IN_POOL') return;
			try {
				const next = sandboxStore.board.move(playerId, captainId);
				sandboxStore.apply(next);
			} catch {
				// 이동 불가 — 무시
			}
		}
	}

	function handleDropToPool(playerId: string): void {
		if (!sandboxStore.board) return;
		try {
			const next = sandboxStore.board.unassign(playerId);
			sandboxStore.apply(next);
		} catch {
			// pool에 이미 있는 선수 — 무시
		}
	}

	function handleComplete(): void {
		if (!sandboxStore.board) return;
		const snapshot: ResultSnapshotType = {
			mode: 'SANDBOX',
			teams: sandboxStore.board.toResult()
		};
		cache.set(`result:${templateId}`, snapshot, 30 * 60 * 1000);
		cache.remove(`template:${templateId}`);
		goto(`/result/${templateId}`);
	}
</script>

<svelte:head>
	<title>{templateName || 'Sandbox'} — Fantazzk</title>
</svelte:head>

{#if error}
	<main class="flex h-screen flex-col items-center justify-center gap-4 bg-bg-primary" role="alert">
		<p class="font-mono text-sm text-muted">템플릿 정보를 찾을 수 없습니다</p>
		<Button variant="PRIMARY" size="MD" onclick={() => goto('/')}>홈으로 돌아가기</Button>
	</main>
{:else if loaded && sandboxStore.board}
	<div class="flex h-screen flex-col bg-bg-primary">
		<!-- Top Bar -->
		<header class="flex items-center justify-between border-b border-gray-700 px-6 py-4">
			<span class="font-heading text-xl font-bold text-gray-50">{templateName}</span>
			<Button variant="PRIMARY" size="MD" onclick={handleComplete}>완성하기</Button>
		</header>

		<!-- Captain Rosters (top) -->
		<section
			class="flex gap-3 overflow-x-auto border-b border-gray-700 p-4"
			aria-labelledby="captain-roster-heading"
			style="max-height: 45vh;"
		>
			<h2 id="captain-roster-heading" class="sr-only">감독 로스터</h2>
			{#each sandboxStore.board.captains as captain (captain.id)}
				<CaptainRoster
					{captain}
					players={sandboxStore.board.rosters[captain.id] ?? []}
					onDrop={handleDropToRoster}
				/>
			{/each}
		</section>

		<!-- Player Pool (bottom) -->
		<section class="flex-1 overflow-y-auto" aria-label="선수풀">
			<PlayerPool
				pool={sandboxStore.board.pool}
				{gameType}
				positionFilter={sandboxStore.positionFilter}
				onFilterChange={(pos) => sandboxStore.setPositionFilter(pos)}
				onDropToPool={handleDropToPool}
			/>
		</section>
	</div>
{:else}
	<div
		class="flex h-screen items-center justify-center bg-bg-primary"
		role="status"
		aria-live="polite"
	>
		<span class="font-mono text-sm text-muted">로딩 중...</span>
	</div>
{/if}
