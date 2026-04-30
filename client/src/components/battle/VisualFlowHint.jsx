import React, { useState, useEffect } from 'react';
import API_URL from '../../config/api';

export default function VisualFlowHint({ problemSlug }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slug ko clean title mein convert karna
  const displayTitle = problemSlug 
    ? problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Execution';

  useEffect(() => {
    let isMounted = true;
    
    const fetchVisualNodes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/ai/visualize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ problemTitle: displayTitle })
        });
        
        const data = await res.json();
        if (data.success && data.steps && isMounted) {
          setNodes(data.steps);
        } else if (isMounted) {
          setNodes(['Init', 'Process', 'Optimize', 'Return']);
        }
      } catch (err) {
        if (isMounted) setNodes(['Error', 'Loading', 'Steps', 'Failed']);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (displayTitle) fetchVisualNodes();

    return () => { isMounted = false; };
  }, [displayTitle]);

  return (
    <div className="ai-visualizer-wrapper">
      
      {/* HEADER */}
      <div className="ai-vis-header">
        <div className="ai-vis-title">⚡ AI VISUAL MAPPING</div>
        <div className="ai-vis-dots">
          <div className="dot dot-1" />
          <div className="dot dot-2" />
          <div className="dot dot-3" />
        </div>
      </div>

      {/* ANIMATED TRACK */}
      <div className="ai-vis-track">
        {loading ? (
          <div className="loading-container">
            <div className="cyber-spinner"></div>
            <span style={{color: '#c084fc', fontSize: 11, fontFamily: 'JetBrains Mono', marginTop: 10}}>INITIATING NEURAL LINK...</span>
          </div>
        ) : (
          <>
            {/* Dynamic Nodes */}
            {nodes.map((data, i) => (
              <div key={i} className="node-wrapper">
                <div className={`node-box node-${i}`} title={data}>
                  {data.length > 10 ? data.substring(0, 10) + '...' : data}
                </div>
                <div className="node-line"></div>
              </div>
            ))}
            
            {/* 🔴 Cyberpunk Laser Scanner */}
            <div className="laser-scanner"></div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="ai-vis-footer">
        <span style={{ fontSize: 16 }}>🤖</span>
        <div style={{ color: '#aaa', fontSize: 12, lineHeight: 1.4 }}>
          {loading ? 'Connecting to AI visualizer...' : <>Analyzing optimal algorithm flow for <strong style={{ color: '#fff' }}>{displayTitle}</strong>...</>}
        </div>
      </div>

      {/* 🔥 PURE CSS ANIMATIONS */}
      <style>{`
        .ai-visualizer-wrapper {
          background: rgba(15, 15, 20, 0.8);
          border: 1px solid rgba(168,85,247,0.3);
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
          position: relative;
          overflow: hidden;
        }
        .ai-vis-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .ai-vis-title {
          font-size: 11px;
          color: #c084fc;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .ai-vis-dots { display: flex; gap: 4px; }
        .dot { 
          width: 6px; height: 6px; border-radius: 50%; 
          background: #c084fc; animation: blink 1.5s infinite; 
        }
        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.3s; }
        .dot-3 { animation-delay: 0.6s; }

        .ai-vis-track {
          position: relative;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-evenly;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 16px;
        }
        .node-wrapper { display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 5; }
        .node-box {
          min-width: 40px; height: 32px; border-radius: 8px; 
          padding: 0 10px;
          border: 2px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
          background: rgba(0,0,0,0.7);
          animation: bounce 2s infinite;
          white-space: nowrap;
        }
        .node-0 { animation-delay: 0s; }
        .node-1 { animation-delay: 0.3s; }
        .node-2 { animation-delay: 0.6s; }
        .node-3 { animation-delay: 0.9s; }
        
        .node-line { width: 2px; height: 12px; background: rgba(255,255,255,0.1); }

        .laser-scanner {
          position: absolute;
          top: -10px; bottom: 10px; width: 2px;
          background: #c084fc;
          box-shadow: 0 0 15px #c084fc, 0 0 30px #c084fc;
          z-index: 10;
          animation: scan 2.5s ease-in-out infinite alternate;
        }

        .ai-vis-footer { margin-top: 12px; display: flex; align-items: center; gap: 8px; }

        /* Keyframes */
        @keyframes blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); border-color: rgba(255,255,255,0.1); }
          50% { transform: translateY(-8px); border-color: #c084fc; box-shadow: 0 0 15px rgba(192,132,252,0.4); }
        }
        @keyframes scan {
          0% { left: 5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 95%; opacity: 0; }
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        .cyber-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(192, 132, 252, 0.3);
          border-top-color: #c084fc;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}