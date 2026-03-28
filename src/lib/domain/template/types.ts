/** 게임 종목 */
export type GameType = 'LEAGUE_OF_LEGENDS' | 'VALORANT' | 'PUBG';

/** 팀 구성 방식: 경매(포인트 입찰) 또는 드래프트(순차 픽) */
export type TemplateMode = 'AUCTION' | 'DRAFT';

/** 대회 매치 포맷 */
export type MatchFormat = 'BO1' | 'BO3' | 'BO5';

/** 티어 밸런싱 방식 */
export type TierBalancing = 'AUTO' | 'MANUAL';

/** 팀장 선출 방식 */
export type CaptainSelectMode = 'VOTE' | 'ADMIN_PICK';

export interface PlayerParams {
	readonly name: string;
	readonly position: string;
}

export interface TemplateParams {
	readonly id: string;
	readonly name: string;
	readonly gameType: GameType;
	readonly creatorId: string;
	readonly mode: TemplateMode;
	readonly matchFormat: MatchFormat;
	readonly pickBanTime: number;
	readonly restrictions: string;
	readonly playerPool: readonly PlayerParams[];
	readonly tierBalancing: TierBalancing;
	readonly captainSelectMode: CaptainSelectMode;
	readonly captainsNeeded: number;
	readonly isPublic: boolean;
	readonly usageCount?: number;
	readonly createdAt?: Date;
	readonly updatedAt?: Date;
}
