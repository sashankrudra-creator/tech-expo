import { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Register from './pages/Register'
import Admin from './pages/admin/Admin'
import GalleryPage from './pages/GalleryPage'

function PreviewBar() {
  const nav = useNavigate()
  const admin = useLocation().pathname.startsWith('/admin')
  return (
    <div className="pbar"><div className="wrap">
      <span className="tag">PREVIEW · sample data · no database</span>
      <nav>
        <button aria-pressed={!admin} onClick={() => nav('/')}>Website</button>
        <button aria-pressed={admin} onClick={() => nav('/admin')}>Admin</button>
      </nav>
    </div></div>
  )
}

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      {import.meta.env.VITE_PREVIEW === 'true' && <PreviewBar />}
      <div className="page" key={pathname.split('/')[1] || 'home'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}
