export interface BPlan {
  id: number
  parcel_name: string
  developer: string
  status: 'approved' | 'pending' | 'blocked'
  days_in_review: number
  investment_value_eur: number
  municipality: string
  area_ha: number
  updated_at: string
}

export interface EnergyRecord {
  id: number
  substation: string
  total_capacity_mw: number
  in_use_mw: number
  real_reserved_mw: number
  phantom_reserved_mw: number
}

export interface PipelineItem {
  id: number
  company_name: string
  sector: string
  size_sqm: number
  energy_need_mw: number
  target_quarter: string
  developer: string | null
  status: 'ready' | 'bplan_pending' | 'grid_blocked'
  blocker_detail: string | null
}

export interface EnergyCommunityMember {
  id: number
  member_name: string
  status: 'signed' | 'in_discussion' | 'regulatory_review'
}

export interface Overview {
  role: string
  organisation: string
  metrics: Record<string, number>
  insights: string[]
}

export interface CapacitySummary {
  total_mw: number
  in_use_mw: number
  real_reserved_mw: number
  phantom_reserved_mw: number
  available_mw: number
}

export interface BPlanFunnel {
  by_status: { status: string; count: number; area_ha: number; investment_eur: number; pct_of_zone: number }[]
  total_area_ha: number
  total_investment_eur: number
}
