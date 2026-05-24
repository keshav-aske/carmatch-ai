export interface CarSpecs {
  engine: string
  power_bhp: number
  torque_nm: number
  transmission: string
  fuel_type: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'CNG'
  seating: number
  boot_space_l: number
  ground_clearance_mm: number
  range_km: number | null
}

export type CarCategory = 'SUV' | 'Sedan' | 'Hatchback' | 'EV' | 'Hybrid' | 'MPV'

export interface Car {
  id: string
  make: string
  model: string
  variant: string
  year: number
  category: CarCategory
  price_inr: number
  safety_rating: number
  fuel_efficiency: number
  specs: CarSpecs
  features: string[]
  pros: string[]
  cons: string[]
  reviews_summary: string
  color_accent: string
}

export type Household = '1-2' | '3-4' | '5+'
export type PrimaryUse = 'commuting' | 'road_trips' | 'cargo' | 'mixed'
export type Budget = 'under_10l' | '10l_20l' | '20l_35l' | '35l_plus'
export type Priority = 'fuel_savings' | 'safety' | 'performance' | 'comfort' | 'cargo_space'

export interface QuizAnswers {
  household_size: Household
  primary_use: PrimaryUse
  budget: Budget
  top_priorities: Priority[]
}

export interface DimensionScore {
  budget: number
  household: number
  use: number
  priority: number
}

export interface SpecHighlight {
  label: string
  value: string
  highlighted: boolean
}

export interface MatchResult {
  car: Car
  match_percentage: number
  rank: number
  match_reasons: string[]
  dimension_scores: DimensionScore
  spec_highlights: SpecHighlight[]
}

export interface MatchResponse {
  results: MatchResult[]
  quiz_summary: {
    household: string
    use: string
    budget: string
    priorities: string[]
  }
}
