import type { GameType } from '$lib/domain/template';
import type { SandboxPlayerType, SandboxResultTeamType } from '$lib/domain/sandbox';

// 템플릿 → 샌드박스 진입 시 캐시에 저장하는 스냅샷
export interface TemplateSnapshotType {
	name: string;
	gameType: GameType;
	captainsCount: number;
	players: SandboxPlayerType[];
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

// 판별 유니언 (모드별 결과)
export type ResultSnapshotType =
	| { mode: 'AUCTION'; teams: AuctionResultTeamType[] }
	| { mode: 'DRAFT'; teams: AuctionResultTeamType[] } // TODO: DraftResultTeamType 분리 (별도 이슈)
	| { mode: 'SANDBOX'; teams: SandboxResultTeamType[] };
