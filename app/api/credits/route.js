export const runtime = 'edge'

const CREDIT_COSTS = {
  image_basic: 3, image_hd: 6, image_4k: 9,
  video_5s: 35, video_10s: 70, video_premium: 120,
  audio: 5, lipsync: 50,
}

export async function GET(req) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  return new Response(JSON.stringify({ costs: CREDIT_COSTS, userId }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
