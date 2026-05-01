import { AuctionService } from '$lib/market-engine/application/auction-service';
import type { IAuctionRepository } from '$lib/market-engine/domain/auction/repository-interface';
import type { ITemplateRepository } from '$lib/market-engine/domain/template/repository-interface';
import type { Auction, AuctionPhase } from '$lib/market-engine/domain/auction/auction';

interface CharacterDto {
	id: string;
	name: string;
	position: string | null;
	category: string;
}

interface BidDto {
	id: string;
	characterId: string;
	captainId: string;
	amount: number;
}

interface AuctionDto {
	id: string;
	templateId: string;
	phase: AuctionPhase;
	currentCharacter: CharacterDto | null;
	currentBid: BidDto | null;
	captains: { id: string; name: string }[];
	remainingPoints: Record<string, number>;
	rosters: Record<string, CharacterDto[]>;
	pendingQueue: CharacterDto[];
	soldHistory: { character: CharacterDto; bid: BidDto }[];
	totalPoints: number;
	minBidUnit: number;
	positionLimit: number;
}

class AuctionController {
	/** 템플릿을 기반으로 새 Auction을 생성한다. */
	static async create(
		auctionRepo: IAuctionRepository,
		templateRepo: ITemplateRepository,
		templateId: string,
		auctionId: string
	): Promise<AuctionDto> {
		await AuctionService.create(auctionRepo, templateRepo, templateId, auctionId);
		const auction = await auctionRepo.findById(auctionId);
		return AuctionController.toDto(auction!);
	}

	/** 감독이 현재 캐릭터에 입찰한다. */
	static async placeBid(
		auctionRepo: IAuctionRepository,
		auctionId: string,
		bidId: string,
		captainId: string,
		amount: number
	): Promise<AuctionDto> {
		await AuctionService.placeBid(auctionRepo, auctionId, bidId, captainId, amount);
		const auction = await auctionRepo.findById(auctionId);
		return AuctionController.toDto(auction!);
	}

	/** 현재 입찰을 낙찰 처리하고 캐릭터를 최고 입찰자에게 배정한다. */
	static async settle(auctionRepo: IAuctionRepository, auctionId: string): Promise<AuctionDto> {
		await AuctionService.settle(auctionRepo, auctionId);
		const auction = await auctionRepo.findById(auctionId);
		return AuctionController.toDto(auction!);
	}

	/** 현재 캐릭터를 유찰 처리하고 pendingQueue 끝으로 보낸다. */
	static async markUnsold(auctionRepo: IAuctionRepository, auctionId: string): Promise<AuctionDto> {
		await AuctionService.markUnsold(auctionRepo, auctionId);
		const auction = await auctionRepo.findById(auctionId);
		return AuctionController.toDto(auction!);
	}

	/** 다음 캐릭터의 경매를 시작한다 (남은 캐릭터 없으면 COMPLETED). */
	static async startNext(auctionRepo: IAuctionRepository, auctionId: string): Promise<AuctionDto> {
		await AuctionService.startNext(auctionRepo, auctionId);
		const auction = await auctionRepo.findById(auctionId);
		return AuctionController.toDto(auction!);
	}

	private static toCharacterDto(c: {
		id: string;
		name: string;
		position: string | null;
		category: { name: string };
	}): CharacterDto {
		return { id: c.id, name: c.name, position: c.position, category: c.category.name };
	}

	private static toDto(auction: Auction): AuctionDto {
		return {
			id: auction.id,
			templateId: auction.templateId,
			phase: auction.phase,
			currentCharacter: auction.currentCharacter
				? AuctionController.toCharacterDto(auction.currentCharacter)
				: null,
			currentBid: auction.currentBid
				? {
						id: auction.currentBid.id,
						characterId: auction.currentBid.characterId,
						captainId: auction.currentBid.captainId,
						amount: auction.currentBid.amount
					}
				: null,
			captains: auction.captains.map((c) => ({ id: c.id, name: c.name })),
			remainingPoints: { ...auction.remainingPoints },
			rosters: Object.fromEntries(
				auction.captains.map((c) => [
					c.id,
					(auction.rosters[c.id] ?? []).map(AuctionController.toCharacterDto)
				])
			),
			pendingQueue: auction.pendingQueue.map(AuctionController.toCharacterDto),
			soldHistory: auction.soldHistory.map((h) => ({
				character: AuctionController.toCharacterDto(h.character),
				bid: {
					id: h.bid.id,
					characterId: h.bid.characterId,
					captainId: h.bid.captainId,
					amount: h.bid.amount
				}
			})),
			totalPoints: auction.totalPoints,
			minBidUnit: auction.minBidUnit,
			positionLimit: auction.positionLimit
		};
	}
}

export { AuctionController };
export type { AuctionDto };
