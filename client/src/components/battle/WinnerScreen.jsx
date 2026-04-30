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

    // MAANG Report Card (win AND loss, premium only)
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
  const verdictColor = !reportCard ? '#a855f7' : reportCard.verdict === 'HIRE' ? '#22c55e' : reportCard.verdict === 'BORDERLINE' ? '#fbbf24' : '#ef4444'
  const verdictBg = !reportCard ? 'rgba(168,85,247,0.08)' : reportCard.verdict === 'HIRE' ? 'rgba(34,197,94,0.08)' : reportCard.verdict === 'BORDERLINE' ? 'rgba(251,191,36,0.08)' : 'rgba(239,68,68,0.08)'
  const verdictBorder = !reportCard ? 'rgba(168,85,247,0.3)' : reportCard.verdict === 'HIRE' ? 'rgba(34,197,94,0.3)' : reportCard.verdict === 'BORDERLINE' ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'

  const ScoreBar = ({ label, value, color }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{value}/100</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: 3 }} />
      </div>
    </div>
  )

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
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px',
              width: `${Math.random() * 7 + 3}px`, height: `${Math.random() * 7 + 3}px`,
              background: ['#ff6b35','#fbbf24','#22c55e','#60a5fa','#a855f7'][i % 5],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animation: `confettiFall ${Math.random() * 2 + 2}s linear ${Math.random() * 2}s forwards`, opacity: 0
            }} />
          ))}
        </div>
      )}

      {/* Scrollable Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* ── Row 1: Result Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>{isWin ? '🏆' : '💀'}</div>
          <div style={{
            fontFamily: 'Outfit', fontWeight: 900, fontSize: 40,
            background: isWin ? 'linear-gradient(90deg, #22c55e, #86efac)' : 'linear-gradient(90deg, #ef4444, #fca5a5)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 6
          }}>{isWin ? 'Victory!' : 'Defeated!'}</div>
          <div style={{ color: '#555', fontSize: 14 }}>
            {isWin ? 'You outpaced your opponent!' : 'Better luck next time — Clara has your feedback below.'}
          </div>
        </div>

        {/* ── Row 2: ELO + Stats side by side ── */}
        <div style={{ display: 'grid', gridTemplateColumns: eloData ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
          {/* Stats */}
          <div style={{ background: '#13131a', border: `1px solid ${isWin ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 16, padding: '20px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: 1, marginBottom: 14 }}>SESSION STATS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Tests Passed', val: `${myTests}/${totalTests}`, color: '#22c55e' },
                { label: 'Time Taken', val: fmt(timeTaken), color: '#60a5fa' },
                { label: 'Difficulty', val: problem?.difficulty || 'Medium', color: '#fb923c' },
                { label: 'Opponent', val: opponentName || 'Bot', color: '#a855f7' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color, fontFamily: 'Outfit', marginBottom: 3 }}>{val}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ELO */}
          {eloData && (
            <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: 1, marginBottom: 14 }}>ELO UPDATE</div>
              {rankUp && (
                <div style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 13, fontWeight: 700, color: '#fbbf24' }}>
                  🎉 RANK UP! {eloData.oldRank} → {eloData.newRank}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { val: `${eloData.eloChange > 0 ? '+' : ''}${eloData.eloChange}`, label: 'ELO CHANGE', color: isWin ? '#22c55e' : '#ef4444' },
                  { val: eloData.newElo, label: 'NEW ELO', color: '#ff6b35' },
                  { val: `${eloData.rankInfo?.icon || ''} ${eloData.newRank}`, label: 'RANK', color: '#fbbf24' },
                ].map(({ val, label, color }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: 'Outfit' }}>{val}</div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Row 3: Complexity ── */}
        {(complexity || timeComplexity) && (
          <div style={{ background: 'linear-gradient(135deg, rgba(255,107,53,0.07), rgba(251,191,36,0.07))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#ff6b35', letterSpacing: 1, marginBottom: 12 }}>⚡ YOUR SOLUTION ANALYSIS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', fontFamily: 'Outfit' }}>{complexity?.time || timeComplexity || 'O(N)'}</div>
                <div style={{ fontSize: 10, color: '#555' }}>TIME COMPLEXITY</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#60a5fa', fontFamily: 'Outfit' }}>{complexity?.space || 'O(N)'}</div>
                <div style={{ fontSize: 10, color: '#555' }}>SPACE COMPLEXITY</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Row 4: Premium — Radar + Clara Feedback side by side ── */}
        {premiumMode && isWin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Radar */}
            <PremiumRadarChart timeTaken={timeTaken} totalTests={totalTests} passed={myTests} language={language} />

            {/* Clara Feedback */}
            <div style={{ background: 'linear-gradient(180deg, rgba(236,72,153,0.06), rgba(10,10,12,0.98))', border: '1px solid rgba(236,72,153,0.25)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ec4899, #ff6b35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🤖</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>Clara AI Review</div>
                  <div style={{ fontSize: 10, color: '#ec4899', letterSpacing: 1 }}>MAANG EXPERT INTERVIEWER</div>
                </div>
              </div>
              {aiLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#ec4899' }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(236,72,153,0.3)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12 }}>Analyzing code structure...</span>
                </div>
              ) : aiFeedback ? (
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', padding: '12px', borderRadius: 10 }}>
                    <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700, marginBottom: 8 }}>✓ Strengths</div>
                    <ul style={{ margin: 0, paddingLeft: 16, color: '#bbb', fontSize: 12, lineHeight: 1.7 }}>{aiFeedback.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                  <div style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)', padding: '12px', borderRadius: 10 }}>
                    <div style={{ fontSize: 12, color: '#ff6b35', fontWeight: 700, marginBottom: 8 }}>⚠️ Improvements</div>
                    <ul style={{ margin: 0, paddingLeft: 16, color: '#bbb', fontSize: 12, lineHeight: 1.7 }}>{aiFeedback.improvements?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                  {aiFeedback.optimalCode && (
                    <div style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)', padding: '12px', borderRadius: 10 }}>
                      <div style={{ fontSize: 12, color: '#60a5fa', fontWeight: 700, marginBottom: 8 }}>💡 Optimal Approach</div>
                      <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: 6, fontSize: 11, overflowX: 'auto', color: '#a78bfa', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}><code>{aiFeedback.optimalCode}</code></pre>
                    </div>
                  )}
                </div>
              ) : <div style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 20 }}>Feedback unavailable.</div>}
            </div>
          </div>
        )}

        {/* ── Row 5: MAANG Report Card (premium, win + loss) ── */}
        {premiumMode && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(10,10,15,0.98), rgba(15,10,25,0.98))',
            border: `1px solid ${verdictBorder}`,
            borderRadius: 20, padding: '28px', marginBottom: 20,
            boxShadow: `0 20px 60px ${verdictBg}`
          }}>
            {/* Report Card Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 24 }}>🏢</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: 'Outfit' }}>MAANG Report Card</div>
                  <div style={{ fontSize: 10, color: '#555', letterSpacing: 1 }}>AI-POWERED INTERVIEW EVALUATION • PREMIUM</div>
                </div>
              </div>
              {reportLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a855f7' }}>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(168,85,247,0.3)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: 12 }}>Clara is evaluating...</span>
                </div>
              ) : reportCard && (
                <div style={{ background: verdictBg, border: `2px solid ${verdictBorder}`, borderRadius: 10, padding: '8px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: verdictColor, fontFamily: 'Outfit', letterSpacing: 1 }}>
                    {reportCard.verdict === 'HIRE' ? '✅ HIRE' : reportCard.verdict === 'BORDERLINE' ? '🔶 BORDERLINE' : '❌ NO HIRE'}
                  </div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>FAANG VERDICT</div>
                </div>
              )}
            </div>

            {reportLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : reportCard ? (
              <div>
                {/* Verdict Reason */}
                <div style={{ background: verdictBg, border: `1px solid ${verdictBorder}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.7, fontStyle: 'italic' }}>"{reportCard.verdictReason}"</div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {reportCard.topStrength && <div style={{ fontSize: 12, color: '#22c55e' }}>✓ <strong>Strength:</strong> {reportCard.topStrength}</div>}
                    {reportCard.criticalFlaw && <div style={{ fontSize: 12, color: '#ef4444' }}>⚠ <strong>Fix:</strong> {reportCard.criticalFlaw}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Left: Score Bars */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#555', letterSpacing: 1, marginBottom: 14 }}>PERFORMANCE SCORES</div>
                    <ScoreBar label="Code Quality" value={reportCard.codeQuality || 0} color="#a855f7" />
                    <ScoreBar label="Readability" value={reportCard.readability || 0} color="#60a5fa" />
                    <ScoreBar label="Problem Solving" value={reportCard.problemSolving || 0} color="#22c55e" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: verdictColor, fontFamily: 'Outfit' }}>{reportCard.hireScore}</div>
                        <div style={{ fontSize: 9, color: '#555' }}>HIRE SCORE</div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', fontFamily: 'Outfit' }}>Top {100 - (reportCard.speedPercentile || 50)}%</div>
                        <div style={{ fontSize: 9, color: '#555' }}>SPEED RANK</div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Company Fit */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#555', letterSpacing: 1, marginBottom: 14 }}>COMPANY FIT ANALYSIS</div>
                    {[
                      { name: 'Google',    key: 'google',    color: '#4285f4', emoji: '🔵' },
                      { name: 'Amazon',    key: 'amazon',    color: '#ff9900', emoji: '🟠' },
                      { name: 'Microsoft', key: 'microsoft', color: '#00a4ef', emoji: '🔷' },
                    ].map(({ name, key, color, emoji }) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#aaa' }}>{emoji} {name}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color }}>{reportCard.companyFit?.[key] || 0}%</span>
                        </div>
                        <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${reportCard.companyFit?.[key] || 0}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                    {reportCard.edgeCasesMissed !== undefined && (
                      <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '8px 12px' }}>
                        <span style={{ fontSize: 12, color: '#f87171' }}>🐛 Edge Cases Missed: <strong>{reportCard.edgeCasesMissed}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#444', fontSize: 13, textAlign: 'center', padding: 20 }}>Report card unavailable.</div>
            )}
          </div>
        )}

        {/* ── Row 6: Action Buttons ── */}
        <div style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          <button onClick={onLobby} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s' }}>🏠 Lobby</button>
          <button onClick={onLobby} style={{ flex: 1, background: 'linear-gradient(135deg, #ff6b35, #f7451d)', border: 'none', color: '#fff', borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>⚔️ Play Again</button>
        </div>

      </div>

      <style>{`
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}