/**
 * hs-extensions.js
 * Patch cirúrgico para Hollywood Studio AI
 * Adiciona: Spider Web (canvas com teia animada) + Admin expandido (todos providers)
 * Não modifica o index.html — injeta via window.onload
 *
 * Como usar: adicione <script src="/hs-extensions.js"></script>
 * ANTES do </body> no index.html
 */

(function() {
'use strict';

/* ══════════════════════════════════════════════════════════
   1. SPIDER WEB — view + teia SVG animada
══════════════════════════════════════════════════════════ */

function viewSpiderWeb() {
  return `
  <div id="sw-wrap" style="position:relative;height:calc(100vh - 52px);overflow:hidden;background:#07080a">

    <!-- TEIA ANIMADA SVG (fundo) -->
    <canvas id="sw-spider-canvas" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.18;pointer-events:none"></canvas>

    <!-- TOOLBAR -->
    <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);
      background:rgba(14,15,18,0.92);border:1px solid #222;border-radius:12px;
      padding:8px 12px;display:flex;gap:6px;align-items:center;z-index:20;
      backdrop-filter:blur(8px);white-space:nowrap">
      <button class="btn btn-ghost btn-sm" onclick="swAddNode('prompt')">+ Prompt</button>
      <button class="btn btn-ghost btn-sm" onclick="swAddNode('model')">+ Modelo</button>
      <button class="btn btn-ghost btn-sm" onclick="swAddNode('output')">+ Output</button>
      <div style="width:1px;height:20px;background:#222;margin:0 4px"></div>
      <button class="btn btn-primary btn-sm" onclick="swRunAll()">▶ Executar</button>
      <div style="width:1px;height:20px;background:#222;margin:0 4px"></div>
      <button class="btn btn-ghost btn-sm" onclick="swClear()">✕ Limpar</button>
    </div>

    <!-- NODES CANVAS -->
    <svg id="sw-svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5"></svg>
    <div id="sw-nodes" style="position:absolute;inset:0;z-index:10"></div>

    <!-- HINT -->
    <div id="sw-hint" style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
      font-size:11px;color:#444;letter-spacing:1px;text-align:center;pointer-events:none;white-space:nowrap">
      Adicione nodes · Arraste para mover · Conecte as portas douradas
    </div>
  </div>`;
}

function afterSpiderWeb() {
  initSpiderCanvas();
  initSwNodes();
}

/* ── Teia animada ─────────────────────────────────────── */
function initSpiderCanvas() {
  const canvas = document.getElementById('sw-spider-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts, conns;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    build();
  }

  function build() {
    // pontos da teia
    const count = Math.floor((W * H) / 14000);
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
    // centro fixo como âncora
    pts.push({ x: W / 2, y: H / 2, vx: 0, vy: 0, anchor: true });
    buildConns();
  }

  function buildConns() {
    conns = [];
    const DIST = Math.min(W, H) * 0.28;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < DIST) conns.push([i, j]);
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // filamentos da teia
    const DIST = Math.min(W, H) * 0.28;
    for (const [i, j] of conns) {
      const a = pts[i], b = pts[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > DIST) continue;
      const alpha = 1 - d / DIST;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(201,168,76,${alpha * 0.6})`;
      ctx.lineWidth = alpha * 0.8;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // nós
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.anchor ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = p.anchor ? 'rgba(201,168,76,0.9)' : 'rgba(201,168,76,0.5)';
      ctx.fill();
    }
  }

  function tick() {
    for (const p of pts) {
      if (p.anchor) continue;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    // reconstrói conexões a cada 60 frames
    if (!draw._frame) draw._frame = 0;
    if (++draw._frame % 60 === 0) buildConns();
    draw();
    if (document.getElementById('sw-spider-canvas')) requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener('resize', resize);
  tick();
}

/* ── Sistema de nodes ─────────────────────────────────── */
const SW = {
  nodes: [], conns: [], counter: 0,
  dragging: null, dragOff: { x: 0, y: 0 },
  linking: null // { nodeId, port }
};

function initSwNodes() {
  const wrap = document.getElementById('sw-wrap');
  if (!wrap) return;

  document.addEventListener('mousemove', swMouseMove);
  document.addEventListener('mouseup',  () => { SW.dragging = null; });
}

function swAddNode(type) {
  const id = 'swn' + (++SW.counter);
  const x = 80  + Math.random() * (window.innerWidth  - 300);
  const y = 80  + Math.random() * (window.innerHeight - 300);
  const el = document.createElement('div');

  const colors = { prompt: '#3b82f6', model: '#c9a84c', output: '#22c55e' };
  const icons  = { prompt: '✍', model: '◈', output: '▦' };
  const labels = { prompt: 'Prompt', model: 'Modelo', output: 'Output' };

  el.id = id;
  el.className = 'sw-node';
  el.style.cssText = `position:absolute;left:${x}px;top:${y}px;
    background:rgba(14,15,18,0.95);border:1px solid #2a2a2a;border-radius:12px;
    min-width:210px;max-width:260px;cursor:default;
    box-shadow:0 4px 24px rgba(0,0,0,0.5);
    transition:border-color 0.15s;user-select:none;z-index:10`;

  let body = '';
  if (type === 'prompt') {
    body = `
      <div class="sw-port-row" style="justify-content:flex-end;margin-bottom:8px">
        <div class="sw-port-label" style="font-size:10px;color:#555;margin-right:6px">saída</div>
        <div class="sw-dot out" data-node="${id}" data-port="out"
          style="width:12px;height:12px;border-radius:50%;border:2px solid #c9a84c;
          background:#0e0f12;cursor:crosshair;transition:background 0.15s"
          onmousedown="swStartLink(event,'${id}','out')"></div>
      </div>
      <textarea id="${id}-txt" placeholder="Descreva o que quer gerar..."
        style="width:100%;background:#0a0a0c;border:1px solid #1e1e24;border-radius:6px;
        color:#e0e0e0;font-size:12px;padding:8px;resize:none;outline:none;
        font-family:inherit;min-height:64px;max-height:120px"
        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>`;
  } else if (type === 'model') {
    const models = ['seedance-2.5','minimax-h3','kling-3','wan-2.7','veo-3',
      'gpt-image-1','nano-banana-pro','flux-pro','grok-image-2',
      'gemini-2.5-flash','gpt-4o','grok-3'];
    body = `
      <div class="sw-port-row" style="display:flex;justify-content:space-between;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:6px">
          <div class="sw-dot in" data-node="${id}" data-port="in"
            style="width:12px;height:12px;border-radius:50%;border:2px solid #555;
            background:#0e0f12;cursor:crosshair"
            onmousedown="swStartLink(event,'${id}','in')"></div>
          <span style="font-size:10px;color:#555">entrada</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:10px;color:#555">saída</span>
          <div class="sw-dot out" data-node="${id}" data-port="out"
            style="width:12px;height:12px;border-radius:50%;border:2px solid #c9a84c;
            background:#0e0f12;cursor:crosshair"
            onmousedown="swStartLink(event,'${id}','out')"></div>
        </div>
      </div>
      <select id="${id}-model" style="width:100%;background:#0a0a0c;border:1px solid #1e1e24;
        border-radius:6px;color:#e0e0e0;font-size:12px;padding:8px;margin-bottom:8px">
        <optgroup label="Vídeo">
          ${['seedance-2.5','seedance-2','minimax-h3','kling-3','wan-2.7','veo-3','grok-video-1.5'].map(m=>`<option value="${m}">${m}</option>`).join('')}
        </optgroup>
        <optgroup label="Imagem">
          ${['gpt-image-1','nano-banana-pro','flux-pro','grok-image-2','imagen-3'].map(m=>`<option value="${m}">${m}</option>`).join('')}
        </optgroup>
        <optgroup label="Chat">
          ${['gemini-2.5-flash','gpt-4o','grok-3'].map(m=>`<option value="${m}">${m}</option>`).join('')}
        </optgroup>
      </select>
      <div id="${id}-status" style="font-size:10px;color:#555;min-height:14px;margin-bottom:8px"></div>
      <button style="width:100%;background:#c9a84c;border:none;border-radius:6px;
        color:#000;font-size:11px;font-weight:700;letter-spacing:1px;padding:8px;
        cursor:pointer;text-transform:uppercase"
        onclick="swRunNode('${id}')">▶ Executar</button>`;
  } else if (type === 'output') {
    body = `
      <div style="margin-bottom:8px;display:flex;align-items:center;gap:6px">
        <div class="sw-dot in" data-node="${id}" data-port="in"
          style="width:12px;height:12px;border-radius:50%;border:2px solid #555;
          background:#0e0f12;cursor:crosshair"
          onmousedown="swStartLink(event,'${id}','in')"></div>
        <span style="font-size:10px;color:#555">entrada</span>
      </div>
      <img id="${id}-img" style="width:100%;border-radius:6px;display:none" alt="output">
      <video id="${id}-vid" style="width:100%;border-radius:6px;display:none" controls muted loop></video>
      <div id="${id}-txt" style="font-size:11px;color:#888;line-height:1.5;display:none;
        background:#0a0a0c;border-radius:6px;padding:8px;max-height:100px;overflow-y:auto"></div>
      <div id="${id}-status" style="font-size:10px;color:#555;min-height:14px;margin-top:6px">Aguardando...</div>`;
  }

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:10px 14px;border-bottom:1px solid #1a1a1a;cursor:grab"
      onmousedown="swStartDrag(event,'${id}')">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
        color:#e0e0e0;display:flex;align-items:center;gap:7px">
        <div style="width:7px;height:7px;border-radius:50%;background:${colors[type]}"></div>
        ${icons[type]} ${labels[type]}
      </div>
      <button onclick="swRemoveNode('${id}')"
        style="background:none;border:none;color:#333;cursor:pointer;font-size:14px;
        padding:2px 4px;line-height:1;transition:color 0.15s"
        onmouseenter="this.style.color='#e74c3c'" onmouseleave="this.style.color='#333'">✕</button>
    </div>
    <div style="padding:12px 14px">${body}</div>`;

  document.getElementById('sw-nodes').appendChild(el);
  SW.nodes.push({ id, type, el });
  document.getElementById('sw-hint').style.display = 'none';
}

function swRemoveNode(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  SW.nodes = SW.nodes.filter(n => n.id !== id);
  SW.conns = SW.conns.filter(c => c.from !== id && c.to !== id);
  swDrawConns();
}

function swClear() {
  document.getElementById('sw-nodes').innerHTML = '';
  document.getElementById('sw-svg').innerHTML = '';
  SW.nodes = []; SW.conns = []; SW.counter = 0;
  document.getElementById('sw-hint').style.display = '';
}

function swStartDrag(e, id) {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' ||
      e.target.tagName === 'TEXTAREA') return;
  e.preventDefault();
  SW.dragging = id;
  const el = document.getElementById(id);
  const rect = el.getBoundingClientRect();
  SW.dragOff = { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function swMouseMove(e) {
  if (!SW.dragging) return;
  const el = document.getElementById(SW.dragging);
  if (!el) return;
  const wrap = document.getElementById('sw-wrap');
  const rect = wrap.getBoundingClientRect();
  el.style.left = Math.max(0, e.clientX - rect.left - SW.dragOff.x) + 'px';
  el.style.top  = Math.max(52, e.clientY - rect.top  - SW.dragOff.y) + 'px';
  swDrawConns();
}

function swStartLink(e, nodeId, port) {
  e.stopPropagation();
  if (SW.linking) {
    // completa conexão
    const from = port === 'out' ? nodeId      : SW.linking.nodeId;
    const to   = port === 'in'  ? nodeId      : SW.linking.nodeId;
    if (from !== to && !SW.conns.find(c => c.from === from && c.to === to)) {
      SW.conns.push({ from, to });
      swDrawConns();
    }
    SW.linking = null;
  } else {
    SW.linking = { nodeId, port };
  }
}

function swDrawConns() {
  const svg = document.getElementById('sw-svg');
  if (!svg) return;
  const wrap = document.getElementById('sw-wrap');
  const wr = wrap.getBoundingClientRect();
  svg.innerHTML = SW.conns.map(c => {
    const fEl = document.getElementById(c.from);
    const tEl = document.getElementById(c.to);
    if (!fEl || !tEl) return '';
    const fr = fEl.getBoundingClientRect();
    const tr = tEl.getBoundingClientRect();
    const x1 = fr.right - wr.left,   y1 = fr.top + fr.height / 2 - wr.top;
    const x2 = tr.left  - wr.left,   y2 = tr.top + tr.height / 2 - wr.top;
    const cx = (x1 + x2) / 2;
    return `<path d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}"
      fill="none" stroke="#c9a84c" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>
    <circle cx="${x1}" cy="${y1}" r="3" fill="#c9a84c" opacity="0.8"/>
    <circle cx="${x2}" cy="${y2}" r="3" fill="#c9a84c" opacity="0.8"/>`;
  }).join('');
}

async function swRunNode(nodeId) {
  const node = SW.nodes.find(n => n.id === nodeId);
  if (!node || node.type !== 'model') return;

  let prompt = '';
  const conn = SW.conns.find(c => c.to === nodeId);
  if (conn) {
    const src = SW.nodes.find(n => n.id === conn.from);
    if (src?.type === 'prompt') {
      prompt = document.getElementById(`${src.id}-txt`)?.value || '';
    }
  }
  if (!prompt) { alert('Conecte um node de Prompt com texto.'); return; }

  const model  = document.getElementById(`${nodeId}-model`)?.value;
  const status = document.getElementById(`${nodeId}-status`);
  const el     = document.getElementById(nodeId);

  el.style.borderColor = '#3b82f6';
  if (status) status.textContent = 'Gerando...';

  try {
    // tenta usar o sistema de geração do HSAI se disponível
    const token = localStorage.getItem('hs_token') || '';
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'generate', prompt, model, options: {} })
    });
    const data = await res.json();
    el.style.borderColor = '#2a2a2a';
    if (status) status.textContent = data.ok ? `✓ ${data.result?.provider || model}` : `✗ ${data.error}`;

    if (data.ok) {
      // envia resultado para nodes de output conectados
      SW.conns.filter(c => c.from === nodeId).forEach(c => {
        const out = SW.nodes.find(n => n.id === c.to && n.type === 'output');
        if (!out) return;
        const { result } = data;
        const img = document.getElementById(`${out.id}-img`);
        const vid = document.getElementById(`${out.id}-vid`);
        const txt = document.getElementById(`${out.id}-txt`);
        const st  = document.getElementById(`${out.id}-status`);
        if (result.type === 'image' && img) { img.src = result.url; img.style.display = 'block'; }
        if (result.type === 'video' && vid) { vid.src = result.url; vid.style.display = 'block'; }
        if (result.type === 'chat'  && txt) { txt.textContent = result.text; txt.style.display = 'block'; }
        if (st) st.textContent = '✓ Recebido';
      });
    }
  } catch (err) {
    el.style.borderColor = '#e74c3c';
    if (status) status.textContent = `✗ ${err.message}`;
  }
}

async function swRunAll() {
  for (const n of SW.nodes.filter(n => n.type === 'model')) {
    await swRunNode(n.id);
  }
}

/* Expõe funções globalmente */
window.swAddNode   = swAddNode;
window.swRemoveNode= swRemoveNode;
window.swClear     = swClear;
window.swStartDrag = swStartDrag;
window.swStartLink = swStartLink;
window.swRunNode   = swRunNode;
window.swRunAll    = swRunAll;

/* ══════════════════════════════════════════════════════════
   2. ADMIN EXPANDIDO — todos os providers
══════════════════════════════════════════════════════════ */

function adminApiKeysCardExpanded() {
  const keys = JSON.parse(localStorage.getItem('hsai_api_keys') || '{}');
  const pt = typeof S !== 'undefined' && S.lang === 'pt';

  const providers = [
    { id: 'openai',      label: 'OpenAI',              placeholder: 'sk-…',          desc: 'GPT Image 1/2, GPT-4o, DALL-E 3' },
    { id: 'xai',         label: 'xAI (Grok)',           placeholder: 'xai-…',         desc: 'Grok Image 2, Grok Video 1.5, Grok 3' },
    { id: 'google',      label: 'Google / Gemini',      placeholder: 'AIza…',         desc: 'Gemini 2.5, Imagen 3, Veo 3' },
    { id: 'byteplus',    label: 'BytePlus / Seedance',  placeholder: 'bp-…',          desc: 'Seedance 2 / 2.5, Seedream' },
    { id: 'fal',         label: 'fal.ai',               placeholder: 'fal-key-…',     desc: 'Nano Banana, Flux, MiniMax H3, Kling, Wan' },
    { id: 'minimax',     label: 'MiniMax',              placeholder: 'mm-…',          desc: 'MiniMax H3 (direto)' },
    { id: 'kling',       label: 'Kling (Kuaishou)',     placeholder: 'kling-…',       desc: 'Kling 3.0 (direto)' },
    { id: 'alibaba',     label: 'Alibaba Cloud',        placeholder: 'ali-…',         desc: 'Wan 2.7 / 3.0 (direto)' },
    { id: 'replicate',   label: 'Replicate',            placeholder: 'r8_…',          desc: 'Modelos open-source variados' },
    { id: 'openrouter',  label: 'OpenRouter',           placeholder: 'sk-or-…',       desc: 'Fallback universal (LLMs + alguns vídeos)' },
    { id: 'anthropic',   label: 'Anthropic / Claude',   placeholder: 'sk-ant-…',      desc: 'Claude Sonnet, Claude Opus' },
    { id: 'heygen',      label: 'HeyGen',               placeholder: 'OTgx…',         desc: 'Avatar IA' },
    { id: 'brevo',       label: 'Brevo (newsletter)',   placeholder: 'xkeysib-…',     desc: 'Email marketing' },
    { id: 'stripe',      label: 'Stripe',               placeholder: 'sk_live_…',     desc: 'Pagamentos (live key)' },
    { id: 'mercadopago', label: 'Mercado Pago',         placeholder: 'APP_USR-…',     desc: 'Pagamentos Brasil' },
  ];

  return `
    <div class="dc-card" style="margin-bottom:16px">
      <h3 style="margin-bottom:6px">🔑 API Keys — Todos os Providers</h3>
      <p style="font-size:12px;color:var(--ink-3);margin-bottom:16px;line-height:1.5">
        As chaves são salvas localmente (admin) e enviadas ao servidor via variáveis de ambiente no Vercel.
        <b>Nunca compartilhe este painel.</b>
      </p>

      <!-- STATUS RÁPIDO -->
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">
        ${providers.map(p => {
          const on = !!(keys[p.id] && keys[p.id].length > 4);
          return `<span style="font-size:10px;padding:3px 9px;border-radius:20px;font-weight:600;
            background:${on ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)'};
            border:1px solid ${on ? 'rgba(34,197,94,0.35)' : '#222'};
            color:${on ? '#22c55e' : '#444'}">
            ${on ? '●' : '○'} ${p.label}
          </span>`;
        }).join('')}
      </div>

      <!-- CAMPOS -->
      <div style="display:flex;flex-direction:column;gap:14px">
        ${providers.map(p => `
          <label>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span class="label" style="font-size:11px;font-weight:700">${p.label}</span>
              <span style="font-size:10px;color:var(--ink-4)">${p.desc}</span>
            </div>
            <input type="password" id="apiKey_${p.id}" class="input"
              placeholder="${p.placeholder}"
              value="${keys[p.id] || ''}"
              autocomplete="off"
              style="font-family:monospace;font-size:12px">
          </label>`).join('')}
      </div>

      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="saveApiKeysExpanded()">💾 Salvar todas as chaves</button>
        <button class="btn btn-ghost btn-sm" onclick="testProviderConnections()">🔌 Testar conexões</button>
        <button class="btn btn-ghost btn-sm" onclick="exportApiKeys()">📋 Exportar .env</button>
      </div>

      <div id="api-keys-status" style="margin-top:12px;font-size:12px;color:var(--ink-3)"></div>
    </div>`;
}

window.saveApiKeysExpanded = function() {
  const providers = ['openai','xai','google','byteplus','fal','minimax','kling',
    'alibaba','replicate','openrouter','anthropic','heygen','brevo','stripe','mercadopago'];
  const keys = {};
  providers.forEach(id => {
    const el = document.getElementById(`apiKey_${id}`);
    if (el && el.value.trim()) keys[id] = el.value.trim();
  });
  localStorage.setItem('hsai_api_keys', JSON.stringify(keys));
  // também salva no formato legado para compatibilidade
  const legacy = JSON.parse(localStorage.getItem('hsai_api_keys') || '{}');
  if (keys.anthropic) legacy.claude = keys.anthropic;
  if (keys.openai)    legacy.gpt    = keys.openai;
  if (keys.heygen)    legacy.heygen = keys.heygen;
  if (keys.brevo)     legacy.brevo  = keys.brevo;
  localStorage.setItem('hsai_api_keys', JSON.stringify({ ...legacy, ...keys }));
  const st = document.getElementById('api-keys-status');
  if (st) { st.textContent = `✓ ${Object.keys(keys).length} chave(s) salva(s).`; st.style.color = '#22c55e'; }
  if (typeof toast === 'function') toast('API Keys salvas', 'ok');
};

window.testProviderConnections = async function() {
  const st = document.getElementById('api-keys-status');
  if (st) { st.textContent = '⏳ Testando conexões...'; st.style.color = 'var(--ink-3)'; }
  try {
    const token = localStorage.getItem('hs_token') || '';
    const r = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'models' })
    });
    const d = await r.json();
    if (d.ok) {
      const active = d.providers || [];
      if (st) {
        st.innerHTML = active.length
          ? `✓ Providers ativos: <b>${active.join(', ')}</b>`
          : '⚠ Nenhum provider ativo. Configure as chaves acima.';
        st.style.color = active.length ? '#22c55e' : '#f59e0b';
      }
    }
  } catch (e) {
    if (st) { st.textContent = `✗ Erro: ${e.message}`; st.style.color = '#e74c3c'; }
  }
};

window.exportApiKeys = function() {
  const keys = JSON.parse(localStorage.getItem('hsai_api_keys') || '{}');
  const map = {
    openai: 'OPENAI_API_KEY', xai: 'XAI_API_KEY', google: 'GOOGLE_API_KEY',
    byteplus: 'BYTEPLUS_API_KEY', fal: 'FAL_KEY', minimax: 'MINIMAX_API_KEY',
    kling: 'KLING_API_KEY', alibaba: 'ALIBABA_API_KEY', replicate: 'REPLICATE_API_TOKEN',
    openrouter: 'OPENROUTER_API_KEY', anthropic: 'ANTHROPIC_API_KEY',
    heygen: 'HEYGEN_API_KEY', brevo: 'BREVO_API_KEY',
    stripe: 'STRIPE_SECRET_KEY', mercadopago: 'MERCADOPAGO_ACCESS_TOKEN',
  };
  const lines = ['# Hollywood Studio AI — Environment Variables', '# Cole no Vercel: Settings → Environment Variables', ''];
  Object.entries(map).forEach(([id, envKey]) => {
    if (keys[id]) lines.push(`${envKey}=${keys[id]}`);
    else lines.push(`# ${envKey}=`);
  });
  lines.push('', 'ADMIN_PASSWORD=sua_senha_aqui', 'API_SECRET=sua_chave_interna_aqui');
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '.env.hsai';
  a.click();
};

/* ══════════════════════════════════════════════════════════
   3. GESTÃO DE USUÁRIOS EXPANDIDA
══════════════════════════════════════════════════════════ */

function adminUsersCardExpanded() {
  const users = JSON.parse(localStorage.getItem('hsai_users') || '{}');
  const list  = Object.values(users).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  return `
    <div class="dc-card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h3>👥 Usuários (${list.length})</h3>
        <div style="display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" onclick="exportUsers()">📋 Exportar CSV</button>
          <button class="btn btn-ghost btn-sm" onclick="addManualCredits()">➕ Créditos</button>
        </div>
      </div>

      <!-- STATS -->
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
        ${[
          ['Total', list.length],
          ['Admins', list.filter(u => u.role === 'admin').length],
          ['Trial', list.filter(u => u.creditSource === 'trial').length],
          ['Google', list.filter(u => u.google).length],
          ['Guests', list.filter(u => u.uid === 'guest' || !u.email).length],
        ].map(([l, v]) => `
          <div style="background:var(--panel);border:1px solid var(--line);border-radius:8px;
            padding:8px 14px;text-align:center;min-width:70px">
            <div style="font-size:18px;font-weight:700;color:var(--accent)">${v}</div>
            <div style="font-size:10px;color:var(--ink-4);text-transform:uppercase;letter-spacing:1px">${l}</div>
          </div>`).join('')}
      </div>

      <!-- LISTA -->
      <div style="max-height:400px;overflow-y:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="border-bottom:1px solid var(--line)">
              ${['Nome','Email','Créditos','Plano','Criado','Ações'].map(h =>
                `<th style="text-align:left;padding:6px 8px;color:var(--ink-3);font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:1px">${h}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${list.length === 0
              ? `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--ink-4)">Nenhum usuário ainda</td></tr>`
              : list.map(u => `
                <tr style="border-bottom:1px solid var(--line);transition:background 0.1s"
                  onmouseenter="this.style.background='var(--panel-2)'"
                  onmouseleave="this.style.background=''">
                  <td style="padding:8px">
                    <div style="font-weight:600;color:var(--ink)">${u.name || '—'}</div>
                    ${u.role === 'admin' ? '<span style="font-size:9px;background:var(--accent);color:#000;padding:1px 6px;border-radius:10px;font-weight:700">ADMIN</span>' : ''}
                  </td>
                  <td style="padding:8px;color:var(--ink-2)">${u.email || 'guest'}</td>
                  <td style="padding:8px">
                    <span style="font-weight:700;color:var(--accent)">${u.credits ?? 0}</span>
                    <button onclick="grantCredits('${u.uid}')" style="background:none;border:none;
                      color:var(--accent);cursor:pointer;font-size:11px;margin-left:4px" title="Adicionar créditos">+</button>
                  </td>
                  <td style="padding:8px;color:var(--ink-3);font-size:11px">${u.creditSource || '—'}</td>
                  <td style="padding:8px;color:var(--ink-4);font-size:11px">
                    ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td style="padding:8px">
                    <button onclick="banUser('${u.uid}')" style="background:none;border:1px solid #333;
                      border-radius:5px;color:#666;cursor:pointer;font-size:10px;padding:3px 8px"
                      title="Banir usuário">🚫</button>
                  </td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

window.grantCredits = function(uid) {
  const amount = parseInt(prompt('Quantos créditos adicionar?', '50') || '0');
  if (!amount || amount <= 0) return;
  const users = JSON.parse(localStorage.getItem('hsai_users') || '{}');
  if (users[uid]) {
    users[uid].credits = (users[uid].credits || 0) + amount;
    localStorage.setItem('hsai_users', JSON.stringify(users));
    if (typeof toast === 'function') toast(`+${amount} créditos para ${users[uid].name}`, 'ok');
    if (typeof go === 'function') go('admin');
  }
};

window.banUser = function(uid) {
  if (!confirm('Banir este usuário?')) return;
  const users = JSON.parse(localStorage.getItem('hsai_users') || '{}');
  if (users[uid]) { users[uid].banned = true; localStorage.setItem('hsai_users', JSON.stringify(users)); }
  if (typeof toast === 'function') toast('Usuário banido', 'ok');
  if (typeof go === 'function') go('admin');
};

window.exportUsers = function() {
  const users = Object.values(JSON.parse(localStorage.getItem('hsai_users') || '{}'));
  const csv = ['Nome,Email,Créditos,Plano,Google,Criado',
    ...users.map(u => [u.name, u.email, u.credits ?? 0, u.creditSource, u.google ? 'sim' : 'não',
      u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : ''].join(','))
  ].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'hsai-users.csv';
  a.click();
};

window.addManualCredits = function() {
  const email = prompt('Email do usuário:');
  if (!email) return;
  const amount = parseInt(prompt('Créditos a adicionar:', '50') || '0');
  if (!amount) return;
  const users = JSON.parse(localStorage.getItem('hsai_users') || '{}');
  const user = Object.values(users).find(u => u.email === email);
  if (user) {
    user.credits = (user.credits || 0) + amount;
    localStorage.setItem('hsai_users', JSON.stringify(users));
    if (typeof toast === 'function') toast(`+${amount} créditos para ${email}`, 'ok');
  } else {
    alert('Usuário não encontrado');
  }
};

/* ══════════════════════════════════════════════════════════
   4. INJEÇÃO NO SISTEMA DE ROTAS E ADMIN
══════════════════════════════════════════════════════════ */

function installExtensions() {
  // Aguarda o app carregar
  if (typeof go !== 'function' || typeof render !== 'function') {
    setTimeout(installExtensions, 300);
    return;
  }

  /* ── Registra view Spider Web ── */
  const _origRender = window.render;
  window.render = function() {
    _origRender.apply(this, arguments);
    if (typeof S !== 'undefined' && S.view === 'spiderweb') {
      const m = document.getElementById('main');
      if (m) {
        m.innerHTML = '<div class="view">' + viewSpiderWeb() + '</div>';
        afterSpiderWeb();
      }
    }
    // substitui adminApiKeysCard e adminUsersCard pelo expandido
    const apiCard = document.querySelector('#admin-api-keys-card');
    if (apiCard) apiCard.outerHTML = adminApiKeysCardExpanded();
    const usrCard = document.querySelector('#admin-users-card');
    if (usrCard) usrCard.outerHTML = adminUsersCardExpanded();
  };

  /* ── Adiciona Spider Web na sidebar ── */
  const _origBuildNav = window.buildNav;
  if (typeof _origBuildNav === 'function') {
    window.buildNav = function() {
      _origBuildNav.apply(this, arguments);
      // injeta item Spider Web na nav se não existir
      const nav = document.querySelector('.sidebar nav') || document.querySelector('.sidebar');
      if (nav && !document.querySelector('[data-id="spiderweb"]')) {
        const el = document.createElement('button');
        el.className = 'nav-item';
        el.dataset.id = 'spiderweb';
        el.setAttribute('onclick', "go('spiderweb')");
        el.innerHTML = `<span style="font-size:14px">◈</span><span>Spider Web</span>`;
        // insere após "Espaços" ou no final do primeiro grupo
        const spacesEl = nav.querySelector('[data-id="spaces"]');
        if (spacesEl) spacesEl.after(el);
        else nav.appendChild(el);
      }
    };
  }

  /* ── Patch do adminApiKeysCard original ── */
  window.adminApiKeysCard = adminApiKeysCardExpanded;

  /* ── Patch do adminUsersCard original ── */
  if (typeof window.adminUsersCard === 'function') {
    window.adminUsersCard = adminUsersCardExpanded;
  }

  console.log('[hs-extensions] Spider Web + Admin expandido instalados ✓');
}

// Inicia quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installExtensions);
} else {
  installExtensions();
}

})();
