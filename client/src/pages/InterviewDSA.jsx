import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function InterviewDSA() {
  const [isPremium, setIsPremium] = useState(false);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [diffFilter, setDiffFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');
  
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      if (userObj.isPremium) {
        setIsPremium(true);
      }
    }
    fetchPremiumProblems();
  }, []);

  const fetchPremiumProblems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/problems/premium", {
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
      const res = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const order = await res.json();
      if (!res.ok) {
         throw new Error(order.message || "Order creation failed. Check backend .env keys!");
      }

      const options = {
        key: "rzp_test_Sd4kIt56xgH8Yw", 
        amount: order.amount,
        currency: order.currency,
        name: "Code Arena Pro",
        description: "Unlock Premium Interview DSA Questions",
        image: "/favicon.svg",
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("Payment Successful! Welcome to Premium.");
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userObj = JSON.parse(storedUser);
              userObj.isPremium = true;
              localStorage.setItem("user", JSON.stringify(userObj));
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

  // Compute filtered problems
  const filteredProblems = problems.filter(p => {
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchDiff && matchCat;
  });

  const categories = ['All', ...new Set(problems.map(p => p.category))];

  if (loading) return <div className="dsa-loader">Loading parameters...</div>;

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
          <span>Compete</span>
          <span onClick={() => navigate('/leaderboard')}>Leaderboard</span>
          <span onClick={() => navigate('/profile')}>Friends</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="nav-icons">
          <span className="nav-icon">📸</span>
          <span className="nav-icon">🎵</span>
          <span className="nav-icon">💬</span>
          <span className="nav-icon">🔗</span>
          <span className="nav-icon" style={{ marginLeft: '12px' }}>🔔</span>
        </div>
        <div className="user-profile-nav">
          <div className="rank-badge-nav">🥉 Bronze</div>
          <div className="avatar-nav">P</div>
          <span className="username-nav">prajwal2007 ⌄</span>
        </div>
      </nav>

      <div className="dsa-page-wrapper">
        <div className="main-content-area">
          
          {/* Top Hero Section */}
          <div className="hero-box">
            <div className="hero-icon">🤖</div>
            <h1 className="hero-title">
              AI Interview Practice
              <span className="pro-badge-top">PRO</span>
            </h1>
            <p className="hero-subtitle">
              Practice coding problems with Clara, your AI technical interviewer. Get real-time feedback, hints, and guidance tailored to your skill level.
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Features Section */}
            <div className="features-box">
              <h2 className="features-title">Start Your Interview</h2>
              <p className="features-subtitle">We'll select a problem matched to your skill level that you haven't seen before</p>
              
              <div className="features-grid">
                <div className="feat-card">
                  <div className="feat-icon">🎯</div>
                  <h3>Skill-Matched</h3>
                  <p>Problems tailored to your<br/>current ELO rating</p>
                </div>
                <div className="feat-card">
                  <div className="feat-icon">✨</div>
                  <h3>AI Guidance</h3>
                  <p>Get hints and feedback from<br/>Clara as you solve</p>
                </div>
                <div className="feat-card">
                  <div className="feat-icon">🏆</div>
                  <h3>Fresh Problems</h3>
                  <p>Only unseen problems from<br/>your skill bracket</p>
                </div>
              </div>
            </div>

            {/* Overlapping Paywall Popup */}
            {!isPremium && (
              <div className="paywall-overlay card-pop">
                <div className="pw-content">
                  <div className="pw-icon-blue">👑</div>
                  <h3>Pro Feature</h3>
                  <p>AI Interview Practice requires CodeArena Pro<br/><span>Pro: 1 interview/week • Ultimate: Unlimited</span></p>
                  <button className="pw-btn" onClick={handlePayment}>
                    👑 Upgrade to Pro
                  </button>
                </div>
              </div>
            )}
            
            {/* If premium, show start button instead of paywall popup */}
            {isPremium && (
               <div className="premium-start-overlay">
                  <button className="start-interview-btn" onClick={() => navigate(`/battle?problem=two-sum&room=premium_${Date.now()}&bot=InterviewerBot&practice=true&premium=true`)}>
                    Start Interview Now
                  </button>
               </div>
            )}
          </div>

          {/* How It Works Section */}
          <div className="how-it-works-box">
            <h3>How It Works</h3>
            <ul className="steps-list">
              <li>
                <div className="step-num">1</div>
                <span>Click "Start Interview" and we'll select a problem matched to your ELO rating</span>
              </li>
              <li>
                <div className="step-num">2</div>
                <span>Start the AI interviewer to get real-time guidance from Clara</span>
              </li>
              <li>
                <div className="step-num">3</div>
                <span>Code your solution with voice interaction and receive helpful hints</span>
              </li>
              <li>
                <div className="step-num">4</div>
                <span>Submit your solution and get detailed feedback on your approach</span>
              </li>
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
          </div>

        </div>
      </div>

      <style>{`
        body { background-color: #0b0b0e; margin: 0; }
        
        .dsa-page-wrapper {
          min-height: 100vh;
          background-color: #0b0b0e;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          font-family: Inter, sans-serif;
          color: #fff;
          padding-top: 80px;
          padding-bottom: 60px;
          display: flex;
          justify-content: center;
        }

        /* NAVBAR */
        .glass-nav { height: 60px; background: #111113; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; padding: 0 24px; position: fixed; top: 0; left: 0; right: 0; z-index: 50; flex-wrap: nowrap; }
        .logo { font-size: 16px; cursor: pointer; display: flex; align-items: center; margin-right: 32px; }
        .nav-links { display: flex; gap: 24px; margin-right: 32px; }
        .nav-links span { font-size: 13px; font-weight: 600; color: #a1a1aa; cursor: pointer; position: relative; padding: 20px 0; }
        .nav-links span:hover { color: #fff; }
        .nav-links span.active { color: #ff6b35; }
        .nav-links span.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #ff6b35; }
        
        .nav-icons { display: flex; gap: 12px; margin-right: 24px; color: #a1a1aa; font-size: 14px; }
        .nav-icon { cursor: pointer; }
        .nav-icon:hover { color: #fff; }
        
        .user-profile-nav { display: flex; align-items: center; gap: 12px; }
        .rank-badge-nav { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 6px; }
        .avatar-nav { width: 26px; height: 26px; border-radius: 50%; background: #60a5fa; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
        .username-nav { font-size: 13px; font-weight: 600; color: #e4e4e7; cursor: pointer; }

        /* MAIN AREA */
        .main-content-area { width: 100%; max-width: 860px; display: flex; flex-direction: column; gap: 24px; position: relative; z-index: 10; padding: 0 20px; }

        .hero-box { background: #16161a; border-radius: 20px; padding: 40px; text-align: center; border: 1px solid rgba(255,255,255,0.04); }
        .hero-icon { font-size: 40px; color: #ff6b35; margin-bottom: 20px; }
        .hero-title { font-size: 32px; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center; justify-content: center; gap: 12px; }
        .pro-badge-top { background: #d946ef; color: #fff; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.5px; }
        .hero-subtitle { font-size: 15px; color: #a1a1aa; max-width: 600px; margin: 0 auto; line-height: 1.6; }

        .features-box { background: #16161a; border-radius: 20px; padding: 40px; text-align: center; border: 1px solid rgba(255,255,255,0.04); min-height: 400px; padding-bottom: 120px; }
        .features-title { font-size: 20px; font-weight: 600; margin: 0 0 8px 0; }
        .features-subtitle { font-size: 14px; color: #71717a; margin: 0 0 32px 0; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .feat-card { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 24px 20px; text-align: center; }
        .feat-icon { font-size: 28px; margin-bottom: 16px; color: #ff6b35; }
        .feat-card h3 { font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: #fff; }
        .feat-card p { font-size: 12px; color: #71717a; margin: 0; line-height: 1.5; }

        /* OVERLAYS */
        .card-pop { position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); width: 440px; background: #fff; border-radius: 16px; padding: 32px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 20; color: #000; }
        .pw-icon-blue { font-size: 32px; color: #3b82f6; margin-bottom: 12px; }
        .card-pop h3 { font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #111; }
        .card-pop p { font-size: 13px; color: #555; margin: 0 0 24px 0; line-height: 1.5; }
        .card-pop p span { font-size: 11px; color: #888; display: block; margin-top: 4px; }
        .pw-btn { width: 100%; background: #ea580c; color: #fff; font-size: 14px; font-weight: 600; padding: 14px; border-radius: 10px; border: none; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 12px rgba(234,88,12,0.3); }
        .pw-btn:hover { background: #c2410c; }
        
        .premium-start-overlay { position: absolute; bottom: 0; left: 50%; transform: translate(-50%, 50%); width: 440px; background: #16161a; border-radius: 16px; padding: 32px; text-align: center; border: 1px solid rgba(34,197,94,0.3); z-index: 20; box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(34,197,94,0.1); }
        .start-interview-btn { width: 100%; background: #22c55e; color: #fff; font-size: 16px; font-weight: 700; padding: 16px; border-radius: 10px; border: none; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 12px rgba(34,197,94,0.3); }
        .start-interview-btn:hover { background: #16a34a; transform: translateY(-2px); }

        /* HOW IT WORKS */
        .how-it-works-box { background: #16161a; border-radius: 20px; padding: 32px 40px; margin-top: 80px; border: 1px solid rgba(255,255,255,0.04); }
        .how-it-works-box h3 { font-size: 16px; font-weight: 600; margin: 0 0 24px 0; color: #fff; }
        .steps-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 20px; }
        .steps-list li { display: flex; align-items: center; gap: 16px; font-size: 14px; color: #a1a1aa; }
        .step-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(255,107,53,0.15); color: #ff6b35; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        
        /* BOTTOM BACK BTN */
        .back-btn { background: #ea580c; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
        .back-btn:hover { background: #c2410c; }
        
        @media (max-width: 800px) {
          .features-grid { grid-template-columns: 1fr; }
          .card-pop, .premium-start-overlay { width: 90%; transform: translate(-50%, 40%); }
          .how-it-works-box { margin-top: 120px; }
        }
      `}</style>
    </>
  );
}
