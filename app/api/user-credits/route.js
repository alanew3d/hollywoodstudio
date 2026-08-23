// API de créditos do usuário — GET saldo, POST debitar
export const runtime = 'edge'

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function getProfile(userId) {
  const res = await fetch(
    `${SUPA_URL}/rest/v1/profiles?id=eq.${userId}&select=id,email,name,plan,credits,credits_used_total`,
    { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
  )
  const data = await res.json()
  return data[0] || null
}

// GET /api/user-credits?token=...
export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'Unauthorized' }, 401)

    // Valida token e pega userId do Supabase
    const userRes = await fetch(`${SUPA_URL}/auth/v1/user`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    })
    const user = await userRes.json()
    if (!user.id) return json({ error: 'Invalid token' }, 401)

    const profile = await getProfile(user.id)
    if (!profile) return json({ error: 'Profile not found' }, 404)

    return json({
      ok: true,
      credits: profile.credits,
      plan: profile.plan,
      name: profile.name,
      email: profile.email,
      used_total: profile.credits_used_total
    })
  } catch(e) {
    return json({ error: e.message }, 500)
  }
}

// POST /api/user-credits — debita créditos
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return json({ error: 'Unauthorized' }, 401)

    // Valida token
    const userRes = await fetch(`${SUPA_URL}/auth/v1/user`, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    })
    const user = await userRes.json()
    if (!user.id) return json({ error: 'Invalid token' }, 401)

    const { amount = 1, description = 'Geração' } = await req.json()

    // Chama função atômica do Supabase
    const res = await fetch(`${SUPA_URL}/rest/v1/rpc/debit_credits`, {
      method: 'POST',
      headers: {
        'apikey': SUPA_KEY,
        'Authorization': `Bearer ${SUPA_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_user_id: user.id,
        p_amount: amount,
        p_description: description
      })
    })
    const result = await res.json()
    const row = Array.isArray(result) ? result[0] : result

    if (!row?.success) {
      return json({ ok: false, error: row?.message || 'Erro ao debitar créditos' }, 402)
    }

    return json({ ok: true, balance: row.balance, debited: amount })
  } catch(e) {
    return json({ error: e.message }, 500)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
