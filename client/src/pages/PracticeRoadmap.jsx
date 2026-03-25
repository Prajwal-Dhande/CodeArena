import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Added descriptions for the List View
const ROADMAP_DATA = [
  { id: 'arrays', label: 'Arrays & Hashing', solved: 6, total: 6, x: 500, y: 80, next: ['stack', 'bs'], desc: 'A focused track for Arrays — crafted buckets from the practice-problems collection.' },
  { id: 'stack', label: 'Stacks & Queues', solved: 2, total: 6, x: 300, y: 240, next: ['ll'], desc: 'A focused track for Stacks & Queues — crafted buckets from the practice-problems collection.' },
  { id: 'bs', label: 'Binary Search', solved: 5, total: 5, x: 700, y: 240, next: ['greedy'], desc: 'A focused track for Binary Search — crafted buckets from the practice-problems collection.' },
  { id: 'll', label: 'Linked Lists', solved: 6, total: 6, x: 300, y: 400, next: ['trees'], desc: 'A focused track for Linked Lists — crafted buckets from the practice-problems collection.' },
  { id: 'greedy', label: 'Greedy & Intervals', solved: 5, total: 5, x: 700, y: 400, next: ['trees'], desc: 'A focused track for Greedy & Intervals — crafted buckets from the practice-problems collection.' },
  { id: 'trees', label: 'Trees', solved: 0, total: 6, x: 500, y: 560, next: ['heaps', 'graphs'], desc: 'A focused track for Trees — crafted buckets from the practice-problems collection.' },
  { id: 'heaps', label: 'Heaps / Priority Queue', solved: 0, total: 5, x: 300, y: 720, next: ['dp1'], desc: 'A focused track for Heaps — crafted buckets from the practice-problems collection.' },
  { id: 'graphs', label: 'Graphs', solved: 0, total: 6, x: 700, y: 720, next: ['uf'], desc: 'A focused track for Graphs — crafted buckets from the practice-problems collection.' },
  { id: 'dp1', label: 'Dynamic Programming 1D', solved: 0, total: 6, x: 300, y: 880, next: ['dp2'], desc: 'A focused track for 1D DP — crafted buckets from the practice-problems collection.' },
  { id: 'uf', label: 'Union Find (DSU)', solved: 0, total: 4, x: 700, y: 880, next: ['strings'], desc: 'A focused track for Union Find — crafted buckets from the practice-problems collection.' },
  { id: 'dp2', label: 'Dynamic Programming 2D', solved: 0, total: 6, x: 300, y: 1040, next: ['bit', 'math'], desc: 'A focused track for 2D DP — crafted buckets from the practice-problems collection.' },
  { id: 'strings', label: 'Strings & Tries', solved: 0, total: 3, x: 700, y: 1040, next: ['bit', 'math'], desc: 'A focused track for Strings — crafted buckets from the practice-problems collection.' },
  { id: 'bit', label: 'Bit Manipulation', solved: 0, total: 5, x: 400, y: 1180, next: [] , desc: 'A focused track for Bit Manipulation — crafted buckets from the practice-problems collection.'},
  { id: 'math', label: 'Math & Number Theory', solved: 0, total: 5, x: 600, y: 1180, next: [] , desc: 'A focused track for Math — crafted buckets from the practice-problems collection.'},
]

export default function PracticeRoadmap() {
  const navigate = useNavigate()
  const [view, setView] = useState('tree') // 'tree' or 'list'

  // Smooth S-Curve Generator for perfect SVG lines
  const drawCurve = (startX, startY, endX, endY) => {
    const y1 = startY + 36 
    const y2 = endY - 36   
    return `M ${startX} ${y1} C ${startX} ${y1 + 50}, ${endX} ${y2 - 50}, ${endX} ${y2}`
  }

  return (
    <div className="roadmap-wrapper">
      
      {/* Ambient Glows to remove pure black darkness */}
      <div className="bg-glow orange-glow" />
      <div className="bg-glow teal-glow" />

      {/* Top Header */}
      <div className="roadmap-topbar">
        <div>
          <h1 className="roadmap-title">Practice Roadmap</h1>
          <p className="roadmap-subtitle">Progress through curated tracks — follow the skill tree to master algorithms.</p>
        </div>
        <div className="roadmap-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${view === 'tree' ? 'active' : ''}`} 
              onClick={() => setView('tree')}
            >
              <span className="icon">🗺</span> Tree
            </button>
            <button 
              className={`toggle-btn ${view === 'list' ? 'active' : ''}`} 
              onClick={() => setView('list')}
            >
              <span className="icon">📄</span> List
            </button>
          </div>
          <button className="browse-btn">Browse 5k Library</button>
        </div>
      </div>

      {/* CONDITIONAL RENDER: TREE VIEW */}
      {view === 'tree' && (
        <div className="tree-scroll-wrapper">
          <div className="tree-container">
            {/* SVG Layer for Connecting Lines - PERFECTLY MATCHED COORDINATES */}
            <svg className="tree-lines">
              {ROADMAP_DATA.map(node => 
                node.next.map(targetId => {
                  const targetNode = ROADMAP_DATA.find(n => n.id === targetId)
                  if (!targetNode) return null
                  return (
                    <path 
                      key={`${node.id}-${targetId}`}
                      d={drawCurve(node.x, node.y, targetNode.x, targetNode.y)}
                      stroke="rgba(255,255,255,0.15)" 
                      strokeWidth="2.5" 
                      fill="none"
                      strokeLinecap="round"
                    />
                  )
                })
              )}
            </svg>

            {/* HTML Layer for Nodes */}
            <div className="nodes-layer">
              {ROADMAP_DATA.map(node => {
                const pct = (node.solved / node.total) * 100
                const statusClass = node.solved === node.total ? 'completed' : node.solved > 0 ? 'in-progress' : 'available'

                return (
                  <div 
                    key={node.id} 
                    className={`skill-node ${statusClass}`} 
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    onClick={() => alert(`Opening ${node.label} problems...`)}
                  >
                    <div className="node-label">{node.label}</div>
                    <div className="node-stats">{node.solved}/{node.total} solved</div>
                    
                    <div className="node-progress-bg">
                      <div className="node-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL RENDER: LIST VIEW (Matched with your reference image) */}
      {view === 'list' && (
        <div className="list-container">
          <div className="section-header">
            <span className="sparkle">✨</span> FOUNDATIONS
          </div>
          
          <div className="list-items-wrapper">
            {ROADMAP_DATA.map((node, i) => (
              <div key={node.id} className="list-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="lc-left">
                  <div className={`lc-dot ${node.solved === node.total ? 'dot-green' : node.solved > 0 ? 'dot-pink' : 'dot-orange'}`} />
                  <div>
                    <h3 className="lc-title">{node.label}</h3>
                    <div className="lc-meta">{node.total} problems</div>
                    <p className="lc-desc">{node.desc}</p>
                  </div>
                </div>
                <div className="lc-right">
                  <button className="lc-enter-btn">
                    ▶ Enter Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Legends */}
      <div className="roadmap-footer">
        <div className="legends">
          <div className="legend-item"><div className="l-dot l-available"/> Available</div>
          <div className="legend-item"><div className="l-dot l-progress"/> In Progress</div>
          <div className="legend-item"><div className="l-dot l-completed"/> Completed</div>
          <div className="legend-item"><div className="l-dot l-locked"/> Locked</div>
        </div>

        <button onClick={() => navigate('/lobby')} className="back-btn">
          ← Back to Dashboard
        </button>
      </div>

      <style>{`
        :root {
          --bg-dark: #0a0a0f;
          --panel-bg: rgba(20, 20, 25, 0.5);
          --glass-border: rgba(255, 255, 255, 0.06);
          --orange: #ff6b35;
          --orange-glow: rgba(255, 107, 53, 0.4);
          --node-blue: #6366f1;   
          --node-pink: #d946ef;   
          --node-green: #10b981;  
          --text-main: #f8fafc;
          --text-muted: #9ca3af;
        }

        .roadmap-wrapper { min-height: 100vh; background: var(--bg-dark); color: var(--text-main); font-family: Inter, sans-serif; padding: 40px 20px; display: flex; flex-direction: column; align-items: center; position: relative; overflow: hidden; }
        
        /* Premium Background Ambient Glows */
        .bg-glow { position: fixed; width: 60vw; height: 60vw; border-radius: 50%; filter: blur(140px); z-index: 0; pointer-events: none; opacity: 0.15; }
        .orange-glow { top: -10%; right: -10%; background: radial-gradient(circle, #ff6b35 0%, transparent 60%); }
        .teal-glow { bottom: -20%; left: -10%; background: radial-gradient(circle, #2dd4bf 0%, transparent 60%); opacity: 0.08; }

        /* Topbar */
        .roadmap-topbar { width: 100%; max-width: 1000px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; background: rgba(25,25,30, 0.6); padding: 24px 32px; border-radius: 16px; border: 1px solid var(--glass-border); backdrop-filter: blur(20px); z-index: 10; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .roadmap-title { font-family: Outfit, sans-serif; font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #fff; letter-spacing: -0.5px; }
        .roadmap-subtitle { font-size: 14px; color: var(--text-muted); margin: 0; }
        .roadmap-actions { display: flex; gap: 16px; align-items: center; }
        
        /* Toggle Buttons */
        .view-toggle { display: flex; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; padding: 4px; }
        .toggle-btn { background: transparent; color: var(--text-muted); border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .toggle-btn.active { background: rgba(255,107,53,0.15); color: var(--orange); }
        .toggle-btn:hover:not(.active) { color: var(--text-main); }
        
        .browse-btn { background: linear-gradient(135deg, #ff6b35, #f97316); color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 15px var(--orange-glow); transition: all 0.2s; }
        .browse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px var(--orange-glow); }

        /* ================= TREE VIEW CSS ================= */
        .tree-scroll-wrapper { width: 100%; max-width: 1000px; overflow-x: auto; display: flex; justify-content: center; z-index: 10; position: relative; background: var(--panel-bg); border-radius: 20px; border: 1px solid var(--glass-border); backdrop-filter: blur(12px); padding: 40px 0; box-shadow: inset 0 0 80px rgba(0,0,0,0.3); }
        
        /* The Secret to Perfect Lines: Fixed Container matching SVG perfectly */
        .tree-container { width: 1000px; height: 1250px; position: relative; flex-shrink: 0; }
        .tree-lines { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
        .nodes-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; }
        
        .skill-node { position: absolute; transform: translate(-50%, -50%); width: 200px; padding: 16px 14px 22px; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255,255,255,0.1); }
        .skill-node:hover { transform: translate(-50%, -55%) scale(1.05); z-index: 10; border-color: rgba(255,255,255,0.4); }
        
        .node-label { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; letter-spacing: 0.5px; }
        .node-stats { font-size: 11px; color: rgba(255,255,255,0.8); font-weight: 500; }
        
        .node-progress-bg { position: absolute; bottom: 10px; left: 16px; right: 16px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 3px; overflow: hidden; }
        .node-progress-fill { height: 100%; background: #fff; border-radius: 3px; transition: width 0.5s ease; }

        .skill-node.available { background: var(--node-blue); box-shadow: 0 10px 30px rgba(99, 102, 241, 0.2); }
        .skill-node.in-progress { background: var(--node-pink); box-shadow: 0 10px 30px rgba(217, 70, 239, 0.2); }
        .skill-node.completed { background: var(--node-green); box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2); }

        /* ================= LIST VIEW CSS ================= */
        .list-container { width: 100%; max-width: 1000px; z-index: 10; position: relative; }
        .section-header { font-family: 'Share Tech Mono', monospace; font-size: 12px; font-weight: 700; color: var(--text-muted); letter-spacing: 2px; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
        .sparkle { color: var(--orange); font-size: 14px; }
        
        .list-items-wrapper { display: flex; flex-direction: column; gap: 16px; }
        
        .list-card { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(90deg, rgba(25,25,30,0.6), rgba(15,15,20,0.8)); border: 1px solid var(--glass-border); border-radius: 16px; padding: 24px 32px; backdrop-filter: blur(12px); transition: all 0.3s ease; animation: slideUp 0.4s ease forwards; opacity: 0; transform: translateY(20px); }
        .list-card:hover { background: linear-gradient(90deg, rgba(35,35,40,0.8), rgba(20,20,25,0.9)); border-color: rgba(255, 107, 53, 0.3); box-shadow: 0 10px 40px rgba(0,0,0,0.4); transform: translateY(-3px); }
        
        .lc-left { display: flex; align-items: flex-start; gap: 20px; }
        .lc-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 6px; box-shadow: 0 0 10px currentColor; }
        .dot-orange { background: var(--orange); color: var(--orange); }
        .dot-pink { background: var(--node-pink); color: var(--node-pink); }
        .dot-green { background: var(--node-green); color: var(--node-green); }
        
        .lc-title { font-family: Outfit, sans-serif; font-size: 20px; font-weight: 800; color: #fff; margin: 0 0 4px 0; }
        .lc-meta { font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 8px; }
        .lc-desc { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0; max-width: 600px; }
        
        .lc-enter-btn { background: transparent; color: var(--orange); border: 1px solid var(--orange); padding: 12px 24px; border-radius: 8px; font-family: Inter, sans-serif; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px; }
        .list-card:hover .lc-enter-btn { background: var(--orange); color: #fff; box-shadow: 0 4px 20px var(--orange-glow); }

        @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }

        /* Footer */
        .roadmap-footer { width: 100%; max-width: 1000px; display: flex; flex-direction: column; align-items: center; margin-top: 40px; gap: 30px; z-index: 10; position: relative; }
        .legends { display: flex; gap: 24px; background: rgba(20,20,25,0.6); padding: 12px 24px; border-radius: 12px; border: 1px solid var(--glass-border); backdrop-filter: blur(10px); }
        .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-muted); font-weight: 500; }
        .l-dot { width: 12px; height: 12px; border-radius: 50%; }
        .l-available { background: var(--node-blue); }
        .l-progress { background: var(--node-pink); }
        .l-completed { background: var(--node-green); }
        .l-locked { background: #4b5563; }

        .back-btn { background: rgba(255,255,255,0.05); color: var(--text-muted); border: 1px solid var(--glass-border); padding: 12px 32px; border-radius: 10px; font-family: Outfit, sans-serif; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.2s; }
        .back-btn:hover { background: rgba(255,255,255,0.1); color: #fff; transform: translateY(-2px); }

        @media (max-width: 800px) {
          .roadmap-topbar { flex-direction: column; gap: 20px; text-align: center; }
          .tree-scroll-wrapper { justify-content: flex-start; }
          .list-card { flex-direction: column; align-items: flex-start; gap: 20px; }
          .lc-right { width: 100%; }
          .lc-enter-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  )
}