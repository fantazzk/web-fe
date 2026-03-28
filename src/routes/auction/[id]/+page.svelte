<script lang="ts">
	import { Badge, Button, PlayerCard } from '$lib/components';

	const captains = [
		{ num: '01', name: '갓겜장인_불꽃드래곤', pts: '1,240 포인트', active: true },
		{ num: '02', name: '미드차이ㅋㅋ', pts: '980 포인트', active: false },
		{ num: '03', name: '탑신병자_쵸비팬', pts: '1,100 포인트', active: false },
		{ num: '04', name: '서폿장인킹왕짱', pts: '890 포인트', active: false },
		{ num: '05', name: '정글러는나야둘이될수없어', pts: '760 포인트', active: false },
		{ num: '06', name: '원딜장인', pts: '1,050 포인트', active: false }
	];

	const bids = [
		{ name: '갓겜장인_불꽃드래곤', time: '12초 전', amount: '320 포인트', top: true },
		{ name: '미드차이ㅋㅋ', time: '24초 전', amount: '280 포인트', top: false },
		{ name: '탑신병자_쵸비팬', time: '31초 전', amount: '250 포인트', top: false },
		{ name: '원딜장인', time: '38초 전', amount: '200 포인트', top: false },
		{ name: '정글러는나야둘이될수없어', time: '45초 전', amount: '180 포인트', top: false },
		{ name: '서폿장인킹왕짱', time: '52초 전', amount: '150 포인트', top: false },
		{ name: '갓겜장인_불꽃드래곤', time: '1분 전', amount: '120 포인트', top: false }
	];

	const pool = [
		{ position: 'TOP', name: 'KIIN', team: 'DK', selected: true },
		{ position: 'JGL', name: 'ONER', team: 'T1', selected: false },
		{ position: 'ADC', name: 'GUMAYUSI', team: 'T1', selected: false },
		{ position: 'SUP', name: 'LEHENDS', team: 'GEN', selected: false },
		{ position: 'MID', name: 'BDD', team: 'KT', selected: false }
	];
</script>

<svelte:head>
	<title>경매방 | Fantazzk</title>
</svelte:head>

<div class="flex h-screen flex-col bg-bg-primary">
	<!-- Top Bar -->
	<header class="flex h-[60px] items-center justify-between border-b border-gray-700 px-8">
		<div class="flex items-center gap-4">
			<span class="h-2 w-2 rounded-full bg-accent"></span>
			<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">
				치지직 토너먼트 — 시즌 3
			</span>
		</div>
		<div class="flex items-center gap-3">
			<span class="font-mono text-xs font-semibold tracking-wider text-gray-50">
				라운드 03 / 12
			</span>
			<span class="font-mono text-xs text-muted">—</span>
			<Badge variant="STATUS">LIVE</Badge>
		</div>
		<span class="font-mono text-xs font-semibold text-gray-50">02:47</span>
	</header>

	<!-- Main Area -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Team Captains (Left) -->
		<aside class="flex w-[260px] flex-col gap-3 overflow-y-auto border-r border-gray-700 p-5">
			<span class="font-mono text-[11px] font-semibold tracking-wider text-accent"> 팀 캡틴 </span>
			{#each captains as c, i (i)}
				<div
					class="flex items-center gap-2.5 px-3 py-2.5 {c.active
						? 'border border-gray-50 bg-bg-primary/[0.08]'
						: 'border border-gray-700'}"
				>
					<span class="font-mono text-xs font-semibold {c.active ? 'text-accent' : 'text-muted'}">
						{c.num}
					</span>
					<div class="flex flex-col gap-0.5">
						<span class="max-w-[160px] truncate font-heading text-sm font-semibold text-gray-50">
							{c.name}
						</span>
						<span
							class="font-mono text-[10px] font-semibold tracking-wider {c.active
								? 'text-accent'
								: 'text-muted'}"
						>
							{c.pts}
						</span>
					</div>
				</div>
			{/each}
		</aside>

		<!-- Center Stage -->
		<main class="flex flex-1 flex-col gap-3 overflow-y-auto px-8 py-6">
			<span class="font-mono text-[11px] font-semibold tracking-[2px] text-accent">
				경매 진행 중
			</span>

			<!-- Player Card -->
			<div class="flex items-center gap-4 border border-gray-50 p-6">
				<div class="h-20 w-20 border-2 border-accent bg-gray-700"></div>
				<div class="flex flex-col gap-1">
					<span class="font-heading text-2xl font-bold text-gray-50">KIIN</span>
					<span class="font-mono text-xs text-muted">DK · TOP</span>
				</div>
				<div class="ml-auto flex gap-6">
					<div class="flex flex-col items-center">
						<span class="font-heading text-lg font-bold text-gray-50">92</span>
						<span class="font-mono text-[9px] tracking-wider text-muted">종합</span>
					</div>
					<div class="flex flex-col items-center">
						<span class="font-heading text-lg font-bold text-gray-50">88</span>
						<span class="font-mono text-[9px] tracking-wider text-muted">라인</span>
					</div>
					<div class="flex flex-col items-center">
						<span class="font-heading text-lg font-bold text-gray-50">95</span>
						<span class="font-mono text-[9px] tracking-wider text-muted">팀워크</span>
					</div>
				</div>
			</div>

			<!-- Timer -->
			<div class="flex flex-col items-center gap-1.5">
				<span class="font-mono text-[10px] font-semibold tracking-[2px] text-muted">
					남은 시간
				</span>
				<span class="font-heading text-6xl font-bold text-accent">00:47</span>
				<div class="h-1 w-full bg-gray-700">
					<div class="h-full w-3/4 bg-accent"></div>
				</div>
			</div>

			<!-- Bid Panel -->
			<div class="flex flex-col gap-3">
				<div class="flex items-center justify-between">
					<span class="font-mono text-[11px] font-semibold tracking-wider text-muted">
						현재 입찰가
					</span>
					<span class="font-heading text-xl font-bold text-accent">320 포인트</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="font-mono text-[11px] font-semibold tracking-wider text-muted">
						최고 입찰자
					</span>
					<span class="max-w-[200px] truncate font-heading text-sm font-semibold text-gray-50"
						>갓겜장인_불꽃드래곤</span
					>
				</div>
				<div class="flex gap-3">
					<Button variant="SECONDARY" size="MD">+10</Button>
					<Button variant="SECONDARY" size="MD">+50</Button>
					<Button variant="SECONDARY" size="MD">+100</Button>
					<Button variant="PRIMARY" size="MD">직접 입찰</Button>
				</div>
			</div>
		</main>

		<!-- Bid History (Right) -->
		<aside class="flex w-[300px] flex-col gap-3 overflow-y-auto border-l border-gray-700 p-5">
			<span class="font-mono text-[11px] font-semibold tracking-wider text-accent">
				입찰 기록
			</span>
			{#each bids as b, i (i)}
				<div
					class="flex items-center justify-between px-3 py-2.5 {b.top
						? 'border border-accent'
						: 'border border-gray-700'}"
				>
					<div class="flex flex-col gap-0.5">
						<span
							class="max-w-[160px] truncate font-heading text-[13px] font-semibold text-gray-50"
						>
							{b.name}
						</span>
						<span class="font-mono text-[10px] font-semibold tracking-wider text-muted">
							{b.time}
						</span>
					</div>
					<span class="font-heading text-base font-bold {b.top ? 'text-accent' : 'text-gray-50'}">
						{b.amount}
					</span>
				</div>
			{/each}
		</aside>
	</div>

	<!-- Bottom: Player Pool -->
	<section class="flex h-[160px] flex-col gap-3 border-t border-gray-700 px-8 py-4">
		<div class="flex items-center justify-between">
			<span class="font-mono text-[11px] font-semibold tracking-wider text-accent">
				선수풀 — 다음 경매
			</span>
			<span class="font-mono text-[11px] font-semibold tracking-wider text-muted"> 24명 남음 </span>
		</div>
		<div class="flex flex-1 gap-3">
			{#each pool as p, i (i)}
				<div class="flex-1">
					<PlayerCard position={p.position} name={p.name} team={p.team} selected={p.selected} />
				</div>
			{/each}
		</div>
	</section>
</div>
