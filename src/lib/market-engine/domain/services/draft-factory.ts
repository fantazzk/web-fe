import { Draft } from '$lib/market-engine/domain/draft/draft';
import type { DraftId } from '$lib/market-engine/domain/draft/draft';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';
import type { Template } from '$lib/market-engine/domain/template/template';

class DraftFactory {
	static create(template: Template, id: DraftId): Draft {
		if (template.rule.mode !== 'DRAFT') {
			throw new Error(`DraftFactory: template rule must be DRAFT (got ${template.rule.mode})`);
		}

		const captains = Array.from({ length: template.captainsNeeded }, (_, i) =>
			Character.create(`captain-${i + 1}`, `감독 ${i + 1}`, null, Role.CAPTAIN)
		);
		const rounds =
			captains.length === 0 ? 0 : Math.floor(template.characters.length / captains.length);

		return Draft.create({
			id,
			templateId: template.id,
			captains,
			characters: template.characters,
			draftMode: template.rule.draftMode,
			rounds
		});
	}
}

export { DraftFactory };
