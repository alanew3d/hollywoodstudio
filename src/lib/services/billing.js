import config from "@/lib/config";
import { UserService } from "./user";
import { prisma } from "@/lib/prisma";

// ══════════════════════════════════════════════════
// STRIPE — cartão crédito/débito (nacional + internacional)
// ══════════════════════════════════════════════════
export const StripeService = {
  /**
   * Cria sessão de checkout Stripe (para planos sem Payment Link)
   */
  async createCheckoutSession(userId, planId) {
    const { stripe } = await import("@/lib/stripe");
    const plan = config.plans[planId];
    if (!plan) throw new Error(`Plano inválido: ${planId}`);

    // Se tem Payment Link configurado, usar direto (sem criar sessão)
    if (plan.stripeLink) {
      return { url: plan.stripeLink };
    }

    // Checkout dinâmico (para casos sem Payment Link)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "brl",
          product_data: {
            name: `Hollywood Studio AI — Plano ${plan.name}`,
            description: `${plan.credits} segundos de vídeo/mês`,
          },
          unit_amount: plan.price * 100, // centavos
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${config.app.url}/studio?payment=success&plan=${planId}`,
      cancel_url: `${config.app.url}/pricing?canceled=true`,
      metadata: { userId, planId, credits: plan.credits.toString() },
      locale: "pt-BR",
    });

    return { url: session.url };
  },

  async handleWebhook(body, signature) {
    const { stripe } = await import("@/lib/stripe");
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
    } catch (err) {
      throw new Error(`Stripe Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const credits = parseInt(session.metadata?.credits || "0");

      if (userId && credits > 0) {
        await UserService.activatePlan(userId, planId || "basico", credits);
        await prisma.payment.create({
          data: {
            userId,
            provider: "stripe",
            externalId: session.id,
            plan: planId || "basico",
            amount: (session.amount_total || 0) / 100,
            credits,
            status: "paid",
            paidAt: new Date(),
            metadata: { sessionId: session.id },
          },
        });
        return { success: true, userId, credits };
      }
    }

    return { success: false };
  },
};

// ══════════════════════════════════════════════════
// MERCADOPAGO — Pix + Boleto + Cartão BR
// A forma mais simples: Payment Link gerado via API
// ══════════════════════════════════════════════════
export const MercadoPagoService = {
  async createPreference(userId, planId) {
    const plan = config.plans[planId];
    if (!plan) throw new Error(`Plano inválido: ${planId}`);

    const accessToken = config.mercadopago.accessToken;
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");

    // Cria external_reference para identificar o pagamento no webhook
    const externalRef = `hsai_${userId}_${planId}_${Date.now()}`;

    const preference = {
      items: [{
        id: planId,
        title: `Hollywood Studio AI — Plano ${plan.name}`,
        description: `${plan.credits} segundos de vídeo/mês`,
        quantity: 1,
        unit_price: plan.price,
        currency_id: "BRL",
      }],
      payment_methods: {
        // Habilita todos: cartão, Pix, boleto
        excluded_payment_types: [],
        installments: 1,
      },
      payer: {
        // MercadoPago pedirá os dados no checkout
      },
      back_urls: {
        success: config.mercadopago.successUrl,
        failure: config.mercadopago.failureUrl,
        pending: config.mercadopago.pendingUrl,
      },
      auto_return: "approved",
      external_reference: externalRef,
      notification_url: `${config.app.webhookUrl}/api/mercadopago/webhook`,
      metadata: { userId, planId, credits: plan.credits },
    };

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`MercadoPago Error: ${res.status} ${err}`);
    }

    const data = await res.json();

    // Salva pagamento pendente
    await prisma.payment.create({
      data: {
        userId,
        provider: "mercadopago",
        externalId: externalRef,
        plan: planId,
        amount: plan.price,
        credits: plan.credits,
        status: "pending",
        metadata: { preferenceId: data.id, externalRef },
      },
    });

    return {
      // init_point = link do checkout completo (todos os métodos)
      // sandbox_init_point = ambiente de teste
      url: process.env.NODE_ENV === "production" ? data.init_point : data.sandbox_init_point,
      preferenceId: data.id,
    };
  },

  async handleWebhook(body) {
    const accessToken = config.mercadopago.accessToken;
    const { type, data } = body;

    // MercadoPago manda notificações de "payment" quando aprovado
    if (type !== "payment") return { success: false };

    const paymentId = data?.id;
    if (!paymentId) return { success: false };

    // Busca detalhes do pagamento na API MP
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`MP: erro ao buscar pagamento ${paymentId}`);
    const payment = await res.json();

    if (payment.status !== "approved") return { success: false, status: payment.status };

    // Extrai userId e planId do external_reference ou metadata
    const externalRef = payment.external_reference;
    const metadata = payment.metadata || {};
    const userId = metadata.userId;
    const planId = metadata.planId;
    const credits = parseInt(metadata.credits || "0");

    if (!userId || !credits) {
      console.error("[MP_WEBHOOK] Metadata incompleto:", { userId, planId, credits, externalRef });
      return { success: false };
    }

    // Ativa plano
    await UserService.activatePlan(userId, planId || "basico", credits);
    await prisma.payment.updateMany({
      where: { externalId: externalRef, provider: "mercadopago" },
      data: { status: "paid", paidAt: new Date() },
    });

    return { success: true, userId, credits };
  },
};

// ══════════════════════════════════════════════════
// PAYPAL — Payment Link simples (redirecionamento)
// Para uso via paypal.me/alansorrah ou botão PayPal
// ══════════════════════════════════════════════════
export const PayPalService = {
  /**
   * Retorna URL do PayPal.me com valor pré-preenchido.
   * Confirmação manual pelo admin (ou PayPal IPN/webhook).
   */
  getPaymentUrl(planId) {
    const plan = config.plans[planId];
    if (!plan) throw new Error(`Plano inválido: ${planId}`);
    const email = config.paypal.email.split("@")[0];
    return `https://www.paypal.com/paypalme/${email}/${plan.price}BRL`;
  },
};
