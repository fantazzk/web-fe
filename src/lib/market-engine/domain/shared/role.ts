import { ValueObject } from '$lib/core';

type RoleName = 'CAPTAIN' | 'PLAYER';

class Role extends ValueObject<Role> {
	static readonly CAPTAIN: Role = new Role('CAPTAIN');
	static readonly PLAYER: Role = new Role('PLAYER');

	private constructor(readonly name: RoleName) {
		super();
	}

	static of(name: RoleName): Role {
		return name === 'CAPTAIN' ? Role.CAPTAIN : Role.PLAYER;
	}

	equals(other: Role): boolean {
		return this.name === other.name;
	}
}

export { Role };
export type { RoleName };
