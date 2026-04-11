// src/lib/features/draft/types.ts

/** 드래프트 페이지 UI 단계 */
export type UIPhaseType = 'READY' | 'PLAYING' | 'FINISHED';

/** 감독(팀 리더) 정보 — MSW 응답에서 변환 */
export interface CaptainType {
	readonly id: string;
	readonly name: string;
}

/** 에러 코드 → 한글 메시지 매핑 (UI 레이어) */
export const DRAFT_ERROR_MESSAGES: Record<string, string> = {
	NOT_PICKING_PHASE: '드래프트가 진행 중이 아닙니다',
	NOT_YOUR_TURN: '현재 차례가 아닙니다',
	PLAYER_NOT_FOUND: '선수를 찾을 수 없습니다',
	TEAM_NOT_FOUND: '팀을 찾을 수 없습니다',
	DRAFT_ALREADY_COMPLETED: '드래프트가 완료되었습니다'
};
