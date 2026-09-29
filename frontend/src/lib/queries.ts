import { browser } from '$app/environment';
import { getBatchStatus, getPollStatus, getScheduledJobs } from '$lib/api/campaigns';
import { listConfigs } from '$lib/api/configs';
import { getReport } from '$lib/api/reports';

/**
 * Central query keys + options so every component that reads or invalidates a
 * resource agrees on how it is cached.
 */
export const keys = {
	configs: ['configs'] as const,
	report: ['report'] as const,
	pollStatus: ['poll-status'] as const,
	batch: ['batch-status'] as const,
	scheduled: ['scheduled-jobs'] as const
};

// Queries only run in the browser: they need the session cookie and the proxy.
const enabled = browser;

export const configsQuery = () => ({ queryKey: keys.configs, queryFn: listConfigs, enabled });

/**
 * Cheap endpoint that tells us whether anything is happening server-side and
 * how often to poll (3s active batch, 10s running schedule, 30s otherwise).
 */
export const pollStatusQuery = () => ({
	queryKey: keys.pollStatus,
	queryFn: getPollStatus,
	enabled,
	refetchInterval: 30_000
});

/** refetchInterval for data that only changes while a job is active. */
export const followPolling = (poll: { pollNeeded: boolean; pollInterval: number } | undefined) =>
	poll?.pollNeeded ? poll.pollInterval : false;

export const batchQuery = (interval: number | false) => ({
	queryKey: keys.batch,
	queryFn: getBatchStatus,
	enabled,
	refetchInterval: interval
});

export const scheduledQuery = (interval: number | false) => ({
	queryKey: keys.scheduled,
	queryFn: getScheduledJobs,
	enabled,
	refetchInterval: interval
});

export const reportQuery = (interval: number | false) => ({
	queryKey: keys.report,
	queryFn: getReport,
	enabled,
	refetchInterval: interval
});
