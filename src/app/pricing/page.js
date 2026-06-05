"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { FaBolt, FaCoins, FaCheckCircle, FaStar } from "react-icons/fa";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const [loadingTier, setLoadingTier] = useState(null);

  const tiers = [
    {
      id: "basico",
      name: "Básico",
      credits: 150,
      price: 99,
      description: "Para começar a gerar vídeos e validar ideias com agilidade.",
      features: ["150 segundos de vídeo", "Text-to-video e image-to-video", "Histórico de criações", "Suporte inicial"],
      highlight: false,
    },
    {
      id: "premium",
      name: "Premium",
      credits: 300,
      price: 199,
      description: "O melhor equilíbrio para criadores, produtoras e campanhas.",
      features: ["300 segundos de vídeo", "Uso profissional recorrente", "Galeria e histórico", "Prioridade na evolução da plataforma"],
      highlight: true,
    },
    {
      id: "avancado",
      name: "Avançado",
      credits: 600,
      price: 349,
      description: "Para alto volume de testes, variações e produção comercial.",
      features: ["600 segundos de vídeo", "Mais margem para refações", "Fluxo completo de produção", "Indicado para equipes criativas"],
      highlight: false,
    },
  ];

  const handleCheckout = async (planId, tierName) => {
    if (status !== "authenticated") {
      signIn();
      return;
    }

    try {
      setLoadingTier(tierName);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Stripe error", err);
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="flex-1 bg-transparent overflow-y-auto custom-scrollbar p-4 md:p-12">
      <header className="max-w-7xl mx-auto mb-16 text-center space-y-4 pt-4 md:pt-0">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[10px] font-semibold tracking-[0.4em] uppercase">
          Créditos cinematográficos
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground drop-shadow-sm">
          PLANOS HOLLYWOOD STUDIO AI
        </h1>
        <p className="text-muted font-medium text-xs uppercase tracking-widest max-w-xl mx-auto leading-loose">
          Modelo simples: 1 crédito = 1 segundo de vídeo gerado. <br />
          Escolha o pacote ideal para sua produção.
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-8 rounded-2xl border transition-all flex flex-col ${
              tier.highlight
                ? "bg-glass-bg backdrop-blur-3xl border-primary-500 shadow-xl shadow-primary-500/10"
                : "bg-glass-bg backdrop-blur-3xl border-glass-border shadow-sm"
            }`}
          >
            {tier.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-primary-500 rounded-full text-black text-[9px] font-semibold uppercase tracking-widest shadow-lg">
                Mais escolhido
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight mb-2 text-foreground drop-shadow-sm">{tier.name}</h3>
              <p className="text-xs text-muted font-medium leading-relaxed">{tier.description}</p>
            </div>

            <div className="mb-8 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm">R${tier.price}</span>
              <span className="text-xs font-medium text-muted mb-1.5 uppercase tracking-widest">/ pacote</span>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-glass-hover border border-glass-border shadow-inner">
                <FaCoins className="text-yellow-500 text-lg" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-medium text-muted uppercase tracking-widest leading-none mb-1">Inclui</span>
                  <span className="text-lg font-semibold text-foreground drop-shadow-sm">{tier.credits} créditos</span>
                </div>
              </div>

              <ul className="space-y-3 pt-2">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-xs font-medium text-muted">
                    <FaCheckCircle className="text-primary-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckout(tier.id, tier.name)}
              disabled={loadingTier === tier.name}
              className={`w-full h-12 rounded-xl font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                tier.highlight
                  ? "bg-primary-500 text-black hover:bg-primary-600 shadow-primary-500/20"
                  : "bg-[var(--solid-bg)] text-foreground hover:opacity-80 border border-glass-border"
              } disabled:opacity-20`}
            >
              {loadingTier === tier.name ? <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div> : <>Comprar créditos <FaBolt className={tier.highlight ? "text-black" : "text-muted"} /></>}
            </button>
          </motion.div>
        ))}
      </div>

      <footer className="max-w-7xl mx-auto py-12 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-[10px] font-semibold tracking-[0.4em] text-muted uppercase">Saldo atual</div>
          <div className="text-lg font-medium flex items-center gap-3">
            Você tem: <span className="text-foreground font-semibold">{session?.user?.credits || 0} créditos</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-muted text-[10px] font-semibold uppercase tracking-widest text-center">
          <FaStar className="text-yellow-500/30 hidden sm:block" /> Pagamento seguro via Stripe <FaStar className="text-yellow-500/30 hidden sm:block" />
        </div>
      </footer>

      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar{width:0}.custom-scrollbar{scrollbar-width:none}`}</style>
    </div>
  );
}
