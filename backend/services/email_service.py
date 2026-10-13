"""Sends certificate emails over SMTP (works with Gmail, Outlook, Zoho, any SMTP server)."""
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from config import Config
from utils.errors import ServiceUnavailable


def build_message(participant, pdf_bytes):
    first = participant["name"].split(" ")[0]
    msg = EmailMessage()
    msg["Subject"] = f"Your {Config.EVENT_NAME} certificate"
    msg["From"] = formataddr((Config.EMAIL_FROM_NAME, Config.EMAIL_FROM))
    msg["To"] = participant["email"]
    msg.set_content(
        f"Hi {first},\n\n"
        f"Thank you for attending {Config.EVENT_NAME} at {Config.SCHOOL_NAME}!\n"
        f"Your certificate of participation is attached.\n\n"
        f"Entry ID: {participant['id']}\n\n"
        f"Keep building!\n{Config.SCHOOL_NAME}"
    )
    msg.add_alternative(f"""\
<div style="font-family:Arial,sans-serif;color:#1d2b4f;max-width:520px">
  <h2 style="color:#2f80ed;margin:0 0 8px">Thank you for coming, {first}!</h2>
  <p>We loved having you at <b>{Config.EVENT_NAME}</b>, {Config.SCHOOL_NAME}.</p>
  <p>Your certificate of participation is attached to this email as a PDF.</p>
  <p style="background:#d9f7ef;border-radius:10px;padding:10px 14px;font-family:monospace">Entry ID: <b>{participant['id']}</b></p>
  <p>Keep building! 🤖<br>{Config.SCHOOL_NAME}</p>
</div>""", subtype="html")
    safe = "".join(ch for ch in participant["name"] if ch.isalnum() or ch in " -").strip().replace(" ", "-") or "Student"
    msg.add_attachment(pdf_bytes, maintype="application", subtype="pdf", filename=f"TechExpo-Certificate-{safe}.pdf")
    return msg


class Mailer:
    """Keeps one SMTP connection open for a batch of emails. Use as a context manager."""

    def __init__(self):
        if not Config.email_configured():
            raise ServiceUnavailable("Email is not set up. Add SMTP settings to backend/.env (see README).")
        self.conn = None

    def _connect(self):
        ctx = ssl.create_default_context()
        if Config.SMTP_USE_SSL:
            conn = smtplib.SMTP_SSL(Config.SMTP_HOST, Config.SMTP_PORT, timeout=30, context=ctx)
        else:
            conn = smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT, timeout=30)
            conn.starttls(context=ctx)
        conn.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
        return conn

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        if self.conn:
            try:
                self.conn.quit()
            except Exception:
                pass

    def send(self, participant, pdf_bytes):
        msg = build_message(participant, pdf_bytes)
        for attempt in (1, 2):  # reconnect once if the server dropped the connection
            try:
                if self.conn is None:
                    self.conn = self._connect()
                self.conn.send_message(msg)
                return
            except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, OSError):
                self.conn = None
                if attempt == 2:
                    raise
