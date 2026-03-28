import type { PlayerParams } from '../template/types.ts';

/** 드래프트 진행 단계 */
export type DraftPhase = 'PICKING' | 'COMPLETED';

/** 드래프트 방식: 순차 또는 스네이크 */
export type DraftType = 'SEQUENTIAL' | 'SNAKE';

/** 드래프트 설정 */
export interface DraftConfig {
	readonly teamCount: number;
	readonly draftType: DraftType;
	readonly rounds: number;
	readonly playerPool: readonly PlayerParams[];
	readonly teamIds: readonly string[];
}

/** 드래프트 팀 상태 */
export interface DraftTeamState {
	readonly id: string;
	readonly roster: readonly PlayerParams[];
}

/** 픽 기록 */
export interface PickRecord {
	readonly player: PlayerParams;
	readonly teamId: string;
	readonly round: number;
}
