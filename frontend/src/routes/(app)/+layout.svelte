<script lang="ts">
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { logout } from '$lib/api/auth';
	import { toast } from '$lib/stores/toast.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const tabs = [
		{ href: '/compose', label: 'Compose' },
		{ href: '/configs', label: 'SMTP Configs' },
		{ href: '/reports', label: 'Report' }
	];

	let loggingOut = $state(false);

	async function onLogout() {
		loggingOut = true;
		try {
			await logout();
		} catch {
			// Even if the backend call fails, clearing local state and redirecting is safe.
		} finally {
			await invalidateAll();
			await goto('/login');
			toast.info('Signed out.');
		}
	}
</script>

<div class="shell">
	<header class="topbar">
		<div class="topbar-inner">
			<a class="brand" href="/compose">✉️ Bulk Email Sender</a>
			<nav aria-label="Main">
				{#each tabs as tab (tab.href)}
					<a href={tab.href} aria-current={page.url.pathname.startsWith(tab.href) ? 'page' : undefined}>
						{tab.label}
					</a>
				{/each}
			</nav>
			<div class="user">
				<span class="small muted">{data.user.name}</span>
				<button type="button" class="btn btn-secondary btn-sm" onclick={onLogout} disabled={loggingOut}>
					Log out
				</button>
			</div>
		</div>
	</header>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.shell {
		min-height: 100vh;
	}
	.topbar {
		position: sticky;
		top: 0;
		z-index: 10;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.topbar-inner {
		max-width: 1080px;
		margin: 0 auto;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}
	.brand {
		font-weight: 700;
		text-decoration: none;
		color: var(--text);
		white-space: nowrap;
	}
	nav {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
		flex: 1;
	}
	nav a {
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
		text-decoration: none;
		color: var(--text-muted);
		font-weight: 600;
		font-size: 0.9rem;
	}
	nav a[aria-current='page'] {
		background: var(--primary-soft);
		color: var(--primary);
	}
	.user {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
</style>
