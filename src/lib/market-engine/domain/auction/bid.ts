import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';
import type { CaptainId, CharacterId } from '$lib/market-engine/domain/shared/character';

type BidId = Identity;

class Bid extends Entity<BidId> {
	private constructor(
		readonly id: BidId,
		readonly characterId: CharacterId,
		readonly captainId: CaptainId,
		readonly amount: number
	) {
		super();
	}

	static create(id: BidId, characterId: CharacterId, captainId: CaptainId, amount: number): Bid {
		return new Bid(id, characterId, captainId, amount);
	}
}

export { Bid };
export type { BidId };
