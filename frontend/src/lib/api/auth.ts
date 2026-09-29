import { api } from './client';
import type { User } from '$lib/types';

interface AuthResponse {
	success: true;
	message: string;
	user: User;
}

export const login = (input: { email: string; password: string }) =>
	api<AuthResponse>('/auth/login', { method: 'POST', json: input });

export const register = (input: { name: string; email: string; password: string }) =>
	api<AuthResponse>('/auth/register', { method: 'POST', json: input });

export const logout = () => api('/auth/logout', { method: 'POST' });
