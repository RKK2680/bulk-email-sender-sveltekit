<script lang="ts">
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { configsQuery, keys } from '$lib/queries';
	import { deleteConfig, setDefaultConfig } from '$lib/api/configs';
	import { ApiError } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SmtpConfig } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import SmtpConfigForm from '$lib/components/SmtpConfigForm.svelte';

	const qc = useQueryClient();
	const configs = createQuery(configsQuery);

	let modalOpen = $state(false);
	let editing = $state<SmtpConfig | null>(null);
	let busyId = $state<string | null>(null);

	function openCreate() {
		editing = null;
		modalOpen = true;
	}
	function openEdit(config: SmtpConfig) {
		editing = config;
		modalOpen = true;
	}
	async function refresh() {
		modalOpen = false;
		await qc.invalidateQueries({ queryKey: keys.configs });
	}

	async function onDelete(config: SmtpConfig) {
		if (!confirm(`Delete "${config.name}"? This can't be undone.`)) return;
		busyId = config.id;
		try {
			await deleteConfig(config.id);
			await qc.invalidateQueries({ queryKey: keys.configs });
			toast.success('Configuration deleted.');
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Could not delete this configuration.');
		} finally {
			busyId = null;
		}
	}

	async function onSetDefault(config: SmtpConfig) {
		busyId = config.id;
		try {
			await setDefaultConfig(config.id);
			await qc.invalidateQueries({ queryKey: keys.configs });
			toast.success(`"${config.name}" is now the default.`);
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Could not set the default.');
		} finally {
			busyId = null;
		}
	}
</script>

<svelte:head>
	<title>SMTP Configs · Bulk Email Sender</title>
</svelte:head>

<div class="page">
	<div class="page-header">
		<h1>SMTP configurations</h1>
		<Button onclick={openCreate}>+ Add configuration</Button>
	</div>

	{#if configs.isLoading}
		<p class="muted">Loading…</p>
	{:else if configs.isError}
		<p class="notice notice-danger">Could not load your configurations.</p>
	{:else if configs.data && configs.data.length === 0}
		<div class="card empty">
			<p>No SMTP configurations yet.</p>
			<p class="small muted">Add one to start sending campaigns — Gmail, Outlook or your own server.</p>
			<Button onclick={openCreate}>+ Add configuration</Button>
		</div>
	{:else}
		<div class="grid-2">
			{#each configs.data ?? [] as config (config.id)}
				<div class="card">
					<div class="card-title">
						<h2>{config.name}</h2>
						{#if config.isDefault}<span class="badge badge-primary">Default</span>{/if}
					</div>
					<p class="small muted">
						{config.host}:{config.port} {config.secure ? '(SSL)' : '(STARTTLS)'}<br />
						{config.user}<br />
						From: {config.fromName ? `${config.fromName} ` : ''}&lt;{config.fromEmail}&gt;
					</p>
					<div class="row">
						<Button variant="secondary" size="sm" onclick={() => openEdit(config)}>Edit</Button>
						{#if !config.isDefault}
							<Button
								variant="secondary"
								size="sm"
								loading={busyId === config.id}
								onclick={() => onSetDefault(config)}
							>
								Set default
							</Button>
						{/if}
						<Button
							variant="danger"
							size="sm"
							loading={busyId === config.id}
							onclick={() => onDelete(config)}
						>
							Delete
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Modal bind:open={modalOpen} title={editing ? 'Edit configuration' : 'Add SMTP configuration'} wide>
	<!-- Keyed so the form's internal state resets whenever a different config (or "new") is opened. -->
	{#key editing?.id ?? 'new'}
		<SmtpConfigForm {editing} onSaved={refresh} onCancel={() => (modalOpen = false)} />
	{/key}
</Modal>
