import { describe, it, expect } from 'vitest';
import { Draft } from '../draft.ts';
import type { DraftConfig } from '../draft-types.ts';

function createConfig(overrides?: Partial<DraftConfig>): DraftConfig {
	return {
		teamCount: 3,
		draftType: 'SEQUENTIAL',
		rounds: 2,
		playerPool: [
			{ name: '선수A', position: 'TOP' },
			{ name: '선수B', position: 'MID' },
			{ name: '선수C', position: 'JG' },
			{ name: '선수D', position: 'ADC' },
			{ name: '선수E', position: 'SUP' },
			{ name: '선수F', position: 'TOP' }
		],
		teamIds: ['team-1', 'team-2', 'team-3'],
		...overrides
	};
}

describe('드래프트 생성', () => {
	it('create()하면 PICKING 상태로 시작하고 첫 번째 팀이 차례다', () => {
		const draft = Draft.create(createConfig());
		expect(draft.phase).toBe('PICKING');
		expect(draft.currentTeamId).toBe('team-1');
		expect(draft.currentRound).toBe(1);
	});

	it('순차 드래프트의 pickOrder는 매 라운드 동일 순서다', () => {
		const draft = Draft.create(createConfig({ rounds: 2 }));
		expect(draft.pickOrder).toEqual(['team-1', 'team-2', 'team-3', 'team-1', 'team-2', 'team-3']);
	});

	it('스네이크 드래프트의 pickOrder는 홀수 라운드 역순이다', () => {
		const draft = Draft.create(createConfig({ draftType: 'SNAKE', rounds: 2 }));
		expect(draft.pickOrder).toEqual(['team-1', 'team-2', 'team-3', 'team-3', 'team-2', 'team-1']);
	});
});

describe('픽', () => {
	it('현재 차례 팀이 선수를 픽하면 로스터에 추가되고 다음 팀으로 넘어간다', () => {
		const draft = Draft.create(createConfig());
		const afterPick = draft.pick('team-1', '선수A');
		expect(afterPick.currentTeamId).toBe('team-2');
		const team1 = afterPick.teams.find((t) => t.id === 'team-1');
		expect(team1?.roster).toHaveLength(1);
		expect(team1?.roster[0]?.name).toBe('선수A');
	});

	it('픽한 선수는 remainingPool에서 제거된다', () => {
		const draft = Draft.create(createConfig());
		const afterPick = draft.pick('team-1', '선수A');
		expect(afterPick.remainingPool.some((p) => p.name === '선수A')).toBe(false);
	});

	it('차례가 아닌 팀이 픽하면 NOT_YOUR_TURN', () => {
		const draft = Draft.create(createConfig());
		expect(() => draft.pick('team-2', '선수A')).toThrow(
			expect.objectContaining({ code: 'NOT_YOUR_TURN' })
		);
	});

	it('이미 픽된 선수를 다시 픽하면 PLAYER_NOT_FOUND', () => {
		const draft = Draft.create(createConfig()).pick('team-1', '선수A');
		expect(() => draft.pick('team-2', '선수A')).toThrow(
			expect.objectContaining({ code: 'PLAYER_NOT_FOUND' })
		);
	});

	it('존재하지 않는 선수를 픽하면 PLAYER_NOT_FOUND', () => {
		const draft = Draft.create(createConfig());
		expect(() => draft.pick('team-1', '없는선수')).toThrow(
			expect.objectContaining({ code: 'PLAYER_NOT_FOUND' })
		);
	});
});

describe('자동 픽', () => {
	it('autoPick()은 remainingPool의 첫 번째 선수를 픽한다', () => {
		const draft = Draft.create(createConfig());
		const afterAuto = draft.autoPick();
		expect(afterAuto.currentTeamId).toBe('team-2');
		const team1 = afterAuto.teams.find((t) => t.id === 'team-1');
		expect(team1?.roster[0]?.name).toBe('선수A');
	});
});

describe('드래프트 완료', () => {
	it('모든 픽이 끝나면 COMPLETED가 된다', () => {
		const config = createConfig({ rounds: 1 });
		const completed = Draft.create(config)
			.pick('team-1', '선수A')
			.pick('team-2', '선수B')
			.pick('team-3', '선수C');
		expect(completed.phase).toBe('COMPLETED');
		expect(completed.isCompleted).toBe(true);
		expect(completed.currentTeamId).toBeNull();
	});

	it('COMPLETED 상태에서 pick하면 NOT_PICKING_PHASE', () => {
		const config = createConfig({ rounds: 1 });
		const completed = Draft.create(config)
			.pick('team-1', '선수A')
			.pick('team-2', '선수B')
			.pick('team-3', '선수C');
		expect(() => completed.pick('team-1', '선수D')).toThrow(
			expect.objectContaining({ code: 'NOT_PICKING_PHASE' })
		);
	});
});

describe('스네이크 드래프트 복합 시나리오', () => {
	it('2라운드 스네이크에서 순서가 올바르게 진행된다', () => {
		const config = createConfig({
			draftType: 'SNAKE',
			teamCount: 2,
			rounds: 2,
			teamIds: ['team-1', 'team-2'],
			playerPool: [
				{ name: '선수A', position: 'TOP' },
				{ name: '선수B', position: 'MID' },
				{ name: '선수C', position: 'JG' },
				{ name: '선수D', position: 'ADC' }
			]
		});

		const r1 = Draft.create(config);
		expect(r1.currentTeamId).toBe('team-1');

		const r2 = r1.pick('team-1', '선수A');
		expect(r2.currentTeamId).toBe('team-2');

		// 라운드 2: 스네이크 역순
		const r3 = r2.pick('team-2', '선수B');
		expect(r3.currentTeamId).toBe('team-2');
		expect(r3.currentRound).toBe(2);

		const r4 = r3.pick('team-2', '선수C');
		expect(r4.currentTeamId).toBe('team-1');

		const r5 = r4.pick('team-1', '선수D');
		expect(r5.phase).toBe('COMPLETED');
	});
});
