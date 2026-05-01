import { apiGet, apiPost } from '$lib/utils/api-client';
import type { IDraftRepository } from '$lib/market-engine/domain/draft/repository-interface';
import { Draft } from '$lib/market-engine/domain/draft/draft';
import type { DraftId, DraftMode, DraftPhase } from '$lib/market-engine/domain/draft/draft';
import { Pick } from '$lib/market-engine/domain/draft/pick';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';
import type { RoleName } from '$lib/market-engine/domain/shared/role';

interface CharacterRow {
	id: string;
	name: string;
	position: string | null;
	role: RoleName;
}

interface PickRow {
	id: string;
	characterId: string;
	captainId: string;
	round: number;
}

interface DraftResponse {
	id: string;
	templateId: string;
	phase: DraftPhase;
	currentPickIndex: number;
	pickOrder: string[];
	captains: CharacterRow[];
	pendingQueue: CharacterRow[];
	pickHistory: PickRow[];
	draftMode: DraftMode;
}

class DraftApiRepository implements IDraftRepository {
	constructor(private readonly fetch: typeof globalThis.fetch) {}

	async findById(id: DraftId): Promise<Draft | null> {
		try {
			const data = await apiGet<DraftResponse>(this.fetch, `/api/drafts/${id}`);
			return DraftApiRepository.toDomain(data);
		} catch {
			return null;
		}
	}

	async save(draft: Draft): Promise<void> {
		await apiPost(this.fetch, `/api/drafts/${draft.id}`, DraftApiRepository.toRequest(draft));
	}

	private static toCharacter(row: CharacterRow): Character {
		return Character.create(row.id, row.name, row.position, Role.of(row.role));
	}

	private static toCharacterRow(c: Character): CharacterRow {
		return { id: c.id, name: c.name, position: c.position, role: c.role.name };
	}

	private static toPick(row: PickRow): Pick {
		return Pick.create(row.id, row.characterId, row.captainId, row.round);
	}

	private static toPickRow(pick: Pick): PickRow {
		return {
			id: pick.id,
			characterId: pick.characterId,
			captainId: pick.captainId,
			round: pick.round
		};
	}

	private static toDomain(data: DraftResponse): Draft {
		return Draft.restore({
			id: data.id,
			templateId: data.templateId,
			phase: data.phase,
			currentPickIndex: data.currentPickIndex,
			pickOrder: data.pickOrder,
			captains: data.captains.map(DraftApiRepository.toCharacter),
			pendingQueue: data.pendingQueue.map(DraftApiRepository.toCharacter),
			pickHistory: data.pickHistory.map(DraftApiRepository.toPick),
			draftMode: data.draftMode
		});
	}

	private static toRequest(draft: Draft): DraftResponse {
		return {
			id: draft.id,
			templateId: draft.templateId,
			phase: draft.phase,
			currentPickIndex: draft.currentPickIndex,
			pickOrder: [...draft.pickOrder],
			captains: draft.captains.map(DraftApiRepository.toCharacterRow),
			pendingQueue: draft.pendingQueue.map(DraftApiRepository.toCharacterRow),
			pickHistory: draft.pickHistory.map(DraftApiRepository.toPickRow),
			draftMode: draft.draftMode
		};
	}
}

export { DraftApiRepository };
