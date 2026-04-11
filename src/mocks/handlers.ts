import { http, HttpResponse } from 'msw';
import {
	success,
	createTemplateListResponse,
	createTemplateDetailResponse,
	createTemplateResponse,
	createRoomResponse,
	createRoomSessionResponse
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

	http.post(`${BASE_URL}/api/v1/rooms`, () => {
		return HttpResponse.json(success(createRoomSessionResponse()), { status: 201 });
	}),

	http.get(`${BASE_URL}/api/v1/rooms/:code`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/join`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(
			success(
				createRoomSessionResponse({
					room: createRoomResponse({
						code,
						teamLeaders: [
							{ id: 'tl-1', nickname: 'DragonSlayer', remainingBudget: 1000 },
							{ id: 'tl-2', nickname: 'NightHawk_KR', remainingBudget: 1000 },
							{ id: 'tl-3', nickname: '참가자', remainingBudget: 1000 }
						]
					})
				})
			)
		);
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/start`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code, status: 'IN_PROGRESS' })));
	}),

	http.put(`${BASE_URL}/api/v1/rooms/:code/draft-position`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code })));
	}),

	http.delete(`${BASE_URL}/api/v1/rooms/:code/draft-position`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code })));
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

	// ─── Front-only (not in OpenAPI spec) ───

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
