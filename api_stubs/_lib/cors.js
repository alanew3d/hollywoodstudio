/**
 * CORS helper — allowed origins from CORS_ORIGINS env (comma-separated).
 * Default: hollywoodstudio.ai + vercel.app preview.
 */
const DEFAULT_ORIGINS = [
  'https://hollywoodstudio.ai',
  'https://www.hollywoodstudio.ai',
  'https://hollywoodstudio.vercel.app',
];

export function getAllowedOrigins() {
  const extra = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  return [...new Set([...DEFAULT_ORIGINS, ...extra])];
}

export function setCors(req, res) {
  const allowed = getAllowedOrigins();
  const origin = req.headers.origin;
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.SITE_URL) {
    res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function handleOptions(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}
