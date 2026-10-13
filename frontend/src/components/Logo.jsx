import { SCHOOL } from '../config/event'

// Drop your logo into src/assets/ named school-logo.png (or .jpg / .svg / .webp).
// It is picked up automatically; until then a dashed placeholder is shown.
const found = import.meta.glob('../assets/school-logo.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' })
export const LOGO_SRC = Object.values(found)[0] || null

export default function Logo({ size = 44, variant = '', className = '' }) {
  if (LOGO_SRC) {
    return <img className={`logo-img ${className}`} src={LOGO_SRC} alt={`${SCHOOL.name} logo`} style={{ width: size, height: size }} />
  }
  return (
    <div className={`logo ${variant} ${className}`} style={{ width: size, height: size, fontSize: Math.max(8, size / 5.5) }} aria-label="School logo placeholder">
      {size > 90 ? <>YOUR<br />SCHOOL<br />LOGO</> : <>SCHOOL<br />LOGO</>}
    </div>
  )
}
