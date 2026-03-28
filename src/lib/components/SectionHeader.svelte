<script lang="ts">
	interface Props {
		title: string;
		actionText?: string;
		actionHref?: string;
	}

	let { title, actionText, actionHref }: Props = $props();
</script>

<div class="flex w-full items-center justify-between">
	<h2 class="font-heading text-2xl font-semibold tracking-wider text-gray-50">
		{title}
	</h2>
	{#if actionText}
		{#if actionHref}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is passed from outside -->
			<a href={actionHref} class="font-mono text-xs font-semibold tracking-wider text-accent">
				{actionText}
			</a>
		{:else}
			<span class="font-mono text-xs font-semibold tracking-wider text-accent">
				{actionText}
			</span>
		{/if}
	{/if}
</div>
