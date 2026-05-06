import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const codeLines = [
  { text: '// AI Constraint: O(n) time only', color: 'var(--text-muted)' },
  { text: 'function twoSum(nums, target) {', color: '#e5e5e5' },
  { text: '  const map = new Map();', color: '#a8b4c8' },
  { text: '  for (let i = 0; i < nums.length; i++) {', color: '#a8b4c8' },
  { text: '    const diff = target - nums[i];', color: '#e5e5e5' },
  { text: '    if (map.has(diff))', color: '#e5e5e5' },
  { text: '      return [map.get(diff), i];', color: '#ff6b35' },
  { text: '    map.set(nums[i], i);', color: '#a8b4c8' },
  { text: '  }', color: '#a8b4c8' },
  { text: '}', color: '#e5e5e5' },
]

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }) // 3D Tilt State
  const navigate = useNavigate()

  useEffect(() => {
    if (visibleLines < codeLines.length) {
      const currentLine = codeLines[visibleLines].text
      if (charIdx < currentLine.length) {
        const t = setTimeout(() => setCharIdx(c => c + 1), 30)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => {
          setVisibleLines(v => v + 1)
          setCharIdx(0)
        }, 80)
        return () => clearTimeout(t)
      }
    }
  }, [visibleLines, charIdx])

  // 3D Mouse Tracking Logic
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window
    // Calculate rotation between -10 and 10 degrees
    const xPos = ((clientX / innerWidth) - 0.5) * 20 
    const yPos = ((clientY / innerHeight) - 0.5) * -20
    setMousePos({ x: xPos, y: yPos })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 }) // Reset on leave
  }

  return (
    <section 
      className="hero-section" 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-pattern" />
      <div className="glow-circle-left" />
      <div className="glow-circle-right" />

      <div className="hero-container">
        {/* LEFT */}
        <div className="hero-text-content">
          <div className="badge">
            <div className="pulse-dot" /> LIVE BATTLE PLATFORM
          </div>

          <h1 className="hero-title">
            Code under<br />
            <span className="gradient-text">pressure.</span>
          </h1>

          <p className="hero-desc">
            1v1 real-time DSA battles. An AI Interviewer watches your every move and injects new constraints mid-battle.
            <strong> No prep mode. Pure instinct.</strong>
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate('/lobby')} className="btn-start">⚡ Start Battle</button>
            <button onClick={() => navigate('/leaderboard')} className="btn-leaderboard">🏆 Leaderboard</button>
          </div>

          <div className="stats-box">
            {[
              { val: '2.4K', label: 'Battles today', color: '#ff6b35' },
              { val: '98ms', label: 'Avg latency', color: '#22c55e' },
              { val: '500+', label: 'Problems', color: '#fb923c' },
            ].map(({ val, label, color }, i) => (
              <div key={label} className={`stat-item ${i < 2 ? 'border-right' : ''}`}>
                <div style={{ color }} className="stat-val">{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — 3D Terminal */}
        <div 
          className="terminal-wrapper"
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
            transition: 'transform 0.1s ease-out' // Smooth tracking
          }}
        >
          {/* Floating AI Alert */}
          <div 
            className="ai-alert"
            style={{ transform: 'translateZ(50px)' }} // Pops out in 3D
          >
            🤖 AI CONSTRAINT INJECTED
          </div>

          <div className="terminal-window">
            <div className="terminal-header">
              {['#ff5f57', '#febc2e', '#28c840'].map(c => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
              ))}
              <span className="terminal-path">~/battle-room/problem_42.js</span>
              <span className="terminal-live">● LIVE</span>
            </div>

            <div className="terminal-tabs">
              <div className="tab active">YOU</div>
              <div className="tab inactive">OPPONENT</div>
              <div className="timer">⚡ 01:42</div>
            </div>

            <div className="terminal-body">
              {codeLines.slice(0, visibleLines).map((line, i) => (
                <div key={i} style={{ color: line.color }}>{line.text}</div>
              ))}
              {visibleLines < codeLines.length && (
                <div style={{ color: codeLines[visibleLines].color }}>
                  {codeLines[visibleLines].text.slice(0, charIdx)}
                  <span className="cursor-blink">█</span>
                </div>
              )}
            </div>

            <div className="terminal-footer">
              <div style={{ marginBottom: 8 }}>
                <div className="progress-header">
                  <span style={{ color: '#22c55e' }}>YOU — 5/5 tests</span>
                  <span style={{ color: '#22c55e' }}>100%</span>
                </div>
                <div className="progress-bg"><div style={{ width: '100%', background: '#22c55e' }} className="progress-bar" /></div>
              </div>
              <div>
                <div className="progress-header">
                  <span style={{ color: '#ef4444' }}>OPPONENT — 3/5 tests</span>
                  <span style={{ color: '#ef4444' }}>60%</span>
                </div>
                <div className="progress-bg"><div style={{ width: '60%', background: '#ef4444' }} className="progress-bar" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section { min-height: 100vh; display: flex; align-items: center; padding: 8rem 2.5rem 4rem; background: #0d0d0d; position: relative; overflow: hidden; font-family: Inter, sans-serif; perspective: 1200px; }
        
        /* NEW 3D GRID BACKGROUND */
        .bg-pattern { 
          position: absolute; 
          bottom: 0; 
          left: -50%; 
          width: 200vw; 
          height: 150vh; 
          pointer-events: none; 
          background-image: 
            linear-gradient(rgba(255, 107, 53, 0.25) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255, 107, 53, 0.25) 2px, transparent 2px); 
          background-size: 80px 80px; 
          transform-origin: bottom center; 
          transform: perspective(800px) rotateX(75deg); 
          animation: cyberGridMove 4s linear infinite; 
          z-index: 0; 
          mask-image: linear-gradient(to bottom, transparent 20%, black 80%); 
          -webkit-mask-image: linear-gradient(to bottom, transparent 20%, black 80%); 
        }

        @keyframes cyberGridMove { 
          0% { background-position: center 0; } 
          100% { background-position: center 80px; } 
        }

        .glow-circle-left { position: absolute; top: 30%; left: 5%; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 65%); pointer-events: none; }
        .glow-circle-right { position: absolute; bottom: 10%; right: 10%; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(247,69,29,0.05) 0%, transparent 65%); pointer-events: none; }
        .hero-container { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 1; transform-style: preserve-3d; }
        
        .badge { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; color: #ff6b35; border: 1px solid rgba(255,107,53,0.25); background: rgba(255,107,53,0.06); padding: 5px 12px; border-radius: 6px; margin-bottom: 24px; letter-spacing: 1px; }
        .pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: #ff6b35; animation: pulse 1.5s infinite; }
        .hero-title { font-family: Outfit, sans-serif; font-weight: 900; font-size: clamp(2.8rem, 5vw, 4rem); line-height: 1.05; margin-bottom: 20px; color: #fff; letter-spacing: -2px; }
        .gradient-text { background: linear-gradient(90deg, #ff6b35, #f7451d); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { color: #666; font-size: 1rem; line-height: 1.8; margin-bottom: 32px; max-width: 440px; border-left: 2px solid rgba(255,107,53,0.3); padding-left: 16px; }
        .hero-desc strong { color: #e5e5e5; }
        
        .hero-buttons { display: flex; gap: 12px; margin-bottom: 48px; }
        .btn-start { font-family: Inter; font-weight: 700; font-size: 14px; color: #fff; background: linear-gradient(135deg, #ff6b35, #f7451d); border: none; padding: 12px 28px; border-radius: 9px; cursor: pointer; transition: all 0.2s; }
        .btn-start:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(255,107,53,0.35); }
        .btn-leaderboard { font-family: Inter; font-weight: 600; font-size: 14px; color: #888; background: transparent; border: 1px solid #2a2a2a; padding: 12px 24px; border-radius: 9px; cursor: pointer; transition: all 0.2s; }
        .btn-leaderboard:hover { border-color: #ff6b35; color: #e5e5e5; }
        
        .stats-box { display: flex; border: 1px solid #1f1f1f; border-radius: 10px; overflow: hidden; background: #111; }
        .stat-item { flex: 1; padding: 16px; text-align: center; }
        .border-right { border-right: 1px solid #1f1f1f; }
        .stat-val { font-family: Outfit, sans-serif; font-weight: 800; font-size: 22px; }
        .stat-label { font-size: 11px; color: #444; margin-top: 3px; }
        
        .terminal-wrapper { position: relative; width: 100%; transform-style: preserve-3d; will-change: transform; }
        .ai-alert { position: absolute; top: -14px; right: 16px; z-index: 2; background: #ef4444; color: #fff; font-family: Inter; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 5px; letter-spacing: 0.5px; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
        .terminal-window { background: #111; border: 1px solid #1f1f1f; border-radius: 10px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .terminal-header { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-bottom: 1px solid #1f1f1f; background: #181818; }
        .terminal-path { font-family: JetBrains Mono, monospace; font-size: 11px; color: #444; margin-left: 8px; flex: 1; }
        .terminal-live { font-family: Inter; font-size: 11px; color: #22c55e; font-weight: 600; }
        .terminal-tabs { display: flex; border-bottom: 1px solid #1f1f1f; }
        .tab { font-family: Inter; font-size: 12px; font-weight: 600; padding: 8px 16px; }
        .tab.active { color: #ff6b35; border-bottom: 2px solid #ff6b35; background: rgba(255,107,53,0.05); }
        .tab.inactive { color: #444; }
        .timer { margin-left: auto; padding: 8px 16px; font-family: Outfit, sans-serif; font-weight: 700; font-size: 14px; color: #fb923c; }
        .terminal-body { padding: 16px 20px; min-height: 220px; font-family: JetBrains Mono, monospace; font-size: 13px; line-height: 1.8; background: #0d0d0d; overflow-x: auto; }
        .cursor-blink { animation: blink 0.8s infinite; color: #ff6b35; }
        .terminal-footer { padding: 12px 16px; border-top: 1px solid #1f1f1f; background: #181818; }
        .progress-header { display: flex; justify-content: space-between; margin-bottom: 4px; font-family: Inter; font-size: 11px; font-weight: 600; }
        .progress-bg { background: #252525; height: 4px; border-radius: 2px; }
        .progress-bar { height: 100%; border-radius: 2px; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        @media (max-width: 900px) {
          .hero-container { grid-template-columns: 1fr; gap: 3rem; }
          .hero-section { padding: 6rem 1.5rem 3rem; }
          .hero-buttons { flex-direction: column; }
          .stats-box { flex-direction: column; }
          .border-right { border-right: none; border-bottom: 1px solid #1f1f1f; }
          .terminal-wrapper { transform: none !important; } /* Disable 3D on mobile for better UX */
        }
      `}</style>
    </section>
  )
}