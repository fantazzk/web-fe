import { apiGet, apiPost } from '$lib/utils/api-client';
import type { IAuctionRepository } from '$lib/market-engine/domain/auction/repository-interface';
import { Auction } from '$lib/market-engine/domain/auction/auction';
import type { AuctionId, AuctionPhase } from '$lib/market-engine/domain/auction/auction';
import { Bid } from '$lib/market-engine/domain/auction/bid';
import { Character } from '$lib/market-engine/domain/shared/character';
import { Role } from '$lib/market-engine/domain/shared/role';
import type { RoleName } from '$lib/market-engine/domain/shared/role';

interface CharacterRow {
	id: string;
	name: string;
	position: string | null;
	role: RoleName;
}

interface BidRow {
	id: string;
	characterId: string;
	captainId: string;
	amount: number;
}

interface AuctionResponse {
	id: string;
	templateId: string;
	phase: AuctionPhase;
	currentCharacter: CharacterRow | null;
	currentBid: BidRow | null;
	captains: CharacterRow[];
	remainingPoints: Record<string, number>;
	rosters: Record<string, CharacterRow[]>;
	pendingQueue: CharacterRow[];
	soldHistory: { character: CharacterRow; bid: BidRow }[];
	totalPoints: number;
	minBidUnit: number;
	positionLimit: number;
}

class AuctionApiRepository implements IAuctionRepository {
	constructor(private readonly fetch: typeof globalThis.fetch) {}

	async findById(id: AuctionId): Promise<Auction | null> {
		try {
			const data = await apiGet<AuctionResponse>(this.fetch, `/api/auctions/${id}`);
			return AuctionApiRepository.toDomain(data);
		} catch {
			return null;
		}
	}

	async save(auction: Auction): Promise<void> {
		await apiPost(
			this.fetch,
			`/api/auctions/${auction.id}`,
			AuctionApiRepository.toRequest(auction)
		);
	}

	private static toCharacter(row: CharacterRow): Character {
		return Character.create(row.id, row.name, row.position, Role.of(row.role));
	}

	private static toCharacterRow(c: Character): CharacterRow {
		return { id: c.id, name: c.name, position: c.position, role: c.role.name };
	}

	private static toBid(row: BidRow): Bid {
		return Bid.create(row.id, row.characterId, row.captainId, row.amount);
	}

	private static toBidRow(bid: Bid): BidRow {
		return {
			id: bid.id,
			characterId: bid.characterId,
			captainId: bid.captainId,
			amount: bid.amount
		};
	}

	private static toDomain(data: AuctionResponse): Auction {
		const captains = data.captains.map(AuctionApiRepository.toCharacter);
		const rosters: Record<string, readonly Character[]> = {};
		for (const [captainId, rows] of Object.entries(data.rosters)) {
			rosters[captainId] = rows.map(AuctionApiRepository.toCharacter);
		}

		return Auction.restore({
			id: data.id,
			templateId: data.templateId,
			phase: data.phase,
			currentCharacter: data.currentCharacter
				? AuctionApiRepository.toCharacter(data.currentCharacter)
				: null,
			currentBid: data.currentBid ? AuctionApiRepository.toBid(data.currentBid) : null,
			captains,
			remainingPoints: data.remainingPoints,
			rosters,
			pendingQueue: data.pendingQueue.map(AuctionApiRepository.toCharacter),
			soldHistory: data.soldHistory.map((h) => ({
				character: AuctionApiRepository.toCharacter(h.character),
				bid: AuctionApiRepository.toBid(h.bid)
			})),
			totalPoints: data.totalPoints,
			minBidUnit: data.minBidUnit,
			positionLimit: data.positionLimit
		});
	}

	private static toRequest(auction: Auction): AuctionResponse {
		return {
			id: auction.id,
			templateId: auction.templateId,
			phase: auction.phase,
			currentCharacter: auction.currentCharacter
				? AuctionApiRepository.toCharacterRow(auction.currentCharacter)
				: null,
			currentBid: auction.currentBid ? AuctionApiRepository.toBidRow(auction.currentBid) : null,
			captains: auction.captains.map(AuctionApiRepository.toCharacterRow),
			remainingPoints: { ...auction.remainingPoints },
			rosters: Object.fromEntries(
				auction.captains.map((c) => [
					c.id,
					(auction.rosters[c.id] ?? []).map(AuctionApiRepository.toCharacterRow)
				])
			),
			pendingQueue: auction.pendingQueue.map(AuctionApiRepository.toCharacterRow),
			soldHistory: auction.soldHistory.map((h) => ({
				character: AuctionApiRepository.toCharacterRow(h.character),
				bid: AuctionApiRepository.toBidRow(h.bid)
			})),
			totalPoints: auction.totalPoints,
			minBidUnit: auction.minBidUnit,
			positionLimit: auction.positionLimit
		};
	}
}

export { AuctionApiRepository };
