import { describe, it, expect } from 'bun:test';
import { Draft } from '../draft';
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

		it('captains와 pendingQueue가 그대로 들어가고 rosters는 빈 상태로 초기화된다', () => {
			const draft = makeDraft();
			expect(draft.captains).toHaveLength(3);
			expect(draft.pendingQueue).toHaveLength(6);
			expect(draft.pickHistory).toEqual([]);
			for (const captain of draft.captains) {
				expect(draft.rosters[captain.id]).toEqual([]);
			}
		});

		it('SEQUENTIAL pickOrder는 매 라운드 동일 순서다', () => {
			const draft = makeDraft({ draftMode: 'SEQUENTIAL', rounds: 2 });
			expect(draft.pickOrder).toEqual(['cap-1', 'cap-2', 'cap-3', 'cap-1', 'cap-2', 'cap-3']);
		});

		it('SNAKE pickOrder는 홀수 라운드에서 역순이다', () => {
			const draft = makeDraft({ draftMode: 'SNAKE', rounds: 2 });
			expect(draft.pickOrder).toEqual(['cap-1', 'cap-2', 'cap-3', 'cap-3', 'cap-2', 'cap-1']);
		});

		it('캐릭터가 없으면 즉시 COMPLETED 상태가 된다', () => {
			const draft = makeDraft({ characters: [] });
			expect(draft.phase).toBe('COMPLETED');
		});
	});

	describe('pick', () => {
		it('현재 차례 감독이 픽하면 pickHistory와 rosters에 모두 반영된다', () => {
			const draft = makeDraft();
			const next = draft.pick('pick-1', 'cap-1', 'p1');
			expect(next.currentCaptainId).toBe('cap-2');
			expect(next.pickHistory).toHaveLength(1);
			expect(next.pickHistory[0]!.id).toBe('pick-1');
			expect(next.pickHistory[0]!.characterId).toBe('p1');
			expect(next.pickHistory[0]!.captainId).toBe('cap-1');
			expect(next.pickHistory[0]!.round).toBe(1);
			expect(next.rosters['cap-1']).toHaveLength(1);
			expect(next.rosters['cap-1']![0]!.id).toBe('p1');
			expect(next.rosters['cap-2']).toEqual([]);
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
			expect(draft.rosters['cap-1']).toEqual([]);
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
		it('pendingQueue 첫 번째 캐릭터를 현재 감독에게 픽하고 rosters에 반영한다', () => {
			const draft = makeDraft();
			const next = draft.autoPick('pick-1');
			expect(next.pickHistory[0]!.characterId).toBe('p1');
			expect(next.pickHistory[0]!.captainId).toBe('cap-1');
			expect(next.currentCaptainId).toBe('cap-2');
			expect(next.rosters['cap-1']![0]!.id).toBe('p1');
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

		it('COMPLETED 상태에서 pick하면 DRAFT_ALREADY_COMPLETED', () => {
			const draft = makeDraft({ rounds: 1 })
				.pick('pick-1', 'cap-1', 'p1')
				.pick('pick-2', 'cap-2', 'p2')
				.pick('pick-3', 'cap-3', 'p3');
			expect(() => draft.pick('pick-4', 'cap-1', 'p4')).toThrow(
				expect.objectContaining({ code: 'DRAFT_ALREADY_COMPLETED' })
			);
		});
	});

	describe('SNAKE 복합 시나리오', () => {
		it('2팀 2라운드 스네이크 진행하며 rosters가 누적된다', () => {
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

			expect(r4.rosters['cap-1']!.map((c) => c.id)).toEqual(['p1', 'p4']);
			expect(r4.rosters['cap-2']!.map((c) => c.id)).toEqual(['p2', 'p3']);
		});
	});
});
