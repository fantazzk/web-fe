<script lang="ts">
	import { toPng } from 'html-to-image';
	import { Button, Icon } from '$lib/components';

	let cardEl: HTMLDivElement;
	let saving = $state(false);
	let saveMessage = $state('');

	async function saveImage() {
		if (saving) return;
		saving = true;
		saveMessage = '';
		try {
			const dataUrl = await toPng(cardEl, { pixelRatio: 2 });
			const res = await fetch(dataUrl);
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.download = `${tournament.title.replace(/\s+/g, '-').toLowerCase()}-result.png`;
			link.href = url;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
			saveMessage = '이미지가 저장되었습니다.';
		} catch (err) {
			console.error('이미지 저장 실패:', err);
			saveMessage = '이미지 저장에 실패했습니다.';
		} finally {
			saving = false;
		}
	}

	const tournament = {
		title: 'CHZZK STREAMER LEAGUE S3',
		subtitle: '치지직 스트리머 리그 시즌 3 · 모의 경매 결과',
		date: '2026.03.24',
		mode: 'AUCTION' as const
	};

	interface Player {
		name: string;
		position: string;
		price: string;
	}

	interface Team {
		captain: string;
		players: Player[];
		total: string;
	}

	const teams: Team[] = [
		{
			captain: '풍월량',
			players: [
				{ name: '감스트', position: 'SUP', price: '85만P' },
				{ name: '따효니', position: 'TOP', price: '62만P' },
				{ name: '침착맨', position: 'MID', price: '95만P' },
				{ name: '우왁굳', position: 'ADC', price: '78만P' }
			],
			total: '320만P'
		},
		{
			captain: '아규',
			players: [
				{ name: '릴파', position: 'SUP', price: '72만P' },
				{ name: '쿠쿠쿠', position: 'TOP', price: '45만P' },
				{ name: '고세구', position: 'MID', price: '68만P' },
				{ name: '비찬', position: 'ADC', price: '50만P' }
			],
			total: '235만P'
		},
		{
			captain: '녹두로',
			players: [
				{ name: '이춘향', position: 'SUP', price: '60만P' },
				{ name: '해루석', position: 'TOP', price: '55만P' },
				{ name: '소풍왔니', position: 'MID', price: '80만P' },
				{ name: '필요', position: 'ADC', price: '50만P' }
			],
			total: '245만P'
		},
		{
			captain: '건자칩',
			players: [
				{ name: '우주하마', position: 'SUP', price: '71만P' },
				{ name: '옥냥이', position: 'TOP', price: '72만P' },
				{ name: '도라민', position: 'MID', price: '48만P' },
				{ name: '카하야', position: 'ADC', price: '49만P' }
			],
			total: '240만P'
		},
		{
			captain: '뚱벅비짐',
			players: [
				{ name: '세구만', position: 'SUP', price: '65만P' },
				{ name: '김치', position: 'TOP', price: '70만P' },
				{ name: '사라후스', position: 'MID', price: '58만P' },
				{ name: '구카', position: 'ADC', price: '52만P' }
			],
			total: '245만P'
		}
	];
</script>

<svelte:head>
	<title>결과 | Fantazzk</title>
</svelte:head>

<main class="flex h-screen flex-col bg-bg-primary">
	<!-- Result Card (이미지 캡처 대상 영역) -->
	<div bind:this={cardEl} class="flex flex-1 flex-col overflow-hidden">
		<!-- Top Accent Bar -->
		<div class="h-[3px] w-full bg-accent"></div>

		<!-- Header -->
		<header class="flex flex-col items-center gap-2 px-8 pt-8 pb-4">
			<h1 class="font-heading text-4xl font-bold tracking-[2px] text-accent">
				{tournament.title}
			</h1>
			<p class="font-mono text-sm font-semibold tracking-wider text-muted">
				{tournament.subtitle}
			</p>
			<p class="font-mono text-sm text-subtle">
				{tournament.date}
			</p>
		</header>

		<!-- Divider -->
		<div class="mx-8 h-px bg-accent opacity-30"></div>

		<!-- Team Cards -->
		<section class="flex flex-1 overflow-hidden px-8 py-6">
			<ul class="flex flex-1 list-none gap-4">
				{#each teams as team, i (i)}
					<li class="flex flex-1">
						<article class="flex flex-1 flex-col border border-gray-700">
							<!-- Captain Header -->
							<div class="flex flex-col items-center gap-1 bg-accent px-4 py-4">
								<h2 class="font-heading text-xl font-bold text-bg-primary">
									{team.captain}
								</h2>
								<span
									class="font-mono text-[10px] font-semibold tracking-[2px] text-bg-primary opacity-50"
								>
									CAPTAIN
								</span>
							</div>

							<!-- Player List -->
							<ol class="flex flex-1 list-none flex-col gap-4 px-4 py-5">
								{#each team.players as player, pi (pi)}
									<li class="flex flex-col gap-1">
										<span class="font-mono text-base font-semibold text-gray-50">
											{String(pi + 1).padStart(2, '0')}&nbsp;&nbsp;{player.name}
										</span>
										<span class="font-mono text-sm text-muted">
											{player.position} · {player.price}
										</span>
									</li>
								{/each}
							</ol>

							<!-- Total Row -->
							<div
								class="flex items-center justify-between border-t border-gray-700 bg-bg-elevated px-4 py-3"
							>
								<span class="font-mono text-xs font-semibold tracking-wider text-subtle">
									TOTAL
								</span>
								<span class="font-mono text-base font-bold text-accent">
									{team.total}
								</span>
							</div>
						</article>
					</li>
				{/each}
			</ul>
		</section>

		<!-- Footer -->
		<footer class="flex flex-col items-center gap-1 pb-5">
			<span class="font-mono text-xs font-semibold tracking-[2px] text-dim"> FANTAZZK.GG </span>
			<span class="font-mono text-[10px] tracking-wider text-subtle">
				MOCK DRAFT & AUCTION PLATFORM
			</span>
		</footer>
	</div>

	<!-- Action Bar (캡처 영역 밖) -->
	<div class="flex items-center justify-center gap-4 border-t border-gray-700 px-8 py-5">
		<Button variant="SECONDARY" size="MD" onclick={saveImage} disabled={saving}>
			<span class="flex items-center gap-2">
				<Icon name="download" size={16} />
				{saving ? '저장 중…' : '이미지 저장'}
			</span>
		</Button>
		<Button variant="SECONDARY" size="MD" disabled>
			<span class="flex items-center gap-2">
				<Icon name="link" size={16} />
				링크 복사
			</span>
		</Button>
		<Button variant="PRIMARY" size="MD" disabled>다시 하기</Button>
	</div>

	<!-- 스크린리더 상태 알림 -->
	<div aria-live="polite" class="sr-only">{saveMessage}</div>
</main>
