import type { SandboxResultPlayerType, SandboxResultTeamType } from '$lib/domain/sandbox';

// 경매 결과 (기존 ResultPlayer / ResultTeam rename)
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

// 도메인에서 re-export
export type { SandboxResultPlayerType, SandboxResultTeamType };

// 판별 유니언 (모드별 결과)
export type ResultSnapshotType =
	| { mode: 'AUCTION'; teams: AuctionResultTeamType[] }
	| { mode: 'DRAFT'; teams: AuctionResultTeamType[] } // TODO: DraftResultTeamType 분리 (별도 이슈)
	| { mode: 'SANDBOX'; teams: SandboxResultTeamType[] };
