import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const getTier = (elo) => {
  if (elo >= 2000) return { name: 'Grandmaster', icon: '👑', color: '#ff6b35', bg: '#ff6b3520' }
  if (elo >= 1800) return { name: 'Master', icon: '💎', color: '#a855f7', bg: '#a855f720' }
  if (elo >= 1600) return { name: 'Diamond', icon: '🔷', color: '#60a5fa', bg: '#60a5fa20' }
  if (elo >= 1400) return { name: 'Gold', icon: '🥇', color: '#fbbf24', bg: '#fbbf2420' }
  if (elo >= 1200) return { name: 'Silver', icon: '🥈', color: '#94a3b8', bg: '#94a3b820' }
  return { name: 'Bronze', icon: '🥉', color: '#d97706', bg: '#d9770620' }
}

const LANGS = [
  { id: 'javascript', label: 'JavaScript', color: '#f7df1e' },
  { id: 'python', label: 'Python', color: '#3776ab' },
  { id: 'cpp', label: 'C++', color: '#00599c' },
  { id: 'java', label: 'Java', color: '#f89820' },
  { id: 'typescript', label: 'TypeScript', color: '#3178c6' },
  { id: 'go', label: 'Go', color: '#00add8' },
  { id: 'rust', label: 'Rust', color: '#ce422b' },
]

const diffColor = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', stroke: '#22c55e' },
  Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', stroke: '#fb923c' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', stroke: '#ef4444' },
}

// ✅ Circular progress SVG component
const CircleChart = ({ wins, losses, total, easyWins, medWins, hardWins }) => {
  const r = 54
  const cx = 70
  const cy = 70
  const circ = 2 * Math.PI * r
  const easyPct = total > 0 ? easyWins / total : 0
  const medPct = total > 0 ? medWins / total : 0
  const hardPct = total > 0 ? hardWins / total : 0
  const gap = 0.02

  const easy = easyPct * (1 - gap * 3)
  const med = medPct * (1 - gap * 3)
  const hard = hardPct * (1 - gap * 3)

  const segments = [
    { pct: easy, color: '#22c55e', offset: 0 },
    { pct: med, color: '#fb923c', offset: easy + gap },
    { pct: hard, color: '#ef4444', offset: easy + gap + med + gap },
  ]

  return (
    <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} />
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} strokeDasharray={`${circ * 0.98} ${circ * 0.02}`} />
      ) : (
        segments.map((s, i) => s.pct > 0 && (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={10}
            strokeDasharray={`${circ * s.pct} ${circ * (1 - s.pct)}`}
            strokeDashoffset={-circ * s.offset}
            strokeLinecap="round"
          />
        ))
      )}
    </svg>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('battles')
  const [showSettings, setShowSettings] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editingBio, setEditingBio] = useState(false)

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const [username, setUsername] = useState(storedUser?.username || 'Player')
  const [bio, setBio] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [website, setWebsite] = useState('')
  const [education, setEducation] = useState('')
  const [company, setCompany] = useState('')
  const [selectedLangs, setSelectedLangs] = useState(['javascript'])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/auth'); return }

    const fetchData = async () => {
      try {
        const [pRes, bRes] = await Promise.all([
          fetch('http://localhost:5000/api/users/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/users/battles', { headers: { 'Authorization': `Bearer ${token}` } })
        ])
        const pData = await pRes.json()
        const bData = await bRes.json()
        if (pData.user) {
          setProfileData(pData.user)
          setUsername(pData.user.username || '')
          setBio(pData.user.bio || '')
          setGithub(pData.user.github || '')
          setLinkedin(pData.user.linkedin || '')
          setWebsite(pData.user.website || '')
          setEducation(pData.user.education || '')
          setCompany(pData.user.company || '')
          setSelectedLangs(pData.user.languages?.length ? pData.user.languages : ['javascript'])
          localStorage.setItem('user', JSON.stringify(pData.user))
        }
        if (bData.battles) setBattles(bData.battles)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username, bio, github, linkedin, website, education, company, languages: selectedLangs })
      })
      const data = await res.json()
      if (data.user) { setProfileData(data.user); localStorage.setItem('user', JSON.stringify(data.user)) }
      setShowSettings(false)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/auth') }

  const handleShare = () => {
    const tier = getTier(elo)
    navigator.clipboard.writeText(`🏆 ${username} on CodeArena | ${tier.icon} ${tier.name} | ELO: ${elo} | ${wins}W-${losses}L`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (s) => s ? `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}` : '-'
  const formatDate = (d) => {
    if (!d) return '-'
    const h = Math.floor((Date.now() - new Date(d)) / 3600000)
    if (h < 1) return 'Just now'
    if (h < 24) return `${h}h ago`
    if (h < 48) return 'Yesterday'
    return `${Math.floor(h/24)}d ago`
  }

  const user = profileData || storedUser
  const elo = user?.elo || 1200
  const peakElo = user?.peakElo || elo
  const wins = user?.stats?.wins || 0
  const losses = user?.stats?.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const tier = getTier(elo)
  const tierProgress = tier.nextElo && tier.prevElo ? Math.round(((elo - tier.prevElo) / (tier.nextElo - tier.prevElo)) * 100) : 100

  const diffWins = battles.reduce((acc, b) => {
    if (b.result === 'win') acc[b.difficulty] = (acc[b.difficulty] || 0) + 1
    return acc
  }, {})
  const easyWins = diffWins['Easy'] || 0
  const medWins = diffWins['Medium'] || 0
  const hardWins = diffWins['Hard'] || 0

  // Heatmap
  const heatmapData = Array(52 * 7).fill(0)
  battles.forEach(b => {
    const daysAgo = Math.floor((Date.now() - new Date(b.date)) / 86400000)
    if (daysAgo >= 0 && daysAgo < 364) {
      const idx = 363 - daysAgo
      if (idx >= 0) heatmapData[idx] = Math.min(4, heatmapData[idx] + 1)
    }
  })
  const heatColor = (v) => ['rgba(255,255,255,0.04)', 'rgba(255,107,53,0.25)', 'rgba(255,107,53,0.5)', 'rgba(255,107,53,0.75)', '#ff6b35'][v]

  // Achievements
  const ACHIEVEMENTS = [
    { icon: '🔥', title: 'Hot Streak', desc: '5 wins in a row', unlocked: (user?.stats?.streak||0) >= 5 },
    { icon: '⚡', title: 'Speed Demon', desc: 'Win in under 3 min', unlocked: battles.some(b => b.result==='win' && b.timeTaken<180) },
    { icon: '🎯', title: 'Sharp Shooter', desc: '90%+ win rate', unlocked: winRate >= 90 && total >= 5 },
    { icon: '💪', title: 'Battle Tested', desc: '10+ battles', unlocked: total >= 10 },
    { icon: '🧠', title: 'Big Brain', desc: 'Win a Hard problem', unlocked: hardWins > 0 },
    { icon: '🥈', title: 'Silver Rank', desc: 'Reach 1200 ELO', unlocked: elo >= 1200 },
    { icon: '🥇', title: 'Gold Rank', desc: 'Reach 1400 ELO', unlocked: elo >= 1400 },
    { icon: '🔷', title: 'Diamond', desc: 'Reach 1600 ELO', unlocked: elo >= 1600 },
    { icon: '👑', title: 'Grandmaster', desc: 'Reach 2000 ELO', unlocked: elo >= 2000 },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'Inter' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: 'Inter, sans-serif', color: '#e5e5e5' }}>

      {/* ✅ Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '90%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: '#fff' }}>Edit Profile</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Username */}
              <div>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>USERNAME</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#fff', outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} />
              </div>
              {/* Bio */}
              <div>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>BIO</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell the arena about yourself..." rows={3}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', resize: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} />
              </div>
              {/* Education & Company */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'EDUCATION', val: education, set: setEducation, ph: 'e.g. IIT Bombay' },
                  { label: 'COMPANY', val: company, set: setCompany, ph: 'e.g. Google' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 8 }}>{label}</label>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#fff', outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              {/* Social Links */}
              <div>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 10 }}>SOCIAL LINKS</label>
                {[
                  { emoji: '🐙', label: 'GitHub', val: github, set: setGithub, ph: 'github.com/username' },
                  { emoji: '💼', label: 'LinkedIn', val: linkedin, set: setLinkedin, ph: 'linkedin.com/in/username' },
                  { emoji: '🌐', label: 'Website', val: website, set: setWebsite, ph: 'yourportfolio.dev' },
                ].map(({ emoji, label, val, set, ph }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, width: 80, color: '#666', flexShrink: 0 }}>{emoji} {label}</span>
                    <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fff', outline: 'none', fontFamily: 'Inter' }} />
                  </div>
                ))}
              </div>
              {/* Languages */}
              <div>
                <label style={{ fontSize: 11, color: '#555', fontWeight: 700, letterSpacing: 1, display: 'block', marginBottom: 10 }}>LANGUAGES</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LANGS.map(l => (
                    <button key={l.id} onClick={() => setSelectedLangs(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                      style={{
                        padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter',
                        background: selectedLangs.includes(l.id) ? `${l.color}20` : 'rgba(255,255,255,0.03)',
                        color: selectedLangs.includes(l.id) ? l.color : '#555',
                        border: `1px solid ${selectedLangs.includes(l.id) ? l.color + '50' : 'rgba(255,255,255,0.08)'}`,
                        transition: 'all 0.2s'
                      }}>{l.label}</button>
                  ))}
                </div>
              </div>
              <button onClick={saveProfile} disabled={saving} style={{
                background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter', marginTop: 4
              }}>{saving ? '⟳ Saving...' : '✓ Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ height: 56, background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <span onClick={() => navigate('/')} style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, cursor: 'pointer', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#ff6b35' }}>Code</span><span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div style={{ flex: 1 }} />
        {[{ label: 'Lobby', path: '/lobby' }, { label: 'Leaderboard', path: '/leaderboard' }].map(({ label, path }) => (
          <span key={label} onClick={() => navigate(path)} style={{ fontSize: 13, color: '#666', cursor: 'pointer', fontWeight: 500 }}>{label}</span>
        ))}
        <button onClick={handleShare} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`, color: copied ? '#22c55e' : '#666', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>
          {copied ? '✓ Copied!' : '↗ Share'}
        </button>
        <button onClick={() => setShowSettings(true)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#666', borderRadius: 8, padding: '6px 12px', fontSize: 15, cursor: 'pointer' }}>⚙️</button>
        <button onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>Logout</button>
        <button onClick={() => navigate('/lobby')} style={{ background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>⚡ Battle</button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ✅ LEFT SIDEBAR — LeetCode style */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar + Basic Info */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px 24px', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{
              width: 88, height: 88, borderRadius: '50%', margin: '0 auto 16px',
              background: `linear-gradient(135deg, #ff6b35, #f7451d)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Outfit', fontSize: 32, fontWeight: 900, color: '#fff',
              border: `3px solid ${tier.color}40`, boxShadow: `0 0 20px ${tier.color}30`
            }}>
              {username.slice(0, 2).toUpperCase()}
            </div>

            {/* Username */}
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 4 }}>{username}</div>

            {/* Tier Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: tier.bg, border: `1px solid ${tier.color}40`, borderRadius: 20, padding: '4px 12px', marginBottom: 12 }}>
              <span>{tier.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.name}</span>
            </div>

            {/* Bio */}
            {!editingBio ? (
              <p onClick={() => setEditingBio(true)} style={{ fontSize: 13, color: bio ? '#aaa' : '#444', cursor: 'pointer', marginBottom: 16, lineHeight: 1.5 }}>
                {bio || '+ Add a bio...'}
              </p>
            ) : (
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                onBlur={() => { setEditingBio(false); saveProfile() }}
                autoFocus rows={2}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: 8, padding: '8px', fontSize: 13, color: '#fff', outline: 'none', resize: 'none', fontFamily: 'Inter', boxSizing: 'border-box', marginBottom: 12 }} />
            )}

            {/* Edit Profile Button */}
            <button onClick={() => setShowSettings(true)} style={{ width: '100%', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', color: '#ff6b35', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>
              ✏️ Edit Profile
            </button>
          </div>

          {/* Info Card */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🇮🇳', text: 'India' },
              education && { icon: '🎓', text: education },
              company && { icon: '💼', text: company },
              { icon: '📅', text: `Joined ${new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` },
            ].filter(Boolean).map(({ icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}

            {/* Social Links */}
            {(github || linkedin || website) ? (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {github && <a href={`https://${github}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', textDecoration: 'none' }}>🐙 <span style={{ color: '#60a5fa' }}>{github}</span></a>}
                {linkedin && <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', textDecoration: 'none' }}>💼 <span style={{ color: '#60a5fa' }}>{linkedin}</span></a>}
                {website && <a href={`https://${website}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', textDecoration: 'none' }}>🌐 <span style={{ color: '#60a5fa' }}>{website}</span></a>}
              </div>
            ) : (
              <button onClick={() => setShowSettings(true)} style={{ marginTop: 8, fontSize: 12, color: '#444', background: 'none', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter' }}>+ Add social links</button>
            )}
          </div>

          {/* Languages Card */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Languages</div>
            {selectedLangs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedLangs.map(id => {
                  const l = LANGS.find(x => x.id === id)
                  if (!l) return null
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                        <span style={{ fontSize: 13, color: '#aaa' }}>{l.label}</span>
                      </div>
                      {/* ✅ Language wins hatao — misleading hai */}
                    </div>
                  )
                })}
              </div>
            ) : (
              <button onClick={() => setShowSettings(true)} style={{ fontSize: 12, color: '#444', background: 'none', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter' }}>+ Add languages</button>
            )}
          </div>

          {/* Community Stats */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Arena Stats</div>
            {[
              { icon: '⚔️', label: 'Total Battles', val: total, color: '#ff6b35' },
              { icon: '🏆', label: 'Wins', val: wins, color: '#22c55e' },
              { icon: '💀', label: 'Losses', val: losses, color: '#ef4444' },
              { icon: '📈', label: 'Current ELO', val: elo, color: tier.color },
              { icon: '🔝', label: 'Peak ELO', val: Math.max(peakElo, elo), color: '#fbbf24' },
            ].map(({ icon, label, val, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666' }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ RIGHT MAIN CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Battle Stats Card — LeetCode style circular chart */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

            {/* Circular Chart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
                <CircleChart wins={wins} losses={losses} total={total} easyWins={easyWins} medWins={medWins} hardWins={hardWins} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 28, color: '#fff', lineHeight: 1 }}>{wins}</div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Solved</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Easy', val: easyWins, color: '#22c55e' },
                  { label: 'Med.', val: medWins, color: '#fb923c' },
                  { label: 'Hard', val: hardWins, color: '#ef4444' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, width: 36 }}>{label}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{val}</span>
                    <span style={{ fontSize: 11, color: '#444' }}>wins</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ELO + Tier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tier Card */}
              <div style={{ background: tier.bg, border: `1px solid ${tier.color}30`, borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{tier.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 28, color: tier.color, lineHeight: 1 }}>{elo}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>ELO Rating</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: tier.color, marginBottom: 8 }}>{tier.name}</div>
                {tier.nextElo && (
                  <>
                    <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>{elo} / {tier.nextElo} to next tier</div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: `linear-gradient(90deg, ${tier.color}, ${tier.color}99)`, width: `${tierProgress}%`, borderRadius: 3, transition: 'width 1s' }} />
                    </div>
                  </>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Win Rate', val: `${winRate}%`, color: '#fb923c' },
                  { label: 'Streak 🔥', val: user?.stats?.streak || 0, color: '#fb923c' },
                  { label: 'Peak ELO', val: Math.max(peakElo, elo), color: '#fbbf24' },
                  { label: 'Battles', val: total, color: '#60a5fa' },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color, marginBottom: 4 }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: 0.5 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges / Achievements preview */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Badges</span>
              <span style={{ fontSize: 12, color: '#555' }}>{ACHIEVEMENTS.filter(a => a.unlocked).length} / {ACHIEVEMENTS.length} unlocked</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {ACHIEVEMENTS.map(({ icon, title, unlocked }) => (
                <div key={title} title={title} style={{
                  width: 52, height: 52, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, transition: 'all 0.2s', cursor: 'default',
                  background: unlocked ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${unlocked ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  filter: unlocked ? 'none' : 'grayscale(1) opacity(0.3)',
                  boxShadow: unlocked ? '0 0 12px rgba(255,107,53,0.15)' : 'none'
                }}>
                  {unlocked ? icon : '🔒'}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>
                {total > 0 ? `${total} battles in the past year` : '0 battles in the past year'}
              </span>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#555', alignItems: 'center' }}>
                <span>Max streak: {user?.stats?.streak || 0}</span>
              </div>
            </div>

            {/* Month labels */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 4, paddingLeft: 2 }}>
              {['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'].map((m, i) => (
                <div key={m} style={{ width: `${100/12}%`, fontSize: 10, color: '#444', textAlign: 'center' }}>{m}</div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 3, overflowX: 'auto' }}>
              {Array.from({ length: 52 }).map((_, week) => (
                <div key={week} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {Array.from({ length: 7 }).map((_, day) => {
                    const val = heatmapData[week * 7 + day]
                    return (
                      <div key={day} title={`${val} battles`} style={{
                        width: 12, height: 12, borderRadius: 2,
                        background: heatColor(val), cursor: 'pointer',
                        transition: 'transform 0.1s'
                      }} />
                    )
                  })}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 11, color: '#555' }}>
              <span>Less</span>
              {[0,1,2,3,4].map(v => <div key={v} style={{ width: 11, height: 11, borderRadius: 2, background: heatColor(v) }} />)}
              <span>More</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 0 }}>
            {['battles', 'achievements', 'stats'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '12px 24px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === t ? '#ff6b35' : 'transparent'}`,
                color: activeTab === t ? '#ff6b35' : '#555', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.2s', fontFamily: 'Inter'
              }}>{t}</button>
            ))}
          </div>

          {/* BATTLES TAB */}
          {activeTab === 'battles' && (
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 130px 90px 70px 90px', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', fontSize: 10, fontWeight: 700, color: '#444', letterSpacing: 1 }}>
                {['RESULT', 'PROBLEM', 'OPPONENT', 'DIFF', 'TIME', 'DATE'].map(h => <div key={h}>{h}</div>)}
              </div>
              {battles.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#555' }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>⚔️</div>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>No battles yet!</div>
                  <button onClick={() => navigate('/lobby')} style={{ background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Inter' }}>Enter Arena</button>
                </div>
              ) : battles.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 130px 90px 70px 90px', padding: '14px 20px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: b.result === 'win' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: b.result === 'win' ? '#22c55e' : '#ef4444', border: `1px solid ${b.result === 'win' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                      {b.result?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{b.problem || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: b.result === 'win' ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                      {b.result === 'win' ? '+' : ''}{b.eloChange || 0} ELO
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                      {(b.opponent || 'OP').slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>{b.opponent || 'Unknown'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: diffColor[b.difficulty]?.bg, color: diffColor[b.difficulty]?.color }}>
                      {b.difficulty || 'Med'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#666' }}>{formatTime(b.timeTaken)}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{formatDate(b.date)}</div>
                </div>
              ))}
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {ACHIEVEMENTS.map(({ icon, title, desc, unlocked }) => (
                <div key={title} style={{
                  background: '#13131a', border: `1px solid ${unlocked ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 14, padding: '20px', transition: 'all 0.3s',
                  opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(0.8)'
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 12, background: unlocked ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${unlocked ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                    {unlocked ? icon : '🔒'}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>{desc}</div>
                  {unlocked && <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: '#ff6b35', letterSpacing: 1 }}>✓ UNLOCKED</div>}
                </div>
              ))}
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Performance */}
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 14 }}>Performance</div>
                {[
                  { label: 'Wins', val: wins, total: total || 1, color: '#22c55e' },
                  { label: 'Losses', val: losses, total: total || 1, color: '#ef4444' },
                  { label: 'Easy Wins', val: easyWins, total: total || 1, color: '#22c55e' },
                  { label: 'Medium Wins', val: medWins, total: total || 1, color: '#fb923c' },
                  { label: 'Hard Wins', val: hardWins, total: total || 1, color: '#ef4444' },
                ].map(({ label, val, total, color }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#666' }}>{label}</span>
                      <span style={{ color, fontWeight: 700 }}>{val}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', height: 5, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: color, width: `${(val/total)*100}%`, borderRadius: 3, transition: 'width 1s' }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Account */}
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 14 }}>Account</div>
                {[
                  { label: 'Username', val: username },
                  { label: 'Email', val: user?.email || '-' },
                  { label: 'Status', val: user?.isVerified ? '✓ Verified' : '✗ Unverified' },
                  { label: 'Current ELO', val: `${elo} (${tier.icon} ${tier.name})` },
                  { label: 'Peak ELO', val: `📈 ${Math.max(peakElo, elo)}` },
                  { label: 'Win Rate', val: `${winRate}%` },
                  { label: 'Joined', val: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                    <span style={{ color: '#555' }}>{label}</span>
                    <span style={{ color: '#e5e5e5', fontWeight: 500 }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* ELO History */}
              <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px 24px', gridColumn: '1 / -1' }}>
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: 14 }}>ELO History</div>
                {battles.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
                      {battles.slice(-20).map((b, i) => {
                        const eloVal = b.eloAfter || elo
                        const pct = Math.max(5, Math.min(100, ((eloVal - 1000) / 400) * 100))
                        const isLast = i === Math.min(battles.length, 20) - 1
                        return (
                          <div key={i} title={`${eloVal} ELO`} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                            <div style={{ width: '100%', height: `${pct}%`, minHeight: 4, borderRadius: '4px 4px 0 0', background: isLast ? 'linear-gradient(to top, #ff6b35, #fbbf24)' : 'rgba(255,255,255,0.08)', transition: 'all 0.3s', boxShadow: isLast ? '0 0 12px rgba(255,107,53,0.4)' : 'none' }} />
                          </div>
                        )
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12, color: '#555' }}>
                      <span>{battles.length} battles ago</span>
                      <span style={{ color: '#ff6b35', fontWeight: 700 }}>{elo} ELO (now)</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: 13 }}>
                    Play your first battle to see ELO history!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}