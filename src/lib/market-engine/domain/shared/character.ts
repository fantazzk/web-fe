import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';
import { Role } from '$lib/market-engine/domain/shared/role';

type CharacterId = Identity;

/**
 * CAPTAIN role을 가진 Character의 id를 가리킨다.
 * 타입은 CharacterId와 동일하지만 의미를 명시한다.
 */
type CaptainId = CharacterId;

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
export type { CharacterId, CaptainId };
