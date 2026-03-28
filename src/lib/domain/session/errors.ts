export type SessionErrorCode =
	| 'SESSION_FULL' // 참가자 수가 maxParticipants에 도달
	| 'ALREADY_JOINED' // 동일 ID로 중복 참가 시도
	| 'SESSION_NOT_WAITING' // WAITING 상태에서만 허용되는 작업 위반
	| 'SESSION_NOT_IN_PROGRESS' // IN_PROGRESS 상태에서만 허용되는 작업 위반
	| 'PARTICIPANT_NOT_FOUND' // 존재하지 않는 참가자 ID 참조
	| 'NO_HOST_CANDIDATE' // 호스트 퇴장 시 위임할 HUMAN 참가자 없음
	| 'START_CONDITIONS_NOT_MET' // 시작 조건 미충족 (최소 인원, 전원 READY)
	| 'CANNOT_TOGGLE_READY' // HOST 또는 AI는 ready 토글 불가
	| 'CANNOT_DISCONNECT_AI'; // AI 참가자는 disconnect 불가

export class SessionError extends Error {
	readonly code: SessionErrorCode;

	constructor(code: SessionErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'SessionError';
	}
}
