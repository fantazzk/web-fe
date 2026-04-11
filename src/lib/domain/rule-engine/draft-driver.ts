import type { Draft } from '$lib/domain/rule-engine/draft';
import type { DraftErrorCode } from '$lib/domain/rule-engine/draft-errors';
import { DraftError } from '$lib/domain/rule-engine/draft-errors';

interface PickResultType {
	readonly draft: Draft;
	readonly errorCode: DraftErrorCode | null;
}

/** 픽 시도 — 성공 시 갱신된 Draft, 실패 시 에러 코드 */
export function processPick(draft: Draft, teamId: string, playerName: string): PickResultType {
	try {
		const next = draft.pick(teamId, playerName);
		return { draft: next, errorCode: null };
	} catch (e) {
		if (e instanceof DraftError) {
			return { draft, errorCode: e.code };
		}
		throw e;
	}
}

/** 타이머 만료 처리 — remainingPool[0] 자동 선택 */
export function processAutoPick(draft: Draft): Draft {
	return draft.autoPick();
}
