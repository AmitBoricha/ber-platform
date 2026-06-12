import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('organisation')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password })
  localStorage.setItem('token', data.access_token)
  localStorage.setItem('role', data.role)
  localStorage.setItem('organisation', data.organisation)
  return data
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('organisation')
}

export function getRole(): string | null {
  return localStorage.getItem('role')
}

export function getOrganisation(): string | null {
  return localStorage.getItem('organisation')
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

// ── Dashboard ─────────────────────────────────────────────
export async function getOverview() {
  const { data } = await api.get('/dashboard/overview')
  return data
}

// ── B-Plans ─────────────────────────────────────────────
export async function getBPlans() {
  const { data } = await api.get('/bplans/')
  return data
}

export async function getBPlanFunnel() {
  const { data } = await api.get('/bplans/funnel')
  return data
}

export async function getInvestmentImpact() {
  const { data } = await api.get('/bplans/investment-impact')
  return data
}

// ── Energy ──────────────────────────────────────────────
export async function getEnergyCapacity() {
  const { data } = await api.get('/energy/capacity')
  return data
}

export async function getSubstations() {
  const { data } = await api.get('/energy/substations')
  return data
}

export async function getPhantomInsight() {
  const { data } = await api.get('/energy/phantom-insight')
  return data
}

export async function getDemandForecast() {
  const { data } = await api.get('/energy/demand-forecast')
  return data
}

export async function getEnergyCommunity() {
  const { data } = await api.get('/energy/energy-community')
  return data
}

// ── Pipeline ──────────────────────────────────────────────
export async function getPipeline() {
  const { data } = await api.get('/pipeline/')
  return data
}

export async function getPipelineSummary() {
  const { data } = await api.get('/pipeline/summary')
  return data
}
