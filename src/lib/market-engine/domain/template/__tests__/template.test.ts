import { describe, it, expect } from 'bun:test';
import { Template } from '../template';
import { Character } from '../../shared/character';
import { Role } from '../../shared/role';

const CHARACTERS = [
	Character.create('c1', 'Faker', 'MID', Role.PLAYER),
	Character.create('c2', 'Zeus', 'TOP', Role.PLAYER),
	Character.create('c3', 'Oner', 'JG', Role.PLAYER)
];

const BASE = {
	id: 'tpl-1',
	name: '2026 자낳대 롤 시즌1',
	gameType: 'LEAGUE_OF_LEGENDS' as const,
	creatorId: 'user-1',
	characters: CHARACTERS,
	captainsNeeded: 2,
	creatorAsCaptain: true,
	usageCount: 0,
	createdAt: new Date('2026-01-01'),
	updatedAt: new Date('2026-01-01')
};

describe('Template', () => {
	describe('mode 파생', () => {
		it('AUCTION rule이면 mode는 AUCTION이다', () => {
			const template = Template.restore({
				...BASE,
				rule: {
					mode: 'AUCTION',
					pickBanTime: 90,
					totalPoints: 1000,
					minBidUnit: 10,
					positionLimit: 1
				}
			});
			expect(template.mode).toBe('AUCTION');
		});

		it('DRAFT rule이면 mode는 DRAFT이다', () => {
			const template = Template.restore({
				...BASE,
				rule: { mode: 'DRAFT', pickBanTime: 60, draftMode: 'SNAKE' }
			});
			expect(template.mode).toBe('DRAFT');
		});

		it('SANDBOX rule이면 mode는 SANDBOX이다', () => {
			const template = Template.restore({ ...BASE, rule: { mode: 'SANDBOX' } });
			expect(template.mode).toBe('SANDBOX');
		});
	});

	describe('characterCount', () => {
		it('characters 배열 길이를 반환한다', () => {
			const template = Template.restore({
				...BASE,
				rule: { mode: 'SANDBOX' }
			});
			expect(template.characterCount).toBe(3);
		});

		it('캐릭터가 없으면 0을 반환한다', () => {
			const template = Template.restore({
				...BASE,
				characters: [],
				rule: { mode: 'SANDBOX' }
			});
			expect(template.characterCount).toBe(0);
		});
	});

	describe('rule 접근', () => {
		it('AUCTION rule에서 totalPoints에 접근할 수 있다', () => {
			const rule = {
				mode: 'AUCTION' as const,
				pickBanTime: 90,
				totalPoints: 1000,
				minBidUnit: 10,
				positionLimit: 1
			};
			const template = Template.restore({ ...BASE, rule });
			if (template.rule.mode === 'AUCTION') {
				expect(template.rule.totalPoints).toBe(1000);
				expect(template.rule.minBidUnit).toBe(10);
			}
		});

		it('DRAFT rule에서 draftMode에 접근할 수 있다', () => {
			const rule = { mode: 'DRAFT' as const, pickBanTime: 60, draftMode: 'SNAKE' as const };
			const template = Template.restore({ ...BASE, rule });
			if (template.rule.mode === 'DRAFT') {
				expect(template.rule.draftMode).toBe('SNAKE');
			}
		});
	});
});
