import type { z } from 'zod';

export type FieldErrors = Record<string, string>;

type ValidationResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

/** Runs a Zod schema and flattens the issues to `{ fieldName: firstMessage }`. */
export function validate<S extends z.ZodType>(
	schema: S,
	input: unknown
): ValidationResult<z.output<S>> {
	const result = schema.safeParse(input);
	if (result.success) return { ok: true, data: result.data };

	const errors: FieldErrors = {};
	for (const issue of result.error.issues) {
		const field = String(issue.path[0] ?? 'form');
		errors[field] ??= issue.message;
	}
	return { ok: false, errors };
}
