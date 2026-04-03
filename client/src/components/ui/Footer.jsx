import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="footer">
      <span onClick={() => navigate('/')} className="footer-logo">
        <span style={{ color: '#ff6b35' }}>Code</span>
        <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,107,53,0.3)' }}>Arena</span>
      </span>

      <span className="footer-copyright">
        © 2026 — Built with blood & sweat by warriors who code under pressure.
      </span>

      <div className="footer-links">
        {/* ✅ Navigation links are now fully functional */}
        {['Privacy', 'Terms', 'Contact'].map(item => (
          <span 
            key={item} 
            onClick={() => navigate(`/${item.toLowerCase()}`)} 
            className="footer-link"
          >
            {item}
          </span>
        ))}
      </div>

      <style>{`
        /* Desktop Layout: 3 equal sections to keep text perfectly centered */
        .footer { 
          padding: 2.5rem 2.5rem; 
          border-top: 1px solid rgba(255,107,53,0.1); 
          background: #0F0F0F; 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          gap: 20px; 
          font-family: Inter, sans-serif; 
          box-shadow: 0 -15px 40px rgba(0,0,0,0.5); 
        }
        
        .footer-logo { 
          font-family: Outfit, sans-serif; 
          font-weight: 900; 
          font-size: 16px; 
          cursor: pointer; 
          letter-spacing: -0.5px;
          flex: 1; /* Takes up 1 part of the space */
          display: flex;
          justify-content: flex-start;
        }
        
        .footer-copyright { 
          font-size: 12px; 
          color: #888; 
          font-weight: 500; 
          text-align: center;
          flex: 2; /* Takes up middle space */
          line-height: 1.5;
        }
        
        .footer-links { 
          display: flex; 
          gap: 20px; 
          flex: 1; /* Takes up 1 part of the space */
          justify-content: flex-end; /* Pushes links to the right */
        }
        
        .footer-link { 
          font-size: 12px; 
          color: #A0A0A0; 
          font-weight: 600; 
          cursor: pointer; 
          transition: all 0.2s; 
          border-bottom: 1px solid transparent; 
        }
        .footer-link:hover { 
          color: #ff6b35; 
          border-color: rgba(255,107,53,0.5); 
          text-shadow: 0 0 10px rgba(255,107,53,0.3); 
        }

        /* Responsive Layout: Tablets & Mobile */
        @media (max-width: 900px) {
          .footer { 
            flex-direction: column; 
            text-align: center; 
            padding: 2rem 1.5rem; 
            gap: 20px; 
          }
          
          .footer-logo {
            justify-content: center;
            flex: auto;
          }

          .footer-copyright {
            flex: auto;
            max-width: 300px;
            margin: 0 auto;
          }

          .footer-links {
            justify-content: center; /* Perfectly centers the links on mobile */
            flex: auto;
            width: 100%;
            flex-wrap: wrap; /* Allows links to wrap if screen is extremely tiny */
            gap: 24px;
          }
        }
        
        /* For extremely small screens */
        @media (max-width: 400px) {
          .footer-links { gap: 16px; }
          .footer-copyright { font-size: 11px; }
        }
      `}</style>
    </footer>
  )
}