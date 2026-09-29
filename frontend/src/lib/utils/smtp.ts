export const isGmail = (host: string) => host.toLowerCase().includes('gmail');

/**
 * Google shows app passwords as "abcd efgh ijkl mnop"; the spaces are cosmetic.
 * Other providers only get trimmed.
 */
export function normalizePassword(password: string, host: string): string {
	const trimmed = password.trim();
	return isGmail(host) ? trimmed.replace(/\s+/g, '') : trimmed;
}

/** Returns an error message for an obviously wrong Gmail app password, else null. */
export function gmailPasswordError(password: string, host: string): string | null {
	if (!isGmail(host) || !password) return null;
	const clean = password.replace(/\s+/g, '');
	if (clean.length !== 16) {
		return `Gmail app passwords are 16 characters (you entered ${clean.length}). Use an App Password, not your normal password.`;
	}
	if (!/^[a-zA-Z0-9]+$/.test(clean)) {
		return 'Gmail app passwords contain only letters and numbers.';
	}
	return null;
}

export interface ProviderHelp {
	name: string;
	steps: string[];
	link?: { href: string; label: string };
}

/** Provider-specific setup hints shown under the SMTP host field. */
export function providerHelp(host: string): ProviderHelp | null {
	const h = host.toLowerCase();
	if (h.includes('gmail')) {
		return {
			name: 'Gmail',
			steps: [
				'Turn on 2-step verification for your Google account.',
				'Create an App Password and use that instead of your normal password.',
				'Spaces in the app password are removed automatically.'
			],
			link: { href: 'https://myaccount.google.com/apppasswords', label: 'Create an app password' }
		};
	}
	if (h.includes('outlook') || h.includes('hotmail') || h.includes('live')) {
		return {
			name: 'Outlook',
			steps: ['Host: smtp-mail.outlook.com, port 587 (STARTTLS).', 'Use your Outlook account password.']
		};
	}
	if (h.includes('yahoo')) {
		return {
			name: 'Yahoo',
			steps: ['Host: smtp.mail.yahoo.com, port 587.', 'Generate an app password in Yahoo account security.']
		};
	}
	return null;
}
