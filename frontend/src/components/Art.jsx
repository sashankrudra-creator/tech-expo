// Hand-made SVG illustrations (no image downloads needed).

export function Cloud({ style, width = 140 }) {
  return (
    <svg className="cloud" style={style} width={width} viewBox="0 0 140 60" aria-hidden="true">
      <path d="M20 50h100a20 20 0 0 0 0-40 28 28 0 0 0-52-6A22 22 0 0 0 20 50z" fill="#fff" />
    </svg>
  )
}

export function HeroRobot() {
  return (
    <svg viewBox="0 0 440 400" aria-hidden="true">
      <circle cx="220" cy="210" r="170" fill="#fff" />
      <circle cx="220" cy="210" r="170" fill="none" stroke="#d6e6f5" strokeWidth="3" strokeDasharray="6 10" />
      <g className="spin">
        <path d="M58 92l8-3 3-9h10l3 9 8 3 8-5 7 7-5 8 3 8 9 3v10l-9 3-3 8 5 8-7 7-8-5-8 3-3 9H69l-3-9-8-3-8 5-7-7 5-8-3-8-9-3V102l9-3 3-8-5-8 7-7z" fill="#ffc531" />
        <circle cx="74" cy="107" r="10" fill="#fff" />
      </g>
      <g className="spin rev">
        <path d="M372 300l6-2 2-7h8l2 7 6 2 6-4 6 6-4 6 2 6 7 2v8l-7 2-2 6 4 6-6 6-6-4-6 2-2 7h-8l-2-7-6-2-6 4-6-6 4-6-2-6-7-2v-8l7-2 2-6-4-6 6-6z" fill="#14b8a6" />
        <circle cx="384" cy="314" r="8" fill="#fff" />
      </g>
      <g className="twinkle"><path d="M372 70l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" fill="#ff6f59" /></g>
      <g className="twinkle" style={{ animationDelay: '.7s' }}><path d="M70 300l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#2f80ed" /></g>
      <g className="bob">
        <line x1="220" y1="78" x2="220" y2="50" stroke="#1d2b4f" strokeWidth="6" strokeLinecap="round" />
        <circle cx="220" cy="44" r="12" fill="#ff6f59" />
        <rect x="150" y="76" width="140" height="104" rx="34" fill="#2f80ed" stroke="#1d2b4f" strokeWidth="6" />
        <rect x="168" y="96" width="104" height="62" rx="22" fill="#e3f3ff" />
        <ellipse className="blink" cx="196" cy="124" rx="11" ry="13" fill="#1d2b4f" />
        <ellipse className="blink" cx="244" cy="124" rx="11" ry="13" fill="#1d2b4f" />
        <path d="M206 144q14 10 28 0" stroke="#1d2b4f" strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="180" cy="146" r="7" fill="#ffb3a7" /><circle cx="260" cy="146" r="7" fill="#ffb3a7" />
        <rect x="166" y="188" width="108" height="100" rx="26" fill="#ffc531" stroke="#1d2b4f" strokeWidth="6" />
        <rect x="192" y="210" width="56" height="34" rx="10" fill="#fff" stroke="#1d2b4f" strokeWidth="4" />
        <circle cx="206" cy="227" r="5" fill="#14b8a6" /><circle cx="220" cy="227" r="5" fill="#ff6f59" /><circle cx="234" cy="227" r="5" fill="#2f80ed" />
        <rect x="126" y="196" width="34" height="74" rx="17" fill="#2f80ed" stroke="#1d2b4f" strokeWidth="6" />
        <g className="wave"><rect x="280" y="150" width="34" height="74" rx="17" fill="#2f80ed" stroke="#1d2b4f" strokeWidth="6" transform="rotate(-35 297 200)" /></g>
        <rect x="182" y="292" width="30" height="36" rx="10" fill="#1d2b4f" /><rect x="228" y="292" width="30" height="36" rx="10" fill="#1d2b4f" />
      </g>
      <ellipse cx="220" cy="356" rx="80" ry="10" fill="#1d2b4f" opacity=".1" />
    </svg>
  )
}

export function Rover() {
  return (
    <svg className="rover" viewBox="0 0 120 70" aria-hidden="true">
      <rect x="10" y="14" width="90" height="32" rx="10" fill="#14b8a6" stroke="#1d2b4f" strokeWidth="4" />
      <rect x="70" y="4" width="22" height="14" rx="4" fill="#fff" stroke="#1d2b4f" strokeWidth="4" />
      <circle cx="81" cy="11" r="3" fill="#ff6f59" />
      <g className="wheel"><circle cx="30" cy="52" r="14" fill="#1d2b4f" /><rect x="28" y="40" width="4" height="24" fill="#ffc531" /></g>
      <g className="wheel"><circle cx="82" cy="52" r="14" fill="#1d2b4f" /><rect x="80" y="40" width="4" height="24" fill="#ffc531" /></g>
    </svg>
  )
}

export function SmallBot({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <g className="bob">
        <rect x="30" y="20" width="60" height="44" rx="14" fill="#ffc531" stroke="#1d2b4f" strokeWidth="4" />
        <circle className="blink" cx="48" cy="42" r="6" fill="#1d2b4f" /><circle className="blink" cx="72" cy="42" r="6" fill="#1d2b4f" />
        <rect x="38" y="68" width="44" height="40" rx="12" fill="#fff" stroke="#1d2b4f" strokeWidth="4" />
        <line x1="60" y1="20" x2="60" y2="8" stroke="#1d2b4f" strokeWidth="4" /><circle cx="60" cy="6" r="5" fill="#ff6f59" />
      </g>
    </svg>
  )
}

export function ZoneIcon({ name }) {
  if (name === 'race') return (
    <svg viewBox="0 0 40 40"><rect x="5" y="12" width="30" height="16" rx="5" fill="#2f80ed" /><circle cx="12" cy="31" r="5" fill="#1d2b4f" /><circle cx="28" cy="31" r="5" fill="#1d2b4f" /><circle cx="30" cy="18" r="2.5" fill="#fff" /></svg>)
  if (name === 'arm') return (
    <svg viewBox="0 0 40 40"><path d="M8 34L15 20 27 13 32 6" stroke="#ff6f59" strokeWidth="4" fill="none" strokeLinecap="round" /><circle cx="15" cy="20" r="4" fill="#1d2b4f" /><circle cx="27" cy="13" r="4" fill="#1d2b4f" /><rect x="4" y="32" width="14" height="5" rx="2" fill="#1d2b4f" /></svg>)
  if (name === 'sense') return (
    <svg viewBox="0 0 40 40"><circle cx="20" cy="24" r="6" fill="#14b8a6" /><path d="M10 22a10 10 0 0 1 20 0M5 22a15 15 0 0 1 30 0" stroke="#14b8a6" strokeWidth="3.5" fill="none" strokeLinecap="round" /></svg>)
  return (
    <svg viewBox="0 0 40 40"><path d="M20 5l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#ffc531" stroke="#1d2b4f" strokeWidth="2.5" strokeLinejoin="round" /></svg>)
}
