<script lang="ts">
	import {
		Sidebar,
		Button,
		Badge,
		SectionHeader,
		TemplateCard,
		ResultListItem
	} from '$lib/components';
	import { buildMeta } from '$lib/seo/meta.ts';

	const meta = buildMeta({ path: '/' });

	const templates = [
		{
			tag: 'LOL',
			number: '01',
			name: '스트리머 랭킹전 시즌 2',
			stats: [{ label: '8팀' }, { label: '842회 사용' }]
		},
		{
			tag: 'VALORANT',
			number: '02',
			name: '발로란트 프로 경매전',
			stats: [{ label: '6팀' }, { label: '1.5K회 사용' }]
		},
		{
			tag: 'PUBG',
			number: '03',
			name: '배그 스쿼드 드래프트',
			stats: [{ label: '4팀' }, { label: '2.1K회 사용' }]
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
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={meta.canonical} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.canonical} />
	<meta property="og:image" content={meta.image} />
</svelte:head>

<div class="flex h-screen bg-bg-primary">
	<!-- Sidebar -->
	<Sidebar />

	<!-- Main Content -->
	<main class="flex flex-1 flex-col gap-10 overflow-y-auto px-14 py-12">
		<!-- Hero Section -->
		<section class="flex h-[260px] items-center gap-10 border border-gray-50 p-8">
			<div class="flex flex-1 flex-col justify-center gap-4">
				<span class="font-mono text-xs font-semibold tracking-[2px] text-accent"> 추천 대회 </span>
				<h1 class="font-heading text-4xl font-bold text-gray-50">Chzzk 챌린저스 시즌 3</h1>
				<p class="font-mono text-[13px] leading-relaxed text-muted">
					최고의 스트리머들이 펼치는 리그 오브 레전드 토너먼트.<br />
					나만의 드림팀을 구성하세요.
				</p>
				<div class="flex gap-6">
					<span class="font-mono text-[11px] font-semibold tracking-wider text-muted">
						게임: LOL
					</span>
					<span class="font-mono text-[11px] font-semibold tracking-wider text-muted"> 팀: 8 </span>
					<span class="font-mono text-[11px] font-semibold tracking-wider text-muted">
						사용: 1.2K
					</span>
				</div>
				<div>
					<Button variant="PRIMARY" size="MD">빠른 시작</Button>
				</div>
			</div>
			<div class="h-full w-[280px] rounded-sm bg-gray-800"></div>
		</section>

		<!-- Popular Templates -->
		<section class="flex flex-col gap-6">
			<SectionHeader title="인기 템플릿" actionText="모두 보기 →" actionHref="/templates" />
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
					최근 커뮤니티 결과
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
