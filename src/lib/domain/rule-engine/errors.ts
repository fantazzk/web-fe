export type AuctionErrorCode =
	| 'BID_TOO_LOW' // 현재 최고가 이하 입찰
	| 'BID_INVALID_UNIT' // 최소 단위 미충족
	| 'INSUFFICIENT_POINTS' // 잔여 포인트 부족
	| 'POSITION_LIMIT_REACHED' // 포지션별 인원 초과
	| 'NOT_BIDDING_PHASE' // BIDDING 단계 아닌데 입찰 시도
	| 'NO_CURRENT_PLAYER' // 경매 대상 선수 없음
	| 'TEAM_NOT_FOUND' // 존재하지 않는 팀 ID
	| 'AUCTION_ALREADY_COMPLETED'; // 이미 완료된 경매

export class AuctionError extends Error {
	readonly code: AuctionErrorCode;

	constructor(code: AuctionErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'AuctionError';
	}
}
