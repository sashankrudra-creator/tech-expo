"""
Certificate rules (enforced here, on the server):
  * Only students marked PRESENT get certificates.
  * Only students with a VALID email get one by email.
  * Students without email are skipped for email (they can still get a PDF from the admin).
Every result is saved to Firestore: certificate_generated, email_status, email_error, timestamps.
"""
import smtplib

from utils.errors import ApiError
from utils.validators import is_valid_email
from .certificate_pdf import build_certificate
from .database import get_repo, now_iso
from .email_service import Mailer


def _error_text(exc):
    if isinstance(exc, smtplib.SMTPAuthenticationError):
        return "SMTP login failed. Check SMTP_USERNAME / SMTP_PASSWORD."
    if isinstance(exc, smtplib.SMTPRecipientsRefused):
        return "The email address was rejected by the mail server."
    if isinstance(exc, smtplib.SMTPResponseException):
        return f"SMTP {exc.smtp_code}: {exc.smtp_error.decode(errors='ignore') if isinstance(exc.smtp_error, bytes) else exc.smtp_error}"[:300]
    return (str(exc) or exc.__class__.__name__)[:300]


def pdf_for(rid):
    """PDF download for one present student (no email needed)."""
    repo = get_repo()
    p = repo.get(rid)
    if not p["present"]:
        raise ApiError("Certificates are only for students marked present.", 400)
    pdf = build_certificate(p)
    if not p.get("certificate_generated"):
        repo.update(rid, {"certificate_generated": True, "certificate_generated_at": now_iso()})
    return p, pdf


def _send(repo, mailer, p):
    """Sends one certificate. Returns 'sent' | 'failed' | 'skipped' and saves the status."""
    if not p.get("email"):
        repo.update(p["id"], {"email_status": "skipped", "email_error": "No email address"})
        return "skipped"
    if not is_valid_email(p["email"]):
        repo.update(p["id"], {"email_status": "failed", "email_error": "Invalid email address"})
        return "failed"
    pdf = build_certificate(p)
    changes = {"certificate_generated": True}
    if not p.get("certificate_generated_at"):
        changes["certificate_generated_at"] = now_iso()
    try:
        mailer.send(p, pdf)
        changes.update(email_status="sent", email_error="", email_sent_at=now_iso())
        result = "sent"
    except smtplib.SMTPAuthenticationError:
        # A settings problem, not this student's fault: stop instead of marking everyone failed.
        raise ApiError("SMTP login failed. Check SMTP_USERNAME and SMTP_PASSWORD in backend/.env.", 502)
    except Exception as exc:  # record the reason so the admin can retry
        changes.update(email_status="failed", email_error=_error_text(exc))
        result = "failed"
    repo.update(p["id"], changes)
    return result


def send_one(rid):
    repo = get_repo()
    p = repo.get(rid)
    if not p["present"]:
        raise ApiError("This student was not marked present, so no certificate is sent.", 400)
    if not p.get("email"):
        raise ApiError("This student did not give an email address. Download the PDF instead.", 400)
    with Mailer() as mailer:
        result = _send(repo, mailer, p)
    updated = repo.get(rid)
    if result != "sent":
        raise ApiError(f"Email failed: {updated.get('email_error')}", 502, participant=updated)
    return updated


def send_all():
    """Emails every eligible present student who hasn't already received one."""
    repo = get_repo()
    summary = {"sent": 0, "failed": 0, "skipped": 0, "already_sent": 0}
    present = repo.list_present()
    with Mailer() as mailer:
        for p in present:
            if p.get("email_status") == "sent":
                summary["already_sent"] += 1
                continue
            summary[_send(repo, mailer, p)] += 1
    return summary
