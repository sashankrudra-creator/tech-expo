import { validEmail } from '../../api/validate'

export const isEligible = (p) => p.present && !!p.email && validEmail(p.email)

/** [pill class, label] for a participant's certificate status. */
export function certStatus(p) {
  if (!p.email) return ['no', 'No email']
  if (!validEmail(p.email)) return ['bad', 'Bad email']
  if (p.email_status === 'sent') return ['ok', 'Sent']
  if (p.email_status === 'failed') return ['bad', 'Failed']
  if (!p.present) return ['no', 'Not eligible']
  return ['warn', 'Ready']
}

export const initials = (name) => name.split(' ').filter(Boolean).map((s) => s[0]).join('').slice(0, 2).toUpperCase()
