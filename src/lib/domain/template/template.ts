import type {
	GameType,
	TemplateMode,
	MatchFormat,
	TierBalancing,
	CaptainSelectMode,
	TemplateParams
} from './types.ts';
import { Player } from './player.ts';

export class Template {
	readonly id: string;
	readonly name: string;
	readonly gameType: GameType;
	readonly creatorId: string;
	readonly mode: TemplateMode;

	readonly matchFormat: MatchFormat;
	readonly pickBanTime: number;
	readonly restrictions: string;

	readonly playerPool: readonly Player[];
	readonly tierBalancing: TierBalancing;

	readonly captainSelectMode: CaptainSelectMode;
	readonly captainsNeeded: number;

	readonly isPublic: boolean;
	readonly usageCount: number;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(params: TemplateParams) {
		this.id = params.id;
		this.name = params.name;
		this.gameType = params.gameType;
		this.creatorId = params.creatorId;
		this.mode = params.mode;
		this.matchFormat = params.matchFormat;
		this.pickBanTime = params.pickBanTime;
		this.restrictions = params.restrictions;
		this.playerPool = params.playerPool.map((p) => new Player(p));
		this.tierBalancing = params.tierBalancing;
		this.captainSelectMode = params.captainSelectMode;
		this.captainsNeeded = params.captainsNeeded;
		this.isPublic = params.isPublic;
		this.usageCount = params.usageCount ?? 0;
		this.createdAt = params.createdAt ?? new Date();
		this.updatedAt = params.updatedAt ?? new Date();
	}

	get playerCount(): number {
		return this.playerPool.length;
	}
}
