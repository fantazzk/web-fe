import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';
import type { CharacterId } from '$lib/market-engine/domain/shared/character';

type PickId = Identity;

class Pick extends Entity<PickId> {
	private constructor(
		readonly id: PickId,
		readonly characterId: CharacterId,
		readonly captainId: CharacterId,
		readonly round: number
	) {
		super();
	}

	static create(id: PickId, characterId: CharacterId, captainId: CharacterId, round: number): Pick {
		return new Pick(id, characterId, captainId, round);
	}
}

export { Pick };
export type { PickId };
