import { Auction } from '$lib/domain/rule-engine/auction';
import { AuctionError } from '$lib/domain/rule-engine/errors';

interface BidResultType {
	readonly auction: Auction;
	readonly error: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
	BID_TOO_LOW: '현재 최고가보다 높은 금액을 입력하세요.',
	BID_INVALID_UNIT: '최소 입찰 단위에 맞게 입력하세요.',
	INSUFFICIENT_POINTS: '잔여 포인트가 부족합니다.',
	POSITION_LIMIT_REACHED: '해당 포지션의 인원이 가득 찼습니다.',
	TEAM_NOT_FOUND: '감독을 찾을 수 없습니다.'
};

/** 입찰 시도 — 성공 시 갱신된 Auction, 실패 시 에러 메시지 */
export function processBid(auction: Auction, teamId: string, amount: number): BidResultType {
	try {
		const next = auction.placeBid(teamId, amount);
		return { auction: next, error: null };
	} catch (e) {
		if (e instanceof AuctionError) {
			return { auction, error: ERROR_MESSAGES[e.code] ?? e.message };
		}
		throw e;
	}
}

/** 타이머 만료 처리 — 입찰 있으면 낙찰, 없으면 유찰 → 다음 선수 진행 */
export function processTimerExpiry(auction: Auction): Auction {
	const settled = auction.currentBid !== null ? auction.settle() : auction.markUnsold();
	return settled.startNext();
}
