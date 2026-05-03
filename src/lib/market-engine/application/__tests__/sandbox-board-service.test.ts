import { describe, it, expect, beforeEach } from 'bun:test';
import { SandboxBoardService } from '$lib/market-engine/application/sandbox-board-service';
import { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { SandboxBoardId } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { ISandboxBoardRepository } from '$lib/market-engine/domain/sandbox-board/repository-interface';
import { Template } from '$lib/market-engine/domain/template/template';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';

class InMemoryBoardRepository implements ISandboxBoardRepository {
	private store = new Map<SandboxBoardId, SandboxBoard>();

	async findById(id: SandboxBoardId) {
		return this.store.get(id) ?? null;
	}

	async save(board: SandboxBoard) {
		this.store.set(board.id, board);
	}
}

class InMemoryTemplateRepository implements ITemplateRepository {
	constructor(private readonly template: Template) {}

	async findById(_id: TemplateId) {
		return this.template;
	}

	async findAll() {
		return [this.template];
	}

	async save(_template: Template) {}
}

const TEMPLATE = Template.restore({
	id: 'tpl-1',
	name: '자낳대',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	rule: { mode: 'SANDBOX' },
	characters: [
		Character.create('c1', 'Faker', 'MID', Role.PLAYER),
		Character.create('c2', 'Zeus', 'TOP', Role.PLAYER)
	],
	captainsNeeded: 2,
	creatorAsCaptain: false,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
});

describe('SandboxBoardService', () => {
	let boardRepo: InMemoryBoardRepository;
	let templateRepo: InMemoryTemplateRepository;

	beforeEach(() => {
		boardRepo = new InMemoryBoardRepository();
		templateRepo = new InMemoryTemplateRepository(TEMPLATE);
	});

	describe('create', () => {
		it('템플릿으로부터 SandboxBoard를 생성하고 저장한다', async () => {
			await SandboxBoardService.create(boardRepo, templateRepo, 'tpl-1', 'board-1');
			const board = await boardRepo.findById('board-1');
			expect(board).not.toBeNull();
			expect(board!.templateId).toBe('tpl-1');
			expect(board!.pool).toHaveLength(2);
		});

		it('존재하지 않는 템플릿이면 에러를 던진다', async () => {
			const emptyRepo: ITemplateRepository = {
				findById: async () => null,
				findAll: async () => [],
				save: async () => {}
			};
			expect(SandboxBoardService.create(boardRepo, emptyRepo, 'no-tpl', 'board-1')).rejects.toThrow(
				'Template not found'
			);
		});
	});

	describe('assign', () => {
		it('캐릭터를 감독 로스터에 배정한다', async () => {
			await SandboxBoardService.create(boardRepo, templateRepo, 'tpl-1', 'board-1');
			const before = await boardRepo.findById('board-1');
			const captainId = before!.captains[0]!.id;

			await SandboxBoardService.assign(boardRepo, 'board-1', 'c1', captainId);

			const after = await boardRepo.findById('board-1');
			expect(after!.rosters[captainId]).toHaveLength(1);
			expect(after!.pool).toHaveLength(1);
		});
	});

	describe('unassign', () => {
		it('로스터에서 캐릭터를 pool로 되돌린다', async () => {
			await SandboxBoardService.create(boardRepo, templateRepo, 'tpl-1', 'board-1');
			const before = await boardRepo.findById('board-1');
			const captainId = before!.captains[0]!.id;

			await SandboxBoardService.assign(boardRepo, 'board-1', 'c1', captainId);
			await SandboxBoardService.unassign(boardRepo, 'board-1', 'c1');

			const after = await boardRepo.findById('board-1');
			expect(after!.rosters[captainId]).toHaveLength(0);
			expect(after!.pool).toHaveLength(2);
		});
	});

	describe('move', () => {
		it('캐릭터를 다른 감독 로스터로 이동한다', async () => {
			await SandboxBoardService.create(boardRepo, templateRepo, 'tpl-1', 'board-1');
			const before = await boardRepo.findById('board-1');
			const cap1 = before!.captains[0]!.id;
			const cap2 = before!.captains[1]!.id;

			await SandboxBoardService.assign(boardRepo, 'board-1', 'c1', cap1);
			await SandboxBoardService.move(boardRepo, 'board-1', 'c1', cap2);

			const after = await boardRepo.findById('board-1');
			expect(after!.rosters[cap1]).toHaveLength(0);
			expect(after!.rosters[cap2]).toHaveLength(1);
		});
	});
});
