<script lang="ts">
	interface Props {
		number?: string;
		userName: string;
		templateName: string;
		time: string;
	}

	let { number, userName, templateName, time }: Props = $props();
</script>

<div class="flex items-center justify-between border border-gray-700 px-4 py-3">
	<div class="flex items-center gap-3">
		{#if number}
			<span class="font-mono text-[13px] font-semibold text-dim">{number}</span>
		{/if}
		<span class="font-heading text-sm font-semibold text-gray-50">{userName}</span>
		<span class="font-mono text-xs text-muted">{templateName}</span>
	</div>
	<span class="font-mono text-[11px] text-dim">{time}</span>
</div>
