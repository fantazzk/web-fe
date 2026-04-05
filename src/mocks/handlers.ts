import { http, HttpResponse } from 'msw';
import {
	success,
	createTemplateListResponse,
	createTemplateDetailResponse,
	createTemplateResponse,
	createRoomResponse
} from './factories';

const BASE_URL = import.meta.env['PUBLIC_API_URL'] ?? '';

export const handlers = [
	// ─── Template API ───

	http.get(`${BASE_URL}/api/v1/templates`, () => {
		return HttpResponse.json(success(createTemplateListResponse()));
	}),

	http.get(`${BASE_URL}/api/v1/templates/:id`, ({ params }) => {
		const id = Number(params['id']);
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
		return HttpResponse.json(success(createRoomResponse()), { status: 201 });
	}),

	http.get(`${BASE_URL}/api/v1/rooms/:code`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(success(createRoomResponse({ code })));
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/join`, ({ params }) => {
		const code = params['code'] as string;
		return HttpResponse.json(
			success(
				createRoomResponse({
					code,
					teamLeaders: [
						{ id: 'tl-1', nickname: 'DragonSlayer', remainingBudget: 1000 },
						{ id: 'tl-2', nickname: 'NightHawk_KR', remainingBudget: 1000 },
						{ id: 'tl-3', nickname: '참가자', remainingBudget: 1000 }
					]
				})
			)
		);
	}),

	http.post(`${BASE_URL}/api/v1/rooms/:code/start`, ({ params }) => {
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
