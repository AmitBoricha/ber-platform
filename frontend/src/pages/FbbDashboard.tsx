import { useEffect, useState } from 'react'
import {
  getOverview,
  getEnergyCapacity,
  getBPlanFunnel,
  getPipeline,
  getDemandForecast,
} from '../api/client'
import { Card, MetricCard, CapacityBar, InsightBox, Spinner, DataTable, StatusTag, formatEUR } from '../components/ui'
import { Overview, CapacitySummary, BPlanFunnel, PipelineItem } from '../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function FbbDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [capacity, setCapacity] = useState<CapacitySummary | null>(null)
  const [funnel, setFunnel] = useState<BPlanFunnel | null>(null)
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOverview(), getEnergyCapacity(), getBPlanFunnel(), getPipeline(), getDemandForecast()]).then(
      ([o, c, f, p, d]) => {
        setOverview(o)
        setCapacity(c)
        setFunnel(f)
        setPipeline(p)
        setForecast(d)
        setLoading(false)
      }
    )
  }, [])

  if (loading || !overview || !capacity || !funnel) return <Spinner />

  const m = overview.metrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Zone Overview</h1>
        <p className="text-sm text-gray2">Real-time coordination data across the BER+ zone</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Tenants in pipeline" value={m.tenant_pipeline_total} sub={`${pipeline.filter((p) => p.status === 'ready').length} ready to connect`} />
        <MetricCard label="Energy demand — 12mo" value={`+${m.energy_demand_12mo_mw} MW`} sub="From confirmed pipeline" accent="amber" />
        <MetricCard label="Avg. connection time" value={`${m.avg_connection_days} days`} sub="↓ from 420 days" accent="teal" />
        <MetricCard label="B-Plans approved" value={m.bplans_approved} sub={`of ${funnel.by_status.reduce((s, b) => s + b.count, 0)} total`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Capacity card */}
        <Card title="Zone capacity status" sub="Real-time from grid operator data feed">
          <CapacityBar label="In active use" value={capacity.in_use_mw} max={capacity.total_mw} color="#00C49A" />
          <CapacityBar label="Real reservations" value={capacity.real_reserved_mw} max={capacity.total_mw} color="#4A8FE7" />
          <CapacityBar label="Phantom reserved" value={capacity.phantom_reserved_mw} max={capacity.total_mw} color="#F59E0B" />
          <CapacityBar label="Truly available" value={capacity.available_mw} max={capacity.total_mw} color="#34D399" />
          <InsightBox text={overview.insights[0]} />
        </Card>

        {/* Land approval card */}
        <Card title="Land approval status" sub="B-Plan tracker — all zone parcels">
          {funnel.by_status.map((b) => (
            <CapacityBar
              key={b.status}
              label={`${b.status[0].toUpperCase()}${b.status.slice(1)} (${b.pct_of_zone}%)`}
              value={b.area_ha}
              max={funnel.total_area_ha}
              color={b.status === 'approved' ? '#00C49A' : b.status === 'pending' ? '#F59E0B' : '#E24B4A'}
            />
          ))}
          <InsightBox text={`Total zone investment value: ${formatEUR(funnel.total_investment_eur)} across ${funnel.total_area_ha} ha`} />
        </Card>
      </div>

      {/* Demand forecast chart */}
      <Card title="Energy demand forecast" sub="Confirmed pipeline demand by quarter — cumulative">
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252840" />
              <XAxis dataKey="target_quarter" stroke="#8892A4" fontSize={11} />
              <YAxis stroke="#8892A4" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1C2038', border: '1px solid #252840', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="cumulative_demand_mw" name="Cumulative demand (MW)" stroke="#00C49A" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="demand_mw" name="Quarterly demand (MW)" stroke="#4A8FE7" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pipeline table */}
      <Card title="Tenant pipeline" sub="All incoming companies — source: FBB tenant relations">
        <DataTable
          rows={pipeline}
          columns={[
            { key: 'company_name', label: 'Company' },
            { key: 'sector', label: 'Sector' },
            { key: 'energy_need_mw', label: 'Energy', render: (r) => `${r.energy_need_mw} MW` },
            { key: 'target_quarter', label: 'Target' },
            { key: 'status', label: 'Status', render: (r) => <StatusTag status={r.status} /> },
          ]}
        />
      </Card>
    </div>
  )
}
