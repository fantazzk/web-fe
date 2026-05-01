import { describe, it, expect, beforeEach } from 'bun:test';
import { AuctionService } from '$lib/market-engine/application/auction-service';
import { Auction } from '$lib/market-engine/domain/auction/auction';
import type { AuctionId } from '$lib/market-engine/domain/auction/auction';
import type { IAuctionRepository } from '$lib/market-engine/domain/auction/repository-interface';
import { Template } from '$lib/market-engine/domain/template/template';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Category } from '$lib/market-engine/domain/shared/category';

// --- In-memory stubs ---

class InMemoryAuctionRepository implements IAuctionRepository {
	private store = new Map<AuctionId, Auction>();

	async findById(id: AuctionId) {
		return this.store.get(id) ?? null;
	}

	async save(auction: Auction) {
		this.store.set(auction.id, auction);
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

// --- Fixtures ---

const S = new Category('S');

const TEMPLATE = Template.restore({
	id: 'tpl-1',
	name: '자낳대 경매',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	rule: { mode: 'AUCTION', pickBanTime: 30, totalPoints: 1000, minBidUnit: 10, positionLimit: 1 },
	characters: [Character.create('c1', 'Faker', 'MID', S), Character.create('c2', 'Zeus', 'TOP', S)],
	captainsNeeded: 2,
	creatorAsCaptain: false,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
});

// ---

describe('AuctionService', () => {
	let auctionRepo: InMemoryAuctionRepository;
	let templateRepo: InMemoryTemplateRepository;

	beforeEach(() => {
		auctionRepo = new InMemoryAuctionRepository();
		templateRepo = new InMemoryTemplateRepository(TEMPLATE);
	});

	describe('create', () => {
		it('템플릿으로부터 Auction을 생성하고 저장한다', async () => {
			await AuctionService.create(auctionRepo, templateRepo, 'tpl-1', 'auction-1');
			const auction = await auctionRepo.findById('auction-1');
			expect(auction).not.toBeNull();
			expect(auction!.templateId).toBe('tpl-1');
			expect(auction!.phase).toBe('BIDDING');
		});

		it('존재하지 않는 템플릿이면 에러를 던진다', async () => {
			const emptyRepo: ITemplateRepository = {
				findById: async () => null,
				findAll: async () => [],
				save: async () => {}
			};
			expect(AuctionService.create(auctionRepo, emptyRepo, 'no-tpl', 'auction-1')).rejects.toThrow(
				'Template not found'
			);
		});
	});

	describe('placeBid', () => {
		it('입찰을 받아 currentBid를 업데이트한다', async () => {
			await AuctionService.create(auctionRepo, templateRepo, 'tpl-1', 'auction-1');
			const before = await auctionRepo.findById('auction-1');
			const captainId = before!.captains[0]!.id;

			await AuctionService.placeBid(auctionRepo, 'auction-1', 'bid-1', captainId, 100);

			const after = await auctionRepo.findById('auction-1');
			expect(after!.currentBid?.amount).toBe(100);
		});
	});

	describe('settle', () => {
		it('낙찰 후 상태가 SOLD가 된다', async () => {
			await AuctionService.create(auctionRepo, templateRepo, 'tpl-1', 'auction-1');
			const before = await auctionRepo.findById('auction-1');
			const captainId = before!.captains[0]!.id;

			await AuctionService.placeBid(auctionRepo, 'auction-1', 'bid-1', captainId, 100);
			await AuctionService.settle(auctionRepo, 'auction-1');

			const after = await auctionRepo.findById('auction-1');
			expect(after!.phase).toBe('SOLD');
		});
	});

	describe('startNext', () => {
		it('SOLD 후 startNext 호출 시 다음 캐릭터가 currentCharacter가 된다', async () => {
			await AuctionService.create(auctionRepo, templateRepo, 'tpl-1', 'auction-1');
			const before = await auctionRepo.findById('auction-1');
			const captainId = before!.captains[0]!.id;

			await AuctionService.placeBid(auctionRepo, 'auction-1', 'bid-1', captainId, 100);
			await AuctionService.settle(auctionRepo, 'auction-1');
			await AuctionService.startNext(auctionRepo, 'auction-1');

			const after = await auctionRepo.findById('auction-1');
			expect(after!.phase).toBe('BIDDING');
			expect(after!.currentCharacter?.id).toBe('c2');
		});
	});
});
