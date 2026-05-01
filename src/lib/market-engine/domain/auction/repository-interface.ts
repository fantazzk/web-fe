import type { Auction, AuctionId } from '$lib/market-engine/domain/auction/auction';

interface IAuctionRepository {
	findById(id: AuctionId): Promise<Auction | null>;
	save(auction: Auction): Promise<void>;
}

export type { IAuctionRepository };
