/**
 * api/credits/check.js
 * GET /api/credits/check?email=xxx@gmail.com
 * GET /api/credits/check?uid=u_xxx
 *
 * O HTML chama este endpoint depois de um pagamento Stripe para
 * verificar se créditos foram adicionados (via webhook).
 */

import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  const { email, uid } = req.query;
  if (!email && !uid) return res.status(400).json({ error: 'Missing email or uid' });

  try {
    const key = uid ? `credits:uid:${uid}` : `credits:email:${email}`;
    const credits = await kvGet(key);

    if (credits !== null) {
      // Credits found — consume them (delete from KV so they're only granted once)
      await kvDel(key);
      return res.status(200).json({ ok: true, credits: parseInt(credits), consumed: true });
    }

    return res.status(200).json({ ok: true, credits: 0, consumed: false });
  } catch (err) {
    console.error('[credits/check]', err);
    return res.status(500).json({ error: err.message });
  }
}

async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d.result ?? null;
}

async function kvDel(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
