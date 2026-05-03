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
	gameType?: string;
	mode: 'AUCTION' | 'DRAFT';
	teamCount: number;
	teamSize: number;
	pickBanTime?: number;
	budget?: number;
	minBidUnit?: number;
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
	gameType?: string;
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

// ─── Room Detail / Session API ───

export type RoomDetailStatus = 'WAITING' | 'STARTED';
export type RoomMode = 'DRAFT' | 'AUCTION';
export type RoomPlayerStatus = 'AVAILABLE' | 'ASSIGNED';
export type StartReadiness =
	| 'WAITING_FOR_LEADERS'
	| 'WAITING_FOR_DRAFT_POSITIONS'
	| 'STARTABLE'
	| 'NOT_WAITING';
export type TeamLeaderRole = 'HOST' | 'LEADER';
export type DraftOrderStrategy = 'SNAKE' | 'FIXED';

export interface RoomDetailResponse {
	roomCode: string;
	gameType?: string;
	status: RoomDetailStatus;
	mode: RoomMode;
	teamCount: number;
	teamSize: number;
	budget?: number;
	minBidUnit?: number;
	draftOrderStrategy?: DraftOrderStrategy;
	startReadiness: StartReadiness;
	startedGameId?: string;
	draftOrder?: DraftOrderPreviewResponse;
	leaders: TeamLeaderResponse[];
	playerPool: RoomPlayerResponse[];
}

export interface RoomCreateResponse {
	room: RoomDetailResponse;
	teamLeaderSession: TeamLeaderSessionResponse;
}

export interface RoomJoinResponse {
	room: RoomDetailResponse;
	teamLeaderSession: TeamLeaderSessionResponse;
}

export interface RoomStartResponse {
	gameId: string;
}

// ─── Game API ───

export type GameStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface GameParticipantResponse {
	teamLeaderId: string;
	nickname: string;
	draftPosition?: number;
	remainingBudget?: number;
}

export interface GamePlayerResponse {
	name: string;
	position?: string;
	displayOrder: number;
	status: RoomPlayerStatus;
}

export interface GameMemberResponse {
	teamLeaderId: string;
	playerName: string;
	assignOrder: number;
}

export interface DraftProgressResponse {
	currentTurnIndex: number;
	currentRound: number;
	currentLeaderId: string;
	currentRoundLeaderIds: string[];
}

export interface AuctionProgressResponse {
	currentRound: number;
	currentAuctionRoundEndsAt?: string;
	currentAuctionTarget?: AuctionTargetResponse;
	highestBidAmount?: number;
	leadingLeaderId?: string;
	bidCount?: number;
}

export interface GameDetailResponse {
	gameId: string;
	roomCode: string;
	gameType?: string;
	mode: RoomMode;
	status: GameStatus;
	teamCount: number;
	teamSize: number;
	budget?: number;
	minBidUnit?: number;
	draftOrderStrategy?: DraftOrderStrategy;
	participants: GameParticipantResponse[];
	playerPool: GamePlayerResponse[];
	roster: GameMemberResponse[];
	draftProgress?: DraftProgressResponse;
	auctionProgress?: AuctionProgressResponse;
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
