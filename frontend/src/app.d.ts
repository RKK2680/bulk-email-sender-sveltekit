import type { User } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			/** Populated in hooks.server.ts from the backend's /auth/me. `null` when signed out. */
			user: User | null;
		}
	}
}

export {};
