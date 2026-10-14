import { Link } from 'react-router-dom'
import Logo from '../Logo'
import { RegisterButton } from '../Ui'
import { EVENT, SCHOOL } from '../../config/event'

export default function Navbar() {
  return (
    <header className="nav"><div className="wrap">
      <Logo />
      <div className="school">{SCHOOL.name}<small>presents {EVENT.name} {EVENT.year}</small></div>
      <nav className="links">
        <a href="#zones">What's there</a>
        <a href="#gallery">Past Expos</a>
        <a href="#schedule">Schedule</a>
        <a href="#school">About us</a>
        <Link to="/admin" className="admin-link">Admin Portal</Link>
        <RegisterButton size="sm" />
      </nav>
    </div></header>
  )
}
