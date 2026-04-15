import type { GameType, TemplateModeType, DraftModeType, TierType } from './types.ts';
import { POSITIONS_BY_GAME } from './types.ts';

export type TemplateValidationErrorType =
	| 'NAME_REQUIRED'
	| 'PICK_BAN_TIME_INVALID'
	| 'PLAYERS_TOO_FEW'
	| 'PLAYER_NAME_REQUIRED'
	| 'PLAYER_POSITION_REQUIRED'
	| 'CAPTAINS_INVALID'
	| 'PLAYERS_LESS_THAN_CAPTAINS'
	| 'AUCTION_BUDGET_INVALID'
	| 'AUCTION_MIN_BID_INVALID';

export interface TemplateInputType {
	name: string;
	gameType: GameType;
	mode: TemplateModeType;
	pickBanTime: number;
	players: readonly { name: string; position: string; tier?: TierType }[];
	captainsNeeded: number;
	totalPoints?: number;
	minBid?: number;
	draftMode?: DraftModeType;
}

export function validateTemplateInput(
	data: TemplateInputType
): TemplateValidationErrorType | null {
	if (!data.name.trim()) return 'NAME_REQUIRED';
	if (data.pickBanTime <= 0) return 'PICK_BAN_TIME_INVALID';
	if (data.players.length < 2) return 'PLAYERS_TOO_FEW';
	if (data.players.some((p) => !p.name.trim())) return 'PLAYER_NAME_REQUIRED';
	const positions = POSITIONS_BY_GAME[data.gameType];
	if (positions.length > 0 && data.players.some((p) => !p.position)) {
		return 'PLAYER_POSITION_REQUIRED';
	}
	if (data.captainsNeeded < 2) return 'CAPTAINS_INVALID';
	if (data.players.length < data.captainsNeeded) return 'PLAYERS_LESS_THAN_CAPTAINS';
	if (data.mode === 'AUCTION') {
		if ((data.totalPoints ?? 0) <= 0) return 'AUCTION_BUDGET_INVALID';
		const minBid = data.minBid ?? 0;
		const total = data.totalPoints ?? 0;
		if (minBid <= 0 || minBid > total) return 'AUCTION_MIN_BID_INVALID';
	}
	return null;
}
