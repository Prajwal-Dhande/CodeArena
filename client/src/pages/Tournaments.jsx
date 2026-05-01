import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_URL from '../config/api'

const TIER_META = {
  open:     { label: 'OPEN',     color: '#22c55e', bg: 'rgba(34,197,94,0.1)',    icon: '🌐', glow: 'rgba(34,197,94,0.2)'   },
  pro:      { label: 'PRO',      color: '#a855f7', bg: 'rgba(168,85,247,0.1)',   icon: '💎', glow: 'rgba(168,85,247,0.2)'  },
  'pro-plus': { label: 'PRO+',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',   icon: '👑', glow: 'rgba(249,115,22,0.2)'  },
}

const STATUS_META = {
  upcoming:  { label: 'UPCOMING',  color: '#60a5fa', dot: '#60a5fa'  },
  active:    { label: 'LIVE 🔴',   color: '#22c55e', dot: '#22c55e'  },
  completed: { label: 'ENDED',     color: '#555',    dot: '#444'     },
}

const DIFF_COLOR = { Easy: '#22c55e', Medium: '#fbbf24', Hard: '#ef4444' }

function CountdownTimer({ startsAt, status }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    if (status !== 'upcoming') { setTimeLeft(''); return }
    const tick = () => {
      const diff = new Date(startsAt) - Date.now()
      if (diff <= 0) { setTimeLeft('Starting now!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startsAt, status])
  return timeLeft ? (
    <span style={{ fontSize: 12, color: '#60a5fa', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
      ⏱ {timeLeft}
    </span>
  ) : null
}

function TournamentCard({ t, user, onJoin, joining }) {
  const tier   = TIER_META[t.tier]    || TIER_META.open
  const status = STATUS_META[t.status] || STATUS_META.upcoming
  const slots  = t.maxSlots - (t.participants?.length || 0)
  const alreadyJoined = t.participants?.some(p => p.username === user?.username)
  const isPremiumRequired = t.tier !== 'open' && !user?.isPremium

  return (
    <div style={{
      background: '#0f0f14', border: `1px solid ${tier.color}22`,
      borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden',
      boxShadow: `0 4px 32px ${tier.glow}`, transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Glow strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${tier.color}88, ${tier.color})` }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ background: tier.bg, color: tier.color, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6, letterSpacing: 1 }}>
              {tier.icon} {tier.label}
            </span>
            <span style={{ background: status.color + '18', color: status.color, fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6 }}>
              {status.label}
            </span>
            {t.difficulty && (
              <span style={{ color: DIFF_COLOR[t.difficulty] || '#aaa', fontSize: 10, fontWeight: 700 }}>
                {t.difficulty}
              </span>
            )}
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', fontFamily: 'Outfit', lineHeight: 1.3 }}>{t.title}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.5 }}>{t.description}</div>
        </div>
      </div>

      {/* Prize pool */}
      <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#fbbf24' }}>
        🎁 {t.prizePool}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: '#555' }}>
          <span style={{ color: '#888' }}>Problem: </span>
          <span style={{ color: '#aaa', fontWeight: 600 }}>{t.problem}</span>
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>
          <span style={{ color: '#888' }}>Slots: </span>
          <span style={{ color: slots > 0 ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
            {t.participants?.length || 0}/{t.maxSlots}
          </span>
        </div>
        <CountdownTimer startsAt={t.startsAt} status={t.status} />
      </div>

      {/* Slot bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2, transition: 'width 0.6s ease',
          width: `${Math.min(100, ((t.participants?.length || 0) / t.maxSlots) * 100)}%`,
          background: slots === 0 ? '#ef4444' : tier.color
        }} />
      </div>

      {/* Action button */}
      {t.status === 'completed' ? (
        <button disabled style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #222', background: 'transparent', color: '#444', fontSize: 13, fontWeight: 700, cursor: 'not-allowed' }}>
          Tournament Ended
        </button>
      ) : alreadyJoined ? (
        <button disabled style={{ width: '100%', padding: '11px', borderRadius: 10, border: `1px solid ${tier.color}44`, background: tier.bg, color: tier.color, fontSize: 13, fontWeight: 800, cursor: 'not-allowed' }}>
          ✅ Registered
        </button>
      ) : isPremiumRequired ? (
        <button onClick={() => window.location.href = '/premium'} style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg, #f97316, #ec4899)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          🔒 Upgrade to Join
        </button>
      ) : slots <= 0 ? (
        <button disabled style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid #333', background: 'transparent', color: '#555', fontSize: 13, fontWeight: 700, cursor: 'not-allowed' }}>
          Tournament Full
        </button>
      ) : (
        <button
          onClick={() => onJoin(t._id)}
          disabled={joining === t._id}
          style={{ width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: joining === t._id ? 'rgba(168,85,247,0.3)' : `linear-gradient(90deg, ${tier.color}cc, ${tier.color})`, color: '#fff', fontSize: 13, fontWeight: 800, cursor: joining === t._id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
          {joining === t._id
            ? <><span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Registering...</>
            : `${tier.icon} Join Tournament`}
        </button>
      )}
    </div>
  )
}

export default function Tournaments() {
  const navigate   = useNavigate()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [joining, setJoining]         = useState(null)
  const [toast, setToast]             = useState(null)
  const [filter, setFilter]           = useState('all')
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}') } catch { return {} } })()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchTournaments = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/tournaments`)
      const data = await res.json()
      if (data.success) setTournaments(data.tournaments)
    } catch { showToast('Could not load tournaments', 'error') }
    setLoading(false)
  }

  useEffect(() => { fetchTournaments() }, [])

  const handleJoin = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/auth'); return }
    setJoining(id)
    try {
      const res  = await fetch(`${API_URL}/api/tournaments/join/${id}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        showToast(data.message || 'Registered! 🎉')
        fetchTournaments()
      } else {
        showToast(data.message || 'Registration failed', 'error')
      }
    } catch { showToast('Network error', 'error') }
    setJoining(null)
  }

  const filtered = tournaments.filter(t => filter === 'all' || t.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#080810', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(8,8,16,0.98))', borderBottom: '1px solid rgba(168,85,247,0.12)', padding: '20px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => navigate('/lobby')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#aaa', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Outfit' }}>
                🏆 <span style={{ color: '#a855f7' }}>Ranked</span> Tournaments
              </div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>Compete. Climb. Conquer MAANG.</div>
            </div>
          </div>
          {!user?.isPremium && (
            <button onClick={() => navigate('/premium')} style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 18px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
              💎 Upgrade to Pro
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['all', 'active', 'upcoming', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${filter === f ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}`,
              color: filter === f ? '#a855f7' : '#666', borderRadius: 8, padding: '6px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s'
            }}>{f === 'all' ? '🌐 All' : f === 'active' ? '🔴 Live' : f === 'upcoming' ? '⏳ Upcoming' : '✅ Ended'}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#444', alignSelf: 'center' }}>
            {filtered.length} tournament{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ color: '#444', fontSize: 13 }}>Loading tournaments...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#333' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#444' }}>No tournaments here yet</div>
            <div style={{ fontSize: 13 }}>Check back soon — new tournaments drop weekly!</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20, paddingBottom: 40 }}>
            {filtered.map(t => (
              <TournamentCard key={t._id} t={t} user={user} onJoin={handleJoin} joining={joining} />
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(34,197,94,0.95)',
          color: '#fff', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Inter:wght@400;600;700&display=swap');
      `}</style>
    </div>
  )
}
