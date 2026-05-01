import { DraftService } from '$lib/market-engine/application/draft-service';
import type { IDraftRepository } from '$lib/market-engine/domain/draft/repository-interface';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { Draft, DraftMode, DraftPhase } from '$lib/market-engine/domain/draft/draft';
import type { Character } from '$lib/market-engine/domain/shared/character';
import type { RoleName } from '$lib/market-engine/domain/shared/role';

interface CharacterDto {
	id: string;
	name: string;
	position: string | null;
	role: RoleName;
}

interface PickDto {
	id: string;
	characterId: string;
	captainId: string;
	round: number;
}

interface DraftDto {
	id: string;
	templateId: string;
	phase: DraftPhase;
	currentPickIndex: number;
	currentCaptainId: string | null;
	currentRound: number;
	pickOrder: string[];
	captains: CharacterDto[];
	pendingQueue: CharacterDto[];
	pickHistory: PickDto[];
	draftMode: DraftMode;
}

class DraftController {
	/** 템플릿을 기반으로 새 Draft를 생성한다. */
	static async create(
		draftRepo: IDraftRepository,
		templateRepo: ITemplateRepository,
		templateId: string,
		draftId: string
	): Promise<DraftDto> {
		await DraftService.create(draftRepo, templateRepo, templateId, draftId);
		const draft = await draftRepo.findById(draftId);
		return DraftController.toDto(draft!);
	}

	/** 현재 차례의 감독이 캐릭터를 픽한다. */
	static async pick(
		draftRepo: IDraftRepository,
		draftId: string,
		pickId: string,
		captainId: string,
		characterId: string
	): Promise<DraftDto> {
		await DraftService.pick(draftRepo, draftId, pickId, captainId, characterId);
		const draft = await draftRepo.findById(draftId);
		return DraftController.toDto(draft!);
	}

	/** 현재 차례의 감독을 대신해 pendingQueue 첫 캐릭터를 자동 픽한다. */
	static async autoPick(
		draftRepo: IDraftRepository,
		draftId: string,
		pickId: string
	): Promise<DraftDto> {
		await DraftService.autoPick(draftRepo, draftId, pickId);
		const draft = await draftRepo.findById(draftId);
		return DraftController.toDto(draft!);
	}

	private static toCharacterDto(c: Character): CharacterDto {
		return { id: c.id, name: c.name, position: c.position, role: c.role.name };
	}

	private static toDto(draft: Draft): DraftDto {
		return {
			id: draft.id,
			templateId: draft.templateId,
			phase: draft.phase,
			currentPickIndex: draft.currentPickIndex,
			currentCaptainId: draft.currentCaptainId,
			currentRound: draft.currentRound,
			pickOrder: [...draft.pickOrder],
			captains: draft.captains.map(DraftController.toCharacterDto),
			pendingQueue: draft.pendingQueue.map(DraftController.toCharacterDto),
			pickHistory: draft.pickHistory.map((p) => ({
				id: p.id,
				characterId: p.characterId,
				captainId: p.captainId,
				round: p.round
			})),
			draftMode: draft.draftMode
		};
	}
}

export { DraftController };
export type { DraftDto };
