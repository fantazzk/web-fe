import type { GameType } from '$lib/domain/template';

export interface TemplateSnapshotPlayerType {
	readonly id: string;
	readonly name: string;
	readonly position: string | null;
	readonly tier: string;
}

// 템플릿 → 샌드박스 진입 시 캐시에 저장하는 스냅샷
export interface TemplateSnapshotType {
	name: string;
	gameType: GameType;
	captainsCount: number;
	players: TemplateSnapshotPlayerType[];
}

// 경매 결과
export interface AuctionResultPlayerType {
	name: string;
	position: string;
	price: string;
}

export interface AuctionResultTeamType {
	captain: string;
	players: AuctionResultPlayerType[];
	total: string;
}

// 샌드박스 결과
export interface SandboxResultPlayerType {
	name: string;
	position: string | null;
	tier: string;
}

export interface SandboxResultTeamType {
	captain: string;
	players: SandboxResultPlayerType[];
}

// 판별 유니언 (모드별 결과)
export type ResultSnapshotType =
	| { mode: 'AUCTION'; teams: AuctionResultTeamType[] }
	| { mode: 'DRAFT'; teams: AuctionResultTeamType[] } // TODO: DraftResultTeamType 분리 (별도 이슈)
	| { mode: 'SANDBOX'; teams: SandboxResultTeamType[] };
