import { describe, it, expect } from 'bun:test';
import { calcRemaining, createEndTime } from '../countdown.ts';

describe('createEndTime', () => {
	it('현재 시각에서 지정 초만큼 뒤의 timestamp를 반환한다', () => {
		const now = Date.now();
		const end = createEndTime(30);
		expect(end).toBeGreaterThanOrEqual(now + 29_000);
		expect(end).toBeLessThanOrEqual(now + 31_000);
	});
});

describe('calcRemaining', () => {
	it('endTime이 미래이면 남은 초를 반환한다', () => {
		const endTime = Date.now() + 15_000;
		const remaining = calcRemaining(endTime);
		expect(remaining).toBeGreaterThanOrEqual(14);
		expect(remaining).toBeLessThanOrEqual(15);
	});

	it('endTime이 과거이면 0을 반환한다', () => {
		const endTime = Date.now() - 5_000;
		expect(calcRemaining(endTime)).toBe(0);
	});

	it('endTime이 정확히 현재이면 0을 반환한다', () => {
		expect(calcRemaining(Date.now())).toBe(0);
	});
});
