<script lang="ts">
	import { resolveRange, type RangeMode } from '$lib/utils/range';

	interface Props {
		total: number;
		mode: RangeMode;
		firstN: number | null;
		from: number | null;
		to: number | null;
	}

	let {
		total,
		mode = $bindable('all'),
		firstN = $bindable(null),
		from = $bindable(null),
		to = $bindable(null)
	}: Props = $props();

	const resolved = $derived(resolveRange({ mode, total, firstN, from, to }));
</script>

<fieldset class="stack">
	<legend>Who should get this?</legend>

	<div class="options">
		<label class="check">
			<input type="radio" name="sendRange" value="all" bind:group={mode} /> All {total} contacts
		</label>
		<label class="check">
			<input type="radio" name="sendRange" value="first" bind:group={mode} /> Only the first…
		</label>
		<label class="check">
			<input type="radio" name="sendRange" value="range" bind:group={mode} /> A specific range
		</label>
	</div>

	{#if mode === 'first'}
		<label class="small" for="firstN">Number of contacts</label>
		<input
			id="firstN"
			class="input"
			type="number"
			min="1"
			max={total}
			placeholder={`e.g. ${Math.min(50, total || 50)}`}
			value={firstN ?? ''}
			oninput={(e) => (firstN = Number((e.currentTarget as HTMLInputElement).value) || null)}
		/>
	{:else if mode === 'range'}
		<div class="row">
			<div>
				<label class="small" for="rangeFrom">From</label>
				<input
					id="rangeFrom"
					class="input"
					type="number"
					min="1"
					max={total}
					value={from ?? 1}
					oninput={(e) => (from = Number((e.currentTarget as HTMLInputElement).value) || 1)}
				/>
			</div>
			<div>
				<label class="small" for="rangeTo">To</label>
				<input
					id="rangeTo"
					class="input"
					type="number"
					min="1"
					max={total}
					value={to ?? total}
					oninput={(e) => (to = Number((e.currentTarget as HTMLInputElement).value) || total)}
				/>
			</div>
		</div>
	{/if}

	<p class="notice">
		📧 Will send to <strong>{resolved.count}</strong> of {total} contacts.
		{#if resolved.warning}<br /><span class="muted small">⚠️ {resolved.warning}</span>{/if}
	</p>
</fieldset>

<style>
	fieldset {
		border: 0;
		padding: 0;
		margin: 0;
	}
	legend {
		font-weight: 600;
		padding: 0;
		margin-bottom: 0.5rem;
	}
	.options {
		display: grid;
		gap: 0.5rem;
	}
</style>
