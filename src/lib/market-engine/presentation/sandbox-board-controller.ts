import { SandboxBoardService } from '$lib/market-engine/application/sandbox-board-service';
import type { ISandboxBoardRepository } from '$lib/market-engine/domain/sandbox-board/repository-interface';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';

interface SandboxBoardDto {
	id: string;
	templateId: string;
	captains: { id: string; name: string }[];
	pool: { id: string; name: string; position: string | null; category: string }[];
	rosters: Record<
		string,
		{ id: string; name: string; position: string | null; category: string }[]
	>;
}

class SandboxBoardController {
	/** 템플릿을 기반으로 새 SandboxBoard를 생성한다. */
	static async create(
		boardRepo: ISandboxBoardRepository,
		templateRepo: ITemplateRepository,
		templateId: string,
		boardId: string
	): Promise<SandboxBoardDto> {
		await SandboxBoardService.create(boardRepo, templateRepo, templateId, boardId);
		const board = await boardRepo.findById(boardId);
		return SandboxBoardController.toDto(board!);
	}

	/** pool에 있는 캐릭터를 감독 로스터에 배정한다. */
	static async assign(
		boardRepo: ISandboxBoardRepository,
		boardId: string,
		characterId: string,
		captainId: string
	): Promise<SandboxBoardDto> {
		await SandboxBoardService.assign(boardRepo, boardId, characterId, captainId);
		const board = await boardRepo.findById(boardId);
		return SandboxBoardController.toDto(board!);
	}

	/** 감독 로스터에 있는 캐릭터를 pool로 되돌린다. */
	static async unassign(
		boardRepo: ISandboxBoardRepository,
		boardId: string,
		characterId: string
	): Promise<SandboxBoardDto> {
		await SandboxBoardService.unassign(boardRepo, boardId, characterId);
		const board = await boardRepo.findById(boardId);
		return SandboxBoardController.toDto(board!);
	}

	/** pool을 거치지 않고 캐릭터를 다른 감독 로스터로 직접 이동한다. */
	static async move(
		boardRepo: ISandboxBoardRepository,
		boardId: string,
		characterId: string,
		toCaptainId: string
	): Promise<SandboxBoardDto> {
		await SandboxBoardService.move(boardRepo, boardId, characterId, toCaptainId);
		const board = await boardRepo.findById(boardId);
		return SandboxBoardController.toDto(board!);
	}

	/** SandboxBoard 도메인 객체를 클라이언트 응답용 DTO로 변환한다. */
	private static toDto(board: SandboxBoard): SandboxBoardDto {
		return {
			id: board.id,
			templateId: board.templateId,
			captains: board.captains.map((c) => ({ id: c.id, name: c.name })),
			pool: board.pool.map((c) => ({
				id: c.id,
				name: c.name,
				position: c.position,
				category: c.category.name
			})),
			rosters: Object.fromEntries(
				board.captains.map((c) => [
					c.id,
					(board.rosters[c.id] ?? []).map((ch) => ({
						id: ch.id,
						name: ch.name,
						position: ch.position,
						category: ch.category.name
					}))
				])
			)
		};
	}
}

export { SandboxBoardController };
export type { SandboxBoardDto };
