"use client";
import { useEffect, useMemo, useState } from "react";

const PLAN_NAMES = { free: "Free", basico: "Básico", premium: "Premium", avancado: "Avançado" };
const cx = (...a) => a.filter(Boolean).join(" ");
function Card({ children, className="" }) { return <div className={cx("bg-[#161616] border border-white/10 rounded-xl p-5", className)}>{children}</div>; }
function Label({ children }) { return <label className="text-[11px] uppercase tracking-[.12em] text-white/35 block mb-1.5">{children}</label>; }
function Input(props) { return <input {...props} className={cx("w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60 placeholder-white/20", props.className)} />; }
function Select(props) { return <select {...props} className={cx("w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60", props.className)} />; }
function Textarea(props) { return <textarea {...props} className={cx("w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60 placeholder-white/20", props.className)} />; }
function Button({ children, className="", ...props }) { return <button {...props} className={cx("px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40", className || "bg-yellow-500 text-black hover:bg-yellow-400")} >{children}</button>; }
function Status({ on, label }) { return <span className={cx("text-[10px] px-2 py-1 rounded-full font-semibold", on ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/30")}>{label || (on ? "ON" : "OFF")}</span>; }

const DEFAULT_MODELS = {
  seedance2pro: { name: "Seedance 2.0 Pro", provider: "BytePlus", category: "video", active: true, premium: false, minPlan: "basico", cost: 1.0, maxDuration: 15, badge: "live" },
  seedance2lite: { name: "Seedance 2.0 Lite", provider: "BytePlus", category: "video", active: true, premium: false, minPlan: "basico", cost: 0.7, maxDuration: 15, badge: "fast" },
  seedancei2v: { name: "Seedance I2V", provider: "BytePlus", category: "video", active: true, premium: true, minPlan: "premium", cost: 1.1, maxDuration: 15, badge: "image-to-video" },
  kling3: { name: "Kling 3.0", provider: "Atlas Cloud", category: "video", active: true, premium: true, minPlan: "premium", cost: 1.2, maxDuration: 10, badge: "motion" },
  veo31lite: { name: "Veo 3.1 Lite", provider: "Atlas Cloud", category: "video", active: true, premium: true, minPlan: "premium", cost: 1.5, maxDuration: 8, badge: "google" },
  veo31quality: { name: "Veo 3.1 Quality", provider: "Atlas Cloud", category: "video", active: true, premium: true, minPlan: "avancado", cost: 2.2, maxDuration: 8, badge: "quality" },
  fluxpro: { name: "Flux Pro", provider: "Black Forest / Atlas", category: "image", active: true, premium: false, minPlan: "basico", cost: 8, maxDuration: 0, badge: "image" },
  seedream5: { name: "Seedream 5", provider: "BytePlus", category: "image", active: true, premium: false, minPlan: "basico", cost: 6, maxDuration: 0, badge: "image" },
  imagen4: { name: "Imagen 4", provider: "Google / Atlas", category: "image", active: true, premium: true, minPlan: "premium", cost: 9, maxDuration: 0, badge: "image" },
  nanobanana2: { name: "Nano Banana 2", provider: "Atlas Cloud", category: "image", active: true, premium: false, minPlan: "basico", cost: 5, maxDuration: 0, badge: "characters" },
  elevenlabs: { name: "ElevenLabs", provider: "ElevenLabs", category: "audio", active: true, premium: true, minPlan: "premium", cost: 12, maxDuration: 0, badge: "voice" },
};
export default function AdminModels() {
  const [models, setModels] = useState(DEFAULT_MODELS); const [filter,setFilter]=useState("all"); const [msg,setMsg]=useState(null); const [saving,setSaving]=useState(false);
  useEffect(()=>{ fetch("/api/admin/platform").then(r=>r.ok?r.json():null).then(d=>d?.models&&setModels(d.models)).catch(()=>{}); },[]);
  const entries = useMemo(()=>Object.entries(models).filter(([_,m])=>filter==="all"||m.category===filter),[models,filter]);
  const update=(id,patch)=>setModels(m=>({...m,[id]:{...m[id],...patch}}));
  const addModel=()=>{ const id="custom"+Date.now(); setModels(m=>({...m,[id]:{name:"Novo Modelo",provider:"Atlas Cloud",category:"video",active:false,premium:false,minPlan:"basico",cost:1,maxDuration:10,badge:"beta"}})); };
  const save=async()=>{ setSaving(true); const r=await fetch("/api/admin/platform",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({models})}); const d=await r.json().catch(()=>({})); setMsg(r.ok?"Modelos salvos":(d.error||"Erro ao salvar")); setSaving(false); };
  return <div>
    <div className="mb-6 flex items-end justify-between gap-4"><div><h1 className="text-2xl font-bold text-white mb-1">Model Manager</h1><p className="text-sm text-white/40">Controle modelos visíveis, custos, planos mínimos e status premium.</p></div><div className="flex gap-2"><Button className="bg-white/10 text-white hover:bg-white/15" onClick={addModel}>+ Modelo</Button><Button onClick={save} disabled={saving}>{saving?"Salvando…":"Salvar modelos"}</Button></div></div>
    {msg && <div className="mb-4 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">{msg}</div>}
    <div className="flex gap-2 mb-4">{["all","video","image","audio"].map(f=><button key={f} onClick={()=>setFilter(f)} className={cx("px-3 py-1.5 rounded-lg text-xs capitalize",filter===f?"bg-yellow-500 text-black":"bg-white/5 text-white/50")}>{f}</button>)}</div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{entries.map(([id,m])=><Card key={id}>
      <div className="flex items-start justify-between gap-3 mb-3"><div><div className="text-[10px] font-mono text-white/25">{id}</div><Input value={m.name||""} onChange={e=>update(id,{name:e.target.value})} className="mt-1 font-semibold"/></div><Status on={m.active}/></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><Label>Categoria</Label><Select value={m.category} onChange={e=>update(id,{category:e.target.value})}>{["video","image","audio"].map(x=><option key={x}>{x}</option>)}</Select></div>
        <div><Label>Provider</Label><Input value={m.provider||""} onChange={e=>update(id,{provider:e.target.value})}/></div>
        <div><Label>Plano mínimo</Label><Select value={m.minPlan||"basico"} onChange={e=>update(id,{minPlan:e.target.value})}>{["free","basico","premium","avancado"].map(x=><option key={x}>{x}</option>)}</Select></div>
        <div><Label>Badge</Label><Input value={m.badge||""} onChange={e=>update(id,{badge:e.target.value})}/></div>
        <div><Label>Custo/créditos</Label><Input type="number" step="0.1" value={m.cost||0} onChange={e=>update(id,{cost:+e.target.value})}/></div>
        <div><Label>Max duração</Label><Input type="number" value={m.maxDuration||0} onChange={e=>update(id,{maxDuration:+e.target.value})}/></div>
        <label className="flex items-center gap-2 text-xs text-white/60 pt-6"><input type="checkbox" checked={!!m.active} onChange={e=>update(id,{active:e.target.checked})}/> Ativo</label>
        <label className="flex items-center gap-2 text-xs text-white/60 pt-6"><input type="checkbox" checked={!!m.premium} onChange={e=>update(id,{premium:e.target.checked})}/> Premium</label>
      </div>
    </Card>)}</div>
  </div>;
}
