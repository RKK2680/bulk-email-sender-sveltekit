import { env } from '$env/dynamic/private';

/** Base URL of the Hono API. Only ever used on the server. */
export const BACKEND_URL = (env.BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
