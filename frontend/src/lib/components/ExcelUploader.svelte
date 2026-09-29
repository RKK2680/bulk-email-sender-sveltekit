<script lang="ts">
	import { parseExcel } from '$lib/api/campaigns';
	import { ApiError } from '$lib/api/client';
	import type { Contact } from '$lib/types';

	interface Props {
		file: File | null;
		contacts: Contact[];
		totalCount: number;
	}

	let { file = $bindable(), contacts = $bindable(), totalCount = $bindable() }: Props = $props();

	let loading = $state(false);
	let error = $state('');
	let dragOver = $state(false);
	let input: HTMLInputElement;

	const columns = $derived(contacts.length ? Object.keys(contacts[0]) : []);

	async function handleFile(selected: File | undefined) {
		if (!selected) return;
		error = '';
		file = selected;
		loading = true;
		try {
			const result = await parseExcel(selected);
			contacts = result.contacts;
			totalCount = result.totalCount;
		} catch (err) {
			contacts = [];
			totalCount = 0;
			error = err instanceof ApiError ? err.message : 'Could not read that file.';
		} finally {
			loading = false;
		}
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		handleFile(event.dataTransfer?.files?.[0]);
	}

	function clear() {
		file = null;
		contacts = [];
		totalCount = 0;
		error = '';
		if (input) input.value = '';
	}
</script>

<div class="stack">
	<div
		class="dropzone"
		role="group"
		aria-label="File dropzone"
		class:over={dragOver}
		ondragover={(e) => (e.preventDefault(), (dragOver = true))}
		ondragleave={() => (dragOver = false)}
		ondrop={onDrop}
	>
		<input
			bind:this={input}
			id="excelFile"
			type="file"
			accept=".xlsx,.xls,.csv"
			class="sr-only"
			onchange={(e) => handleFile((e.currentTarget as HTMLInputElement).files?.[0])}
		/>
		<label for="excelFile" class="drop-label">
			{#if loading}
				<span class="spinner" aria-hidden="true"></span> Reading file…
			{:else if file}
				📄 <strong>{file.name}</strong> — {totalCount} contacts found
			{:else}
				📎 Drop an Excel/CSV file here, or click to choose one
			{/if}
		</label>
		{#if file && !loading}
			<button type="button" class="btn btn-secondary btn-sm" onclick={clear}>Remove</button>
		{/if}
	</div>

	<p class="small muted">
		Needs a column containing "Email". Columns become placeholders, e.g. a "FirstName" column lets
		you write <code>{'{{FirstName}}'}</code> in the subject or body.
	</p>

	{#if error}<p class="notice notice-danger" role="alert">{error}</p>{/if}

	{#if contacts.length > 0}
		<div class="table-wrap">
			<table>
				<caption class="sr-only">Preview of the first {contacts.length} contacts</caption>
				<thead>
					<tr>
						{#each columns as col (col)}<th>{col}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each contacts as contact, i (i)}
						<tr>
							{#each columns as col (col)}<td>{contact[col] ?? '-'}</td>{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="small muted">Showing a preview of {contacts.length} of {totalCount} contacts.</p>
	{/if}
</div>

<style>
	.dropzone {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
		border: 2px dashed var(--border);
		border-radius: var(--radius);
		padding: 1rem;
		background: var(--surface-muted);
	}
	.dropzone.over {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.drop-label {
		cursor: pointer;
		font-weight: 500;
	}
</style>
