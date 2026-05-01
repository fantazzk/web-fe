import { describe, it, expect } from 'bun:test';
import { AuctionFactory } from '../auction-factory';
import { Template } from '../../template/template';
import { Character } from '../../shared/character';
import { Category } from '../../shared/category';

const S = new Category('S');

const AUCTION_TEMPLATE = Template.restore({
	id: 'tpl-1',
	name: '자낳대 경매',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	rule: { mode: 'AUCTION', pickBanTime: 30, totalPoints: 1000, minBidUnit: 10, positionLimit: 1 },
	characters: [
		Character.create('c1', 'Faker', 'MID', S),
		Character.create('c2', 'Zeus', 'TOP', S),
		Character.create('c3', 'Oner', 'JG', S)
	],
	captainsNeeded: 2,
	creatorAsCaptain: false,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
});

const SANDBOX_TEMPLATE = Template.restore({
	id: 'tpl-2',
	name: '자낳대 샌드박스',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	rule: { mode: 'SANDBOX' },
	characters: [],
	captainsNeeded: 2,
	creatorAsCaptain: false,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
});

describe('AuctionFactory', () => {
	it('AUCTION 템플릿으로부터 Auction을 생성한다', () => {
		const auction = AuctionFactory.create(AUCTION_TEMPLATE, 'auction-1');
		expect(auction.id).toBe('auction-1');
		expect(auction.templateId).toBe('tpl-1');
	});

	it('템플릿 규칙의 totalPoints/minBidUnit/positionLimit을 스냅샷한다', () => {
		const auction = AuctionFactory.create(AUCTION_TEMPLATE, 'auction-1');
		expect(auction.totalPoints).toBe(1000);
		expect(auction.minBidUnit).toBe(10);
		expect(auction.positionLimit).toBe(1);
	});

	it('captainsNeeded만큼 감독이 생성된다', () => {
		const auction = AuctionFactory.create(AUCTION_TEMPLATE, 'auction-1');
		expect(auction.captains).toHaveLength(2);
	});

	it('AUCTION 모드가 아닌 템플릿은 거부한다', () => {
		expect(() => AuctionFactory.create(SANDBOX_TEMPLATE, 'auction-1')).toThrow();
	});
});
