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

export type GameType = 'LEAGUE_OF_LEGENDS' | 'OVERWATCH_2';

export interface TemplateResponse {
	id: string;
	name: string;
	gameType?: GameType;
	mode: 'AUCTION' | 'DRAFT';
	teamCount: number;
	teamSize: number;
	budget?: number;
	minBidUnit?: number;
	pickBanTime?: number;
	positionLimit?: number;
	draftOrderStrategy?: 'SNAKE' | 'FIXED';
	players?: TemplatePlayerResponse[];
	captains?: string[];
}

export interface TemplatePlayerResponse {
	name: string;
	position?: string;
	displayOrder: number;
}

export interface PlayerRequest {
	name: string;
	position: string;
}

export interface CreateTemplateRequest {
	name: string;
	gameType: GameType;
	mode: 'AUCTION' | 'DRAFT';
	teamCount: number;
	teamSize: number;
	pickBanTime?: number;
	budget?: number;
	minBidUnit?: number;
	positionLimit?: number;
	draftOrderStrategy?: 'SNAKE' | 'FIXED';
	players: PlayerRequest[];
}

// ─── Room API ───

export type RoomStatus = 'WAITING' | 'IN_PROGRESS' | 'FINISHED';

export interface AuctionTargetResponse {
	name: string;
	position: string;
}

export interface DraftOrderSlotResponse {
	draftPosition: number;
	leaderId: string;
	nickname: string;
}

export interface DraftOrderPreviewResponse {
	slots: DraftOrderSlotResponse[];
}

export interface RoomMemberResponse {
	teamLeaderId: string;
	playerName: string;
	assignOrder: number;
}

export interface RoomPlayerResponse {
	name: string;
	position?: string;
	displayOrder: number;
	status: string;
}

export interface RoomProgressResponse {
	currentTurnIndex: number;
	currentRound: number;
	currentLeaderId: string;
	currentRoundLeaderIds: string[];
	currentAuctionRoundEndsAt?: string;
	currentAuctionTarget?: AuctionTargetResponse;
	highestBidAmount?: number;
	leadingLeaderId?: string;
	bidCount?: number;
}

export interface JoinableRoomResponse {
	code: string;
	mode: string;
	teamCount: number;
	joinedLeaderCount: number;
	remainingSlotCount: number;
	startReadiness: string;
}

export interface RoomResponse {
	code: string;
	status: RoomStatus;
	mode?: string;
	teamCount?: number;
	teamSize?: number;
	budget?: number;
	minBidUnit?: number;
	draftOrderStrategy?: string;
	startReadiness?: string;
	draftOrderPreview?: DraftOrderPreviewResponse;
	teamLeaders: TeamLeaderResponse[];
	players?: RoomPlayerResponse[];
	members?: RoomMemberResponse[];
	progress?: RoomProgressResponse;
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

export interface PickDraftRequest {
	playerName: string;
}

export interface PlaceBidRequest {
	amount: number;
}

// ─── Front-only (not in OpenAPI spec) ───

export interface BidRequest {
	teamLeaderId: string;
	amount: number;
}

export interface PickRequest {
	teamLeaderId: string;
	playerName: string;
}
