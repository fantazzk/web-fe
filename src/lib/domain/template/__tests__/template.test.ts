import { Template } from '../template.ts';
import { Player } from '../player.ts';
import type { TemplateParams } from '../types.ts';

const defaultParams: TemplateParams = {
	id: 'tmpl-1',
	name: '2026 자낳대 롤 시즌1',
	gameType: 'LEAGUE_OF_LEGENDS',
	creatorId: 'user-1',
	mode: 'AUCTION',
	pickBanTime: 90,
	playerPool: [
		{ name: 'Faker', position: 'MID', tier: 'S+' },
		{ name: 'Zeus', position: 'TOP', tier: 'S' },
		{ name: 'Oner', position: 'JG', tier: 'A+' },
		{ name: 'Gumayusi', position: 'ADC', tier: 'A' },
		{ name: 'Keria', position: 'SUP', tier: 'S' }
	],
	captainsNeeded: 2,
	creatorAsCaptain: true,
	totalPoints: 1000,
	minBidUnit: 10
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

describe('Template.getCompletionRate', () => {
	const base = {
		name: '',
		gameType: 'LEAGUE_OF_LEGENDS' as const,
		pickBanTime: 0,
		mode: 'DRAFT' as const,
		players: [] as { name: string }[],
		captainsNeeded: 0
	};

	it('모든 필드가 비어있으면 전체 0%', () => {
		const result = Template.getCompletionRate(base);
		expect(result.percent).toBe(0);
		expect(result.steps).toEqual([0, 0, 0, 0]);
	});

	it('모든 필드가 채워지면 전체 100%', () => {
		const result = Template.getCompletionRate({
			...base,
			name: '자낳대 시즌1',
			pickBanTime: 30,
			players: [{ name: 'Faker' }, { name: 'Zeus' }],
			captainsNeeded: 2
		});
		expect(result.percent).toBe(100);
		expect(result.steps).toEqual([100, 100, 100, 100]);
	});

	it('1단계 — 이름만 입력하고 게임종목이 있으면 100%', () => {
		const result = Template.getCompletionRate({ ...base, name: '대회' });
		expect(result.steps[0]).toBe(100);
	});

	it('2단계 드래프트 — 픽밴시간만 있으면 100%', () => {
		const result = Template.getCompletionRate({ ...base, pickBanTime: 30 });
		expect(result.steps[1]).toBe(100);
	});

	it('2단계 경매 — 3개 필드 중 1개만 채우면 33%', () => {
		const result = Template.getCompletionRate({
			...base,
			mode: 'AUCTION',
			pickBanTime: 30,
			totalPoints: 0,
			minBid: 0
		});
		expect(result.steps[1]).toBe(33);
	});

	it('2단계 경매 — 3개 필드 모두 채우면 100%', () => {
		const result = Template.getCompletionRate({
			...base,
			mode: 'AUCTION',
			pickBanTime: 30,
			totalPoints: 1000,
			minBid: 10
		});
		expect(result.steps[1]).toBe(100);
	});

	it('3단계 — 선수가 없으면 0%', () => {
		const result = Template.getCompletionRate(base);
		expect(result.steps[2]).toBe(0);
	});

	it('3단계 — 선수 3명 중 2명 이름 입력이면 67%', () => {
		const result = Template.getCompletionRate({
			...base,
			players: [{ name: 'A' }, { name: 'B' }, { name: '' }]
		});
		expect(result.steps[2]).toBe(67);
	});

	it('4단계 — 감독 수가 0이면 0%, 1 이상이면 100%', () => {
		expect(Template.getCompletionRate(base).steps[3]).toBe(0);
		expect(Template.getCompletionRate({ ...base, captainsNeeded: 2 }).steps[3]).toBe(100);
	});

	it('전체 percent는 4단계 평균이다', () => {
		const result = Template.getCompletionRate({
			...base,
			name: '대회',
			captainsNeeded: 2
		});
		// step1=100, step2=0, step3=0, step4=100 → 평균 50
		expect(result.percent).toBe(50);
	});
});
