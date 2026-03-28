export type SessionErrorCode =
	| 'SESSION_FULL'
	| 'ALREADY_JOINED'
	| 'SESSION_NOT_WAITING'
	| 'SESSION_NOT_IN_PROGRESS'
	| 'PARTICIPANT_NOT_FOUND'
	| 'NO_HOST_CANDIDATE'
	| 'START_CONDITIONS_NOT_MET'
	| 'CANNOT_TOGGLE_READY'
	| 'CANNOT_DISCONNECT_AI';

export class SessionError extends Error {
	readonly code: SessionErrorCode;

	constructor(code: SessionErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'SessionError';
	}
}
