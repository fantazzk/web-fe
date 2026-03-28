<script lang="ts">
	interface Props {
		userName: string;
		templateName: string;
		time: string;
	}

	let { userName, templateName, time }: Props = $props();
</script>

<div class="flex items-center justify-between border border-gray-700 px-4 py-3">
	<div class="flex items-center gap-3">
		<div class="h-8 w-8 rounded-full bg-gray-700"></div>
		<div class="flex flex-col">
			<span class="font-mono text-xs font-semibold text-gray-50">{userName}</span>
			<span class="font-mono text-[11px] text-muted">{templateName}</span>
		</div>
	</div>
	<span class="font-mono text-[11px] text-subtle">{time}</span>
</div>
