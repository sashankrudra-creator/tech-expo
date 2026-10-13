from flask import Blueprint, Response, jsonify, request

from config import Config
from services import certificates
from services.database import get_repo
from utils.auth import admin_required, check_credentials, issue_token
from utils.errors import ApiError, NotFound
from utils.limiter import limiter
from utils.validators import clean_id

bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _id(raw):
    rid = clean_id(raw, Config.ID_PREFIX)
    if not rid:
        raise NotFound(f"No student found with ID {str(raw).upper()[:20]}.")
    return rid


@bp.post("/login")
@limiter.limit("10 per minute")
def login():
    body = request.get_json(silent=True) or {}
    if not check_credentials(body.get("username"), body.get("password")):
        raise ApiError("Wrong username or password.", 401)
    return jsonify(token=issue_token(Config.ADMIN_USERNAME), expires_in=Config.JWT_EXPIRES_HOURS * 3600)


@bp.get("/status")
@admin_required
def status():
    return jsonify(email_configured=Config.email_configured(), database=Config.DATABASE,
                   allow_duplicate_mobile=Config.ALLOW_DUPLICATE_MOBILE)


@bp.get("/participants")
@admin_required
def participants():
    return jsonify(get_repo().list_participants())


@bp.get("/participants/<rid>")
@admin_required
def participant(rid):
    return jsonify(get_repo().get(_id(rid)))


@bp.post("/attendance/<rid>")
@admin_required
def mark_attendance(rid):
    return jsonify(get_repo().mark_present(_id(rid)))


@bp.get("/certificates/<rid>/pdf")
@admin_required
def certificate_pdf(rid):
    p, pdf = certificates.pdf_for(_id(rid))
    return Response(pdf, mimetype="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="TechExpo-Certificate-{p["id"]}.pdf"'})


@bp.post("/certificates/<rid>/send")
@admin_required
def certificate_send(rid):
    return jsonify(certificates.send_one(_id(rid)))


@bp.post("/certificates/<rid>/retry")
@admin_required
def certificate_retry(rid):
    return jsonify(certificates.send_one(_id(rid)))


@bp.post("/certificates/send-all")
@admin_required
def certificate_send_all():
    return jsonify(certificates.send_all())
