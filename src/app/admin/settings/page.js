"use client";
import { useState } from "react";

export default function AdminSettings() {
  const [msg, setMsg] = useState(null);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Site Settings</h1>
        <p className="text-sm text-white/40">Configure platform-wide settings and integrations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan limits */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Plan Configuration</h2>
          <p className="text-xs text-white/30 mb-5">Current plan limits (edit in config.js)</p>
          {[
            { name: "Básico", price: "R$99", credits: "150s", color: "text-blue-400" },
            { name: "Premium", price: "R$199", credits: "300s", color: "text-yellow-400" },
            { name: "Avançado", price: "R$349", credits: "600s", color: "text-purple-400" },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <span className={`text-sm font-semibold ${p.color}`}>{p.name}</span>
              <div className="text-right">
                <div className="text-xs text-white/70">{p.price}/mês</div>
                <div className="text-[11px] text-white/30">{p.credits} de vídeo</div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment methods status */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold mb-1">Payment Methods</h2>
          <p className="text-xs text-white/30 mb-5">Status of configured payment gateways</p>
          {[
            { name: "Stripe", icon: "💳", key: "STRIPE_SECRET_KEY", desc: "Cartão crédito/débito internacional" },
            { name: "MercadoPago", icon: "🏦", key: "MERCADOPAGO_ACCESS_TOKEN", desc: "Pix + Boleto + Cartão BR" },
            { name: "PayPal", icon: "🅿️", key: "NEXT_PUBLIC_PAYPAL_EMAIL", desc: "PayPal.me redirect" },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{p.icon}</span>
                <div>
                  <div className="text-xs font-medium text-white/80">{p.name}</div>
                  <div className="text-[11px] text-white/30">{p.desc}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30">Check .env</span>
            </div>
          ))}
        </div>

        {/* Webhook URLs */}
        <div className="bg-[#161616] border border-white/10 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-1">Webhook URLs</h2>
          <p className="text-xs text-white/30 mb-5">Configure these in your payment provider dashboards</p>
          <div className="space-y-3">
            {[
              { provider: "Stripe", url: `${typeof window !== "undefined" ? window.location.origin : "https://hollywoodstudio.ai"}/api/stripe/webhook`, event: "checkout.session.completed" },
              { provider: "MercadoPago", url: `${typeof window !== "undefined" ? window.location.origin : "https://hollywoodstudio.ai"}/api/mercadopago/webhook`, event: "payment" },
              { provider: "BytePlus/AI", url: `${typeof window !== "undefined" ? window.location.origin : "https://hollywoodstudio.ai"}/api/webhook/byteplus`, event: "Generation callback" },
            ].map(w => (
              <div key={w.provider} className="bg-[#111] border border-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white/70">{w.provider}</span>
                  <span className="text-[10px] text-white/30">{w.event}</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] text-yellow-400 font-mono flex-1 truncate">{w.url}</code>
                  <button onClick={() => { navigator.clipboard.writeText(w.url); setMsg(`${w.provider} URL copiada`); setTimeout(() => setMsg(null), 2000); }}
                    className="text-[10px] px-2 py-1 border border-white/10 rounded text-white/40 hover:text-white hover:border-white/25 transition-colors">
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
          {msg && <p className="text-xs text-yellow-400 mt-3">✓ {msg}</p>}
        </div>
      </div>
    </div>
  );
}
