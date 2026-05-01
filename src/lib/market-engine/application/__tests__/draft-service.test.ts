import { describe, it, expect, beforeEach } from 'bun:test';
import { DraftService } from '$lib/market-engine/application/draft-service';
import { Draft } from '$lib/market-engine/domain/draft/draft';
import type { DraftId } from '$lib/market-engine/domain/draft/draft';
import type { IDraftRepository } from '$lib/market-engine/domain/draft/repository-interface';
import { Template } from '$lib/market-engine/domain/template/template';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';

class InMemoryDraftRepository implements IDraftRepository {
	private store = new Map<DraftId, Draft>();

	async findById(id: DraftId) {
		return this.store.get(id) ?? null;
	}

	async save(draft: Draft) {
		this.store.set(draft.id, draft);
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
	name: '치지직컵',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	rule: { mode: 'DRAFT', pickBanTime: 30, draftMode: 'SEQUENTIAL' },
	characters: [
		Character.create('c1', 'Faker', 'MID', Role.PLAYER),
		Character.create('c2', 'Zeus', 'TOP', Role.PLAYER),
		Character.create('c3', 'Oner', 'JG', Role.PLAYER),
		Character.create('c4', 'Gumayusi', 'ADC', Role.PLAYER)
	],
	captainsNeeded: 2,
	creatorAsCaptain: false,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
});

describe('DraftService', () => {
	let draftRepo: InMemoryDraftRepository;
	let templateRepo: InMemoryTemplateRepository;

	beforeEach(() => {
		draftRepo = new InMemoryDraftRepository();
		templateRepo = new InMemoryTemplateRepository(TEMPLATE);
	});

	describe('create', () => {
		it('템플릿으로부터 Draft를 생성하고 저장한다', async () => {
			await DraftService.create(draftRepo, templateRepo, 'tpl-1', 'draft-1');
			const draft = await draftRepo.findById('draft-1');
			expect(draft).not.toBeNull();
			expect(draft!.templateId).toBe('tpl-1');
			expect(draft!.captains).toHaveLength(2);
			expect(draft!.pendingQueue).toHaveLength(4);
		});

		it('존재하지 않는 템플릿이면 에러를 던진다', async () => {
			const emptyRepo: ITemplateRepository = {
				findById: async () => null,
				findAll: async () => [],
				save: async () => {}
			};
			expect(DraftService.create(draftRepo, emptyRepo, 'no-tpl', 'draft-1')).rejects.toThrow(
				'Template not found'
			);
		});
	});

	describe('pick', () => {
		it('현재 감독이 캐릭터를 픽한다', async () => {
			await DraftService.create(draftRepo, templateRepo, 'tpl-1', 'draft-1');
			const before = await draftRepo.findById('draft-1');
			const cap1 = before!.captains[0]!.id;

			await DraftService.pick(draftRepo, 'draft-1', 'pick-1', cap1, 'c1');

			const after = await draftRepo.findById('draft-1');
			expect(after!.pickHistory).toHaveLength(1);
			expect(after!.pickHistory[0]!.id).toBe('pick-1');
			expect(after!.pickHistory[0]!.characterId).toBe('c1');
			expect(after!.pendingQueue).toHaveLength(3);
		});
	});

	describe('autoPick', () => {
		it('pendingQueue 첫 번째 캐릭터를 자동 픽한다', async () => {
			await DraftService.create(draftRepo, templateRepo, 'tpl-1', 'draft-1');
			await DraftService.autoPick(draftRepo, 'draft-1', 'pick-auto-1');
			const after = await draftRepo.findById('draft-1');
			expect(after!.pickHistory).toHaveLength(1);
			expect(after!.pickHistory[0]!.id).toBe('pick-auto-1');
			expect(after!.pickHistory[0]!.characterId).toBe('c1');
		});
	});
});
