import { useEffect, useState, useRef } from 'react'
import API_URL from '../../config/api'
import PremiumRadarChart from './PremiumRadarChart'

export default function WinnerScreen({ result, problem, myTests, totalTests, timeTaken, onRematch, onLobby, opponentName, difficulty, language, premiumMode, userCode, timeComplexity, complexity }) {
  const [eloData, setEloData] = useState(null)
  const [rankUp, setRankUp] = useState(false)
  
  // Clara AI state
  const [aiFeedback, setAiFeedback] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  // ✅ useRef add kiya
  const calledRef = useRef(false)

  useEffect(() => {
    // ✅ double call prevent karne ke liye check
    if (calledRef.current) return  
    calledRef.current = true

    const updateElo = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_URL}/api/users/match-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            opponentName: opponentName || 'Unknown',
            result,
            difficulty: difficulty || problem?.difficulty || 'Medium',
            timeTaken: timeTaken || 0,
            problem: problem?.title || 'Unknown',
            language: language || 'javascript'  // ✅ yeh add kiya
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

    // 🔥 Clara AI Feedback Fetch
    if (premiumMode && userCode && result === 'win') {
      setAiLoading(true);
      fetch(`${API_URL}/api/ai/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          problemTitle: problem?.title || 'Unknown',
          userCode,
          language: language || 'javascript',
          timeComplexity: complexity?.time || timeComplexity || 'O(N)',
          spaceComplexity: complexity?.space || 'O(N)',
          timeTaken,
          passedTests: myTests,
          totalTests
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiFeedback(data.feedback);
        }
      })
      .catch(err => console.error('AI Error:', err))
      .finally(() => setAiLoading(false));
    }

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

      {/* Container for split view if premium AI feedback is available */}
      <div style={{
        display: 'flex', gap: '20px', alignItems: 'stretch',
        maxWidth: premiumMode && isWin ? 1000 : 480, width: '95%',
        maxHeight: '90vh', margin: '0 auto'
      }}>
        {/* Left Panel: Original Winner Screen */}
        <div style={{
          background: '#13131a', border: `1px solid ${isWin ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 24, padding: '40px', textAlign: 'center',
          flex: 1, overflowY: 'auto',
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

        {/* ✅ Premium Time Complexity Reveal & Analytics */}
        {premiumMode && isWin && (
          <div style={{ marginBottom: 24 }}>
            <PremiumRadarChart 
              timeTaken={timeTaken} 
              totalTests={totalTests} 
              passed={myTests} 
              language={language}
            />
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

        {/* ⚡ Your Solution's Complexity */}
        {(complexity || timeComplexity) && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(251,191,36,0.08))',
            border: '1px solid rgba(255,107,53,0.25)',
            borderRadius: 16, padding: '18px 20px', marginBottom: 24, textAlign: 'left'
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#ff6b35', letterSpacing: 1, marginBottom: 12 }}>
              ⚡ YOUR SOLUTION ANALYSIS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', fontFamily: 'Outfit', marginBottom: 4 }}>
                  {complexity?.time || timeComplexity || 'O(N)'}
                </div>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 0.5 }}>TIME COMPLEXITY</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#60a5fa', fontFamily: 'Outfit', marginBottom: 4 }}>
                  {complexity?.space || 'O(N)'}
                </div>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 0.5 }}>SPACE COMPLEXITY</div>
              </div>
            </div>
            {complexity?.note && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#777', textAlign: 'center', fontStyle: 'italic' }}>
                📊 {complexity.note}
              </div>
            )}
          </div>
        )}

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

        {/* Right Panel: Clara AI Feedback (Only Premium Winners) */}
        {premiumMode && isWin && (
          <div style={{
          background: 'linear-gradient(180deg, rgba(236,72,153,0.05) 0%, rgba(10,10,12,0.95) 100%)',
          border: '1px solid rgba(236,72,153,0.3)',
          borderRadius: 24, padding: '32px', textAlign: 'left',
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(236,72,153,0.1)'
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexShrink: 0 }}>
             <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 4px 14px rgba(236,72,153,0.4)' }}>🤖</div>
             <div>
               <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>Clara AI Review</div>
               <div style={{ fontSize: 12, color: '#ec4899', fontWeight: 600, letterSpacing: 1 }}>MAANG EXPERT INTERVIEWER</div>
             </div>
           </div>

           {aiLoading ? (
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
               <div className="ai-spinner" style={{ fontSize: 40, marginBottom: 16, animation: 'pulse 1s infinite' }}>✨</div>
               <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Inter', letterSpacing: 1 }}>ANALYZING CODE STRUCTURE...</div>
             </div>
           ) : aiFeedback ? (
             <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: 12, display: 'flex', flexDirection: 'column', gap: 20 }}>
               <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', padding: 16, borderRadius: 12 }}>
                 <h3 style={{ fontSize: 14, color: '#22c55e', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{fontSize: 16}}>✓</span> Strengths</h3>
                 <ul style={{ margin: 0, paddingLeft: 20, color: '#d1d5db', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                   {aiFeedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
               
               <div style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.2)', padding: 16, borderRadius: 12 }}>
                 <h3 style={{ fontSize: 14, color: '#ff6b35', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{fontSize: 16}}>⚠️</span> Areas for Improvement</h3>
                 <ul style={{ margin: 0, paddingLeft: 20, color: '#d1d5db', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                   {aiFeedback.improvements?.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
               </div>
               
               <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.2)', padding: 16, borderRadius: 12 }}>
                 <h3 style={{ fontSize: 14, color: '#60a5fa', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 8 }}><span style={{fontSize: 16}}>💡</span> Optimal Approach</h3>
                 <pre style={{ background: 'rgba(0,0,0,0.6)', padding: 16, borderRadius: 8, fontSize: 13, overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)', color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>
                   <code>{aiFeedback.optimalCode}</code>
                 </pre>
               </div>
             </div>
           ) : (
             <div style={{ color: '#888', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Feedback unavailable.</div>
           )}
        </div>
      )}
      
      </div>

      <style>{`
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-15px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(236,72,153,0.3); border-radius: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(236,72,153,0.5); }
      `}</style>
    </div>
  )
}