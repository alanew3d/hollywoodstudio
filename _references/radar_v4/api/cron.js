// api/cron.js — Vercel Cron Job: roda toda segunda às 7h
// Configurar no vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "0 10 * * 1" }] }
// (10h UTC = 7h Brasília)

import { getSupabase } from './_supabase.js';

export default async function handler(req, res) {
  // Vercel Cron envia header Authorization com CRON_SECRET
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  console.log(`[CRON] Radar semanal iniciando — semana ${weekStartStr}`);

  // Buscar todos os usuários com plano Grande Mestre e Radar ativo
  const { data: configs } = await supabase
    .from('radar_config')
    .select('*, profiles(email, name, plan)')
    .eq('email_enabled', true);

  if (!configs?.length) {
    return res.status(200).json({ ok: true, processed: 0 });
  }

  let processed = 0;
  let errors = 0;

  for (const config of configs) {
    const profile = config.profiles;
    if (!['grande_mestre', 'diretor'].includes(profile?.plan)) continue;

    try {
      // Buscar concorrentes ativos do usuário
      const { data: competitors } = await supabase
        .from('competitors')
        .select('*')
        .eq('user_id', config.user_id)
        .eq('is_active', true);

      if (!competitors?.length) continue;

      const snapshots = [];

      for (const competitor of competitors) {
        // Verificar se já foi processado esta semana
        const { data: existing } = await supabase
          .from('competitor_snapshots')
          .select('id, status')
          .eq('competitor_id', competitor.id)
          .eq('week_start', weekStartStr)
          .single();

        if (existing?.status === 'done') {
          // Já processado — pegar para o email
          const { data: snap } = await supabase
            .from('competitor_snapshots')
            .select('*')
            .eq('id', existing.id)
            .single();
          if (snap) snapshots.push({ ...snap, competitor_name: competitor.name });
          continue;
        }

        // Chamar API de análise internamente
        try {
          const analyzeRes = await fetch(`${process.env.VERCEL_URL}/api/radar?action=analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Service-to-service: usar service key como auth bypass
              'x-service-key': process.env.SUPABASE_SERVICE_KEY
            },
            body: JSON.stringify({
              competitor_id: competitor.id,
              mentor_id: config.default_mentor || 'suntzu',
              _user_id: config.user_id // internal bypass
            })
          });
          const result = await analyzeRes.json();
          if (result.snapshot) {
            snapshots.push({ ...result.snapshot, competitor_name: competitor.name });
            processed++;
          }
        } catch (e) {
          console.error(`[CRON] Error analyzing ${competitor.name}:`, e.message);
          errors++;
        }

        // Rate limit: aguardar 2s entre análises
        await new Promise(r => setTimeout(r, 2000));
      }

      // Enviar email com todos os snapshots da semana
      if (snapshots.length && profile?.email) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const snapshotItems = snapshots.map(s => `
          <div style="background:#f8f7f4;border-left:3px solid #C8A84B;padding:16px 20px;margin-bottom:16px;border-radius:0 8px 8px 0">
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">
              ${s.mentor_name || config.default_mentor} sobre
            </div>
            <div style="font-size:18px;font-weight:700;color:#111;margin-bottom:10px">${s.competitor_name}</div>
            <div style="font-size:13px;color:#444;line-height:1.7">${(s.mentor_analysis || '').replace(/\n/g, '<br>')}</div>
            ${s.recommended_action ? `
            <div style="margin-top:10px;padding:10px 14px;background:#fff;border-radius:6px;border:.5px solid #ddd;font-size:12px;color:#111">
              <strong>Ação recomendada:</strong> ${s.recommended_action}
            </div>` : ''}
          </div>`).join('');

        await resend.emails.send({
          from: 'Radar diretor.ai <radar@diretor.ai>',
          to: profile.email,
          subject: `⬡ Radar de Mercado — ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px">
              <div style="margin-bottom:24px">
                <div style="font-size:11px;color:#C8A84B;font-weight:700;letter-spacing:.14em;text-transform:uppercase">
                  diretor.ai — Radar de Mercado
                </div>
                <h1 style="font-size:22px;color:#111;margin:6px 0 4px">
                  Inteligência competitiva da semana
                </h1>
                <p style="font-size:13px;color:#888">
                  Olá ${profile.name?.split(' ')[0] || ''}. 
                  Aqui estão os movimentos dos seus concorrentes, 
                  analisados pelos mentores estratégicos.
                </p>
              </div>
              ${snapshotItems}
              <div style="margin-top:24px;text-align:center">
                <a href="https://diretor.ai" 
                   style="display:inline-block;background:#C8A84B;color:#000;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">
                  Ver análise completa no diretor.ai →
                </a>
              </div>
              <p style="font-size:11px;color:#bbb;text-align:center;margin-top:16px">
                diretor.ai · Radar de Mercado automático toda segunda-feira
              </p>
            </div>`
        });
      }

    } catch (e) {
      console.error(`[CRON] Error for user ${config.user_id}:`, e.message);
      errors++;
    }
  }

  console.log(`[CRON] Done — processed: ${processed}, errors: ${errors}`);
  return res.status(200).json({ ok: true, processed, errors, week: weekStartStr });
}
