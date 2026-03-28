# Template 도메인 설계

> rule-engine과 UI가 사용하는 템플릿 데이터 모델 정의. 비즈니스 로직 없음.

## Context

fantazzk에서 경매/드래프트 세션을 시작하려면 템플릿이 필요하다. 템플릿은 대회 이름, 게임 종목, 진행 방식, 규칙, 선수풀, 팀장 설정을 담고 있다. 이 데이터 구조를 프론트엔드 도메인 모델로 정의하여 rule-engine과 UI가 공통으로 사용한다.

위저드 진행(Step 관리)은 `features/template/`의 UI 상태이며, 이 도메인에는 포함하지 않는다.

## 설계 결정

| 결정 | 선택                                                  | 근거                                 |
| ---- | ----------------------------------------------------- | ------------------------------------ |
| 역할 | 순수 데이터 모델                                      | 검증/CRUD는 서버, 위저드는 features/ |
| 패턴 | session과 동일 (불변 클래스, readonly, 대문자 리터럴) | 프로젝트 일관성                      |

## 파일 구조

```
src/lib/domain/template/
├── types.ts              # 타입 리터럴, 인터페이스
├── player.ts             # Player 클래스
├── template.ts           # Template 클래스
├── index.ts              # public API
└── __tests__/
    └── template.test.ts
```

## 타입 정의

```typescript
/** 게임 종목 */
type GameType = 'LEAGUE_OF_LEGENDS' | 'VALORANT' | 'PUBG';

/** 팀 구성 방식: 경매(포인트 입찰) 또는 드래프트(순차 픽) */
type TemplateMode = 'AUCTION' | 'DRAFT';

/** 대회 매치 포맷 */
type MatchFormat = 'BO1' | 'BO3' | 'BO5';

/** 티어 밸런싱 방식 */
type TierBalancing = 'AUTO' | 'MANUAL';

/** 팀장 선출 방식 */
type CaptainSelectMode = 'VOTE' | 'ADMIN_PICK';
```

## Player 클래스

```typescript
class Player {
	readonly name: string;
	readonly position: string;

	constructor(params: PlayerParams);
}
```

## Template 클래스

```typescript
class Template {
	readonly id: string;
	readonly name: string;
	readonly gameType: GameType;
	readonly creatorId: string;
	readonly mode: TemplateMode;

	// 규칙
	readonly matchFormat: MatchFormat;
	readonly pickBanTime: number;
	readonly restrictions: string;

	// 선수풀
	readonly playerPool: readonly Player[];
	readonly tierBalancing: TierBalancing;

	// 팀장
	readonly captainSelectMode: CaptainSelectMode;
	readonly captainsNeeded: number;

	// 메타
	readonly isPublic: boolean;
	readonly usageCount: number;
	readonly createdAt: Date;
	readonly updatedAt: Date;

	// 파생 상태
	get playerCount(): number;

	constructor(params: TemplateParams);
}
```

## 테스트

순수 데이터 모델이므로 테스트 범위는 최소한:

- Template 생성 시 파생 상태(playerCount) 정확성
- Player 생성
