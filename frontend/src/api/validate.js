// Same rules as the Flask backend (backend/utils/validators.py). The backend always re-checks.
export const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e || '')

export function validateRegistration({ name, mobile, email }) {
  const e = {}
  if (!name || name.length < 2) e.name = "Enter the student's full name."
  else if (name.length > 80) e.name = 'Name is too long.'
  else if (/[0-9<>{}[\]@#$%^*=+|\\/~`;:!?"_]/.test(name)) e.name = 'Use letters only in the name.'
  if (!/^[6-9]\d{9}$/.test(mobile || '')) e.mobile = 'Enter a valid 10-digit mobile number.'
  if (email && !validEmail(email)) e.email = 'Check the email format, or leave it blank.'
  return e
}
