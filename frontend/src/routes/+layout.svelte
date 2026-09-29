<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import ToastHost from '$lib/components/ToastHost.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: 1, refetchOnWindowFocus: false }
		}
	});
</script>

<svelte:head>
	<title>Bulk Email Sender</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
	{@render children()}
	<ToastHost />
</QueryClientProvider>
