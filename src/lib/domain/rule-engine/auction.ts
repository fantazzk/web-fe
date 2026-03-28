import type { AuctionConfig, AuctionPhase, Bid, TeamState } from './types.ts';
import { Player } from '../template/player.ts';
import { AuctionError } from './errors.ts';

interface AuctionState {
	readonly config: AuctionConfig;
	readonly phase: AuctionPhase;
	readonly currentPlayer: Player | null;
	readonly currentBid: Bid | null;
	readonly teams: readonly TeamState[];
	readonly remainingPool: readonly Player[];
	readonly soldPlayers: readonly { player: Player; bid: Bid }[];
}

export class Auction {
	readonly config: AuctionConfig;
	readonly phase: AuctionPhase;
	readonly currentPlayer: Player | null;
	readonly currentBid: Bid | null;
	readonly teams: readonly TeamState[];
	readonly remainingPool: readonly Player[];
	readonly soldPlayers: readonly { player: Player; bid: Bid }[];

	constructor(state: AuctionState) {
		this.config = state.config;
		this.phase = state.phase;
		this.currentPlayer = state.currentPlayer;
		this.currentBid = state.currentBid;
		this.teams = state.teams;
		this.remainingPool = state.remainingPool;
		this.soldPlayers = state.soldPlayers;
	}

	get isCompleted(): boolean {
		return this.phase === 'COMPLETED';
	}

	static create(config: AuctionConfig): Auction {
		const players = config.playerPool.map((p) => new Player(p));
		const first = players[0];
		if (!first) {
			return new Auction({
				config,
				phase: 'COMPLETED',
				currentPlayer: null,
				currentBid: null,
				teams: config.teamIds.map((id) => ({
					id,
					remainingPoints: config.totalPoints,
					roster: []
				})),
				remainingPool: [],
				soldPlayers: []
			});
		}
		return new Auction({
			config,
			phase: 'BIDDING',
			currentPlayer: first,
			currentBid: null,
			teams: config.teamIds.map((id) => ({
				id,
				remainingPoints: config.totalPoints,
				roster: []
			})),
			remainingPool: players.slice(1),
			soldPlayers: []
		});
	}

	private toState(): AuctionState {
		return {
			config: this.config,
			phase: this.phase,
			currentPlayer: this.currentPlayer,
			currentBid: this.currentBid,
			teams: this.teams,
			remainingPool: this.remainingPool,
			soldPlayers: this.soldPlayers
		};
	}

	private findTeam(teamId: string): TeamState {
		const team = this.teams.find((t) => t.id === teamId);
		if (!team) {
			throw new AuctionError('TEAM_NOT_FOUND');
		}
		return team;
	}

	private updateTeam(teamId: string, updater: (t: TeamState) => TeamState): readonly TeamState[] {
		return this.teams.map((t) => (t.id === teamId ? updater(t) : t));
	}
}
