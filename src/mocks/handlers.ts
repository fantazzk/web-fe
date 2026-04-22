import { http, HttpResponse } from 'msw';
import {
	success,
	createTemplateListResponse,
	createTemplateDetailResponse,
	createDraftTemplateDetailResponse,
	createTemplateResponse,
	createRoomResponse,
	createJoinableRoomListResponse,
	createRoomDetailResponse,
	createRoomCreateResponse,
	createRoomJoinResponse,
	createRoomStartResponse,
	createGameDetailResponse
} from './factories';

const BASE_URL = import.meta.env['PUBLIC_API_URL'] ?? '';

export const handlers = [
	// ─── Template API ───

	http.get(`${BASE_URL}/api/v1/templates`, () => {
		return HttpResponse.json(success(createTemplateListResponse()));
	}),

	http.get(`${BASE_URL}/api/v1/templates/:id`, ({ params }) => {
		const id = params['id'] as string;
		return HttpResponse.json(success(createTemplateDetailResponse({ id })));
	}),

	http.post(`${BASE_URL}/api/v1/templates`, async ({ request }) => {
		const body = (await request.json()) as { name: string };
		return HttpResponse.json(success(createTemplateResponse({ name: body.name })), {
			status: 201
		});
	}),

	// ─── Room API ───

	http.get(`${BASE_URL}/api/v1/rooms`, () => {
		return HttpResponse.json(success(createJoinableRoomListResponse()));
	}),

	http.post(`${BASE_URL}/api/v1/rooms`, () => {
		return HttpResponse.json(success(createRoomCreateResponse()), { status: 201 });
	}),

	http.get(`${BASE_URL}/api/v1/rooms/:code`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomDetailResponse({ roomCode: code })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/join`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(
			success(
				createRoomJoinResponse({
					room: createRoomDetailResponse({ roomCode: code })
				})
			)
		);
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/start`, () => {
		return HttpResponse.json(success(createRoomStartResponse()));
	}),

	http.put(`${BASE_URL}/api/v1/rooms/:code/draft-position`, () => {
		return HttpResponse.json(success(null));
	}),

	http.delete(`${BASE_URL}/api/v1/rooms/:code/draft-position`, () => {
		return HttpResponse.json(success(null));
	}),

	// ─── Game Play API ───

	http.get(`${BASE_URL}/api/v1/games/:gameId`, ({ params }) => {
		const gameId = params['gameId'] as string;
		return HttpResponse.json(success(createGameDetailResponse({ gameId })));
	}),

	http.post(`${BASE_URL}/api/v1/games/:gameId/draft-picks`, () => {
		return HttpResponse.json(success(null));
	}),

	http.post(`${BASE_URL}/api/v1/games/:gameId/bids`, () => {
		return HttpResponse.json(success(null));
	}),

	// ─── Solo API ───

	http.get(`${BASE_URL}/api/v1/solo/auction/:templateId`, ({ params }) => {
		const id = params['templateId'] as string;
		const template = createTemplateDetailResponse({ id });
		const captains = Array.from({ length: template.teamCount }, (_, i) => ({
			id: `captain-${i + 1}`,
			name: `감독 ${i + 1}`
		}));
		return HttpResponse.json(success({ template, captains }));
	}),

	http.get(`${BASE_URL}/api/v1/solo/draft/:templateId`, ({ params }) => {
		const id = params['templateId'] as string;
		const template = createDraftTemplateDetailResponse({ id });
		const captains = Array.from({ length: template.teamCount }, (_, i) => ({
			id: `captain-${i + 1}`,
			name: `감독 ${i + 1}`
		}));
		return HttpResponse.json(success({ template, captains }));
	}),

	// ─── Front-only (not in OpenAPI spec) ───

	http.post(`${BASE_URL}/api/v1/rooms/:code/draft-picks`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/bids`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/auction/progress`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/bid`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/settle`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/pick`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	})
];
