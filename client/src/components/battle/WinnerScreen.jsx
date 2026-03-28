
import { useEffect, useState } from 'react'

export default function WinnerScreen({ result, problem, myTests, totalTests, timeTaken, onRematch, onLobby, opponentName, difficulty }) {
  const [eloData, setEloData] = useState(null)
  const [rankUp, setRankUp] = useState(false)

  useEffect(() => {
    const updateElo = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/users/match-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            opponentName: opponentName || 'Unknown',
            result,
            difficulty: difficulty || problem?.difficulty || 'Medium',
            timeTaken: timeTaken || 0,
            problem: problem?.title || 'Unknown'
          })
        })
        const data = await res.json()
        if (data.success) {
          setEloData(data)
          if (data.rankChanged) setRankUp(true)
          // ✅ localStorage update karo
          const user = JSON.parse(localStorage.getItem('user') || '{}')
          user.elo = data.newElo
          user.rank = data.newRank
          if (result === 'win') {
            user.stats = user.stats || {}
            user.stats.wins = (user.stats.wins || 0) + 1
          } else {
            user.stats = user.stats || {}
            user.stats.losses = (user.stats.losses || 0) + 1
          }
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (err) {
        console.error('ELO update error:', err)
      }
    }
    updateElo()
  }, [])

  const isWin = result === 'win'

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      backdropFilter: 'blur(20px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Confetti on win */}
      {isWin && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-20px',
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              background: ['#ff6b35','#fbbf24','#22c55e','#60a5fa','#a855f7'][Math.floor(Math.random()*5)],
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              animation: `confettiFall ${Math.random() * 2 + 2}s linear ${Math.random() * 2}s forwards`,
              opacity: 0
            }} />
          ))}
        </div>
      )}

      <div style={{
        background: '#13131a', border: `1px solid ${isWin ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        borderRadius: 24, padding: '40px', textAlign: 'center',
        maxWidth: 480, width: '90%',
        boxShadow: `0 30px 80px ${isWin ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
      }}>

        {/* Result Icon */}
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce 0.6s ease' }}>
          {isWin ? '🏆' : '💀'}
        </div>

        <div style={{
          fontFamily: 'Outfit', fontWeight: 900, fontSize: 36,
          background: isWin ? 'linear-gradient(90deg, #22c55e, #86efac)' : 'linear-gradient(90deg, #ef4444, #fca5a5)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 8, letterSpacing: '-1px'
        }}>
          {isWin ? 'Victory!' : 'Defeated!'}
        </div>

        <div style={{ fontSize: 14, color: '#555', marginBottom: 28 }}>
          {isWin ? 'You outpaced your opponent!' : 'Better luck next time!'}
        </div>

        {/* ✅ ELO Change */}
        {eloData && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '20px', marginBottom: 24
          }}>
            {/* Rank Up Banner */}
            {rankUp && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(251,191,36,0.2))',
                border: '1px solid rgba(255,107,53,0.4)',
                borderRadius: 10, padding: '10px 16px', marginBottom: 16,
                fontSize: 14, fontWeight: 700, color: '#fbbf24',
                animation: 'pulse 1s infinite'
              }}>
                🎉 RANK UP! {eloData.oldRank} → {eloData.newRank}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: isWin ? '#22c55e' : '#ef4444', fontFamily: 'Outfit' }}>
                  {eloData.eloChange > 0 ? '+' : ''}{eloData.eloChange}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>ELO CHANGE</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#ff6b35', fontFamily: 'Outfit' }}>
                  {eloData.newElo}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>NEW ELO</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fbbf24', fontFamily: 'Outfit' }}>
                  {eloData.rankInfo?.icon} {eloData.newRank}
                </div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>RANK</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Tests Passed', val: `${myTests}/${totalTests}`, color: '#22c55e' },
            { label: 'Time Taken', val: timeTaken ? `${Math.floor(timeTaken/60)}:${(timeTaken%60).toString().padStart(2,'0')}` : '-', color: '#60a5fa' },
            { label: 'Problem', val: problem?.difficulty || 'Medium', color: '#fb923c' },
            { label: 'Opponent', val: opponentName || 'Bot', color: '#a855f7' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'Outfit', marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 11, color: '#555' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onLobby} style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#aaa', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s'
          }}>🏠 Lobby</button>
          <button onClick={onLobby} style={{
            flex: 1, background: 'linear-gradient(135deg, #ff6b35, #f7451d)', border: 'none',
            color: '#fff', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Inter'
          }}>⚔️ Play Again</button>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
      `}</style>
    </div>
  )
}