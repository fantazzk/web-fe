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
	id: number;
	name: string;
	mode: 'AUCTION' | 'DRAFT';
	teamCount: number;
	teamSize: number;
	budget?: number;
	draftOrderStrategy?: 'SNAKE' | 'SEQUENTIAL';
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
	draftOrderStrategy?: 'SNAKE' | 'SEQUENTIAL';
	playerNames: string[];
}

// ─── Room API ───

export type RoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export interface RoomResponse {
	code: string;
	status: RoomStatus;
	teamLeaders: TeamLeaderResponse[];
}

export interface TeamLeaderResponse {
	id: string;
	nickname: string;
	remainingBudget?: number;
}

export interface CreateRoomRequest {
	templateId: number;
	hostNickname: string;
}

export interface JoinRoomRequest {
	nickname: string;
}

export interface BidRequest {
	teamLeaderId: string;
	amount: number;
}

export interface PickRequest {
	teamLeaderId: string;
	playerName: string;
}
