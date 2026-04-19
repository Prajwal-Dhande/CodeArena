import React from 'react';

// 🔥 DYNAMIC DATA MAPPER (Har problem ke liye alag data)
const PROBLEM_DATA = {
  'two-sum': ['[2]', '[7]', '[11]', '[15]'],
  'merge-k-sorted-lists': ['L1:[1,4,5]', 'L2:[1,3,4]', 'L3:[2,6]', 'Min-Heap'],
  'valid-parentheses': ['(', '{', '[', 'Stack'],
  'best-time-to-buy-stock': ['[7]', '[1]', '[5]', '[3]'],
  'contains-duplicate': ['Set()', '1', '2', '1'],
  'binary-search': ['L=0', 'Mid', 'R=9', 'Target'],
  'default': ['0x4A', '0x1B', '0x9F', '0x2C'] // Sci-fi fallback for unknown problems
};

export default function VisualFlowHint({ problemSlug }) {
  // Slug ko clean title mein convert karna
  const displayTitle = problemSlug 
    ? problemSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Execution';

  // Problem ke hisaab se data uthao, nahi toh default
  const nodes = PROBLEM_DATA[problemSlug] || PROBLEM_DATA['default'];

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
        {/* Dynamic Nodes */}
        {nodes.map((data, i) => (
          <div key={i} className="node-wrapper">
            <div className={`node-box node-${i}`}>
              {data}
            </div>
            <div className="node-line"></div>
          </div>
        ))}
        
        {/* 🔴 Cyberpunk Laser Scanner */}
        <div className="laser-scanner"></div>
      </div>

      {/* FOOTER */}
      <div className="ai-vis-footer">
        <span style={{ fontSize: 16 }}>🤖</span>
        <div style={{ color: '#aaa', fontSize: 12, lineHeight: 1.4 }}>
          Analyzing optimal algorithm flow for <strong style={{ color: '#fff' }}>{displayTitle}</strong>...
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
      `}</style>
    </div>
  );
}