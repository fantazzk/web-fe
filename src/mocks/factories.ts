import type {
	ApiResponse,
	TemplateResponse,
	RoomResponse,
	RoomSessionResponse,
	TeamLeaderResponse,
	RoomMemberResponse,
	RoomPlayerResponse,
	RoomProgressResponse,
	JoinableRoomResponse
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
			{ name: 'ONER', position: 'JGL', displayOrder: 1 },
			{ name: 'CHOVY', position: 'MID', displayOrder: 2 },
			{ name: 'PEYZ', position: 'ADC', displayOrder: 3 },
			{ name: 'LEHENDS', position: 'SUP', displayOrder: 4 }
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
			{ name: 'Oner', position: 'JGL', displayOrder: 4 },
			{ name: 'Canyon', position: 'JGL', displayOrder: 5 },
			{ name: 'Peanut', position: 'JGL', displayOrder: 6 },
			{ name: 'Lucid', position: 'JGL', displayOrder: 7 },
			{ name: 'Faker', position: 'MID', displayOrder: 8 },
			{ name: 'Chovy', position: 'MID', displayOrder: 9 },
			{ name: 'Zeka', position: 'MID', displayOrder: 10 },
			{ name: 'ShowMaker', position: 'MID', displayOrder: 11 },
			{ name: 'Gumayusi', position: 'ADC', displayOrder: 12 },
			{ name: 'Peyz', position: 'ADC', displayOrder: 13 },
			{ name: 'Viper', position: 'ADC', displayOrder: 14 },
			{ name: 'Aiming', position: 'ADC', displayOrder: 15 },
			{ name: 'Keria', position: 'SUP', displayOrder: 16 },
			{ name: 'Lehends', position: 'SUP', displayOrder: 17 },
			{ name: 'Delight', position: 'SUP', displayOrder: 18 },
			{ name: 'BeryL', position: 'SUP', displayOrder: 19 }
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
		displayOrder: 0,
		status: 'AVAILABLE',
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
