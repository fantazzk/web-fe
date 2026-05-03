import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';
import type { CaptainId, CharacterId } from '$lib/market-engine/domain/shared/character';

type PickId = Identity;

class Pick extends Entity<PickId> {
	private constructor(
		readonly id: PickId,
		readonly characterId: CharacterId,
		readonly captainId: CaptainId,
		readonly round: number
	) {
		super();
	}

	static create(id: PickId, characterId: CharacterId, captainId: CaptainId, round: number): Pick {
		return new Pick(id, characterId, captainId, round);
	}
}

export { Pick };
export type { PickId };
