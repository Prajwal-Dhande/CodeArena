import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async' 
import API_URL from '../config/api'
import { ThemeToggle } from '../context/ThemeContext'

// Load premium fonts
if (typeof document !== 'undefined') {
  const link = document.createElement('link')
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap'
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}

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

  // 🔥 Fetch Real Leaderboard from Database
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/leaderboard`)
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
  
  // ✅ Check Current User's Rank
  const myPlayer = players.find(p => p.username === currentUser.username)
  const myRank = myPlayer?.rank

  return (
    <div className="lb-wrapper">
      
      <Helmet>
        <title>Global Leaderboard | CodeArena Rankings</title>
        <meta name="description" content={`Check out the top-ranked coders on CodeArena. Current Grandmasters include ${top3[0]?.username || 'top players'} and more. Compete to get your name on the board!`} />
      </Helmet>

      {/* Premium Background Effects */}
      <div className="ambient-grid" />
      <div className="bg-glow orange-glow" />
      <div className="bg-glow purple-glow" />

      <nav className="glass-nav">
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35' }}>Code</span><span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div className="nav-divider" />
        <span className="nav-subtitle">Leaderboard</span>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
        <button onClick={() => navigate('/lobby')} className="btn-battle-now">
          ⚡ Battle Now
        </button>
      </nav>

      <div className="lb-container">
        <div className="lb-header animate-fade-in">
          <span className="section-tag">HALL OF FAME</span>
          <h1 className="page-title text-gradient">Global Rankings</h1>
          <p className="page-subtitle">Top coders ranked by ELO rating. Click on a player to view their profile.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Arena Rankings...</p>
          </div>
        ) : (
          <>
            {/* ✅ TOP 3 PODIUM - Now Clickable! */}
            {players.length > 0 && (
              <div className="podium-container">
                {/* 2nd Place */}
                <div 
                  className="podium-card place-2 animate-float-delay-1" 
                  onClick={() => top3[1] && navigate(`/profile/${top3[1].username}`)}
                  style={{ cursor: top3[1] ? 'pointer' : 'default' }}
                >
                  <div className="medal">🥈</div>
                  <div className="podium-avatar silver-bg">
                    {top3[1] ? top3[1].username.slice(0, 2).toUpperCase() : '?'}
                  </div>
                  <div className="podium-name">{top3[1] ? top3[1].username : 'TBD'}</div>
                  <div className="podium-elo silver-text">{top3[1] ? (animatedElos[2] || top3[1].elo) : '-'}</div>
                  <div className="podium-label">ELO RATING</div>
                  <div className="podium-stats">
                    {top3[1] ? (
                      <>
                        <span className="stat-pill bg-green-dim text-green">W: {top3[1].wins}</span>
                        <span className="stat-pill bg-red-dim text-red">L: {top3[1].losses}</span>
                      </>
                    ) : (
                      <span className="stat-pill text-muted">Waiting...</span>
                    )}
                  </div>
                </div>

                {/* 1st Place */}
                <div 
                  className="podium-card place-1 animate-float"
                  onClick={() => top3[0] && navigate(`/profile/${top3[0].username}`)}
                  style={{ cursor: top3[0] ? 'pointer' : 'default' }}
                >
                  <div className="crown-badge">
                    <span className="crown-icon">👑</span> GRANDMASTER
                  </div>
                  <div className="podium-avatar gold-bg lg-avatar">
                    {top3[0]?.username?.slice(0, 2).toUpperCase()}
                    <div className="avatar-ring"></div>
                  </div>
                  <div className="podium-name lg-name">{top3[0]?.username}</div>
                  <div className="podium-elo gold-text lg-elo">{animatedElos[1] || top3[0]?.elo || 0}</div>
                  <div className="podium-label">ELO RATING</div>
                  <div className="podium-stats lg-stats">
                    <span className="stat-pill bg-green-dim text-green">W: {top3[0]?.wins}</span>
                    <span className="stat-pill bg-red-dim text-red">L: {top3[0]?.losses}</span>
                    <span className="stat-pill bg-orange-dim text-orange">🔥 {top3[0]?.streak}</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div 
                  className="podium-card place-3 animate-float-delay-2"
                  onClick={() => top3[2] && navigate(`/profile/${top3[2].username}`)}
                  style={{ cursor: top3[2] ? 'pointer' : 'default' }}
                >
                  <div className="medal">🥉</div>
                  <div className="podium-avatar bronze-bg">
                    {top3[2] ? top3[2].username.slice(0, 2).toUpperCase() : '?'}
                  </div>
                  <div className="podium-name">{top3[2] ? top3[2].username : 'TBD'}</div>
                  <div className="podium-elo bronze-text">{top3[2] ? (animatedElos[3] || top3[2].elo) : '-'}</div>
                  <div className="podium-label">ELO RATING</div>
                  <div className="podium-stats">
                    {top3[2] ? (
                      <>
                        <span className="stat-pill bg-green-dim text-green">W: {top3[2].wins}</span>
                        <span className="stat-pill bg-red-dim text-red">L: {top3[2].losses}</span>
                      </>
                    ) : (
                      <span className="stat-pill text-muted">Waiting...</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="lb-controls animate-slide-up">
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
                {['RANK', 'PLAYER', 'ELO', 'PUZZLE XP', 'WINS', 'WIN RATE', 'STREAK'].map(h => <div key={h}>{h}</div>)}
              </div>

              <div className="table-body">
                {filtered.map((player, index) => {
                  const isMe = player.username === currentUser.username;
                  return (
                  <div 
                    key={player.rank} 
                    className={`table-row animate-row ${isMe ? 'is-me' : ''}`}
                    style={{ '--delay': `${index * 0.05}s` }}
                    onClick={() => navigate(`/profile/${player.username}`)} // 🔥 Row is now clickable
                  >
                    <div className="col-rank">
                      {player.rank <= 3 ? <span className="rank-badge-icon">{player.badge}</span> : <span className="rank-num">#{player.rank}</span>}
                    </div>
                    <div className="col-player">
                      <div className={`row-avatar ${isMe ? 'me-bg' : 'normal-bg'}`}>{player.username.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div className={`row-name ${isMe ? 'text-orange font-bold' : ''}`}>
                          {player.username} {isMe && <span className="me-badge">YOU</span>}
                        </div>
                        <div className="row-country">{FLAGS[player.country] || '🌐'} {player.country}</div>
                      </div>
                    </div>
                    <div className={`col-elo ${player.rank === 1 ? 'gold-text' : player.rank === 2 ? 'silver-text' : player.rank === 3 ? 'bronze-text' : ''}`}>
                      {animatedElos[player.rank] || player.elo}
                    </div>
                    <div className="col-xp font-bold" style={{ color: '#0ea5e9' }}>
                      {player.puzzleXp || 0} XP
                    </div>
                    <div className="col-wins">
                      <span className="text-green font-bold">{player.wins}</span>
                      <span className="total-games"> / {player.wins + player.losses}</span>
                    </div>
                    <div className="col-winrate">
                      <div className="wr-text">{player.winRate}%</div>
                      <div className="wr-bar-bg"><div className={`wr-bar-fill ${player.winRate >= 80 ? 'bg-green' : player.winRate >= 65 ? 'bg-orange' : 'bg-red'}`} style={{ width: `${player.winRate}%` }} /></div>
                    </div>
                    <div className={`col-streak ${player.streak >= 5 ? 'text-orange drop-shadow-glow' : player.streak > 0 ? 'text-main' : 'text-muted'}`}>
                      {player.streak > 0 ? `🔥 ${player.streak}` : '—'}
                    </div>
                  </div>
                )})}
              </div>
            </div>
            
            {myRank && myRank > 1 && (
              <div className="my-rank-callout glass-panel animate-pop-in">
                <div className="callout-left">
                  <div className="callout-avatar pulse-anim">{currentUser.username.slice(0,1).toUpperCase()}</div>
                  <div>
                    <div className="callout-title">Your current rank: <span className="text-white">#{myRank}</span></div>
                    <div className="callout-desc">Keep battling to climb the Global Leaderboard and reach #1!</div>
                  </div>
                </div>
                <button onClick={() => navigate('/lobby')} className="btn-climb">
                  ⚡ Battle to Climb
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        :root {
          --bg-dark: #030305; 
          --panel-bg: rgba(12, 12, 18, 0.7); 
          --glass-border: rgba(255, 255, 255, 0.06);
          --orange: #ff6b35; --purple: #a855f7; --green: #10b981; --red: #ef4444;
          --gold: #fbbf24; --silver: #9ca3af; --bronze: #d97706;
          --text-main: #f8fafc; --text-muted: #64748b;
        }

        /* ===== CINEMATIC BACKGROUND ===== */
        .ambient-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: 
            linear-gradient(rgba(255, 107, 53, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 107, 53, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
        }

        .lb-wrapper { 
          min-height: 100vh; 
          background: var(--bg-dark); 
          background-image: radial-gradient(ellipse 100% 80% at 50% -20%, rgba(255,107,53,0.08) 0%, transparent 50%);
          color: var(--text-main); font-family: Inter, sans-serif; position: relative; overflow: hidden; 
        }
        .bg-glow { position: fixed; width: 50vw; height: 50vw; border-radius: 50%; filter: blur(160px); z-index: 0; pointer-events: none; opacity: 0.12; animation: pulseGlow 10s infinite alternate; }
        .orange-glow { top: -30%; right: -15%; background: radial-gradient(circle, var(--orange) 0%, transparent 55%); }
        .purple-glow { bottom: -30%; left: -15%; background: radial-gradient(circle, var(--purple) 0%, transparent 55%); animation-delay: -5s; }

        /* ===== NAV — Frosted Premium ===== */
        .glass-nav { 
          height: 64px; 
          background: rgba(3, 3, 5, 0.6); 
          backdrop-filter: blur(30px) saturate(180%); 
          border-bottom: 1px solid rgba(255,255,255,0.04); 
          display: flex; align-items: center; padding: 0 32px; gap: 16px; 
          position: sticky; top: 0; z-index: 50; 
        }
        .logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 20px; cursor: pointer; letter-spacing: -0.5px; }
        .nav-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.08); }
        .nav-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 600; letter-spacing: 0.5px; }
        
        .btn-battle-now { 
          background: linear-gradient(135deg, var(--orange), #f7451d); 
          color: #fff; border: none; padding: 10px 24px; border-radius: 10px; 
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.3s; 
          box-shadow: 0 4px 20px rgba(255,107,53,0.3); text-transform: uppercase; letter-spacing: 1px; 
          font-family: Inter, sans-serif;
        }
        .btn-battle-now:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 8px 30px rgba(255,107,53,0.5); }
        
        /* ===== HEADER — Cinematic ===== */
        .lb-container { max-width: 1100px; margin: 0 auto; padding: 48px 24px 100px; position: relative; z-index: 10; }
        .lb-header { text-align: center; margin-bottom: 64px; }
        .section-tag { 
          font-size: 11px; font-weight: 800; color: var(--orange); letter-spacing: 4px; 
          margin-bottom: 20px; display: inline-block; 
          background: rgba(255,107,53,0.08); padding: 8px 20px; border-radius: 30px; 
          border: 1px solid rgba(255,107,53,0.15); text-transform: uppercase; 
        }
        .page-title { 
          font-family: Outfit, sans-serif; font-weight: 900; 
          font-size: clamp(2.8rem, 6vw, 4.5rem); margin: 0 0 16px 0; 
          letter-spacing: -2px; line-height: 1.05; 
        }
        .text-gradient { 
          background: linear-gradient(135deg, #fff 0%, #fff 40%, var(--orange) 100%); 
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; 
        }
        .page-subtitle { font-size: 16px; color: var(--text-muted); margin: 0; font-weight: 400; line-height: 1.6; }

        /* ===== PODIUM — God-Tier Glow ===== */
        .podium-container { 
          display: grid; grid-template-columns: 1fr 1.35fr 1fr; gap: 20px; 
          margin-bottom: 64px; align-items: end; perspective: 800px;
        }
        .podium-card { 
          background: rgba(10, 10, 15, 0.6); 
          border: 1px solid var(--glass-border); border-radius: 24px; 
          padding: 28px 20px; text-align: center; 
          backdrop-filter: blur(24px) saturate(150%); 
          position: relative; 
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }
        .podium-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 24px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 40%);
          pointer-events: none;
        }
        .podium-card:hover { transform: translateY(-12px) scale(1.03) !important; z-index: 10; border-color: rgba(255,255,255,0.2); }
        
        .place-1 { 
          padding: 48px 24px; 
          background: linear-gradient(180deg, rgba(251,191,36,0.12) 0%, rgba(10,10,15,0.85) 100%); 
          border: 1px solid rgba(251, 191, 36, 0.5); 
          box-shadow: 0 0 80px rgba(251, 191, 36, 0.12), 0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(251, 191, 36, 0.05); 
          z-index: 2; margin-bottom: 20px; 
        }
        .place-1::after {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 80%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.8), transparent);
        }
        .place-1:hover { 
          border-color: rgba(251, 191, 36, 0.9); 
          box-shadow: 0 0 100px rgba(251, 191, 36, 0.2), 0 30px 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(251, 191, 36, 0.08); 
        }
        .place-2 { 
          border-color: rgba(156, 163, 175, 0.25); 
          background: linear-gradient(180deg, rgba(156,163,175,0.06) 0%, rgba(10,10,15,0.85) 100%); 
          box-shadow: 0 0 40px rgba(156,163,175,0.05), 0 15px 40px rgba(0,0,0,0.4);
        }
        .place-2::after {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(156,163,175,0.5), transparent);
        }
        .place-3 { 
          border-color: rgba(217, 119, 6, 0.25); 
          background: linear-gradient(180deg, rgba(217,119,6,0.06) 0%, rgba(10,10,15,0.85) 100%); 
          box-shadow: 0 0 40px rgba(217,119,6,0.05), 0 15px 40px rgba(0,0,0,0.4);
        }
        .place-3::after {
          content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(217,119,6,0.5), transparent);
        }
        
        .crown-badge { 
          position: absolute; top: -14px; left: 50%; transform: translateX(-50%); 
          background: linear-gradient(135deg, #fcd34d, #f59e0b); color: #000; 
          font-size: 10px; font-weight: 900; padding: 6px 18px; border-radius: 20px; 
          letter-spacing: 1.5px; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.5); 
          display: flex; align-items: center; gap: 6px; white-space: nowrap;
        }
        .crown-icon { font-size: 13px; }
        .medal { font-size: 36px; margin-bottom: 16px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.6)); }
        
        .podium-avatar { 
          position: relative; width: 60px; height: 60px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          margin: 0 auto 16px; font-family: Outfit, sans-serif; font-weight: 800; 
          font-size: 20px; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.7); z-index: 1; 
        }
        .podium-avatar.lg-avatar { width: 84px; height: 84px; font-size: 28px; }
        .avatar-ring { 
          position: absolute; inset: -6px; border-radius: 50%; 
          border: 2px solid transparent;
          background: conic-gradient(from 0deg, rgba(251, 191, 36, 0.8), transparent, rgba(251, 191, 36, 0.8)) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: rotateRing 8s linear infinite; z-index: -1; 
        }
        
        .gold-bg { background: linear-gradient(135deg, #f59e0b, #b45309); border: 2px solid rgba(254,243,199,0.6); }
        .silver-bg { background: linear-gradient(135deg, #9ca3af, #374151); border: 2px solid rgba(243,244,246,0.4); }
        .bronze-bg { background: linear-gradient(135deg, #d97706, #78350f); border: 2px solid rgba(253,230,138,0.4); }
        
        .podium-name { font-family: Outfit, sans-serif; font-weight: 700; font-size: 17px; color: #fff; margin-bottom: 6px; }
        .podium-name.lg-name { font-size: 22px; font-weight: 900; }
        .podium-elo { font-family: 'JetBrains Mono', Outfit, sans-serif; font-weight: 900; font-size: 28px; margin-bottom: 6px; letter-spacing: -0.5px; }
        .podium-elo.lg-elo { font-size: 42px; }
        .gold-text { color: var(--gold); text-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.2); }
        .silver-text { color: var(--silver); text-shadow: 0 0 15px rgba(156, 163, 175, 0.4); }
        .bronze-text { color: var(--bronze); text-shadow: 0 0 15px rgba(217, 119, 6, 0.4); }
        
        .podium-label { font-size: 10px; color: var(--text-muted); font-weight: 700; letter-spacing: 2px; margin-bottom: 18px; }
        .podium-stats { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; font-size: 11px; }
        .podium-stats.lg-stats { gap: 10px; }
        .stat-pill { padding: 5px 12px; border-radius: 8px; font-weight: 700; font-size: 11px; }
        
        /* ===== UTILITY COLORS ===== */
        .text-green { color: var(--green); } .text-red { color: var(--red); } .text-orange { color: var(--orange); } .text-white { color: #fff; } .text-main { color: var(--text-main); } .text-muted { color: var(--text-muted); }
        .bg-green { background: var(--green); } .bg-orange { background: var(--orange); } .bg-red { background: var(--red); }
        .bg-green-dim { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
        .bg-red-dim { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
        .bg-orange-dim { background: rgba(255, 107, 53, 0.1); border: 1px solid rgba(255, 107, 53, 0.2); }
        .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
        .drop-shadow-glow { filter: drop-shadow(0 0 8px rgba(255,107,53,0.6)); }

        /* ===== CONTROLS — Frosted Glass ===== */
        .lb-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .tab-container { 
          display: flex; 
          background: rgba(8,8,12,0.8); 
          border: 1px solid rgba(255,255,255,0.06); 
          border-radius: 14px; padding: 5px; 
          backdrop-filter: blur(16px); 
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .tab-btn { 
          padding: 10px 26px; font-size: 13px; font-weight: 600; color: var(--text-muted); 
          background: transparent; border: none; border-radius: 10px; cursor: pointer; 
          transition: all 0.3s ease; font-family: Inter, sans-serif;
        }
        .tab-btn:hover { color: var(--text-main); background: rgba(255,255,255,0.04); }
        .tab-btn.active { 
          background: rgba(255,107,53,0.12); color: var(--orange); 
          box-shadow: 0 2px 12px rgba(255,107,53,0.15); 
          border: 1px solid rgba(255,107,53,0.2);
        }
        
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; pointer-events: none; }
        .search-input { 
          background: rgba(8,8,12,0.8); 
          border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; 
          padding: 12px 18px 12px 42px; font-size: 13px; color: #fff; outline: none; 
          width: 280px; font-family: Inter, sans-serif; transition: all 0.4s ease; 
          backdrop-filter: blur(16px); 
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .search-input:focus { 
          border-color: rgba(255,107,53,0.4); 
          box-shadow: 0 0 0 4px rgba(255,107,53,0.1), 0 4px 20px rgba(0,0,0,0.4); 
          width: 320px; 
        }

        /* ===== TABLE — Premium Frosted Glass ===== */
        .glass-panel { 
          background: #111113;
          border: 1px solid rgba(255, 255, 255, 0.06); 
          border-radius: 16px; overflow: hidden; 
        }
        .table-header { 
          display: grid; grid-template-columns: 70px 1fr 110px 110px 110px 130px 90px; 
          padding: 20px 28px; 
          background: rgba(0,0,0,0.4); 
          border-bottom: 1px solid rgba(255,255,255,0.04); 
          font-size: 10px; font-weight: 800; color: rgba(100,116,139,0.8); letter-spacing: 2px; 
        }
        
        .table-row { 
          display: grid; grid-template-columns: 70px 1fr 110px 110px 110px 130px 90px; 
          padding: 18px 28px; align-items: center; 
          border-bottom: 1px solid rgba(255,255,255,0.025); 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; 
          background: transparent; position: relative;
        }
        .table-row:hover { 
          background: rgba(255,255,255,0.05); 
          z-index: 2; border-bottom-color: transparent; 
        }
        .table-row:last-child { border-bottom: none; }
        
        .table-row.is-me { 
          background: linear-gradient(90deg, rgba(255,107,53,0.08) 0%, transparent 60%); 
          border-left: 3px solid var(--orange); 
        }
        .table-row.is-me:hover { 
          background: linear-gradient(90deg, rgba(255,107,53,0.12) 0%, rgba(255,255,255,0.02) 60%); 
        }
        
        .col-rank { display: flex; align-items: center; justify-content: center; width: 40px; }
        .rank-badge-icon { font-size: 22px; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6)); }
        .rank-num { font-family: 'JetBrains Mono', Outfit, sans-serif; font-weight: 800; font-size: 15px; color: rgba(100,116,139,0.6); }
        
        .col-player { display: flex; align-items: center; gap: 14px; }
        .row-avatar { 
          width: 42px; height: 42px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0; 
          box-shadow: 0 4px 14px rgba(0,0,0,0.4); 
        }
        .normal-bg { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(71,85,105,0.5); }
        .me-bg { 
          background: linear-gradient(135deg, var(--orange), #c2410c); 
          border: 1px solid rgba(255,237,213,0.4); 
          box-shadow: 0 0 20px rgba(255,107,53,0.35); 
        }
        
        .row-name { font-size: 15px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
        .me-badge { 
          font-size: 9px; font-weight: 800; 
          background: rgba(255,107,53,0.12); color: var(--orange); 
          padding: 3px 10px; border-radius: 20px; 
          border: 1px solid rgba(255,107,53,0.25); letter-spacing: 1px; 
        }
        .row-country { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-weight: 500; }
        
        .col-elo { font-family: 'JetBrains Mono', Outfit, sans-serif; font-weight: 800; font-size: 18px; }
        .col-xp { font-family: 'JetBrains Mono', monospace; }
        .col-wins { font-size: 14px; }
        .total-games { color: var(--text-muted); font-size: 12px; font-weight: 600; }
        .col-winrate { padding-right: 20px; }
        .wr-text { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
        .wr-bar-bg { background: rgba(255,255,255,0.06); height: 5px; border-radius: 10px; overflow: hidden; }
        .wr-bar-fill { height: 100%; border-radius: 10px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
        
        /* ===== RANK CALLOUT ===== */
        .my-rank-callout { 
          margin-top: 32px; padding: 28px 32px; 
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; 
          border: 1px solid rgba(255,107,53,0.2) !important;
          background: #111113 !important; 
        }
        .callout-left { display: flex; align-items: center; gap: 20px; }
        .callout-avatar { 
          width: 52px; height: 52px; border-radius: 50%; 
          background: linear-gradient(135deg, var(--orange), #ea580c); 
          display: flex; align-items: center; justify-content: center; 
          font-family: Outfit, sans-serif; font-weight: 900; font-size: 20px; color: #fff; 
          box-shadow: 0 0 24px rgba(255,107,53,0.4); 
        }
        .callout-title { font-size: 16px; font-weight: 700; color: var(--orange); margin-bottom: 4px; }
        .callout-desc { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        
        .btn-climb { 
          background: #ff6b35; 
          color: #fff; border: none; border-radius: 10px; padding: 12px 24px; 
          font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; 
          font-family: Inter, sans-serif;
        }
        .btn-climb:hover { background: #ea580c; }

        /* ===== LOADING ===== */
        .loading-state { text-align: center; padding: 120px 20px; color: var(--text-muted); font-weight: 600; font-size: 16px; }
        .spinner { 
          width: 44px; height: 44px; 
          border: 3px solid rgba(255,107,53,0.15); border-top-color: var(--orange); 
          border-radius: 50%; animation: rotateRing 0.8s linear infinite; margin: 0 auto 24px; 
        }

        /* ===== ANIMATIONS ===== */
        @keyframes pulseGlow { 0% { opacity: 0.08; transform: scale(0.95); } 100% { opacity: 0.18; transform: scale(1.08); } }
        @keyframes rotateRing { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.92) translateY(12px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
        .animate-pop-in { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.8s; opacity: 0; }
        .animate-row { animation: slideUp 0.5s ease-out forwards; opacity: 0; animation-delay: var(--delay); }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay-1 { animation: float 6s ease-in-out infinite; animation-delay: 1s; }
        .animate-float-delay-2 { animation: float 6s ease-in-out infinite; animation-delay: 2s; }
        .pulse-anim { animation: pulseGlow 2s infinite alternate; }

        @media (max-width: 950px) {
          .podium-container { grid-template-columns: 1fr; gap: 20px; }
          .place-1 { order: -1; margin-bottom: 0; }
          .table-header, .table-row { grid-template-columns: 50px 1fr 90px; padding: 16px; }
          .table-header div:nth-child(n+4), .table-row div:nth-child(n+4) { display: none; }
          .lb-controls { flex-direction: column; align-items: stretch; }
          .search-input { width: 100%; }
          .search-input:focus { width: 100%; }
        }
      `}</style>
    </div>
  )
}