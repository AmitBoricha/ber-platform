import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/client'

const DEMO_ACCOUNTS = [
  { role: 'FBB — Airport Operator', email: 'fbb@ber-plus.de', color: 'border-teal' },
  { role: 'Developer (SEGRO)', email: 'developer@ber-plus.de', color: 'border-blue' },
  { role: 'Municipality (WFG Dahme-Spreewald)', email: 'municipality@ber-plus.de', color: 'border-amber' },
  { role: 'Grid Operator (e.dis Netz)', email: 'grid@ber-plus.de', color: 'border-purple' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="bg-[#0F3D2E] text-teal text-xs font-semibold px-3 py-1.5 rounded-md tracking-wide">
          BER+
        </span>
        <span className="text-white text-base font-medium">Coordination Intelligence Layer</span>
      </div>
      <p className="text-gray2 text-sm mb-10">Airport Region Berlin Brandenburg</p>

      <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mb-8">
        <h2 className="text-white text-lg font-semibold mb-4">Sign in</h2>
        <label className="block text-xs text-gray2 mb-1">Email</label>
        <input
          className="w-full bg-card2 border border-border rounded-md px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-teal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@ber-plus.de"
        />
        <label className="block text-xs text-gray2 mb-1">Password</label>
        <input
          type="password"
          className="w-full bg-card2 border border-border rounded-md px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-teal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="text-red text-sm mb-3">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal text-black font-medium rounded-md py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="w-full max-w-sm">
        <p className="text-xs text-gray2 mb-2 uppercase tracking-wide">Demo accounts — password: demo1234</p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              onClick={() => setEmail(acc.email)}
              className={`w-full text-left bg-card2 border ${acc.color} border-opacity-40 rounded-md px-3 py-2 text-xs hover:bg-card transition`}
            >
              <div className="text-white font-medium">{acc.role}</div>
              <div className="text-gray2">{acc.email}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
