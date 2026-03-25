import { useEffect, useState } from 'react'

export default function ConstraintAlert({ constraint, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (constraint) {
      setVisible(true)
      setProgress(100)
      
      const interval = setInterval(() => {
        setProgress(p => Math.max(0, p - (100 / 60))) 
      }, 100)

      const t = setTimeout(() => {
        setVisible(false)
        setTimeout(onDismiss, 400)
      }, 6000)
      
      return () => {
        clearTimeout(t)
        clearInterval(interval)
      }
    }
  }, [constraint, onDismiss])

  if (!constraint) return null

  return (
    <div className={`ca-overlay ${visible ? 'show' : 'hide'}`}>
      <div className={`ca-modal ${visible ? 'pop-in' : 'pop-out'}`}>
        
        <div className="ca-badge">
          <span className="ca-icon">⚠️</span> AI OVERRIDE PROTOCOL
        </div>

        <h3 className="ca-title">{constraint}</h3>
        
        <p className="ca-desc">
          This constraint applies to <span className="ca-highlight">BOTH</span> players. Adapt immediately.
        </p>

        <button onClick={() => { setVisible(false); setTimeout(onDismiss, 400) }} className="ca-btn">
          UNDERSTOOD — ADAPT
        </button>
        
        <div className="ca-progress-bg">
          <div className="ca-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <style>{`
        .ca-overlay {
          position: fixed; inset: 0;
          background: rgba(5, 0, 0, 0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; opacity: 0; pointer-events: none;
          transition: opacity 0.4s ease; padding: 20px;
        }
        .ca-overlay.show { opacity: 1; pointer-events: all; }
        
        .ca-modal {
          position: relative; 
          background: rgba(15, 5, 5, 0.95);
          border: 1px solid rgba(255, 68, 68, 0.4); 
          border-radius: 16px;
          padding: 40px 32px 48px; /* Extra bottom padding for the bar */
          max-width: 480px; width: 100%;
          height: max-content; /* THIS FIXES THE HUGE EMPTY SPACE */
          text-align: center; 
          box-shadow: 0 0 60px rgba(255, 68, 68, 0.15), inset 0 0 20px rgba(255, 68, 68, 0.05);
          transform: translateY(30px) scale(0.95);
          overflow: hidden;
        }
        .ca-modal.pop-in { transform: translateY(0) scale(1); transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .ca-modal.pop-out { transform: translateY(-30px) scale(0.95); transition: transform 0.4s ease-in; }
        
        .ca-badge {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Share Tech Mono', monospace; font-size: 11px; font-weight: 700;
          color: #ff4444; letter-spacing: 2px;
          border: 1px solid rgba(255, 68, 68, 0.3); background: rgba(255, 68, 68, 0.1);
          padding: 6px 14px; border-radius: 6px; margin-bottom: 24px;
          animation: ca-glitch 2s infinite;
        }
        .ca-icon { font-size: 14px; animation: ca-pulse 1s infinite; }
        
        .ca-title {
          font-family: Outfit, sans-serif; font-weight: 800; font-size: clamp(1.2rem, 4vw, 1.6rem);
          color: #fff; line-height: 1.4; margin: 0 0 16px 0; 
          text-shadow: 0 0 20px rgba(255,68,68,0.4);
        }
        
        .ca-desc { font-family: Inter, sans-serif; font-size: 13px; color: #aaa; margin: 0 0 32px 0; letter-spacing: 0.5px; }
        .ca-highlight { color: #ff4444; font-weight: 700; }
        
        .ca-btn {
          font-family: Outfit, sans-serif; font-weight: 800; font-size: 13px;
          color: #fff; background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none; padding: 14px 32px; border-radius: 8px;
          cursor: pointer; letter-spacing: 1.5px; transition: all 0.2s;
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
        }
        .ca-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(239, 68, 68, 0.4); background: linear-gradient(135deg, #f87171, #ef4444); }
        
        .ca-progress-bg { position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: rgba(255, 68, 68, 0.1); }
        .ca-progress-fill { height: 100%; background: #ff4444; box-shadow: 0 0 10px #ff4444; transition: width 0.1s linear; }

        @keyframes ca-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ca-glitch {
          0%, 100% { transform: translateX(0); }
          5%, 15% { transform: translateX(-2px); }
          10%, 20% { transform: translateX(2px); }
          25% { transform: translateX(0); }
        }

        @media (max-width: 600px) {
          .ca-modal { padding: 30px 20px 40px; }
          .ca-btn { width: 100%; padding: 14px 0; }
        }
      `}</style>
    </div>
  )
}