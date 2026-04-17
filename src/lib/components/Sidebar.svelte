<script lang="ts">
	import { page } from '$app/stores';
	import Icon from './Icon.svelte';
	import SettingsModal from './SettingsModal.svelte';
	import { NAV_ITEMS, FOOTER_ITEM } from './nav-config';

	let settingsOpen = $state(false);

	function handleNavClick(item: (typeof NAV_ITEMS)[number]) {
		if (item.action === 'SETTINGS') {
			settingsOpen = true;
		}
	}
</script>

<aside class="flex h-full w-20 flex-col items-center justify-between bg-accent py-8">
	<div class="flex flex-col items-center gap-8">
		<!-- Logo -->
		<a href="/" aria-label="홈으로 이동">
			<img src="/favicon.svg" alt="Fantazzk" class="h-10 w-10" />
		</a>

		<!-- Navigation -->
		<nav class="flex flex-col gap-6" aria-label="메인 네비게이션">
			{#each NAV_ITEMS as item}
				{@const isActive = item.href ? $page.url.pathname.startsWith(item.href) : false}
				{#if item.disabled}
					<span
						class="flex h-12 w-12 items-center justify-center opacity-40"
						aria-label={item.label}
						title={item.label}
					>
						<Icon name={item.icon} color="#0A0A0A" />
					</span>
				{:else if item.href}
					<a
						href={item.href}
						class="flex h-12 w-12 items-center justify-center {isActive
							? 'rounded-sm bg-bg-primary/8'
							: ''}"
						aria-label={item.label}
						aria-current={isActive ? 'page' : undefined}
						title={item.label}
					>
						<Icon name={item.icon} color="#0A0A0A" />
					</a>
				{:else if item.action}
					<button
						type="button"
						class="flex h-12 w-12 items-center justify-center"
						aria-label={item.label}
						title={item.label}
						onclick={() => handleNavClick(item)}
					>
						<Icon name={item.icon} color="#0A0A0A" />
					</button>
				{/if}
			{/each}
		</nav>
	</div>

	<!-- Footer -->
	<div class="flex flex-col items-center">
		<span
			class="flex h-12 w-12 items-center justify-center opacity-40"
			aria-label={FOOTER_ITEM.label}
			title={FOOTER_ITEM.label}
		>
			<Icon name={FOOTER_ITEM.icon} color="#0A0A0A" />
		</span>
	</div>
</aside>

<SettingsModal bind:open={settingsOpen} onclose={() => (settingsOpen = false)} />
