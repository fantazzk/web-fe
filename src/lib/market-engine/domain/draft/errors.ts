type DraftErrorCode =
	| 'NOT_PICKING_PHASE'
	| 'NOT_YOUR_TURN'
	| 'CAPTAIN_NOT_FOUND'
	| 'CHARACTER_NOT_IN_QUEUE';

class DraftError extends Error {
	readonly code: DraftErrorCode;

	constructor(code: DraftErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'DraftError';
	}
}

export { DraftError };
export type { DraftErrorCode };
