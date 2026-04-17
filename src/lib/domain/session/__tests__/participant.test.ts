import { Participant } from '../participant.ts';

describe('Participant', () => {
	describe('생성 규칙', () => {
		it('AI는 NOT_READY/disconnected로 생성해도 READY + connected로 강제된다', () => {
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

		it('HOST는 NOT_READY로 생성해도 READY로 강제된다', () => {
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

	describe('disconnect', () => {
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
		it('GUEST를 HOST로 승격하면 READY가 강제된다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			const promoted = p.promoteToHost();
			expect(promoted.role).toBe('HOST');
			expect(promoted.readyStatus).toBe('READY');
		});
	});
});
