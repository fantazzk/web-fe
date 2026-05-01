import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_URL } from './constants.ts';

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
