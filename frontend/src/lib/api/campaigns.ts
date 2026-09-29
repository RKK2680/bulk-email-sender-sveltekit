import { api } from './client';
import type {
	BatchStatus,
	ParsedContacts,
	PollStatus,
	ScheduledJob,
	SendResult
} from '$lib/types';

export async function parseExcel(file: File): Promise<ParsedContacts> {
	const form = new FormData();
	form.set('excelFile', file);
	return api<ParsedContacts & { success: true }>('/parse-excel', { method: 'POST', form });
}

export const sendCampaign = (form: FormData) => api<SendResult>('/send', { method: 'POST', form });

export const testNotification = (testEmail: string) =>
	api('/test-notification', { method: 'POST', json: { testEmail } });

export async function getBatchStatus(): Promise<BatchStatus> {
	return (await api<{ data: BatchStatus }>('/batch-status')).data;
}

export const pauseBatch = () => api('/batch-pause', { method: 'POST' });
export const resumeBatch = () => api('/batch-resume', { method: 'POST' });
export const cancelBatch = () => api('/batch-cancel', { method: 'DELETE' });

export async function getScheduledJobs(): Promise<ScheduledJob[]> {
	return (await api<{ data: ScheduledJob[] }>('/scheduled-jobs')).data;
}

export const cancelScheduledJob = (id: string) => api(`/scheduled-jobs/${id}`, { method: 'DELETE' });

export async function getPollStatus(): Promise<PollStatus> {
	return (await api<{ data: PollStatus }>('/dashboard/poll-status')).data;
}
