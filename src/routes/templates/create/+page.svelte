<script lang="ts">
	import { Sidebar, Icon, Button, ThemePicker } from '$lib/components';
</script>

<svelte:head>
	<title>템플릿 생성 | Fantazzk</title>
</svelte:head>

<div class="flex h-screen bg-bg-primary">
	<!-- Sidebar -->
	<Sidebar logo="MD">
		{#snippet nav()}
			<button class="flex h-12 w-12 items-center justify-center" aria-label="대시보드">
				<Icon name="layout-grid" color="#0A0A0A" />
			</button>
			<button
				class="flex h-12 w-12 items-center justify-center rounded-sm bg-bg-primary/8"
				aria-label="템플릿"
				aria-current="page"
			>
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

	<!-- Main -->
	<div class="flex flex-1 flex-col">
		<!-- Header -->
		<header class="flex h-16 items-center justify-between border-b border-gray-700 px-14">
			<div class="flex items-center gap-4">
				<span class="font-heading text-2xl font-bold tracking-wider text-gray-50">
					NEW TEMPLATE
				</span>
				<span class="font-mono text-sm text-muted">/</span>
				<span class="font-mono text-xs font-semibold tracking-[2px] text-accent"> CREATE </span>
			</div>
			<a href="/" aria-label="닫기">
				<Icon name="close" color="currentColor" />
			</a>
		</header>

		<!-- Content Body -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Steps Panel -->
			<aside class="flex w-[220px] flex-col gap-7 border-r border-gray-700 px-7 py-12">
				<span class="font-mono text-[11px] font-semibold tracking-[1.6px] text-muted">
					STEPS / 04
				</span>

				<!-- 편집 패턴 힌트 -->
				<div class="flex flex-col gap-1.5 rounded-sm border border-gray-800 bg-bg-surface p-2.5">
					<span class="font-mono text-[10px] font-bold tracking-wider text-muted">
						편집 패턴 안내
					</span>
					<p class="font-mono text-[11px] leading-snug text-gray-50">
						한 페이지 편집: 전체 항목을 한 번에 수정<br />
						단계별 편집: STEP별로 순차 수정 (현재)
					</p>
				</div>

				<!-- Steps List -->
				<div class="flex flex-col gap-2.5">
					<!-- Step 1: 완료 -->
					<div class="flex flex-col gap-1 border-l-2 border-gray-700 bg-bg-primary p-3">
						<span class="font-mono text-[11px] font-bold tracking-wider text-muted"> STEP 1 </span>
						<span class="font-mono text-xs text-muted">기본 정보 입력 단계</span>
						<span class="font-mono text-[11px] font-semibold text-subtle"> 상태: 준비됨 </span>
					</div>
					<!-- Step 2: 현재 (Active) -->
					<div class="flex flex-col gap-1 border-l-[3px] border-accent bg-bg-surface p-3">
						<span class="font-mono text-[11px] font-bold tracking-wider text-accent"> STEP 2 </span>
						<span class="font-mono text-xs font-semibold text-gray-50">
							규칙 설정 및 확인 단계
						</span>
						<span class="font-mono text-[11px] font-bold text-accent"> 상태: 진행 중 </span>
					</div>
					<!-- Step 3: 미완료 -->
					<div class="flex items-center gap-3.5 p-2.5 pl-3 opacity-70">
						<span class="font-mono text-[11px] font-bold tracking-wider text-muted"> STEP 3 </span>
						<span class="font-mono text-xs text-muted">선수 설정</span>
					</div>
					<!-- Step 4: 미완료 -->
					<div class="flex items-center gap-3.5 p-2.5 pl-3 opacity-70">
						<span class="font-mono text-[11px] font-bold tracking-wider text-muted"> STEP 4 </span>
						<span class="font-mono text-xs text-muted">캡틴 설정</span>
					</div>
				</div>
			</aside>

			<!-- Form Area -->
			<main class="flex flex-1 flex-col overflow-y-auto">
				<div class="flex flex-1 flex-col gap-8 px-14 py-12">
					<!-- Form Title -->
					<div class="flex flex-col gap-2">
						<h1 class="font-heading text-4xl font-bold tracking-tight text-gray-50">
							Template Setup
						</h1>
						<p class="font-mono text-sm leading-relaxed text-muted">
							기본은 한 페이지 위저드로 진행하고, 복잡도 높을 때 단계별 페이지로 분리합니다.
						</p>
					</div>

					<!-- 편집 방식 가이드 -->
					<div class="flex flex-col gap-2.5 border border-gray-700 p-4">
						<span class="font-mono text-xs font-bold tracking-wider text-gray-50"> 편집 방식 </span>
						<div class="flex gap-2.5">
							<span
								class="border border-accent bg-accent px-3 py-1.5 font-mono text-[11px] font-semibold text-bg-primary"
							>
								한 페이지 편집
							</span>
							<span
								class="border border-gray-700 px-3 py-1.5 font-mono text-[11px] font-semibold text-muted"
							>
								단계별 편집
							</span>
						</div>
						<p class="font-mono text-xs leading-relaxed text-muted">
							필드 수가 적고 미리보기 의존도가 높으면 한 페이지가 일반적입니다. 검증/권한/협업이
							단계별로 다르면 분리하세요.
						</p>
					</div>

					<!-- STEP 상태 해석 -->
					<div class="flex flex-col gap-2.5 border border-gray-700 p-3">
						<span class="font-mono text-xs font-bold tracking-wider text-gray-50">
							STEP 상태 해석
						</span>
						<div class="flex gap-2.5">
							<span class="flex items-center gap-2">
								<span class="h-3 w-3 border-l-2 border-gray-700"></span>
								<span class="font-mono text-[11px] text-muted">준비됨</span>
							</span>
							<span class="flex items-center gap-2">
								<span class="h-3 w-3 border-l-[3px] border-accent bg-accent/20"></span>
								<span class="font-mono text-[11px] text-accent">진행 중</span>
							</span>
							<span class="flex items-center gap-2">
								<span class="h-3 w-3 opacity-50">
									<span class="block h-full w-0.5 bg-gray-700"></span>
								</span>
								<span class="font-mono text-[11px] text-subtle">미완료</span>
							</span>
						</div>
						<p class="font-mono text-xs leading-relaxed text-muted">
							현재 화면에서 STEP 2의 금색 채움은 포커스가 아니라 '현재 진행 단계(Active)'를
							의미합니다.
						</p>
					</div>

					<!-- Step Sections -->
					<div class="flex flex-col gap-5">
						<!-- STEP 1: BASIC INFORMATION -->
						<section class="flex flex-col gap-3 border border-gray-700 p-4">
							<span class="font-mono text-xs font-bold tracking-wider text-gray-50">
								STEP 1 BASIC INFORMATION
							</span>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									TOURNAMENT NAME
								</span>
								<div class="flex h-11 items-center border border-gray-700 px-4">
									<span class="font-mono text-sm text-gray-50"> 2026 자낳대 롤 시즌1 </span>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									GAME TYPE
								</span>
								<div class="flex gap-2.5">
									<span
										class="border border-accent bg-accent px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-bg-primary"
									>
										LEAGUE OF LEGENDS
									</span>
									<span
										class="border border-gray-700 px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-muted"
									>
										VALORANT
									</span>
								</div>
							</div>
						</section>

						<!-- STEP 2: RULES (Active) -->
						<section class="flex flex-col gap-3 border border-accent p-4">
							<span class="font-mono text-xs font-bold tracking-wider text-accent">
								STEP 2 RULES
							</span>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									MATCH FORMAT
								</span>
								<div class="flex gap-2.5">
									<span
										class="border border-accent bg-accent px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-bg-primary"
									>
										Auction
									</span>
									<span
										class="border border-gray-700 px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-muted"
									>
										Draft
									</span>
								</div>
							</div>
							<div class="flex gap-4">
								<div class="flex flex-1 flex-col gap-2">
									<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
										INITIAL POINTS
									</span>
									<div class="flex h-11 items-center border border-gray-700 px-4">
										<span class="font-mono text-sm text-gray-50">1,000</span>
									</div>
								</div>
								<div class="flex flex-1 flex-col gap-2">
									<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
										MIN BID
									</span>
									<div class="flex h-11 items-center border border-gray-700 px-4">
										<span class="font-mono text-sm text-gray-50">10</span>
									</div>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[1.4px] text-muted">
									PICK/BAN TIME (sec)
								</span>
								<div class="flex h-11 items-center border border-gray-700 px-4">
									<span class="font-mono text-sm text-gray-50">30</span>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									RESTRICTIONS / NOTES
								</span>
								<div class="flex h-[70px] items-start border border-gray-700 px-4 py-2.5">
									<span class="font-mono text-sm text-muted"> 국/외인 제한 없이 교대 </span>
								</div>
							</div>
						</section>

						<!-- STEP 3: PLAYERS -->
						<section class="flex flex-col gap-3 border border-gray-700 p-4">
							<span class="font-mono text-xs font-bold tracking-wider text-gray-50">
								STEP 3 PLAYERS
							</span>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									TOTAL PLAYERS
								</span>
								<div class="flex h-11 items-center border border-gray-700 px-4">
									<span class="font-mono text-sm text-gray-50"></span>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									TIER BALANCING
								</span>
								<div class="flex gap-2.5">
									<span
										class="border border-accent bg-accent px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-bg-primary"
									>
										AUTO BALANCE
									</span>
									<span
										class="border border-gray-700 px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-muted"
									>
										MANUAL
									</span>
								</div>
							</div>
						</section>

						<!-- STEP 4: CAPTAINS -->
						<section class="flex flex-col gap-3 border border-gray-700 p-4">
							<span class="font-mono text-xs font-bold tracking-wider text-gray-50">
								STEP 4 CAPTAINS
							</span>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									CAPTAIN SELECT MODE
								</span>
								<div class="flex gap-2.5">
									<span
										class="border border-accent bg-accent px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-bg-primary"
									>
										VOTE
									</span>
									<span
										class="border border-gray-700 px-4 py-2 font-mono text-[11px] font-semibold tracking-wider text-muted"
									>
										HOST PICK
									</span>
								</div>
							</div>
							<div class="flex flex-col gap-2">
								<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
									CAPTAINS NEEDED
								</span>
								<div class="flex h-11 items-center border border-gray-700 px-4">
									<span class="font-mono text-sm text-gray-50"></span>
								</div>
							</div>
						</section>
					</div>
				</div>

				<!-- Bottom Bar -->
				<div class="flex items-center justify-between border-t border-gray-700 px-14 py-4">
					<Button variant="SECONDARY" size="MD">SAVE DRAFT</Button>
					<Button variant="PRIMARY" size="MD">SAVE ALL STEPS ✓</Button>
				</div>
			</main>

			<!-- Preview Panel -->
			<aside class="flex w-[360px] flex-col gap-4 overflow-y-auto bg-bg-elevated px-7 py-10">
				<!-- Live Preview Label -->
				<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
					LIVE PREVIEW
				</span>

				<!-- Preview Card -->
				<div class="flex flex-col gap-3.5 border border-gray-700 p-4">
					<span class="font-heading text-xl font-bold text-gray-50"> 2026 자낳대 롤 시즌1 </span>
					<span
						class="w-fit bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold text-bg-primary"
					>
						AUCTION OF LEGENDS
					</span>
					<div class="h-px w-full bg-gray-700"></div>

					<!-- Basic Info Preview -->
					<div class="flex flex-col gap-2.5 rounded-sm border border-gray-800 bg-bg-surface p-3">
						<span class="font-mono text-[10px] font-semibold tracking-wider text-muted">
							STEP 1 BASIC INFORMATION
						</span>
						<div class="flex items-center gap-2">
							<span class="font-mono text-[10px] font-semibold tracking-wider text-accent">
								PICK YOUR TYPE
							</span>
							<span class="font-mono text-[10px] tracking-wider text-muted">
								LEAGUE OF LEGENDS
							</span>
						</div>
					</div>

					<!-- Stats Row -->
					<div class="flex justify-between">
						<div class="flex flex-col items-center">
							<span class="font-heading text-lg font-bold text-gray-50">8</span>
							<span class="font-mono text-[9px] tracking-wider text-muted"> TEAMS </span>
						</div>
						<div class="flex flex-col items-center">
							<span class="font-heading text-lg font-bold text-gray-50"> 1,000 </span>
							<span class="font-mono text-[9px] tracking-wider text-muted"> POINTS </span>
						</div>
					</div>

					<!-- Rules Preview -->
					<div class="flex flex-col gap-2.5 rounded-sm border border-gray-800 bg-bg-surface p-3">
						<span class="font-mono text-[10px] font-semibold tracking-wider text-muted">
							STEP 2 RULES
						</span>
						<div class="flex flex-col gap-1">
							<span class="font-mono text-[10px] text-muted"> Auction · 30s Timer </span>
							<span class="font-mono text-[10px] text-muted"> 국/외인 제한 없이 교대 </span>
						</div>
					</div>

					<!-- Visibility -->
					<div class="flex items-center justify-between">
						<span class="font-mono text-[11px] font-semibold text-gray-50"> PUBLIC TEMPLATE </span>
						<div class="flex h-6 w-10 items-center rounded-full bg-accent px-0.5">
							<div class="ml-auto h-5 w-5 rounded-full bg-bg-primary"></div>
						</div>
					</div>
				</div>

				<!-- Completion -->
				<div class="flex flex-col gap-2">
					<span class="font-mono text-[11px] font-semibold tracking-[2px] text-muted">
						COMPLETION
					</span>
					<div class="h-1 w-full bg-gray-700">
						<div class="h-full w-1/4 bg-accent"></div>
					</div>
					<span class="font-mono text-xs text-subtle">1 of 4 steps completed</span>

					<!-- Status Legend -->
					<div class="flex flex-col gap-1.5 rounded-sm border border-gray-800 bg-bg-surface p-2.5">
						<div class="flex items-center gap-2">
							<span class="font-mono text-[10px] font-semibold text-accent"> ACTIVE </span>
							<span class="font-mono text-[10px] text-muted"> Step 2 — Rules </span>
						</div>
						<div class="flex items-center gap-2">
							<span class="font-mono text-[10px] font-semibold text-muted"> DONE </span>
							<span class="font-mono text-[10px] text-muted"> Step 1 — Basic Info </span>
						</div>
					</div>
				</div>

				<!-- Tips -->
				<div class="flex flex-col gap-2 rounded-sm border border-gray-800 p-3">
					<div class="flex items-center gap-2">
						<span class="font-mono text-[11px] font-semibold tracking-wider text-accent">
							TIPS
						</span>
					</div>
					<p class="font-mono text-xs leading-relaxed text-muted">
						Use the exact tournament name from the official announcement for easy discoverability.
					</p>
				</div>

				<!-- Decision Guide -->
				<div class="flex flex-col gap-2.5 rounded-sm border border-gray-800 bg-bg-surface p-3">
					<span class="font-mono text-[11px] font-semibold tracking-wider text-accent">
						DECISION GUIDE
					</span>
					<span class="font-mono text-xs font-semibold text-gray-50">
						한 페이지 편집이 적합한 경우
					</span>
					<p class="font-mono text-xs leading-relaxed text-muted">
						필드가 5~8개 내외로 적고<br />
						초기 세팅을 빠르게 끝내야 할 때<br />
						입력 흐름을 한 번에 훑어야 할 때
					</p>
					<div class="h-px w-full bg-gray-700"></div>
					<span class="font-mono text-xs font-semibold text-gray-50">
						단계별 페이지가 적합한 경우
					</span>
					<p class="font-mono text-xs leading-relaxed text-muted">
						설정 항목이 많아 검토 포인트가 분리될 때<br />
						단계별 검증/안내 문구가 필요한 복잡한 플로우일 때<br />
						중간 저장과 진행률 안내가 중요한 경우
					</p>
				</div>
			</aside>
		</div>
	</div>
</div>
