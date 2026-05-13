import { useState } from 'react'
import { supabase, PRODUCT_TYPES } from '../lib/supabase'

export default function Enquire() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    product_type: '',
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.first_name || !form.last_name || !form.phone || !form.product_type) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')

    const { error: dbError } = await supabase.from('leads').insert([{
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      product_type: form.product_type,
      notes: form.notes,
      pipeline_stage: 'new_enquiry',
      source: 'website',
      brand: 'pinks_associates'
    }])

    if (dbError) {
      setError('Something went wrong. Please call us directly on 01243 000000.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div style={pageWrap}>
        <div style={formCard}>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', fontSize: '1.5rem'
            }}>✓</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.75rem', letterSpacing: '-0.01em' }}>
              Enquiry received
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: '340px', margin: '0 auto' }}>
              Thank you {form.first_name}. Chris will be in touch shortly to discuss your requirements.
            </p>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.8125rem', color: '#475569' }}>Pinks Associates · FCA No: 705091</div>
              <div style={{ fontSize: '0.8125rem', color: '#475569', marginTop: '0.25rem' }}>pinksassociates.com</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageWrap}>
      {/* Background effects */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
        backgroundSize: '32px 32px', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            marginBottom: '1rem', boxShadow: '0 0 40px rgba(59,130,246,0.25)'
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.375rem', fontFamily: "'DM Mono', monospace" }}>P</span>
          </div>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.375rem', letterSpacing: '-0.02em' }}>
            Pinks Associates
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9375rem', margin: 0, lineHeight: 1.5 }}>
            Tell us what you need and we'll be in touch to discuss your options.
          </p>
        </div>

        {/* Form */}
        <div style={formCard}>
          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <div>
              <label style={labelStyle}>First Name <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="text"
                value={form.first_name}
                onChange={e => set('first_name', e.target.value)}
                placeholder="John"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Last Name <span style={{ color: '#EF4444' }}>*</span></label>
              <input
                type="text"
                value={form.last_name}
                onChange={e => set('last_name', e.target.value)}
                placeholder="Smith"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Product */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>What do you need help with? <span style={{ color: '#EF4444' }}>*</span></label>
            <select
              value={form.product_type}
              onChange={e => set('product_type', e.target.value)}
              style={{ ...inputStyle, color: form.product_type ? '#F8FAFC' : '#475569', cursor: 'pointer' }}
            >
              <option value="" disabled>Select a product type...</option>
              {Object.entries(PRODUCT_TYPES).map(([k, pt]) => (
                <option key={k} value={k} style={{ color: '#F8FAFC', background: '#141929' }}>
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={labelStyle}>Brief description of your requirement</label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Give us a brief overview — what you're looking to fund, any relevant context, or questions you have."
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Contact Number <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              placeholder="07700 000000"
              style={inputStyle}
            />
            <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.375rem' }}>
              We'll call or WhatsApp you on this number.
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '8px', padding: '0.75rem 1rem',
              color: '#FCA5A5', fontSize: '0.875rem', marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '0.9375rem',
              background: submitting ? '#1E3A8A' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '1rem', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: submitting ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? 'Sending...' : 'Send Enquiry'}
          </button>

          {/* Footer note */}
          <p style={{ fontSize: '0.75rem', color: '#334155', textAlign: 'center', marginTop: '1rem', lineHeight: 1.6 }}>
            Your details are used solely to respond to your enquiry.<br />
            Pinks Associates is authorised and regulated by the FCA — No: 705091.
          </p>
        </div>

        {/* Bottom branding */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="https://pinksassociates.com" style={{ color: '#334155', fontSize: '0.8125rem', textDecoration: 'none' }}>
            pinksassociates.com
          </a>
        </div>
      </div>
    </div>
  )
}

const pageWrap = {
  minHeight: '100vh',
  background: '#0B0F1A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'DM Sans', sans-serif",
  padding: '2rem 1rem'
}

const formCard = {
  background: '#141929',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '1.75rem',
  boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8125rem',
  color: '#94A3B8',
  fontWeight: 500,
  marginBottom: '0.4375rem',
  letterSpacing: '0.01em'
}

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '0.6875rem 0.875rem',
  background: '#0B0F1A',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: '#F8FAFC',
  fontSize: '0.9375rem',
  outline: 'none',
  fontFamily: "'DM Sans', sans-serif",
  transition: 'border-color 0.2s'
}
