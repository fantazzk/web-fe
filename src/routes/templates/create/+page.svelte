<script lang="ts">
	import { Sidebar, Icon, Button, ThemePicker, Toggle } from '$lib/components';
	import { Template } from '$lib/domain/template';
	import type { GameType, TemplateModeType, DraftModeType, TierType } from '$lib/domain/template';

	// --- State ---
	let name = $state('');
	let gameType = $state<GameType>('LEAGUE_OF_LEGENDS');
	let mode = $state<TemplateModeType>('DRAFT');
	let totalPoints = $state(1000);
	let minBid = $state(10);
	let pickBanTime = $state(30);
	let draftType = $state<DraftModeType>('SNAKE');
	let captainsNeeded = $state(2);
	let creatorAsCaptain = $state(true);
	let showDraftInfo = $state(false);
	let draftInfoRef = $state<HTMLElement | null>(null);
	let activeStep = $state<number | null>(null);
	let stepRefs = $state<(HTMLElement | null)[]>([null, null, null, null]);

	// --- 선수 관련 ---
	const TIERS: TierType[] = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D'];

	interface PlayerEntry {
		name: string;
		position: string;
		tier: TierType;
	}

	const ROLES_BY_GAME: Record<GameType, string[]> = {
		LEAGUE_OF_LEGENDS: ['탑', '정글', '미드', '원딜', '서포터'],
		VALORANT: ['듀얼리스트', '이니시에이터', '컨트롤러', '센티널'],
		OVERWATCH_2: ['탱커', '딜러', '서포터'],
		BATTLEGROUNDS: []
	};

	let players = $state<PlayerEntry[]>([]);
	let roles = $derived(ROLES_BY_GAME[gameType]);
	let hasRoles = $derived(roles.length > 0);

	// --- Derived ---
	let completion = $derived(
		Template.getCompletionRate({
			name,
			gameType,
			pickBanTime,
			mode,
			totalPoints,
			minBid,
			players,
			captainsNeeded
		})
	);

	// --- 옵션 상수 ---
	const GAME_OPTIONS: { value: GameType; label: string }[] = [
		{ value: 'LEAGUE_OF_LEGENDS', label: '리그 오브 레전드' },
		{ value: 'VALORANT', label: '발로란트' },
		{ value: 'OVERWATCH_2', label: '오버워치2' },
		{ value: 'BATTLEGROUNDS', label: '배틀그라운드' }
	];
	const MODE_OPTIONS: { value: TemplateModeType; label: string }[] = [
		{ value: 'DRAFT', label: '드래프트' },
		{ value: 'AUCTION', label: '경매' }
	];
	const DRAFT_OPTIONS: { value: DraftModeType; label: string }[] = [
		{ value: 'SNAKE', label: '스네이크' },
		{ value: 'SEQUENTIAL', label: '순차' }
	];

	// --- Functions ---
	function setGameType(gt: GameType) {
		gameType = gt;
		const newRoles = ROLES_BY_GAME[gt];
		for (const player of players) {
			player.position = newRoles.length > 0 ? newRoles[0]! : '';
		}
	}

	function addPlayer() {
		players.push({ name: '', position: hasRoles ? roles[0]! : '', tier: 'B' });
	}

	function removePlayer(index: number) {
		players.splice(index, 1);
	}

	function handleGlobalClick(e: MouseEvent) {
		const target = e.target as Node;
		if (showDraftInfo && draftInfoRef && !draftInfoRef.contains(target)) {
			showDraftInfo = false;
		}
		const clickedStep = stepRefs.findIndex((ref) => ref?.contains(target));
		activeStep = clickedStep >= 0 ? clickedStep : null;
	}
</script>

<svelte:window onclick={handleGlobalClick} />

<svelte:head>
	<title>템플릿 생성 | Fantazzk</title>
</svelte:head>

<div class="flex h-screen bg-bg-primary">
	<!-- Sidebar -->
	<Sidebar logo="MD">
		{#snippet nav()}
			<a
				href="/"
				class="flex h-12 w-12 items-center justify-center"
				aria-label="대시보드"
				title="대시보드"
			>
				<Icon name="layout-grid" color="#0A0A0A" />
			</a>
			<a
				href="/templates/create"
				class="flex h-12 w-12 items-center justify-center rounded-sm bg-bg-primary/8"
				aria-label="템플릿 만들기"
				aria-current="page"
				title="템플릿 만들기"
			>
				<Icon name="file-text" color="#0A0A0A" />
			</a>
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

	<!-- Main -->
	<div class="flex flex-1 flex-col">
		<!-- Header -->
		<header class="flex h-16 items-center justify-between border-b border-gray-700 px-14">
			<div class="flex items-center gap-2">
				<span class="font-heading text-2xl font-bold tracking-wider text-gray-50"> 새 템플릿 </span>
				<span class="font-mono text-sm font-semibold text-accent"> 기본 정보 </span>
				<span class="font-mono text-sm text-muted"> 설정 </span>
			</div>
			<a href="/" aria-label="닫기">
				<Icon name="close" color="currentColor" />
			</a>
		</header>

		<!-- Content Body -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Steps Panel -->
			<aside class="flex w-[240px] flex-col gap-7 border-r border-gray-700 px-7 py-12">
				<!-- 진행률 -->
				<div class="flex flex-col gap-2">
					<div class="flex items-center justify-between">
						<span class="font-mono text-xs font-semibold text-muted">진행률</span>
						<span class="font-mono text-xs font-semibold text-accent">{completion.percent}%</span>
					</div>
					<div
						class="h-1 w-full rounded-full bg-gray-700"
						role="progressbar"
						aria-valuenow={completion.percent}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="템플릿 완성도"
					>
						<div class="h-full rounded-full bg-accent" style="width: {completion.percent}%"></div>
					</div>
				</div>

				<!-- Steps List -->
				<div class="flex flex-col gap-2.5">
					{#each [{ label: '기본 정보' }, { label: '규칙' }, { label: '선수' }, { label: '감독' }] as step, i}
						<button
							type="button"
							onclick={() => stepRefs[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
							class="flex flex-col gap-1 border-l-[3px] p-3 text-left {activeStep === i
								? 'border-accent bg-bg-surface'
								: 'border-gray-700'}"
						>
							<div class="flex items-center justify-between">
								<span
									class="font-mono text-xs font-bold tracking-wider {activeStep === i
										? 'text-accent'
										: 'text-muted'}"
								>
									STEP {i + 1}
								</span>
								<span
									class="font-mono text-xs {completion.steps[i] === 100
										? 'text-accent'
										: 'text-subtle'}"
								>
									{completion.steps[i]}%
								</span>
							</div>
							<span
								class="font-mono text-sm {activeStep === i
									? 'font-semibold text-gray-50'
									: 'text-muted'}"
							>
								{step.label}
							</span>
						</button>
					{/each}
				</div>
			</aside>

			<!-- Form Area -->
			<main class="flex flex-1 flex-col overflow-y-auto">
				<div class="flex flex-1 flex-col gap-8 px-14 py-12">
					<!-- Form Title -->
					<h1 class="font-heading text-4xl font-bold tracking-tight text-gray-50">템플릿 설정</h1>

					<!-- Step Sections -->
					<div class="flex flex-col gap-5">
						<!-- STEP 1: 기본 정보 -->
						<section
							bind:this={stepRefs[0]}
							class="flex flex-col gap-3 border p-5 {activeStep === 0
								? 'border-accent'
								: 'border-gray-700'}"
						>
							<h2
								class="font-mono text-sm font-bold tracking-wider {activeStep === 0
									? 'text-accent'
									: 'text-gray-50'}"
							>
								1단계 기본 정보
							</h2>
							<div class="flex flex-col gap-2">
								<label for="name" class="font-mono text-xs font-semibold tracking-[2px] text-muted">
									대회 이름
								</label>
								<input
									id="name"
									type="text"
									bind:value={name}
									placeholder="예: 2026 자낳대 롤 시즌1"
									class="h-12 border border-gray-700 bg-transparent px-4 font-mono text-base text-gray-50 placeholder:text-subtle focus:border-accent focus:outline-none"
								/>
							</div>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-xs font-semibold tracking-[2px] text-muted">
									게임 종목
								</span>
								<div class="flex gap-2.5" role="radiogroup" aria-label="게임 종목">
									{#each GAME_OPTIONS as opt}
										<button
											type="button"
											role="radio"
											aria-checked={gameType === opt.value}
											onclick={() => setGameType(opt.value)}
											class="border px-4 py-2.5 font-mono text-xs font-semibold tracking-wider {gameType ===
											opt.value
												? 'border-accent bg-accent text-bg-primary'
												: 'border-gray-700 text-muted'}"
										>
											{opt.label}
										</button>
									{/each}
								</div>
							</div>
						</section>

						<!-- STEP 2: 규칙 -->
						<section
							bind:this={stepRefs[1]}
							class="flex flex-col gap-3 border p-5 {activeStep === 1
								? 'border-accent'
								: 'border-gray-700'}"
						>
							<h2
								class="font-mono text-sm font-bold tracking-wider {activeStep === 1
									? 'text-accent'
									: 'text-gray-50'}"
							>
								2단계 규칙
							</h2>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-xs font-semibold tracking-[2px] text-muted">
									진행 방식
								</span>
								<div class="flex gap-2.5" role="radiogroup" aria-label="진행 방식">
									{#each MODE_OPTIONS as opt}
										<button
											type="button"
											role="radio"
											aria-checked={mode === opt.value}
											onclick={() => (mode = opt.value)}
											class="border px-4 py-2.5 font-mono text-xs font-semibold tracking-wider {mode ===
											opt.value
												? 'border-accent bg-accent text-bg-primary'
												: 'border-gray-700 text-muted'}"
										>
											{opt.label}
										</button>
									{/each}
								</div>
							</div>
							{#if mode === 'DRAFT'}
								<div class="flex flex-col gap-2">
									<div class="flex items-center gap-1.5">
										<span class="font-mono text-xs font-semibold tracking-[2px] text-muted">
											드래프트 방식
										</span>
										<span class="relative flex items-center" bind:this={draftInfoRef}>
											<button
												type="button"
												aria-label="드래프트 방식 설명"
												aria-expanded={showDraftInfo}
												aria-controls="draft-info-popover"
												onclick={() => (showDraftInfo = !showDraftInfo)}
												class="flex cursor-pointer items-center hover:text-accent {showDraftInfo
													? 'text-accent'
													: 'text-subtle'}"
											>
												<Icon name="info" size={14} />
											</button>
											{#if showDraftInfo}
												<div
													id="draft-info-popover"
													role="tooltip"
													class="absolute top-1/2 left-full z-10 ml-2 w-[260px] -translate-y-1/2 border border-accent bg-bg-primary p-3 shadow-lg"
												>
													<div class="flex flex-col gap-2">
														<div class="flex flex-col gap-1">
															<span class="font-mono text-xs font-semibold text-accent"
																>스네이크</span
															>
															<div class="font-mono text-xs leading-relaxed text-gray-50">
																1→2→3→4→5<br />
																5→4→3→2→1<br />
																1→2→3→4→5<br />
																<span class="text-muted">↻ 매 라운드 순서 반전</span>
															</div>
														</div>
														<div class="h-px bg-gray-700"></div>
														<div class="flex flex-col gap-1">
															<span class="font-mono text-xs font-semibold text-accent">순차</span>
															<div class="font-mono text-xs leading-relaxed text-gray-50">
																1→2→3→4→5<br />
																1→2→3→4→5<br />
																1→2→3→4→5<br />
																<span class="text-muted">↻ 매 라운드 동일 순서</span>
															</div>
														</div>
													</div>
												</div>
											{/if}
										</span>
									</div>
									<div class="flex gap-2.5" role="radiogroup" aria-label="드래프트 방식">
										{#each DRAFT_OPTIONS as opt}
											<button
												type="button"
												role="radio"
												aria-checked={draftType === opt.value}
												onclick={() => (draftType = opt.value)}
												class="border px-4 py-2.5 font-mono text-xs font-semibold tracking-wider {draftType ===
												opt.value
													? 'border-accent bg-accent text-bg-primary'
													: 'border-gray-700 text-muted'}"
											>
												{opt.label}
											</button>
										{/each}
									</div>
								</div>
							{:else}
								<div class="flex gap-4">
									<div class="flex flex-1 flex-col gap-2">
										<label
											for="totalPoints"
											class="font-mono text-xs font-semibold tracking-[2px] text-muted"
										>
											초기 포인트
										</label>
										<input
											id="totalPoints"
											type="number"
											bind:value={totalPoints}
											class="h-12 border border-gray-700 bg-transparent px-4 font-mono text-base text-gray-50 focus:border-accent focus:outline-none"
										/>
									</div>
									<div class="flex flex-1 flex-col gap-2">
										<label
											for="minBid"
											class="font-mono text-xs font-semibold tracking-[2px] text-muted"
										>
											최소 입찰 단위
										</label>
										<input
											id="minBid"
											type="number"
											bind:value={minBid}
											class="h-12 border border-gray-700 bg-transparent px-4 font-mono text-base text-gray-50 focus:border-accent focus:outline-none"
										/>
									</div>
								</div>
							{/if}
							<div class="flex flex-col gap-2">
								<label
									for="pickBanTime"
									class="font-mono text-xs font-semibold tracking-[1.4px] text-muted"
								>
									픽/밴 시간 (초)
								</label>
								<input
									id="pickBanTime"
									type="number"
									bind:value={pickBanTime}
									class="h-12 border border-gray-700 bg-transparent px-4 font-mono text-base text-gray-50 focus:border-accent focus:outline-none"
								/>
							</div>
						</section>

						<!-- STEP 3: 선수 -->
						<section
							bind:this={stepRefs[2]}
							class="flex flex-col gap-3 border p-5 {activeStep === 2
								? 'border-accent'
								: 'border-gray-700'}"
						>
							<div class="flex items-center justify-between">
								<h2
									class="font-mono text-sm font-bold tracking-wider {activeStep === 2
										? 'text-accent'
										: 'text-gray-50'}"
								>
									3단계 선수
								</h2>
								<span class="font-mono text-xs text-muted">
									{players.length}명
								</span>
							</div>
							{#if players.length > 0}
								<div class="flex flex-col gap-2">
									<div class="flex gap-2 font-mono text-xs font-semibold tracking-[2px] text-muted">
										<span class="flex-1">이름</span>
										{#if hasRoles}
											<span class="w-[140px]">역할</span>
										{/if}
										<span class="w-[100px]">등급</span>
										<span class="w-8"></span>
									</div>
									{#each players as player, i}
										<div class="flex items-center gap-2">
											<input
												type="text"
												bind:value={player.name}
												placeholder="선수 이름"
												aria-label="선수 {i + 1} 이름"
												class="h-10 flex-1 border border-gray-700 bg-transparent px-3 font-mono text-sm text-gray-50 placeholder:text-subtle focus:border-accent focus:outline-none"
											/>
											{#if hasRoles}
												<select
													bind:value={player.position}
													aria-label="선수 {i + 1} 역할"
													class="h-10 w-[140px] border border-gray-700 bg-bg-primary px-3 font-mono text-sm text-gray-50 focus:border-accent focus:outline-none"
												>
													{#each roles as role}
														<option value={role}>{role}</option>
													{/each}
												</select>
											{/if}
											<select
												bind:value={player.tier}
												aria-label="선수 {i + 1} 등급"
												class="h-10 w-[100px] border border-gray-700 bg-bg-primary px-3 font-mono text-sm text-gray-50 focus:border-accent focus:outline-none"
											>
												{#each TIERS as t}
													<option value={t}>{t}</option>
												{/each}
											</select>
											<button
												type="button"
												aria-label="선수 {i + 1} 삭제"
												onclick={() => removePlayer(i)}
												class="flex h-10 w-8 items-center justify-center text-subtle hover:text-error"
											>
												<Icon name="close" size={14} />
											</button>
										</div>
									{/each}
								</div>
							{/if}
							<button
								type="button"
								onclick={addPlayer}
								class="flex h-10 items-center justify-center gap-1.5 border border-dashed border-gray-700 font-mono text-xs text-muted hover:border-accent hover:text-accent"
							>
								+ 선수 추가
							</button>
						</section>

						<!-- STEP 4: 감독 -->
						<section
							bind:this={stepRefs[3]}
							class="flex flex-col gap-3 border p-5 {activeStep === 3
								? 'border-accent'
								: 'border-gray-700'}"
						>
							<h2
								class="font-mono text-sm font-bold tracking-wider {activeStep === 3
									? 'text-accent'
									: 'text-gray-50'}"
							>
								4단계 감독
							</h2>
							<div class="flex flex-col gap-2">
								<label
									for="captainsNeeded"
									class="font-mono text-xs font-semibold tracking-[2px] text-muted"
								>
									감독 수
								</label>
								<input
									id="captainsNeeded"
									type="number"
									bind:value={captainsNeeded}
									min="1"
									class="h-12 border border-gray-700 bg-transparent px-4 font-mono text-base text-gray-50 focus:border-accent focus:outline-none"
								/>
							</div>
							<div class="flex items-center justify-end gap-3">
								<span class="font-mono text-sm text-gray-50">본인도 감독으로 참여</span>
								<Toggle bind:checked={creatorAsCaptain} label="본인도 감독으로 참여" />
							</div>
						</section>
					</div>
				</div>

				<!-- Bottom Bar -->
				<div class="flex items-center justify-end gap-3 border-t border-gray-700 px-14 py-4">
					<Button variant="SECONDARY" size="MD">혼자 하기</Button>
					<Button variant="PRIMARY" size="MD">방 만들기</Button>
				</div>
			</main>

			<!-- Preview Panel -->
			<aside class="flex w-[360px] flex-col gap-4 overflow-y-auto bg-bg-elevated px-7 py-10">
				<!-- Tips -->
				<div class="flex flex-col gap-2 rounded-sm border border-gray-800 p-3">
					<span class="font-mono text-sm font-semibold tracking-wider text-accent"> 팁 </span>
					<p class="font-mono text-sm leading-relaxed text-muted">
						공식 발표에 사용된 정확한 대회 이름을 입력하면 다른 유저가 쉽게 찾을 수 있습니다.
					</p>
				</div>

				<!-- Summary -->
				<span class="font-mono text-xs font-semibold tracking-[2px] text-muted"> 요약 </span>

				<div class="flex flex-col gap-3.5 border border-gray-700 p-4">
					<span class="font-heading text-xl font-bold text-gray-50">
						{name || '대회 이름 미입력'}
					</span>
					<span class="w-fit bg-accent px-2.5 py-1 font-mono text-xs font-semibold text-bg-primary">
						{mode === 'AUCTION' ? '경매' : '드래프트'}
					</span>
					<div class="h-px w-full bg-gray-700"></div>

					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<span class="font-mono text-xs text-muted">게임 종목</span>
							<span class="font-mono text-xs text-gray-50">{gameType.replace(/_/g, ' ')}</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="font-mono text-xs text-muted">픽/밴 시간</span>
							<span class="font-mono text-xs text-gray-50">{pickBanTime}초</span>
						</div>
						{#if mode === 'AUCTION'}
							<div class="flex items-center justify-between">
								<span class="font-mono text-xs text-muted">초기 포인트</span>
								<span class="font-mono text-xs text-gray-50">{totalPoints.toLocaleString()}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="font-mono text-xs text-muted">최소 입찰 단위</span>
								<span class="font-mono text-xs text-gray-50">{minBid}</span>
							</div>
						{:else}
							<div class="flex items-center justify-between">
								<span class="font-mono text-xs text-muted">드래프트 방식</span>
								<span class="font-mono text-xs text-gray-50"
									>{draftType === 'SNAKE' ? '스네이크' : '순차'}</span
								>
							</div>
						{/if}
						<div class="flex items-center justify-between">
							<span class="font-mono text-xs text-muted">선수</span>
							<span class="font-mono text-xs text-gray-50">{players.length}명</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="font-mono text-xs text-muted">감독 수</span>
							<span class="font-mono text-xs text-gray-50">{captainsNeeded}명</span>
						</div>
						<div class="flex items-center justify-between">
							<span class="font-mono text-xs text-muted">본인 참여</span>
							<span class="font-mono text-xs text-gray-50"
								>{creatorAsCaptain ? '예' : '아니오'}</span
							>
						</div>
					</div>
				</div>
			</aside>
		</div>
	</div>
</div>
