# Session 도메인 TDD 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 세션(방) 생명주기와 참가자를 관리하는 프론트엔드 도메인 모델을 TDD로 구현한다.

**Architecture:** 불변 클래스 기반. Session/Participant 클래스가 데이터 + 파생 상태 + 전이 로직을 응집. 모든 메서드는 새 인스턴스를 반환하여 불변성을 보장한다.

**Tech Stack:** TypeScript (strict mode), vitest

---

## 파일 구조

```
src/lib/domain/session/
├── types.ts                    # 공유 타입 리터럴, 인터페이스
├── errors.ts                   # SessionError, SessionErrorCode
├── participant.ts              # Participant 클래스
├── session.ts                  # Session 클래스
├── index.ts                    # public API re-export
└── __tests__/
    ├── participant.test.ts     # Participant 테스트
    └── session.test.ts         # Session 테스트
```

## TypeScript strict 모드 주의사항

1. **`verbatimModuleSyntax: true`** — 타입만 import할 때 `import type { ... }` 필수
2. **`noUncheckedIndexedAccess: true`** — 배열 인덱스 접근 시 `T | undefined`. find() 결과도 null check 필수
3. **`exactOptionalPropertyTypes: true`** — optional 프로퍼티에 `undefined`를 명시 할당하면 에러
4. **`noUnusedLocals / noUnusedParameters: true`** — 미사용 변수/파라미터 에러
5. **`noImplicitReturns: true`** — 모든 코드 경로에서 명시적 return 필수

---

### Task 1: vitest 설치 및 설정

**Files:**

- Modify: `package.json`
- Modify: `vite.config.ts`
- Create: `src/lib/domain/session/__tests__/smoke.test.ts` (임시)

- [ ] **Step 1: vitest 설치**

```bash
pnpm add -D vitest
```

- [ ] **Step 2: vite.config.ts에 test 설정 추가**

```typescript
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['src/**/*.test.ts']
	}
});
```

- [ ] **Step 3: package.json에 test 스크립트 추가**

`scripts`에 추가:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 스모크 테스트로 동작 확인**

`src/lib/domain/session/__tests__/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('vitest 설정', () => {
	it('동작 확인', () => {
		expect(1 + 1).toBe(2);
	});
});
```

Run: `pnpm test`
Expected: PASS — 1 test passed

- [ ] **Step 5: 커밋**

```bash
git add vite.config.ts package.json pnpm-lock.yaml src/lib/domain/session/__tests__/smoke.test.ts
git commit -m "설정(session): vitest 설치 및 테스트 환경 구성"
```

---

### Task 2: types.ts + errors.ts 작성

**Files:**

- Create: `src/lib/domain/session/types.ts`
- Create: `src/lib/domain/session/errors.ts`

- [ ] **Step 1: types.ts 작성**

`src/lib/domain/session/types.ts`:

```typescript
export type SessionStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
export type SessionMode = 'AUCTION' | 'DRAFT';
export type ParticipantType = 'HUMAN' | 'AI';
export type ParticipantRole = 'HOST' | 'GUEST';
export type ReadyStatus = 'READY' | 'NOT_READY';

export interface ParticipantParams {
	readonly id: string;
	readonly nickname: string;
	readonly type: ParticipantType;
	readonly role: ParticipantRole;
	readonly readyStatus?: ReadyStatus;
	readonly connected?: boolean;
}

export interface SessionParams {
	readonly id: string;
	readonly status?: SessionStatus;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly participants: readonly ParticipantParams[];
	readonly maxParticipants: number;
	readonly createdAt?: Date;
}

export interface SoloConfig {
	readonly sessionId: string;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly hostNickname: string;
	readonly aiCount: number;
}

export interface MultiConfig {
	readonly sessionId: string;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly hostNickname: string;
	readonly maxParticipants: number;
}
```

- [ ] **Step 2: errors.ts 작성**

`src/lib/domain/session/errors.ts`:

```typescript
export type SessionErrorCode =
	| 'SESSION_FULL'
	| 'ALREADY_JOINED'
	| 'SESSION_NOT_WAITING'
	| 'SESSION_NOT_IN_PROGRESS'
	| 'PARTICIPANT_NOT_FOUND'
	| 'NO_HOST_CANDIDATE'
	| 'START_CONDITIONS_NOT_MET'
	| 'CANNOT_TOGGLE_READY'
	| 'CANNOT_DISCONNECT_AI';

export class SessionError extends Error {
	readonly code: SessionErrorCode;

	constructor(code: SessionErrorCode, message?: string) {
		super(message ?? code);
		this.code = code;
		this.name = 'SessionError';
	}
}
```

- [ ] **Step 3: 타입 체크**

Run: `pnpm check`
Expected: 0 errors

- [ ] **Step 4: 커밋**

```bash
git add src/lib/domain/session/types.ts src/lib/domain/session/errors.ts
git commit -m "기능(session): 세션 도메인 공유 타입 및 에러 정의"
```

---

### Task 3: Participant 클래스 — TDD

**Files:**

- Create: `src/lib/domain/session/participant.ts`
- Create: `src/lib/domain/session/__tests__/participant.test.ts`
- Delete: `src/lib/domain/session/__tests__/smoke.test.ts`

- [ ] **Step 1: 스모크 테스트 삭제 + 실패 테스트 작성 (생성)**

`smoke.test.ts` 삭제 후, `src/lib/domain/session/__tests__/participant.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Participant } from '../participant.ts';

describe('Participant', () => {
	describe('생성', () => {
		it('HUMAN 참가자를 기본값으로 생성한다', () => {
			const p = new Participant({
				id: 'user-1',
				nickname: '테스터',
				type: 'HUMAN',
				role: 'GUEST'
			});

			expect(p.id).toBe('user-1');
			expect(p.nickname).toBe('테스터');
			expect(p.type).toBe('HUMAN');
			expect(p.role).toBe('GUEST');
			expect(p.readyStatus).toBe('NOT_READY');
			expect(p.connected).toBe(true);
		});

		it('AI 참가자는 항상 READY이고 connected이다', () => {
			const p = new Participant({
				id: 'ai-1',
				nickname: 'AI 1',
				type: 'AI',
				role: 'GUEST',
				readyStatus: 'NOT_READY',
				connected: false
			});

			expect(p.readyStatus).toBe('READY');
			expect(p.connected).toBe(true);
		});

		it('HOST는 항상 READY이다', () => {
			const p = new Participant({
				id: 'host-1',
				nickname: '호스트',
				type: 'HUMAN',
				role: 'HOST',
				readyStatus: 'NOT_READY'
			});

			expect(p.readyStatus).toBe('READY');
		});
	});
});
```

Run: `pnpm test`
Expected: FAIL — `../participant.ts` 모듈 없음

- [ ] **Step 2: Participant 생성자 구현**

`src/lib/domain/session/participant.ts`:

```typescript
import type { ParticipantParams, ParticipantRole, ParticipantType, ReadyStatus } from './types.ts';

export class Participant {
	readonly id: string;
	readonly nickname: string;
	readonly type: ParticipantType;
	readonly role: ParticipantRole;
	readonly readyStatus: ReadyStatus;
	readonly connected: boolean;

	constructor(params: ParticipantParams) {
		this.id = params.id;
		this.nickname = params.nickname;
		this.type = params.type;
		this.role = params.role;

		if (params.type === 'AI') {
			this.readyStatus = 'READY';
			this.connected = true;
			return;
		}

		this.readyStatus = params.role === 'HOST' ? 'READY' : (params.readyStatus ?? 'NOT_READY');
		this.connected = params.connected ?? true;
	}

	private toParams(): ParticipantParams {
		return {
			id: this.id,
			nickname: this.nickname,
			type: this.type,
			role: this.role,
			readyStatus: this.readyStatus,
			connected: this.connected
		};
	}
}
```

Run: `pnpm test`
Expected: PASS — 3 tests passed

- [ ] **Step 3: 실패 테스트 추가 (toggleReady, disconnect, reconnect, promoteToHost)**

`participant.test.ts`에 추가:

```typescript
import { SessionError } from '../errors.ts';

describe('toggleReady', () => {
	it('GUEST HUMAN의 ready 상태를 토글한다', () => {
		const p = new Participant({
			id: 'user-1',
			nickname: '테스터',
			type: 'HUMAN',
			role: 'GUEST'
		});

		const toggled = p.toggleReady();
		expect(toggled.readyStatus).toBe('READY');
		expect(toggled).not.toBe(p);

		const toggledBack = toggled.toggleReady();
		expect(toggledBack.readyStatus).toBe('NOT_READY');
	});

	it('HOST는 toggleReady 할 수 없다', () => {
		const p = new Participant({
			id: 'host-1',
			nickname: '호스트',
			type: 'HUMAN',
			role: 'HOST'
		});

		expect(() => p.toggleReady()).toThrow(SessionError);
		expect(() => p.toggleReady()).toThrow(expect.objectContaining({ code: 'CANNOT_TOGGLE_READY' }));
	});

	it('AI는 toggleReady 할 수 없다', () => {
		const p = new Participant({
			id: 'ai-1',
			nickname: 'AI 1',
			type: 'AI',
			role: 'GUEST'
		});

		expect(() => p.toggleReady()).toThrow(expect.objectContaining({ code: 'CANNOT_TOGGLE_READY' }));
	});
});

describe('disconnect / reconnect', () => {
	it('HUMAN 참가자를 disconnect 한다', () => {
		const p = new Participant({
			id: 'user-1',
			nickname: '테스터',
			type: 'HUMAN',
			role: 'GUEST'
		});

		const disconnected = p.disconnect();
		expect(disconnected.connected).toBe(false);
		expect(disconnected).not.toBe(p);
	});

	it('disconnect된 참가자를 reconnect 한다', () => {
		const p = new Participant({
			id: 'user-1',
			nickname: '테스터',
			type: 'HUMAN',
			role: 'GUEST'
		});

		const reconnected = p.disconnect().reconnect();
		expect(reconnected.connected).toBe(true);
	});

	it('AI는 disconnect 할 수 없다', () => {
		const p = new Participant({
			id: 'ai-1',
			nickname: 'AI 1',
			type: 'AI',
			role: 'GUEST'
		});

		expect(() => p.disconnect()).toThrow(expect.objectContaining({ code: 'CANNOT_DISCONNECT_AI' }));
	});
});

describe('promoteToHost', () => {
	it('GUEST를 HOST로 승격하면 READY가 된다', () => {
		const p = new Participant({
			id: 'user-1',
			nickname: '테스터',
			type: 'HUMAN',
			role: 'GUEST'
		});

		const promoted = p.promoteToHost();
		expect(promoted.role).toBe('HOST');
		expect(promoted.readyStatus).toBe('READY');
		expect(promoted).not.toBe(p);
	});
});
```

Run: `pnpm test`
Expected: FAIL — toggleReady, disconnect, reconnect, promoteToHost 메서드 없음

- [ ] **Step 4: Participant 메서드 구현**

`participant.ts`에 import 추가 및 메서드 구현:

```typescript
import { SessionError } from './errors.ts';
```

Participant 클래스 내부에 메서드 추가:

```typescript
	toggleReady(): Participant {
		if (this.type === 'AI' || this.role === 'HOST') {
			throw new SessionError('CANNOT_TOGGLE_READY');
		}
		return new Participant({
			...this.toParams(),
			readyStatus: this.readyStatus === 'READY' ? 'NOT_READY' : 'READY'
		});
	}

	disconnect(): Participant {
		if (this.type === 'AI') {
			throw new SessionError('CANNOT_DISCONNECT_AI');
		}
		return new Participant({
			...this.toParams(),
			connected: false
		});
	}

	reconnect(): Participant {
		return new Participant({
			...this.toParams(),
			connected: true
		});
	}

	promoteToHost(): Participant {
		return new Participant({
			...this.toParams(),
			role: 'HOST'
		});
	}
```

Run: `pnpm test`
Expected: PASS — 전체 통과

- [ ] **Step 5: 커밋**

```bash
git rm src/lib/domain/session/__tests__/smoke.test.ts
git add src/lib/domain/session/participant.ts src/lib/domain/session/__tests__/participant.test.ts
git commit -m "기능(session): Participant 클래스 구현 및 테스트"
```

---

### Task 4: Session 클래스 — 생성 및 파생 상태 TDD

**Files:**

- Create: `src/lib/domain/session/session.ts`
- Create: `src/lib/domain/session/__tests__/session.test.ts`

- [ ] **Step 1: 실패 테스트 작성 (createSolo, createMulti, getter)**

`src/lib/domain/session/__tests__/session.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { Session } from '../session.ts';
import { Participant } from '../participant.ts';

function createGuest(id = 'guest-1'): Participant {
	return new Participant({ id, nickname: '게스트', type: 'HUMAN', role: 'GUEST' });
}

describe('Session', () => {
	describe('createSolo', () => {
		it('솔로 세션을 생성한다', () => {
			const session = Session.createSolo({
				sessionId: 'session-1',
				mode: 'AUCTION',
				templateId: 'tmpl-1',
				hostId: 'host-1',
				hostNickname: '호스트',
				aiCount: 3
			});

			expect(session.id).toBe('session-1');
			expect(session.status).toBe('WAITING');
			expect(session.mode).toBe('AUCTION');
			expect(session.participants).toHaveLength(4);
			expect(session.hostId).toBe('host-1');
			expect(session.host.role).toBe('HOST');
			expect(session.humanCount).toBe(1);
			expect(session.canStart).toBe(true);
		});
	});

	describe('createMulti', () => {
		it('멀티 세션을 생성한다', () => {
			const session = Session.createMulti({
				sessionId: 'session-2',
				mode: 'DRAFT',
				templateId: 'tmpl-2',
				hostId: 'host-1',
				hostNickname: '호스트',
				maxParticipants: 6
			});

			expect(session.id).toBe('session-2');
			expect(session.status).toBe('WAITING');
			expect(session.participants).toHaveLength(1);
			expect(session.maxParticipants).toBe(6);
		});
	});

	describe('파생 상태', () => {
		it('connectedCount는 접속 중인 참가자 수를 반환한다', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 2
			});
			expect(session.connectedCount).toBe(3);
		});

		it('isFullRoom은 참가자가 maxParticipants일 때 true', () => {
			const session = Session.createMulti({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				maxParticipants: 2
			});
			const guest = createGuest('g1').toggleReady();
			const full = session.addParticipant(guest);
			expect(full.isFullRoom).toBe(true);
		});

		it('allReady는 모든 참가자가 READY일 때 true', () => {
			const session = Session.createSolo({
				sessionId: 's1',
				mode: 'AUCTION',
				templateId: 't1',
				hostId: 'h1',
				hostNickname: 'Host',
				aiCount: 1
			});
			expect(session.allReady).toBe(true);
		});
	});
});
```

Run: `pnpm test`
Expected: FAIL — `../session.ts` 모듈 없음

- [ ] **Step 2: Session 클래스 구현 (생성자, 팩토리, getter, addParticipant)**

`src/lib/domain/session/session.ts`:

```typescript
import type {
	SessionStatus,
	SessionMode,
	SessionParams,
	SoloConfig,
	MultiConfig
} from './types.ts';
import { Participant } from './participant.ts';
import { SessionError } from './errors.ts';

export class Session {
	readonly id: string;
	readonly status: SessionStatus;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly participants: readonly Participant[];
	readonly maxParticipants: number;
	readonly createdAt: Date;

	constructor(params: SessionParams) {
		this.id = params.id;
		this.status = params.status ?? 'WAITING';
		this.mode = params.mode;
		this.templateId = params.templateId;
		this.hostId = params.hostId;
		this.participants = params.participants.map((p) => new Participant(p));
		this.maxParticipants = params.maxParticipants;
		this.createdAt = params.createdAt ?? new Date();
	}

	get host(): Participant {
		const found = this.participants.find((p) => p.id === this.hostId);
		if (!found) {
			throw new SessionError('PARTICIPANT_NOT_FOUND');
		}
		return found;
	}

	get canStart(): boolean {
		return this.humanCount >= 1 && this.allReady;
	}

	get connectedCount(): number {
		return this.participants.filter((p) => p.connected).length;
	}

	get isFullRoom(): boolean {
		return this.participants.length >= this.maxParticipants;
	}

	get allReady(): boolean {
		return this.participants.every((p) => p.readyStatus === 'READY');
	}

	get humanCount(): number {
		return this.participants.filter((p) => p.type === 'HUMAN').length;
	}

	addParticipant(participant: Participant): Session {
		if (this.status !== 'WAITING') {
			throw new SessionError('SESSION_NOT_WAITING');
		}
		if (this.isFullRoom) {
			throw new SessionError('SESSION_FULL');
		}
		if (this.participants.some((p) => p.id === participant.id)) {
			throw new SessionError('ALREADY_JOINED');
		}
		return this.withParticipants([...this.participants, participant]);
	}

	private withParticipants(participants: readonly Participant[]): Session {
		return new Session({
			id: this.id,
			status: this.status,
			mode: this.mode,
			templateId: this.templateId,
			hostId: this.hostId,
			participants: participants.map((p) => ({
				id: p.id,
				nickname: p.nickname,
				type: p.type,
				role: p.role,
				readyStatus: p.readyStatus,
				connected: p.connected
			})),
			maxParticipants: this.maxParticipants,
			createdAt: this.createdAt
		});
	}

	private updateParticipant(
		participantId: string,
		updater: (p: Participant) => Participant
	): Session {
		const exists = this.participants.some((p) => p.id === participantId);
		if (!exists) {
			throw new SessionError('PARTICIPANT_NOT_FOUND');
		}
		const updated = this.participants.map((p) => (p.id === participantId ? updater(p) : p));
		return this.withParticipants(updated);
	}

	private withStatus(status: SessionStatus): Session {
		return new Session({
			id: this.id,
			status,
			mode: this.mode,
			templateId: this.templateId,
			hostId: this.hostId,
			participants: this.participants.map((p) => ({
				id: p.id,
				nickname: p.nickname,
				type: p.type,
				role: p.role,
				readyStatus: p.readyStatus,
				connected: p.connected
			})),
			maxParticipants: this.maxParticipants,
			createdAt: this.createdAt
		});
	}

	static createSolo(config: SoloConfig): Session {
		const host = {
			id: config.hostId,
			nickname: config.hostNickname,
			type: 'HUMAN' as const,
			role: 'HOST' as const
		};
		const aiParticipants = Array.from({ length: config.aiCount }, (_, i) => ({
			id: `ai-${i + 1}`,
			nickname: `AI ${i + 1}`,
			type: 'AI' as const,
			role: 'GUEST' as const
		}));
		return new Session({
			id: config.sessionId,
			mode: config.mode,
			templateId: config.templateId,
			hostId: config.hostId,
			participants: [host, ...aiParticipants],
			maxParticipants: 1 + config.aiCount
		});
	}

	static createMulti(config: MultiConfig): Session {
		const host = {
			id: config.hostId,
			nickname: config.hostNickname,
			type: 'HUMAN' as const,
			role: 'HOST' as const
		};
		return new Session({
			id: config.sessionId,
			mode: config.mode,
			templateId: config.templateId,
			hostId: config.hostId,
			participants: [host],
			maxParticipants: config.maxParticipants
		});
	}
}
```

Run: `pnpm test`
Expected: PASS — 전체 통과

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/session/session.ts src/lib/domain/session/__tests__/session.test.ts
git commit -m "기능(session): Session 클래스 생성 및 파생 상태 구현"
```

---

### Task 5: Session 참가자 관리 — TDD

**Files:**

- Modify: `src/lib/domain/session/session.ts`
- Modify: `src/lib/domain/session/__tests__/session.test.ts`

- [ ] **Step 1: 실패 테스트 작성 (addParticipant 에러, removeParticipant, toggle, connect)**

`session.test.ts`에 추가:

```typescript
import { SessionError } from '../errors.ts';

function createAI(id = 'ai-1'): Participant {
	return new Participant({ id, nickname: 'AI 1', type: 'AI', role: 'GUEST' });
}

describe('addParticipant', () => {
	it('WAITING이 아닌 세션에 참가하면 SESSION_NOT_WAITING', () => {
		const session = Session.createSolo({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			aiCount: 1
		}).start();
		const guest = createGuest('g1');
		expect(() => session.addParticipant(guest)).toThrow(
			expect.objectContaining({ code: 'SESSION_NOT_WAITING' })
		);
	});

	it('방이 가득 찼으면 SESSION_FULL', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 1
		});
		const guest = createGuest('g1');
		expect(() => session.addParticipant(guest)).toThrow(
			expect.objectContaining({ code: 'SESSION_FULL' })
		);
	});

	it('이미 참가 중인 ID면 ALREADY_JOINED', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('h1');
		expect(() => session.addParticipant(guest)).toThrow(
			expect.objectContaining({ code: 'ALREADY_JOINED' })
		);
	});
});

describe('removeParticipant', () => {
	it('참가자를 제거한다', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('g1');
		const withGuest = session.addParticipant(guest);
		const removed = withGuest.removeParticipant('g1');
		expect(removed.participants).toHaveLength(1);
	});

	it('존재하지 않는 참가자를 제거하면 PARTICIPANT_NOT_FOUND', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		expect(() => session.removeParticipant('nobody')).toThrow(
			expect.objectContaining({ code: 'PARTICIPANT_NOT_FOUND' })
		);
	});

	it('호스트가 퇴장하면 다음 HUMAN에게 호스트를 위임한다', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('g1');
		const withGuest = session.addParticipant(guest);
		const afterHostLeft = withGuest.removeParticipant('h1');

		expect(afterHostLeft.hostId).toBe('g1');
		expect(afterHostLeft.host.role).toBe('HOST');
	});

	it('호스트가 퇴장하고 HUMAN이 없으면 NO_HOST_CANDIDATE', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const ai = createAI('ai-1');
		const withAI = session.addParticipant(ai);
		expect(() => withAI.removeParticipant('h1')).toThrow(
			expect.objectContaining({ code: 'NO_HOST_CANDIDATE' })
		);
	});
});

describe('toggleParticipantReady', () => {
	it('참가자의 ready 상태를 토글한다', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('g1');
		const withGuest = session.addParticipant(guest);
		const toggled = withGuest.toggleParticipantReady('g1');
		expect(toggled.participants.find((p) => p.id === 'g1')?.readyStatus).toBe('READY');
	});
});

describe('disconnectParticipant', () => {
	it('참가자를 disconnect 한다', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('g1');
		const withGuest = session.addParticipant(guest);
		const disconnected = withGuest.disconnectParticipant('g1');
		expect(disconnected.participants.find((p) => p.id === 'g1')?.connected).toBe(false);
	});
});

describe('reconnectParticipant', () => {
	it('참가자를 reconnect 한다', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('g1');
		const reconnected = session
			.addParticipant(guest)
			.disconnectParticipant('g1')
			.reconnectParticipant('g1');
		expect(reconnected.participants.find((p) => p.id === 'g1')?.connected).toBe(true);
	});
});
```

Run: `pnpm test`
Expected: FAIL — removeParticipant, toggleParticipantReady, disconnectParticipant, reconnectParticipant 없음. addParticipant 에러 테스트 중 start() 호출도 실패.

- [ ] **Step 2: 참가자 관리 메서드 구현**

`session.ts`에 메서드 추가:

```typescript
	removeParticipant(participantId: string): Session {
		const exists = this.participants.some((p) => p.id === participantId);
		if (!exists) {
			throw new SessionError('PARTICIPANT_NOT_FOUND');
		}
		const remaining = this.participants.filter((p) => p.id !== participantId);

		if (participantId === this.hostId) {
			const nextHost = remaining.find((p) => p.type === 'HUMAN');
			if (!nextHost) {
				throw new SessionError('NO_HOST_CANDIDATE');
			}
			const promoted = remaining.map((p) =>
				p.id === nextHost.id ? p.promoteToHost() : p
			);
			return new Session({
				id: this.id,
				status: this.status,
				mode: this.mode,
				templateId: this.templateId,
				hostId: nextHost.id,
				participants: promoted.map((p) => ({
					id: p.id, nickname: p.nickname, type: p.type,
					role: p.role, readyStatus: p.readyStatus, connected: p.connected
				})),
				maxParticipants: this.maxParticipants,
				createdAt: this.createdAt
			});
		}

		return this.withParticipants(remaining);
	}

	toggleParticipantReady(participantId: string): Session {
		return this.updateParticipant(participantId, (p) => p.toggleReady());
	}

	disconnectParticipant(participantId: string): Session {
		return this.updateParticipant(participantId, (p) => p.disconnect());
	}

	reconnectParticipant(participantId: string): Session {
		return this.updateParticipant(participantId, (p) => p.reconnect());
	}

	start(): Session {
		if (this.status !== 'WAITING') {
			throw new SessionError('SESSION_NOT_WAITING');
		}
		if (!this.canStart) {
			throw new SessionError('START_CONDITIONS_NOT_MET');
		}
		return this.withStatus('IN_PROGRESS');
	}
```

Note: `start()`도 여기서 stub 구현해둬야 addParticipant 에러 테스트가 통과한다. 전체 상태 전이 테스트는 Task 6에서 진행.

Run: `pnpm test`
Expected: PASS — 전체 통과

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/session/session.ts src/lib/domain/session/__tests__/session.test.ts
git commit -m "기능(session): Session 참가자 관리 구현 및 테스트"
```

---

### Task 6: Session 상태 전이 — TDD

**Files:**

- Modify: `src/lib/domain/session/session.ts`
- Modify: `src/lib/domain/session/__tests__/session.test.ts`

- [ ] **Step 1: 실패 테스트 작성 (start, complete 전이 및 에러)**

`session.test.ts`에 추가:

```typescript
describe('상태 전이', () => {
	it('start()로 WAITING → IN_PROGRESS 전이한다', () => {
		const session = Session.createSolo({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			aiCount: 2
		});
		const started = session.start();
		expect(started.status).toBe('IN_PROGRESS');
	});

	it('canStart가 false이면 start() 실패', () => {
		const session = Session.createMulti({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			maxParticipants: 4
		});
		const guest = createGuest('g1');
		const withGuest = session.addParticipant(guest);
		expect(withGuest.canStart).toBe(false);
		expect(() => withGuest.start()).toThrow(
			expect.objectContaining({ code: 'START_CONDITIONS_NOT_MET' })
		);
	});

	it('WAITING이 아닌 세션에서 start() 실패', () => {
		const session = Session.createSolo({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			aiCount: 1
		}).start();
		expect(() => session.start()).toThrow(expect.objectContaining({ code: 'SESSION_NOT_WAITING' }));
	});

	it('complete()로 IN_PROGRESS → COMPLETED 전이한다', () => {
		const session = Session.createSolo({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			aiCount: 1
		}).start();
		const completed = session.complete();
		expect(completed.status).toBe('COMPLETED');
	});

	it('IN_PROGRESS가 아닌 세션에서 complete() 실패', () => {
		const session = Session.createSolo({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			aiCount: 1
		});
		expect(() => session.complete()).toThrow(
			expect.objectContaining({ code: 'SESSION_NOT_IN_PROGRESS' })
		);
	});

	it('COMPLETED에서 start() 불가', () => {
		const session = Session.createSolo({
			sessionId: 's1',
			mode: 'AUCTION',
			templateId: 't1',
			hostId: 'h1',
			hostNickname: 'Host',
			aiCount: 1
		})
			.start()
			.complete();
		expect(() => session.start()).toThrow(expect.objectContaining({ code: 'SESSION_NOT_WAITING' }));
	});
});
```

Run: `pnpm test`
Expected: FAIL — `complete()` 메서드 없음 (start는 Task 5에서 이미 구현)

- [ ] **Step 2: complete 메서드 구현**

`session.ts`에 추가:

```typescript
	complete(): Session {
		if (this.status !== 'IN_PROGRESS') {
			throw new SessionError('SESSION_NOT_IN_PROGRESS');
		}
		return this.withStatus('COMPLETED');
	}
```

Run: `pnpm test`
Expected: PASS — 전체 통과

- [ ] **Step 3: 타입 체크**

Run: `pnpm check`
Expected: 0 errors

- [ ] **Step 4: 커밋**

```bash
git add src/lib/domain/session/session.ts src/lib/domain/session/__tests__/session.test.ts
git commit -m "기능(session): Session 상태 전이 구현 및 테스트"
```

---

### Task 7: index.ts 작성 및 최종 확인

**Files:**

- Create: `src/lib/domain/session/index.ts`

- [ ] **Step 1: index.ts 작성**

`src/lib/domain/session/index.ts`:

```typescript
export { Session } from './session.ts';
export { Participant } from './participant.ts';
export { SessionError } from './errors.ts';
export type {
	SessionStatus,
	SessionMode,
	ParticipantType,
	ParticipantRole,
	ReadyStatus,
	ParticipantParams,
	SessionParams,
	SoloConfig,
	MultiConfig
} from './types.ts';
export type { SessionErrorCode } from './errors.ts';
```

- [ ] **Step 2: 전체 테스트 + 타입 체크**

Run: `pnpm test && pnpm check`
Expected: 전체 PASS, 0 errors

- [ ] **Step 3: 커밋**

```bash
git add src/lib/domain/session/index.ts
git commit -m "기능(session): 세션 도메인 public API 정리"
```

---

## 검증 방법

1. `pnpm test` — 전체 테스트 통과
2. `pnpm check` — TypeScript 타입 에러 0
3. `pnpm build` — 프로덕션 빌드 성공
4. `git log --oneline` — 7개 커밋 순서 확인
