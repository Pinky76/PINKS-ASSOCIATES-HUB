import { useEffect, useState } from 'react'
import { supabase, PLATFORMS } from '../lib/supabase'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function ContentCalendar({ setActivePage }) {
  const [posts, setPosts] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState(null)
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    supabase.from('posts').select('*').order('scheduled_for', { ascending: true })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // Mon=0
  const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const dayNum = i - startDow + 1
    if (dayNum < 1 || dayNum > lastDay.getDate()) return null
    const date = new Date(year, month, dayNum)
    const dateStr = date.toISOString().split('T')[0]
    const dayPosts = posts.filter(p => p.scheduled_for?.startsWith(dateStr))
    const isToday = dateStr === new Date().toISOString().split('T')[0]
    const isTueThu = date.getDay() === 2 || date.getDay() === 4
    return { dayNum, dateStr, date, dayPosts, isToday, isTueThu }
  })

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length
  const thisMonthPosts = posts.filter(p => {
    const d = new Date(p.scheduled_for)
    return d.getFullYear() === year && d.getMonth() === month
  })

  if (loading) return <div style={{ padding: '2rem', color: '#475569' }}>Loading calendar...</div>

  return (
    <div style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>Content Calendar</h1>
          <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.875rem' }}>
            {scheduledCount} post{scheduledCount !== 1 ? 's' : ''} scheduled · Tuesday & Thursday cadence
          </p>
        </div>
        <button
          onClick={() => setActivePage('content')}
          style={primaryBtn}
        >
          + Create Post
        </button>
      </div>

      {/* Month nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', background: '#141929', borderRadius: '12px',
        padding: '0.875rem 1.25rem', border: '1px solid rgba(255,255,255,0.07)'
      }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>
            {MONTHS[month]} {year}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#475569' }}>
            {thisMonthPosts.length} post{thisMonthPosts.length !== 1 ? 's' : ''} this month
          </div>
        </div>
        <button onClick={nextMonth} style={navBtn}>›</button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { color: '#3B82F6', label: 'Scheduled' },
          { color: '#F97316', label: 'Draft' },
          { color: '#10B981', label: 'Published' },
          { color: 'rgba(59,130,246,0.08)', label: 'Tue/Thu slots', border: '1px solid rgba(59,130,246,0.2)' }
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color, border: item.border }} />
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ background: '#141929', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {DAYS.map(d => (
            <div key={d} style={{
              padding: '0.625rem', textAlign: 'center',
              fontSize: '0.75rem', color: (d === 'Tue' || d === 'Thu') ? '#3B82F6' : '#475569',
              fontWeight: (d === 'Tue' || d === 'Thu') ? 700 : 500,
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((cell, i) => (
            <div
              key={i}
              style={{
                minHeight: '100px', padding: '0.5rem',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                borderBottom: i < cells.length - 7 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: cell?.isToday ? 'rgba(59,130,246,0.06)' : cell?.isTueThu ? 'rgba(59,130,246,0.02)' : 'transparent',
                transition: 'background 0.15s'
              }}
            >
              {cell && (
                <>
                  <div style={{
                    fontSize: '0.8125rem', fontWeight: cell.isToday ? 700 : 400,
                    color: cell.isToday ? '#3B82F6' : '#64748B',
                    marginBottom: '0.375rem', fontFamily: "'DM Mono', monospace"
                  }}>
                    {cell.dayNum}
                    {cell.isTueThu && cell.dayPosts.length === 0 && (
                      <span style={{ marginLeft: '4px', color: '#1E3A5F', fontSize: '0.625rem' }}>●</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {cell.dayPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        style={{
                          padding: '0.25rem 0.375rem', borderRadius: '4px', cursor: 'pointer',
                          background: post.status === 'published' ? 'rgba(16,185,129,0.15)' :
                            post.status === 'scheduled' ? 'rgba(59,130,246,0.15)' : 'rgba(249,115,22,0.15)',
                          border: `1px solid ${post.status === 'published' ? 'rgba(16,185,129,0.3)' :
                            post.status === 'scheduled' ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'}`,
                          fontSize: '0.6875rem', color: '#E2E8F0',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        title={post.title || post.original_content?.slice(0, 60)}
                      >
                        {post.title || post.original_content?.slice(0, 30)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Post detail modal */}
      {selectedPost && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)'
        }} onClick={e => e.target === e.currentTarget && setSelectedPost(null)}>
          <div style={{
            background: '#141929', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '540px',
            maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#F8FAFC' }}>
                {selectedPost.title || 'Post Details'}
              </h2>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <StatusBadge status={selectedPost.status} />
              {selectedPost.scheduled_for && (
                <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                  {new Date(selectedPost.scheduled_for).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem', fontWeight: 500 }}>Platforms</div>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {(selectedPost.platforms || []).map(p => (
                  <span key={p} style={{
                    fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '6px',
                    background: 'rgba(59,130,246,0.1)', color: '#93C5FD',
                    border: '1px solid rgba(59,130,246,0.25)'
                  }}>{PLATFORMS[p]?.label || p}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 500 }}>Content Preview</div>
              <div style={{
                background: '#0B0F1A', borderRadius: '8px', padding: '0.875rem',
                fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.7,
                border: '1px solid rgba(255,255,255,0.06)', maxHeight: '200px', overflowY: 'auto'
              }}>
                {selectedPost.original_content}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                onClick={async () => {
                  await supabase.from('posts').update({ status: 'published' }).eq('id', selectedPost.id)
                  setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, status: 'published' } : p))
                  setSelectedPost(prev => ({ ...prev, status: 'published' }))
                }}
                style={{ ...primaryBtn, fontSize: '0.8125rem', padding: '0.5rem 1rem' }}
              >
                Mark Published
              </button>
              <button
                onClick={async () => {
                  if (window.confirm('Delete this post?')) {
                    await supabase.from('posts').delete().eq('id', selectedPost.id)
                    setPosts(prev => prev.filter(p => p.id !== selectedPost.id))
                    setSelectedPost(null)
                  }
                }}
                style={{ ...secondaryBtn, fontSize: '0.8125rem', padding: '0.5rem 1rem', color: '#F87171', borderColor: 'rgba(239,68,68,0.3)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    scheduled: { bg: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: 'rgba(59,130,246,0.3)', label: 'Scheduled' },
    draft: { bg: 'rgba(249,115,22,0.15)', color: '#FD8A4B', border: 'rgba(249,115,22,0.3)', label: 'Draft' },
    published: { bg: 'rgba(16,185,129,0.15)', color: '#34D399', border: 'rgba(16,185,129,0.3)', label: 'Published' },
  }
  const s = map[status] || map.draft
  return (
    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem', borderRadius: '6px', background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 500 }}>
      {s.label}
    </span>
  )
}

const navBtn = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#94A3B8', cursor: 'pointer',
  fontSize: '1.25rem', padding: '0.375rem 0.875rem', fontFamily: "'DM Sans', sans-serif",
  transition: 'all 0.15s', lineHeight: 1
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
