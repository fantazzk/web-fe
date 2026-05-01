type AuctionErrorCode =
	| 'NOT_BIDDING_PHASE'
	| 'NO_CURRENT_CHARACTER'
	| 'CAPTAIN_NOT_FOUND'
	| 'BID_INVALID_UNIT'
	| 'BID_TOO_LOW'
	| 'INSUFFICIENT_POINTS'
	| 'POSITION_LIMIT_REACHED'
	| 'AUCTION_ALREADY_COMPLETED';

class AuctionError extends Error {
	readonly code: AuctionErrorCode;

	constructor(code: AuctionErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'AuctionError';
	}
}

export { AuctionError };
export type { AuctionErrorCode };
