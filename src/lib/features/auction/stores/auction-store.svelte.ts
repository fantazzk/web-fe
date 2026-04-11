import { Auction } from '$lib/domain/rule-engine/auction';
import type { AuctionConfig } from '$lib/domain/rule-engine/types';
import type { UIPhaseType, BidRecordType, CaptainType } from '../types';

class AuctionStore {
	auction = $state<Auction>(null!);
	uiPhase = $state<UIPhaseType>('READY');
	selectedTeamId = $state<string | null>(null);
	bidRecords = $state<BidRecordType[]>([]);
	endTime = $state<number | null>(null);
	errorMessage = $state<string | null>(null);
	captains = $state<CaptainType[]>([]);
	pickBanTime = $state<number>(30);

	/** 현재 선택된 감독 이름 */
	get selectedCaptainName(): string | null {
		if (!this.selectedTeamId) return null;
		return this.captains.find((c) => c.id === this.selectedTeamId)?.name ?? null;
	}

	/** 현재 최고 입찰가 */
	get currentHighBid(): number {
		return this.auction?.currentBid?.amount ?? 0;
	}

	/** 현재 최고 입찰 감독 이름 */
	get currentHighBidderName(): string | null {
		const teamId = this.auction?.currentBid?.teamId;
		if (!teamId) return null;
		return this.captains.find((c) => c.id === teamId)?.name ?? null;
	}

	/** 경매 초기화 */
	init(config: AuctionConfig, captains: CaptainType[], pickBanTime: number): void {
		this.auction = Auction.create(config);
		this.captains = captains;
		this.pickBanTime = pickBanTime;
		this.uiPhase = 'READY';
		this.selectedTeamId = null;
		this.bidRecords = [];
		this.endTime = null;
		this.errorMessage = null;
	}

	/** Auction 인스턴스 교체 (불변 모델이므로 매번 새 인스턴스) */
	updateAuction(next: Auction): void {
		this.auction = next;
	}

	setUIPhase(phase: UIPhaseType): void {
		this.uiPhase = phase;
	}

	selectTeam(teamId: string): void {
		this.selectedTeamId = teamId;
		this.errorMessage = null;
	}

	addBidRecord(record: BidRecordType): void {
		this.bidRecords = [record, ...this.bidRecords];
	}

	setEndTime(endTime: number | null): void {
		this.endTime = endTime;
	}

	setError(message: string | null): void {
		this.errorMessage = message;
	}
}

export const auctionStore = new AuctionStore();
