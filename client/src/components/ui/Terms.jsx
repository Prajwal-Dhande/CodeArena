import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <style>{`
        .page-container { min-height: 100vh; background: #050507; position: relative; display: flex; flex-direction: column; align-items: center; padding: 60px 20px; font-family: 'Inter', sans-serif; overflow: hidden; }
        
        /* 🔥 Animated Orange Light Pass Effect 🔥 */
        .ambient-glow { position: absolute; top: 10%; left: -20%; width: 70vw; height: 70vw; background: radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 60%); filter: blur(90px); z-index: 0; animation: driftGlow 8s infinite alternate-reverse ease-in-out; pointer-events: none; }
        @keyframes driftGlow { 0% { transform: translateY(-10%) scale(0.9); } 100% { transform: translateY(10%) scale(1.1); } }
        
        .doc-card { background: rgba(15, 15, 20, 0.65); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 50px; width: 100%; max-width: 800px; z-index: 1; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6); animation: slideUp 0.5s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        .btn-back { background: transparent; color: #ff6b35; border: none; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; z-index: 1; align-self: center; width: 100%; max-width: 800px; }
        .btn-back:hover { transform: translateX(-5px); text-shadow: 0 0 10px rgba(255,107,53,0.5); }
        
        .doc-title { fontFamily: 'Outfit', sans-serif; font-size: 48px; color: #fff; margin-bottom: 12px; letter-spacing: -1.5px; background: linear-gradient(90deg, #fff, #ff6b35); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .doc-meta { font-size: 12px; color: #ef4444; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 48px; display: inline-block; background: rgba(239,68,68,0.1); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(239,68,68,0.2); }
        
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
        <h1 className="doc-title">Terms of Service</h1>
        <div className="doc-meta">PLEASE READ CAREFULLY</div>
        
        <div className="section-block">
          <h2 className="section-title">1. Fair Play & Cheating</h2>
          <p className="section-text">CodeArena is built on fair competition. Any use of bots, automated scripts, or third-party assistance to solve coding challenges during a ranked battle will result in an immediate and permanent ban.</p>
        </div>

        <div className="section-block">
          <h2 className="section-title">2. Account Responsibilities</h2>
          <p className="section-text">You are responsible for safeguarding your account credentials. You may not share or transfer your account or ELO rating to another individual.</p>
        </div>

        <div className="section-block">
          <h2 className="section-title">3. Service Availability</h2>
          <p className="section-text">While we strive for 99.9% uptime, CodeArena may occasionally be taken offline for maintenance, updates, or to address server issues. We are not liable for ELO loss due to server disconnects.</p>
        </div>
      </div>
    </div>
  );
}