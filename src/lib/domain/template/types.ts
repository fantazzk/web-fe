/** 게임 종목 */
export type GameType = 'LEAGUE_OF_LEGENDS' | 'VALORANT' | 'OVERWATCH_2' | 'BATTLEGROUNDS';

/** 팀 구성 방식: 경매(포인트 입찰) 또는 드래프트(순차 픽) */
export type TemplateModeType = 'AUCTION' | 'DRAFT';

/** 드래프트 방식 */
export type DraftModeType = 'SEQUENTIAL' | 'SNAKE';

/** 선수 등급 */
export type TierType = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D';

/** 종목별 포지션 */
export type LeaguePositionType = 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
export type ValorantPositionType = 'DUELIST' | 'INITIATOR' | 'CONTROLLER' | 'SENTINEL';
export type OverwatchPositionType = 'TANK' | 'DPS' | 'SUPPORT';

export type GamePositionType = LeaguePositionType | ValorantPositionType | OverwatchPositionType;

interface PositionOptionType {
	readonly value: GamePositionType;
	readonly label: string;
}

/** 종목별 포지션 목록 */
export const POSITIONS_BY_GAME: Record<GameType, readonly PositionOptionType[]> = {
	LEAGUE_OF_LEGENDS: [
		{ value: 'TOP', label: 'TOP' },
		{ value: 'JUNGLE', label: 'JGL' },
		{ value: 'MID', label: 'MID' },
		{ value: 'ADC', label: 'ADC' },
		{ value: 'SUPPORT', label: 'SUP' }
	],
	VALORANT: [
		{ value: 'DUELIST', label: 'DUE' },
		{ value: 'INITIATOR', label: 'INI' },
		{ value: 'CONTROLLER', label: 'CON' },
		{ value: 'SENTINEL', label: 'SEN' }
	],
	OVERWATCH_2: [
		{ value: 'TANK', label: 'TANK' },
		{ value: 'DPS', label: 'DPS' },
		{ value: 'SUPPORT', label: 'SUP' }
	],
	BATTLEGROUNDS: []
};

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
