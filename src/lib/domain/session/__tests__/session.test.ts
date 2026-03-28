import { describe, it, expect } from 'vitest';
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
		it('솔로 세션을 생성한다', () => {
			const session = Session.createSolo({
				sessionId: 'session-1',
				mode: 'AUCTION',
				templateId: 'tmpl-1',
				hostId: 'host-1',
				hostNickname: '호스트',
				aiCount: 3
			});
			expect(session.id).toBe('session-1');
			expect(session.status).toBe('WAITING');
			expect(session.mode).toBe('AUCTION');
			expect(session.participants).toHaveLength(4);
			expect(session.hostId).toBe('host-1');
			expect(session.host.role).toBe('HOST');
			expect(session.humanCount).toBe(1);
			expect(session.canStart).toBe(true);
		});
	});

	describe('createMulti', () => {
		it('멀티 세션을 생성한다', () => {
			const session = Session.createMulti({
				sessionId: 'session-2',
				mode: 'DRAFT',
				templateId: 'tmpl-2',
				hostId: 'host-1',
				hostNickname: '호스트',
				maxParticipants: 6
			});
			expect(session.id).toBe('session-2');
			expect(session.status).toBe('WAITING');
			expect(session.participants).toHaveLength(1);
			expect(session.maxParticipants).toBe(6);
		});
	});

	describe('파생 상태', () => {
		it('connectedCount는 접속 중인 참가자 수를 반환한다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 2
			});
			expect(session.connectedCount).toBe(3);
		});

		it('isFullRoom은 참가자가 maxParticipants일 때 true', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 2
			});
			const guest = createGuest('g1').toggleReady();
			const full = session.addParticipant(guest);
			expect(full.isFullRoom).toBe(true);
		});

		it('allReady는 모든 참가자가 READY일 때 true', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			});
			expect(session.allReady).toBe(true);
		});
	});

	describe('addParticipant', () => {
		it('WAITING이 아닌 세션에 참가하면 SESSION_NOT_WAITING', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			}).start();
			const guest = createGuest('g1');
			expect(() => session.addParticipant(guest)).toThrow(
				expect.objectContaining({ code: 'SESSION_NOT_WAITING' })
			);
		});

		it('방이 가득 찼으면 SESSION_FULL', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 1
			});
			const guest = createGuest('g1');
			expect(() => session.addParticipant(guest)).toThrow(
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
			const guest = createGuest('h1');
			expect(() => session.addParticipant(guest)).toThrow(
				expect.objectContaining({ code: 'ALREADY_JOINED' })
			);
		});
	});

	describe('removeParticipant', () => {
		it('참가자를 제거한다', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});
			const guest = createGuest('g1');
			const withGuest = session.addParticipant(guest);
			const removed = withGuest.removeParticipant('g1');
			expect(removed.participants).toHaveLength(1);
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

		it('호스트가 퇴장하면 다음 HUMAN에게 호스트를 위임한다', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});
			const guest = createGuest('g1');
			const withGuest = session.addParticipant(guest);
			const afterHostLeft = withGuest.removeParticipant('h1');
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
			});
			const ai = createAI('ai-1');
			const withAI = session.addParticipant(ai);
			expect(() => withAI.removeParticipant('h1')).toThrow(
				expect.objectContaining({ code: 'NO_HOST_CANDIDATE' })
			);
		});
	});

	describe('toggleParticipantReady', () => {
		it('참가자의 ready 상태를 토글한다', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});
			const guest = createGuest('g1');
			const withGuest = session.addParticipant(guest);
			const toggled = withGuest.toggleParticipantReady('g1');
			expect(toggled.participants.find((p) => p.id === 'g1')?.readyStatus).toBe('READY');
		});
	});

	describe('disconnectParticipant', () => {
		it('참가자를 disconnect 한다', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});
			const guest = createGuest('g1');
			const withGuest = session.addParticipant(guest);
			const disconnected = withGuest.disconnectParticipant('g1');
			expect(disconnected.participants.find((p) => p.id === 'g1')?.connected).toBe(false);
		});
	});

	describe('reconnectParticipant', () => {
		it('참가자를 reconnect 한다', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});
			const guest = createGuest('g1');
			const reconnected = session
				.addParticipant(guest)
				.disconnectParticipant('g1')
				.reconnectParticipant('g1');
			expect(reconnected.participants.find((p) => p.id === 'g1')?.connected).toBe(true);
		});
	});

	describe('상태 전이', () => {
		it('start()로 WAITING → IN_PROGRESS 전이한다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 2
			});
			const started = session.start();
			expect(started.status).toBe('IN_PROGRESS');
		});

		it('canStart가 false이면 start() 실패', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 4
			});
			const guest = createGuest('g1');
			const withGuest = session.addParticipant(guest);
			expect(withGuest.canStart).toBe(false);
			expect(() => withGuest.start()).toThrow(
				expect.objectContaining({ code: 'START_CONDITIONS_NOT_MET' })
			);
		});

		it('WAITING이 아닌 세션에서 start() 실패', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			}).start();
			expect(() => session.start()).toThrow(
				expect.objectContaining({ code: 'SESSION_NOT_WAITING' })
			);
		});

		it('complete()로 IN_PROGRESS → COMPLETED 전이한다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			}).start();
			const completed = session.complete();
			expect(completed.status).toBe('COMPLETED');
		});

		it('IN_PROGRESS가 아닌 세션에서 complete() 실패', () => {
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

		it('COMPLETED에서 start() 불가', () => {
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
	});
});
