import type { GameType, TemplateModeType } from './types.ts';
import type { TemplateInputType } from './validate.ts';

// TODO: 백엔드 OpenAPI 스펙 확장 후 변경
// - gameType: VALORANT/BATTLEGROUNDS 포함 4종으로 서버 enum 확장 예정
// - PlayerRequest에 tier 필드 추가 예정
export interface CreateTemplateRequestType {
	name: string;
	gameType: GameType;
	mode: TemplateModeType;
	teamCount: number;
	pickBanTime: number;
	budget?: number;
	minBidUnit?: number;
	draftOrderStrategy?: 'SNAKE' | 'FIXED';
	players: { name: string; position: string }[];
}

export interface TemplateResponseType {
	id: string;
	name: string;
	gameType: string;
	mode: TemplateModeType;
}

export function toCreateTemplateRequest(data: TemplateInputType): CreateTemplateRequestType {
	const base: CreateTemplateRequestType = {
		name: data.name,
		gameType: data.gameType,
		mode: data.mode,
		teamCount: data.captainsNeeded,
		pickBanTime: data.pickBanTime,
		// TODO: 백엔드 PlayerRequest에 tier 필드 추가되면 여기에 tier 포함
		players: data.players.map((p) => ({ name: p.name, position: p.position }))
	};

	if (data.mode === 'AUCTION') {
		const result: CreateTemplateRequestType = { ...base };
		if (data.totalPoints !== undefined) result.budget = data.totalPoints;
		if (data.minBid !== undefined) result.minBidUnit = data.minBid;
		return result;
	}

	return {
		...base,
		draftOrderStrategy: data.draftMode === 'SEQUENTIAL' ? 'FIXED' : 'SNAKE'
	};
}
