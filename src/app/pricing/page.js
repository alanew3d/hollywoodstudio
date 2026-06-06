"use client";
import { useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";

const PLANS = [
  { id:"basico", name:"Básico", nameEn:"Basic", price:99, usd:19, credits:150, link:process.env.NEXT_PUBLIC_STRIPE_LINK_BASICO || "", features:["150 créditos / mês", "Studio básico", "Galeria", "Seedance/Kling conforme disponibilidade", "Suporte por email"] },
  { id:"premium", name:"Premium", nameEn:"Premium", price:199, usd:39, credits:300, link:process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM || "", highlight:true, badge:"MAIS POPULAR", features:["300 créditos / mês", "Studio completo", "Storyboard + Director Agent", "Upload de referências", "Templates premium"] },
  { id:"avancado", name:"Avançado", nameEn:"Advanced", price:349, usd:69, credits:600, link:process.env.NEXT_PUBLIC_STRIPE_LINK_AVANCADO || "", features:["600 créditos / mês", "Prioridade nos modelos", "Projetos ilimitados", "Acesso antecipado ao editor", "Concierge / beta founder"] },
];

function whatsappUrl(plan){
  const txt = encodeURIComponent(`Olá, quero contratar o plano ${plan.name} do Hollywood Studio AI por R$${plan.price}/mês.`);
  return `https://wa.me/5521999999999?text=${txt}`;
}

export default function PricingPage(){
  const { data: session, status } = useSession();
  const [method,setMethod]=useState("stripe");
  const [lang,setLang]=useState("pt");
  const pt=lang==="pt";
  const methods=[
    {id:"stripe",label:"Stripe / Cartão",desc:"Link de pagamento"},
    {id:"paypal",label:"PayPal",desc:"paypal.me/alansorrah"},
    {id:"whatsapp",label:"WhatsApp",desc:"contratação assistida"},
    {id:"mercadopago",label:"MercadoPago",desc:"Pix/Boleto quando webhook estiver ativo"},
  ];
  const pay = async(plan)=>{
    if(method==="paypal") return window.open(`https://www.paypal.com/paypalme/alansorrah/${plan.price}BRL`,"_blank");
    if(method==="whatsapp") return window.open(whatsappUrl(plan),"_blank");
    if(method==="stripe"){
      if(plan.link) return window.location.href=plan.link;
      return window.open(whatsappUrl(plan),"_blank");
    }
    if(method==="mercadopago"){
      if(status!=="authenticated") { alert("Para Pix/Boleto automático, primeiro configure o login Google. Vou abrir WhatsApp para contratação manual por enquanto."); return window.open(whatsappUrl(plan),"_blank"); }
      try{
        const res=await fetch("/api/mercadopago/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planId:plan.id})});
        const data=await res.json(); if(data.url) window.location.href=data.url; else throw new Error(data.error||"MercadoPago ainda não configurado");
      }catch(e){ alert(e.message); window.open(whatsappUrl(plan),"_blank"); }
    }
  };
  return <main className="min-h-screen bg-[#070707] px-6 py-12 text-white md:px-12"><div className="mx-auto max-w-7xl">
    <div className="text-center"><p className="text-xs font-black uppercase tracking-[.32em] text-[#d4a857]">Hollywood Studio AI</p><h1 className="mt-3 text-4xl font-black md:text-6xl">{pt?"Planos & Créditos":"Plans & Credits"}</h1><p className="mx-auto mt-4 max-w-2xl text-zinc-400">{pt?"Contratação já pode funcionar via Stripe Payment Link, PayPal ou WhatsApp. Pix/Boleto entra quando MercadoPago estiver com webhook ativo.":"Subscribe with Stripe, PayPal or assisted WhatsApp."}</p></div>
    <div className="mt-6 flex justify-center gap-2"><button onClick={()=>setLang("pt")} className={`rounded-full px-4 py-2 text-xs font-black ${pt?"bg-[#d4a857] text-black":"bg-white/5 text-zinc-400"}`}>PT</button><button onClick={()=>setLang("en")} className={`rounded-full px-4 py-2 text-xs font-black ${!pt?"bg-[#d4a857] text-black":"bg-white/5 text-zinc-400"}`}>EN</button></div>
    <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-4">{methods.map(m=><button key={m.id} onClick={()=>setMethod(m.id)} className={`rounded-2xl border p-4 text-left ${method===m.id?"border-[#d4a857] bg-[#d4a857]/10":"border-white/10 bg-white/[.04]"}`}><div className="text-sm font-black">{m.label}</div><div className="mt-1 text-[11px] text-zinc-500">{m.desc}</div></button>)}</div>
    <div className="mt-10 grid gap-6 md:grid-cols-3">{PLANS.map(plan=><div key={plan.id} className={`relative rounded-3xl border p-7 ${plan.highlight?"border-[#d4a857] bg-[#d4a857]/10 shadow-2xl shadow-[#d4a857]/10":"border-white/10 bg-white/[.04]"}`}>{plan.badge&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#d4a857] px-4 py-1 text-[10px] font-black text-black">{plan.badge}</div>}<h2 className="text-2xl font-black">{pt?plan.name:plan.nameEn}</h2><div className="mt-4"><span className="text-5xl font-black text-[#d4a857]">R${plan.price}</span><span className="text-zinc-500">/mês</span></div><div className="mt-4 rounded-2xl border border-[#d4a857]/20 bg-black/20 p-4 text-center"><div className="text-3xl font-black text-[#f0d08a]">{plan.credits}</div><div className="text-[10px] uppercase tracking-widest text-zinc-500">créditos</div></div><ul className="mt-6 space-y-3">{plan.features.map(f=><li key={f} className="text-sm text-zinc-300"><span className="text-[#d4a857]">✓</span> {f}</li>)}</ul><button onClick={()=>pay(plan)} className={`mt-8 w-full rounded-xl py-4 text-sm font-black uppercase tracking-widest ${plan.highlight?"bg-[#d4a857] text-black":"border border-white/15 bg-white/10 text-white"}`}>{method==="whatsapp"?"Solicitar acesso":`Contratar ${plan.name}`}</button></div>)}</div>
    <div className="mt-10 rounded-3xl border border-white/10 bg-white/[.04] p-6 text-sm leading-7 text-zinc-400"><b className="text-[#f0d08a]">Status:</b> para liberação automática de créditos, precisamos terminar Google OAuth + webhooks. Até lá, os planos podem ser contratados via Stripe/PayPal/WhatsApp e liberados manualmente no admin.</div>
  </div></main>
}
