import { ValueObject } from '$lib/core';

class Category extends ValueObject<Category> {
	constructor(readonly name: string) {
		super();
	}

	equals(other: Category): boolean {
		return this.name === other.name;
	}
}

export { Category };
