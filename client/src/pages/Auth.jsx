import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const otpRefs = useRef([])
  const navigate = useNavigate()

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
      const endpoint = mode === 'signup'
        ? 'http://localhost:5000/api/auth/signup'
        : 'http://localhost:5000/api/auth/login'

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

      // Login success
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/')
        return
      }

      // Signup — OTP step
      setLoading(false)
      setStep('otp')
      setEmailSent(data.emailSent || false)
      // ✅ Auto-fill bilkul nahi

    } catch (err) {
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
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
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

    } catch (err) {
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
      const res = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      })
      const data = await res.json()
      setEmailSent(data.emailSent || false)
      // ✅ Auto-fill nahi
    } catch (err) {
      console.error('Resend failed')
    }

    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0 }
        return t - 1
      })
    }, 1000)
  }

  const inp = (hasVal) => ({
    width: '100%', background: '#181818',
    border: `1px solid ${hasVal ? '#ff6b35' : '#252525'}`,
    borderRadius: 9, padding: '11px 14px',
    fontSize: 13, color: '#e5e5e5', outline: 'none',
    transition: 'border 0.2s', fontFamily: 'Inter'
  })

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d0d',
      display: 'flex', fontFamily: 'Inter, sans-serif',
      position: 'relative', overflow: 'hidden'
    }}>

      {/* LEFT PANEL */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '60px 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 65%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 900,
            fontSize: 26, letterSpacing: '-0.5px', marginBottom: 52
          }}>
            <span style={{ color: '#ff6b35' }}>Code</span>
            <span style={{ color: '#fff' }}>Arena</span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 800,
            fontSize: 44, lineHeight: 1.1, color: '#fff',
            marginBottom: 16, letterSpacing: '-1.5px'
          }}>
            Code smarter.<br />
            <span style={{
              background: 'linear-gradient(90deg, #ff6b35, #f7451d)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>Battle harder.</span>
          </h1>

          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, maxWidth: 360, marginBottom: 44 }}>
            Real-time 1v1 DSA battles with AI-powered constraint injection. The most intense coding arena on the web.
          </p>

          {[
            { icon: '⚡', text: 'Sub-100ms real-time sync', sub: 'Socket.io powered' },
            { icon: '🤖', text: 'AI constraint injection', sub: 'LLM mid-battle analysis' },
            { icon: '🔒', text: 'Sandboxed execution', sub: 'Docker isolated runner' },
            { icon: '📊', text: 'Live ELO ranking', sub: 'Skill-based matchmaking' },
          ].map(({ icon, text, sub }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0
              }}>{icon}</div>
              <div>
                <div style={{ fontSize: 13, color: '#e5e5e5', fontWeight: 600 }}>{text}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 32, marginTop: 40, paddingTop: 32, borderTop: '1px solid #1f1f1f' }}>
            {[['2.4K+', 'Battles today'], ['500+', 'Problems'], ['98ms', 'Avg latency']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: '#ff6b35' }}>{val}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: 480, background: '#111', borderLeft: '1px solid #1f1f1f',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 44px'
      }}>
        <div style={{ width: '100%' }}>

          {step === 'form' ? (
            <>
              <div style={{
                display: 'flex', background: '#181818',
                borderRadius: 10, padding: 4, marginBottom: 28, border: '1px solid #252525'
              }}>
                {['login', 'signup'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                    flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 600,
                    background: mode === m ? 'linear-gradient(135deg, #ff6b35, #f7451d)' : 'transparent',
                    border: 'none', borderRadius: 8,
                    color: mode === m ? '#fff' : '#555',
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}>{m === 'login' ? 'Log In' : 'Sign Up'}</button>
                ))}
              </div>

              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 4 }}>
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p style={{ fontSize: 12, color: '#555', marginBottom: 24 }}>
                {mode === 'login' ? 'Enter your credentials to continue' : 'Fill in your details to get started'}
              </p>

              {/* Google */}
              <button style={{
                width: '100%', background: '#181818', border: '1px solid #252525', borderRadius: 9,
                padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#e5e5e5', cursor: 'pointer',
                marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.background = '#1e1e1e' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#252525'; e.currentTarget.style.background = '#181818' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              {/* GitHub */}
              <button style={{
                width: '100%', background: '#181818', border: '1px solid #252525', borderRadius: 9,
                padding: '11px 0', fontSize: 13, fontWeight: 600, color: '#e5e5e5', cursor: 'pointer',
                marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff6b35'; e.currentTarget.style.background = '#1e1e1e' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#252525'; e.currentTarget.style.background = '#181818' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e5e5e5">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
                <span style={{ fontSize: 11, color: '#3a3a3a' }}>or with email</span>
                <div style={{ flex: 1, height: 1, background: '#1f1f1f' }} />
              </div>

              {mode === 'signup' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 0.5, marginBottom: 6 }}>USERNAME</label>
                  <input name="username" placeholder="e.g. codekiller99"
                    value={form.username} onChange={handleChange}
                    style={inp(form.username)}
                    onFocus={e => e.target.style.borderColor = '#ff6b35'}
                    onBlur={e => e.target.style.borderColor = form.username ? '#ff6b35' : '#252525'}
                  />
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 0.5, marginBottom: 6 }}>EMAIL</label>
                <input name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  style={inp(form.email)}
                  onFocus={e => e.target.style.borderColor = '#ff6b35'}
                  onBlur={e => e.target.style.borderColor = form.email ? '#ff6b35' : '#252525'}
                />
              </div>

              <div style={{ marginBottom: error ? 12 : 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#555', letterSpacing: 0.5 }}>PASSWORD</label>
                  {mode === 'login' && (
                    <span style={{ fontSize: 11, color: '#ff6b35', cursor: 'pointer' }}>Forgot password?</span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={handleChange}
                    style={{ ...inp(form.password), paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#ff6b35'}
                    onBlur={e => e.target.style.borderColor = form.password ? '#ff6b35' : '#252525'}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                  <button onClick={() => setShowPass(s => !s)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 14, padding: 0
                  }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
                  borderRadius: 7, padding: '9px 12px', fontSize: 12, color: '#ef4444', marginBottom: 16
                }}>⚠ {error}</div>
              )}

              <button onClick={handleSubmit} disabled={loading} style={{
                width: '100%',
                background: loading ? '#1e1e1e' : 'linear-gradient(135deg, #ff6b35, #f7451d)',
                color: loading ? '#555' : '#fff',
                border: loading ? '1px solid #252525' : 'none',
                borderRadius: 9, padding: '12px 0', fontSize: 13, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', letterSpacing: 0.2
              }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {loading ? '⟳  Sending OTP...' : mode === 'login' ? '⚡  Continue' : '🚀  Create Account'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#444', marginTop: 18 }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <span onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
                  style={{ color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}>
                  {mode === 'login' ? 'Sign up free' : 'Log in'}
                </span>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => { setStep('form'); setOtp(['','','','','','']); setError('') }}
                style={{
                  background: 'none', border: 'none', color: '#555', fontSize: 12,
                  cursor: 'pointer', marginBottom: 28,
                  display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: 'Inter'
                }}>
                ← Back
              </button>

              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: emailSent ? 'rgba(34,197,94,0.1)' : 'rgba(255,107,53,0.1)',
                border: `1px solid ${emailSent ? 'rgba(34,197,94,0.2)' : 'rgba(255,107,53,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 20
              }}>
                {emailSent ? '✉️' : '📧'}
              </div>

              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 8 }}>
                Check your email
              </h2>

              <p style={{ fontSize: 13, color: '#666', marginBottom: 4, lineHeight: 1.6 }}>
                {emailSent ? 'We sent a 6-digit OTP to' : 'OTP generated for'}
              </p>
              <p style={{ fontSize: 13, color: '#ff6b35', fontWeight: 600, marginBottom: 16 }}>
                {form.email}
              </p>

              {/* ✅ Status message */}
              {emailSent ? (
                <div style={{
                  background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#22c55e', marginBottom: 24
                }}>
                  ✓ Email sent! Check your inbox and spam folder.
                </div>
              ) : (
                <div style={{
                  background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#fb923c', marginBottom: 24
                }}>
                  ⚡ Email service unavailable. Check server terminal for OTP.
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginBottom: 20, justifyContent: 'center' }}
                onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    style={{
                      width: 52, height: 58, textAlign: 'center',
                      fontSize: 22, fontWeight: 700,
                      background: digit ? 'rgba(255,107,53,0.08)' : '#181818',
                      border: `2px solid ${digit ? '#ff6b35' : '#252525'}`,
                      borderRadius: 10, color: '#fff', outline: 'none',
                      transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif'
                    }}
                    onFocus={e => e.target.style.borderColor = '#ff6b35'}
                    onBlur={e => e.target.style.borderColor = digit ? '#ff6b35' : '#252525'}
                  />
                ))}
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)',
                  borderRadius: 7, padding: '9px 12px', fontSize: 12, color: '#ef4444',
                  marginBottom: 16, textAlign: 'center'
                }}>⚠ {error}</div>
              )}

              <button onClick={verifyOtp} disabled={loading || otp.join('').length < 6} style={{
                width: '100%',
                background: loading || otp.join('').length < 6 ? '#1e1e1e' : 'linear-gradient(135deg, #ff6b35, #f7451d)',
                color: loading || otp.join('').length < 6 ? '#555' : '#fff',
                border: loading || otp.join('').length < 6 ? '1px solid #252525' : 'none',
                borderRadius: 9, padding: '12px 0', fontSize: 13, fontWeight: 700,
                cursor: loading || otp.join('').length < 6 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', marginBottom: 18
              }}>
                {loading ? '⟳  Verifying...' : '✓  Verify & Enter Arena'}
              </button>

              <div style={{ textAlign: 'center' }}>
                {canResend ? (
                  <span onClick={resendOtp} style={{ fontSize: 12, color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}>
                    ↺ Resend OTP
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: '#555' }}>
                    Resend in <span style={{ color: '#ff6b35', fontWeight: 700 }}>{timer}s</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}