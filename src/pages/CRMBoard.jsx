import { useEffect, useState } from 'react'
import { supabase, PRODUCT_TYPES, PIPELINE_STAGES } from '../lib/supabase'

export default function CRMBoard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)

  useEffect(() => { fetchLeads() }, [])

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').eq('is_archived', false).order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  const moveToStage = async (leadId, newStage) => {
    await supabase.from('leads').update({ pipeline_stage: newStage }).eq('id', leadId)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, pipeline_stage: newStage } : l))
  }

  const handleDragStart = (e, leadId) => {
    setDraggedId(leadId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }

  const handleDrop = (e, stageId) => {
    e.preventDefault()
    if (draggedId && stageId) moveToStage(draggedId, stageId)
    setDraggedId(null)
    setDragOverStage(null)
  }

  const handleDragEnd = () => { setDraggedId(null); setDragOverStage(null) }

  const formatCurrency = (n) => n > 0 ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n) : null

  if (loading) return <div style={{ padding: '2rem', color: '#475569' }}>Loading pipeline...</div>

  return (
    <div style={{ padding: '1.5rem 2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>CRM Pipeline</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{leads.length} active leads · Drag to move between stages</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={primaryBtn}>
          + Add Lead
        </button>
      </div>

      {/* Kanban board */}
      <div style={{
        display: 'flex', gap: '0.875rem', overflowX: 'auto',
        flex: 1, paddingBottom: '1rem',
        scrollbarWidth: 'thin', scrollbarColor: '#1E293B transparent'
      }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.pipeline_stage === stage.id)
          const stageCommission = stageLeads.reduce((s, l) => s + (parseFloat(l.potential_commission) || 0), 0)
          const isOver = dragOverStage === stage.id
          const isWon = stage.id === 'won'
          const isLost = stage.id === 'lost'

          return (
            <div
              key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDrop={e => handleDrop(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
              style={{
                minWidth: '240px', maxWidth: '240px',
                background: isOver ? 'rgba(59,130,246,0.06)' : '#0F1629',
                border: `1px solid ${isOver ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '12px', display: 'flex', flexDirection: 'column',
                maxHeight: 'calc(100vh - 180px)', transition: 'all 0.15s'
              }}
            >
              {/* Column header */}
              <div style={{
                padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontSize: '0.8125rem', fontWeight: 600, color: isWon ? '#10B981' : isLost ? '#EF4444' : '#94A3B8',
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{stage.label}</span>
                  <span style={{
                    fontSize: '0.75rem', fontFamily: "'DM Mono', monospace",
                    background: 'rgba(255,255,255,0.06)', color: '#64748B',
                    padding: '0.125rem 0.5rem', borderRadius: '999px'
                  }}>{stageLeads.length}</span>
                </div>
                {stageCommission > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '0.25rem', fontFamily: "'DM Mono', monospace" }}>
                    {formatCurrency(stageCommission)}
                  </div>
                )}
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stageLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedId === lead.id}
                    onClick={() => setSelectedLead(lead)}
                    formatCurrency={formatCurrency}
                  />
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#334155', fontSize: '0.8125rem' }}>
                    Drop leads here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            const { data: newLead } = await supabase.from('leads').insert([data]).select().single()
            if (newLead) setLeads(prev => [newLead, ...prev])
            setShowAddModal(false)
          }}
        />
      )}

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={async (id, updates) => {
            await supabase.from('leads').update(updates).eq('id', id)
            setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l))
            setSelectedLead(prev => ({ ...prev, ...updates }))
          }}
          onArchive={async (id) => {
            await supabase.from('leads').update({ is_archived: true }).eq('id', id)
            setLeads(prev => prev.filter(l => l.id !== id))
            setSelectedLead(null)
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  )
}

function LeadCard({ lead, onDragStart, onDragEnd, isDragging, onClick, formatCurrency }) {
  const pt = PRODUCT_TYPES[lead.product_type]
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: isDragging ? 'rgba(59,130,246,0.1)' : '#141929',
        border: `1px solid ${isDragging ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderLeft: `3px solid ${pt?.color || '#64748B'}`,
        borderRadius: '8px', padding: '0.75rem',
        cursor: 'grab', opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.15s', userSelect: 'none'
      }}
      onMouseEnter={e => { if (!isDragging) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
      onMouseLeave={e => { if (!isDragging) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
    >
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '0.25rem' }}>
        {lead.first_name} {lead.last_name}
      </div>
      {lead.company_name && (
        <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '0.375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {lead.company_name}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span style={{
          fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '4px',
          background: pt?.color + '20', color: pt?.color, border: `1px solid ${pt?.color}30`,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px'
        }}>{pt?.label || lead.product_type}</span>
        {lead.potential_commission > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'DM Mono', monospace", fontWeight: 600, flexShrink: 0, marginLeft: '0.25rem' }}>
            {formatCurrency(lead.potential_commission)}
          </span>
        )}
      </div>
    </div>
  )
}

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    company_name: '', product_type: 'asset_finance',
    pipeline_stage: 'new_enquiry', potential_commission: '',
    deal_value: '', notes: '', source: 'direct', brand: 'pinks_associates'
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal title="Add New Lead" onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="First Name *"><Input value={form.first_name} onChange={v => set('first_name', v)} placeholder="John" /></Field>
        <Field label="Last Name *"><Input value={form.last_name} onChange={v => set('last_name', v)} placeholder="Smith" /></Field>
        <Field label="Email"><Input value={form.email} onChange={v => set('email', v)} placeholder="john@company.com" type="email" /></Field>
        <Field label="Phone"><Input value={form.phone} onChange={v => set('phone', v)} placeholder="07700 000000" /></Field>
        <Field label="Company Name"><Input value={form.company_name} onChange={v => set('company_name', v)} placeholder="Smith Contracting Ltd" /></Field>
        <Field label="Product Type">
          <Select value={form.product_type} onChange={v => set('product_type', v)}>
            {Object.entries(PRODUCT_TYPES).map(([k, pt]) => <option key={k} value={k}>{pt.label}</option>)}
          </Select>
        </Field>
        <Field label="Potential Commission (£)"><Input value={form.potential_commission} onChange={v => set('potential_commission', v)} placeholder="0.00" type="number" /></Field>
        <Field label="Deal Value (£)"><Input value={form.deal_value} onChange={v => set('deal_value', v)} placeholder="0.00" type="number" /></Field>
        <Field label="Source">
          <Select value={form.source} onChange={v => set('source', v)}>
            <option value="direct">Direct</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
          </Select>
        </Field>
        <Field label="Brand">
          <Select value={form.brand} onChange={v => set('brand', v)}>
            <option value="pinks_associates">Pinks Associates</option>
            <option value="pinks_asset_finance">Pinks Asset Finance</option>
            <option value="pinks_vehicle_leasing">Pinks Vehicle Leasing</option>
          </Select>
        </Field>
      </div>
      <Field label="Notes" style={{ marginTop: '1rem' }}>
        <textarea
          value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Initial enquiry details, context, next steps..."
          style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
        />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button onClick={onClose} style={secondaryBtn}>Cancel</button>
        <button onClick={() => {
          if (!form.first_name || !form.last_name) return alert('First and last name required')
          onSave({ ...form, potential_commission: parseFloat(form.potential_commission) || 0, deal_value: parseFloat(form.deal_value) || 0 })
        }} style={primaryBtn}>Save Lead</button>
      </div>
    </Modal>
  )
}

function LeadDetailModal({ lead, onClose, onUpdate, onArchive, formatCurrency }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...lead })
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const pt = PRODUCT_TYPES[lead.product_type]

  useEffect(() => {
    supabase.from('lead_notes').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false })
      .then(({ data }) => setNotes(data || []))
  }, [lead.id])

  const addNote = async () => {
    if (!newNote.trim()) return
    const { data } = await supabase.from('lead_notes').insert([{ lead_id: lead.id, note: newNote }]).select().single()
    if (data) setNotes(prev => [data, ...prev])
    setNewNote('')
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <Modal title={`${lead.first_name} ${lead.last_name}`} onClose={onClose} wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          {/* Lead info */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pt?.color }} />
              <span style={{ fontSize: '0.8125rem', color: pt?.color, fontWeight: 500 }}>{pt?.label}</span>
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="First Name"><Input value={form.first_name} onChange={v => set('first_name', v)} /></Field>
                  <Field label="Last Name"><Input value={form.last_name} onChange={v => set('last_name', v)} /></Field>
                </div>
                <Field label="Email"><Input value={form.email || ''} onChange={v => set('email', v)} type="email" /></Field>
                <Field label="Phone"><Input value={form.phone || ''} onChange={v => set('phone', v)} /></Field>
                <Field label="Company"><Input value={form.company_name || ''} onChange={v => set('company_name', v)} /></Field>
                <Field label="Product Type">
                  <Select value={form.product_type} onChange={v => set('product_type', v)}>
                    {Object.entries(PRODUCT_TYPES).map(([k, pt]) => <option key={k} value={k}>{pt.label}</option>)}
                  </Select>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <Field label="Commission (£)"><Input value={form.potential_commission} onChange={v => set('potential_commission', v)} type="number" /></Field>
                  <Field label="Deal Value (£)"><Input value={form.deal_value} onChange={v => set('deal_value', v)} type="number" /></Field>
                </div>
                <Field label="Stage">
                  <Select value={form.pipeline_stage} onChange={v => set('pipeline_stage', v)}>
                    {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </Select>
                </Field>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { onUpdate(lead.id, form); setEditing(false) }} style={primaryBtn}>Save</button>
                  <button onClick={() => setEditing(false)} style={secondaryBtn}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[
                  ['Email', lead.email], ['Phone', lead.phone],
                  ['Company', lead.company_name], ['Source', lead.source],
                  ['Brand', lead.brand?.replace(/_/g, ' ')],
                  ['Commission', lead.potential_commission > 0 ? formatCurrency(lead.potential_commission) : null],
                  ['Deal Value', lead.deal_value > 0 ? formatCurrency(lead.deal_value) : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#475569', minWidth: '80px' }}>{k}</span>
                    <span style={{ fontSize: '0.8125rem', color: '#E2E8F0' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => setEditing(true)} style={secondaryBtn}>Edit</button>
                  <button onClick={() => { if (window.confirm('Archive this lead?')) onArchive(lead.id) }} style={{ ...secondaryBtn, color: '#F87171', borderColor: 'rgba(239,68,68,0.3)' }}>Archive</button>
                </div>
              </div>
            )}
          </div>

          {/* Move stage */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', fontWeight: 500 }}>Move Stage</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {PIPELINE_STAGES.map(s => (
                <button key={s.id} onClick={() => onUpdate(lead.id, { pipeline_stage: s.id })}
                  style={{
                    padding: '0.3125rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                    background: lead.pipeline_stage === s.id ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${lead.pipeline_stage === s.id ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: lead.pipeline_stage === s.id ? '#93C5FD' : '#64748B'
                  }}
                >{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 500 }}>Notes & Activity</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              value={newNote} onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNote()}
              placeholder="Add a note..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={addNote} style={primaryBtn}>Add</button>
          </div>
          {lead.notes && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.6875rem', color: '#475569', marginBottom: '0.25rem' }}>Initial notes</div>
              {lead.notes}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {notes.map(n => (
              <div key={n.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '0.625rem 0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.6875rem', color: '#475569', marginBottom: '0.25rem' }}>
                  {new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#94A3B8' }}>{n.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)'
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#141929', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '1.5rem',
        width: '100%', maxWidth: wide ? '800px' : '540px',
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748B', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
}

function Select({ value, onChange, children }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>{children}</select>
}

const inputStyle = {
  background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#F8FAFC', fontSize: '0.875rem',
  padding: '0.625rem 0.75rem', outline: 'none',
  fontFamily: "'DM Sans', sans-serif"
}

const primaryBtn = {
  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none',
  borderRadius: '8px', color: '#fff', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.25rem',
  fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.15s',
  boxShadow: '0 2px 12px rgba(59,130,246,0.3)'
}

const secondaryBtn = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#94A3B8', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 500, padding: '0.625rem 1.25rem',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s'
}
