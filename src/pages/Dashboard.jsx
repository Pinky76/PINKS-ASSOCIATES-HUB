import { useEffect, useState } from 'react'
import { supabase, PRODUCT_TYPES, PIPELINE_STAGES } from '../lib/supabase'

export default function Dashboard({ setActivePage }) {
  const [leads, setLeads] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('leads').select('*').eq('is_archived', false),
      supabase.from('posts').select('*').order('scheduled_for', { ascending: true })
    ]).then(([leadsRes, postsRes]) => {
      setLeads(leadsRes.data || [])
      setPosts(postsRes.data || [])
      setLoading(false)
    })
  }, [])

  const totalLeads = leads.length
  const totalCommission = leads.reduce((sum, l) => sum + (parseFloat(l.potential_commission) || 0), 0)
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length
  const wonLeads = leads.filter(l => l.pipeline_stage === 'won').length

  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  const upcomingPosts = posts
    .filter(p => p.status === 'scheduled' && p.scheduled_for)
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for))
    .slice(0, 4)

  // Stage counts
  const stageCounts = PIPELINE_STAGES.map(s => ({
    ...s,
    count: leads.filter(l => l.pipeline_stage === s.id).length
  }))

  const formatCurrency = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <LoadingState />

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>
          Good {getTimeOfDay()}, Chris.
        </h1>
        <p style={{ color: '#64748B', margin: '0.25rem 0 0', fontSize: '0.9375rem' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <MetricCard label="Total Leads" value={totalLeads} sub="active pipeline" accent="#3B82F6" icon="◉" onClick={() => setActivePage('crm')} />
        <MetricCard label="Potential Commission" value={formatCurrency(totalCommission)} sub="across all leads" accent="#10B981" icon="£" onClick={() => setActivePage('leads')} />
        <MetricCard label="Posts Scheduled" value={scheduledPosts} sub="upcoming content" accent="#8B5CF6" icon="✦" onClick={() => setActivePage('calendar')} />
        <MetricCard label="Won This Pipeline" value={wonLeads} sub="completed deals" accent="#F97316" icon="★" onClick={() => setActivePage('crm')} />
      </div>

      {/* Pipeline snapshot + Recent leads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Pipeline snapshot */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Pipeline Snapshot</span>
            <button onClick={() => setActivePage('crm')} style={linkBtn}>View full board →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stageCounts.filter(s => s.id !== 'lost').map(stage => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, fontSize: '0.8125rem', color: '#94A3B8' }}>{stage.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '3px',
                      width: `${totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, #3B82F6, #6366F1)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#F8FAFC', fontWeight: 600, minWidth: '20px', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
                    {stage.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div style={cardStyle}>
          <div style={cardHeader}>
            <span style={cardTitle}>Recent Leads</span>
            <button onClick={() => setActivePage('leads')} style={linkBtn}>View all →</button>
          </div>
          {recentLeads.length === 0 ? (
            <EmptyState message="No leads yet" sub="Add your first lead to get started" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {recentLeads.map(lead => {
                const pt = PRODUCT_TYPES[lead.product_type]
                return (
                  <div key={lead.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.75rem', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                      background: pt?.color || '#64748B'
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', color: '#E2E8F0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.first_name} {lead.last_name}
                        {lead.company_name && <span style={{ color: '#64748B', fontWeight: 400 }}> · {lead.company_name}</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>{pt?.label || lead.product_type}</div>
                    </div>
                    {lead.potential_commission > 0 && (
                      <div style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 600, fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                        {formatCurrency(lead.potential_commission)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming posts */}
      <div style={cardStyle}>
        <div style={cardHeader}>
          <span style={cardTitle}>Upcoming Scheduled Posts</span>
          <button onClick={() => setActivePage('calendar')} style={linkBtn}>View calendar →</button>
        </div>
        {upcomingPosts.length === 0 ? (
          <EmptyState message="No posts scheduled" sub="Head to Content Hub to create and schedule content" />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {upcomingPosts.map(post => (
              <div key={post.id} style={{
                padding: '0.875rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: '0.375rem' }}>
                  {formatDate(post.scheduled_for)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#E2E8F0', fontWeight: 500, marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.title || post.original_content?.slice(0, 60) + '...'}
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {(post.platforms || []).map(p => (
                    <span key={p} style={{
                      fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '4px',
                      background: 'rgba(59,130,246,0.1)', color: '#93C5FD',
                      textTransform: 'capitalize', border: '1px solid rgba(59,130,246,0.2)'
                    }}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product type breakdown */}
      <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
        <div style={cardHeader}>
          <span style={cardTitle}>Leads by Product Type</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(PRODUCT_TYPES).map(([key, pt]) => {
            const count = leads.filter(l => l.product_type === key).length
            const comm = leads.filter(l => l.product_type === key).reduce((s, l) => s + (parseFloat(l.potential_commission) || 0), 0)
            return (
              <div key={key} style={{
                padding: '1rem', borderRadius: '10px',
                background: pt.bg.replace(')', ', 0.08)').replace('rgb', 'rgba'),
                border: `1px solid ${pt.border}`,
                borderColor: pt.color + '30'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pt.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{pt.label}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{count}</div>
                {comm > 0 && <div style={{ fontSize: '0.75rem', color: pt.color, marginTop: '0.25rem', fontFamily: "'DM Mono', monospace" }}>{formatCurrency(comm)}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, accent, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#141929', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px', padding: '1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s', position: 'relative', overflow: 'hidden'
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = accent + '50'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{
        position: 'absolute', top: '-20px', right: '-10px',
        fontSize: '4rem', opacity: 0.04, color: accent, userSelect: 'none'
      }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#F8FAFC', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.375rem' }}>{sub}</div>
    </div>
  )
}

function EmptyState({ message, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div style={{ fontSize: '0.9375rem', color: '#475569', fontWeight: 500 }}>{message}</div>
      {sub && <div style={{ fontSize: '0.8125rem', color: '#334155', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <div style={{ color: '#475569', fontSize: '0.9375rem' }}>Loading dashboard...</div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

const cardStyle = {
  background: '#141929', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px', padding: '1.25rem'
}

const cardHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: '1rem'
}

const cardTitle = {
  fontSize: '0.875rem', fontWeight: 600, color: '#94A3B8',
  textTransform: 'uppercase', letterSpacing: '0.06em'
}

const linkBtn = {
  background: 'none', border: 'none', color: '#3B82F6',
  cursor: 'pointer', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif",
  padding: 0, transition: 'color 0.15s'
}
