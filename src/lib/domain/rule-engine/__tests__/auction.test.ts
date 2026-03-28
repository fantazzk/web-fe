import { describe, it, expect } from 'vitest';
import { Auction } from '../auction.ts';
import type { AuctionConfig } from '../types.ts';

function createConfig(overrides?: Partial<AuctionConfig>): AuctionConfig {
	return {
		teamCount: 2,
		totalPoints: 100,
		minBidUnit: 5,
		positionLimit: 2,
		playerPool: [
			{ name: '선수A', position: 'TOP' },
			{ name: '선수B', position: 'MID' },
			{ name: '선수C', position: 'TOP' }
		],
		teamIds: ['team-1', 'team-2'],
		...overrides
	};
}

describe('경매 생성', () => {
	it('create()하면 첫 선수가 자동으로 경매에 올라온다', () => {
		const auction = Auction.create(createConfig());
		expect(auction.phase).toBe('BIDDING');
		expect(auction.currentPlayer).not.toBeNull();
		expect(auction.currentPlayer?.name).toBe('선수A');
	});

	it('팀 수만큼 TeamState가 생성되고 각 팀은 totalPoints를 보유한다', () => {
		const auction = Auction.create(createConfig());
		expect(auction.teams).toHaveLength(2);
		expect(auction.teams[0]?.remainingPoints).toBe(100);
		expect(auction.teams[1]?.remainingPoints).toBe(100);
	});

	it('remainingPool에는 첫 선수를 제외한 나머지가 남는다', () => {
		const auction = Auction.create(createConfig());
		expect(auction.remainingPool).toHaveLength(2);
	});
});
