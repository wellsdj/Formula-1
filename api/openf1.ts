import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENF1_BASE = 'https://api.openf1.org/v1'
const TOKEN_URL = 'https://api.openf1.org/token'

// In-memory token cache (persists across warm invocations of the same instance)
let cachedToken: { value: string; expiresAt: number } | null = null

async function getToken(): Promise<string | null> {
  const username = process.env.OPENF1_USERNAME
  const password = process.env.OPENF1_PASSWORD

  // No credentials configured → run unauthenticated (historical data only)
  if (!username || !password) return null

  // Reuse cached token if still valid (refresh 60s early)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    // Auth failed — clear cache and fall back to unauthenticated
    cachedToken = null
    return null
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  return cachedToken.value
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path, ...rest } = req.query

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'Missing path param' })
  }

  const qs = new URLSearchParams(
    Object.entries(rest).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((val) => [k, val]) : [[k, v as string]]
    )
  ).toString()

  const url = `${OPENF1_BASE}${path}${qs ? `?${qs}` : ''}`

  try {
    const token = await getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const upstream = await fetch(url, { headers })
    const data = await upstream.json()

    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=4')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(upstream.status).json(data)
  } catch (e) {
    return res.status(502).json({ error: 'OpenF1 upstream failed', detail: String(e) })
  }
}
