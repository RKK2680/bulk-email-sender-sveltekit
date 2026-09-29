export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
	id: number;
	kind: ToastKind;
	message: string;
}

class ToastStore {
	items = $state<Toast[]>([]);
	#nextId = 1;

	push(kind: ToastKind, message: string, timeout = 6000) {
		const id = this.#nextId++;
		this.items.push({ id, kind, message });
		if (timeout > 0) setTimeout(() => this.dismiss(id), timeout);
	}

	dismiss(id: number) {
		this.items = this.items.filter((t) => t.id !== id);
	}

	success = (message: string) => this.push('success', message);
	error = (message: string) => this.push('error', message, 9000);
	info = (message: string) => this.push('info', message);
	warning = (message: string) => this.push('warning', message);
}

export const toast = new ToastStore();
