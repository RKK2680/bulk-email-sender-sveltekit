<script lang="ts">
	import { toDateTimeLocal } from '$lib/utils/format';
	import { testNotification } from '$lib/api/campaigns';
	import { ApiError } from '$lib/api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import Button from './Button.svelte';

	interface Props {
		scheduleEnabled: boolean;
		/** value of a <input type="datetime-local">, interpreted in the browser's own timezone. */
		localDateTime: string;
		notifyEmail: string;
		notifyBrowser: boolean;
	}

	let {
		scheduleEnabled = $bindable(false),
		localDateTime = $bindable(''),
		notifyEmail = $bindable(''),
		notifyBrowser = $bindable(false)
	}: Props = $props();

	const min = toDateTimeLocal(new Date(Date.now() + 5 * 60_000));
	let testing = $state(false);

	async function sendTest() {
		if (!notifyEmail) {
			toast.warning('Enter an email address first.');
			return;
		}
		testing = true;
		try {
			await testNotification(notifyEmail);
			toast.success('Test notification sent — check your inbox.');
		} catch (error) {
			toast.error(error instanceof ApiError ? error.message : 'Could not send the test email.');
		} finally {
			testing = false;
		}
	}
</script>

<div class="stack">
	<label class="check">
		<input type="checkbox" bind:checked={scheduleEnabled} />
		Schedule this campaign for later
	</label>

	{#if scheduleEnabled}
		<label class="small" for="scheduledTime">
			Send at (your local time)
			<input id="scheduledTime" class="input" type="datetime-local" {min} bind:value={localDateTime} />
		</label>
	{/if}

	<label class="small" for="notifyEmail">
		Notify this email when the campaign finishes (optional)
		<div class="row">
			<input
				id="notifyEmail"
				class="input"
				type="email"
				placeholder="you@example.com"
				bind:value={notifyEmail}
			/>
			<Button variant="secondary" size="sm" loading={testing} onclick={sendTest}>Send test</Button>
		</div>
	</label>

	<label class="check">
		<input type="checkbox" bind:checked={notifyBrowser} />
		Also show a browser notification when it finishes
	</label>
</div>
