<script lang="ts">
	import Modal from './Modal.svelte';
	import { fillPlaceholders } from '$lib/utils/format';
	import type { Contact } from '$lib/types';

	interface Props {
		open: boolean;
		subject: string;
		content: string;
		sampleContact?: Contact;
	}

	let { open = $bindable(), subject, content, sampleContact }: Props = $props();

	const fallback: Contact = {
		Email: 'john.doe@example.com',
		FirstName: 'John',
		LastName: 'Doe',
		Company: 'Example Corp'
	};

	const data = $derived(sampleContact ?? fallback);
	const previewSubject = $derived(fillPlaceholders(subject, data));
	const previewContent = $derived(fillPlaceholders(content, data));
</script>

<Modal bind:open title="Email preview" wide>
	<p class="notice">
		{#if sampleContact}
			📄 Using the first row from your uploaded file (<strong>{data.Email}</strong>).
		{:else}
			⚠️ Upload a contact file to preview with real data — showing sample data for now.
		{/if}
	</p>
	<p><strong>Subject:</strong> {previewSubject || '(no subject)'}</p>
	<div class="preview-body">
		{@html previewContent || '<p class="muted">(no content)</p>'}
	</div>
</Modal>

<style>
	.preview-body {
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 1rem;
		background: var(--surface-muted);
	}
</style>
