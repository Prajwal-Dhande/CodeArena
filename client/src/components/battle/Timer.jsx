import { useEffect, useState } from 'react'

export default function Timer({ initialSeconds = 600 }) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setInterval(() => setSeconds(s => s - 1), 1000)
    return () => clearInterval(t)
  }, [seconds])

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const urgent = seconds < 60

  return (
    <div className={`timer-display ${urgent ? 'urgent' : 'normal'}`}>
      <span className="time-digit">{mins}</span>
      <span className="time-colon">:</span>
      <span className="time-digit">{secs}</span>

      <style>{`
        .timer-display {
          display: flex; align-items: center; justify-content: center;
          font-family: 'Share Tech Mono', monospace; font-size: 16px; font-weight: 700;
          letter-spacing: 2px; padding: 4px 8px; border-radius: 6px;
          transition: all 0.3s;
        }
        .timer-display.normal { color: #ff6b35; text-shadow: 0 0 10px rgba(255,107,53,0.4); }
        .timer-display.urgent { 
          color: #ef4444; text-shadow: 0 0 15px rgba(239,68,68,0.6); 
          animation: heartbeat 1s infinite; background: rgba(239,68,68,0.1); 
          border: 1px solid rgba(239,68,68,0.3); 
        }
        .time-colon { margin: 0 2px; opacity: 0.7; animation: blink-colon 1s infinite; }

        @keyframes blink-colon { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes heartbeat { 
          0%, 100% { transform: scale(1); } 
          15% { transform: scale(1.08); } 
          30% { transform: scale(1); } 
          45% { transform: scale(1.04); } 
        }
      `}</style>
    </div>
  )
}