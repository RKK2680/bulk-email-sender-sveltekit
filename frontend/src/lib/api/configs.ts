import { api } from './client';
import type { SmtpConfig, SmtpConfigInput } from '$lib/types';

export async function listConfigs(): Promise<SmtpConfig[]> {
	const res = await api<{ userConfigs: SmtpConfig[] }>('/config/smtp');
	return res.userConfigs;
}

export const createConfig = (input: SmtpConfigInput) =>
	api('/config/smtp', { method: 'POST', json: input });

export const updateConfig = (id: string, input: Partial<SmtpConfigInput>) =>
	api(`/config/smtp/${id}`, { method: 'PUT', json: input });

export const deleteConfig = (id: string) => api(`/config/smtp/${id}`, { method: 'DELETE' });

export const setDefaultConfig = (id: string) =>
	api(`/config/smtp/${id}/default`, { method: 'POST' });

export const testConfig = (input: Pick<SmtpConfigInput, 'host' | 'port' | 'secure' | 'user' | 'pass'>) =>
	api('/config/smtp/test', { method: 'POST', json: input });
