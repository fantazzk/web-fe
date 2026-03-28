# Session 도메인 설계

> 세션(방)의 생명주기와 참가자를 관리하는 프론트엔드 도메인 모델.

## Context

fantazzk 플랫폼에서 경매/드래프트 게임이 진행되려면 먼저 "방"이 필요하다.
방 생성 → 참가자 입장 → 시작 → 종료까지의 생명주기와, 그 안의 참가자 상태(접속, ready, 호스트 위임)를 관리하는 것이 session 도메인의 책임이다.

게임 진행 로직(입찰 검증, 픽 순서 등)은 rule-engine 도메인이 담당하며, session은 "게임이 진행될 수 있는 환경"만 관리한다.

솔로 모드(AI 상대)와 멀티플레이어 모두 동일한 Session을 거친다.

## 설계 결정

| 결정           | 선택                        | 근거                                             |
| -------------- | --------------------------- | ------------------------------------------------ |
| 데이터 모델    | 클래스                      | 데이터 + 파생 상태 + 전이 로직을 응집            |
| 불변성         | readonly + 새 인스턴스 반환 | 상태 추적 용이, 사이드이펙트 방지                |
| 문자열 리터럴  | 대문자 케이스               | 프로젝트 전체 컨벤션 (`'WAITING'`, `'HUMAN'` 등) |
| 솔로/멀티 분기 | 동일 Session 사용           | rule-engine에서 분기 불필요, 일관된 처리         |
| 테스트         | TDD (vitest)                | 순수 로직이므로 테스트 우선 개발에 적합          |

## 파일 구조

```
src/lib/domain/session/
├── session.ts          # Session 클래스
├── participant.ts      # Participant 클래스
├── errors.ts           # SessionError
├── types.ts            # 공유 타입 리터럴
└── index.ts            # public API re-export
```

## 타입 정의

```typescript
// types.ts
type SessionStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
type SessionMode = 'AUCTION' | 'DRAFT';
type ParticipantType = 'HUMAN' | 'AI';
type ParticipantRole = 'HOST' | 'GUEST';
type ReadyStatus = 'READY' | 'NOT_READY';
```

## Participant 클래스

```typescript
class Participant {
	readonly id: string;
	readonly nickname: string;
	readonly type: ParticipantType;
	readonly role: ParticipantRole;
	readonly readyStatus: ReadyStatus;
	readonly connected: boolean;

	constructor(params: ParticipantParams);

	toggleReady(): Participant;
	disconnect(): Participant;
	reconnect(): Participant;
	promoteToHost(): Participant;
}
```

**검증 규칙:**

- AI 참가자는 항상 `READY` + `connected: true`
- HOST는 항상 `READY` (토글 불가)

## Session 클래스

```typescript
class Session {
	readonly id: string;
	readonly status: SessionStatus;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly participants: readonly Participant[];
	readonly maxParticipants: number; // 최대 6
	readonly createdAt: Date;

	constructor(params: SessionParams);

	// 파생 상태 (getter)
	get canStart(): boolean;
	get connectedCount(): number;
	get isFullRoom(): boolean;
	get allReady(): boolean;
	get humanCount(): number;
	get host(): Participant;

	// 참가자 관리
	addParticipant(participant: Participant): Session;
	removeParticipant(participantId: string): Session;
	toggleParticipantReady(participantId: string): Session;
	disconnectParticipant(participantId: string): Session;
	reconnectParticipant(participantId: string): Session;

	// 상태 전이
	start(): Session; // WAITING → IN_PROGRESS
	complete(): Session; // IN_PROGRESS → COMPLETED

	// 팩토리 메서드
	static createSolo(config: SoloConfig): Session;
	static createMulti(config: MultiConfig): Session;
}
```

## 상태 전이 규칙

```
WAITING ──start()──→ IN_PROGRESS ──complete()──→ COMPLETED
```

**start() 조건:**

- status === 'WAITING'
- canStart === true (HUMAN 참가자 최소 1명 + 전원 READY)

**complete() 조건:**

- status === 'IN_PROGRESS'

**역방향 전이 없음** — COMPLETED에서 되돌릴 수 없다.

## 검증 규칙

| 메서드                   | 실패 조건                                             | 에러                                                         |
| ------------------------ | ----------------------------------------------------- | ------------------------------------------------------------ |
| `addParticipant`         | 방이 가득 참 (participants.length >= maxParticipants) | `SESSION_FULL`                                               |
| `addParticipant`         | 이미 참가 중인 ID                                     | `ALREADY_JOINED`                                             |
| `addParticipant`         | status !== 'WAITING'                                  | `SESSION_NOT_WAITING`                                        |
| `removeParticipant`      | 존재하지 않는 참가자                                  | `PARTICIPANT_NOT_FOUND`                                      |
| `removeParticipant`      | 호스트 퇴장 시                                        | 다음 HUMAN에게 호스트 위임, HUMAN 없으면 `NO_HOST_CANDIDATE` |
| `start`                  | status !== 'WAITING'                                  | `SESSION_NOT_WAITING`                                        |
| `start`                  | canStart === false                                    | `START_CONDITIONS_NOT_MET`                                   |
| `complete`               | status !== 'IN_PROGRESS'                              | `SESSION_NOT_IN_PROGRESS`                                    |
| `toggleParticipantReady` | HOST 또는 AI 참가자                                   | `CANNOT_TOGGLE_READY`                                        |
| `disconnectParticipant`  | AI 참가자                                             | `CANNOT_DISCONNECT_AI`                                       |

## 에러

```typescript
class SessionError extends Error {
	readonly code: SessionErrorCode;
}

type SessionErrorCode =
	| 'SESSION_FULL'
	| 'ALREADY_JOINED'
	| 'SESSION_NOT_WAITING'
	| 'SESSION_NOT_IN_PROGRESS'
	| 'PARTICIPANT_NOT_FOUND'
	| 'NO_HOST_CANDIDATE'
	| 'START_CONDITIONS_NOT_MET'
	| 'CANNOT_TOGGLE_READY'
	| 'CANNOT_DISCONNECT_AI';
```

## 솔로 모드

`Session.createSolo(config)`:

1. HUMAN 참가자 1명 (HOST)
2. AI 참가자를 `config.aiCount`명 자동 생성
3. AI는 `connected: true`, `readyStatus: 'READY'` 고정
4. 생성 즉시 `canStart === true`

## 테스트 전략

vitest로 TDD 진행. 테스트 카테고리:

1. **Session 생성** — createSolo, createMulti 팩토리
2. **참가자 관리** — 추가, 제거, 호스트 위임
3. **Ready 상태** — 토글, AI/HOST 불가
4. **접속 관리** — 끊김, 재접속, AI 불가
5. **상태 전이** — start 조건 충족/미충족, complete, 역방향 불가
6. **파생 상태** — canStart, allReady, connectedCount, isFullRoom
7. **에러 케이스** — 모든 SessionErrorCode에 대한 테스트

## 사전 작업

- vitest 설치 및 테스트 스크립트 추가 (현재 미설정)
- `src/lib/domain/session/` 디렉토리 생성
