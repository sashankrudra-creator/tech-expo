from flask import Blueprint, jsonify, request

from config import Config
from services.database import get_repo
from utils.limiter import limiter
from utils.validators import clean_registration

bp = Blueprint("public", __name__, url_prefix="/api")

PUBLIC_FIELDS = ("id", "name", "email", "created_at")


@bp.get("/health")
def health():
    db_ok = True
    db_err = None
    diag = {}
    try:
        import os, json
        raw = os.getenv("FIREBASE_CREDENTIALS_JSON", "").strip()
        diag["raw_len"] = len(raw)
        diag["starts_with"] = raw[:20]
        diag["ends_with"] = raw[-20:]
        if raw:
            d = json.loads(raw)
            pk = d.get("private_key", "")
            diag["pk_len"] = len(pk)
            diag["pk_starts"] = pk[:30]
            diag["pk_ends"] = pk[-30:]
            diag["has_literal_slash_n"] = "\\n" in pk
            diag["has_real_newline"] = "\n" in pk
        get_repo()
    except Exception as e:
        db_ok = False
        db_err = f"{type(e).__name__}: {e}"
    return jsonify(ok=True, database=Config.DATABASE, db_connected=db_ok, db_error=db_err, diag=diag)


@bp.post("/register")
@limiter.limit(lambda: Config.REGISTER_RATE_LIMIT)
def register():
    data = clean_registration(request.get_json(silent=True))
    record = get_repo().create_participant(data)
    # Only return what the student needs to see.
    return jsonify({k: record[k] for k in PUBLIC_FIELDS} | {"mobile": data["mobile"]}), 201
