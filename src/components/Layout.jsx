import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'crm', label: 'CRM Pipeline', icon: '◈' },
  { id: 'leads', label: 'All Leads', icon: '◉' },
]

export default function Layout({ children, activePage, setActivePage }) {
  const { signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#F1F5F9', fontFamily: "'DM Sans', sans-serif", color: '#0F172A'
    }}>
      {/* Sidebar */}
      <div style={{
        width: collapsed ? '60px' : '220px',
        minHeight: '100vh', background: '#fff',
        borderRight: '1px solid #E2E8F0',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', flexShrink: 0, zIndex: 10,
        boxShadow: '1px 0 4px rgba(0,0,0,0.04)'
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'DM Mono', monospace" }}>P</span>
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Pinks Hub</div>
                <div style={{ fontSize: '0.625rem', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Business OS</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.25rem', flexShrink: 0 }}>‹</button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: '0.75rem', fontSize: '1rem', textAlign: 'center', width: '100%' }}>›</button>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)} title={collapsed ? item.label : ''}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '0.75rem', padding: collapsed ? '0.75rem 0' : '0.625rem 1.25rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: activePage === item.id ? '#EFF6FF' : 'transparent',
                border: 'none',
                borderLeft: activePage === item.id ? '3px solid #3B82F6' : '3px solid transparent',
                color: activePage === item.id ? '#1D4ED8' : '#64748B',
                cursor: 'pointer', fontSize: '0.875rem',
                fontWeight: activePage === item.id ? 600 : 400,
                transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { if (activePage !== item.id) { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#334155' }}}
              onMouseLeave={e => { if (activePage !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}}
            >
              <span style={{ fontSize: '0.9375rem', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}

          {!collapsed && (
            <div style={{ margin: '1rem 1.25rem 0', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '0.625rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>Public</div>
              <a href="/enquire" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#94A3B8', textDecoration: 'none', padding: '0.375rem 0', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#3B82F6'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                <span style={{ fontSize: '0.75rem' }}>↗</span><span>Enquiry Form</span>
              </a>
            </div>
          )}
        </nav>

        {/* User */}
        <div style={{
          borderTop: '1px solid #F1F5F9',
          padding: collapsed ? '1rem 0' : '0.875rem 1.25rem',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: '0.75rem'
        }}>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', color: '#334155', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Chris Pink</div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>Pinks Associates</div>
            </div>
          )}
          <button onClick={signOut} title="Sign out"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', color: '#EF4444', cursor: 'pointer', padding: '0.375rem 0.625rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FEF2F2' }}
          >
            {collapsed ? '→' : 'Sign Out'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
