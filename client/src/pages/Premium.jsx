import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import API_URL from '../config/api'
import { ThemeToggle } from '../context/ThemeContext'
import { Bot, BarChart, Trophy, Lock, Zap, Map, Puzzle, Crown, Hourglass, Gift, Brain } from 'lucide-react'
const CHECK = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const CROSS = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '₹0',
    period: '/mo',
    desc: 'Jump in and start battling — no commitment needed.',
    color: '#71717a',
    glow: 'rgba(113,113,122,0.08)',
    border: 'rgba(113,113,122,0.2)',
    features: [
      { label: 'Unlimited Random Matches', included: true },
      { label: 'Practice AI Bot', included: true },
      { label: 'Global Leaderboard', included: true },
      { label: 'Create Private Rooms', included: true },
      { label: 'Exclusive The Elite Archive', included: false },
      { label: 'Live AI Interviews (Clara)', included: false },
      { label: 'AI Code Review & Analytics', included: false },
    ],
    btnStyle: 'free',
  },
  {
    id: 'pro_1m',
    name: 'Pro — 1 Month',
    price: 249,
    originalPrice: 399,
    priceLabel: '₹249',
    period: '/mo',
    saveBadge: 'Save 37%',
    desc: 'Full access to every premium feature for 1 month.',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.35)',
    features: [
      { label: 'Exclusive The Elite Archive Problems', included: true },
      { label: <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><Zap size={14} /> Live AI Interviews (Clara)</span>, included: true, highlight: true },
      { label: <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><Brain size={14} /> AI Code Review & Analytics</span>, included: true, highlight: true },
      { label: 'Daily Quests Access', included: true },
      { label: 'Daily Algorithmic Puzzles', included: true },
      { label: 'Priority Matchmaking Servers', included: true },
      { label: 'Premium Discord Community', included: true },
    ],
    btnLabel: 'Get Pro (1 Month)',
    btnStyle: 'pro',
  },
  {
    id: 'pro_6m',
    name: 'Pro — 6 Months',
    price: 1199,
    originalPrice: 2394,
    priceLabel: '₹1,199',
    period: '/6mo',
    perMonth: '~₹199/mo',
    saveBadge: 'Save 50%',
    popular: true,
    desc: 'Best value — lock in 6 months of uninterrupted Pro access.',
    color: '#ff6b35',
    glow: 'rgba(255,107,53,0.12)',
    border: 'rgba(255,107,53,0.5)',
    features: [
      { label: 'Exclusive The Elite Archive Problems', included: true },
      { label: <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><Zap size={14} /> Live AI Interviews (Clara)</span>, included: true, highlight: true },
      { label: <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}><Brain size={14} /> AI Code Review & Analytics</span>, included: true, highlight: true },
      { label: 'Daily Quests Access', included: true },
      { label: 'Daily Algorithmic Puzzles', included: true },
      { label: 'Priority Matchmaking Servers', included: true },
      { label: 'Premium Discord Community', included: true },
      { label: 'Early Access to New Features', included: true },
    ],
    btnLabel: 'Start 7-Day Free Trial',
    btnStyle: 'pro_plus',
  },
]

export default function Premium() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [processing, setProcessing] = useState(null)
  const [premiumStatus, setPremiumStatus] = useState(null)
  const [countdown, setCountdown] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [lastPurchase, setLastPurchase] = useState(null) // { planName, amount, date, expiry }
  const initials = (user?.username || 'PL').slice(0, 2).toUpperCase()
  const [winSize, setWinSize] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const handleResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // FOMO Countdown — resets at midnight each day
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      if (diff <= 0) { setCountdown('00:00:00'); return }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setCountdown(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_URL}/api/payment/status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        setPremiumStatus(data)
        if (data.isPremium) {
          const updatedUser = { ...user, isPremium: true, premiumPlan: data.premiumPlan || 'pro', premiumExpiry: data.premiumExpiry }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        } else if (user?.isPremium) {
          // Fix corrupted local storage
          const updatedUser = { ...user, isPremium: false }
          setUser(updatedUser)
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      })
      .catch(() => {})
  }, [])

  // Trust backend if available, fallback to local storage
  const isPremiumUser = premiumStatus ? premiumStatus.isPremium : user?.isPremium;

  // ── Professional Razorpay-Style Receipt Generator ──
  const generateReceipt = (purchaseInfo) => {
    const { planName, amount, date, expiry, username, email, paymentId, orderId } = purchaseInfo
    const invoiceNo = `CA-${Date.now().toString(36).toUpperCase()}`

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt - ${paymentId || invoiceNo}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px; color: #111; }
        .container { max-width: 750px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border-radius: 8px; border: 1px solid #e2e8f0; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 700; color: #111827; display: flex; align-items: center; gap: 8px; }
        .logo span { color: #ff6b35; }
        .title { font-size: 16px; font-weight: 500; color: #4b5563; }
        
        .table { width: 100%; border-collapse: collapse; }
        .row { border-bottom: 1px solid #f1f5f9; }
        .row:last-child { border-bottom: none; }
        .label { width: 30%; color: #64748b; font-size: 14px; padding: 18px 0; vertical-align: top; }
        .value { width: 70%; font-size: 14px; color: #0f172a; padding: 18px 0; font-weight: 500; line-height: 1.5; }
        
        .blue-link { color: #2563eb; cursor: pointer; text-decoration: none; }
        .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 4px; }
        
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; }
        
        @media print {
            body { background-color: white; padding: 0; }
            .container { box-shadow: none; border: none; padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo"><span style={{ color: '#ff6b35', marginRight: '6px' }}>{'{N}'}</span> NodeClash</div>
            <div class="title">Payment Receipt</div>
        </div>

        <table class="table">
            <tr class="row">
                <td class="label">Payment ID</td>
                <td class="value"><strong>${paymentId || 'pay_XXXXXXXXX'}</strong></td>
            </tr>
            <tr class="row">
                <td class="label">Order ID</td>
                <td class="value"><span class="blue-link">${orderId || 'order_XXXXXXXXX'}</span></td>
            </tr>
            <tr class="row">
                <td class="label">Invoice ID</td>
                <td class="value">${invoiceNo}</td>
            </tr>
            <tr class="row">
                <td class="label">Payment method</td>
                <td class="value">
                    <div style="font-weight: 400;">Online Payment</div>
                    <div style="color: #64748b; margin-top: 4px;">Payer Account Type: Verified</div>
                </td>
            </tr>
            <tr class="row">
                <td class="label">Customer details</td>
                <td class="value" style="font-weight: 400;">
                    <div>👤 ${username}</div>
                    <div>✉️ ${email}</div>
                </td>
            </tr>
            <tr class="row">
                <td class="label">Total Amount</td>
                <td class="value">
                    <div>₹${Number(amount).toLocaleString('en-IN')}.00</div>
                    <div style="color: #64748b; font-weight: 400; font-size: 13px; margin-top: 4px;">Paid at: ${date}</div>
                </td>
            </tr>
            <tr class="row">
                <td class="label">App Name</td>
                <td class="value" style="font-weight: 400;">NodeClash</td>
            </tr>
            <tr class="row">
                <td class="label">Description</td>
                <td class="value" style="font-weight: 400;">${planName} Subscription</td>
            </tr>
            <tr class="row">
                <td class="label">Notes</td>
                <td class="value" style="font-weight: 400;">
                    <strong>username:</strong> ${username}<br>
                    <strong>valid_until:</strong> ${expiry}
                </td>
            </tr>
        </table>

        <div class="footer">
            <p>This is an auto-generated payment receipt for your records.</p>
            <p>Secure payment processed via Razorpay</p>
        </div>
    </div>
    <script>
        setTimeout(() => { window.print(); }, 800);
    </script>
</body>
</html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(htmlContent);
      printWin.document.close();
    } else {
      // Fallback if popup blocked
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NodeClash_Receipt_${invoiceNo}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  const handlePayment = async (plan) => {
    if (plan.id === 'free') return
    const token = localStorage.getItem('token')
    if (!token) { navigate('/auth'); return }

    setProcessing(plan.id)
    try {
      const res = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ planId: plan.id, amount: plan.price * 100, durationMonths: plan.id === 'pro_6m' ? 6 : 1, trialDays: plan.id === 'pro_6m' ? 7 : 0 })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Order creation failed')

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: 'INR',
        name: 'NodeClash',
        description: `${plan.name} Subscription`,
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

            // Confetti celebration
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 6000)

            // Generate + auto-download PDF receipt
            const now = new Date()
            const durationMonths = plan.id === 'pro_6m' ? 6 : 1
            const trialDays = plan.id === 'pro_6m' ? 7 : 0
            const expiryDate = new Date(now)
            expiryDate.setMonth(expiryDate.getMonth() + durationMonths)
            expiryDate.setDate(expiryDate.getDate() + trialDays)
            const purchase = {
              planName: plan.name,
              amount: plan.price,
              date: now.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }),
              expiry: expiryDate.toLocaleDateString('en-IN', { dateStyle: 'long' }),
              username: verifyData.user?.username || user?.username,
              email: verifyData.user?.email || user?.email,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            }
            setLastPurchase(purchase)
            localStorage.setItem('ca_last_receipt', JSON.stringify(purchase))
            generateReceipt(purchase)
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

  const getBtnProps = (plan) => {
    let activePlanId = premiumStatus?.premiumPlan || user?.premiumPlan;
    
    // Auto-fix for UI if activePlanId is somehow 'free' or 'monthly' but user is Premium
    if (isPremiumUser && (!activePlanId || activePlanId === 'free' || activePlanId === 'monthly')) {
      activePlanId = 'pro_1m';
    }
    
    const isActive = isPremiumUser && (activePlanId === plan.id || (activePlanId === 'pro' && plan.id === 'pro_1m'));

    if (plan.id === 'free') {
      return { label: isPremiumUser ? 'Free Tier' : 'Current Plan', disabled: true, isActive: !isPremiumUser };
    }
    
    if (isActive) {
      return { label: '✓ PRO Active', disabled: true, isActive: true };
    }
    
    if (isPremiumUser) {
      return { label: 'Switch Plan', disabled: false, isActive: false };
    }
    
    return { label: plan.btnLabel, disabled: false, isActive: false };
  }

  // Calculate start date if expiry is known
  const getStartDate = (expiryStr, planId) => {
    if (!expiryStr) return 'Unknown';
    const date = new Date(expiryStr);
    if (planId === 'pro_6m') date.setMonth(date.getMonth() - 6);
    else date.setMonth(date.getMonth() - 1);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Inter, sans-serif', overflowX: 'hidden', transition: 'background-color 0.3s ease' }}>

      {/* Confetti Overlay */}
      {showConfetti && <Confetti width={winSize.w} height={winSize.h} recycle={false} numberOfPieces={400} gravity={0.12} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }} />}

      {/* AMBIENT BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255,107,53,0.07) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '40%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* NAV */}
      <nav className="premium-nav" style={{ height: 60, background: 'var(--nav-bg)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', transition: 'background-color 0.3s ease' }}>
        <span style={{ fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: 32, flexShrink: 0 }} onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35', marginRight: '6px' }}>{'{N}'}</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>NodeClash</span>
        </span>
        <div className="premium-nav-links" style={{ display: 'flex', gap: 24, flex: 1, overflow: 'hidden' }}>
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Practice', path: '/lobby' },
            { label: 'Leaderboard', path: '/leaderboard' },
            { label: 'Profile', path: '/profile' },
          ].map(item => (
            <span key={item.label} onClick={() => navigate(item.path)} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-main)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              {item.label}
            </span>
          ))}
          <span style={{ fontSize: 13, fontWeight: 600, color: '#ff6b35', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}><Crown size={14} /> Premium</span>
        </div>
        <ThemeToggle />
        <div onClick={() => navigate('/profile')} className="premium-nav-user" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--glass-overlay)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: '4px 14px 4px 10px', cursor: 'pointer', marginLeft: 16, flexShrink: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{initials}</div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>{user?.username || 'Player'}</span>
        </div>
      </nav>

      <div className="premium-content" style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* SUCCESS / EXPIRY WARNING BANNER */}
        {isPremiumUser && premiumStatus && (() => {
          const daysLeft = premiumStatus?.daysLeft || 0;
          const isExpiring = daysLeft > 0 && daysLeft <= 5;
          const bannerBg = isExpiring
            ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(239,68,68,0.08))'
            : 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))';
          const bannerBorder = isExpiring ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(34,197,94,0.3)';
          const accentColor = isExpiring ? '#f59e0b' : '#22c55e';
          
          const expiryDateStr = premiumStatus?.premiumExpiry || user?.premiumExpiry;
          const activePlanId = premiumStatus?.premiumPlan || user?.premiumPlan;
          const expireFormatted = expiryDateStr ? new Date(expiryDateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';
          const startFormatted = getStartDate(expiryDateStr, activePlanId);

          return (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
              className="premium-banner"
              style={{ background: bannerBg, border: bannerBorder, borderRadius: 16, padding: '20px 28px', marginBottom: 48, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 36 }}>{isExpiring ? '⚠️' : '🎉'}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: accentColor, fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                  {isExpiring ? `Your PRO plan expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!` : "You're a PRO Member!"}
                </div>
                <div style={{ fontSize: 13, color: accentColor, opacity: 0.9, marginBottom: 8 }}>
                  {isExpiring
                    ? <>Renew now to avoid losing access to The Elite Archive. <span style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.scrollTo({ top: document.querySelector('[data-pricing]')?.offsetTop - 80 || 600, behavior: 'smooth' })}>Renew →</span></>
                    : <>{daysLeft > 0 ? `${daysLeft} days remaining.` : 'Your PRO access is active.'} <span style={{ fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/interview-dsa')}>Go to AI Interview →</span></>
                  }
                </div>
                {/* Billing Cycle Details */}
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-main)', opacity: 0.8, background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: 8, width: 'fit-content' }}>
                  <span><strong style={{ color: 'var(--text-muted)' }}>Activated:</strong> {startFormatted}</span>
                  <span><strong style={{ color: 'var(--text-muted)' }}>Expires:</strong> {expireFormatted}</span>
                </div>
              </div>
              {/* Download Receipt */}
              <button onClick={() => {
                const receipt = lastPurchase || JSON.parse(localStorage.getItem('ca_last_receipt') || 'null')
                if (receipt) {
                  generateReceipt(receipt)
                } else {
                  const planName = activePlanId?.includes('6') ? 'PRO — 6 Months' : 'PRO — 1 Month'
                  const amount = activePlanId?.includes('6') ? 4999 : 999
                  generateReceipt({
                    planName,
                    amount,
                    date: startFormatted,
                    expiry: expireFormatted,
                    username: user?.username,
                    email: user?.email,
                  })
                }
              }} style={{
                marginTop: 8, background: 'none', border: `1px solid ${accentColor}44`,
                color: accentColor, fontSize: 12, fontWeight: 700, padding: '6px 14px',
                borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter', transition: 'all 0.2s'
              }}>📄 Download Receipt</button>
            </motion.div>
          )
        })()}

        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontSize: 11, fontWeight: 800, letterSpacing: 2, padding: '6px 18px', borderRadius: 20, marginBottom: 24 }}>
            <Crown size={14} /> NODECLASH PRO
          </div>
          <h1 className="premium-hero-title" style={{ fontFamily: 'Outfit, sans-serif', fontSize: 56, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 20px 0', letterSpacing: '-2px', lineHeight: 1.1 }}>
            The fastest path to<br />
            <span style={{ background: 'linear-gradient(135deg, #ff6b35, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>crack MAANG</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            AI-powered mock interviews, structured analytics, and MAANG-level feedback — one plan, full access.
          </p>
        </motion.div>

        {/* PRICING CARDS */}
        <div data-pricing className="premium-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'stretch' }}>
          {PLANS.map((plan, idx) => {
            const btn = getBtnProps(plan)
            const isDisabled = btn.disabled || processing === plan.id
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                style={{
                  position: 'relative',
                  background: plan.popular
                    ? `linear-gradient(180deg, ${plan.glow} 0%, var(--card-bg) 50%)`
                    : `linear-gradient(180deg, ${plan.glow} 0%, var(--card-bg) 40%)`,
                  border: `1px solid ${plan.border}`,
                  borderRadius: 24,
                  padding: '36px 28px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  transform: plan.popular ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: plan.popular ? `0 24px 60px ${plan.glow}, 0 0 0 1px ${plan.border}` : 'none',
                  cursor: 'default',
                }}
                whileHover={!isDisabled ? { scale: plan.popular ? 1.05 : 1.02, transition: { type: 'tween', duration: 0.05 } } : {}}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff',
                    fontSize: 10, fontWeight: 800, padding: '6px 18px', borderRadius: 20,
                    letterSpacing: 1.5, boxShadow: '0 4px 16px rgba(255,107,53,0.5)', whiteSpace: 'nowrap'
                  }}>MOST POPULAR</div>
                )}

                {/* FOMO Timer Badge */}
                {plan.id !== 'free' && countdown && (
                  <div style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: 10, padding: '6px 14px', marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content'
                  }}>
                    <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}><Hourglass size={14} color="#ef4444" /></span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace', letterSpacing: 0.5 }}>
                      Offer Expires In: {countdown}
                    </span>
                  </div>
                )}

                {/* 7-Day Free Trial Badge (6mo only) */}
                {plan.id === 'pro_6m' && !isPremiumUser && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(255,107,53,0.08))',
                    border: '1px solid rgba(251,191,36,0.3)',
                    borderRadius: 10, padding: '8px 14px', marginBottom: 12,
                    display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content'
                  }}>
                    <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}><Gift size={16} color="#fbbf24" /></span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#fbbf24', letterSpacing: 0.3 }}>Includes 7-Day Free Trial</span>
                  </div>
                )}

                {/* Plan Name + Save Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, letterSpacing: 1 }}>{plan.name.toUpperCase()}</div>
                  {plan.saveBadge && (
                    <span style={{
                      fontSize: 10, fontWeight: 800,
                      background: 'rgba(34,197,94,0.12)', color: '#22c55e',
                      border: '1px solid rgba(34,197,94,0.25)',
                      padding: '3px 8px', borderRadius: 20, letterSpacing: 0.3
                    }}>{plan.saveBadge}</span>
                  )}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  {plan.originalPrice && (
                    <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through', opacity: 0.6, fontFamily: 'Outfit, sans-serif' }}>
                      ₹{plan.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span style={{ fontSize: 48, fontWeight: 900, color: 'var(--text-main)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-2px' }}>{plan.priceLabel}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>{plan.period}</span>
                </div>

                {/* Per-month breakdown */}
                {plan.perMonth && (
                  <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 700, marginBottom: 8 }}>{plan.perMonth}</div>
                )}

                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.5 }}>{plan.desc}</p>

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--glass-border)', marginBottom: 24 }} />

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: f.included ? 1 : 0.6 }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}>{f.included ? CHECK : CROSS}</span>
                      <span style={{
                        fontSize: 13, color: f.included ? (f.highlight ? plan.color : 'var(--text-main)') : 'var(--text-muted)',
                        fontWeight: f.highlight ? 700 : 500, lineHeight: 1.4,
                        textDecoration: f.included ? 'none' : 'line-through'
                      }}>{f.label}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={isDisabled}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    border: 'none',
                    transition: 'all 0.25s',
                    ...(btn.isActive
                      ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)', cursor: 'default' }
                      : plan.btnStyle === 'free'
                      ? { background: 'var(--glass-overlay)', color: 'var(--text-muted)', border: '1px solid var(--glass-border)' }
                      : plan.btnStyle === 'pro'
                        ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }
                        : { background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', boxShadow: '0 8px 24px rgba(255,107,53,0.35)' }
                    ),
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onMouseOver={e => { if (!isDisabled && !btn.isActive) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseOut={e => { if (!isDisabled && !btn.isActive) e.currentTarget.style.transform = 'none' }}
                >
                  {processing === plan.id ? '⏳ Processing...' : btn.label}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* WHY PRO SECTION */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} style={{ marginTop: 80 }}>
          <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>Why go PRO?</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 48, fontSize: 15 }}>Real features. Real results. Real offers.</p>

          <div className="premium-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: <Bot size={28} color="#ff6b35" />, color: '#ff6b35', title: 'Clara AI Interviewer', desc: 'Practice with an AI trained to behave exactly like a MAANG interviewer. Get hints, feedback, and code review in real-time.' },
              { icon: <BarChart size={28} color="#3b82f6" />, color: '#3b82f6', title: 'Deep Code Analytics', desc: 'After every submission, get time & space complexity analysis, edge case reports, and comparisons to optimal solutions.' },
              { icon: <Trophy size={28} color="#eab308" />, color: '#eab308', title: 'Exclusive Daily Quests', desc: 'Get access to unique daily challenges. Build your streak, crack curated MAANG problems, and earn massive ELO bonuses.' },
              { icon: <Lock size={28} color="#a855f7" />, color: '#a855f7', title: 'The Elite Archive Problems', desc: 'Access 200+ exclusive problems tagged by company, difficulty, and interview round — real problems, real prep.' },
              { icon: <Zap size={28} color="#facc15" />, color: '#facc15', title: 'Zero-Latency Servers', desc: 'Code executes on priority servers with 3x faster response times. Never lose a ranked battle to lag again.' },
              { icon: <Map size={28} color="#22c55e" />, color: '#22c55e', title: 'Personalized Roadmap', desc: 'Your AI roadmap adapts to your ELO, weak topics, and target company. Know exactly what to practice next.' },
              { icon: <Puzzle size={28} color="#ec4899" />, color: '#ec4899', title: 'Daily Algorithmic Puzzles', desc: 'Sharpen your problem-solving skills with curated daily coding challenges. Build consistency and earn massive ELO bonuses.' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '24px', cursor: 'pointer' }}
                whileHover={{ y: -5, boxShadow: `0 12px 40px ${item.color}15`, transition: { type: 'tween', duration: 0.05 } }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${item.color}15`, border: `1px solid ${item.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, boxShadow: `0 4px 20px ${item.color}20`
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FOOTER CTA — hidden if already PRO */}
        {!isPremiumUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            style={{ textAlign: 'center', marginTop: 80, padding: '48px', background: 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(96,165,250,0.05))', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 12px 0' }}>Start your MAANG journey today</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: 15 }}>Join hundreds of coders who cracked their dream companies using NodeClash Pro.</p>
            <button onClick={() => handlePayment(PLANS[2])} style={{ background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 40px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 30px rgba(255,107,53,0.35)', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(255,107,53,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,107,53,0.35)' }}>
              ✨ Unlock Pro — ₹1,199 for 6 months
            </button>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>Secure payments via Razorpay.</div>
          </motion.div>
        )}

      </div>

      {/* Global CSS Variables for Day/Night Theme */}
      <style>{`
        :root {
          --bg: #060608;
          --nav-bg: rgba(10,10,12,0.9);
          --card-bg: rgba(18, 18, 22, 0.65);
          --glass-border: rgba(255,255,255,0.06);
          --glass-overlay: rgba(255,255,255,0.04);
          --text-main: #f8fafc;
          --text-muted: #a1a1aa;
        }
        :root[data-theme='light'], .light, body.light {
          --bg: #f3f4f6;
          --nav-bg: rgba(255, 255, 255, 0.85);
          --card-bg: #ffffff;
          --glass-border: rgba(0, 0, 0, 0.08);
          --glass-overlay: rgba(0, 0, 0, 0.04);
          --text-main: #111827;
          --text-muted: #6b7280;
        }

        /* ── MOBILE RESPONSIVE ── */
        @media (max-width: 768px) {
          .premium-nav-links {
            display: none !important;
          }
          .premium-nav-user span {
            display: none;
          }
          .premium-content {
            padding: 40px 16px 40px !important;
          }
          .premium-hero-title {
            font-size: 32px !important;
            letter-spacing: -1px !important;
          }
          .premium-pricing-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .premium-features-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          .premium-banner {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px 18px !important;
            gap: 12px !important;
          }
          .premium-banner button {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .premium-features-grid {
            grid-template-columns: 1fr !important;
          }
          .premium-hero-title {
            font-size: 26px !important;
          }
        }
      `}</style>
    </div>
  )
}