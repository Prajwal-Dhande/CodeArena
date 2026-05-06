import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar, Cell, PieChart, Pie
} from 'recharts'
import API_URL from '../config/api'
import { ThemeToggle } from '../context/ThemeContext'

const RANK_META = {
  Bronze:      { color: '#cd7f32', bg: 'rgba(205,127,50,0.1)',  icon: '🥉', next: 'Silver'   },
  Silver:      { color: '#aaa9ad', bg: 'rgba(170,169,173,0.1)', icon: '🥈', next: 'Gold'     },
  Gold:        { color: '#ffd700', bg: 'rgba(255,215,0,0.1)',   icon: '🥇', next: 'Platinum' },
  Platinum:    { color: '#00c8ff', bg: 'rgba(0,200,255,0.1)',   icon: '💎', next: 'Diamond'  },
  Diamond:     { color: '#a855f7', bg: 'rgba(168,85,247,0.1)',  icon: '💠', next: 'Master'   },
  Master:      { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  icon: '👑', next: 'Grandmaster' },
  Grandmaster: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '🔥', next: null        },
}

const StatCard = ({ label, value, sub, color = '#a855f7', icon }) => (
  <div style={{
    background: 'var(--card-bg)', border: `1px solid ${color}22`,
    borderRadius: 16, padding: '20px 22px',
    display: 'flex', flexDirection: 'column', gap: 6,
    boxShadow: `0 4px 24px ${color}11`
  }}>
    <div style={{ fontSize: 22, marginBottom: 2 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: 'Outfit', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
  </div>
)

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' }}>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1a24', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function PremiumDashboard() {
  const navigate  = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/auth'); return }
    fetch(`${API_URL}/api/users/premium-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (r.status === 401) { localStorage.clear(); navigate('/auth') } return r.json() })
      .then(d => { if (d.success) setData(d); else setError(d.message) })
      .catch(() => setError('Could not load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <div style={{ color: 'var(--text-muted)', fontSize: 14, fontFamily: 'Inter' }}>Loading your dashboard...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontFamily: 'Inter' }}>
      {error}
    </div>
  )

  const { stats, weeklyData, difficultyMap, eloHistory, recentMatches } = data
  const rank       = RANK_META[stats.rank] || RANK_META['Bronze']
  const diffData   = [
    { name: 'Easy',   value: difficultyMap.Easy,   color: '#22c55e' },
    { name: 'Medium', value: difficultyMap.Medium, color: '#fbbf24' },
    { name: 'Hard',   value: difficultyMap.Hard,   color: '#ef4444' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', fontFamily: 'Inter, sans-serif', color: 'var(--text-main)' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(15,15,20,0.98))', borderBottom: '1px solid rgba(168,85,247,0.12)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/lobby')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: 'Outfit' }}>
              <span style={{ color: '#a855f7' }}>Premium</span> Dashboard
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>@{stats.username} • AI-powered performance analytics</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: rank.bg, border: `1px solid ${rank.color}44`, borderRadius: 12, padding: '8px 16px' }}>
          <span style={{ fontSize: 20 }}>{rank.icon}</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: rank.color, fontFamily: 'Outfit' }}>{stats.rank}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stats.elo} ELO</div>
          </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Row 1: Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
          <StatCard icon="⚡" label="Current ELO"    value={stats.elo}          sub={`Peak: ${stats.peakElo}`}        color="#a855f7" />
          <StatCard icon="🏆" label="Total Wins"     value={stats.wins}         sub={`${stats.winRate}% win rate`}    color="#22c55e" />
          <StatCard icon="💀" label="Losses"         value={stats.losses}       sub={`${stats.totalBattles} battles`} color="#ef4444" />
          <StatCard icon="🔥" label="Win Streak"     value={stats.streak}       sub={`Best: ${stats.maxStreak}`}      color="#f97316" />
          <StatCard icon="📚" label="Problems Solved" value={stats.solvedCount} sub="DSA problems"                   color="#60a5fa" />
          <StatCard icon="🎯" label="Win Rate"       value={`${stats.winRate}%`} sub={`${stats.totalBattles} played`} color="#fbbf24" />
        </div>

        {/* ── Row 2: Weekly Bar + ELO Line ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Weekly Performance */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <SectionTitle>📅 Weekly Performance</SectionTitle>
            {weeklyData.every(d => d.wins === 0 && d.losses === 0) ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>No battles this week — go fight! ⚔️</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barGap={4}>
                  <XAxis dataKey="day" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="wins"   name="Wins"   fill="#22c55e" radius={[4,4,0,0]} />
                  <Bar dataKey="losses" name="Losses" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ELO History */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <SectionTitle>📈 ELO History (30 days)</SectionTitle>
            {eloHistory.length < 2 ? (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>Play more battles to see your ELO trend!</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={eloHistory}>
                  <defs>
                    <linearGradient id="eloGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="elo" name="ELO" stroke="#a855f7" strokeWidth={2} fill="url(#eloGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Row 3: Difficulty Pie + Streak Card + Recent Matches ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, marginBottom: 24 }}>
          {/* Difficulty Pie */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SectionTitle>🎯 Difficulty Mix</SectionTitle>
            {diffData.every(d => d.value === 0) ? (
              <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 12 }}>No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={diffData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {diffData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', marginTop: 8 }}>
              {diffData.map(d => (
                <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: '#888' }}>{d.name}</span>
                  </div>
                  <span style={{ color: d.color, fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Matches */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px' }}>
            <SectionTitle>⚔️ Recent Battles</SectionTitle>
            {recentMatches.length === 0 ? (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: 13 }}>No battles yet — start fighting!</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recentMatches.map((m, i) => (
                  <div key={i} style={{
                    background: m.result === 'win' ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                    border: `1px solid ${m.result === 'win' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}`,
                    borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 18 }}>{m.result === 'win' ? '🏆' : '💀'}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#ddd' }}>{m.problem || 'Unknown Problem'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>vs {m.opponent} • {m.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                        background: m.difficulty === 'Easy' ? 'rgba(34,197,94,0.12)' : m.difficulty === 'Hard' ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.12)',
                        color: m.difficulty === 'Easy' ? '#22c55e' : m.difficulty === 'Hard' ? '#ef4444' : '#fbbf24'
                      }}>{m.difficulty || 'Med'}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: (m.eloChange >= 0) ? '#22c55e' : '#ef4444', fontFamily: 'Outfit' }}>
                        {m.eloChange >= 0 ? '+' : ''}{m.eloChange} ELO
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Row 4: Streak Heatmap ── */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', marginBottom: 24 }}>
          <SectionTitle>🔥 Activity Heatmap (Last 28 days)</SectionTitle>
          <ActivityHeatmap matchHistory={data.recentMatches} />
        </div>

        {/* ── Row 5: MAANG Readiness ── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.06), rgba(10,10,15,0.98))', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 20, padding: '28px' }}>
          <SectionTitle>🏢 MAANG Readiness Score</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { company: 'Google',    score: Math.min(100, Math.round(stats.winRate * 0.6 + stats.solvedCount * 0.8)), color: '#4285f4', emoji: '🔵' },
              { company: 'Amazon',    score: Math.min(100, Math.round(stats.winRate * 0.5 + stats.totalBattles * 1.2)), color: '#ff9900', emoji: '🟠' },
              { company: 'Microsoft', score: Math.min(100, Math.round(stats.winRate * 0.7 + stats.solvedCount * 0.6)), color: '#00a4ef', emoji: '🔷' },
              { company: 'Meta',      score: Math.min(100, Math.round(stats.winRate * 0.65 + stats.maxStreak * 3)),    color: '#0866ff', emoji: '🔹' },
              { company: 'Apple',     score: Math.min(100, Math.round(stats.winRate * 0.55 + stats.solvedCount * 0.9)), color: '#888', emoji: '🍎' },
            ].map(({ company, score, color, emoji }) => (
              <div key={company} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{emoji} {company}</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'Outfit' }}>{score}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

// Simple Activity Heatmap (last 28 days grid)
function ActivityHeatmap({ matchHistory }) {
  // Build a map of date → battle count (use all match history from stats)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const days = []
  for (let d = 27; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    days.push(date.toDateString())
  }
  // We don't have full history here, use recentMatches as approximation
  const actMap = {}
  ;(matchHistory || []).forEach(m => {
    const k = new Date(m.date || Date.now()).toDateString()
    actMap[k] = (actMap[k] || 0) + 1
  })
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {days.map((day, i) => {
        const count = actMap[day] || 0
        const intensity = count === 0 ? 0 : count === 1 ? 0.3 : count <= 3 ? 0.6 : 1
        return (
          <div key={i} title={`${day}: ${count} battle${count !== 1 ? 's' : ''}`} style={{
            width: 24, height: 24, borderRadius: 5,
            background: count === 0 ? 'rgba(255,255,255,0.04)' : `rgba(168,85,247,${intensity})`,
            border: '1px solid rgba(255,255,255,0.04)', cursor: 'default', transition: 'transform 0.1s'
          }} />
        )
      })}
    </div>
  )
}
