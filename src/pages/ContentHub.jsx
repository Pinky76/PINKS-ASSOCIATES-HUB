import { useState } from 'react'
import { supabase, PLATFORMS } from '../lib/supabase'

const PLATFORM_CHARS = {
  linkedin: 3000, facebook: 63206, instagram: 2200,
  tiktok: 2200, youtube: 5000, wordpress: 99999, gbp: 1500
}

const PLATFORM_TIPS = {
  linkedin: 'Professional tone. Lead with the insight. No hashtag spam.',
  facebook: 'Conversational. Can be longer. Works well with a question at the end.',
  instagram: 'Visual-first. Keep it punchy. 3–5 hashtags max.',
  tiktok: 'Hook in first 3 seconds. Trend-aware but keep your voice.',
  youtube: 'Full description with timestamps. Include your website link.',
  wordpress: 'Full blog post. H2/H3 structure. Internal links.',
  gbp: 'Short update. Location-relevant. Include a CTA.'
}

export default function ContentHub() {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['linkedin'])
  const [generated, setGenerated] = useState({})
  const [generating, setGenerating] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('write')
  const [brand, setBrand] = useState('pinks_associates')

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const generateContent = async () => {
    if (!content.trim()) return
    setGenerating(true)
    setActiveTab('review')

    const results = {}

    for (const platform of selectedPlatforms) {
      try {
        const systemPrompt = `You are a content specialist for Chris Pink, a UK finance broker operating under the Pinks Associates brand (FCA No: 705091). 
Chris's brand voice: measured, calm, strategic. Plain English. No hype, no emojis, no clichés. Direct and commercially intelligent.
Target audience: UK SME owners, £500k–£5m turnover.

Generate a ${platform} post adapted from the source content provided. Follow these strict rules:
- UK English only
- No emojis
- No generic marketing phrases
- Speak to experienced business owners
- Maximum ${PLATFORM_CHARS[platform]} characters
- Tip for this platform: ${PLATFORM_TIPS[platform]}
- Return ONLY the post text, nothing else`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{ role: 'user', content: `Source content:\n\n${content}\n\nGenerate the ${platform} version.` }]
          })
        })

        const data = await response.json()
        results[platform] = data.content?.[0]?.text || ''
      } catch (err) {
        results[platform] = content
      }
    }

    setGenerated(results)
    setGenerating(false)
  }

  const savePost = async (status) => {
    setSaving(true)
    const scheduledFor = scheduleDate && scheduleTime
      ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
      : null

    const postData = {
      title: title || content.slice(0, 60),
      original_content: content,
      platforms: selectedPlatforms,
      status: status,
      scheduled_for: scheduledFor,
      brand,
      ...Object.fromEntries(selectedPlatforms.map(p => [`${p}_content`, generated[p] || content]))
    }

    await supabase.from('posts').insert([postData])
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)

    if (status === 'scheduled') {
      setContent('')
      setTitle('')
      setGenerated({})
      setScheduleDate('')
      setActiveTab('write')
    }
  }

  // Get next Tuesday and Thursday
  const getNextScheduleDays = () => {
    const days = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dow = d.getDay()
      if (dow === 2 || dow === 4) { // Tuesday or Thursday
        days.push(d)
        if (days.length === 4) break
      }
    }
    return days
  }

  const scheduleDays = getNextScheduleDays()

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.02em' }}>Content Hub</h1>
        <p style={{ color: '#64748B', margin: '0.2rem 0 0', fontSize: '0.875rem' }}>Write once · Generate for all platforms · Schedule automatically</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', background: '#0F1629', borderRadius: '10px', padding: '0.25rem', width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
        {['write', 'review', 'schedule'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none',
            background: activeTab === tab ? '#141929' : 'transparent',
            color: activeTab === tab ? '#F8FAFC' : '#64748B',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === tab ? 600 : 400,
            fontFamily: "'DM Sans', sans-serif", textTransform: 'capitalize',
            transition: 'all 0.15s',
            boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.3)' : 'none'
          }}>{tab}</button>
        ))}
      </div>

      {/* Write tab */}
      {activeTab === 'write' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Post Title (optional)</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g. Why your lender selection matters more than rate"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontSize: '1rem' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Your Content</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your core message here. Don't worry about platform formatting — that's handled automatically.

Think about:
• What's the insight or point you're making?
• Who is the ideal reader?
• What do you want them to think or do after reading?

Write naturally. We'll adapt it for each platform."
                style={{
                  ...inputStyle, width: '100%', boxSizing: 'border-box',
                  minHeight: '320px', resize: 'vertical', lineHeight: 1.7, fontSize: '0.9375rem'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '0.375rem', textAlign: 'right' }}>
                {content.length} characters
              </div>
            </div>
            <button
              onClick={generateContent}
              disabled={!content.trim() || generating || selectedPlatforms.length === 0}
              style={{
                ...primaryBtn, marginTop: '1rem',
                opacity: (!content.trim() || generating || selectedPlatforms.length === 0) ? 0.5 : 1,
                cursor: (!content.trim() || generating || selectedPlatforms.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {generating ? 'Generating versions...' : `Generate for ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? 's' : ''} →`}
            </button>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Brand */}
            <div style={sideCard}>
              <label style={labelStyle}>Brand</label>
              <select value={brand} onChange={e => setBrand(e.target.value)} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                <option value="pinks_associates">Pinks Associates</option>
                <option value="pinks_asset_finance">Pinks Asset Finance</option>
                <option value="pinks_vehicle_leasing">Pinks Vehicle Leasing</option>
              </select>
            </div>

            {/* Platforms */}
            <div style={sideCard}>
              <label style={labelStyle}>Publish To</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(PLATFORMS).map(([key, pl]) => (
                  <label key={key} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    cursor: 'pointer', padding: '0.5rem 0.625rem', borderRadius: '6px',
                    background: selectedPlatforms.includes(key) ? 'rgba(59,130,246,0.08)' : 'transparent',
                    border: `1px solid ${selectedPlatforms.includes(key) ? 'rgba(59,130,246,0.25)' : 'transparent'}`,
                    transition: 'all 0.15s'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(key)}
                      onChange={() => togglePlatform(key)}
                      style={{ accentColor: '#3B82F6', width: '14px', height: '14px' }}
                    />
                    <span style={{ fontSize: '0.875rem', color: selectedPlatforms.includes(key) ? '#E2E8F0' : '#64748B', fontWeight: selectedPlatforms.includes(key) ? 500 : 400 }}>
                      {pl.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review tab */}
      {activeTab === 'review' && (
        <div>
          {generating ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>✦</div>
              <div style={{ color: '#64748B', fontSize: '0.9375rem' }}>Generating platform versions...</div>
            </div>
          ) : Object.keys(generated).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ color: '#475569', fontSize: '0.9375rem', marginBottom: '0.5rem' }}>No content generated yet</div>
              <button onClick={() => setActiveTab('write')} style={secondaryBtn}>← Back to Write</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
              {Object.entries(generated).map(([platform, text]) => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  text={text}
                  onChange={v => setGenerated(prev => ({ ...prev, [platform]: v }))}
                />
              ))}
            </div>
          )}
          {Object.keys(generated).length > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setActiveTab('write')} style={secondaryBtn}>← Edit source</button>
              <button onClick={() => setActiveTab('schedule')} style={primaryBtn}>Schedule / Save →</button>
            </div>
          )}
        </div>
      )}

      {/* Schedule tab */}
      {activeTab === 'schedule' && (
        <div style={{ maxWidth: '600px' }}>
          <div style={sideCard}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Schedule Post
            </div>

            {/* Quick schedule buttons */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Next Available Slots (Tue / Thu)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {scheduleDays.map(d => (
                  <button
                    key={d.toISOString()}
                    onClick={() => {
                      setScheduleDate(d.toISOString().split('T')[0])
                      setScheduleTime('09:00')
                    }}
                    style={{
                      padding: '0.5rem 0.875rem', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '0.8125rem', fontFamily: "'DM Sans', sans-serif",
                      background: scheduleDate === d.toISOString().split('T')[0] ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${scheduleDate === d.toISOString().split('T')[0] ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: scheduleDate === d.toISOString().split('T')[0] ? '#93C5FD' : '#94A3B8',
                      transition: 'all 0.15s'
                    }}
                  >
                    {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={labelStyle}>Custom Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={labelStyle}>Time</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)}
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => savePost('scheduled')}
                disabled={saving || !scheduleDate}
                style={{ ...primaryBtn, opacity: saving || !scheduleDate ? 0.5 : 1, cursor: saving || !scheduleDate ? 'not-allowed' : 'pointer' }}
              >
                {saving ? 'Saving...' : saved ? '✓ Scheduled!' : `Schedule for ${scheduleDate ? new Date(scheduleDate + 'T' + scheduleTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) : '...'}`}
              </button>
              <button onClick={() => savePost('draft')} disabled={saving} style={secondaryBtn}>
                Save as Draft
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.8125rem', color: '#93C5FD', marginBottom: '0.25rem', fontWeight: 500 }}>Note on publishing</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', lineHeight: 1.6 }}>
              Scheduling saves the post and date. Direct social media publishing requires connecting your platform accounts via OAuth — this is configured separately per platform. See the deployment guide.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlatformCard({ platform, text, onChange }) {
  const pl = PLATFORMS[platform]
  const maxChars = PLATFORM_CHARS[platform]
  const isOver = text.length > maxChars

  return (
    <div style={{ background: '#141929', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{
        padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pl.color }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pl.label}</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: isOver ? '#EF4444' : '#475569', fontFamily: "'DM Mono', monospace" }}>
          {text.length}/{maxChars}
        </span>
      </div>
      <textarea
        value={text}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '0.875rem 1rem',
          background: 'transparent', border: 'none', outline: 'none',
          color: '#E2E8F0', fontSize: '0.875rem', lineHeight: 1.7,
          fontFamily: "'DM Sans', sans-serif", resize: 'vertical', minHeight: '180px'
        }}
      />
    </div>
  )
}

const inputStyle = {
  background: '#0B0F1A', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#F8FAFC', fontSize: '0.875rem',
  padding: '0.625rem 0.75rem', outline: 'none',
  fontFamily: "'DM Sans', sans-serif"
}

const labelStyle = {
  display: 'block', fontSize: '0.75rem', color: '#64748B',
  fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
  marginBottom: '0.5rem'
}

const sideCard = {
  background: '#141929', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px', padding: '1.25rem'
}

const primaryBtn = {
  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', border: 'none',
  borderRadius: '8px', color: '#fff', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 600, padding: '0.75rem 1.5rem',
  fontFamily: "'DM Sans', sans-serif", transition: 'opacity 0.15s',
  boxShadow: '0 2px 12px rgba(59,130,246,0.3)'
}

const secondaryBtn = {
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px', color: '#94A3B8', cursor: 'pointer',
  fontSize: '0.875rem', fontWeight: 500, padding: '0.75rem 1.5rem',
  fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s'
}
