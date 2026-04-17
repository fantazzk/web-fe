/** 현재 시각에서 durationSeconds 초 후의 timestamp를 반환 */
export function createEndTime(durationSeconds: number): number {
	return Date.now() + durationSeconds * 1000;
}

/** endTime까지 남은 초를 반환 (0 이상) */
export function calcRemaining(endTime: number): number {
	return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
}
