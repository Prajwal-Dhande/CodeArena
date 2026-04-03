import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <style>{`
        .page-container { min-height: 100vh; background: #050507; position: relative; display: flex; flex-direction: column; align-items: center; padding: 60px 20px; font-family: 'Inter', sans-serif; overflow: hidden; }
        
        /* 🔥 Animated Orange Light Pass Effect 🔥 */
        .ambient-glow { position: absolute; top: 0; right: -20%; width: 70vw; height: 70vw; background: radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 60%); filter: blur(90px); z-index: 0; animation: driftGlow 8s infinite alternate ease-in-out; pointer-events: none; }
        @keyframes driftGlow { 0% { transform: translateY(-10%) scale(0.9); } 100% { transform: translateY(10%) scale(1.1); } }
        
        .doc-card { background: rgba(15, 15, 20, 0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 50px; width: 100%; max-width: 800px; z-index: 1; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6); animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .btn-back { background: transparent; color: #ff6b35; border: none; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; z-index: 1; align-self: center; width: 100%; max-width: 800px; }
        .btn-back:hover { transform: translateX(-5px); text-shadow: 0 0 10px rgba(255,107,53,0.5); }
        
        .doc-title { fontFamily: 'Outfit', sans-serif; font-size: 48px; color: #fff; margin-bottom: 12px; letter-spacing: -1.5px; background: linear-gradient(90deg, #fff, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .doc-meta { font-size: 12px; color: #ff6b35; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 48px; display: inline-block; background: rgba(255,107,53,0.1); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,107,53,0.2); }
        
        .section-block { margin-bottom: 40px; padding-left: 20px; border-left: 2px solid rgba(255,107,53,0.3); transition: border-color 0.3s; }
        .section-block:hover { border-color: #ff6b35; }
        .section-title { font-size: 22px; color: #f8fafc; margin-bottom: 16px; font-weight: 700; }
        .section-text { color: #94a3b8; line-height: 1.8; font-size: 15px; }
      `}</style>
      
      <div className="ambient-glow" />
      
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back to Arena
      </button>

      <div className="doc-card">
        <h1 className="doc-title">Privacy Policy</h1>
        <div className="doc-meta">Last Updated: April 2026</div>
        
        <div className="section-block">
          <h2 className="section-title">1. Information We Collect</h2>
          <p className="section-text">We collect information you provide directly to us, such as your username, email address, and coding statistics when you participate in battles on CodeArena.</p>
        </div>

        <div className="section-block">
          <h2 className="section-title">2. How We Use Your Information</h2>
          <p className="section-text">We use the information we collect to provide, maintain, and improve our matchmaking services, calculate your ELO rating, and display your position on the Global Leaderboard.</p>
        </div>

        <div className="section-block">
          <h2 className="section-title">3. Data Security</h2>
          <p className="section-text">We implement industry-standard security measures to protect your account and data. Passwords are encrypted, and we do not sell your personal information to third parties.</p>
        </div>
      </div>
    </div>
  );
}