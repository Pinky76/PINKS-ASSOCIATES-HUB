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
      minHeight: '100vh',
      background: '#0B0F1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '1rem'
    }}>
      {/* Background pattern */}
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.04,
        backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
        backgroundSize: '32px 32px', pointerEvents: 'none'
      }} />

      {/* Glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            marginBottom: '1rem', boxShadow: '0 0 40px rgba(59,130,246,0.3)'
          }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem', fontFamily: "'DM Mono', monospace" }}>P</span>
          </div>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Pinks Hub
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Sign in to your business dashboard
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: '#141929',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="chris@pinksassociates.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#F8FAFC', fontSize: '0.9375rem',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: '#F8FAFC', fontSize: '0.9375rem',
                  outline: 'none', boxSizing: 'border-box',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#3B82F6'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', padding: '0.75rem 1rem',
                color: '#FCA5A5', fontSize: '0.875rem', marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem',
                background: loading ? '#1E3A8A' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontSize: '0.9375rem', fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8125rem', marginTop: '1.5rem' }}>
          Pinks Associates · FCA No: 705091
        </p>
      </div>
    </div>
  )
}
