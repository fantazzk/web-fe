<script lang="ts">
	import Icon from './Icon.svelte';
	import ThemePicker from './ThemePicker.svelte';

	interface Props {
		open: boolean;
		onclose: () => void;
	}

	let { open, onclose }: Props = $props();

	let dialogEl: HTMLDivElement | undefined = $state();
	let closeButtonEl: HTMLButtonElement | undefined = $state();

	$effect(() => {
		if (open && closeButtonEl) {
			closeButtonEl.focus();
		}
	});

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onclose();
			return;
		}

		if (e.key === 'Tab' && dialogEl) {
			const focusable = Array.from(
				dialogEl.querySelectorAll<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				)
			).filter((el) => !el.hasAttribute('disabled'));

			if (focusable.length === 0) return;

			const first = focusable[0]!;
			const last = focusable[focusable.length - 1]!;

			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
		role="dialog"
		aria-modal="true"
		aria-label="설정"
		tabindex="-1"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div bind:this={dialogEl} class="w-[400px] border border-gray-700 bg-bg-primary p-6">
			<!-- Header -->
			<div class="flex items-center justify-between">
				<h2 class="font-heading text-xl font-bold tracking-wider text-gray-50">설정</h2>
				<button
					bind:this={closeButtonEl}
					type="button"
					class="flex items-center justify-center text-muted hover:text-gray-50"
					aria-label="닫기"
					onclick={onclose}
				>
					<Icon name="close" size={18} />
				</button>
			</div>

			<!-- Language -->
			<div class="mt-6 flex flex-col gap-2" role="group" aria-label="언어 설정">
				<span class="font-mono text-xs font-semibold tracking-[2px] text-muted" aria-hidden="true"
					>언어</span
				>
				<div
					class="flex h-10 items-center border border-gray-700 px-4 font-mono text-sm text-subtle opacity-60"
				>
					한국어
				</div>
			</div>

			<!-- Theme -->
			<div class="mt-6 flex flex-col gap-2">
				<span class="font-mono text-xs font-semibold tracking-[2px] text-muted">테마</span>
				<ThemePicker />
			</div>
		</div>
	</div>
{/if}
