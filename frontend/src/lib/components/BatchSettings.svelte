<script lang="ts">
	interface Props {
		enabled: boolean;
		batchSize: number;
		batchDelay: number;
		emailDelay: number;
		/** Number of contacts the campaign will actually send to (post-range). */
		contactCount: number;
	}

	let {
		enabled = $bindable(false),
		batchSize = $bindable(20),
		batchDelay = $bindable(60),
		emailDelay = $bindable(45),
		contactCount
	}: Props = $props();

	const totalBatches = $derived(Math.max(1, Math.ceil(contactCount / Math.max(1, batchSize))));
	const totalHours = $derived(((totalBatches * batchDelay) / 60).toFixed(1));
</script>

<div class="stack">
	<label class="check">
		<input type="checkbox" bind:checked={enabled} />
		Send in batches (recommended for large lists, to avoid provider rate limits)
	</label>

	{#if enabled}
		<div class="grid-2">
			<label class="small" for="batchSize">
				Batch size
				<input id="batchSize" class="input" type="number" min="1" bind:value={batchSize} />
			</label>
			<label class="small" for="emailDelay">
				Seconds between emails
				<input id="emailDelay" class="input" type="number" min="0" bind:value={emailDelay} />
			</label>
			<label class="small" for="batchDelay">
				Minutes between batches
				<input id="batchDelay" class="input" type="number" min="0" bind:value={batchDelay} />
			</label>
		</div>

		<p class="notice">
			📊 <strong>{contactCount}</strong> contacts → <strong>{totalBatches}</strong> batches of {batchSize}.
			Total time ≈ <strong>{totalHours}h</strong> ({emailDelay}s between emails, {batchDelay}min between
			batches).
		</p>
	{/if}
</div>
