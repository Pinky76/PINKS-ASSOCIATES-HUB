import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'crm', label: 'CRM Pipeline', icon: '◈' },
  { id: 'leads', label: 'All Leads', icon: '◉' },
]

export default function Layout({ children, activePage, setActivePage }) {
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#0B0F1A', fontFamily: "'DM Sans', sans-serif",
      color: '#F8FAFC'
    }}>
      <div style={{
        width: collapsed ? '64px' : '220px',
        minHeight: '100vh',
        background: '#0F1629',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'sticky', top: 0, height: '100vh',
        overflow: 'hidden', flexShrink: 0, zIndex: 10
      }}>
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59,130,246,0.25)'
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', fontFamily: "'DM Mono', monospace" }}>P</span>
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em', lineHeight: 1.2 }}>Pinks Hub</div>
                <div style={{ fontSize: '0.6875rem', color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Business OS</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '0.25rem', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>‹</button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '0.75rem', fontSize: '1rem', textAlign: 'center', width: '100%' }}>›</button>
        )}

        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              title={collapsed ? item.label : ''}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '0.75rem', padding: collapsed ? '0.75rem 0' : '0.6875rem 1.25rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: activePage === item.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                border: 'none',
                borderLeft: activePage === item.id ? '2px solid #3B82F6' : '2px solid transparent',
                color: activePage === item.id ? '#93C5FD' : '#64748B',
                cursor: 'pointer', fontSize: '0.9375rem', fontWeight: activePage === item.id ? 600 : 400,
                transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { if (activePage !== item.id) { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}}
              onMouseLeave={e => { if (activePage !== item.id) { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent' }}}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}

          {!collapsed && (
            <div style={{ margin: '1rem 1.25rem 0', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.6875rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.5rem' }}>Public Link</div>
              <a href="/enquire" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#475569', textDecoration: 'none', padding: '0.5rem 0', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}
              >
                <span>↗</span><span>Enquiry Form</span>
              </a>
            </div>
          )}
        </nav>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: collapsed ? '1rem 0' : '1rem 1.25rem',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap: '0.75rem'
        }}>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Chris Pink</div>
              <div style={{ fontSize: '0.6875rem', color: '#475569' }}>Pinks Associates</div>
            </div>
          )}
          <button onClick={signOut} title="Sign out"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#F87171', cursor: 'pointer', padding: '0.375rem 0.5rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", flexShrink: 0, transition: 'all 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
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
