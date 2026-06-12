/**
 * HOLLYWOOD STUDIO AI — api/enhance-prompt.js
 * Vercel serverless function: POST /api/enhance-prompt
 *
 * Currently: route handled inside api/index.js consolidated router.
 */
export default async function handler(req, res) {
  res.status(307).json({ message: 'Route handled by api/index.js' });
}
