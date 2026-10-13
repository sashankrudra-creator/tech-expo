"""
Database layer.

FirestoreRepository  → the real Firebase Firestore database (DATABASE=firestore)
MemoryRepository     → temporary in-memory store for testing (DATABASE=memory)

Both have the same methods, so the rest of the app doesn't care which one is used.

Firestore layout
----------------
participants/{registration_id}
    id, name, mobile, email, present, present_at,
    certificate_generated, certificate_generated_at,
    email_status ('pending' | 'sent' | 'failed' | 'skipped'), email_error, email_sent_at,
    created_at, updated_at
mobile_index/{mobile}            (only when ALLOW_DUPLICATE_MOBILE=false)
    id → which registration owns this mobile number
"""
import copy
import json
import threading
from datetime import datetime, timezone

from config import Config
from utils.errors import Conflict, NotFound, ServiceUnavailable
from .id_generator import generate_id

PARTICIPANTS = "participants"
MOBILE_INDEX = "mobile_index"
MAX_ID_ATTEMPTS = 8


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_record(rid, data):
    t = now_iso()
    return {
        "id": rid, "name": data["name"], "mobile": data["mobile"], "email": data.get("email", ""),
        "present": False, "present_at": None,
        "certificate_generated": False, "certificate_generated_at": None,
        "email_status": "pending", "email_error": "", "email_sent_at": None,
        "created_at": t, "updated_at": t,
    }


class AlreadyPresent(Conflict):
    def __init__(self, participant):
        super().__init__("Attendance is already marked for this student.", participant=participant)


# ─────────────────────────── Firestore ───────────────────────────
class FirestoreRepository:
    def __init__(self):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
        except ImportError as e:  # pragma: no cover
            raise ServiceUnavailable("firebase-admin is not installed. Run: pip install -r requirements.txt") from e

        if not firebase_admin._apps:
            if Config.FIREBASE_CREDENTIALS_JSON:
                raw = Config.FIREBASE_CREDENTIALS_JSON.strip()
                if (raw.startswith("'") and raw.endswith("'")) or (raw.startswith('"') and raw.endswith('"')):
                    raw = raw[1:-1].strip()

                data = None
                if not raw.startswith("{"):
                    try:
                        import base64
                        decoded_bytes = base64.b64decode(raw)
                        data = json.loads(decoded_bytes.decode("utf-8"))
                    except Exception:
                        data = None

                if data is None:
                    try:
                        data = json.loads(raw)
                    except Exception as json_err:
                        try:
                            import ast
                            data = ast.literal_eval(raw)
                        except Exception:
                            raise ServiceUnavailable(f"Failed to parse FIREBASE_CREDENTIALS_JSON: {json_err}")

                if isinstance(data, str):
                    data = json.loads(data)
                if isinstance(data, dict) and "private_key" in data:
                    pk = data["private_key"]
                    if "\\n" in pk:
                        pk = pk.replace("\\n", "\n")
                    data["private_key"] = pk
                cred = credentials.Certificate(data)
            elif Config.FIREBASE_CREDENTIALS.exists():
                cred = credentials.Certificate(str(Config.FIREBASE_CREDENTIALS))
            else:
                raise ServiceUnavailable(
                    f"Database not connected: Firebase key file not found at {Config.FIREBASE_CREDENTIALS.name}. "
                    "See README → 'Connect Firebase'."
                )
            firebase_admin.initialize_app(cred)
        self._fs = firestore
        self.db = firestore.client()
        self.col = self.db.collection(PARTICIPANTS)
        self.mobiles = self.db.collection(MOBILE_INDEX)

    def create_participant(self, data):
        firestore = self._fs
        mob_ref = self.mobiles.document(data["mobile"])

        @firestore.transactional
        def txn(transaction):
            # 1) all reads first (Firestore rule for transactions)
            if not Config.ALLOW_DUPLICATE_MOBILE and mob_ref.get(transaction=transaction).exists:
                raise Conflict("This mobile number is already registered.")
            for _ in range(MAX_ID_ATTEMPTS):
                rid = generate_id(Config.ID_PREFIX, Config.ID_LENGTH)
                ref = self.col.document(rid)
                if not ref.get(transaction=transaction).exists:
                    break
            else:
                raise ServiceUnavailable("Could not create a unique ID. Please try again.")
            # 2) then writes. create() fails if the doc exists, so IDs can never be overwritten.
            record = new_record(rid, data)
            transaction.create(ref, record)
            if not Config.ALLOW_DUPLICATE_MOBILE:
                transaction.create(mob_ref, {"id": rid, "created_at": record["created_at"]})
            return record

        return txn(self.db.transaction())

    def list_participants(self):
        docs = self.col.order_by("created_at", direction=self._fs.Query.DESCENDING).stream()
        return [d.to_dict() for d in docs]

    def list_present(self):
        try:
            from google.cloud.firestore_v1.base_query import FieldFilter
            query = self.col.where(filter=FieldFilter("present", "==", True))
        except ImportError:  # older library versions
            query = self.col.where("present", "==", True)
        return [d.to_dict() for d in query.stream()]

    def get(self, rid):
        snap = self.col.document(rid).get()
        if not snap.exists:
            raise NotFound(f"No student found with ID {rid}.")
        return snap.to_dict()

    def mark_present(self, rid):
        ref = self.col.document(rid)

        @self._fs.transactional
        def txn(transaction):
            snap = ref.get(transaction=transaction)
            if not snap.exists:
                raise NotFound(f"No student found with ID {rid}.")
            p = snap.to_dict()
            if p.get("present"):
                raise AlreadyPresent(p)
            changes = {"present": True, "present_at": now_iso(), "updated_at": now_iso()}
            transaction.update(ref, changes)
            p.update(changes)
            return p

        return txn(self.db.transaction())

    def update(self, rid, changes):
        changes = {**changes, "updated_at": now_iso()}
        self.col.document(rid).update(changes)
        return changes


# ─────────────────────────── In-memory (testing) ───────────────────────────
class MemoryRepository:
    def __init__(self):
        self._lock = threading.Lock()
        self._rows = {}
        self._mobiles = {}

    def create_participant(self, data):
        with self._lock:
            if not Config.ALLOW_DUPLICATE_MOBILE and data["mobile"] in self._mobiles:
                raise Conflict("This mobile number is already registered.")
            for _ in range(MAX_ID_ATTEMPTS):
                rid = generate_id(Config.ID_PREFIX, Config.ID_LENGTH)
                if rid not in self._rows:
                    break
            else:
                raise ServiceUnavailable("Could not create a unique ID. Please try again.")
            record = new_record(rid, data)
            self._rows[rid] = record
            self._mobiles[data["mobile"]] = rid
            return copy.deepcopy(record)

    def list_participants(self):
        with self._lock:
            return sorted(copy.deepcopy(list(self._rows.values())), key=lambda p: p["created_at"], reverse=True)

    def list_present(self):
        return [p for p in self.list_participants() if p["present"]]

    def get(self, rid):
        with self._lock:
            if rid not in self._rows:
                raise NotFound(f"No student found with ID {rid}.")
            return copy.deepcopy(self._rows[rid])

    def mark_present(self, rid):
        with self._lock:
            p = self._rows.get(rid)
            if not p:
                raise NotFound(f"No student found with ID {rid}.")
            if p["present"]:
                raise AlreadyPresent(copy.deepcopy(p))
            p.update({"present": True, "present_at": now_iso(), "updated_at": now_iso()})
            return copy.deepcopy(p)

    def update(self, rid, changes):
        with self._lock:
            self._rows[rid].update({**changes, "updated_at": now_iso()})
            return changes


_repo = None
_repo_lock = threading.Lock()


def get_repo():
    """Creates the database connection on first use (so the server starts even before Firebase is set up)."""
    global _repo
    if _repo is None:
        with _repo_lock:
            if _repo is None:
                _repo = MemoryRepository() if Config.DATABASE == "memory" else FirestoreRepository()
    return _repo
