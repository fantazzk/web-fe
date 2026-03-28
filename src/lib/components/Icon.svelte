<script lang="ts">
	type IconName = 'layout-grid' | 'file-text' | 'trending-up' | 'users' | 'settings';

	interface Props {
		name: IconName;
		size?: number;
		color?: string;
		label?: string;
	}

	let { name, size = 20, color = 'currentColor', label }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke={color}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden={!label}
	role={label ? 'img' : undefined}
	aria-label={label}
>
	{#if name === 'layout-grid'}
		<rect width="7" height="7" x="3" y="3" rx="1" />
		<rect width="7" height="7" x="14" y="3" rx="1" />
		<rect width="7" height="7" x="14" y="14" rx="1" />
		<rect width="7" height="7" x="3" y="14" rx="1" />
	{:else if name === 'file-text'}
		<path
			d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
		/>
		<path d="M14 2v5a1 1 0 0 0 1 1h5" />
		<path d="M10 9H8" />
		<path d="M16 13H8" />
		<path d="M16 17H8" />
	{:else if name === 'trending-up'}
		<path d="M16 7h6v6" />
		<path d="m22 7-8.5 8.5-5-5L2 17" />
	{:else if name === 'users'}
		<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
		<path d="M16 3.128a4 4 0 0 1 0 7.744" />
		<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
		<circle cx="9" cy="7" r="4" />
	{:else if name === 'settings'}
		<path
			d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
		/>
		<circle cx="12" cy="12" r="3" />
	{/if}
</svg>
