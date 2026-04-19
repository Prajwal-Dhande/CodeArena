import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async' // 🔥 SEO Import
import API_URL from '../config/api'

// Load premium fonts
if (typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

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

// ✅ New Topic Mastery Radar Chart Component
const TopicRadarChart = ({ data }) => {
  const size = 260;
  const center = size / 2;
  const maxRadius = 85;
  const angles = [0, 60, 120, 180, 240, 300].map(d => (d - 90) * (Math.PI / 180));

  const points = data.map((d, i) => {
    const r = (d.val / 100) * maxRadius;
    return `${center + r * Math.cos(angles[i])},${center + r * Math.sin(angles[i])}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '10px 0' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Radar Grid */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(scale => (
          <polygon
            key={scale}
            points={angles.map(a => `${center + maxRadius * scale * Math.cos(a)},${center + maxRadius * scale * Math.sin(a)}`).join(' ')}
            fill={scale === 1 ? 'rgba(255,255,255,0.02)' : 'none'}
            stroke="rgba(255,255,255,0.08)" strokeWidth="1"
          />
        ))}
        {/* Axes */}
        {angles.map((a, i) => (
          <line key={i} x1={center} y1={center} x2={center + maxRadius * Math.cos(a)} y2={center + maxRadius * Math.sin(a)} stroke="rgba(255,255,255,0.06)" />
        ))}
        {/* Data Shape */}
        <polygon points={points} fill="rgba(255,107,53,0.25)" stroke="#ff6b35" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(255,107,53,0.4))' }} />
        {/* Points Dots */}
        {data.map((d, i) => {
          const r = (d.val / 100) * maxRadius;
          return <circle key={i} cx={center + r * Math.cos(angles[i])} cy={center + r * Math.sin(angles[i])} r="4" fill="#ff6b35" />
        })}
        {/* Labels */}
        {data.map((d, i) => {
          const r = maxRadius + 25;
          const x = center + r * Math.cos(angles[i]);
          const y = center + r * Math.sin(angles[i]);
          return <text key={i} x={x} y={y} fill="#a1a1aa" fontSize="11" textAnchor="middle" dominantBaseline="middle" fontWeight="600" fontFamily="JetBrains Mono">{d.label}</text>
        })}
      </svg>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('battles')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showAppPrefs, setShowAppPrefs] = useState(false) // New state for Gear Icon
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
          fetch(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_URL}/api/users/battles`, { headers: { 'Authorization': `Bearer ${token}` } })
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
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ username, bio, github, linkedin, website, education, company, languages: selectedLangs })
      })
      const data = await res.json()
      if (data.user) { setProfileData(data.user); localStorage.setItem('user', JSON.stringify(data.user)) }
      setShowEditProfile(false)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/auth') }

  const handleShare = () => {
    const tier = getTier(elo)
    navigator.clipboard.writeText(`🏆 ${username} on CodeArena | ${tier.icon} ${tier.name} | Rank #${globalRank} | ELO: ${elo} | ${wins}W-${losses}L`)
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
  const elo = user?.elo ?? 0
  const peakElo = user?.peakElo ?? elo
  const wins = user?.stats?.wins || 0
  const losses = user?.stats?.losses || 0
  const total = wins + losses
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0
  const tier = getTier(elo)
  const tierProgress = tier.nextElo && tier.prevElo ? Math.round(((elo - tier.prevElo) / (tier.nextElo - tier.prevElo)) * 100) : 100
  
  // Dummy Social/Rank stats if not available in API yet
  const followers = user?.followersCount || 142
  const following = user?.followingCount || 38
  const globalRank = user?.globalRank || 4231

  const diffWins = battles.reduce((acc, b) => {
    if (b.result === 'win') acc[b.difficulty] = (acc[b.difficulty] || 0) + 1
    return acc
  }, {})
  const easyWins = diffWins['Easy'] || 0
  const medWins = diffWins['Medium'] || 0
  const hardWins = diffWins['Hard'] || 0

  const langWinsMap = battles.reduce((acc, b) => {
    if (b.result === 'win' && b.language) {
      acc[b.language] = (acc[b.language] || 0) + 1
    }
    return acc
  }, {})

  // Calculate Primary Weapon
  let primaryWeaponKey = selectedLangs[0] || 'javascript';
  let maxWins = -1;
  Object.entries(langWinsMap).forEach(([lang, w]) => {
    if (w > maxWins) { maxWins = w; primaryWeaponKey = lang; }
  })
  const primaryWeapon = LANGS.find(l => l.id === primaryWeaponKey)

  // ✅ REAL GITHUB-STYLE MATRIX LOGIC
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0) // Midnight set kiya taaki accurate din aaye

  const heatmapData = Array(365).fill(0)
  
  battles.forEach(b => {
    if (!b.date) return
    const bDate = new Date(b.date)
    bDate.setHours(0, 0, 0, 0)
    const diffTime = todayDate - bDate
    const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (daysAgo >= 0 && daysAgo < 365) {
      const idx = 364 - daysAgo 
      heatmapData[idx] = Math.min(4, heatmapData[idx] + 1)
    }
  })

  // GitHub ki tarah Grid align karna (Row 0 = Sunday)
  const oneYearAgo = new Date(todayDate)
  oneYearAgo.setDate(todayDate.getDate() - 364)
  const startDayOfWeek = oneYearAgo.getDay() 

  // Shuru mein khaali dabbe daale taaki array Sunday se shuru ho
  const paddedData = Array(startDayOfWeek).fill(-1).concat(heatmapData)
  const weeks = []
  for (let i = 0; i < paddedData.length; i += 7) {
    weeks.push(paddedData.slice(i, i + 7))
  }

  // Mahine (Months) ab automatic set honge real date ke hisaab se
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dynamicMonths = []
  for(let i = 11; i >= 0; i--) {
    dynamicMonths.push(monthNames[(todayDate.getMonth() - i + 12) % 12])
  }

  const heatColor = (v) => ['rgba(255,255,255,0.04)', 'rgba(34,197,94,0.3)', 'rgba(34,197,94,0.6)', 'rgba(34,197,94,0.85)', '#22c55e'][v]

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

  // Dummy data for Radar Chart
  const masteryData = [
    { label: 'Arrays', val: 85 },
    { label: 'Strings', val: 70 },
    { label: 'Graphs', val: 40 },
    { label: 'DP', val: 55 },
    { label: 'Trees', val: 65 },
    { label: 'Math', val: 90 },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#030305', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, fontFamily: 'Inter' }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(255,107,53,0.15)', borderTopColor: '#ff6b35', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: '#555', fontWeight: 600 }}>Loading profile...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div className="profile-container" style={{ minHeight: '100vh', background: '#0a0a0c', fontFamily: 'Inter, sans-serif', color: '#e5e5e5', position: 'relative' }}>

      {/* 👇🔥 SEO TAGS START 🔥👇 */}
      <Helmet>
        <title>{username ? `${username} | CodeArena Profile` : 'Player Profile | CodeArena'}</title>
        <meta name="description" content={`Check out ${username || 'this player'}'s CodeArena stats. Current ELO: ${elo} (${tier.name}). Total Battles: ${total}, Win Rate: ${winRate}%.`} />
        <meta name="keywords" content={`coding profile, ${username}, codearena, competitive programming, 1v1 coding, ${primaryWeapon?.label || 'developer'}`} />
      </Helmet>
      {/* 👆🔥 SEO TAGS END 🔥👆 */}

      {/* ✅ Enhanced Ambient Glow */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="ambient-glow-1" style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', minWidth: '600px', minHeight: '600px', background: 'radial-gradient(circle, rgba(255,107,53,0.22) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%' }} />
        <div className="ambient-glow-2" style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '60vw', height: '60vw', minWidth: '700px', minHeight: '700px', background: 'radial-gradient(circle, rgba(247,69,29,0.15) 0%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%' }} />
      </div>

      {/* ✅ Edit Profile Modal */}
      {showEditProfile && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '90%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: '#fff' }}>Edit Profile</span>
              <button onClick={() => setShowEditProfile(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
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

      {/* ✅ Application Settings Modal (From Gear Icon) */}
      {showAppPrefs && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '90%', maxWidth: 440, overflow: 'hidden' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: '#fff' }}>Preferences</span>
              <button onClick={() => setShowAppPrefs(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '16px 0' }}>
              {[
                { section: 'Arena Settings', items: [{label: '🎵 Enable Match Sounds'}, {label: '💻 Editor: Vim Keybindings'}] },
                { section: 'Privacy', items: [{label: '👁️ Make Profile Public'}, {label: '📊 Show ELO on Leaderboard'}] },
                { section: 'Account', items: [{label: '🔑 Change Password'}, {label: '🚪 Logout', action: handleLogout, danger: true}, {label: '🗑️ Delete Account', danger: true}] }
              ].map((grp, i) => (
                <div key={i} style={{ marginBottom: i === 2 ? 0 : 16 }}>
                  <div style={{ padding: '0 28px', fontSize: 11, color: '#666', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{grp.section}</div>
                  {grp.items.map((item, j) => (
                    <div key={j} onClick={item.action ? item.action : undefined} style={{ padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'transparent' }} 
                         onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} 
                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: 14, color: item.danger ? '#ef4444' : '#e5e5e5', fontWeight: 500 }}>{item.label}</span>
                      {!item.danger && !item.label.includes('Password') && (
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: j===0 ? '#ff6b35' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: 2, left: j===0 ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'all 0.2s' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ height: 64, background: 'rgba(10,10,12,0.75)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <span onClick={() => navigate('/')} style={{ fontWeight: 700, fontSize: 18, cursor: 'pointer', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#ff6b35' }}>Code</span><span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div style={{ flex: 1 }} />
        {[{ label: 'Lobby', path: '/lobby' }, { label: 'Leaderboard', path: '/leaderboard' }].map(({ label, path }) => (
          <span key={label} onClick={() => navigate(path)} style={{ fontSize: 13, color: '#888', cursor: 'pointer', fontWeight: 500 }}>{label}</span>
        ))}
        <button onClick={handleShare} style={{ background: copied ? 'rgba(34,197,94,0.1)' : 'transparent', border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`, color: copied ? '#22c55e' : '#a1a1aa', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>
          {copied ? '✓ Copied!' : '↗ Share'}
        </button>
        <button onClick={() => setShowAppPrefs(true)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa', borderRadius: 8, padding: '6px 12px', fontSize: 15, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>⚙️</button>
        <button onClick={() => navigate('/lobby')} style={{ background: '#ff6b35', color: '#fff', border: 'none', padding: '6px 18px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>⚡ Battle</button>
      </nav>

      <div className="profile-main-grid" style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start', position: 'relative', zIndex: 1 }}>

        {/* ✅ LEFT SIDEBAR */}
        <div className="profile-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar + Basic Info */}
          <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '36px 28px', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 20px' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: `rgba(255,107,53,0.1)`,
                border: '1px solid rgba(255,107,53,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Inter', fontSize: 32, fontWeight: 700, color: '#ff6b35'
              }}>
                {username.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 4 }}>{username}</div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: tier.bg, border: `1px solid ${tier.color}40`, borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
              <span>{tier.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.name}</span>
            </div>

            {/* ✅ Social Stats / Followers */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ cursor: 'pointer' }}>
                 <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono' }}>{followers}</div>
                 <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Followers</div>
               </div>
               <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
               <div style={{ cursor: 'pointer' }}>
                 <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono' }}>{following}</div>
                 <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Following</div>
               </div>
            </div>

            {!editingBio ? (
              <p onClick={() => setEditingBio(true)} style={{ fontSize: 13, color: bio ? '#aaa' : '#555', cursor: 'pointer', marginBottom: 16, lineHeight: 1.5 }}>
                {bio || '+ Add a bio...'}
              </p>
            ) : (
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                onBlur={() => { setEditingBio(false); saveProfile() }}
                autoFocus rows={2}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: 8, padding: '8px', fontSize: 13, color: '#fff', outline: 'none', resize: 'none', fontFamily: 'Inter', boxSizing: 'border-box', marginBottom: 12 }} />
            )}

            <button onClick={() => setShowEditProfile(true)} style={{ width: '100%', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', color: '#ff6b35', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>
              ✏️ Edit Profile
            </button>
          </div>

          {/* Info Card */}
          <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: '🇮🇳', text: 'India' },
              education && { icon: '🎓', text: education },
              company && { icon: '💼', text: company },
              { icon: '📅', text: `Joined ${new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` },
            ].filter(Boolean).map(({ icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}

            {(github || linkedin || website) ? (
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {github && <a href={`https://${github}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', textDecoration: 'none' }}>🐙 <span style={{ color: '#60a5fa' }}>{github}</span></a>}
                {linkedin && <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', textDecoration: 'none' }}>💼 <span style={{ color: '#60a5fa' }}>{linkedin}</span></a>}
                {website && <a href={`https://${website}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#666', textDecoration: 'none' }}>🌐 <span style={{ color: '#60a5fa' }}>{website}</span></a>}
              </div>
            ) : (
              <button onClick={() => setShowEditProfile(true)} style={{ marginTop: 8, fontSize: 12, color: '#444', background: 'none', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter' }}>+ Add social links</button>
            )}
          </div>

          {/* Languages Card */}
          <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '22px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Languages</div>
            
            {/* ✅ Primary Weapon Badge */}
            {primaryWeapon && (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, marginBottom: 16 }}>
                 <div style={{ fontSize: 20 }}>⚔️</div>
                 <div>
                   <div style={{ fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Primary Weapon</div>
                   <div style={{ fontSize: 14, color: primaryWeapon.color, fontWeight: 700 }}>{primaryWeapon.label}</div>
                 </div>
               </div>
            )}

            {selectedLangs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedLangs.map(id => {
                  const l = LANGS.find(x => x.id === id)
                  if (!l) return null
                  const wins = langWinsMap[id] || 0
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                        <span style={{ fontSize: 13, color: '#aaa' }}>{l.label}</span>
                      </div>
                      {wins > 0 && (
                        <span style={{ fontSize: 12, color: '#555' }}>{wins} wins</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <button onClick={() => setShowEditProfile(true)} style={{ fontSize: 12, color: '#444', background: 'none', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter' }}>+ Add languages</button>
            )}
          </div>

        </div>

        {/* ✅ RIGHT MAIN CONTENT */}
        <div className="profile-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Battle Stats Card */}
          <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px', display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: 32, alignItems: 'center' }}>

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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Tier Card with Global Rank */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tier.color}40`, borderRadius: 16, padding: '20px 24px', position: 'relative' }}>
                
                {/* Global Rank Position */}
                <div style={{ position: 'absolute', top: 20, right: 24, textAlign: 'right' }}>
                   <div style={{ fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Global Rank</div>
                   <div style={{ fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 800, color: '#fff' }}>#{globalRank.toLocaleString()}</div>
                </div>

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
                    <div style={{ background: 'rgba(255,255,255,0.06)', height: 6, borderRadius: 3, overflow: 'hidden', maxWidth: '60%' }}>
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
                  { label: 'Peak ELO', val: Math.max(peakElo, elo), color: '#a1a1aa' },
                  { label: 'Battles', val: total, color: '#a1a1aa' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 18, color, marginBottom: 4 }}>{val}</div>
                    <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges preview */}
          <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px 28px' }}>
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
          <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '28px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🟩</span>
                <span style={{ fontWeight: 900, color: '#fff', fontSize: 16, fontFamily: 'Outfit', letterSpacing: 1 }}>
                  ACTIVITY MATRIX
                </span>
                <span style={{ marginLeft: 8, fontSize: 13, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                  {total > 0 ? `${total} Contributions` : '0 Contributions'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#666', alignItems: 'center', fontWeight: 600 }}>
                <span>Max streak: <span style={{ color: '#fff' }}>{user?.stats?.streak || 0}</span></span>
              </div>
            </div>

            {/* ✅ MAIN GRAPH AREA (WITH LEFT LABELS) */}
            <div style={{ display: 'flex', gap: 10 }}>
              
              {/* Left Sidebar for Days (Mon, Wed, Fri) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 20 }}>
                {/* Array: Sun(0), Mon(1), Tue(2), Wed(3), Thu(4), Fri(5), Sat(6) */}
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, idx) => (
                  <div key={idx} style={{ height: 14, width: 24, fontSize: 10, color: '#666', fontFamily: 'Inter', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Right Side: The Actual Matrix */}
              <div style={{ flex: 1, overflowX: 'auto', paddingBottom: 8 }}>
                
                {/* Dynamic Months Header */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 6, paddingLeft: 2 }}>
                  {dynamicMonths.map((m, i) => (
                    <div key={i} style={{ width: `${100/12}%`, fontSize: 11, color: '#555', textAlign: 'center', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>{m}</div>
                  ))}
                </div>

                {/* ✅ Real GitHub Grid Structure */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {weeks.map((weekData, weekIdx) => (
                    <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {weekData.map((val, dayIdx) => (
                        val === -1 ? (
                          <div key={dayIdx} style={{ width: 14, height: 14, background: 'transparent' }} /> 
                        ) : (
                          <div key={dayIdx} title={val > 0 ? `${val} battles` : 'No battles'} style={{
                            width: 14, height: 14, borderRadius: 3,
                            background: heatColor(val), cursor: 'pointer',
                            transition: 'transform 0.1s, box-shadow 0.2s',
                            boxShadow: val > 0 ? `0 0 8px ${heatColor(val)}40` : 'none'
                          }} 
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          />
                        )
                      ))}
                    </div>
                  ))}
                </div>

              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: '#666', fontFamily: 'JetBrains Mono' }}>
              <span>Less</span>
              {[0,1,2,3,4].map(v => <div key={v} style={{ width: 14, height: 14, borderRadius: 3, background: heatColor(v), boxShadow: v > 0 ? `0 0 8px ${heatColor(v)}40` : 'none' }} />)}
              <span>More</span>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 16, background: 'transparent', padding: '0 8px' }}>
            {['battles', 'achievements', 'stats'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                padding: '10px 22px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none',
                borderBottom: `2px solid ${activeTab === t ? '#ff6b35' : 'transparent'}`,
                borderRadius: '10px 10px 0 0',
                color: activeTab === t ? '#ff6b35' : '#555', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.2s', fontFamily: 'Inter',
                background: activeTab === t ? 'rgba(255,107,53,0.06)' : 'transparent'
              }}>{t}</button>
            ))}
          </div>

          {/* BATTLES TAB */}
          {activeTab === 'battles' && (
            <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px) saturate(150%)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '0 0 24px 24px', overflow: 'hidden', boxShadow: '0 20px 48px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 130px 90px 70px 90px', padding: '14px 24px', background: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 800, color: 'rgba(100,116,139,0.8)', letterSpacing: 2 }}>
                {['RESULT', 'PROBLEM', 'OPPONENT', 'DIFF', 'TIME', 'DATE'].map(h => <div key={h}>{h}</div>)}
              </div>
              {battles.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', color: '#555' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#888' }}>No battles yet!</div>
                  <div style={{ fontSize: 13, color: '#555', marginBottom: 24 }}>Enter the arena and start your coding combat journey</div>
                  <button onClick={() => navigate('/lobby')} style={{ background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', cursor: 'pointer', fontWeight: 700, fontFamily: 'Inter', fontSize: 14, boxShadow: '0 8px 24px rgba(255,107,53,0.3)', transition: 'all 0.3s' }}>⚡ Enter Arena</button>
                </div>
              ) : battles.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 130px 90px 70px 90px', padding: '16px 24px', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.paddingLeft = '28px'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.paddingLeft = '24px'; }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, background: b.result === 'win' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: b.result === 'win' ? '#22c55e' : '#ef4444', border: `1px solid ${b.result === 'win' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, letterSpacing: 0.5 }}>
                      {b.result?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{b.problem || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: b.result === 'win' ? '#22c55e' : '#ef4444', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                      {b.result === 'win' ? '+' : ''}{b.eloChange || 0} ELO
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #334155, #0f172a)', border: '1px solid rgba(71,85,105,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>
                      {(b.opponent || 'OP').slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, color: '#888' }}>{b.opponent || 'Unknown'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: diffColor[b.difficulty]?.bg, color: diffColor[b.difficulty]?.color, border: `1px solid ${diffColor[b.difficulty]?.color}30` }}>
                      {b.difficulty || 'Med'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#666', fontWeight: 600 }}>{formatTime(b.timeTaken)}</div>
                  <div style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{formatDate(b.date)}</div>
                </div>
              ))}
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {ACHIEVEMENTS.map(({ icon, title, desc, unlocked }) => (
                <div key={title} style={{
                  background: unlocked ? 'rgba(255,107,53,0.06)' : 'rgba(18, 18, 22, 0.65)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${unlocked ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 20, padding: '24px', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  opacity: unlocked ? 1 : 0.45, filter: unlocked ? 'none' : 'grayscale(0.8)',
                  boxShadow: unlocked ? '0 0 30px rgba(255,107,53,0.08), 0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.3)',
                  position: 'relative', overflow: 'hidden', cursor: 'default'
                }}
                onMouseEnter={e => unlocked && (e.currentTarget.style.transform = 'translateY(-4px)', e.currentTarget.style.boxShadow = '0 0 40px rgba(255,107,53,0.15), 0 20px 40px rgba(0,0,0,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = unlocked ? '0 0 30px rgba(255,107,53,0.08), 0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.3)')}>
                  {unlocked && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '50%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.6), transparent)' }} />}
                  <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14, background: unlocked ? 'rgba(255,107,53,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${unlocked ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.05)'}`, boxShadow: unlocked ? '0 8px 20px rgba(0,0,0,0.3)' : 'none' }}>
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
              
              {/* Topic Mastery Radar Chart */}
              <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px 28px', gridColumn: '1 / -1', boxShadow: '0 20px 48px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '30%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.4), transparent)' }} />
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 10, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Topic Mastery</div>
                <TopicRadarChart data={masteryData} />
              </div>

              <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px 28px', boxShadow: '0 20px 48px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 20, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Performance</div>
                {[
                  { label: 'Wins', val: wins, total: total || 1, color: '#22c55e' },
                  { label: 'Losses', val: losses, total: total || 1, color: '#ef4444' },
                  { label: 'Easy Wins', val: easyWins, total: total || 1, color: '#22c55e' },
                  { label: 'Medium Wins', val: medWins, total: total || 1, color: '#fb923c' },
                  { label: 'Hard Wins', val: hardWins, total: total || 1, color: '#ef4444' },
                ].map(({ label, val, total, color }) => (
                  <div key={label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                      <span style={{ color: '#666', fontWeight: 500 }}>{label}</span>
                      <span style={{ color, fontWeight: 800, fontFamily: 'JetBrains Mono' }}>{val}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', height: 5, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: `linear-gradient(90deg, ${color}80, ${color})`, width: `${(val/total)*100}%`, borderRadius: 10, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: `0 0 8px ${color}40` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px 28px', boxShadow: '0 20px 48px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 20, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>Account</div>
                {[
                  { label: 'Username', val: username },
                  { label: 'Email', val: user?.email || '-' },
                  { label: 'Status', val: user?.isVerified ? '✓ Verified' : '✗ Unverified' },
                  { label: 'Current ELO', val: `${elo} (${tier.icon} ${tier.name})` },
                  { label: 'Peak ELO', val: `📈 ${Math.max(peakElo, elo)}` },
                  { label: 'Puzzle XP', val: `🧩 ${user?.puzzleXp || 0}` },
                  { label: 'Win Rate', val: `${winRate}%` },
                  { label: 'Joined', val: new Date(user?.createdAt || Date.now()).toLocaleDateString() },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.035)', fontSize: 13 }}>
                    <span style={{ color: '#555', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: '#e5e5e5', fontWeight: 600, fontFamily: label === 'Current ELO' || label === 'Peak ELO' || label === 'Win Rate' ? 'JetBrains Mono, monospace' : 'inherit' }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(18, 18, 22, 0.65)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 24, padding: '24px 28px', gridColumn: '1 / -1', boxShadow: '0 20px 48px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '30%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.4), transparent)' }} />
                <div style={{ fontWeight: 800, color: '#fff', marginBottom: 20, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' }}>ELO History</div>
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
      
      <style>{`
        /* Background breathing animations */
        @keyframes pulseGlow {
          0% { transform: scale(1) translate(0, 0); opacity: 0.6; }
          50% { transform: scale(1.1) translate(-20px, 20px); opacity: 0.9; }
          100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
        }
        .ambient-glow-1 {
          animation: pulseGlow 8s infinite alternate ease-in-out;
        }
        .ambient-glow-2 {
          animation: pulseGlow 12s infinite alternate-reverse ease-in-out;
        }

        /* Sidebar card hover */
        .profile-sidebar > div {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-sidebar > div:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
          background: rgba(22, 22, 26, 0.75) !important;
        }

        /* Right side cards hover */
        .profile-content > div {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .profile-content > div:hover {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        /* Stat cards inner hover */
        .stat-card {
          transition: all 0.2s !important;
        }
        .stat-card:hover {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(255,255,255,0.1) !important;
        }

        /* Battle history rows */
        .profile-container [style*="borderBottom: '1px solid rgba(255,255,255"] {
          transition: background 0.2s ease;
        }

        @media (max-width: 900px) {
          .profile-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}