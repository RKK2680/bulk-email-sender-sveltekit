import type { Handle } from '@sveltejs/kit';
import { BACKEND_URL } from '$lib/server/backend';
import type { User } from '$lib/types';

/**
 * Resolves the signed-in user for page requests by asking the backend who the
 * session cookie belongs to. Session logic stays entirely in the Hono backend.
 */
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;

	const cookie = event.request.headers.get('cookie');
	const isApiProxy = event.url.pathname.startsWith('/api/');

	if (cookie?.includes('session_token=') && !isApiProxy) {
		try {
			const res = await fetch(`${BACKEND_URL}/auth/me`, { headers: { cookie } });
			if (res.ok) {
				const body = (await res.json()) as { user?: User };
				event.locals.user = body.user ?? null;
			}
		} catch (error) {
			console.error('Could not reach the backend to validate the session:', error);
		}
	}

	return resolve(event);
};
