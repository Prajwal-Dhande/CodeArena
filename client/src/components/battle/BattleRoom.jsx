import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { io } from 'socket.io-client'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Timer from './Timer'
import WinnerScreen from './WinnerScreen'
import ConstraintAlert from './ConstraintAlert'

const DIFF_COLOR = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
}

const DEFAULT_STARTER = {
  javascript: `function solution() {\n  // Your solution here\n\n};`,
  python: `def solution():\n    # Your solution here\n    pass`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\n// Your solution here`,
  java: `class Solution {\n    // Your solution here\n}`,
}

const getRoomId = () => new URLSearchParams(window.location.search).get('room') || 'demo-room-1'
const getProblemSlug = () => new URLSearchParams(window.location.search).get('problem') || 'two-sum'
// ✅ Practice mode check
const isPracticeMode = () => new URLSearchParams(window.location.search).get('practice') === 'true'

export default function BattleRoom() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [problem, setProblem] = useState(null)
  const [problemLoading, setProblemLoading] = useState(true)
  const [code, setCode] = useState(DEFAULT_STARTER.javascript)
  const [opponentCode, setOpponentCode] = useState('// Waiting for opponent...')
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [myTests, setMyTests] = useState(0)
  const [oppTests, setOppTests] = useState(0)
  const [constraint, setConstraint] = useState(null)
  const [connected, setConnected] = useState(false)
  const [language, setLanguage] = useState('javascript')
  const [activeTab, setActiveTab] = useState('problem')
  const [aiLoading, setAiLoading] = useState(false)
  const [showProblemPicker, setShowProblemPicker] = useState(false)
  const [allProblems, setAllProblems] = useState([])
  const [roomPlayers, setRoomPlayers] = useState([])
  const [battleStarted, setBattleStarted] = useState(false)
  const [opponentName, setOpponentName] = useState('Opponent')
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [timeTaken, setTimeTaken] = useState(0)

  const socketRef = useRef(null)
  const constraintTriggered = useRef(false)
  const gameOverRef = useRef(false)
  const battleStartedRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const botTimeoutRef = useRef(null)
  
  // ✅ Naya ref real player interference prevent karne ke liye
  const botTypingCancelRef = useRef(false) 

  // DB se problem fetch
  useEffect(() => {
    const slug = getProblemSlug()
    const fetchProblem = async () => {
      setProblemLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/problems/${slug}`)
        const data = await res.json()
        if (data.problem) {
          setProblem(data.problem)
          setCode(data.problem.starterCode?.javascript || DEFAULT_STARTER.javascript)
        }
      } catch (err) {
        setProblem({
          slug: 'two-sum', title: 'Two Sum', difficulty: 'Medium',
          description: 'Given an array nums and target, return indices of two numbers that add up to target.',
          examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explain: 'nums[0]+nums[1]=9' }],
          constraints: ['2 ≤ nums.length ≤ 10⁴'], starterCode: DEFAULT_STARTER, hints: []
        })
        setCode(DEFAULT_STARTER.javascript)
      }
      setProblemLoading(false)
    }
    fetchProblem()
  }, [searchParams])

  // All problems for picker
  useEffect(() => {
    fetch('http://localhost:5000/api/problems')
      .then(r => r.json())
      .then(d => setAllProblems(d.problems || []))
      .catch(console.error)
  }, [])

  // ✅ Bot typing simulation
  useEffect(() => {
    // Is bot check mein URL params ya randomly assigned botName check hoga
    const botNameFromUrl = new URLSearchParams(window.location.search).get('bot')
    const isBot = botNameFromUrl || opponentName.startsWith('Bot_')
    
    // ✅ Cancel check: Agar real player aa chuka hai toh bot script trigger nahi hogi
    if (!isBot || !battleStarted || botTypingCancelRef.current) return

    setOpponentName(botNameFromUrl || opponentName)

    const slug = getProblemSlug()
    const botCodes = {
      'two-sum': `function twoSum(nums, target) {\n  // let me think...\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n}`,
      'valid-parentheses': `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if ('({['.includes(c)) stack.push(c);\n    else if (stack.pop() !== map[c]) return false;\n  }\n  return stack.length === 0;\n}`,
      'climbing-stairs': `function climbStairs(n) {\n  if (n <= 2) return n;\n  let a = 1, b = 2;\n  for (let i = 3; i <= n; i++) {\n    [a, b] = [b, a + b];\n  }\n  return b;\n}`,
      'maximum-subarray': `function maxSubArray(nums) {\n  let maxSum = nums[0];\n  let currSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currSum = Math.max(nums[i], currSum + nums[i]);\n    maxSum = Math.max(maxSum, currSum);\n  }\n  return maxSum;\n}`,
      'contains-duplicate': `function containsDuplicate(nums) {\n  const set = new Set();\n  for (let n of nums) {\n    if (set.has(n)) return true;\n    set.add(n);\n  }\n  return false;\n}`,
      'binary-search': `function search(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
    }

    const targetCode = botCodes[slug] || `function solution() {\n  // thinking...\n  // almost there...\n}`

    let currentText = ''
    let charIndex = 0
    let typingTimer

    const typeChar = () => {
      if (botTypingCancelRef.current) return // ✅ Typing ke beech me player aaya toh ruk jao
      
      if (charIndex < targetCode.length) {
        currentText += targetCode[charIndex]
        setOpponentCode(currentText)
        charIndex++
        const char = targetCode[charIndex - 1]
        const delay = char === '\n'
          ? Math.random() * 600 + 300
          : char === ' '
            ? Math.random() * 100 + 30
            : Math.random() * 120 + 40
        typingTimer = setTimeout(typeChar, delay)
      } else {
        setTimeout(() => {
          if (!botTypingCancelRef.current) {
            setOppTests(Math.floor(Math.random() * 2) + 1)
          }
        }, 2000)
      }
    }

    const startDelay = setTimeout(typeChar, 3000)
    return () => {
      clearTimeout(startDelay)
      clearTimeout(typingTimer)
    }
  }, [battleStarted, opponentName])

  // ✅ Socket — sirf ek baar
  useEffect(() => {
    const socket = io('http://localhost:5000')
    socketRef.current = socket
    
    // ✅ URL se bot check karo
    const botNameFromUrl = new URLSearchParams(window.location.search).get('bot')

    socket.on('connect', () => {
      setConnected(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const roomId = getRoomId()
      socket.emit('join_room', {
        roomId,
        username: user?.username || `Player_${socket.id?.slice(0, 4)}`
      })
      console.log(`✅ Joined room: ${roomId}`)
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('opponent_code', ({ code }) => {
      setOpponentCode(code)
    })

    socket.on('ai_constraint', ({ message }) => {
      setConstraint(message)
      setAiLoading(false)
    })

    socket.on('room_update', ({ players }) => {
      setRoomPlayers(players)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const opp = players.find(p => p.username !== user?.username)

      if (opp) {
        setOpponentName(opp.username)
        clearTimeout(botTimeoutRef.current)
        
        // ✅ Real player join hua — bot typing cancel karo
        botTypingCancelRef.current = true

        if (!battleStartedRef.current) {
          battleStartedRef.current = true
          setBattleStarted(true)
          startTimeRef.current = Date.now()
        }
      } else if (players.length === 1) {
        // ✅ Practice mode — seedha battle start, no bot timeout
        if (isPracticeMode()) {
          setTimeout(() => {
            if (!battleStartedRef.current) {
              battleStartedRef.current = true
              setBattleStarted(true)
              startTimeRef.current = Date.now()
            }
          }, 1500)
        } else {
          // Normal mode — 8 sec baad bot
          botTimeoutRef.current = setTimeout(() => {
            if (botTypingCancelRef.current) return // ✅ Real player aa gaya toh bot mat lao
            
            const botName = botNameFromUrl || `Bot_${Math.floor(Math.random() * 999)}`
            setRoomPlayers(prev => [...prev, { username: botName, isBot: true }])
            setOpponentName(botName)
            setOpponentCode(`function solution() {\n  // Thinking...\n}`)

            setTimeout(() => {
              if (!battleStartedRef.current) {
                battleStartedRef.current = true
                setBattleStarted(true)
                startTimeRef.current = Date.now()
              }
            }, 1000)
          }, 8000)
        }
      }
    })

    socket.on('battle_start', ({ players }) => {
      console.log('⚔️ battle_start received!')
      clearTimeout(botTimeoutRef.current)
      if (!battleStartedRef.current) {
        battleStartedRef.current = true
        setBattleStarted(true)
        startTimeRef.current = Date.now()
      }
    })

    socket.on('opponent_tests', ({ passed }) => setOppTests(passed))

    socket.on('opponent_won', ({ winner }) => {
      if (!gameOverRef.current) {
        gameOverRef.current = true
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        setTimeTaken(elapsed)
        setGameResult('loss')
        setGameOver(true)
      }
    })
    
    // ✅ Opponent left — you win!
    socket.on('opponent_left_win', ({ winner, loser, message }) => {
      if (!gameOverRef.current) {
        gameOverRef.current = true
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        setTimeTaken(elapsed)
        setGameResult('win')
        setGameOver(true)
        console.log(`🏆 ${message}`)
      }
    })

    socket.on('player_left', ({ username }) => {
      setOpponentCode(`// ${username} left the battle...`)
      if (!gameOverRef.current) {
        battleStartedRef.current = false
        setBattleStarted(false)
      }
      clearTimeout(botTimeoutRef.current)
    })

    return () => {
      socket.disconnect()
      clearTimeout(botTimeoutRef.current)
    }
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(problem?.starterCode?.[lang] || DEFAULT_STARTER[lang] || '')
  }

  const handleProblemChange = async (slug) => {
    setShowProblemPicker(false)
    setResults([]); setMyTests(0); setOppTests(0); setConstraint(null)
    setGameOver(false); setGameResult(null); setSubmitStatus(null)
    gameOverRef.current = false; constraintTriggered.current = false
    setProblemLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/problems/${slug}`)
      const data = await res.json()
      if (data.problem) {
        setProblem(data.problem)
        setCode(data.problem.starterCode?.[language] || DEFAULT_STARTER[language])
      }
    } catch (err) { console.error(err) }
    setProblemLoading(false)
  }

  const handleCodeChange = (val) => {
    setCode(val)
    const roomId = getRoomId()
    socketRef.current?.emit('code_change', { roomId, code: val })
  }

  const triggerAIConstraint = async (currentCode, passed, total) => {
    if (constraintTriggered.current) return
    constraintTriggered.current = true
    setAiLoading(true)
    try {
      const token = localStorage.getItem('token')
      const roomId = getRoomId()
      const slug = getProblemSlug()
      const res = await fetch('http://localhost:5000/api/code/ai-constraint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: currentCode, problemId: problem?.slug || slug, passed, total, roomId })
      })
      const data = await res.json()
      if (data.constraint) setConstraint(data.constraint)
    } catch (err) {
      setConstraint('Now solve this without using any built-in methods!')
    }
    setAiLoading(false)
  }

  const runCode = async () => {
    setRunning(true); setResults([]); setSubmitStatus(null)
    try {
      const token = localStorage.getItem('token')
      const roomId = getRoomId()
      const slug = getProblemSlug()
      const res = await fetch('http://localhost:5000/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code, language, problemId: problem?.slug || slug })
      })
      const data = await res.json()
      if (!res.ok) { setResults([{ i: 0, ok: false, error: data.message }]); setRunning(false); return }

      setMyTests(data.passed)
      socketRef.current?.emit('tests_update', { roomId, passed: data.passed, total: data.total })
      setResults(data.results.map(r => ({
        i: r.testCase, ok: r.passed, result: r.result,
        expected: r.expected, input: JSON.stringify(r.input),
        error: r.error, time: r.executionTime
      })))

      if (data.passed >= Math.ceil(data.total / 2) && !constraintTriggered.current) {
        setTimeout(() => triggerAIConstraint(code, data.passed, data.total), 1200)
      }
    } catch (err) {
      setResults([{ i: 0, ok: false, error: 'Server not reachable.' }])
    }
    setRunning(false)
  }

  const submitCode = async () => {
    setSubmitting(true); setResults([]); setSubmitStatus(null)
    try {
      const token = localStorage.getItem('token')
      const roomId = getRoomId()
      const slug = getProblemSlug()
      const res = await fetch('http://localhost:5000/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code, language, problemId: problem?.slug || slug })
      })
      const data = await res.json()
      if (!res.ok) { setResults([{ i: 0, ok: false, error: data.message }]); setSubmitting(false); return }

      setMyTests(data.passed)
      socketRef.current?.emit('tests_update', { roomId, passed: data.passed, total: data.total })
      setResults(data.results.map(r => ({
        i: r.testCase, ok: r.passed, result: r.result,
        expected: r.expected, input: JSON.stringify(r.input),
        error: r.error, time: r.executionTime
      })))

      if (data.allPassed && !gameOverRef.current) {
        gameOverRef.current = true
        setSubmitStatus('success')
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        setTimeTaken(elapsed)
        setTimeout(() => { setGameResult('win'); setGameOver(true) }, 600)
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        socketRef.current?.emit('battle_won', { roomId, winner: user?.username || 'Player' })
      } else {
        setSubmitStatus('failed')
      }
    } catch (err) {
      setResults([{ i: 0, ok: false, error: 'Server not reachable.' }])
    }
    setSubmitting(false)
  }

  const handleRematch = () => {
    setGameOver(false); setGameResult(null); gameOverRef.current = false
    setCode(problem?.starterCode?.[language] || DEFAULT_STARTER[language])
    setResults([]); setMyTests(0); setOppTests(0)
    setConstraint(null); setSubmitStatus(null)
    constraintTriggered.current = false
  }

  const pct = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0
  const totalTests = problem?.testCases?.length || 3
  const roomId = getRoomId()
  const practiceMode = isPracticeMode()

  return (
    <div className="battle-container">
      {/* TOP BAR */}
      <div className="top-nav glass-panel">
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35' }}>Code</span>
          <span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div className="divider" />

        {/* Practice Mode Badge */}
        {practiceMode && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e', fontSize: 11, fontWeight: 700,
            padding: '4px 12px', borderRadius: 6, letterSpacing: 0.5
          }}>🧠 PRACTICE MODE</div>
        )}

        <div className="picker-wrapper">
          <button onClick={() => setShowProblemPicker(s => !s)} className="problem-btn" disabled={battleStarted}>
            {problemLoading ? <span>Loading...</span> : (
              <>
                <span className="problem-title">{problem?.title || 'Select Problem'}</span>
                {problem && (
                  <span className="diff-badge" style={{
                    background: DIFF_COLOR[problem.difficulty]?.bg,
                    color: DIFF_COLOR[problem.difficulty]?.color,
                    borderColor: DIFF_COLOR[problem.difficulty]?.border
                  }}>{problem.difficulty}</span>
                )}
              </>
            )}
            <span style={{ fontSize: 10, color: '#555' }}>▼</span>
          </button>

          {showProblemPicker && !battleStarted && (
            <div className="dropdown-menu">
              {allProblems.map(p => (
                <div key={p._id} onClick={() => handleProblemChange(p.slug)}
                  className={`dropdown-item ${problem?.slug === p.slug ? 'active' : ''}`}>
                  <div style={{ flex: 1 }}>
                    <div className="dropdown-title">{p.title}</div>
                    <div className="dropdown-sub">{p.category} · {p.acceptance}% acceptance</div>
                  </div>
                  <span className="diff-badge" style={{
                    background: DIFF_COLOR[p.difficulty]?.bg,
                    color: DIFF_COLOR[p.difficulty]?.color
                  }}>{p.difficulty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {roomPlayers.length > 0 && (
          <div className={`status-pill ${battleStarted ? 'live' : 'waiting'}`}>
            {roomPlayers.map((p, i) => (
              <div key={i} className="player-mini">
                <div className="avatar" style={{ background: i === 0 ? '#ff6b35' : '#ef4444' }}>
                  {p.username?.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: '#aaa' }}>{p.username}</span>
                {i === 0 && roomPlayers.length > 1 && <span className="vs">vs</span>}
              </div>
            ))}
            <span className="status-text" style={{ color: battleStarted ? '#22c55e' : '#fb923c' }}>
              {battleStarted ? '⚔️ LIVE' : `${roomPlayers.length}/2`}
            </span>
          </div>
        )}

        {aiLoading && (
          <div className="status-pill ai-active">
            <div className="pulse-dot orange animate" />
            <span>AI analyzing...</span>
          </div>
        )}

        <div className="connection-status">
          <div className={`pulse-dot ${connected ? 'green' : 'red'}`} />
          <span style={{ color: connected ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: 600 }}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        <div className="timer-box">
          <span style={{ fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 1 }}>TIME</span>
          {battleStarted
            ? <Timer initialSeconds={600} />
            : <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#666' }}>10:00</span>
          }
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid" style={{ gridTemplateColumns: practiceMode ? '300px 1fr' : '300px 1fr 300px' }}>

        {/* ✅ WAITING OVERLAY */}
        {!battleStarted && !new URLSearchParams(window.location.search).get('bot') && (
          <div className="waiting-overlay">
            <div className="waiting-card">
              <div className="radar-spinner" style={{ borderTopColor: practiceMode ? '#22c55e' : '#ff6b35' }} />
              <h2 className="wait-title">
                {practiceMode ? '🧠 Practice Mode' : 'Searching for Opponent'}
              </h2>
              <p className="wait-desc">
                {practiceMode ? (
                  <>Setting up your practice session...<br />
                    <span style={{ fontFamily: 'monospace', color: '#22c55e', fontWeight: 700 }}>{problem?.title || 'Loading...'}</span>
                  </>
                ) : (
                  <>Room: <span style={{ fontFamily: 'monospace', color: '#ff6b35', fontWeight: 700 }}>{roomId}</span>
                    <br />Share this room ID with your opponent!
                  </>
                )}
              </p>

              <div className="wait-players">
                <div className="w-player">
                  <div className="w-avatar me-bg">
                    {roomPlayers[0]?.username?.slice(0, 2).toUpperCase() || 'P'}
                  </div>
                  <div className="w-name">{roomPlayers[0]?.username || 'You'}</div>
                  <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>Ready</div>
                </div>

                <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, color: '#555' }}>VS</div>

                <div className="w-player">
                  <div className="w-avatar" style={{
                    background: practiceMode ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'rgba(255,255,255,0.02)',
                    borderStyle: practiceMode ? 'solid' : 'dashed',
                    borderColor: practiceMode ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)',
                    color: practiceMode ? '#fff' : '#555'
                  }}>
                    {practiceMode ? '🤖' : '?'}
                  </div>
                  <div className="w-name" style={{ color: practiceMode ? '#22c55e' : '#666' }}>
                    {practiceMode ? 'AI Bot' : 'Waiting...'}
                  </div>
                  <div style={{ fontSize: 11, color: practiceMode ? '#22c55e' : '#fb923c', fontWeight: 700 }}>
                    {practiceMode ? 'Ready' : 'Searching'}
                  </div>
                </div>
              </div>

              {!practiceMode && (
                <div style={{ marginTop: 24, fontSize: 12, color: '#555' }}>
                  No opponent? A bot will join in 8 seconds...
                </div>
              )}
            </div>
          </div>
        )}

        {/* LEFT — Problem */}
        <div className="panel problem-panel">
          <div className="panel-tabs">
            {['problem', 'scores'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="panel-content">
            {activeTab === 'problem' ? (
              problemLoading ? (
                <div className="loading-text">Loading problem...</div>
              ) : problem ? (
                <>
                  <h2 className="prob-title">{problem.title}</h2>
                  <span className="diff-badge" style={{
                    background: DIFF_COLOR[problem.difficulty]?.bg,
                    color: DIFF_COLOR[problem.difficulty]?.color,
                    borderColor: DIFF_COLOR[problem.difficulty]?.border,
                    marginBottom: 12, display: 'inline-block'
                  }}>{problem.difficulty}</span>

                  {problem.companies?.length > 0 && (
                    <div className="tags-row">
                      {problem.companies.map(c => <span key={c} className="company-tag">{c}</span>)}
                    </div>
                  )}

                  <p className="prob-desc">{problem.description}</p>

                  {problem.examples?.map((ex, i) => (
                    <div key={i} className="example-box">
                      <div className="example-label">EXAMPLE {i + 1}</div>
                      <div className="code-line" style={{ color: '#fb923c' }}>Input: {ex.input}</div>
                      <div className="code-line" style={{ color: '#22c55e' }}>Output: {ex.output}</div>
                      {ex.explain && <div className="explain-text">{ex.explain}</div>}
                    </div>
                  ))}

                  {problem.constraints?.length > 0 && (
                    <div className="info-box">
                      <div className="info-label">CONSTRAINTS</div>
                      {problem.constraints.map(c => (
                        <div key={c} className="code-line" style={{ color: '#888' }}>• {c}</div>
                      ))}
                    </div>
                  )}

                  {problem.hints?.length > 0 && (
                    <div className="info-box" style={{ marginTop: 12 }}>
                      <div className="info-label">💡 HINTS</div>
                      {problem.hints.map((h, i) => (
                        <div key={i} className="code-line" style={{ color: '#666' }}>• {h}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="loading-text">Problem not found</div>
              )
            ) : (
              <div>
                <div className="info-label" style={{ marginBottom: 8 }}>LIVE SCORES</div>
                <div className="score-card" style={{ borderColor: 'rgba(255,107,53,0.2)' }}>
                  <div className="score-header">
                    <span style={{ color: '#ff6b35' }}>You</span>
                    <span style={{ color: myTests === totalTests ? '#22c55e' : '#ff6b35' }}>
                      {myTests} / {totalTests}
                    </span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-bar" style={{
                      width: `${pct(myTests, totalTests)}%`,
                      background: myTests === totalTests ? '#22c55e' : '#ff6b35'
                    }} />
                  </div>
                </div>

                <div className="score-card">
                  <div className="score-header">
                    <span>{opponentName}</span>
                    <span style={{ color: '#ef4444' }}>{oppTests} / {totalTests}</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-bar" style={{ width: `${pct(oppTests, totalTests)}%`, background: '#ef4444' }} />
                  </div>
                </div>

                {!battleStarted ? (
                  <div className="battle-alert alert-orange">
                    <div className="pulse-dot orange" />
                    <span>Waiting for opponent... ({roomPlayers.length}/2)</span>
                  </div>
                ) : (
                  <div className="battle-alert alert-green">
                    <div className="pulse-dot green" />
                    <span>⚔️ Battle in progress!</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE — Editor */}
        <div className="panel editor-panel">
          <div className="editor-header glass-panel">
            <div className="user-indicator">
              <div className="dot-orange" />
              <span>You</span>
            </div>

            <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="lang-select">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>

            <div style={{ flex: 1 }} />

            <button onClick={runCode} disabled={running || submitting || problemLoading}
              className={`action-btn run-btn ${running ? 'disabled' : ''}`}>
              {running ? '⟳ Running...' : '▶ Run'}
            </button>

            <button onClick={submitCode} disabled={submitting || running || problemLoading}
              className={`action-btn submit-btn ${submitStatus || ''} ${(submitting || running) ? 'disabled' : ''}`}>
              {submitting ? '⟳ Submitting...'
                : submitStatus === 'success' ? '✓ Accepted!'
                : submitStatus === 'failed' ? '✗ Wrong Answer'
                : '✓ Submit'}
            </button>
          </div>

          <div className="monaco-wrapper">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false }, fontSize: 13.5,
                fontFamily: 'JetBrains Mono', padding: { top: 14, bottom: 14 },
                smoothScrolling: true, cursorBlinking: 'smooth',
                wordWrap: 'on', tabSize: 2, lineNumbers: 'on',
                scrollBeyondLastLine: false
              }}
            />
          </div>

          <div className="output-panel">
            <div className={`output-label ${submitStatus || ''}`}>
              {submitStatus === 'success' ? '✓ ALL TESTS PASSED'
                : submitStatus === 'failed' ? '✗ WRONG ANSWER'
                : 'TEST RESULTS'}
            </div>
            {results.length === 0 && (
              <span style={{ color: '#555', fontSize: 12 }}>Run your code to see results...</span>
            )}
            {results.map((r, i) => (
              <div key={i} className={`test-result-row ${r.ok ? 'pass' : 'fail'}`}>
                <span className="test-badge">{r.ok ? 'PASS' : 'FAIL'}</span>
                <span className="test-input">{r.input}</span>
                <span className="test-error">→ {r.error || JSON.stringify(r.result)}</span>
                {r.time && <span className="test-time">{r.time}s</span>}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Opponent */}
        <div className="panel opp-panel" style={{ display: practiceMode ? 'none' : 'flex' }}>
          <div className="editor-header glass-panel">
            <div className="user-indicator red">
              <div className="dot-red" />
              <span>{opponentName}</span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555' }}>Read only</span>
          </div>

          <div className="monaco-wrapper" style={{ opacity: 0.7 }}>
            <Editor
              height="100%"
              language="javascript"
              value={opponentCode}
              theme="vs-dark"
              options={{
                readOnly: true, minimap: { enabled: false },
                fontSize: 13, fontFamily: 'JetBrains Mono',
                padding: { top: 14 }, renderLineHighlight: 'none',
                scrollBeyondLastLine: false
              }}
            />
          </div>

          <div className="ai-panel">
            <div className="info-label" style={{ marginBottom: 8 }}>AI INTERVIEWER</div>
            <div className={`ai-box ${aiLoading ? 'loading' : ''}`}>
              <div className="ai-box-header">
                <div className={`pulse-dot orange ${aiLoading ? 'animate' : ''}`} />
                <span>{aiLoading ? 'Analyzing your code...' : 'Watching both players...'}</span>
              </div>
              <p>{aiLoading
                ? 'Groq AI is reading your solution and preparing a constraint...'
                : 'Solve the problem to trigger a dynamic constraint. The AI will inject a new challenge mid-battle.'
              }</p>
            </div>
          </div>
        </div>
      </div>

      {gameOver && (
        <WinnerScreen
          result={gameResult}
          problem={problem}
          myTests={myTests}
          totalTests={totalTests}
          timeTaken={timeTaken}
          opponentName={opponentName}
          difficulty={problem?.difficulty}
          onRematch={handleRematch}
          onLobby={() => navigate('/lobby')}
        />
      )}

      <ConstraintAlert constraint={constraint} onDismiss={() => setConstraint(null)} />

      <style>{`
        :root {
          --bg-main: #0a0a0a; --bg-panel: #121212;
          --bg-glass: rgba(18,18,18,0.8); --border: rgba(255,255,255,0.08);
          --text-main: #e5e5e5; --text-muted: #888;
          --orange: #ff6b35; --green: #22c55e; --red: #ef4444;
        }
        .battle-container { height: 100vh; background: var(--bg-main); display: flex; flex-direction: column; overflow: hidden; font-family: Inter, sans-serif; color: var(--text-main); }
        .glass-panel { background: var(--bg-glass); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
        .top-nav { height: 56px; display: flex; align-items: center; padding: 0 20px; gap: 12px; flex-shrink: 0; z-index: 50; }
        .logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 18px; cursor: pointer; letter-spacing: -0.5px; }
        .divider { width: 1px; height: 24px; background: var(--border); }
        .picker-wrapper { position: relative; }
        .problem-btn { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 6px 14px; cursor: pointer; transition: all 0.2s; color: var(--text-main); }
        .problem-btn:hover:not(:disabled) { border-color: rgba(255,107,53,0.3); }
        .problem-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .problem-title { font-size: 13px; font-weight: 600; }
        .diff-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid; display: inline-block; }
        .dropdown-menu { position: absolute; top: 45px; left: 0; background: #1a1a1a; border: 1px solid var(--border); border-radius: 12px; min-width: 320px; max-height: 400px; overflow-y: auto; z-index: 100; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .dropdown-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid var(--border); transition: background 0.2s; }
        .dropdown-item:hover, .dropdown-item.active { background: rgba(255,255,255,0.05); }
        .dropdown-title { font-size: 13px; font-weight: 600; }
        .dropdown-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
        .status-pill { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 4px 12px; }
        .status-pill.live { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.05); }
        .status-pill.waiting { border-color: rgba(251,146,60,0.2); }
        .player-mini { display: flex; align-items: center; gap: 6px; }
        .avatar { width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: #fff; }
        .vs { font-size: 10px; font-weight: 600; color: #555; margin: 0 4px; }
        .status-text { font-size: 11px; font-weight: 700; margin-left: 4px; }
        .ai-active { border-color: rgba(251,146,60,0.3); background: rgba(251,146,60,0.1); color: var(--orange); font-size: 11px; font-weight: 600; }
        .connection-status { display: flex; align-items: center; gap: 6px; }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .pulse-dot.green { background: var(--green); box-shadow: 0 0 8px var(--green); }
        .pulse-dot.red { background: var(--red); }
        .pulse-dot.orange { background: var(--orange); }
        .pulse-dot.animate { animation: pulse 1s infinite; }
        .timer-box { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px; padding: 6px 16px; }
        .main-grid { flex: 1; display: grid; grid-template-columns: 300px 1fr 300px; overflow: hidden; position: relative; }
        .waiting-overlay { position: absolute; inset: 0; background: rgba(10,10,10,0.92); backdrop-filter: blur(8px); z-index: 40; display: flex; align-items: center; justify-content: center; }
        .waiting-card { background: rgba(20,20,25,0.98); border: 1px solid rgba(255,107,53,0.25); border-radius: 20px; padding: 40px; text-align: center; max-width: 460px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.7); }
        .radar-spinner { width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; border: 2px solid rgba(255,107,53,0.2); border-top-color: var(--orange); animation: spin 1s linear infinite; }
        .wait-title { font-family: Outfit, sans-serif; font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 8px 0; }
        .wait-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 28px; line-height: 1.6; }
        .wait-players { display: flex; align-items: center; justify-content: center; gap: 24px; }
        .w-player { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 90px; }
        .w-avatar { width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: Outfit; font-size: 18px; font-weight: 800; color: #fff; border: 2px solid var(--border); }
        .me-bg { background: linear-gradient(135deg, var(--orange), #ea580c); border-color: rgba(255,107,53,0.4); }
        .w-name { font-size: 13px; font-weight: 600; }
        .panel { display: flex; flex-direction: column; background: var(--bg-panel); border-right: 1px solid var(--border); overflow: hidden; }
        .panel:last-child { border-right: none; }
        .panel-tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; background: rgba(0,0,0,0.2); }
        .tab-btn { flex: 1; padding: 12px 0; font-size: 11px; font-weight: 700; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); cursor: pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; }
        .tab-btn.active { color: var(--orange); border-bottom-color: var(--orange); background: rgba(255,107,53,0.05); }
        .panel-content { flex: 1; overflow-y: auto; padding: 20px; }
        .prob-title { font-family: Outfit, sans-serif; font-weight: 800; font-size: 20px; margin: 0 0 8px 0; }
        .tags-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .company-tag { font-size: 10px; background: rgba(255,255,255,0.05); border: 1px solid var(--border); padding: 4px 8px; border-radius: 4px; color: #aaa; }
        .prob-desc { font-size: 13px; color: #aaa; line-height: 1.6; margin-bottom: 20px; }
        .example-box { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
        .example-label { font-size: 10px; color: #555; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
        .code-line { font-family: 'JetBrains Mono', monospace; font-size: 12px; margin-bottom: 4px; }
        .explain-text { font-size: 12px; color: #777; margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border); }
        .info-box { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,107,53,0.15); border-radius: 8px; padding: 12px; }
        .info-label { font-size: 10px; color: #555; font-weight: 700; letter-spacing: 1px; }
        .loading-text { text-align: center; padding: 40px; color: #555; font-size: 13px; }
        .score-card { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .score-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; font-weight: 600; }
        .progress-bg { background: rgba(255,255,255,0.05); height: 6px; border-radius: 4px; overflow: hidden; }
        .progress-bar { height: 100%; border-radius: 4px; transition: width 0.5s; }
        .battle-alert { margin-top: 16px; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; }
        .alert-orange { background: rgba(251,146,60,0.05); border: 1px solid rgba(251,146,60,0.2); color: var(--orange); }
        .alert-green { background: rgba(34,197,94,0.05); border: 1px solid rgba(34,197,94,0.2); color: var(--green); }
        .editor-header { height: 46px; display: flex; align-items: center; padding: 0 16px; gap: 12px; flex-shrink: 0; }
        .user-indicator { display: flex; align-items: center; gap: 8px; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 600; color: var(--orange); }
        .user-indicator.red { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: var(--red); }
        .dot-orange { width: 8px; height: 8px; border-radius: 50%; background: var(--orange); box-shadow: 0 0 8px var(--orange); }
        .dot-red { width: 8px; height: 8px; border-radius: 50%; background: var(--red); }
        .lang-select { font-family: Inter; font-size: 12px; font-weight: 600; color: #aaa; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 6px; padding: 4px 10px; cursor: pointer; outline: none; }
        .action-btn { font-family: Inter; font-size: 12px; font-weight: 700; border: none; border-radius: 6px; padding: 6px 16px; cursor: pointer; transition: all 0.2s; }
        .run-btn { background: rgba(255,255,255,0.05); color: #ccc; border: 1px solid var(--border); }
        .run-btn:hover:not(.disabled) { background: rgba(255,255,255,0.1); color: #fff; }
        .submit-btn { background: linear-gradient(135deg, #ff6b35, #f7451d); color: #fff; box-shadow: 0 4px 15px rgba(255,107,53,0.2); }
        .submit-btn:hover:not(.disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,107,53,0.4); }
        .submit-btn.success { background: linear-gradient(135deg, #22c55e, #16a34a); box-shadow: 0 4px 15px rgba(34,197,94,0.2); }
        .submit-btn.failed { background: linear-gradient(135deg, #ef4444, #dc2626); box-shadow: 0 4px 15px rgba(239,68,68,0.2); }
        .action-btn.disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .monaco-wrapper { flex: 1; overflow: hidden; background: #1e1e1e; }
        .output-panel { height: 180px; background: rgba(0,0,0,0.4); border-top: 1px solid var(--border); padding: 12px 16px; overflow-y: auto; flex-shrink: 0; }
        .output-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 12px; color: var(--text-muted); }
        .output-label.success { color: var(--green); }
        .output-label.failed { color: var(--red); }
        .test-result-row { display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
        .test-result-row.pass { background: rgba(34,197,94,0.05); border-color: rgba(34,197,94,0.15); }
        .test-result-row.fail { background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.15); }
        .test-badge { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; flex-shrink: 0; }
        .pass .test-badge { background: rgba(34,197,94,0.2); color: var(--green); }
        .fail .test-badge { background: rgba(239,68,68,0.2); color: var(--red); }
        .test-input { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #aaa; flex: 1; word-break: break-all; }
        .test-error { font-family: 'JetBrains Mono', monospace; font-size: 12px; flex: 1; }
        .pass .test-error { color: var(--green); }
        .fail .test-error { color: var(--red); }
        .test-time { font-size: 11px; color: #555; flex-shrink: 0; }
        .ai-panel { height: 180px; border-top: 1px solid var(--border); background: rgba(0,0,0,0.3); padding: 16px; flex-shrink: 0; }
        .ai-box { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 14px; transition: all 0.3s; }
        .ai-box.loading { background: rgba(251,146,60,0.05); border-color: rgba(251,146,60,0.3); }
        .ai-box-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 12px; font-weight: 700; color: #aaa; }
        .ai-box.loading .ai-box-header { color: var(--orange); }
        .ai-box p { font-size: 13px; color: #777; line-height: 1.6; margin: 0; }
        .ai-box.loading p { color: #d97706; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        @media (max-width: 1024px) {
          .main-grid { grid-template-columns: 1fr; overflow-y: auto; display: flex; flex-direction: column; }
          .opp-panel { display: none; }
          .panel { border-right: none; border-bottom: 1px solid var(--border); min-height: 50vh; }
          .editor-panel { min-height: 70vh; }
        }
      `}</style>
    </div>
  )
}