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

	placeBid(teamId: string, amount: number): Auction {
		if (this.phase !== 'BIDDING') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}
		if (!this.currentPlayer) {
			throw new AuctionError('NO_CURRENT_PLAYER');
		}
		const team = this.findTeam(teamId);

		if (amount % this.config.minBidUnit !== 0) {
			throw new AuctionError('BID_INVALID_UNIT');
		}
		if (amount > team.remainingPoints) {
			throw new AuctionError('INSUFFICIENT_POINTS');
		}
		if (this.currentBid !== null && amount <= this.currentBid.amount) {
			throw new AuctionError('BID_TOO_LOW');
		}
		if (this.currentBid === null && amount <= 0) {
			throw new AuctionError('BID_TOO_LOW');
		}

		const positionCount = team.roster.filter(
			(p) => p.position === this.currentPlayer!.position
		).length;
		if (positionCount >= this.config.positionLimit) {
			throw new AuctionError('POSITION_LIMIT_REACHED');
		}

		return new Auction({
			...this.toState(),
			currentBid: { teamId, amount }
		});
	}

	settle(): Auction {
		if (this.phase !== 'BIDDING') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}
		if (!this.currentPlayer || !this.currentBid) {
			throw new AuctionError('NO_CURRENT_PLAYER');
		}

		const player = this.currentPlayer;
		const bid = this.currentBid;

		const updatedTeams = this.updateTeam(bid.teamId, (t) => ({
			...t,
			remainingPoints: t.remainingPoints - bid.amount,
			roster: [...t.roster, { name: player.name, position: player.position }]
		}));

		return new Auction({
			...this.toState(),
			phase: 'SOLD',
			currentPlayer: null,
			currentBid: null,
			teams: updatedTeams,
			soldPlayers: [...this.soldPlayers, { player, bid }]
		});
	}

	startNext(): Auction {
		if (this.phase === 'COMPLETED') {
			throw new AuctionError('AUCTION_ALREADY_COMPLETED');
		}
		if (this.phase !== 'SOLD' && this.phase !== 'UNSOLD') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}

		const next = this.remainingPool[0];
		if (!next) {
			return new Auction({
				...this.toState(),
				phase: 'COMPLETED',
				currentPlayer: null,
				currentBid: null,
				remainingPool: []
			});
		}

		return new Auction({
			...this.toState(),
			phase: 'BIDDING',
			currentPlayer: next,
			currentBid: null,
			remainingPool: this.remainingPool.slice(1)
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
