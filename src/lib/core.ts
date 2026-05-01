type Identity = string;

abstract class AggregateRoot<Self extends AggregateRoot<Self, ID>, ID extends Identity> {
	abstract readonly id: ID;

	equals(other: Self): boolean {
		return other.id === this.id;
	}
}

abstract class Entity<ID extends Identity> {
	abstract readonly id: ID;

	equals(other: Entity<ID>): boolean {
		return other.id === this.id;
	}
}

abstract class ValueObject<Self> {
	abstract equals(other: Self): boolean;
}

class Association<T extends AggregateRoot<T, ID>, ID extends Identity> {
	constructor(public readonly id: ID) {}
}

export { AggregateRoot, Association, Entity, ValueObject };
export type { Identity };
