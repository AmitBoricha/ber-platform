import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated, getRole } from './api/client'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import FbbDashboard from './pages/FbbDashboard'
import DeveloperDashboard from './pages/DeveloperDashboard'
import MunicipalityDashboard from './pages/MunicipalityDashboard'
import GridDashboard from './pages/GridDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function RoleDashboard() {
  const role = getRole()
  switch (role) {
    case 'fbb':
      return <FbbDashboard />
    case 'developer':
      return <DeveloperDashboard />
    case 'municipality':
      return <MunicipalityDashboard />
    case 'grid_operator':
      return <GridDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
