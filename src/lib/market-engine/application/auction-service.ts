import type { Identity } from '$lib/core';
import type { IAuctionRepository } from '$lib/market-engine/domain/auction/repository-interface';
import type { AuctionId } from '$lib/market-engine/domain/auction/auction';
import type { CharacterId } from '$lib/market-engine/domain/shared/character';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { TemplateId } from '$lib/market-engine/domain/template/template';
import { AuctionFactory } from '$lib/market-engine/domain/services/auction-factory';

class AuctionService {
	static async create(
		auctionRepo: IAuctionRepository,
		templateRepo: ITemplateRepository,
		templateId: TemplateId,
		auctionId: AuctionId
	): Promise<void> {
		const template = await templateRepo.findById(templateId);
		if (!template) throw new Error(`Template not found: ${templateId}`);

		const auction = AuctionFactory.create(template, auctionId);
		await auctionRepo.save(auction);
	}

	static async placeBid(
		repo: IAuctionRepository,
		auctionId: AuctionId,
		bidId: Identity,
		captainId: CharacterId,
		amount: number
	): Promise<void> {
		const auction = await repo.findById(auctionId);
		if (!auction) throw new Error(`Auction not found: ${auctionId}`);

		await repo.save(auction.placeBid(bidId, captainId, amount));
	}

	static async settle(repo: IAuctionRepository, auctionId: AuctionId): Promise<void> {
		const auction = await repo.findById(auctionId);
		if (!auction) throw new Error(`Auction not found: ${auctionId}`);

		await repo.save(auction.settle());
	}

	static async markUnsold(repo: IAuctionRepository, auctionId: AuctionId): Promise<void> {
		const auction = await repo.findById(auctionId);
		if (!auction) throw new Error(`Auction not found: ${auctionId}`);

		await repo.save(auction.markUnsold());
	}

	static async startNext(repo: IAuctionRepository, auctionId: AuctionId): Promise<void> {
		const auction = await repo.findById(auctionId);
		if (!auction) throw new Error(`Auction not found: ${auctionId}`);

		await repo.save(auction.startNext());
	}
}

export { AuctionService };
