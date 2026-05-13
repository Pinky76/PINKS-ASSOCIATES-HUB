import { useEffect, useState } from 'react'
import { supabase, PRODUCT_TYPES, PIPELINE_STAGES } from '../lib/supabase'

export default function Dashboard({ setActivePage }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('leads').select('*').eq('is_archived', false)
      .then(({ data }) => { setLeads(data || []); setLoading(false) })
  }, [])

  const totalLeads = leads.length
  const totalCommission = leads.reduce((s, l) => s + (parseFloat(l.potential_commission) || 0), 0)
  const totalAdminFee = leads.reduce((s, l) => s + (parseFloat(l.admin_fee) || 0), 0)
  const wonLeads = leads.filter(l => l.pipeline_stage === 'delivered' || l.pipeline_stage === 'completed').length
  const recentLeads = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6)
  const stageCounts = PIPELINE_STAGES.map(s => ({ ...s, count: leads.filter(l => l.pipeline_stage === s.id).length }))

  const fmt = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

  function getTimeOfDay() {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  }

  if (loading) return <div style={{ padding: '2rem', color: '#94A3B8' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
          Good {getTimeOfDay()}, Chris.
        </h1>
        <p style={{ color: '#94A3B8', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <MetricCard label="Total Leads" value={totalLeads} sub="active pipeline" accent="#3B82F6" onClick={() => setActivePage('crm')} />
        <MetricCard label="Potential Commission" value={fmt(totalCommission)} sub="across all leads" accent="#10B981" onClick={() => setActivePage('leads')} />
        <MetricCard label="Total Admin Fees" value={fmt(totalAdminFee)} sub="across all leads" accent="#F97316" onClick={() => setActivePage('leads')} />
        <MetricCard label="Completed / Delivered" value={wonLeads} sub="finished deals" accent="#8B5CF6" onClick={() => setActivePage('crm')} />
      </div>

      {/* Pipeline + Recent leads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Pipeline snapshot */}
        <div style={card}>
          <div style={cardHead}>
            <span style={cardTitle}>Pipeline Snapshot</span>
            <button onClick={() => setActivePage('crm')} style={linkBtn}>View board →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stageCounts.filter(s => s.id !== 'lost').map(stage => (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, fontSize: '0.8125rem', color: '#64748B' }}>{stage.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '80px', height: '5px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', width: `${totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0}%`, background: 'linear-gradient(90deg, #3B82F6, #6366F1)', transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: '#0F172A', fontWeight: 600, minWidth: '20px', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>{stage.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent leads */}
        <div style={card}>
          <div style={cardHead}>
            <span style={cardTitle}>Recent Leads</span>
            <button onClick={() => setActivePage('leads')} style={linkBtn}>View all →</button>
          </div>
          {recentLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#CBD5E1', fontSize: '0.875rem' }}>No leads yet — add your first lead to get started</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentLeads.map(lead => {
                const pt = PRODUCT_TYPES[lead.product_type]
                return (
                  <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: pt?.color || '#CBD5E1' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', color: '#0F172A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lead.first_name} {lead.last_name}
                        {lead.company_name && <span style={{ color: '#94A3B8', fontWeight: 400 }}> · {lead.company_name}</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{pt?.label}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {lead.potential_commission > 0 && <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{fmt(lead.potential_commission)}</div>}
                      {lead.admin_fee > 0 && <div style={{ fontSize: '0.75rem', color: '#F97316', fontFamily: "'DM Mono', monospace" }}>{fmt(lead.admin_fee)}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product type breakdown */}
      <div style={card}>
        <div style={cardHead}><span style={cardTitle}>Leads by Product Type</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(PRODUCT_TYPES).map(([key, pt]) => {
            const count = leads.filter(l => l.product_type === key).length
            const comm = leads.filter(l => l.product_type === key).reduce((s, l) => s + (parseFloat(l.potential_commission) || 0), 0)
            const admin = leads.filter(l => l.product_type === key).reduce((s, l) => s + (parseFloat(l.admin_fee) || 0), 0)
            return (
              <div key={key} style={{ padding: '1rem', borderRadius: '10px', background: pt.bg, border: `1px solid ${pt.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pt.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{pt.label}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{count}</div>
                {comm > 0 && <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem', fontFamily: "'DM Mono', monospace" }}>{fmt(comm)}</div>}
                {admin > 0 && <div style={{ fontSize: '0.75rem', color: '#F97316', fontFamily: "'DM Mono', monospace" }}>{fmt(admin)}</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub, accent, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = accent; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
        <span style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F172A', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', marginTop: '0.375rem' }}>{sub}</div>
    </div>
  )
}

const card = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const cardHead = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }
const cardTitle = { fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }
const linkBtn = { background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif", padding: 0 }
