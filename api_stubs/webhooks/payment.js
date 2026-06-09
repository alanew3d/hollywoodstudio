import { createStubHandler } from '../_lib/stub.js';
export default createStubHandler('/api/webhooks/payment', { message: 'Webhook genérico de pagamento — use /api/stripe/webhook para Stripe.' });
