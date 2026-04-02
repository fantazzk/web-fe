<script lang="ts">
	import { Sidebar, Icon, Badge, ThemePicker } from '$lib/components';

	const room = {
		code: 'ABC-7742',
		template: {
			name: 'LCK Spring 2026',
			description: '6 PLAYERS · 치지직 LCK 스프링 시즌 모의 경매. 나만의 드림팀을 구성하세요.'
		},
		settings: {
			mode: 'AUCTION',
			teams: 4,
			points: '1,000 PTS',
			time: '30 SEC',
			roster: '5 PLAYERS'
		}
	};

	interface Participant {
		nickname: string;
		isHost: boolean;
		isReady: boolean;
		isOnline: boolean;
	}

	const participants: Participant[] = [
		{ nickname: 'DragonSlayer', isHost: true, isReady: true, isOnline: true },
		{ nickname: 'NightHawk_KR', isHost: false, isReady: true, isOnline: true },
		{ nickname: 'SilverFox', isHost: false, isReady: false, isOnline: true },
		{ nickname: 'BlazeRunner', isHost: false, isReady: true, isOnline: true }
	];

	const maxPlayers = 6;

	interface ChatMessage {
		nickname: string;
		text: string;
	}

	const chatMessages: ChatMessage[] = [
		{ nickname: 'DragonSlayer', text: "Ready to go. Let's pick some streamers." },
		{ nickname: 'NightHawk_KR', text: 'Auction mode is going to be fun' },
		{ nickname: 'SilverFox', text: 'Hold on.. changing settings' }
	];

	const emptySlots = Array.from({ length: maxPlayers - participants.length }, (__, i) => i);
	const allReady = participants.every((p) => p.isReady);
	const canStart = allReady && participants.length >= 2;
</script>

<svelte:head>
	<title>로비 | Fantazzk</title>
</svelte:head>

<div class="flex h-screen bg-bg-primary">
	<!-- Sidebar -->
	<Sidebar logo="BD">
		{#snippet nav()}
			<button
				class="flex h-12 w-12 items-center justify-center rounded-sm bg-bg-primary/8"
				aria-label="대시보드"
			>
				<Icon name="layout-grid" color="#0A0A0A" />
			</button>
			<button class="flex h-12 w-12 items-center justify-center" aria-label="참가자">
				<Icon name="users" color="#0A0A0A" />
			</button>
			<button class="flex h-12 w-12 items-center justify-center" aria-label="트렌드">
				<Icon name="trending-up" color="#0A0A0A" />
			</button>
			<button class="flex h-12 w-12 items-center justify-center" aria-label="설정">
				<Icon name="settings" color="#0A0A0A" />
			</button>
		{/snippet}
		{#snippet footer()}
			<ThemePicker />
		{/snippet}
	</Sidebar>

	<!-- Main Content -->
	<main class="flex flex-1 flex-col overflow-hidden">
		<!-- Header -->
		<header class="flex h-[72px] items-center justify-between border-b border-gray-700 px-14">
			<div class="flex items-center gap-6">
				<h1 class="font-heading text-3xl font-semibold tracking-wider text-gray-50">
					MULTIPLAYER LOBBY
				</h1>
				<span
					class="border border-accent px-4 py-2 font-mono text-sm font-semibold tracking-wider text-accent"
				>
					ROOM {room.code}
				</span>
			</div>
			<div class="flex items-center gap-4">
				<button
					class="flex items-center gap-2 bg-accent px-6 py-2.5 font-mono text-sm font-semibold tracking-wider text-bg-primary"
				>
					<Icon name="link" size={14} />
					COPY LINK
				</button>
				<span class="font-mono text-base font-semibold text-muted">
					{participants.length}/{maxPlayers}
				</span>
			</div>
		</header>

		<!-- Body -->
		<div class="flex flex-1 gap-10 overflow-hidden px-14 py-12">
			<!-- Left Column: Participants + Chat -->
			<div class="flex flex-1 flex-col gap-8">
				<!-- Participants -->
				<section>
					<h2 class="mb-4 font-mono text-sm font-semibold tracking-[2px] text-accent">
						PARTICIPANTS
					</h2>
					<ul class="flex list-none flex-col gap-2">
						{#each participants as p, i (i)}
							<li class="flex items-center justify-between border border-gray-700 px-4 py-3">
								<div class="flex items-center gap-3">
									<span
										class="h-2.5 w-2.5 rounded-full {p.isOnline ? 'bg-green-500' : 'bg-gray-600'}"
									></span>
									<span class="font-mono text-sm font-semibold text-muted">
										{String(i + 1).padStart(2, '0')}
									</span>
									<span class="font-heading text-base font-semibold text-gray-50">
										{p.nickname}
									</span>
									{#if p.isHost}
										<Badge variant="STATUS">HOST</Badge>
									{/if}
								</div>
								<span
									class="font-mono text-sm font-semibold tracking-wider {p.isReady
										? 'text-accent'
										: 'text-muted'}"
								>
									{p.isReady ? 'READY' : 'NOT READY'}
								</span>
							</li>
						{/each}
						{#each emptySlots as slotIndex (slotIndex)}
							<li
								class="flex items-center gap-3 border border-dashed border-gray-700 px-4 py-3 opacity-40"
							>
								<span class="h-2.5 w-2.5 rounded-full bg-gray-700"></span>
								<span class="font-mono text-sm text-muted">
									{String(participants.length + slotIndex + 1).padStart(2, '0')}
								</span>
								<span class="font-mono text-sm text-muted">대기 중…</span>
							</li>
						{/each}
					</ul>
				</section>

				<!-- Chat -->
				<section class="flex flex-1 flex-col overflow-hidden border border-gray-700">
					<h2 class="flex items-center justify-between border-b border-gray-700 px-4 py-3">
						<span class="font-mono text-sm font-semibold tracking-[2px] text-accent">
							로비 채팅
						</span>
						<span class="font-mono text-sm text-muted">
							{chatMessages.length}개 메시지
						</span>
					</h2>
					<div class="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
						{#each chatMessages as msg, i (i)}
							<div class="flex flex-col gap-0.5">
								<span class="font-mono text-sm font-semibold text-accent">
									{msg.nickname}
								</span>
								<span class="font-mono text-base text-gray-50">{msg.text}</span>
							</div>
						{/each}
					</div>
					<div class="border-t border-gray-700 px-4 py-3">
						<input
							type="text"
							placeholder="메시지를 입력하세요…"
							class="w-full bg-transparent font-mono text-base text-gray-50 outline-none placeholder:text-muted"
							disabled
						/>
					</div>
				</section>
			</div>

			<!-- Right Column: Template + Settings + Actions -->
			<div class="flex w-[380px] flex-col gap-6">
				<!-- Selected Template -->
				<section class="flex flex-col gap-3 border border-gray-50 p-5">
					<h2 class="font-mono text-sm font-semibold tracking-[2px] text-muted">선택된 템플릿</h2>
					<span class="font-heading text-2xl font-bold text-gray-50">
						{room.template.name}
					</span>
					<p class="font-mono text-sm leading-relaxed text-muted">
						{room.template.description}
					</p>
				</section>

				<!-- Game Settings -->
				<section class="flex flex-col border border-gray-700">
					<h2
						class="border-b border-gray-700 px-5 py-3 font-mono text-sm font-semibold tracking-[2px] text-muted"
					>
						게임 설정
					</h2>
					<dl class="flex flex-col">
						{#each Object.entries(room.settings) as [key, value], i (i)}
							<div
								class="flex items-center justify-between px-5 py-2.5 {i > 0
									? 'border-t border-gray-800'
									: ''}"
							>
								<dt class="font-mono text-sm font-semibold tracking-wider text-muted">
									{key.toUpperCase()}
								</dt>
								<dd class="font-mono text-base font-semibold text-gray-50">{value}</dd>
							</div>
						{/each}
					</dl>
				</section>

				<!-- Bottom Actions -->
				<div class="mt-auto flex flex-col gap-4">
					<div class="flex items-center gap-2">
						<span class="h-2 w-2 rounded-full {canStart ? 'bg-green-500' : 'bg-amber-500'}"></span>
						<span class="font-mono text-sm font-semibold tracking-wider text-muted">
							{#if canStart}
								모든 플레이어 준비 완료
							{:else}
								모든 플레이어가 준비할 때까지 대기 중
							{/if}
						</span>
					</div>
					<button
						class="flex h-14 w-full items-center justify-center gap-2 font-mono text-base font-semibold tracking-wider {canStart
							? 'bg-accent text-bg-primary'
							: 'cursor-not-allowed bg-gray-700 text-muted'}"
						disabled={!canStart}
					>
						<Icon name="play" size={18} />
						게임 시작
					</button>
				</div>
			</div>
		</div>
	</main>
</div>
