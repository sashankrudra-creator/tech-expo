from flask import Blueprint, jsonify, request

from config import Config
from services.database import get_repo
from utils.limiter import limiter
from utils.validators import clean_registration

bp = Blueprint("public", __name__, url_prefix="/api")

PUBLIC_FIELDS = ("id", "name", "email", "created_at")


@bp.get("/health")
def health():
    return jsonify(ok=True, database=Config.DATABASE)


@bp.post("/register")
@limiter.limit(lambda: Config.REGISTER_RATE_LIMIT)
def register():
    data = clean_registration(request.get_json(silent=True))
    record = get_repo().create_participant(data)
    # Only return what the student needs to see.
    return jsonify({k: record[k] for k in PUBLIC_FIELDS} | {"mobile": data["mobile"]}), 201
