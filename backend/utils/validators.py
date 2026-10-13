"""Input checks. Same rules as frontend/src/api/validate.js — the backend is the one that counts."""
import re

from .errors import ValidationError

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
MOBILE_RE = re.compile(r"^[6-9]\d{9}$")
BAD_NAME_CHARS = re.compile(r"[0-9<>{}\[\]@#$%^*=+|\\/~`;:!?\"_]")


def is_valid_email(email):
    return bool(email) and len(email) <= 120 and bool(EMAIL_RE.match(email))


def clean_registration(payload):
    """Returns cleaned {name, mobile, email} or raises ValidationError with per-field messages."""
    if not isinstance(payload, dict):
        raise ValidationError({"form": "Send the form as JSON."})
    name = " ".join(str(payload.get("name", "")).split())
    mobile = re.sub(r"\D", "", str(payload.get("mobile", "")))
    if len(mobile) == 12 and mobile.startswith("91"):  # allow +91 prefix
        mobile = mobile[2:]
    email = str(payload.get("email", "") or "").strip().lower()

    errors = {}
    if len(name) < 2:
        errors["name"] = "Enter the student's full name."
    elif len(name) > 80:
        errors["name"] = "Name is too long."
    elif BAD_NAME_CHARS.search(name):
        errors["name"] = "Use letters only in the name."
    if not MOBILE_RE.match(mobile):
        errors["mobile"] = "Enter a valid 10-digit mobile number."
    if email and not is_valid_email(email):
        errors["email"] = "Check the email format, or leave it blank."
    if errors:
        raise ValidationError(errors)
    return {"name": name, "mobile": mobile, "email": email}


def clean_id(raw, prefix):
    rid = str(raw or "").strip().upper()
    return rid if re.fullmatch(rf"{re.escape(prefix)}-[A-Z0-9]{{4,12}}", rid) else None
