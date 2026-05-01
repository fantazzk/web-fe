import { describe, it, expect } from 'bun:test';
import { SandboxFactory } from '../sandbox-factory';
import { Template } from '../../template/template';
import { Character } from '../../shared/character';
import { Role } from '../../shared/role';

const TEMPLATE = Template.restore({
	id: 'tpl-1',
	name: '자낳대',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	rule: { mode: 'SANDBOX' },
	characters: [
		Character.create('c1', 'Faker', 'MID', Role.PLAYER),
		Character.create('c2', 'Zeus', 'TOP', Role.PLAYER),
		Character.create('c3', 'Oner', 'JG', Role.PLAYER)
	],
	captainsNeeded: 2,
	creatorAsCaptain: false,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
});

describe('SandboxFactory', () => {
	it('템플릿으로부터 SandboxBoard를 생성한다', () => {
		const board = SandboxFactory.create(TEMPLATE, 'board-1');
		expect(board.id).toBe('board-1');
		expect(board.templateId).toBe('tpl-1');
	});

	it('템플릿의 captainsNeeded만큼 감독 Character가 생성된다', () => {
		const board = SandboxFactory.create(TEMPLATE, 'board-1');
		expect(board.captains).toHaveLength(2);
		expect(board.captains[0]!.role.equals(Role.CAPTAIN)).toBe(true);
	});

	it('템플릿의 characters가 pool에 들어간다', () => {
		const board = SandboxFactory.create(TEMPLATE, 'board-1');
		expect(board.pool).toHaveLength(3);
		expect(board.pool.map((c) => c.id)).toEqual(['c1', 'c2', 'c3']);
	});

	it('모든 로스터는 빈 상태로 초기화된다', () => {
		const board = SandboxFactory.create(TEMPLATE, 'board-1');
		for (const captain of board.captains) {
			expect(board.rosters[captain.id]).toEqual([]);
		}
	});
});
