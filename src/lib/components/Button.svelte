<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'PRIMARY' | 'SECONDARY' | 'GHOST';
	type Size = 'SM' | 'MD';

	interface Props {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		href?: string;
		children: Snippet;
	}

	let {
		variant = 'PRIMARY',
		size = 'MD',
		disabled = false,
		href,
		children,
		...rest
	}: Props & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, keyof Props> = $props();

	const base =
		'font-mono text-xs font-semibold tracking-wider inline-flex items-center justify-center';

	const variants: Record<Variant, string> = {
		PRIMARY: 'bg-accent text-bg-primary',
		SECONDARY: 'border border-gray-700 text-gray-50',
		GHOST: 'text-muted'
	};

	const sizes: Record<Size, string> = {
		SM: 'h-9 px-4',
		MD: 'h-11 px-6'
	};

	const classes = $derived(
		`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`
	);
</script>

{#if href && !disabled}
	<a {href} class={classes} {...rest}>
		{@render children()}
	</a>
{:else}
	<button {disabled} class={classes} {...rest}>
		{@render children()}
	</button>
{/if}
