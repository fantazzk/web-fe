import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';
import { Role } from '$lib/market-engine/domain/shared/role';

type CharacterId = Identity;

class Character extends Entity<CharacterId> {
	private constructor(
		readonly id: CharacterId,
		readonly name: string,
		readonly position: string | null,
		readonly role: Role
	) {
		super();
	}

	static create(id: CharacterId, name: string, position: string | null, role: Role): Character {
		return new Character(id, name, position, role);
	}
}

export { Character };
export type { CharacterId };
