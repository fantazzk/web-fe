import { describe, it, expect } from 'bun:test';
import { Draft } from '$lib/domain/rule-engine/draft.ts';
import type { DraftConfig } from '$lib/domain/rule-engine/draft-types.ts';
import { processPick, processAutoPick } from '../draft-driver.ts';

function createConfig(): DraftConfig {
	return {
		teamCount: 2,
		draftType: 'SEQUENTIAL',
		rounds: 2,
		playerPool: [
			{ name: '선수A', position: 'TOP' },
			{ name: '선수B', position: 'MID' },
			{ name: '선수C', position: 'TOP' },
			{ name: '선수D', position: 'MID' }
		],
		teamIds: ['team-1', 'team-2']
	};
}

describe('processPick', () => {
	it('유효한 픽을 처리하고 갱신된 Draft를 반환한다', () => {
		const draft = Draft.create(createConfig());
		const result = processPick(draft, 'team-1', '선수A');
		expect(result.draft.pickHistory).toHaveLength(1);
		expect(result.draft.pickHistory[0]!.player.name).toBe('선수A');
		expect(result.errorCode).toBeNull();
	});

	it('차례가 아닌 팀이 픽하면 에러 코드를 반환한다', () => {
		const draft = Draft.create(createConfig());
		const result = processPick(draft, 'team-2', '선수A');
		expect(result.errorCode).toBe('NOT_YOUR_TURN');
		expect(result.draft).toBe(draft);
	});

	it('이미 픽된 선수를 선택하면 에러 코드를 반환한다', () => {
		const draft = Draft.create(createConfig());
		const picked = processPick(draft, 'team-1', '선수A').draft;
		const result = processPick(picked, 'team-2', '선수A');
		expect(result.errorCode).toBe('PLAYER_NOT_FOUND');
		expect(result.draft).toBe(picked);
	});
});

describe('processAutoPick', () => {
	it('remainingPool[0]을 자동 선택한다', () => {
		const draft = Draft.create(createConfig());
		const next = processAutoPick(draft);
		expect(next.pickHistory).toHaveLength(1);
		expect(next.pickHistory[0]!.player.name).toBe('선수A');
	});

	it('모든 픽이 완료되면 COMPLETED 상태가 된다', () => {
		let draft = Draft.create(createConfig());
		draft = processAutoPick(draft);
		draft = processAutoPick(draft);
		draft = processAutoPick(draft);
		draft = processAutoPick(draft);
		expect(draft.isCompleted).toBe(true);
	});
});
