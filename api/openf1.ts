import type { VercelRequest, VercelResponse } from '@vercel/node'

const OPENF1_BASE = 'https://api.openf1.org/v1'

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
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    const data = await upstream.json()

    res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=4')
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(upstream.status).json(data)
  } catch (e) {
    return res.status(502).json({ error: 'OpenF1 upstream failed', detail: String(e) })
  }
}
