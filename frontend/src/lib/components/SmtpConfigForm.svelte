<script lang="ts">
	import { smtpConfigSchema } from '$lib/schemas/config';
	import { validate, type FieldErrors } from '$lib/utils/validate';
	import { normalizePassword, providerHelp } from '$lib/utils/smtp';
	import { createConfig, updateConfig, testConfig } from '$lib/api/configs';
	import { ApiError } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import type { SmtpConfig } from '$lib/types';
	import Field from './Field.svelte';
	import Button from './Button.svelte';

	interface Props {
		editing?: SmtpConfig | null;
		onSaved: () => void;
		onCancel: () => void;
	}

	let { editing = null, onSaved, onCancel }: Props = $props();
	const isEdit = !!editing;

	let name = $state(editing?.name ?? '');
	let host = $state(editing?.host ?? '');
	let port = $state(editing?.port ?? 587);
	let secure = $state(editing?.secure ?? false);
	let user = $state(editing?.user ?? '');
	let pass = $state('');
	let fromEmail = $state(editing?.fromEmail ?? '');
	let fromName = $state(editing?.fromName ?? '');
	let isDefault = $state(editing?.isDefault ?? false);

	let errors = $state<FieldErrors>({});
	let formError = $state('');
	let saving = $state(false);
	let testing = $state(false);

	const help = $derived(providerHelp(host));

	function currentInput() {
		return { name, host, port, secure, user, pass, fromEmail, fromName, isDefault };
	}

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		const result = validate(smtpConfigSchema(!isEdit), currentInput());
		if (!result.ok) {
			errors = result.errors;
			return;
		}
		errors = {};
		saving = true;
		try {
			const payload = { ...result.data, pass: result.data.pass ? normalizePassword(result.data.pass, host) : '' };
			if (isEdit && !payload.pass) {
				// Blank password on edit means "keep the existing one".
				const { pass: _unused, ...withoutPassword } = payload;
				void _unused;
				await updateConfig(editing!.id, withoutPassword);
			} else if (isEdit) {
				await updateConfig(editing!.id, payload);
			} else {
				await createConfig(payload);
			}
			toast.success(isEdit ? 'Configuration updated.' : 'Configuration added.');
			onSaved();
		} catch (error) {
			formError = error instanceof ApiError ? error.message : 'Could not save this configuration.';
		} finally {
			saving = false;
		}
	}

	async function onTest() {
		if (!host || !user || (!pass && !isEdit)) {
			toast.warning('Fill in host, username and password first.');
			return;
		}
		testing = true;
		try {
			const res = await testConfig({ host, port, secure, user, pass: normalizePassword(pass, host) });
			toast[res.success ? 'success' : 'error'](res.message ?? (res.success ? 'Connection OK.' : 'Connection failed.'));
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Connection test failed.');
		} finally {
			testing = false;
		}
	}
</script>

<form class="stack" onsubmit={onSubmit} novalidate>
	{#if formError}<p class="notice notice-danger" role="alert">{formError}</p>{/if}

	<Field id="cfgName" label="Configuration name" error={errors.name}>
		<input id="cfgName" class="input" bind:value={name} placeholder="e.g. Work Gmail" />
	</Field>

	<div class="grid-2">
		<Field id="cfgHost" label="SMTP host" error={errors.host}>
			<input id="cfgHost" class="input" bind:value={host} placeholder="smtp.gmail.com" />
		</Field>
		<Field id="cfgPort" label="Port" error={errors.port}>
			<input id="cfgPort" class="input" type="number" bind:value={port} />
		</Field>
	</div>

	<label class="check">
		<input type="checkbox" bind:checked={secure} /> Use SSL (usually port 465; leave off for STARTTLS on 587)
	</label>

	{#if help}
		<div class="notice">
			<strong>{help.name} setup:</strong>
			<ul>
				{#each help.steps as step (step)}<li>{step}</li>{/each}
			</ul>
			{#if help.link}<a href={help.link.href} target="_blank" rel="noreferrer">{help.link.label}</a>{/if}
		</div>
	{/if}

	<Field id="cfgUser" label="SMTP username" error={errors.user}>
		<input id="cfgUser" class="input" bind:value={user} placeholder="you@example.com" />
	</Field>

	<Field
		id="cfgPass"
		label={isEdit ? 'Password (leave blank to keep current)' : 'Password'}
		error={errors.pass}
	>
		<input id="cfgPass" class="input" type="password" bind:value={pass} autocomplete="new-password" />
	</Field>

	<div class="grid-2">
		<Field id="cfgFromEmail" label="From email" error={errors.fromEmail}>
			<input id="cfgFromEmail" class="input" type="email" bind:value={fromEmail} />
		</Field>
		<Field id="cfgFromName" label="From name" error={errors.fromName}>
			<input id="cfgFromName" class="input" bind:value={fromName} />
		</Field>
	</div>

	<label class="check">
		<input type="checkbox" bind:checked={isDefault} /> Make this the default configuration
	</label>

	<div class="row" style="justify-content: flex-end">
		<Button variant="secondary" type="button" onclick={onCancel}>Cancel</Button>
		<Button variant="secondary" type="button" loading={testing} onclick={onTest}>Test connection</Button>
		<Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Add configuration'}</Button>
	</div>
</form>
