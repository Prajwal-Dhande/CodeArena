import { useEffect, useState, useRef } from 'react'
import API_URL from '../../config/api'
import PremiumRadarChart from './PremiumRadarChart'

export default function WinnerScreen({ result, problem, myTests, totalTests, timeTaken, onRematch, onLobby, opponentName, difficulty, language, premiumMode, userCode, timeComplexity, complexity }) {
  const [eloData, setEloData] = useState(null)
  const [rankUp, setRankUp] = useState(false)
  const [aiFeedback, setAiFeedback] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [reportCard, setReportCard] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    const token = localStorage.getItem('token')

    // ELO Update
    const updateElo = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/match-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            opponentName: opponentName || 'Unknown', result,
            difficulty: difficulty || problem?.difficulty || 'Medium',
            timeTaken: timeTaken || 0, problem: problem?.title || 'Unknown',
            language: language || 'javascript'
          })
        })
        const data = await res.json()
        if (data.success) {
          setEloData(data)
          if (data.rankChanged) setRankUp(true)
          const user = JSON.parse(localStorage.getItem('user') || '{}')
          user.elo = data.newElo; user.rank = data.newRank
          user.stats = user.stats || {}
          if (result === 'win') user.stats.wins = (user.stats.wins || 0) + 1
          else user.stats.losses = (user.stats.losses || 0) + 1
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (err) { console.error('ELO error:', err) }
    }
    updateElo()

    // Clara AI Feedback (win only)
    if (premiumMode && userCode && result === 'win') {
      setAiLoading(true)
      fetch(`${API_URL}/api/ai/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          problemTitle: problem?.title || 'Unknown', userCode,
          language: language || 'javascript',
          timeComplexity: complexity?.time || timeComplexity || 'O(N)',
          spaceComplexity: complexity?.space || 'O(N)',
          timeTaken, passedTests: myTests, totalTests
        })
      }).then(r => r.json()).then(d => { if (d.success) setAiFeedback(d.feedback) })
        .catch(console.error).finally(() => setAiLoading(false))
    }

    // MAANG Report Card (premium only)
    if (premiumMode) {
      setReportLoading(true)
      fetch(`${API_URL}/api/ai/report-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          problemTitle: problem?.title || 'Unknown',
          userCode: userCode || '// No code submitted',
          language: language || 'javascript',
          passedTests: myTests, totalTests, timeTaken, result
        })
      }).then(r => r.json()).then(d => { if (d.success) setReportCard(d.report) })
        .catch(console.error).finally(() => setReportLoading(false))
    }
  }, [])

  const isWin = result === 'win'
  const fmt = (s) => s ? `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}` : '-'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.96)', backdropFilter: 'blur(20px)',
      zIndex: 100, overflowY: 'auto',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Confetti */}
      {isWin && (
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 101 }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px',
              width: `${Math.random() * 6 + 3}px`, height: `${Math.random() * 6 + 3}px`,
              background: ['#ff6b35','#fbbf24','#22c55e','#60a5fa','#a855f7'][i % 5],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `confettiFall ${Math.random() * 2 + 2}s linear ${Math.random() * 2}s forwards`, opacity: 0
            }} />
          ))}
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 100px' }}>

        {/* Result Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{isWin ? '🏆' : '💀'}</div>
          <div style={{
            fontFamily: 'Outfit', fontWeight: 900, fontSize: 32,
            background: isWin ? 'linear-gradient(90deg, #22c55e, #86efac)' : 'linear-gradient(90deg, #ef4444, #fca5a5)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4
          }}>{isWin ? 'Victory!' : 'Defeated!'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isWin ? 'You outpaced your opponent!' : 'Better luck next time.'}
          </div>
        </div>

        {/* Rank Up Banner */}
        {rankUp && eloData && (
          <div style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#fbbf24' }}>
            🎉 RANK UP! {eloData.oldRank} → {eloData.newRank}
          </div>
        )}

        {/* Compact Stats Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {[
            { val: `${myTests}/${totalTests}`, label: 'Tests', color: '#22c55e' },
            { val: fmt(timeTaken), label: 'Time', color: '#60a5fa' },
            { val: problem?.difficulty || 'Medium', label: 'Difficulty', color: '#fb923c' },
            { val: opponentName || 'Bot', label: 'Opponent', color: '#a855f7' },
            ...(eloData ? [
              { val: `${eloData.eloChange > 0 ? '+' : ''}${eloData.eloChange}`, label: 'ELO', color: isWin ? '#22c55e' : '#ef4444' },
              { val: `${eloData.newElo}`, label: 'Rating', color: '#ff6b35' },
            ] : []),
          ].map(({ val, label, color }) => (
            <div key={label} style={{ flex: '1 1 auto', minWidth: 80, background: '#13131a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color, fontFamily: 'Outfit' }}>{val}</div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2, letterSpacing: 0.5 }}>{label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Premium Sections — Collapsible */}
        {premiumMode && isWin && (
          <>
            {/* Clara AI Review Toggle */}
            <button onClick={() => setShowAI(!showAI)} style={{
              width: '100%', background: showAI ? 'rgba(236,72,153,0.08)' : '#13131a',
              border: `1px solid ${showAI ? 'rgba(236,72,153,0.25)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: showAI ? 0 : 10, color: '#ec4899', fontSize: 13, fontWeight: 700,
              borderBottomLeftRadius: showAI ? 0 : 12, borderBottomRightRadius: showAI ? 0 : 12,
              fontFamily: 'Inter'
            }}>
              <span>🤖 Clara AI Review</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showAI ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showAI && (
              <div style={{ background: '#13131a', border: '1px solid rgba(236,72,153,0.25)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '16px', marginBottom: 10 }}>
                {aiLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ec4899', justifyContent: 'center', padding: 16 }}>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(236,72,153,0.3)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12 }}>Analyzing code...</span>
                  </div>
                ) : aiFeedback ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', padding: '10px', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700, marginBottom: 6 }}>✓ Strengths</div>
                      <ul style={{ margin: 0, paddingLeft: 14, color: '#bbb', fontSize: 12, lineHeight: 1.6 }}>{aiFeedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                    <div style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)', padding: '10px', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#ff6b35', fontWeight: 700, marginBottom: 6 }}>⚠ Improvements</div>
                      <ul style={{ margin: 0, paddingLeft: 14, color: '#bbb', fontSize: 12, lineHeight: 1.6 }}>{aiFeedback.improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    </div>
                  </div>
                ) : <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>Feedback unavailable.</div>}
              </div>
            )}
          </>
        )}

        {premiumMode && (
          <>
            {/* Report Card Toggle */}
            <button onClick={() => setShowReport(!showReport)} style={{
              width: '100%', background: showReport ? 'rgba(168,85,247,0.08)' : '#13131a',
              border: `1px solid ${showReport ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: showReport ? 0 : 10, color: '#a855f7', fontSize: 13, fontWeight: 700,
              borderBottomLeftRadius: showReport ? 0 : 12, borderBottomRightRadius: showReport ? 0 : 12,
              fontFamily: 'Inter'
            }}>
              <span>🏢 MAANG Report Card</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showReport ? '▲ Hide' : '▼ Show'}</span>
            </button>

            {showReport && (
              <div style={{ background: '#13131a', border: '1px solid rgba(168,85,247,0.25)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '16px', marginBottom: 10 }}>
                {reportLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7', justifyContent: 'center', padding: 16 }}>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 12 }}>Clara is evaluating...</span>
                  </div>
                ) : reportCard ? (
                  <div>
                    {/* Verdict */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ fontSize: 13, color: '#ccc', fontStyle: 'italic', flex: 1, marginRight: 12 }}>"{reportCard.verdictReason}"</div>
                      <div style={{
                        background: reportCard.verdict === 'HIRE' ? 'rgba(34,197,94,0.1)' : reportCard.verdict === 'BORDERLINE' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${reportCard.verdict === 'HIRE' ? 'rgba(34,197,94,0.3)' : reportCard.verdict === 'BORDERLINE' ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 800, flexShrink: 0,
                        color: reportCard.verdict === 'HIRE' ? '#22c55e' : reportCard.verdict === 'BORDERLINE' ? '#fbbf24' : '#ef4444'
                      }}>
                        {reportCard.verdict === 'HIRE' ? '✅ HIRE' : reportCard.verdict === 'BORDERLINE' ? '🔶 BORDERLINE' : '❌ NO HIRE'}
                      </div>
                    </div>

                    {/* Score Bars */}
                    {[
                      { label: 'Code Quality', value: reportCard.codeQuality || 0, color: '#a855f7' },
                      { label: 'Readability', value: reportCard.readability || 0, color: '#60a5fa' },
                      { label: 'Problem Solving', value: reportCard.problemSolving || 0, color: '#22c55e' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}/100</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 2 }} />
                        </div>
                      </div>
                    ))}

                    {/* Quick stats row */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: reportCard.verdict === 'HIRE' ? '#22c55e' : '#fbbf24', fontFamily: 'Outfit' }}>{reportCard.hireScore}</div>
                        <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>HIRE SCORE</div>
                      </div>
                      {reportCard.topStrength && (
                        <div style={{ flex: 2, background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)', borderRadius: 8, padding: '8px', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: '#86efac' }}>✓ {reportCard.topStrength}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>Report unavailable.</div>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Action Buttons */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.95) 30%)',
        padding: '24px 20px 20px', zIndex: 102,
        display: 'flex', justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', gap: 12, maxWidth: 400, width: '100%' }}>
          <button onClick={onLobby} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>🏠 Lobby</button>
          <button onClick={onLobby} style={{ flex: 1, background: 'linear-gradient(135deg, #ff6b35, #f7451d)', border: 'none', color: 'var(--text-main)', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>⚔️ Play Again</button>
        </div>
      </div>

      <style>{`
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}