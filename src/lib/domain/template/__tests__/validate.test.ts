import { validateTemplateInput } from '../validate.ts';
import type { TemplateInputType } from '../validate.ts';

const validInput: TemplateInputType = {
	name: '2026 자낳대 롤 시즌1',
	gameType: 'LEAGUE_OF_LEGENDS',
	mode: 'AUCTION',
	pickBanTime: 30,
	players: [
		{ name: 'Faker', position: 'MID', tier: 'S+' },
		{ name: 'Zeus', position: 'TOP', tier: 'S' }
	],
	captainsNeeded: 2,
	totalPoints: 1000,
	minBid: 10
};

describe('validateTemplateInput', () => {
	it('정상 입력이면 null을 반환한다', () => {
		expect(validateTemplateInput(validInput)).toBeNull();
	});
});
