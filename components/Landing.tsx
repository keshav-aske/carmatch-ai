'use client'

import { ArrowRight, ArrowUpRight } from 'lucide-react'

interface LandingProps {
  onStart: () => void
}

const STEPS = [
  {
    n: '01',
    title: 'Answer four questions',
    body: 'Household, primary use, budget, and the one thing that matters most. Under a minute.',
  },
  {
    n: '02',
    title: 'We score twenty cars',
    body: 'A weighted engine ranks every car across four dimensions calibrated for the Indian market.',
  },
  {
    n: '03',
    title: 'You get a confident shortlist',
    body: 'Top three matches, side-by-side specs, and a plain-English reason for every recommendation.',
  },
]

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-24 sm:pt-12">
      {/* Nav */}
      <nav className="flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-slate-100">
            <span className="text-xs font-bold text-slate-900">C</span>
          </div>
          <span className="text-sm font-medium tracking-tight text-slate-200">CarMatch</span>
        </div>
        <div className="hidden text-xs font-medium tracking-wide text-slate-500 sm:block">
          India · 2024 dataset
        </div>
      </nav>

      {/* Hero */}
      <section className="mt-28 sm:mt-36">
        <div
          className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500 animate-fade-up"
        >
          Car research, decided
        </div>

        <h1
          className="mt-6 max-w-3xl text-[44px] font-medium leading-[1.05] tracking-tight text-slate-100 sm:text-6xl animate-fade-up"
          style={{ animationDelay: '60ms' }}
        >
          Go from{' '}
          <span className="italic font-light text-slate-400">&ldquo;I don&apos;t know.&rdquo;</span>
          <br className="hidden sm:block" />{' '}
          to{' '}
          <span className="italic font-light text-emerald-300/90">&ldquo;I&apos;m confident.&rdquo;</span>
        </h1>

        <p
          className="mt-7 max-w-xl text-base leading-relaxed text-slate-400 animate-fade-up"
          style={{ animationDelay: '120ms' }}
        >
          A four-step lifestyle quiz, a weighted scoring engine, and a personalised top-three
          shortlist — built for confused buyers in the Indian car market.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 animate-fade-up"
          style={{ animationDelay: '180ms' }}
        >
          <button
            onClick={onStart}
            className="button-primary group inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm"
          >
            Start the quiz
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
          <div className="text-xs text-slate-500">
            <span className="text-slate-300">No signup</span> · Instant results · About 60 seconds
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mt-28 h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

      {/* Flow */}
      <section className="mt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[180px_1fr]">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
              The flow
            </div>
            <div className="mt-2 text-lg font-medium text-slate-200">
              Less browsing.
              <br />
              More deciding.
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-slate-800/80 bg-slate-800/40 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="bg-[#080c16] p-6 animate-fade-up"
                style={{ animationDelay: `${260 + i * 80}ms` }}
              >
                <div className="text-[11px] font-medium tracking-[0.18em] text-slate-600">
                  {s.n}
                </div>
                <div className="mt-3 text-sm font-medium text-slate-100">{s.title}</div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset strip */}
      <section className="mt-24">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-slate-800/80 pt-10 sm:grid-cols-4">
          {[
            { v: '20', l: 'Cars analysed' },
            { v: '6', l: 'Body styles' },
            { v: '4', l: 'Match dimensions' },
            { v: '< 60s', l: 'To a shortlist' },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-2xl font-medium text-slate-100">{s.v}</div>
              <div className="mt-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final line */}
      <section className="mt-24 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="max-w-md text-sm leading-relaxed text-slate-400">
          When you&apos;re ready to stop second-guessing — four questions stand between you and a
          shortlist you can act on.
        </div>
        <button
          onClick={onStart}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white"
        >
          Begin the quiz
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
      </section>
    </div>
  )
}
