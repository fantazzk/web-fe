<script lang="ts">
	import Icon from './Icon.svelte';

	const themes = [
		{ name: 'gold', color: '#c9a962' },
		{ name: 'pink', color: '#ec4899' },
		{ name: 'cyan', color: '#06b6d4' },
		{ name: 'magenta', color: '#d946ef' },
		{ name: 'orange', color: '#f97316' }
	] as const;

	let currentTheme = $state('gold');
	let open = $state(false);

	function select(name: string) {
		currentTheme = name;
		document.documentElement.dataset['theme'] = name;
		open = false;
	}
</script>

<div class="relative">
	<button
		class="flex h-12 w-12 items-center justify-center"
		aria-label="테마 변경"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<Icon name="palette" color="#0A0A0A" />
	</button>
	{#if open}
		<div
			class="absolute bottom-0 left-16 flex gap-2 rounded-md border border-gray-700 bg-bg-elevated p-3 shadow-lg"
			role="radiogroup"
			aria-label="테마 선택"
		>
			{#each themes as t, i (i)}
				<button
					class="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 {currentTheme ===
					t.name
						? 'scale-110 border-gray-50'
						: 'border-transparent'}"
					style:background-color={t.color}
					aria-label="{t.name} 테마"
					role="radio"
					aria-checked={currentTheme === t.name}
					onclick={() => select(t.name)}
				></button>
			{/each}
		</div>
	{/if}
</div>
