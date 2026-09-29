export const formatDateTime = (iso: string) =>
	new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

export const formatTime = (iso: string) =>
	new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(new Date(iso));

/** "12m 05s" style countdown; returns null once the target has passed. */
export function formatCountdown(targetIso: string, now = Date.now()): string | null {
	const diff = new Date(targetIso).getTime() - now;
	if (diff <= 0) return null;
	const minutes = Math.floor(diff / 60_000);
	const seconds = Math.floor((diff % 60_000) / 1000);
	return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

/** Value for <input type="datetime-local"> in the user's local timezone. */
export function toDateTimeLocal(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Replaces {{Column}} placeholders the same way the backend personalises each email. */
export function fillPlaceholders(template: string, data: Record<string, unknown>): string {
	return Object.entries(data).reduce(
		(text, [key, value]) => text.replaceAll(`{{${key}}}`, value == null ? '' : String(value)),
		template
	);
}
