import { describe, it, expect } from 'bun:test';
import { SandboxBoard } from '../sandbox-board';
import { SandboxBoardError } from '../errors';
import { Character } from '../../shared/character';
import { Role } from '../../shared/role';

const CHARACTERS: Character[] = [
	Character.create('p1', '감스트', 'TOP', Role.PLAYER),
	Character.create('p2', '따효니', 'MID', Role.PLAYER),
	Character.create('p3', '침착맨', 'ADC', Role.PLAYER),
	Character.create('p4', '우왁굳', 'SUPPORT', Role.PLAYER)
];

const CAPTAINS: Character[] = [
	Character.create('cap-1', '감독 1', null, Role.CAPTAIN),
	Character.create('cap-2', '감독 2', null, Role.CAPTAIN)
];

function makeBoard(captains: readonly Character[] = CAPTAINS) {
	return SandboxBoard.create({
		id: 'board-1',
		templateId: 'tpl-1',
		captains,
		characters: CHARACTERS
	});
}

describe('SandboxBoard', () => {
	describe('create', () => {
		it('감독 수만큼 빈 로스터가 생성된다', () => {
			const captains = [
				Character.create('cap-1', '감독 1', null, Role.CAPTAIN),
				Character.create('cap-2', '감독 2', null, Role.CAPTAIN),
				Character.create('cap-3', '감독 3', null, Role.CAPTAIN)
			];
			const board = makeBoard(captains);
			expect(board.captains).toHaveLength(3);
			expect(board.captains[0]!.name).toBe('감독 1');
			expect(board.captains[2]!.name).toBe('감독 3');
			expect(board.pool).toHaveLength(4);
			for (const captain of board.captains) {
				expect(board.rosters[captain.id]).toEqual([]);
			}
		});

		it('캐릭터풀에 모든 캐릭터가 포함된다', () => {
			const board = makeBoard();
			expect(board.pool.map((c) => c.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
		});
	});

	describe('assign', () => {
		it('캐릭터를 pool에서 감독 로스터로 이동한다', () => {
			const board = makeBoard();
			const captainId = board.captains[0]!.id;
			const next = board.assign('p1', captainId);
			expect(next.pool).toHaveLength(3);
			expect(next.pool.find((c) => c.id === 'p1')).toBeUndefined();
			expect(next.rosters[captainId]).toHaveLength(1);
			expect(next.rosters[captainId]![0]!.id).toBe('p1');
		});

		it('원본 보드는 변경되지 않는다 (불변)', () => {
			const board = makeBoard();
			const captainId = board.captains[0]!.id;
			board.assign('p1', captainId);
			expect(board.pool).toHaveLength(4);
			expect(board.rosters[captainId]).toHaveLength(0);
		});

		it('pool에 없는 캐릭터를 assign하면 CHARACTER_NOT_IN_POOL 에러', () => {
			const board = makeBoard();
			const captainId = board.captains[0]!.id;
			expect(() => board.assign('nonexistent', captainId)).toThrow(SandboxBoardError);
			try {
				board.assign('nonexistent', captainId);
			} catch (e) {
				expect((e as SandboxBoardError).code).toBe('CHARACTER_NOT_IN_POOL');
			}
		});

		it('존재하지 않는 감독에게 assign하면 CAPTAIN_NOT_FOUND 에러', () => {
			const board = makeBoard();
			expect(() => board.assign('p1', 'no-captain')).toThrow(SandboxBoardError);
			try {
				board.assign('p1', 'no-captain');
			} catch (e) {
				expect((e as SandboxBoardError).code).toBe('CAPTAIN_NOT_FOUND');
			}
		});
	});

	describe('unassign', () => {
		it('감독 로스터에서 pool로 복귀시킨다', () => {
			const board = makeBoard();
			const captainId = board.captains[0]!.id;
			const assigned = board.assign('p1', captainId);
			const unassigned = assigned.unassign('p1');
			expect(unassigned.pool).toHaveLength(4);
			expect(unassigned.pool.find((c) => c.id === 'p1')).toBeDefined();
			expect(unassigned.rosters[captainId]).toHaveLength(0);
		});

		it('원본 보드는 변경되지 않는다 (불변)', () => {
			const board = makeBoard();
			const captainId = board.captains[0]!.id;
			const assigned = board.assign('p1', captainId);
			assigned.unassign('p1');
			expect(assigned.rosters[captainId]).toHaveLength(1);
			expect(assigned.pool).toHaveLength(3);
		});

		it('어느 로스터에도 없는 캐릭터는 CHARACTER_NOT_IN_ROSTER 에러', () => {
			const board = makeBoard();
			expect(() => board.unassign('p1')).toThrow(SandboxBoardError);
			try {
				board.unassign('p1');
			} catch (e) {
				expect((e as SandboxBoardError).code).toBe('CHARACTER_NOT_IN_ROSTER');
			}
		});
	});

	describe('move', () => {
		it('한 감독 로스터에서 다른 감독 로스터로 이동한다', () => {
			const board = makeBoard();
			const cap1 = board.captains[0]!.id;
			const cap2 = board.captains[1]!.id;
			const assigned = board.assign('p1', cap1);
			const moved = assigned.move('p1', cap2);
			expect(moved.rosters[cap1]).toHaveLength(0);
			expect(moved.rosters[cap2]).toHaveLength(1);
			expect(moved.rosters[cap2]![0]!.id).toBe('p1');
			expect(moved.pool).toHaveLength(3);
		});

		it('같은 감독으로 move하면 변경 없이 새 인스턴스 반환', () => {
			const board = makeBoard();
			const cap1 = board.captains[0]!.id;
			const assigned = board.assign('p1', cap1);
			const same = assigned.move('p1', cap1);
			expect(same).not.toBe(assigned);
			expect(same.rosters[cap1]).toHaveLength(1);
		});

		it('원본 보드는 변경되지 않는다 (불변)', () => {
			const board = makeBoard();
			const cap1 = board.captains[0]!.id;
			const cap2 = board.captains[1]!.id;
			const assigned = board.assign('p1', cap1);
			assigned.move('p1', cap2);
			expect(assigned.rosters[cap1]).toHaveLength(1);
			expect(assigned.rosters[cap2]).toHaveLength(0);
		});

		it('로스터에 없는 캐릭터를 move하면 CHARACTER_NOT_IN_ROSTER 에러', () => {
			const board = makeBoard();
			const cap2 = board.captains[1]!.id;
			expect(() => board.move('p1', cap2)).toThrow(SandboxBoardError);
		});

		it('존재하지 않는 감독으로 move하면 CAPTAIN_NOT_FOUND 에러', () => {
			const board = makeBoard();
			const cap1 = board.captains[0]!.id;
			const assigned = board.assign('p1', cap1);
			expect(() => assigned.move('p1', 'no-captain')).toThrow(SandboxBoardError);
		});
	});
});
