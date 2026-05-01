import { apiGet, apiPost } from '$lib/utils/api-client';
import type { ISandboxBoardRepository } from '$lib/market-engine/domain/sandbox-board/repository-interface';
import { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { SandboxBoardId } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';
import type { RoleName } from '$lib/market-engine/domain/shared/role';

interface CharacterRow {
	id: string;
	name: string;
	position: string | null;
	role: RoleName;
}

interface SandboxBoardResponse {
	id: string;
	templateId: string;
	captains: CharacterRow[];
	pool: CharacterRow[];
	rosters: Record<string, CharacterRow[]>;
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

	private static toCharacter(row: CharacterRow): Character {
		return Character.create(row.id, row.name, row.position, Role.of(row.role));
	}

	private static toCharacterRow(c: Character): CharacterRow {
		return { id: c.id, name: c.name, position: c.position, role: c.role.name };
	}

	private static toDomain(data: SandboxBoardResponse): SandboxBoard {
		const captains = data.captains.map(SandboxBoardApiRepository.toCharacter);
		const pool = data.pool.map(SandboxBoardApiRepository.toCharacter);
		const rosters: Record<string, readonly Character[]> = {};
		for (const [captainId, chars] of Object.entries(data.rosters)) {
			rosters[captainId] = chars.map(SandboxBoardApiRepository.toCharacter);
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
			captains: board.captains.map(SandboxBoardApiRepository.toCharacterRow),
			pool: board.pool.map(SandboxBoardApiRepository.toCharacterRow),
			rosters: Object.fromEntries(
				board.captains.map((c) => [
					c.id,
					(board.rosters[c.id] ?? []).map(SandboxBoardApiRepository.toCharacterRow)
				])
			)
		};
	}
}

export { SandboxBoardApiRepository };
