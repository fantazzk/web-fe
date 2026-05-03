type SandboxBoardErrorCode =
	| 'CHARACTER_NOT_IN_POOL'
	| 'CHARACTER_NOT_IN_ROSTER'
	| 'CAPTAIN_NOT_FOUND';

class SandboxBoardError extends Error {
	readonly code: SandboxBoardErrorCode;

	constructor(code: SandboxBoardErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'SandboxBoardError';
	}
}

export { SandboxBoardError };
export type { SandboxBoardErrorCode };
