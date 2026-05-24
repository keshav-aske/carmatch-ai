import type {
  Car,
  QuizAnswers,
  DimensionScore,
  MatchResult,
  SpecHighlight,
  Budget,
  Priority,
  PrimaryUse,
  Household,
} from './types'
import { formatINR } from './utils'

const BUDGET_RANGES: Record<Budget, { min: number; max: number; label: string }> = {
  under_10l: { min: 0, max: 1000000, label: 'Under ₹10 Lakh' },
  '10l_20l': { min: 1000000, max: 2000000, label: '₹10–20 Lakh' },
  '20l_35l': { min: 2000000, max: 3500000, label: '₹20–35 Lakh' },
  '35l_plus': { min: 3500000, max: 20000000, label: '₹35 Lakh+' },
}

const HOUSEHOLD_LABEL: Record<Household, string> = {
  '1-2': '1–2 people',
  '3-4': '3–4 people',
  '5+': '5+ people',
}

const USE_LABEL: Record<PrimaryUse, string> = {
  commuting: 'Daily city commuting',
  road_trips: 'Long-distance road trips',
  cargo: 'Cargo and family hauling',
  mixed: 'Mixed everyday use',
}

const PRIORITY_LABEL: Record<Priority, string> = {
  fuel_savings: 'Fuel savings',
  safety: 'Safety',
  performance: 'Performance',
  comfort: 'Comfort & features',
  cargo_space: 'Cargo space',
}

function scoreBudget(price: number, budget: Budget): number {
  const { min, max } = BUDGET_RANGES[budget]
  if (price >= min && price <= max) return 100
  if (price < min) {
    const ratio = price / Math.max(min, 1)
    return Math.max(55, ratio * 100)
  }
  const overshoot = (price - max) / max
  return Math.max(0, 100 - overshoot * 220)
}

function scoreHousehold(seats: number, household: Household): number {
  if (household === '1-2') {
    if (seats === 5) return 95
    if (seats === 7 || seats === 8) return 65
    return 70
  }
  if (household === '3-4') {
    if (seats === 5) return 100
    if (seats === 7) return 85
    return 60
  }
  if (seats >= 7) return 100
  if (seats === 6) return 70
  return 35
}

function scoreUse(car: Car, use: PrimaryUse): number {
  const cat = car.category
  const space = car.specs.boot_space_l
  const clearance = car.specs.ground_clearance_mm
  const mileage = car.fuel_efficiency || 0

  let s = 50
  if (use === 'commuting') {
    if (cat === 'Hatchback') s = 95
    else if (cat === 'EV') s = 92
    else if (cat === 'Hybrid') s = 90
    else if (cat === 'Sedan') s = 82
    else if (cat === 'SUV') s = 70
    else s = 60
    s += Math.min(8, Math.max(0, mileage - 17))
  } else if (use === 'road_trips') {
    if (cat === 'SUV') s = 95
    else if (cat === 'Sedan') s = 90
    else if (cat === 'MPV' || cat === 'Hybrid') s = 88
    else if (cat === 'EV') s = 70
    else s = 65
    if (clearance > 190) s += 5
  } else if (use === 'cargo') {
    if (cat === 'MPV') s = 100
    else if (cat === 'SUV') s = 88
    else s = Math.min(80, 35 + space / 12)
    if (car.specs.seating >= 7) s += 5
  } else {
    if (cat === 'SUV' || cat === 'Hybrid') s = 92
    else if (cat === 'Sedan' || cat === 'MPV') s = 85
    else if (cat === 'EV') s = 80
    else s = 75
  }
  return Math.min(100, s)
}

function scoreSinglePriority(car: Car, priority: Priority): number {
  const s = car.specs
  if (priority === 'fuel_savings') {
    if (car.category === 'EV') return 100
    if (car.category === 'Hybrid') return 95
    return Math.min(90, 25 + (car.fuel_efficiency || 0) * 2.6)
  }
  if (priority === 'safety') {
    const base = car.safety_rating * 20
    const adasBonus = car.features.some((f) => /ADAS|Honda Sensing|Toyota Safety|Drive Wise/i.test(f))
      ? 8
      : 0
    return Math.min(100, base + adasBonus)
  }
  if (priority === 'performance') {
    return Math.min(100, 25 + s.power_bhp / 3 + s.torque_nm / 25)
  }
  if (priority === 'comfort') {
    let p = 45 + Math.min(35, car.features.length * 3.5)
    if (car.category === 'Sedan' || car.category === 'SUV' || car.category === 'MPV' || car.category === 'Hybrid') p += 8
    if (car.features.some((f) => /Ventilated|Ottoman|Sunroof|Bose|JBL/i.test(f))) p += 5
    return Math.min(100, p)
  }
  return Math.min(100, 25 + s.boot_space_l / 12)
}

function scorePriorities(car: Car, priorities: Priority[]): { avg: number; individual: Record<Priority, number> } {
  const individual = {} as Record<Priority, number>
  let sum = 0
  for (const p of priorities) {
    const s = scoreSinglePriority(car, p)
    individual[p] = s
    sum += s
  }
  return { avg: sum / priorities.length, individual }
}

const WEIGHTS = { budget: 1.3, household: 1.0, use: 1.2, priority: 1.6 }
const TOTAL_WEIGHT = WEIGHTS.budget + WEIGHTS.household + WEIGHTS.use + WEIGHTS.priority

function totalScore(d: DimensionScore): number {
  const sum =
    d.budget * WEIGHTS.budget +
    d.household * WEIGHTS.household +
    d.use * WEIGHTS.use +
    d.priority * WEIGHTS.priority
  return Math.round(sum / TOTAL_WEIGHT)
}

function priorityReason(car: Car, p: Priority): string {
  if (p === 'fuel_savings') {
    if (car.category === 'EV') return `Zero fuel costs — ${car.specs.range_km}km certified range`
    if (car.category === 'Hybrid') return `Strong hybrid delivers ${car.fuel_efficiency.toFixed(1)} kmpl — best-in-class`
    return `${car.fuel_efficiency.toFixed(1)} kmpl makes it one of the most efficient picks for your budget`
  }
  if (p === 'safety') return `${car.safety_rating}-star Global NCAP — a top-tier safety performer`
  if (p === 'performance') return `${car.specs.power_bhp} bhp / ${car.specs.torque_nm} Nm puts it among the quickest in segment`
  if (p === 'comfort') return `Loaded with ${car.features.length}+ premium features including ${car.features[0]}`
  return `${car.specs.boot_space_l}L boot — class-leading cargo capacity`
}

function buildReasons(
  car: Car,
  d: DimensionScore,
  q: QuizAnswers,
  perPriority: Record<Priority, number>,
): string[] {
  const reasons: string[] = []

  // One reason per selected priority that scored well
  for (const p of q.top_priorities) {
    if (perPriority[p] >= 80) reasons.push(priorityReason(car, p))
  }

  if (d.budget >= 90) {
    reasons.push(`At ${formatINR(car.price_inr)}, sits squarely within your ${BUDGET_RANGES[q.budget].label} band`)
  } else if (d.budget >= 70) {
    reasons.push(`At ${formatINR(car.price_inr)}, close to your budget range`)
  }

  if (d.household >= 90) {
    if (q.household_size === '5+') {
      reasons.push(`${car.specs.seating}-seater configuration fits larger families comfortably`)
    } else if (q.household_size === '3-4') {
      reasons.push(`5-seat layout sized exactly right for a 3–4 person household`)
    } else {
      reasons.push(`Compact 5-seat layout — easy to park and drive solo`)
    }
  }

  if (d.use >= 85) {
    if (q.primary_use === 'commuting') {
      reasons.push(`${car.category} body style + ${car.fuel_efficiency || 'EV'} kmpl makes it ideal for daily city use`)
    } else if (q.primary_use === 'road_trips') {
      reasons.push(`${car.specs.ground_clearance_mm}mm ground clearance + highway-tuned ${car.category} build excels on long trips`)
    } else if (q.primary_use === 'cargo') {
      reasons.push(`${car.specs.boot_space_l}L boot and ${car.specs.seating}-seat layout handle large loads`)
    } else {
      reasons.push(`Versatile ${car.category} that handles city, highway, and weekend trips equally well`)
    }
  }

  return reasons.slice(0, 5)
}

function buildSpecHighlights(car: Car, q: QuizAnswers): SpecHighlight[] {
  const s = car.specs
  const wants = (p: Priority) => q.top_priorities.includes(p)
  return [
    {
      label: 'Mileage',
      value: car.category === 'EV' ? `${s.range_km} km range` : `${car.fuel_efficiency} kmpl`,
      highlighted: wants('fuel_savings'),
    },
    {
      label: 'Safety',
      value: `${car.safety_rating}★ NCAP`,
      highlighted: wants('safety'),
    },
    {
      label: 'Power',
      value: `${s.power_bhp} bhp`,
      highlighted: wants('performance'),
    },
    {
      label: 'Torque',
      value: `${s.torque_nm} Nm`,
      highlighted: wants('performance'),
    },
    {
      label: 'Seating',
      value: `${s.seating} seats`,
      highlighted: q.household_size === '5+',
    },
    {
      label: 'Boot',
      value: `${s.boot_space_l} L`,
      highlighted: wants('cargo_space') || q.primary_use === 'cargo',
    },
    {
      label: 'Ground Clearance',
      value: `${s.ground_clearance_mm} mm`,
      highlighted: q.primary_use === 'road_trips',
    },
    {
      label: 'Transmission',
      value: s.transmission,
      highlighted: false,
    },
  ]
}

export function matchCars(cars: Car[], answers: QuizAnswers): MatchResult[] {
  const scored = cars.map((car) => {
    const { avg, individual } = scorePriorities(car, answers.top_priorities)
    const dimension_scores: DimensionScore = {
      budget: scoreBudget(car.price_inr, answers.budget),
      household: scoreHousehold(car.specs.seating, answers.household_size),
      use: scoreUse(car, answers.primary_use),
      priority: avg,
    }
    return {
      car,
      dimension_scores,
      match_percentage: totalScore(dimension_scores),
      individual,
    }
  })

  scored.sort((a, b) => b.match_percentage - a.match_percentage)
  const top = scored.slice(0, 3)

  return top.map<MatchResult>((entry, idx) => ({
    car: entry.car,
    match_percentage: entry.match_percentage,
    rank: idx + 1,
    match_reasons: buildReasons(entry.car, entry.dimension_scores, answers, entry.individual),
    dimension_scores: entry.dimension_scores,
    spec_highlights: buildSpecHighlights(entry.car, answers),
  }))
}

export function quizSummary(q: QuizAnswers) {
  return {
    household: HOUSEHOLD_LABEL[q.household_size],
    use: USE_LABEL[q.primary_use],
    budget: BUDGET_RANGES[q.budget].label,
    priorities: q.top_priorities.map((p) => PRIORITY_LABEL[p]),
  }
}
