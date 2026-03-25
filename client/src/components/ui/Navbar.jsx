import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (href) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/')
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 300)
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
  }

  const isLoggedIn = !!localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <span onClick={() => navigate('/')} className="logo">
          <span style={{ color: '#ff6b35' }}>Code</span>
          <span style={{ color: '#fff' }}>Arena</span>
        </span>

        {/* Desktop Nav */}
        <div className="nav-links desktop-only">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Leaderboard', href: '/leaderboard' },
          ].map(({ label, href }) => (
            <span key={label} onClick={() => handleNavClick(href)} className="nav-link">{label}</span>
          ))}
        </div>

        <div className="nav-actions desktop-only">
          {isLoggedIn ? (
            <>
              <span onClick={() => navigate('/profile')} className="profile-btn" title="View Profile">
                {(user?.username || 'P').slice(0, 2).toUpperCase()}
              </span>
              <button onClick={() => navigate('/lobby')} className="btn-primary">⚡ Enter Arena</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/auth')} className="btn-secondary">Log In</button>
              <button onClick={() => navigate('/lobby')} className="btn-primary">Enter Arena</button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="mobile-only menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✖' : '☰'}
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
           {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'Leaderboard', href: '/leaderboard' },
          ].map(({ label, href }) => (
            <span key={label} onClick={() => handleNavClick(href)} className="nav-link">{label}</span>
          ))}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
             <button onClick={() => navigate('/lobby')} className="btn-primary">⚡ Enter Arena</button>
          </div>
        </div>
      )}

      <style>{`
        .navbar {
          position: fixed; top: 0; width: 100%; z-index: 100;
          background: rgba(13,13,13,0.7); backdrop-filter: blur(20px);
          border-bottom: 1px solid transparent;
          display: flex; justify-content: space-between; align-items: center;
          padding: 0 32px; height: 60px; transition: all 0.3s;
          font-family: Inter, sans-serif;
        }
        .navbar.scrolled { background: rgba(13,13,13,0.97); border-bottom: 1px solid #1f1f1f; }
        .logo { font-family: Outfit, sans-serif; font-weight: 900; font-size: 20px; letter-spacing: -0.5px; cursor: pointer; }
        .nav-links { display: flex; gap: 32px; align-items: center; }
        .nav-actions { display: flex; gap: 10px; align-items: center; }
        .nav-link { color: #666; font-size: 13px; font-weight: 500; cursor: pointer; transition: color 0.2s; }
        .nav-link:hover { color: #e5e5e5; }
        .btn-primary { font-family: Inter; font-size: 13px; font-weight: 700; color: #fff; background: linear-gradient(135deg, #ff6b35, #f7451d); border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-secondary { font-family: Inter; font-size: 13px; font-weight: 600; color: #e5e5e5; background: transparent; border: 1px solid #2a2a2a; padding: 8px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { border-color: #ff6b35; color: #ff6b35; }
        .profile-btn { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #ff6b35, #f7451d); display: flex; align-items: center; justify-content: center; font-family: Outfit, sans-serif; font-weight: 800; font-size: 13px; color: #fff; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
        .profile-btn:hover { border-color: #ff6b35; }
        .mobile-only { display: none; }
        .menu-icon { color: #fff; font-size: 24px; cursor: pointer; }
        .mobile-menu { position: fixed; top: 60px; left: 0; width: 100%; background: #0d0d0d; padding: 20px; display: flex; flex-direction: column; gap: 15px; border-bottom: 1px solid #1f1f1f; z-index: 99; }
        
        @media (max-width: 768px) {
          .navbar { padding: 0 20px; }
          .desktop-only { display: none; }
          .mobile-only { display: block; }
        }
      `}</style>
    </>
  )
}