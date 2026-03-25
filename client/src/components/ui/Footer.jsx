import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="footer">
      <span onClick={() => navigate('/')} className="footer-logo">
        <span style={{ color: '#ff6b35' }}>Code</span>
        <span style={{ color: '#fff' }}>Arena</span>
      </span>

      <span className="footer-copyright">
        © 2026 — Built for warriors who code under pressure.
      </span>

      <div className="footer-links">
        {['Privacy', 'Terms', 'Contact'].map(item => (
          <span key={item} className="footer-link">{item}</span>
        ))}
      </div>

      <style>{`
        .footer { padding: 2rem 2.5rem; border-top: 1px solid #1a1a1a; background: #111; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-family: Inter, sans-serif; }
        .footer-logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 16px; cursor: pointer; letter-spacing: -0.5px; }
        .footer-copyright { font-size: 12px; color: #333; }
        .footer-links { display: flex; gap: 20px; }
        .footer-link { font-size: 12px; color: #444; cursor: pointer; transition: color 0.2s; }
        .footer-link:hover { color: #ff6b35; }

        @media (max-width: 600px) {
          .footer { flex-direction: column; text-align: center; padding: 2rem 1.5rem; gap: 20px; }
        }
      `}</style>
    </footer>
  )
}