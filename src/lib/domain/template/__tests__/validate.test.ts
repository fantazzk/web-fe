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

	it('name이 빈 문자열이면 NAME_REQUIRED', () => {
		expect(validateTemplateInput({ ...validInput, name: '' })).toBe('NAME_REQUIRED');
	});

	it('name이 whitespace만 있으면 NAME_REQUIRED', () => {
		expect(validateTemplateInput({ ...validInput, name: '   ' })).toBe('NAME_REQUIRED');
	});

	it('pickBanTime이 0이면 PICK_BAN_TIME_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, pickBanTime: 0 })).toBe('PICK_BAN_TIME_INVALID');
	});

	it('pickBanTime이 음수면 PICK_BAN_TIME_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, pickBanTime: -5 })).toBe('PICK_BAN_TIME_INVALID');
	});

	it('players가 비어있으면 PLAYERS_TOO_FEW', () => {
		expect(validateTemplateInput({ ...validInput, players: [] })).toBe('PLAYERS_TOO_FEW');
	});

	it('players가 1명이면 PLAYERS_TOO_FEW', () => {
		expect(
			validateTemplateInput({
				...validInput,
				players: [{ name: 'A', position: 'MID', tier: 'S' }]
			})
		).toBe('PLAYERS_TOO_FEW');
	});

	it('선수 중 이름이 빈 값이면 PLAYER_NAME_REQUIRED', () => {
		expect(
			validateTemplateInput({
				...validInput,
				players: [
					{ name: 'Faker', position: 'MID', tier: 'S+' },
					{ name: '', position: 'TOP', tier: 'A' }
				]
			})
		).toBe('PLAYER_NAME_REQUIRED');
	});

	it('역할 있는 종목에서 position이 빈 값이면 PLAYER_POSITION_REQUIRED', () => {
		expect(
			validateTemplateInput({
				...validInput,
				players: [
					{ name: 'Faker', position: 'MID', tier: 'S+' },
					{ name: 'Zeus', position: '', tier: 'A' }
				]
			})
		).toBe('PLAYER_POSITION_REQUIRED');
	});

	it('배틀그라운드는 position이 빈 값이어도 통과한다', () => {
		expect(
			validateTemplateInput({
				...validInput,
				gameType: 'BATTLEGROUNDS',
				players: [
					{ name: 'A', position: '', tier: 'S' },
					{ name: 'B', position: '', tier: 'A' }
				]
			})
		).toBeNull();
	});

	it('captainsNeeded가 1이면 CAPTAINS_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, captainsNeeded: 1 })).toBe('CAPTAINS_INVALID');
	});

	it('captainsNeeded가 0이면 CAPTAINS_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, captainsNeeded: 0 })).toBe('CAPTAINS_INVALID');
	});

	it('선수 수가 captainsNeeded보다 적으면 PLAYERS_LESS_THAN_CAPTAINS', () => {
		expect(
			validateTemplateInput({
				...validInput,
				captainsNeeded: 3,
				players: [
					{ name: 'A', position: 'MID', tier: 'S' },
					{ name: 'B', position: 'TOP', tier: 'A' }
				]
			})
		).toBe('PLAYERS_LESS_THAN_CAPTAINS');
	});

	it('AUCTION 모드에서 totalPoints가 0이면 AUCTION_BUDGET_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, totalPoints: 0 })).toBe('AUCTION_BUDGET_INVALID');
	});

	it('AUCTION 모드에서 minBid가 0이면 AUCTION_MIN_BID_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, minBid: 0 })).toBe('AUCTION_MIN_BID_INVALID');
	});

	it('AUCTION 모드에서 minBid가 totalPoints보다 크면 AUCTION_MIN_BID_INVALID', () => {
		expect(validateTemplateInput({ ...validInput, totalPoints: 100, minBid: 200 })).toBe(
			'AUCTION_MIN_BID_INVALID'
		);
	});

	it('DRAFT 모드에서는 경매 필드가 없어도 통과한다', () => {
		const { totalPoints: _t, minBid: _m, ...draftInput } = validInput;
		expect(
			validateTemplateInput({
				...draftInput,
				mode: 'DRAFT',
				draftMode: 'SNAKE'
			})
		).toBeNull();
	});
});
