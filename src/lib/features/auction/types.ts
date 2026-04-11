import type { Auction } from '$lib/domain/rule-engine/auction';

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

/** auction-store가 관리하는 전체 상태 */
export interface AuctionStoreStateType {
	readonly auction: Auction;
	readonly uiPhase: UIPhaseType;
	readonly selectedTeamId: string | null;
	readonly bidRecords: readonly BidRecordType[];
	readonly endTime: number | null;
	readonly errorMessage: string | null;
}

/** 감독(팀 리더) 정보 — MSW 응답에서 변환 */
export interface CaptainType {
	readonly id: string;
	readonly name: string;
}
