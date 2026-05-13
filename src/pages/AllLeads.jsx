import { useEffect, useState } from 'react'
import { supabase, PRODUCT_TYPES, PIPELINE_STAGES } from '../lib/supabase'

export default function AllLeads({ setActivePage }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterProduct, setFilterProduct] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    supabase.from('leads').select('*').eq('is_archived', false).order('created_at', { ascending: false })
      .then(({ data }) => { setLeads(data || []); setLoading(false) })
  }, [])

  const filtered = leads
    .filter(l => {
      const q = search.toLowerCase()
      const matchSearch = !q || [l.first_name, l.last_name, l.email, l.company_name, l.phone]
        .some(v => v?.toLowerCase().includes(q))
      const matchProduct = filterProduct === 'all' || l.product_type === filterProduct
      const matchStage = filterStage === 'all' || l.pipeline_stage === filterStage
      return matchSearch && matchProduct && matchStage
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sortBy === 'commission') return (parseFloat(b.potential_commission) || 0) - (parseFloat(a.potential_commission) || 0)
      return 0
    })

  const totalCommission = filtered.reduce((s, l) => s + (parseFloat(l.potential_commission) || 0), 0)

  const formatCurrency = (n) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  if (loading) return <div style={{ padding: '2rem', color: '#475569' }}>Loading leads...</div>

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>All Leads</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.875rem' }}>
            {filtered.length} lead{filtered.length !== 1 ? 's' : ''} · {formatCurrency(totalCommission)} potential commission
          </p>
        </div>
        <button onClick={() => setActivePage('crm')} style={primaryBtn}>View Kanban →</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search leads..."
          style={{ ...inputStyle, width: '220px' }}
        />
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Products</option>
          {Object.entries(PRODUCT_TYPES).map(([k, pt]) => <option key={k} value={k}>{pt.label}</option>)}
        </select>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="all">All Stages</option>
          {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="commission">Highest Commission</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#141929', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Name', 'Company', 'Product', 'Stage', 'Commission', 'Source', 'Added'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#475569', fontSize: '0.9375rem' }}>
                  No leads found
                </td>
              </tr>
            ) : filtered.map((lead, i) => {
              const pt = PRODUCT_TYPES[lead.product_type]
              const stage = PIPELINE_STAGES.find(s => s.id === lead.pipeline_stage)
              return (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.15s', cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0' }}>
                      {lead.first_name} {lead.last_name}
                    </div>
                    {lead.email && <div style={{ fontSize: '0.75rem', color: '#475569' }}>{lead.email}</div>}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#94A3B8' }}>
                    {lead.company_name || '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '6px',
                      background: pt?.color + '20', color: pt?.color,
                      border: `1px solid ${pt?.color}30`, fontWeight: 500, whiteSpace: 'nowrap'
                    }}>{pt?.label || lead.product_type}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#64748B' }}>
                    {stage?.label || lead.pipeline_stage}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#10B981', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                    {lead.potential_commission > 0 ? formatCurrency(lead.potential_commission) : '—'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#64748B', textTransform: 'capitalize' }}>
                    {lead.source}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: '#475569', fontFamily: "'DM Mono', monospace" }}>
                    {formatDate(lead.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            const csv = [
              ['Name', 'Company', 'Email', 'Phone', 'Product', 'Stage', 'Commission', 'Source', 'Added'],
              ...filtered.map(l => [
                `${l.first_name} ${l.last_name}`, l.company_name || '', l.email || '',
                l.phone || '', PRODUCT_TYPES[l.product_type]?.label || l.product_type,
                PIPELINE_STAGES.find(s => s.id === l.pipeline_stage)?.label || l.pipeline_stage,
                l.potential_commission || 0, l.source, formatDate(l.created_at)
              ])
            ].map(r => r.join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'pinks-leads.csv'; a.click()
          }}
          style={secondaryBtn}
        >
          Export CSV
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  background: '#141929', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#F8FAFC', fontSize: '0.875rem',
  padding: '0.625rem 0.875rem', outline: 'none',
  fontFamily: "'DM Sans', sans-serif"
}

const primaryBtn = {
  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none',
  borderRadius: '8px', color: '#fff', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.25rem',
  fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 12px rgba(59,130,246,0.3)'
}

const secondaryBtn = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#94A3B8', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 500, padding: '0.625rem 1.25rem',
  fontFamily: "'DM Sans', sans-serif"
}
