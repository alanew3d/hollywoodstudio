import { setCors, handleOptions } from '../_lib/cors.js';

const PAGES = [
  '/', '/studio', '/modelos', '/templates', '/galeria', '/planos',
  '/academy', '/noticias', '/festivais', '/oportunidades',
];

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  const base = process.env.SITE_URL || 'https://hollywoodstudio.ai';
  const urls = PAGES.map(p => ({ loc: base + (p === '/' ? '' : p), changefreq: 'weekly', priority: p === '/' ? 1 : 0.8 }));

  return res.status(200).json({ ok: true, urls, staticFile: '/sitemap.xml' });
}
