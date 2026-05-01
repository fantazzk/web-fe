import type { Identity } from '$lib/core';
import { AggregateRoot } from '$lib/core';
import type { Character } from '$lib/market-engine/domain/shared/character';
import type { Captain, CaptainId } from '$lib/market-engine/domain/shared/captain';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import { Bid } from '$lib/market-engine/domain/auction/bid';
import { AuctionError } from '$lib/market-engine/domain/auction/errors';

type AuctionId = Identity;

type AuctionPhase = 'BIDDING' | 'SOLD' | 'UNSOLD' | 'COMPLETED';

class Auction extends AggregateRoot<Auction, AuctionId> {
	private constructor(
		readonly id: AuctionId,
		readonly templateId: TemplateId,
		readonly phase: AuctionPhase,
		readonly currentCharacter: Character | null,
		readonly currentBid: Bid | null,
		readonly captains: readonly Captain[],
		readonly remainingPoints: Readonly<Record<CaptainId, number>>,
		readonly rosters: Readonly<Record<CaptainId, readonly Character[]>>,
		readonly pendingQueue: readonly Character[],
		readonly soldHistory: readonly { character: Character; bid: Bid }[],
		readonly totalPoints: number,
		readonly minBidUnit: number,
		readonly positionLimit: number
	) {
		super();
	}

	get isCompleted(): boolean {
		return this.phase === 'COMPLETED';
	}

	static restore(params: {
		id: AuctionId;
		templateId: TemplateId;
		phase: AuctionPhase;
		currentCharacter: Character | null;
		currentBid: Bid | null;
		captains: readonly Captain[];
		remainingPoints: Readonly<Record<CaptainId, number>>;
		rosters: Readonly<Record<CaptainId, readonly Character[]>>;
		pendingQueue: readonly Character[];
		soldHistory: readonly { character: Character; bid: Bid }[];
		totalPoints: number;
		minBidUnit: number;
		positionLimit: number;
	}): Auction {
		return new Auction(
			params.id,
			params.templateId,
			params.phase,
			params.currentCharacter,
			params.currentBid,
			params.captains,
			params.remainingPoints,
			params.rosters,
			params.pendingQueue,
			params.soldHistory,
			params.totalPoints,
			params.minBidUnit,
			params.positionLimit
		);
	}

	static create(params: {
		id: AuctionId;
		templateId: TemplateId;
		captains: readonly Captain[];
		characters: readonly Character[];
		totalPoints: number;
		minBidUnit: number;
		positionLimit: number;
	}): Auction {
		const remainingPoints: Record<CaptainId, number> = {};
		const rosters: Record<CaptainId, readonly Character[]> = {};
		for (const captain of params.captains) {
			remainingPoints[captain.id] = params.totalPoints;
			rosters[captain.id] = [];
		}

		const [first, ...rest] = params.characters;

		if (!first) {
			return new Auction(
				params.id,
				params.templateId,
				'COMPLETED',
				null,
				null,
				params.captains,
				remainingPoints,
				rosters,
				[],
				[],
				params.totalPoints,
				params.minBidUnit,
				params.positionLimit
			);
		}

		return new Auction(
			params.id,
			params.templateId,
			'BIDDING',
			first,
			null,
			params.captains,
			remainingPoints,
			rosters,
			rest,
			[],
			params.totalPoints,
			params.minBidUnit,
			params.positionLimit
		);
	}

	placeBid(bidId: Identity, captainId: CaptainId, amount: number): Auction {
		if (this.phase !== 'BIDDING') throw new AuctionError('NOT_BIDDING_PHASE');
		if (!this.currentCharacter) throw new AuctionError('NO_CURRENT_CHARACTER');
		if (!this.captains.some((c) => c.id === captainId)) {
			throw new AuctionError('CAPTAIN_NOT_FOUND');
		}
		if (amount <= 0 || amount % this.minBidUnit !== 0) {
			throw new AuctionError('BID_INVALID_UNIT');
		}
		if (amount > (this.remainingPoints[captainId] ?? 0)) {
			throw new AuctionError('INSUFFICIENT_POINTS');
		}
		if (this.currentBid !== null && amount <= this.currentBid.amount) {
			throw new AuctionError('BID_TOO_LOW');
		}

		const positionCount = (this.rosters[captainId] ?? []).filter(
			(c) => c.position === this.currentCharacter!.position
		).length;
		if (positionCount >= this.positionLimit) {
			throw new AuctionError('POSITION_LIMIT_REACHED');
		}

		const bid = Bid.create(bidId, this.currentCharacter.id, captainId, amount);
		return new Auction(
			this.id,
			this.templateId,
			this.phase,
			this.currentCharacter,
			bid,
			this.captains,
			this.remainingPoints,
			this.rosters,
			this.pendingQueue,
			this.soldHistory,
			this.totalPoints,
			this.minBidUnit,
			this.positionLimit
		);
	}

	settle(): Auction {
		if (this.phase !== 'BIDDING') throw new AuctionError('NOT_BIDDING_PHASE');
		if (!this.currentCharacter || !this.currentBid) {
			throw new AuctionError('NO_CURRENT_CHARACTER');
		}

		const character = this.currentCharacter;
		const bid = this.currentBid;

		const nextRemaining = { ...this.remainingPoints };
		nextRemaining[bid.captainId] = (nextRemaining[bid.captainId] ?? 0) - bid.amount;

		const nextRosters = { ...this.rosters };
		nextRosters[bid.captainId] = [...(nextRosters[bid.captainId] ?? []), character];

		return new Auction(
			this.id,
			this.templateId,
			'SOLD',
			null,
			null,
			this.captains,
			nextRemaining,
			nextRosters,
			this.pendingQueue,
			[...this.soldHistory, { character, bid }],
			this.totalPoints,
			this.minBidUnit,
			this.positionLimit
		);
	}

	markUnsold(): Auction {
		if (this.phase !== 'BIDDING') throw new AuctionError('NOT_BIDDING_PHASE');
		if (!this.currentCharacter) throw new AuctionError('NO_CURRENT_CHARACTER');

		return new Auction(
			this.id,
			this.templateId,
			'UNSOLD',
			null,
			null,
			this.captains,
			this.remainingPoints,
			this.rosters,
			[...this.pendingQueue, this.currentCharacter],
			this.soldHistory,
			this.totalPoints,
			this.minBidUnit,
			this.positionLimit
		);
	}

	startNext(): Auction {
		if (this.phase === 'COMPLETED') throw new AuctionError('AUCTION_ALREADY_COMPLETED');
		if (this.phase !== 'SOLD' && this.phase !== 'UNSOLD') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}

		const [next, ...rest] = this.pendingQueue;

		if (!next) {
			return new Auction(
				this.id,
				this.templateId,
				'COMPLETED',
				null,
				null,
				this.captains,
				this.remainingPoints,
				this.rosters,
				[],
				this.soldHistory,
				this.totalPoints,
				this.minBidUnit,
				this.positionLimit
			);
		}

		return new Auction(
			this.id,
			this.templateId,
			'BIDDING',
			next,
			null,
			this.captains,
			this.remainingPoints,
			this.rosters,
			rest,
			this.soldHistory,
			this.totalPoints,
			this.minBidUnit,
			this.positionLimit
		);
	}
}

export { Auction };
export type { AuctionId, AuctionPhase };
