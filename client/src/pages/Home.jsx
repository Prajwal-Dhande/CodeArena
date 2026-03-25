import Navbar from '../components/ui/Navbar'
import Hero from '../components/ui/Hero'
import Features from '../components/ui/Features'
import HowItWorks from '../components/ui/HowItWorks'
import Footer from '../components/ui/Footer'

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <div id="features"><Features /></div>
      <div id="how-it-works"><HowItWorks /></div>
      <Footer />
    </div>
  )
}