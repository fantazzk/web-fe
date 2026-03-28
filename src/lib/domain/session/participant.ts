import type { ParticipantParams, ParticipantRole, ParticipantType, ReadyStatus } from './types.ts';
import { SessionError } from './errors.ts';

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
}
