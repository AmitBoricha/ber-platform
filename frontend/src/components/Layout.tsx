import { useNavigate } from 'react-router-dom'
import { getRole, getOrganisation, logout } from '../api/client'

const ROLE_LABELS: Record<string, string> = {
  fbb: 'FBB — Airport Operator',
  developer: 'Developer',
  municipality: 'Municipality',
  grid_operator: 'Grid Operator',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const role = getRole() || ''
  const org = getOrganisation() || ''

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-card2 border-b border-border h-14 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="bg-[#0F3D2E] text-teal text-xs font-semibold px-2.5 py-1 rounded-md tracking-wide">
            BER+
          </span>
          <span className="text-white text-sm font-medium">Coordination Intelligence Layer</span>
          <span className="text-border">·</span>
          <span className="text-sm font-medium text-lgray">
            {ROLE_LABELS[role] || role} — {org}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-gray2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Live · 14 members connected
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-gray2 border border-border rounded-md px-3 py-1.5 hover:text-lgray transition"
          >
            Sign out
          </button>
        </div>
      </div>
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</div>
    </div>
  )
}
