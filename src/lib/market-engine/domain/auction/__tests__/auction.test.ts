import { describe, it, expect } from 'bun:test';
import { Auction } from '../auction';
import { AuctionError } from '../errors';
import { Character } from '../../shared/character';
import { Role } from '../../shared/role';

const CHARACTERS: Character[] = [
	Character.create('c1', '감스트', 'TOP', Role.PLAYER),
	Character.create('c2', '따효니', 'MID', Role.PLAYER),
	Character.create('c3', '침착맨', 'ADC', Role.PLAYER)
];

const CAPTAINS: Character[] = [
	Character.create('cap-1', '감독 1', null, Role.CAPTAIN),
	Character.create('cap-2', '감독 2', null, Role.CAPTAIN)
];

function makeAuction(overrides?: {
	totalPoints?: number;
	minBidUnit?: number;
	positionLimit?: number;
}) {
	return Auction.create({
		id: 'auction-1',
		templateId: 'tpl-1',
		captains: CAPTAINS,
		characters: CHARACTERS,
		totalPoints: overrides?.totalPoints ?? 1000,
		minBidUnit: overrides?.minBidUnit ?? 10,
		positionLimit: overrides?.positionLimit ?? 1
	});
}

describe('Auction', () => {
	describe('create', () => {
		it('첫 번째 캐릭터가 currentCharacter로 설정되고 BIDDING 단계가 된다', () => {
			const auction = makeAuction();
			expect(auction.phase).toBe('BIDDING');
			expect(auction.currentCharacter?.id).toBe('c1');
			expect(auction.pendingQueue).toHaveLength(2);
		});

		it('모든 감독에게 totalPoints만큼 잔여 포인트가 배정된다', () => {
			const auction = makeAuction({ totalPoints: 500 });
			expect(auction.remainingPoints['cap-1']).toBe(500);
			expect(auction.remainingPoints['cap-2']).toBe(500);
		});

		it('캐릭터가 없으면 즉시 COMPLETED 단계가 된다', () => {
			const auction = Auction.create({
				id: 'auction-1',
				templateId: 'tpl-1',
				captains: CAPTAINS,
				characters: [],
				totalPoints: 1000,
				minBidUnit: 10,
				positionLimit: 1
			});
			expect(auction.phase).toBe('COMPLETED');
			expect(auction.isCompleted).toBe(true);
		});
	});

	describe('placeBid', () => {
		it('유효한 입찰은 currentBid에 반영된다', () => {
			const auction = makeAuction().placeBid('bid-1', 'cap-1', 100);
			expect(auction.currentBid?.captainId).toBe('cap-1');
			expect(auction.currentBid?.amount).toBe(100);
		});

		it('minBidUnit 단위가 아니면 BID_INVALID_UNIT 에러', () => {
			expect(() => makeAuction().placeBid('bid-1', 'cap-1', 15)).toThrow(AuctionError);
		});

		it('잔여 포인트보다 큰 금액은 INSUFFICIENT_POINTS 에러', () => {
			expect(() => makeAuction({ totalPoints: 50 }).placeBid('bid-1', 'cap-1', 100)).toThrow(
				AuctionError
			);
		});

		it('현재 입찰가 이하면 BID_TOO_LOW 에러', () => {
			const a = makeAuction().placeBid('bid-1', 'cap-1', 100);
			expect(() => a.placeBid('bid-2', 'cap-2', 100)).toThrow(AuctionError);
		});

		it('존재하지 않는 감독은 CAPTAIN_NOT_FOUND 에러', () => {
			expect(() => makeAuction().placeBid('bid-1', 'cap-99', 100)).toThrow(AuctionError);
		});
	});

	describe('settle', () => {
		it('낙찰 시 캐릭터가 감독 로스터에 들어가고 잔여 포인트가 차감된다', () => {
			const a = makeAuction({ totalPoints: 1000 }).placeBid('bid-1', 'cap-1', 100).settle();
			expect(a.phase).toBe('SOLD');
			expect(a.rosters['cap-1']).toHaveLength(1);
			expect(a.remainingPoints['cap-1']).toBe(900);
			expect(a.soldHistory).toHaveLength(1);
		});

		it('입찰 없이 settle 시도 시 NO_CURRENT_CHARACTER 에러', () => {
			expect(() => makeAuction().settle()).toThrow(AuctionError);
		});
	});

	describe('markUnsold', () => {
		it('유찰된 캐릭터는 pendingQueue 끝으로 이동한다', () => {
			const a = makeAuction().markUnsold();
			expect(a.phase).toBe('UNSOLD');
			expect(a.pendingQueue).toHaveLength(3);
			expect(a.pendingQueue[a.pendingQueue.length - 1]?.id).toBe('c1');
		});
	});

	describe('startNext', () => {
		it('SOLD 후 다음 캐릭터가 currentCharacter로 설정된다', () => {
			const a = makeAuction().placeBid('bid-1', 'cap-1', 100).settle().startNext();
			expect(a.phase).toBe('BIDDING');
			expect(a.currentCharacter?.id).toBe('c2');
			expect(a.pendingQueue).toHaveLength(1);
		});

		it('남은 캐릭터가 없으면 COMPLETED', () => {
			let a = makeAuction();
			for (let i = 0; i < 3; i++) {
				a = a.placeBid(`bid-${i}`, 'cap-1', 10).settle();
				if (i < 2) a = a.startNext();
			}
			a = a.startNext();
			expect(a.phase).toBe('COMPLETED');
		});

		it('BIDDING 단계에서 startNext 시도 시 에러', () => {
			expect(() => makeAuction().startNext()).toThrow(AuctionError);
		});
	});
});
