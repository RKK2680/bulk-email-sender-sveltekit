<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		children: Snippet;
		footer?: Snippet;
		wide?: boolean;
	}

	let { open = $bindable(), title, children, footer, wide = false }: Props = $props();

	let dialog: HTMLDialogElement;
	const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

	// The native <dialog> gives us focus trapping, Escape-to-close and aria-modal for free.
	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<!-- Clicking the backdrop (the dialog element itself) closes it; Escape is handled natively. -->
<dialog
	bind:this={dialog}
	class:wide
	aria-labelledby={titleId}
	onclose={() => (open = false)}
	onclick={(event) => event.target === dialog && (open = false)}
>
	<div class="content">
		<header>
			<h2 id={titleId}>{title}</h2>
			<button class="close" type="button" aria-label="Close dialog" onclick={() => (open = false)}>
				×
			</button>
		</header>
		<div class="body">{@render children()}</div>
		{#if footer}<footer>{@render footer()}</footer>{/if}
	</div>
</dialog>

<style>
	dialog {
		width: min(520px, calc(100vw - 2rem));
		max-height: calc(100vh - 2rem);
		padding: 0;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		box-shadow: 0 20px 50px rgb(0 0 0 / 25%);
	}
	dialog.wide {
		width: min(760px, calc(100vw - 2rem));
	}
	dialog::backdrop {
		background: rgb(10 14 30 / 55%);
	}
	.content {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.close {
		border: 0;
		background: transparent;
		color: var(--text-muted);
		font-size: 1.6rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.25rem;
	}
	.body {
		overflow-y: auto;
		max-height: 60vh;
	}
	footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
</style>
