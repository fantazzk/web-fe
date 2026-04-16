import { describe, it, expect } from 'bun:test';
import { SandboxBoard } from '../sandbox-board.ts';
import { SandboxError } from '../errors.ts';
import type { SandboxPlayerType } from '../types.ts';

const PLAYERS: SandboxPlayerType[] = [
	{ id: 'p1', name: '감스트', position: 'TOP', tier: 'S' },
	{ id: 'p2', name: '따효니', position: 'MID', tier: 'A' },
	{ id: 'p3', name: '침착맨', position: 'ADC', tier: 'S+' },
	{ id: 'p4', name: '우왁굳', position: 'SUPPORT', tier: 'A+' }
];

describe('SandboxBoard', () => {
	describe('create', () => {
		it('감독 수만큼 빈 로스터가 생성된다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 3,
				players: PLAYERS
			});
			expect(board.captains).toHaveLength(3);
			expect(board.captains[0]!.name).toBe('감독 1');
			expect(board.captains[1]!.name).toBe('감독 2');
			expect(board.captains[2]!.name).toBe('감독 3');
			expect(board.pool).toHaveLength(4);
			for (const captain of board.captains) {
				expect(board.rosters[captain.id]).toEqual([]);
			}
		});

		it('선수풀에 모든 선수가 포함된다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			expect(board.pool.map((p) => p.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
		});
	});

	describe('assign', () => {
		it('선수를 pool에서 감독 로스터로 이동한다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const captainId = board.captains[0]!.id;
			const next = board.assign('p1', captainId);
			expect(next.pool).toHaveLength(3);
			expect(next.pool.find((p) => p.id === 'p1')).toBeUndefined();
			expect(next.rosters[captainId]).toHaveLength(1);
			expect(next.rosters[captainId]![0]!.id).toBe('p1');
		});

		it('원본 보드는 변경되지 않는다 (불변)', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const captainId = board.captains[0]!.id;
			board.assign('p1', captainId);
			expect(board.pool).toHaveLength(4);
			expect(board.rosters[captainId]).toHaveLength(0);
		});

		it('pool에 없는 선수를 assign하면 PLAYER_NOT_IN_POOL 에러', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const captainId = board.captains[0]!.id;
			expect(() => board.assign('nonexistent', captainId)).toThrow(SandboxError);
			try {
				board.assign('nonexistent', captainId);
			} catch (e) {
				expect((e as SandboxError).code).toBe('PLAYER_NOT_IN_POOL');
			}
		});

		it('존재하지 않는 감독에게 assign하면 CAPTAIN_NOT_FOUND 에러', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			expect(() => board.assign('p1', 'no-captain')).toThrow(SandboxError);
			try {
				board.assign('p1', 'no-captain');
			} catch (e) {
				expect((e as SandboxError).code).toBe('CAPTAIN_NOT_FOUND');
			}
		});
	});

	describe('unassign', () => {
		it('감독 로스터에서 pool로 복귀시킨다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const captainId = board.captains[0]!.id;
			const assigned = board.assign('p1', captainId);
			const unassigned = assigned.unassign('p1');
			expect(unassigned.pool).toHaveLength(4);
			expect(unassigned.pool.find((p) => p.id === 'p1')).toBeDefined();
			expect(unassigned.rosters[captainId]).toHaveLength(0);
		});

		it('어느 로스터에도 없는 선수는 PLAYER_NOT_IN_ROSTER 에러', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			expect(() => board.unassign('p1')).toThrow(SandboxError);
			try {
				board.unassign('p1');
			} catch (e) {
				expect((e as SandboxError).code).toBe('PLAYER_NOT_IN_ROSTER');
			}
		});
	});

	describe('move', () => {
		it('한 감독 로스터에서 다른 감독 로스터로 이동한다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
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
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const cap1 = board.captains[0]!.id;
			const assigned = board.assign('p1', cap1);
			const same = assigned.move('p1', cap1);
			expect(same).not.toBe(assigned);
			expect(same.rosters[cap1]).toHaveLength(1);
		});

		it('로스터에 없는 선수를 move하면 PLAYER_NOT_IN_ROSTER 에러', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const cap2 = board.captains[1]!.id;
			expect(() => board.move('p1', cap2)).toThrow(SandboxError);
		});

		it('존재하지 않는 감독으로 move하면 CAPTAIN_NOT_FOUND 에러', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const cap1 = board.captains[0]!.id;
			const assigned = board.assign('p1', cap1);
			expect(() => assigned.move('p1', 'no-captain')).toThrow(SandboxError);
		});
	});

	describe('toResult', () => {
		it('감독별 로스터를 SandboxResultTeamType 배열로 변환한다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const cap1 = board.captains[0]!.id;
			const cap2 = board.captains[1]!.id;
			const final = board.assign('p1', cap1).assign('p2', cap2);
			const result = final.toResult();
			expect(result).toHaveLength(2);
			expect(result[0]!.captain).toBe('감독 1');
			expect(result[0]!.players).toHaveLength(1);
			expect(result[0]!.players[0]).toEqual({ name: '감스트', position: 'TOP', tier: 'S' });
			expect(result[1]!.captain).toBe('감독 2');
			expect(result[1]!.players).toHaveLength(1);
			expect(result[1]!.players[0]).toEqual({ name: '따효니', position: 'MID', tier: 'A' });
		});

		it('빈 로스터도 빈 players 배열로 포함된다', () => {
			const board = SandboxBoard.create({
				templateId: 'tpl-1',
				captainsCount: 2,
				players: PLAYERS
			});
			const result = board.toResult();
			expect(result).toHaveLength(2);
			expect(result[0]!.players).toEqual([]);
			expect(result[1]!.players).toEqual([]);
		});
	});
});
