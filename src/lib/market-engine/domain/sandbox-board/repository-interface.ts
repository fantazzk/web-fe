import type {
	SandboxBoard,
	SandboxBoardId
} from '$lib/market-engine/domain/sandbox-board/sandbox-board';

interface ISandboxBoardRepository {
	findById(id: SandboxBoardId): Promise<SandboxBoard | null>;
	save(board: SandboxBoard): Promise<void>;
}

export type { ISandboxBoardRepository };
