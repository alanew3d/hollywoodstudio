/**
 * HOLLYWOOD STUDIO AI — payments-service.js
 * Handles Stripe checkout initiation from the frontend.
 */

async function startCheckout(plan) {
  if (!window.S || !window.S.user || !window.S.user.uid) {
    if (typeof showToast === 'function') showToast('Faca login para assinar um plano.', 'warn');
    if (typeof go === 'function') go('login');
    return;
  }
  const btn = (typeof event !== 'undefined' && event && event.target) ? event.target : null;
  if (btn) { btn.disabled = true; btn.dataset.originalText = btn.textContent; btn.textContent = 'Aguarde...'; }
  try {
    const resp = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: window.S.user.uid, email: window.S.user.email }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.url) throw new Error(data.error || 'Checkout indisponivel. Verifique as configuracoes da Stripe.');
    window.location.href = data.url;
  } catch (err) {
    console.error('[startCheckout]', err);
    if (typeof showToast === 'function') showToast('Erro ao iniciar pagamento: ' + err.message, 'err');
    if (btn) { btn.disabled = false; btn.textContent = btn.dataset.originalText || 'Assinar'; }
  }
}

if (typeof window !== 'undefined') window.startCheckout = startCheckout;