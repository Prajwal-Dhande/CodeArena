import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import Matchmaking from '../components/battle/Matchmaking'
import ActivityCalendar from '../components/ActivityCalendar'
import { ThemeToggle } from '../context/ThemeContext'
import API_URL from '../config/api'

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard']
const TOPICS = ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Stack']
const STATUSES = ['All', 'Solved', 'Unsolved'] // 🔥 New Status Filter

const diffColor = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
}

// Global Solved Checker helper
const checkIsSolved = (user, p) => {
  if (!user?.solvedProblems) return false;
  return user.solvedProblems.some(sp => {
    const spId = typeof sp === 'object' ? (sp.problemId || sp._id || sp.slug) : String(sp);
    return spId === String(p._id) || spId === p.slug;
  });
};

// ✅ ProblemModal Component (Now with Status Filter & ELO Farming Protection)
const ProblemModal = ({ user, title, subtitle, borderColor, accentColor, selectedP, onSelect, diff, setDiff, topic, setTopic, status, setStatus, onPlay, onClose, btnLabel, problems, isRanked = false }) => {
  const [searchQ, setSearchQ] = useState('')

  const list = problems.filter(p => {
    const isSolved = checkIsSolved(user, p);
    const diffMatch = diff === 'All' || p.difficulty === diff;
    const topicMatch = topic === 'All' || p.category === topic;
    const searchMatch = searchQ === '' || p.title.toLowerCase().includes(searchQ.toLowerCase());
    const statusMatch = status === 'All' || (status === 'Solved' && isSolved) || (status === 'Unsolved' && !isSolved);
    return diffMatch && topicMatch && searchMatch && statusMatch;
  });

  const dColor = {
    Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
    Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  }

  // Prevent playing Ranked if already solved
  const selectedIsSolved = selectedP ? checkIsSolved(user, selectedP) : false;
  const isPlayDisabled = !selectedP || (isRanked && selectedIsSolved);
  const finalBtnLabel = (isRanked && selectedIsSolved) ? "Already Solved (No ELO)" : btnLabel;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #141418 0%, #0f0f14 100%)',
        border: `1px solid ${borderColor}`,
        borderRadius: 24, width: '92%', maxWidth: 780, // Slightly wider for 3 filters
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
          <button onClick={onClose} className="modal-close-btn">✕</button>
        </div>

        {/* Filters & Search */}
        <div style={{
          padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.2)', flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="🔍 Search problems..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="modal-search-input"
            style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', padding: '8px 14px', borderRadius: 10,
              fontSize: 12, outline: 'none', fontFamily: 'Inter', width: '200px', transition: 'all 0.2s'
            }}
          />

          {[
            { val: status, set: setStatus, opts: STATUSES, label: 'Status' },
            { val: diff, set: setDiff, opts: DIFFICULTIES, label: 'Difficulty' },
            { val: topic, set: setTopic, opts: TOPICS, label: 'Topic' },
          ].map(({ val, set, opts, label }, i) => (
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
              <div style={{ fontSize: 12 }}>Try changing your search or filters</div>
            </div>
          ) : list.map((p, idx) => {
            const isSolved = checkIsSolved(user, p);

            return (
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
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.title}
                    {isSolved && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)',
                        padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3
                      }}>
                        ✓ Solved
                      </span>
                    )}
                  </div>

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
            )
          })}
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

          <button onClick={onClose} className="modal-cancel-btn">Cancel</button>

          <button onClick={onPlay} disabled={isPlayDisabled} style={{
            background: !isPlayDisabled ? accentColor : 'rgba(255,255,255,0.04)',
            color: !isPlayDisabled ? '#fff' : '#666',
            border: isRanked && selectedIsSolved ? '1px solid rgba(255,255,255,0.1)' : 'none',
            borderRadius: 12, padding: '12px 28px',
            cursor: !isPlayDisabled ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, fontFamily: 'Inter',
            boxShadow: !isPlayDisabled ? `0 4px 20px ${accentColor}40` : 'none',
            transition: 'all 0.2s'
          }}>{finalBtnLabel}</button>
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

  // Create Room Filters
  const [diffFilter, setDiffFilter] = useState('All')
  const [topicFilter, setTopicFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All') // 🔥 Status filter for Create Room
  const [createSearchQuery, setCreateSearchQuery] = useState('')

  const [selectedProblem, setSelectedProblem] = useState(null)
  const [roomCode, setRoomCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdRoomCode, setCreatedRoomCode] = useState(null)
  const [roomCodeCopied, setRoomCodeCopied] = useState(false)
  const [joining, setJoining] = useState(false)
  const [onlineCount, setOnlineCount] = useState(247)
  const [pulse, setPulse] = useState(false)
  const [timeLimit, setTimeLimit] = useState('20 min')
  const [roomType, setRoomType] = useState('public')
  const [showMatchmaking, setShowMatchmaking] = useState(false)
  const [matchmakingMode, setMatchmakingMode] = useState('random')

  // Ranked Modal Filters
  const [showRankedList, setShowRankedList] = useState(false)
  const [rankedDiff, setRankedDiff] = useState('All')
  const [rankedTopic, setRankedTopic] = useState('All')
  const [rankedStatus, setRankedStatus] = useState('All')
  const [rankedSelected, setRankedSelected] = useState(null)

  // Practice Modal Filters
  const [showPracticeList, setShowPracticeList] = useState(false)
  const [practiceDiff, setPracticeDiff] = useState('All')
  const [practiceTopic, setPracticeTopic] = useState('All')
  const [practiceStatus, setPracticeStatus] = useState('All')
  const [practiceSelected, setPracticeSelected] = useState(null)

  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const initials = (user?.username || 'PL').slice(0, 2).toUpperCase()

  const [dailyPuzzles, setDailyPuzzles] = useState([]);
  const [puzzlesLoading, setPuzzlesLoading] = useState(true);

  useEffect(() => {
    const urlTab = searchParams.get('tab')
    if (urlTab && urlTab !== tab) {
      setTab(urlTab)
    }
  }, [searchParams])

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res.status === 401) {
            // Token expired/invalid — silently clear and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth';
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
          }
        }).catch(err => console.error(err));
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script) };
  }, []);

  // 🔥 THE ULTIMATE DEDUPLICATION: By Title (Case-Insensitive) instead of Slug
  useEffect(() => {
    fetch(`${API_URL}/api/problems`)
      .then(r => r.json())
      .then(d => {
        const allProblems = d.problems || [];
        const uniqueProblemsMap = new Map();
        allProblems.forEach(p => {
          const key = p.title.toLowerCase().trim();
          if (!uniqueProblemsMap.has(key)) {
            uniqueProblemsMap.set(key, p);
          }
        });
        setProblems(Array.from(uniqueProblemsMap.values()));
      })
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

  // Create Room Filters logic
  const filteredProblems = problems.filter(p => {
    const isSolved = checkIsSolved(user, p);
    return (diffFilter === 'All' || p.difficulty === diffFilter) &&
      (topicFilter === 'All' || p.category === topicFilter) &&
      (statusFilter === 'All' || (statusFilter === 'Solved' && isSolved) || (statusFilter === 'Unsolved' && !isSolved)) &&
      (createSearchQuery === '' || p.title.toLowerCase().includes(createSearchQuery.toLowerCase()))
  })

  const handleSearch = async (val) => {
    setSearchQuery(val)
    if (val.length < 2) { setSearchResults([]); return }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/users/search?query=${val}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await res.json()
      setSearchResults(data)
    } catch (err) { console.error(err) }
  }

  const handlePayment = async (planDetails) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    setPaymentProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ plan: planDetails.id, amount: planDetails.amount * 100 })
      });
      const data = await res.json();

      if (!data.success) throw new Error('Order creation failed');

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: 'INR',
        name: 'CodeArena',
        description: `${planDetails.name} Premium Subscription`,
        order_id: data.order.id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(response)
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            localStorage.setItem('user', JSON.stringify(verifyData.user));
            setUser(verifyData.user);
            setShowPremiumModal(false);
            alert('🎉 Premium Activated! Welcome to CodeArena Premium!');
          }
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: { color: '#ff6b35' },
        modal: { ondismiss: () => setPaymentProcessing(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment initialization failed. Please try again.');
    }
    setPaymentProcessing(false);
  };

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

    let finalProblemSlug;
    if (matchmakingMode === 'ranked' && rankedSelected) {
      finalProblemSlug = rankedSelected.slug;
    } else if (matchData.problemSlug) {
      finalProblemSlug = matchData.problemSlug;
    } else {
      const fallbackProb = problems[Math.floor(Date.now() / 30000) % problems.length];
      finalProblemSlug = fallbackProb ? fallbackProb.slug : 'contains-duplicate';
    }

    if (matchData.isReal) {
      const roomId = matchData.roomId
      navigate(`/battle?problem=${finalProblemSlug}&room=${roomId}&real=true&mode=${matchmakingMode}`)
      return
    }
    const roomId = `${matchmakingMode}-${Math.floor(Date.now() / 30000)}`
    navigate(`/battle?problem=${finalProblemSlug}&room=${roomId}&bot=${matchData.name}&mode=${matchmakingMode}`)
  }

  const handleCreateRoom = () => {
    if (!selectedProblem) return
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    setCreatedRoomCode(code)
    setRoomCodeCopied(false)
  }

  const handleStartCreatedRoom = () => {
    if (!selectedProblem || !createdRoomCode) return
    navigate(`/battle?problem=${selectedProblem.slug}&room=${createdRoomCode}`)
  }

  const handleJoinRoom = () => {
    if (roomCode.trim().length < 4) return
    setJoining(true)
    // Try to get problem from the room first, then navigate
    setTimeout(() => navigate(`/battle?room=${roomCode.trim()}`), 800)
  }

  const solvedCount = dailyPuzzles.filter(p => user?.solvedPuzzles?.some(id => String(id) === String(p._id || p.id))).length;
  const totalPuzzles = dailyPuzzles.length > 0 ? dailyPuzzles.length : 10;
  const isSprintComplete = dailyPuzzles.length > 0 && solvedCount >= totalPuzzles;

  return (
    <div className="lobby-wrapper">

      <Helmet>
        <title>{tab === 'puzzles' ? 'Daily Puzzles | CodeArena' : 'Battle Arena | CodeArena'}</title>
        <meta name="description" content="Choose your training mode. Master algorithms with structured tracks, solve daily puzzles, or test your speed with live coding battles on CodeArena." />
      </Helmet>

      {showMatchmaking && <Matchmaking user={user} onMatchFound={handleMatchFound} onCancel={() => setShowMatchmaking(false)} selectedProblem={matchmakingMode === 'ranked' ? rankedSelected : null} mode={matchmakingMode} />}

      {showRankedList && <ProblemModal user={user} title="🎯 Ranked Arena" subtitle="Choose your battlefield wisely. Higher difficulty = more ELO." borderColor="rgba(168,85,247,0.4)" accentColor="#a855f7" selectedP={rankedSelected} onSelect={setRankedSelected} diff={rankedDiff} setDiff={setRankedDiff} topic={rankedTopic} setTopic={setRankedTopic} status={rankedStatus} setStatus={setRankedStatus} onPlay={handleRankedPlay} onClose={() => setShowRankedList(false)} btnLabel="⚔️ Enter Ranked Arena" problems={problems} isRanked={true} />}

      {showPracticeList && <ProblemModal user={user} title="🧠 Practice Mode" subtitle="Solo training against an AI bot. No ELO at stake." borderColor="rgba(34,197,94,0.3)" accentColor="#22c55e" selectedP={practiceSelected} onSelect={setPracticeSelected} diff={practiceDiff} setDiff={setPracticeDiff} topic={practiceTopic} setTopic={setPracticeTopic} status={practiceStatus} setStatus={setPracticeStatus} onPlay={handlePracticePlay} onClose={() => setShowPracticeList(false)} btnLabel="🧠 Start Practice" problems={problems} isRanked={false} />}

      {/* Premium Modal */}
      {showPremiumModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="premium-overlay"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="premium-modal"
          >
            <button onClick={() => setShowPremiumModal(false)} className="close-btn">✕</button>
            <div className="premium-glow-bg" />

            <div className="premium-header">
              <div className="premium-badge">💎 CODEARENA PREMIUM</div>
              <h2 className="premium-title">The fastest way to crack <span>FAANG</span></h2>
              <p className="premium-subtitle">Stop practicing blindly. Get AI-powered mock interviews, structured roadmaps, and global competitive tournaments.</p>
            </div>

            <div className="premium-cards-container">
              {/* Free Tier */}
              <div className="premium-card free-tier">
                <div className="tier-name">Free</div>
                <div className="tier-price">₹0<span>/mo</span></div>
                <p className="tier-desc">Basic practice for casual coders.</p>
                <ul className="tier-features">
                  <li>✓ Unlimited Practice Problems</li>
                  <li>✓ Basic IDE & Execution</li>
                  <li>✓ Global Leaderboard Access</li>
                  <li className="disabled">✕ AI Mock Interviews</li>
                  <li className="disabled">✕ Ranked Tournaments</li>
                </ul>
                <button onClick={() => setShowPremiumModal(false)} className="tier-btn btn-free">Current Plan</button>
              </div>

              {/* Pro Tier */}
              <div className="premium-card pro-tier">
                <div className="tier-name">Pro</div>
                <div className="tier-price">₹299<span>/mo</span></div>
                <p className="tier-desc">For serious competitive programmers.</p>
                <ul className="tier-features">
                  <li>✓ Everything in Free</li>
                  <li>✓ Ranked Tournaments Access</li>
                  <li>✓ Company Specific Tags</li>
                  <li>✓ Detailed Analytics</li>
                  <li className="disabled">✕ AI Mock Interviews</li>
                </ul>
                <button onClick={() => handlePayment({ id: 'pro', name: 'Pro Plan', amount: 299 })} disabled={paymentProcessing} className="tier-btn btn-pro">{paymentProcessing ? 'Processing...' : 'Upgrade to Pro'}</button>
              </div>

              {/* Pro+ Tier */}
              <div className="premium-card pro-plus-tier">
                <div className="popular-tag">MOST POPULAR</div>
                <div className="tier-name">Pro+ <span className="sparkle">✨</span></div>
                <div className="tier-price">₹599<span>/mo</span></div>
                <p className="tier-desc">The ultimate interview prep arsenal.</p>
                <ul className="tier-features">
                  <li>✓ Everything in Pro</li>
                  <li><span className="highlight-feat">⚡ Live AI Mock Interviews</span></li>
                  <li><span className="highlight-feat">🧠 Advanced AI Code Reviews</span></li>
                  <li>✓ Priority Zero-Latency Servers</li>
                  <li>✓ 1-on-1 Feedback Reports</li>
                </ul>
                <button onClick={() => handlePayment({ id: 'pro_plus', name: 'Pro+ Plan', amount: 599 })} disabled={paymentProcessing} className="tier-btn btn-pro-plus">{paymentProcessing ? 'Processing...' : 'Unlock Pro+'}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ROOM CODE MODAL */}
      {createdRoomCode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 24, width: '90%', maxWidth: 440, padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 24, color: '#fff', margin: '0 0 8px 0' }}>Room Created!</h2>
            <p style={{ color: '#888', fontSize: 13, margin: '0 0 24px 0' }}>Share this code with your opponent to start the battle.</p>
            
            <div style={{ background: 'rgba(255,107,53,0.06)', border: '2px dashed rgba(255,107,53,0.3)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: 2, marginBottom: 8 }}>ROOM CODE</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 900, color: '#ff6b35', letterSpacing: 6 }}>{createdRoomCode}</div>
            </div>

            <button 
              onClick={() => { navigator.clipboard.writeText(createdRoomCode); setRoomCodeCopied(true); setTimeout(() => setRoomCodeCopied(false), 2000) }}
              style={{ width: '100%', background: roomCodeCopied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${roomCodeCopied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`, color: roomCodeCopied ? '#22c55e' : '#e5e5e5', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter', marginBottom: 12, transition: 'all 0.2s' }}>
              {roomCodeCopied ? '✓ Copied to Clipboard!' : '📋 Copy Room Code'}
            </button>

            {selectedProblem && (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px', marginBottom: 16, textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PROBLEM</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5' }}>{selectedProblem.title}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{selectedProblem.category} · {selectedProblem.difficulty}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCreatedRoomCode(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>Cancel</button>
              <button onClick={handleStartCreatedRoom} style={{ flex: 1, background: 'linear-gradient(135deg, #ff6b35, #f7451d)', border: 'none', color: '#fff', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>⚡ Enter Room</button>
            </div>

            <div style={{ fontSize: 11, color: '#444', marginTop: 14 }}>💡 Your opponent enters this code in the "Join Room" tab</div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="glass-nav">
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35', marginRight: '6px' }}>{'{C}'}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>CodeArena</span>
        </span>
        <div style={{ flex: 1 }} />
        <div className="nav-links">
          <span onClick={() => navigate('/dashboard')} style={{ color: user?.isPremium ? '#a855f7' : undefined }}>
            Dashboard
          </span>
          <span className="active">Practice</span>
          <span onClick={() => user?.isPremium ? navigate('/interview-dsa') : navigate('/premium')}>FAANG Vault</span>
          <span onClick={() => navigate('/tournaments')}>Tournaments</span>
          <span onClick={() => navigate('/leaderboard')}>Leaderboard</span>
          <span onClick={() => navigate('/profile')}>Profile</span>
        </div>
        <div style={{ flex: 1 }} />

        <div style={{ position: 'relative', width: '220px', marginRight: '16px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#888' }}>🔍</span>
          <input
            type="text"
            placeholder="Search player..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px', padding: '8px 12px 8px 32px', color: '#fff', fontSize: '12px', outline: 'none', transition: 'all 0.2s', fontFamily: 'Inter'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(255,107,53,0.4)'}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; setTimeout(() => setSearchResults([]), 200) }}
          />
          {searchResults.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'var(--card-bg)',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', zIndex: 100, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)'
            }}>
              {searchResults.map(u => (
                <div
                  key={u.username}
                  onClick={() => { navigate(`/profile/${u.username}`); setSearchResults([]); setSearchQuery(''); }}
                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: '10px', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #ff6b35, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</div>
                    <div style={{ fontSize: '10px', color: '#888' }}>{u.rank} · {u.elo} ELO</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!user?.isPremium && (
          <button onClick={() => navigate('/premium')} style={{
            background: 'linear-gradient(135deg, #ff6b35, #fbbf24)', border: 'none', color: '#fff', borderRadius: 8,
            padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter', marginRight: 16,
            boxShadow: '0 4px 14px rgba(255,107,53,0.3)', transition: 'all 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            💎 Premium
          </button>
        )}

        <ThemeToggle />
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
          <h1 className="page-title">Battle Arena</h1>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginTop: 32 }}
          >
            {/* LEFT: Main content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {/* Interview Pro Vault Card */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => user?.isPremium ? navigate('/interview-dsa') : setShowPremiumModal(true)}
              style={{
                gridColumn: 'span 2', gridRow: 'span 2',
                background: 'var(--card-bg)',
                border: '1px solid rgba(255,255,255,0.04)',
                position: 'relative', overflow: 'hidden', padding: 32, borderRadius: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ padding: '6px 12px', background: 'rgba(236,72,153,0.1)', color: '#fbcfe8', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 6, fontSize: 11, fontWeight: 700, width: 'fit-content', marginBottom: 16 }}>MAANG EXCLUSIVE</div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Interview Pro Vault {user?.isPremium && <span style={{ fontSize: 16, color: '#22c55e' }}>✓ Unlocked</span>}</h3>
                <p style={{ color: '#a1a1aa', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>Master the exact algorithms asked by top tech companies. Train with precision, zero distractions, and our integrated AI interviewer.</p>

                <button style={{
                  background: 'linear-gradient(135deg, #ff6b35, #fbbf24)', border: 'none', color: '#fff', borderRadius: 8,
                  padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter',
                  boxShadow: '0 4px 14px rgba(255,107,53,0.3)', width: 'fit-content', marginBottom: 24
                }}>
                  {user?.isPremium ? '⚡ Access Pro Vault' : '💎 Unlock Pro Vault'}
                </button>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {['Google', 'Amazon', 'Meta', 'Netflix', 'Apple'].map(c => (
                    <span key={c} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#d1d5db', fontSize: 12, padding: '4px 10px', borderRadius: 6, fontWeight: 500 }}>{c}</span>
                  ))}
                </div>
              </div>
              {!user?.isPremium && (
                <div style={{ position: 'absolute', top: 32, right: 32, background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>🔒</span> <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa' }}>PREMIUM</span>
                </div>
              )}
            </motion.div>

            {/* Random Match Card */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => { setMatchmakingMode('random'); setRoomType('public'); setShowMatchmaking(true); }}
              style={{
                background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 28, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,107,53,0.1)', color: '#ff6b35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>Random Match</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0, lineHeight: 1.5 }}>Find an opponent near your ELO instantly and battle!</p>
              <button style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', color: '#ff6b35', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 'auto', fontFamily: 'Inter' }}>
                ⚡ Start Quick Play
              </button>
            </motion.div>

            {/* Ranked Match Card */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={handleRankedClick}
              style={{
                background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 28, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(168,85,247,0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎯</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>Ranked Match</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0, lineHeight: 1.5 }}>Choose a specific problem and fight for global ELO ranking.</p>
              <button style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', color: '#a855f7', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 'auto', fontFamily: 'Inter' }}>
                🎯 Join Ranked Queue
              </button>
            </motion.div>

            {/* Practice Bot Card */}
            <motion.div
              whileHover={{ y: -2 }}
              onClick={handlePracticeClick}
              style={{
                background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: 20, padding: 28, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 16
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(34,197,94,0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: 0 }}>Practice Bot</h3>
              </div>
              <p style={{ color: '#a1a1aa', fontSize: 13, margin: 0, lineHeight: 1.5 }}>Hone your skills against our AI speed bot. No ELO risk, just pure coding.</p>
              <button style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 'auto', fontFamily: 'Inter' }}>
                🤖 Start Practice
              </button>
            </motion.div>
            </div>

            {/* RIGHT: Activity Calendar sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <ActivityCalendar />
            </div>
          </motion.div>
        )}

        {/* ✅ PUZZLES SECTION */}
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

        {/* RESTORED CREATE ROOM TAB */}
        {tab === 'create' && (
          <div className="create-grid">
            <div className="glass-panel">
              <div className="panel-header">
                <span className="panel-title">Select a Problem <span style={{ color: '#555', fontSize: 12 }}>({filteredProblems.length})</span></span>
                <div className="filters">

                  <input
                    type="text"
                    placeholder="Search..."
                    value={createSearchQuery}
                    onChange={e => setCreateSearchQuery(e.target.value)}
                    className="glass-select modal-search-input"
                    style={{ width: '130px' }}
                  />

                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="glass-select">{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
                  <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="glass-select">{DIFFICULTIES.map(d => <option key={d}>{d}</option>)}</select>
                  <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="glass-select">{TOPICS.map(t => <option key={t}>{t}</option>)}</select>
                </div>
              </div>
              {problemsLoading ? <div className="loading-state">⟳ Loading problems...</div> : (
                <div className="problem-list">
                  {filteredProblems.map((p, idx) => {
                    const isSolved = checkIsSolved(user, p);

                    return (
                      <div key={p._id || idx} onClick={() => setSelectedProblem(p)} className={`problem-item ${selectedProblem?._id === p._id ? 'selected' : ''}`}>
                        <div className="prob-num" style={{ background: diffColor[p.difficulty]?.bg, color: diffColor[p.difficulty]?.color, borderColor: diffColor[p.difficulty]?.border }}>{idx + 1}</div>
                        <div className="prob-info">
                          <div className="prob-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {p.title}
                            {isSolved && <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700 }}>✓ Solved</span>}
                          </div>
                          <div className="prob-meta">{p.category} · {p.acceptance}% acceptance</div>
                        </div>
                        <span className="prob-diff" style={{ background: diffColor[p.difficulty]?.bg, color: diffColor[p.difficulty]?.color, border: `1px solid ${diffColor[p.difficulty]?.border}` }}>{p.difficulty}</span>
                        {selectedProblem?._id === p._id && <span style={{ color: '#ff6b35', fontSize: 14 }}>✓</span>}
                      </div>
                    )
                  })}
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

        {/* RESTORED JOIN ROOM TAB */}
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

        {/* RESTORED WATCH LIVE TAB */}
        {tab === 'live' && (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', margin: '32px auto', maxWidth: 600 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👁</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, marginBottom: 8, color: '#fff' }}>Watch Live Battles</h2>
            <p style={{ color: '#666', fontSize: 13 }}>Live spectating coming soon!</p>
          </div>
        )}
      </div>

      <style>{`
        :root { --bg: #0b0b0e; --glass-border: rgba(255,255,255,0.04); --orange: #ff6b35; --purple: #a855f7; --green: #22c55e; --blue: #3b82f6; --cyan: #0ea5e9; --text-main: #f8fafc; --text-muted: #a1a1aa; }
        * { box-sizing: border-box; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        
        .lobby-wrapper {
          min-height: 100vh;
          background-color: var(--bg);
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          font-family: Inter, sans-serif; color: var(--text-main); position: relative; overflow-x: hidden;
        }

        .modal-close-btn {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #666; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .modal-close-btn:hover {
          color: var(--orange); border-color: var(--orange); background: rgba(255,107,53,0.1);
        }

        .modal-cancel-btn {
          background: transparent; border: 1px solid rgba(255,255,255,0.08);
          color: #555; border-radius: 12px; padding: 12px 24px;
          cursor: pointer; font-size: 13px; font-weight: 600; font-family: Inter;
          transition: all 0.2s;
        }
        .modal-cancel-btn:hover {
          color: var(--orange); border-color: var(--orange); background: rgba(255,107,53,0.05);
        }

        .modal-search-input:focus {
          border-color: var(--orange) !important;
          box-shadow: 0 0 0 2px rgba(255,107,53,0.2);
        }

        /* OLD CSS REMOVED */
        /* PREMIUM MODAL REDESIGN */
        .premium-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
        .premium-modal { position: relative; background: #0a0a0c; border: 1px solid rgba(255,107,53,0.3); border-radius: 24px; padding: 48px 40px; width: 100%; max-width: 1000px; box-shadow: 0 0 80px rgba(255,107,53,0.08), 0 40px 80px rgba(0,0,0,0.6); overflow: hidden; }
        .close-btn { position: absolute; top: 20px; right: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; width: 36px; height: 36px; border-radius: 50%; font-size: 14px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; z-index: 10; }
        .close-btn:hover { background: rgba(255,255,255,0.1); transform: scale(1.1); }
        .premium-glow-bg { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 80%; height: 50%; background: radial-gradient(ellipse at center, rgba(255,107,53,0.15) 0%, transparent 70%); filter: blur(60px); pointer-events: none; }
        
        .premium-header { text-align: center; margin-bottom: 48px; position: relative; z-index: 5; }
        .premium-badge { display: inline-block; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); color: #fbbf24; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; padding: 6px 16px; border-radius: 20px; margin-bottom: 20px; }
        .premium-title { font-family: Outfit, sans-serif; font-size: 42px; font-weight: 900; color: #fff; margin: 0 0 16px 0; letter-spacing: -1px; }
        .premium-title span { background: linear-gradient(135deg, #ff6b35, #fbbf24); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .premium-subtitle { font-size: 16px; color: #a1a1aa; max-width: 600px; margin: 0 auto; line-height: 1.6; }

        .premium-cards-container { display: flex; gap: 24px; position: relative; z-index: 5; }
        .premium-card { flex: 1; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 32px 24px; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.25,0.8,0.25,1); }
        .premium-card:hover { transform: translateY(-8px); background: rgba(255,255,255,0.03); }
        
        .pro-tier { border-color: rgba(96,165,250,0.3); background: linear-gradient(180deg, rgba(96,165,250,0.05) 0%, rgba(255,255,255,0.02) 100%); }
        .pro-plus-tier { border-color: rgba(255,107,53,0.5); background: linear-gradient(180deg, rgba(255,107,53,0.08) 0%, rgba(255,255,255,0.02) 100%); position: relative; transform: scale(1.05); z-index: 10; box-shadow: 0 20px 40px rgba(255,107,53,0.15); }
        .pro-plus-tier:hover { transform: scale(1.05) translateY(-8px); box-shadow: 0 30px 60px rgba(255,107,53,0.2); }
        
        .popular-tag { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #ff6b35, #f7451d); color: #fff; font-size: 10px; font-weight: 800; padding: 6px 16px; border-radius: 20px; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(255,107,53,0.4); }
        .tier-name { font-size: 20px; font-weight: 800; color: #fff; margin-bottom: 8px; font-family: Outfit, sans-serif; display: flex; align-items: center; justify-content: space-between; }
        .tier-price { font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 12px; font-family: JetBrains Mono, monospace; }
        .tier-price span { font-size: 14px; color: #666; font-weight: 600; font-family: Inter, sans-serif; }
        .tier-desc { font-size: 13px; color: #888; margin-bottom: 24px; min-height: 38px; line-height: 1.5; }
        
        .tier-features { list-style: none; padding: 0; margin: 0 0 32px 0; flex: 1; display: flex; flex-direction: column; gap: 14px; }
        .tier-features li { font-size: 13px; color: #d1d5db; display: flex; align-items: center; font-weight: 500; }
        .tier-features li.disabled { color: #555; text-decoration: line-through; opacity: 0.5; }
        .highlight-feat { color: #ff6b35; font-weight: 700; background: rgba(255,107,53,0.1); padding: 4px 8px; border-radius: 6px; margin-left: -8px; border: 1px solid rgba(255,107,53,0.2); }
        
        .tier-btn { width: 100%; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s ease; font-family: Inter, sans-serif; text-align: center; }
        .btn-free { background: rgba(255,255,255,0.05); color: #888; border: 1px solid rgba(255,255,255,0.1); }
        .btn-pro { background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); }
        .btn-pro:hover { background: rgba(96,165,250,0.2); color: #fff; }
        .btn-pro-plus { background: linear-gradient(135deg, #ff6b35, #f7451d); color: #fff; border: none; box-shadow: 0 8px 20px rgba(255,107,53,0.3); }
        .btn-pro-plus:hover { background: linear-gradient(135deg, #f7451d, #ea580c); box-shadow: 0 12px 28px rgba(255,107,53,0.4); }

        .glass-nav { height: 60px; background: #111113; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; padding: 0 24px; position: sticky; top: 0; z-index: 50; }
        .logo { font-size: 16px; cursor: pointer; display: flex; align-items: center; margin-right: 32px; }
        .nav-links { display: flex; gap: 24px; margin-right: 32px; }
        .nav-links span { font-size: 13px; font-weight: 600; color: #a1a1aa; cursor: pointer; position: relative; padding: 20px 0; }
        .nav-links span:hover { color: #fff; }
        .nav-links span.active { color: #ff6b35; }
        .nav-links span.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #ff6b35; }
        .online-badge { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 6px 14px; font-size: 12px; margin-right: 12px; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); transition: transform 0.2s; }
        .pulse-anim { transform: scale(1.4); }
        .text-green { color: var(--green); font-weight: 700; }
        .user-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 4px 14px 4px 10px; cursor: pointer; transition: background 0.2s; }
        .user-chip:hover { background: rgba(255,255,255,0.08); }
        .rank-icon { font-size: 11px; color: #d97706; font-weight: 600; padding-right: 8px; border-right: 1px solid rgba(255,255,255,0.1); }
        .avatar { width: 22px; height: 22px; border-radius: 50%; background: #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }
        .username { font-size: 12px; font-weight: 600; }
        
        .lobby-container { max-width: 900px; margin: 0 auto; padding: 60px 24px; position: relative; z-index: 10; }
        .lobby-header { text-align: center; margin-bottom: 40px; }
        .page-title { font-size: 32px; font-weight: 700; color: #fff; margin: 0 0 12px 0; letter-spacing: -0.5px; }
        .page-subtitle { font-size: 15px; color: var(--text-muted); max-width: 500px; line-height: 1.6; margin: 0 auto; }
        .tab-wrapper { display: flex; justify-content: center; margin-bottom: 40px; }
        .tab-container { display: flex; gap: 4px; background: #16161a; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; }
        .tab-btn { padding: 10px 20px; font-size: 13px; font-weight: 600; color: var(--text-muted); background: transparent; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { background: rgba(255,255,255,0.08); color: #fff; }
        
        .create-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; margin-top: 32px; }
        .glass-panel { background: #16161a; border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; padding: 24px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .panel-title { font-size: 14px; font-weight: 600; color: #fff; }
        .filters { display: flex; gap: 10px; }
        .glass-select { background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); color: var(--text-muted); padding: 6px 12px; border-radius: 8px; font-size: 12px; outline: none; cursor: pointer; }
        .loading-state { text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px; }
        .problem-list { display: flex; flex-direction: column; gap: 8px; max-height: 500px; overflow-y: auto; }
        .problem-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; cursor: pointer; transition: all 0.15s; }
        .problem-item:hover { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); }
        .problem-item.selected { background: rgba(255,107,53,0.05); border-color: var(--orange); }
        .prob-num { width: 32px; height: 32px; border-radius: 8px; border: 1px solid; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .prob-info { flex: 1; }
        .prob-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
        .prob-meta { font-size: 11px; color: var(--text-muted); }
        .prob-diff { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
        .settings-panel { position: sticky; top: 80px; height: fit-content; }
        .settings-title { font-family: Outfit; font-size: 18px; font-weight: 700; margin: 0 0 24px 0; color: #fff; }
        .label-mini { font-size: 10px; color: var(--text-muted); font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block; }
        .selected-preview { background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); border-radius: 12px; padding: 16px; margin-bottom: 20px; min-height: 72px; }
        .prev-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #fff; }
        .prev-tags { display: flex; gap: 8px; align-items: center; }
        .setting-group { margin-bottom: 20px; }
        .toggle-group { display: flex; gap: 8px; }
        .toggle-btn { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid var(--glass-border); padding: 10px 0; border-radius: 8px; color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .toggle-btn.active-orange { background: rgba(255,107,53,0.1); border-color: rgba(255,107,53,0.3); color: var(--orange); }
        .btn-primary-full { width: 100%; background: #ff6b35; color: white; border: none; border-radius: 10px; padding: 14px 0; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: Inter; }
        .btn-primary-full:hover:not(.disabled) { background: #ea580c; }
        .btn-primary-full.disabled { background: rgba(255,255,255,0.05); color: #555; cursor: not-allowed; transform: none; }
        
        .join-container { max-width: 460px; margin: 0 auto; padding: 40px; text-align: center; }
        .join-icon { width: 64px; height: 64px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
        .join-title { font-family: Outfit; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; color: #fff; }
        .join-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; }
        .join-input { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 10px; padding: 14px; font-size: 16px; color: #fff; font-family: 'JetBrains Mono', monospace; text-align: center; letter-spacing: 2px; outline: none; margin-bottom: 20px; transition: border 0.2s; }
        .join-input:focus { border-color: var(--orange); }
        .join-hint { margin-top: 20px; font-size: 12px; color: #555; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; }
        
        @media (max-width: 800px) { .mode-grid { grid-template-columns: 1fr; } .create-grid { grid-template-columns: 1fr; } .page-title { font-size: 32px; } }

        /* Puzzles Section CSS */
        .puzzles-section { width: 100%; margin-top: 10px; animation: fadeIn 0.3s ease-out; }
        .puzzles-header { margin-bottom: 24px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 16px; }
        .section-title { font-size: 20px; font-weight: 600; color: #fff; margin: 0 0 4px 0; }
        .section-subtitle { font-size: 13px; color: var(--text-muted); margin: 0; }
        
        .puzzle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        
        .puzzle-card { background: #16161a; border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; transition: all 0.2s; }
        .puzzle-card:hover:not(.solved-card) { transform: translateY(-2px); border-color: rgba(255,255,255,0.08); background: #1a1a1e; }
        .solved-card { opacity: 0.5; background: #111113; border-color: rgba(34,197,94,0.08); cursor: default; }
        
        .puzzle-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .puzzle-icon-box { width: 48px; height: 48px; background: rgba(255,255,255,0.03); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid rgba(255,255,255,0.04); }
        
        .puzzle-badge { font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .puzzle-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 12px 0; font-family: Outfit, sans-serif; letter-spacing: -0.5px; }
        
        .puzzle-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; font-size: 12px; }
        .puzzle-cat { color: var(--text-muted); font-weight: 600; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; }
        .puzzle-points { font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        
        .btn-puzzle { width: 100%; background: transparent; border: 1px solid var(--cyan); color: var(--cyan); padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; margin-top: auto; font-family: Inter, sans-serif; }
        .btn-puzzle:hover { background: #ff6b35 !important; color: #fff !important; border-color: #ff6b35 !important; box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4) !important; transform: translateY(-2px); }
        .btn-puzzle-solved { width: 100%; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: var(--green); padding: 12px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: not-allowed; margin-top: auto; font-family: Inter, sans-serif; display: flex; align-items: center; justify-content: center; gap: 8px; }

        .sprint-progress-bar { background: #16161a; border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 20px 24px; margin-bottom: 24px; }
        .sprint-progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .sprint-label { font-size: 14px; font-weight: 700; color: #f8fafc; }
        .sprint-count { font-size: 14px; font-weight: 800; color: #0ea5e9; font-family: 'JetBrains Mono', monospace; }
        .sprint-track { width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 100px; overflow: hidden; }
        .sprint-fill { height: 100%; background: #22c55e; border-radius: 100px; transition: width 0.6s ease; min-width: 2px; }
        .sprint-complete-msg { text-align: center; color: #22c55e; font-weight: 700; font-size: 13px; margin-top: 12px; }

        .text-cyan { color: var(--cyan); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
