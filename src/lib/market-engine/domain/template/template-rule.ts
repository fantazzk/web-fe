type AuctionRule = {
	readonly mode: 'AUCTION';
	readonly pickBanTime: number;
	readonly totalPoints: number;
	readonly minBidUnit: number;
	readonly positionLimit: number;
};

type DraftRule = {
	readonly mode: 'DRAFT';
	readonly pickBanTime: number;
	readonly draftMode: 'SEQUENTIAL' | 'SNAKE';
};

type SandboxRule = {
	readonly mode: 'SANDBOX';
};

type TemplateRule = AuctionRule | DraftRule | SandboxRule;

export type { AuctionRule, DraftRule, SandboxRule, TemplateRule };
