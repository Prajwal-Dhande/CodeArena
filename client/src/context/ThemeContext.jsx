import { createContext, useState, useEffect, useContext } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('ca_theme')
    return stored ? stored === 'dark' : true // default dark
  })

  useEffect(() => {
    localStorage.setItem('ca_theme', isDark ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

// Toggle button component — drop this into any navbar
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        position: 'relative',
        width: 130,
        height: 40,
        borderRadius: 20,
        background: isDark ? '#000' : '#e5e7eb',
        border: '1px solid rgba(128,128,128,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 4,
        outline: 'none',
        transition: 'background 0.4s ease',
        flexShrink: 0,
        fontFamily: 'Outfit, sans-serif'
      }}
    >
      {/* Background Text */}
      <span style={{
        position: 'absolute',
        width: '100%',
        display: 'flex',
        justifyContent: isDark ? 'flex-end' : 'flex-start',
        padding: isDark ? '0 16px 0 0' : '0 0 0 12px',
        left: 0,
        fontSize: 11,
        fontWeight: 800,
        color: isDark ? '#fff' : '#000',
        letterSpacing: 0.5,
        transition: 'color 0.4s ease',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {isDark ? 'NIGHT MODE' : 'DAY MODE'}
      </span>

      {/* The Handle */}
      <div style={{
        position: 'absolute',
        left: isDark ? 4 : 94,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        zIndex: 2
      }}>
        {isDark ? (
          <span style={{ fontSize: 16, color: '#000', lineHeight: 1 }}>🌙</span>
        ) : (
          <span style={{ fontSize: 18, color: '#000', lineHeight: 1 }}>☀️</span>
        )}
      </div>
    </button>
  )
}
