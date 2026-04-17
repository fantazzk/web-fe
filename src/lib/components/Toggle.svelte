<script lang="ts">
	interface Props {
		checked: boolean;
		onchange?: (checked: boolean) => void;
		label: string;
	}

	let { checked = $bindable(), onchange, label }: Props = $props();

	function toggle() {
		checked = !checked;
		onchange?.(checked);
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={checked}
	aria-label={label}
	onclick={toggle}
	class="flex h-6 w-10 items-center rounded-full px-0.5 {checked ? 'bg-accent' : 'bg-gray-700'}"
>
	<div class="h-5 w-5 rounded-full bg-bg-primary {checked ? 'ml-auto' : ''}"></div>
</button>
