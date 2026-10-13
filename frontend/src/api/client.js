// Every call to the Flask backend goes through this file.
// VITE_USE_MOCK=true swaps in built-in sample data (used for the design preview only).
import { mockApi } from './mock'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
export const isMock = import.meta.env.VITE_USE_MOCK === 'true'

let token = null
try { token = sessionStorage.getItem('te_admin_token') } catch { /* storage blocked */ }
export function setToken(t) {
  token = t
  try { t ? sessionStorage.setItem('te_admin_token', t) : sessionStorage.removeItem('te_admin_token') } catch { /* ignore */ }
}
export const hasToken = () => !!token

async function http(path, { method = 'GET', body, blob = false } = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const e = new Error('Cannot reach the server. Is the Flask backend running?'); e.status = 0; throw e
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    err.fields = data.fields
    err.data = data
    if (res.status === 401 && path.startsWith('/admin') && path !== '/admin/login') setToken(null)
    throw err
  }
  return blob ? res.blob() : res.json()
}

const enc = encodeURIComponent
const realApi = {
  register: (data) => http('/register', { method: 'POST', body: data }),
  login: (data) => http('/admin/login', { method: 'POST', body: data }),
  status: () => http('/admin/status'),
  participants: () => http('/admin/participants'),
  find: (id) => http(`/admin/participants/${enc(id.trim().toUpperCase())}`),
  markPresent: (id) => http(`/admin/attendance/${enc(id)}`, { method: 'POST' }),
  sendAll: () => http('/admin/certificates/send-all', { method: 'POST' }),
  sendOne: (id) => http(`/admin/certificates/${enc(id)}/send`, { method: 'POST' }),
  async downloadPdf(id) {
    const blob = await http(`/admin/certificates/${enc(id)}/pdf`, { blob: true })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: `TechExpo-Certificate-${id}.pdf` })
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },
}

export const api = isMock ? mockApi : realApi
