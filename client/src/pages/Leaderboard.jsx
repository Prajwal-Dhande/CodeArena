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
  
  // ✅ Check Current User's Rank
  const myPlayer = players.find(p => p.username === currentUser.username)
  const myRank = myPlayer?.rank

  return (
    <div className="lb-wrapper">
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
        <button onClick={() => navigate('/lobby')} className="btn-battle-now">
          ⚡ Battle Now
        </button>
      </nav>

      <div className="lb-container">
        <div className="lb-header animate-fade-in">
          <span className="section-tag">HALL OF FAME</span>
          <h1 className="page-title text-gradient">Global Rankings</h1>
          <p className="page-subtitle">Top coders ranked by ELO rating. Updated after every battle.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading Arena Rankings...</p>
          </div>
        ) : (
          <>
            {/* ✅ TOP 3 PODIUM (Ab hamesha dikhega, chahe 1 hi player kyun na ho) */}
            {players.length > 0 && (
              <div className="podium-container">
                {/* 2nd Place */}
                <div className="podium-card place-2 animate-float-delay-1">
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
                      <span className="stat-pill text-muted">Waiting for player...</span>
                    )}
                  </div>
                </div>

                {/* 1st Place */}
                <div className="podium-card place-1 animate-float">
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
                <div className="podium-card place-3 animate-float-delay-2">
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
                      <span className="stat-pill text-muted">Waiting for player...</span>
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
                {['RANK', 'PLAYER', 'ELO', 'WINS', 'WIN RATE', 'STREAK', 'CHANGE'].map(h => <div key={h}>{h}</div>)}
              </div>

              <div className="table-body">
                {filtered.map((player, index) => {
                  const isMe = player.username === currentUser.username;
                  return (
                  <div 
                    key={player.rank} 
                    className={`table-row animate-row ${isMe ? 'is-me' : ''}`}
                    style={{ '--delay': `${index * 0.05}s` }}
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
                    <div className="col-change font-bold text-muted">{player.change === '0' ? '—' : player.change}</div>
                  </div>
                )})}
              </div>
            </div>
            
            {/* Logic Fix: Only show if rank > 1 */}
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
          --bg-dark: #050507; 
          --panel-bg: rgba(15, 15, 20, 0.6); 
          --glass-border: rgba(255, 255, 255, 0.06);
          --orange: #ff6b35; --purple: #a855f7; --green: #10b981; --red: #ef4444;
          --gold: #fbbf24; --silver: #9ca3af; --bronze: #d97706;
          --text-main: #f8fafc; --text-muted: #64748b;
        }

        /* Ambient Background Grid */
        .ambient-grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at top, black, transparent 80%);
        }

        .lb-wrapper { min-height: 100vh; background: var(--bg-dark); color: var(--text-main); font-family: Inter, sans-serif; position: relative; overflow: hidden; }
        .bg-glow { position: fixed; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(140px); z-index: 0; pointer-events: none; opacity: 0.15; animation: pulseGlow 8s infinite alternate; }
        .orange-glow { top: -20%; right: -10%; background: radial-gradient(circle, var(--orange) 0%, transparent 60%); }
        .purple-glow { bottom: -20%; left: -10%; background: radial-gradient(circle, var(--purple) 0%, transparent 60%); animation-delay: -4s; }
        
        .glass-nav { height: 60px; background: rgba(5, 5, 7, 0.75); backdrop-filter: blur(24px); border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; padding: 0 28px; gap: 16px; position: sticky; top: 0; z-index: 50; }
        .logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 18px; cursor: pointer; letter-spacing: -0.5px; }
        .nav-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }
        .nav-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        
        .btn-battle-now { background: linear-gradient(135deg, var(--orange), #f7451d); color: #fff; border: none; padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(255,107,53,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
        .btn-battle-now:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 6px 25px rgba(255,107,53,0.5); }
        
        .lb-container { max-width: 1040px; margin: 0 auto; padding: 40px 24px 80px; position: relative; z-index: 10; }
        .lb-header { text-align: center; margin-bottom: 56px; }
        .section-tag { font-size: 11px; font-weight: 800; color: var(--orange); letter-spacing: 3px; margin-bottom: 16px; display: inline-block; background: rgba(255,107,53,0.1); padding: 6px 16px; border-radius: 20px; border: 1px solid rgba(255,107,53,0.2); text-transform: uppercase; }
        .page-title { font-family: Outfit, sans-serif; font-weight: 900; font-size: clamp(2.5rem, 5vw, 4rem); margin: 0 0 12px 0; letter-spacing: -1.5px; line-height: 1.1; }
        .text-gradient { background: linear-gradient(135deg, #fff 20%, var(--orange) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .page-subtitle { font-size: 15px; color: var(--text-muted); margin: 0; font-weight: 400; }
        
        /* Podium Styles */
        .podium-container { display: grid; grid-template-columns: 1fr 1.3fr 1fr; gap: 20px; margin-bottom: 60px; align-items: end; }
        .podium-card { background: var(--panel-bg); border: 1px solid var(--glass-border); border-radius: 20px; padding: 24px 16px; text-align: center; backdrop-filter: blur(20px); position: relative; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .podium-card:hover { transform: translateY(-10px) scale(1.02) !important; z-index: 10; }
        
        .place-1 { padding: 40px 20px; background: linear-gradient(180deg, rgba(251,191,36,0.1) 0%, rgba(15,15,20,0.8) 100%); border: 1px solid rgba(251, 191, 36, 0.4); box-shadow: 0 10px 50px rgba(251, 191, 36, 0.15), inset 0 0 30px rgba(251, 191, 36, 0.05); z-index: 2; margin-bottom: 16px; }
        .place-1:hover { border-color: rgba(251, 191, 36, 0.8); box-shadow: 0 20px 60px rgba(251, 191, 36, 0.25), inset 0 0 40px rgba(251, 191, 36, 0.1); }
        .place-2 { border-color: rgba(156, 163, 175, 0.3); background: linear-gradient(180deg, rgba(156,163,175,0.05) 0%, rgba(15,15,20,0.8) 100%); }
        .place-3 { border-color: rgba(217, 119, 6, 0.3); background: linear-gradient(180deg, rgba(217,119,6,0.05) 0%, rgba(15,15,20,0.8) 100%); }
        
        .crown-badge { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #fcd34d, #f59e0b); color: #000; font-size: 11px; font-weight: 900; padding: 6px 16px; border-radius: 8px; letter-spacing: 1px; box-shadow: 0 6px 15px rgba(251, 191, 36, 0.5); display: flex; align-items: center; gap: 6px; }
        .crown-icon { font-size: 14px; }
        .medal { font-size: 32px; margin-bottom: 16px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5)); }
        
        .podium-avatar { position: relative; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-family: Outfit, sans-serif; font-weight: 800; font-size: 18px; color: #fff; box-shadow: 0 8px 20px rgba(0,0,0,0.6); z-index: 1; }
        .podium-avatar.lg-avatar { width: 76px; height: 76px; font-size: 24px; }
        .avatar-ring { position: absolute; inset: -4px; border-radius: 50%; border: 2px dashed rgba(251, 191, 36, 0.6); animation: rotateRing 10s linear infinite; z-index: -1; }
        
        .gold-bg { background: linear-gradient(135deg, #f59e0b, #b45309); border: 2px solid #fef3c7; }
        .silver-bg { background: linear-gradient(135deg, #9ca3af, #374151); border: 2px solid #f3f4f6; }
        .bronze-bg { background: linear-gradient(135deg, #d97706, #78350f); border: 2px solid #fde68a; }
        
        .podium-name { font-family: Outfit, sans-serif; font-weight: 700; font-size: 16px; color: #fff; margin-bottom: 4px; }
        .podium-name.lg-name { font-size: 20px; font-weight: 800; }
        .podium-elo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 26px; margin-bottom: 4px; letter-spacing: -0.5px; }
        .podium-elo.lg-elo { font-size: 38px; }
        .gold-text { color: var(--gold); text-shadow: 0 0 15px rgba(251, 191, 36, 0.5); }
        .silver-text { color: var(--silver); text-shadow: 0 0 10px rgba(156, 163, 175, 0.3); }
        .bronze-text { color: var(--bronze); text-shadow: 0 0 10px rgba(217, 119, 6, 0.3); }
        
        .podium-label { font-size: 10px; color: var(--text-muted); font-weight: 700; letter-spacing: 1.5px; margin-bottom: 16px; }
        .podium-stats { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; font-size: 11px; }
        .stat-pill { padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; }
        
        /* Utility Colors */
        .text-green { color: var(--green); } .text-red { color: var(--red); } .text-orange { color: var(--orange); } .text-white { color: #fff; } .text-main { color: var(--text-main); } .text-muted { color: var(--text-muted); }
        .bg-green { background: var(--green); } .bg-orange { background: var(--orange); } .bg-red { background: var(--red); }
        .bg-green-dim { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }
        .bg-red-dim { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); }
        .bg-orange-dim { background: rgba(255, 107, 53, 0.1); border: 1px solid rgba(255, 107, 53, 0.2); }
        .font-semibold { font-weight: 600; } .font-bold { font-weight: 700; }
        .drop-shadow-glow { filter: drop-shadow(0 0 6px rgba(255,107,53,0.6)); }

        /* Controls */
        .lb-controls { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .tab-container { display: flex; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 12px; padding: 6px; backdrop-filter: blur(10px); }
        .tab-btn { padding: 8px 24px; font-size: 13px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { background: rgba(255,255,255,0.1); color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        
        .search-wrapper { position: relative; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 14px; }
        .search-input { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px 16px 12px 40px; font-size: 13px; color: #fff; outline: none; width: 260px; font-family: Inter, sans-serif; transition: all 0.3s ease; backdrop-filter: blur(10px); }
        .search-input:focus { border-color: var(--orange); box-shadow: 0 0 0 4px rgba(255,107,53,0.15); width: 300px; background: rgba(0,0,0,0.7); }

        /* Table Styles */
        .glass-panel { background: var(--panel-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .table-header { display: grid; grid-template-columns: 70px 1fr 110px 110px 130px 90px 90px; padding: 18px 24px; background: rgba(0,0,0,0.6); border-bottom: 1px solid var(--glass-border); font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 1.5px; }
        
        .table-row { display: grid; grid-template-columns: 70px 1fr 110px 110px 130px 90px 90px; padding: 16px 24px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.02); transition: all 0.2s ease; cursor: pointer; background: transparent; }
        .table-row:hover { background: rgba(255,255,255,0.04); transform: scale(1.01); box-shadow: 0 10px 20px rgba(0,0,0,0.2); z-index: 2; position: relative; border-radius: 8px; border-bottom-color: transparent; }
        .table-row:last-child { border-bottom: none; }
        
        .table-row.is-me { background: linear-gradient(90deg, rgba(255,107,53,0.1) 0%, transparent 100%); border-left: 3px solid var(--orange); }
        .table-row.is-me:hover { background: linear-gradient(90deg, rgba(255,107,53,0.15) 0%, rgba(255,255,255,0.02) 100%); }
        
        .col-rank { display: flex; align-items: center; justify-content: center; width: 40px; }
        .rank-badge-icon { font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }
        .rank-num { font-family: Outfit, sans-serif; font-weight: 800; font-size: 16px; color: var(--text-muted); }
        
        .col-player { display: flex; align-items: center; gap: 14px; }
        .row-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .normal-bg { background: linear-gradient(135deg, #334155, #0f172a); border: 1px solid #475569; }
        .me-bg { background: linear-gradient(135deg, var(--orange), #c2410c); border: 1px solid #ffedd5; box-shadow: 0 0 15px rgba(255,107,53,0.4); }
        
        .row-name { font-size: 15px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
        .me-badge { font-size: 10px; font-weight: 800; background: rgba(255,107,53,0.15); color: var(--orange); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,107,53,0.3); letter-spacing: 0.5px; }
        .row-country { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; font-weight: 500; }
        
        .col-elo { font-family: Outfit, sans-serif; font-weight: 800; font-size: 18px; }
        .col-wins { font-size: 14px; }
        .total-games { color: var(--text-muted); font-size: 12px; font-weight: 600; }
        .col-winrate { padding-right: 20px; }
        .wr-text { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
        .wr-bar-bg { background: rgba(0,0,0,0.5); height: 6px; border-radius: 3px; overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5); }
        .wr-bar-fill { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
        
        /* Banner Callout */
        .my-rank-callout { margin-top: 30px; padding: 24px 30px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; border-color: rgba(255,107,53,0.25); background: linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(255,107,53,0.1) 100%); box-shadow: 0 15px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1); }
        .callout-left { display: flex; align-items: center; gap: 20px; }
        .callout-avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--orange), #ea580c); display: flex; align-items: center; justify-content: center; font-family: Outfit, sans-serif; font-weight: 900; font-size: 20px; color: #fff; box-shadow: 0 0 20px rgba(255,107,53,0.5); }
        .callout-title { font-size: 16px; font-weight: 600; color: var(--orange); margin-bottom: 4px; }
        .callout-desc { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        
        .btn-climb { background: linear-gradient(135deg, var(--orange), #ea580c); color: #fff; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 25px rgba(255,107,53,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
        .btn-climb:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 30px rgba(255,107,53,0.5); }

        /* Loading State */
        .loading-state { text-align: center; padding: 100px 20px; color: var(--text-muted); font-weight: 600; font-size: 16px; }
        .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,107,53,0.2); border-top-color: var(--orange); border-radius: 50%; animation: rotateRing 1s linear infinite; margin: 0 auto 20px; }

        /* Animations */
        @keyframes pulseGlow { 0% { opacity: 0.1; transform: scale(0.95); } 100% { opacity: 0.2; transform: scale(1.05); } }
        @keyframes rotateRing { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; animation-delay: 0.2s; opacity: 0; }
        .animate-pop-in { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; animation-delay: 0.8s; opacity: 0; }
        .animate-row { animation: slideUp 0.5s ease-out forwards; opacity: 0; animation-delay: var(--delay); }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay-1 { animation: float 6s ease-in-out infinite; animation-delay: 1s; }
        .animate-float-delay-2 { animation: float 6s ease-in-out infinite; animation-delay: 2s; }
        .pulse-anim { animation: pulseGlow 2s infinite alternate; }

        @media (max-width: 950px) {
          .podium-container { grid-template-columns: 1fr; gap: 24px; }
          .place-1 { order: -1; }
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