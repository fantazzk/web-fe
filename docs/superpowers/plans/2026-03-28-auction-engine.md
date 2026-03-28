# 경매 엔진(Auction) 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 경매 진행 상태를 관리하고 입찰 유효성을 검증하는 Auction 도메인 모델을 TDD로 구현한다.

**Architecture:** 불변 클래스 기반. Auction 클래스가 경매 상태(현재 선수, 입찰, 팀 포인트, 선수풀)를 관리하고, 모든 메서드는 새 인스턴스를 반환. domain/template의 Player/PlayerParams를 재사용한다.

**Tech Stack:** TypeScript (strict mode), vitest

---

## 파일 구조

```
src/lib/domain/rule-engine/
├── types.ts              # AuctionPhase, Bid, AuctionConfig, TeamState
├── errors.ts             # AuctionError, AuctionErrorCode
├── auction.ts            # Auction 클래스
├── index.ts              # public API
└── __tests__/
    └── auction.test.ts
```

## TypeScript strict 주의사항

- `remainingPool[0]`은 `Player | undefined` — null check 필수
- `import type { PlayerParams }` 형태 강제
- optional property에 `undefined` 직접 할당 불가 — `| null`로 선언
- 모든 함수에서 명시적 return 필수

---

### Task 1: types.ts + errors.ts

**Files:**

- Create: `src/lib/domain/rule-engine/types.ts`
- Create: `src/lib/domain/rule-engine/errors.ts`

- [ ] **Step 1: types.ts 작성**

```typescript
import type { PlayerParams } from '../template/types.ts';

/** 경매 진행 단계: 입찰 중 → 낙찰/유찰 → 완료 */
export type AuctionPhase = 'BIDDING' | 'SOLD' | 'UNSOLD' | 'COMPLETED';

/** 입찰 기록 */
export interface Bid {
	readonly teamId: string;
	readonly amount: number;
}

/** 경매 설정 (Template에서 전달) */
export interface AuctionConfig {
	readonly teamCount: number;
	readonly totalPoints: number;
	readonly minBidUnit: number;
	readonly positionLimit: number;
	readonly playerPool: readonly PlayerParams[];
	readonly teamIds: readonly string[];
}

/** 팀 상태 */
export interface TeamState {
	readonly id: string;
	readonly remainingPoints: number;
	readonly roster: readonly PlayerParams[];
}
```

- [ ] **Step 2: errors.ts 작성**

```typescript
export type AuctionErrorCode =
	| 'BID_TOO_LOW' // 현재 최고가 이하 입찰
	| 'BID_INVALID_UNIT' // 최소 단위 미충족
	| 'INSUFFICIENT_POINTS' // 잔여 포인트 부족
	| 'POSITION_LIMIT_REACHED' // 포지션별 인원 초과
	| 'NOT_BIDDING_PHASE' // BIDDING 단계 아닌데 입찰 시도
	| 'NO_CURRENT_PLAYER' // 경매 대상 선수 없음
	| 'TEAM_NOT_FOUND' // 존재하지 않는 팀 ID
	| 'AUCTION_ALREADY_COMPLETED'; // 이미 완료된 경매

export class AuctionError extends Error {
	readonly code: AuctionErrorCode;

	constructor(code: AuctionErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'AuctionError';
	}
}
```

- [ ] **Step 3: 타입 체크**

Run: `pnpm check`
Expected: 0 errors

- [ ] **Step 4: 커밋**

```bash
git add src/lib/domain/rule-engine/types.ts src/lib/domain/rule-engine/errors.ts
git commit -m "기능(rule-engine): 경매 타입 및 에러 정의

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Auction.create() + 생성 테스트

**Files:**

- Create: `src/lib/domain/rule-engine/auction.ts`
- Create: `src/lib/domain/rule-engine/__tests__/auction.test.ts`

- [ ] **Step 1: 테스트 작성 (실패)**

```typescript
import { describe, it, expect } from 'vitest';
import { Auction } from '../auction.ts';
import type { AuctionConfig } from '../types.ts';

function createConfig(overrides?: Partial<AuctionConfig>): AuctionConfig {
	return {
		teamCount: 2,
		totalPoints: 100,
		minBidUnit: 5,
		positionLimit: 2,
		playerPool: [
			{ name: '선수A', position: 'TOP' },
			{ name: '선수B', position: 'MID' },
			{ name: '선수C', position: 'TOP' }
		],
		teamIds: ['team-1', 'team-2'],
		...overrides
	};
}

describe('경매 생성', () => {
	it('create()하면 첫 선수가 자동으로 경매에 올라온다', () => {
		const auction = Auction.create(createConfig());
		expect(auction.phase).toBe('BIDDING');
		expect(auction.currentPlayer).not.toBeNull();
		expect(auction.currentPlayer?.name).toBe('선수A');
	});

	it('팀 수만큼 TeamState가 생성되고 각 팀은 totalPoints를 보유한다', () => {
		const auction = Auction.create(createConfig());
		expect(auction.teams).toHaveLength(2);
		expect(auction.teams[0]?.remainingPoints).toBe(100);
		expect(auction.teams[1]?.remainingPoints).toBe(100);
	});

	it('remainingPool에는 첫 선수를 제외한 나머지가 남는다', () => {
		const auction = Auction.create(createConfig());
		expect(auction.remainingPool).toHaveLength(2);
	});
});
```

Run: `pnpm test`
Expected: FAIL — auction.ts 없음

- [ ] **Step 2: Auction 클래스 구현 (create + constructor)**

```typescript
import type { AuctionConfig, AuctionPhase, Bid, TeamState } from './types.ts';
import type { PlayerParams } from '../template/types.ts';
import { Player } from '../template/player.ts';
import { AuctionError } from './errors.ts';

interface AuctionState {
	readonly config: AuctionConfig;
	readonly phase: AuctionPhase;
	readonly currentPlayer: Player | null;
	readonly currentBid: Bid | null;
	readonly teams: readonly TeamState[];
	readonly remainingPool: readonly Player[];
	readonly soldPlayers: readonly { player: Player; bid: Bid }[];
}

export class Auction {
	readonly config: AuctionConfig;
	readonly phase: AuctionPhase;
	readonly currentPlayer: Player | null;
	readonly currentBid: Bid | null;
	readonly teams: readonly TeamState[];
	readonly remainingPool: readonly Player[];
	readonly soldPlayers: readonly { player: Player; bid: Bid }[];

	constructor(state: AuctionState) {
		this.config = state.config;
		this.phase = state.phase;
		this.currentPlayer = state.currentPlayer;
		this.currentBid = state.currentBid;
		this.teams = state.teams;
		this.remainingPool = state.remainingPool;
		this.soldPlayers = state.soldPlayers;
	}

	get isCompleted(): boolean {
		return this.phase === 'COMPLETED';
	}

	static create(config: AuctionConfig): Auction {
		const players = config.playerPool.map((p) => new Player(p));
		const first = players[0];
		if (!first) {
			return new Auction({
				config,
				phase: 'COMPLETED',
				currentPlayer: null,
				currentBid: null,
				teams: config.teamIds.map((id) => ({
					id,
					remainingPoints: config.totalPoints,
					roster: []
				})),
				remainingPool: [],
				soldPlayers: []
			});
		}
		return new Auction({
			config,
			phase: 'BIDDING',
			currentPlayer: first,
			currentBid: null,
			teams: config.teamIds.map((id) => ({
				id,
				remainingPoints: config.totalPoints,
				roster: []
			})),
			remainingPool: players.slice(1),
			soldPlayers: []
		});
	}

	private toState(): AuctionState {
		return {
			config: this.config,
			phase: this.phase,
			currentPlayer: this.currentPlayer,
			currentBid: this.currentBid,
			teams: this.teams,
			remainingPool: this.remainingPool,
			soldPlayers: this.soldPlayers
		};
	}

	private findTeam(teamId: string): TeamState {
		const team = this.teams.find((t) => t.id === teamId);
		if (!team) {
			throw new AuctionError('TEAM_NOT_FOUND');
		}
		return team;
	}

	private updateTeam(teamId: string, updater: (t: TeamState) => TeamState): readonly TeamState[] {
		return this.teams.map((t) => (t.id === teamId ? updater(t) : t));
	}
}
```

Run: `pnpm test`
Expected: PASS — 3 tests

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/rule-engine/auction.ts src/lib/domain/rule-engine/__tests__/auction.test.ts
git commit -m "기능(rule-engine): Auction.create() 구현 및 생성 테스트

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: placeBid() 정상 경로 + 금액 검증

**Files:**

- Modify: `src/lib/domain/rule-engine/auction.ts`
- Modify: `src/lib/domain/rule-engine/__tests__/auction.test.ts`

- [ ] **Step 1: 테스트 추가 (실패)**

```typescript
describe('입찰', () => {
	it('최고가를 초과하는 유효한 입찰이 반영된다', () => {
		const auction = Auction.create(createConfig());
		const afterBid = auction.placeBid('team-1', 10);
		expect(afterBid.currentBid?.teamId).toBe('team-1');
		expect(afterBid.currentBid?.amount).toBe(10);
		expect(afterBid.phase).toBe('BIDDING');
	});

	it('기존 입찰보다 높은 금액으로 입찰하면 갱신된다', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		const afterSecond = auction.placeBid('team-2', 15);
		expect(afterSecond.currentBid?.teamId).toBe('team-2');
		expect(afterSecond.currentBid?.amount).toBe(15);
	});
});

describe('입찰 검증 - 금액', () => {
	it('최고가 이하 금액이면 BID_TOO_LOW', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		expect(() => auction.placeBid('team-2', 10)).toThrow(
			expect.objectContaining({ code: 'BID_TOO_LOW' })
		);
		expect(() => auction.placeBid('team-2', 5)).toThrow(
			expect.objectContaining({ code: 'BID_TOO_LOW' })
		);
	});

	it('최소 단위에 맞지 않으면 BID_INVALID_UNIT', () => {
		const auction = Auction.create(createConfig({ minBidUnit: 5 }));
		expect(() => auction.placeBid('team-1', 7)).toThrow(
			expect.objectContaining({ code: 'BID_INVALID_UNIT' })
		);
	});

	it('잔여 포인트보다 높은 금액이면 INSUFFICIENT_POINTS', () => {
		const auction = Auction.create(createConfig({ totalPoints: 10 }));
		expect(() => auction.placeBid('team-1', 15)).toThrow(
			expect.objectContaining({ code: 'INSUFFICIENT_POINTS' })
		);
	});

	it('존재하지 않는 팀이면 TEAM_NOT_FOUND', () => {
		const auction = Auction.create(createConfig());
		expect(() => auction.placeBid('unknown-team', 10)).toThrow(
			expect.objectContaining({ code: 'TEAM_NOT_FOUND' })
		);
	});
});
```

- [ ] **Step 2: placeBid() 구현**

Auction 클래스에 추가:

```typescript
	placeBid(teamId: string, amount: number): Auction {
		if (this.phase !== 'BIDDING') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}
		if (!this.currentPlayer) {
			throw new AuctionError('NO_CURRENT_PLAYER');
		}
		const team = this.findTeam(teamId);

		if (amount % this.config.minBidUnit !== 0) {
			throw new AuctionError('BID_INVALID_UNIT');
		}
		if (amount > team.remainingPoints) {
			throw new AuctionError('INSUFFICIENT_POINTS');
		}
		if (this.currentBid !== null && amount <= this.currentBid.amount) {
			throw new AuctionError('BID_TOO_LOW');
		}
		if (this.currentBid === null && amount <= 0) {
			throw new AuctionError('BID_TOO_LOW');
		}

		const positionCount = team.roster.filter(
			(p) => p.position === this.currentPlayer!.position
		).length;
		if (positionCount >= this.config.positionLimit) {
			throw new AuctionError('POSITION_LIMIT_REACHED');
		}

		return new Auction({
			...this.toState(),
			currentBid: { teamId, amount }
		});
	}
```

Run: `pnpm test`
Expected: PASS — 모든 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/rule-engine/auction.ts src/lib/domain/rule-engine/__tests__/auction.test.ts
git commit -m "기능(rule-engine): placeBid() 입찰 및 검증 구현

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: settle() 낙찰 + startNext() 다음 라운드

**Files:**

- Modify: `src/lib/domain/rule-engine/auction.ts`
- Modify: `src/lib/domain/rule-engine/__tests__/auction.test.ts`

- [ ] **Step 1: 테스트 추가 (실패)**

```typescript
describe('낙찰', () => {
	it('settle()하면 낙찰팀의 포인트가 차감되고 로스터에 선수가 추가된다', () => {
		const auction = Auction.create(createConfig()).placeBid('team-1', 10);
		const settled = auction.settle();
		expect(settled.phase).toBe('SOLD');
		const team1 = settled.teams.find((t) => t.id === 'team-1');
		expect(team1?.remainingPoints).toBe(90);
		expect(team1?.roster).toHaveLength(1);
		expect(team1?.roster[0]?.name).toBe('선수A');
	});

	it('낙찰된 선수는 soldPlayers에 기록된다', () => {
		const settled = Auction.create(createConfig()).placeBid('team-1', 10).settle();
		expect(settled.soldPlayers).toHaveLength(1);
		expect(settled.soldPlayers[0]?.player.name).toBe('선수A');
		expect(settled.soldPlayers[0]?.bid.amount).toBe(10);
	});

	it('입찰 없이 settle()하면 에러', () => {
		const auction = Auction.create(createConfig());
		expect(() => auction.settle()).toThrow(expect.objectContaining({ code: 'NO_CURRENT_PLAYER' }));
	});
});

describe('다음 선수 진행', () => {
	it('startNext()하면 remainingPool에서 다음 선수가 올라온다', () => {
		const next = Auction.create(createConfig()).placeBid('team-1', 10).settle().startNext();
		expect(next.phase).toBe('BIDDING');
		expect(next.currentPlayer?.name).toBe('선수B');
		expect(next.remainingPool).toHaveLength(1);
	});

	it('BIDDING 상태에서 startNext()하면 에러', () => {
		const auction = Auction.create(createConfig());
		expect(() => auction.startNext()).toThrow();
	});
});
```

- [ ] **Step 2: settle() + startNext() 구현**

Auction 클래스에 추가:

```typescript
	settle(): Auction {
		if (this.phase !== 'BIDDING') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}
		if (!this.currentPlayer || !this.currentBid) {
			throw new AuctionError('NO_CURRENT_PLAYER');
		}

		const player = this.currentPlayer;
		const bid = this.currentBid;

		const updatedTeams = this.updateTeam(bid.teamId, (t) => ({
			...t,
			remainingPoints: t.remainingPoints - bid.amount,
			roster: [...t.roster, { name: player.name, position: player.position }]
		}));

		return new Auction({
			...this.toState(),
			phase: 'SOLD',
			currentPlayer: null,
			currentBid: null,
			teams: updatedTeams,
			soldPlayers: [...this.soldPlayers, { player, bid }]
		});
	}

	startNext(): Auction {
		if (this.phase === 'COMPLETED') {
			throw new AuctionError('AUCTION_ALREADY_COMPLETED');
		}
		if (this.phase !== 'SOLD' && this.phase !== 'UNSOLD') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}

		const next = this.remainingPool[0];
		if (!next) {
			return new Auction({
				...this.toState(),
				phase: 'COMPLETED',
				currentPlayer: null,
				currentBid: null,
				remainingPool: []
			});
		}

		return new Auction({
			...this.toState(),
			phase: 'BIDDING',
			currentPlayer: next,
			currentBid: null,
			remainingPool: this.remainingPool.slice(1)
		});
	}
```

Run: `pnpm test`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/rule-engine/auction.ts src/lib/domain/rule-engine/__tests__/auction.test.ts
git commit -m "기능(rule-engine): settle() 낙찰 및 startNext() 구현

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: markUnsold() 유찰 + 완료 시나리오

**Files:**

- Modify: `src/lib/domain/rule-engine/auction.ts`
- Modify: `src/lib/domain/rule-engine/__tests__/auction.test.ts`

- [ ] **Step 1: 테스트 추가 (실패)**

```typescript
describe('유찰', () => {
	it('markUnsold()하면 UNSOLD가 되고 선수는 버려진다', () => {
		const auction = Auction.create(createConfig());
		const unsold = auction.markUnsold();
		expect(unsold.phase).toBe('UNSOLD');
		expect(unsold.currentPlayer).toBeNull();
		expect(unsold.soldPlayers).toHaveLength(0);
	});

	it('유찰 후 startNext()로 다음 선수가 올라온다', () => {
		const next = Auction.create(createConfig()).markUnsold().startNext();
		expect(next.phase).toBe('BIDDING');
		expect(next.currentPlayer?.name).toBe('선수B');
	});
});

describe('경매 완료', () => {
	it('모든 선수를 소진하면 COMPLETED가 된다', () => {
		const config = createConfig({
			playerPool: [{ name: '선수A', position: 'TOP' }]
		});
		const completed = Auction.create(config).placeBid('team-1', 10).settle().startNext();
		expect(completed.phase).toBe('COMPLETED');
		expect(completed.isCompleted).toBe(true);
		expect(completed.currentPlayer).toBeNull();
	});

	it('COMPLETED 상태에서 placeBid는 NOT_BIDDING_PHASE', () => {
		const config = createConfig({
			playerPool: [{ name: '선수A', position: 'TOP' }]
		});
		const completed = Auction.create(config).placeBid('team-1', 10).settle().startNext();
		expect(() => completed.placeBid('team-1', 10)).toThrow(
			expect.objectContaining({ code: 'NOT_BIDDING_PHASE' })
		);
	});

	it('COMPLETED 상태에서 startNext는 AUCTION_ALREADY_COMPLETED', () => {
		const config = createConfig({
			playerPool: [{ name: '선수A', position: 'TOP' }]
		});
		const completed = Auction.create(config).placeBid('team-1', 10).settle().startNext();
		expect(() => completed.startNext()).toThrow(
			expect.objectContaining({ code: 'AUCTION_ALREADY_COMPLETED' })
		);
	});
});
```

- [ ] **Step 2: markUnsold() 구현**

Auction 클래스에 추가:

```typescript
	markUnsold(): Auction {
		if (this.phase !== 'BIDDING') {
			throw new AuctionError('NOT_BIDDING_PHASE');
		}
		return new Auction({
			...this.toState(),
			phase: 'UNSOLD',
			currentPlayer: null,
			currentBid: null
		});
	}
```

Run: `pnpm test`
Expected: PASS

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/rule-engine/auction.ts src/lib/domain/rule-engine/__tests__/auction.test.ts
git commit -m "기능(rule-engine): markUnsold() 유찰 및 경매 완료 시나리오 구현

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 복합 시나리오 + index.ts

**Files:**

- Modify: `src/lib/domain/rule-engine/__tests__/auction.test.ts`
- Create: `src/lib/domain/rule-engine/index.ts`

- [ ] **Step 1: 복합 시나리오 테스트 추가**

```typescript
describe('복합 시나리오', () => {
	it('여러 라운드 진행 후 포지션 제한에 걸린다', () => {
		const config = createConfig({
			positionLimit: 1,
			totalPoints: 100,
			minBidUnit: 5,
			playerPool: [
				{ name: '선수A', position: 'TOP' },
				{ name: '선수B', position: 'MID' },
				{ name: '선수C', position: 'TOP' }
			]
		});

		// 라운드 1: team-1이 선수A(TOP) 낙찰
		const round1 = Auction.create(config).placeBid('team-1', 10).settle().startNext();

		// 라운드 2: 선수B(MID) — team-2 낙찰
		const round2 = round1.placeBid('team-2', 15).settle().startNext();

		// 라운드 3: 선수C(TOP) — team-1은 이미 TOP 보유 → 입찰 불가
		expect(round2.currentPlayer?.position).toBe('TOP');
		expect(() => round2.placeBid('team-1', 10)).toThrow(
			expect.objectContaining({ code: 'POSITION_LIMIT_REACHED' })
		);

		// team-2는 TOP 없으므로 입찰 가능
		const final = round2.placeBid('team-2', 10).settle().startNext();
		expect(final.phase).toBe('COMPLETED');
	});

	it('모든 포인트를 사용한 팀은 입찰할 수 없다', () => {
		const config = createConfig({
			totalPoints: 10,
			minBidUnit: 5,
			playerPool: [
				{ name: '선수A', position: 'TOP' },
				{ name: '선수B', position: 'MID' }
			]
		});

		const round2 = Auction.create(config).placeBid('team-1', 10).settle().startNext();

		expect(() => round2.placeBid('team-1', 5)).toThrow(
			expect.objectContaining({ code: 'INSUFFICIENT_POINTS' })
		);
	});
});
```

Run: `pnpm test`
Expected: PASS (기존 구현으로 통과)

- [ ] **Step 2: index.ts 작성**

```typescript
export { Auction } from './auction.ts';
export { AuctionError } from './errors.ts';
export type { AuctionErrorCode } from './errors.ts';
export type { AuctionPhase, Bid, AuctionConfig, TeamState } from './types.ts';
```

- [ ] **Step 3: 전체 테스트 + 타입 체크**

Run: `pnpm test && pnpm check`
Expected: 전체 PASS, 0 errors

- [ ] **Step 4: 커밋**

```bash
git add src/lib/domain/rule-engine/__tests__/auction.test.ts src/lib/domain/rule-engine/index.ts
git commit -m "기능(rule-engine): 복합 시나리오 테스트 및 public API 추가

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## 검증 방법

1. `pnpm test` — 전체 테스트 통과
2. `pnpm check` — TypeScript 에러 0
3. `pnpm build` — 프로덕션 빌드 성공
4. `git log --oneline` — 6개 커밋 순서 확인
