import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, hasToken, setToken } from '../../api/client'
import { useToast } from '../../components/Ui'
import LoginForm from '../../components/admin/LoginForm'
import AttendancePanel from '../../components/admin/AttendancePanel'
import CertificatePanel from '../../components/admin/CertificatePanel'
import ParticipantTable from '../../components/admin/ParticipantTable'
import CertificateModal from '../../components/admin/CertificateModal'
import { EVENT } from '../../config/event'

function Dashboard({ onLogout }) {
  const nav = useNavigate()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [emailReady, setEmailReady] = useState(true)
  const [viewing, setViewing] = useState(null)
  const [toast, showToast] = useToast()

  const load = useCallback(async () => {
    try {
      const [list, status] = await Promise.all([api.participants(), api.status()])
      setPeople(list); setEmailReady(!!status.email_configured); setError('')
    } catch (err) {
      if (err.status === 401) onLogout()
      else setError(err.message)
    } finally { setLoading(false) }
  }, [onLogout])
  useEffect(() => { load() }, [load])

  const total = people.length
  const present = people.filter((p) => p.present).length
  const absent = total - present
  const [attFilter, setAttFilter] = useState('')

  const stats = [
    ['Total Registered', total, 'cy', ''],
    ['Attended (Present)', present, 'ok', 'present'],
    ['Not Attended (Absent)', absent, absent > 0 ? 'bad' : '', 'absent'],
    ['Certificates sent', people.filter((p) => p.email_status === 'sent').length, 'ok', 'sent'],
    ['Failed emails', people.filter((p) => p.email_status === 'failed').length, 'bad', 'failed'],
  ]

  return (
    <div id="dash">
      <div className="admin-head">
        <h1>{EVENT.name} dashboard</h1>
        <div className="who">
          <button className="btn line" type="button" onClick={load}>↻ Refresh</button>
          <button className="btn line" type="button" onClick={() => nav('/')}>View website</button>
          <button className="btn line" type="button" onClick={onLogout}>Log out</button>
        </div>
      </div>
      {error && <div className="msg bad mb">{error}</div>}
      {loading ? <p className="sub">Loading participants…</p> : (
        <>
          <div className="stats">
            {stats.map(([k, n, c, filterVal]) => (
              <div
                key={k}
                className={`stat ${c} ${filterVal !== undefined && attFilter === filterVal ? 'active-filter' : ''}`}
                style={{ cursor: filterVal !== undefined ? 'pointer' : 'default' }}
                onClick={() => filterVal !== undefined && setAttFilter(attFilter === filterVal ? '' : filterVal)}
                title={filterVal !== undefined ? `Click to filter: ${k}` : undefined}
              >
                <div className="k">{k}</div>
                <div className="n">{n}</div>
              </div>
            ))}
          </div>
          <div className="cols">
            <AttendancePanel onChange={load} toast={showToast} />
            <CertificatePanel people={people} emailReady={emailReady} onChange={load} onView={setViewing} toast={showToast} />
          </div>
          <ParticipantTable
            people={people}
            onView={setViewing}
            onChange={load}
            toast={showToast}
            activeAttFilter={attFilter}
            onAttFilterChange={setAttFilter}
          />
        </>
      )}
      {viewing && <CertificateModal p={viewing} onClose={() => setViewing(null)} toast={showToast} />}
      {toast}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(hasToken())
  const logout = useCallback(() => { setToken(null); setAuthed(false) }, [])
  return (
    <div className="adminpage"><div className="wrap">
      {authed ? <Dashboard onLogout={logout} /> : <LoginForm onSuccess={() => setAuthed(true)} />}
    </div></div>
  )
}
