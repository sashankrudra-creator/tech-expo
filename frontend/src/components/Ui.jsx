import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/** Coral "Register now" button — every one on the site opens the registration page. */
export function RegisterButton({ size = '', children = 'Register now', arrow = false, className = '', style }) {
  const nav = useNavigate()
  return (
    <button type="button" className={`cta ${size} ${className}`} style={style} onClick={() => nav('/register')}>
      {children} {arrow && <span className="arrow" aria-hidden="true">→</span>}
    </button>
  )
}

/** Small toast message at the bottom of the screen. */
export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2400); return () => clearTimeout(t) }, [msg])
  const show = useCallback((m) => setMsg(m), [])
  return [msg ? <div className="toast" role="status">{msg}</div> : null, show]
}

/** Confetti burst on a full-screen canvas. Changes to `fire` trigger a new burst. */
export function Confetti({ fire }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!fire || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current, x = c.getContext('2d')
    c.width = window.innerWidth; c.height = window.innerHeight
    const cols = ['#ffc531', '#ff6f59', '#14b8a6', '#2f80ed']
    const ps = Array.from({ length: 140 }, () => ({ x: c.width / 2, y: c.height / 3, vx: (Math.random() - 0.5) * 14, vy: Math.random() * -12 - 4, r: Math.random() * 6 + 4, c: cols[(Math.random() * 4) | 0], a: Math.random() * 6 }))
    let f = 0, raf
    const frame = () => {
      x.clearRect(0, 0, c.width, c.height)
      ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); x.restore() })
      if (++f < 110) raf = requestAnimationFrame(frame); else x.clearRect(0, 0, c.width, c.height)
    }
    frame()
    return () => cancelAnimationFrame(raf)
  }, [fire])
  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}

/** Copies text; falls back to selecting it if the clipboard is blocked. */
export async function copyText(text, el) {
  try { await navigator.clipboard.writeText(text); return true }
  catch {
    if (el) { const r = document.createRange(); r.selectNodeContents(el); getSelection().removeAllRanges(); getSelection().addRange(r) }
    return false
  }
}
