import { Redis } from '@upstash/redis'
import { randomBytes } from 'crypto'
import type { MatchResponse } from './types'

export interface ShortlistRecord {
  id: string
  created_at: string
  response: MatchResponse
}

// Vercel provisions Upstash Redis with KV_REST_API_* env vars when added via
// the Storage marketplace. We construct the client explicitly so the same
// vars also work for `vercel env pull`-ed local development.
const redis = new Redis({
  url: process.env.KV_REST_API_URL ?? '',
  token: process.env.KV_REST_API_TOKEN ?? '',
})

const KEY_PREFIX = 'shortlist:'
// 90-day TTL. Saved links auto-expire — keeps storage tidy and is plenty
// for the share-with-family use case.
const TTL_SECONDS = 60 * 60 * 24 * 90

function newId(): string {
  // 8 URL-safe characters from 6 random bytes (~2.8e14 possibilities).
  return randomBytes(6).toString('base64url')
}

export async function saveShortlist(response: MatchResponse): Promise<string> {
  let id = newId()
  // Collision retry — at ~10^14 entropy this loop effectively never runs more than once.
  for (let i = 0; i < 5; i++) {
    const exists = await redis.exists(KEY_PREFIX + id)
    if (!exists) break
    id = newId()
  }
  const record: ShortlistRecord = {
    id,
    created_at: new Date().toISOString(),
    response,
  }
  await redis.set(KEY_PREFIX + id, record, { ex: TTL_SECONDS })
  return id
}

export async function getShortlist(id: string): Promise<ShortlistRecord | null> {
  if (!id || typeof id !== 'string' || id.length > 20) return null
  const record = await redis.get<ShortlistRecord>(KEY_PREFIX + id)
  return record ?? null
}

export async function countShortlists(): Promise<number> {
  try {
    return await redis.dbsize()
  } catch {
    return -1
  }
}
