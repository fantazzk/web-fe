import type { Template, TemplateId } from '$lib/market-engine/domain/template/template';

interface ITemplateRepository {
	findById(id: TemplateId): Promise<Template | null>;
	findAll(): Promise<Template[]>;
	save(template: Template): Promise<void>;
}

export type { ITemplateRepository };
