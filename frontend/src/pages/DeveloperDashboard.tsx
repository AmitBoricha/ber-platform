import { useEffect, useState } from 'react'
import { getOverview, getBPlans, getPipeline, getEnergyCapacity } from '../api/client'
import { Card, MetricCard, InsightBox, Spinner, DataTable, StatusTag, formatEUR } from '../components/ui'
import { Overview, BPlan, PipelineItem, CapacitySummary } from '../types'

export default function DeveloperDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [bplans, setBplans] = useState<BPlan[]>([])
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [capacity, setCapacity] = useState<CapacitySummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOverview(), getBPlans(), getPipeline(), getEnergyCapacity()]).then(([o, b, p, c]) => {
      setOverview(o)
      setBplans(b)
      setPipeline(p)
      setCapacity(c)
      setLoading(false)
    })
  }, [])

  if (loading || !overview || !capacity) return <Spinner />

  const m = overview.metrics
  const pendingCount = bplans.filter((b) => b.status !== 'approved').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">My Projects — {overview.organisation}</h1>
        <p className="text-sm text-gray2">Your B-Plan status, grid connections, and zone context</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Active projects" value={m.own_active_projects} sub="In BER+ zone" />
        <MetricCard label="Pending approvals" value={m.own_pending_approvals} sub={pendingCount > 0 ? 'Awaiting B-Plan decision' : 'None pending'} accent={pendingCount > 0 ? 'amber' : 'teal'} />
        <MetricCard label="Zone avg. decision time" value={`${m.avg_zone_decision_days} days`} sub="↓ from 420 days" accent="teal" />
        <MetricCard label="Zone capacity available" value={`${m.zone_available_capacity_mw} MW`} sub="After phantom release" accent="blue" />
      </div>

      <Card title="Your B-Plan parcels" sub="Real-time status from municipality data feed">
        <DataTable
          rows={bplans}
          columns={[
            { key: 'parcel_name', label: 'Parcel' },
            { key: 'municipality', label: 'Municipality' },
            { key: 'area_ha', label: 'Area', render: (r) => `${r.area_ha} ha` },
            { key: 'investment_value_eur', label: 'Investment', render: (r) => formatEUR(r.investment_value_eur) },
            { key: 'days_in_review', label: 'Days', render: (r) => (r.status === 'approved' ? `Approved (${r.days_in_review}d)` : `${r.days_in_review} days`) },
            { key: 'status', label: 'Status', render: (r) => <StatusTag status={r.status} /> },
          ]}
        />
        <InsightBox text={overview.insights[0]} />
      </Card>

      <Card title="Your tenant pipeline" sub="Companies linked to your development projects">
        {pipeline.length === 0 ? (
          <p className="text-sm text-gray2 py-4">No tenant pipeline entries linked to your organisation yet.</p>
        ) : (
          <DataTable
            rows={pipeline}
            columns={[
              { key: 'company_name', label: 'Company' },
              { key: 'sector', label: 'Sector' },
              { key: 'energy_need_mw', label: 'Energy', render: (r) => `${r.energy_need_mw} MW` },
              { key: 'target_quarter', label: 'Target' },
              { key: 'status', label: 'Status', render: (r) => <StatusTag status={r.status} /> },
              { key: 'blocker_detail', label: 'Note', render: (r) => r.blocker_detail || '—' },
            ]}
          />
        )}
      </Card>
    </div>
  )
}
