import type { GamePositionType } from '$lib/domain/template';

export interface SandboxPlayerType {
	readonly id: string;
	readonly name: string;
	readonly position: GamePositionType | null;
	readonly tier: string;
}

export interface SandboxCaptainType {
	readonly id: string;
	readonly name: string;
}

export interface SandboxBoardParamsType {
	readonly templateId: string;
	readonly captains: readonly SandboxCaptainType[];
	readonly pool: readonly SandboxPlayerType[];
	readonly rosters: Readonly<Record<string, readonly SandboxPlayerType[]>>;
}

/** 결과 스냅샷용 (toResult 반환 타입) */
export interface SandboxResultPlayerType {
	name: string;
	position: string | null;
	tier: string;
}

export interface SandboxResultTeamType {
	captain: string;
	players: SandboxResultPlayerType[];
}
