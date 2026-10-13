import { Link } from 'react-router-dom'
import Logo from '../Logo'
import { ZoneIcon } from '../Art'
import { RegisterButton } from '../Ui'
import { useCountdown, useReveal } from '../../hooks/useEffects'
import { EVENT, SCHOOL, ZONES, SCHEDULE } from '../../config/event'

export function CountdownStrip() {
  const { d, h, m, s } = useCountdown(EVENT.dateISO)
  return (
    <div className="count"><div className="wrap">
      <h3>The robots wake up in<small>Event date: {EVENT.dateLabel}</small></h3>
      <div className="timer">
        <div><b>{d}</b><span>Days</span></div><div><b>{h}</b><span>Hours</span></div>
        <div><b>{m}</b><span>Mins</span></div><div><b>{s}</b><span>Secs</span></div>
      </div>
      <RegisterButton className="sun">Save my seat</RegisterButton>
    </div></div>
  )
}

function Zone({ z, i }) {
  const ref = useReveal((i % 4) * 80)
  return (
    <div ref={ref} className={`zone ${z.cls}`} data-in>
      <div className="ic"><ZoneIcon name={z.icon} /></div>
      <h3>{z.title}</h3><p>{z.text}</p>
    </div>
  )
}
export function Zones() {
  return (
    <section className="s" id="zones"><div className="wrap">
      <div className="kicker">What's at the expo</div>
      <h2>Four zones to explore</h2>
      <p className="intro">Walk through each zone, watch the robots work, and try a few yourself.</p>
      <div className="zones">{ZONES.map((z, i) => <Zone key={z.title} z={z} i={i} />)}</div>
    </div></section>
  )
}

function Step({ s, i }) {
  const ref = useReveal(i * 80)
  return (
    <div ref={ref} className="step" data-in>
      <div className="dot">{i + 1}</div><div className="t">{s.time}</div><h3>{s.title}</h3><p>{s.text}</p>
    </div>
  )
}
export function Schedule() {
  return (
    <section className="s" id="schedule"><div className="wrap">
      <div className="kicker">On the day</div>
      <h2>How the day runs</h2>
      <p className="intro">{EVENT.timeLabel} at {EVENT.venue}.</p>
      <div className="sched">{SCHEDULE.map((s, i) => <Step key={s.title} s={s} i={i} />)}</div>
    </div></section>
  )
}

export function SchoolSection() {
  const ref = useReveal()
  return (
    <section className="s" id="school"><div className="wrap">
      <div ref={ref} className="schoolband" data-in>
        <Logo size={130} variant="big" />
        <div>
          <div className="kicker">Hosted by</div>
          <h2>{SCHOOL.name}</h2>
          <p>{SCHOOL.blurb}</p>
          <div className="tags">{SCHOOL.tags.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
        <RegisterButton />
      </div>
    </div></section>
  )
}

export function FinalCta() {
  const ref = useReveal()
  return (
    <div className="wrap">
      <div ref={ref} className="final" data-in>
        <h2>Ready to meet the robots?</h2>
        <p>Registration takes 20 seconds. You'll get your entry ID straight away.</p>
        <RegisterButton size="big" arrow />
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer><div className="wrap">
      <span>© {EVENT.year} {SCHOOL.name} · {EVENT.name}</span>
      <span>
        Contact: <a href={`tel:${EVENT.contact.replace(/\s+/g, '')}`} style={{ color: 'inherit' }}>{EVENT.contact}</a>
        {EVENT.email && (
          <> · <a href={`mailto:${EVENT.email}`} style={{ color: 'inherit' }}>{EVENT.email}</a></>
        )}
        {' · '}
        <Link to="/admin" style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}>Admin Portal</Link>
      </span>
    </div></footer>
  )
}
