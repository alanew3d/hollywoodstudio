import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET /api/credits/check' });

  return res.status(200).json({
    ok: true,
    endpoints: { check: '/api/credits/check?email=...' },
    message: 'Créditos gerenciados via webhook Stripe + KV. Usuários não podem auto-adicionar.',
  });
}
