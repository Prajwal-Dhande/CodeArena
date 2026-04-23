import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { io } from 'socket.io-client'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Timer from './Timer'
import WinnerScreen from './WinnerScreen'
import ConstraintAlert from './ConstraintAlert'
import API_URL from '../../config/api'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { synthwaveTheme } from './MonacoThemes';
import LofiRadio from './LofiRadio';
import VisualFlowHint from './VisualFlowHint';

const PROBLEM_COMPLEXITY = {
  'two-sum': 'O(N)',
  'best-time-to-buy-stock': 'O(N)',
  'contains-duplicate': 'O(N)',
  'product-of-array-except-self': 'O(N)',
  'maximum-subarray': 'O(N)',
  'valid-parentheses': 'O(N)',
  'longest-substring-without-repeating': 'O(N)',
  'longest-substring-without-repeat': 'O(N)',
  'valid-anagram': 'O(N)',
  'reverse-linked-list': 'O(N)',
  'merge-two-sorted-lists': 'O(N + M)',
  'maximum-depth-binary-tree': 'O(N)',
  'invert-binary-tree': 'O(N)',
  'climbing-stairs': 'O(N)',
  'coin-change': 'O(N * amount)',
  'house-robber': 'O(N)',
  'number-of-islands': 'O(M * N)',
  'merge-intervals': 'O(N log N)',
  'binary-search': 'O(log N)',
  'find-minimum-in-rotated-array': 'O(log N)',
  'min-stack': 'O(1)',
  'trapping-rain-water': 'O(N)',
  'lru-cache': 'O(1)',
  'subarray-sum-equals-k': 'O(N)',
  'valid-palindrome': 'O(N)',
  'validate-binary-search-tree': 'O(N)',
  'kth-smallest-element-in-bst': 'O(N)',
  'reverse-linked-list-ii': 'O(N)',
  'merge-k-sorted-lists': 'O(N log K)'
};

const DIFF_COLOR = {
  Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
}

const DEFAULT_STARTER = {
  javascript: `function solution() {\n  // Your solution here\n\n};`,
  typescript: `function solution(): any {\n  // Your TS solution here\n\n};`,
  python: `def solution():\n    # Your solution here\n    pass`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\n// Your solution here`,
  java: `class Solution {\n    // Your solution here\n}`,
}

const LanguageIcon = ({ lang }) => {
  switch (lang) {
    case 'javascript':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <rect width="24" height="24" rx="4" fill="#F7DF1E"/>
           <path d="M11.4 17.5C11.4 18.7 10.4 19.5 8.9 19.5C7.7 19.5 6.9 18.9 6.5 18L8.1 17C8.3 17.6 8.7 18 9.1 18C9.5 18 9.8 17.7 9.8 17.2V11H11.5V17.5ZM18.4 19.5C15.9 19.5 14.5 18.2 14.5 16.5H16.2C16.2 17.4 17 18 18.3 18C19.3 18 20 17.6 20 16.9C20 16.3 19.5 15.9 18.5 15.6L17.5 15.3C15.5 14.8 14.7 13.8 14.7 12.3C14.7 10.7 16 9.5 18.2 9.5C20.3 9.5 21.6 10.6 21.8 12.2L20.1 12.6C19.9 11.6 19.2 11 18.2 11C17.3 11 16.5 11.4 16.5 12.1C16.5 12.7 17 13.1 18.1 13.3L19 13.5C21.1 14 21.9 15.1 21.9 16.6C21.8 18.4 20.5 19.5 18.4 19.5Z" fill="black"/>
        </svg>
      );
    case 'typescript':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#3178C6"/>
          <path d="M12.9231 16.7115C12.9231 18.3269 11.5385 19.5 9.23077 19.5C6.92308 19.5 5.53846 18.3269 5.53846 16.7115V11.5H10.1538V16.7115H8.30769C8.30769 15.7885 9.23077 15.1154 10.1538 15.1154V11.5H5.53846C5.53846 12.6538 6.46154 13.5 7.38462 13.5H12.9231V16.7115ZM18.4615 16.7115V11.5H20.3077V13.5H16.6154V11.5H14.7692V16.7115C14.7692 17.85 15.6923 18.6923 16.6154 18.6923H20.3077V16.7115H18.4615Z" fill="white"/>
        </svg>
      );
    case 'python':
      return (
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M12 2C8 2 8 4 8 4H16V5.5H8C5.5 5.5 5 7 5 10C5 13 5.5 14.5 8 14.5H9.5V12.5C9.5 11 10.5 10 12 10H15.5C17 10 18 9 18 7C18 5 17 2 12 2ZM10.5 3.5C11 3.5 11.5 4 11.5 4.5C11.5 5 11 5.5 10.5 5.5C10 5.5 9.5 5 9.5 4.5C9.5 4 10 3.5 10.5 3.5Z" fill="#3776AB"/>
           <path d="M12 22C16 22 16 20 16 20H8V18.5H16C18.5 18.5 19 17 19 14C19 11 18.5 9.5 16 9.5H14.5V11.5C14.5 13 13.5 14 12 14H8.5C7 14 6 15 6 17C6 19 7 22 12 22ZM13.5 20.5C13 20.5 12.5 20 12.5 19.5C12.5 19 13 18.5 13.5 18.5C14 18.5 14.5 19 14.5 19.5C14.5 20 14 20.5 13.5 20.5Z" fill="#FFD343"/>
         </svg>
      );
    case 'java':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.4 18.7c-3.1 1.7-8.2 1.4-10-.6-.5-.5-.4-1.2.1-1.6.4-.3.8-.4 1.3-.2 1.9.7 5.8 1.1 8.8-.4.5-.3 1.1-.1 1.4.3.3.4.1 1-.5 1.3C16 17.8 15.7 18.2 15.4 18.7M16 15.8c-2.4 1.3-6.5 1.4-8.8.2-.5-.2-1.1-.1-1.3.4-.2.5 0 1.1.5 1.3 2.9 1.4 7.6 1.4 10.5-.2.5-.3.6-1 .3-1.4-.4-.5-1-.6-1.5-.3M14.6 2.3c-.6-.7-2-.8-2.6-.2-.6.7-1 1.8.2 2.8 1 1 1 2.3.2 3.6-.5.7-1 1.3-.6 2.1.2.6.8.8 1.4.3.8-.7 1.3-1.5.8-2.6-.5-.9-.5-2.2.3-3 .7-.7.9-2 .3-3zM10.8 4c-.5-.7-1.8-.8-2.5-.2-.5.5-.8 1.6.1 2.5.8.8.8 2 .1 3.2-.4.6-.8 1.2-.5 1.9.2.5.7.7 1.2.3.7-.6 1.1-1.4.7-2.3-.4-.8-.4-2 .2-2.7.6-.7.8-2 .3-2.7zM18.7 5.4c-.4-.5-1.5-.6-2.1-.1-.5.5-.7 1.4.1 2.2.7.7.7 1.8.1 2.9-.3.5-.6 1.1-.4 1.7.2.5.6.6 1 .3.6-.5.9-1.2.6-2.1-.3-.7-.3-1.8.2-2.4.6-.6.7-1.7.3-2.5z" fill="#E76F00"/>
          <path d="M19.2 14c.7-1 1-2.1.8-3.1-.2-1.2-1-2.1-2.2-2.6-1.3-.5-3.3-.6-5.8-.6H10c-3 0-5.1.2-6.5.6-1.4.4-2.2 1.1-2.5 2.1-.3 1.1-.1 2.3.7 3.3.7 1 1.8 1.8 3 2.4-1.2-.5-1.9-1.2-2.2-2.1-.2-.7 0-1.5.6-2.2.6-.8 1.6-1.4 2.9-1.8 1.3-.4 3.1-.5 5.5-.5h2c2.2 0 4.1.2 5.3.6 1.1.4 1.7 1.1 1.9 1.9.2.8-.1 1.7-.7 2.4-1.2 1.3-3.2 2.3-5.9 2.8 1.7-.2 3.1-.7 4.1-1.4 1-.7 1.4-1.4 1.4-2z" fill="#5382A1"/>
        </svg>
      );
    case 'cpp':
      return (
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <rect width="24" height="24" rx="4" fill="#00599C"/>
           <path d="M12.4 14.5C12.4 16.5 10.8 18 8.5 18C6.2 18 4.6 16.5 4.6 14.5V9.5C4.6 7.5 6.2 6 8.5 6C10.8 6 12.4 7.5 12.4 9.5H10.6C10.6 8.4 9.7 7.6 8.5 7.6C7.3 7.6 6.4 8.4 6.4 9.5V14.5C6.4 15.6 7.3 16.4 8.5 16.4C9.7 16.4 10.6 15.6 10.6 14.5H12.4ZM15 10.5V8.5H16.5V10.5H18.5V12H16.5V14H15V12H13V10.5H15ZM19 10.5V8.5H20.5V10.5H22.5V12H20.5V14H19V12H17V10.5H19Z" fill="white"/>
         </svg>
      );
    default:
      return null;
  }
}

// Server-side function name adaptation handles all languages
// No client-side renaming needed — server reads user's actual function name
const processCodeForBackend = (rawCode) => rawCode;

const getRoomId = () => new URLSearchParams(window.location.search).get('room') || 'demo-room-1'
const getProblemSlug = () => new URLSearchParams(window.location.search).get('problem') || 'two-sum'
const isPracticeMode = () => new URLSearchParams(window.location.search).get('practice') === 'true'
const isRealMatch = () => new URLSearchParams(window.location.search).get('real') === 'true'
const isPremiumMode = () => new URLSearchParams(window.location.search).get('premium') === 'true'

export default function BattleRoom() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // USER STATE
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'))

  const [problem, setProblem] = useState(null)
  const [problemLoading, setProblemLoading] = useState(true)
  
  const [language, setLanguage] = useState(() => {
    const roomId = getRoomId();
    return localStorage.getItem(`codeArena_lang_${roomId}`) || 'javascript';
  })

  // CHECK IF ALREADY SOLVED
  const isAlreadySolved = currentUser?.solvedProblems?.some(sp => {
    const slug = getProblemSlug();
    if (typeof sp === 'string') return sp === slug || sp === problem?._id;
    return sp === slug || sp === problem?._id || sp.slug === slug || sp.problemId === problem?._id;
  });

  const [code, setCode] = useState(() => {
    const roomId = getRoomId();
    const slug = getProblemSlug();
    
    const solvedCode = localStorage.getItem(`codeArena_solvedCode_${slug}`);
    if (solvedCode) return solvedCode;

    return localStorage.getItem(`codeArena_draft_${roomId}`) || DEFAULT_STARTER[language];
  })
  
  const [opponentCode, setOpponentCode] = useState('// Waiting for opponent...')
  const [results, setResults] = useState([])
  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [myTests, setMyTests] = useState(0)
  const [oppTests, setOppTests] = useState(0)
  const [constraint, setConstraint] = useState(null)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('problem')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiDebugHint, setAiDebugHint] = useState(null)
  const [aiDebugLoading, setAiDebugLoading] = useState(false)
  const [zenMode, setZenMode] = useState(false)
  const [showProblemPicker, setShowProblemPicker] = useState(false)
  const [allProblems, setAllProblems] = useState([])
  const [roomPlayers, setRoomPlayers] = useState([])
  const [battleStarted, setBattleStarted] = useState(false)
  const [opponentName, setOpponentName] = useState('Opponent')
  const [gameOver, setGameOver] = useState(false)
  const [gameResult, setGameResult] = useState(null)
  const [timeTaken, setTimeTaken] = useState(0)
  const [complexity, setComplexity] = useState(null)

  const [timerKey, setTimerKey] = useState(0) 
  const [remainingTime, setRemainingTime] = useState(() => {
    const roomId = getRoomId();
    const savedEndTime = localStorage.getItem(`codeArena_endTime_${roomId}`);
    if (savedEndTime) {
      const timeLeft = Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000);
      return timeLeft > 0 ? timeLeft : 0;
    }
    return 600;
  })

  const socketRef = useRef(null)
  const constraintTriggered = useRef(false)
  const gameOverRef = useRef(false)
  const battleStartedRef = useRef(false)
  const startTimeRef = useRef(Date.now())
  const botTimeoutRef = useRef(null)
  const botTypingCancelRef = useRef(false) 

  const mode = searchParams.get('mode')
  const isMatchmakingMode = mode === 'random' || mode === 'ranked'
  const isProblemLocked = battleStarted || isMatchmakingMode || isRealMatch()

  useEffect(() => {
    if (battleStarted) {
      // ✅ Agar problem already solved hai toh timer mat chalaao
      if (isAlreadySolved) return;

      const roomId = getRoomId();
      const savedEndTime = localStorage.getItem(`codeArena_endTime_${roomId}`);
      
      if (savedEndTime) {
        const timeLeft = Math.floor((parseInt(savedEndTime, 10) - Date.now()) / 1000);
        if (timeLeft > 0) {
          setRemainingTime(timeLeft);
          setTimerKey(prev => prev + 1); 
        } else {
          setRemainingTime(0);
          handleTimeUp();
        }
      } else {
        const newEndTime = Date.now() + 600 * 1000;
        localStorage.setItem(`codeArena_endTime_${roomId}`, newEndTime.toString());
        setRemainingTime(600);
        setTimerKey(prev => prev + 1);
      }
    }
  }, [battleStarted, isAlreadySolved])

  useEffect(() => {
    const slug = getProblemSlug()
    const roomId = getRoomId()
    const fetchProblem = async () => {
      setProblemLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/problems/${slug}`)
        const data = await res.json()
        if (data.problem) {
          setProblem(data.problem)
          
          const isProblemSolvedLocally = currentUser?.solvedProblems?.some(sp => {
            if (typeof sp === 'string') return sp === slug || sp === data.problem._id;
            return sp === slug || sp === data.problem._id || sp.slug === slug || sp.problemId === data.problem._id;
          });

          if (isProblemSolvedLocally) {
            const solvedCode = localStorage.getItem(`codeArena_solvedCode_${slug}`);
            if (solvedCode) setCode(solvedCode);
          } else {
            const savedCode = localStorage.getItem(`codeArena_draft_${roomId}`);
            if (!savedCode) {
              setCode(data.problem.starterCode?.[language] || DEFAULT_STARTER[language] || DEFAULT_STARTER.javascript)
            }
          }
        }
      } catch (err) {
        console.error("Failed to load problem", err);
      }
      setProblemLoading(false)
    }
    fetchProblem()
  }, [searchParams, language])

  useEffect(() => {
    fetch(`${API_URL}/api/problems`)
      .then(r => r.json())
      .then(d => setAllProblems(d.problems || []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    // 🔥 TYPO FIXED HERE: new URLSearchParams
    const botNameFromUrl = new URLSearchParams(window.location.search).get('bot')
    const isBot = botNameFromUrl || opponentName.startsWith('Bot_')
    
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
      if (botTypingCancelRef.current) return 
      
      if (charIndex < targetCode.length) {
        currentText += targetCode[charIndex]
        setOpponentCode(currentText)
        charIndex++
        const char = targetCode[charIndex - 1]
        const delay = char === '\n' ? Math.random() * 600 + 300 : char === ' ' ? Math.random() * 100 + 30 : Math.random() * 120 + 40
        typingTimer = setTimeout(typeChar, delay)
      } else {
        setTimeout(() => {
          if (!botTypingCancelRef.current) setOppTests(Math.floor(Math.random() * 2) + 1)
        }, 2000)
      }
    }

    const startDelay = setTimeout(typeChar, 3000)
    return () => { clearTimeout(startDelay); clearTimeout(typingTimer); }
  }, [battleStarted, opponentName])

  useEffect(() => {
    const socket = io(API_URL)
    socketRef.current = socket
    const botNameFromUrl = new URLSearchParams(window.location.search).get('bot')

    socket.on('connect', () => {
      setConnected(true)
      const roomId = getRoomId()
      
      const isReconnecting = !!localStorage.getItem(`codeArena_endTime_${roomId}`)
      if (isReconnecting) {
        setBattleStarted(true)
        battleStartedRef.current = true
      }
      
      socket.emit('join_room', { roomId, username: currentUser?.username || `Player_${socket.id?.slice(0, 4)}` })
    })

    socket.on('disconnect', () => setConnected(false))
    socket.on('opponent_code', ({ code }) => setOpponentCode(code))
    socket.on('ai_constraint', ({ message }) => { setConstraint(message); setAiLoading(false) })

    socket.on('room_update', ({ players }) => {
      const uniquePlayers = Array.from(new Map(players.map(p => [p.username, p])).values());
      setRoomPlayers(uniquePlayers)
      const opp = uniquePlayers.find(p => p.username !== currentUser?.username)

      if (opp) {
        setOpponentName(opp.username)
        clearTimeout(botTimeoutRef.current)
        botTypingCancelRef.current = true

        if (!battleStartedRef.current) {
          battleStartedRef.current = true; setBattleStarted(true); startTimeRef.current = Date.now()
        }
      } else if (uniquePlayers.length === 1) {
        if (isPracticeMode()) {
          setTimeout(() => {
            if (!battleStartedRef.current) {
              battleStartedRef.current = true; setBattleStarted(true); startTimeRef.current = Date.now()
            }
          }, 1500)
        } else if (!isRealMatch()) {
          botTimeoutRef.current = setTimeout(() => {
            if (botTypingCancelRef.current) return 
            const botName = botNameFromUrl || `Bot_${Math.floor(Math.random() * 999)}`
            setRoomPlayers(prev => {
              if (prev.find(p => p.username === botName)) return prev;
              return [...prev, { username: botName, isBot: true }]
            })
            setOpponentName(botName)
            setOpponentCode(`function solution() {\n  // Thinking...\n}`)

            setTimeout(() => {
              if (!battleStartedRef.current) {
                battleStartedRef.current = true; setBattleStarted(true); startTimeRef.current = Date.now()
              }
            }, 1000)
          }, 8000)
        }
      }
    })

    socket.on('battle_start', () => {
      clearTimeout(botTimeoutRef.current)
      if (!battleStartedRef.current) {
        battleStartedRef.current = true; setBattleStarted(true); startTimeRef.current = Date.now()
      }
    })

    socket.on('opponent_tests', ({ passed }) => setOppTests(passed))

    socket.on('opponent_won', () => {
      if (!gameOverRef.current) {
        gameOverRef.current = true
        setTimeTaken(Math.round((Date.now() - startTimeRef.current) / 1000))
        setGameResult('loss'); setGameOver(true)
      }
    })
    
    socket.on('opponent_left_win', () => {
      if (!gameOverRef.current) {
        gameOverRef.current = true
        setTimeTaken(Math.round((Date.now() - startTimeRef.current) / 1000))
        setGameResult('win'); setGameOver(true)
      }
    })

    socket.on('player_left', ({ username }) => {
      setOpponentCode(`// ${username} left the battle...`)
      clearTimeout(botTimeoutRef.current)
      if (!gameOverRef.current) {
        gameOverRef.current = true
        setTimeTaken(Math.round((Date.now() - startTimeRef.current) / 1000))
        setGameResult('win'); setGameOver(true)
      }
    })

    return () => { socket.disconnect(); clearTimeout(botTimeoutRef.current) }
  }, [currentUser])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    const roomId = getRoomId()
    localStorage.setItem(`codeArena_lang_${roomId}`, lang)
    const newCode = problem?.starterCode?.[lang] || DEFAULT_STARTER[lang] || ''
    setCode(newCode)
    localStorage.setItem(`codeArena_draft_${roomId}`, newCode)
  }

  const handleEditorMount = (editor, monaco) => {
    monaco.editor.defineTheme('synthwave', synthwaveTheme);
  };

  const handleProblemChange = async (slug) => {
    setShowProblemPicker(false)
    const roomId = getRoomId();
    localStorage.removeItem(`codeArena_draft_${roomId}`); 
    
    setResults([]); setMyTests(0); setOppTests(0); setConstraint(null)
    setGameOver(false); setGameResult(null); setSubmitStatus(null)
    gameOverRef.current = false; constraintTriggered.current = false
    setProblemLoading(true)
    
    try {
      const res = await fetch(`${API_URL}/api/problems/${slug}`)
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
    if (!isAlreadySolved) {
      const roomId = getRoomId()
      localStorage.setItem(`codeArena_draft_${roomId}`, val)
      socketRef.current?.emit('code_change', { roomId, code: val })
    }
  }

  const triggerAIConstraint = async (currentCode, passed, total) => {
    if (constraintTriggered.current) return
    constraintTriggered.current = true
    setAiLoading(true)
    try {
      const token = localStorage.getItem('token')
      const roomId = getRoomId()
      const slug = getProblemSlug()
      const res = await fetch(`${API_URL}/api/code/ai-constraint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: currentCode, problemId: problem?.slug || slug, passed, total, roomId })
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Session expired for security reasons. Please log in again.");
        window.location.href = '/auth';
        return;
      }

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
      
      const processedCode = processCodeForBackend(code, language);
      
      const res = await fetch(`${API_URL}/api/code/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: processedCode, language, problemId: problem?.slug || slug })
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Session expired. Please log in again to continue.");
        window.location.href = '/auth';
        return;
      }

      const data = await res.json()
      
      // CORB SAFE CHECK
      const resultsArray = data.results || [];
      if (!res.ok || resultsArray.length === 0) { 
        setResults([{ i: 0, ok: false, error: data.message || "Execution Failed" }]); 
        setRunning(false); return; 
      }

      setMyTests(data.passed)
      if (data.complexity) setComplexity(data.complexity)
      socketRef.current?.emit('tests_update', { roomId, passed: data.passed, total: data.total })
      setResults(resultsArray.map(r => ({
        i: r.testCase, ok: r.passed, result: r.result,
        expected: r.expected, input: JSON.stringify(r.input),
        error: r.error, time: r.executionTime
      })))

      if (data.passed >= Math.ceil(data.total / 2) && !constraintTriggered.current) {
        setTimeout(() => triggerAIConstraint(code, data.passed, data.total), 1200)
      }
    } catch (err) {
      setResults([{ i: 0, ok: false, error: 'Network Blocked or Server Unreachable.' }])
    }
    setRunning(false)
  }

  const handleAiDebug = async () => {
    if (!code || results.length === 0) return
    setAiDebugLoading(true)
    setAiDebugHint(null)
    try {
      const token = localStorage.getItem('token')
      const firstError = results.find(r => !r.ok)
      const errorOutput = firstError 
        ? `Failed on input: ${firstError.input}. Expected: ${firstError.expected}. Got: ${firstError.result}. Error: ${firstError.error}`
        : 'Code runs but fails hidden limits.';

      const slug = getProblemSlug()
      
      const res = await fetch(`${API_URL}/api/code/ai-debug`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code, problemId: problem?.slug || slug, errorOutput })
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Session expired. Please log in again to use AI Debugger.");
        window.location.href = '/auth';
        return;
      }

      const data = await res.json()
      if (data.hint) setAiDebugHint(data.hint)
    } catch (err) {
      setAiDebugHint('Oops! The AI Whisperer fell asleep. Check your syntax.')
    }
    setAiDebugLoading(false)
  }

  const submitCode = async () => {
    setSubmitting(true); setResults([]); setSubmitStatus(null)
    try {
      const token = localStorage.getItem('token')
      const roomId = getRoomId()
      const slug = getProblemSlug()
      
      const processedCode = processCodeForBackend(code, language);

      const res = await fetch(`${API_URL}/api/code/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: processedCode, language, problemId: problem?.slug || slug })
      })

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        alert("Session expired. Please log in again to submit your code.");
        window.location.href = '/auth';
        return;
      }

      const data = await res.json()
      
      // CORB SAFE CHECK
      const resultsArray = data.results || [];
      if (!res.ok || resultsArray.length === 0) { 
        setResults([{ i: 0, ok: false, error: data.message || "Execution Failed" }]); 
        setSubmitting(false); return; 
      }

      setMyTests(data.passed)
      if (data.complexity) setComplexity(data.complexity)
      socketRef.current?.emit('tests_update', { roomId, passed: data.passed, total: data.total })
      setResults(resultsArray.map(r => ({
        i: r.testCase, ok: r.passed, result: r.result,
        expected: r.expected, input: JSON.stringify(r.input),
        error: r.error, time: r.executionTime
      })))

      const isSuccess = data.allPassed || (data.passed > 0 && data.passed === data.total);

      if (isSuccess && !gameOverRef.current) {
        gameOverRef.current = true
        setSubmitStatus('success')
        
        try {
           const solveRes = await fetch(`${API_URL}/api/users/solve`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ problemId: problem?._id || slug })
           });
           const solveData = await solveRes.json();
           
           // Server se fresh user data aaya toh localStorage update karo
           if (solveData.success && solveData.user) {
             localStorage.setItem('user', JSON.stringify(solveData.user));
             setCurrentUser(solveData.user);
           } else {
             // Fallback: locally update karo agar server ne fresh data nahi diya
             const updatedUser = { ...currentUser };
             if (!updatedUser.solvedProblems) updatedUser.solvedProblems = [];
             const finalId = problem?._id || slug;
             if (!updatedUser.solvedProblems.includes(finalId)) {
               updatedUser.solvedProblems.push(finalId);
             }
             localStorage.setItem('user', JSON.stringify(updatedUser));
             setCurrentUser(updatedUser);
           }
        } catch (e) { 
          console.log("DB Sync failed", e);
          // Network fail pe bhi locally update karo
          const updatedUser = { ...currentUser };
          if (!updatedUser.solvedProblems) updatedUser.solvedProblems = [];
          const finalId = problem?._id || slug;
          if (!updatedUser.solvedProblems.includes(finalId)) {
            updatedUser.solvedProblems.push(finalId);
          }
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }

        localStorage.setItem(`codeArena_solvedCode_${slug}`, code);

        const savedEndTime = localStorage.getItem(`codeArena_endTime_${roomId}`);
        let secondsTaken = 0;
        if (savedEndTime) {
           const initialStart = parseInt(savedEndTime, 10) - (600 * 1000);
           secondsTaken = Math.round((Date.now() - initialStart) / 1000);
        } else {
           secondsTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
        }
        
        setTimeTaken(secondsTaken)
        setTimeout(() => { setGameResult('win'); setGameOver(true) }, 600)
        socketRef.current?.emit('battle_won', { roomId, winner: currentUser?.username || 'Player' })
      } else {
        setSubmitStatus('failed')
      }
    } catch (err) {
      setResults([{ i: 0, ok: false, error: 'Network Blocked or Server Unreachable.' }])
    }
    setSubmitting(false)
  }

  const handleTimeUp = () => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      let finalResult = 'draw';
      if (myTests > oppTests) finalResult = 'win';
      else if (oppTests > myTests) finalResult = 'loss';
      setTimeTaken(600);
      setGameResult(finalResult);
      setGameOver(true);
    }
  };

  useEffect(() => {
    if (gameOver) {
      const roomId = getRoomId();
      localStorage.removeItem(`codeArena_draft_${roomId}`);
      localStorage.removeItem(`codeArena_endTime_${roomId}`);
      localStorage.removeItem(`codeArena_lang_${roomId}`);
    }
  }, [gameOver])

  const handleRematch = () => {
    const roomId = getRoomId();
    localStorage.removeItem(`codeArena_draft_${roomId}`);
    localStorage.removeItem(`codeArena_endTime_${roomId}`);
    
    setGameOver(false); setGameResult(null); gameOverRef.current = false
    setCode(problem?.starterCode?.[language] || DEFAULT_STARTER[language])
    setResults([]); setMyTests(0); setOppTests(0)
    setConstraint(null); setSubmitStatus(null)
    constraintTriggered.current = false
    setBattleStarted(false); battleStartedRef.current = false;
  }

  const pct = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0
  const totalTests = problem?.testCases?.length || 3
  const roomId = getRoomId()
  const practiceMode = isPracticeMode()
  const premiumMode = isPremiumMode()

  return (
    <div className={`battle-container ${zenMode ? 'zen-active' : ''}`}>
      {premiumMode && <LofiRadio />}

      <div className="battle-header" style={{ display: zenMode ? 'none' : 'flex' }}>
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35' }}>Code</span>
          <span style={{ color: '#fff' }}>Arena</span>
        </span>
        <div className="divider" />

        {premiumMode ? (
          <div style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.1))', 
            border: '1px solid rgba(236,72,153,0.3)',
            color: '#ec4899', fontSize: 11, fontWeight: 800,
            padding: '4px 12px', borderRadius: 6, letterSpacing: 0.5, boxShadow: '0 0 15px rgba(236,72,153,0.2)'
          }}>💎 PREMIUM MAANG</div>
        ) : practiceMode ? (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e', fontSize: 11, fontWeight: 700,
            padding: '4px 12px', borderRadius: 6, letterSpacing: 0.5
          }}>🧠 PRACTICE MODE</div>
        ) : null}

        <div className="picker-wrapper">
          <button onClick={() => setShowProblemPicker(s => !s)} className="problem-btn" disabled={isProblemLocked}>
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
            {isProblemLocked ? (
               <span style={{ fontSize: 12, color: '#ef4444', marginLeft: 4 }} title="Problem locked in Matchmaking">🔒</span>
            ) : (
               <span style={{ fontSize: 10, color: '#555' }}>▼</span>
            )}
          </button>

          {showProblemPicker && !isProblemLocked && (
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

        {!premiumMode && !isAlreadySolved && (
          <div className="timer-box">
            <span style={{ fontSize: 10, color: '#666', fontWeight: 700, letterSpacing: 1 }}>TIME</span>
            {battleStarted
              ? <Timer key={timerKey} initialSeconds={remainingTime} onTimeUp={handleTimeUp} />
              : <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 700, color: '#666' }}>10:00</span>
            }
          </div>
        )}
        {isAlreadySolved && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#22c55e'
          }}>
            ✅ Solved
          </div>
        )}
      </div>

      <PanelGroup direction="horizontal" orientation="horizontal" className="main-grid" style={{ flex: 1 }}>

        {!battleStarted && !new URLSearchParams(window.location.search).get('bot') && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'radial-gradient(ellipse at 60% 30%, rgba(34,197,94,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,107,53,0.06) 0%, transparent 60%), #030305',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Inter, sans-serif'
          }}>

            {/* Animated bg particles */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: `${120 + i * 80}px`, height: `${120 + i * 80}px`,
                  border: `1px solid rgba(34,197,94,${0.04 + i * 0.015})`,
                  borderRadius: '50%',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: `ringPulse ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`
                }} />
              ))}
            </div>

            {/* Main Card */}
            <div style={{
              position: 'relative',
              background: 'rgba(12,12,16,0.85)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 28,
              padding: '52px 56px',
              width: '100%', maxWidth: 520,
              textAlign: 'center',
              boxShadow: '0 0 80px rgba(34,197,94,0.08), 0 40px 80px rgba(0,0,0,0.6)',
              animation: 'cardSlideIn 0.5s cubic-bezier(0.16,1,0.3,1)'
            }}>

              {/* Top glow line */}
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.7), transparent)',
                borderRadius: 2
              }} />

              {/* Mode badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: practiceMode ? 'rgba(34,197,94,0.1)' : 'rgba(255,107,53,0.1)',
                border: `1px solid ${practiceMode ? 'rgba(34,197,94,0.3)' : 'rgba(255,107,53,0.3)'}`,
                borderRadius: 20, padding: '6px 18px', marginBottom: 32,
                fontSize: 12, fontWeight: 800, letterSpacing: 1,
                color: practiceMode ? '#22c55e' : '#ff6b35'
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: practiceMode ? '#22c55e' : '#ff6b35',
                  animation: 'pulse 1.2s ease-in-out infinite'
                }} />
                {practiceMode ? 'PRACTICE MODE' : 'MATCHMAKING'}
              </div>

              {/* Spinner */}
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 28px' }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.04)'
                }} />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: `2px solid transparent`,
                  borderTopColor: practiceMode ? '#22c55e' : '#ff6b35',
                  borderRightColor: practiceMode ? 'rgba(34,197,94,0.4)' : 'rgba(255,107,53,0.4)',
                  animation: 'spin 0.9s linear infinite'
                }} />
                <div style={{
                  position: 'absolute', inset: 8, borderRadius: '50%',
                  border: `1px solid transparent`,
                  borderBottomColor: practiceMode ? 'rgba(34,197,94,0.6)' : 'rgba(255,107,53,0.6)',
                  animation: 'spin 1.4s linear infinite reverse'
                }} />
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 24
                }}>
                  {practiceMode ? '🧠' : '⚔️'}
                </div>
              </div>

              {/* Problem title */}
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                fontSize: 28, letterSpacing: '-0.5px',
                background: practiceMode
                  ? 'linear-gradient(135deg, #22c55e, #86efac, #22c55e)'
                  : 'linear-gradient(135deg, #ff6b35, #fbbf24, #ff6b35)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 10,
                animation: 'shimmer 2.5s linear infinite'
              }}>
                {problem?.title || 'Loading...'}
              </div>

              <div style={{ fontSize: 13, color: '#555', marginBottom: 36, fontWeight: 500 }}>
                {practiceMode ? 'Setting up your arena...' : `Room: `}
                {!practiceMode && <span style={{ color: '#ff6b35', fontFamily: 'monospace', fontWeight: 700 }}>{roomId}</span>}
              </div>

              {/* Players section */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
                {/* Me */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff6b35, #f7451d)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 800, color: '#fff',
                    boxShadow: '0 0 20px rgba(255,107,53,0.4)',
                    animation: 'avatarPop 0.4s cubic-bezier(0.16,1,0.3,1)'
                  }}>
                    {(roomPlayers[0]?.username || currentUser?.username || 'P').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#e5e5e5' }}>
                    {roomPlayers[0]?.username || currentUser?.username || 'You'}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 800, color: '#22c55e',
                    letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1s infinite' }} />
                    READY
                  </div>
                </div>

                {/* VS */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                }}>
                  <div style={{
                    fontFamily: 'Outfit', fontWeight: 900, fontSize: 18,
                    color: '#333', letterSpacing: 2
                  }}>VS</div>
                  <div style={{ width: 1, height: 30, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
                </div>

                {/* Opponent / Bot */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: '50%',
                    background: practiceMode
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                      : 'rgba(255,255,255,0.03)',
                    border: practiceMode ? 'none' : '2px dashed rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: practiceMode ? '0 0 20px rgba(34,197,94,0.3)' : 'none',
                    animation: 'avatarPop 0.4s cubic-bezier(0.16,1,0.3,1) 0.15s both'
                  }}>
                    {practiceMode ? '🤖' : '?'}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: practiceMode ? '#e5e5e5' : '#444' }}>
                    {practiceMode ? 'AI Opponent' : 'Searching...'}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 800,
                    color: practiceMode ? '#22c55e' : '#fb923c',
                    letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: practiceMode ? '#22c55e' : '#fb923c',
                      animation: 'pulse 1s infinite'
                    }} />
                    {practiceMode ? 'READY' : 'JOINING'}
                  </div>
                </div>
              </div>

              {/* Difficulty + loading bar */}
              {problem?.difficulty && (
                <div style={{ marginTop: 36 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '3px 12px', borderRadius: 20,
                      background: problem.difficulty === 'Easy' ? 'rgba(34,197,94,0.1)' : problem.difficulty === 'Hard' ? 'rgba(239,68,68,0.1)' : 'rgba(251,146,60,0.1)',
                      color: problem.difficulty === 'Easy' ? '#22c55e' : problem.difficulty === 'Hard' ? '#ef4444' : '#fb923c',
                      border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(34,197,94,0.2)' : problem.difficulty === 'Hard' ? 'rgba(239,68,68,0.2)' : 'rgba(251,146,60,0.2)'}`
                    }}>{problem.difficulty}</span>
                  </div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      background: practiceMode ? 'linear-gradient(90deg, #22c55e, #86efac)' : 'linear-gradient(90deg, #ff6b35, #fbbf24)',
                      animation: 'loadBar 1.8s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              )}

              {!practiceMode && !isRealMatch() && (
                <div style={{ marginTop: 20, fontSize: 11, color: '#333', fontStyle: 'italic' }}>
                  No opponent found? A bot joins in 8s...
                </div>
              )}
            </div>

            <style>{`
              @keyframes ringPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                50% { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
              }
              @keyframes cardSlideIn {
                from { opacity: 0; transform: translateY(24px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes avatarPop {
                from { opacity: 0; transform: scale(0.7); }
                to { opacity: 1; transform: scale(1); }
              }
              @keyframes shimmer {
                0% { background-position: 0% center; }
                100% { background-position: 200% center; }
              }
              @keyframes loadBar {
                0% { width: 0%; margin-left: 0; }
                50% { width: 70%; margin-left: 10%; }
                100% { width: 0%; margin-left: 100%; }
              }
            `}</style>
          </div>
        )}

        <Panel defaultSize={practiceMode ? 40 : 25} minSize={20} className="panel problem-panel">
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h2 className="prob-title" style={{ margin: 0 }}>{problem.title}</h2>
                    {isAlreadySolved && (
                      <span style={{
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e',
                        padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700
                      }}>✓ Solved</span>
                    )}
                  </div>
                  <span className="diff-badge" style={{
                    background: DIFF_COLOR[problem.difficulty]?.bg,
                    color: DIFF_COLOR[problem.difficulty]?.color,
                    borderColor: DIFF_COLOR[problem.difficulty]?.border,
                    marginBottom: 12, display: 'inline-block'
                  }}>{problem.difficulty}</span>

                  {premiumMode && problem.companies?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#888', marginBottom: 8, letterSpacing: 1 }}>FREQUENTLY ASKED BY:</div>
                      <div className="tags-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {problem.companies.map(c => (
                           <span key={c} style={{ 
                             background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(236,72,153,0.1))',
                             border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc',
                             fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px'
                           }}>🏢 {c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="prob-desc" style={{ whiteSpace: 'pre-wrap' }}>{problem.description}</p>

                  {problem.examples?.map((ex, i) => (
                    <div key={i} className="example-box">
                      <div className="example-label">EXAMPLE {i + 1}</div>
                      <div className="code-line" style={{ color: '#fb923c', whiteSpace: 'pre-wrap' }}>Input: {ex.input}</div>
                      <div className="code-line" style={{ color: '#22c55e', whiteSpace: 'pre-wrap' }}>Output: {ex.output}</div>
                      {ex.explain && <div className="explain-text" style={{ whiteSpace: 'pre-wrap' }}>{ex.explain}</div>}
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

                  {premiumMode && <VisualFlowHint problemSlug={problem?.slug} />}
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

                {!practiceMode && !premiumMode && (
                  <div className="score-card">
                    <div className="score-header">
                      <span>{opponentName}</span>
                      <span style={{ color: '#ef4444' }}>{oppTests} / {totalTests}</span>
                    </div>
                    <div className="progress-bg">
                      <div className="progress-bar" style={{ width: `${pct(oppTests, totalTests)}%`, background: '#ef4444' }} />
                    </div>
                  </div>
                )}

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
        </Panel>

        <PanelResizeHandle className="resize-handle-h" />

        <Panel defaultSize={practiceMode ? 60 : 50} minSize={30} className="panel editor-panel">
          <PanelGroup direction="vertical" orientation="vertical" style={{ height: '100%' }}>
            <Panel defaultSize={70} minSize={20} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="editor-header glass-panel">
            <div className="user-indicator">
              <div className="dot-orange" />
              <span>You</span>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                <LanguageIcon lang={language} />
              </div>
              <select value={language} onChange={e => handleLanguageChange(e.target.value)} className="pro-lang-select" disabled={isAlreadySolved}>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div style={{ flex: 1 }} />

            {premiumMode && (
              <button 
                onClick={() => setZenMode(!zenMode)} 
                style={{ 
                  background: zenMode ? 'rgba(34,211,238,0.1)' : 'transparent', 
                  border: zenMode ? '1px solid rgba(34,211,238,0.4)' : '1px solid transparent',
                  color: zenMode ? '#22d3ee' : '#aaa',
                  marginRight: 16, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {zenMode ? '🌌 ZEN ACTIVE' : '🌙 Zen Mode'}
              </button>
            )}

            {/* 🔥 ANTI-CHEAT: Hide Run/Submit if already solved! */}
            {isAlreadySolved ? (
              <button disabled style={{ 
                background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
                padding: '6px 16px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'Inter', cursor: 'not-allowed' 
              }}>
                ✓ ALREADY SOLVED
              </button>
            ) : (
              <>
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
              </>
            )}
          </div>

          <div className="monaco-wrapper">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme={zenMode ? 'synthwave' : 'vs-dark'}
              options={{
                readOnly: isAlreadySolved, // 🔥 Make Editor read-only if solved!
                minimap: { enabled: false }, fontSize: 13.5,
                fontFamily: 'JetBrains Mono', padding: { top: 14, bottom: 14 },
                smoothScrolling: true, cursorBlinking: 'smooth',
                wordWrap: 'on', tabSize: 2, lineNumbers: 'on',
                scrollBeyondLastLine: false
              }}
            />
          </div>
            </Panel>

            <PanelResizeHandle className="resize-handle-v" />

            <Panel defaultSize={30} minSize={10} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="output-panel" style={{ flex: 1, overflowY: 'auto', border: 'none', margin: 0, borderRadius: 0 }}>
                <div className={`output-label ${submitStatus || ''}`}>
              {submitStatus === 'success' ? '✓ ALL TESTS PASSED'
                : submitStatus === 'failed' ? '✗ WRONG ANSWER'
                : isAlreadySolved ? '✓ PROBLEM COMPLETED (CODE SAVED)'
                : 'TEST RESULTS'}
            </div>
            {results.length === 0 && !isAlreadySolved && (
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

            {premiumMode && submitStatus === 'failed' && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(236,72,153,0.05)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: aiDebugHint ? 12 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🤖</span>
                    <span style={{ color: '#ec4899', fontWeight: 800, fontFamily: 'Outfit', letterSpacing: 0.5 }}>AI Whisperer</span>
                  </div>
                  {!aiDebugHint && (
                    <button onClick={handleAiDebug} disabled={aiDebugLoading} style={{ 
                      background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', border: 'none', color: '#fff', 
                      padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      opacity: aiDebugLoading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(236,72,153,0.3)'
                    }}>
                      {aiDebugLoading ? 'Analyzing code...' : 'Debug My Code'}
                    </button>
                  )}
                </div>
                {aiDebugHint && (
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 16, borderLeft: '4px solid #ec4899', animation: 'fadeIn 0.4s ease' }}>
                    <p style={{ margin: 0, color: '#fbcfe8', fontSize: 14, fontStyle: 'italic', lineHeight: 1.6 }}>"{aiDebugHint}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Panel>
      </PanelGroup>
    </Panel>

        {!practiceMode && (
          <PanelResizeHandle className="resize-handle-h" />
        )}

        {!practiceMode && (
        <Panel defaultSize={25} minSize={15} className="panel opp-panel">
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
        </Panel>
        )}
      </PanelGroup>

      {gameOver && (
        <WinnerScreen
          result={gameResult}
          problem={problem}
          myTests={myTests}
          totalTests={totalTests}
          timeTaken={timeTaken}
          opponentName={opponentName}
          difficulty={problem?.difficulty}
          language={language}
          premiumMode={premiumMode}
          timeComplexity={complexity?.time || (problem?.slug ? PROBLEM_COMPLEXITY[problem.slug] : 'O(N)')}
          complexity={complexity}
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
        .main-grid { position: relative; overflow: hidden; background: #0a0a0a; }
        .resize-handle-h { width: 8px; background: rgba(255,255,255,0.01); cursor: col-resize; transition: background 0.2s; position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .resize-handle-h:hover, .resize-handle-h[data-resize-handle-active] { background: rgba(255,107,53,0.3); }
        .resize-handle-v { height: 8px; background: rgba(255,255,255,0.01); cursor: row-resize; transition: background 0.2s; position: relative; z-index: 10; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .resize-handle-v:hover, .resize-handle-v[data-resize-handle-active] { background: rgba(255,107,53,0.3); }
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
        
        .zen-active { background: #000; }
        .zen-active .glass-panel { background: rgba(10,5,15,0.9); border-color: rgba(236,72,153,0.1); }
        .zen-active .panel:not(.editor-panel) { opacity: 0.1; filter: blur(5px); pointer-events: none; transition: all 0.5s; }
        .zen-active .main-grid { border-top: none; }
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
        .user-indicator.red { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--red); }
        .dot-orange { width: 8px; height: 8px; border-radius: 50%; background: var(--orange); box-shadow: 0 0 8px var(--orange); }
        .dot-red { width: 8px; height: 8px; border-radius: 50%; background: var(--red); }
        
        .pro-lang-select {
          appearance: none;
          -webkit-appearance: none;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff; 
          padding: 6px 28px 6px 34px; 
          border-radius: 8px;
          font-family: Inter, sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
          background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%23aaa%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 14px;
        }
        .pro-lang-select:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .pro-lang-select option {
          background: #1a1a1a;
          color: #fff;
        }

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