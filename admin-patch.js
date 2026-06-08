/**
 * admin-patch.js
 * Adicione esta tag no index.html, ANTES do </body>:
 *   <script src="/admin-patch.js"></script>
 *
 * Este script:
 * 1. Carrega config do servidor ao iniciar (GET /api/admin/config)
 * 2. Adiciona botão "Salvar no servidor" no admin
 * 3. Verifica créditos pendentes após pagamento
 */

(function () {
  'use strict';

  // ── 1. Carregar config do servidor ao iniciar ──────────────────────────
  async function loadServerConfig() {
    try {
      const r = await fetch('/api/admin/config');
      if (!r.ok) return;
      const d = await r.json();
      if (!d.ok || !d.config) return;

      // Aplica por cima do config.js estático
      const cfg = d.config;
      if (window.HSAI_CONFIG) {
        // Merge profundo
        for (const k in cfg) {
          if (cfg[k] && typeof cfg[k] === 'object' && !Array.isArray(cfg[k])) {
            window.HSAI_CONFIG[k] = Object.assign({}, window.HSAI_CONFIG[k], cfg[k]);
          } else if (cfg[k] !== undefined && cfg[k] !== null) {
            window.HSAI_CONFIG[k] = cfg[k];
          }
        }
      }
      console.log('[HSAI] Config carregada do servidor ✓');
    } catch (e) {
      console.log('[HSAI] Config local (servidor indisponível)');
    }
  }

  // ── 2. Salvar config no servidor ────────────────────────────────────────
  window.saveConfigToServer = async function () {
    const adminPass = (window.CFG && window.CFG.ADMIN_PASS) || 'hw2026!';
    const token = prompt('Senha admin para salvar no servidor:', '');
    if (!token) return;

    // Coleta config atual (usa função existente do HTML se disponível)
    let cfgData = {};
    if (typeof window.fullConfigJS === 'function') {
      // Extrai do JS gerado
      const js = window.fullConfigJS();
      try {
        const match = js.match(/window\.HSAI_CONFIG\s*=\s*(\{[\s\S]*?\});?\s*$/);
        if (match) cfgData = eval('(' + match[1] + ')'); // eslint-disable-line
      } catch {}
    }
    if (!cfgData || !Object.keys(cfgData).length) {
      cfgData = Object.assign({}, window.HSAI_CONFIG || window.CFG || {});
    }

    const btn = document.getElementById('save-to-server-btn');
    const originalText = btn ? btn.textContent : '';
    if (btn) { btn.textContent = 'Salvando…'; btn.disabled = true; }

    try {
      const r = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cfgData),
      });
      const d = await r.json();
      if (d.ok) {
        if (typeof window.toast === 'function') {
          window.toast('✅ Configurações salvas no servidor! Clientes já usam a nova config.', 'ok');
        } else {
          alert('✅ Configurações salvas no servidor!');
        }
      } else {
        throw new Error(d.error || 'Erro desconhecido');
      }
    } catch (e) {
      const msg = e.message.includes('Unauthorized')
        ? '❌ Senha incorreta'
        : `❌ Erro: ${e.message}`;
      if (typeof window.toast === 'function') window.toast(msg, 'err');
      else alert(msg);
    } finally {
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
  };

  // ── 3. Injetar botão "Salvar no servidor" no admin ──────────────────────
  function injectSaveButton() {
    // Procura o botão "Copiar config.js completo" e injeta depois dele
    const copyBtn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent.includes('Copiar config.js') || b.textContent.includes('Copy full config')
    );
    if (copyBtn && !document.getElementById('save-to-server-btn')) {
      const btn = document.createElement('button');
      btn.id = 'save-to-server-btn';
      btn.className = 'btn btn-primary btn-sm';
      btn.style.cssText = 'background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none';
      btn.textContent = '☁ Salvar no servidor';
      btn.onclick = window.saveConfigToServer;
      copyBtn.parentNode.insertBefore(btn, copyBtn.nextSibling);
    }
  }

  // ── 4. Verificar créditos pendentes após pagamento ──────────────────────
  async function checkPendingCredits() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('payment') && !params.has('session_id')) return;

    const user = window.S && window.S.user;
    if (!user || !user.email) return;

    try {
      const uid = user.uid || '';
      const email = user.email || '';
      const r = await fetch(`/api/credits/check?uid=${encodeURIComponent(uid)}&email=${encodeURIComponent(email)}`);
      const d = await r.json();

      if (d.ok && d.credits > 0 && d.consumed) {
        // Adiciona créditos ao usuário local
        if (window.S) window.S.credits = (window.S.credits || 0) + d.credits;

        // Persiste
        const users = window.loadUsers ? window.loadUsers() : {};
        if (users[uid]) {
          users[uid].credits = (users[uid].credits || 0) + d.credits;
          if (window.saveUsers) window.saveUsers(users);
        }

        if (typeof window.updateCredits === 'function') window.updateCredits();

        // Mostra toast
        const msg = window.S.lang === 'pt'
          ? `✅ +${d.credits} créditos adicionados à sua conta!`
          : `✅ +${d.credits} credits added to your account!`;
        if (typeof window.toast === 'function') window.toast(msg, 'ok');

        // Limpa URL
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {
      console.error('[credits/check]', e);
    }
  }

  // ── 5. Observer para injetar botão quando admin renderizar ─────────────
  const observer = new MutationObserver(() => {
    const adminArea = document.querySelector('.admin-view, [data-view="admin"], #adminContent, .view');
    if (adminArea) injectSaveButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // ── Init ────────────────────────────────────────────────────────────────
  // Carrega config do servidor antes da app inicializar
  loadServerConfig().then(() => {
    // Após carregar, verifica créditos pendentes
    if (document.readyState === 'complete') checkPendingCredits();
    else window.addEventListener('load', checkPendingCredits);
  });

})();
