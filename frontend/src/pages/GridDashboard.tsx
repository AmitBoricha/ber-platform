import { useEffect, useState } from 'react'
import { getOverview, getEnergyCapacity, getSubstations, getPipeline, getEnergyCommunity, getDemandForecast } from '../api/client'
import { Card, MetricCard, CapacityBar, InsightBox, Spinner, DataTable, StatusTag } from '../components/ui'
import { Overview, CapacitySummary, EnergyRecord, PipelineItem, EnergyCommunityMember } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GridDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [capacity, setCapacity] = useState<CapacitySummary | null>(null)
  const [substations, setSubstations] = useState<EnergyRecord[]>([])
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [community, setCommunity] = useState<EnergyCommunityMember[]>([])
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOverview(), getEnergyCapacity(), getSubstations(), getPipeline(), getEnergyCommunity(), getDemandForecast()]).then(
      ([o, c, s, p, e, f]) => {
        setOverview(o)
        setCapacity(c)
        setSubstations(s)
        setPipeline(p)
        setCommunity(e)
        setForecast(f)
        setLoading(false)
      }
    )
  }, [])

  if (loading || !overview || !capacity) return <Spinner />

  const m = overview.metrics
  const queue = pipeline.filter((p) => p.status !== 'ready')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Grid Operator View — {overview.organisation}</h1>
        <p className="text-sm text-gray2">Capacity, connection queue, and §42c energy community status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total zone capacity" value={`${m.total_capacity_mw} MW`} sub="3 substations" />
        <MetricCard label="Truly available" value={`${m.available_mw} MW`} sub="Before phantom release" accent="teal" />
        <MetricCard label="Phantom reserved" value={`${m.phantom_reserved_mw} MW`} sub="Reservable if released" accent="amber" />
        <MetricCard label="Pipeline demand" value={`${m.pipeline_demand_mw} MW`} sub="Confirmed — next 18mo" accent="blue" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Substation capacity breakdown" sub="Real-time · 3 substations in BER+ zone">
          {substations.map((s) => (
            <div key={s.id} className="mb-4">
              <div className="text-xs text-white font-medium mb-1.5">{s.substation}</div>
              <CapacityBar label="In use" value={s.in_use_mw} max={s.total_capacity_mw} color="#00C49A" />
              <CapacityBar label="Real reserved" value={s.real_reserved_mw} max={s.total_capacity_mw} color="#4A8FE7" />
              <CapacityBar label="Phantom reserved" value={s.phantom_reserved_mw} max={s.total_capacity_mw} color="#F59E0B" />
            </div>
          ))}
          <InsightBox text={overview.insights[0]} />
        </Card>

        <Card title="§42c EnWG energy community" sub="Setup status — live target June 2026">
          {community.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm text-white">{c.member_name}</span>
              <StatusTag status={c.status} />
            </div>
          ))}
          <InsightBox text={`${community.filter((c) => c.status === 'signed').length} of ${community.length} members signed. Minimum viable community: 5 signatories.`} />
        </Card>
      </div>

      <Card title="Demand forecast" sub="Confirmed tenant pipeline demand by quarter">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252840" />
              <XAxis dataKey="target_quarter" stroke="#8892A4" fontSize={11} />
              <YAxis stroke="#8892A4" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1C2038', border: '1px solid #252840', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="demand_mw" name="Demand (MW)" fill="#00C49A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Connection queue" sub="Pipeline items not yet ready — by blocker type">
        <DataTable
          rows={queue}
          columns={[
            { key: 'company_name', label: 'Company' },
            { key: 'energy_need_mw', label: 'Energy', render: (r) => `${r.energy_need_mw} MW` },
            { key: 'status', label: 'Status', render: (r) => <StatusTag status={r.status} /> },
            { key: 'blocker_detail', label: 'Blocker' },
          ]}
        />
      </Card>
    </div>
  )
}
