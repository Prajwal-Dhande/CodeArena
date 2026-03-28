import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="footer">
      <span onClick={() => navigate('/')} className="footer-logo">
        <span style={{ color: '#ff6b35' }}>Code</span>
        {/* BRIGHTER TEXT FOR LOGO */}
        <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,107,53,0.3)' }}>Arena</span>
      </span>

      {/* IMPROVED: Higher brightness copyright text */}
      <span className="footer-copyright">
        © 2026 — Built with blood & sweat by warriors who code under pressure.
      </span>

      <div className="footer-links">
        {['Privacy', 'Terms', 'Contact'].map(item => (
          <span key={item} className="footer-link">{item}</span>
        ))}
      </div>

      <style>{`
        /* IMPROVED: Slightly lighter background than true black for better contrast */
        .footer { padding: 2.5rem 2.5rem; border-top: 1px solid rgba(255,107,53,0.1); background: #0F0F0F; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-family: Inter, sans-serif; box-shadow: 0 -15px 40px rgba(0,0,0,0.5); }
        .footer-logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 16px; cursor: pointer; letter-spacing: -0.5px; }
        
        /* IMPROVED: Brightness for copyright text */
        .footer-copyright { font-size: 12px; color: #888; /* Was #333 (invisible in image_2) */ font-weight: 500; }
        
        .footer-links { display: flex; gap: 20px; }
        
        /* IMPROVED: High contrast link color with interactivity */
        .footer-link { font-size: 12px; color: #A0A0A0; /* Was #444 (invisible) */ font-weight: 600; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid transparent; }
        .footer-link:hover { color: #ff6b35; border-color: rgba(255,107,53,0.5); text-shadow: 0 0 10px rgba(255,107,53,0.3); }

        @media (max-width: 600px) {
          .footer { flex-direction: column; text-align: center; padding: 2rem 1.5rem; gap: 20px; }
          .footer-copyright { max-width: 250px; margin: 0 auto; line-height: 1.5; }
        }
      `}</style>
    </footer>
  )
}