import { Helmet } from 'react-helmet-async' // 🔥 Helmet import kar liya
import Navbar from '../components/ui/Navbar'
import Hero from '../components/ui/Hero'
import Features from '../components/ui/Features'
import HowItWorks from '../components/ui/HowItWorks'
import Footer from '../components/ui/Footer'

export default function Home() {
  return (
    <div>
      {/* 👇🔥 MAIN LANDING PAGE SEO 🔥👇 */}
      <Helmet>
        <title>CodeArena | Real-time 1v1 Coding Battles</title>
        <meta name="description" content="Compete against other developers in real-time coding challenges. Practice DSA, climb the global leaderboard, and prove your skills on CodeArena." />
        <meta name="keywords" content="coding platform, competitive programming, 1v1 coding, dsa practice, leetcode alternative, multiplayer coding" />
        
        {/* Social Media Share Preview Tags */}
        <meta property="og:title" content="CodeArena | Real-time 1v1 Coding Battles" />
        <meta property="og:description" content="Compete against other developers in real-time coding challenges. Practice DSA and climb the leaderboard!" />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* 👆🔥 MAIN LANDING PAGE SEO 🔥👆 */}

      <Navbar />
      <Hero />
      <div id="features"><Features /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <Footer />
    </div>
  )
}