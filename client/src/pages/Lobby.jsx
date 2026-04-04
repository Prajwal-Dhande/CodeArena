import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Matchmaking from '../components/battle/Matchmaking'
import API_URL from '../config/api'

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']
const TOPICS = ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Stack']

const diffColor = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
}

// ✅ ProblemModal Component
const ProblemModal = ({ title, subtitle, borderColor, accentColor, selectedP, onSelect, diff, setDiff, topic, setTopic, onPlay, onClose, btnLabel, problems }) => {
  const list = problems.filter(p =>
    (diff === 'All' || p.difficulty === diff) &&
    (topic === 'All' || p.category === topic)
  )

  const dColor = {
    Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
    Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #141418 0%, #0f0f14 100%)',
        border: `1px solid ${borderColor}`,
        borderRadius: 24, width: '92%', maxWidth: 720,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,0.9)`
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${accentColor}08, transparent)`
        }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 24, color: '#fff', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: '#555' }}>{subtitle}</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#666', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.2)'
        }}>
          {[
            { val: diff, set: setDiff, opts: ['All', 'Easy', 'Medium', 'Hard'] },
            { val: topic, set: setTopic, opts: ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Stack'] },
          ].map(({ val, set, opts }, i) => (
            <select key={i} value={val} onChange={e => set(e.target.value)} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#ccc', padding: '8px 14px', borderRadius: 10,
              fontSize: 12, fontWeight: 600, outline: 'none', cursor: 'pointer', fontFamily: 'Inter'
            }}>
              {opts.map(o => <option key={o} style={{ background: '#1a1a1a' }}>{o}</option>)}
            </select>
          ))}
          <div style={{
            marginLeft: 'auto', fontSize: 12, color: '#444', fontWeight: 600,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            padding: '6px 12px', borderRadius: 8
          }}>{list.length} problems</div>
        </div>

        {/* Problem List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No problems found</div>
              <div style={{ fontSize: 12 }}>Try changing the filters above</div>
            </div>
          ) : list.map((p, idx) => (
            <div key={p._id || idx} onClick={() => onSelect(p)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              background: selectedP?._id === p._id ? `${accentColor}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selectedP?._id === p._id ? accentColor + '50' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
              transform: selectedP?._id === p._id ? 'translateX(4px)' : 'none'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: dColor[p.difficulty]?.bg,
                border: `1px solid ${dColor[p.difficulty]?.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: dColor[p.difficulty]?.color, fontFamily: 'Outfit'
              }}>{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: '#555', display: 'flex', gap: 8 }}>
                  <span>{p.category}</span><span>·</span>
                  <span>{p.acceptance}% acceptance</span>
                  {p.companies?.[0] && <><span>·</span><span style={{ color: '#444' }}>{p.companies[0]}</span></>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                  background: dColor[p.difficulty]?.bg, color: dColor[p.difficulty]?.color,
                  border: `1px solid ${dColor[p.difficulty]?.border}`
                }}>{p.difficulty}</span>
                {selectedP?._id === p._id && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#fff', fontWeight: 800
                  }}>✓</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(0,0,0,0.3)'
        }}>
          {selectedP ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
              <span style={{ fontSize: 13, color: '#888' }}>
                Selected: <strong style={{ color: accentColor }}>{selectedP.title}</strong>
                <span style={{ color: '#444', marginLeft: 6 }}>({selectedP.difficulty})</span>
              </span>
            </div>
          ) : (
            <div style={{ flex: 1, fontSize: 13, color: '#444' }}>Select a problem to continue</div>
          )}
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: '#555', borderRadius: 12, padding: '12px 24px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter'
          }}>Cancel</button>
          <button onClick={onPlay} disabled={!selectedP} style={{
            background: selectedP ? accentColor : 'rgba(255,255,255,0.04)',
            color: selectedP ? '#fff' : '#444',
            border: 'none', borderRadius: 12, padding: '12px 28px',
            cursor: selectedP ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, fontFamily: 'Inter',
            boxShadow: selectedP ? `0 4px 20px ${accentColor}40` : 'none',
            transition: 'all 0.2s'
          }}>{btnLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function Lobby() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'quickplay'
  const [tab, setTab] = useState(initialTab)
  const [problems, setProblems] = useState([])
  const [problemsLoading, setProblemsLoading] = useState(true)
  const [diffFilter, setDiffFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [onlineCount, setOnlineCount] = useState(247)
  const [pulse, setPulse] = useState(false)
  const [timeLimit, setTimeLimit] = useState('20 min')
  const [roomType, setRoomType] = useState('public')
  const [showMatchmaking, setShowMatchmaking] = useState(false)
  const [matchmakingMode, setMatchmakingMode] = useState('random')

  const [showRankedList, setShowRankedList] = useState(false)
  const [rankedDiff, setRankedDiff] = useState('All')
  const [rankedTopic, setRankedTopic] = useState('All')
  const [rankedSelected, setRankedSelected] = useState(null)

  const [showPracticeList, setShowPracticeList] = useState(false)
  const [practiceDiff, setPracticeDiff] = useState('All')
  const [practiceTopic, setPracticeTopic] = useState('All')
  const [practiceSelected, setPracticeSelected] = useState(null)

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const initials = (user?.username || 'PL').slice(0, 2).toUpperCase()

  const [dailyPuzzles, setDailyPuzzles] = useState([]);
  const [puzzlesLoading, setPuzzlesLoading] = useState(true);

  // Sync tab with URL search params
  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && urlTab !== tab) {
      setTab(urlTab)
    }
  }, [searchParams])

  // Sync profile data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      }).catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/problems`)
      .then(r => r.json())
      .then(d => setProblems(d.problems || []))
      .catch(() => setProblems([]))
      .finally(() => setProblemsLoading(false))
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/puzzles`) 
      .then(r => r.json())
      .then(data => setDailyPuzzles(data))
      .catch(err => console.error(err))
      .finally(() => setPuzzlesLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(c => Math.max(200, c + Math.floor(Math.random() * 3) - 1))
      setPulse(true)
      setTimeout(() => setPulse(false), 500)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const filtered = (diff, topic) => problems.filter(p =>
    (diff === 'All' || p.difficulty === diff) &&
    (topic === 'All' || p.category === topic)
  )

  const handleQuickPlay = () => {
    if (!user?.username) { navigate('/auth'); return }
    if (problems.length === 0) return
    setMatchmakingMode('random')
    setShowMatchmaking(true)
  }

  const handleRankedClick = () => {
    if (!user?.username) { navigate('/auth'); return }
    setRankedSelected(null)
    setShowRankedList(true)
  }

  const handleRankedPlay = () => {
    if (!rankedSelected) return
    setShowRankedList(false)
    setMatchmakingMode('ranked')
    setShowMatchmaking(true)
  }

  const handlePracticeClick = () => {
    if (!user?.username) { navigate('/auth'); return }
    setPracticeSelected(null)
    setShowPracticeList(true)
  }

  const handlePracticePlay = () => {
    if (!practiceSelected) return
    setShowPracticeList(false)
    navigate(`/battle?problem=${practiceSelected.slug}&room=practice-${Date.now()}&bot=PracticeBot&practice=true`)
  }

  const handlePuzzleClick = (id) => {
    navigate(`/puzzle?id=${id}`); 
  }

  const handleMatchFound = (matchData) => {
    setShowMatchmaking(false)
    if (matchData.isReal) {
      const roomId = matchData.roomId
      const problemSlug = matchData.problemSlug || problems[Math.floor(Date.now() / 30000) % problems.length]?.slug || 'two-sum'
      navigate(`/battle?problem=${problemSlug}&room=${roomId}&real=true`)
      return
    }
    const roomId = `${matchmakingMode}-${Math.floor(Date.now() / 30000)}`
    let prob = matchmakingMode === 'ranked' && rankedSelected ? rankedSelected : problems[Math.floor(Date.now() / 30000) % problems.length]
    navigate(`/battle?problem=${prob.slug}&room=${roomId}&bot=${matchData.name}`)
  }

  const handleCreateRoom = () => {
    if (!selectedProblem) return
    setCreating(true)
    setTimeout(() => navigate(`/battle?problem=${selectedProblem.slug}&room=room-${Math.random().toString(36).slice(2, 8)}`), 1500)
  }

  const handleJoinRoom = () => {
    if (roomCode.trim().length < 4) return
    setJoining(true)
    setTimeout(() => navigate(`/battle?room=${roomCode.trim()}`), 1200)
  }

  // ✅ Calculation for Sprint Progress
  const solvedCount = dailyPuzzles.filter(p => user?.solvedPuzzles?.some(id => String(id) === String(p._id || p.id))).length;
  const totalPuzzles = dailyPuzzles.length > 0 ? dailyPuzzles.length : 10;
  const isSprintComplete = dailyPuzzles.length > 0 && solvedCount >= totalPuzzles;
  
  // Find the first puzzle they haven't solved yet to resume
  const nextUnsolvedId = dailyPuzzles.find(p => !user?.solvedPuzzles?.some(id => String(id) === String(p._id || p.id)))?._id || dailyPuzzles[0]?._id;

  const filteredProblems = filtered(diffFilter, topicFilter)

  return (
    <div className="lobby-wrapper">

      {showMatchmaking && <Matchmaking user={user} onMatchFound={handleMatchFound} onCancel={() => setShowMatchmaking(false)} />}
      
      {showRankedList && <ProblemModal title="🎯 Ranked Arena — Select Problem" subtitle="Choose your battlefield wisely. Higher difficulty = more ELO." borderColor="rgba(168,85,247,0.4)" accentColor="#a855f7" selectedP={rankedSelected} onSelect={setRankedSelected} diff={rankedDiff} setDiff={setRankedDiff} topic={rankedTopic} setTopic={setRankedTopic} onPlay={handleRankedPlay} onClose={() => setShowRankedList(false)} btnLabel="⚔️ Enter Ranked Arena" problems={problems} />}
      
      {showPracticeList && <ProblemModal title="🧠 Practice Mode — Select Problem" subtitle="Solo training against an AI bot. No ELO at stake." borderColor="rgba(34,197,94,0.4)" accentColor="#22c55e" selectedP={practiceSelected} onSelect={setPracticeSelected} diff={practiceDiff} setDiff={setPracticeDiff} topic={practiceTopic} setTopic={setPracticeTopic} onPlay={handlePracticePlay} onClose={() => setShowPracticeList(false)} btnLabel="🧠 Start Practice" problems={problems} />}

      <div className="bg-glow orange-glow" />
      <div className="bg-glow purple-glow" />

      {/* NAV */}
      <nav className="glass-nav">
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35' }}>Code</span>
          <span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div className="nav-divider" />
        <span className="nav-subtitle">Battle Lobby</span>
        <div style={{ flex: 1 }} />
        <div className="nav-links">
          <span onClick={() => navigate('/leaderboard')}>Leaderboard</span>
          <span onClick={() => navigate('/profile')}>Profile</span>
        </div>
        <div className="online-badge">
          <div className={`status-dot ${pulse ? 'pulse-anim' : ''}`} />
          <span><span className="text-green">{onlineCount}</span> online</span>
        </div>
        <div className="user-chip" onClick={() => navigate('/profile')}>
          <div className="rank-icon">🥉 Bronze</div>
          <div className="avatar">{initials}</div>
          <span className="username">{user?.username || 'Player_01'}</span>
        </div>
      </nav>

      <div className="lobby-container">
        <div className="lobby-header">
          <h1 className="page-title text-gradient">Battle Arena</h1>
          <p className="page-subtitle">Choose your training mode. Master algorithms with structured tracks or test your speed with live coding battles.</p>
        </div>

        <div className="tab-wrapper">
          <div className="tab-container">
            {[
              { id: 'quickplay', label: '⚡ Quick Play' },
              { id: 'puzzles', label: '🧩 Puzzles' },
              { id: 'create', label: '+ Create Room' },
              { id: 'join', label: '🔗 Join Room' },
              { id: 'live', label: '👁 Watch Live' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'quickplay' && (
          <div className="mode-grid">
            <div className="premium-card">
              <div className="pc-top">
                <div className="pc-icon-box bg-orange"><span>⚡</span></div>
                <div className="pc-title-area">
                  <h3 className="pc-title">Random Battle</h3>
                  <span className="pc-subtitle text-orange">Matchmaking Training</span>
                </div>
              </div>
              <p className="pc-desc">Get matched instantly with a player of similar ELO. Race against the clock in live 1v1 algorithmic combat.</p>
              <div className="pc-stats">
                <div className="pc-stat-item"><span className="pc-stat-icon">⏱</span><div className="pc-stat-text">Instant Queue<br /><span className="text-xs">Under 10s</span></div></div>
                <div className="pc-stat-item"><span className="pc-stat-icon">🏆</span><div className="pc-stat-text">ELO Rated<br /><span className="text-xs">Gain/Loss</span></div></div>
              </div>
              <button onClick={handleQuickPlay} disabled={problemsLoading} className="pc-btn btn-orange">
                {problemsLoading ? '⟳ Loading...' : '⚡ Enter Random Battle'}
              </button>
            </div>

            <div className="premium-card">
              <div className="pc-top">
                <div className="pc-icon-box bg-purple"><span>🎯</span></div>
                <div className="pc-title-area">
                  <h3 className="pc-title">Ranked Match</h3>
                  <span className="pc-subtitle text-purple">Competitive Training</span>
                </div>
              </div>
              <p className="pc-desc">Compete in high-stakes ranked mode. Choose your problem, win to climb the global leaderboard. Stakes are real.</p>
              <div className="pc-stats">
                <div className="pc-stat-item"><span className="pc-stat-icon">⚔️</span><div className="pc-stat-text">You Choose<br /><span className="text-xs">Any Problem</span></div></div>
                <div className="pc-stat-item"><span className="pc-stat-icon">💀</span><div className="pc-stat-text">High Stakes<br /><span className="text-xs">Global Rank</span></div></div>
              </div>
              <button onClick={handleRankedClick} disabled={problemsLoading} className="pc-btn btn-purple">
                {problemsLoading ? '⟳ Loading...' : '🎯 Select Problem & Play'}
              </button>
            </div>

            <div className="premium-card">
              <div className="pc-top">
                <div className="pc-icon-box bg-green"><span>🧠</span></div>
                <div className="pc-title-area">
                  <h3 className="pc-title" style={{ color: '#22c55e' }}>Practice Mode</h3>
                  <span className="pc-subtitle">Solo Training</span>
                </div>
              </div>
              <p className="pc-desc">Solo mode against an AI bot. Choose any problem, practice at your own pace. No ELO at stake.</p>
              <button onClick={handlePracticeClick} disabled={problemsLoading} className="pc-btn btn-green" style={{ marginTop: 'auto' }}>
                {problemsLoading ? '⟳ Loading...' : '🧠 Choose Problem'}
              </button>
            </div>

            <div className="premium-card" style={{ opacity: 0.5 }}>
              <div className="pc-top">
                <div className="pc-icon-box bg-blue"><span>🏆</span></div>
                <div className="pc-title-area">
                  <h3 className="pc-title" style={{ color: '#3b82f6' }}>Tournaments</h3>
                  <span className="pc-subtitle">Events</span>
                </div>
              </div>
              <p className="pc-desc">Join scheduled tournaments. Bracket-style elimination. Winners take the ultimate prize and badges.</p>
              <button disabled className="pc-btn btn-disabled" style={{ marginTop: 'auto' }}>Coming Soon</button>
            </div>
          </div>
        )}

        {/* ✅ PUZZLES SECTION — REAL PUZZLES FROM DATABASE */}
        {tab === 'puzzles' && (
          <div className="puzzles-section animate-fade-in">
            <div className="puzzles-header">
              <h2 className="section-title text-cyan">Daily Brain Teasers</h2>
              <p className="section-subtitle">Test your logic and dry-run skills. New puzzles rotate every 24 hours — solve all {totalPuzzles} to complete today's sprint.</p>
            </div>

            {/* Sprint Progress Bar */}
            {!puzzlesLoading && dailyPuzzles.length > 0 && (
              <div className="sprint-progress-bar">
                <div className="sprint-progress-info">
                  <span className="sprint-label">🏃 Sprint Progress</span>
                  <span className="sprint-count">{solvedCount}/{totalPuzzles}</span>
                </div>
                <div className="sprint-track">
                  <div className="sprint-fill" style={{ width: `${(solvedCount / totalPuzzles) * 100}%` }} />
                </div>
                {isSprintComplete && <div className="sprint-complete-msg">🎉 Sprint Complete! Come back tomorrow for new puzzles.</div>}
              </div>
            )}
            
            <div className="puzzle-grid">
              {puzzlesLoading ? (
                 <div style={{ color: '#0ea5e9', padding: '20px' }}>⟳ Loading Brain Teasers...</div>
              ) : dailyPuzzles.length === 0 ? (
                 <div style={{ color: '#666', padding: '40px', textAlign: 'center' }}>
                   <div style={{ fontSize: 40, marginBottom: 12 }}>🧩</div>
                   <div style={{ fontWeight: 600, marginBottom: 6 }}>No puzzles available</div>
                   <div style={{ fontSize: 12 }}>Check back soon — new puzzles are being added!</div>
                 </div>
              ) : (
                dailyPuzzles.map((p, idx) => {
                  const pid = String(p._id || p.id);
                  const isSolved = user?.solvedPuzzles?.some(id => String(id) === pid);
                  const catIcons = {
                    'Code Output': '💻', 'Complexity Analysis': '⏱️', 'Bug Hunt': '🐛',
                    'Data Structure': '🗂️', 'Algorithm ID': '🎯', 'Logic Puzzle': '🧠',
                    'Pattern Recognition': '🔍'
                  };
                  const catColors = {
                    'Code Output': { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)' },
                    'Complexity Analysis': { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)' },
                    'Bug Hunt': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
                    'Data Structure': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
                    'Algorithm ID': { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' },
                    'Logic Puzzle': { color: '#e879f9', bg: 'rgba(232,121,249,0.1)', border: 'rgba(232,121,249,0.3)' },
                    'Pattern Recognition': { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.3)' },
                  };
                  const cc = catColors[p.category] || { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.3)' };
                  const icon = catIcons[p.category] || '🧩';
                  const diffStyle = p.difficulty === 'Easy'
                    ? { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' }
                    : p.difficulty === 'Hard'
                    ? { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
                    : { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' };

                  return (
                    <div key={pid} className={`puzzle-card ${isSolved ? 'solved-card' : ''}`}
                      onClick={() => !isSolved && handlePuzzleClick(pid)}
                      style={{ cursor: isSolved ? 'default' : 'pointer' }}
                    >
                      <div className="puzzle-top">
                        <div className="puzzle-icon-box" style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>{icon}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <div className="puzzle-badge" style={{ color: cc.color, background: cc.bg, border: `1px solid ${cc.border}` }}>
                            {p.category?.toUpperCase()}
                          </div>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                            background: diffStyle.bg, color: diffStyle.color,
                            border: `1px solid ${diffStyle.border}`, textTransform: 'uppercase'
                          }}>{p.difficulty}</span>
                        </div>
                      </div>
                      <h3 className="puzzle-title" style={{ fontSize: 16 }}>
                        <span style={{ color: '#555', fontWeight: 400, marginRight: 6 }}>#{idx + 1}</span>
                        {p.title}
                      </h3>
                      <div className="puzzle-meta">
                        <span className="puzzle-cat">{p.category}</span>
                        <span className="puzzle-points" style={{ color: cc.color }}>+{p.xp || p.points} XP</span>
                      </div>
                      
                      {isSolved ? (
                        <button className="btn-puzzle-solved" disabled>
                          <span style={{ fontSize: 14 }}>✓</span> Solved
                        </button>
                      ) : (
                        <button className="btn-puzzle" onClick={(e) => { e.stopPropagation(); handlePuzzleClick(pid); }}
                          style={{ borderColor: cc.border, color: cc.color }}
                        >
                          Solve Now →
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {tab === 'create' && (
          <div className="create-grid">
            <div className="glass-panel">
              <div className="panel-header">
                <span className="panel-title">Select a Problem <span style={{ color: '#555', fontSize: 12 }}>({filteredProblems.length})</span></span>
                <div className="filters">
                  <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="glass-select">{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select>
                  <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="glass-select">{TOPICS.map(t => <option key={t}>{t}</option>)}</select>
                </div>
              </div>
              {problemsLoading ? <div className="loading-state">⟳ Loading problems...</div> : (
                <div className="problem-list">
                  {filteredProblems.map((p, idx) => (
                    <div key={p._id || idx} onClick={() => setSelectedProblem(p)} className={`problem-item ${selectedProblem?._id === p._id ? 'selected' : ''}`}>
                      <div className="prob-num" style={{ background: diffColor[p.difficulty]?.bg, color: diffColor[p.difficulty]?.color, borderColor: diffColor[p.difficulty]?.border }}>{idx + 1}</div>
                      <div className="prob-info"><div className="prob-name">{p.title}</div><div className="prob-meta">{p.category} · {p.acceptance}% acceptance</div></div>
                      <span className="prob-diff" style={{ background: diffColor[p.difficulty]?.bg, color: diffColor[p.difficulty]?.color, border: `1px solid ${diffColor[p.difficulty]?.border}` }}>{p.difficulty}</span>
                      {selectedProblem?._id === p._id && <span style={{ color: '#ff6b35', fontSize: 14 }}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="settings-panel glass-panel">
              <h3 className="settings-title">Room Settings</h3>
              <div style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                <div className="label-mini">YOUR ROOM CODE</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 16, fontWeight: 700, color: '#ff6b35', letterSpacing: 2, marginTop: 4 }}>{selectedProblem ? `room-${selectedProblem.slug.slice(0, 6)}` : 'Select problem first'}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Share this with your opponent</div>
              </div>
              <div className="selected-preview">
                <div className="label-mini">SELECTED PROBLEM</div>
                {selectedProblem ? (
                  <div><div className="prev-title">{selectedProblem.title}</div><div className="prev-tags"><span className="prob-diff" style={{ background: diffColor[selectedProblem.difficulty]?.bg, color: diffColor[selectedProblem.difficulty]?.color, border: `1px solid ${diffColor[selectedProblem.difficulty]?.border}` }}>{selectedProblem.difficulty}</span><span style={{ fontSize: 11, color: '#555' }}>{selectedProblem.category}</span></div></div>
                ) : <span style={{ fontSize: 13, color: '#555' }}>None selected</span>}
              </div>
              <div className="setting-group">
                <label className="label-mini">TIME LIMIT</label>
                <div className="toggle-group">{['10 min', '20 min', '30 min'].map(t => <button key={t} onClick={() => setTimeLimit(t)} className={`toggle-btn ${timeLimit === t ? 'active-orange' : ''}`}>{t}</button>)}</div>
              </div>
              <div className="setting-group">
                <label className="label-mini">ROOM TYPE</label>
                <div className="toggle-group">{[{ id: 'public', label: '🌐 Public' }, { id: 'private', label: '🔒 Private' }].map(({ id, label }) => <button key={id} onClick={() => setRoomType(id)} className={`toggle-btn ${roomType === id ? 'active-orange' : ''}`}>{label}</button>)}</div>
              </div>
              <button onClick={handleCreateRoom} disabled={!selectedProblem || creating} className={`btn-primary-full ${(!selectedProblem || creating) ? 'disabled' : ''}`}>
                {creating ? '⟳ Creating room...' : !selectedProblem ? 'Select a problem first' : '⚡ Create Battle Room'}
              </button>
            </div>
          </div>
        )}

        {tab === 'join' && (
          <div className="join-container glass-panel">
            <div className="join-icon">🔗</div>
            <h2 className="join-title">Join a Private Room</h2>
            <p className="join-desc">Enter the room code shared by your opponent to enter the arena.</p>
            <label className="label-mini">ROOM CODE</label>
            <input placeholder="e.g. room-abc123" value={roomCode} onChange={e => setRoomCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleJoinRoom()} className="join-input" />
            <button onClick={handleJoinRoom} disabled={roomCode.trim().length < 4 || joining} className={`btn-primary-full ${(roomCode.trim().length < 4 || joining) ? 'disabled' : ''}`}>
              {joining ? '⟳ Joining...' : '→ Join Room'}
            </button>
            <div className="join-hint">💡 Ask your opponent to share their room code from the Create Room tab.</div>
          </div>
        )}

        {tab === 'live' && (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👁</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Watch Live Battles</h2>
            <p style={{ color: '#666', fontSize: 13 }}>Live spectating coming soon!</p>
          </div>
        )}
      </div>

      <style>{`
        :root { --bg: #09090b; --glass-border: rgba(255,255,255,0.06); --orange: #ff6b35; --purple: #a855f7; --green: #22c55e; --blue: #3b82f6; --cyan: #0ea5e9; --text-main: #f8fafc; --text-muted: #9ca3af; }
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .lobby-wrapper { min-height: 100vh; background: var(--bg); font-family: Inter, sans-serif; color: var(--text-main); position: relative; overflow-x: hidden; }
        .bg-glow { position: fixed; width: 50vw; height: 50vw; border-radius: 50%; filter: blur(120px); z-index: 0; pointer-events: none; }
        .orange-glow { top: -10%; left: -10%; background: radial-gradient(circle, #ff6b35 0%, transparent 70%); opacity: 0.12; }
        .purple-glow { bottom: -10%; right: -10%; background: radial-gradient(circle, #a855f7 0%, transparent 70%); opacity: 0.08; }
        .glass-nav { height: 60px; background: rgba(9,9,11,0.8); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); display: flex; align-items: center; padding: 0 28px; gap: 16px; position: sticky; top: 0; z-index: 50; }
        .logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 18px; cursor: pointer; letter-spacing: -0.5px; }
        .nav-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.1); }
        .nav-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .nav-links { display: flex; gap: 16px; font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .nav-links span { cursor: pointer; transition: color 0.2s; }
        .nav-links span:hover { color: var(--text-main); }
        .online-badge { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 20px; padding: 6px 14px; font-size: 12px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); transition: transform 0.2s; }
        .pulse-anim { transform: scale(1.4); }
        .text-green { color: var(--green); font-weight: 700; }
        .user-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 20px; padding: 4px 14px 4px 10px; cursor: pointer; transition: background 0.2s; }
        .user-chip:hover { background: rgba(255,255,255,0.08); }
        .rank-icon { font-size: 11px; color: #d97706; font-weight: 600; padding-right: 8px; border-right: 1px solid rgba(255,255,255,0.1); }
        .avatar { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, var(--orange), #f7451d); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .username { font-size: 12px; font-weight: 600; }
        .lobby-container { max-width: 1000px; margin: 0 auto; padding: 60px 24px; position: relative; z-index: 10; }
        .lobby-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-family: Outfit, sans-serif; font-weight: 900; font-size: 46px; margin: 0 0 12px 0; letter-spacing: -1px; }
        .text-gradient { background: linear-gradient(90deg, #ff6b35, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .page-subtitle { font-size: 15px; color: var(--text-muted); max-width: 600px; line-height: 1.6; margin: 0 auto; }
        .tab-wrapper { display: flex; justify-content: center; margin-bottom: 40px; }
        .tab-container { display: flex; gap: 8px; background: rgba(20,20,25,0.4); border: 1px solid var(--glass-border); border-radius: 12px; padding: 6px; }
        .tab-btn { padding: 10px 24px; font-size: 13px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { background: rgba(255,255,255,0.08); color: #fff; }
        .mode-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .premium-card { background: linear-gradient(160deg, rgba(30,30,35,0.6) 0%, rgba(15,15,20,0.8) 100%); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 36px 32px 32px; display: flex; flex-direction: column; transition: transform 0.3s, border-color 0.3s; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        .premium-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.1); }
        .pc-top { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .pc-icon-box { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
        .bg-orange { background: linear-gradient(135deg, rgba(255,107,53,0.2), rgba(249,115,22,0.05)); border: 1px solid rgba(255,107,53,0.3); }
        .bg-purple { background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.05)); border: 1px solid rgba(168,85,247,0.3); }
        .bg-green { background: linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.05)); border: 1px solid rgba(34,197,94,0.3); }
        .bg-blue { background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.05)); border: 1px solid rgba(59,130,246,0.3); }
        .pc-title { font-family: Outfit, sans-serif; font-weight: 800; font-size: 22px; margin: 0; color: #fff; }
        .pc-subtitle { font-size: 13px; font-weight: 600; }
        .text-orange { color: var(--orange); } .text-purple { color: var(--purple); }
        .pc-desc { font-size: 14px; color: #a1a1aa; line-height: 1.7; margin: 0 0 28px 0; flex: 1; }
        .pc-stats { display: flex; justify-content: space-between; margin-bottom: 28px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
        .pc-stat-item { display: flex; align-items: center; gap: 12px; }
        .pc-stat-icon { font-size: 18px; opacity: 0.8; }
        .pc-stat-text { font-size: 12px; font-weight: 600; color: #d1d5db; line-height: 1.4; }
        .text-xs { font-size: 11px; color: #6b7280; }
        .pc-btn { width: 100%; padding: 16px 0; border: none; border-radius: 12px; font-weight: 700; font-size: 14px; color: #fff; cursor: pointer; transition: all 0.2s; font-family: Inter; }
        .pc-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-orange { background: linear-gradient(90deg, #ff6b35, #f97316); box-shadow: 0 4px 20px rgba(255,107,53,0.3); }
        .btn-orange:hover:not(:disabled) { box-shadow: 0 8px 25px rgba(255,107,53,0.5); transform: translateY(-1px); }
        .btn-purple { background: linear-gradient(90deg, #a855f7, #8b5cf6); box-shadow: 0 4px 20px rgba(168,85,247,0.3); }
        .btn-purple:hover:not(:disabled) { box-shadow: 0 8px 25px rgba(168,85,247,0.5); transform: translateY(-1px); }
        .btn-green { background: rgba(34,197,94,0.1); color: var(--green); border: 1px solid rgba(34,197,94,0.3); }
        .btn-green:hover:not(:disabled) { background: rgba(34,197,94,0.2); }
        .btn-disabled { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid rgba(255,255,255,0.1); cursor: not-allowed; }
        .create-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
        .glass-panel { background: rgba(20,20,25,0.6); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 24px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .panel-title { font-size: 14px; font-weight: 600; }
        .filters { display: flex; gap: 10px; }
        .glass-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 6px 12px; border-radius: 8px; font-size: 12px; outline: none; cursor: pointer; }
        .loading-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px; }
        .problem-list { display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; }
        .problem-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 12px; cursor: pointer; transition: all 0.15s; }
        .problem-item:hover { border-color: rgba(255,255,255,0.15); }
        .problem-item.selected { background: rgba(255,107,53,0.05); border-color: var(--orange); }
        .prob-num { width: 32px; height: 32px; border-radius: 8px; border: 1px solid; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .prob-info { flex: 1; }
        .prob-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .prob-meta { font-size: 11px; color: var(--text-muted); }
        .prob-diff { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
        .settings-panel { position: sticky; top: 80px; height: fit-content; }
        .settings-title { font-family: Outfit; font-size: 18px; font-weight: 700; margin: 0 0 24px 0; }
        .label-mini { font-size: 10px; color: var(--text-muted); font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block; }
        .selected-preview { background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 20px; min-height: 72px; }
        .prev-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
        .prev-tags { display: flex; gap: 8px; align-items: center; }
        .setting-group { margin-bottom: 20px; }
        .toggle-group { display: flex; gap: 8px; }
        .toggle-btn { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 10px 0; border-radius: 8px; color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .toggle-btn.active-orange { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.3); color: var(--orange); }
        .btn-primary-full { width: 100%; background: linear-gradient(135deg, var(--orange), #f97316); color: white; border: none; border-radius: 10px; padding: 14px 0; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: Inter; }
        .btn-primary-full:hover:not(.disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary-full.disabled { background: rgba(255,255,255,0.05); color: #555; cursor: not-allowed; transform: none; }
        .join-container { max-width: 460px; margin: 0 auto; padding: 40px; text-align: center; }
        .join-icon { width: 64px; height: 64px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
        .join-title { font-family: Outfit; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; }
        .join-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }
        .join-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 10px; padding: 14px; font-size: 16px; color: #fff; font-family: 'JetBrains Mono', monospace; text-align: center; letter-spacing: 2px; outline: none; margin-bottom: 20px; transition: border 0.2s; }
        .join-input:focus { border-color: var(--orange); }
        .join-hint { margin-top: 20px; font-size: 12px; color: #555; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; }
        @media (max-width: 800px) { .mode-grid { grid-template-columns: 1fr; } .create-grid { grid-template-columns: 1fr; } .page-title { font-size: 32px; } }

        /* ✅ Puzzles Section CSS */
        .puzzles-section { width: 100%; margin-top: 10px; animation: fadeIn 0.4s ease-out; }
        .puzzles-header { margin-bottom: 24px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; }
        .section-title { font-family: Outfit, sans-serif; font-size: 28px; font-weight: 800; margin: 0 0 8px 0; }
        .section-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
        
        .puzzle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        
        .puzzle-card { background: rgba(20,20,25,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(14,165,233,0.15); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; transition: all 0.3s; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .puzzle-card:hover:not(.solved-card) { transform: translateY(-4px); border-color: rgba(14,165,233,0.4); box-shadow: 0 15px 35px rgba(14,165,233,0.25); }
        .solved-card { opacity: 0.5; border-color: rgba(34,197,94,0.2); background: rgba(20,25,20,0.4); filter: grayscale(50%); cursor: default; }
        
        .puzzle-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .puzzle-icon-box { width: 48px; height: 48px; background: rgba(255,255,255,0.03); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 0 20px rgba(255,255,255,0.02); }
        
        .puzzle-badge { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .puzzle-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 12px 0; font-family: Outfit, sans-serif; letter-spacing: -0.5px; }
        
        .puzzle-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; font-size: 12px; }
        .puzzle-cat { color: var(--text-muted); font-weight: 600; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; }
        .puzzle-points { font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        
        .btn-puzzle { width: 100%; background: transparent; border: 1px solid var(--cyan); color: var(--cyan); padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; margin-top: auto; font-family: Inter, sans-serif; }
        .btn-puzzle:hover { background: currentColor; color: #fff !important; box-shadow: 0 4px 20px rgba(14,165,233,0.4); transform: translateY(-1px); }
        
        .btn-puzzle-solved { width: 100%; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: var(--green); padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: not-allowed; margin-top: auto; font-family: Inter, sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; }

        /* Sprint Progress Bar */
        .sprint-progress-bar { background: rgba(20,20,25,0.6); border: 1px solid rgba(14,165,233,0.15); border-radius: 14px; padding: 20px 24px; margin-bottom: 24px; }
        .sprint-progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .sprint-label { font-size: 14px; font-weight: 700; color: #f8fafc; }
        .sprint-count { font-size: 14px; font-weight: 800; color: #0ea5e9; font-family: 'JetBrains Mono', monospace; }
        .sprint-track { width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
        .sprint-fill { height: 100%; background: linear-gradient(90deg, #0ea5e9, #22c55e); border-radius: 100px; transition: width 0.6s ease; min-width: 2px; }
        .sprint-complete-msg { text-align: center; color: #22c55e; font-weight: 700; font-size: 13px; margin-top: 12px; }

        .text-cyan { color: var(--cyan); }
      `}</style>
    </div>
  )
}