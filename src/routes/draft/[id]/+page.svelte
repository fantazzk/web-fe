<script lang="ts">
	import { Icon } from '$lib/components';

	const draftOrder = [
		{ team: 'T1', pick: '1st', done: true },
		{ team: 'GEN', pick: '2nd', done: true },
		{ team: 'HLE', pick: '3rd', done: false, current: true },
		{ team: 'DK', pick: '4th', done: false },
		{ team: 'T1', pick: '5th', done: false },
		{ team: 'DK', pick: '6th', done: false },
		{ team: 'HLE', pick: '7th', done: false }
	];

	const positions = ['ALL', 'TOP', 'JG', 'MID', 'ADC', 'SUP'];

	const players = [
		[
			{ pos: 'TOP', name: 'Zeus', team: 'T1' },
			{ pos: 'JGL', name: 'Oner', team: 'T1' },
			{ pos: 'MID', name: 'Faker', team: 'T1', selected: true },
			{ pos: 'ADC', name: 'Gumayusi', team: 'T1' },
			{ pos: 'SUP', name: 'Keria', team: 'T1' }
		],
		[
			{ pos: 'TOP', name: 'Kiin', team: 'DK' },
			{ pos: 'JGL', name: 'Canyon', team: 'DK' },
			{ pos: 'MID', name: 'Chovy', team: 'GEN' },
			{ pos: 'ADC', name: 'Peyz', team: 'GEN' },
			{ pos: 'SUP', name: 'Lehends', team: 'GEN' }
		],
		[
			{ pos: 'TOP', name: 'Doran', team: 'HLE' },
			{ pos: 'JGL', name: 'Peanut', team: 'HLE' },
			{ pos: 'MID', name: 'Zeka', team: 'HLE' },
			{ pos: 'ADC', name: 'Viper', team: 'HLE' },
			{ pos: 'SUP', name: 'Delight', team: 'HLE' }
		],
		[
			{ pos: 'MID', name: 'BdDu', team: 'KT' },
			{ pos: 'JGL', name: 'Lucid', team: 'KT' },
			{ pos: 'MID', name: 'ShowMaker', team: 'DK' },
			{ pos: 'SUP', name: 'Aiming', team: 'KT' },
			{ pos: 'SUP', name: 'BeryL', team: 'DK' }
		]
	];

	interface Slot {
		filled: boolean;
		name?: string;
		pos?: string;
		current?: boolean;
	}

	interface Team {
		name: string;
		count: string;
		current: boolean;
		badge?: string;
		slots: Slot[];
	}

	const teams: Team[] = [
		{
			name: 'T1',
			count: '1/5',
			current: false,
			slots: [
				{ filled: true, name: 'Zeus', pos: 'TOP' },
				{ filled: false },
				{ filled: false },
				{ filled: false },
				{ filled: false }
			]
		},
		{
			name: 'GEN',
			count: '1/5',
			current: false,
			slots: [
				{ filled: true, name: 'Chovy', pos: 'MID' },
				{ filled: false },
				{ filled: false },
				{ filled: false },
				{ filled: false }
			]
		},
		{
			name: 'HLE',
			count: '0/5',
			current: true,
			badge: '내 차례',
			slots: [
				{ filled: false, current: true },
				{ filled: false },
				{ filled: false },
				{ filled: false },
				{ filled: false }
			]
		},
		{
			name: 'DK',
			count: '0/5',
			current: false,
			slots: [
				{ filled: false },
				{ filled: false },
				{ filled: false },
				{ filled: false },
				{ filled: false }
			]
		}
	];

	const pickHistory = [
		{ num: '01', name: 'Zeus', team: 'T1 → T1', done: true },
		{ num: '02', name: 'Chovy', team: 'GEN → GEN', done: true },
		{ num: '03', name: '—', team: 'HLE 선택 중', done: false, current: true },
		{ num: '04', name: '—', team: 'DK 대기', done: false }
	];
</script>

<svelte:head>
	<title>드래프트방 | Fantazzk</title>
</svelte:head>

<div class="flex h-screen flex-col bg-bg-primary">
	<!-- Top Bar -->
	<header class="flex h-16 items-center justify-between border-b border-gray-700 px-8">
		<span class="font-heading text-xl font-bold tracking-wider text-accent">
			LCK 2026 모의 드래프트
		</span>
		<div class="flex items-center gap-6">
			<span class="font-mono text-xs font-semibold tracking-wider text-muted">라운드 1</span>
			<span class="font-mono text-xs font-semibold tracking-wider text-gray-50"> 픽 3 / 10 </span>
		</div>
		<div class="flex items-center gap-2">
			<Icon name="settings" size={16} color="#C9A962" />
			<span class="font-heading text-2xl font-bold text-accent">00:27</span>
		</div>
	</header>

	<!-- Body -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Main Content -->
		<main class="flex flex-1 flex-col overflow-y-auto px-8 py-6">
			<!-- 드래프트 순서 -->
			<div class="flex flex-col gap-2">
				<span class="font-mono text-xs font-semibold tracking-wider text-muted">
					드래프트 순서
				</span>
				<div class="flex items-center gap-1">
					{#each draftOrder as d, i (i)}
						{#if i === 5}
							<span class="px-1 text-muted">
								<Icon name="settings" size={16} color="#777777" />
							</span>
						{/if}
						<div
							class="flex h-10 w-[88px] items-center justify-center border {d.current
								? 'border-accent'
								: 'border-gray-700'}"
						>
							<div class="flex flex-col items-center">
								<span
									class="font-mono text-xs font-semibold {d.current
										? 'text-accent'
										: d.done
											? 'text-gray-50'
											: 'text-muted'}"
								>
									{d.team}
								</span>
								<span class="font-mono text-xs text-muted">{d.pick}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- 현재 턴 배너 -->
			<div
				class="mt-4 flex h-14 items-center gap-3 bg-accent px-5 font-mono text-sm font-semibold text-bg-primary"
			>
				<span>→</span>
				<span class="tracking-wider">내 픽 — 한화생명 이스포츠</span>
				<span class="ml-auto tracking-wider">선수를 선택하세요</span>
			</div>

			<!-- 포지션 필터 탭 -->
			<div class="mt-4 flex">
				{#each positions as pos, i (i)}
					<button
						class="flex h-10 w-20 items-center justify-center font-mono text-sm font-semibold tracking-wider {i ===
						0
							? 'bg-accent text-bg-primary'
							: 'border border-gray-700 text-muted'}"
					>
						{pos}
					</button>
				{/each}
			</div>

			<!-- 선수 그리드 -->
			<div class="mt-4 flex flex-1 flex-col gap-2 overflow-y-auto">
				{#each players as row, ri (ri)}
					<div class="flex gap-2">
						{#each row as p, ci (ci)}
							<div
								class="flex h-28 flex-1 flex-col justify-center gap-2 border px-5 py-4 {p.selected
									? 'border-accent'
									: 'border-gray-700'}"
							>
								<span class="font-mono text-sm font-semibold tracking-wider text-accent">
									{p.pos}
								</span>
								<span class="font-heading text-lg font-semibold text-gray-50">
									{p.name}
								</span>
								<span class="font-mono text-sm text-muted">{p.team}</span>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		</main>

		<!-- Side Panel: 팀 로스터 -->
		<aside class="flex w-[320px] flex-col gap-4 overflow-y-auto border-l border-gray-700 px-5 py-6">
			<span class="font-mono text-sm font-semibold tracking-wider text-accent"> 팀 로스터 </span>

			{#each teams as t, i (i)}
				<div class="flex flex-col gap-2 {i > 0 ? 'pt-3' : ''}">
					<div class="flex items-center justify-between">
						<span
							class="font-heading text-base font-semibold {t.current
								? 'text-accent'
								: 'text-gray-50'}"
						>
							{t.name}
						</span>
						<div class="flex items-center gap-2">
							<span class="font-mono text-xs text-muted">{t.count}</span>
							{#if t.badge}
								<span class="bg-accent-20 px-2 py-1 font-mono text-xs font-semibold text-accent">
									{t.badge}
								</span>
							{/if}
						</div>
					</div>
					<div class="flex gap-1">
						{#each t.slots as s, si (si)}
							<div
								class="flex h-9 flex-1 items-center justify-center border {s.current
									? 'border-accent'
									: 'border-gray-700'} {s.filled ? 'bg-accent-20' : ''}"
							>
								{#if s.filled}
									<span class="font-mono text-xs font-semibold text-gray-50">
										{s.name}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}

			<div class="h-px w-full bg-gray-700"></div>

			<!-- 픽 히스토리 -->
			<div class="flex flex-col gap-3">
				<span class="font-mono text-sm font-semibold tracking-wider text-accent">
					픽 히스토리
				</span>
				{#each pickHistory as h, i (i)}
					<div class="flex items-center gap-3">
						<span
							class="font-mono text-xs font-semibold {h.current
								? 'text-accent'
								: h.done
									? 'text-dim'
									: 'text-gray-700'}"
						>
							{h.num}
						</span>
						<div class="flex flex-col gap-0.5">
							<span
								class="font-heading text-sm font-semibold {h.current
									? 'text-accent'
									: h.done
										? 'text-gray-50'
										: 'text-muted'}"
							>
								{h.name}
							</span>
							<span class="font-mono text-xs text-muted">{h.team}</span>
						</div>
					</div>
				{/each}
			</div>
		</aside>
	</div>
</div>
