export type SandboxErrorCode =
	| 'PLAYER_NOT_IN_POOL'
	| 'PLAYER_NOT_IN_ROSTER'
	| 'CAPTAIN_NOT_FOUND'
	| 'DUPLICATE_ASSIGNMENT';

export class SandboxError extends Error {
	readonly code: SandboxErrorCode;

	constructor(code: SandboxErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'SandboxError';
	}
}
