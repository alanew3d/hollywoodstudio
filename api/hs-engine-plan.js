/**
 * HOLLYWOOD STUDIO AI — api/hs-engine-plan.js
 * Vercel serverless function: POST /api/ailan/generate
 * Generates an audiovisual production plan using Claude or Gemini.
 * Falls back to local plan generation if no API key is configured.
 *
 * Currently: stub route in api/index.js returning { ok:true, source:'local' }
 */
export default async function handler(req, res) {
  res.status(307).json({ message: 'Route handled by api/index.js at /api/ailan/generate' });
}
