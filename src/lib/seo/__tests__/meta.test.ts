import { describe, it, expect } from 'bun:test';
import { buildMeta } from '../meta.ts';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_URL } from '../constants.ts';

describe('buildMeta', () => {
	it('입력이 없으면 기본값을 그대로 반환한다', () => {
		const meta = buildMeta();
		expect(meta.title).toBe(DEFAULT_TITLE);
		expect(meta.description).toBe(DEFAULT_DESCRIPTION);
		expect(meta.canonical).toBe(`${SITE_URL}/`);
		expect(meta.image).toBe(DEFAULT_OG_IMAGE);
	});

	it('title과 description 오버라이드를 반영한다', () => {
		const meta = buildMeta({ title: '템플릿 — FANTAZZK', description: '대회 템플릿 모음' });
		expect(meta.title).toBe('템플릿 — FANTAZZK');
		expect(meta.description).toBe('대회 템플릿 모음');
	});

	it('path로부터 canonical URL을 만든다', () => {
		const meta = buildMeta({ path: '/templates/create' });
		expect(meta.canonical).toBe(`${SITE_URL}/templates/create`);
	});

	it('image가 없으면 기본 OG 이미지를 사용한다', () => {
		const meta = buildMeta({ path: '/result/abc' });
		expect(meta.image).toBe(DEFAULT_OG_IMAGE);
	});

	it('image 오버라이드를 반영한다', () => {
		const meta = buildMeta({ image: 'https://fantazzk.com/og-result.png' });
		expect(meta.image).toBe('https://fantazzk.com/og-result.png');
	});
});
