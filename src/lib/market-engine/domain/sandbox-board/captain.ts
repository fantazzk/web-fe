import type { Identity } from '$lib/core';
import { Entity } from '$lib/core';

type CaptainId = Identity;

class Captain extends Entity<CaptainId> {
	private constructor(
		readonly id: CaptainId,
		readonly name: string
	) {
		super();
	}

	static create(id: CaptainId, name: string): Captain {
		return new Captain(id, name);
	}
}

export { Captain };
export type { CaptainId };
