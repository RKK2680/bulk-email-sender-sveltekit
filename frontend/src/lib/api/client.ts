import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number
	) {
		super(message);
		this.name = 'ApiError';
	}
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	/** Serialised as JSON. */
	json?: unknown;
	/** Sent as multipart/form-data (the browser sets the boundary header). */
	form?: FormData;
}

/**
 * Single entry point for talking to the backend through the /api proxy.
 * Every backend response carries `{ success, message? }`; a `success: false`
 * body or a non-2xx status is turned into an ApiError with a readable message.
 */
export async function api<T = { success: true; message?: string }>(
	path: string,
	{ method = 'GET', json, form }: RequestOptions = {}
): Promise<T> {
	const headers: HeadersInit = {};
	let body: BodyInit | undefined;

	if (json !== undefined) {
		headers['Content-Type'] = 'application/json';
		body = JSON.stringify(json);
	} else if (form) {
		body = form;
	}

	let response: Response;
	try {
		response = await fetch(`/api${path}`, { method, headers, body });
	} catch {
		throw new ApiError('Network error. Check your connection and try again.', 0);
	}

	const payload = await response.json().catch(() => null);

	if (response.status === 401 && browser && !location.pathname.startsWith('/login')) {
		await goto('/login');
	}

	if (!response.ok || payload?.success === false) {
		throw new ApiError(payload?.message ?? `Request failed (${response.status})`, response.status);
	}

	return payload as T;
}
