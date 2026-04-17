import { Session } from '../session.ts';
import { Participant } from '../participant.ts';

function createGuest(id = 'guest-1'): Participant {
	return new Participant({ id, nickname: '게스트', type: 'HUMAN', role: 'GUEST' });
}

function createAI(id = 'ai-1'): Participant {
	return new Participant({ id, nickname: 'AI 1', type: 'AI', role: 'GUEST' });
}

describe('Session', () => {
	describe('createSolo', () => {
		it('호스트 1명 + AI N명으로 생성되며 즉시 시작 가능하다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: '호스트',
				aiCount: 3
			});

			expect(session.participants).toHaveLength(4);
			expect(session.humanCount).toBe(1);
			expect(session.canStart).toBe(true);
		});
	});

	describe('addParticipant', () => {
		it('방이 가득 찼으면 SESSION_FULL', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 1
			});

			expect(() => session.addParticipant(createGuest('g1'))).toThrow(
				expect.objectContaining({ code: 'SESSION_FULL' })
			);
		});

		it('이미 참가 중인 ID면 ALREADY_JOINED', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});

			expect(() => session.addParticipant(createGuest('h1'))).toThrow(
				expect.objectContaining({ code: 'ALREADY_JOINED' })
			);
		});

		it('WAITING이 아닌 세션에 참가하면 SESSION_NOT_WAITING', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			}).start();

			expect(() => session.addParticipant(createGuest('g1'))).toThrow(
				expect.objectContaining({ code: 'SESSION_NOT_WAITING' })
			);
		});
	});

	describe('removeParticipant', () => {
		it('호스트가 퇴장하면 다음 HUMAN에게 호스트를 위임한다', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			}).addParticipant(createGuest('g1'));

			const afterHostLeft = session.removeParticipant('h1');
			expect(afterHostLeft.hostId).toBe('g1');
			expect(afterHostLeft.host.role).toBe('HOST');
		});

		it('호스트가 퇴장하고 HUMAN이 없으면 NO_HOST_CANDIDATE', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			}).addParticipant(createAI('ai-1'));

			expect(() => session.removeParticipant('h1')).toThrow(
				expect.objectContaining({ code: 'NO_HOST_CANDIDATE' })
			);
		});

		it('존재하지 않는 참가자를 제거하면 PARTICIPANT_NOT_FOUND', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});

			expect(() => session.removeParticipant('nobody')).toThrow(
				expect.objectContaining({ code: 'PARTICIPANT_NOT_FOUND' })
			);
		});
	});

	describe('상태 전이', () => {
		it('전원 READY면 start()로 IN_PROGRESS 전이한다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 2
			});

			expect(session.start().status).toBe('IN_PROGRESS');
		});

		it('NOT_READY 참가자가 있으면 start() 실패', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			}).addParticipant(createGuest('g1'));

			expect(() => session.start()).toThrow(
				expect.objectContaining({ code: 'START_CONDITIONS_NOT_MET' })
			);
		});

		it('IN_PROGRESS에서 complete()로 COMPLETED 전이한다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			}).start();

			expect(session.complete().status).toBe('COMPLETED');
		});

		it('COMPLETED에서 start()는 불가하다 (역방향 전이 없음)', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			})
				.start()
				.complete();

			expect(() => session.start()).toThrow(
				expect.objectContaining({ code: 'SESSION_NOT_WAITING' })
			);
		});

		it('WAITING에서 complete()는 불가하다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			});

			expect(() => session.complete()).toThrow(
				expect.objectContaining({ code: 'SESSION_NOT_IN_PROGRESS' })
			);
		});
	});
});
