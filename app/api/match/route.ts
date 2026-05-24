import { NextRequest, NextResponse } from 'next/server'
import carsData from '@/data/cars.json'
import { matchCars, quizSummary } from '@/lib/matching'
import type { Car, QuizAnswers, MatchResponse, Household, PrimaryUse, Budget, Priority } from '@/lib/types'

const cars = carsData as Car[]

const VALID_HOUSEHOLD: Household[] = ['1-2', '3-4', '5+']
const VALID_USE: PrimaryUse[] = ['commuting', 'road_trips', 'cargo', 'mixed']
const VALID_BUDGET: Budget[] = ['under_10l', '10l_20l', '20l_35l', '35l_plus']
const VALID_PRIORITY: Priority[] = ['fuel_savings', 'safety', 'performance', 'comfort', 'cargo_space']

function validate(body: unknown): { ok: true; data: QuizAnswers } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Body must be a JSON object' }
  const b = body as Record<string, unknown>
  if (!VALID_HOUSEHOLD.includes(b.household_size as Household)) return { ok: false, error: 'Invalid household_size' }
  if (!VALID_USE.includes(b.primary_use as PrimaryUse)) return { ok: false, error: 'Invalid primary_use' }
  if (!VALID_BUDGET.includes(b.budget as Budget)) return { ok: false, error: 'Invalid budget' }

  const raw = b.top_priorities
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 3) {
    return { ok: false, error: 'top_priorities must be an array of 1–3 values' }
  }
  for (const p of raw) {
    if (!VALID_PRIORITY.includes(p as Priority)) return { ok: false, error: `Invalid priority: ${p}` }
  }
  const top_priorities = Array.from(new Set(raw as Priority[]))

  return {
    ok: true,
    data: {
      household_size: b.household_size as Household,
      primary_use: b.primary_use as PrimaryUse,
      budget: b.budget as Budget,
      top_priorities,
    },
  }
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const v = validate(body)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const results = matchCars(cars, v.data)
  const response: MatchResponse = {
    results,
    quiz_summary: quizSummary(v.data),
  }
  return NextResponse.json(response)
}

export async function GET() {
  return NextResponse.json({
    dataset_size: cars.length,
    categories: Array.from(new Set(cars.map((c) => c.category))),
    message: 'POST quiz answers to /api/match to receive a top-3 shortlist.',
  })
}
