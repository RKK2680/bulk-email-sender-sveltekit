<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { register } from '$lib/api/auth';
	import { ApiError } from '$lib/api/client';
	import { registerSchema } from '$lib/schemas/auth';
	import { validate, type FieldErrors } from '$lib/utils/validate';
	import Field from '$lib/components/Field.svelte';
	import Button from '$lib/components/Button.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let errors = $state<FieldErrors>({});
	let formError = $state('');
	let submitting = $state(false);

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		const result = validate(registerSchema, { name, email, password });
		if (!result.ok) {
			errors = result.errors;
			return;
		}
		errors = {};
		submitting = true;
		try {
			await register(result.data);
			await invalidateAll();
			await goto('/compose');
		} catch (error) {
			formError = error instanceof ApiError ? error.message : 'Something went wrong. Try again.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Create account · Bulk Email Sender</title>
</svelte:head>

<form class="stack" onsubmit={onSubmit} novalidate>
	{#if formError}<p class="notice notice-danger" role="alert">{formError}</p>{/if}

	<Field id="name" label="Name" error={errors.name}>
		<input id="name" class="input" autocomplete="name" bind:value={name} aria-invalid={!!errors.name} />
	</Field>

	<Field id="email" label="Email" error={errors.email}>
		<input
			id="email"
			class="input"
			type="email"
			autocomplete="email"
			bind:value={email}
			aria-invalid={!!errors.email}
		/>
	</Field>

	<Field id="password" label="Password" error={errors.password} hint="At least 6 characters">
		<input
			id="password"
			class="input"
			type="password"
			autocomplete="new-password"
			bind:value={password}
			aria-invalid={!!errors.password}
		/>
	</Field>

	<Button type="submit" loading={submitting}>Create account</Button>

	<p class="small muted" style="text-align:center">
		Already have an account? <a href="/login">Log in</a>
	</p>
</form>
