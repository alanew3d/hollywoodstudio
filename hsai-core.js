/**
 * hsai-core.js — Hollywood Studio AI Neural Network Layer + workflow helpers
 * No secrets. LocalStorage + console signals until Supabase backend.
 */
(function () {
  'use strict';

  var GRAPH_KEY = 'hsai_neural_signals';
  var PROJECT_KEY = 'hsai_project_state';

  window.HSAI_NEURAL_GRAPH = window.HSAI_NEURAL_GRAPH || {
    nodes: [],
    edges: [],
    signals: [],
    discoveryChannels: ['templates', 'demos', 'models', 'gallery', 'social', 'seo'],
  };

  function loadSignals() {
    try { return JSON.parse(localStorage.getItem(GRAPH_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveSignals(arr) {
    localStorage.setItem(GRAPH_KEY, JSON.stringify(arr.slice(0, 500)));
    window.HSAI_NEURAL_GRAPH.signals = arr;
  }

  window.trackSignal = function (payload) {
    payload = payload || {};
    var sig = {
      type: payload.type || 'unknown',
      source: payload.source || '',
      target: payload.target || '',
      action: payload.action || '',
      metadata: payload.metadata || {},
      at: new Date().toISOString(),
    };
    var arr = loadSignals();
    arr.unshift(sig);
    saveSignals(arr);
    if (typeof console !== 'undefined' && console.debug) {
      console.debug('[HSAI Neural]', sig.type, sig.source, '→', sig.target);
    }
    return sig;
  };

  window.saveProjectState = function (state) {
    state = state || {};
    var uid = (window.S && window.S.user && window.S.user.uid) || 'guest';
    var key = PROJECT_KEY + '_' + uid;
    var prev = {};
    try { prev = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
    var merged = Object.assign({}, prev, state, { updatedAt: Date.now() });
    localStorage.setItem(key, JSON.stringify(merged));
    trackSignal({ type: 'user_started_project', source: state.source || 'studio', action: 'save', metadata: { hasPrompt: !!state.prompt } });
    return merged;
  };

  window.getProjectState = function () {
    var uid = (window.S && window.S.user && window.S.user.uid) || 'guest';
    try { return JSON.parse(localStorage.getItem(PROJECT_KEY + '_' + uid) || '{}'); }
    catch (e) { return {}; }
  };

  window.recommendNextActions = function (projectState) {
    projectState = projectState || window.getProjectState();
    var pt = window.S && window.S.lang === 'pt';
    var recs = [];

    if (projectState.prompt && !projectState.references?.length && !(projectState.mediaUrl)) {
      recs.push({ id: 'add_ref', label: pt ? 'Adicionar referência visual' : 'Add visual reference', action: 'studio' });
    }
    if ((projectState.prompt || projectState.mediaUrl) && !projectState.model) {
      recs.push({ id: 'pick_model', label: pt ? 'Escolher modelo ideal' : 'Pick ideal model', action: 'models' });
    }
    if (projectState.output) {
      recs.push({ id: 'post', label: pt ? 'Enviar para Pós-Produção' : 'Send to Post-Production', action: 'posprodu' });
      recs.push({ id: 'social', label: pt ? 'Preparar post social' : 'Prepare social post', action: 'instagram' });
    }
    if (window.S && window.S.credits === 0 && !window.isGuest?.()) {
      recs.push({ id: 'plan', label: pt ? 'Ver planos' : 'View plans', action: 'plans' });
    }
    return recs;
  };

  window.shareContent = function (opts) {
    opts = opts || {};
    var title = opts.title || 'Hollywood Studio AI';
    var text = opts.text || opts.description || '';
    var url = opts.url || (typeof location !== 'undefined' ? location.href : 'https://hollywoodstudio.ai');
    var platform = (opts.platform || '').toLowerCase();

    trackSignal({ type: 'user_shared_content', source: opts.source || 'share', action: platform || 'native', metadata: { title: title } });

    if (platform === 'whatsapp') {
      window.open('https://wa.me/?text=' + encodeURIComponent((text ? text + '\n' : '') + url), '_blank');
      return true;
    }
    if (platform === 'twitter' || platform === 'x') {
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
      return true;
    }
    if (platform === 'linkedin') {
      window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url), '_blank');
      return true;
    }
    if (platform === 'facebook') {
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
      return true;
    }
    if (platform === 'copy' || platform === 'link') {
      return navigator.clipboard.writeText(url).then(function () {
        if (typeof window.toast === 'function') window.toast((window.S && window.S.lang === 'pt') ? 'Link copiado' : 'Link copied', 'ok');
      });
    }
    if (platform === 'prompt' && opts.prompt) {
      return navigator.clipboard.writeText(opts.prompt).then(function () {
        if (typeof window.toast === 'function') window.toast((window.S && window.S.lang === 'pt') ? 'Prompt copiado' : 'Prompt copied', 'ok');
      });
    }
    if (navigator.share) {
      return navigator.share({ title: title, text: text, url: url }).catch(function () {});
    }
    return navigator.clipboard.writeText(url).then(function () {
      if (typeof window.toast === 'function') window.toast((window.S && window.S.lang === 'pt') ? 'Link copiado' : 'Link copied', 'ok');
    });
  };

  window.openCreditLimitModal = function () {
    var pt = window.S && window.S.lang === 'pt';
    var existing = document.getElementById('creditLimitModal');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'overlay show';
    overlay.id = 'creditLimitModal';
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML =
      '<div class="modal modal-card" style="max-width:480px;width:96%">' +
      '<span class="modal-close" onclick="document.getElementById(\'creditLimitModal\').remove()">×</span>' +
      '<h3 class="serif" style="margin:0 0 8px">' + (pt ? 'Pronto para gerar' : 'Ready to generate') + '</h3>' +
      '<p style="color:var(--ink-3);font-size:13px;line-height:1.6;margin-bottom:18px">' +
      (pt
        ? 'Seu projeto já está pronto para gerar. Para continuar em alta qualidade, escolha um plano ou compre créditos.<br><br><small>Créditos grátis são para testar. Produção real exige plano ou compra aprovada.</small>'
        : 'Your project is ready to generate. To continue in high quality, choose a plan or buy credits.<br><br><small>Free credits are for testing. Real production requires a plan or approved purchase.</small>') +
      '</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button class="btn btn-primary" onclick="document.getElementById(\'creditLimitModal\').remove();go(\'plans\')">' + (pt ? 'Ver planos' : 'View plans') + '</button>' +
      '<button class="btn btn-ghost" onclick="document.getElementById(\'creditLimitModal\').remove();go(\'plans\')">' + (pt ? 'Comprar créditos' : 'Buy credits') + '</button>' +
      '<button class="btn btn-ghost" onclick="document.getElementById(\'creditLimitModal\').remove()">' + (pt ? 'Continuar editando' : 'Keep editing') + '</button>' +
      '</div></div>';
    document.body.appendChild(overlay);
    trackSignal({ type: 'user_hit_credit_limit', source: 'studio', action: 'modal' });
  };

  window.openForgotPassword = function () {
    var pt = window.S && window.S.lang === 'pt';
    var existing = document.getElementById('forgotPwOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.className = 'overlay show';
    overlay.id = 'forgotPwOverlay';
    overlay.onclick = function (e) { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML =
      '<div class="modal modal-card" style="max-width:420px;width:96%">' +
      '<span class="modal-close" onclick="document.getElementById(\'forgotPwOverlay\').remove()">×</span>' +
      '<h3 style="margin:0 0 8px">' + (pt ? 'Esqueci minha senha' : 'Forgot password') + '</h3>' +
      '<p style="color:var(--ink-3);font-size:12.5px;margin-bottom:14px">' +
      (pt ? 'Digite seu e-mail. Se estiver cadastrado, enviaremos instruções de recuperação.' : 'Enter your email. If registered, we will send recovery instructions.') +
      '</p>' +
      '<input class="input" id="forgotPwEmail" type="email" placeholder="email@exemplo.com" style="width:100%;margin-bottom:12px">' +
      '<button class="btn btn-primary" style="width:100%" id="forgotPwSubmit">' + (pt ? 'Enviar' : 'Send') + '</button>' +
      '<p style="font-size:11px;color:var(--ink-4);margin-top:12px">' + (pt ? 'Integração: /api/auth/reset-password (Supabase/Resend)' : 'Integration: /api/auth/reset-password (Supabase/Resend)') + '</p>' +
      '</div>';
    document.body.appendChild(overlay);
    document.getElementById('forgotPwSubmit').onclick = function () {
      var email = (document.getElementById('forgotPwEmail') || {}).value || '';
      fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      }).catch(function () {});
      overlay.remove();
      if (typeof window.toast === 'function') {
        window.toast(pt ? 'Se este e-mail estiver cadastrado, enviaremos instruções.' : 'If this email is registered, we will send instructions.', 'ok');
      }
    };
  };

})();
