// api/admin.js — Painel admin: gerenciar usuários, ver uso, ativar planos
import { getSupabase, getUserFromToken, cors } from './_supabase.js';

async function isAdmin(token) {
  if (!token) return false;
  const user = await getUserFromToken(token);
  if (!user) return false;
  // Admin = email configurado nas env vars OU role admin no DB
  if (user.email === process.env.ADMIN_EMAIL) return true;
  const supabase = getSupabase();
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin';
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!await isAdmin(token)) return res.status(403).json({ error: 'Acesso restrito' });

  const supabase = getSupabase();
  const { action } = req.query;

  // — Listar usuários —
  if (req.method === 'GET' && action === 'users') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, plan, decisions_used, decisions_limit, created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ users: data });
  }

  // — Estatísticas —
  if (req.method === 'GET' && action === 'stats') {
    const [usersRes, decisionsRes] = await Promise.all([
      supabase.from('profiles').select('plan', { count: 'exact' }),
      supabase.from('decisions').select('id', { count: 'exact' }),
    ]);
    const plans = { free: 0, iniciado: 0, diretor: 0, grande_mestre: 0 };
    (usersRes.data || []).forEach(u => { plans[u.plan] = (plans[u.plan] || 0) + 1; });
    return res.status(200).json({
      total_users: usersRes.count || 0,
      total_decisions: decisionsRes.count || 0,
      plans,
    });
  }

  // — Alterar plano de usuário —
  if (req.method === 'POST' && action === 'set_plan') {
    const { user_id, plan } = req.body;
    const LIMITS = { free: 3, iniciado: 5, diretor: 999, grande_mestre: 9999 };
    const { error } = await supabase.from('profiles').update({
      plan,
      decisions_limit: LIMITS[plan] || 3,
      decisions_used: 0,
    }).eq('id', user_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  // — Zerar uso mensal —
  if (req.method === 'POST' && action === 'reset_usage') {
    const { user_id } = req.body;
    const { error } = await supabase.from('profiles').update({
      decisions_used: 0,
      decisions_month: new Date().getMonth(),
    }).eq('id', user_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  // — Excluir usuário —
  if (req.method === 'DELETE' && action === 'delete_user') {
    const { user_id } = req.body;
    await supabase.from('decisions').delete().eq('user_id', user_id);
    await supabase.from('profiles').delete().eq('id', user_id);
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Ação inválida' });
}
