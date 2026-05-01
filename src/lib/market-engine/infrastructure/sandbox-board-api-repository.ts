import { apiGet, apiPost } from '$lib/utils/api-client';
import type { ISandboxBoardRepository } from '$lib/market-engine/domain/sandbox-board/repository-interface';
import { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { SandboxBoardId } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import { Captain } from '$lib/market-engine/domain/shared/captain';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Category } from '$lib/market-engine/domain/shared/category';

interface SandboxBoardResponse {
	id: string;
	templateId: string;
	captains: { id: string; name: string }[];
	pool: { id: string; name: string; position: string | null; category: string }[];
	rosters: Record<
		string,
		{ id: string; name: string; position: string | null; category: string }[]
	>;
}

class SandboxBoardApiRepository implements ISandboxBoardRepository {
	constructor(private readonly fetch: typeof globalThis.fetch) {}

	async findById(id: SandboxBoardId): Promise<SandboxBoard | null> {
		try {
			const data = await apiGet<SandboxBoardResponse>(this.fetch, `/api/sandbox-boards/${id}`);
			return SandboxBoardApiRepository.toDomain(data);
		} catch {
			return null;
		}
	}

	async save(board: SandboxBoard): Promise<void> {
		await apiPost(
			this.fetch,
			`/api/sandbox-boards/${board.id}`,
			SandboxBoardApiRepository.toRequest(board)
		);
	}

	private static toDomain(data: SandboxBoardResponse): SandboxBoard {
		const captains = data.captains.map((c) => Captain.create(c.id, c.name));
		const pool = data.pool.map((c) =>
			Character.create(c.id, c.name, c.position, new Category(c.category))
		);
		const rosters: Record<string, readonly Character[]> = {};
		for (const [captainId, chars] of Object.entries(data.rosters)) {
			rosters[captainId] = chars.map((c) =>
				Character.create(c.id, c.name, c.position, new Category(c.category))
			);
		}
		return SandboxBoard.restore({
			id: data.id,
			templateId: data.templateId,
			captains,
			pool,
			rosters
		});
	}

	private static toRequest(board: SandboxBoard): SandboxBoardResponse {
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

export { SandboxBoardApiRepository };
