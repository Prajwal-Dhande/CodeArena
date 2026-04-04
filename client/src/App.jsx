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
          <Route path="/profile" element={<Profile />} />
          
          {/* ✅ NAYA PUZZLE ROUTE YAHAN ADD KIYA */}
          <Route path="/puzzle" element={<PuzzleSolve />} />
        </Route>

        {/* ⚠️ Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}