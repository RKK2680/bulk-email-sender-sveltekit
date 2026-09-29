import { api } from './client';
import type { Report } from '$lib/types';

export async function getReport(): Promise<Report> {
	return (await api<{ data: Report }>('/report')).data;
}

export const clearReport = () => api('/report/clear', { method: 'DELETE' });

/** Exports are plain downloads; the browser sends the session cookie itself. */
export const exportUrl = (format: 'csv' | 'json') => `/api/report/export/${format}`;
