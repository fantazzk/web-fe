import type {
	DraftConfig,
	DraftPhase,
	DraftTeamState,
	DraftType,
	PickRecord
} from './draft-types.ts';
import { Player } from '../template/player.ts';
import { DraftError } from './draft-errors.ts';

interface DraftState {
	readonly config: DraftConfig;
	readonly phase: DraftPhase;
	readonly currentPickIndex: number;
	readonly pickOrder: readonly string[];
	readonly teams: readonly DraftTeamState[];
	readonly remainingPool: readonly Player[];
	readonly pickHistory: readonly PickRecord[];
}

function buildPickOrder(
	teamIds: readonly string[],
	rounds: number,
	draftType: DraftType
): string[] {
	const order: string[] = [];
	for (let round = 0; round < rounds; round++) {
		if (draftType === 'SNAKE' && round % 2 === 1) {
			order.push(...[...teamIds].reverse());
		} else {
			order.push(...teamIds);
		}
	}
	return order;
}

export class Draft {
	readonly config: DraftConfig;
	readonly phase: DraftPhase;
	readonly currentPickIndex: number;
	readonly pickOrder: readonly string[];
	readonly teams: readonly DraftTeamState[];
	readonly remainingPool: readonly Player[];
	readonly pickHistory: readonly PickRecord[];

	constructor(state: DraftState) {
		this.config = state.config;
		this.phase = state.phase;
		this.currentPickIndex = state.currentPickIndex;
		this.pickOrder = state.pickOrder;
		this.teams = state.teams;
		this.remainingPool = state.remainingPool;
		this.pickHistory = state.pickHistory;
	}

	get currentTeamId(): string | null {
		if (this.phase === 'COMPLETED') {
			return null;
		}
		const teamId = this.pickOrder[this.currentPickIndex];
		return teamId ?? null;
	}

	get currentRound(): number {
		return Math.floor(this.currentPickIndex / this.config.teamCount) + 1;
	}

	get isCompleted(): boolean {
		return this.phase === 'COMPLETED';
	}

	pick(teamId: string, playerName: string): Draft {
		if (this.phase !== 'PICKING') {
			throw new DraftError('NOT_PICKING_PHASE');
		}
		if (teamId !== this.currentTeamId) {
			throw new DraftError('NOT_YOUR_TURN');
		}

		const team = this.teams.find((t) => t.id === teamId);
		if (!team) {
			throw new DraftError('TEAM_NOT_FOUND');
		}

		const playerIndex = this.remainingPool.findIndex((p) => p.name === playerName);
		if (playerIndex === -1) {
			throw new DraftError('PLAYER_NOT_FOUND');
		}

		const player = this.remainingPool[playerIndex]!;
		const record: PickRecord = {
			player: { name: player.name, position: player.position },
			teamId,
			round: this.currentRound
		};

		const updatedTeams = this.teams.map((t) =>
			t.id === teamId
				? { ...t, roster: [...t.roster, { name: player.name, position: player.position }] }
				: t
		);

		const updatedPool = [
			...this.remainingPool.slice(0, playerIndex),
			...this.remainingPool.slice(playerIndex + 1)
		];

		const nextIndex = this.currentPickIndex + 1;
		const isComplete = nextIndex >= this.pickOrder.length;

		return new Draft({
			...this.toState(),
			phase: isComplete ? 'COMPLETED' : 'PICKING',
			currentPickIndex: nextIndex,
			teams: updatedTeams,
			remainingPool: updatedPool,
			pickHistory: [...this.pickHistory, record]
		});
	}

	autoPick(): Draft {
		if (this.phase !== 'PICKING') {
			throw new DraftError('NOT_PICKING_PHASE');
		}
		const currentTeam = this.currentTeamId;
		if (!currentTeam) {
			throw new DraftError('NOT_PICKING_PHASE');
		}
		const firstPlayer = this.remainingPool[0];
		if (!firstPlayer) {
			throw new DraftError('PLAYER_NOT_FOUND');
		}
		return this.pick(currentTeam, firstPlayer.name);
	}

	static create(config: DraftConfig): Draft {
		const pickOrder = buildPickOrder(config.teamIds, config.rounds, config.draftType);
		const players = config.playerPool.map((p) => new Player(p));

		if (players.length === 0 || pickOrder.length === 0) {
			return new Draft({
				config,
				phase: 'COMPLETED',
				currentPickIndex: 0,
				pickOrder,
				teams: config.teamIds.map((id) => ({ id, roster: [] })),
				remainingPool: [],
				pickHistory: []
			});
		}

		return new Draft({
			config,
			phase: 'PICKING',
			currentPickIndex: 0,
			pickOrder,
			teams: config.teamIds.map((id) => ({ id, roster: [] })),
			remainingPool: players,
			pickHistory: []
		});
	}

	private toState(): DraftState {
		return {
			config: this.config,
			phase: this.phase,
			currentPickIndex: this.currentPickIndex,
			pickOrder: this.pickOrder,
			teams: this.teams,
			remainingPool: this.remainingPool,
			pickHistory: this.pickHistory
		};
	}
}
