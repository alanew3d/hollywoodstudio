import { stripe } from "@/lib/stripe";
import config from "@/lib/config";
import { UserService } from "./user";

/**
 * Stripe billing for Hollywood Studio AI.
 */
export const BillingService = {
  async createCheckoutSession(userId, planId) {
    const plan = config.stripe.plans[planId];
    if (!plan) throw new Error(`Invalid plan: ${planId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: config.stripe.currency,
            product_data: {
              name: `Hollywood Studio AI — ${plan.name}`,
              description: `${plan.credits} créditos de vídeo. 1 crédito = 1 segundo.`,
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${config.auth.url}/pricing?success=true`,
      cancel_url: `${config.auth.url}/pricing?canceled=true`,
      metadata: {
        userId,
        planId,
        credits: String(plan.credits),
      },
    });

    return session.url;
  },

  async handleWebhook(body, signature) {
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, config.stripe.webhookSecret);
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const credits = parseInt(session.metadata.credits || "0", 10);

      if (userId && credits > 0) {
        await UserService.addCredits(userId, credits);
        return { success: true, userId, credits };
      }
    }

    return { success: false };
  },
};
