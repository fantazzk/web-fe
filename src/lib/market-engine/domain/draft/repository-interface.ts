import type { Draft, DraftId } from '$lib/market-engine/domain/draft/draft';

interface IDraftRepository {
	findById(id: DraftId): Promise<Draft | null>;
	save(draft: Draft): Promise<void>;
}

export type { IDraftRepository };
