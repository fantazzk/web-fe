import { toCreateTemplateRequest } from '../mapper.ts';
import type { TemplateInputType } from '../validate.ts';

const baseInput: TemplateInputType = {
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

describe('toCreateTemplateRequest', () => {
	it('AUCTION 모드는 budget, minBidUnit을 포함하고 draftOrderStrategy를 생략한다', () => {
		const req = toCreateTemplateRequest(baseInput);
		expect(req.mode).toBe('AUCTION');
		expect(req.budget).toBe(1000);
		expect(req.minBidUnit).toBe(10);
		expect(req.draftOrderStrategy).toBeUndefined();
	});

	it('DRAFT 모드는 draftOrderStrategy를 포함하고 budget/minBidUnit을 생략한다', () => {
		const { totalPoints: _t, minBid: _m, ...draftInput } = baseInput;
		const req = toCreateTemplateRequest({
			...draftInput,
			mode: 'DRAFT',
			draftMode: 'SNAKE'
		});
		expect(req.mode).toBe('DRAFT');
		expect(req.draftOrderStrategy).toBe('SNAKE');
		expect(req.budget).toBeUndefined();
		expect(req.minBidUnit).toBeUndefined();
	});

	it('SEQUENTIAL 드래프트는 FIXED로 매핑된다', () => {
		const req = toCreateTemplateRequest({
			...baseInput,
			mode: 'DRAFT',
			draftMode: 'SEQUENTIAL'
		});
		expect(req.draftOrderStrategy).toBe('FIXED');
	});

	it('captainsNeeded는 teamCount로 매핑된다', () => {
		const req = toCreateTemplateRequest({ ...baseInput, captainsNeeded: 5 });
		expect(req.teamCount).toBe(5);
	});

	it('players에서 tier는 제외된다', () => {
		const req = toCreateTemplateRequest(baseInput);
		for (const p of req.players) {
			expect('tier' in p).toBe(false);
		}
		expect(req.players).toEqual([
			{ name: 'Faker', position: 'MID' },
			{ name: 'Zeus', position: 'TOP' }
		]);
	});

	it('VALORANT, BATTLEGROUNDS gameType도 그대로 전달된다', () => {
		expect(toCreateTemplateRequest({ ...baseInput, gameType: 'VALORANT' }).gameType).toBe(
			'VALORANT'
		);
		expect(toCreateTemplateRequest({ ...baseInput, gameType: 'BATTLEGROUNDS' }).gameType).toBe(
			'BATTLEGROUNDS'
		);
	});
});
