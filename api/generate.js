export const config = { runtime: 'edge' };

// Modelos disponíveis via OpenRouter (verificados)
const OR_MODELS = {
  // CHAT
  'gemini-2.5-flash':   { type:'chat', orModel:'google/gemini-2.5-flash' },
  'gemini-2.5-pro':     { type:'chat', orModel:'google/gemini-2.5-pro' },
  'gpt-4o':             { type:'chat', orModel:'openai/gpt-4o' },
  'gpt-4o-mini':        { type:'chat', orModel:'openai/gpt-4o-mini' },
  'claude-sonnet-4-6':  { type:'chat', orModel:'anthropic/claude-sonnet-4-5' },
  'grok-3':             { type:'chat', orModel:'x-ai/grok-3-fast' },
  'grok-3-mini':        { type:'chat', orModel:'x-ai/grok-3-mini-fast' },
  // IMAGEM via OpenRouter (modelos confirmados)
  'gemini-image':       { type:'image', orModel:'google/gemini-2.5-flash-image' },
  'gemini-image-pro':   { type:'image', orModel:'google/gemini-3.1-flash-image' },
  'gpt-image-or':       { type:'image', orModel:'openai/gpt-5-image-mini' },
  'gpt-image-or-pro':   { type:'image', orModel:'openai/gpt-5-image' },
};

// Modelos com providers diretos (quando key disponível)
const DIRECT_MODELS = {
  // OpenAI direto
  'gpt-image-1':      { provider:'openai', type:'image' },
  'dall-e-3':         { provider:'openai', type:'image' },
  'gpt-4o-direct':    { provider:'openai', type:'chat' },
  // Google direto
  'imagen-3':         { provider:'google', type:'image' },
  'veo-3':            { provider:'google', type:'video' },
  // BytePlus direto
  'seedance-2.5':     { provider:'byteplus', type:'video', model:'video-02' },
  'seedance-2':       { provider:'byteplus', type:'video', model:'video-01' },
  // fal.ai direto
  'flux-pro':         { provider:'fal', type:'image', falModel:'fal-ai/flux-pro' },
  'flux-pro-ultra':   { provider:'fal', type:'image', falModel:'fal-ai/flux-pro/v1.1-ultra' },
  'nano-banana-pro':  { provider:'fal', type:'image', falModel:'fal-ai/flux/dev' },
  'minimax-h3':       { provider:'fal', type:'video', falModel:'fal-ai/minimax/video-01-live' },
  'kling-3':          { provider:'fal', type:'video', falModel:'fal-ai/kling-video/v1.6/pro/text-to-video' },
  'wan-3':            { provider:'fal', type:'video', falModel:'fal-ai/wan/v2.2/t2v' },
  'wan-2.7':          { provider:'fal', type:'video', falModel:'fal-ai/wan/v2.1/t2v' },
  // xAI direto
  'grok-image-2':     { provider:'xai', type:'image' },
};

function agentRecommend(prompt, genType) {
  const p = prompt.toLowerCase();
  const hasOR = true; // assumido ativo

  if (genType === 'video') {
    return {
      model: 'seedance-2.5',
      reason: 'Seedance 2.5 — melhor cinemática. Requer BytePlus key.',
      alternatives: ['minimax-h3','kling-3','wan-3'],
      type: 'video'
    };
  }

  if (genType === 'chat') {
    const isCode = /código|code|programa|script|debug/.test(p);
    return {
      model: isCode ? 'claude-sonnet-4-6' : 'gemini-2.5-flash',
      reason: isCode ? 'Claude Sonnet — excelente para código.' : 'Gemini 2.5 Flash — rápido e preciso.',
      alternatives: ['gpt-4o','grok-3','gemini-2.5-pro'],
      type: 'chat'
    };
  }

  // imagem (padrão)
  return {
    model: 'gemini-image',
    reason: 'Gemini Image via OpenRouter — disponível agora com sua key.',
    alternatives: ['gpt-image-or','gemini-image-pro','gpt-image-or-pro'],
    type: 'image'
  };
}

// ── OPENROUTER ────────────────────────────────────────
async function callOR(orModel, type, prompt, options) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada');

  const headers = {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://hollywoodstudio.ai',
    'X-Title': 'Hollywood Studio AI'
  };

  if (type === 'chat') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:'POST', headers,
      body: JSON.stringify({ model: orModel, messages:[{role:'user',content:prompt}] })
    });
    const text = await res.text();
    let d; try { d = JSON.parse(text); } catch(e) { throw new Error('OpenRouter retornou resposta inválida'); }
    if (!res.ok) throw new Error(d.error?.message || 'OpenRouter chat error');
    return { type:'chat', text: d.choices[0].message.content, provider:'OpenRouter / '+orModel };
  }

  if (type === 'image') {
    // Modelos de imagem do OpenRouter usam chat/completions com output de imagem
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method:'POST', headers,
      body: JSON.stringify({
        model: orModel,
        messages: [{ role:'user', content: prompt }],
      })
    });
    const text = await res.text();
    let d; try { d = JSON.parse(text); } catch(e) { throw new Error('OpenRouter retornou resposta inválida: '+text.slice(0,100)); }
    if (!res.ok) throw new Error(d.error?.message || 'OpenRouter image error');

    const content = d.choices?.[0]?.message?.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block.type === 'image_url') return { type:'image', url: block.image_url?.url || block.image_url, provider:'OpenRouter / '+orModel };
        if (block.type === 'image')     return { type:'image', url: block.source?.url || block.url, provider:'OpenRouter / '+orModel };
      }
    }
    if (typeof content === 'string') {
      const mdImg = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
      if (mdImg) return { type:'image', url: mdImg[1], provider:'OpenRouter / '+orModel };
      const urlMatch = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|webp)/i);
      if (urlMatch) return { type:'image', url: urlMatch[0], provider:'OpenRouter / '+orModel };
      // retorna como texto se não achou imagem
      return { type:'chat', text: content, provider:'OpenRouter / '+orModel };
    }
    throw new Error('OpenRouter não retornou imagem para '+orModel);
  }
}

// ── OPENAI DIRETO ─────────────────────────────────────
async function callOpenAI(route, prompt, options) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY não configurada');
  if (route.type === 'image') {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body: JSON.stringify({ model:'dall-e-3', prompt, n:1, size:'1024x1024' })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'OpenAI error');
    return { type:'image', url: d.data[0].url, provider:'OpenAI' };
  }
  if (route.type === 'chat') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body: JSON.stringify({ model:'gpt-4o', messages:[{role:'user',content:prompt}] })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'OpenAI error');
    return { type:'chat', text: d.choices[0].message.content, provider:'OpenAI' };
  }
}

// ── GOOGLE DIRETO ─────────────────────────────────────
async function callGoogle(route, prompt, options) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY não configurada');
  if (route.type === 'chat') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}] })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'Google error');
    return { type:'chat', text: d.candidates[0].content.parts[0].text, provider:'Google' };
  }
  if (route.type === 'image') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ instances:[{prompt}], parameters:{ sampleCount:1, aspectRatio: options.ratio||'1:1' } })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'Google Imagen error');
    return { type:'image', url:`data:image/png;base64,${d.predictions[0].bytesBase64Encoded}`, provider:'Google / Imagen' };
  }
}

// ── XAI DIRETO ────────────────────────────────────────
async function callXAI(route, prompt, options) {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY não configurada');
  if (route.type === 'image') {
    const res = await fetch('https://api.x.ai/v1/images/generations',{
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body: JSON.stringify({ model:'grok-2-image-1212', prompt, n:1 })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'xAI error');
    return { type:'image', url: d.data[0].url, provider:'xAI / Grok' };
  }
}

// ── FAL.AI DIRETO ─────────────────────────────────────
async function callFal(route, prompt, options) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY não configurada');
  const res = await fetch(`https://fal.run/${route.falModel}`,{
    method:'POST',
    headers:{'Authorization':`Key ${key}`,'Content-Type':'application/json'},
    body: JSON.stringify({ prompt, ...(route.type==='video'&&{duration:5,aspect_ratio:options.ratio||'16:9'}), ...(route.type==='image'&&{image_size:'square_hd',num_images:1}) })
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.detail||d.error||'fal.ai error');
  if (route.type==='image') return { type:'image', url: d.images?.[0]?.url, provider:'fal.ai' };
  const url = d.video?.url; if (url) return { type:'video', url, provider:'fal.ai' };
  return { type:'video_task', taskId: d.request_id, provider:'fal.ai' };
}

// ── BYTEPLUS DIRETO ───────────────────────────────────
async function callByteplus(route, prompt, options) {
  const key = process.env.BYTEPLUS_API_KEY;
  if (!key) throw new Error('BYTEPLUS_API_KEY não configurada');
  const res = await fetch('https://ark.ap-southeast.byteplusi.com/api/v3/contents/generations/tasks',{
    method:'POST',
    headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
    body: JSON.stringify({ model: route.model||'video-01', content:[{type:'text',text:prompt}], parameters:{duration:5,resolution:'720p',aspect_ratio:options.ratio||'16:9'} })
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error?.message||'BytePlus error');
  return { type:'video_task', taskId: d.id, provider:'BytePlus / Seedance' };
}

// ── ROUTER PRINCIPAL ──────────────────────────────────
async function routeGeneration(modelId, prompt, options) {
  // 1. Tenta OpenRouter primeiro (modelos diretos do OR)
  if (OR_MODELS[modelId]) {
    const orRoute = OR_MODELS[modelId];
    return callOR(orRoute.orModel, orRoute.type, prompt, options);
  }

  // 2. Tenta provider direto
  const direct = DIRECT_MODELS[modelId];
  if (!direct) throw new Error(`Modelo "${modelId}" não encontrado`);

  const hasKey = {
    openai:    !!process.env.OPENAI_API_KEY,
    google:    !!process.env.GOOGLE_API_KEY,
    xai:       !!process.env.XAI_API_KEY,
    byteplus:  !!process.env.BYTEPLUS_API_KEY,
    fal:       !!process.env.FAL_KEY,
  };

  if (!hasKey[direct.provider]) {
    throw new Error(`${direct.provider.toUpperCase()} key não configurada no Vercel. Configure ${direct.provider.toUpperCase()}_API_KEY em Settings → Environment Variables.`);
  }

  switch(direct.provider) {
    case 'openai':   return callOpenAI(direct, prompt, options);
    case 'google':   return callGoogle(direct, prompt, options);
    case 'xai':      return callXAI(direct, prompt, options);
    case 'fal':      return callFal(direct, prompt, options);
    case 'byteplus': return callByteplus(direct, prompt, options);
  }
}

// ── HANDLER PRINCIPAL ─────────────────────────────────
export default async function handler(req) {
  if (req.method === 'OPTIONS') return ok(null, 200);
  if (req.method !== 'POST') return ok({error:'Method not allowed'}, 405);

  const auth = req.headers.get('authorization')||'';
  const token = auth.replace('Bearer ','');
  if (!['hs-local-token', process.env.API_SECRET||'hs-token'].includes(token))
    return ok({ok:false,error:'Unauthorized'}, 401);

  try {
    const body = await req.json();
    const { action, prompt, model, options={}, genType='image' } = body;

    if (action === 'recommend') {
      return ok({ ok:true, recommendation: agentRecommend(prompt, genType) });
    }

    if (action === 'models') {
      const hasOR = !!process.env.OPENROUTER_API_KEY;
      const providers = [];
      if (!!process.env.OPENAI_API_KEY)    providers.push('openai');
      if (!!process.env.GOOGLE_API_KEY)    providers.push('google');
      if (!!process.env.XAI_API_KEY)       providers.push('xai');
      if (!!process.env.BYTEPLUS_API_KEY)  providers.push('byteplus');
      if (!!process.env.FAL_KEY)           providers.push('fal');
      if (hasOR)                           providers.push('openrouter');

      // Modelos disponíveis
      const available = [];
      if (hasOR) {
        Object.entries(OR_MODELS).forEach(([id,r]) => available.push({id, type:r.type, provider:'openrouter', name: getModelName(id)}));
      }
      Object.entries(DIRECT_MODELS).forEach(([id,r]) => {
        if (providers.includes(r.provider)) available.push({id, type:r.type, provider:r.provider, name: getModelName(id)});
      });

      return ok({ ok:true, providers, models: available });
    }

    if (action === 'generate') {
      if (!prompt) return ok({error:'Prompt obrigatório'}, 400);
      if (!model)  return ok({error:'Modelo obrigatório'}, 400);
      const result = await routeGeneration(model, prompt, options);
      return ok({ ok:true, result });
    }

    return ok({error:'Action inválida'}, 400);
  } catch(e) {
    return ok({ ok:false, error: e.message }, 500);
  }
}

function getModelName(id) {
  const names = {
    'gemini-image':'Gemini Image', 'gemini-image-pro':'Gemini Image Pro',
    'gpt-image-or':'GPT-5 Image Mini', 'gpt-image-or-pro':'GPT-5 Image',
    'gemini-2.5-flash':'Gemini 2.5 Flash', 'gemini-2.5-pro':'Gemini 2.5 Pro',
    'gpt-4o':'GPT-4o', 'gpt-4o-mini':'GPT-4o Mini', 'claude-sonnet-4-6':'Claude Sonnet',
    'grok-3':'Grok 3', 'grok-3-mini':'Grok 3 Mini',
    'gpt-image-1':'GPT Image 1', 'imagen-3':'Imagen 3',
    'seedance-2.5':'Seedance 2.5', 'seedance-2':'Seedance 2',
    'flux-pro':'Flux Pro', 'flux-pro-ultra':'Flux Pro Ultra', 'nano-banana-pro':'Nano Banana Pro',
    'minimax-h3':'MiniMax H3', 'kling-3':'Kling 3', 'wan-3':'Wan 3', 'wan-2.7':'Wan 2.7',
    'veo-3':'Veo 3', 'grok-image-2':'Grok Image 2',
  };
  return names[id] || id;
}

function ok(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
  });
}
