import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API_URL from "../config/api";

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const TOPICS = ['All', 'Arrays', 'Strings', 'Linked List', 'Trees', 'Dynamic Programming', 'Graphs', 'Binary Search', 'Stack', 'Design'];

// Icons
const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ff6b35' }}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path><path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path><path d="M6 18a4 4 0 0 1-1.967-.516"></path><path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

export default function InterviewDSA() {
  const [isPremium, setIsPremium] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [diffFilter, setDiffFilter] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  
  // Modal states
  const [showPaywall, setShowPaywall] = useState(false);
  const [lockedProblem, setLockedProblem] = useState(null);

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
    fetchVaultProblems();
  }, []);

  const fetchVaultProblems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/problems/vault`);
      const data = await res.json();
      if (res.ok) {
        setProblems(data.problems);
      }
    } catch (err) {
      console.log("Failed to load vault problems.", err);
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
        description: "Unlock Premium FAANG Vault",
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
            alert("Payment Successful! Welcome to Premium Vault.");
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userObj = JSON.parse(storedUser);
              userObj.isPremium = true;
              localStorage.setItem("user", JSON.stringify(userObj));
              setUser(userObj);
            }
            setIsPremium(true);
            setShowPaywall(false);
            if (lockedProblem) {
              handlePlayProblem(lockedProblem);
            }
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

  const handleProblemClick = (p) => {
    if (p.tier === 'premium' && !isPremium) {
      setLockedProblem(p);
      setShowPaywall(true);
    } else {
      handlePlayProblem(p);
    }
  };

  const handlePlayProblem = (p) => {
    navigate(`/battle?problem=${p.slug}&room=vault_${Date.now()}&bot=InterviewerBot&practice=true&premium=true`);
  };

  const filteredProblems = problems.filter(p => {
    const diffMatch = diffFilter === 'All' || p.difficulty === diffFilter;
    const topicMatch = topicFilter === 'All' || p.category === topicFilter;
    const tierMatch = tierFilter === 'All' || p.tier === tierFilter;
    return diffMatch && topicMatch && tierMatch;
  });

  const getCompanyColor = (company) => {
    const colors = {
      'Amazon': '#ff9900',
      'Google': '#ea4335',
      'Facebook': '#1877f2',
      'Microsoft': '#00a4ef',
      'Apple': '#a2aaad',
      'Bloomberg': '#ff0000'
    };
    return colors[company] || '#a855f7';
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060608', flexDirection: 'column', position: 'relative', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(60px)', top: '10%', left: '20%' }} />
      <div style={{ position: 'absolute', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)', filter: 'blur(60px)', bottom: '10%', right: '20%' }} />
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px dashed rgba(255,107,53,0.3)', borderTopColor: '#ff6b35', borderBottomColor: '#ff6b35' }} />
          <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '2px solid rgba(236,72,153,0.1)', borderLeftColor: '#ec4899', borderRightColor: '#ec4899' }} />
          <motion.div animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} style={{ filter: 'drop-shadow(0 0 15px rgba(255,107,53,0.6))' }}>
            <BrainIcon />
          </motion.div>
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', fontSize: 28, margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>Accessing Vault</h2>
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
          <span onClick={() => navigate('/dashboard')}>Dashboard</span>
          <span onClick={() => navigate('/lobby')}>Practice</span>
          <span className="active" onClick={() => navigate('/interview-dsa')}>FAANG Vault</span>
          <span onClick={() => navigate('/tournaments')}>Tournaments</span>
          <span onClick={() => navigate('/leaderboard')}>Leaderboard</span>
          <span onClick={() => navigate('/profile')}>Profile</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="user-chip" onClick={() => navigate('/profile')}>
          <div className="rank-icon">🥇 PRO</div>
          <div className="avatar">{initials}</div>
          <span className="username">{user?.username || 'Player_01'}</span>
        </div>
      </nav>

      {/* AMBIENT LIGHTING BACKGROUND */}
      <div className="ambient-light-container">
        <div className="light-orb light-orange"></div>
        <div className="light-orb light-purple"></div>
        <div className="light-orb light-pink"></div>
      </div>

      <div className="vault-page-wrapper">
        <div className="vault-content-area">
          
          {/* HERO SECTION */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="hero-section"
          >
            <div className="hero-text-content">
              <h1 className="hero-title">
                The FAANG Vault
                <span className="pro-badge-glow">PRO</span>
              </h1>
              <p className="hero-subtitle">
                Master the most frequently asked interview questions from top tech companies. 
                Get real-time feedback from Clara, your AI technical interviewer.
              </p>
              {!isPremium && (
                <div className="premium-upsell" onClick={() => setShowPaywall(true)}>
                  🔒 Unlock all {problems.filter(p => p.tier === 'premium').length} Premium questions
                </div>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-box">
                <div className="stat-val">{problems.length}</div>
                <div className="stat-lbl">Curated Problems</div>
              </div>
              <div className="stat-box">
                <div className="stat-val">90%</div>
                <div className="stat-lbl">FAANG Hit Rate</div>
              </div>
            </div>
          </motion.div>

          {/* VAULT UI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="vault-container premium-glass-panel"
          >
            <div className="vault-header">
              <div className="filters-group">
                <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} className="vault-select">
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d} Difficulty</option>)}
                </select>
                <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="vault-select">
                  {TOPICS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>)}
                </select>
                <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="vault-select">
                  <option value="All">All Tiers</option>
                  <option value="free">Free Problems</option>
                  <option value="premium">Premium 🔒</option>
                </select>
              </div>
              <div className="problem-count">
                {filteredProblems.length} Problems Match
              </div>
            </div>

            <div className="vault-list">
              <div className="list-header">
                <div style={{ flex: 2 }}>Problem</div>
                <div style={{ flex: 1 }}>Frequency</div>
                <div style={{ flex: 1 }}>Acceptance</div>
                <div style={{ width: 100 }}>Difficulty</div>
                <div style={{ width: 120, textAlign: 'right' }}>Action</div>
              </div>

              <div className="list-body">
                <AnimatePresence>
                  {filteredProblems.map((p, idx) => {
                    const isLocked = p.tier === 'premium' && !isPremium;
                    const diffColors = {
                      Easy: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.2)' },
                      Medium: { bg: 'rgba(251,146,60,0.1)', color: '#fb923c', border: 'rgba(251,146,60,0.2)' },
                      Hard: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)' }
                    };
                    const dCol = diffColors[p.difficulty];

                    return (
                      <motion.div 
                        key={p.slug}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`problem-row ${isLocked ? 'locked-row' : ''}`}
                        onClick={() => handleProblemClick(p)}
                      >
                        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div className="company-badge" style={{ borderColor: `${getCompanyColor(p.topCompany)}40`, background: `${getCompanyColor(p.topCompany)}10`, color: getCompanyColor(p.topCompany) }}>
                            {p.topCompany.charAt(0)}
                          </div>
                          <div>
                            <div className="p-title">
                              {p.title} 
                              {p.tier === 'premium' && <span className="premium-tag">PRO</span>}
                            </div>
                            <div className="p-category">{p.category}</div>
                          </div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div className="freq-badge">
                            🔥 {p.faangFrequency} times
                          </div>
                        </div>

                        <div style={{ flex: 1, color: '#a1a1aa', fontSize: '13px', fontWeight: 500 }}>
                          {p.acceptance}%
                        </div>

                        <div style={{ width: 100 }}>
                          <span style={{ 
                            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                            background: dCol.bg, color: dCol.color, border: `1px solid ${dCol.border}`
                          }}>
                            {p.difficulty}
                          </span>
                        </div>

                        <div style={{ width: 120, textAlign: 'right' }}>
                          {isLocked ? (
                            <button className="action-btn locked-btn">
                              <LockIcon /> Unlock
                            </button>
                          ) : (
                            <button className="action-btn play-btn">
                              <PlayIcon /> Solve
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                
                {filteredProblems.length === 0 && (
                  <div className="empty-state">
                    <h3>No problems found</h3>
                    <p>Try adjusting your filters to find what you're looking for.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* PAYWALL MODAL */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="paywall-overlay"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="paywall-modal premium-glass-panel"
            >
              <button className="close-btn" onClick={() => setShowPaywall(false)}>✕</button>
              
              <div className="paywall-icon">
                <LockIcon />
              </div>
              
              <h2>Unlock Pro Vault</h2>
              <p>
                Get access to all <strong>FAANG Premium</strong> questions, including{" "}
                <span style={{ color: '#ff6b35' }}>{lockedProblem?.title || 'the best ones'}</span>.
                Practice with our AI expert interviewer to ace your next big interview.
              </p>
              
              <div className="paywall-features">
                <div className="pf-item">✓ 100+ Exclusive FAANG Problems</div>
                <div className="pf-item">✓ Clara Live Interview AI</div>
                <div className="pf-item">✓ Premium Stats & Dashboard</div>
              </div>

              <button className="btn-pink unlock-btn" onClick={handlePayment}>
                Upgrade to Pro (₹199/mo)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        body { background-color: #060608; margin: 0; overflow-x: hidden; }
        
        /* NAVBAR */
        .glass-nav { height: 60px; background: #111113; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; padding: 0 24px; position: fixed; top: 0; left: 0; right: 0; z-index: 50; flex-wrap: nowrap; }
        .logo { font-size: 16px; cursor: pointer; display: flex; align-items: center; margin-right: 32px; }
        .nav-links { display: flex; gap: 24px; margin-right: 32px; }
        .nav-links span { font-size: 13px; font-weight: 600; color: #a1a1aa; cursor: pointer; position: relative; padding: 20px 0; transition: color 0.2s; }
        .nav-links span:hover { color: #fff; }
        .nav-links span.active { color: #ff6b35; }
        .nav-links span.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #ff6b35; }
        
        .user-chip { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 4px 14px 4px 10px; cursor: pointer; transition: background 0.2s; }
        .user-chip:hover { background: rgba(255,255,255,0.08); }
        .rank-icon { font-size: 11px; color: #d97706; font-weight: 600; padding-right: 8px; border-right: 1px solid rgba(255,255,255,0.1); }
        .avatar { width: 22px; height: 22px; border-radius: 50%; background: #60a5fa; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #fff; }
        .username { font-size: 12px; font-weight: 600; }

        /* AMBIENT LIGHTS */
        .ambient-light-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 0; pointer-events: none; background: #060608; overflow: hidden; }
        .light-orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.6; }
        .light-orange { width: 800px; height: 800px; background: #ff6b35; top: -100px; left: calc(50% - 400px); animation: floatUp 8s infinite alternate ease-in-out; }
        .light-purple { width: 600px; height: 600px; background: #a855f7; bottom: -200px; left: -100px; animation: floatDown 7s infinite alternate ease-in-out; }
        .light-pink { width: 600px; height: 600px; background: #ec4899; top: 200px; right: -100px; animation: floatUp 9s infinite alternate ease-in-out; }
        @keyframes floatUp { from { transform: translateY(0px) scale(0.9); } to { transform: translateY(40px) scale(1.1); } }
        @keyframes floatDown { from { transform: translateY(0px) scale(1.1); } to { transform: translateY(-40px) scale(0.9); } }

        /* PAGE LAYOUT */
        .vault-page-wrapper { min-height: 100vh; padding-top: 100px; padding-bottom: 80px; display: flex; justify-content: center; position: relative; font-family: Inter, sans-serif; color: #fff; }
        .vault-content-area { width: 100%; max-width: 1000px; display: flex; flex-direction: column; position: relative; z-index: 10; padding: 0 20px; gap: 32px; }
        
        .premium-glass-panel { background: rgba(20, 20, 25, 0.3); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.08); box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5); border-radius: 24px; }

        /* HERO */
        .hero-section { display: flex; align-items: center; justify-content: space-between; gap: 40px; padding: 20px 10px; }
        .hero-text-content { flex: 1; }
        .hero-title { font-size: 48px; font-weight: 900; margin: 0 0 16px 0; display: flex; align-items: center; gap: 16px; letter-spacing: -1px; font-family: Outfit, sans-serif; background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .pro-badge-glow { background: linear-gradient(135deg, #d946ef, #8b5cf6); color: #fff; font-size: 14px; font-weight: 800; padding: 6px 14px; border-radius: 8px; letter-spacing: 1px; box-shadow: 0 0 20px rgba(217, 70, 239, 0.5), inset 0 1px 0 rgba(255,255,255,0.4); -webkit-text-fill-color: #fff; }
        .hero-subtitle { font-size: 16px; color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0; max-width: 500px; }
        .premium-upsell { display: inline-flex; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.3); color: #ff6b35; padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .premium-upsell:hover { background: rgba(255,107,53,0.15); border-color: rgba(255,107,53,0.5); transform: translateY(-2px); }
        
        .hero-stats { display: flex; gap: 16px; }
        .stat-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px 24px; min-width: 140px; }
        .stat-val { font-size: 32px; font-weight: 900; font-family: Outfit; color: #fff; margin-bottom: 4px; }
        .stat-lbl { font-size: 12px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        /* VAULT UI */
        .vault-container { overflow: hidden; display: flex; flex-direction: column; min-height: 600px; }
        .vault-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); }
        .filters-group { display: flex; gap: 12px; }
        .vault-select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #e5e5e5; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; outline: none; cursor: pointer; fontFamily: Inter; transition: all 0.2s; }
        .vault-select:hover { border-color: rgba(255,255,255,0.2); }
        .vault-select option { background: #1a1a1f; color: #fff; }
        .problem-count { font-size: 13px; color: #888; font-weight: 500; }

        .vault-list { flex: 1; display: flex; flex-direction: column; }
        .list-header { display: flex; padding: 16px 24px; font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .list-body { flex: 1; overflow-y: auto; }
        
        .problem-row { display: flex; padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; transition: all 0.2s; cursor: pointer; }
        .problem-row:hover { background: rgba(255,255,255,0.02); padding-left: 28px; }
        .locked-row { opacity: 0.7; }
        .locked-row:hover { opacity: 1; }
        
        .company-badge { width: 36px; height: 36px; border-radius: 10px; border: 1px solid; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; font-family: Outfit; }
        .p-title { font-size: 15px; font-weight: 600; color: #fff; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
        .premium-tag { background: linear-gradient(135deg, #d946ef, #8b5cf6); padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
        .p-category { font-size: 12px; color: #666; font-weight: 500; }
        
        .freq-badge { display: inline-flex; background: rgba(255,107,53,0.1); border: 1px solid rgba(255,107,53,0.2); color: #ff6b35; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        
        .action-btn { border: none; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; font-family: Inter; }
        .play-btn { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
        .play-btn:hover { background: #ff6b35; border-color: #ff6b35; transform: scale(1.05); }
        .locked-btn { background: rgba(236,72,153,0.1); color: #ec4899; border: 1px solid rgba(236,72,153,0.3); }
        .locked-btn:hover { background: rgba(236,72,153,0.2); transform: scale(1.05); }

        .empty-state { text-align: center; padding: 80px 20px; color: #666; }
        .empty-state h3 { font-size: 18px; color: #fff; margin: 0 0 8px 0; }
        .empty-state p { font-size: 14px; margin: 0; }

        /* PAYWALL MODAL */
        .paywall-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .paywall-modal { width: 100%; max-width: 440px; padding: 40px; text-align: center; position: relative; }
        .close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: #666; font-size: 20px; cursor: pointer; transition: color 0.2s; }
        .close-btn:hover { color: #fff; }
        .paywall-icon { width: 64px; height: 64px; background: rgba(236,72,153,0.1); border: 1px solid rgba(236,72,153,0.3); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #ec4899; font-size: 24px; box-shadow: 0 0 20px rgba(236,72,153,0.2); }
        .paywall-modal h2 { font-size: 28px; font-weight: 900; font-family: Outfit; margin: 0 0 16px 0; color: #fff; }
        .paywall-modal p { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 32px 0; }
        .paywall-features { text-align: left; background: rgba(0,0,0,0.3); border-radius: 16px; padding: 20px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.05); }
        .pf-item { font-size: 14px; font-weight: 600; color: #e5e5e5; margin-bottom: 12px; }
        .pf-item:last-child { margin-bottom: 0; }
        
        .unlock-btn { width: 100%; padding: 16px; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; color: #fff; cursor: pointer; transition: all 0.2s; background: linear-gradient(135deg, #d946ef, #ec4899); box-shadow: 0 8px 25px rgba(217, 70, 239, 0.3); font-family: Inter; }
        .unlock-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(217, 70, 239, 0.5); }
        
        @media (max-width: 800px) {
          .hero-section { flex-direction: column; text-align: center; }
          .hero-stats { justify-content: center; width: 100%; }
          .list-header { display: none; }
          .problem-row { flex-direction: column; gap: 16px; align-items: flex-start; }
          .problem-row > div { width: 100% !important; text-align: left !important; }
        }
      `}</style>
    </>
  );
}