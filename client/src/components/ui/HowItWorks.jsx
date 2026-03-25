const steps = [
  { num: '01', title: 'JOIN A ROOM', desc: 'Create or join a live battle room. Matchmaking pairs you by ELO rating within seconds.', color: '#00ff9d' },
  { num: '02', title: 'CODE HEAD-TO-HEAD', desc: 'Same problem loads for both. Your keystrokes sync live. You see their progress. They see yours.', color: '#00d4ff' },
  { num: '03', title: 'AI DROPS A CONSTRAINT', desc: 'Mid-battle, the AI Interviewer analyzes your code and injects a dynamic constraint. Adapt or lose.', color: '#bf00ff' },
  { num: '04', title: 'FIRST TO PASS WINS', desc: 'All test cases green + complexity score wins the round. Rank points distributed instantly.', color: '#ff9d00' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="hiw-container">
        
        <div className="hiw-left">
          <span className="hiw-tag">BATTLE PROTOCOL</span>
          <h2 className="hiw-title">The path to<br />victory.</h2>
          <p className="hiw-desc">Four simple steps. One winner. No second chances.</p>
        </div>

        <div className="hiw-right">
          <div className="timeline-line" />
          
          <div className="steps-wrapper">
            {steps.map(({ num, title, desc, color }, index) => (
              <div key={num} className="step-card" style={{ '--accent': color }}>
                {/* Huge Background Number */}
                <span className="bg-num">{num}</span>
                
                <div className="step-content">
                  <div className="step-dot" style={{ background: color, boxShadow: `0 0 15px ${color}` }} />
                  <h3 className="step-title" style={{ color }}>{title}</h3>
                  <p className="step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .hiw-section { padding: 8rem 2.5rem; background: #050505; border-top: 1px solid #111; font-family: Inter, sans-serif; overflow: hidden; }
        .hiw-container { max-width: 1200px; margin: 0 auto; display: flex; gap: 4rem; align-items: center; }
        
        .hiw-left { flex: 1; position: sticky; top: 20vh; }
        .hiw-tag { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #555; letter-spacing: 4px; display: block; margin-bottom: 20px; }
        .hiw-title { font-family: Outfit, sans-serif; font-weight: 900; font-size: clamp(3rem, 5vw, 4.5rem); color: #fff; line-height: 1; margin: 0 0 20px 0; letter-spacing: -2px; }
        .hiw-desc { color: #888; font-size: 16px; line-height: 1.6; max-width: 300px; }

        .hiw-right { flex: 1.5; position: relative; padding-left: 40px; }
        .timeline-line { position: absolute; top: 0; bottom: 0; left: 19px; width: 2px; background: linear-gradient(to bottom, transparent, #333 10%, #333 90%, transparent); }
        
        .steps-wrapper { display: flex; flex-direction: column; gap: 3rem; }
        
        .step-card { position: relative; background: rgba(20, 20, 20, 0.4); backdrop-filter: blur(10px); border: 1px solid #1a1a1a; border-radius: 16px; padding: 40px; transition: all 0.3s; overflow: hidden; cursor: default; }
        .step-card:hover { transform: translateX(10px); border-color: rgba(255, 255, 255, 0.1); background: rgba(25, 25, 25, 0.6); }
        
        .bg-num { position: absolute; right: -10px; bottom: -30px; font-family: Outfit, sans-serif; font-weight: 900; font-size: 140px; color: rgba(255, 255, 255, 0.02); line-height: 1; z-index: 0; transition: color 0.3s; pointer-events: none; }
        .step-card:hover .bg-num { color: rgba(255, 255, 255, 0.04); }
        
        .step-content { position: relative; z-index: 1; }
        .step-dot { position: absolute; left: -63px; top: 6px; width: 10px; height: 10px; border-radius: 50%; }
        
        .step-title { font-family: Outfit, sans-serif; font-weight: 800; font-size: 18px; margin: 0 0 12px 0; letter-spacing: 1px; }
        .step-desc { color: #999; font-size: 15px; line-height: 1.7; margin: 0; max-width: 90%; }

        @media (max-width: 900px) {
          .hiw-container { flex-direction: column; gap: 3rem; }
          .hiw-left { position: static; text-align: center; }
          .hiw-desc { max-width: 100%; margin: 0 auto; }
          .hiw-right { padding-left: 20px; }
          .timeline-line { left: -1px; }
          .step-dot { left: -26px; }
          .step-card { padding: 25px; }
        }
      `}</style>
    </section>
  )
}