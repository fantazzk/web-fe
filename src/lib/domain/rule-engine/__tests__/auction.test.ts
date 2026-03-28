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

describe('입찰', () => {
	it('최고가를 초과하는 유효한 입찰이 반영된다', () => {
		const auction = Auction.create(createConfig());
		const afterBid = auction.placeBid('team-1', 10);
		expect(afterBid.currentBid?.teamId).toBe('team-1');
		expect(afterBid.currentBid?.amount).toBe(10);
		expect(afterBid.phase).toBe('BIDDING');
	});

	it('기존 입찰보다 높은 금액으로 입찰하면 갱신된다', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		const afterSecond = auction.placeBid('team-2', 15);
		expect(afterSecond.currentBid?.teamId).toBe('team-2');
		expect(afterSecond.currentBid?.amount).toBe(15);
	});
});

describe('입찰 검증 - 금액', () => {
	it('최고가 이하 금액이면 BID_TOO_LOW', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		expect(() => auction.placeBid('team-2', 10)).toThrow(
			expect.objectContaining({ code: 'BID_TOO_LOW' })
		);
		expect(() => auction.placeBid('team-2', 5)).toThrow(
			expect.objectContaining({ code: 'BID_TOO_LOW' })
		);
	});

	it('최소 단위에 맞지 않으면 BID_INVALID_UNIT', () => {
		const auction = Auction.create(createConfig({ minBidUnit: 5 }));
		expect(() => auction.placeBid('team-1', 7)).toThrow(
			expect.objectContaining({ code: 'BID_INVALID_UNIT' })
		);
	});

	it('잔여 포인트보다 높은 금액이면 INSUFFICIENT_POINTS', () => {
		const auction = Auction.create(createConfig({ totalPoints: 10 }));
		expect(() => auction.placeBid('team-1', 15)).toThrow(
			expect.objectContaining({ code: 'INSUFFICIENT_POINTS' })
		);
	});

	it('존재하지 않는 팀이면 TEAM_NOT_FOUND', () => {
		const auction = Auction.create(createConfig());
		expect(() => auction.placeBid('unknown-team', 10)).toThrow(
			expect.objectContaining({ code: 'TEAM_NOT_FOUND' })
		);
	});
});

describe('낙찰', () => {
	it('settle()하면 낙찰팀의 포인트가 차감되고 로스터에 선수가 추가된다', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		const settled = auction.settle();
		expect(settled.phase).toBe('SOLD');
		const team1 = settled.teams.find((t) => t.id === 'team-1');
		expect(team1?.remainingPoints).toBe(90);
		expect(team1?.roster).toHaveLength(1);
		expect(team1?.roster[0]?.name).toBe('선수A');
	});

	it('낙찰된 선수는 soldPlayers에 기록된다', () => {
		const settled = Auction.create(createConfig()).placeBid('team-1', 10).settle();
		expect(settled.soldPlayers).toHaveLength(1);
		expect(settled.soldPlayers[0]?.player.name).toBe('선수A');
		expect(settled.soldPlayers[0]?.bid.amount).toBe(10);
	});

	it('입찰 없이 settle()하면 에러', () => {
		const auction = Auction.create(createConfig());
		expect(() => auction.settle()).toThrow(expect.objectContaining({ code: 'NO_CURRENT_PLAYER' }));
	});
});

describe('다음 선수 진행', () => {
	it('startNext()하면 remainingPool에서 다음 선수가 올라온다', () => {
		const next = Auction.create(createConfig()).placeBid('team-1', 10).settle().startNext();
		expect(next.phase).toBe('BIDDING');
		expect(next.currentPlayer?.name).toBe('선수B');
		expect(next.remainingPool).toHaveLength(1);
	});

	it('BIDDING 상태에서 startNext()하면 에러', () => {
		const auction = Auction.create(createConfig());
		expect(() => auction.startNext()).toThrow();
	});
});
