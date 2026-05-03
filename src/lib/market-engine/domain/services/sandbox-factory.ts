import { SandboxBoard } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import type { SandboxBoardId } from '$lib/market-engine/domain/sandbox-board/sandbox-board';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';
import type { Template } from '$lib/market-engine/domain/template/template';

class SandboxFactory {
	static create(template: Template, id: SandboxBoardId): SandboxBoard {
		const captains = Array.from({ length: template.captainsNeeded }, (_, i) =>
			Character.create(`captain-${i + 1}`, `감독 ${i + 1}`, null, Role.CAPTAIN)
		);

		return SandboxBoard.create({
			id,
			templateId: template.id,
			captains,
			characters: template.characters
		});
	}
}

export { SandboxFactory };
