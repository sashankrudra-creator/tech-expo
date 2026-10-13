import { useEffect, useRef, useState } from 'react'

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Typewriter that cycles through words. */
export function useTyping(words) {
  const [text, setText] = useState(reduced() ? words[0] : '')
  useEffect(() => {
    if (reduced()) return
    let w = 0, i = 0, del = false, t
    const tick = () => {
      const word = words[w]
      setText(word.slice(0, i))
      if (!del && i < word.length) { i++; t = setTimeout(tick, 80) }
      else if (!del) { del = true; t = setTimeout(tick, 1400) }
      else if (i > 0) { i--; t = setTimeout(tick, 40) }
      else { del = false; w = (w + 1) % words.length; t = setTimeout(tick, 300) }
    }
    tick()
    return () => clearTimeout(t)
  }, [words])
  return text
}

/** Live countdown to an ISO date. */
export function useCountdown(iso) {
  const target = new Date(iso).getTime()
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const s = Math.max(0, Math.floor((target - now) / 1000))
  const p = (n) => String(n).padStart(2, '0')
  return { d: p(Math.floor(s / 86400)), h: p(Math.floor((s % 86400) / 3600)), m: p(Math.floor((s % 3600) / 60)), s: p(s % 60) }
}

/** Slides an element up a little when it scrolls into view (content is visible from the start). */
export function useReveal(delay = 0) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reduced() || !('IntersectionObserver' in window)) return
    if (el.getBoundingClientRect().top < window.innerHeight) return
    el.classList.add('pre'); el.style.transitionDelay = `${delay}ms`
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.remove('pre'); io.disconnect() } }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [delay])
  return ref
}
