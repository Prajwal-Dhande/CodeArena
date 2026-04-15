import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_URL from '../config/api'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const otpRefs = useRef([])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Handle GitHub OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setOauthLoading('github')
      fetch(`${API_URL}/api/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
        .then(r => r.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            navigate('/')
          } else {
            setError(data.message || 'GitHub login failed')
            setOauthLoading('')
          }
        })
        .catch(() => {
          setError('GitHub authentication failed')
          setOauthLoading('')
        })
    }
  }, [searchParams, navigate])

  // Load Google Identity Services
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

  // Initialize Google Sign-In
  const handleGoogleLogin = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google OAuth not configured. Add VITE_GOOGLE_CLIENT_ID to your .env')
      return
    }
    if (!window.google) {
      setError('Google services still loading. Try again.')
      return
    }
    setOauthLoading('google')
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
          })
          const data = await res.json()
          if (data.token) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            navigate('/')
          } else {
            setError(data.message || 'Google login failed')
            setOauthLoading('')
          }
        } catch {
          setError('Google authentication failed')
          setOauthLoading('')
        }
      }
    })
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: use popup
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-fallback'),
          { theme: 'filled_black', size: 'large', width: '100%' }
        )
        document.getElementById('google-signin-fallback')?.querySelector('div[role="button"]')?.click()
        setOauthLoading('')
      }
    })
  }, [navigate])

  const handleGithubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      setError('GitHub OAuth not configured. Add VITE_GITHUB_CLIENT_ID to your .env')
      return
    }
    setOauthLoading('github')
    const redirectUri = encodeURIComponent(window.location.origin + '/auth')
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`
  }

  useEffect(() => {
    if (step !== 'otp') return
    setTimer(60)
    setCanResend(false)
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setError('Please fill all fields')
    if (mode === 'signup' && !form.username) return setError('Username is required')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')

    setLoading(true)
    setError('')

    try {
      const endpoint = mode === 'signup' ? `${API_URL}/api/auth/signup` : `${API_URL}/api/auth/login`
      const body = mode === 'signup'
        ? { username: form.username, email: form.email, password: form.password }
        : { email: form.email, password: form.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        setLoading(false)
        return
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
        return
      }

      setLoading(false)
      setStep('otp')
      setEmailSent(data.emailSent || false)
    } catch {
      setError('Server not reachable. Is backend running?')
      setLoading(false)
    }
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val.slice(-1)
    setOtp(newOtp)
    setError('')
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (paste.length === 6) { setOtp(paste.split('')); otpRefs.current[5]?.focus() }
    e.preventDefault()
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) return setError('Enter complete 6-digit OTP')

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: code })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Invalid OTP')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
        setLoading(false)
        return
      }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch {
      setError('Server not reachable')
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (!canResend) return
    setOtp(['', '', '', '', '', ''])
    setError('')
    setTimer(60)
    setCanResend(false)
    otpRefs.current[0]?.focus()
    try {
      const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      })
      const data = await res.json()
      setEmailSent(data.emailSent || false)
    } catch { console.error('Resend failed') }

    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0 }
        return t - 1
      })
    }, 1000)
  }

  // Show loading overlay for OAuth
  if (oauthLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0f',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 20, fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(255,107,53,0.2)', borderTopColor: '#ff6b35',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: '#888', fontSize: 14 }}>
          {oauthLoading === 'google' ? 'Connecting with Google...' : 'Connecting with GitHub...'}
        </p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div className="auth-wrapper">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <span className="logo-icon">⚡</span>
            <span><span style={{ color: '#ff6b35' }}>Code</span><span style={{ color: '#fff' }}>Arena</span></span>
          </div>

          <h1 className="auth-headline">
            Code smarter.<br />
            <span className="gradient-text">Battle harder.</span>
          </h1>

          <p className="auth-tagline">
            Real-time 1v1 DSA battles with AI-powered constraint injection.
            The most intense coding arena on the web.
          </p>

          <div className="feature-list">
            {[
              { icon: '⚡', text: 'Sub-100ms real-time sync', sub: 'Socket.io powered' },
              { icon: '🤖', text: 'AI constraint injection', sub: 'LLM mid-battle analysis' },
              { icon: '🔒', text: 'Sandboxed execution', sub: 'Docker isolated runner' },
              { icon: '📊', text: 'Live ELO ranking', sub: 'Skill-based matchmaking' },
            ].map(({ icon, text, sub }) => (
              <div key={text} className="feature-item">
                <div className="feature-icon">{icon}</div>
                <div>
                  <div className="feature-text">{text}</div>
                  <div className="feature-sub">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="stats-row">
            {[['2.4K+', 'Battles today'], ['500+', 'Problems'], ['98ms', 'Avg latency']].map(([val, label]) => (
              <div key={label} className="stat-item">
                <div className="stat-val">{val}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Glass Card */}
      <div className="auth-right">
        <div className="glass-card">
          {step === 'form' ? (
            <>
              {/* Mode Toggle */}
              <div className="mode-toggle">
                {['login', 'signup'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError('') }}
                    className={`mode-btn ${mode === m ? 'active' : ''}`}>
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              <h2 className="card-title">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="card-subtitle">
                {mode === 'login' ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
              </p>

              {/* OAuth Buttons */}
              <div className="oauth-buttons">
                <button className="oauth-btn" onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button className="oauth-btn" onClick={handleGithubLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#e5e5e5">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              {/* Hidden fallback for Google button */}
              <div id="google-signin-fallback" style={{ display: 'none' }} />

              <div className="divider">
                <span className="divider-line" />
                <span className="divider-text">or with email</span>
                <span className="divider-line" />
              </div>

              {/* Form Fields */}
              {mode === 'signup' && (
                <div className="field">
                  <label className="field-label">USERNAME</label>
                  <input name="username" placeholder="e.g. codekiller99"
                    value={form.username} onChange={handleChange}
                    className={`glass-input ${form.username ? 'has-value' : ''}`}
                  />
                </div>
              )}

              <div className="field">
                <label className="field-label">EMAIL</label>
                <input name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  className={`glass-input ${form.email ? 'has-value' : ''}`}
                />
              </div>

              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label className="field-label" style={{ margin: 0 }}>PASSWORD</label>
                  {mode === 'login' && (
                    <span className="forgot-link">Forgot password?</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange}
                    className={`glass-input ${form.password ? 'has-value' : ''}`}
                    style={{ paddingRight: 44 }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  <button onClick={() => setShowPass(s => !s)} className="toggle-pass">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && <div className="error-box">⚠ {error}</div>}

              <button onClick={handleSubmit} disabled={loading} className={`submit-btn ${loading ? 'disabled' : ''}`}>
                {loading ? '⟳  Sending OTP...' : mode === 'login' ? '⚡  Continue' : '🚀  Create Account'}
              </button>

              <p className="switch-text">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                  className="switch-link">
                  {mode === 'login' ? 'Sign up free' : 'Log in'}
                </span>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setError('') }}
                className="back-btn">← Back</button>

              <div className={`otp-icon-box ${emailSent ? 'green' : 'orange'}`}>
                {emailSent ? '✉️' : '📧'}
              </div>

              <h2 className="card-title">Check your email</h2>
              <p className="card-subtitle" style={{ marginBottom: 4 }}>
                {emailSent ? 'We sent a 6-digit OTP to' : 'OTP generated for'}
              </p>
              <p style={{ fontSize: 14, color: '#ff6b35', fontWeight: 600, marginBottom: 16 }}>
                {form.email}
              </p>

              {emailSent ? (
                <div className="info-box green">✓ Email sent! Check your inbox and spam folder.</div>
              ) : (
                <div className="info-box orange">⚡ Email service unavailable. Check server terminal for OTP.</div>
              )}

              <div className="otp-row" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    className={`otp-input ${digit ? 'filled' : ''}`}
                  />
                ))}
              </div>

              {error && <div className="error-box">⚠ {error}</div>}

              <button onClick={verifyOtp} disabled={loading || otp.join('').length < 6}
                className={`submit-btn ${(loading || otp.join('').length < 6) ? 'disabled' : ''}`}
                style={{ marginBottom: 18 }}>
                {loading ? '⟳  Verifying...' : '✓  Verify & Enter Arena'}
              </button>

              <div style={{ textAlign: 'center' }}>
                {canResend ? (
                  <span onClick={resendOtp} className="resend-link">↺ Resend OTP</span>
                ) : (
                  <span className="resend-timer">
                    Resend in <span style={{ color: '#ff6b35', fontWeight: 700 }}>{timer}s</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@700;800;900&display=swap');

        .auth-wrapper {
          min-height: 100vh;
          display: flex;
          font-family: Inter, sans-serif;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #09090b 0%, #161622 50%, #09090b 100%);
        }

        /* ====== ANIMATED BACKGROUND ====== */
        .auth-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.65;
          animation: orbFloat 15s infinite alternate ease-in-out;
        }
        .orb-1 {
          width: 550px; height: 550px;
          background: linear-gradient(to right, #ff6b35, #f97316);
          top: -20%; right: -10%;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 450px; height: 450px;
          background: linear-gradient(to right, #a855f7, #6366f1);
          bottom: -20%; left: -10%;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 350px; height: 350px;
          background: linear-gradient(to right, #0ea5e9, #38bdf8);
          top: 30%; left: 35%;
          animation-delay: -6s;
          opacity: 0.45;
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 50px 50px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 90%);
        }

        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, 40px) scale(1.1); }
          100% { transform: translate(-20px, -20px) scale(0.9); }
        }

        /* ====== LEFT PANEL ====== */
        .auth-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 80px;
          position: relative;
          z-index: 1;
        }
        .auth-left-content { position: relative; z-index: 2; }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: Outfit, sans-serif;
          font-weight: 900;
          font-size: 24px;
          margin-bottom: 48px;
          letter-spacing: -0.5px;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.05));
          border: 1px solid rgba(255,107,53,0.3);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .auth-headline {
          font-family: Outfit, sans-serif;
          font-weight: 900;
          font-size: 48px;
          line-height: 1.08;
          color: #fff;
          margin: 0 0 20px;
          letter-spacing: -2px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #ff6b35, #f7451d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .auth-tagline {
          font-size: 15px;
          color: rgba(255,255,255,0.4);
          line-height: 1.8;
          max-width: 380px;
          margin-bottom: 40px;
        }

        .feature-list { display: flex; flex-direction: column; gap: 14px; }
        .feature-item { display: flex; align-items: center; gap: 14px; }
        .feature-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        .feature-text { font-size: 13px; color: #e5e5e5; font-weight: 600; }
        .feature-sub { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 1px; }

        .stats-row {
          display: flex;
          gap: 36px;
          margin-top: 44px;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .stat-val { font-family: Outfit; font-weight: 900; font-size: 24px; color: #ff6b35; }
        .stat-label { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 3px; font-weight: 500; }

        /* ====== RIGHT PANEL ====== */
        .auth-right {
          width: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          z-index: 1;
        }
        
        .auth-right::before {
          content: '';
          position: absolute;
          top: 30%; left: 30%;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 60%);
          filter: blur(50px);
          z-index: 0;
          border-radius: 50%;
        }

        /* ====== GLASS CARD ====== */
        .glass-card {
           width: 100%;
          padding: 40px 32px;
          background: rgba(20, 20, 28, 0.4); /* Highly transparent for glass effect */
          backdrop-filter: blur(28px) saturate(160%); /* Very strong frost and saturation */
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          box-shadow:
            0 40px 80px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .glass-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,107,53,0.8), transparent);
        }

        /* ====== MODE TOGGLE ====== */
        .mode-toggle {
          display: flex;
          background: rgba(255,255,255,0.04);
          border-radius: 14px;
          padding: 4px;
          margin-bottom: 32px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .mode-btn {
          flex: 1;
          padding: 12px 0;
          font-size: 13px;
          font-weight: 600;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: Inter;
        }
        .mode-btn.active {
          background: linear-gradient(135deg, #ff6b35, #f7451d);
          color: #fff;
          box-shadow: 0 4px 15px rgba(255,107,53,0.35);
        }

        .card-title {
          font-family: Outfit;
          font-weight: 800;
          font-size: 26px;
          color: #fff;
          margin: 0 0 8px;
          letter-spacing: -0.5px;
        }
        .card-subtitle {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
          margin: 0 0 28px;
        }

        /* ====== OAUTH BUTTONS ====== */
        .oauth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .oauth-btn {
          width: 100%;
          padding: 14px 0;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: Inter;
          border-radius: 14px;
          transition: all 0.3s;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .oauth-btn svg { fill: #fff; }
        .oauth-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,107,53,0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255,107,53,0.15);
        }

        /* ====== DIVIDER ====== */
        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .divider-text { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

        /* ====== FORM FIELDS ====== */
        .field { margin-bottom: 18px; }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .glass-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 15px;
          color: #fff;
          outline: none;
          transition: all 0.3s;
          font-family: Inter;
          box-sizing: border-box;
        }
        .glass-input::placeholder {
          color: rgba(255,255,255,0.25);
        }
        .glass-input:focus {
          border-color: rgba(255,107,53,0.7);
          background: rgba(255,107,53,0.05);
          box-shadow: 0 0 0 4px rgba(255,107,53,0.1);
        }
        .glass-input.has-value {
          border-color: rgba(255,107,53,0.4);
        }

        .toggle-pass {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.4);
          font-size: 16px;
          padding: 0;
        }

        .forgot-link {
          font-size: 11px;
          color: #ff6b35;
          cursor: pointer;
          font-weight: 600;
        }
        .forgot-link:hover { text-decoration: underline; }

        /* ====== ERROR ====== */
        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 20px;
        }

        /* ====== SUBMIT BUTTON ====== */
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff6b35, #f7451d);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 15px 0;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          letter-spacing: 0.5px;
          font-family: Inter;
          box-shadow: 0 4px 20px rgba(255,107,53,0.3);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.4s;
        }
        .submit-btn:hover:not(.disabled)::before { left: 100%; }
        .submit-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(255,107,53,0.4);
        }
        .submit-btn.disabled {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.3);
          box-shadow: none;
          cursor: not-allowed;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .switch-text { text-align: center; font-size: 14px; color: rgba(255,255,255,0.4); margin-top: 24px; }
        .switch-link { color: #ff6b35; cursor: pointer; font-weight: 700; transition: opacity 0.2s; }
        .switch-link:hover { opacity: 0.8; }

        /* ====== OTP ====== */
        .back-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          font-family: Inter;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #ff6b35; }

        .otp-icon-box {
          width: 64px; height: 64px;
          border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          margin-bottom: 24px;
        }
        .otp-icon-box.green {
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
        }
        .otp-icon-box.orange {
          background: rgba(255,107,53,0.15);
          border: 1px solid rgba(255,107,53,0.3);
        }

        .info-box {
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          margin-bottom: 28px;
        }
        .info-box.green {
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.25);
          color: #4ade80;
        }
        .info-box.orange {
          background: rgba(251,146,60,0.08);
          border: 1px solid rgba(251,146,60,0.25);
          color: #fb923c;
        }

        .otp-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          justify-content: center;
        }
        .otp-input {
          width: 54px; height: 64px;
          text-align: center;
          font-size: 26px;
          font-weight: 800;
          font-family: Outfit;
          background: rgba(255,255,255,0.04);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          color: #fff;
          outline: none;
          transition: all 0.2s;
        }
        .otp-input:focus {
          border-color: #ff6b35;
          box-shadow: 0 0 0 4px rgba(255,107,53,0.15);
          background: rgba(255,107,53,0.05);
        }
        .otp-input.filled {
          border-color: #ff6b35;
        }

        .resend-link { font-size: 14px; color: #ff6b35; cursor: pointer; font-weight: 700; }
        .resend-link:hover { text-decoration: underline; }
        .resend-timer { font-size: 14px; color: rgba(255,255,255,0.4); }

        /* ====== RESPONSIVE ====== */
        @media (max-width: 900px) {
          .auth-wrapper { flex-direction: column; }
          .auth-left { padding: 40px 28px 20px; }
          .auth-headline { font-size: 32px; }
          .feature-list { display: none; }
          .stats-row { display: none; }
          .auth-right { width: 100%; padding: 0 20px 40px; }
        }
      `}</style>
    </div>
  )
}