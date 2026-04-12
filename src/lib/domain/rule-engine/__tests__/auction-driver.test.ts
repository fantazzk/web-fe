import { describe, it, expect } from 'bun:test';
import { Auction } from '../auction.ts';
import type { AuctionConfig } from '../types.ts';
import { processTimerExpiry, processBid } from '../auction-driver.ts';

function createConfig(): AuctionConfig {
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
		teamIds: ['team-1', 'team-2']
	};
}

describe('processBid', () => {
	it('유효한 입찰을 처리하고 갱신된 Auction을 반환한다', () => {
		const auction = Auction.create(createConfig());
		const result = processBid(auction, 'team-1', 10);
		expect(result.auction.currentBid?.teamId).toBe('team-1');
		expect(result.auction.currentBid?.amount).toBe(10);
		expect(result.error).toBeNull();
	});

	it('유효하지 않은 입찰 시 에러 메시지를 반환한다', () => {
		const auction = Auction.create(createConfig());
		const result = processBid(auction, 'team-1', 3); // minBidUnit=5 위반
		expect(result.error).not.toBeNull();
		expect(result.auction).toBe(auction); // 원본 그대로
	});
});

describe('processTimerExpiry', () => {
	it('입찰이 있으면 낙찰 후 다음 선수로 진행한다', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		const next = processTimerExpiry(auction);
		expect(next.phase).toBe('BIDDING');
		expect(next.currentPlayer?.name).toBe('선수B');
	});

	it('입찰이 없으면 유찰 후 다음 선수로 진행하고 유찰 선수는 마지막에 재배치된다', () => {
		const auction = Auction.create(createConfig()); // 입찰 없음
		const next = processTimerExpiry(auction);
		expect(next.phase).toBe('BIDDING');
		expect(next.currentPlayer?.name).toBe('선수B');
		expect(next.remainingPool.at(-1)?.name).toBe('선수A');
	});

	it('모든 선수가 낙찰되면 COMPLETED로 전환한다', () => {
		let auction = Auction.create(createConfig());
		// 선수A 낙찰
		auction = auction.placeBid('team-1', 10);
		auction = processTimerExpiry(auction);
		// 선수B 낙찰
		auction = auction.placeBid('team-2', 10);
		auction = processTimerExpiry(auction);
		// 선수C 낙찰
		auction = auction.placeBid('team-1', 10);
		auction = processTimerExpiry(auction);
		expect(auction.isCompleted).toBe(true);
	});
});
