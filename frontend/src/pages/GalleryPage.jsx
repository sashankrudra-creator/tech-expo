import { Link } from 'react-router-dom'
import Navbar from '../components/home/Navbar'
import Gallery from '../components/home/Gallery'
import { Footer } from '../components/home/Sections'

export default function GalleryPage() {
  return (
    <div id="gallery-page">
      <Navbar />
      <div className="wrap" style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link">
          ← Back to Expo Home
        </Link>
      </div>
      <Gallery isStandalone={true} />
      <Footer />
    </div>
  )
}
