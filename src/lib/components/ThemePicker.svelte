<script lang="ts">
	import { browser } from '$app/environment';

	let currentTheme = $state(
		browser ? (document.documentElement.dataset['theme'] ?? 'gold') : 'gold'
	);

	const themes = [
		{ name: 'gold', color: '#c9a962' },
		{ name: 'pink', color: '#ec4899' },
		{ name: 'cyan', color: '#06b6d4' },
		{ name: 'magenta', color: '#d946ef' },
		{ name: 'orange', color: '#f97316' }
	] as const;

	function select(name: string) {
		currentTheme = name;
		document.documentElement.dataset['theme'] = name;
	}
</script>

<div class="flex gap-2" role="radiogroup" aria-label="테마 선택">
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
