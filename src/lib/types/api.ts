// ─── 공통 응답 ───

export interface ApiResponse<T> {
	resultType: 'SUCCESS' | 'ERROR';
	success: T | null;
	error: ApiError | null;
}

export interface ApiError {
	status: number;
	errorCode: string;
	reason: string;
	data?: Record<string, unknown>;
}

// ─── Template API ───

export interface TemplateResponse {
	id: string;
	name: string;
	mode: 'AUCTION' | 'DRAFT';
	teamCount: number;
	teamSize: number;
	budget?: number;
	draftOrderStrategy?: 'SNAKE' | 'FIXED';
	players?: TemplatePlayerResponse[];
}

export interface TemplatePlayerResponse {
	name: string;
	displayOrder: number;
}

export interface CreateTemplateRequest {
	name: string;
	mode: 'AUCTION' | 'DRAFT';
	teamCount: number;
	teamSize: number;
	budget?: number;
	draftOrderStrategy?: 'SNAKE' | 'FIXED';
	playerNames: string[];
}

// ─── Room API ───

export type RoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export interface RoomResponse {
	code: string;
	status: RoomStatus;
	mode?: string;
	teamCount?: number;
	startReadiness?: string;
	teamLeaders: TeamLeaderResponse[];
}

export interface TeamLeaderResponse {
	id: string;
	nickname: string;
	draftPosition?: number;
	remainingBudget?: number;
}

export interface CreateRoomRequest {
	templateId: string;
	hostNickname: string;
}

export interface JoinRoomRequest {
	nickname: string;
}

export interface SelectDraftPositionRequest {
	draftPosition: number;
}

export interface RoomSessionResponse {
	room: RoomResponse;
	teamLeaderSession: TeamLeaderSessionResponse;
}

export interface TeamLeaderSessionResponse {
	leaderId: string;
	role: string;
	actionToken: string;
}

export interface BidRequest {
	teamLeaderId: string;
	amount: number;
}

export interface PickRequest {
	teamLeaderId: string;
	playerName: string;
}
