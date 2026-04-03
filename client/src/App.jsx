import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Battle from './pages/Battle'
import Auth from './pages/Auth'
import Lobby from './pages/Lobby'
import Leaderboard from './pages/Leaderboard'
import PracticeRoadmap from './pages/PracticeRoadmap'
import Profile from './pages/Profile'

// ✅ Corrected Imports: We need to go into the 'components' folder, then 'ui'
import Privacy from './components/ui/Privacy' 
import Terms from './components/ui/Terms'
import Contact from './components/ui/Contact'

// AuthGuard ka import
import AuthGuard from './components/AuthGuard' 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🌐 PUBLIC ROUTES - Bina login ke access honge */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* ✅ Naye Public Routes yahan add kiye hain */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* 🔒 PROTECTED ROUTES - Sirf login ke baad access honge */}
        <Route element={<AuthGuard />}>
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/practice" element={<PracticeRoadmap />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* ⚠️ Catch-all route - Agar koi URL type karke aisi jagah jaye jo exist nahi karti, toh wapas Home pe bhej do */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}