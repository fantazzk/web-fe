import { Template } from '$lib/market-engine/domain/template/template';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';
import { SandboxBoardController } from '$lib/market-engine/presentation/sandbox-board-controller';
import type { SandboxBoardDto } from '$lib/market-engine/presentation/sandbox-board-controller';
import type { ISandboxBoardRepository } from '$lib/market-engine/domain/sandbox-board/repository-interface';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { TemplateSnapshotType, SandboxResultTeamType } from '$lib/types/snapshot';

class SandboxStore {
	board = $state<SandboxBoardDto | null>(null);
	positionFilter = $state<string>('ALL');

	private boards = new Map<string, SandboxBoard>();
	private templates = new Map<string, Template>();

	private readonly boardRepo: ISandboxBoardRepository = {
		findById: async (id) => this.boards.get(id) ?? null,
		save: async (b) => {
			this.boards.set(b.id, b);
		}
	};

	private readonly templateRepo: ITemplateRepository = {
		findById: async (id) => this.templates.get(id) ?? null,
		findAll: async () => [...this.templates.values()],
		save: async (t) => {
			this.templates.set(t.id, t);
		}
	};

	async bootstrap(templateId: string, snapshot: TemplateSnapshotType): Promise<void> {
		const template = buildTemplate(templateId, snapshot);
		this.templates.set(template.id, template);
		this.board = await SandboxBoardController.create(
			this.boardRepo,
			this.templateRepo,
			templateId,
			templateId
		);
		this.positionFilter = 'ALL';
	}

	async assignOrMove(playerId: string, captainId: string): Promise<void> {
		if (!this.board) return;
		const inPool = this.board.pool.some((p) => p.id === playerId);
		this.board = inPool
			? await SandboxBoardController.assign(this.boardRepo, this.board.id, playerId, captainId)
			: await SandboxBoardController.move(this.boardRepo, this.board.id, playerId, captainId);
	}

	async unassign(playerId: string): Promise<void> {
		if (!this.board) return;
		const inPool = this.board.pool.some((p) => p.id === playerId);
		if (inPool) return;
		this.board = await SandboxBoardController.unassign(this.boardRepo, this.board.id, playerId);
	}

	setPositionFilter(position: string): void {
		this.positionFilter = position;
	}

	toResultTeams(): SandboxResultTeamType[] | null {
		if (!this.board) return null;
		const board = this.board;
		return board.captains.map((captain) => ({
			captain: captain.name,
			players: (board.rosters[captain.id] ?? []).map((c) => ({
				name: c.name,
				position: c.position,
				tier: ''
			}))
		}));
	}

	reset(): void {
		this.board = null;
		this.positionFilter = 'ALL';
		this.boards.clear();
		this.templates.clear();
	}
}

function buildTemplate(templateId: string, snapshot: TemplateSnapshotType): Template {
	const characters = snapshot.players.map((p) =>
		Character.create(p.id, p.name, p.position, Role.PLAYER)
	);
	return Template.create({
		id: templateId,
		name: snapshot.name,
		gameType: snapshot.gameType,
		creatorId: '',
		rule: { mode: 'SANDBOX' },
		characters,
		captainsNeeded: snapshot.captainsCount,
		creatorAsCaptain: false
	});
}

export const sandboxStore = new SandboxStore();
