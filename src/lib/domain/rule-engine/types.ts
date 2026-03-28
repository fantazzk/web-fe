import type { PlayerParams } from '../template/types.ts';

/** 경매 진행 단계: 입찰 중 → 낙찰/유찰 → 완료 */
export type AuctionPhase = 'BIDDING' | 'SOLD' | 'UNSOLD' | 'COMPLETED';

/** 입찰 기록 */
export interface Bid {
	readonly teamId: string;
	readonly amount: number;
}

/** 경매 설정 (Template에서 전달) */
export interface AuctionConfig {
	readonly teamCount: number;
	readonly totalPoints: number;
	readonly minBidUnit: number;
	readonly positionLimit: number;
	readonly playerPool: readonly PlayerParams[];
	readonly teamIds: readonly string[];
}

/** 팀 상태 */
export interface TeamState {
	readonly id: string;
	readonly remainingPoints: number;
	readonly roster: readonly PlayerParams[];
}
