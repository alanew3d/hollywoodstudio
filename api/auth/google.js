/**
 * api/auth/google.js
 * Vercel Serverless Function — valida token Google e retorna sessão do usuário.
 * POST /api/auth/google  { credential: "<google jwt>" }
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Missing credential' });

    // Decode the Google JWT (we verify with Google's tokeninfo endpoint)
    const verifyRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    const payload = await verifyRes.json();

    if (!verifyRes.ok || payload.error) {
      return res.status(401).json({ error: 'Invalid Google token', detail: payload.error });
    }

    // Check audience matches your client ID
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId && payload.aud !== clientId) {
      return res.status(401).json({ error: 'Token audience mismatch' });
    }

    // Build user object (same shape the HTML expects)
    const user = {
      uid:      payload.sub,
      email:    payload.email,
      name:     payload.name,
      picture:  payload.picture,
      admin:    false,
      provider: 'google',
      verified: payload.email_verified === 'true' || payload.email_verified === true,
    };

    // Check if email is admin
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    if (adminEmails.includes(user.email)) user.admin = true;

    // Optional: save to KV or database here
    // For now: return user — HTML stores in localStorage

    return res.status(200).json({ user, ok: true });

  } catch (err) {
    console.error('[auth/google]', err);
    return res.status(500).json({ error: 'Internal error', message: err.message });
  }
}
