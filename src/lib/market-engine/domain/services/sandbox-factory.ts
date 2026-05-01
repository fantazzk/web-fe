import { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { SandboxBoardId } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { Template } from '$lib/market-engine/domain/template/template';

class SandboxFactory {
	static create(template: Template, id: SandboxBoardId): SandboxBoard {
		return SandboxBoard.create({
			id,
			templateId: template.id,
			captainsCount: template.captainsNeeded,
			characters: template.characters
		});
	}
}

export { SandboxFactory };
