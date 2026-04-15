import { env } from '$env/dynamic/public';
import type { ApiResponse } from '$lib/types/api';

export class ApiClientError extends Error {
	readonly status: number;
	readonly errorCode: string;

	constructor(status: number, errorCode: string, message: string) {
		super(message);
		this.name = 'ApiClientError';
		this.status = status;
		this.errorCode = errorCode;
	}
}

function getBaseUrl(): string {
	return env.PUBLIC_API_URL ?? '';
}

function unwrap<T>(body: ApiResponse<T>, status: number): T {
	if (body.resultType === 'ERROR' || body.success == null) {
		const err = body.error;
		throw new ApiClientError(
			err?.status ?? status,
			err?.errorCode ?? 'UNKNOWN',
			err?.reason ?? 'Unknown error'
		);
	}
	return body.success;
}

export async function apiGet<T>(fetch: typeof globalThis.fetch, path: string): Promise<T> {
	const res = await fetch(`${getBaseUrl()}${path}`);
	const body: ApiResponse<T> = await res.json();
	return unwrap(body, res.status);
}

export async function apiPost<T>(
	fetch: typeof globalThis.fetch,
	path: string,
	data: unknown
): Promise<T> {
	const res = await fetch(`${getBaseUrl()}${path}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
	const body: ApiResponse<T> = await res.json();
	return unwrap(body, res.status);
}
