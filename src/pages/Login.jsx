import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F1F5F9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif", padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            marginBottom: '1rem', boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.375rem', fontFamily: "'DM Mono', monospace" }}>P</span>
          </div>
          <h1 style={{ color: '#0F172A', fontSize: '1.375rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Pinks Hub</h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '0.25rem' }}>Sign in to your business dashboard</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#475569', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="chris@pinksassociates.com"
                style={{ width: '100%', padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#475569', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 1rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F172A', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'}
              />
            </div>
            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>
            )}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.875rem', background: loading ? '#93C5FD' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: loading ? 'none' : '0 4px 16px rgba(59,130,246,0.3)', transition: 'all 0.2s' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: '#CBD5E1', fontSize: '0.75rem', marginTop: '1.5rem' }}>Pinks Associates · FCA No: 705091</p>
      </div>
    </div>
  )
}
