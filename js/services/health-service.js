/**
 * HOLLYWOOD STUDIO AI — health-service.js
 * Production health checks for the admin Health Check page.
 */

const HEALTH_CHECKS = [
  // SUPABASE
  { id:'sb-url',  cat:'SUPABASE', label:'SUPABASE_URL configurada',
    test: ()=>!!(window.CFG&&window.CFG.SUPABASE_URL&&window.CFG.SUPABASE_URL.includes('supabase.co')),
    hint: 'Adicione SUPABASE_URL em config.js (valor público, sem service role)' },
  { id:'sb-anon', cat:'SUPABASE', label:'SUPABASE_ANON_KEY configurada',
    test: ()=>!!(window.CFG&&window.CFG.SUPABASE_ANON_KEY&&window.CFG.SUPABASE_ANON_KEY.length>20),
    hint: 'Adicione SUPABASE_ANON_KEY em config.js' },
  { id:'sb-auth', cat:'SUPABASE', label:'Conexão auth básica',
    test: async ()=>{
      try { if(!window._supabaseClient) return false;
        const {data,error}=await window._supabaseClient.auth.getSession();
        return !error; } catch{return false;} },
    async: true,
    hint: 'Verifique SUPABASE_URL e SUPABASE_ANON_KEY' },

  // STRIPE
  { id:'stripe-checkout', cat:'STRIPE', label:'Endpoint /api/create-checkout-session',
    test: async ()=>{
      try { const r=await fetch('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}); return r.status!==404; }
      catch{return false;} },
    async: true,
    hint: 'Arquivo api/create-checkout-session.js não encontrado' },
  { id:'stripe-webhook', cat:'STRIPE', label:'Endpoint /api/stripe-webhook',
    test: async ()=>{
      try { const r=await fetch('/api/stripe-webhook',{method:'POST',body:''}); return r.status!==404; }
      catch{return false;} },
    async: true,
    hint: 'Arquivo api/stripe-webhook.js não encontrado' },

  // AUTH
  { id:'auth-visitor', cat:'AUTH', label:'Modo visitante funcional',
    test: ()=>typeof window.go==='function', hint: 'Função go() não encontrada — verifique o app' },
  { id:'auth-admin', cat:'AUTH', label:'Admin configurado',
    test: ()=>!!(window.CFG&&window.CFG.ADMIN_PASS&&window.CFG.ADMIN_PASS.length>=6),
    hint: 'Configure ADMIN_PASS no config.js' },
  { id:'auth-recovery', cat:'AUTH', label:'Recovery mode (deve estar OFF em prod)',
    test: ()=>!window.CFG?.ADMIN_RECOVERY_MODE,
    hint: '⚠️ ADMIN_RECOVERY_MODE está ativo — desative antes de lançar', warnOnOk: false },

  // SEO
  { id:'seo-og', cat:'SEO', label:'og:image aponta para hero',
    test: ()=>{const m=document.querySelector('meta[property="og:image"]');return !!(m&&m.content&&m.content.includes('hero-hollywoodstudio-ai'));},
    hint: 'Atualize og:image para hero-hollywoodstudio-ai.jpg' },
  { id:'seo-favicon', cat:'SEO', label:'Favicon configurado',
    test: ()=>!!document.querySelector('link[rel*="icon"]'),
    hint: 'Adicione link rel="icon" no head do index.html' },

  // GERAÇÃO (IA)
  { id:'ai-openai', cat:'GERAÇÃO IA', label:'OpenAI configurado (backend)',
    test: async ()=>{ try{const r=await fetch('/api/health/details');if(!r.ok)return false;const d=await r.json();return !!d.openai;}catch{return false;}},
    async: true,
    hint: 'Configure OPENAI_API_KEY nas env vars da Vercel' },
  { id:'ai-claude', cat:'GERAÇÃO IA', label:'Claude configurado (backend)',
    test: async ()=>{ try{const r=await fetch('/api/health/details');if(!r.ok)return false;const d=await r.json();return !!d.claude;}catch{return false;}},
    async: true,
    hint: 'Configure ANTHROPIC_API_KEY nas env vars da Vercel' },
];

if (typeof window !== 'undefined') window.HEALTH_CHECKS = HEALTH_CHECKS;
