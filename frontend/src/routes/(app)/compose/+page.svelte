<script lang="ts">
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { configsQuery, keys } from '$lib/queries';
	import { sendCampaign } from '$lib/api/campaigns';
	import { ApiError } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import { resolveRange, type RangeMode } from '$lib/utils/range';
	import type { Contact } from '$lib/types';

	import Button from '$lib/components/Button.svelte';
	import RichTextEditor from '$lib/components/RichTextEditor.svelte';
	import ExcelUploader from '$lib/components/ExcelUploader.svelte';
	import RangeSelector from '$lib/components/RangeSelector.svelte';
	import BatchSettings from '$lib/components/BatchSettings.svelte';
	import ScheduleSettings from '$lib/components/ScheduleSettings.svelte';
	import EmailPreviewModal from '$lib/components/EmailPreviewModal.svelte';
	import CampaignDashboard from '$lib/components/CampaignDashboard.svelte';

	const qc = useQueryClient();
	const configs = createQuery(configsQuery);

	// --- form state -----------------------------------------------------
	let configId = $state('');
	$effect(() => {
		if (!configId && configs.data?.length) {
			configId = (configs.data.find((c) => c.isDefault) ?? configs.data[0]).id;
		}
	});

	let subject = $state('');
	let content = $state('');
	let htmlTemplateFile = $state<File | null>(null);

	let excelFile = $state<File | null>(null);
	let contacts = $state<Contact[]>([]);
	let totalContacts = $state(0);

	let rangeMode = $state<RangeMode>('all');
	let firstN = $state<number | null>(null);
	let rangeFrom = $state<number | null>(null);
	let rangeTo = $state<number | null>(null);
	const range = $derived(resolveRange({ mode: rangeMode, total: totalContacts, firstN, from: rangeFrom, to: rangeTo }));

	let useBatch = $state(false);
	let batchSize = $state(20);
	let batchDelay = $state(60);
	let emailDelay = $state(45);

	let scheduleEnabled = $state(false);
	let scheduledLocal = $state('');
	let notifyEmail = $state('');
	let notifyBrowser = $state(false);

	let previewOpen = $state(false);
	let submitting = $state(false);
	let formError = $state('');

	const isEmpty = (html: string) => !html || html.trim() === '' || html === '<p><br></p>';
	const canSubmit = $derived(
		!!configId && subject.trim() !== '' && totalContacts > 0 && (!isEmpty(content) || !!htmlTemplateFile)
	);

	function onHtmlTemplate(e: Event) {
		htmlTemplateFile = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
	}

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';

		if (!excelFile) {
			formError = 'Upload a contact file first.';
			return;
		}
		if (!configId) {
			formError = 'Choose an SMTP configuration.';
			return;
		}
		if (subject.trim() === '') {
			formError = 'Subject is required.';
			return;
		}
		if (isEmpty(content) && !htmlTemplateFile) {
			formError = 'Write some content, or upload an HTML template.';
			return;
		}
		if (scheduleEnabled && !scheduledLocal) {
			formError = 'Pick a date and time to schedule for.';
			return;
		}

		const form = new FormData();
		form.set('configId', configId);
		form.set('subject', subject);
		form.set('htmlContent', content);
		form.set('excelFile', excelFile);
		if (htmlTemplateFile) form.set('htmlTemplate', htmlTemplateFile);

		form.set('emailRangeStart', String(range.start));
		form.set('emailRangeCount', String(range.count));

		if (useBatch) {
			form.set('useBatch', 'on');
			form.set('batchSize', String(batchSize));
			form.set('batchDelay', String(batchDelay));
			form.set('emailDelay', String(emailDelay));
		}

		if (scheduleEnabled) {
			form.set('scheduleEmail', 'on');
			// datetime-local has no timezone; new Date() reads it as local time, and
			// toISOString() converts it to the UTC string the backend expects.
			form.set('scheduledTime', new Date(scheduledLocal).toISOString());
		}
		if (notifyEmail) form.set('notifyEmail', notifyEmail);
		if (notifyBrowser) form.set('notifyBrowser', 'on');

		submitting = true;
		try {
			const result = await sendCampaign(form);
			toast.success(result.message ?? 'Campaign started.');
			await qc.invalidateQueries({ queryKey: keys.batch });
			await qc.invalidateQueries({ queryKey: keys.scheduled });
			await qc.invalidateQueries({ queryKey: keys.pollStatus });

			if (notifyBrowser && 'Notification' in window && Notification.permission === 'granted') {
				new Notification('📅 Email campaign started', { body: result.message });
			}

			subject = '';
			content = '';
			htmlTemplateFile = null;
			excelFile = null;
			contacts = [];
			totalContacts = 0;
			rangeMode = 'all';
		} catch (error) {
			formError = error instanceof ApiError ? error.message : 'Could not send the campaign.';
		} finally {
			submitting = false;
		}
	}

	$effect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}
	});
</script>

<svelte:head>
	<title>Compose · Bulk Email Sender</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1>Compose campaign</h1>
	</div>

	<CampaignDashboard />

	<form class="stack" onsubmit={onSubmit} novalidate>
		{#if formError}<p class="notice notice-danger" role="alert">{formError}</p>{/if}

		<div class="card stack">
			<h2>1. Sender</h2>
			<label class="small" for="configId">SMTP configuration</label>
			{#if configs.data && configs.data.length === 0}
				<p class="notice notice-warning">
					You don't have an SMTP configuration yet. <a href="/configs">Add one</a> before sending.
				</p>
			{:else}
				<select id="configId" class="input" bind:value={configId}>
					{#each configs.data ?? [] as config (config.id)}
						<option value={config.id}>{config.name} ({config.host}){config.isDefault ? ' · default' : ''}</option>
					{/each}
				</select>
			{/if}
		</div>

		<div class="card stack">
			<div class="card-title">
				<h2>2. Content</h2>
				<Button variant="secondary" size="sm" type="button" onclick={() => (previewOpen = true)}>
					Preview
				</Button>
			</div>
			<label class="small" for="subject">Subject</label>
			<input id="subject" class="input" bind:value={subject} placeholder="e.g. Hi {'{{FirstName}}'}, quick question" />

			<label class="small" for="htmlTemplate">
				Body — write it below, or upload a ready-made HTML file instead
			</label>
			<input id="htmlTemplate" class="input" type="file" accept=".html,.htm" onchange={onHtmlTemplate} />
			{#if htmlTemplateFile}
				<p class="small muted">Using uploaded template: {htmlTemplateFile.name}</p>
			{:else}
				<RichTextEditor bind:value={content} />
			{/if}
		</div>

		<div class="card stack">
			<h2>3. Recipients</h2>
			<ExcelUploader bind:file={excelFile} bind:contacts bind:totalCount={totalContacts} />
			{#if totalContacts > 0}
				<RangeSelector total={totalContacts} bind:mode={rangeMode} bind:firstN bind:from={rangeFrom} bind:to={rangeTo} />
			{/if}
		</div>

		<div class="card stack">
			<h2>4. Sending options</h2>
			<BatchSettings bind:enabled={useBatch} bind:batchSize bind:batchDelay bind:emailDelay contactCount={range.count} />
			<hr />
			<ScheduleSettings
				bind:scheduleEnabled
				bind:localDateTime={scheduledLocal}
				bind:notifyEmail
				bind:notifyBrowser
			/>
		</div>

		<Button type="submit" loading={submitting} disabled={!canSubmit}>
			{scheduleEnabled ? 'Schedule campaign' : 'Send campaign'}
		</Button>
	</form>
</div>

<EmailPreviewModal bind:open={previewOpen} {subject} {content} sampleContact={contacts[0]} />

<style>
	hr {
		border: 0;
		border-top: 1px solid var(--border);
		width: 100%;
	}
</style>
