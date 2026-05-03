export const SITE_URL = 'https://fantazzk.com';
export const BRAND = 'FANTAZZK';
export const DEFAULT_TITLE = 'FANTAZZK — 자낳대·치지직 대회 모의 드래프트/경매 시뮬레이터';
export const DEFAULT_DESCRIPTION =
	'자낳대 모의경매부터 치지직컵 드래프트까지, e스포츠 모의 드래프트 시뮬레이터. ' +
	'친구들과 실시간으로, 템플릿 하나로 30초 만에 시작하세요.';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export type MetaInputType = {
	title?: string;
	description?: string;
	path?: string;
	image?: string;
};

export type MetaType = {
	title: string;
	description: string;
	canonical: string;
	image: string;
};

export function buildMeta(input: MetaInputType = {}): MetaType {
	const path = input.path ?? '/';
	return {
		title: input.title ?? DEFAULT_TITLE,
		description: input.description ?? DEFAULT_DESCRIPTION,
		canonical: `${SITE_URL}${path}`,
		image: input.image ?? DEFAULT_OG_IMAGE
	};
}
