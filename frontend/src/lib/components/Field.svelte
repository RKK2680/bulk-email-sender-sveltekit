<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		/** Must match the `id` of the control rendered inside. */
		id: string;
		error?: string;
		hint?: string;
		children: Snippet;
	}

	let { label, id, error, hint, children }: Props = $props();
</script>

<div class="field">
	<label for={id}>{label}</label>
	{@render children()}
	{#if hint && !error}<p class="hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}<p class="error" id="{id}-error" role="alert">{error}</p>{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.3rem;
	}
	label {
		font-weight: 600;
		font-size: 0.88rem;
	}
	.hint {
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.error {
		font-size: 0.8rem;
		color: var(--danger);
	}
</style>
