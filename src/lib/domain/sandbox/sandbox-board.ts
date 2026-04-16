import type {
	SandboxBoardParamsType,
	SandboxCaptainType,
	SandboxPlayerType,
	SandboxResultTeamType
} from './types.ts';
import { SandboxError } from './errors.ts';

export class SandboxBoard {
	readonly templateId: string;
	readonly captains: readonly SandboxCaptainType[];
	readonly pool: readonly SandboxPlayerType[];
	readonly rosters: Readonly<Record<string, readonly SandboxPlayerType[]>>;

	constructor(params: SandboxBoardParamsType) {
		this.templateId = params.templateId;
		this.captains = params.captains;
		this.pool = params.pool;
		this.rosters = params.rosters;
	}

	static create(params: {
		templateId: string;
		captainsCount: number;
		players: readonly SandboxPlayerType[];
	}): SandboxBoard {
		const captains: SandboxCaptainType[] = Array.from({ length: params.captainsCount }, (_, i) => ({
			id: `captain-${i + 1}`,
			name: `감독 ${i + 1}`
		}));
		const rosters: Record<string, readonly SandboxPlayerType[]> = {};
		for (const captain of captains) {
			rosters[captain.id] = [];
		}
		return new SandboxBoard({
			templateId: params.templateId,
			captains,
			pool: [...params.players],
			rosters
		});
	}

	assign(playerId: string, toCaptainId: string): SandboxBoard {
		if (!this.captains.some((c) => c.id === toCaptainId)) {
			throw new SandboxError('CAPTAIN_NOT_FOUND');
		}
		const playerIndex = this.pool.findIndex((p) => p.id === playerId);
		if (playerIndex === -1) {
			throw new SandboxError('PLAYER_NOT_IN_POOL');
		}
		const player = this.pool[playerIndex]!;
		const nextPool = [...this.pool.slice(0, playerIndex), ...this.pool.slice(playerIndex + 1)];
		const nextRosters = { ...this.rosters };
		nextRosters[toCaptainId] = [...(nextRosters[toCaptainId] ?? []), player];
		return new SandboxBoard({
			templateId: this.templateId,
			captains: this.captains,
			pool: nextPool,
			rosters: nextRosters
		});
	}

	unassign(playerId: string): SandboxBoard {
		let found: SandboxPlayerType | null = null;
		let fromCaptainId: string | null = null;
		for (const captain of this.captains) {
			const roster = this.rosters[captain.id] ?? [];
			const player = roster.find((p) => p.id === playerId);
			if (player) {
				found = player;
				fromCaptainId = captain.id;
				break;
			}
		}
		if (!found || !fromCaptainId) {
			throw new SandboxError('PLAYER_NOT_IN_ROSTER');
		}
		const nextRosters = { ...this.rosters };
		nextRosters[fromCaptainId] = (nextRosters[fromCaptainId] ?? []).filter(
			(p) => p.id !== playerId
		);
		return new SandboxBoard({
			templateId: this.templateId,
			captains: this.captains,
			pool: [...this.pool, found],
			rosters: nextRosters
		});
	}

	move(playerId: string, toCaptainId: string): SandboxBoard {
		if (!this.captains.some((c) => c.id === toCaptainId)) {
			throw new SandboxError('CAPTAIN_NOT_FOUND');
		}
		let found: SandboxPlayerType | null = null;
		let fromCaptainId: string | null = null;
		for (const captain of this.captains) {
			const roster = this.rosters[captain.id] ?? [];
			const player = roster.find((p) => p.id === playerId);
			if (player) {
				found = player;
				fromCaptainId = captain.id;
				break;
			}
		}
		if (!found || !fromCaptainId) {
			throw new SandboxError('PLAYER_NOT_IN_ROSTER');
		}
		const nextRosters = { ...this.rosters };
		nextRosters[fromCaptainId] = (nextRosters[fromCaptainId] ?? []).filter(
			(p) => p.id !== playerId
		);
		nextRosters[toCaptainId] = [...(nextRosters[toCaptainId] ?? []), found];
		return new SandboxBoard({
			templateId: this.templateId,
			captains: this.captains,
			pool: this.pool,
			rosters: nextRosters
		});
	}

	toResult(): SandboxResultTeamType[] {
		return this.captains.map((captain) => ({
			captain: captain.name,
			players: (this.rosters[captain.id] ?? []).map((p) => ({
				name: p.name,
				position: p.position as string | null,
				tier: p.tier
			}))
		}));
	}
}
