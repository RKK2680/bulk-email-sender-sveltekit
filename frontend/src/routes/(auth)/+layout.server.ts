import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/** Already signed in? Skip straight past the login/register forms. */
export const load: LayoutServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/compose');
};
