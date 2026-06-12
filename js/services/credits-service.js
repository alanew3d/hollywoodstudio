/**
 * HOLLYWOOD STUDIO AI — credits-service.js
 * Credit balance management with Supabase backend and localStorage fallback.
 */

const CREDIT_COSTS = {
  seedance_fast_8s:  3,
  seedance_2_8s:     6,
  kling_3_5s:        4,
  kling_3_omni_5s:   5,
  veo_3_8s:          8,
  image_standard:    2,
  image_premium:     4,
  upscale_4k:        5,
  remove_bg:         2,
  lipsync:           3,
};

async function getUserCredits() {
  try {
    if (window.S && window.S.user && window.S.user.uid && window._supabaseClient) {
      const { data } = await window._supabaseClient
        .from('profiles')
        .select('credits,plan')
        .eq('id', window.S.user.uid)
        .single();
      if (data) return data;
    }
  } catch (e) { console.warn('[credits-service] Supabase unavailable, using localStorage fallback'); }
  const credits = parseInt(localStorage.getItem('hsai_credits') || '3', 10);
  return { credits, plan: 'free' };
}

async function updateCreditsUI() {
  const { credits, plan } = await getUserCredits();
  const els = document.querySelectorAll('[data-credits-display]');
  els.forEach(el => { el.textContent = credits; });
  const planEls = document.querySelectorAll('[data-plan-display]');
  planEls.forEach(el => { el.textContent = plan; });
  if (window.S) { window.S.credits = credits; window.S.plan = plan; }
  return credits;
}

function estimateGenerationCost(type, modelId, durationSec, quality) {
  const key = `${modelId}_${durationSec}s`;
  if (CREDIT_COSTS[key]) return CREDIT_COSTS[key];
  if (type === 'video') return Math.ceil((durationSec || 5) * 0.6);
  if (type === 'image') return quality === 'premium' ? 4 : 2;
  return 2;
}

async function debitCredits(amount, reason, metadata) {
  try {
    if (window.S && window.S.user && window.S.user.uid && window._supabaseClient) {
      const { data: profile } = await window._supabaseClient
        .from('profiles').select('credits').eq('id', window.S.user.uid).single();
      const newBalance = (profile?.credits || 0) - amount;
      if (newBalance < 0) throw new Error('Saldo insuficiente');
      await window._supabaseClient.from('profiles')
        .update({ credits: newBalance }).eq('id', window.S.user.uid);
      await window._supabaseClient.from('credit_transactions').insert({
        user_id: window.S.user.uid, type: 'debit', amount: -amount, reason, metadata: metadata || {},
      });
      return newBalance;
    }
  } catch (e) { console.warn('[debitCredits]', e.message); }
  const cur = parseInt(localStorage.getItem('hsai_credits') || '3', 10);
  const next = Math.max(0, cur - amount);
  localStorage.setItem('hsai_credits', next);
  return next;
}

async function registerGenerationLog(payload) {
  try {
    if (window.S && window.S.user && window.S.user.uid && window._supabaseClient) {
      await window._supabaseClient.from('generation_logs').insert({
        user_id: window.S.user.uid,
        ...payload,
      });
    }
  } catch (e) { console.warn('[registerGenerationLog]', e.message); }
}

if (typeof window !== 'undefined') {
  window.getUserCredits = getUserCredits;
  window.updateCreditsUI = updateCreditsUI;
  window.estimateGenerationCost = estimateGenerationCost;
  window.debitCredits = debitCredits;
  window.registerGenerationLog = registerGenerationLog;
}