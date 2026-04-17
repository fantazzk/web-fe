import type { GameType, TemplateModeType, DraftModeType, TemplateParams } from './types.ts';
import { Player } from './player.ts';

export class Template {
	readonly id: string;
	readonly name: string;
	readonly gameType: GameType;
	readonly creatorId: string;
	readonly mode: TemplateModeType;
	readonly pickBanTime: number;
	readonly playerPool: readonly Player[];
	readonly captainsNeeded: number;
	readonly creatorAsCaptain: boolean;

	/** 경매 전용 */
	readonly totalPoints?: number | undefined;
	readonly minBidUnit?: number | undefined;

	/** 드래프트 전용 */
	readonly draftMode?: DraftModeType | undefined;

	readonly usageCount: number;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	constructor(params: TemplateParams) {
		this.id = params.id;
		this.name = params.name;
		this.gameType = params.gameType;
		this.creatorId = params.creatorId;
		this.mode = params.mode;
		this.pickBanTime = params.pickBanTime;
		this.playerPool = params.playerPool.map((p) => new Player(p));
		this.captainsNeeded = params.captainsNeeded;
		this.creatorAsCaptain = params.creatorAsCaptain;
		this.totalPoints = params.totalPoints;
		this.minBidUnit = params.minBidUnit;
		this.draftMode = params.draftMode;
		this.usageCount = params.usageCount ?? 0;
		this.createdAt = params.createdAt ?? new Date();
		this.updatedAt = params.updatedAt ?? new Date();
	}

	get playerCount(): number {
		return this.playerPool.length;
	}

	static getCompletionRate(data: {
		name: string;
		gameType: GameType;
		pickBanTime: number;
		mode: TemplateModeType;
		totalPoints?: number;
		minBid?: number;
		players: readonly { name: string }[];
		captainsNeeded: number;
	}): { steps: number[]; percent: number } {
		const step1 = data.name.trim() && data.gameType ? 100 : data.name.trim() ? 50 : 0;

		let step2Fields = 0;
		let step2Total = 1;
		if (data.pickBanTime > 0) step2Fields++;
		if (data.mode === 'AUCTION') {
			step2Total = 3;
			if ((data.totalPoints ?? 0) > 0) step2Fields++;
			if ((data.minBid ?? 0) > 0) step2Fields++;
		}
		const step2 = Math.round((step2Fields / step2Total) * 100);

		const step3 =
			data.players.length === 0
				? 0
				: Math.round(
						(data.players.filter((p) => p.name.trim()).length / data.players.length) * 100
					);

		const step4 = data.captainsNeeded > 0 ? 100 : 0;

		const steps = [step1, step2, step3, step4];
		const percent = Math.round(steps.reduce((a, b) => a + b, 0) / steps.length);

		return { steps, percent };
	}
}
