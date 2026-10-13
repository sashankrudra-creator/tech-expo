"""Admin login with signed JWT tokens."""
import hmac
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import request
from werkzeug.security import check_password_hash

from config import Config
from .errors import ApiError


def check_credentials(username, password):
    if not hmac.compare_digest(str(username or ""), Config.ADMIN_USERNAME):
        return False
    if Config.ADMIN_PASSWORD_HASH:
        return check_password_hash(Config.ADMIN_PASSWORD_HASH, str(password or ""))
    return bool(Config.ADMIN_PASSWORD) and hmac.compare_digest(str(password or ""), Config.ADMIN_PASSWORD)


def issue_token(username):
    now = datetime.now(timezone.utc)
    payload = {"sub": username, "role": "admin", "iat": now, "exp": now + timedelta(hours=Config.JWT_EXPIRES_HOURS)}
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")


def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            raise ApiError("Please log in.", 401)
        try:
            data = jwt.decode(header[7:], Config.JWT_SECRET, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise ApiError("Your session expired. Please log in again.", 401)
        except jwt.InvalidTokenError:
            raise ApiError("Please log in.", 401)
        if data.get("role") != "admin":
            raise ApiError("Not allowed.", 403)
        return fn(*args, **kwargs)
    return wrapper
