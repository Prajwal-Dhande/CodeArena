import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API_URL from "../config/api";

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const TOPICS = ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Stack'];

// ✅ Premium UI Icons (SVG)
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ff6b35' }}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#c084fc' }}>
    <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fbbf24' }}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
    <path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#4ade80' }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

// ✅ ProblemModal Component
const ProblemModal = ({ title, subtitle, borderColor, accentColor, selectedP, onSelect, diff, setDiff, topic, setTopic, onPlay, onClose, btnLabel, problems }) => {
  const list = problems.filter(p =>
    (diff === 'All' || p.difficulty === diff) &&
    (topic === 'All' || p.category === topic)
  )

  const dColor = {
    Easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    Medium: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
    Hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(12px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(160deg, #141418 0%, #0f0f14 100%)',
        border: `1px solid ${borderColor}`,
        borderRadius: 24, width: '92%', maxWidth: 720,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,0.9)`
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 32px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${accentColor}08, transparent)`
        }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 24, color: '#fff', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: '#555' }}>{subtitle}</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#666', cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>
        </div>

        {/* Filters */}
        <div style={{
          padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(0,0,0,0.2)'
        }}>
          {[
            { val: diff, set: setDiff, opts: ['All', 'Easy', 'Medium', 'Hard'] },
            { val: topic, set: setTopic, opts: ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Stack'] },
          ].map(({ val, set, opts }, i) => (
            <select key={i} value={val} onChange={e => set(e.target.value)} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#ccc', padding: '8px 14px', borderRadius: 10,
              fontSize: 12, fontWeight: 600, outline: 'none', cursor: 'pointer', fontFamily: 'Inter'
            }}>
              {opts.map(o => <option key={o} style={{ background: '#1a1a1a' }}>{o}</option>)}
            </select>
          ))}
          <div style={{
            marginLeft: 'auto', fontSize: 12, color: '#444', fontWeight: 600,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            padding: '6px 12px', borderRadius: 8
          }}>{list.length} problems</div>
        </div>

        {/* Problem List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 18 }}>No problems found</div>
              <div style={{ fontSize: 13 }}>Try changing the filters above</div>
            </div>
          ) : list.map((p, idx) => (
            <div key={p._id || idx} onClick={() => onSelect(p)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 18px',
              background: selectedP?._id === p._id ? `${accentColor}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${selectedP?._id === p._id ? accentColor + '50' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
              transform: selectedP?._id === p._id ? 'translateX(4px)' : 'none'
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: dColor[p.difficulty]?.bg,
                border: `1px solid ${dColor[p.difficulty]?.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, color: dColor[p.difficulty]?.color, fontFamily: 'Outfit'
              }}>{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: '#555', display: 'flex', gap: 8 }}>
                  <span>{p.category}</span><span>·</span>
                  <span>{p.acceptance}% acceptance</span>
                  {p.companies?.[0] && <><span>·</span><span style={{ color: '#444' }}>{p.companies[0]}</span></>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6,
                  background: dColor[p.difficulty]?.bg, color: dColor[p.difficulty]?.color,
                  border: `1px solid ${dColor[p.difficulty]?.border}`
                }}>{p.difficulty}</span>
                {selectedP?._id === p._id && (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: accentColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#fff', fontWeight: 800
                  }}>✓</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(0,0,0,0.3)'
        }}>
          {selectedP ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
              <span style={{ fontSize: 13, color: '#888' }}>
                Selected: <strong style={{ color: accentColor }}>{selectedP.title}</strong>
                <span style={{ color: '#444', marginLeft: 6 }}>({selectedP.difficulty})</span>
              </span>
            </div>
          ) : (
            <div style={{ flex: 1, fontSize: 13, color: '#444' }}>Select a problem to continue</div>
          )}
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: '#555', borderRadius: 12, padding: '12px 24px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter'
          }}>Cancel</button>
          <button onClick={onPlay} disabled={!selectedP} style={{
            background: selectedP ? accentColor : 'rgba(255,255,255,0.04)',
            color: selectedP ? '#fff' : '#444',
            border: 'none', borderRadius: 12, padding: '12px 28px',
            cursor: selectedP ? 'pointer' : 'not-allowed',
            fontSize: 13, fontWeight: 700, fontFamily: 'Inter',
            boxShadow: selectedP ? `0 4px 20px ${accentColor}40` : 'none',
            transition: 'all 0.2s'
          }}>{btnLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default function InterviewDSA() {
  const [isPremium, setIsPremium] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection Modal States
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [diffFilter, setDiffFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [selectedProblem, setSelectedProblem] = useState(null);
  
  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const initials = (user?.username || 'PL').slice(0, 2).toUpperCase();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUser(userObj);
      if (userObj.isPremium) {
        setIsPremium(true);
      }
    }
    fetchPremiumProblems();
  }, []);

  const fetchPremiumProblems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/problems/premium`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIsPremium(true);
        setProblems(data.problems);
      } else {
        setIsPremium(false);
      }
    } catch (err) {
      console.log("Failed to verify subscription.", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ plan: "monthly", amount: 19900 }) 
      });

      const order = await res.json();
      if (!order.success && !res.ok) {
         throw new Error(order.message || "Order creation failed.");
      }

      const options = {
        key: order.key || "rzp_test_Sd4kIt56xgH8Yw", 
        amount: order.order?.amount || order.amount,
        currency: order.order?.currency || "INR",
        name: "Code Arena Pro",
        description: "Unlock Premium Interview DSA Questions",
        image: "/favicon.svg",
        order_id: order.order?.id || order.id,
        handler: async function (response) {
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success || verifyRes.ok) {
            alert("Payment Successful! Welcome to Premium.");
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userObj = JSON.parse(storedUser);
              userObj.isPremium = true;
              localStorage.setItem("user", JSON.stringify(userObj));
              setUser(userObj);
            }
            setIsPremium(true);
            fetchPremiumProblems();
          } else {
            alert(verifyData.message || "Payment Verification Failed");
          }
        },
        theme: { color: "#ec4899" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
          alert("Payment Failed - " + response.error.description);
      });
      rzp1.open();
    } catch (err) {
      alert("Error initiating payment: " + err.message);
    }
  };

  const handleStartInterviewClick = () => {
    setSelectedProblem(null);
    setShowSelectionModal(true);
  };

  const handleBeginSelectedInterview = () => {
    if (!selectedProblem) return;
    setShowSelectionModal(false);
    navigate(`/battle?problem=${selectedProblem.slug}&room=premium_${Date.now()}&bot=InterviewerBot&practice=true&premium=true`);
  };

  // ✅ New Premium Holographic Loader (AI words removed, replaced with Premium/Pro terms)
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Background Ambient Glow */}
      <div style={{ position: 'absolute', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(60px)', top: '10%', left: '20%' }} />
      <div style={{ position: 'absolute', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)', filter: 'blur(60px)', bottom: '10%', right: '20%' }} />

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Holographic Spinning Brain UI */}
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          {/* Outer Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(255,107,53,0.3)', borderTopColor: '#ff6b35', borderBottomColor: '#ff6b35' }}
          />
          {/* Inner Fast Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '2px solid rgba(236,72,153,0.1)', borderLeftColor: '#ec4899', borderRightColor: '#ec4899' }}
          />
          {/* Center Brain Icon Pulsing */}
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 0 15px rgba(255,107,53,0.6))' }}
          >
            <BrainIcon />
          </motion.div>
        </div>

        {/* Loading Text */}
        <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', fontSize: 28, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
          Unlocking Pro Vault
        </h2>
        
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ec4899', boxShadow: '0 0 10px #ec4899' }} />
          <span style={{ color: '#ec4899', fontSize: 13, fontWeight: 700, letterSpacing: 2, fontFamily: 'JetBrains Mono, monospace' }}>
            CONNECTING TO CLARA (EXPERT SYSTEM)...
          </span>
        </motion.div>

      </div>
    </div>
  );

  return (
    <>
      <nav className="glass-nav">
        <span className="logo" onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35', marginRight: '6px' }}>{"{C}"}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>CodeArena</span>
        </span>
        <div style={{ flex: 1 }} />
        <div className="nav-links">
          <span onClick={() => navigate('/')}>Dashboard</span>
          <span onClick={() => navigate('/lobby')}>Practice</span>
          <span className="active" onClick={() => navigate('/interview-dsa')}>Practice Interview</span>
          <span onClick={() => navigate('/leaderboard')}>Leaderboard</span>
          <span onClick={() => navigate('/profile')}>Profile</span>
        </div>
        <div style={{ flex: 1 }} />
        
        {/* ✅ Exact Lobby.jsx Style User Chip */}
        <div className="user-chip" onClick={() => navigate('/profile')}>
          <div className="rank-icon">🥉 Bronze</div>
          <div className="avatar">{initials}</div>
          <span className="username">{user?.username || 'Player_01'}</span>
        </div>
      </nav>

      {/* ✅ SELECTION MODAL */}
      {showSelectionModal && (
        <ProblemModal 
          title="🧠 Pro Interview Vault" 
          subtitle="Select an exclusive FAANG problem to begin your Pro Interview." 
          borderColor="rgba(255, 107, 53, 0.4)" 
          accentColor="#ff6b35" 
          selectedP={selectedProblem} 
          onSelect={setSelectedProblem} 
          diff={diffFilter} setDiff={setDiffFilter} 
          topic={topicFilter} setTopic={setTopicFilter} 
          onPlay={handleBeginSelectedInterview} 
          onClose={() => setShowSelectionModal(false)} 
          btnLabel="🧠 Begin Interview" 
          problems={problems} 
        />
      )}

      {/* ✅ MASSIVE AMBIENT LIGHTING BACKGROUND */}
      <div className="ambient-light-container">
        <div className="light-orb light-orange"></div>
        <div className="light-orb light-purple"></div>
        <div className="light-orb light-pink"></div>
      </div>

      <div className="dsa-page-wrapper">
        <div className="main-content-area">
          
          {/* ✅ Top Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hero-box premium-glass-panel"
          >
            <div className="hero-glow-border"></div>
            
            <div className="hero-icon-wrap">
              <div className="hologram-icon"><BrainIcon /></div>
            </div>
            <h1 className="hero-title gradient-text-silver">
              Elite Interview Session
              <span className="pro-badge-glow">PRO</span>
            </h1>
            <p className="hero-subtitle text-silver">
              Practice coding problems with Clara, your expert technical interviewer. Get real-time feedback, hints, and guidance tailored to your skill level.
            </p>
          </motion.div>

          <div style={{ position: 'relative', marginTop: '32px' }}>
            {/* ✅ Features Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="features-box premium-glass-panel"
            >
              <h2 className="features-title">Start Your Interview</h2>
              <p className="features-subtitle text-silver">We'll provide an environment matched to your skill level.</p>
              
              <div className="features-grid">
                <div className="feat-card spotlight-hover">
                  <div className="feat-block-icon" style={{ background: 'rgba(192, 132, 252, 0.1)', borderColor: 'rgba(192, 132, 252, 0.3)' }}>
                    <TargetIcon />
                  </div>
                  <h3>Skill-Matched</h3>
                  <p>Problems tailored to your<br/>current ELO rating</p>
                </div>

                <div className="feat-card spotlight-hover">
                  <div className="feat-block-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                    <SparklesIcon />
                  </div>
                  <h3>Live Expert Feedback</h3>
                  <p>Get hints and feedback from<br/>Clara as you solve</p>
                </div>

                <div className="feat-card spotlight-hover">
                  <div className="feat-block-icon" style={{ background: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                    <TrophyIcon />
                  </div>
                  <h3>Fresh Problems</h3>
                  <p>Only unseen problems from<br/>your skill bracket</p>
                </div>
              </div>
            </motion.div>

            {/* ✅ Start Button (Premium Users) */}
            {isPremium && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.3 }}
                 className="action-overlay premium-glass-panel"
               >
                 <button className="premium-action-btn btn-green" onClick={handleStartInterviewClick}>
                   ✨ Select Problem & Start
                 </button>
               </motion.div>
            )}

            {/* ✅ Paywall (Non-Premium Users) */}
            {!isPremium && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="action-overlay premium-glass-panel"
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                     <div style={{ color: '#ec4899', filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.6))' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                     </div>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12, color: '#fff', letterSpacing: '-0.5px' }}>Pro Feature Locked</h3>
                  <p style={{ color: '#a1a1aa', lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>Pro Interview Practice requires CodeArena Pro.<br/>Gain access to exclusive FAANG questions and priority matchmaking.</p>
                  
                  <button className="premium-action-btn btn-pink" onClick={handlePayment}>
                    Unlock Pro Access
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ✅ How It Works Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="how-it-works-box premium-glass-panel"
          >
            <h3>How It Works</h3>
            <ul className="steps-list">
              <li>
                <div className="step-num">1</div>
                <span>Click "Start" and select a problem from the exclusive FAANG Vault.</span>
              </li>
              <li>
                <div className="step-num">2</div>
                <span>Start the session to get real-time guidance from Clara.</span>
              </li>
              <li>
                <div className="step-num">3</div>
                <span>Code your solution and receive intelligent context-aware hints.</span>
              </li>
              <li>
                <div className="step-num">4</div>
                <span>Submit your solution and get detailed complexity feedback.</span>
              </li>
            </ul>
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: '40px', position: 'relative', zIndex: 10 }}>
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
          </div>

        </div>
      </div>

      <style>{`
        body { background-color: #060608; margin: 0; overflow-x: hidden; }
        
        .dsa-page-wrapper {
          min-height: 100vh;
          background-color: transparent; /* Changed to let lights shine through */
          font-family: Inter, sans-serif;
          color: #fff;
          padding-top: 100px;
          padding-bottom: 80px;
          display: flex;
          justify-content: center;
          position: relative;
        }

        /* ✅ MASSIVE AMBIENT LIGHTING SYSTEM FOR GLASSMORPHISM */
        .ambient-light-container {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          z-index: 0; pointer-events: none; background: #060608;
          overflow: hidden;
        }
        .light-orb {
          position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.6;
        }
        .light-orange {
          width: 800px; height: 800px; background: #ff6b35;
          top: -100px; left: calc(50% - 400px);
          animation: floatUp 8s infinite alternate ease-in-out;
        }
        .light-purple {
          width: 600px; height: 600px; background: #a855f7;
          bottom: -200px; left: -100px;
          animation: floatDown 7s infinite alternate ease-in-out;
        }
        .light-pink {
          width: 600px; height: 600px; background: #ec4899;
          top: 200px; right: -100px;
          animation: floatUp 9s infinite alternate ease-in-out;
        }
        @keyframes floatUp { from { transform: translateY(0px) scale(0.9); } to { transform: translateY(40px) scale(1.1); } }
        @keyframes floatDown { from { transform: translateY(0px) scale(1.1); } to { transform: translateY(-40px) scale(0.9); } }

        /* NAVBAR */
        .glass-nav { height: 60px; background: #111113; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; padding: 0 24px; position: fixed; top: 0; left: 0; right: 0; z-index: 50; flex-wrap: nowrap; }
        .logo { font-size: 16px; cursor: pointer; display: flex; align-items: center; margin-right: 32px; }
        .nav-links { display: flex; gap: 24px; margin-right: 32px; }
        .nav-links span { font-size: 13px; font-weight: 600; color: #a1a1aa; cursor: pointer; position: relative; padding: 20px 0; transition: color 0.2s; }
        .nav-links span:hover { color: #fff; }
        .nav-links span.active { color: #ff6b35; }
        .nav-links span.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #ff6b35; }
        
        /* ✅ Exactly Matches Lobby.jsx Styling */
        .user-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 4px 14px 4px 10px; cursor: pointer; transition: background 0.2s; }
        .user-chip:hover { background: rgba(255,255,255,0.08); }
        .rank-icon { font-size: 11px; color: #d97706; font-weight: 600; padding-right: 8px; border-right: 1px solid rgba(255,255,255,0.1); }
        .avatar { width: 22px; height: 22px; border-radius: 50%; background: #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }
        .username { font-size: 12px; font-weight: 600; }

        /* MAIN AREA */
        .main-content-area { width: 100%; max-width: 900px; display: flex; flex-direction: column; position: relative; z-index: 10; padding: 0 20px; }
        
        /* 🧊 GLASSMORPHISM 2.0 (Premium Panels) */
        .premium-glass-panel {
          background: rgba(20, 20, 25, 0.3); /* Lowered opacity to let colors shine */
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5);
          position: relative; overflow: hidden;
        }

        .hero-box { border-radius: 24px; padding: 60px 40px; text-align: center; }
        
        /* Subtle animated border on Hero */
        .hero-glow-border {
           position: absolute; top: 0; left: 0; right: 0; height: 1px;
           background: linear-gradient(90deg, transparent, rgba(255,107,53,0.6), transparent);
           animation: scan 4s infinite linear;
        }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .hero-icon-wrap { display: flex; justify-content: center; margin-bottom: 24px; }
        .hologram-icon { width: 72px; height: 72px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(255,107,53,0.15), inset 0 0 20px rgba(255,255,255,0.02); }
        
        .gradient-text-silver { background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .text-silver { color: #a1a1aa; }

        .hero-title { font-size: 42px; font-weight: 900; margin: 0 0 20px 0; display: flex; align-items: center; justify-content: center; gap: 14px; letter-spacing: -1px; }
        .pro-badge-glow { 
          background: linear-gradient(135deg, #d946ef, #8b5cf6); color: #fff; font-size: 13px; font-weight: 800; padding: 4px 12px; border-radius: 8px; letter-spacing: 1px; 
          box-shadow: 0 0 20px rgba(217, 70, 239, 0.5), inset 0 1px 0 rgba(255,255,255,0.4); -webkit-text-fill-color: #fff; 
        }
        .hero-subtitle { font-size: 16px; max-width: 600px; margin: 0 auto; line-height: 1.6; font-weight: 400; }

        /* 📋 FEATURES SECTION */
        .features-box { border-radius: 24px; padding: 48px; text-align: center; min-height: 400px; padding-bottom: 150px; }
        .features-title { font-size: 24px; font-weight: 700; margin: 0 0 8px 0; color: #fff; letter-spacing: -0.5px; }
        .features-subtitle { font-size: 15px; margin: 0 0 40px 0; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        
        /* 🧲 3D TILT CARDS */
        .feat-card { 
          background: rgba(15, 15, 20, 0.6); border: 1px solid rgba(255,255,255,0.04); border-radius: 20px; padding: 36px 24px; 
          text-align: center; display: flex; flex-direction: column; align-items: center; cursor: default; transition: all 0.4s ease; 
        }
        .spotlight-hover:hover { 
          transform: translateY(-8px); 
          border-color: rgba(255,107,53,0.3); 
          background: rgba(30, 30, 35, 0.8);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1); 
        }
        
        .feat-block-icon { width: 56px; height: 56px; border-radius: 16px; border: 1px solid; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; }
        .feat-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 10px 0; color: #fff; }
        .feat-card p { font-size: 13px; color: #888; margin: 0; line-height: 1.6; }

        /* 🔒 ACTION OVERLAY (Starts & Paywalls) */
        .action-overlay {
          position: absolute; bottom: -24px; left: 50%; width: 480px; border-radius: 24px; padding: 40px; text-align: center; z-index: 20; margin-left: -240px;
        }

        /* ✅ BULLETPROOF CSS BUTTONS */
        .premium-action-btn {
          border: none;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 800;
          border-radius: 12px;
          cursor: pointer;
          width: 100%;
          font-family: Inter, sans-serif;
          color: #fff;
          transition: all 0.2s ease;
        }
        .btn-green {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          box-shadow: 0 8px 25px rgba(34,197,94,0.3);
        }
        .btn-green:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(34,197,94,0.4);
        }
        .btn-pink {
          background: linear-gradient(135deg, #d946ef, #ec4899);
          box-shadow: 0 8px 25px rgba(217, 70, 239, 0.3);
        }
        .btn-pink:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(217, 70, 239, 0.5);
        }

        /* 📋 HOW IT WORKS */
        .how-it-works-box { border-radius: 24px; padding: 48px 50px; margin-top: 60px; }
        .how-it-works-box h3 { font-size: 20px; font-weight: 700; margin: 0 0 32px 0; color: #fff; letter-spacing: -0.5px; }
        .steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 28px; }
        .steps-list li { display: flex; align-items: center; gap: 20px; font-size: 15px; color: #a1a1aa; font-weight: 500; }
        .step-num { width: 32px; height: 32px; border-radius: 10px; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.1); }
        
        /* ⬅️ BOTTOM BACK BTN */
        .back-btn { background: #111; border: 1px solid rgba(255,255,255,0.08); color: #a1a1aa; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .back-btn:hover { background: rgba(255,255,255,0.05); color: #fff; transform: translateY(-1px); }
        
        @media (max-width: 800px) {
          .features-grid { grid-template-columns: 1fr; }
          .action-overlay { width: 90%; margin-left: -45%; transform: translateY(40%); }
          .how-it-works-box { margin-top: 140px; padding: 30px 20px; }
        }
      `}</style>
    </>
  );
}