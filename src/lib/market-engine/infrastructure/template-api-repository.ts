import { apiGet, apiPost } from '$lib/utils/api-client';
import type { TemplateResponse } from '$lib/types/api';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import { Template } from '$lib/market-engine/domain/template/template';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import type { TemplateRule } from '$lib/market-engine/domain/template/template-rule';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';

class TemplateApiRepository implements ITemplateRepository {
	constructor(private readonly fetch: typeof globalThis.fetch) {}

	async findById(id: TemplateId): Promise<Template | null> {
		try {
			const data = await apiGet<TemplateResponse>(this.fetch, `/api/templates/${id}`);
			return TemplateApiRepository.toDomain(data);
		} catch {
			return null;
		}
	}

	async findAll(): Promise<Template[]> {
		const data = await apiGet<TemplateResponse[]>(this.fetch, '/api/templates');
		return data.map(TemplateApiRepository.toDomain);
	}

	async save(template: Template): Promise<void> {
		await apiPost<TemplateResponse>(
			this.fetch,
			'/api/v1/templates',
			TemplateApiRepository.toRequest(template)
		);
	}

	private static toRequest(template: Template): Record<string, unknown> {
		const rule = template.rule;
		const teamCount = template.captainsNeeded;
		const teamSize = Math.max(2, Math.floor(template.characters.length / teamCount) + 1);
		return {
			name: template.name,
			gameType: template.gameType,
			mode: rule.mode === 'AUCTION' ? 'AUCTION' : 'DRAFT',
			teamCount,
			teamSize,
			players: template.characters.map((c) => ({ name: c.name, position: c.position ?? '' })),
			...(rule.mode !== 'SANDBOX' ? { pickBanTime: rule.pickBanTime } : {}),
			...(rule.mode === 'AUCTION' ? { budget: rule.totalPoints, minBidUnit: rule.minBidUnit } : {}),
			...(rule.mode === 'DRAFT'
				? { draftOrderStrategy: rule.draftMode === 'SNAKE' ? 'SNAKE' : 'FIXED' }
				: {})
		};
	}

	private static toDomain(row: TemplateResponse): Template {
		const characters = (row.players ?? []).map((p, i) =>
			Character.create(`${row.id}-c${i}`, p.name, p.position ?? null, Role.PLAYER)
		);

		const rule = TemplateApiRepository.toRule(row);

		return Template.restore({
			id: row.id,
			name: row.name,
			gameType: row.gameType ?? 'LEAGUE_OF_LEGENDS',
			creatorId: '',
			rule,
			characters,
			captainsNeeded: row.teamCount,
			creatorAsCaptain: false,
			usageCount: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		});
	}

	private static toRule(row: TemplateResponse): TemplateRule {
		if (row.mode === 'AUCTION') {
			return {
				mode: 'AUCTION',
				pickBanTime: row.pickBanTime ?? 0,
				totalPoints: row.budget ?? 0,
				minBidUnit: row.minBidUnit ?? 0,
				positionLimit: row.positionLimit ?? 1
			};
		}
		return {
			mode: 'DRAFT',
			pickBanTime: row.pickBanTime ?? 0,
			draftMode: row.draftOrderStrategy === 'SNAKE' ? 'SNAKE' : 'SEQUENTIAL'
		};
	}
}

export { TemplateApiRepository };
