import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { Template, TemplateId } from '$lib/market-engine/domain/template/template';

class TemplateService {
	static async save(
		apiRepo: ITemplateRepository,
		cacheRepo: ITemplateRepository,
		template: Template
	): Promise<void> {
		await apiRepo.save(template);
		await cacheRepo.save(template);
	}

	static async findById(
		apiRepo: ITemplateRepository,
		cacheRepo: ITemplateRepository,
		id: TemplateId
	): Promise<Template | null> {
		const cached = await cacheRepo.findById(id);
		if (cached) return cached;

		const result = await apiRepo.findById(id);
		if (result) await cacheRepo.save(result);
		return result;
	}
}

export { TemplateService };
