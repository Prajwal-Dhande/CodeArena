import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Battle from './pages/Battle'
import Auth from './pages/Auth'
import Lobby from './pages/Lobby'
import Leaderboard from './pages/Leaderboard'
import PracticeRoadmap from './pages/PracticeRoadmap'
import Profile from './pages/Profile'

// ✅ CORRECTED PATHS: 'components/ui' folder se import honge
import Privacy from './components/ui/Privacy' 
import Terms from './components/ui/Terms'
import Contact from './components/ui/Contact'

// ✅ NAYA PUZZLE PAGE IMPORT
import PuzzleSolve from './pages/PuzzleSolve' 

// ✅ PREMIUM DSA PAGE IMPORT
import InterviewDSA from './pages/InterviewDSA'

// 💎 PREMIUM SUBSCRIPTION PAGE
import Premium from './pages/Premium'

// 📊 PREMIUM DASHBOARD
import PremiumDashboard from './pages/PremiumDashboard'

// 🏆 TOURNAMENTS PAGE
import Tournaments from './pages/Tournaments'

// ⚙️ SETTINGS PAGE
import Settings from './pages/Settings'

import AuthGuard from './components/AuthGuard' 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route element={<AuthGuard />}>
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/practice" element={<PracticeRoadmap />} />
          
          {/* ✅ KHUD KI PROFILE */}
          <Route path="/profile" element={<Profile />} />
          
          {/* 🔥 NAYA: DOOSRO KI PROFILE DEKHNE KE LIYE 🔥 */}
          <Route path="/profile/:username" element={<Profile />} />
          
          {/* ✅ NAYA PUZZLE ROUTE YAHAN ADD KIYA */}
          <Route path="/puzzle" element={<PuzzleSolve />} />
          
          {/* 🔥 PREMIUM DSA ROUTE */}
          <Route path="/interview-dsa" element={<InterviewDSA />} />

          {/* 💎 PREMIUM SUBSCRIPTION PAGE */}
          <Route path="/premium" element={<Premium />} />

          {/* 📊 PREMIUM DASHBOARD */}
          <Route path="/dashboard" element={<PremiumDashboard />} />

          {/* 🏆 TOURNAMENTS */}
          <Route path="/tournaments" element={<Tournaments />} />

          {/* ⚙️ SETTINGS */}
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* ⚠️ Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}