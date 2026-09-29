<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="auth-shell">
	<div class="panel">
		<div class="brand">
			<span class="logo" aria-hidden="true">✉️</span>
			<h1>Bulk Email Sender</h1>
		</div>
		{@render children()}
	</div>
</div>

<style>
	.auth-shell {
		min-height: 100vh;
		display: grid;
		place-items: center;
		padding: 1.5rem;
		background:
			radial-gradient(circle at top left, var(--primary-soft), transparent 55%), var(--bg);
	}
	.panel {
		width: min(400px, 100%);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		padding: 2rem;
		display: grid;
		gap: 1.5rem;
	}
	.brand {
		display: grid;
		justify-items: center;
		gap: 0.4rem;
		text-align: center;
	}
	.logo {
		font-size: 2rem;
	}
</style>
