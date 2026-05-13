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

  const handleDragStart = (e, leadId) => { setDraggedId(leadId); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver = (e, stageId) => { e.preventDefault(); setDragOverStage(stageId) }
  const handleDrop = (e, stageId) => { e.preventDefault(); if (draggedId) moveToStage(draggedId, stageId); setDraggedId(null); setDragOverStage(null) }
  const handleDragEnd = () => { setDraggedId(null); setDragOverStage(null) }

  const fmt = (n) => n > 0 ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n) : null

  if (loading) return <div style={{ padding: '2rem', color: '#94A3B8' }}>Loading pipeline...</div>

  return (
    <div style={{ padding: '1.5rem 2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>CRM Pipeline</h1>
          <p style={{ color: '#94A3B8', margin: '0.2rem 0 0', fontSize: '0.875rem' }}>{leads.length} active leads · Drag to move between stages</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={primaryBtn}>+ Add Lead</button>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: '0.875rem', overflowX: 'auto', flex: 1, paddingBottom: '1rem' }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.pipeline_stage === stage.id)
          const stageComm = stageLeads.reduce((s, l) => s + (parseFloat(l.potential_commission) || 0), 0)
          const stageAdmin = stageLeads.reduce((s, l) => s + (parseFloat(l.admin_fee) || 0), 0)
          const isOver = dragOverStage === stage.id
          const isCompleted = stage.id === 'completed' || stage.id === 'delivered'
          const isLost = stage.id === 'lost'

          return (
            <div key={stage.id}
              onDragOver={e => handleDragOver(e, stage.id)}
              onDrop={e => handleDrop(e, stage.id)}
              onDragLeave={() => setDragOverStage(null)}
              style={{
                minWidth: '220px', maxWidth: '220px',
                background: isOver ? '#EFF6FF' : '#fff',
                border: `1px solid ${isOver ? '#93C5FD' : '#E2E8F0'}`,
                borderRadius: '12px', display: 'flex', flexDirection: 'column',
                maxHeight: 'calc(100vh - 180px)', transition: 'all 0.15s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
              }}
            >
              {/* Column header */}
              <div style={{ padding: '0.75rem 0.875rem', borderBottom: '1px solid #F1F5F9', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isCompleted ? '#10B981' : isLost ? '#EF4444' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stage.label}</span>
                  <span style={{ fontSize: '0.75rem', fontFamily: "'DM Mono', monospace", background: '#F1F5F9', color: '#94A3B8', padding: '0.125rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>{stageLeads.length}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  {stageComm > 0 && <span style={{ fontSize: '0.6875rem', color: '#10B981', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{fmt(stageComm)}</span>}
                  {stageAdmin > 0 && <span style={{ fontSize: '0.6875rem', color: '#F97316', fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>{fmt(stageAdmin)}</span>}
                </div>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stageLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedId === lead.id} onClick={() => setSelectedLead(lead)} fmt={fmt} />
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem', color: '#E2E8F0', fontSize: '0.8125rem' }}>Drop here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAddModal && (
        <AddLeadModal onClose={() => setShowAddModal(false)} onSave={async (data) => {
          const { data: newLead } = await supabase.from('leads').insert([data]).select().single()
          if (newLead) setLeads(prev => [newLead, ...prev])
          setShowAddModal(false)
        }} />
      )}

      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)}
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
          fmt={fmt}
        />
      )}
    </div>
  )
}

function LeadCard({ lead, onDragStart, onDragEnd, isDragging, onClick, fmt }) {
  const pt = PRODUCT_TYPES[lead.product_type]
  return (
    <div draggable onDragStart={e => onDragStart(e, lead.id)} onDragEnd={onDragEnd} onClick={onClick}
      style={{
        background: isDragging ? '#EFF6FF' : '#FAFAFA',
        border: `1px solid ${isDragging ? '#93C5FD' : '#E2E8F0'}`,
        borderLeft: `3px solid ${pt?.color || '#CBD5E1'}`,
        borderRadius: '8px', padding: '0.625rem 0.75rem',
        cursor: 'grab', opacity: isDragging ? 0.5 : 1, transition: 'all 0.15s', userSelect: 'none'
      }}
      onMouseEnter={e => { if (!isDragging) { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}}
      onMouseLeave={e => { if (!isDragging) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none' }}}
    >
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>{lead.first_name} {lead.last_name}</div>
      {lead.company_name && <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.company_name}</div>}
      <div style={{ marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.6875rem', padding: '0.1875rem 0.5rem', borderRadius: '4px', background: pt?.bg, color: pt?.color, border: `1px solid ${pt?.border}`, fontWeight: 500 }}>{pt?.label || lead.product_type}</span>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {lead.potential_commission > 0 && <span style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(lead.potential_commission)}</span>}
        {lead.admin_fee > 0 && <span style={{ fontSize: '0.75rem', color: '#F97316', fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(lead.admin_fee)}</span>}
      </div>
    </div>
  )
}

function AddLeadModal({ onClose, onSave }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', company_name: '', product_type: 'asset_finance', pipeline_stage: 'enquiry', potential_commission: '', admin_fee: '', deal_value: '', notes: '', source: 'direct', brand: 'pinks_associates' })
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
        <Field label="Commission (£)"><Input value={form.potential_commission} onChange={v => set('potential_commission', v)} placeholder="0.00" type="number" /></Field>
        <Field label="Admin Fee (£)"><Input value={form.admin_fee} onChange={v => set('admin_fee', v)} placeholder="0.00" type="number" /></Field>
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
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Initial enquiry details..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }} />
      </Field>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
        <button onClick={onClose} style={secondaryBtn}>Cancel</button>
        <button onClick={() => {
          if (!form.first_name || !form.last_name) return alert('First and last name required')
          onSave({ ...form, potential_commission: parseFloat(form.potential_commission) || 0, admin_fee: parseFloat(form.admin_fee) || 0, deal_value: parseFloat(form.deal_value) || 0 })
        }} style={primaryBtn}>Save Lead</button>
      </div>
    </Modal>
  )
}

function LeadDetailModal({ lead, onClose, onUpdate, onArchive, fmt }) {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pt?.color }} />
            <span style={{ fontSize: '0.875rem', color: pt?.color, fontWeight: 500 }}>{pt?.label}</span>
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
                <Field label="Admin Fee (£)"><Input value={form.admin_fee || ''} onChange={v => set('admin_fee', v)} type="number" /></Field>
              </div>
              <Field label="Stage">
                <Select value={form.pipeline_stage} onChange={v => set('pipeline_stage', v)}>
                  {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </Select>
              </Field>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { onUpdate(lead.id, { ...form, potential_commission: parseFloat(form.potential_commission) || 0, admin_fee: parseFloat(form.admin_fee) || 0 }); setEditing(false) }} style={primaryBtn}>Save</button>
                <button onClick={() => setEditing(false)} style={secondaryBtn}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['Email', lead.email], ['Phone', lead.phone], ['Company', lead.company_name], ['Source', lead.source], ['Commission', lead.potential_commission > 0 ? fmt(lead.potential_commission) : null], ['Admin Fee', lead.admin_fee > 0 ? fmt(lead.admin_fee) : null]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94A3B8', minWidth: '80px' }}>{k}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#0F172A' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button onClick={() => setEditing(true)} style={secondaryBtn}>Edit</button>
                <button onClick={() => { if (window.confirm('Archive this lead?')) onArchive(lead.id) }} style={{ ...secondaryBtn, color: '#EF4444', borderColor: '#FECACA' }}>Archive</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem', fontWeight: 500 }}>Move Stage</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {PIPELINE_STAGES.map(s => (
                <button key={s.id} onClick={() => onUpdate(lead.id, { pipeline_stage: s.id })}
                  style={{ padding: '0.3125rem 0.625rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s', background: lead.pipeline_stage === s.id ? '#EFF6FF' : '#F8FAFC', border: `1px solid ${lead.pipeline_stage === s.id ? '#93C5FD' : '#E2E8F0'}`, color: lead.pipeline_stage === s.id ? '#1D4ED8' : '#64748B', fontWeight: lead.pipeline_stage === s.id ? 600 : 400 }}
                >{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem', fontWeight: 500 }}>Notes & Activity</div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} placeholder="Add a note..." style={{ ...inputStyle, flex: 1 }} />
            <button onClick={addNote} style={primaryBtn}>Add</button>
          </div>
          {lead.notes && (
            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.875rem', color: '#64748B', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.6875rem', color: '#CBD5E1', marginBottom: '0.25rem' }}>Initial notes</div>
              {lead.notes}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {notes.map(n => (
              <div key={n.id} style={{ background: '#F8FAFC', borderRadius: '8px', padding: '0.625rem 0.75rem', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.6875rem', color: '#CBD5E1', marginBottom: '0.25rem' }}>{new Date(n.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{n.note}</div>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: wide ? '800px' : '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '1.375rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
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
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
}

function Select({ value, onChange, children }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}>{children}</select>
}

const inputStyle = { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', fontSize: '0.875rem', padding: '0.625rem 0.75rem', outline: 'none', fontFamily: "'DM Sans', sans-serif" }
const primaryBtn = { background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0.625rem 1.25rem', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 2px 8px rgba(59,130,246,0.25)' }
const secondaryBtn = { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#64748B', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: '0.625rem 1.25rem', fontFamily: "'DM Sans', sans-serif" }
