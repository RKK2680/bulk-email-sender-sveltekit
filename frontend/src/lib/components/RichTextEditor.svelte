<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import 'quill/dist/quill.snow.css';

	interface Props {
		value: string;
		disabled?: boolean;
	}

	let { value = $bindable(), disabled = false }: Props = $props();

	let container: HTMLDivElement;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let quill: any;

	onMount(async () => {
		// Quill touches `document`, so it's loaded client-side only.
		const { default: Quill } = await import('quill');
		quill = new Quill(container, {
			theme: 'snow',
			placeholder: 'Write your email... use {{FirstName}}, {{Company}} etc. to personalise it.',
			modules: {
				toolbar: [
					[{ header: [false, 2, 3] }],
					['bold', 'italic', 'underline'],
					[{ color: [] }, { background: [] }],
					[{ list: 'ordered' }, { list: 'bullet' }],
					['link', 'image'],
					['clean']
				]
			}
		});
		if (value) quill.clipboard.dangerouslyPasteHTML(value);
		quill.on('text-change', () => (value = quill.root.innerHTML));
		quill.enable(!disabled);
	});

	$effect(() => {
		quill?.enable(!disabled);
	});

	onDestroy(() => quill?.off('text-change'));
</script>

<div class="editor" class:disabled bind:this={container}></div>

<style>
	.editor {
		background: var(--surface);
		border-radius: 0 0 8px 8px;
	}
	.editor.disabled {
		opacity: 0.6;
	}
	:global(.ql-toolbar.ql-snow) {
		border-radius: 8px 8px 0 0;
		border-color: var(--border);
		background: var(--surface-muted);
	}
	:global(.ql-container.ql-snow) {
		border-color: var(--border);
		font-size: 0.95rem;
		min-height: 220px;
	}
</style>
