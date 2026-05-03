import type { Identity } from '$lib/core';
import type { IDraftRepository } from '$lib/market-engine/domain/draft/repository-interface';
import type { DraftId } from '$lib/market-engine/domain/draft/draft';
import type { CharacterId } from '$lib/market-engine/domain/shared/character';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import { DraftFactory } from '$lib/market-engine/domain/services/draft-factory';

class DraftService {
	static async create(
		draftRepo: IDraftRepository,
		templateRepo: ITemplateRepository,
		templateId: TemplateId,
		draftId: DraftId
	): Promise<void> {
		const template = await templateRepo.findById(templateId);
		if (!template) throw new Error(`Template not found: ${templateId}`);

		const draft = DraftFactory.create(template, draftId);
		await draftRepo.save(draft);
	}

	static async pick(
		repo: IDraftRepository,
		draftId: DraftId,
		pickId: Identity,
		captainId: CharacterId,
		characterId: CharacterId
	): Promise<void> {
		const draft = await repo.findById(draftId);
		if (!draft) throw new Error(`Draft not found: ${draftId}`);

		await repo.save(draft.pick(pickId, captainId, characterId));
	}

	static async autoPick(repo: IDraftRepository, draftId: DraftId, pickId: Identity): Promise<void> {
		const draft = await repo.findById(draftId);
		if (!draft) throw new Error(`Draft not found: ${draftId}`);

		await repo.save(draft.autoPick(pickId));
	}
}

export { DraftService };
