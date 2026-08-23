export const config = { runtime: 'edge' };

const MUAPI_KEY = process.env.MUAPI_KEY || '54428a943dc90921ff29737af3b5ace6527c5309dcc17d6c1ad54dfd1c32abae';
const MUAPI_BASE = 'https://api.muapi.ai/v1';

// Mapa de modelos → endpoints MuAPI
const MODELS = {
  // IMAGEM
  'nano-banana-pro':  { type:'image', endpoint:'/images/generate', model:'nano-banana-pro' },
  'nano-banana-2':    { type:'image', endpoint:'/images/generate', model:'nano-banana-2' },
  'flux-pro':         { type:'image', endpoint:'/images/generate', model:'flux-pro' },
  'flux-dev':         { type:'image', endpoint:'/images/generate', model:'flux-dev' },
  'seedream':         { type:'image', endpoint:'/images/generate', model:'seedream' },
  'wan-image':        { type:'image', endpoint:'/images/generate', model:'wan-2.5' },
  'ideogram':         { type:'image', endpoint:'/images/generate', model:'ideogram-v3' },
  'gpt-image-1':      { type:'image', endpoint:'/images/generate', model:'gpt-image-1' },
  // VÍDEO
  'seedance-lite':    { type:'video', endpoint:'/videos/generate', model:'seedance-lite' },
  'seedance-2':       { type:'video', endpoint:'/videos/generate', model:'seedance-2' },
  'seedance-2.5':     { type:'video', endpoint:'/videos/generate', model:'seedance-2.5' },
  'wan-2.1':          { type:'video', endpoint:'/videos/generate', model:'wan-2.1' },
  'wan-3':            { type:'video', endpoint:'/videos/generate', model:'wan-3' },
  'kling-1.6':        { type:'video', endpoint:'/videos/generate', model:'kling-1.6' },
  'kling-2.1':        { type:'video', endpoint:'/videos/generate', model:'kling-2.1' },
  'minimax-h3':       { type:'video', endpoint:'/videos/generate', model:'minimax-hailuo-h3' },
  'veo-3':            { type:'video', endpoint:'/videos/generate', model:'veo-3' },
  // CHAT
  'gemini-2.5-flash': { type:'chat', endpoint:'/chat/completions', model:'gemini-2.5-flash' },
  'gpt-4o':           { type:'chat', endpoint:'/chat/completions', model:'gpt-4o' },
  'claude-sonnet':    { type:'chat', endpoint:'/chat/completions', model:'claude-sonnet-4-5' },
  'grok-3':           { type:'chat', endpoint:'/chat/completions', model:'grok-3' },
};

function agentRecommend(prompt, genType) {
  const p = prompt.toLowerCase();
  if (genType === 'video') {
    const isCinema = /samurai|cinemat|épico|epic|ação|action|luxury|fashion|fantasia|drama/.test(p);
    return isCinema
      ? { model:'seedance-2.5', reason:'Seedance 2.5 — melhor cinemática para cenas épicas.', alternatives:['kling-2.1','minimax-h3','wan-3','veo-3'] }
      : { model:'seedance-lite', reason:'Seedance Lite — rápido e econômico para vídeos gerais.', alternatives:['seedance-2','wan-2.1','kling-1.6'] };
  }
  if (genType === 'chat') {
    return { model:'gemini-2.5-flash', reason:'Gemini 2.5 Flash — rápido e inteligente.', alternatives:['gpt-4o','claude-sonnet','grok-3'] };
  }
  // imagem
  const isPortrait = /retrato|portrait|pessoa|rosto|face|modelo/.test(p);
  const isArt      = /anime|cartoon|ilustr|digital art|concept|fantasia/.test(p);
  if (isPortrait) return { model:'nano-banana-pro', reason:'Nano Banana Pro — detalhes faciais e consistência de identidade.', alternatives:['gpt-image-1','flux-pro','ideogram'] };
  if (isArt)      return { model:'flux-dev',        reason:'Flux Dev — qualidade artística e estilos variados.', alternatives:['nano-banana-pro','ideogram','seedream'] };
  return           { model:'nano-banana-pro', reason:'Nano Banana Pro — versátil e de alta qualidade.', alternatives:['flux-pro','gpt-image-1','seedream','wan-image'] };
}

async function callMuAPI(endpoint, body) {
  const res = await fetch(MUAPI_BASE + endpoint, {
    method: 'POST',
    headers: { 'x-api-key': MUAPI_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch(e) { throw new Error('MuAPI resposta inválida: ' + text.slice(0,100)); }
  if (!res.ok) throw new Error(data.message || data.error || 'MuAPI error ' + res.status);
  return data;
}

async function generateImage(modelInfo, prompt, options) {
  const data = await callMuAPI(modelInfo.endpoint, {
    model: modelInfo.model,
    prompt,
    width:  options.ratio === '9:16' ? 768  : options.ratio === '1:1' ? 1024 : 1344,
    height: options.ratio === '9:16' ? 1344 : options.ratio === '1:1' ? 1024 : 768,
    num_images: 1,
  });
  const url = data.images?.[0]?.url || data.url || data.data?.[0]?.url;
  if (!url) throw new Error('MuAPI não retornou imagem');
  return { type:'image', url, provider:'MuAPI / ' + modelInfo.model };
}

async function generateVideo(modelInfo, prompt, options) {
  const data = await callMuAPI(modelInfo.endpoint, {
    model: modelInfo.model,
    prompt,
    aspect_ratio: options.ratio || '16:9',
    duration: options.duration || 5,
  });
  // Vídeo pode ser assíncrono
  const url = data.video_url || data.url || data.videos?.[0]?.url;
  if (url) return { type:'video', url, provider:'MuAPI / ' + modelInfo.model };
  const taskId = data.task_id || data.id || data.request_id;
  if (taskId) return { type:'video_task', taskId, provider:'MuAPI / ' + modelInfo.model, polling: true };
  throw new Error('MuAPI não retornou vídeo');
}

async function generateChat(modelInfo, prompt) {
  const data = await callMuAPI(modelInfo.endpoint, {
    model: modelInfo.model,
    messages: [{ role:'user', content: prompt }],
    max_tokens: 2000,
  });
  const text = data.choices?.[0]?.message?.content || data.content || data.text;
  if (!text) throw new Error('MuAPI não retornou texto');
  return { type:'chat', text, provider:'MuAPI / ' + modelInfo.model };
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return ok(null, 200);
  if (req.method !== 'POST') return ok({ error:'Method not allowed' }, 405);

  // Auth — aceita token local ou Supabase
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  const validLocal = ['hs-local-token', process.env.API_SECRET || 'hs-token'];
  if (!token || (!validLocal.includes(token) && token.length < 20)) {
    return ok({ ok:false, error:'Unauthorized' }, 401);
  }

  try {
    const body = await req.json();
    const { action, prompt, model, options = {}, genType = 'image' } = body;

    // Recomendação do agente
    if (action === 'recommend') {
      return ok({ ok:true, recommendation: agentRecommend(prompt, genType) });
    }

    // Lista modelos disponíveis
    if (action === 'models') {
      const models = Object.entries(MODELS).map(([id, m]) => ({
        id, type: m.type, provider: 'MuAPI', name: id
      }));
      return ok({ ok:true, providers:['muapi'], models });
    }

    // Gera conteúdo
    if (action === 'generate') {
      if (!prompt) return ok({ error:'Prompt obrigatório' }, 400);
      if (!model)  return ok({ error:'Modelo obrigatório' }, 400);

      const modelInfo = MODELS[model];
      if (!modelInfo) return ok({ error:`Modelo "${model}" não encontrado` }, 400);

      let result;
      if (modelInfo.type === 'image') result = await generateImage(modelInfo, prompt, options);
      else if (modelInfo.type === 'video') result = await generateVideo(modelInfo, prompt, options);
      else result = await generateChat(modelInfo, prompt);

      return ok({ ok:true, result });
    }

    return ok({ error:'Action inválida' }, 400);
  } catch(e) {
    return ok({ ok:false, error: e.message }, 500);
  }
}

function ok(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type':'application/json', 'Access-Control-Allow-Origin':'*' }
  });
}
