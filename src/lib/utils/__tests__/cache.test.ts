import { describe, it, expect, beforeEach } from 'bun:test';
import * as cache from '../cache.ts';

// bun test는 브라우저 환경이 아니므로 localStorage를 인메모리로 모킹한다
const store: Record<string, string> = {};
const localStorage = {
	getItem: (key: string) => store[key] ?? null,
	setItem: (key: string, value: string) => {
		store[key] = value;
	},
	removeItem: (key: string) => {
		delete store[key];
	},
	clear: () => {
		for (const key of Object.keys(store)) delete store[key];
	}
};
Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true });
Object.defineProperty(globalThis, 'localStorage', { value: localStorage, writable: true });

describe('cache', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	describe('set/get', () => {
		it('저장한 데이터를 조회할 수 있다', () => {
			cache.set('key1', { name: '테스트' }, 60_000);
			const entry = cache.get<{ name: string }>('key1');
			expect(entry).not.toBeNull();
			expect(entry!.data.name).toBe('테스트');
		});

		it('savedAt과 expiresAt이 기록된다', () => {
			const before = Date.now();
			cache.set('key1', 'data', 60_000);
			const after = Date.now();
			const entry = cache.get<string>('key1');
			expect(entry!.savedAt).toBeGreaterThanOrEqual(before);
			expect(entry!.savedAt).toBeLessThanOrEqual(after);
			expect(entry!.expiresAt).toBeGreaterThanOrEqual(before + 60_000);
			expect(entry!.expiresAt).toBeLessThanOrEqual(after + 60_000);
		});

		it('존재하지 않는 키는 null을 반환한다', () => {
			expect(cache.get('nonexistent')).toBeNull();
		});
	});

	describe('TTL 만료', () => {
		it('만료된 엔트리는 null을 반환하고 스토리지에서 제거된다', () => {
			cache.set('expired', 'data', -1);
			expect(cache.get('expired')).toBeNull();
			expect(localStorage.getItem('expired')).toBeNull();
		});
	});

	describe('consume', () => {
		it('데이터를 반환하고 스토리지에서 제거한다', () => {
			cache.set('key1', 'data', 60_000);
			const entry = cache.consume<string>('key1');
			expect(entry!.data).toBe('data');
			expect(cache.get<string>('key1')).toBeNull();
		});

		it('존재하지 않는 키는 null을 반환한다', () => {
			expect(cache.consume('nonexistent')).toBeNull();
		});

		it('만료된 엔트리는 null을 반환한다', () => {
			cache.set('expired', 'data', -1);
			expect(cache.consume('expired')).toBeNull();
		});
	});

	describe('remove', () => {
		it('지정한 키를 삭제한다', () => {
			cache.set('key1', 'data', 60_000);
			cache.remove('key1');
			expect(cache.get<string>('key1')).toBeNull();
		});
	});

	describe('JSON 파싱 실패', () => {
		it('잘못된 JSON은 null 반환 후 키를 제거한다', () => {
			localStorage.setItem('broken', '{invalid json}');
			expect(cache.get('broken')).toBeNull();
			expect(localStorage.getItem('broken')).toBeNull();
		});
	});
});
