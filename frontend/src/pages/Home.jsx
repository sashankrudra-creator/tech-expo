import Navbar from '../components/home/Navbar'
import Hero from '../components/home/Hero'
import { CountdownStrip, Zones, Schedule, SchoolSection, FinalCta, Footer } from '../components/home/Sections'

export default function Home() {
  return (
    <div id="landing">
      <Navbar />
      <Hero />
      <CountdownStrip />
      <Zones />
      <Schedule />
      <SchoolSection />
      <FinalCta />
      <Footer />
    </div>
  )
}
