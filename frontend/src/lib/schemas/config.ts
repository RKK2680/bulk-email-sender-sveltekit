import { z } from 'zod';
import { gmailPasswordError } from '$lib/utils/smtp';

/**
 * SMTP configuration form. `pass` is optional when editing (blank keeps the
 * stored password), so the create form passes `requirePassword: true`.
 */
export const smtpConfigSchema = (requirePassword: boolean) =>
	z
		.object({
			name: z.string().trim().min(1, 'Give this configuration a name'),
			host: z.string().trim().min(1, 'SMTP host is required'),
			port: z.coerce
				.number({ error: 'Port must be a number' })
				.int('Port must be a whole number')
				.min(1, 'Port must be between 1 and 65535')
				.max(65535, 'Port must be between 1 and 65535'),
			secure: z.boolean(),
			user: z.string().trim().min(1, 'SMTP username is required'),
			pass: requirePassword ? z.string().min(1, 'Password is required') : z.string(),
			fromEmail: z
				.string()
				.trim()
				.min(1, 'From email is required')
				.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'),
			fromName: z.string().trim(),
			isDefault: z.boolean()
		})
		.superRefine((value, ctx) => {
			const message = gmailPasswordError(value.pass, value.host);
			if (message) ctx.addIssue({ code: 'custom', path: ['pass'], message });
		});
