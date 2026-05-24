'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  User,
  Users,
  UsersRound,
  Briefcase,
  MountainSnow,
  PackageOpen,
  Shuffle,
  Wallet,
  Wallet2,
  PiggyBank,
  Gem,
  Fuel,
  Shield,
  Zap,
  Sofa,
  PackageCheck,
} from 'lucide-react'
import type {
  QuizAnswers,
  Household,
  PrimaryUse,
  Budget,
  Priority,
} from '@/lib/types'
import { cn } from '@/lib/utils'

interface QuizWizardProps {
  onComplete: (answers: QuizAnswers) => void
  onBack: () => void
  loading: boolean
  error: string | null
}

type StepKey = 'household_size' | 'primary_use' | 'budget' | 'top_priorities'
const MAX_PRIORITIES = 3

interface OptionDef<T extends string> {
  value: T
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const HOUSEHOLD_OPTIONS: OptionDef<Household>[] = [
  { value: '1-2', label: '1–2 people', description: 'Just me, or a partner', icon: User },
  { value: '3-4', label: '3–4 people', description: 'Small family setup', icon: Users },
  { value: '5+', label: '5+ people', description: 'Joint / extended family', icon: UsersRound },
]

const USE_OPTIONS: OptionDef<PrimaryUse>[] = [
  { value: 'commuting', label: 'Daily commuting', description: 'City driving, traffic, short hops', icon: Briefcase },
  { value: 'road_trips', label: 'Road trips', description: 'Long highway drives, weekend getaways', icon: MountainSnow },
  { value: 'cargo', label: 'Cargo & people', description: 'Hauling family, luggage, gear', icon: PackageOpen },
  { value: 'mixed', label: 'A mix of everything', description: 'No clear single use case', icon: Shuffle },
]

const BUDGET_OPTIONS: OptionDef<Budget>[] = [
  { value: 'under_10l', label: 'Under ₹10 L', description: 'Hatchbacks, entry sedans', icon: PiggyBank },
  { value: '10l_20l', label: '₹10–20 L', description: 'Compact SUVs, mid sedans', icon: Wallet },
  { value: '20l_35l', label: '₹20–35 L', description: 'Mid-size SUVs, premium sedans', icon: Wallet2 },
  { value: '35l_plus', label: '₹35 L+', description: 'Luxury & premium EVs', icon: Gem },
]

const PRIORITY_OPTIONS: OptionDef<Priority>[] = [
  { value: 'fuel_savings', label: 'Fuel savings', description: 'Lowest running cost', icon: Fuel },
  { value: 'safety', label: 'Safety', description: 'NCAP ratings & ADAS', icon: Shield },
  { value: 'performance', label: 'Performance', description: 'Power, torque, quick acceleration', icon: Zap },
  { value: 'comfort', label: 'Comfort & features', description: 'Sunroof, ADAS, ventilated seats', icon: Sofa },
  { value: 'cargo_space', label: 'Cargo space', description: 'Big boot, foldable seats', icon: PackageCheck },
]

const STEPS: { key: StepKey; title: string; subtitle: string; multi?: boolean }[] = [
  {
    key: 'household_size',
    title: 'Who will use the car?',
    subtitle: 'This shapes how many seats you actually need.',
  },
  {
    key: 'primary_use',
    title: 'What will you mostly drive it for?',
    subtitle: 'City versus highway changes everything.',
  },
  {
    key: 'budget',
    title: 'What budget feels comfortable?',
    subtitle: 'Pick the band that wouldn’t stretch you.',
  },
  {
    key: 'top_priorities',
    title: 'What matters most to you?',
    subtitle: 'Pick up to three — we’ll weight them equally in the match.',
    multi: true,
  },
]

export default function QuizWizard({ onComplete, onBack, loading, error }: QuizWizardProps) {
  const [step, setStep] = useState(0)
  const [household, setHousehold] = useState<Household | null>(null)
  const [use, setUse] = useState<PrimaryUse | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)
  const [priorities, setPriorities] = useState<Priority[]>([])

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  function togglePriority(p: Priority) {
    setPriorities((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p)
      if (prev.length >= MAX_PRIORITIES) {
        // replace the first one (oldest) so user isn't stuck
        return [...prev.slice(1), p]
      }
      return [...prev, p]
    })
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    if (household && use && budget && priorities.length > 0) {
      onComplete({
        household_size: household,
        primary_use: use,
        budget,
        top_priorities: priorities,
      })
    }
  }

  function prev() {
    if (step === 0) onBack()
    else setStep((s) => s - 1)
  }

  const canProceed = (() => {
    if (current.key === 'household_size') return Boolean(household)
    if (current.key === 'primary_use') return Boolean(use)
    if (current.key === 'budget') return Boolean(budget)
    return priorities.length > 0
  })() && !loading

  const isLast = step === STEPS.length - 1

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 sm:py-16">
      {/* Top bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={prev}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 hover:text-slate-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {step === 0 ? 'Home' : 'Back'}
        </button>
        <div className="font-medium tracking-wide text-slate-300">
          Step {step + 1} <span className="text-slate-600">/ {STEPS.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full progress-track">
        <div className="h-full progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div key={step} className="mt-12 animate-fade-up">
        <h2 className="text-3xl font-bold tracking-tight gradient-text sm:text-4xl">
          {current.title}
        </h2>
        <p className="mt-3 text-base text-slate-400">{current.subtitle}</p>

        {current.multi && (
          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full bg-slate-800/70 px-2.5 py-1 font-medium text-slate-200">
              {priorities.length}/{MAX_PRIORITIES} selected
            </span>
            <span>Pick one, two, or three. Multiple selections are averaged equally.</span>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {current.key === 'household_size' &&
            HOUSEHOLD_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                opt={opt}
                selected={household === opt.value}
                onSelect={() => setHousehold(opt.value)}
              />
            ))}
          {current.key === 'primary_use' &&
            USE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                opt={opt}
                selected={use === opt.value}
                onSelect={() => setUse(opt.value)}
              />
            ))}
          {current.key === 'budget' &&
            BUDGET_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                opt={opt}
                selected={budget === opt.value}
                onSelect={() => setBudget(opt.value)}
              />
            ))}
          {current.key === 'top_priorities' &&
            PRIORITY_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                opt={opt}
                selected={priorities.includes(opt.value)}
                onSelect={() => togglePriority(opt.value)}
                multi
              />
            ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <button
            onClick={prev}
            className="button-ghost inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm"
            disabled={loading}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={next}
            disabled={!canProceed}
            className={cn(
              'button-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm',
              !canProceed && 'cursor-not-allowed opacity-50',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Matching…
              </>
            ) : isLast ? (
              <>
                See my matches
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function OptionCard<T extends string>({
  opt,
  selected,
  onSelect,
  multi = false,
}: {
  opt: OptionDef<T>
  selected: boolean
  onSelect: () => void
  multi?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'option-card relative text-left rounded-xl p-5',
        selected && 'option-card-selected',
      )}
    >
      {multi && (
        <div
          className={cn(
            'absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-md border transition-colors',
            selected
              ? 'border-sky-400/70 bg-sky-400/20 text-sky-200'
              : 'border-slate-700 bg-slate-900/60 text-transparent',
          )}
        >
          <Check className="h-3 w-3" />
        </div>
      )}
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-colors',
            selected
              ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/50'
              : 'bg-slate-800/80 text-slate-300 ring-1 ring-slate-700/60',
          )}
        >
          <opt.icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <div className="text-sm font-semibold text-slate-100">{opt.label}</div>
          <div className="mt-1 text-xs leading-relaxed text-slate-400">{opt.description}</div>
        </div>
      </div>
    </button>
  )
}
