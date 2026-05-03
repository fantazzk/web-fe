import type { ISandboxBoardRepository } from '$lib/market-engine/domain/sandbox-board/repository-interface';
import type { SandboxBoardId } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { CaptainId, CharacterId } from '$lib/market-engine/domain/shared/character';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import { SandboxFactory } from '$lib/market-engine/domain/services/sandbox-factory';

class SandboxBoardService {
	static async create(
		boardRepo: ISandboxBoardRepository,
		templateRepo: ITemplateRepository,
		templateId: TemplateId,
		boardId: SandboxBoardId
	): Promise<void> {
		const template = await templateRepo.findById(templateId);
		if (!template) throw new Error(`Template not found: ${templateId}`);

		const board = SandboxFactory.create(template, boardId);
		await boardRepo.save(board);
	}

	static async assign(
		repo: ISandboxBoardRepository,
		boardId: SandboxBoardId,
		characterId: CharacterId,
		captainId: CaptainId
	): Promise<void> {
		const board = await repo.findById(boardId);
		if (!board) throw new Error(`SandboxBoard not found: ${boardId}`);

		await repo.save(board.assign(characterId, captainId));
	}

	static async unassign(
		repo: ISandboxBoardRepository,
		boardId: SandboxBoardId,
		characterId: CharacterId
	): Promise<void> {
		const board = await repo.findById(boardId);
		if (!board) throw new Error(`SandboxBoard not found: ${boardId}`);

		await repo.save(board.unassign(characterId));
	}

	static async move(
		repo: ISandboxBoardRepository,
		boardId: SandboxBoardId,
		characterId: CharacterId,
		toCaptainId: CaptainId
	): Promise<void> {
		const board = await repo.findById(boardId);
		if (!board) throw new Error(`SandboxBoard not found: ${boardId}`);

		await repo.save(board.move(characterId, toCaptainId));
	}
}

export { SandboxBoardService };
