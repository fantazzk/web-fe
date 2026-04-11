import type {
	ApiResponse,
	TemplateResponse,
	RoomResponse,
	RoomSessionResponse,
	TeamLeaderResponse
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
		players: [
			{ name: 'KIIN', displayOrder: 0 },
			{ name: 'ONER', displayOrder: 1 },
			{ name: 'CHOVY', displayOrder: 2 },
			{ name: 'PEYZ', displayOrder: 3 },
			{ name: 'LEHENDS', displayOrder: 4 },
			{ name: 'ZEUS', displayOrder: 5 },
			{ name: 'CANYON', displayOrder: 6 },
			{ name: 'FAKER', displayOrder: 7 },
			{ name: 'GUMAYUSI', displayOrder: 8 },
			{ name: 'KERIA', displayOrder: 9 }
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

export function createRoomResponse(overrides?: Partial<RoomResponse>): RoomResponse {
	return {
		code: 'ABC774',
		status: 'WAITING',
		mode: 'AUCTION',
		teamCount: 8,
		teamLeaders: createTeamLeaders(2, 1000),
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
