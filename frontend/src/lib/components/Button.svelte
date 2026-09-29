<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'danger';
		size?: 'md' | 'sm';
		/** Shows a spinner and disables the button while an action is in flight. */
		loading?: boolean;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		type = 'button',
		disabled,
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="btn btn-{variant}"
	class:btn-sm={size === 'sm'}
	disabled={disabled || loading}
	aria-busy={loading}
	{...rest}
>
	{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
	{@render children()}
</button>
