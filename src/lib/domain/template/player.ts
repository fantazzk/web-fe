import type { PlayerParams, TierType } from './types.ts';

export class Player {
	readonly name: string;
	readonly position: string;
	readonly tier?: TierType | undefined;

	constructor(params: PlayerParams) {
		this.name = params.name;
		this.position = params.position;
		this.tier = params.tier;
	}
}
