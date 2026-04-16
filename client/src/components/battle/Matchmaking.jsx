import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import API_URL from '../../config/api'

const FAKE_PLAYERS = [
  { name: 'ByteSlayer99', elo: 1180, avatar: 'BS', country: '🇮🇳' },
  { name: 'AlgoKing_X', elo: 1220, avatar: 'AK', country: '🇺🇸' },
  { name: 'CodeNinja42', elo: 1195, avatar: 'CN', country: '🇬🇧' },
  { name: 'DevStorm_Z', elo: 1240, avatar: 'DZ', country: '🇩🇪' },
  { name: 'HashMapHero', elo: 1160, avatar: 'HH', country: '🇯🇵' },
  { name: 'RecursionKing', elo: 1210, avatar: 'RK', country: '🇧🇷' },
]

export default function Matchmaking({ user, onMatchFound, onCancel, selectedProblem, mode }) {
  const [dots, setDots] = useState('')
  const [searchTime, setSearchTime] = useState(0)
  const [scanLine, setScanLine] = useState(0)
  const [flashPlayers, setFlashPlayers] = useState([])
  const [matchedPlayer, setMatchedPlayer] = useState(null)
  const [phase, setPhase] = useState('searching')

  const socketRef = useRef(null)
  const botTimerRef = useRef(null)
  const matchFoundRef = useRef(false)
  const cancelledRef = useRef(false) // ✅ Track cancel state
  const timersRef = useRef([]) // ✅ Store all timeouts to kill them on cancel

  const userElo = user?.elo || 0

  const addTimer = (callback, delay) => {
    const timerId = setTimeout(callback, delay)
    timersRef.current.push(timerId)
    return timerId
  }

  useEffect(() => {
    const socket = io(API_URL)
    socketRef.current = socket
    cancelledRef.current = false

    socket.on('connect', () => {
      socket.emit('find_match', {
        username: user?.username || 'Player',
        elo: userElo,
        problemSlug: selectedProblem?.slug || null
      })
    })

    socket.on('match_found', ({ roomId, problem, opponent, elo }) => {
      if (matchFoundRef.current || cancelledRef.current) return
      matchFoundRef.current = true

      clearTimeout(botTimerRef.current)

      const realOpponent = {
        name: opponent,
        elo: elo ?? 0, 
        avatar: opponent.slice(0, 2).toUpperCase(),
        country: '',
        isReal: true,
        roomId,
        problemSlug: problem
      }

      addTimer(() => {
        if (cancelledRef.current) return
        setMatchedPlayer(realOpponent)
        setPhase('found')

        addTimer(() => {
          if (cancelledRef.current) return
          setPhase('starting')
          addTimer(() => {
            if (cancelledRef.current) return
            onMatchFound(realOpponent)
          }, 1500)
        }, 2000)
      }, 3000) 
    })

    socket.on('waiting_in_queue', ({ position }) => {
      botTimerRef.current = setTimeout(() => {
        if (matchFoundRef.current || cancelledRef.current) return
        matchFoundRef.current = true

        const bot = FAKE_PLAYERS[Math.floor(Math.random() * FAKE_PLAYERS.length)]
        setMatchedPlayer(bot)
        setPhase('found')

        addTimer(() => {
          if (cancelledRef.current) return
          setPhase('starting')
          addTimer(() => {
            if (cancelledRef.current) return
            onMatchFound(bot)
          }, 1500)
        }, 2000)
      }, 10000)
    })

    // ✅ CRITICAL BUG FIX: Socket disconnects and clears memory on unmount
    return () => { 
      cancelledRef.current = true
      clearTimeout(botTimerRef.current)
      timersRef.current.forEach(clearTimeout)
      socket.disconnect() 
    }
  }, [])

  // Animations
  useEffect(() => {
    const interval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => setSearchTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => setScanLine(s => (s + 1) % 100), 50)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const interval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1
      const shuffled = [...FAKE_PLAYERS].sort(() => Math.random() - 0.5).slice(0, count)
      setFlashPlayers(shuffled)
      setTimeout(() => setFlashPlayers([]), 600)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  // ✅ Cancel button force kills everything instantly
  const handleCancel = () => {
    cancelledRef.current = true
    clearTimeout(botTimerRef.current)
    timersRef.current.forEach(clearTimeout)
    socketRef.current?.emit('cancel_match')
    socketRef.current?.disconnect()
    onCancel()
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#09090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, pointerEvents: 'none', height: 2, top: `${scanLine}%`, background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.15), transparent)', transition: 'top 0.05s linear' }} />
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {phase === 'searching' && (
        <>
          <div style={{ marginBottom: 48, fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 24 }}><span style={{ color: '#ff6b35' }}>Code</span><span style={{ color: '#fff' }}>Arena</span></div>
          <div style={{ position: 'relative', width: 200, height: 200, marginBottom: 48 }}>
            {[200, 150, 100].map((size, i) => (
              <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: size, height: size, borderRadius: '50%', border: `1px solid rgba(255,107,53,${0.1 + i * 0.08})`, animation: `ping ${2 + i * 0.5}s ease-out infinite`, animationDelay: `${i * 0.3}s` }} />
            ))}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 160, height: 160, borderRadius: '50%' }}>
               <div style={{ width: '100%', height: '100%', borderRadius: '50%', animation: 'spin 2s linear infinite', background: 'conic-gradient(from 0deg, transparent 70%, rgba(255,107,53,0.3) 100%)' }} />
            </div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 16, height: 16, borderRadius: '50%', background: '#ff6b35', boxShadow: '0 0 20px #ff6b35, 0 0 40px rgba(255,107,53,0.4)' }} />
            {flashPlayers.map((p, i) => {
              const angle = (i / flashPlayers.length) * Math.PI * 2 + searchTime; const dist = 50 + Math.random() * 30; const x = Math.cos(angle) * dist; const y = Math.sin(angle) * dist
              return (<div key={p.name} style={{ position: 'absolute', top: `calc(50% + ${y}px)`, left: `calc(50% + ${x}px)`, transform: 'translate(-50%, -50%)', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'fadeOut 0.6s forwards' }} />)
            })}
          </div>

          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>Finding Match{dots}</div>
          <div style={{ fontSize: 14, color: '#555', marginBottom: 32 }}>Searching for real players near your ELO rating</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', marginBottom: 40, width: 520 }}>
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 16, padding: '20px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px', background: 'linear-gradient(135deg, #ff6b35, #f7451d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, color: '#fff' }}>{(user?.username || 'PL').slice(0, 2).toUpperCase()}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{user?.username || 'Player'}</div>
              <div style={{ fontSize: 12, color: '#ff6b35', fontWeight: 700 }}>⭐ {userElo} ELO</div>
              <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color: '#22c55e', letterSpacing: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />READY</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 32, color: '#333', letterSpacing: 2 }}>VS</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{formatTime(searchTime)}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {flashPlayers.length > 0 ? (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px', background: 'linear-gradient(135deg, #374151, #1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 900, fontSize: 18, color: '#aaa', animation: 'flash 0.3s ease-in-out' }}>{flashPlayers[0].avatar}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#aaa', animation: 'flash 0.3s' }}>{flashPlayers[0].name}</div>
                  <div style={{ fontSize: 12, color: '#555', fontWeight: 700 }}>⭐ {flashPlayers[0].elo} ELO</div>
                </>
              ) : (
                <>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px', background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#333' }}>?</div>
                  <div style={{ fontSize: 13, color: '#444', marginBottom: 4 }}>Searching{dots}</div>
                  <div style={{ fontSize: 11, color: '#333' }}>~{userElo} ELO range</div>
                </>
              )}
            </div>
          </div>
          <button className="cancel-btn" onClick={handleCancel}>✕ Cancel</button>
        </>
      )}

      {(phase === 'found' || phase === 'starting') && matchedPlayer && (
        <div style={{ textAlign: 'center', animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'bounce 0.6s ease infinite' }}>⚔️</div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 36, background: 'linear-gradient(90deg, #ff6b35, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 8, letterSpacing: '-1px' }}>{phase === 'starting' ? 'BATTLE STARTING!' : 'MATCH FOUND!'}</div>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 40 }}>{phase === 'starting' ? 'Prepare your weapons...' : 'Opponent locked in!'}</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'center', width: 480 }}>
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: 16, padding: '24px', textAlign: 'center', boxShadow: '0 0 30px rgba(255,107,53,0.1)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', background: 'linear-gradient(135deg, #ff6b35, #f7451d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#fff', boxShadow: '0 0 20px rgba(255,107,53,0.4)' }}>{(user?.username || 'PL').slice(0, 2).toUpperCase()}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{user?.username || 'You'}</div>
              <div style={{ fontSize: 13, color: '#ff6b35', fontWeight: 700 }}>⭐ {userElo}</div>
            </div>

            <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 28, color: '#ff6b35', textShadow: '0 0 20px rgba(255,107,53,0.5)' }}>VS</div></div>

            <div style={{ background: matchedPlayer.isReal ? 'rgba(96,165,250,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${matchedPlayer.isReal ? 'rgba(96,165,250,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 16, padding: '24px', textAlign: 'center', boxShadow: `0 0 30px ${matchedPlayer.isReal ? 'rgba(96,165,250,0.1)' : 'rgba(239,68,68,0.1)'}` }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', background: matchedPlayer.isReal ? 'linear-gradient(135deg, #1e3a5f, #1e40af)' : 'linear-gradient(135deg, #374151, #1f2937)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#e5e5e5', boxShadow: `0 0 20px ${matchedPlayer.isReal ? 'rgba(96,165,250,0.3)' : 'rgba(239,68,68,0.3)'}` }}>{matchedPlayer.avatar}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{matchedPlayer.name}</div>
              <div style={{ fontSize: 13, color: matchedPlayer.isReal ? '#60a5fa' : '#ef4444', fontWeight: 700 }}>
                ⭐ {matchedPlayer.elo} ELO
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes ping { 0% { transform: translate(-50%,-50%) scale(0.8); opacity: 1; } 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.3; } }
        @keyframes flash { 0%,100% { opacity: 0; } 50% { opacity: 1; } }
        @keyframes fadeOut { 0% { opacity: 1; transform: translate(-50%,-50%) scale(1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(2); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }

        .cancel-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 13px;
          font-weight: 600;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-btn:hover {
          color: #ff6b35;
          border-color: #ff6b35;
          background: rgba(255,107,53,0.1);
          box-shadow: 0 0 15px rgba(255,107,53,0.3);
        }
      `}</style>
    </div>
  )
}