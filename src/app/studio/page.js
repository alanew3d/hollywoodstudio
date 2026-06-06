"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";

// ─── Models catalogue ────────────────────────────────────────────────────────
const MODELS = [
  // VIDEO — live / planned providers
  { id:"seedance2", cat:"video", name:"Seedance 2.0 Pro", sub:"BytePlus · até 15s", desc:{pt:"Movimento fluido cinematográfico, realismo premium, melhor para narrativa",en:"Fluid cinematic motion, premium realism"}, durs:[5,10,15], max:"15s", res:"720p–1080p", ref:"Texto+Imagem", featured:true, status:"live", costPerSec:1 },
  { id:"seedance2lite", cat:"video", name:"Seedance 2.0 Lite", sub:"BytePlus · rápido", desc:{pt:"Iteração rápida e custo menor para testes",en:"Fast low-cost iteration"}, durs:[5,10], max:"10s", res:"480p–720p", ref:"Texto+Imagem", featured:true, status:"live", costPerSec:.6 },
  { id:"seedancei2v", cat:"video", name:"Seedance I2V", sub:"BytePlus · imagem para vídeo", desc:{pt:"Transforma imagem em movimento mantendo referência",en:"Image to video with reference consistency"}, durs:[5,10,15], max:"15s", res:"720p", ref:"Imagem", featured:false, status:"live", costPerSec:1.2 },
  { id:"kling3", cat:"video", name:"Kling 3.0", sub:"Atlas · pessoas", desc:{pt:"Pessoas, expressões faciais e movimento natural",en:"People, faces and motion"}, durs:[5,10], max:"10s", res:"720p–1080p", ref:"Texto+Imagem", featured:true, status:"live", costPerSec:1.2 },
  { id:"klingmotion", cat:"video", name:"Kling Motion Control", sub:"Atlas · controle", desc:{pt:"Controle avançado de câmera e movimento",en:"Advanced camera/motion control"}, durs:[5,10], max:"10s", res:"720p–1080p", ref:"Texto+Imagem", featured:false, status:"planned", costPerSec:1.6 },
  { id:"veo31lite", cat:"video", name:"Veo 3.1 Lite", sub:"Google · preview", desc:{pt:"Veo mais rápido para prévias",en:"Fast Veo previews"}, durs:[5,8], max:"8s", res:"720p–1080p", ref:"Texto+Imagem", featured:true, status:"planned", costPerSec:1.4 },
  { id:"veo31fast", cat:"video", name:"Veo 3.1 Fast", sub:"Google · rápido", desc:{pt:"Equilíbrio entre velocidade e qualidade",en:"Speed/quality balance"}, durs:[5,8], max:"8s", res:"1080p", ref:"Texto+Imagem", featured:false, status:"planned", costPerSec:1.8 },
  { id:"veo31quality", cat:"video", name:"Veo 3.1 Quality", sub:"Google · premium", desc:{pt:"Fotorrealismo e qualidade máxima",en:"Premium photoreal quality"}, durs:[5,8], max:"8s", res:"1080p–4K", ref:"Texto+Imagem", featured:false, status:"planned", costPerSec:2.4 },
  { id:"sora2", cat:"video", name:"Sora 2", sub:"OpenAI", desc:{pt:"Física realista e cenas complexas",en:"Realistic physics"}, durs:[5,10,20], max:"20s", res:"720p–1080p", ref:"Texto", featured:false, status:"planned", costPerSec:1.5 },
  { id:"wan27", cat:"video", name:"Wan 2.7", sub:"Alibaba · first/last", desc:{pt:"Controle de frame inicial e final",en:"Start/end frame control"}, durs:[5,10], max:"10s", res:"720p", ref:"Texto+Imagem", featured:false, status:"planned", costPerSec:1 },
  { id:"hailuo", cat:"video", name:"Hailuo", sub:"MiniMax · rápido", desc:{pt:"Bom para iteração e movimento expressivo",en:"Fast expressive generation"}, durs:[6], max:"6s", res:"720p", ref:"Texto+Imagem", featured:false, status:"planned", costPerSec:.8 },
  { id:"lipsync", cat:"video", name:"Lipsync Studio", sub:"Voz + vídeo", desc:{pt:"Sincronização labial para avatares e UGC",en:"Lip sync for avatars"}, durs:[5,10,30], max:"30s", res:"720p", ref:"Vídeo+Áudio", featured:false, status:"planned", costPerSec:1 },
  // IMAGE
  { id:"fluxpro", cat:"image", name:"Flux Pro", sub:"Black Forest Labs", desc:{pt:"Qualidade editorial máxima",en:"Editorial quality"}, durs:[0], max:"—", res:"até 4K", ref:"Texto", featured:true, status:"live", costPerImg:8 },
  { id:"seedream5", cat:"image", name:"Seedream 5", sub:"BytePlus", desc:{pt:"Realismo fotográfico e composição cinematográfica",en:"Photoreal cinematic composition"}, durs:[0], max:"—", res:"até 2K", ref:"Texto+Imagem", featured:true, status:"live", costPerImg:6 },
  { id:"gptimage2", cat:"image", name:"GPT Image 2", sub:"OpenAI", desc:{pt:"Edição precisa por linguagem natural",en:"Natural language editing"}, durs:[0], max:"—", res:"1024px", ref:"Texto+Imagem", featured:true, status:"planned", costPerImg:10 },
  { id:"nanobananapro", cat:"image", name:"Nano Banana Pro", sub:"Personagens", desc:{pt:"Consistência de personagem e identidade",en:"Character consistency"}, durs:[0], max:"—", res:"720p–1080p", ref:"Texto+Imagem", featured:false, status:"planned", costPerImg:5 },
  { id:"nanobanana2", cat:"image", name:"Nano Banana 2", sub:"Personagens", desc:{pt:"Versão rápida para testes",en:"Fast character tests"}, durs:[0], max:"—", res:"720p", ref:"Texto+Imagem", featured:false, status:"planned", costPerImg:4 },
  { id:"geminiomni", cat:"image", name:"Gemini Omni", sub:"Google · multimodal", desc:{pt:"Análise e criação multimodal",en:"Multimodal analysis+creation"}, durs:[0], max:"—", res:"variável", ref:"Texto+Imagem", featured:false, status:"planned", costPerImg:7 },
  { id:"imagen4", cat:"image", name:"Imagen 4", sub:"Google", desc:{pt:"Imagem fotorrealista e publicidade",en:"Photoreal advertising"}, durs:[0], max:"—", res:"2K", ref:"Texto", featured:false, status:"planned", costPerImg:8 },
  // AUDIO
  { id:"suno", cat:"audio", name:"Suno", sub:"Trilha sonora", desc:{pt:"Trilha, jingle e tema para vídeo",en:"Scores and jingles"}, durs:[0], max:"—", res:"MP3", ref:"Texto", featured:true, status:"planned", costFixed:20 },
  { id:"mmaudio", cat:"audio", name:"MMAudio", sub:"SFX sincronizado", desc:{pt:"Efeitos sonoros sincronizados ao vídeo",en:"Synced sound effects"}, durs:[0], max:"—", res:"MP3", ref:"Vídeo", featured:true, status:"planned", costFixed:15 },
  { id:"elevenlabs", cat:"audio", name:"ElevenLabs", sub:"Voz & dublagem", desc:{pt:"Narração, dublagem e voiceover",en:"Narration and dubbing"}, durs:[0], max:"—", res:"MP3", ref:"Texto", featured:true, status:"planned", costFixed:12 },
];

const PRESETS = [
  { n:"Luxury Car",   ic:"🚗", pt:"comercial de carro de luxo à noite, reflexos molhados, câmera em dolly, cinematográfico premium", en:"luxury car commercial at night, wet reflections, dolly camera, premium cinematic" },
  { n:"Fashion",      ic:"👗", pt:"editorial de moda, estúdio, iluminação dramática, alta-costura, alto contraste", en:"fashion editorial, studio, dramatic lighting, haute couture, high contrast" },
  { n:"Trailer",      ic:"🎬", pt:"trailer épico de cinema, alto contraste, movimento dramático de câmera, tensão crescente", en:"epic film trailer, high contrast, dramatic camera movement, rising tension" },
  { n:"Music Video",  ic:"🎵", pt:"clipe musical, cortes rítmicos, luz neon, energia, estilizado", en:"music video, rhythmic cuts, neon light, energy, stylized" },
  { n:"Product",      ic:"✨", pt:"produto premium, iluminação de estúdio, fundo escuro, macro, foco no detalhe", en:"premium product, studio lighting, dark background, macro, detail focus" },
  { n:"ARRI Alexa",   ic:"🎥", pt:"look ARRI Alexa, latitude de cor cinematográfica, grão de filme sutil, realismo", en:"ARRI Alexa look, cinematic color latitude, subtle film grain, realism" },
  { n:"Real Estate",  ic:"🏠", pt:"imóvel de luxo, golden hour, grande angular, tour fluido, aspiracional", en:"luxury real estate, golden hour, wide angle, smooth tour, aspirational" },
  { n:"Food",         ic:"🍔", pt:"fotografia gastronômica, macro, vapor, apetite, luz suave", en:"food photography, macro, steam, appetite appeal, soft light" },
];

const ASPECT_RATIOS = [
  { v:"16:9",   label:"16:9",   sub:"Cinema / YouTube",  w:16, h:9  },
  { v:"9:16",   label:"9:16",   sub:"Reels / TikTok",    w:9,  h:16 },
  { v:"1:1",    label:"1:1",    sub:"Feed / Instagram",  w:1,  h:1  },
  { v:"4:5",    label:"4:5",    sub:"Instagram vertical", w:4, h:5  },
  { v:"2.39:1", label:"2.39:1", sub:"Cinemascope",       w:239,h:100},
];

const STAGES_VID = ["Analisando brief", "Preparando pipeline", "Enviando para modelo", "Gerando frames", "Processando movimento", "Renderizando cenas", "Finalizando vídeo"];
const STAGES_IMG = ["Analisando prompt", "Processando referências", "Gerando composição", "Aplicando estilo", "Renderizando imagem", "Finalizando"];

function modelById(id) { return MODELS.find(m => m.id === id) || MODELS[0]; }
function modelsForCat(cat) { return MODELS.filter(m => m.cat === cat); }

function getCreditCost(modelId, duration, resolution) {
  const m = modelById(modelId);
  if (m.cat === "audio") return m.costFixed || 15;
  if (m.cat === "image") {
    const mult = resolution === "4K" ? 2 : resolution === "1080p" ? 1.5 : 1;
    return Math.round((m.costPerImg || 6) * mult);
  }
  const mult = resolution === "4K" ? 2 : resolution === "1080p" ? 1.3 : 1;
  return Math.max(1, Math.ceil((m.costPerSec || 1) * (duration || 5) * mult));
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function StudioPage() {
  const { data: session } = useSession();
  const pt = true; // TODO: from user preference / next-intl

  // Mode: video | image | audio
  const [cmode, setCmode] = useState("video");
  const [model, setModel] = useState("seedance2");
  const [prompt, setPrompt] = useState("");
  const [resolution, setResolution] = useState("720p");
  const [aspect, setAspect] = useState("16:9");
  const [duration, setDuration] = useState(10);
  const [genAudio, setGenAudio] = useState(false);
  const [group, setGroup] = useState("Geral");

  // References / uploads
  const [refs, setRefs] = useState([]);        // [{src, role}]
  const [startFrame, setStartFrame] = useState(null);
  const [endFrame, setEndFrame] = useState(null);
  const fileRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  // Generation state
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [stages, setStages] = useState(STAGES_VID);
  const [result, setResult] = useState(null);   // {url, type}
  const [error, setError] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const pollRef = useRef(null);

  // Gallery (local + server)
  const [gallery, setGallery] = useState([]);

  // UI
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [aspectMenuOpen, setAspectMenuOpen] = useState(false);
  const [activePreset, setActivePreset] = useState(null);
  const promptRef = useRef(null);

  // Load gallery from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hsai_gal") || "[]");
      setGallery(saved.slice(0, 80));
    } catch {}

    // Check for success payment without forcing useSearchParams during build
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("payment") === "success") {
      // refresh session credits on next session update
    }
  }, []);

  // Sync model when mode changes
  useEffect(() => {
    const available = modelsForCat(cmode === "text" ? "video" : cmode);
    if (!available.find(m => m.id === model)) setModel(available[0]?.id || "seedance2");
  }, [cmode]);

  // Cost estimate
  const cost = getCreditCost(model, duration, resolution);
  const currentModel = modelById(model);

  // ── Generate ──────────────────────────────────────────────────────────────
  const generate = async () => {
    if (!session) { signIn(); return; }
    if (!prompt.trim() && cmode !== "audio") { setError(pt ? "Escreva um prompt" : "Write a prompt"); return; }
    if ((session.user?.credits || 0) < cost) {
      setError(pt ? `Créditos insuficientes (precisa ${cost}s, tem ${session.user?.credits || 0}s)` : `Insufficient credits`);
      return;
    }

    setLoading(true); setError(null); setResult(null); setStageIdx(0);
    const stgList = cmode === "image" ? STAGES_IMG : STAGES_VID;
    setStages(stgList);

    // Animate stages
    const interval = setInterval(() => {
      setStageIdx(i => {
        if (i >= stgList.length - 2) { clearInterval(interval); return i; }
        return i + 1;
      });
    }, 1800);

    try {
      const body = {
        mode: cmode === "video" ? "text-to-video" : cmode === "image" ? "image" : cmode,
        prompt,
        aspect_ratio: aspect,
        resolution,
        duration: parseInt(duration),
        quality: resolution === "720p" ? "basic" : "high",
        model,
        images_list: refs.filter(r => r.role !== "video").map(r => r.src),
        ...(startFrame && { start_frame: startFrame }),
        ...(endFrame && { end_frame: endFrame }),
      };

      const res = await fetch("/api/seedance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro na geração");

      clearInterval(interval);
      setStageIdx(stgList.length - 1);
      setRequestId(data.request_id);

      // Start polling
      startPolling(data.request_id, prompt, currentModel, duration);
    } catch (err) {
      clearInterval(interval);
      setError(err.message);
      setLoading(false);
    }
  };

  const startPolling = useCallback(async (reqId, prmt, mdl, dur) => {
    const poll = async () => {
      try {
        const r = await fetch("/api/seedance/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: reqId }),
        });
        const data = await r.json();

        if (data.status === "completed") {
          setLoading(false);
          const isVid = mdl.cat === "video";
          const item = {
            url: data.imageUrl,
            type: isVid ? "video" : "image",
            prompt: prmt,
            model: mdl.name,
            modelId: mdl.id,
            duration: dur,
            date: Date.now(),
          };
          setResult(item);
          // Save to gallery
          setGallery(prev => {
            const next = [item, ...prev].slice(0, 80);
            localStorage.setItem("hsai_gal", JSON.stringify(next));
            return next;
          });
        } else if (data.status === "failed") {
          setLoading(false);
          setError("Geração falhou — tente novamente");
        } else {
          pollRef.current = setTimeout(poll, 3000);
        }
      } catch {
        pollRef.current = setTimeout(poll, 5000);
      }
    };
    poll();
  }, []);

  useEffect(() => () => clearTimeout(pollRef.current), []);

  // ── File handlers ─────────────────────────────────────────────────────────
  const addRef = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setRefs(r => [...r, { src: ev.target.result, role: "" }]);
    reader.readAsDataURL(file);
  };
  const setFrame = (type, e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => type === "start" ? setStartFrame(ev.target.result) : setEndFrame(ev.target.result);
    reader.readAsDataURL(file);
  };
  const removeRef = (i) => setRefs(r => r.filter((_, idx) => idx !== i));

  // ── Download ──────────────────────────────────────────────────────────────
  const download = async (url) => {
    try {
      const r = await fetch(url, { referrerPolicy: "no-referrer" });
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `hsai-${Date.now()}.${result?.type === "video" ? "mp4" : "jpg"}`;
      a.click();
    } catch {
      window.open(url, "_blank");
    }
  };

  // ── Preset apply ──────────────────────────────────────────────────────────
  const applyPreset = (preset) => {
    setActivePreset(preset.n);
    const text = preset[pt ? "pt" : "en"];
    if (promptRef.current) {
      const curr = promptRef.current.value.replace(/\s*\|\s*(estilo|style):.*$/i, "").trim();
      promptRef.current.value = curr ? `${curr} | estilo: ${text}` : text;
      setPrompt(promptRef.current.value);
    }
  };

  // ── Model menu ────────────────────────────────────────────────────────────
  const availableModels = modelsForCat(cmode === "text" ? "video" : cmode);

  return (
    <>
      <style>{`
        :root {
          --bg:#0a0a0c; --bg-2:#0e0f12; --panel:#121317; --panel-2:#16181d;
          --elev:#1b1d23; --line:rgba(255,255,255,.07); --line-2:rgba(255,255,255,.12);
          --ink:#edeef2; --ink-2:#a7abb6; --ink-3:#6c707c; --ink-4:#474a54;
          --accent:#d4a857; --accent-2:#e7c688; --accent-dim:rgba(212,168,87,.14);
          --ok:#5fb87a; --warn:#d9a441; --err:#d96a5b;
          --serif:'Fraunces',Georgia,serif;
          --sans:'Hanken Grotesk',system-ui,sans-serif;
          --mono:'JetBrains Mono',monospace;
          --r:10px; --r-lg:16px;
        }
        .studio-wrap { display:grid; grid-template-columns:minmax(340px,380px) 1fr; gap:20px; align-items:start; }
        @media(max-width:1080px){ .studio-wrap{grid-template-columns:1fr} }
        .dc-card { background:var(--panel); border:1px solid var(--line); border-radius:var(--r-lg); padding:18px; margin-bottom:14px; }
        .field { margin-bottom:16px; }
        .label { font-size:11px; letter-spacing:.8px; text-transform:uppercase; color:var(--ink-3); font-weight:600; display:block; margin-bottom:6px; }
        .inp { width:100%; background:var(--panel-2); border:1px solid var(--line); border-radius:var(--r); padding:11px 13px; font-size:13.5px; color:var(--ink); font-family:var(--sans); transition:.16s; resize:none; }
        .inp:focus { outline:none; border-color:var(--accent-dim); box-shadow:0 0 0 3px var(--accent-dim); }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px 18px; border-radius:var(--r); font-size:13.5px; font-weight:600; border:1px solid var(--line-2); background:var(--panel-2); cursor:pointer; transition:.16s; color:var(--ink); font-family:var(--sans); }
        .btn:hover { border-color:var(--line-2); background:var(--elev); }
        .btn-primary { background:linear-gradient(135deg,var(--accent),var(--accent-2)); color:#1a1408; border:none; }
        .btn-primary:hover { filter:brightness(1.07); }
        .btn-primary:disabled { opacity:.5; cursor:not-allowed; filter:none; }
        .btn-ghost { background:none; border:1px solid var(--line); }
        .btn-sm { padding:6px 12px; font-size:12px; }
        .btn-full { width:100%; }
        .seg { display:flex; gap:6px; flex-wrap:wrap; }
        .seg-btn { padding:7px 13px; border-radius:8px; border:1px solid var(--line); background:var(--panel-2); font-size:12.5px; cursor:pointer; color:var(--ink-2); transition:.14s; font-weight:500; font-family:var(--sans); }
        .seg-btn.on { border-color:var(--accent-dim); background:var(--accent-dim); color:var(--accent-2); }
        .model-sel { display:flex; align-items:center; gap:10px; width:100%; background:var(--panel-2); border:1px solid var(--line); border-radius:var(--r); padding:11px 14px; cursor:pointer; transition:.16s; color:var(--ink); }
        .model-sel:hover { border-color:var(--line-2); }
        .model-sel .dot { width:8px; height:8px; border-radius:50%; background:var(--ok); flex-shrink:0; }
        .model-sel .chev { margin-left:auto; color:var(--ink-3); transition:transform .2s; }
        .model-sel.open .chev { transform:rotate(180deg); }
        .model-menu { position:absolute; top:calc(100% + 6px); left:0; right:0; background:var(--elev); border:1px solid var(--line-2); border-radius:var(--r); box-shadow:0 24px 60px rgba(0,0,0,.5); z-index:50; max-height:340px; overflow-y:auto; padding:6px; }
        .model-opt { display:flex; align-items:flex-start; gap:10px; padding:10px; border-radius:8px; cursor:pointer; transition:.12s; }
        .model-opt:hover { background:var(--panel-2); }
        .mo-name { font-weight:600; font-size:13px; }
        .mo-desc { font-size:11.5px; color:var(--ink-3); line-height:1.4; margin-top:2px; }
        .mo-chips { display:flex; gap:5px; margin-top:5px; flex-wrap:wrap; }
        .mo-chip { font-size:9.5px; font-family:var(--mono); color:var(--ink-3); border:1px solid var(--line); border-radius:5px; padding:1px 6px; }
        .mo-cost { margin-left:auto; font-size:10.5px; font-family:var(--mono); color:var(--accent); white-space:nowrap; }
        .top-badge { font-size:8.5px; background:var(--accent); color:#1a1408; padding:1px 5px; border-radius:5px; font-weight:700; }
        .cost-line { display:flex; align-items:center; justify-content:space-between; font-size:12px; color:var(--ink-3); margin:4px 0 10px; font-family:var(--mono); }
        .cost-line b { color:var(--accent); }
        .preview-stage { min-height:260px; display:flex; align-items:center; justify-content:center; background:var(--bg-2); border-radius:var(--r); overflow:hidden; position:relative; }
        .preview-stage video, .preview-stage img { max-width:100%; max-height:460px; border-radius:var(--r); display:block; }
        .preview-empty { text-align:center; padding:40px 20px; color:var(--ink-3); }
        .preview-empty .ic { font-size:3em; margin-bottom:12px; }
        .chip-rail { display:flex; gap:7px; flex-wrap:nowrap; overflow-x:auto; padding-bottom:4px; margin-bottom:12px; scrollbar-width:none; }
        .chip-rail::-webkit-scrollbar { display:none; }
        .mchip,.pchip { display:flex; align-items:center; gap:6px; padding:7px 13px; border-radius:24px; border:1px solid var(--line); background:var(--panel-2); font-size:12.5px; cursor:pointer; transition:.14s; white-space:nowrap; font-family:var(--sans); color:var(--ink-2); }
        .mchip:hover,.pchip:hover { border-color:var(--accent-dim); color:var(--ink); }
        .mchip.on { border-color:var(--accent); background:var(--accent-dim); color:var(--accent-2); }
        .mchip .dot { width:7px; height:7px; border-radius:50%; background:var(--ok); }
        .pchip.on { border-color:var(--accent-dim); background:var(--accent-dim); color:var(--accent-2); }
        .drop-zone { border:1.5px dashed var(--line-2); border-radius:var(--r); padding:16px; text-align:center; cursor:pointer; font-size:12.5px; color:var(--ink-3); background:var(--panel-2); transition:.16s; }
        .drop-zone:hover { border-color:var(--accent-dim); color:var(--ink-2); }
        .thumbs { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
        .thumb { width:64px; height:64px; border-radius:8px; object-fit:cover; border:1px solid var(--line-2); position:relative; }
        .tog-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-top:1px solid var(--line); font-size:13px; color:var(--ink-2); }
        .sw { width:36px; height:20px; border-radius:10px; background:var(--panel-2); border:1px solid var(--line-2); cursor:pointer; position:relative; transition:.2s; }
        .sw::after { content:''; position:absolute; top:2px; left:2px; width:14px; height:14px; border-radius:50%; background:var(--ink-4); transition:.2s; }
        .sw.on { background:var(--accent-dim); border-color:var(--accent-dim); }
        .sw.on::after { left:18px; background:var(--accent); }
        .gal-strip { display:grid; grid-template-columns:repeat(auto-fill,minmax(72px,1fr)); gap:7px; }
        .gi { position:relative; border-radius:8px; overflow:hidden; border:1px solid var(--line); background:var(--panel-2); aspect-ratio:16/9; cursor:pointer; }
        .gi video,.gi img { width:100%; height:100%; object-fit:cover; display:block; }
        .prog-bar { height:3px; background:var(--accent-dim); border-radius:2px; overflow:hidden; margin-top:10px; }
        .prog-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--accent-2)); border-radius:2px; transition:width .4s; }
        .err-box { background:rgba(217,106,91,.1); border:1px solid rgba(217,106,91,.3); border-radius:var(--r); padding:12px 14px; font-size:13px; color:var(--err); margin-top:10px; }
        .aspect-menu { position:absolute; top:calc(100% + 6px); left:0; right:0; background:var(--elev); border:1px solid var(--line-2); border-radius:var(--r); box-shadow:0 20px 50px rgba(0,0,0,.5); z-index:50; padding:6px; }
        .aspect-opt { display:flex; align-items:center; justify-content:space-between; padding:9px 12px; border-radius:7px; cursor:pointer; font-size:13px; transition:.12s; }
        .aspect-opt:hover { background:var(--panel-2); }
        .aspect-opt.on { color:var(--accent); }
        h3 { font-family:var(--serif); font-size:17px; font-weight:500; margin-bottom:12px; }
        .eng { font-size:9px; font-family:var(--mono); color:var(--accent); background:var(--accent-dim); padding:2px 7px; border-radius:5px; vertical-align:middle; margin-left:6px; letter-spacing:.5px; }
        .row { display:flex; gap:10px; flex-wrap:wrap; }
      `}</style>

      <div style={{ padding: "20px 28px 60px" }}>

        {/* Model rail */}
        <div className="chip-rail">
          {availableModels.map(m => (
            <div key={m.id} className={`mchip${model === m.id ? " on" : ""}`} onClick={() => setModel(m.id)}>
              <span className="dot" />
              {m.name}
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-4)" }}>
                {m.cat === "video" ? `${m.costPerSec}cr/s` : m.cat === "image" ? `${m.costPerImg}cr` : `${m.costFixed}cr`}
              </span>
            </div>
          ))}
        </div>

        {/* Preset rail */}
        <div className="chip-rail">
          {PRESETS.map(p => (
            <div key={p.n} className={`pchip${activePreset === p.n ? " on" : ""}`} onClick={() => applyPreset(p)}>
              {p.ic} {p.n}
            </div>
          ))}
        </div>

        {/* Studio grid */}
        <div className="studio-wrap">

          {/* ── LEFT: Controls ── */}
          <div>

            {/* Creative Direction */}
            <div className="dc-card">
              <h3>Direção Criativa <span className="eng">AI ENGINE</span></h3>

              {/* Mode tabs */}
              <div className="seg" style={{ marginBottom: 14 }}>
                {[["video","VÍDEO"],["image","IMAGEM"],["audio","ÁUDIO"]].map(([m, l]) => (
                  <button key={m} className={`seg-btn${cmode === m ? " on" : ""}`} onClick={() => setCmode(m)}>{l}</button>
                ))}
              </div>

              {/* Model selector */}
              <div className="field" style={{ position: "relative" }}>
                <span className="label">Modelo</span>
                <button className={`model-sel${modelMenuOpen ? " open" : ""}`} onClick={() => setModelMenuOpen(o => !o)}>
                  <span className="dot" />
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{currentModel.name}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--mono)", flex: 1, textAlign: "left", marginLeft: 6 }}>{currentModel.sub}</span>
                  <svg className="chev" viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {modelMenuOpen && (
                  <div className="model-menu">
                    {[...availableModels.filter(m => m.featured), ...availableModels.filter(m => !m.featured)].map(m => (
                      <div key={m.id} className="model-opt" onClick={() => { setModel(m.id); setModelMenuOpen(false); }}>
                        <span className="dot" style={{ marginTop: 4 }} />
                        <div style={{ flex: 1 }}>
                          <div className="mo-name">
                            {m.name}
                            {m.featured && <span className="top-badge" style={{ marginLeft: 6 }}>TOP</span>}
                          </div>
                          <div className="mo-desc">{m.desc.pt}</div>
                          <div className="mo-chips">
                            <span className="mo-chip">{m.res}</span>
                            {m.cat === "video" && <span className="mo-chip">{m.durs[0]}–{m.max}</span>}
                            <span className="mo-chip">{m.ref}</span>
                          </div>
                        </div>
                        <span className="mo-cost">
                          {m.cat === "video" ? `${m.costPerSec}cr/s` : m.cat === "image" ? `${m.costPerImg}cr` : `${m.costFixed}cr`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className="field" style={{ position: "relative" }}>
                <span className="label">Prompt</span>
                <textarea
                  ref={promptRef}
                  className="inp"
                  style={{ minHeight: 120, paddingBottom: 40 }}
                  placeholder={cmode === "video" ? "Descreva o que você quer… use @personagem. Ex.: casal numa cafeteria de manhã" : cmode === "image" ? "Descreva a imagem cinematográfica…" : "Descreva o estilo musical ou efeito sonoro…"}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
                <button className="btn btn-ghost btn-sm" style={{ position: "absolute", right: 8, bottom: 8 }}
                  onClick={() => setPrompt(p => p + " cinematic shot, 35mm lens, shallow depth of field, volumetric lighting, film color grading, 4k")}>
                  ✨ Aprimorar
                </button>
              </div>

              {/* References */}
              {cmode !== "audio" && (
                <div className="field">
                  <span className="label">Referências / Uploads</span>

                  {/* Start + End frame for video */}
                  {cmode === "video" && (
                    <div className="row" style={{ marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div className="drop-zone" onClick={() => startRef.current?.click()}>
                          {startFrame ? <img src={startFrame} style={{ maxHeight: 56, borderRadius: 6, margin: "0 auto", display: "block" }} /> : "📷 Frame inicial"}
                        </div>
                        <input type="file" ref={startRef} className="hide" accept="image/*" onChange={e => setFrame("start", e)} style={{ display: "none" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="drop-zone" onClick={() => endRef.current?.click()}>
                          {endFrame ? <img src={endFrame} style={{ maxHeight: 56, borderRadius: 6, margin: "0 auto", display: "block" }} /> : "📷 Frame final"}
                        </div>
                        <input type="file" ref={endRef} className="hide" accept="image/*" onChange={e => setFrame("end", e)} style={{ display: "none" }} />
                      </div>
                    </div>
                  )}

                  <div className="drop-zone" onClick={() => fileRef.current?.click()}>
                    📎 {refs.length > 0 ? `${refs.length} referência(s) — clique para adicionar` : "Arraste ou clique para adicionar referências (@)"}
                  </div>
                  <input type="file" ref={fileRef} style={{ display: "none" }} accept="image/*,video/*" multiple onChange={addRef} />

                  {refs.length > 0 && (
                    <div className="thumbs">
                      {refs.map((r, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <img src={r.src} className="thumb" />
                          <button onClick={() => removeRef(i)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--err)", border: "none", color: "#fff", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cost + Generate */}
            <div className="dc-card" style={{ marginBottom: 14 }}>
              <div className="cost-line">
                <span>Custo estimado</span>
                <b>{cost} cr{cmode === "video" ? ` · ${duration}s` : ""}</b>
              </div>
              <button className="btn btn-primary btn-full" disabled={loading} onClick={generate}>
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 14, height: 14, border: "2px solid rgba(26,20,8,.4)", borderTopColor: "#1a1408", borderRadius: "50%", animation: "spin .8s linear infinite", display: "inline-block" }} />
                    {stages[stageIdx] || "Gerando…"}
                  </span>
                ) : `Gerar · ${cost} cr`}
              </button>
              {loading && (
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${((stageIdx + 1) / stages.length) * 100}%` }} />
                </div>
              )}
              {error && <div className="err-box">{error}</div>}
            </div>

            {/* Camera & Output */}
            <div className="dc-card">
              <h3>Câmera & Output</h3>

              <div className="row">
                {/* Resolution */}
                <div className="field" style={{ flex: 1 }}>
                  <span className="label">Resolução</span>
                  <select className="inp" value={resolution} onChange={e => setResolution(e.target.value)} style={{ padding: "10px 12px" }}>
                    <option>480p</option>
                    <option>720p</option>
                    <option>1080p</option>
                    <option>4K</option>
                  </select>
                </div>

                {/* Aspect ratio */}
                <div className="field" style={{ flex: 1, position: "relative" }}>
                  <span className="label">Proporção</span>
                  <button className="model-sel" style={{ padding: "10px 12px" }} onClick={() => setAspectMenuOpen(o => !o)}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{aspect}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", flex: 1, textAlign: "left", marginLeft: 6 }}>
                      {ASPECT_RATIOS.find(a => a.v === aspect)?.sub}
                    </span>
                    <svg className={`chev${aspectMenuOpen ? " open" : ""}`} viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {aspectMenuOpen && (
                    <div className="aspect-menu">
                      {ASPECT_RATIOS.map(a => (
                        <div key={a.v} className={`aspect-opt${aspect === a.v ? " on" : ""}`} onClick={() => { setAspect(a.v); setAspectMenuOpen(false); }}>
                          <span style={{ fontWeight: 600 }}>{a.label}</span>
                          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{a.sub}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Duration (video only) */}
              {cmode === "video" && (
                <div className="field">
                  <span className="label">Duração · max {currentModel.max}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input type="range" min={currentModel.durs[0] || 5} max={parseInt(currentModel.max) || 15} value={duration}
                      onChange={e => setDuration(+e.target.value)}
                      style={{ flex: 1, accentColor: "var(--accent)" }} />
                    <b style={{ color: "var(--accent)", fontFamily: "var(--mono)", minWidth: 36 }}>{duration}s</b>
                  </div>
                </div>
              )}

              {/* Toggles */}
              {cmode === "video" && (
                <div className="tog-row">
                  <span>Gerar áudio</span>
                  <div className={`sw${genAudio ? " on" : ""}`} onClick={() => setGenAudio(a => !a)} />
                </div>
              )}

              {/* Group */}
              <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
                <span className="label">Grupo / Projeto</span>
                <input className="inp" style={{ padding: "9px 12px" }} placeholder="Geral" value={group} onChange={e => setGroup(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview + Gallery ── */}
          <div>
            <div className="dc-card" style={{ marginBottom: 14 }}>
              {/* Preview head */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>🎬</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 16 }}>Lights, Camera, AI</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                    {result ? "Sua geração — baixe ou reutilize" : loading ? stages[stageIdx] || "Gerando…" : "Descreva a cena e gere"}
                  </div>
                </div>
                {session && (
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)" }}>
                    {session.user?.credits ?? 0}s
                  </div>
                )}
              </div>

              {/* Preview stage */}
              <div className="preview-stage">
                {result ? (
                  <div style={{ width: "100%" }}>
                    <div style={{ display: "grid", placeItems: "center" }}>
                      {result.type === "video"
                        ? <video src={result.url} muted loop autoPlay playsInline controls style={{ maxWidth: "100%", maxHeight: 420, borderRadius: "var(--r)" }} referrerPolicy="no-referrer" />
                        : <img src={result.url} style={{ maxWidth: "100%", maxHeight: 420, borderRadius: "var(--r)", cursor: "pointer" }} referrerPolicy="no-referrer" />}
                    </div>
                    <div className="row" style={{ marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => download(result.url)}>⬇ Salvar</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setPrompt(result.prompt); }}>♻ Reutilizar</button>
                      <button className="btn btn-primary btn-sm" onClick={generate}>⟳ Gerar novamente</button>
                    </div>
                  </div>
                ) : loading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div style={{ width: 36, height: 36, border: "2px solid var(--accent-dim)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 14px" }} />
                    <div style={{ fontSize: 12, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>{stages[stageIdx]}</div>
                    <div className="prog-bar" style={{ marginTop: 16, maxWidth: 200, margin: "14px auto 0" }}>
                      <div className="prog-fill" style={{ width: `${((stageIdx + 1) / stages.length) * 100}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="preview-empty">
                    <div className="ic">🎬</div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--ink-3)" }}>Lights, Camera, AI</div>
                    <div style={{ fontSize: 12, marginTop: 6 }}>Selecione um preset e descreva sua cena</div>
                  </div>
                )}
              </div>
            </div>

            {/* Gallery strip */}
            <div className="dc-card">
              <h3 style={{ marginBottom: 12 }}>Galeria ({gallery.length})</h3>
              {gallery.length > 0 ? (
                <div className="gal-strip">
                  {gallery.slice(0, 12).map((g, i) => (
                    <div key={i} className="gi" onClick={() => setResult(g)} title={g.prompt?.slice(0, 60)}>
                      {g.type === "video"
                        ? <video src={g.url} muted playsInline preload="none" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
                        : <img src={g.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--ink-4)", textAlign: "center", padding: "20px 0" }}>
                  Suas gerações aparecerão aqui
                </div>
              )}
              {gallery.length > 12 && (
                <div style={{ marginTop: 10, textAlign: "center" }}>
                  <a href="/gallery" style={{ fontSize: 12, color: "var(--accent)" }}>Ver todas ({gallery.length}) →</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .hide { display: none !important; }
        select.inp { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236c707c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; appearance: none; -webkit-appearance: none; padding-right: 36px; }
      `}</style>
    </>
  );
}
