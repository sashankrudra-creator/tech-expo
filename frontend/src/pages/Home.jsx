import Navbar from '../components/home/Navbar'
import Hero from '../components/home/Hero'
import Gallery from '../components/home/Gallery'
import { CountdownStrip, Zones, Schedule, SchoolSection, FinalCta, Footer } from '../components/home/Sections'

export default function Home() {
  return (
    <div id="landing">
      <Navbar />
      <Hero />
      <CountdownStrip />
      <Zones />
      <Gallery />
      <Schedule />
      <SchoolSection />
      <FinalCta />
      <Footer />
    </div>
  )
}

