<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { login } from '$lib/api/auth';
	import { ApiError } from '$lib/api/client';
	import { loginSchema } from '$lib/schemas/auth';
	import { validate, type FieldErrors } from '$lib/utils/validate';
	import Field from '$lib/components/Field.svelte';
	import Button from '$lib/components/Button.svelte';

	let email = $state('');
	let password = $state('');
	let errors = $state<FieldErrors>({});
	let formError = $state('');
	let submitting = $state(false);

	async function onSubmit(event: SubmitEvent) {
		event.preventDefault();
		formError = '';
		const result = validate(loginSchema, { email, password });
		if (!result.ok) {
			errors = result.errors;
			return;
		}
		errors = {};
		submitting = true;
		try {
			await login(result.data);
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
	<title>Log in · Bulk Email Sender</title>
</svelte:head>

<form class="stack" onsubmit={onSubmit} novalidate>
	{#if formError}<p class="notice notice-danger" role="alert">{formError}</p>{/if}

	<Field id="email" label="Email" error={errors.email}>
		<input
			id="email"
			class="input"
			type="email"
			autocomplete="email"
			bind:value={email}
			aria-invalid={!!errors.email}
			aria-describedby={errors.email ? 'email-error' : undefined}
		/>
	</Field>

	<Field id="password" label="Password" error={errors.password}>
		<input
			id="password"
			class="input"
			type="password"
			autocomplete="current-password"
			bind:value={password}
			aria-invalid={!!errors.password}
			aria-describedby={errors.password ? 'password-error' : undefined}
		/>
	</Field>

	<Button type="submit" loading={submitting}>Log in</Button>

	<p class="small muted" style="text-align:center">
		New here? <a href="/register">Create an account</a>
	</p>
</form>
