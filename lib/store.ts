import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomBytes } from 'crypto'
import type { MatchResponse } from './types'

export interface ShortlistRecord {
  id: string
  created_at: string
  response: MatchResponse
}

// Writable on every target: local Windows/Mac/Linux dev, and Vercel's /tmp.
// On Vercel, /tmp survives only for the lifetime of a warm lambda instance
// — see README "Persistence on Vercel" for upgrade notes to Vercel KV.
const STORE_PATH = path.join(os.tmpdir(), 'carmatch-shortlists.json')
const MAX_RECORDS = 500

let chain: Promise<unknown> = Promise.resolve()
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn)
  chain = next.catch(() => {})
  return next
}

async function readAll(): Promise<Record<string, ShortlistRecord>> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8')
    return JSON.parse(raw) as Record<string, ShortlistRecord>
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw e
  }
}

async function writeAll(data: Record<string, ShortlistRecord>): Promise<void> {
  const tmp = `${STORE_PATH}.${randomBytes(4).toString('hex')}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data), 'utf8')
  await fs.rename(tmp, STORE_PATH)
}

function newId(): string {
  return randomBytes(6).toString('base64url')
}

export async function saveShortlist(response: MatchResponse): Promise<string> {
  return withLock(async () => {
    const all = await readAll()
    let id = newId()
    while (all[id]) id = newId()

    all[id] = { id, created_at: new Date().toISOString(), response }

    const entries = Object.entries(all)
    if (entries.length > MAX_RECORDS) {
      entries.sort(([, a], [, b]) => b.created_at.localeCompare(a.created_at))
      await writeAll(Object.fromEntries(entries.slice(0, MAX_RECORDS)))
    } else {
      await writeAll(all)
    }
    return id
  })
}

export async function getShortlist(id: string): Promise<ShortlistRecord | null> {
  const all = await readAll()
  return all[id] ?? null
}

export async function countShortlists(): Promise<number> {
  const all = await readAll()
  return Object.keys(all).length
}
