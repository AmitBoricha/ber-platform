import { useEffect, useState } from 'react'
import { getOverview, getBPlanFunnel, getInvestmentImpact } from '../api/client'
import { Card, MetricCard, CapacityBar, InsightBox, Spinner, DataTable, StatusTag, formatEUR } from '../components/ui'
import { Overview, BPlanFunnel } from '../types'

export default function MunicipalityDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [funnel, setFunnel] = useState<BPlanFunnel | null>(null)
  const [impact, setImpact] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getOverview(), getBPlanFunnel(), getInvestmentImpact()]).then(([o, f, i]) => {
      setOverview(o)
      setFunnel(f)
      setImpact(i)
      setLoading(false)
    })
  }, [])

  if (loading || !overview || !funnel) return <Spinner />

  const m = overview.metrics

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Municipality View — {overview.organisation}</h1>
        <p className="text-sm text-gray2">Investment waiting on your planning decisions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="B-Plans under review" value={m.bplans_under_review} sub="Avg. days varies by parcel" accent="amber" />
        <MetricCard label="Investment waiting" value={formatEUR(m.investment_waiting_eur)} sub="On your approvals" accent="red" />
        <MetricCard label="Total zone area" value={`${m.total_zone_area_ha} ha`} sub="Tracked parcels" />
        <MetricCard label="Approved this period" value={m.approved_this_period} sub="Investment unlocked" accent="teal" />
      </div>

      <Card title="Zone land status" sub="B-Plan approval breakdown — all zone parcels">
        {funnel.by_status.map((b) => (
          <CapacityBar
            key={b.status}
            label={`${b.status[0].toUpperCase()}${b.status.slice(1)} (${b.pct_of_zone}%)`}
            value={b.area_ha}
            max={funnel.total_area_ha}
            color={b.status === 'approved' ? '#00C49A' : b.status === 'pending' ? '#F59E0B' : '#E24B4A'}
          />
        ))}
        <InsightBox text={overview.insights[0]} />
      </Card>

      <Card title="Pending B-Plan decisions — with investment context" sub="Ranked by investment value waiting on your decision">
        <DataTable
          rows={impact}
          columns={[
            { key: 'parcel_name', label: 'Parcel' },
            { key: 'developer', label: 'Developer' },
            { key: 'days_in_review', label: 'Days in review' },
            { key: 'investment_value_eur', label: 'Investment at stake', render: (r) => formatEUR(r.investment_value_eur) },
            { key: 'status', label: 'Status', render: (r) => <StatusTag status={r.status} /> },
          ]}
        />
      </Card>
    </div>
  )
}
