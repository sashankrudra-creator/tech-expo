"""Builds the participant certificate as a landscape A4 PDF (in memory) with ReportLab."""
from io import BytesIO

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

from config import Config

INK = HexColor("#1d2b4f")
BLUE = HexColor("#2f80ed")
SUN = HexColor("#ffc531")
CORAL = HexColor("#ff6f59")
TEAL = HexColor("#14b8a6")
MUTED = HexColor("#5d6b8c")
PAPER = HexColor("#fffdf6")


def _fit(text, font, max_size, max_width, min_size=18):
    size = max_size
    while size > min_size and stringWidth(text, font, size) > max_width:
        size -= 1
    return size


def _wrap(text, font, size, max_width):
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = f"{line} {w}".strip()
        if stringWidth(trial, font, size) <= max_width:
            line = trial
        else:
            lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def build_certificate(participant):
    """Returns PDF bytes for one participant."""
    buf = BytesIO()
    W, H = landscape(A4)
    c = canvas.Canvas(buf, pagesize=(W, H))
    c.setTitle(f"{Config.EVENT_NAME} Certificate - {participant['name']}")
    c.setAuthor(Config.SCHOOL_NAME)

    # background + frames
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(SUN); c.circle(0, H, 120, stroke=0, fill=1)
    c.setFillColor(BLUE); c.circle(W, 0, 140, stroke=0, fill=1)
    c.setFillColor(TEAL); c.circle(W - 40, H - 30, 26, stroke=0, fill=1)
    c.setStrokeColor(BLUE); c.setLineWidth(4); c.roundRect(24, 24, W - 48, H - 48, 12, stroke=1, fill=0)
    c.setStrokeColor(SUN); c.setLineWidth(2); c.roundRect(34, 34, W - 68, H - 68, 8, stroke=1, fill=0)

    cx = W / 2
    y = H - 70

    # logo
    logo = Config.CERT_LOGO_PATH
    if logo.exists():
        try:
            img = ImageReader(str(logo))
            iw, ih = img.getSize()
            h = 72
            w = iw * h / ih
            c.drawImage(img, cx - w / 2, y - h, w, h, mask="auto", preserveAspectRatio=True)
            y -= h + 18
        except Exception:  # bad image file → skip logo rather than fail the certificate
            y -= 50
    else:
        y -= 80  # no logo: keep the text block centred

    c.setFillColor(CORAL); c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(cx, y, " ".join(f"{Config.SCHOOL_NAME.upper()} PRESENTS"))
    y -= 46
    c.setFillColor(BLUE); c.setFont("Helvetica-Bold", 38)
    c.drawCentredString(cx, y, "Certificate of Participation")
    y -= 36
    c.setFillColor(INK); c.setFont("Helvetica", 15)
    c.drawCentredString(cx, y, "This certificate is proudly presented to")

    # participant name with underline
    y -= 56
    name = participant["name"]
    size = _fit(name, "Helvetica-Bold", 44, W - 220)
    c.setFont("Helvetica-Bold", size); c.setFillColor(INK)
    c.drawCentredString(cx, y, name)
    nw = stringWidth(name, "Helvetica-Bold", size)
    c.setStrokeColor(SUN); c.setLineWidth(3)
    c.line(cx - nw / 2 - 30, y - 12, cx + nw / 2 + 30, y - 12)

    # body text
    y -= 46
    c.setFont("Helvetica", 14); c.setFillColor(INK)
    body = (f"for taking part in {Config.EVENT_NAME}, the robotics showcase held on "
            f"{Config.EVENT_DATE} at {Config.EVENT_VENUE}.")
    for line in _wrap(body, "Helvetica", 14, W - 280):
        c.drawCentredString(cx, y, line)
        y -= 20

    c.setFont("Courier-Bold", 11); c.setFillColor(MUTED)
    c.drawCentredString(cx, y - 6, f"Entry ID: {participant['id']}")

    # signatures
    sy = 92
    for x, label in ((W * 0.28, Config.SIGNATORY_LEFT), (W * 0.72, Config.SIGNATORY_RIGHT)):
        c.setStrokeColor(INK); c.setLineWidth(1)
        c.line(x - 90, sy, x + 90, sy)
        c.setFont("Helvetica-Bold", 12); c.setFillColor(INK)
        c.drawCentredString(x, sy - 16, label)

    c.showPage()
    c.save()
    return buf.getvalue()
