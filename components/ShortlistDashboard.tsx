'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Link2,
  Loader2,
  Medal,
  Quote,
  RotateCcw,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trophy,
} from 'lucide-react'
import type { MatchResponse, MatchResult } from '@/lib/types'
import { cn, formatINR } from '@/lib/utils'

type DashboardProps =
  | {
      data: MatchResponse
      mode?: 'interactive'
      onRetake: () => void
      onHome: () => void
      createdAt?: never
    }
  | {
      data: MatchResponse
      mode: 'shared'
      createdAt: string
      onRetake?: never
      onHome?: never
    }

function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diffMin = Math.round((Date.now() - then) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  const diffH = Math.round(diffMin / 60)
  if (diffH < 24) return `${diffH} hour${diffH === 1 ? '' : 's'} ago`
  const diffD = Math.round(diffH / 24)
  return `${diffD} day${diffD === 1 ? '' : 's'} ago`
}

const RANK_META = [
  { icon: Crown, label: 'Best Match', tone: 'from-amber-400 to-amber-600', ring: 'ring-amber-400/40' },
  { icon: Trophy, label: 'Runner-Up', tone: 'from-sky-400 to-indigo-500', ring: 'ring-sky-400/40' },
  { icon: Medal, label: 'Strong Pick', tone: 'from-emerald-400 to-teal-500', ring: 'ring-emerald-400/40' },
]

export default function ShortlistDashboard(props: DashboardProps) {
  const { data } = props
  const { results, quiz_summary } = data
  const isShared = props.mode === 'shared'

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Top nav */}
      <div className="flex items-center justify-between">
        {isShared ? (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        ) : (
          <button
            onClick={props.onHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </button>
        )}
        {isShared ? (
          <Link
            href="/"
            className="button-ghost inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Take your own quiz
          </Link>
        ) : (
          <button
            onClick={props.onRetake}
            className="button-ghost inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retake quiz
          </button>
        )}
      </div>

      {/* Header */}
      <header className="mt-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            {isShared ? 'Saved shortlist' : 'Your personalised shortlist'}
          </div>
          {isShared && (
            <span className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-slate-400">
              Saved {formatRelativeTime(props.createdAt)}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-4xl font-bold tracking-tight gradient-text sm:text-5xl">
          {isShared
            ? `${results[0].car.make} ${results[0].car.model} & ${results.length - 1} more.`
            : `Top ${results.length} cars matched to your life.`}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-400">
          {isShared
            ? 'Someone ran the CarMatch quiz and got this shortlist. Want one tailored to you?'
            : 'We scored 20 cars across 4 dimensions and ranked them by overall fit. Here’s why these three made it.'}
        </p>

        {/* Quiz summary chips */}
        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { label: 'Household', value: quiz_summary.household },
            { label: 'Use', value: quiz_summary.use },
            { label: 'Budget', value: quiz_summary.budget },
          ].map((c) => (
            <div
              key={c.label}
              className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs"
            >
              <span className="font-medium text-slate-500">{c.label}</span>
              <span className="text-slate-200">{c.value}</span>
            </div>
          ))}
          <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
            <span className="font-medium text-slate-500">
              {quiz_summary.priorities.length > 1 ? 'Priorities' : 'Priority'}
            </span>
            <span className="flex flex-wrap items-center gap-1.5">
              {quiz_summary.priorities.map((p, i) => (
                <span key={p} className="text-slate-200">
                  {p}
                  {i < quiz_summary.priorities.length - 1 && (
                    <span className="ml-1.5 text-slate-600">+</span>
                  )}
                </span>
              ))}
            </span>
          </div>
        </div>
      </header>

      {/* Save & share (interactive mode only) */}
      {!isShared && <SaveShareBar data={data} />}

      {/* Cards */}
      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {results.map((result, idx) => (
          <MatchCard key={result.car.id} result={result} index={idx} />
        ))}
      </section>

      {/* Spec comparison */}
      <section className="mt-16 animate-fade-up">
        <div className="text-xs font-semibold uppercase tracking-widest text-sky-400">
          Side-by-side
        </div>
        <h2 className="mt-2 text-2xl font-bold text-slate-100 sm:text-3xl">
          The spec grid that matters
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Bold cells highlight the spec most important to{' '}
          <span className="text-slate-200">your</span> top priority.
        </p>

        <div className="mt-6 overflow-x-auto rounded-2xl glass-strong">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-700/60 text-left text-xs uppercase tracking-widest text-slate-500">
                <th className="px-5 py-4 font-medium">Spec</th>
                {results.map((r) => (
                  <th key={r.car.id} className="px-5 py-4 font-medium">
                    <div className="text-slate-200">{r.car.make}</div>
                    <div className="text-slate-500 normal-case">{r.car.model}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results[0].spec_highlights.map((row, rowIdx) => (
                <tr
                  key={row.label}
                  className={cn(
                    'border-b border-slate-800/60 transition-colors',
                    rowIdx % 2 === 0 ? 'bg-slate-900/20' : '',
                  )}
                >
                  <td className="px-5 py-4 text-slate-400">{row.label}</td>
                  {results.map((r) => {
                    const cell = r.spec_highlights[rowIdx]
                    return (
                      <td
                        key={r.car.id + row.label}
                        className={cn(
                          'px-5 py-4',
                          cell.highlighted
                            ? 'font-semibold text-sky-300'
                            : 'text-slate-200',
                        )}
                      >
                        {cell.value}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="border-b border-slate-800/60 bg-slate-900/30">
                <td className="px-5 py-4 text-slate-400">Price</td>
                {results.map((r) => (
                  <td key={r.car.id + 'price'} className="px-5 py-4 font-medium text-slate-100">
                    {formatINR(r.car.price_inr)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-5 py-4 text-slate-400">Match</td>
                {results.map((r) => (
                  <td key={r.car.id + 'match'} className="px-5 py-4">
                    <span className="rank-pill inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-sky-200">
                      {r.match_percentage}%
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
        <div>Built for the Indian market · 20-car dataset · Match scores computed locally</div>
        {isShared ? (
          <Link
            href="/"
            className="button-ghost inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Take your own quiz
          </Link>
        ) : (
          <button
            onClick={props.onRetake}
            className="button-ghost inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try different answers
          </button>
        )}
      </footer>
    </div>
  )
}

function MatchCard({ result, index }: { result: MatchResult; index: number }) {
  const { car, match_percentage, match_reasons } = result
  const meta = RANK_META[index] ?? RANK_META[2]
  const RankIcon = meta.icon

  return (
    <article
      className="glass relative overflow-hidden rounded-2xl p-6 animate-fade-up"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {/* Top blob */}
      <div className={cn('absolute -right-12 -top-16 h-44 w-44 rounded-full blur-3xl opacity-30 bg-gradient-to-br', meta.tone)} />

      {/* Rank pill */}
      <div className="relative flex items-center justify-between">
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br px-3 py-1 text-xs font-semibold text-slate-900',
            meta.tone,
          )}
        >
          <RankIcon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
        <MatchRing percentage={match_percentage} />
      </div>

      {/* Make/model */}
      <div className="relative mt-6">
        <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
          {car.category} · {car.year}
        </div>
        <h3 className="mt-2 text-2xl font-bold text-slate-100">
          {car.make} {car.model}
        </h3>
        <div className="mt-1 text-sm text-slate-400">{car.variant}</div>
        <div className="mt-3 text-xl font-semibold gradient-accent">{formatINR(car.price_inr)}</div>
      </div>

      {/* Match reasons */}
      <div className="relative mt-6 space-y-2.5">
        <div className="text-xs font-semibold uppercase tracking-widest text-sky-400">
          Why it matches
        </div>
        {match_reasons.map((r) => (
          <div key={r} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span className="leading-relaxed">{r}</span>
          </div>
        ))}
      </div>

      {/* Pros / cons */}
      <div className="relative mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-emerald-500/5 ring-1 ring-emerald-500/15 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <ThumbsUp className="h-3.5 w-3.5" />
            Pros
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
            {car.pros.slice(0, 3).map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-rose-500/5 ring-1 ring-rose-500/15 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300">
            <ThumbsDown className="h-3.5 w-3.5" />
            Cons
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-300">
            {car.cons.slice(0, 3).map((c) => (
              <li key={c}>• {c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Review summary */}
      <div className="relative mt-6 rounded-xl bg-slate-900/40 ring-1 ring-slate-700/40 p-4">
        <Quote className="h-3.5 w-3.5 text-slate-500" />
        <p className="mt-2 text-xs italic leading-relaxed text-slate-400">
          {car.reviews_summary}
        </p>
      </div>
    </article>
  )
}

function MatchRing({ percentage }: { percentage: number }) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative grid h-16 w-16 place-items-center">
      <svg className="absolute h-16 w-16 -rotate-90" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="rgb(51 65 85)"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <div className="text-base font-bold text-slate-100">{percentage}</div>
        <div className="-mt-1 text-[9px] uppercase tracking-widest text-slate-500">match</div>
      </div>
    </div>
  )
}

function SaveShareBar({ data }: { data: MatchResponse }) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function save() {
    if (state === 'saving' || state === 'saved') return
    setState('saving')
    try {
      const res = await fetch('/api/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: data }),
      })
      if (!res.ok) throw new Error('Save failed')
      const { id } = (await res.json()) as { id: string }
      const fullUrl = `${window.location.origin}/s/${id}`
      setUrl(fullUrl)
      setState('saved')
      try {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {
        /* clipboard may be unavailable; URL is still shown */
      }
    } catch {
      setState('error')
    }
  }

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* noop */
    }
  }

  return (
    <div className="mt-8 glass rounded-2xl px-5 py-4 sm:px-6 sm:py-5 animate-fade-up">
      {state !== 'saved' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-800/80 ring-1 ring-slate-700/60">
              <Link2 className="h-4 w-4 text-sky-300" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-100">Save this shortlist</div>
              <div className="text-xs text-slate-400">
                Get a permanent link to bookmark, revisit, or share with family.
              </div>
            </div>
          </div>
          <button
            onClick={save}
            disabled={state === 'saving'}
            className={cn(
              'button-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs',
              state === 'saving' && 'opacity-70',
            )}
          >
            {state === 'saving' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : state === 'error' ? (
              <>Try again</>
            ) : (
              <>Save & share</>
            )}
          </button>
        </div>
      )}

      {state === 'saved' && url && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/40">
              <Check className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-100">
                Shortlist saved · {copied ? 'link copied to clipboard' : 'share this link'}
              </div>
              <div className="mt-0.5 truncate font-mono text-xs text-slate-400">{url}</div>
            </div>
          </div>
          <button
            onClick={copy}
            className="button-ghost inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
