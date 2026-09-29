<script lang="ts">
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { pollStatusQuery, followPolling, batchQuery, scheduledQuery, keys } from '$lib/queries';
	import { pauseBatch, resumeBatch, cancelBatch, cancelScheduledJob } from '$lib/api/campaigns';
	import { ApiError } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { formatCountdown, formatDateTime } from '$lib/utils/format';
	import Button from './Button.svelte';

	const qc = useQueryClient();
	const poll = createQuery(pollStatusQuery);
	const interval = $derived(followPolling(poll.data));

	const batch = createQuery(() => batchQuery(interval));
	const scheduled = createQuery(() => scheduledQuery(interval));

	let acting = $state(false);
	let now = $state(Date.now());
	$effect(() => {
		const id = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(id);
	});

	async function act(fn: () => Promise<unknown>) {
		acting = true;
		try {
			await fn();
			await qc.invalidateQueries({ queryKey: keys.batch });
			await qc.invalidateQueries({ queryKey: keys.pollStatus });
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'That action failed.');
		} finally {
			acting = false;
		}
	}

	async function onCancelScheduled(id: string) {
		acting = true;
		try {
			await cancelScheduledJob(id);
			await qc.invalidateQueries({ queryKey: keys.scheduled });
			toast.success('Scheduled campaign cancelled.');
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Could not cancel that job.');
		} finally {
			acting = false;
		}
	}

	const job = $derived(batch.data?.currentJob ?? null);
	const progressPct = $derived(
		job ? Math.min(100, ((job.emailsSent + job.emailsFailed) / Math.max(1, job.totalContacts)) * 100) : 0
	);
	const countdown = $derived(job?.nextBatchTime ? formatCountdown(job.nextBatchTime, now) : null);
</script>

{#if job}
	<div class="card">
		<div class="card-title">
			<h2>Active campaign</h2>
			<span class="badge {job.status === 'Paused' ? 'badge-warning' : 'badge-primary'}">{job.status}</span>
		</div>

		<div class="progress"><div style="width:{progressPct}%"></div></div>
		<div class="grid-2 small">
			<p>Progress: <strong>{job.emailsSent + job.emailsFailed}/{job.totalContacts}</strong> ({progressPct.toFixed(1)}%)</p>
			<p>Batch: <strong>{job.currentBatch}/{job.totalBatches}</strong></p>
			<p>✅ Sent: <strong>{job.emailsSent}</strong></p>
			<p>❌ Failed: <strong>{job.emailsFailed}</strong></p>
		</div>

		{#if countdown}
			<p class="notice notice-warning">⏱️ Next batch in <strong>{countdown}</strong></p>
		{/if}

		<p class="small muted">
			Sending {job.config.batchSize} emails with {job.config.emailDelay}s between each; waiting
			{job.config.batchDelay}min between batches.
		</p>

		<div class="row">
			{#if job.status === 'Paused'}
				<Button size="sm" loading={acting} onclick={() => act(resumeBatch)}>Resume</Button>
			{:else}
				<Button size="sm" variant="secondary" loading={acting} onclick={() => act(pauseBatch)}>Pause</Button>
			{/if}
			<Button size="sm" variant="danger" loading={acting} onclick={() => act(cancelBatch)}>Cancel</Button>
		</div>
	</div>
{/if}

{#if scheduled.data && scheduled.data.length > 0}
	<div class="card">
		<h2>Scheduled campaigns</h2>
		<ul class="stack scheduled-list">
			{#each scheduled.data as job (job.id)}
				<li class="row" style="justify-content: space-between">
					<div>
						<strong>{job.subject || 'Bulk email'}</strong>
						<span class="badge {job.status === 'running' ? 'badge-primary' : 'badge-warning'}">
							{job.status}
						</span>
						<p class="small muted">
							📊 {job.contact_count} contacts {job.use_batch ? '(batch mode)' : ''} · 📅
							{formatDateTime(job.scheduled_time)}
							{#if job.notify_email}· 📧 {job.notify_email}{/if}
						</p>
					</div>
					<Button
						size="sm"
						variant="danger"
						disabled={job.status === 'running' || acting}
						onclick={() => onCancelScheduled(job.id)}
					>
						Cancel
					</Button>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.scheduled-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.scheduled-list li {
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.75rem;
	}
	.scheduled-list li:last-child {
		border-bottom: 0;
		padding-bottom: 0;
	}
</style>
