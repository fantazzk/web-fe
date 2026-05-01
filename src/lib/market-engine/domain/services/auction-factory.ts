import { Auction } from '$lib/market-engine/domain/auction/auction';
import type { AuctionId } from '$lib/market-engine/domain/auction/auction';
import { Captain } from '$lib/market-engine/domain/shared/captain';
import type { Template } from '$lib/market-engine/domain/template/template';

class AuctionFactory {
	static create(template: Template, id: AuctionId): Auction {
		if (template.rule.mode !== 'AUCTION') {
			throw new Error(`AuctionFactory: template rule must be AUCTION (got ${template.rule.mode})`);
		}

		const captains = Array.from({ length: template.captainsNeeded }, (_, i) =>
			Captain.create(`captain-${i + 1}`, `감독 ${i + 1}`)
		);

		return Auction.create({
			id,
			templateId: template.id,
			captains,
			characters: template.characters,
			totalPoints: template.rule.totalPoints,
			minBidUnit: template.rule.minBidUnit,
			positionLimit: template.rule.positionLimit
		});
	}
}

export { AuctionFactory };
