import type { Identity } from '$lib/core';
import { AggregateRoot } from '$lib/core';
import type { Character } from '$lib/market-engine/domain/shared/character';
import type { GameType } from '$lib/market-engine/domain/shared/game-type';
import type { TemplateRule } from '$lib/market-engine/domain/template/template-rule';

type TemplateId = Identity;

class Template extends AggregateRoot<Template, TemplateId> {
	private constructor(
		readonly id: TemplateId,
		readonly name: string,
		readonly gameType: GameType,
		readonly creatorId: string,
		readonly rule: TemplateRule,
		readonly characters: readonly Character[],
		readonly captainsNeeded: number,
		readonly creatorAsCaptain: boolean,
		readonly usageCount: number,
		readonly createdAt: Date,
		readonly updatedAt: Date
	) {
		super();
	}

	get mode() {
		return this.rule.mode;
	}

	get characterCount(): number {
		return this.characters.length;
	}

	static create(params: {
		id: TemplateId;
		name: string;
		gameType: GameType;
		creatorId: string;
		rule: TemplateRule;
		characters: readonly Character[];
		captainsNeeded: number;
		creatorAsCaptain: boolean;
	}): Template {
		return new Template(
			params.id,
			params.name,
			params.gameType,
			params.creatorId,
			params.rule,
			params.characters,
			params.captainsNeeded,
			params.creatorAsCaptain,
			0,
			new Date(),
			new Date()
		);
	}

	static restore(params: {
		id: TemplateId;
		name: string;
		gameType: GameType;
		creatorId: string;
		rule: TemplateRule;
		characters: readonly Character[];
		captainsNeeded: number;
		creatorAsCaptain: boolean;
		usageCount: number;
		createdAt: Date;
		updatedAt: Date;
	}): Template {
		return new Template(
			params.id,
			params.name,
			params.gameType,
			params.creatorId,
			params.rule,
			params.characters,
			params.captainsNeeded,
			params.creatorAsCaptain,
			params.usageCount,
			params.createdAt,
			params.updatedAt
		);
	}
}

export { Template };
export type { TemplateId };
