<script lang="ts">
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { pollStatusQuery, followPolling, reportQuery, keys } from '$lib/queries';
	import { clearReport, exportUrl } from '$lib/api/reports';
	import { ApiError } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { formatDateTime } from '$lib/utils/format';
	import StatCard from '$lib/components/StatCard.svelte';
	import Button from '$lib/components/Button.svelte';

	const qc = useQueryClient();
	const poll = createQuery(pollStatusQuery);
	const interval = $derived(followPolling(poll.data));
	const report = createQuery(() => reportQuery(interval));

	let clearing = $state(false);

	async function onClear() {
		if (!confirm('Clear all email logs? This cannot be undone.')) return;
		clearing = true;
		try {
			await clearReport();
			await qc.invalidateQueries({ queryKey: keys.report });
			toast.success('Report cleared.');
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Could not clear the report.');
		} finally {
			clearing = false;
		}
	}

	const statusTone = (status: string) =>
		status === 'Sent' ? 'badge-success' : status === 'Failed' ? 'badge-danger' : 'badge-warning';
</script>

<svelte:head>
	<title>Report · Bulk Email Sender</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1>Send report</h1>
		<div class="row">
			<a class="btn btn-secondary btn-sm" href={exportUrl('csv')}>Export CSV</a>
			<a class="btn btn-secondary btn-sm" href={exportUrl('json')}>Export JSON</a>
			<Button variant="danger" size="sm" loading={clearing} onclick={onClear}>Clear logs</Button>
		</div>
	</div>

	{#if report.isLoading}
		<p class="muted">Loading…</p>
	{:else if report.isError}
		<p class="notice notice-danger">Could not load the report.</p>
	{:else if report.data}
		<div class="grid-2" style="grid-template-columns: repeat(4, 1fr)">
			<StatCard label="Total emails" value={report.data.stats.total} />
			<StatCard label="Sent successfully" value={report.data.stats.sent} tone="success" />
			<StatCard label="Failed" value={report.data.stats.failed} tone="danger" />
			<StatCard label="Errors" value={report.data.stats.errors} tone="warning" />
		</div>

		{#if report.data.logs.length === 0}
			<div class="card empty">
				<p>No email logs yet.</p>
				<p class="small muted">Send a campaign from the Compose tab and it will show up here.</p>
			</div>
		{:else}
			<div class="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Email</th>
							<th>Status</th>
							<th>First name</th>
							<th>Company</th>
							<th>Subject</th>
							<th>Time</th>
							<th>Message ID</th>
							<th>Message</th>
						</tr>
					</thead>
					<tbody>
						{#each report.data.logs as log (log.id)}
							<tr>
								<td>{log.email}</td>
								<td><span class="badge {statusTone(log.status)}">{log.status}</span></td>
								<td>{log.firstName ?? '-'}</td>
								<td>{log.company ?? '-'}</td>
								<td>{log.subject ?? '-'}</td>
								<td>{formatDateTime(log.timestamp)}</td>
								<td>{log.messageId ?? '-'}</td>
								<td>{log.message ?? '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
