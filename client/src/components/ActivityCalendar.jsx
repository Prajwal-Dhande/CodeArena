import { useState, useEffect } from 'react'
import API_URL from '../config/api'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ActivityCalendar() {
  const [activity, setActivity] = useState({})
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_URL}/api/users/activity`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setActivity(d.activity || {})
          setStreak(d.streak || 0)
          setMaxStreak(d.maxStreak || 0)
        }
      }).catch(() => {})
  }, [])

  const today = new Date()
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear()

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()

  const cells = []
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false })
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const act = activity[key]
    const isToday = d === today.getDate() && isCurrentMonth
    cells.push({ day: d, current: true, activity: act, isToday, key })
  }
  // Fill remaining to complete rows
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false })
    }
  }

  const goMonth = (dir) => {
    let m = month + dir
    let y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    // Don't go past current month
    if (y > today.getFullYear() || (y === today.getFullYear() && m > today.getMonth())) return
    setMonth(m); setYear(y)
  }

  // Count total active days and total battles this month
  let totalActive = 0, totalBattles = 0
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (activity[key]) {
      totalActive++
      totalBattles += activity[key].battles
    }
  }

  return (
    <div style={{
      background: 'var(--card-bg, #16161a)',
      border: '1px solid var(--border, rgba(255,255,255,0.04))',
      borderRadius: 16,
      padding: '20px',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text, #fff)', fontFamily: 'Outfit' }}>
            {MONTHS[month]} {year}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted, #555)' }}>
            {totalActive} active day{totalActive !== 1 ? 's' : ''} · {totalBattles} battle{totalBattles !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => goMonth(-1)} style={{ background: 'var(--btn-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border, rgba(255,255,255,0.08))', color: 'var(--text-secondary, #888)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <button onClick={() => goMonth(1)} disabled={isCurrentMonth} style={{ background: 'var(--btn-bg, rgba(255,255,255,0.05))', border: '1px solid var(--border, rgba(255,255,255,0.08))', color: isCurrentMonth ? 'var(--text-disabled, #333)' : 'var(--text-secondary, #888)', borderRadius: 6, width: 28, height: 28, cursor: isCurrentMonth ? 'not-allowed' : 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-muted, #555)', padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          const hasActivity = cell.current && cell.activity
          const hasWin = hasActivity && cell.activity.wins > 0
          const battles = hasActivity ? cell.activity.battles : 0

          // Intensity based on battle count
          let bg = 'transparent'
          let textColor = cell.current ? 'var(--text-secondary, #666)' : 'var(--text-disabled, #333)'
          let borderStyle = 'none'

          if (cell.isToday) {
            borderStyle = '2px solid #ff6b35'
          }

          if (hasWin) {
            // Orange shades based on intensity
            const intensity = Math.min(battles, 5)
            const alpha = 0.15 + (intensity / 5) * 0.6
            bg = `rgba(255,107,53,${alpha})`
            textColor = '#fff'
          } else if (hasActivity) {
            bg = 'rgba(255,107,53,0.08)'
            textColor = '#ff6b35'
          }

          return (
            <div
              key={i}
              title={hasActivity ? `${battles} battle${battles > 1 ? 's' : ''} · ${cell.activity.wins} win${cell.activity.wins !== 1 ? 's' : ''}` : ''}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: cell.isToday || hasWin ? 700 : 500,
                color: textColor,
                background: bg,
                borderRadius: 6,
                border: borderStyle,
                cursor: hasActivity ? 'default' : 'default',
                transition: 'background 0.15s',
                fontFamily: 'Inter',
              }}
            >
              {cell.day}
            </div>
          )
        })}
      </div>

      {/* Streak bar */}
      <div style={{ display: 'flex', gap: 12, marginTop: 14, padding: '12px 0 0', borderTop: '1px solid var(--border, rgba(255,255,255,0.04))' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#ff6b35', fontFamily: 'Outfit' }}>{streak}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted, #555)', fontWeight: 600 }}>Current Streak</div>
        </div>
        <div style={{ width: 1, background: 'var(--border, rgba(255,255,255,0.06))' }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fbbf24', fontFamily: 'Outfit' }}>{maxStreak}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted, #555)', fontWeight: 600 }}>Max Streak</div>
        </div>
      </div>
    </div>
  )
}
