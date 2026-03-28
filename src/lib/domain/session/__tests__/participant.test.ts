import { describe, it, expect } from 'vitest';
import { Participant } from '../participant.ts';
import { SessionError } from '../errors.ts';

describe('Participant', () => {
	describe('생성', () => {
		it('HUMAN 참가자를 기본값으로 생성한다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			expect(p.id).toBe('user-1');
			expect(p.nickname).toBe('테스터');
			expect(p.type).toBe('HUMAN');
			expect(p.role).toBe('GUEST');
			expect(p.readyStatus).toBe('NOT_READY');
			expect(p.connected).toBe(true);
		});

		it('AI 참가자는 항상 READY이고 connected이다', () => {
			const p = new Participant({
				id: 'ai-1',
				nickname: 'AI 1',
				type: 'AI',
				role: 'GUEST',
				readyStatus: 'NOT_READY',
				connected: false
			});

			expect(p.readyStatus).toBe('READY');
			expect(p.connected).toBe(true);
		});

		it('HOST는 항상 READY이다', () => {
			const p = new Participant({
				id: 'host-1',
				nickname: '호스트',
				type: 'HUMAN',
				role: 'HOST',
				readyStatus: 'NOT_READY'
			});

			expect(p.readyStatus).toBe('READY');
		});
	});

	describe('toggleReady', () => {
		it('GUEST HUMAN의 ready 상태를 토글한다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			const toggled = p.toggleReady();
			expect(toggled.readyStatus).toBe('READY');
			expect(toggled).not.toBe(p);

			const toggledBack = toggled.toggleReady();
			expect(toggledBack.readyStatus).toBe('NOT_READY');
		});

		it('HOST는 toggleReady 할 수 없다', () => {
			const p = new Participant({
				id: 'host-1',
				nickname: '호스트',
				type: 'HUMAN',
				role: 'HOST'
			});

			expect(() => p.toggleReady()).toThrow(SessionError);
			expect(() => p.toggleReady()).toThrow(
				expect.objectContaining({ code: 'CANNOT_TOGGLE_READY' })
			);
		});

		it('AI는 toggleReady 할 수 없다', () => {
			const p = new Participant({
				id: 'ai-1',
				nickname: 'AI 1',
				type: 'AI',
				role: 'GUEST'
			});

			expect(() => p.toggleReady()).toThrow(
				expect.objectContaining({ code: 'CANNOT_TOGGLE_READY' })
			);
		});
	});

	describe('disconnect / reconnect', () => {
		it('HUMAN 참가자를 disconnect 한다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			const disconnected = p.disconnect();
			expect(disconnected.connected).toBe(false);
			expect(disconnected).not.toBe(p);
		});

		it('disconnect된 참가자를 reconnect 한다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			const reconnected = p.disconnect().reconnect();
			expect(reconnected.connected).toBe(true);
		});

		it('AI는 disconnect 할 수 없다', () => {
			const p = new Participant({
				id: 'ai-1',
				nickname: 'AI 1',
				type: 'AI',
				role: 'GUEST'
			});

			expect(() => p.disconnect()).toThrow(
				expect.objectContaining({ code: 'CANNOT_DISCONNECT_AI' })
			);
		});
	});

	describe('promoteToHost', () => {
		it('GUEST를 HOST로 승격하면 READY가 된다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			const promoted = p.promoteToHost();
			expect(promoted.role).toBe('HOST');
			expect(promoted.readyStatus).toBe('READY');
			expect(promoted).not.toBe(p);
		});
	});
});
