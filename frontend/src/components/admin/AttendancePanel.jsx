import { useState } from 'react'
import { api, isMock } from '../../api/client'

export default function AttendancePanel({ onChange, toast }) {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null) // { kind: 'found'|'already'|'saved'|'error'|'warn', p?, text? }
  const [busy, setBusy] = useState(false)

  const find = async (e) => {
    e?.preventDefault()
    const q = id.trim().toUpperCase()
    if (!q) return setResult({ kind: 'warn', text: 'Enter an entry ID first.' })
    setBusy(true)
    try {
      const p = await api.find(q)
      setResult({ kind: p.present ? 'already' : 'found', p })
    } catch (err) {
      setResult({ kind: 'error', text: err.status === 404 ? `No student found with ID ${q}. Check the letters and try again.` : err.message })
    } finally { setBusy(false) }
  }

  const mark = async () => {
    setBusy(true)
    try {
      const p = await api.markPresent(result.p.id)
      setResult({ kind: 'saved', p }); setId(''); toast('Attendance saved'); onChange()
    } catch (err) {
      setResult({ kind: err.status === 409 ? 'already' : 'error', p: err.data?.participant || result.p, text: err.message })
    } finally { setBusy(false) }
  }

  const cls = { found: '', already: 'warn', saved: 'ok', error: 'bad', warn: 'warn' }[result?.kind]
  return (
    <div className="panel">
      <h3>Mark attendance</h3>
      <p className="sub">Type the entry ID the student shows at the desk.</p>
      <form className="row" onSubmit={find}>
        <input className="mono" id="attid" value={id} onChange={(e) => setId(e.target.value.toUpperCase())} placeholder="TE26-XXXXXX" aria-label="Entry ID" maxLength={20} />
        <button className="btn" type="submit" disabled={busy}>Find</button>
      </form>
      {result && (
        <div className={`msg ${cls}`}>
          {result.p ? (
            <>
              {result.kind === 'saved'
                ? <><b>{result.p.name}</b> is marked present.</>
                : <>
                    <dl className="kv">
                      <dt>Name</dt><dd>{result.p.name}</dd>
                      <dt>Entry ID</dt><dd className="mono">{result.p.id}</dd>
                      <dt>Mobile</dt><dd>{result.p.mobile}</dd>
                      <dt>Email</dt><dd>{result.p.email || 'Not given'}</dd>
                      <dt>Status</dt><dd>{result.p.present ? <span className="pill ok">Already present</span> : <span className="pill no">Absent</span>}</dd>
                    </dl>
                    {result.kind === 'found' && <button className="btn" type="button" onClick={mark} disabled={busy}>Mark present</button>}
                    {result.kind === 'already' && <span>Attendance is already marked for this student.</span>}
                    {result.kind === 'error' && <span>{result.text}</span>}
                  </>}
            </>
          ) : <b>{result.text}</b>}
        </div>
      )}
      {isMock && <p className="demo">Try TE26-K7M2QX (absent) · TE26-9HP4WD (already present) · TE26-AAAAAA (invalid)</p>}
    </div>
  )
}
