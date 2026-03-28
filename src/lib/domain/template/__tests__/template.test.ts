import { describe, it, expect } from 'vitest';
import { Template } from '../template.ts';
import { Player } from '../player.ts';
import type { TemplateParams } from '../types.ts';

const defaultParams: TemplateParams = {
	id: 'tmpl-1',
	name: '2026 자낳대 롤 시즌1',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	mode: 'AUCTION',
	matchFormat: 'BO3',
	pickBanTime: 90,
	restrictions: '욕설/도배 즉시 실격',
	playerPool: [
		{ name: 'Faker', position: 'MID' },
		{ name: 'Zeus', position: 'TOP' },
		{ name: 'Oner', position: 'JG' },
		{ name: 'Gumayusi', position: 'ADC' },
		{ name: 'Keria', position: 'SUP' }
	],
	tierBalancing: 'AUTO',
	captainSelectMode: 'VOTE',
	captainsNeeded: 2,
	isPublic: true
};

describe('Template', () => {
	it('playerCount는 선수풀 인원 수를 반환한다', () => {
		const template = new Template(defaultParams);
		expect(template.playerCount).toBe(5);
	});

	it('playerPool의 각 항목은 Player 인스턴스다', () => {
		const template = new Template(defaultParams);
		expect(template.playerPool[0]).toBeInstanceOf(Player);
	});

	it('usageCount 미지정 시 0으로 초기화된다', () => {
		const template = new Template(defaultParams);
		expect(template.usageCount).toBe(0);
	});
});
