import type { RequestHandler } from './$types';
import { BACKEND_URL } from '$lib/server/backend';

/**
 * Thin pass-through proxy: /api/<path> -> <BACKEND_URL>/<path>.
 *
 * Keeping the API behind the frontend's own origin means the backend's httpOnly
 * session cookie works without CORS or cookie-domain configuration, and the
 * backend stays untouched. Bodies are streamed, so multipart uploads work.
 */
const handler: RequestHandler = async ({ request, params, url }) => {
	const headers = new Headers(request.headers);
	headers.delete('host');
	headers.delete('connection');
	headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

	const init: RequestInit & { duplex?: 'half' } = {
		method: request.method,
		headers,
		redirect: 'manual'
	};
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		init.body = request.body;
		init.duplex = 'half';
	}

	try {
		const upstream = await fetch(`${BACKEND_URL}/${params.path}${url.search}`, init);

		// fetch() already decoded the body, so these no longer describe it.
		const responseHeaders = new Headers(upstream.headers);
		responseHeaders.delete('content-encoding');
		responseHeaders.delete('content-length');
		responseHeaders.delete('transfer-encoding');

		return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
	} catch (error) {
		console.error('API proxy error:', error);
		return new Response(
			JSON.stringify({ success: false, message: 'The email service is unreachable.' }),
			{ status: 502, headers: { 'content-type': 'application/json' } }
		);
	}
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
