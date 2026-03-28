import type { PlayerParams } from './types.ts';

export class Player {
	readonly name: string;
	readonly position: string;

	constructor(params: PlayerParams) {
		this.name = params.name;
		this.position = params.position;
	}
}
