import { SandboxBoard } from '$lib/domain/sandbox';

class SandboxStore {
	board = $state<SandboxBoard | null>(null);
	positionFilter = $state<string>('ALL');

	init(board: SandboxBoard): void {
		this.board = board;
		this.positionFilter = 'ALL';
	}

	apply(next: SandboxBoard): void {
		this.board = next;
	}

	setPositionFilter(position: string): void {
		this.positionFilter = position;
	}

	reset(): void {
		this.board = null;
		this.positionFilter = 'ALL';
	}
}

export const sandboxStore = new SandboxStore();
