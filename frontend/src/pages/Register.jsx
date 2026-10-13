import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { SmallBot } from '../components/Art'
import { Confetti, useToast, copyText } from '../components/Ui'
import { api } from '../api/client'
import { validateRegistration } from '../api/validate'
import { EVENT } from '../config/event'

const EMPTY = { name: '', mobile: '', email: '' }

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [toast, showToast] = useToast()
  const idRef = useRef(null)

  const change = (k) => (e) => {
    const v = k === 'mobile' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const data = { name: form.name.trim().replace(/\s+/g, ' '), mobile: form.mobile.trim(), email: form.email.trim() }
    const errs = validateRegistration(data)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      setDone(await api.register(data))
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      else if (err.status === 409) setErrors({ mobile: err.message })
      else setErrors({ form: err.message || 'Could not register right now. Please try again.' })
    } finally { setBusy(false) }
  }

  const copy = async () => showToast((await copyText(done.id, idRef.current)) ? 'ID copied' : 'ID selected, press Ctrl+C to copy')
  const again = () => { setForm(EMPTY); setErrors({}); setDone(null) }

  const field = (k, label, props, hint) => (
    <div className={`field ${errors[k] ? 'bad' : ''}`}>
      <label htmlFor={k}>{label} {hint && <em>{hint}</em>}</label>
      <input id={k} value={form[k]} onChange={change(k)} aria-invalid={!!errors[k]} aria-describedby={`${k}-err`} {...props} />
      <span className="err" id={`${k}-err`}>{errors[k] || ''}</span>
    </div>
  )

  return (
    <div className="regpage">
      <Confetti fire={done?.id} />
      <div className="wrap">
        <button className="back" type="button" onClick={() => nav('/')}>← Back to {EVENT.name}</button>
        <div className="regbox">
          <div className="regside">
            <Logo variant="onblue" />
            <h2>Join {EVENT.name} {EVENT.year}</h2>
            <p>Fill in three quick details and you're in.</p>
            <ul>
              <li><i>1</i>Register here</li><li><i>2</i>Get your entry ID</li>
              <li><i>3</i>Show it at the desk</li><li><i>4</i>Get your certificate</li>
            </ul>
            <SmallBot />
          </div>

          <div className="regform">
            {!done ? (
              <form onSubmit={submit} noValidate>
                <h2>Student registration</h2>
                <p className="sub">Your entry ID appears right after you submit.</p>
                {field('name', 'Full name', { autoComplete: 'name', placeholder: 'e.g. Aarav Sharma', maxLength: 80, autoFocus: true })}
                {field('mobile', 'Mobile number', { inputMode: 'numeric', autoComplete: 'tel', placeholder: '10-digit mobile number' })}
                {field('email', 'Email address', { type: 'email', autoComplete: 'email', placeholder: 'parent or student email', maxLength: 120 }, '(optional, needed for the e-certificate)')}
                {errors.form && <div className="msg bad">{errors.form}</div>}
                <button className="cta submit" type="submit" disabled={busy}>{busy ? 'Registering…' : 'Register'}</button>
                <p className="fine">Certificates are emailed only to students who attend and give an email address.</p>
              </form>
            ) : (
              <div className="success">
                <div className="tick">✓</div>
                <h2>You're registered!</h2>
                <p className="sub">{done.name}, your entry ID is ready.</p>
                <div className="idbox"><small>YOUR ENTRY ID</small><div className="id" ref={idRef}>{done.id}</div></div>
                <button className="btn" type="button" onClick={copy}>Copy ID</button>
                <div className="note">Show this ID at the registration desk on event day. Your attendance is marked with it. Take a screenshot to keep it safe.</div>
                <div className="row center">
                  <button className="btn line" type="button" onClick={again}>Register another student</button>
                  <button className="btn line" type="button" onClick={() => nav('/')}>Back to home</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast}
    </div>
  )
}
