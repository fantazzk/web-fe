import { describe, it, expect } from 'bun:test';
import { Draft, buildPickOrder } from '../draft';
import { DraftError } from '../errors';
import { Character } from '../../shared/character';
import { Role } from '../../shared/role';

const CHARACTERS: Character[] = [
	Character.create('p1', '감스트', 'TOP', Role.PLAYER),
	Character.create('p2', '따효니', 'MID', Role.PLAYER),
	Character.create('p3', '침착맨', 'JG', Role.PLAYER),
	Character.create('p4', '우왁굳', 'ADC', Role.PLAYER),
	Character.create('p5', '풍월량', 'SUPPORT', Role.PLAYER),
	Character.create('p6', '한동숙', 'TOP', Role.PLAYER)
];

const CAPTAINS: Character[] = [
	Character.create('cap-1', '감독 1', null, Role.CAPTAIN),
	Character.create('cap-2', '감독 2', null, Role.CAPTAIN),
	Character.create('cap-3', '감독 3', null, Role.CAPTAIN)
];

function makeDraft(overrides?: {
	captains?: readonly Character[];
	draftMode?: 'SNAKE' | 'SEQUENTIAL';
	rounds?: number;
	characters?: readonly Character[];
}) {
	return Draft.create({
		id: 'draft-1',
		templateId: 'tpl-1',
		captains: overrides?.captains ?? CAPTAINS,
		characters: overrides?.characters ?? CHARACTERS,
		draftMode: overrides?.draftMode ?? 'SEQUENTIAL',
		rounds: overrides?.rounds ?? 2
	});
}

describe('Draft', () => {
	describe('create', () => {
		it('PICKING 상태로 시작하고 첫 번째 감독이 차례다', () => {
			const draft = makeDraft();
			expect(draft.phase).toBe('PICKING');
			expect(draft.currentCaptainId).toBe('cap-1');
			expect(draft.currentRound).toBe(1);
		});

		it('captains와 pendingQueue가 그대로 들어간다', () => {
			const draft = makeDraft();
			expect(draft.captains).toHaveLength(3);
			expect(draft.pendingQueue).toHaveLength(6);
			expect(draft.pickHistory).toEqual([]);
		});

		it('캐릭터가 없으면 즉시 COMPLETED 상태가 된다', () => {
			const draft = makeDraft({ characters: [] });
			expect(draft.phase).toBe('COMPLETED');
		});
	});

	describe('buildPickOrder', () => {
		it('SEQUENTIAL은 매 라운드 동일 순서다', () => {
			expect(buildPickOrder(['c1', 'c2', 'c3'], 2, 'SEQUENTIAL')).toEqual([
				'c1',
				'c2',
				'c3',
				'c1',
				'c2',
				'c3'
			]);
		});

		it('SNAKE는 홀수 라운드에서 역순이다', () => {
			expect(buildPickOrder(['c1', 'c2', 'c3'], 2, 'SNAKE')).toEqual([
				'c1',
				'c2',
				'c3',
				'c3',
				'c2',
				'c1'
			]);
		});
	});

	describe('pick', () => {
		it('현재 차례 감독이 픽하면 pickHistory에 기록되고 다음 감독으로 넘어간다', () => {
			const draft = makeDraft();
			const next = draft.pick('pick-1', 'cap-1', 'p1');
			expect(next.currentCaptainId).toBe('cap-2');
			expect(next.pickHistory).toHaveLength(1);
			expect(next.pickHistory[0]!.id).toBe('pick-1');
			expect(next.pickHistory[0]!.characterId).toBe('p1');
			expect(next.pickHistory[0]!.captainId).toBe('cap-1');
			expect(next.pickHistory[0]!.round).toBe(1);
		});

		it('픽한 캐릭터는 pendingQueue에서 제거된다', () => {
			const draft = makeDraft();
			const next = draft.pick('pick-1', 'cap-1', 'p1');
			expect(next.pendingQueue.some((c) => c.id === 'p1')).toBe(false);
			expect(next.pendingQueue).toHaveLength(5);
		});

		it('원본은 변경되지 않는다 (불변)', () => {
			const draft = makeDraft();
			draft.pick('pick-1', 'cap-1', 'p1');
			expect(draft.pickHistory).toEqual([]);
			expect(draft.currentPickIndex).toBe(0);
		});

		it('차례가 아닌 감독이 픽하면 NOT_YOUR_TURN', () => {
			const draft = makeDraft();
			expect(() => draft.pick('pick-1', 'cap-2', 'p1')).toThrow(DraftError);
			try {
				draft.pick('pick-1', 'cap-2', 'p1');
			} catch (e) {
				expect((e as DraftError).code).toBe('NOT_YOUR_TURN');
			}
		});

		it('pendingQueue에 없는 캐릭터를 픽하면 CHARACTER_NOT_IN_QUEUE', () => {
			const draft = makeDraft();
			expect(() => draft.pick('pick-1', 'cap-1', 'nonexistent')).toThrow(DraftError);
			try {
				draft.pick('pick-1', 'cap-1', 'nonexistent');
			} catch (e) {
				expect((e as DraftError).code).toBe('CHARACTER_NOT_IN_QUEUE');
			}
		});

		it('이미 픽된 캐릭터를 다시 픽하면 CHARACTER_NOT_IN_QUEUE', () => {
			const draft = makeDraft().pick('pick-1', 'cap-1', 'p1');
			expect(() => draft.pick('pick-2', 'cap-2', 'p1')).toThrow(
				expect.objectContaining({ code: 'CHARACTER_NOT_IN_QUEUE' })
			);
		});
	});

	describe('autoPick', () => {
		it('pendingQueue 첫 번째 캐릭터를 현재 감독에게 픽한다', () => {
			const draft = makeDraft();
			const next = draft.autoPick('pick-1');
			expect(next.pickHistory[0]!.characterId).toBe('p1');
			expect(next.pickHistory[0]!.captainId).toBe('cap-1');
			expect(next.currentCaptainId).toBe('cap-2');
		});
	});

	describe('완료', () => {
		it('모든 픽이 끝나면 COMPLETED가 된다', () => {
			const draft = makeDraft({ rounds: 1 })
				.pick('pick-1', 'cap-1', 'p1')
				.pick('pick-2', 'cap-2', 'p2')
				.pick('pick-3', 'cap-3', 'p3');
			expect(draft.phase).toBe('COMPLETED');
			expect(draft.isCompleted).toBe(true);
			expect(draft.currentCaptainId).toBeNull();
		});

		it('COMPLETED 상태에서 pick하면 NOT_PICKING_PHASE', () => {
			const draft = makeDraft({ rounds: 1 })
				.pick('pick-1', 'cap-1', 'p1')
				.pick('pick-2', 'cap-2', 'p2')
				.pick('pick-3', 'cap-3', 'p3');
			expect(() => draft.pick('pick-4', 'cap-1', 'p4')).toThrow(
				expect.objectContaining({ code: 'NOT_PICKING_PHASE' })
			);
		});
	});

	describe('SNAKE 복합 시나리오', () => {
		it('2팀 2라운드 스네이크 진행', () => {
			const captains = [
				Character.create('cap-1', '감독 1', null, Role.CAPTAIN),
				Character.create('cap-2', '감독 2', null, Role.CAPTAIN)
			];
			const draft = Draft.create({
				id: 'd-1',
				templateId: 'tpl-1',
				captains,
				characters: CHARACTERS.slice(0, 4),
				draftMode: 'SNAKE',
				rounds: 2
			});

			const r1 = draft.pick('pk-1', 'cap-1', 'p1');
			expect(r1.currentCaptainId).toBe('cap-2');

			const r2 = r1.pick('pk-2', 'cap-2', 'p2');
			expect(r2.currentCaptainId).toBe('cap-2');
			expect(r2.currentRound).toBe(2);

			const r3 = r2.pick('pk-3', 'cap-2', 'p3');
			expect(r3.currentCaptainId).toBe('cap-1');

			const r4 = r3.pick('pk-4', 'cap-1', 'p4');
			expect(r4.phase).toBe('COMPLETED');
		});
	});
});
