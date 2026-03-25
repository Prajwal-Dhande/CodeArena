import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const CONFETTI_COLORS = ['#ff6b35', '#f7451d', '#22c55e', '#fb923c', '#60a5fa', '#fff', '#fbbf24']

function Particle({ x, y, color, size, angle, speed }) {
  const style = {
    position: 'fixed', left: x, top: y, width: size, height: size,
    background: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    pointerEvents: 'none', animation: `fall ${speed}s ease-in forwards`,
    transform: `rotate(${angle}deg)`, zIndex: 9999, boxShadow: `0 0 10px ${color}`
  }
  return <div style={style} />
}

export default function WinnerScreen({ result, problem, myTests, totalTests, timeTaken, onRematch, onLobby }) {
  const navigate = useNavigate()
  const [particles, setParticles] = useState([])
  const [visible, setVisible] = useState(false)
  const [eloChange, setEloChange] = useState(0)
  const animRef = useRef(null)

  const isWinner = result === 'win'

  useEffect(() => {
    setVisible(true)
    setEloChange(isWinner ? Math.floor(Math.random() * 10) + 15 : -(Math.floor(Math.random() * 8) + 10))

    if (isWinner) {
      const generated = Array.from({ length: 100 }, (_, i) => ({
        id: i, x: Math.random() * window.innerWidth, y: -20 - Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 8 + 4, angle: Math.random() * 360, speed: Math.random() * 2 + 2
      }))
      setParticles(generated)
      animRef.current = setTimeout(() => setParticles([]), 4500)
    }

    return () => clearTimeout(animRef.current)
  }, [isWinner])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      {particles.map(p => <Particle key={p.id} {...p} />)}

      <div className={`ws-overlay ${visible ? 'show' : ''}`}>
        <div className={`ws-modal ${isWinner ? 'win-theme' : 'loss-theme'} ${visible ? 'pop-up' : ''}`}>
          
          <div className="ws-icon">{isWinner ? '🏆' : '💀'}</div>
          
          <h1 className="ws-title">{isWinner ? 'VICTORY' : 'DEFEATED'}</h1>
          
          <p className="ws-subtitle">
            {isWinner 
              ? 'Flawless logic. You outcoded your opponent.' 
              : 'Your opponent was faster. Review your complexity and try again.'}
          </p>

          <div className="ws-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">✓</div>
              <div className={`stat-val ${myTests === totalTests ? 'text-green' : 'text-orange'}`}>{myTests}/{totalTests}</div>
              <div className="stat-label">TESTS PASSED</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱</div>
              <div className="stat-val text-blue">{formatTime(timeTaken || 0)}</div>
              <div className="stat-label">TIME TAKEN</div>
            </div>
            
            <div className="stat-card elo-card">
              <div className="stat-icon">{eloChange > 0 ? '↑' : '↓'}</div>
              <div className={`stat-val ${eloChange > 0 ? 'text-green' : 'text-red'}`}>
                {eloChange > 0 ? '+' : ''}{eloChange}
              </div>
              <div className="stat-label">ELO RATING</div>
            </div>
          </div>

          <div className="ws-problem-info">
            <div className="info-badge">PROBLEM SOLVED</div>
            <div className="info-title">{problem?.title || 'Unknown Problem'}</div>
            <div className="info-meta">{problem?.category || 'Algorithms'} · {problem?.difficulty || 'Medium'}</div>
          </div>

          <div className="ws-actions">
            <button onClick={onRematch} className="btn-rematch">⚡ REMATCH</button>
            <button onClick={onLobby} className="btn-lobby">🏠 LOBBY</button>
          </div>

          <button onClick={() => {
            const text = isWinner 
              ? `🏆 Just crushed "${problem?.title}" in ${formatTime(timeTaken || 0)} on CodeArena! Bring it on. ⚡` 
              : `💀 Lost a tough battle on "${problem?.title}" on CodeArena. Back to the grind. 🔧`
            navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard! Share the flex. 🔥'))
          }} className="btn-share">
            📤 Share Result
          </button>

        </div>
      </div>

      <style>{`
        .ws-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(5, 5, 5, 0.9); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
        }
        .ws-overlay.show { opacity: 1; pointer-events: all; }
        
        .ws-modal {
          background: rgba(15, 15, 15, 0.9); border-radius: 20px;
          padding: 40px; max-width: 500px; width: 90%; text-align: center;
          transform: translateY(40px) scale(0.95); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .ws-modal.pop-up { transform: translateY(0) scale(1); }
        
        .win-theme { border: 1px solid rgba(34, 197, 94, 0.3); box-shadow: 0 0 80px rgba(34, 197, 94, 0.15), inset 0 0 30px rgba(34, 197, 94, 0.05); }
        .loss-theme { border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 0 80px rgba(239, 68, 68, 0.15), inset 0 0 30px rgba(239, 68, 68, 0.05); }
        
        .ws-icon { font-size: 70px; margin-bottom: 10px; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5)); }
        .win-theme .ws-icon { animation: float 2s ease-in-out infinite; }
        
        .ws-title {
          font-family: Outfit, sans-serif; font-weight: 900; font-size: 46px;
          letter-spacing: -1px; margin: 0 0 10px 0;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .win-theme .ws-title { background-image: linear-gradient(90deg, #22c55e, #10b981); }
        .loss-theme .ws-title { background-image: linear-gradient(90deg, #ef4444, #f97316); }
        
        .ws-subtitle { font-size: 14px; color: #888; margin-bottom: 30px; line-height: 1.5; }
        
        .ws-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 30px; }
        .stat-card { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px 10px; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.02); }
        .elo-card { background: rgba(255,255,255,0.03); }
        
        .stat-icon { font-size: 20px; margin-bottom: 8px; opacity: 0.8; }
        .stat-val { font-family: Outfit, sans-serif; font-weight: 800; font-size: 24px; margin-bottom: 4px; }
        .stat-label { font-size: 10px; color: #555; font-weight: 700; letter-spacing: 1px; }
        
        .text-green { color: #22c55e; text-shadow: 0 0 10px rgba(34,197,94,0.4); }
        .text-orange { color: #fb923c; }
        .text-blue { color: #60a5fa; }
        .text-red { color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.4); }
        
        .ws-problem-info { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 14px; margin-bottom: 30px; text-align: left; }
        .info-badge { font-size: 10px; color: #666; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
        .info-title { font-size: 16px; font-weight: 600; color: #e5e5e5; margin-bottom: 4px; }
        .info-meta { font-size: 12px; color: #777; }
        
        .ws-actions { display: flex; gap: 12px; margin-bottom: 20px; }
        .btn-rematch {
          flex: 1.5; padding: 14px 0; font-family: Outfit, sans-serif; font-weight: 800; font-size: 14px;
          color: #fff; background: linear-gradient(135deg, #ff6b35, #f7451d); border: none;
          border-radius: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,107,53,0.3);
        }
        .btn-rematch:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,107,53,0.4); }
        
        .btn-lobby {
          flex: 1; padding: 14px 0; font-family: Outfit, sans-serif; font-weight: 700; font-size: 14px;
          color: #aaa; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; cursor: pointer; transition: all 0.2s;
        }
        .btn-lobby:hover { background: rgba(255,255,255,0.1); color: #fff; }
        
        .btn-share {
          background: none; border: none; font-family: Inter, sans-serif; font-size: 13px;
          color: #666; cursor: pointer; transition: color 0.2s; text-decoration: underline;
        }
        .btn-share:hover { color: #ff6b35; }

        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }

        @media (max-width: 500px) {
          .ws-modal { padding: 30px 20px; }
          .ws-title { font-size: 36px; }
          .ws-stats-grid { grid-template-columns: 1fr; gap: 8px; }
          .ws-actions { flex-direction: column; }
        }
      `}</style>
    </>
  )
}