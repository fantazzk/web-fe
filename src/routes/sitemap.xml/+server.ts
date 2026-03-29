import type { RequestHandler } from './$types';

const SITE_URL = 'https://fantazzk-rho.vercel.app';

// TODO: Phase 2 — Supabase 연동 후 공개 결과 페이지 URL을 DB에서 조회하여 동적 추가
const staticPages = [
	{ loc: '/', changefreq: 'daily', priority: '1.0' },
	{ loc: '/templates/create', changefreq: 'monthly', priority: '0.6' }
];

export const GET: RequestHandler = async () => {
	const urls = staticPages
		.map(
			(page) => `
  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
		)
		.join('');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

	return new Response(xml.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600'
		}
	});
};
