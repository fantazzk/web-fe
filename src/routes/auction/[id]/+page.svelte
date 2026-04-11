<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Badge, Button, PlayerCard } from '$lib/components';
	import { auctionStore } from '$lib/features/auction/stores/auction-store.svelte';
	import { processBid, processTimerExpiry } from '$lib/features/auction/services/auction-driver';
	import { calcRemaining, createEndTime } from '$lib/utils/countdown';
	import type { AuctionConfig } from '$lib/domain/rule-engine/types';
	import type { CaptainType } from '$lib/features/auction/types';
	import { apiGet } from '$lib/utils/api-client';

	const store = auctionStore;

	let remainingSeconds = $state(0);
	let bidInputValue = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let loading = $state(true);

	function tickTimer(): void {
		if (!store.endTime) return;
		remainingSeconds = calcRemaining(store.endTime);
		if (remainingSeconds <= 0) {
			stopTimer();
			handleTimerExpiry();
		}
	}

	function startTimer(): void {
		const endTime = createEndTime(store.pickBanTime);
		store.setEndTime(endTime);
		remainingSeconds = store.pickBanTime;
		timerInterval = setInterval(tickTimer, 100);
	}

	function stopTimer(): void {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function handleTimerExpiry(): void {
		const next = processTimerExpiry(store.auction);
		store.updateAuction(next);

		if (next.isCompleted) {
			store.setUIPhase('FINISHED');
			store.setEndTime(null);
		} else {
			startTimer();
			bidInputValue = 0;
		}
	}

	function handleStart(): void {
		store.setUIPhase('PLAYING');
		startTimer();
		bidInputValue = 0;
	}

	function handleSelectTeam(teamId: string): void {
		store.selectTeam(teamId);
	}

	function handleAddBid(multiplier: number): void {
		const unit = store.auction.config.minBidUnit;
		bidInputValue = bidInputValue + unit * multiplier;
	}

	function handlePlaceBid(): void {
		if (!store.selectedTeamId) {
			store.setError('감독을 선택해주세요.');
			return;
		}
		if (bidInputValue <= 0) {
			store.setError('입찰 금액을 입력해주세요.');
			return;
		}

		const result = processBid(store.auction, store.selectedTeamId, bidInputValue);
		if (result.error) {
			store.setError(result.error);
			return;
		}

		store.updateAuction(result.auction);
		store.addBidRecord({
			teamId: store.selectedTeamId,
			teamName: store.captains.find((c) => c.id === store.selectedTeamId)?.name ?? '',
			amount: bidInputValue,
			timestamp: Date.now()
		});
		store.setError(null);
		bidInputValue = result.auction.currentBid?.amount ?? 0;
	}

	onMount(async () => {
		try {
			const templateId = $page.params['id'];
			const data = await apiGet<{
				template: {
					teamCount: number;
					budget: number;
					minBidUnit: number;
					pickBanTime: number;
					positionLimit: number;
					players: { name: string; position: string; displayOrder: number }[];
				};
				captains: CaptainType[];
			}>(globalThis.fetch, `/api/v1/solo/auction/${templateId}`);

			const t = data.template;
			const captains = data.captains;
			const teamIds = captains.map((c) => c.id);

			const config: AuctionConfig = {
				teamCount: t.teamCount,
				totalPoints: t.budget,
				minBidUnit: t.minBidUnit ?? 5,
				positionLimit: t.positionLimit ?? 99,
				playerPool: t.players.map((p) => ({ name: p.name, position: p.position })),
				teamIds
			};

			store.init(config, captains, t.pickBanTime ?? 30);
			bidInputValue = 0;
			loading = false;
		} catch (e) {
			console.error('경매 데이터 로드 실패', e);
			loading = false;
		}
	});

	onDestroy(() => {
		stopTimer();
	});

	const timerDisplay = $derived(
		`${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`
	);

	const timerProgress = $derived(store.pickBanTime > 0 ? remainingSeconds / store.pickBanTime : 0);

	const currentPlayerIndex = $derived(
		store.auction
			? store.auction.config.playerPool.length -
					store.auction.remainingPool.length -
					(store.auction.currentPlayer ? 1 : 0)
			: 0
	);

	const totalPlayers = $derived(store.auction?.config.playerPool.length ?? 0);

	const minBidUnit = $derived(store.auction?.config.minBidUnit ?? 5);
</script>

<svelte:head>
	<title>경매방 | Fantazzk</title>
</svelte:head>

{#if loading}
	<div class="flex h-screen items-center justify-center bg-bg-primary">
		<span class="font-mono text-sm text-muted">로딩 중...</span>
	</div>
{:else}
	<div class="relative flex h-screen flex-col bg-bg-primary">
		<!-- Dim Overlay: READY -->
		{#if store.uiPhase === 'READY'}
			<div class="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
				<div class="flex flex-col items-center gap-6">
					<span class="font-heading text-2xl font-bold text-gray-50">경매를 시작합니다</span>
					<Button variant="PRIMARY" size="MD" onclick={handleStart}>시작</Button>
				</div>
			</div>
		{/if}

		<!-- Dim Overlay: FINISHED -->
		{#if store.uiPhase === 'FINISHED'}
			<div class="absolute inset-0 z-50 flex items-center justify-center bg-black/70">
				<div class="flex flex-col items-center gap-6">
					<span class="font-heading text-2xl font-bold text-gray-50">경매가 종료되었습니다</span>
					<Button variant="PRIMARY" size="MD">결과 보기</Button>
				</div>
			</div>
		{/if}

		<!-- Top Bar -->
		<header class="flex h-[60px] items-center justify-between border-b border-gray-700 px-8">
			<div class="flex items-center gap-4">
				<span class="h-2 w-2 rounded-full bg-accent"></span>
				<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">솔로 경매</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="font-mono text-xs font-semibold tracking-wider text-gray-50">
					라운드 {String(currentPlayerIndex + 1).padStart(2, '0')} / {String(totalPlayers).padStart(
						2,
						'0'
					)}
				</span>
				<span class="font-mono text-xs text-muted">—</span>
				<Badge variant="STATUS">LIVE</Badge>
			</div>
			<span class="font-mono text-xs font-semibold text-gray-50">{timerDisplay}</span>
		</header>

		<!-- Main Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Team Captains (Left) -->
			<aside class="flex w-[260px] flex-col gap-3 overflow-y-auto border-r border-gray-700 p-5">
				<span class="font-mono text-[11px] font-semibold tracking-wider text-accent">팀 캡틴</span>
				{#each store.auction.teams as team, i (team.id)}
					{@const captain = store.captains[i]}
					{@const isSelected = store.selectedTeamId === team.id}
					<button
						type="button"
						class="flex w-full items-center gap-2.5 px-3 py-2.5 text-left {isSelected
							? 'border border-gray-50 bg-bg-primary/[0.08]'
							: 'border border-gray-700'}"
						onclick={() => handleSelectTeam(team.id)}
					>
						<span
							class="font-mono text-xs font-semibold {isSelected ? 'text-accent' : 'text-muted'}"
						>
							{String(i + 1).padStart(2, '0')}
						</span>
						<div class="flex flex-col gap-0.5">
							<span class="max-w-[160px] truncate font-heading text-sm font-semibold text-gray-50">
								{captain?.name ?? `감독 ${i + 1}`}
							</span>
							<span
								class="font-mono text-[10px] font-semibold tracking-wider {isSelected
									? 'text-accent'
									: 'text-muted'}"
							>
								{team.remainingPoints.toLocaleString()} 포인트
							</span>
						</div>
					</button>
				{/each}
			</aside>

			<!-- Center Stage -->
			<main class="flex flex-1 flex-col gap-3 overflow-y-auto px-8 py-6">
				<span class="font-mono text-[11px] font-semibold tracking-[2px] text-accent"
					>경매 진행 중</span
				>

				<!-- Player Card -->
				{#if store.auction.currentPlayer}
					{@const player = store.auction.currentPlayer}
					<div class="flex items-center gap-4 border border-gray-50 p-6">
						<div class="h-20 w-20 border-2 border-accent bg-gray-700"></div>
						<div class="flex flex-col gap-1">
							<span class="font-heading text-2xl font-bold text-gray-50">{player.name}</span>
							<span class="font-mono text-xs text-muted">{player.position}</span>
						</div>
						{#if player.tier}
							<div class="ml-auto">
								<span class="font-heading text-lg font-bold text-gray-50">{player.tier}</span>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Timer -->
				<div class="flex flex-col items-center gap-1.5">
					<span class="font-mono text-[10px] font-semibold tracking-[2px] text-muted"
						>남은 시간</span
					>
					<span class="font-heading text-6xl font-bold text-accent">{timerDisplay}</span>
					<div class="h-1 w-full bg-gray-700">
						<div class="h-full bg-accent" style="width: {timerProgress * 100}%"></div>
					</div>
				</div>

				<!-- Bid Panel -->
				<div class="flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="font-mono text-[11px] font-semibold tracking-wider text-muted"
							>현재 입찰가</span
						>
						<span class="font-heading text-xl font-bold text-accent">
							{store.currentHighBid.toLocaleString()} 포인트
						</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="font-mono text-[11px] font-semibold tracking-wider text-muted"
							>최고 입찰자</span
						>
						<span class="max-w-[200px] truncate font-heading text-sm font-semibold text-gray-50">
							{store.currentHighBidderName ?? '없음'}
						</span>
					</div>

					<div class="flex items-center gap-3">
						<input
							type="number"
							class="h-11 w-32 border border-gray-700 bg-bg-primary px-3 font-mono text-sm text-gray-50 focus:border-accent focus:outline-none"
							bind:value={bidInputValue}
							min={0}
							step={minBidUnit}
						/>
						<Button variant="SECONDARY" size="MD" onclick={() => handleAddBid(1)}
							>+{minBidUnit}</Button
						>
						<Button variant="SECONDARY" size="MD" onclick={() => handleAddBid(2)}
							>+{minBidUnit * 2}</Button
						>
						<Button variant="SECONDARY" size="MD" onclick={() => handleAddBid(5)}
							>+{minBidUnit * 5}</Button
						>
						<Button
							variant="PRIMARY"
							size="MD"
							disabled={store.uiPhase !== 'PLAYING' || !store.selectedTeamId}
							onclick={handlePlaceBid}
						>
							입찰
						</Button>
					</div>

					{#if store.errorMessage}
						<span class="font-mono text-xs text-red-400">{store.errorMessage}</span>
					{/if}
				</div>
			</main>

			<!-- Bid History (Right) -->
			<aside class="flex w-[300px] flex-col gap-3 overflow-y-auto border-l border-gray-700 p-5">
				<span class="font-mono text-[11px] font-semibold tracking-wider text-accent">입찰 기록</span
				>
				{#each store.bidRecords as record, i (record.timestamp)}
					{@const isTop = i === 0}
					<div
						class="flex items-center justify-between px-3 py-2.5 {isTop
							? 'border border-accent'
							: 'border border-gray-700'}"
					>
						<div class="flex flex-col gap-0.5">
							<span
								class="max-w-[160px] truncate font-heading text-[13px] font-semibold text-gray-50"
							>
								{record.teamName}
							</span>
							<span class="font-mono text-[10px] font-semibold tracking-wider text-muted">
								{Math.round((Date.now() - record.timestamp) / 1000)}초 전
							</span>
						</div>
						<span class="font-heading text-base font-bold {isTop ? 'text-accent' : 'text-gray-50'}">
							{record.amount.toLocaleString()} 포인트
						</span>
					</div>
				{/each}
			</aside>
		</div>

		<!-- Bottom: Player Pool -->
		<section class="flex h-[160px] flex-col gap-3 border-t border-gray-700 px-8 py-4">
			<div class="flex items-center justify-between">
				<span class="font-mono text-[11px] font-semibold tracking-wider text-accent"
					>선수풀 — 다음 경매</span
				>
				<span class="font-mono text-[11px] font-semibold tracking-wider text-muted">
					{store.auction.remainingPool.length}명 남음
				</span>
			</div>
			<div class="flex flex-1 gap-3 overflow-x-auto">
				{#each store.auction.remainingPool.slice(0, 5) as player (player.name)}
					<div class="flex-1">
						<PlayerCard position={player.position} name={player.name} team="" />
					</div>
				{/each}
			</div>
		</section>
	</div>
{/if}
