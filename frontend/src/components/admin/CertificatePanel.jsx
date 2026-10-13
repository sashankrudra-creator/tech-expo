import { useMemo, useState } from 'react'
import { api } from '../../api/client'
import { isEligible, certStatus } from './helpers'

export default function CertificatePanel({ people, emailReady, onChange, onView, toast }) {
  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState(null)
  const [q, setQ] = useState('')
  const [rowBusy, setRowBusy] = useState(null)

  const failed = people.filter((p) => p.email_status === 'failed')
  const ready = people.filter((p) => isEligible(p) && p.email_status !== 'sent').length
  const matches = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return []
    return people.filter((p) => p.present && [p.id, p.name, p.mobile, p.email].some((v) => v.toLowerCase().includes(s))).slice(0, 5)
  }, [q, people])

  const sendAll = async () => {
    setBusy(true); setSummary(null)
    try { setSummary(await api.sendAll()); onChange() }
    catch (err) { setSummary({ error: err.message }) }
    finally { setBusy(false) }
  }
  const sendOne = async (p) => {
    setRowBusy(p.id)
    try { await api.sendOne(p.id); toast(`Certificate sent to ${p.email}`) }
    catch (err) { toast(err.message) }
    finally { setRowBusy(null); onChange() }
  }

  return (
    <div className="panel">
      <h3>Certificates</h3>
      <p className="sub">Email goes only to students marked present who gave an email.</p>
      {!emailReady && <div className="msg warn">Email is not set up yet (SMTP settings in backend .env). You can still view and download PDF certificates.</div>}
      <div className="row">
        <button className="btn" type="button" onClick={sendAll} disabled={busy || !emailReady}>
          {busy ? 'Sending…' : `Generate & email all eligible (${ready})`}
        </button>
      </div>
      {summary && (summary.error
        ? <div className="msg bad">{summary.error}</div>
        : <div className="msg ok"><b>{summary.sent}</b> sent · <b>{summary.failed}</b> failed · <b>{summary.skipped}</b> present students skipped (no email){summary.already_sent ? <> · <b>{summary.already_sent}</b> already sent</> : null}. Absent students were not included.</div>)}

      {failed.length > 0 && (
        <div className="faillist">
          <b className="small-h">Failed deliveries</b>
          {failed.map((p) => (
            <div className="fail" key={p.id}>
              <b>{p.name}</b><span className="e">{p.email} · {p.email_error}</span>
              <button className="linkbtn" type="button" disabled={rowBusy === p.id || !emailReady} onClick={() => sendOne(p)}>{rowBusy === p.id ? 'Sending…' : 'Retry'}</button>
            </div>
          ))}
        </div>
      )}

      <div className="certsearch">
        <b className="small-h">Find one student's certificate</b>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search present students by ID, name or mobile" aria-label="Search certificate" />
        {q && !matches.length && <p className="sub">No present student matches “{q}”.</p>}
        {matches.map((p) => { const [k, l] = certStatus(p); return (
          <div className="match" key={p.id}>
            <div><b>{p.name}</b><span className="mono">{p.id}</span></div>
            <span className={`pill ${k}`}>{l}</span>
            <button className="linkbtn" type="button" onClick={() => onView(p)}>View / PDF</button>
            {isEligible(p) && <button className="linkbtn" type="button" disabled={rowBusy === p.id || !emailReady} onClick={() => sendOne(p)}>{rowBusy === p.id ? 'Sending…' : 'Email'}</button>}
          </div>) })}
      </div>
    </div>
  )
}
