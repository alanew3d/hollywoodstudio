// api/radar.js — Radar de Mercado: análise competitiva semanal com mentores
// Endpoints:
//   GET  /api/radar?action=competitors      — listar concorrentes
//   POST /api/radar?action=add              — cadastrar concorrente
//   DEL  /api/radar?action=delete           — remover concorrente
//   GET  /api/radar?action=snapshots        — relatórios semanais
//   POST /api/radar?action=analyze          — rodar análise agora (manual)
//   GET  /api/radar?action=config           — config do radar
//   POST /api/radar?action=config           — salvar config

import Anthropic from '@anthropic-ai/sdk';
import { getSupabase, getUserFromToken, cors } from './_supabase.js';

// Mentores disponíveis para análise competitiva
const RADAR_MENTORS = {
  suntzu: {
    name: 'Sun Tzu',
    system: `Você é Sun Tzu analisando inteligência competitiva. Identifique padrões estratégicos nos movimentos do concorrente. Avalie o que cada ação revela sobre sua estratégia, fraquezas e próximos movimentos. Seja conciso e cirúrgico. Termine com UMA recomendação de ação imediata. Tom: estrategista milenar, frases curtas e poderosas. Português brasileiro.`
  },
  porter: {
    name: 'Michael Porter',
    system: `Você é Michael Porter analisando movimentos competitivos. Use frameworks de vantagem competitiva para interpretar as ações do concorrente. Avalie impacto no posicionamento, nas 5 forças e na cadeia de valor. Termine com UMA recomendação estratégica baseada em diferenciação ou custo. Português brasileiro.`
  },
  welch: {
    name: 'Jack Welch',
    system: `Você é Jack Welch analisando um concorrente. Seja direto e sem rodeios. O que esse movimento significa para o negócio? Está ganhando ou perdendo terreno? O que você faria se fosse o CEO competindo com essa empresa agora? Termine com UMA ação concreta para esta semana. Português brasileiro.`
  },
  thiel: {
    name: 'Peter Thiel',
    system: `Você é Peter Thiel analisando um concorrente. Questione as premissas por trás dos movimentos observados. O que esse concorrente está fazendo que revela suas crenças sobre o mercado? Onde está vulnerável? Termine com UMA pergunta provocativa que o usuário precisa responder antes de agir. Português brasileiro.`
  },
  bezos: {
    name: 'Jeff Bezos',
    system: `Você é Jeff Bezos analisando um concorrente. Foco no cliente: o que esse movimento diz sobre o que o concorrente acha que o cliente quer? Está certo ou errado? Como usar isso a favor? Termine com UMA oportunidade específica que esse movimento abre. Português brasileiro.`
  },
};

// Busca dados públicos do concorrente via Claude web search
async function fetchCompetitorData(competitor) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const searchQuery = `${competitor.name} ${competitor.sector || ''} últimas notícias movimentos recentes campanhas lançamentos 2025`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: 'Você é um analista de inteligência competitiva. Busque informações recentes sobre a empresa e retorne um resumo estruturado em JSON com: novidades, campanhas, produtos, preços, contratações, eventos, redes sociais. Seja factual, sem interpretação ainda.',
    messages: [{
      role: 'user',
      content: `Pesquise sobre: ${competitor.name}. Website: ${competitor.website || 'não informado'}. Setor: ${competitor.sector || 'não informado'}. Foque em movimentos das últimas 2 semanas. Retorne JSON com campos: news[], social_moves[], product_changes[], pricing_changes[], hiring_signals[], events[].`
    }]
  });

  const textContent = response.content.find(c => c.type === 'text');
  try {
    const jsonMatch = textContent?.text?.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { news: [], social_moves: [], summary: textContent?.text || '' };
  } catch {
    return { news: [], social_moves: [], summary: textContent?.text || '' };
  }
}

// Gera análise com mentor
async function analyzeWithMentor(competitor, rawData, previousData, mentorId) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const mentor = RADAR_MENTORS[mentorId] || RADAR_MENTORS.suntzu;

  // Build diff — o que mudou vs semana anterior
  const diffContext = previousData
    ? `\n\nSEMANA ANTERIOR (para comparação):\n${JSON.stringify(previousData, null, 2)}`
    : '\n\n(Primeira análise deste concorrente — sem dados anteriores para comparar)';

  const prompt = `CONCORRENTE MONITORADO: ${competitor.name}
Setor: ${competitor.sector || 'não especificado'}
Website: ${competitor.website || 'não informado'}

DADOS COLETADOS ESTA SEMANA:
${JSON.stringify(rawData, null, 2)}
${diffContext}

Analise os movimentos desta semana com sua perspectiva estratégica. O que está acontecendo? O que isso revela? O que o usuário deve fazer?`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: mentor.system,
    messages: [{ role: 'user', content: prompt }]
  });

  return {
    mentor_id: mentorId,
    mentor_name: mentor.name,
    analysis: response.content[0].text
  };
}

// Extrai recomendação de ação do texto da análise
function extractAction(analysisText) {
  const lines = analysisText.split('\n').filter(Boolean);
  // Pegar a última frase ou linha que contenha verbos de ação
  const actionKeywords = ['faça', 'execute', 'implemente', 'lance', 'reaja', 'responda', 'aproveite', 'mova', 'ataque', 'recue'];
  for (let i = lines.length - 1; i >= 0; i--) {
    if (actionKeywords.some(k => lines[i].toLowerCase().includes(k))) {
      return lines[i].replace(/^[•\-\*]\s*/, '').trim();
    }
  }
  return lines[lines.length - 1]?.trim() || '';
}

// Enviar relatório por email
async function sendRadarEmail(userEmail, userName, snapshots, weekStart) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const snapshotItems = snapshots.map(s => `
      <div style="background:#f8f7f4;border-left:3px solid #C8A84B;padding:16px 20px;margin-bottom:16px;border-radius:0 8px 8px 0">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">${s.mentor_name} sobre</div>
        <div style="font-size:18px;font-weight:700;color:#111;margin-bottom:10px">${s.competitor_name}</div>
        <div style="font-size:13px;color:#444;line-height:1.7">${s.mentor_analysis?.replace(/\n/g, '<br>') || ''}</div>
        ${s.recommended_action ? `<div style="margin-top:10px;padding:10px 14px;background:#fff;border-radius:6px;border:.5px solid #ddd;font-size:12px;color:#111"><strong>Ação recomendada:</strong> ${s.recommended_action}</div>` : ''}
      </div>`).join('');

    await resend.emails.send({
      from: 'Radar diretor.ai <radar@diretor.ai>',
      to: userEmail,
      subject: `⬡ Radar de Mercado — Semana de ${new Date(weekStart).toLocaleDateString('pt-BR')}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
          <div style="margin-bottom:24px">
            <span style="font-size:11px;color:#C8A84B;font-weight:700;letter-spacing:.14em;text-transform:uppercase">diretor.ai — Radar de Mercado</span>
            <h1 style="font-size:22px;color:#111;margin:6px 0 4px">Inteligência competitiva da semana</h1>
            <p style="font-size:13px;color:#888">Olá ${userName?.split(' ')[0] || ''}. Aqui estão os movimentos dos seus concorrentes analisados pelos mentores.</p>
          </div>
          ${snapshotItems}
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;text-align:center">
            <a href="https://diretor.ai" style="display:inline-block;background:#C8A84B;color:#000;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">Ver análise completa →</a>
          </div>
          <p style="font-size:11px;color:#bbb;text-align:center;margin-top:16px">diretor.ai · Plano Grande Mestre · <a href="https://diretor.ai/settings" style="color:#bbb">Gerenciar preferências</a></p>
        </div>`
    });
  } catch (e) {
    console.error('Radar email error:', e.message);
  }
}

// ─── HANDLER PRINCIPAL ───
export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await getUserFromToken(token);
  if (!user) return res.status(401).json({ error: 'Login necessário' });

  // Verificar se usuário tem plano que inclui Radar (Grande Mestre)
  const supabase = getSupabase();
  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
  const hasRadar = ['grande_mestre', 'diretor', 'trial'].includes(profile?.plan);
  // Diretor tem acesso limitado (só análise manual), Grande Mestre tem automático
  if (!hasRadar) {
    return res.status(402).json({
      error: 'Radar de Mercado disponível nos planos Diretor e Grande Mestre.',
      upgrade: true
    });
  }

  const { action } = req.query;

  // ─── GET competitors ───
  if (req.method === 'GET' && action === 'competitors') {
    const { data } = await supabase.from('competitors')
      .select('*').eq('user_id', user.id).eq('is_active', true).order('created_at');
    return res.status(200).json({ competitors: data || [] });
  }

  // ─── POST add competitor ───
  if (req.method === 'POST' && action === 'add') {
    const { name, website, instagram, linkedin, sector, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome do concorrente obrigatório' });
    const { data, error } = await supabase.from('competitors').insert({
      user_id: user.id, name, website, instagram, linkedin, sector, notes
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ competitor: data });
  }

  // ─── DELETE competitor ───
  if (req.method === 'DELETE' && action === 'delete') {
    const { competitor_id } = req.body;
    await supabase.from('competitors').update({ is_active: false }).eq('id', competitor_id).eq('user_id', user.id);
    return res.status(200).json({ ok: true });
  }

  // ─── GET snapshots ───
  if (req.method === 'GET' && action === 'snapshots') {
    const { competitor_id, limit = 8 } = req.query;
    let query = supabase.from('competitor_snapshots')
      .select(`*, competitors(name, sector)`)
      .eq('user_id', user.id)
      .eq('status', 'done')
      .order('week_start', { ascending: false })
      .limit(parseInt(limit));
    if (competitor_id) query = query.eq('competitor_id', competitor_id);
    const { data } = await query;
    return res.status(200).json({ snapshots: data || [] });
  }

  // ─── POST analyze (manual trigger) ───
  if (req.method === 'POST' && action === 'analyze') {
    const { competitor_id, mentor_id = 'suntzu' } = req.body;

    const { data: competitor } = await supabase.from('competitors')
      .select('*').eq('id', competitor_id).eq('user_id', user.id).single();
    if (!competitor) return res.status(404).json({ error: 'Concorrente não encontrado' });

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Get previous snapshot for diff
    const { data: prevSnapshot } = await supabase.from('competitor_snapshots')
      .select('raw_data').eq('competitor_id', competitor_id)
      .lt('week_start', weekStartStr).order('week_start', { ascending: false }).limit(1).single();

    // Insert pending snapshot
    const { data: snapshot } = await supabase.from('competitor_snapshots').upsert({
      competitor_id, user_id: user.id, week_start: weekStartStr,
      mentor_id, status: 'processing'
    }, { onConflict: 'competitor_id,week_start' }).select().single();

    try {
      // Fetch competitor data
      const rawData = await fetchCompetitorData(competitor);

      // Generate diff summary
      let diffSummary = 'Primeira análise.';
      if (prevSnapshot?.raw_data) {
        const prevNews = prevSnapshot.raw_data.news || [];
        const currNews = rawData.news || [];
        const newItems = currNews.filter(n => !prevNews.includes(n));
        diffSummary = newItems.length > 0
          ? `${newItems.length} novidades desde a semana passada.`
          : 'Pouca mudança em relação à semana anterior.';
      }

      // Analyze with mentor
      const { analysis } = await analyzeWithMentor(competitor, rawData, prevSnapshot?.raw_data, mentor_id);
      const action_rec = extractAction(analysis);

      // Update snapshot
      await supabase.from('competitor_snapshots').update({
        raw_data: rawData,
        diff_summary: diffSummary,
        mentor_id,
        mentor_analysis: analysis,
        recommended_action: action_rec,
        status: 'done'
      }).eq('id', snapshot.id);

      return res.status(200).json({
        ok: true,
        snapshot: {
          competitor_name: competitor.name,
          mentor_name: RADAR_MENTORS[mentor_id]?.name,
          diff_summary: diffSummary,
          mentor_analysis: analysis,
          recommended_action: action_rec,
        }
      });
    } catch (err) {
      await supabase.from('competitor_snapshots').update({ status: 'error' }).eq('id', snapshot.id);
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── GET/POST config ───
  if (action === 'config') {
    if (req.method === 'GET') {
      const { data } = await supabase.from('radar_config').select('*').eq('user_id', user.id).single();
      return res.status(200).json({ config: data || { default_mentor: 'suntzu', delivery_day: 1, email_enabled: true } });
    }
    if (req.method === 'POST') {
      const { default_mentor, delivery_day, email_enabled } = req.body;
      await supabase.from('radar_config').upsert({
        user_id: user.id, default_mentor, delivery_day, email_enabled
      }, { onConflict: 'user_id' });
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(400).json({ error: `Ação inválida: ${action}` });
}
