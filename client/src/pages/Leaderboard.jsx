import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const FLAGS = { IN: '🇮🇳', US: '🇺🇸', CN: '🇨🇳', DE: '🇩🇪', JP: '🇯🇵', BR: '🇧🇷', UK: '🇬🇧', CA: '🇨🇦', KR: '🇰🇷' }
const TABS = ['Global', 'Weekly', 'Monthly', 'Friends']

export default function Leaderboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Global')
  const [search, setSearch] = useState('')
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [animatedElos, setAnimatedElos] = useState({})
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // 🔥 Fetch Real Leaderboard from Database 🔥
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/leaderboard')
        const data = await res.json()
        if (data.success) {
          setPlayers(data.leaderboard)
          
          // ELO Animation Logic
          const timeouts = []
          data.leaderboard.forEach((p, i) => {
            const t = setTimeout(() => {
              setAnimatedElos(prev => ({ ...prev, [p.rank]: p.elo }))
            }, i * 100) 
            timeouts.push(t)
          })
        }
      } catch (err) {
        console.error("Error fetching leaderboard", err)
      }
      setLoading(false)
    }
    
    fetchLeaderboard()
  }, [])

  const filtered = players.filter(p =>
    p.username.toLowerCase().includes(search.toLowerCase())
  )

  const top3 = players.slice(0, 3)

  return (
    <div className="lb-wrapper">
      <div className="bg-glow orange-glow" />
      <div className="bg-glow purple-glow" />

      <nav className="glass-nav">
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35' }}>Code</span><span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div className="nav-divider" />
        <span className="nav-subtitle">Leaderboard</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate('/lobby')} className="btn-battle-now">
          ⚡ Battle Now
        </button>
      </nav>

      <div className="lb-container">
        <div className="lb-header">
          <span className="section-tag">HALL OF FAME</span>
          <h1 className="page-title text-gradient">Global Rankings</h1>
          <p className="page-subtitle">Top coders ranked by ELO rating. Updated after every battle.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#ff6b35' }}>Loading Rankings...</div>
        ) : (
          <>
            {/* TOP 3 PODIUM */}
            {top3.length >= 3 && (
              <div className="podium-container">
                <div className="podium-card place-2">
                  <div className="medal">🥈</div>
                  <div className="podium-avatar silver-bg">{top3[1]?.username?.slice(0, 2).toUpperCase()}</div>
                  <div className="podium-name">{top3[1]?.username}</div>
                  <div className="podium-elo silver-text">{animatedElos[2] || 0}</div>
                  <div className="podium-label">ELO</div>
                  <div className="podium-stats">
                    <span className="text-green font-semibold">W: {top3[1]?.wins}</span>
                    <span className="text-red font-semibold">L: {top3[1]?.losses}</span>
                  </div>
                </div>

                <div className="podium-card place-1">
                  <div className="crown-badge">👑 #1</div>
                  <div className="medal lg">🏆</div>
                  <div className="podium-avatar gold-bg lg-avatar">{top3[0]?.username?.slice(0, 2).toUpperCase()}</div>
                  <div className="podium-name lg-name">{top3[0]?.username}</div>
                  <div className="podium-elo gold-text lg-elo">{animatedElos[1] || 0}</div>
                  <div className="podium-label">ELO</div>
                  <div className="podium-stats lg-stats">
                    <span className="text-green font-bold">W: {top3[0]?.wins}</span>
                    <span className="text-red font-bold">L: {top3[0]?.losses}</span>
                    <span className="text-orange font-bold">🔥 {top3[0]?.streak}</span>
                  </div>
                </div>

                <div className="podium-card place-3">
                  <div className="medal">🥉</div>
                  <div className="podium-avatar bronze-bg">{top3[2]?.username?.slice(0, 2).toUpperCase()}</div>
                  <div className="podium-name">{top3[2]?.username}</div>
                  <div className="podium-elo bronze-text">{animatedElos[3] || 0}</div>
                  <div className="podium-label">ELO</div>
                  <div className="podium-stats">
                    <span className="text-green font-semibold">W: {top3[2]?.wins}</span>
                    <span className="text-red font-semibold">L: {top3[2]?.losses}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="lb-controls">
              <div className="tab-container">
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)} className={`tab-btn ${tab === t ? 'active' : ''}`}>{t}</button>
                ))}
              </div>
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input placeholder="Search player..." value={search} onChange={e => setSearch(e.target.value)} className="search-input"/>
              </div>
            </div>

            <div className="table-container glass-panel">
              <div className="table-header">
                {['RANK', 'PLAYER', 'ELO', 'WINS', 'WIN RATE', 'STREAK', 'CHANGE'].map(h => <div key={h}>{h}</div>)}
              </div>

              <div className="table-body">
                {filtered.map((player) => {
                  const isMe = player.username === currentUser.username;
                  return (
                  <div key={player.rank} className={`table-row ${isMe ? 'is-me' : ''}`}>
                    <div className="col-rank">
                      {player.rank <= 3 ? <span className="rank-badge-icon">{player.badge}</span> : <span className="rank-num">#{player.rank}</span>}
                    </div>
                    <div className="col-player">
                      <div className={`row-avatar ${isMe ? 'me-bg' : 'normal-bg'}`}>{player.username.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className={`row-name ${isMe ? 'text-orange' : ''}`}>
                          {player.username} {isMe && <span className="me-badge">YOU</span>}
                        </div>
                        <div className="row-country">{FLAGS[player.country] || '🌐'} {player.country}</div>
                      </div>
                    </div>
                    <div className={`col-elo ${player.rank === 1 ? 'gold-text' : player.rank === 2 ? 'silver-text' : player.rank === 3 ? 'bronze-text' : ''}`}>
                      {animatedElos[player.rank] || player.elo}
                    </div>
                    <div className="col-wins">
                      <span className="text-green font-bold">{player.wins}</span>
                      <span className="total-games"> / {player.wins + player.losses}</span>
                    </div>
                    <div className="col-winrate">
                      <div className="wr-text">{player.winRate}%</div>
                      <div className="wr-bar-bg"><div className={`wr-bar-fill ${player.winRate >= 80 ? 'bg-green' : player.winRate >= 65 ? 'bg-orange' : 'bg-red'}`} style={{ width: `${player.winRate}%` }} /></div>
                    </div>
                    <div className={`col-streak ${player.streak >= 5 ? 'text-orange' : player.streak > 0 ? 'text-main' : 'text-muted'}`}>
                      {player.streak > 0 ? `🔥 ${player.streak}` : '—'}
                    </div>
                    <div className="col-change font-bold text-muted">{player.change === '0' ? '—' : player.change}</div>
                  </div>
                )})}
              </div>
            </div>
            
            {/* My Rank Callout */}
            {players.some(p => p.username === currentUser.username) && (
              <div className="my-rank-callout glass-panel">
                <div className="callout-left">
                  <div className="callout-avatar">{currentUser.username.slice(0,1).toUpperCase()}</div>
                  <div>
                    <div className="callout-title">Your current rank: <span className="text-white">#{players.find(p => p.username === currentUser.username)?.rank}</span></div>
                    <div className="callout-desc">Keep battling to climb the Global Leaderboard!</div>
                  </div>
                </div>
                <button onClick={() => navigate('/lobby')} className="btn-climb">⚡ Battle to Climb</button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        :root {
          --bg-dark: #09090b; --panel-bg: rgba(20, 20, 25, 0.6); --glass-border: rgba(255, 255, 255, 0.08);
          --orange: #ff6b35; --purple: #a855f7; --green: #22c55e; --red: #ef4444;
          --gold: #fbbf24; --silver: #9ca3af; --bronze: #d97706;
          --text-main: #f8fafc; --text-muted: #9ca3af;
        }
        .lb-wrapper { min-height: 100vh; background: var(--bg-dark); color: var(--text-main); font-family: Inter, sans-serif; position: relative; overflow: hidden; }
        .bg-glow { position: fixed; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(140px); z-index: 0; pointer-events: none; opacity: 0.12; }
        .orange-glow { top: -20%; right: -10%; background: radial-gradient(circle, #ff6b35 0%, transparent 60%); }
        .purple-glow { bottom: -20%; left: -10%; background: radial-gradient(circle, #a855f7 0%, transparent 60%); opacity: 0.08; }
        .glass-nav { height: 60px; background: rgba(9, 9, 11, 0.7); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; padding: 0 28px; gap: 16px; position: sticky; top: 0; z-index: 50; }
        .logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 18px; cursor: pointer; letter-spacing: -0.5px; }
        .nav-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }
        .nav-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .btn-battle-now { background: linear-gradient(135deg, var(--orange), #f7451d); color: #fff; border: none; padding: 6px 18px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(255,107,53,0.2); }
        .btn-battle-now:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,53,0.4); }
        .lb-container { max-width: 1000px; margin: 0 auto; padding: 40px 24px 80px; position: relative; z-index: 10; }
        .lb-header { text-align: center; margin-bottom: 48px; }
        .section-tag { font-size: 11px; font-weight: 700; color: var(--orange); letter-spacing: 2px; margin-bottom: 12px; display: inline-block; background: rgba(255,107,53,0.1); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,107,53,0.2); }
        .page-title { font-family: Outfit, sans-serif; font-weight: 900; font-size: clamp(2rem, 4vw, 3.5rem); margin: 0 0 12px 0; letter-spacing: -1px; }
        .text-gradient { background: linear-gradient(90deg, var(--orange), #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .page-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
        .podium-container { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 16px; margin-bottom: 48px; align-items: end; }
        .podium-card { background: var(--panel-bg); border: 1px solid var(--glass-border); border-radius: 16px; padding: 24px 16px; text-align: center; backdrop-filter: blur(12px); transition: transform 0.3s ease, border-color 0.3s ease; position: relative; }
        .podium-card:hover { transform: translateY(-5px); }
        .place-1 { padding: 32px 20px; border-color: rgba(251, 191, 36, 0.4); box-shadow: 0 10px 40px rgba(251, 191, 36, 0.1), inset 0 0 20px rgba(251, 191, 36, 0.05); z-index: 2; margin-bottom: 10px; }
        .place-1:hover { border-color: rgba(251, 191, 36, 0.8); box-shadow: 0 15px 50px rgba(251, 191, 36, 0.2); }
        .place-2 { border-color: rgba(156, 163, 175, 0.3); }
        .place-2:hover { border-color: rgba(156, 163, 175, 0.6); }
        .place-3 { border-color: rgba(217, 119, 6, 0.3); }
        .place-3:hover { border-color: rgba(217, 119, 6, 0.6); }
        .crown-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, var(--orange), #fbbf24); color: #000; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 6px; letter-spacing: 1px; box-shadow: 0 4px 10px rgba(251, 191, 36, 0.4); }
        .medal { font-size: 32px; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); }
        .medal.lg { font-size: 42px; }
        .podium-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-family: Outfit, sans-serif; font-weight: 800; font-size: 16px; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .podium-avatar.lg-avatar { width: 64px; height: 64px; font-size: 20px; }
        .gold-bg { background: linear-gradient(135deg, #f59e0b, #d97706); border: 2px solid #fef3c7; }
        .silver-bg { background: linear-gradient(135deg, #9ca3af, #4b5563); border: 2px solid #f3f4f6; }
        .bronze-bg { background: linear-gradient(135deg, #d97706, #92400e); border: 2px solid #fde68a; }
        .podium-name { font-family: Outfit, sans-serif; font-weight: 700; font-size: 15px; color: #fff; margin-bottom: 4px; }
        .podium-name.lg-name { font-size: 18px; }
        .podium-elo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 22px; margin-bottom: 2px; }
        .podium-elo.lg-elo { font-size: 32px; }
        .gold-text { color: var(--gold); text-shadow: 0 0 10px rgba(251, 191, 36, 0.4); }
        .silver-text { color: var(--silver); }
        .bronze-text { color: var(--bronze); }
        .podium-label { font-size: 10px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px; margin-bottom: 12px; }
        .podium-stats { display: flex; justify-content: center; gap: 12px; font-size: 11px; }
        .podium-stats.lg-stats { gap: 16px; font-size: 12px; }
        .text-green { color: var(--green); } .text-red { color: var(--red); } .text-orange { color: var(--orange); } .text-white { color: #fff; } .text-main { color: var(--text-main); } .text-muted { color: var(--text-muted); }
        .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
        .bg-green { background: var(--green); } .bg-orange { background: var(--orange); } .bg-red { background: var(--red); }
        .lb-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 16px; }
        .tab-container { display: flex; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 12px; padding: 6px; backdrop-filter: blur(10px); }
        .tab-btn { padding: 8px 20px; font-size: 13px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { background: rgba(255,255,255,0.08); color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; }
        .search-input { background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 10px; padding: 10px 16px 10px 38px; font-size: 13px; color: #fff; outline: none; width: 240px; font-family: Inter, sans-serif; transition: all 0.2s; backdrop-filter: blur(10px); }
        .search-input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(255,107,53,0.1); }
        .glass-panel { background: var(--panel-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: 16px; overflow: hidden; }
        .table-header { display: grid; grid-template-columns: 60px 1fr 100px 100px 120px 80px 80px; padding: 16px 24px; background: rgba(0,0,0,0.4); border-bottom: 1px solid var(--glass-border); font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; }
        .table-row { display: grid; grid-template-columns: 60px 1fr 100px 100px 120px 80px 80px; padding: 16px 24px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s; cursor: pointer; }
        .table-row:hover { background: rgba(255,255,255,0.03); }
        .table-row:last-child { border-bottom: none; }
        .table-row.is-me { background: rgba(255,107,53,0.05); border-left: 3px solid var(--orange); border-bottom: 1px solid rgba(255,107,53,0.1); }
        .table-row.is-me:hover { background: rgba(255,107,53,0.08); }
        .col-rank { display: flex; align-items: center; }
        .rank-badge-icon { font-size: 18px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
        .rank-num { font-family: Outfit, sans-serif; font-weight: 700; font-size: 15px; color: var(--text-muted); }
        .col-player { display: flex; align-items: center; gap: 12px; }
        .row-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .normal-bg { background: linear-gradient(135deg, #374151, #1f2937); border: 1px solid #4b5563; }
        .me-bg { background: linear-gradient(135deg, var(--orange), #ea580c); border: 1px solid #ffedd5; }
        .row-name { font-size: 14px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
        .me-badge { font-size: 10px; font-weight: 700; background: rgba(255,107,53,0.15); color: var(--orange); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255,107,53,0.3); }
        .row-country { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
        .col-elo { font-family: Outfit, sans-serif; font-weight: 800; font-size: 18px; }
        .col-wins { font-size: 14px; }
        .total-games { color: var(--text-muted); font-size: 12px; font-weight: 500; }
        .col-winrate { padding-right: 20px; }
        .wr-text { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .wr-bar-bg { background: rgba(0,0,0,0.4); height: 4px; border-radius: 2px; overflow: hidden; }
        .wr-bar-fill { height: 100%; border-radius: 2px; }
        .col-streak { font-size: 13px; font-weight: 600; }
        .col-change { font-size: 13px; }
        .my-rank-callout { margin-top: 24px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; border-color: rgba(255,107,53,0.2); background: linear-gradient(90deg, rgba(20,20,25,0.8), rgba(255,107,53,0.05)); }
        .callout-left { display: flex; align-items: center; gap: 16px; }
        .callout-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--orange), #ea580c); display: flex; align-items: center; justify-content: center; font-family: Outfit, sans-serif; font-weight: 800; font-size: 16px; color: #fff; box-shadow: 0 4px 15px rgba(255,107,53,0.3); }
        .callout-title { font-size: 14px; font-weight: 600; color: var(--orange); margin-bottom: 4px; }
        .callout-desc { font-size: 12px; color: var(--text-muted); }
        .btn-climb { background: linear-gradient(135deg, var(--orange), #ea580c); color: #fff; border: none; border-radius: 10px; padding: 12px 24px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,107,53,0.3); }
        .btn-climb:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,53,0.5); }
        @media (max-width: 900px) {
          .podium-container { grid-template-columns: 1fr; gap: 24px; }
          .place-1 { order: -1; }
          .table-header, .table-row { grid-template-columns: 50px 1fr 80px; padding: 16px; }
          .table-header div:nth-child(n+4), .table-row div:nth-child(n+4) { display: none; }
          .lb-controls { flex-direction: column; align-items: stretch; }
          .search-input { width: 100%; }
        }
      `}</style>
    </div>
  )
}