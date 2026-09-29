/** Shapes returned by the Hono backend (see ../../src/types.ts and route handlers). */

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface SmtpConfig {
	id: string;
	name: string;
	host: string;
	port: number;
	secure: boolean;
	user: string;
	fromEmail: string;
	fromName: string;
	isDefault: boolean;
	createdAt: string;
}

export interface SmtpConfigInput {
	name: string;
	host: string;
	port: number;
	secure: boolean;
	user: string;
	pass: string;
	fromEmail: string;
	fromName: string;
	isDefault: boolean;
}

export type Contact = { Email: string } & Record<string, string | number | undefined>;

export interface ParsedContacts {
	contacts: Contact[];
	totalCount: number;
}

export interface BatchConfig {
	batchSize: number;
	emailDelay: number;
	batchDelay: number;
	enabled: boolean;
}

export interface BatchJob {
	id: string;
	totalContacts: number;
	currentBatch: number;
	totalBatches: number;
	emailsSent: number;
	emailsFailed: number;
	status: 'Running' | 'Paused' | 'Completed' | 'Failed';
	startTime: string;
	nextBatchTime?: string;
	config: BatchConfig;
}

export interface BatchStatus {
	isRunning: boolean;
	currentJob: BatchJob | null;
	totalJobs: number;
	completedJobs: number;
}

/** Row shape of GET /scheduled-jobs (straight from SQLite, hence snake_case). */
export interface ScheduledJob {
	id: string;
	user_id: string;
	scheduled_time: string;
	status: 'scheduled' | 'running';
	contact_count: number;
	subject: string | null;
	use_batch: number;
	notify_email: string | null;
	config_name: string | null;
}

export interface PollStatus {
	pollNeeded: boolean;
	pollInterval: number;
	hasActiveBatch: boolean;
	hasScheduledJobs: boolean;
	hasRunningScheduledJobs: boolean;
}

export interface EmailLog {
	id: string;
	email: string;
	status: 'Sent' | 'Failed' | 'Error';
	message?: string;
	timestamp: string;
	messageId?: string;
	firstName?: string;
	company?: string;
	subject?: string;
}

export interface EmailStats {
	total: number;
	sent: number;
	failed: number;
	errors: number;
}

export interface Report {
	logs: EmailLog[];
	stats: EmailStats;
}

export interface SendResult {
	success: true;
	message: string;
	contactCount: number;
	jobId?: string;
	scheduledMode?: boolean;
	scheduledTime?: string;
	batchMode?: boolean;
	configUsed: string;
}
