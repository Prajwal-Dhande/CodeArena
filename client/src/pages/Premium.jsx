import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import API_URL from '../config/api'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: '/mo',
    desc: 'For coders who are just starting out.',
    color: '#71717a',
    glow: 'rgba(113,113,122,0.1)',
    border: 'rgba(113,113,122,0.2)',
    features: [
      { label: 'Unlimited Practice Problems', included: true },
      { label: 'Basic IDE & Code Execution', included: true },
      { label: 'Global Leaderboard Access', included: true },
      { label: 'ELO Rating System', included: true },
      { label: 'AI Mock Interviews (Clara)', included: false },
      { label: 'Ranked Tournaments', included: false },
      { label: 'Company-Specific Problem Tags', included: false },
      { label: 'AI Code Review on Submission', included: false },
    ],
    btnLabel: 'Current Plan',
    btnStyle: 'free',
    disabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 299,
    priceLabel: '₹299',
    period: '/mo',
    desc: 'For serious competitive programmers.',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.12)',
    border: 'rgba(96,165,250,0.35)',
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'Ranked Tournaments Access', included: true },
      { label: 'Company-Specific Problem Tags', included: true },
      { label: 'Advanced Performance Analytics', included: true },
      { label: 'Priority Matchmaking Servers', included: true },
      { label: 'AI Mock Interviews (Clara)', included: false },
      { label: 'AI Code Review on Submission', included: false },
      { label: '1-on-1 Feedback Reports', included: false },
    ],
    btnLabel: 'Upgrade to Pro',
    btnStyle: 'pro',
    disabled: false,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    price: 599,
    priceLabel: '₹599',
    period: '/mo',
    desc: 'The complete FAANG interview arsenal.',
    color: '#ff6b35',
    glow: 'rgba(255,107,53,0.15)',
    border: 'rgba(255,107,53,0.5)',
    popular: true,
    features: [
      { label: 'Everything in Pro', included: true },
      { label: '⚡ Live AI Mock Interviews (Clara)', included: true, highlight: true },
      { label: '🧠 AI Code Review on Submission', included: true, highlight: true },
      { label: '1-on-1 Detailed Feedback Reports', included: true, highlight: true },
      { label: 'Zero-Latency Priority Servers', included: true },
      { label: 'Exclusive FAANG Vault Problems', included: true },
      { label: 'Early Access to New Features', included: true },
      { label: 'Premium Discord Community', included: true },
    ],
    btnLabel: 'Unlock Pro+',
    btnStyle: 'pro_plus',
    disabled: false,
  },
]

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const CROSS = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function Premium() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [processing, setProcessing] = useState(null) // which plan is being paid
  const [premiumStatus, setPremiumStatus] = useState(null)
  const initials = (user?.username || 'PL').slice(0, 2).toUpperCase()

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    // Fetch live premium status from backend
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_URL}/api/payment/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setPremiumStatus(data)
        if (data.isPremium) {
          const updatedUser = { ...user, isPremium: true, premiumPlan: data.premiumPlan || 'pro' }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      })
      .catch(() => {})
  }, [])

  const handlePayment = async (plan) => {
    if (plan.disabled || plan.id === 'free') return
    const token = localStorage.getItem('token')
    if (!token) { navigate('/auth'); return }

    setProcessing(plan.id)
    try {
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id, amount: plan.price * 100 })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Order creation failed')

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: 'INR',
        name: 'CodeArena',
        description: `${plan.name} Premium Subscription`,
        order_id: data.order.id,
        handler: async (response) => {
          const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(response)
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            localStorage.setItem('user', JSON.stringify(verifyData.user))
            setUser(verifyData.user)
            setPremiumStatus({ isPremium: true })
          } else {
            alert(verifyData.message || 'Payment verification failed.')
          }
        },
        prefill: { name: user?.username || '', email: user?.email || '' },
        theme: { color: plan.color },
        modal: { ondismiss: () => setProcessing(null) }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert('Payment failed: ' + err.message)
    } finally {
      setProcessing(null)
    }
  }

  const isPremiumUser = user?.isPremium || premiumStatus?.isPremium
  const currentPlan = user?.premiumPlan || premiumStatus?.premiumPlan || 'free'
  const isProUser = currentPlan === 'pro'
  const isProPlusUser = currentPlan === 'pro_plus'

  return (
    <div style={{ minHeight: '100vh', background: '#060608', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* AMBIENT BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* NAV */}
      <nav style={{ height: 60, background: 'rgba(10,10,12,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)' }}>
        <span style={{ fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: 32 }} onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35', marginRight: 6 }}>{'{C}'}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>CodeArena</span>
        </span>
        <div style={{ display: 'flex', gap: 24, flex: 1 }}>
          {[
            { label: 'Dashboard', path: '/' },
            { label: 'Practice', path: '/lobby' },
            { label: 'Leaderboard', path: '/leaderboard' },
            { label: 'Profile', path: '/profile' },
          ].map(item => (
            <span key={item.label} onClick={() => navigate(item.path)} style={{ fontSize: 13, fontWeight: 600, color: '#a1a1aa', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#a1a1aa'}>
              {item.label}
            </span>
          ))}
          <span style={{ fontSize: 13, fontWeight: 600, color: '#ff6b35' }}>💎 Premium</span>
        </div>
        <div onClick={() => navigate('/profile')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '4px 14px 4px 10px', cursor: 'pointer' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{initials}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{user?.username || 'Player'}</span>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* SUCCESS BANNER */}
        {isPremiumUser && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 16, padding: '20px 28px', marginBottom: 48, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 36 }}>🎉</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#22c55e', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>You're a Premium Member!</div>
              <div style={{ fontSize: 13, color: '#86efac' }}>
                {premiumStatus?.daysLeft ? `${premiumStatus.daysLeft} days remaining in your subscription.` : 'Your premium access is active.'}
                {' '}<span style={{ color: '#22c55e', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/interview-dsa')}>Go to AI Interview →</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-block', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 11, fontWeight: 800, letterSpacing: 2, padding: '6px 18px', borderRadius: 20, marginBottom: 24 }}>
            💎 CODEARENA PREMIUM
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 56, fontWeight: 900, color: '#fff', margin: '0 0 20px 0', letterSpacing: '-2px', lineHeight: 1.1 }}>
            The fastest path to<br />
            <span style={{ background: 'linear-gradient(135deg, #ff6b35, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>crack FAANG</span>
          </h1>
          <p style={{ fontSize: 18, color: '#71717a', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Stop practicing blindly. Get AI-powered mock interviews with Clara, structured analytics, and MAANG-level feedback — all in one platform.
          </p>
        </motion.div>

        {/* PRICING CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              style={{
                position: 'relative',
                background: plan.popular
                  ? `linear-gradient(180deg, ${plan.glow} 0%, rgba(10,10,12,0.95) 50%)`
                  : `linear-gradient(180deg, ${plan.glow} 0%, rgba(10,10,12,0.95) 40%)`,
                border: `1px solid ${plan.border}`,
                borderRadius: 24,
                padding: '36px 28px 32px',
                display: 'flex',
                flexDirection: 'column',
                transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                boxShadow: plan.popular ? `0 24px 60px ${plan.glow}, 0 0 0 1px ${plan.border}` : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default',
              }}
              whileHover={!plan.disabled ? { scale: plan.popular ? 1.05 : 1.02, transition: { duration: 0.2 } } : {}}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff',
                  fontSize: 10, fontWeight: 800, padding: '6px 18px', borderRadius: 20,
                  letterSpacing: 1.5, boxShadow: '0 4px 16px rgba(255,107,53,0.5)', whiteSpace: 'nowrap'
                }}>MOST POPULAR</div>
              )}

              {/* Plan Name */}
              <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, letterSpacing: 1, marginBottom: 8 }}>{plan.name.toUpperCase()}</div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-2px' }}>{plan.priceLabel}</span>
                <span style={{ fontSize: 14, color: '#52525b', fontWeight: 600 }}>{plan.period}</span>
              </div>

              <p style={{ fontSize: 13, color: '#71717a', marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: f.included ? 1 : 0.4 }}>
                    <span style={{ flexShrink: 0, marginTop: 1 }}>{f.included ? CHECK : CROSS}</span>
                    <span style={{
                      fontSize: 13, color: f.included ? (f.highlight ? plan.color : '#d4d4d8') : '#52525b',
                      fontWeight: f.highlight ? 700 : 500, lineHeight: 1.4
                    }}>{f.label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePayment(plan)}
                disabled={plan.disabled || processing === plan.id || (plan.id === 'pro' && (isProUser || isProPlusUser)) || (plan.id === 'pro_plus' && isProPlusUser)}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  cursor: (plan.disabled || isPremiumUser) ? 'not-allowed' : 'pointer',
                  border: 'none',
                  transition: 'all 0.25s',
                  ...(plan.btnStyle === 'free'
                    ? { background: 'rgba(255,255,255,0.04)', color: '#52525b', border: '1px solid rgba(255,255,255,0.08)' }
                    : plan.btnStyle === 'pro'
                      ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }
                      : { background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', boxShadow: '0 8px 24px rgba(255,107,53,0.35)' }
                  ),
                  opacity: (plan.disabled || (isPremiumUser && plan.id !== 'free')) ? 0.5 : 1,
                }}
              >
                {processing === plan.id
                  ? '⏳ Processing...'
                  : plan.id === 'free'
                    ? 'Current Plan'
                    : plan.id === 'pro' && (isProUser || isProPlusUser)
                      ? '✓ Active'
                      : plan.id === 'pro_plus' && isProPlusUser
                        ? '✓ Active'
                        : plan.id === 'pro_plus' && isProUser
                          ? '⬆ Upgrade to Pro+'
                          : plan.btnLabel}
              </button>
            </motion.div>
          ))}
        </div>

        {/* WHY PREMIUM SECTION */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ marginTop: 80 }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Why go Premium?</h2>
          <p style={{ textAlign: 'center', color: '#71717a', marginBottom: 48, fontSize: 15 }}>Real features. Real results. Real offers.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🤖', title: 'Clara AI Interviewer', desc: 'Practice with an AI trained to behave exactly like a MAANG interviewer. Get hints, feedback, and code review in real-time.' },
              { icon: '📊', title: 'Deep Code Analytics', desc: 'After every submission, get time & space complexity analysis, edge case reports, and comparisons to optimal solutions.' },
              { icon: '🏆', title: 'Exclusive Ranked Tournaments', desc: 'Enter weekly & monthly tournaments exclusively for Pro members. Top performers get certificates and shoutouts.' },
              { icon: '🔐', title: 'FAANG Vault Problems', desc: 'Access 200+ exclusive problems tagged by company, difficulty, and interview round — real problems, real prep.' },
              { icon: '⚡', title: 'Zero-Latency Servers', desc: 'Code executes on priority servers with 3x faster response times. Never lose a ranked battle to lag again.' },
              { icon: '🗺️', title: 'Personalized Roadmap', desc: 'Your AI roadmap adapts to your ELO, weak topics, and target company. Know exactly what to practice next.' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 8px 0' }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#71717a', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER CTA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          style={{ textAlign: 'center', marginTop: 80, padding: '48px', background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(96,165,250,0.05))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 12px 0' }}>Start your FAANG journey today</h2>
          <p style={{ color: '#71717a', marginBottom: 28, fontSize: 15 }}>Join hundreds of coders who cracked their dream companies using CodeArena Premium.</p>
          <button onClick={() => handlePayment(PLANS[2])} style={{ background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,107,53,0.35)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(255,107,53,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,53,0.35)' }}>
            ✨ Unlock Pro+ — ₹599/mo
          </button>
          <div style={{ marginTop: 16, fontSize: 12, color: '#52525b' }}>Cancel anytime. Secure payments via Razorpay.</div>
        </motion.div>

      </div>

    </div>
  )
}
