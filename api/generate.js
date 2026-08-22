export const config = { runtime: 'edge' };

const MODEL_ROUTES = {
  // ── VÍDEO fal.ai ──────────────────────────────────────
  'minimax-h3':      { provider:'fal', type:'video', falModel:'fal-ai/minimax/video-01-live' },
  'hailuo-2':        { provider:'fal', type:'video', falModel:'fal-ai/minimax/video-01' },
  'kling-3':         { provider:'fal', type:'video', falModel:'fal-ai/kling-video/v1.6/pro/text-to-video' },
  'kling-3-pro':     { provider:'fal', type:'video', falModel:'fal-ai/kling-video/v1.6/pro/text-to-video' },
  'wan-3':           { provider:'fal', type:'video', falModel:'fal-ai/wan/v2.2/t2v' },
  'wan-2.7':         { provider:'fal', type:'video', falModel:'fal-ai/wan/v2.1/t2v' },
  'ltx-video':       { provider:'fal', type:'video', falModel:'fal-ai/ltx-video' },
  'runway-gen4':     { provider:'fal', type:'video', falModel:'fal-ai/runway-gen4/turbo/text-to-video' },
  // ── VÍDEO BytePlus ────────────────────────────────────
  'seedance-2':      { provider:'byteplus', type:'video', model:'video-01' },
  'seedance-2.5':    { provider:'byteplus', type:'video', model:'video-02' },
  // ── VÍDEO Google ──────────────────────────────────────
  'veo-3':           { provider:'google', type:'video', model:'veo-003' },
  'veo-2':           { provider:'google', type:'video', model:'veo-002' },
  // ── VÍDEO xAI ─────────────────────────────────────────
  'grok-video':      { provider:'xai', type:'video' },
  // ── IMAGEM OpenAI ─────────────────────────────────────
  'gpt-image-1':     { provider:'openai', type:'image', model:'gpt-image-1' },
  'gpt-image-2':     { provider:'openai', type:'image', model:'dall-e-3' },
  'dall-e-3':        { provider:'openai', type:'image', model:'dall-e-3' },
  // ── IMAGEM fal.ai ─────────────────────────────────────
  'nano-banana-pro': { provider:'fal', type:'image', falModel:'fal-ai/flux/dev' },
  'nano-banana-2':   { provider:'fal', type:'image', falModel:'fal-ai/flux/schnell' },
  'flux-pro-ultra':  { provider:'fal', type:'image', falModel:'fal-ai/flux-pro/v1.1-ultra' },
  'flux-pro':        { provider:'fal', type:'image', falModel:'fal-ai/flux-pro' },
  'flux-dev':        { provider:'fal', type:'image', falModel:'fal-ai/flux/dev' },
  'ideogram-v3':     { provider:'fal', type:'image', falModel:'fal-ai/ideogram/v3' },
  'recraft-v3':      { provider:'fal', type:'image', falModel:'fal-ai/recraft-v3' },
  // ── IMAGEM Google ─────────────────────────────────────
  'imagen-3':        { provider:'google', type:'image' },
  // ── IMAGEM xAI ────────────────────────────────────────
  'grok-image-2':    { provider:'xai', type:'image' },
  // ── IMAGEM BytePlus ───────────────────────────────────
  'seedream':        { provider:'byteplus', type:'image' },
  // ── CHAT via OpenRouter (fallback automático) ─────────
  'gemini-2.5-flash':{ provider:'openrouter', type:'chat', orModel:'google/gemini-2.5-flash' },
  'gemini-2.5-pro':  { provider:'openrouter', type:'chat', orModel:'google/gemini-2.5-pro' },
  'gpt-4o':          { provider:'openrouter', type:'chat', orModel:'openai/gpt-4o' },
  'gpt-4o-mini':     { provider:'openrouter', type:'chat', orModel:'openai/gpt-4o-mini' },
  'claude-sonnet-4-6':{ provider:'openrouter', type:'chat', orModel:'anthropic/claude-sonnet-4-5' },
  'grok-3':          { provider:'openrouter', type:'chat', orModel:'x-ai/grok-3-fast' },
  'grok-3-mini':     { provider:'openrouter', type:'chat', orModel:'x-ai/grok-3-mini-fast' },
  // ── CHAT direto ───────────────────────────────────────
  'gpt-4o-direct':   { provider:'openai', type:'chat' },
  'grok-3-direct':   { provider:'xai',    type:'chat' },
  'gemini-direct':   { provider:'google', type:'chat', model:'gemini-2.5-flash' },
};



// Mapa global de fallback OpenRouter
const OR_FALLBACK = {
  'gemini-2.5-flash': 'google/gemini-2.5-flash',
  'gemini-2.5-pro':   'google/gemini-2.5-pro',
  'gpt-4o':           'openai/gpt-4o',
  'gpt-4o-mini':      'openai/gpt-4o-mini',
  'claude-sonnet-4-6':'anthropic/claude-sonnet-4-5',
  'grok-3':           'x-ai/grok-3-fast',
  'grok-3-mini':      'x-ai/grok-3-mini-fast',
  'gpt-image-1':      'openai/gpt-image-1',
  'gpt-image-2':      'openai/gpt-image-1',
  'flux-pro':         'black-forest-labs/flux-1.1-pro',
  'flux-pro-ultra':   'black-forest-labs/flux-1.1-pro-ultra',
  'flux-dev':         'black-forest-labs/flux-1-schnell-free',
  'nano-banana-pro':  'black-forest-labs/flux-1.1-pro',
  'nano-banana-2':    'black-forest-labs/flux-1-schnell-free',
  'ideogram-v3':      'ideogram-ai/ideogram-v2',
  'recraft-v3':       'recraft-ai/recraft-v3',
  'grok-image-2':     'x-ai/grok-2-image-1212',
  'imagen-3':         'google/gemini-2.5-flash-image',
  'minimax-h3':       'minimax/video-01-live',
  'hailuo-2':         'minimax/video-01',
  'kling-3':          'kuaishou/kling-video-1.6-pro',
  'wan-3':            'alibaba/wan-2.1-1.3b-t2v',
  'wan-2.7':          'alibaba/wan-2.1-1.3b-t2v',
  'veo-3':            'google/veo-3',
  'veo-2':            'google/veo-2',
  'runway-gen4':      'runwayml/gen4-turbo',
};

function agentRecommend(prompt) {
  const p = prompt.toLowerCase();
  const isVideo = /vídeo|video|animação|animar|cena|cinemat|filme|motion|samurai|carro|corrida/.test(p);
  const isImage = /imagem|foto|retrato|ilustr|design|logo|arte|visual|produto/.test(p);
  const isChat  = /explica|escreva|analise|texto|roteiro|ideia|ajuda|prompt|gere um prompt/.test(p);

  if (isChat) return {
    model: 'gemini-2.5-flash',
    reason: 'Gemini 2.5 Flash — rápido e inteligente para geração de texto e prompts.',
    alternatives: ['gpt-4o', 'grok-3'], type: 'chat'
  };
  if (isVideo) return {
    model: 'seedance-2.5',
    reason: 'Seedance 2.5 — melhor cinemática e qualidade de movimento para o que você descreveu.',
    alternatives: ['minimax-h3', 'kling-3', 'wan-2.7'], type: 'video'
  };
  return {
    model: 'gpt-image-1',
    reason: 'GPT Image 1 — excelente qualidade e controle para geração de imagem.',
    alternatives: ['nano-banana-pro', 'flux-pro', 'grok-image-2'], type: 'image'
  };
}

async function callOpenAI(route, prompt, options) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY não configurada');
  if (route.type === 'image') {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024' })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'OpenAI error');
    return { type: 'image', url: d.data[0].url, provider: 'OpenAI' };
  }
  if (route.type === 'chat') {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: options.model || 'gpt-4o', messages: [{ role: 'user', content: prompt }], max_tokens: 2000 })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'OpenAI error');
    return { type: 'chat', text: d.choices[0].message.content, provider: 'OpenAI' };
  }
}

async function callGoogle(route, prompt, options) {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY não configurada');
  if (route.type === 'chat') {
    const model = options.model || 'gemini-2.5-flash';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'Google error');
    return { type: 'chat', text: d.candidates[0].content.parts[0].text, provider: 'Google / Gemini' };
  }
  if (route.type === 'image') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: options.ratio || '1:1' } })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'Google Imagen error');
    return { type: 'image', url: `data:image/png;base64,${d.predictions[0].bytesBase64Encoded}`, provider: 'Google / Imagen' };
  }
}

async function callXAI(route, prompt, options) {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error('XAI_API_KEY não configurada');
  if (route.type === 'image') {
    const res = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'grok-2-image-1212', prompt, n: 1, response_format: 'url' })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'xAI error');
    return { type: 'image', url: d.data[0].url, provider: 'xAI / Grok' };
  }
  if (route.type === 'chat') {
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'grok-3-fast', messages: [{ role: 'user', content: prompt }] })
    });
    const d = await res.json();
    if (!res.ok) throw new Error(d.error?.message || 'xAI error');
    return { type: 'chat', text: d.choices[0].message.content, provider: 'xAI / Grok' };
  }
}

async function callFal(route, prompt, options) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY não configurada');
  const res = await fetch(`https://fal.run/${route.falModel}`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      ...(route.type === 'video' && { duration: options.duration || 5, aspect_ratio: options.ratio || '16:9' }),
      ...(route.type === 'image' && { image_size: 'square_hd', num_images: 1 })
    })
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.detail || d.error || 'fal.ai error');
  if (route.type === 'image') return { type: 'image', url: d.images?.[0]?.url || d.image?.url, provider: 'fal.ai' };
  const url = d.video?.url || d.output?.video;
  if (url) return { type: 'video', url, provider: 'fal.ai' };
  return { type: 'video_task', taskId: d.request_id, provider: 'fal.ai', polling: true };
}

async function callByteplus(route, prompt, options) {
  const key = process.env.BYTEPLUS_API_KEY;
  if (!key) throw new Error('BYTEPLUS_API_KEY não configurada');
  const res = await fetch('https://ark.ap-southeast.byteplusi.com/api/v3/contents/generations/tasks', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: route.model || 'video-01',
      content: [{ type: 'text', text: prompt }],
      parameters: { duration: options.duration || 5, resolution: '720p', aspect_ratio: options.ratio || '16:9' }
    })
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error?.message || 'BytePlus error');
  return { type: 'video_task', taskId: d.id, provider: 'BytePlus / Seedance', polling: true };
}

async function callOpenRouter(route, prompt, options) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hollywoodstudio.ai', 'X-Title': 'Hollywood Studio AI' },
    body: JSON.stringify({ model: route.orModel, messages: [{ role: 'user', content: prompt }] })
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error?.message || 'OpenRouter error');
  return { type: 'chat', text: d.choices[0].message.content, provider: 'OpenRouter / ' + route.orModel };
}

async function callOpenRouterImage(orModel, prompt, options) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada');

  // OpenRouter usa chat/completions com modality de imagem
  // O modelo retorna a imagem como content dentro da resposta
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hollywoodstudio.ai',
      'X-Title': 'Hollywood Studio AI'
    },
    body: JSON.stringify({
      model: orModel,
      messages: [{ role: 'user', content: prompt }],
    })
  });

  const text = await res.text();
  let d;
  try { d = JSON.parse(text); } catch(e) {
    throw new Error('OpenRouter retornou resposta inválida: ' + text.slice(0, 120));
  }
  if (!res.ok) throw new Error(d.error?.message || 'OpenRouter image error');

  // Tenta extrair imagem da resposta
  const content = d.choices?.[0]?.message?.content;

  // Formato 1: array de content blocks com image_url
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === 'image_url') {
        return { type: 'image', url: block.image_url?.url || block.image_url, provider: 'OpenRouter / ' + orModel };
      }
      if (block.type === 'image') {
        return { type: 'image', url: block.source?.url || block.url, provider: 'OpenRouter / ' + orModel };
      }
    }
  }

  // Formato 2: string com markdown de imagem ![](url)
  if (typeof content === 'string') {
    const mdImg = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
    if (mdImg) return { type: 'image', url: mdImg[1], provider: 'OpenRouter / ' + orModel };

    // Formato 3: URL direta na resposta
    const urlMatch = content.match(/https?:\/\/\S+\.(jpg|jpeg|png|webp|gif)/i);
    if (urlMatch) return { type: 'image', url: urlMatch[0], provider: 'OpenRouter / ' + orModel };

    // Retorna como texto se não achou imagem (pode ser descrição)
    return { type: 'chat', text: content, provider: 'OpenRouter / ' + orModel };
  }

  throw new Error('OpenRouter não retornou imagem para este modelo');
}

async function callOpenRouterVideo(orModel, prompt, options) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada');
  const res = await fetch('https://openrouter.ai/api/v1/video/generations', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json',
      'HTTP-Referer': 'https://hollywoodstudio.ai', 'X-Title': 'Hollywood Studio AI' },
    body: JSON.stringify({ model: orModel, prompt,
      aspect_ratio: options.ratio || '16:9', duration: options.duration || 5 })
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error?.message || 'OpenRouter video error');
  const url = d.data?.[0]?.url || d.video?.url;
  if (url) return { type: 'video', url, provider: 'OpenRouter / ' + orModel };
  const taskId = d.id || d.task_id;
  if (taskId) return { type: 'video_task', taskId, provider: 'OpenRouter / ' + orModel, polling: true };
  throw new Error('OpenRouter não retornou vídeo');
}

async function routeGeneration(modelKey, prompt, options) {
  const route = MODEL_ROUTES[modelKey];
  if (!route) throw new Error(`Modelo "${modelKey}" não encontrado`);

  // Verifica se o provider tem key — se não, usa OpenRouter como fallback
  const hasKey = {
    openai:     !!process.env.OPENAI_API_KEY,
    xai:        !!process.env.XAI_API_KEY,
    google:     !!process.env.GOOGLE_API_KEY,
    byteplus:   !!process.env.BYTEPLUS_API_KEY,
    fal:        !!process.env.FAL_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
  };

  // Se provider não tem key → usa OpenRouter como fallback universal
  if (!hasKey[route.provider] && hasKey.openrouter) {
    // Usa o mapa global OR_FALLBACK
    const orFallback = OR_FALLBACK;

    const orModel = orFallback[modelKey];

    if (orModel) {
      // Para imagem via OpenRouter
      if (route.type === 'image') {
        return callOpenRouterImage(orModel, prompt, options);
      }
      // Para vídeo via OpenRouter
      if (route.type === 'video') {
        return callOpenRouterVideo(orModel, prompt, options);
      }
      // Para chat via OpenRouter
      return callOpenRouter({ orModel }, prompt, options);
    }

    // Modelo não tem fallback no OpenRouter
    const keyNames = {
      openai:'OPENAI_API_KEY', xai:'XAI_API_KEY', google:'GOOGLE_API_KEY',
      byteplus:'BYTEPLUS_API_KEY', fal:'FAL_KEY'
    };
    throw new Error(`${keyNames[route.provider] || 'API key'} não configurada. Este modelo não tem fallback via OpenRouter.`);
  }

  // Sem nenhuma key disponível
  if (!hasKey[route.provider] && !hasKey.openrouter) {
    throw new Error('Nenhuma API key configurada. Adicione OPENROUTER_API_KEY no Vercel para começar.');
  }

  switch (route.provider) {
    case 'openai':     return callOpenAI(route, prompt, { ...options, model: modelKey });
    case 'xai':        return callXAI(route, prompt, options);
    case 'google':     return callGoogle(route, prompt, { ...options, model: route.model });
    case 'byteplus':   return callByteplus(route, prompt, options);
    case 'fal':        return callFal(route, prompt, options);
    case 'openrouter': return callOpenRouter(route, prompt, options);
    default: throw new Error(`Provider "${route.provider}" não suportado`);
  }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200 });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  // aceita token local (sem API de auth) ou token do servidor
  const validTokens = ['hs-local-token', process.env.API_SECRET || 'hs-token'];
  if (!validTokens.includes(token)) return json({ ok: false, error: 'Unauthorized' }, 401);

  try {
    const body = await req.json();
    const { action, prompt, model, options = {} } = body;

    if (action === 'recommend') {
      return json({ ok: true, recommendation: agentRecommend(prompt) });
    }

    if (action === 'models') {
      const activeProviders = [];
      if (process.env.OPENAI_API_KEY)     activeProviders.push('openai');
      if (process.env.XAI_API_KEY)        activeProviders.push('xai');
      if (process.env.GOOGLE_API_KEY)     activeProviders.push('google');
      if (process.env.BYTEPLUS_API_KEY)   activeProviders.push('byteplus');
      if (process.env.FAL_KEY)            activeProviders.push('fal');
      if (process.env.OPENROUTER_API_KEY) activeProviders.push('openrouter');

      // Modelos disponíveis por provider
      // OpenRouter cobre: chat de qualquer provider + imagem/vídeo de alguns
      const hasOR = activeProviders.includes('openrouter');

      const available = Object.entries(MODEL_ROUTES)
        .filter(([id, r]) => {
          if (activeProviders.includes(r.provider)) return true;
          // fallback via OpenRouter
          if (hasOR && OR_FALLBACK[id]) return true;
          return false;
        })
        .map(([id, r]) => ({
          id,
          type: r.type,
          provider: activeProviders.includes(r.provider) ? r.provider : 'openrouter',
          via_fallback: !activeProviders.includes(r.provider)
        }));

      return json({ ok: true, providers: activeProviders, models: available });
    }

    if (action === 'generate') {
      if (!prompt) return json({ error: 'Prompt obrigatório' }, 400);
      if (!model)  return json({ error: 'Modelo obrigatório' }, 400);
      const result = await routeGeneration(model, prompt, options);
      return json({ ok: true, result });
    }

    return json({ error: 'Action inválida' }, 400);
  } catch (e) {
    return json({ ok: false, error: e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
