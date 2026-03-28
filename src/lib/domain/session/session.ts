import type { SessionMode, SessionStatus } from './types.ts';
import { SessionError } from './errors.ts';
import { Participant } from './participant.ts';

interface SessionState {
	readonly id: string;
	readonly status: SessionStatus;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly participants: readonly Participant[];
	readonly maxParticipants: number;
	readonly createdAt: Date;
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

export class Session {
	readonly id: string;
	readonly status: SessionStatus;
	readonly mode: SessionMode;
	readonly templateId: string;
	readonly hostId: string;
	readonly participants: readonly Participant[];
	readonly maxParticipants: number;
	readonly createdAt: Date;

	constructor(state: SessionState) {
		this.id = state.id;
		this.status = state.status;
		this.mode = state.mode;
		this.templateId = state.templateId;
		this.hostId = state.hostId;
		this.participants = state.participants;
		this.maxParticipants = state.maxParticipants;
		this.createdAt = state.createdAt;
	}

	static createSolo(config: SoloConfig): Session {
		const host = new Participant({
			id: config.hostId,
			nickname: config.hostNickname,
			type: 'HUMAN',
			role: 'HOST'
		});

		const aiParticipants: Participant[] = [];
		for (let i = 0; i < config.aiCount; i++) {
			aiParticipants.push(
				new Participant({
					id: `ai-${i + 1}`,
					nickname: `AI ${i + 1}`,
					type: 'AI',
					role: 'GUEST'
				})
			);
		}

		return new Session({
			id: config.sessionId,
			status: 'WAITING',
			mode: config.mode,
			templateId: config.templateId,
			hostId: config.hostId,
			participants: [host, ...aiParticipants],
			maxParticipants: 1 + config.aiCount,
			createdAt: new Date()
		});
	}

	static createMulti(config: MultiConfig): Session {
		const host = new Participant({
			id: config.hostId,
			nickname: config.hostNickname,
			type: 'HUMAN',
			role: 'HOST'
		});

		return new Session({
			id: config.sessionId,
			status: 'WAITING',
			mode: config.mode,
			templateId: config.templateId,
			hostId: config.hostId,
			participants: [host],
			maxParticipants: config.maxParticipants,
			createdAt: new Date()
		});
	}

	get host(): Participant {
		const found = this.participants.find((p) => p.id === this.hostId);
		if (!found) {
			throw new SessionError('PARTICIPANT_NOT_FOUND', `Host ${this.hostId} not found`);
		}
		return found;
	}

	get humanCount(): number {
		return this.participants.filter((p) => p.type === 'HUMAN').length;
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

	get canStart(): boolean {
		return this.allReady && this.participants.length >= 2;
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

	removeParticipant(participantId: string): Session {
		const participant = this.participants.find((p) => p.id === participantId);
		if (!participant) {
			throw new SessionError('PARTICIPANT_NOT_FOUND');
		}

		const remaining = this.participants.filter((p) => p.id !== participantId);

		if (participantId === this.hostId) {
			const nextHost = remaining.find((p) => p.type === 'HUMAN');
			if (!nextHost) {
				throw new SessionError('NO_HOST_CANDIDATE');
			}
			const promoted = nextHost.promoteToHost();
			const updatedParticipants = remaining.map((p) => (p.id === nextHost.id ? promoted : p));
			return new Session({
				...this.toState(),
				hostId: nextHost.id,
				participants: updatedParticipants
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

	complete(): Session {
		if (this.status !== 'IN_PROGRESS') {
			throw new SessionError('SESSION_NOT_IN_PROGRESS');
		}
		return this.withStatus('COMPLETED');
	}

	private toState(): SessionState {
		return {
			id: this.id,
			status: this.status,
			mode: this.mode,
			templateId: this.templateId,
			hostId: this.hostId,
			participants: this.participants,
			maxParticipants: this.maxParticipants,
			createdAt: this.createdAt
		};
	}

	private withParticipants(participants: readonly Participant[]): Session {
		return new Session({ ...this.toState(), participants });
	}

	private updateParticipant(
		participantId: string,
		updater: (p: Participant) => Participant
	): Session {
		const participant = this.participants.find((p) => p.id === participantId);
		if (!participant) {
			throw new SessionError('PARTICIPANT_NOT_FOUND');
		}
		const updated = updater(participant);
		return this.withParticipants(
			this.participants.map((p) => (p.id === participantId ? updated : p))
		);
	}

	private withStatus(status: SessionStatus): Session {
		return new Session({ ...this.toState(), status });
	}
}
