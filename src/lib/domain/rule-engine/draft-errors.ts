export type DraftErrorCode =
	| 'NOT_PICKING_PHASE' // PICKING 단계 아닌데 픽 시도
	| 'NOT_YOUR_TURN' // 현재 차례가 아닌 팀이 픽 시도
	| 'PLAYER_ALREADY_PICKED' // 이미 픽된 선수
	| 'PLAYER_NOT_FOUND' // 선수풀에 없는 선수
	| 'TEAM_NOT_FOUND' // 존재하지 않는 팀 ID
	| 'DRAFT_ALREADY_COMPLETED'; // 이미 완료된 드래프트

export class DraftError extends Error {
	readonly code: DraftErrorCode;

	constructor(code: DraftErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'DraftError';
	}
}
