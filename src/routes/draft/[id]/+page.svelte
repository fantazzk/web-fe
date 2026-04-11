<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Badge, Button } from '$lib/components';
	import { draftStore } from '$lib/features/draft/stores/draft-store.svelte';
	import { processPick, processAutoPick } from '$lib/domain/rule-engine/draft-driver';
	import { calcRemaining, createEndTime } from '$lib/utils/countdown';
	import { DRAFT_ERROR_MESSAGES } from '$lib/features/draft/types';
	import type { DraftConfig } from '$lib/domain/rule-engine/draft-types';
	import type { CaptainType } from '$lib/features/draft/types';
	import { apiGet } from '$lib/utils/api-client';
	import { SvelteSet } from 'svelte/reactivity';

	const store = draftStore;
	const positions = ['ALL', 'TOP', 'JGL', 'MID', 'ADC', 'SUP'];

	let remainingSeconds = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let loading = $state(true);
	let expandedTeams = $state<SvelteSet<string>>(new SvelteSet());

	// ─── Timer ───

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

	// ─── Handlers ───

	function handleTimerExpiry(): void {
		const next = processAutoPick(store.draft);
		store.updateDraft(next);

		if (next.isCompleted) {
			store.setUIPhase('FINISHED');
			store.setEndTime(null);
		} else {
			startTimer();
		}
	}

	function handleStart(): void {
		store.setUIPhase('PLAYING');
		startTimer();
	}

	function handlePickPlayer(playerName: string): void {
		if (store.uiPhase !== 'PLAYING') return;

		const teamId = store.draft.currentTeamId;
		if (!teamId) return;

		const result = processPick(store.draft, teamId, playerName);
		if (result.errorCode) {
			store.setError(result.errorCode);
			return;
		}

		store.updateDraft(result.draft);
		store.setError(null);

		if (result.draft.isCompleted) {
			stopTimer();
			store.setUIPhase('FINISHED');
			store.setEndTime(null);
		} else {
			stopTimer();
			startTimer();
		}
	}

	function handlePositionFilter(position: string): void {
		store.setPositionFilter(position);
	}

	function toggleTeamExpand(teamId: string): void {
		if (expandedTeams.has(teamId)) {
			expandedTeams.delete(teamId);
		} else {
			expandedTeams.add(teamId);
		}
	}

	// ─── Lifecycle ───

	onMount(async () => {
		try {
			const templateId = $page.params['id'];
			const data = await apiGet<{
				template: {
					teamCount: number;
					teamSize: number;
					draftOrderStrategy: 'SNAKE' | 'FIXED';
					pickBanTime: number;
					players: { name: string; position: string; displayOrder: number }[];
				};
				captains: CaptainType[];
			}>(globalThis.fetch, `/api/v1/solo/draft/${templateId}`);

			const t = data.template;
			const captains = data.captains;
			const teamIds = captains.map((c) => c.id);
			const rounds = Math.floor(t.players.length / t.teamCount);

			const config: DraftConfig = {
				teamCount: t.teamCount,
				draftType: t.draftOrderStrategy === 'SNAKE' ? 'SNAKE' : 'SEQUENTIAL',
				rounds,
				playerPool: t.players.map((p) => ({ name: p.name, position: p.position })),
				teamIds
			};

			store.init(config, captains, t.pickBanTime ?? 30);
			loading = false;
		} catch (e) {
			console.error('드래프트 데이터 로드 실패', e);
			loading = false;
		}
	});

	onDestroy(() => {
		stopTimer();
	});

	// ─── Derived ───

	const timerDisplay = $derived(
		`${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`
	);

	const timerProgress = $derived(store.pickBanTime > 0 ? remainingSeconds / store.pickBanTime : 0);

	const filteredPool = $derived(
		store.draft
			? store.positionFilter === 'ALL'
				? store.draft.remainingPool
				: store.draft.remainingPool.filter((p) => p.position === store.positionFilter)
			: []
	);

	const errorMessage = $derived(
		store.errorCode ? (DRAFT_ERROR_MESSAGES[store.errorCode] ?? store.errorCode) : null
	);

	/** 선수풀을 5열 그리드 행으로 변환 */
	const playerRows = $derived(() => {
		const rows: (typeof filteredPool)[] = [];
		for (let i = 0; i < filteredPool.length; i += 5) {
			rows.push(filteredPool.slice(i, i + 5));
		}
		return rows;
	});

	/** 드래프트 순서 표시용 */
	const draftOrderDisplay = $derived(
		store.draft
			? store.draft.pickOrder.map((teamId, i) => {
					const teamIndex = store.draft.config.teamIds.indexOf(teamId);
					const captain = store.captains[teamIndex];
					return {
						teamName: captain?.name ?? `팀 ${teamIndex + 1}`,
						pick: `${i + 1}`,
						done: i < store.draft.currentPickIndex,
						current: i === store.draft.currentPickIndex
					};
				})
			: []
	);

	const PREVIEW_COUNT = 3;
</script>

<svelte:head>
	<title>드래프트방 | Fantazzk</title>
</svelte:head>

<a
	href="#main-content"
	class="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:p-2 focus:text-accent"
	>본문으로 바로가기</a
>

{#if loading}
	<div
		role="status"
		aria-live="polite"
		class="flex h-screen items-center justify-center bg-bg-primary"
	>
		<span class="font-mono text-base text-muted">로딩 중...</span>
	</div>
{:else}
	<div class="relative flex h-screen flex-col bg-bg-primary">
		<!-- Dim Overlay: READY -->
		{#if store.uiPhase === 'READY'}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="overlay-ready-title"
				class="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
			>
				<div class="flex flex-col items-center gap-6">
					<h2 id="overlay-ready-title" class="font-heading text-3xl font-bold text-gray-50">
						드래프트를 시작합니다
					</h2>
					<Button variant="PRIMARY" size="MD" onclick={handleStart}>시작</Button>
				</div>
			</div>
		{/if}

		<!-- Dim Overlay: FINISHED -->
		{#if store.uiPhase === 'FINISHED'}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="overlay-finished-title"
				class="absolute inset-0 z-50 flex items-center justify-center bg-black/70"
			>
				<div class="flex flex-col items-center gap-6">
					<h2 id="overlay-finished-title" class="font-heading text-3xl font-bold text-gray-50">
						드래프트가 종료되었습니다
					</h2>
					<Button variant="PRIMARY" size="MD" onclick={() => goto(`/result/${$page.params['id']}`)}>
						결과 보기
					</Button>
				</div>
			</div>
		{/if}

		<!-- Top Bar -->
		<header class="flex h-[60px] items-center justify-between border-b border-gray-700 px-8">
			<div class="flex items-center gap-4">
				<span class="h-2 w-2 rounded-full bg-accent"></span>
				<span class="font-mono text-sm font-semibold tracking-[2px] text-accent">솔로 드래프트</span
				>
			</div>
			<div class="flex items-center gap-3">
				<span class="font-mono text-sm font-semibold tracking-wider text-muted">
					라운드 {store.currentRound}
				</span>
				<span class="font-mono text-sm text-muted">—</span>
				<span class="font-mono text-sm font-semibold tracking-wider text-gray-50">
					픽 {String(store.currentPickNumber).padStart(2, '0')} / {String(
						store.totalPicks
					).padStart(2, '0')}
				</span>
				<Badge variant="STATUS">LIVE</Badge>
			</div>
			<span class="font-mono text-sm font-semibold text-gray-50">{timerDisplay}</span>
		</header>

		<!-- Body -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Left Panel: 팀 로스터 -->
			<aside
				class="flex w-[280px] flex-col gap-4 overflow-y-auto border-r border-gray-700 px-5 py-6"
			>
				<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">팀 로스터</span>

				{#each store.draft.teams as team, i (team.id)}
					{@const captain = store.captains[i]}
					{@const isCurrent = team.id === store.draft.currentTeamId}
					{@const slotsNeeded = store.draft.config.rounds}
					{@const isExpanded = expandedTeams.has(team.id)}
					{@const hasOverflow = team.roster.length > PREVIEW_COUNT}
					{@const visibleRoster = isExpanded ? team.roster : team.roster.slice(0, PREVIEW_COUNT)}
					<div class="flex flex-col gap-1.5 {i > 0 ? 'pt-3' : ''}">
						<!-- 팀 헤더 -->
						<div class="flex items-center justify-between">
							<span
								class="font-heading text-base font-semibold {isCurrent
									? 'text-accent'
									: 'text-gray-50'}"
							>
								{captain?.name ?? `팀 ${i + 1}`}
							</span>
							<div class="flex items-center gap-2">
								<span class="font-mono text-sm text-muted">
									{team.roster.length}/{slotsNeeded}
								</span>
								{#if isCurrent}
									<span class="bg-accent-20 px-2 py-1 font-mono text-xs font-semibold text-accent">
										내 차례
									</span>
								{/if}
							</div>
						</div>

						<!-- 선수 세로 리스트 -->
						{#if team.roster.length > 0}
							<div class="flex flex-col gap-1">
								{#each visibleRoster as player, si (si)}
									<div
										class="flex items-center gap-2 border px-3 py-1.5 {isCurrent
											? 'border-gray-700 bg-accent-20'
											: 'border-gray-700'}"
									>
										<span class="w-10 font-mono text-xs text-muted">{player.position}</span>
										<span class="flex-1 truncate font-heading text-sm font-semibold text-gray-50">
											{player.name}
										</span>
									</div>
								{/each}
								{#if hasOverflow}
									<button
										type="button"
										class="flex items-center justify-center py-1 font-mono text-xs text-muted hover:text-accent"
										onclick={() => toggleTeamExpand(team.id)}
									>
										{#if isExpanded}
											접기
										{:else}
											… 외 {team.roster.length - PREVIEW_COUNT}명 더보기
										{/if}
									</button>
								{/if}
							</div>
						{:else}
							<span class="font-mono text-xs text-dim">선수 없음</span>
						{/if}
					</div>
				{/each}
			</aside>

			<!-- Main Content -->
			<main id="main-content" class="flex flex-1 flex-col overflow-y-auto px-8 py-6">
				<!-- 타이머 (대형) -->
				<div class="flex flex-col items-center gap-2">
					<span class="font-mono text-xs font-semibold tracking-[2px] text-muted">남은 시간</span>
					<span
						aria-live="off"
						aria-label={`남은 시간 ${timerDisplay}`}
						class="font-heading text-6xl font-bold text-accent">{timerDisplay}</span
					>
					<div
						role="progressbar"
						aria-label="드래프트 타이머 진행률"
						aria-valuenow={remainingSeconds}
						aria-valuemin={0}
						aria-valuemax={store.pickBanTime}
						class="h-1 w-full max-w-md bg-gray-700"
					>
						<div class="h-full bg-accent" style="width: {timerProgress * 100}%"></div>
					</div>
				</div>

				<!-- 드래프트 순서 -->
				<div class="mt-5 flex flex-col gap-2">
					<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">
						드래프트 순서
					</span>
					<div class="flex items-center gap-1 overflow-x-auto">
						{#each draftOrderDisplay as d, i (i)}
							<div
								class="flex h-11 w-[96px] shrink-0 items-center justify-center border {d.current
									? 'border-accent'
									: 'border-gray-700'}"
							>
								<div class="flex flex-col items-center">
									<span
										class="font-mono text-sm font-semibold {d.current
											? 'text-accent'
											: d.done
												? 'text-gray-50'
												: 'text-muted'}"
									>
										{d.teamName}
									</span>
									<span class="font-mono text-xs text-muted">{d.pick}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- 현재 턴 배너 -->
				{#if store.draft.currentTeamId}
					<div
						class="mt-4 flex h-14 items-center gap-3 bg-accent px-5 font-mono text-base font-semibold text-bg-primary"
					>
						<span>→</span>
						<span class="tracking-wider">내 픽 — {store.currentCaptainName}</span>
						<span class="ml-auto tracking-wider">선수를 선택하세요</span>
					</div>
				{/if}

				<!-- 에러 메시지 -->
				{#if errorMessage}
					<span role="alert" class="mt-2 font-mono text-sm text-red-400">{errorMessage}</span>
				{/if}

				<!-- 포지션 필터 탭 -->
				<div class="mt-4 flex">
					{#each positions as pos (pos)}
						<button
							type="button"
							class="flex h-11 w-24 items-center justify-center font-mono text-sm font-semibold tracking-wider {store.positionFilter ===
							pos
								? 'bg-accent text-bg-primary'
								: 'border border-gray-700 text-muted'}"
							onclick={() => handlePositionFilter(pos)}
						>
							{pos}
						</button>
					{/each}
				</div>

				<!-- 선수 그리드 -->
				<div class="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
					{#each playerRows() as row, ri (ri)}
						<div class="flex gap-2">
							{#each row as player (player.name)}
								<button
									type="button"
									class="flex h-28 flex-1 flex-col justify-center gap-2 border border-gray-700 px-5 py-4 text-left hover:border-accent"
									onclick={() => handlePickPlayer(player.name)}
									disabled={store.uiPhase !== 'PLAYING'}
								>
									<span class="font-mono text-sm font-semibold tracking-wider text-accent">
										{player.position}
									</span>
									<span class="font-heading text-lg font-semibold text-gray-50">
										{player.name}
									</span>
								</button>
							{/each}
							<!-- 빈 셀로 행 폭 맞추기 -->
							{#each Array(5 - row.length) as _item}
								<div class="flex-1"></div>
							{/each}
						</div>
					{/each}
				</div>
			</main>

			<!-- Right Panel: 픽 히스토리 -->
			<aside
				class="flex w-[280px] flex-col gap-3 overflow-y-auto border-l border-gray-700 px-5 py-6"
			>
				<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">
					픽 히스토리
				</span>
				{#each store.draft.pickHistory as record, i (i)}
					{@const teamIndex = store.draft.config.teamIds.indexOf(record.teamId)}
					{@const captainName = store.captains[teamIndex]?.name ?? `팀 ${teamIndex + 1}`}
					<div class="flex items-center gap-3">
						<span class="font-mono text-sm font-semibold text-dim">
							{String(i + 1).padStart(2, '0')}
						</span>
						<div class="flex flex-col gap-0.5">
							<span class="font-heading text-sm font-semibold text-gray-50">
								{record.player.name}
							</span>
							<span class="font-mono text-xs text-muted">
								{record.player.position} → {captainName}
							</span>
						</div>
					</div>
				{/each}

				<!-- 현재 진행 중 표시 -->
				{#if store.draft.currentTeamId}
					{@const currentTeamIndex = store.draft.config.teamIds.indexOf(store.draft.currentTeamId)}
					{@const currentName = store.captains[currentTeamIndex]?.name ?? ''}
					<div class="flex items-center gap-3">
						<span class="font-mono text-sm font-semibold text-accent">
							{String(store.draft.pickHistory.length + 1).padStart(2, '0')}
						</span>
						<div class="flex flex-col gap-0.5">
							<span class="font-heading text-sm font-semibold text-accent">—</span>
							<span class="font-mono text-xs text-muted">{currentName} 선택 중</span>
						</div>
					</div>
				{/if}
			</aside>
		</div>
	</div>
{/if}
