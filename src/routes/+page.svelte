<script lang="ts">
	import {
		Sidebar,
		Icon,
		Button,
		Badge,
		SectionHeader,
		TemplateCard,
		ResultListItem,
		ThemePicker
	} from '$lib/components';

	const templates = [
		{
			tag: 'LOL',
			number: '01',
			name: '스트리머 랭킹전 시즌 2',
			stats: [{ label: '8 TEAMS' }, { label: '842 USES' }]
		},
		{
			tag: 'VALORANT',
			number: '02',
			name: '발로란트 프로 경매전',
			stats: [{ label: '6 TEAMS' }, { label: '1.5K USES' }]
		},
		{
			tag: 'PUBG',
			number: '03',
			name: '배그 스쿼드 드래프트',
			stats: [{ label: '4 TEAMS' }, { label: '2.1K USES' }]
		}
	];

	const results = [
		{
			number: '01',
			userName: '롤잘알_김선생',
			templateName: '스트리머 랭킹전 시즌 2',
			time: '2분 전'
		},
		{
			number: '02',
			userName: '발로란트장인',
			templateName: '발로란트 프로 경매전',
			time: '5분 전'
		},
		{
			number: '03',
			userName: '배그마스터_박프로',
			templateName: '배그 스쿼드 드래프트',
			time: '12분 전'
		}
	];
</script>

<svelte:head>
	<title>FANTAZZK — 자낳대, 치지직컵 모의경매 & 드래프트</title>
	<meta
		name="description"
		content="자낳대 모의경매, 치지직 드래프트를 직접 체험하세요. 나만의 드림팀을 경매하고 결과를 공유하는 모의 드래프트 시뮬레이터."
	/>
	<meta property="og:title" content="FANTAZZK — 자낳대, 치지직컵 모의경매 & 드래프트" />
	<meta
		property="og:description"
		content="자낳대 모의경매, 치지직 드래프트를 직접 체험하세요. 나만의 드림팀을 경매하고 결과를 공유하는 모의 드래프트 시뮬레이터."
	/>
</svelte:head>

<div class="flex h-screen bg-bg-primary">
	<!-- Sidebar -->
	<Sidebar logo="CD">
		{#snippet nav()}
			<button
				class="flex h-12 w-12 items-center justify-center rounded-sm bg-bg-primary/8"
				aria-label="대시보드"
				aria-current="page"
			>
				<Icon name="layout-grid" color="#0A0A0A" />
			</button>
			<button class="flex h-12 w-12 items-center justify-center" aria-label="템플릿">
				<Icon name="file-text" color="#0A0A0A" />
			</button>
			<button class="flex h-12 w-12 items-center justify-center" aria-label="트렌드">
				<Icon name="trending-up" color="#0A0A0A" />
			</button>
			<button class="flex h-12 w-12 items-center justify-center" aria-label="사용자">
				<Icon name="users" color="#0A0A0A" />
			</button>
		{/snippet}
		{#snippet footer()}
			<ThemePicker />
		{/snippet}
	</Sidebar>

	<!-- Main Content -->
	<main class="flex flex-1 flex-col gap-10 overflow-y-auto px-14 py-12">
		<!-- Hero Section -->
		<section class="flex h-[260px] items-center gap-10 border border-gray-50 p-8">
			<div class="flex flex-1 flex-col justify-center gap-4">
				<span class="font-mono text-xs font-semibold tracking-[2px] text-accent">
					모의 드래프트 & 경매 시뮬레이터
				</span>
				<h1 class="font-heading text-4xl font-bold text-gray-50">나만의 드림팀, 직접 경매하세요</h1>
				<p class="font-mono text-[13px] leading-relaxed text-muted">
					자낳대 모의경매부터 치지직 드래프트까지.<br />
					좋아하는 스트리머로 팀을 짜고, 결과를 공유하세요.
				</p>
				<div>
					<Button variant="PRIMARY" size="MD">지금 시작하기</Button>
				</div>
			</div>
			<div class="h-full w-[280px] rounded-sm bg-gray-800"></div>
		</section>

		<!-- Popular Templates -->
		<section class="flex flex-col gap-6">
			<SectionHeader title="POPULAR TEMPLATES" actionText="VIEW ALL →" actionHref="/templates" />
			<div class="flex gap-6">
				{#each templates as t, i (i)}
					<div class="flex-1">
						<TemplateCard tag={t.tag} name={t.name} number={t.number} stats={t.stats} />
					</div>
				{/each}
			</div>
		</section>

		<!-- Recent Community Results -->
		<section class="flex flex-col gap-4">
			<div class="flex w-full items-center justify-between">
				<h2 class="font-heading text-2xl font-semibold tracking-wider text-gray-50">
					RECENT COMMUNITY RESULTS
				</h2>
				<Badge variant="STATUS">LIVE</Badge>
			</div>
			<div class="flex flex-col gap-2">
				{#each results as r, i (i)}
					<ResultListItem
						number={r.number}
						userName={r.userName}
						templateName={r.templateName}
						time={r.time}
					/>
				{/each}
			</div>
		</section>
	</main>
</div>
