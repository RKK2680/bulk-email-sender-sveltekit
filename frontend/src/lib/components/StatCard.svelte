<script lang="ts">
	interface Props {
		label: string;
		value: number;
		tone?: 'default' | 'success' | 'danger' | 'warning';
	}

	let { label, value, tone = 'default' }: Props = $props();
</script>

<div class="card stat {tone}">
	<p class="value">{value.toLocaleString()}</p>
	<p class="muted small">{label}</p>
</div>

<style>
	.stat {
		gap: 0.15rem;
		text-align: center;
	}
	.value {
		font-size: 1.9rem;
		font-weight: 700;
	}
	.success .value {
		color: var(--success);
	}
	.danger .value {
		color: var(--danger);
	}
	.warning .value {
		color: var(--warning);
	}
</style>
