from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Per-IP limits. Stored in memory (fine for one server). Note: a whole school on one
# Wi-Fi shares one IP, so keep REGISTER_RATE_LIMIT generous.
limiter = Limiter(key_func=get_remote_address, default_limits=[], storage_uri="memory://")
