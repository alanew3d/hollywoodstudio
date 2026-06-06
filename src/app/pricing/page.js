"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

const PLANS = [
  {
    id: "basico",
    name: "Básico",
    nameEn: "Basic",
    price: 99,
    priceUsd: 19,
    credits: 150,
    highlight: false,
    badge: null,
    features: {
      pt: ["150 segundos de vídeo/mês", "Seedance 2.0 + Kling 3.0", "Texto → Vídeo + Imagem → Vídeo", "Galeria pessoal", "Suporte por email"],
      en: ["150 seconds of video/month", "Seedance 2.0 + Kling 3.0", "Text → Video + Image → Video", "Personal gallery", "Email support"],
    },
  },
  {
    id: "premium",
    name: "Premium",
    nameEn: "Premium",
    price: 199,
    priceUsd: 39,
    credits: 300,
    highlight: true,
    badge: "MAIS POPULAR",
    features: {
      pt: ["300 segundos de vídeo/mês", "Todos os modelos (Veo 3, Flux, Seedream…)", "Storyboard com IA", "Director's Eye", "Suporte prioritário"],
      en: ["300 seconds of video/month", "All models (Veo 3, Flux, Seedream…)", "AI Storyboard", "Director's Eye", "Priority support"],
    },
  },
  {
    id: "avancado",
    name: "Avançado",
    nameEn: "Advanced",
    price: 349,
    priceUsd: 69,
    credits: 600,
    highlight: false,
    badge: null,
    features: {
      pt: ["600 segundos de vídeo/mês", "API direta + projetos ilimitados", "Director Agent (IA)", "Referência de personagens", "Concierge dedicado"],
      en: ["600 seconds of video/month", "Direct API + unlimited projects", "Director Agent (AI)", "Character reference", "Dedicated concierge"],
    },
  },
];

const PAYMENT_METHODS = [
  { id: "mercadopago", label: "Pix / Boleto / Cartão BR", labelEn: "Pix / Boleto / BR Card", icon: "🏦", desc: "MercadoPago — aprovação instantânea" },
  { id: "stripe", label: "Cartão Internacional", labelEn: "International Card", icon: "💳", desc: "Stripe — Visa, Mastercard, Amex" },
  { id: "paypal", label: "PayPal", labelEn: "PayPal", icon: "🅿️", desc: `PayPal.me` },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mercadopago");
  const [lang, setLang] = useState("pt");

  const pt = lang === "pt";
  const paymentError = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("payment") === "failed";
  const paymentPending = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("payment") === "pending";

  const handleCheckout = async (planId) => {
    if (status !== "authenticated") { signIn(); return; }

    try {
      setLoadingPlan(planId);
      const plan = PLANS.find((p) => p.id === planId);

      if (paymentMethod === "paypal") {
        const email = "alansorrah";
        const price = plan.price;
        window.open(`https://www.paypal.com/paypalme/${email}/${price}BRL`, "_blank");
        setLoadingPlan(null);
        return;
      }

      const endpoint = paymentMethod === "mercadopago"
        ? "/api/mercadopago/checkout"
        : "/api/stripe/checkout";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Erro ao criar checkout");
    } catch (err) {
      console.error("Checkout error", err);
      alert(pt ? `Erro: ${err.message}` : `Error: ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-semibold tracking-[0.4em] uppercase mb-6">
          Hollywood Studio AI
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {pt ? "Planos & Créditos" : "Plans & Credits"}
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          {pt
            ? "1 crédito = 1 segundo de vídeo gerado. Escolha seu plano e produza conteúdo cinematográfico com IA."
            : "1 credit = 1 second of generated video. Choose your plan and produce cinematic AI content."}
        </p>

        {/* Lang toggle */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setLang("pt")} className={`text-xs px-3 py-1 rounded-full ${lang === "pt" ? "bg-yellow-500 text-black font-bold" : "text-gray-500"}`}>PT</button>
          <button onClick={() => setLang("en")} className={`text-xs px-3 py-1 rounded-full ${lang === "en" ? "bg-yellow-500 text-black font-bold" : "text-gray-500"}`}>EN</button>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="max-w-2xl mx-auto px-4 mb-10">
        <p className="text-xs text-gray-500 text-center uppercase tracking-widest mb-3">
          {pt ? "Método de pagamento" : "Payment method"}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                paymentMethod === m.id
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="text-xl mb-1">{m.icon}</div>
              <div className="text-[11px] font-semibold">{pt ? m.label : m.labelEn}</div>
              <div className="text-[9px] text-gray-500 mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Status messages */}
      {paymentError && (
        <div className="max-w-xl mx-auto px-4 mb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center text-sm text-red-400">
            {pt ? "⚠ Pagamento não processado. Tente novamente ou escolha outro método." : "⚠ Payment not processed. Try again or choose another method."}
          </div>
        </div>
      )}
      {paymentPending && (
        <div className="max-w-xl mx-auto px-4 mb-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center text-sm text-yellow-400">
            {pt ? "⏳ Pagamento pendente. Seus créditos serão liberados após confirmação." : "⏳ Payment pending. Credits will be released after confirmation."}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                plan.highlight
                  ? "border-yellow-500 bg-gradient-to-b from-yellow-500/5 to-transparent shadow-xl shadow-yellow-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {pt ? plan.badge : "MOST POPULAR"}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">{pt ? plan.name : plan.nameEn}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-yellow-400">R${plan.price}</span>
                  <span className="text-xs text-gray-500">/{pt ? "mês" : "month"}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">≈ US${plan.priceUsd}/month</p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 text-center">
                <div className="text-2xl font-bold text-yellow-400">{plan.credits}s</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                  {pt ? "segundos de vídeo" : "video seconds"}
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features[lang].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-yellow-500 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                } disabled:opacity-40`}
              >
                {loadingPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {pt ? "Aguarde..." : "Loading..."}
                  </span>
                ) : (
                  pt ? `Assinar ${plan.name}` : `Subscribe ${plan.nameEn}`
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Credits info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {[
            { icon: "⚡", title: pt ? "1 crédito = 1 segundo" : "1 credit = 1 second", desc: pt ? "Créditos deduzidos automaticamente antes de gerar" : "Credits deducted automatically before generation" },
            { icon: "🔒", title: pt ? "Pagamento seguro" : "Secure payment", desc: pt ? "Stripe, MercadoPago e PayPal com criptografia" : "Stripe, MercadoPago and PayPal with encryption" },
            { icon: "📅", title: pt ? "Validade mensal" : "Monthly validity", desc: pt ? "Créditos renovam todo mês com o plano ativo" : "Credits renew monthly with an active plan" },
          ].map((item) => (
            <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-semibold mb-1">{item.title}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Current credits */}
        {session?.user && (
          <div className="mt-8 text-center text-sm text-gray-500">
            {pt ? "Créditos atuais:" : "Current credits:"}
            <span className="text-yellow-400 font-bold ml-2">{session.user.credits || 0}s</span>
          </div>
        )}
      </div>
    </div>
  );
}
