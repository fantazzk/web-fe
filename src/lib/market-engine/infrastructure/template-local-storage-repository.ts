import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import { Template } from '$lib/market-engine/domain/template/template';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import type { TemplateRule } from '$lib/market-engine/domain/template/template-rule';
import type { GameType } from '$lib/market-engine/domain/shared/game-type';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';

interface TemplateLocalRow {
	id: string;
	name: string;
	gameType: GameType;
	creatorId: string;
	rule: TemplateRule;
	characters: { id: string; name: string; position: string | null }[];
	captainsNeeded: number;
	creatorAsCaptain: boolean;
	usageCount: number;
	createdAt: string;
	updatedAt: string;
}

const KEY_PREFIX = 'template:';

class TemplateLocalStorageRepository implements ITemplateRepository {
	async findById(id: TemplateId): Promise<Template | null> {
		const raw = localStorage.getItem(`${KEY_PREFIX}${id}`);
		if (!raw) return null;
		return TemplateLocalStorageRepository.toDomain(JSON.parse(raw) as TemplateLocalRow);
	}

	async findAll(): Promise<Template[]> {
		const templates: Template[] = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (!key?.startsWith(KEY_PREFIX)) continue;
			const raw = localStorage.getItem(key);
			if (raw)
				templates.push(
					TemplateLocalStorageRepository.toDomain(JSON.parse(raw) as TemplateLocalRow)
				);
		}
		return templates;
	}

	async save(template: Template): Promise<void> {
		localStorage.setItem(
			`${KEY_PREFIX}${template.id}`,
			JSON.stringify(TemplateLocalStorageRepository.toRow(template))
		);
	}

	private static toDomain(row: TemplateLocalRow): Template {
		return Template.restore({
			id: row.id,
			name: row.name,
			gameType: row.gameType,
			creatorId: row.creatorId,
			rule: row.rule,
			characters: row.characters.map((c) =>
				Character.create(c.id, c.name, c.position, Role.PLAYER)
			),
			captainsNeeded: row.captainsNeeded,
			creatorAsCaptain: row.creatorAsCaptain,
			usageCount: row.usageCount,
			createdAt: new Date(row.createdAt),
			updatedAt: new Date(row.updatedAt)
		});
	}

	private static toRow(template: Template): TemplateLocalRow {
		return {
			id: template.id,
			name: template.name,
			gameType: template.gameType,
			creatorId: template.creatorId,
			rule: template.rule,
			characters: template.characters.map((c) => ({
				id: c.id,
				name: c.name,
				position: c.position
			})),
			captainsNeeded: template.captainsNeeded,
			creatorAsCaptain: template.creatorAsCaptain,
			usageCount: template.usageCount,
			createdAt: template.createdAt.toISOString(),
			updatedAt: template.updatedAt.toISOString()
		};
	}
}

export { TemplateLocalStorageRepository };
