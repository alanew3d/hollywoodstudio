/**
 * HOLLYWOOD STUDIO AI — services/ai-service.js
 * Abstraction layer for AI provider calls (OpenAI, Claude, Gemini).
 *
 * Functions: callEnhancePrompt(), callCreativeBoard(), callHSEnginePlan()
 * Routes through HsaiBackend → /api/* endpoints.
 * Always has a local fallback when no API is configured.
 *
 * Currently: HsaiBackend module in index.html.
 */
