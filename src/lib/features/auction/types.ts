/** 경매 페이지 UI 단계 */
export type UIPhaseType = 'READY' | 'PLAYING' | 'FINISHED';

/** 입찰 기록 종류 */
export type BidRecordKindType = 'BID' | 'SOLD' | 'UNSOLD';

/** 입찰 기록 (UI 표시용) */
export interface BidRecordType {
	readonly kind: BidRecordKindType;
	readonly teamId: string;
	readonly teamName: string;
	readonly playerName: string;
	readonly amount: number;
	readonly timestamp: number;
}

/** 감독(팀 리더) 정보 — MSW 응답에서 변환 */
export interface CaptainType {
	readonly id: string;
	readonly name: string;
}
