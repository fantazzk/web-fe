import type { IconName } from './Icon.svelte';

export type NavActionType = 'SETTINGS';

export interface NavItemType {
	readonly icon: IconName;
	readonly label: string;
	readonly href?: string;
	readonly action?: NavActionType;
	readonly disabled?: boolean;
}

export const NAV_ITEMS: readonly NavItemType[] = [
	{ icon: 'file-text', label: '템플릿 만들기', href: '/templates/create' },
	{ icon: 'layout-grid', label: '대시보드', disabled: true },
	{ icon: 'trending-up', label: '트렌드', disabled: true },
	{ icon: 'settings', label: '설정', action: 'SETTINGS' }
] as const;

export const FOOTER_ITEM: NavItemType = {
	icon: 'file-check',
	label: '약관',
	disabled: true
} as const;
