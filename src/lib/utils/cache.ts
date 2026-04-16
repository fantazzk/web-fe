export interface CacheEntryType<T> {
	data: T;
	savedAt: number;
	expiresAt: number;
}

function isBrowser(): boolean {
	return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function set<T>(key: string, data: T, ttlMs: number): void {
	if (!isBrowser()) return;
	const now = Date.now();
	const entry: CacheEntryType<T> = { data, savedAt: now, expiresAt: now + ttlMs };
	try {
		localStorage.setItem(key, JSON.stringify(entry));
	} catch {
		// QuotaExceededError 등 무시
	}
}

export function get<T>(key: string): CacheEntryType<T> | null {
	if (!isBrowser()) return null;
	const raw = localStorage.getItem(key);
	if (raw === null) return null;
	try {
		const entry = JSON.parse(raw) as CacheEntryType<T>;
		if (Date.now() > entry.expiresAt) {
			localStorage.removeItem(key);
			return null;
		}
		return entry;
	} catch {
		localStorage.removeItem(key);
		return null;
	}
}

export function consume<T>(key: string): CacheEntryType<T> | null {
	const entry = get<T>(key);
	if (entry !== null) localStorage.removeItem(key);
	return entry;
}

export function remove(key: string): void {
	if (!isBrowser()) return;
	localStorage.removeItem(key);
}
