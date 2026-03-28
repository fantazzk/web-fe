export type SessionStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
export type SessionMode = 'AUCTION' | 'DRAFT';
export type ParticipantType = 'HUMAN' | 'AI';
export type ParticipantRole = 'HOST' | 'GUEST';
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
