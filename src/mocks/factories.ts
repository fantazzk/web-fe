import type {
	ApiResponse,
	TemplateResponse,
	RoomResponse,
	RoomSessionResponse,
	TeamLeaderResponse,
	RoomMemberResponse,
	RoomPlayerResponse,
	RoomProgressResponse,
	JoinableRoomResponse,
	AuctionTargetResponse,
	DraftOrderPreviewResponse,
	DraftOrderSlotResponse,
	RoomDetailResponse,
	RoomCreateResponse,
	RoomJoinResponse,
	RoomStartResponse,
	GameDetailResponse,
	GameParticipantResponse,
	GamePlayerResponse,
	GameMemberResponse,
	DraftProgressResponse,
	AuctionProgressResponse
} from '$lib/types/api';

// ─── 응답 래퍼 ───

export function success<T>(data: T): ApiResponse<T> {
	return { resultType: 'SUCCESS', success: data, error: null };
}

export function error(status: number, errorCode: string, reason: string): ApiResponse<never> {
	return {
		resultType: 'ERROR',
		success: null,
		error: { status, errorCode, reason }
	};
}

// ─── Template ───

export function createTemplateResponse(overrides?: Partial<TemplateResponse>): TemplateResponse {
	return {
		id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
		name: '스트리머 랭킹전 시즌 2',
		gameType: 'LEAGUE_OF_LEGENDS',
		mode: 'AUCTION',
		teamCount: 8,
		teamSize: 5,
		budget: 1000,
		...overrides
	};
}

export function createTemplateListResponse(): TemplateResponse[] {
	return [
		createTemplateResponse({
			id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
			name: '스트리머 랭킹전 시즌 2',
			mode: 'AUCTION',
			teamCount: 8,
			teamSize: 5,
			budget: 1000
		}),
		createTemplateResponse({
			id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
			name: '발로란트 프로 경매전',
			mode: 'AUCTION',
			teamCount: 6,
			teamSize: 5,
			budget: 800
		}),
		{
			id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
			name: '배그 스쿼드 드래프트',
			mode: 'DRAFT',
			teamCount: 4,
			teamSize: 4,
			draftOrderStrategy: 'SNAKE'
		}
	];
}

export function createTemplateDetailResponse(
	overrides?: Partial<TemplateResponse>
): TemplateResponse {
	return createTemplateResponse({
		budget: 1000,
		teamCount: 4,
		teamSize: 5,
		minBidUnit: 5,
		pickBanTime: 5,
		players: [
			{ name: 'KIIN', position: 'TOP', displayOrder: 0 },
			{ name: 'ONER', position: 'JUNGLE', displayOrder: 1 },
			{ name: 'CHOVY', position: 'MID', displayOrder: 2 },
			{ name: 'PEYZ', position: 'ADC', displayOrder: 3 },
			{ name: 'LEHENDS', position: 'SUPPORT', displayOrder: 4 }
		],
		...overrides
	});
}

export function createDraftTemplateDetailResponse(
	overrides?: Partial<TemplateResponse>
): TemplateResponse {
	return createTemplateResponse({
		mode: 'DRAFT',
		teamCount: 4,
		teamSize: 5,
		draftOrderStrategy: 'SNAKE',
		pickBanTime: 30,
		players: [
			{ name: 'Zeus', position: 'TOP', displayOrder: 0 },
			{ name: 'Kiin', position: 'TOP', displayOrder: 1 },
			{ name: 'Doran', position: 'TOP', displayOrder: 2 },
			{ name: 'DuDu', position: 'TOP', displayOrder: 3 },
			{ name: 'Oner', position: 'JUNGLE', displayOrder: 4 },
			{ name: 'Canyon', position: 'JUNGLE', displayOrder: 5 },
			{ name: 'Peanut', position: 'JUNGLE', displayOrder: 6 },
			{ name: 'Lucid', position: 'JUNGLE', displayOrder: 7 },
			{ name: 'Faker', position: 'MID', displayOrder: 8 },
			{ name: 'Chovy', position: 'MID', displayOrder: 9 },
			{ name: 'Zeka', position: 'MID', displayOrder: 10 },
			{ name: 'ShowMaker', position: 'MID', displayOrder: 11 },
			{ name: 'Gumayusi', position: 'ADC', displayOrder: 12 },
			{ name: 'Peyz', position: 'ADC', displayOrder: 13 },
			{ name: 'Viper', position: 'ADC', displayOrder: 14 },
			{ name: 'Aiming', position: 'ADC', displayOrder: 15 },
			{ name: 'Keria', position: 'SUPPORT', displayOrder: 16 },
			{ name: 'Lehends', position: 'SUPPORT', displayOrder: 17 },
			{ name: 'Delight', position: 'SUPPORT', displayOrder: 18 },
			{ name: 'BeryL', position: 'SUPPORT', displayOrder: 19 }
		],
		...overrides
	});
}

// ─── Room ───

function createTeamLeaders(count: number, budget: number): TeamLeaderResponse[] {
	const nicknames = [
		'DragonSlayer',
		'NightHawk_KR',
		'풍월량',
		'아규',
		'녹두로',
		'건자칩',
		'뚱벅비짐',
		'호스트'
	];
	return nicknames.slice(0, count).map((nickname, i) => ({
		id: `tl-${i + 1}`,
		nickname,
		remainingBudget: budget
	}));
}

export function createRoomMemberResponse(
	overrides?: Partial<RoomMemberResponse>
): RoomMemberResponse {
	return {
		teamLeaderId: 'tl-1',
		playerName: 'KIIN',
		assignOrder: 0,
		...overrides
	};
}

export function createRoomPlayerResponse(
	overrides?: Partial<RoomPlayerResponse>
): RoomPlayerResponse {
	return {
		name: 'KIIN',
		position: 'TOP',
		displayOrder: 0,
		status: 'AVAILABLE',
		...overrides
	};
}

export function createAuctionTargetResponse(
	overrides?: Partial<AuctionTargetResponse>
): AuctionTargetResponse {
	return {
		name: 'KIIN',
		position: 'TOP',
		...overrides
	};
}

export function createDraftOrderSlotResponse(
	overrides?: Partial<DraftOrderSlotResponse>
): DraftOrderSlotResponse {
	return {
		draftPosition: 1,
		leaderId: 'tl-1',
		nickname: 'DragonSlayer',
		...overrides
	};
}

export function createDraftOrderPreviewResponse(
	overrides?: Partial<DraftOrderPreviewResponse>
): DraftOrderPreviewResponse {
	return {
		slots: [
			createDraftOrderSlotResponse({
				draftPosition: 1,
				leaderId: 'tl-1',
				nickname: 'DragonSlayer'
			}),
			createDraftOrderSlotResponse({ draftPosition: 2, leaderId: 'tl-2', nickname: 'NightHawk_KR' })
		],
		...overrides
	};
}

export function createRoomProgressResponse(
	overrides?: Partial<RoomProgressResponse>
): RoomProgressResponse {
	return {
		currentTurnIndex: 0,
		currentRound: 1,
		currentLeaderId: 'tl-1',
		currentRoundLeaderIds: ['tl-1', 'tl-2'],
		...overrides
	};
}

export function createJoinableRoomResponse(
	overrides?: Partial<JoinableRoomResponse>
): JoinableRoomResponse {
	return {
		code: 'ABC774',
		gameType: 'LEAGUE_OF_LEGENDS',
		mode: 'AUCTION',
		teamCount: 8,
		joinedLeaderCount: 3,
		remainingSlotCount: 5,
		startReadiness: 'NOT_READY',
		...overrides
	};
}

export function createJoinableRoomListResponse(): JoinableRoomResponse[] {
	return [
		createJoinableRoomResponse({
			code: 'ABC774',
			mode: 'AUCTION',
			teamCount: 8,
			joinedLeaderCount: 3,
			remainingSlotCount: 5,
			startReadiness: 'NOT_READY'
		}),
		createJoinableRoomResponse({
			code: 'XYZ123',
			mode: 'DRAFT',
			teamCount: 4,
			joinedLeaderCount: 2,
			remainingSlotCount: 2,
			startReadiness: 'NOT_READY'
		}),
		createJoinableRoomResponse({
			code: 'QRS456',
			mode: 'AUCTION',
			teamCount: 6,
			joinedLeaderCount: 5,
			remainingSlotCount: 1,
			startReadiness: 'READY'
		})
	];
}

export function createRoomResponse(overrides?: Partial<RoomResponse>): RoomResponse {
	return {
		code: 'ABC774',
		status: 'WAITING',
		mode: 'AUCTION',
		teamCount: 8,
		teamSize: 5,
		budget: 1000,
		minBidUnit: 5,
		draftOrderStrategy: 'SNAKE',
		teamLeaders: createTeamLeaders(2, 1000),
		players: [
			createRoomPlayerResponse({ name: 'KIIN', displayOrder: 0 }),
			createRoomPlayerResponse({ name: 'ONER', displayOrder: 1 }),
			createRoomPlayerResponse({ name: 'CHOVY', displayOrder: 2 })
		],
		members: [],
		...overrides
	};
}

export function createRoomSessionResponse(
	overrides?: Partial<RoomSessionResponse>
): RoomSessionResponse {
	return {
		room: createRoomResponse(),
		teamLeaderSession: {
			leaderId: 'tl-1',
			role: 'HOST',
			actionToken: 'mock-action-token-abc123'
		},
		...overrides
	};
}

// ─── Room Detail / Session (OpenAPI) ───

export function createRoomDetailResponse(
	overrides?: Partial<RoomDetailResponse>
): RoomDetailResponse {
	return {
		roomCode: 'ROOM01',
		gameType: 'LEAGUE_OF_LEGENDS',
		status: 'WAITING',
		mode: 'DRAFT',
		teamCount: 2,
		teamSize: 3,
		draftOrderStrategy: 'SNAKE',
		startReadiness: 'WAITING_FOR_DRAFT_POSITIONS',
		draftOrder: {
			slots: [
				{ draftPosition: 1, leaderId: 'leader-host', nickname: '호스트' },
				{ draftPosition: 2, leaderId: 'leader-guest', nickname: '게스트' }
			]
		},
		leaders: [
			{ id: 'leader-host', nickname: '호스트', draftPosition: 1 },
			{ id: 'leader-guest', nickname: '게스트', draftPosition: 2 }
		],
		playerPool: [
			{ name: '선수1', position: 'TOP', displayOrder: 0, status: 'AVAILABLE' },
			{ name: '선수2', position: 'JUNGLE', displayOrder: 1, status: 'AVAILABLE' }
		],
		...overrides
	};
}

export function createRoomCreateResponse(
	overrides?: Partial<RoomCreateResponse>
): RoomCreateResponse {
	return {
		room: createRoomDetailResponse(),
		teamLeaderSession: {
			leaderId: 'leader-host',
			role: 'HOST',
			actionToken: 'room-action-token'
		},
		...overrides
	};
}

export function createRoomJoinResponse(overrides?: Partial<RoomJoinResponse>): RoomJoinResponse {
	return {
		room: createRoomDetailResponse({
			leaders: [
				{ id: 'leader-host', nickname: '호스트', draftPosition: 1 },
				{ id: 'leader-guest', nickname: '게스트' }
			]
		}),
		teamLeaderSession: {
			leaderId: 'leader-guest',
			role: 'LEADER',
			actionToken: 'guest-room-action-token'
		},
		...overrides
	};
}

export function createRoomStartResponse(overrides?: Partial<RoomStartResponse>): RoomStartResponse {
	return {
		gameId: '00000000-0000-0000-0000-000000000201',
		...overrides
	};
}

// ─── Game ───

export function createGameParticipantResponse(
	overrides?: Partial<GameParticipantResponse>
): GameParticipantResponse {
	return {
		teamLeaderId: 'leader-host',
		nickname: '호스트',
		draftPosition: 1,
		...overrides
	};
}

export function createGamePlayerResponse(
	overrides?: Partial<GamePlayerResponse>
): GamePlayerResponse {
	return {
		name: '선수1',
		position: 'TOP',
		displayOrder: 0,
		status: 'AVAILABLE',
		...overrides
	};
}

export function createGameMemberResponse(
	overrides?: Partial<GameMemberResponse>
): GameMemberResponse {
	return {
		teamLeaderId: 'leader-host',
		playerName: '선수1',
		assignOrder: 0,
		...overrides
	};
}

export function createDraftProgressResponse(
	overrides?: Partial<DraftProgressResponse>
): DraftProgressResponse {
	return {
		currentTurnIndex: 1,
		currentRound: 1,
		currentLeaderId: 'leader-guest',
		currentRoundLeaderIds: ['leader-host', 'leader-guest'],
		...overrides
	};
}

export function createAuctionProgressResponse(
	overrides?: Partial<AuctionProgressResponse>
): AuctionProgressResponse {
	return {
		currentRound: 2,
		currentAuctionRoundEndsAt: '2026-04-19T12:00:45Z',
		currentAuctionTarget: { name: '선수2', position: 'JUNGLE' },
		highestBidAmount: 150,
		leadingLeaderId: 'leader-guest',
		bidCount: 2,
		...overrides
	};
}

export function createGameDetailResponse(
	overrides?: Partial<GameDetailResponse>
): GameDetailResponse {
	return {
		gameId: '00000000-0000-0000-0000-000000000202',
		roomCode: 'ROOM01',
		gameType: 'LEAGUE_OF_LEGENDS',
		mode: 'DRAFT',
		status: 'IN_PROGRESS',
		teamCount: 2,
		teamSize: 3,
		draftOrderStrategy: 'SNAKE',
		participants: [
			createGameParticipantResponse({
				teamLeaderId: 'leader-host',
				nickname: '호스트',
				draftPosition: 1
			}),
			createGameParticipantResponse({
				teamLeaderId: 'leader-guest',
				nickname: '게스트',
				draftPosition: 2
			})
		],
		playerPool: [
			createGamePlayerResponse({ name: '선수1', displayOrder: 0, status: 'ASSIGNED' }),
			createGamePlayerResponse({
				name: '선수2',
				position: 'JUNGLE',
				displayOrder: 1,
				status: 'AVAILABLE'
			})
		],
		roster: [createGameMemberResponse({ playerName: '선수1', assignOrder: 0 })],
		draftProgress: createDraftProgressResponse(),
		...overrides
	};
}
