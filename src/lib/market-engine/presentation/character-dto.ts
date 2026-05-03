import type { Character } from '$lib/market-engine/domain/shared/character';
import type { RoleName } from '$lib/market-engine/domain/shared/role';

interface CharacterDto {
	id: string;
	name: string;
	position: string | null;
	role: RoleName;
}

function toCharacterDto(c: Character): CharacterDto {
	return { id: c.id, name: c.name, position: c.position, role: c.role.name };
}

export { toCharacterDto };
export type { CharacterDto };
