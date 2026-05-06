import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <style>{`
        .page-container { min-height: 100vh; background: #050507; position: relative; display: flex; flex-direction: column; align-items: center; padding: 60px 20px; font-family: 'Inter', sans-serif; overflow: hidden; }
        
        /* 🔥 Animated Orange Light Pass Effect 🔥 */
        .ambient-glow { position: absolute; top: -20%; left: 50%; transform: translateX(-50%); width: 80vw; height: 80vw; background: radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 60%); filter: blur(80px); z-index: 0; animation: pulseGlow 5s infinite alternate ease-in-out; pointer-events: none; }
        @keyframes pulseGlow { 0% { opacity: 0.5; transform: translateX(-50%) scale(0.9); } 100% { opacity: 1; transform: translateX(-50%) scale(1.1); } }
        
        /* Premium Glass Card */
        .glass-card { background: rgba(15, 15, 20, 0.6); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 24px; padding: 48px; width: 100%; max-width: 600px; z-index: 1; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1); animation: popIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes popIn { 0% { opacity: 0; transform: translateY(20px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        
        .btn-back { background: transparent; color: #ff6b35; border: none; font-size: 14px; font-weight: 600; cursor: pointer; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; z-index: 1; align-self: center; width: 100%; max-width: 600px; }
        .btn-back:hover { transform: translateX(-5px); text-shadow: 0 0 10px rgba(255,107,53,0.5); }
        
        .input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .input-label { font-size: 11px; color: #64748b; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
        .input-field { width: 100%; padding: 16px; border-radius: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-family: Inter, sans-serif; font-size: 14px; outline: none; transition: all 0.3s; box-sizing: border-box; }
        .input-field:focus { border-color: #ff6b35; background: rgba(0,0,0,0.8); box-shadow: 0 0 0 4px rgba(255,107,53,0.15); }
        
        .submit-btn { width: 100%; background: linear-gradient(135deg, #ff6b35, #ea580c); color: #fff; padding: 16px; border-radius: 12px; font-size: 15px; font-weight: 800; border: none; cursor: pointer; transition: all 0.3s; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 25px -5px rgba(255,107,53,0.4); margin-top: 10px; }
        .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px -5px rgba(255,107,53,0.6); }
      `}</style>
      
      <div className="ambient-glow" />
      
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back to Arena
      </button>

      <div className="glass-card">
        <h1 style={{ fontFamily: 'Outfit', fontSize: '42px', color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-1px' }}>Get in Touch</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '40px', lineHeight: '1.6' }}>Found a bug? Have a suggestion? Or just want to say hi? Drop us a line.</p>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label className="input-label">Your Email</label>
            <input type="email" className="input-field" placeholder="coder@arena.com" />
          </div>
          
          <div className="input-group">
            <label className="input-label">Message</label>
            <textarea className="input-field" rows="5" placeholder="What's on your mind?"></textarea>
          </div>
          
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </div>
    </div>
  );
}