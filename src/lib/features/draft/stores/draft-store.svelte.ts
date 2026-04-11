// src/lib/features/draft/stores/draft-store.svelte.ts
import { Draft } from '$lib/domain/rule-engine/draft';
import type { DraftConfig } from '$lib/domain/rule-engine/draft-types';
import type { UIPhaseType, CaptainType } from '../types';

class DraftStore {
	draft = $state<Draft>(null!);
	uiPhase = $state<UIPhaseType>('READY');
	endTime = $state<number | null>(null);
	errorCode = $state<string | null>(null);
	captains = $state<CaptainType[]>([]);
	pickBanTime = $state<number>(30);
	positionFilter = $state<string>('ALL');

	/** 현재 차례 팀의 감독 이름 */
	get currentCaptainName(): string | null {
		const teamId = this.draft?.currentTeamId;
		if (!teamId) return null;
		const teamIndex = this.draft.config.teamIds.indexOf(teamId);
		return this.captains[teamIndex]?.name ?? null;
	}

	/** 현재 라운드 */
	get currentRound(): number {
		return this.draft?.currentRound ?? 1;
	}

	/** 완료 여부 */
	get isCompleted(): boolean {
		return this.draft?.isCompleted ?? false;
	}

	/** 총 픽 수 */
	get totalPicks(): number {
		return this.draft?.pickOrder.length ?? 0;
	}

	/** 현재 픽 번호 (1-indexed) */
	get currentPickNumber(): number {
		return (this.draft?.currentPickIndex ?? 0) + 1;
	}

	/** 초기화 */
	init(config: DraftConfig, captains: CaptainType[], pickBanTime: number): void {
		this.draft = Draft.create(config);
		this.captains = captains;
		this.pickBanTime = pickBanTime;
		this.uiPhase = 'READY';
		this.endTime = null;
		this.errorCode = null;
		this.positionFilter = 'ALL';
	}

	/** Draft 인스턴스 교체 (불변 모델이므로 매번 새 인스턴스) */
	updateDraft(next: Draft): void {
		this.draft = next;
	}

	setUIPhase(phase: UIPhaseType): void {
		this.uiPhase = phase;
	}

	setEndTime(endTime: number | null): void {
		this.endTime = endTime;
	}

	setError(code: string | null): void {
		this.errorCode = code;
	}

	setPositionFilter(position: string): void {
		this.positionFilter = position;
	}
}

export const draftStore = new DraftStore();
