import { NextRequest, NextResponse } from 'next/server'
import { saveShortlist, countShortlists } from '@/lib/store'
import type { MatchResponse } from '@/lib/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !('response' in (body as object))) {
    return NextResponse.json({ error: 'Body must include a "response" field' }, { status: 400 })
  }

  const response = (body as { response: MatchResponse }).response
  if (!response?.results || !Array.isArray(response.results) || response.results.length === 0) {
    return NextResponse.json({ error: 'Invalid response payload' }, { status: 400 })
  }

  const id = await saveShortlist(response)
  return NextResponse.json({ id })
}

export async function GET() {
  const count = await countShortlists()
  return NextResponse.json({
    saved_shortlists: count,
    message: 'POST { response } to save. GET /api/shortlist/[id] to retrieve.',
  })
}
