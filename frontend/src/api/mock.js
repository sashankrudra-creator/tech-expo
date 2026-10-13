// Sample in-memory backend for the design preview (VITE_USE_MOCK=true).
// It mirrors the Flask API responses so the UI works the same either way.
import { validEmail } from './validate'

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms))
const clone = (x) => JSON.parse(JSON.stringify(x))
const fail = (message, status = 400) => { const e = new Error(message); e.status = status; throw e }

const db = [
  ['TE26-K7M2QX', 'Aarav Sharma', '9876543210', 'aarav.s@gmail.com', false, 'pending', ''],
  ['TE26-9HP4WD', 'Diya Reddy', '9845012367', 'diya.reddy@yahoo.com', true, 'sent', ''],
  ['TE26-R3TN8B', 'Vihaan Kumar', '9701234588', '', true, 'skipped', 'No email address'],
  ['TE26-M5ZC2L', 'Ananya Iyer', '9988776655', 'ananya.iyer@gmail.com', true, 'failed', 'SMTP 550: mailbox unavailable'],
  ['TE26-B8QW6J', 'Kabir Nair', '9123456780', 'kabir.n@outlook.com', false, 'pending', ''],
  ['TE26-H2VX9P', 'Saanvi Patel', '9012345678', 'saanvi.p@gmail.com', true, 'pending', ''],
  ['TE26-T6KD3R', 'Arjun Rao', '9445566778', '', false, 'pending', ''],
  ['TE26-W4NF7G', 'Meera Joshi', '9334455667', 'meera.j@gmail.com', true, 'pending', ''],
  ['TE26-C9LY5S', 'Reyansh Gupta', '9223344556', 'reyansh.gupta@gmail', true, 'failed', 'Invalid email address'],
  ['TE26-P3GE8U', 'Ishita Verma', '9556677889', 'ishita.v@gmail.com', false, 'pending', ''],
].map(([id, name, mobile, email, present, email_status, email_error], i) => ({
  id, name, mobile, email, present, present_at: present ? new Date().toISOString() : null,
  certificate_generated: ['sent', 'failed'].includes(email_status), email_status, email_error,
  created_at: new Date(Date.now() - i * 3600e3).toISOString(),
}))

function send(p) {
  if (!p.present) return 'not_present'
  if (!p.email) { p.email_status = 'skipped'; p.email_error = 'No email address'; return 'skipped' }
  p.certificate_generated = true
  if (!validEmail(p.email)) { p.email_status = 'failed'; p.email_error = 'Invalid email address'; return 'failed' }
  p.email_status = 'sent'; p.email_error = ''; return 'sent'
}

export const mockApi = {
  async register({ name, mobile, email }) {
    await wait(600)
    if (db.some((p) => p.mobile === mobile)) fail('This mobile number is already registered.', 409)
    let id
    do { id = 'TE26-' + Array.from(crypto.getRandomValues(new Uint32Array(6)), (n) => ALPHA[n % 32]).join('') } while (db.some((p) => p.id === id))
    const p = { id, name, mobile, email: email || '', present: false, present_at: null, certificate_generated: false, email_status: 'pending', email_error: '', created_at: new Date().toISOString() }
    db.unshift(p)
    return clone(p)
  },
  async login() { await wait(); return { token: 'preview-token' } },
  async status() { return { email_configured: true, database: 'preview' } },
  async participants() { await wait(200); return clone(db) },
  async find(id) {
    await wait(250)
    const p = db.find((x) => x.id === id.trim().toUpperCase())
    if (!p) fail(`No student found with ID ${id.trim().toUpperCase()}.`, 404)
    return clone(p)
  },
  async markPresent(id) {
    await wait(300)
    const p = db.find((x) => x.id === id)
    if (!p) fail('No student found with that ID.', 404)
    if (p.present) fail('Attendance is already marked for this student.', 409)
    p.present = true; p.present_at = new Date().toISOString()
    return clone(p)
  },
  async sendAll() {
    await wait(900)
    const r = { sent: 0, skipped: 0, failed: 0, already_sent: 0 }
    db.filter((p) => p.present).forEach((p) => { if (p.email_status === 'sent') r.already_sent++; else r[send(p)]++ })
    return r
  },
  async sendOne(id) {
    await wait(600)
    const p = db.find((x) => x.id === id)
    const res = send(p)
    if (res === 'not_present') fail('This student was not marked present.')
    if (res === 'skipped') fail('This student did not give an email address.')
    if (res === 'failed') fail(p.email_error)
    return clone(p)
  },
  async downloadPdf() { fail('PDF download works once the Flask backend is running.') },
}
