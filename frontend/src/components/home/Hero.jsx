import { Cloud, HeroRobot, Rover } from '../Art'
import { RegisterButton } from '../Ui'
import { useTyping } from '../../hooks/useEffects'
import { EVENT } from '../../config/event'

export default function Hero() {
  const typed = useTyping(EVENT.typingWords)
  return (
    <section className="hero">
      <Cloud style={{ top: 40, animationDelay: '-8s' }} />
      <Cloud style={{ top: 150, animationDelay: '-26s', animationDuration: '55s' }} width={100} />
      <div className="wrap">
        <div className="copy">
          <span className="badge"><i />Registrations open</span>
          <h1>
            <span className="w tech">{EVENT.name.split(' ')[0]}</span>{' '}
            <span className="w expo">{EVENT.name.split(' ').slice(1).join(' ') || 'Expo'}</span>{' '}
            <span className="w">{EVENT.year}</span>
          </h1>
          <div className="typing">Come see robots that <b>{typed}</b><span className="caret" /></div>
          <p className="lead">
            A full day of student-built robots, live demos and hands-on fun for kids, parents and teachers.
            Entry is free, and every attendee gets a certificate.
          </p>
          <div className="actions">
            <RegisterButton size="big" arrow />
            <a className="ghost" href="#zones">See what's there</a>
          </div>
        </div>
        <div className="stage"><HeroRobot /></div>
      </div>
      <div className="ground"><Rover /></div>
    </section>
  )
}
