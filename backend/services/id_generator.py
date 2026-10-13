"""
How the unique registration ID works
------------------------------------
Format: PREFIX-XXXXXX, e.g. TE26-K7M2QX

* The 6 characters are picked with Python's `secrets` module (cryptographically random),
  from 32 easy-to-read characters: no 0/O or 1/I/L, so IDs are easy to read out at the desk.
  32^6 ≈ 1.07 billion possible IDs.
* The ID is used as the Firestore document ID. The database layer writes it inside a
  transaction with `create()`, which fails if that document already exists, and retries
  with a fresh ID. So two students can never get the same ID, even if they register at
  the same second.
* The ID is stored with the record and never changes, so admins can always look it up.
"""
import secrets

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # 31 readable chars (no 0, O, 1, I, L)


def generate_id(prefix="TE26", length=6):
    return f"{prefix}-" + "".join(secrets.choice(ALPHABET) for _ in range(length))
