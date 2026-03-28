# Rule Engine — 경매 모드 설계

> 경매 진행 상태를 관리하고 입찰 유효성을 검증하는 도메인 모델.

## Context

fantazzk의 핵심 게임 모드인 경매를 구현한다. 유저(팀장)들이 포인트를 사용해 선수를 입찰하고, 최고가 입찰자에게 낙찰하는 방식이다. 타이머는 외부(서버/UI)에서 관리하며, rule-engine은 "타이머 종료" 이벤트를 받아 낙찰/유찰을 처리한다.

이 워크트리에서는 경매 모드만 구현한다. 드래프트 모드는 별도 워크트리에서 진행.

## 설계 결정

| 결정      | 선택                    | 근거                                           |
| --------- | ----------------------- | ---------------------------------------------- |
| 동시 입찰 | 최고가 우선             | 타임스탬프 불필요, 순수 금액 비교만으로 판단   |
| 같은 금액 | 기존 입찰자 방어        | 같은 금액이면 BID_TOO_LOW                      |
| 타이머    | rule-engine 밖          | 서버/클라이언트 동기화는 rule-engine 책임 아님 |
| 패턴      | session/template과 동일 | 불변 클래스, readonly, 대문자 리터럴           |

## 파일 구조

```
src/lib/domain/rule-engine/
├── types.ts              # 경매 설정, 상태 타입
├── errors.ts             # AuctionError, AuctionErrorCode
├── auction.ts            # Auction 클래스
├── index.ts              # public API
└── __tests__/
    └── auction.test.ts
```

## 타입

```typescript
/** 경매 진행 단계 */
type AuctionPhase = 'BIDDING' | 'SOLD' | 'UNSOLD' | 'COMPLETED';

/** 입찰 기록 */
interface Bid {
	readonly teamId: string;
	readonly amount: number;
}

/** 경매 설정 */
interface AuctionConfig {
	readonly teamCount: number;
	readonly totalPoints: number;
	readonly minBidUnit: number;
	readonly positionLimit: number;
	readonly playerPool: readonly PlayerParams[];
	readonly teamIds: readonly string[];
}

/** 팀 상태 */
interface TeamState {
	readonly id: string;
	readonly remainingPoints: number;
	readonly roster: readonly PlayerParams[];
}
```

## Auction 클래스

```typescript
class Auction {
	readonly config: AuctionConfig;
	readonly phase: AuctionPhase;
	readonly currentPlayer: Player | null;
	readonly currentBid: Bid | null;
	readonly teams: readonly TeamState[];
	readonly remainingPool: readonly Player[];
	readonly soldPlayers: readonly { player: Player; bid: Bid }[];

	startNext(): Auction;
	placeBid(teamId: string, amount: number): Auction;
	settle(): Auction;
	markUnsold(): Auction;

	get isCompleted(): boolean;

	static create(config: AuctionConfig): Auction;
}
```

## 입찰 검증 규칙

| 검증         | 실패 조건                        | 에러                     |
| ------------ | -------------------------------- | ------------------------ |
| 최고가 초과  | amount <= currentBid.amount      | `BID_TOO_LOW`            |
| 최소 단위    | amount % minBidUnit !== 0        | `BID_INVALID_UNIT`       |
| 포인트 부족  | amount > team.remainingPoints    | `INSUFFICIENT_POINTS`    |
| 포지션 제한  | 해당 포지션 이미 positionLimit명 | `POSITION_LIMIT_REACHED` |
| 경매 중 아님 | phase !== 'BIDDING'              | `NOT_BIDDING_PHASE`      |
| 같은 금액    | amount === currentBid.amount     | `BID_TOO_LOW`            |

## 상태 흐름

```
create() → phase: BIDDING (첫 선수 자동 시작)
  ↓
placeBid() → phase: BIDDING (입찰 갱신)
  ↓
settle() → phase: SOLD → startNext() → phase: BIDDING
  또는
markUnsold() → phase: UNSOLD → startNext() → phase: BIDDING
  ↓
남은 선수 없음 → phase: COMPLETED
```

## 에러

```typescript
type AuctionErrorCode =
	| 'BID_TOO_LOW'
	| 'BID_INVALID_UNIT'
	| 'INSUFFICIENT_POINTS'
	| 'POSITION_LIMIT_REACHED'
	| 'NOT_BIDDING_PHASE'
	| 'NO_CURRENT_PLAYER'
	| 'TEAM_NOT_FOUND'
	| 'AUCTION_ALREADY_COMPLETED';
```

## 테스트 전략

비즈니스 규칙 검증 위주:

- 입찰 검증 (6개 에러 케이스)
- 낙찰 처리 (포인트 차감, 로스터 추가, 다음 선수 시작)
- 유찰 처리
- 전체 경매 완료 판단
- 포지션 제한 복합 시나리오
