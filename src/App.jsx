import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CRMBoard from './pages/CRMBoard'
import ContentHub from './pages/ContentHub'
import ContentCalendar from './pages/ContentCalendar'
import AllLeads from './pages/AllLeads'

function AppInner() {
  const { user, loading } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0B0F1A',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#475569', fontSize: '0.9375rem' }}>Loading...</div>
      </div>
    )
  }

  if (!user) return <Login />

  const pages = {
    dashboard: <Dashboard setActivePage={setActivePage} />,
    crm: <CRMBoard />,
    content: <ContentHub />,
    calendar: <ContentCalendar setActivePage={setActivePage} />,
    leads: <AllLeads setActivePage={setActivePage} />,
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {pages[activePage] || pages.dashboard}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
