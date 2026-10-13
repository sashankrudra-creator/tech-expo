"""All settings come from the .env file (see .env.example)."""
import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _path(value):
    p = Path(value)
    return p if p.is_absolute() else BASE_DIR / p


class Config:
    DATABASE = os.getenv("DATABASE", "firestore").strip().lower()
    FIREBASE_CREDENTIALS = _path(os.getenv("FIREBASE_CREDENTIALS", "serviceAccountKey.json"))
    FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON", "").strip()

    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
    ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "").strip()
    JWT_SECRET = os.getenv("JWT_SECRET", "")
    JWT_EXPIRES_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "12"))

    FRONTEND_ORIGINS = [o.strip() for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",") if o.strip()]
    ALLOW_DUPLICATE_MOBILE = _bool("ALLOW_DUPLICATE_MOBILE", False)
    REGISTER_RATE_LIMIT = os.getenv("REGISTER_RATE_LIMIT", "30 per minute")

    ID_PREFIX = os.getenv("ID_PREFIX", "TE26").strip().upper()
    ID_LENGTH = int(os.getenv("ID_LENGTH", "6"))

    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USE_SSL = _bool("SMTP_USE_SSL", False)
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "").strip()
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "")  # Gmail app passwords are shown with spaces
    EMAIL_FROM = os.getenv("EMAIL_FROM", "").strip() or SMTP_USERNAME
    EMAIL_FROM_NAME = os.getenv("EMAIL_FROM_NAME", "Tech Expo")

    EVENT_NAME = os.getenv("EVENT_NAME", "Tech Expo 2026")
    EVENT_DATE = os.getenv("EVENT_DATE", "14 November 2026")
    EVENT_VENUE = os.getenv("EVENT_VENUE", "School Auditorium")
    SCHOOL_NAME = os.getenv("SCHOOL_NAME", "Your School Name")
    SIGNATORY_LEFT = os.getenv("SIGNATORY_LEFT", "Principal")
    SIGNATORY_RIGHT = os.getenv("SIGNATORY_RIGHT", "Event Coordinator")
    CERT_LOGO_PATH = _path(os.getenv("CERT_LOGO_PATH", "assets/school-logo.png"))

    PORT = int(os.getenv("PORT", "5000"))

    @classmethod
    def email_configured(cls):
        return bool(cls.SMTP_HOST and cls.SMTP_USERNAME and cls.SMTP_PASSWORD and cls.EMAIL_FROM)

    @classmethod
    def problems(cls):
        """Settings that must be fixed before running for real."""
        out = []
        if not cls.JWT_SECRET or cls.JWT_SECRET.startswith("replace-with"):
            out.append("JWT_SECRET is not set to a random value")
        if not (cls.ADMIN_PASSWORD or cls.ADMIN_PASSWORD_HASH) or cls.ADMIN_PASSWORD == "change-this-password":
            out.append("ADMIN_PASSWORD is still the default")
        if cls.DATABASE not in {"firestore", "memory"}:
            out.append("DATABASE must be 'firestore' or 'memory'")
        return out
