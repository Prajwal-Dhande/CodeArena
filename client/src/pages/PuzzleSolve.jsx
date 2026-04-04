import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API_URL from '../config/api';

const FALLBACK_PUZZLES = [
  { id: 1, title: "The 100 Prisoners", category: "Logic Puzzle", difficulty: "Hard", xp: 50, question: "100 prisoners must find their own numbers...", code: `// Simulation of cycle strategy`, options: [{ id: 'A', text: "1%" }, { id: 'B', text: "31%" }, { id: 'C', text: "50%" }, { id: 'D', text: "99%" }] },
  { id: 2, title: "Event Loop Trickery", category: "Code Output", difficulty: "Medium", xp: 30, question: "What will be the exact output?", code: `console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);`, options: [{ id: 'A', text: "1, 2, 3, 4" }, { id: 'B', text: "1, 4, 3, 2" }, { id: 'C', text: "1, 4, 2, 3" }, { id: 'D', text: "1, 3, 4, 2" }] }
];

export default function PuzzleSolve() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const puzzleId = searchParams.get('id') || '1'; 
  
  const [puzzle, setPuzzle] = useState(null);
  const [allPuzzles, setAllPuzzles] = useState([]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | correct | wrong
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/puzzles`)
      .then(res => res.json())
      .then(data => {
        let validData = data && data.length > 0 ? data : FALLBACK_PUZZLES;
        setAllPuzzles(validData);
      })
      .catch(err => {
        console.error("Backend fetch error:", err);
        setAllPuzzles(FALLBACK_PUZZLES);
      });
  }, []);

  // When puzzle ID changes, load the new puzzle and RESET everything
  useEffect(() => {
    if (allPuzzles.length > 0) {
      const current = allPuzzles.find(p => String(p._id) === String(puzzleId) || String(p.id) === String(puzzleId));
      setPuzzle(current || allPuzzles[0]);
      setSelectedOpt(null);
      setStatus('idle');
      setCorrectAnswer(null);
      setExplanation('');
    }
  }, [puzzleId, allPuzzles]);

  // Check if ALREADY solved by user
  useEffect(() => {
    if (puzzle) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.solvedPuzzles?.some(id => String(id) === String(puzzle._id || puzzle.id))) {
          setStatus('already-solved');
        }
      }
    }
  }, [puzzle]);

  if (!puzzle) return <div className="solve-wrapper" style={{color: '#0ea5e9', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading Puzzle...</div>;

  const currentPuzzleIndex = allPuzzles.findIndex(p => String(p._id) === String(puzzle._id) || String(p.id) === String(puzzle.id));
  const puzzleNumber = currentPuzzleIndex !== -1 ? currentPuzzleIndex + 1 : 1;

  // SERVER-SIDE answer validation
  const handleSubmit = async () => {
    if (!selectedOpt || status === 'submitting' || status === 'correct' || status === 'already-solved') return;
    setStatus('submitting');
    
    try {
      // Step 1: Check answer on the server
      const checkRes = await fetch(`${API_URL}/api/puzzles/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          puzzleId: puzzle._id || puzzle.id, 
          selectedOption: selectedOpt 
        })
      });
      const checkData = await checkRes.json();

      if (!checkData.success) {
        setStatus('wrong');
        return;
      }

      setCorrectAnswer(checkData.correctId);
      setExplanation(checkData.explanation || '');

      if (checkData.isCorrect) {
        // Step 2: Record the solved puzzle for XP
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token'); 
        
        if (userStr && token) {
          const res = await fetch(`${API_URL}/api/users/puzzle-result`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              puzzleId: puzzle._id || puzzle.id, 
              xpEarned: puzzle.xp || puzzle.points || 0
            })
          });

          const data = await res.json();
          
          if (data.success) {
            const userData = JSON.parse(userStr);
            userData.puzzleXp = data.puzzleXp;
            userData.solvedPuzzles = data.solvedPuzzles; 
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
        setStatus('correct');
      } else {
        setStatus('wrong');
      }
    } catch(err) {
      console.error("API Error:", err);
      setStatus('wrong');
    }
  };

  // Navigate to next unsolved puzzle
  const handleNext = () => {
    const freshUserStr = localStorage.getItem('user');
    const freshSolvedIds = freshUserStr ? (JSON.parse(freshUserStr).solvedPuzzles || []) : [];
    
    let nextId = null;
    
    for (let i = 1; i <= allPuzzles.length; i++) {
       const checkIndex = (currentPuzzleIndex + i) % allPuzzles.length;
       const p = allPuzzles[checkIndex];
       const pIdStr = String(p._id || p.id);
       
       if (!freshSolvedIds.some(id => String(id) === pIdStr)) {
          nextId = pIdStr;
          break;
       }
    }

    if (nextId) {
      navigate(`/puzzle?id=${nextId}`);
    } else {
      navigate('/lobby?tab=puzzles');
    }
  };

  // Sprint completion check
  const freshUserStr = localStorage.getItem('user');
  const freshSolvedIds = freshUserStr ? (JSON.parse(freshUserStr).solvedPuzzles || []) : [];
  const totalSolvedNow = allPuzzles.filter(p => freshSolvedIds.some(id => String(id) === String(p._id || p.id))).length;
  const isSprintComplete = totalSolvedNow >= allPuzzles.length;

  return (
    <div className="solve-wrapper">
      <div className="ambient-cyan-glow" />

      <div className="solve-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button className="btn-back" onClick={() => navigate('/lobby?tab=puzzles')} style={{ marginBottom: 0 }}>
            ← Back to Puzzles
          </button>
          
          <div className="puzzle-tracker">
            Question {puzzleNumber} of {allPuzzles.length}
          </div>
        </div>

        <div className="solve-grid">
          <div className="problem-panel glass-card">
            <div className="meta-tags">
              <span className={`badge-diff ${(puzzle.difficulty || 'Medium').toLowerCase()}`}>{puzzle.difficulty || 'Medium'}</span>
              <span className="badge-cat">{puzzle.category}</span>
              <span className="badge-xp">+{puzzle.xp || puzzle.points} XP</span>
            </div>
            
            <h1 className="problem-title">{puzzleNumber}. {puzzle.title}</h1>
            <p className="problem-desc">{puzzle.question}</p>
            
            {puzzle.code && (
              <div className="code-block">
                <div className="code-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="lang-label">code snippet</span>
                </div>
                <pre><code>{puzzle.code}</code></pre>
              </div>
            )}

            {/* EXPLANATION CARD — Shows after answering */}
            {(status === 'correct' || status === 'wrong') && explanation && (
              <div className="explanation-card" style={{ animationDelay: '0.3s' }}>
                <div className="explanation-header">
                  <span className="explanation-icon">{status === 'correct' ? '💡' : '📖'}</span>
                  <span className="explanation-title">Explanation</span>
                </div>
                <p className="explanation-text">{explanation}</p>
              </div>
            )}
          </div>

          <div className="action-panel glass-card">
            <h3 className="panel-heading">Select your answer</h3>
            
            <div className="options-list">
              {puzzle.options?.map((opt, index) => {
                const letter = opt.id || ['A', 'B', 'C', 'D'][index];
                let optClass = "option-btn ";
                if (selectedOpt === letter) optClass += "selected ";
                if ((status === 'correct' || status === 'wrong') && correctAnswer && letter === correctAnswer) optClass += "correct-reveal ";
                if (status === 'wrong' && selectedOpt === letter && letter !== correctAnswer) optClass += "wrong-reveal ";
                if (status === 'already-solved') optClass += "disabled-opt ";

                return (
                  <button 
                    key={opt.id || index} 
                    className={optClass}
                    onClick={() => {
                      if (status === 'idle') {
                        setSelectedOpt(letter);
                      }
                    }}
                    disabled={status === 'correct' || status === 'submitting' || status === 'already-solved'}
                  >
                    <span className="opt-letter">{letter}</span>
                    <span className="opt-text">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {status === 'already-solved' ? (
              <div className="success-banner">
                <div className="success-icon">✓</div>
                <div className="success-text">
                  <h4>Already Solved!</h4>
                  <p>You already earned +{puzzle.xp || puzzle.points} XP</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  {isSprintComplete ? (
                    <button className="btn-next" style={{background: '#22c55e', color: '#fff'}} onClick={() => navigate('/lobby?tab=puzzles')}>
                      Sprint Complete! Return to Lobby
                    </button>
                  ) : (
                    <button className="btn-next" style={{background: '#0ea5e9', color: '#fff'}} onClick={handleNext}>
                      Next Puzzle →
                    </button>
                  )}
                </div>
              </div>
            ) : status === 'correct' ? (
              <div className="success-banner">
                <div className="success-icon">✓</div>
                <div className="success-text">
                  <h4>Brilliant!</h4>
                  <p>You earned +{puzzle.xp || puzzle.points} XP</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  {isSprintComplete ? (
                    <button className="btn-next" style={{background: '#22c55e', color: '#fff'}} onClick={() => navigate('/lobby?tab=puzzles')}>
                      Sprint Complete! Return to Lobby
                    </button>
                  ) : (
                    <button className="btn-next" style={{background: '#0ea5e9', color: '#fff'}} onClick={handleNext}>
                      Next Puzzle →
                    </button>
                  )}
                </div>
              </div>
            ) : status === 'wrong' ? (
              <div className="wrong-banner">
                <div className="wrong-icon">✗</div>
                <div className="wrong-text">
                  <h4>Not quite!</h4>
                  <p>The correct answer is highlighted in green. Study the explanation and try the next one!</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button className="btn-next" style={{background: '#0ea5e9', color: '#fff'}} onClick={handleNext}>
                    Next Puzzle →
                  </button>
                </div>
              </div>
            ) : (
              <button 
                className={`btn-submit ${!selectedOpt || status === 'submitting' ? 'disabled' : ''}`}
                onClick={handleSubmit}
                disabled={!selectedOpt || status === 'submitting'}
              >
                {status === 'submitting' ? '⟳ Verifying...' : 'Submit Answer'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .solve-wrapper { min-height: 100vh; background: #050507; color: #f8fafc; font-family: Inter, sans-serif; position: relative; overflow: hidden; padding: 40px 20px; display: flex; justify-content: center; }
        .ambient-cyan-glow { position: absolute; top: -10%; left: 50%; transform: translateX(-50%); width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 60%); filter: blur(100px); z-index: 0; pointer-events: none; }
        
        .solve-container { width: 100%; max-width: 1100px; position: relative; z-index: 1; }
        
        .btn-back { background: transparent; color: #0ea5e9; border: none; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; transition: all 0.2s; font-family: Inter; }
        .btn-back:hover { transform: translateX(-5px); text-shadow: 0 0 10px rgba(14,165,233,0.5); }
        
        .puzzle-tracker { background: rgba(14,165,233,0.1); color: #0ea5e9; border: 1px solid rgba(14,165,233,0.3); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; }

        .solve-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
        
        .glass-card { background: rgba(15, 15, 20, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        
        /* Problem Panel */
        .meta-tags { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; }
        .badge-diff { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
        .badge-diff.medium { color: #fb923c; background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.3); }
        .badge-diff.hard { color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); }
        .badge-diff.easy { color: #22c55e; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); }
        .badge-cat { font-size: 12px; color: #9ca3af; background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 6px; }
        .badge-xp { font-size: 13px; font-weight: 800; color: #0ea5e9; margin-left: auto; font-family: 'JetBrains Mono', monospace; }
        
        .problem-title { font-family: Outfit, sans-serif; font-size: 32px; margin: 0 0 16px 0; color: #fff; }
        .problem-desc { color: #cbd5e1; line-height: 1.6; margin: 0 0 24px 0; font-size: 15px; }
        
        /* Code Block */
        .code-block { background: #0f111a; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }
        .code-header { background: #161925; padding: 10px 16px; display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); align-items: center; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ff5f56; } .dot.yellow { background: #ffbd2e; } .dot.green { background: #27c93f; }
        .lang-label { margin-left: auto; font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
        .code-block pre { margin: 0; padding: 20px; overflow-x: auto; }
        .code-block code { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #38bdf8; line-height: 1.5; white-space: pre-wrap; }

        /* Explanation Card */
        .explanation-card { margin-top: 20px; background: rgba(14,165,233,0.06); border: 1px solid rgba(14,165,233,0.2); border-radius: 14px; padding: 20px 24px; animation: slideUp 0.5s ease-out both; }
        .explanation-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .explanation-icon { font-size: 22px; }
        .explanation-title { font-family: Outfit, sans-serif; font-weight: 800; font-size: 16px; color: #0ea5e9; }
        .explanation-text { font-size: 14px; color: #cbd5e1; line-height: 1.7; margin: 0; }
        
        /* Action Panel */
        .panel-heading { font-family: Outfit, sans-serif; font-size: 20px; margin: 0 0 20px 0; color: #fff; }
        .options-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
        
        .option-btn { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all 0.2s; color: #fff; text-align: left; }
        .option-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }
        .option-btn.selected { background: rgba(14,165,233,0.1); border-color: #0ea5e9; box-shadow: 0 0 15px rgba(14,165,233,0.2); }
        .option-btn.correct-reveal { background: rgba(34,197,94,0.15); border-color: #22c55e; color: #fff; box-shadow: 0 0 20px rgba(34,197,94,0.3); }
        .option-btn.wrong-reveal { background: rgba(239,68,68,0.15); border-color: #ef4444; color: #fff; }
        .option-btn.disabled-opt { opacity: 0.5; cursor: not-allowed; }
        
        .opt-letter { background: rgba(255,255,255,0.1); width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; font-weight: 800; font-size: 13px; font-family: 'JetBrains Mono'; flex-shrink: 0; }
        .selected .opt-letter { background: #0ea5e9; color: #fff; }
        .correct-reveal .opt-letter { background: #22c55e; color: #fff; }
        .wrong-reveal .opt-letter { background: #ef4444; color: #fff; }
        .opt-text { font-size: 15px; font-weight: 500; font-family: 'JetBrains Mono', monospace; }
        
        .btn-submit { width: 100%; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; border: none; padding: 16px; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: Inter; box-shadow: 0 8px 20px rgba(14,165,233,0.3); }
        .btn-submit:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(14,165,233,0.5); }
        .btn-submit.disabled { background: rgba(255,255,255,0.05); color: #64748b; box-shadow: none; cursor: not-allowed; border: 1px solid rgba(255,255,255,0.05); }
        
        /* Success Banner */
        .success-banner { display: flex; flex-direction: column; align-items: center; gap: 12px; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); padding: 24px; border-radius: 12px; text-align: center; animation: slideUp 0.4s ease-out; }
        .success-icon { width: 50px; height: 50px; background: #22c55e; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 0 20px rgba(34,197,94,0.4); }
        .success-text h4 { margin: 0 0 4px 0; color: #fff; font-size: 18px; font-family: Outfit; }
        .success-text p { margin: 0; color: #22c55e; font-weight: 700; font-size: 14px; }

        /* Wrong Banner */
        .wrong-banner { display: flex; flex-direction: column; align-items: center; gap: 12px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); padding: 24px; border-radius: 12px; text-align: center; animation: slideUp 0.4s ease-out; }
        .wrong-icon { width: 50px; height: 50px; background: #ef4444; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; box-shadow: 0 0 20px rgba(239,68,68,0.4); }
        .wrong-text h4 { margin: 0 0 4px 0; color: #fff; font-size: 18px; font-family: Outfit; }
        .wrong-text p { margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.5; }

        .btn-next { background: transparent; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: transform 0.2s; font-size: 13px; font-family: Inter; }
        .btn-next:hover { transform: translateY(-2px); }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) { .solve-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}