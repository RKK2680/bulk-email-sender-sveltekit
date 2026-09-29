import { z } from 'zod';

// Same rules the backend enforces in routes/auth.ts, so users get feedback before a round trip.
const email = z
	.string()
	.trim()
	.min(1, 'Email is required')
	.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address');

export const loginSchema = z.object({
	email,
	password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email,
	password: z.string().min(6, 'Password must be at least 6 characters')
});
