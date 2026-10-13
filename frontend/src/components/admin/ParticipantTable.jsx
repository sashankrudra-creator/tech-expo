import { useEffect, useMemo, useState } from 'react'
import { certStatus, isEligible } from './helpers'
import { api } from '../../api/client'

export default function ParticipantTable({
  people,
  onView,
  onChange,
  toast,
  activeAttFilter = '',
  onAttFilterChange,
}) {
  const [q, setQ] = useState('')
  const [att, setAtt] = useState(activeAttFilter)
  const [cert, setCert] = useState('')
  const [markingId, setMarkingId] = useState(null)

  useEffect(() => {
    setAtt(activeAttFilter)
  }, [activeAttFilter])

  const handleAttFilter = (val) => {
    setAtt(val)
    if (onAttFilterChange) onAttFilterChange(val)
  }

  const presentCount = useMemo(() => people.filter((p) => p.present).length, [people])
  const absentCount = people.length - presentCount

  const rows = useMemo(() => people.filter((p) => {
    const s = q.trim().toLowerCase()
    if (s && ![p.id, p.name, p.mobile, p.email].some((v) => (v || '').toLowerCase().includes(s))) return false
    if (att === 'present' && !p.present) return false
    if (att === 'absent' && p.present) return false
    if (cert === 'eligible' && !isEligible(p)) return false
    if (cert === 'noemail' && p.email) return false
    if (cert === 'sent' && p.email_status !== 'sent') return false
    if (cert === 'failed' && p.email_status !== 'failed') return false
    return true
  }), [people, q, att, cert])

  const markDirect = async (p) => {
    setMarkingId(p.id)
    try {
      await api.markPresent(p.id)
      toast(`Marked present: ${p.name}`)
      if (onChange) onChange()
    } catch (err) {
      toast(err.message || 'Could not mark attendance')
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <div className="panel mt">
      <div className="panel-head">
        <div>
          <h3>All Registered Participants</h3>
          <p className="sub" style={{ margin: '4px 0 0' }}>
            Filter or search to see who attended and who has not arrived yet.
          </p>
        </div>
        <span className="sub" style={{ fontWeight: 800 }}>{rows.length} of {people.length} shown</span>
      </div>

      {/* Quick Attendance Filter Tabs */}
      <div className="filter-tabs mt-s">
        <button
          type="button"
          className={`tab-btn ${att === '' ? 'active' : ''}`}
          onClick={() => handleAttFilter('')}
        >
          All Registered ({people.length})
        </button>
        <button
          type="button"
          className={`tab-btn ok ${att === 'present' ? 'active' : ''}`}
          onClick={() => handleAttFilter('present')}
        >
          ✓ Attended / Present ({presentCount})
        </button>
        <button
          type="button"
          className={`tab-btn warn ${att === 'absent' ? 'active' : ''}`}
          onClick={() => handleAttFilter('absent')}
        >
          ✗ Not Attended / Absent ({absentCount})
        </button>
      </div>

      <div className="row mt-s">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by ID, student name, mobile or email…"
          aria-label="Search participants"
        />
        <select value={att} onChange={(e) => handleAttFilter(e.target.value)} aria-label="Attendance filter">
          <option value="">All attendance status</option>
          <option value="present">Attended (Present)</option>
          <option value="absent">Not Attended (Absent)</option>
        </select>
        <select value={cert} onChange={(e) => setCert(e.target.value)} aria-label="Certificate filter">
          <option value="">All certificates</option>
          <option value="eligible">Eligible for email</option>
          <option value="noemail">No email provided</option>
          <option value="sent">Certificate sent</option>
          <option value="failed">Email failed</option>
        </select>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Entry ID</th>
              <th>Student Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Attendance Status</th>
              <th>Certificate</th>
              <th>Quick Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const [k, l] = certStatus(p)
              return (
                <tr key={p.id}>
                  <td className="mono id">{p.id}</td>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>{p.mobile}</td>
                  <td>{p.email || <span className="muted">—</span>}</td>
                  <td>
                    {p.present ? (
                      <span className="pill ok">✓ Present</span>
                    ) : (
                      <span className="pill bad">✗ Absent</span>
                    )}
                  </td>
                  <td><span className={`pill ${k}`}>{l}</span></td>
                  <td>
                    {p.present ? (
                      <button className="linkbtn" type="button" onClick={() => onView(p)}>
                        View certificate
                      </button>
                    ) : (
                      <button
                        className="btn"
                        style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--ok)' }}
                        type="button"
                        disabled={markingId === p.id}
                        onClick={() => markDirect(p)}
                        title={`Mark ${p.name} as attended`}
                      >
                        {markingId === p.id ? 'Saving…' : '✓ Mark Present'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {!rows.length && (
              <tr>
                <td colSpan="7" className="muted" style={{ textAlign: 'center', padding: '24px' }}>
                  No participants match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
