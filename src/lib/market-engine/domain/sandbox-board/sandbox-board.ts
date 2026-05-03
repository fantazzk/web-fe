import type { Identity } from '$lib/core';
import { AggregateRoot } from '$lib/core';
import type { CaptainId, Character, CharacterId } from '$lib/market-engine/domain/shared/character';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import { SandboxBoardError } from '$lib/market-engine/domain/sandbox-board/errors';

type SandboxBoardId = Identity;

class SandboxBoard extends AggregateRoot<SandboxBoard, SandboxBoardId> {
	private constructor(
		readonly id: SandboxBoardId,
		readonly templateId: TemplateId,
		readonly captains: readonly Character[],
		readonly pool: readonly Character[],
		readonly rosters: Readonly<Record<CaptainId, readonly Character[]>>
	) {
		super();
	}

	static restore(params: {
		id: SandboxBoardId;
		templateId: TemplateId;
		captains: readonly Character[];
		pool: readonly Character[];
		rosters: Readonly<Record<CaptainId, readonly Character[]>>;
	}): SandboxBoard {
		return new SandboxBoard(
			params.id,
			params.templateId,
			params.captains,
			params.pool,
			params.rosters
		);
	}

	static create(params: {
		id: SandboxBoardId;
		templateId: TemplateId;
		captains: readonly Character[];
		characters: readonly Character[];
	}): SandboxBoard {
		const rosters: Record<CaptainId, readonly Character[]> = {};
		for (const captain of params.captains) {
			rosters[captain.id] = [];
		}
		return new SandboxBoard(
			params.id,
			params.templateId,
			[...params.captains],
			[...params.characters],
			rosters
		);
	}

	assign(characterId: CharacterId, toCaptainId: CaptainId): SandboxBoard {
		if (!this.captains.some((c) => c.id === toCaptainId)) {
			throw new SandboxBoardError('CAPTAIN_NOT_FOUND');
		}
		const idx = this.pool.findIndex((c) => c.id === characterId);
		if (idx === -1) {
			throw new SandboxBoardError('CHARACTER_NOT_IN_POOL');
		}
		const character = this.pool[idx]!;
		const nextPool = [...this.pool.slice(0, idx), ...this.pool.slice(idx + 1)];
		const nextRosters = { ...this.rosters };
		nextRosters[toCaptainId] = [...(nextRosters[toCaptainId] ?? []), character];
		return new SandboxBoard(this.id, this.templateId, this.captains, nextPool, nextRosters);
	}

	unassign(characterId: CharacterId): SandboxBoard {
		let found: Character | null = null;
		let fromCaptainId: CaptainId | null = null;
		for (const captain of this.captains) {
			const character = (this.rosters[captain.id] ?? []).find((c) => c.id === characterId);
			if (character) {
				found = character;
				fromCaptainId = captain.id;
				break;
			}
		}
		if (!found || !fromCaptainId) {
			throw new SandboxBoardError('CHARACTER_NOT_IN_ROSTER');
		}
		const nextRosters = { ...this.rosters };
		nextRosters[fromCaptainId] = (nextRosters[fromCaptainId] ?? []).filter(
			(c) => c.id !== characterId
		);
		return new SandboxBoard(
			this.id,
			this.templateId,
			this.captains,
			[...this.pool, found],
			nextRosters
		);
	}

	move(characterId: CharacterId, toCaptainId: CaptainId): SandboxBoard {
		if (!this.captains.some((c) => c.id === toCaptainId)) {
			throw new SandboxBoardError('CAPTAIN_NOT_FOUND');
		}
		let found: Character | null = null;
		let fromCaptainId: CaptainId | null = null;
		for (const captain of this.captains) {
			const character = (this.rosters[captain.id] ?? []).find((c) => c.id === characterId);
			if (character) {
				found = character;
				fromCaptainId = captain.id;
				break;
			}
		}
		if (!found || !fromCaptainId) {
			throw new SandboxBoardError('CHARACTER_NOT_IN_ROSTER');
		}
		const nextRosters = { ...this.rosters };
		nextRosters[fromCaptainId] = (nextRosters[fromCaptainId] ?? []).filter(
			(c) => c.id !== characterId
		);
		nextRosters[toCaptainId] = [...(nextRosters[toCaptainId] ?? []), found];
		return new SandboxBoard(this.id, this.templateId, this.captains, this.pool, nextRosters);
	}
}

export { SandboxBoard };
export type { SandboxBoardId };
