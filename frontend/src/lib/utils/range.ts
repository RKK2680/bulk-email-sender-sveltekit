export type RangeMode = 'all' | 'first' | 'range';

export interface RangeInput {
	mode: RangeMode;
	total: number;
	/** "first N" mode. */
	firstN: number | null;
	/** 1-based inclusive bounds for "range" mode. */
	from: number | null;
	to: number | null;
}

export interface ResolvedRange {
	/** 0-based offset, matching the backend's `emailRangeStart`. */
	start: number;
	/** Number of contacts, matching the backend's `emailRangeCount`. */
	count: number;
	warning?: string;
}

/** Clamps whatever the user typed to the contact list and explains any adjustment. */
export function resolveRange({ mode, total, firstN, from, to }: RangeInput): ResolvedRange {
	if (mode === 'first') {
		const wanted = firstN ?? total;
		return {
			start: 0,
			count: Math.max(0, Math.min(wanted, total)),
			warning: wanted > total ? `Only ${total} contacts are available.` : undefined
		};
	}

	if (mode === 'range') {
		const rawFrom = from ?? 1;
		const rawTo = to ?? total;
		const validFrom = Math.max(1, Math.min(rawFrom, total));
		const validTo = Math.max(validFrom, Math.min(rawTo, total));

		let warning: string | undefined;
		if (rawFrom < 1 || rawFrom > total || rawTo < 1 || rawTo > total) {
			warning = `Values must be between 1 and ${total}.`;
		} else if (rawTo < rawFrom) {
			warning = '"To" cannot be lower than "From".';
		}
		return { start: validFrom - 1, count: total === 0 ? 0 : validTo - validFrom + 1, warning };
	}

	return { start: 0, count: total };
}
