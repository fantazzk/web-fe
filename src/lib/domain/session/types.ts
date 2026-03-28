/** 세션 생명주기: 대기 → 진행 중 → 완료 */
export type SessionStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';

/** 게임 진행 방식: 경매(포인트 입찰) 또는 드래프트(순차 픽) */
export type SessionMode = 'AUCTION' | 'DRAFT';

/** 참가자 유형: 실제 유저 또는 솔로 모드 AI */
export type ParticipantType = 'HUMAN' | 'AI';

/** 참가자 권한: 방장(시작/설정 제어) 또는 일반 참가자 */
export type ParticipantRole = 'HOST' | 'GUEST';

/** 준비 상태: HOST/AI는 항상 READY로 강제 */
export type ReadyStatus = 'READY' | 'NOT_READY';

export interface ParticipantParams {
	readonly id: string;
	readonly nickname: string;
	readonly type: ParticipantType;
	readonly role: ParticipantRole;
	readonly readyStatus?: ReadyStatus;
	readonly connected?: boolean;
}

export interface SessionParams {
	readonly id: string;
	readonly status?: SessionStatus;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly participants: readonly ParticipantParams[];
	readonly maxParticipants: number;
	readonly createdAt?: Date;
}

export interface SoloConfig {
	readonly sessionId: string;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly hostNickname: string;
	readonly aiCount: number;
}

export interface MultiConfig {
	readonly sessionId: string;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly hostNickname: string;
	readonly maxParticipants: number;
}
