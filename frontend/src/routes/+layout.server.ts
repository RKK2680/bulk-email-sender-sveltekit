import type { LayoutServerLoad } from './$types';

/** Makes the signed-in user (resolved in hooks.server.ts) available to every page. */
export const load: LayoutServerLoad = ({ locals }) => ({ user: locals.user });
