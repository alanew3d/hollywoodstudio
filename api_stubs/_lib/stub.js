import { setCors, handleOptions } from './cors.js';

/**
 * Returns a Vercel serverless handler for endpoints not yet implemented.
 * Always responds safely — no secrets, no fake success for paid actions.
 */
export function createStubHandler(endpoint, opts = {}) {
  const {
    methods = ['GET', 'POST'],
    message,
    status = 501,
  } = opts;

  const defaultMsg = message || `${endpoint} preparado para integração backend (Supabase/Vercel Env).`;

  return async function handler(req, res) {
    setCors(req, res);
    if (handleOptions(req, res)) return;

    if (!methods.includes(req.method)) {
      return res.status(405).json({ ok: false, error: 'Method not allowed', endpoint });
    }

    return res.status(status).json({
      ok: false,
      endpoint,
      status: 'beta',
      message: defaultMsg,
      hint: 'Configure variáveis de ambiente no Vercel e conecte Supabase/Stripe quando disponível.',
    });
  };
}
