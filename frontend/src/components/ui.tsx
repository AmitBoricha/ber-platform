import React from 'react'

export function MetricCard({
  label,
  value,
  sub,
  accent = 'teal',
}: {
  label: string
  value: string | number
  sub?: string
  accent?: 'teal' | 'amber' | 'red' | 'blue'
}) {
  const accentColor = {
    teal: 'text-teal',
    amber: 'text-amber',
    red: 'text-red',
    blue: 'text-blue',
  }[accent]

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-gray2 mb-2">{label}</div>
      <div className={`text-2xl font-semibold ${accentColor}`}>{value}</div>
      {sub && <div className="text-xs text-gray2 mt-1">{sub}</div>}
    </div>
  )
}

export function Card({
  title,
  sub,
  children,
  accent,
}: {
  title?: string
  sub?: string
  children: React.ReactNode
  accent?: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden">
      {accent && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />}
      {title && <div className="text-sm font-semibold text-white mb-1">{title}</div>}
      {sub && <div className="text-xs text-gray2 mb-3">{sub}</div>}
      {children}
    </div>
  )
}

export function CapacityBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xs text-gray2 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-card2 rounded h-2 overflow-hidden">
        <div className="h-full rounded transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-medium text-white w-16 text-right flex-shrink-0">{value} MW</span>
    </div>
  )
}

export function StatusTag({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Approved', cls: 'bg-teal/10 text-teal border-teal/30' },
    pending: { label: 'Pending', cls: 'bg-amber/10 text-amber border-amber/30' },
    blocked: { label: 'Blocked', cls: 'bg-red/10 text-red border-red/30' },
    ready: { label: 'Ready', cls: 'bg-teal/10 text-teal border-teal/30' },
    bplan_pending: { label: 'B-Plan pending', cls: 'bg-amber/10 text-amber border-amber/30' },
    grid_blocked: { label: 'Grid blocked', cls: 'bg-red/10 text-red border-red/30' },
    signed: { label: 'Signed', cls: 'bg-teal/10 text-teal border-teal/30' },
    in_discussion: { label: 'In discussion', cls: 'bg-amber/10 text-amber border-amber/30' },
    regulatory_review: { label: 'Regulatory review', cls: 'bg-blue/10 text-blue border-blue/30' },
  }
  const s = map[status] || { label: status, cls: 'bg-card2 text-gray2 border-border' }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${s.cls}`}>{s.label}</span>
}

export function DataTable<T extends Record<string, any>>({
  rows,
  columns,
}: {
  rows: T[]
  columns: { key: string; label: string; render?: (row: T) => React.ReactNode }[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => (
              <th key={c.key} className="text-left text-xs text-gray2 font-medium py-2 px-2">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {columns.map((c) => (
                <td key={c.key} className="py-2.5 px-2 text-lgray">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function InsightBox({ text }: { text: string }) {
  return (
    <div className="bg-card2 border border-border rounded-lg p-3 mt-3 text-sm text-teal font-medium">
      {text}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-border border-t-teal rounded-full animate-spin" />
    </div>
  )
}

export function formatEUR(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `€${(value / 1_000).toFixed(0)}K`
  return `€${value}`
}
