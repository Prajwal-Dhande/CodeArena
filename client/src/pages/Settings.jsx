import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_URL from '../config/api'

const THEMES = ['Monokai', 'Dracula', 'One Dark', 'GitHub Dark', 'Solarized Dark']
const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
]

const SectionTitle = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{children}</div>
)

const Toggle = ({ value, onChange }) => (
  <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, background: value ? '#ff6b35' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: 3, left: value ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
  </div>
)

const SettingRow = ({ label, desc, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e5e5' }}>{label}</div>
      {desc && <div style={{ fontSize: 12, color: '#555', marginTop: 3 }}>{desc}</div>}
    </div>
    {children}
  </div>
)

export default function Settings() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  // Arena Preferences (localStorage)
  const [defaultLang, setDefaultLang] = useState(localStorage.getItem('ca_defaultLang') || 'javascript')
  const [editorTheme, setEditorTheme] = useState(localStorage.getItem('ca_editorTheme') || 'Monokai')
  const [matchSounds, setMatchSounds] = useState(localStorage.getItem('ca_matchSounds') !== 'false')
  const [vimMode, setVimMode] = useState(localStorage.getItem('ca_vimMode') === 'true')

  // Privacy
  const [profilePublic, setProfilePublic] = useState(true)
  const [showEloOnLeaderboard, setShowEloOnLeaderboard] = useState(true)

  // Password
  const [showPwModal, setShowPwModal] = useState(false)
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Subscription
  const [premiumStatus, setPremiumStatus] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/auth'); return }
    fetch(`${API_URL}/api/payment/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setPremiumStatus(d)).catch(() => {})
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('ca_defaultLang', defaultLang)
    localStorage.setItem('ca_editorTheme', editorTheme)
    localStorage.setItem('ca_matchSounds', matchSounds)
    localStorage.setItem('ca_vimMode', vimMode)
  }, [defaultLang, editorTheme, matchSounds, vimMode])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/auth')
  }

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { setPwMsg('Passwords do not match'); return }
    if (newPw.length < 6) { setPwMsg('Password must be at least 6 characters'); return }
    setPwMsg('Password change UI ready — backend endpoint coming soon.')
  }

  const handleDelete = async () => {
    if (deleteConfirm !== user?.username) return
    // Future: call backend DELETE /api/users/me
    handleLogout()
  }

  const getPlanLabel = () => {
    const plan = user?.premiumPlan || (user?.isPremium ? 'pro' : 'free')
    if (plan === 'pro_plus') return { name: 'Pro+', color: '#ff6b35', bg: 'rgba(255,107,53,0.1)', border: 'rgba(255,107,53,0.3)' }
    if (plan === 'pro') return { name: 'Pro', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' }
    return { name: 'Free', color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.3)' }
  }
  const planInfo = getPlanLabel()

  return (
    <div style={{ minHeight: '100vh', background: '#060608', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
      {/* NAV */}
      <nav style={{ height: 60, background: '#111113', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', marginRight: 32 }} onClick={() => navigate('/')}>
          <span style={{ color: '#ff6b35', marginRight: 6 }}>{'{C}'}</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>CodeArena</span>
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate('/profile')} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#a1a1aa', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>← Back to Profile</button>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 20px 80px' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Settings</h1>
        <p style={{ color: '#555', fontSize: 14, margin: '0 0 40px 0' }}>Manage your account, preferences, and subscription.</p>

        {/* ── SUBSCRIPTION ── */}
        <div style={{ background: '#0f0f14', border: `1px solid ${planInfo.border}`, borderRadius: 16, padding: '24px', marginBottom: 32 }}>
          <SectionTitle>Subscription</SectionTitle>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: planInfo.bg, border: `1px solid ${planInfo.border}`, padding: '8px 18px', borderRadius: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: planInfo.color, fontFamily: 'Outfit' }}>{planInfo.name}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5' }}>
                  {planInfo.name === 'Free' ? 'Free Plan' : `${planInfo.name} Plan Active`}
                </div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {premiumStatus?.daysLeft ? `${premiumStatus.daysLeft} days remaining` : planInfo.name === 'Free' ? 'Upgrade to unlock premium features' : 'Active subscription'}
                </div>
              </div>
            </div>
            {planInfo.name !== 'Pro+' && (
              <button onClick={() => navigate('/premium')} style={{ background: 'linear-gradient(135deg, #ff6b35, #f7451d)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>
                {planInfo.name === 'Free' ? 'Upgrade' : 'Upgrade to Pro+'}
              </button>
            )}
          </div>
        </div>

        {/* ── ARENA PREFERENCES ── */}
        <div style={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', marginBottom: 32 }}>
          <SectionTitle>Arena Preferences</SectionTitle>

          <SettingRow label="Default Language" desc="Language pre-selected when you start a battle">
            <select value={defaultLang} onChange={e => setDefaultLang(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e5e5', padding: '8px 14px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Inter' }}>
              {LANGUAGES.map(l => <option key={l.id} value={l.id} style={{ background: '#1a1a1f' }}>{l.label}</option>)}
            </select>
          </SettingRow>

          <SettingRow label="Editor Theme" desc="Color scheme for the code editor">
            <select value={editorTheme} onChange={e => setEditorTheme(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e5e5', padding: '8px 14px', borderRadius: 8, fontSize: 13, outline: 'none', cursor: 'pointer', fontFamily: 'Inter' }}>
              {THEMES.map(t => <option key={t} value={t} style={{ background: '#1a1a1f' }}>{t}</option>)}
            </select>
          </SettingRow>

          <SettingRow label="Match Sounds" desc="Play sound effects during battles">
            <Toggle value={matchSounds} onChange={setMatchSounds} />
          </SettingRow>

          <SettingRow label="Vim Keybindings" desc="Use Vim-style keyboard shortcuts in the editor">
            <Toggle value={vimMode} onChange={setVimMode} />
          </SettingRow>
        </div>

        {/* ── PRIVACY ── */}
        <div style={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', marginBottom: 32 }}>
          <SectionTitle>Privacy</SectionTitle>

          <SettingRow label="Public Profile" desc="Allow other users to view your profile">
            <Toggle value={profilePublic} onChange={setProfilePublic} />
          </SettingRow>

          <SettingRow label="Show ELO on Leaderboard" desc="Display your rating on the public leaderboard">
            <Toggle value={showEloOnLeaderboard} onChange={setShowEloOnLeaderboard} />
          </SettingRow>
        </div>

        {/* ── ACCOUNT ── */}
        <div style={{ background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '24px', marginBottom: 32 }}>
          <SectionTitle>Account</SectionTitle>

          <SettingRow label="Email" desc={user?.email || 'Not set'}>
            <span style={{ fontSize: 12, color: '#555', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>Verified ✓</span>
          </SettingRow>

          <SettingRow label="Change Password" desc="Update your account password">
            <button onClick={() => setShowPwModal(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e5e5', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>Change</button>
          </SettingRow>

          <div style={{ paddingTop: 16 }}>
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter', marginRight: 12 }}>
              Logout
            </button>
          </div>
        </div>

        {/* ── DANGER ZONE ── */}
        <div style={{ background: '#0f0f14', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: '24px' }}>
          <SectionTitle>⚠️ Danger Zone</SectionTitle>
          <SettingRow label="Delete Account" desc="Permanently delete your account and all data. This action cannot be undone.">
            <button onClick={() => setShowDeleteModal(true)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>Delete Account</button>
          </SettingRow>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPwModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '90%', maxWidth: 400, padding: '32px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, margin: '0 0 20px 0' }}>Change Password</h3>
            {[{ label: 'Current Password', val: oldPw, set: setOldPw }, { label: 'New Password', val: newPw, set: setNewPw }, { label: 'Confirm New Password', val: confirmPw, set: setConfirmPw }].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: '#666', fontWeight: 700, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type="password" value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'Inter', boxSizing: 'border-box' }} />
              </div>
            ))}
            {pwMsg && <div style={{ fontSize: 12, color: '#fbbf24', marginBottom: 12 }}>{pwMsg}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => { setShowPwModal(false); setPwMsg('') }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>Cancel</button>
              <button onClick={handleChangePw} style={{ flex: 1, background: '#ff6b35', border: 'none', color: '#fff', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter' }}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#13131a', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, width: '90%', maxWidth: 400, padding: '32px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, margin: '0 0 12px 0', color: '#ef4444' }}>Delete Account</h3>
            <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 0 20px 0' }}>This will permanently delete your account, all battles, stats, and subscription. Type <strong style={{ color: '#ef4444' }}>{user?.username}</strong> to confirm.</p>
            <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder={user?.username} style={{ width: '100%', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 13, outline: 'none', fontFamily: 'Inter', marginBottom: 16, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter' }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleteConfirm !== user?.username} style={{ flex: 1, background: deleteConfirm === user?.username ? '#ef4444' : 'rgba(239,68,68,0.2)', border: 'none', color: '#fff', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 700, cursor: deleteConfirm === user?.username ? 'pointer' : 'not-allowed', fontFamily: 'Inter', opacity: deleteConfirm === user?.username ? 1 : 0.5 }}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
