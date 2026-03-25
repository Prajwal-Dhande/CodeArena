import Editor from '@monaco-editor/react'

export default function OpponentPanel({ code, testsPass, totalTests }) {
  const pct = totalTests ? Math.round((testsPass / totalTests) * 100) : 0

  return (
    <div className="opp-panel-container">
      {/* Header */}
      <div className="opp-header">
        <div className="opp-status">
          <div className="dot-pulse-red" />
          <span className="opp-label">OPPONENT</span>
        </div>
        <div className={`opp-progress-text ${pct === 100 ? 'text-green' : 'text-orange'}`}>
          {testsPass}/{totalTests} TESTS
        </div>
      </div>

      {/* Read-only editor */}
      <div className="opp-editor-wrapper">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code || '// Waiting for opponent to code...'}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            lineNumbers: 'off',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 }
          }}
        />
      </div>

      {/* Progress bar */}
      <div className="opp-progress-container">
        <div className="opp-progress-bg">
          <div
            className={`opp-progress-fill ${pct === 100 ? 'bg-green' : 'bg-red'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <style>{`
        .opp-panel-container {
          display: flex; flex-direction: column; height: 100%;
          background: rgba(15, 5, 5, 0.4);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 10px; overflow: hidden;
          backdrop-filter: blur(10px);
        }
        
        .opp-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.4);
          border-bottom: 1px solid rgba(239, 68, 68, 0.1);
        }
        
        .opp-status { display: flex; align-items: center; gap: 8px; }
        
        .dot-pulse-red {
          width: 8px; height: 8px; border-radius: 50%;
          background: #ef4444; box-shadow: 0 0 10px #ef4444;
          animation: pulse-red 1.5s infinite;
        }
        
        .opp-label { 
          font-family: 'Share Tech Mono', monospace; font-size: 11px; 
          font-weight: 700; color: #ef4444; letter-spacing: 1.5px; 
        }
        
        .opp-progress-text { 
          font-family: 'Share Tech Mono', monospace; font-size: 11px; 
          font-weight: 700; letter-spacing: 1px; 
        }
        .text-green { color: #22c55e; } .text-orange { color: #fb923c; }
        
        .opp-editor-wrapper { 
          flex: 1; opacity: 0.5; filter: grayscale(50%); 
          transition: all 0.3s ease; background: #0d0d0d; 
        }
        .opp-editor-wrapper:hover { opacity: 0.9; filter: grayscale(0%); }
        
        .opp-progress-container { 
          padding: 12px 16px; background: rgba(0, 0, 0, 0.4); 
          border-top: 1px solid rgba(239, 68, 68, 0.1); 
        }
        
        .opp-progress-bg { 
          background: rgba(239, 68, 68, 0.1); height: 5px; 
          border-radius: 3px; overflow: hidden; 
        }
        
        .opp-progress-fill { 
          height: 100%; border-radius: 3px; 
          transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); 
        }
        
        .bg-red { background: linear-gradient(90deg, #dc2626, #ef4444); box-shadow: 0 0 12px rgba(239,68,68,0.5); }
        .bg-green { background: linear-gradient(90deg, #16a34a, #22c55e); box-shadow: 0 0 12px rgba(34,197,94,0.5); }

        @keyframes pulse-red { 
          0%, 100% { opacity: 1; transform: scale(1); } 
          50% { opacity: 0.5; transform: scale(1.3); } 
        }
      `}</style>
    </div>
  )
}