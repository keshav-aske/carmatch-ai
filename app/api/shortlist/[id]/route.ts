import { NextRequest, NextResponse } from 'next/server'
import { getShortlist } from '@/lib/store'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const record = await getShortlist(params.id)
  if (!record) {
    return NextResponse.json({ error: 'Shortlist not found' }, { status: 404 })
  }
  return NextResponse.json(record)
}
