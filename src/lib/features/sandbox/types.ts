import type { GameType } from '$lib/domain/template';
import type { SandboxPlayerType } from '$lib/domain/sandbox';

export interface TemplateSnapshotType {
	name: string;
	gameType: GameType;
	captainsCount: number;
	players: SandboxPlayerType[];
}
