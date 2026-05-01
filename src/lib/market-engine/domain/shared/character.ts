import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';
import type { Category } from '$lib/market-engine/domain/shared/category';

type CharacterId = Identity;

class Character extends Entity<CharacterId> {
	private constructor(
		readonly id: CharacterId,
		readonly name: string,
		readonly position: string | null,
		readonly category: Category
	) {
		super();
	}

	static create(
		id: CharacterId,
		name: string,
		position: string | null,
		category: Category
	): Character {
		return new Character(id, name, position, category);
	}
}

export { Character };
export type { CharacterId };
