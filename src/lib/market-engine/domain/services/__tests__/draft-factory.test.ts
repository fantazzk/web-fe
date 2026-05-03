import { describe, it, expect } from 'bun:test';
import { DraftFactory } from '../draft-factory';
import { Template } from '../../template/template';
import { Character } from '../../shared/character';
import { Role } from '../../shared/role';

const CHARACTERS = [
	Character.create('c1', 'Faker', 'MID', Role.PLAYER),
	Character.create('c2', 'Zeus', 'TOP', Role.PLAYER),
	Character.create('c3', 'Oner', 'JG', Role.PLAYER),
	Character.create('c4', 'Gumayusi', 'ADC', Role.PLAYER),
	Character.create('c5', 'Keria', 'SUPPORT', Role.PLAYER),
	Character.create('c6', 'Doran', 'TOP', Role.PLAYER)
];

function makeTemplate(overrides?: { captainsNeeded?: number; draftMode?: 'SNAKE' | 'SEQUENTIAL' }) {
	return Template.restore({
		id: 'tpl-1',
		name: '치지직컵',
		gameType: 'LEAGUE_OF_LEGENDS',
		creatorId: 'user-1',
		rule: {
			mode: 'DRAFT',
			pickBanTime: 30,
			draftMode: overrides?.draftMode ?? 'SNAKE'
		},
		characters: CHARACTERS,
		captainsNeeded: overrides?.captainsNeeded ?? 3,
		creatorAsCaptain: false,
		usageCount: 0,
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01')
	});
}

describe('DraftFactory', () => {
	it('템플릿으로부터 Draft를 생성한다', () => {
		const draft = DraftFactory.create(makeTemplate(), 'draft-1');
		expect(draft.id).toBe('draft-1');
		expect(draft.templateId).toBe('tpl-1');
	});

	it('captainsNeeded만큼 감독 Character가 생성되고 rosters는 빈 상태로 초기화된다', () => {
		const draft = DraftFactory.create(makeTemplate({ captainsNeeded: 2 }), 'draft-1');
		expect(draft.captains).toHaveLength(2);
		expect(draft.captains[0]!.role.equals(Role.CAPTAIN)).toBe(true);
		for (const captain of draft.captains) {
			expect(draft.rosters[captain.id]).toEqual([]);
		}
	});

	it('템플릿의 characters가 pendingQueue에 들어간다', () => {
		const draft = DraftFactory.create(makeTemplate(), 'draft-1');
		expect(draft.pendingQueue).toHaveLength(6);
	});

	it('rounds = floor(characters / captains)로 계산된다', () => {
		const draft = DraftFactory.create(makeTemplate({ captainsNeeded: 3 }), 'draft-1');
		expect(draft.pickOrder).toHaveLength(6);
	});

	it('rule.draftMode가 그대로 반영된다', () => {
		const snake = DraftFactory.create(makeTemplate({ draftMode: 'SNAKE' }), 'draft-1');
		const seq = DraftFactory.create(makeTemplate({ draftMode: 'SEQUENTIAL' }), 'draft-2');
		expect(snake.draftMode).toBe('SNAKE');
		expect(seq.draftMode).toBe('SEQUENTIAL');
	});

	it('AUCTION/SANDBOX 템플릿이면 에러를 던진다', () => {
		const auction = Template.restore({
			id: 'tpl-2',
			name: '자낳대',
			gameType: 'LEAGUE_OF_LEGENDS',
			creatorId: 'user-1',
			rule: {
				mode: 'AUCTION',
				pickBanTime: 30,
				totalPoints: 1000,
				minBidUnit: 10,
				positionLimit: 1
			},
			characters: CHARACTERS,
			captainsNeeded: 3,
			creatorAsCaptain: false,
			usageCount: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		});
		expect(() => DraftFactory.create(auction, 'd-1')).toThrow();
	});
});
