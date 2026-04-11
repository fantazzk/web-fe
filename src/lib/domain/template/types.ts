/** 게임 종목 */
export type GameType = 'LEAGUE_OF_LEGENDS' | 'VALORANT' | 'OVERWATCH_2' | 'BATTLEGROUNDS';

/** 팀 구성 방식: 경매(포인트 입찰) 또는 드래프트(순차 픽) */
export type TemplateModeType = 'AUCTION' | 'DRAFT';

/** 드래프트 방식 */
export type DraftModeType = 'SEQUENTIAL' | 'SNAKE';

/** 선수 등급 */
export type TierType = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D';

export interface PlayerParams {
	readonly name: string;
	readonly position: string;
	readonly tier?: TierType;
}

export interface TemplateParams {
	readonly id: string;
	readonly name: string;
	readonly gameType: GameType;
	readonly creatorId: string;
	readonly mode: TemplateModeType;
	readonly pickBanTime: number;
	readonly playerPool: readonly PlayerParams[];
	readonly captainsNeeded: number;
	readonly creatorAsCaptain: boolean;

	/** 경매 전용 */
	readonly totalPoints?: number;
	readonly minBidUnit?: number;

	/** 드래프트 전용 */
	readonly draftMode?: DraftModeType;

	readonly usageCount?: number;
	readonly createdAt?: Date;
	readonly updatedAt?: Date;
}
