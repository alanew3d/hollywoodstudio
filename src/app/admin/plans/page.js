"use client";
import { useEffect, useState } from "react";

const PLAN_NAMES = { free: "Free", basico: "Básico", premium: "Premium", avancado: "Avançado" };
const cx = (...a) => a.filter(Boolean).join(" ");
function Card({ children, className="" }) { return <div className={cx("bg-[#161616] border border-white/10 rounded-xl p-5", className)}>{children}</div>; }
function Label({ children }) { return <label className="text-[11px] uppercase tracking-[.12em] text-white/35 block mb-1.5">{children}</label>; }
function Input(props) { return <input {...props} className={cx("w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60 placeholder-white/20", props.className)} />; }
function Select(props) { return <select {...props} className={cx("w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60", props.className)} />; }
function Textarea(props) { return <textarea {...props} className={cx("w-full bg-[#101010] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-yellow-500/60 placeholder-white/20", props.className)} />; }
function Button({ children, className="", ...props }) { return <button {...props} className={cx("px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40", className || "bg-yellow-500 text-black hover:bg-yellow-400")} >{children}</button>; }
function Status({ on, label }) { return <span className={cx("text-[10px] px-2 py-1 rounded-full font-semibold", on ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/30")}>{label || (on ? "ON" : "OFF")}</span>; }


const DEFAULT_PLANS = {
  basico: { name: "Básico", price: 99, credits: 150, active: true, stripeLink: "", mercadoPagoLink: "", paypalLink: "", whatsappLink: "", features: ["Studio básico", "Galeria privada", "150 créditos"] },
  premium: { name: "Premium", price: 199, credits: 300, active: true, stripeLink: "", mercadoPagoLink: "", paypalLink: "", whatsappLink: "", features: ["Studio completo", "Upload de referências", "Final Cut AI básico", "300 créditos"] },
  avancado: { name: "Avançado", price: 349, credits: 600, active: true, stripeLink: "", mercadoPagoLink: "", paypalLink: "", whatsappLink: "", features: ["Modelos premium", "Final Cut AI", "Acesso beta ao editor", "600 créditos"] },
};

export default function AdminPlans() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetch("/api/admin/platform").then(r=>r.ok?r.json():null).then(d=>d?.plans && setPlans(d.plans)).catch(()=>{}); }, []);
  const update = (key, patch) => setPlans(p => ({ ...p, [key]: { ...p[key], ...patch } }));
  const save = async () => {
    setSaving(true); setMsg(null);
    const r = await fetch("/api/admin/platform", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ plans }) });
    const d = await r.json().catch(()=>({}));
    setMsg(r.ok ? "Planos salvos. Se a API avisar tabela ausente, rode npx prisma db push." : (d.error || "Erro ao salvar"));
    setSaving(false);
  };

  return <div>
    <div className="mb-6 flex items-end justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-white mb-1">Plans & Checkout</h1><p className="text-sm text-white/40">Edite preços, créditos, status e links públicos de contratação.</p></div>
      <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar planos"}</Button>
    </div>
    {msg && <div className="mb-4 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">{msg}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {Object.entries(plans).map(([key,p]) => <Card key={key}>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-white">{p.name}</h2><Status on={p.active} /></div>
        <div className="space-y-3">
          <div><Label>Nome do plano</Label><Input value={p.name||""} onChange={e=>update(key,{name:e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-3"><div><Label>Preço R$</Label><Input type="number" value={p.price||0} onChange={e=>update(key,{price:+e.target.value})}/></div><div><Label>Créditos</Label><Input type="number" value={p.credits||0} onChange={e=>update(key,{credits:+e.target.value})}/></div></div>
          <div><Label>Stripe Payment Link</Label><Input placeholder="https://buy.stripe.com/..." value={p.stripeLink||""} onChange={e=>update(key,{stripeLink:e.target.value})}/></div>
          <div><Label>MercadoPago Link</Label><Input placeholder="https://www.mercadopago.com.br/..." value={p.mercadoPagoLink||""} onChange={e=>update(key,{mercadoPagoLink:e.target.value})}/></div>
          <div><Label>PayPal Link</Label><Input placeholder="https://paypal.me/..." value={p.paypalLink||""} onChange={e=>update(key,{paypalLink:e.target.value})}/></div>
          <div><Label>WhatsApp de venda</Label><Input placeholder="https://wa.me/55..." value={p.whatsappLink||""} onChange={e=>update(key,{whatsappLink:e.target.value})}/></div>
          <div><Label>Features, uma por linha</Label><Textarea rows={5} value={(p.features||[]).join("\n")} onChange={e=>update(key,{features:e.target.value.split("\n").filter(Boolean)})}/></div>
          <label className="flex items-center gap-2 text-xs text-white/60"><input type="checkbox" checked={!!p.active} onChange={e=>update(key,{active:e.target.checked})}/> Plano ativo no pricing</label>
        </div>
      </Card>)}
    </div>
  </div>;
}
