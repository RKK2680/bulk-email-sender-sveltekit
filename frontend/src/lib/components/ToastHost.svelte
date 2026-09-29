<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';
</script>

<!-- role="status" makes screen readers announce new toasts politely. -->
<div class="host" role="status" aria-live="polite">
	{#each toast.items as item (item.id)}
		<div class="toast {item.kind}">
			<p>{item.message}</p>
			<button type="button" aria-label="Dismiss notification" onclick={() => toast.dismiss(item.id)}>
				×
			</button>
		</div>
	{/each}
</div>

<style>
	.host {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 1000;
		display: grid;
		gap: 0.6rem;
		width: min(380px, calc(100vw - 2rem));
	}
	.toast {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-left-width: 4px;
		box-shadow: 0 8px 24px rgb(0 0 0 / 18%);
	}
	p {
		white-space: pre-line;
		font-size: 0.9rem;
	}
	button {
		border: 0;
		background: transparent;
		color: var(--text-muted);
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
	}
	.success {
		border-left-color: var(--success);
	}
	.error {
		border-left-color: var(--danger);
	}
	.warning {
		border-left-color: var(--warning);
	}
	.info {
		border-left-color: var(--primary);
	}
</style>
