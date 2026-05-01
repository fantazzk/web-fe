import type { Identity } from '$lib/core';
import { AggregateRoot } from '$lib/core';
import type { Character, CharacterId } from '$lib/market-engine/domain/shared/character';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import { Pick } from '$lib/market-engine/domain/draft/pick';
import { DraftError } from '$lib/market-engine/domain/draft/errors';

type DraftId = Identity;

type DraftPhase = 'PICKING' | 'COMPLETED';

type DraftMode = 'SNAKE' | 'SEQUENTIAL';

class Draft extends AggregateRoot<Draft, DraftId> {
	private constructor(
		readonly id: DraftId,
		readonly templateId: TemplateId,
		readonly phase: DraftPhase,
		readonly currentPickIndex: number,
		readonly pickOrder: readonly CharacterId[],
		readonly captains: readonly Character[],
		readonly pendingQueue: readonly Character[],
		readonly pickHistory: readonly Pick[],
		readonly draftMode: DraftMode
	) {
		super();
	}

	get currentCaptainId(): CharacterId | null {
		if (this.phase === 'COMPLETED') return null;
		return this.pickOrder[this.currentPickIndex] ?? null;
	}

	get currentRound(): number {
		return Math.floor(this.currentPickIndex / this.captains.length) + 1;
	}

	get isCompleted(): boolean {
		return this.phase === 'COMPLETED';
	}

	static restore(params: {
		id: DraftId;
		templateId: TemplateId;
		phase: DraftPhase;
		currentPickIndex: number;
		pickOrder: readonly CharacterId[];
		captains: readonly Character[];
		pendingQueue: readonly Character[];
		pickHistory: readonly Pick[];
		draftMode: DraftMode;
	}): Draft {
		return new Draft(
			params.id,
			params.templateId,
			params.phase,
			params.currentPickIndex,
			params.pickOrder,
			params.captains,
			params.pendingQueue,
			params.pickHistory,
			params.draftMode
		);
	}

	static create(params: {
		id: DraftId;
		templateId: TemplateId;
		captains: readonly Character[];
		characters: readonly Character[];
		draftMode: DraftMode;
		rounds: number;
	}): Draft {
		const pickOrder = buildPickOrder(
			params.captains.map((c) => c.id),
			params.rounds,
			params.draftMode
		);
		const isEmpty = params.characters.length === 0 || pickOrder.length === 0;
		return new Draft(
			params.id,
			params.templateId,
			isEmpty ? 'COMPLETED' : 'PICKING',
			0,
			pickOrder,
			[...params.captains],
			[...params.characters],
			[],
			params.draftMode
		);
	}

	pick(pickId: Identity, captainId: CharacterId, characterId: CharacterId): Draft {
		if (this.phase !== 'PICKING') throw new DraftError('NOT_PICKING_PHASE');
		if (captainId !== this.currentCaptainId) throw new DraftError('NOT_YOUR_TURN');
		if (!this.captains.some((c) => c.id === captainId)) {
			throw new DraftError('CAPTAIN_NOT_FOUND');
		}

		const idx = this.pendingQueue.findIndex((c) => c.id === characterId);
		if (idx === -1) throw new DraftError('CHARACTER_NOT_IN_QUEUE');

		const character = this.pendingQueue[idx]!;
		const record = Pick.create(pickId, character.id, captainId, this.currentRound);
		const nextQueue = [...this.pendingQueue.slice(0, idx), ...this.pendingQueue.slice(idx + 1)];
		const nextIndex = this.currentPickIndex + 1;
		const isComplete = nextIndex >= this.pickOrder.length;

		return new Draft(
			this.id,
			this.templateId,
			isComplete ? 'COMPLETED' : 'PICKING',
			nextIndex,
			this.pickOrder,
			this.captains,
			nextQueue,
			[...this.pickHistory, record],
			this.draftMode
		);
	}

	autoPick(pickId: Identity): Draft {
		if (this.phase !== 'PICKING') throw new DraftError('NOT_PICKING_PHASE');
		const captainId = this.currentCaptainId;
		if (!captainId) throw new DraftError('NOT_PICKING_PHASE');
		const first = this.pendingQueue[0];
		if (!first) throw new DraftError('CHARACTER_NOT_IN_QUEUE');
		return this.pick(pickId, captainId, first.id);
	}
}

function buildPickOrder(
	captainIds: readonly CharacterId[],
	rounds: number,
	draftMode: DraftMode
): CharacterId[] {
	const order: CharacterId[] = [];
	for (let round = 0; round < rounds; round++) {
		if (draftMode === 'SNAKE' && round % 2 === 1) {
			order.push(...[...captainIds].reverse());
		} else {
			order.push(...captainIds);
		}
	}
	return order;
}

export { Draft, buildPickOrder };
export type { DraftId, DraftPhase, DraftMode };
