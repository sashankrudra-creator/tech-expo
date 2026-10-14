import os
from flask import Blueprint, jsonify, request, send_from_directory

from config import Config
from services.database import get_repo
from utils.limiter import limiter
from utils.validators import clean_registration

bp = Blueprint("public", __name__, url_prefix="/api")

PUBLIC_FIELDS = ("id", "name", "email", "created_at")
ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))


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


@bp.get("/assets/<path:filename>")
def get_asset(filename):
    """Serve media assets (images, gifs, video) from backend assets folder."""
    return send_from_directory(ASSETS_DIR, filename)


@bp.get("/gallery")
def get_gallery():
    """Return previous expos gallery metadata and asset endpoints."""
    items = [
        {
            "id": "bot-video-run",
            "title": "Autonomous Arena Live Demonstration",
            "type": "video",
            "src": "/api/assets/botvideo.mp4",
            "category": "videos",
            "year": "Tech Expo 2025",
            "badge": "🎥 Live Demo Video",
            "badgeColor": "coral",
            "spotlight": True,
            "shortDesc": "Live arena run of student-built autonomous robot navigating dynamic turns and obstacles.",
            "tags": ["Live Video", "Autonomous Navigation", "PID Speed Control", "Arena Showcase"],
        },
        {
            "id": "bot-agility-gif",
            "title": "High-Speed Agility & Obstacle Reaction",
            "type": "gif",
            "src": "/api/assets/bot.gif",
            "category": "videos",
            "year": "Tech Expo 2025",
            "badge": "⚡ Live Animation",
            "badgeColor": "teal",
            "shortDesc": "Dynamic test capture demonstrating millisecond ultrasonic response and rapid motor reversal.",
            "tags": ["Animated GIF", "Ultrasonic Ping", "Fast Reflexes"],
        },
        {
            "id": "maze-solver-bot",
            "title": "Micro-Maze Solving Robot",
            "type": "image",
            "src": "/api/assets/Maze_solver_robotGY44ZY.avif",
            "category": "robotics",
            "year": "Tech Expo 2024",
            "badge": "🤖 Flood-Fill Solver",
            "badgeColor": "blue",
            "shortDesc": "Algorithmic maze runner designed to map unknown labyrinth layouts and calculate shortest exit paths.",
            "tags": ["Flood-Fill Algorithm", "IR Distance Arrays", "Wall Following"],
        },
        {
            "id": "robo-soccer-champs",
            "title": "Robo Soccer Cup Finalist",
            "type": "image",
            "src": "/api/assets/robo-soccer-card.webp",
            "category": "competitions",
            "year": "Tech Expo 2025",
            "badge": "🏆 Tournament Finalist",
            "badgeColor": "sun",
            "shortDesc": "Custom-geared wireless striker robot crafted for the fast-paced inter-school Robo Soccer tournament.",
            "tags": ["Robo Soccer", "RF Remote Link", "Competition"],
        },
        {
            "id": "dual-deck-rover",
            "title": "Dual-Chassis Smart Rover",
            "type": "image",
            "src": "/api/assets/bot2.jpeg",
            "category": "robotics",
            "year": "Tech Expo 2024",
            "badge": "🛠️ Hardware Architecture",
            "badgeColor": "blue",
            "shortDesc": "Modular acrylic chassis loaded with motor drivers, power distribution board, and sensor brackets.",
            "tags": ["Dual-Tier Chassis", "Motor Shield", "Arduino"],
        },
        {
            "id": "mg90s-gripper",
            "title": "Precision Servo Actuator Arm",
            "type": "image",
            "src": "/api/assets/mg90s.jpeg",
            "category": "engineering",
            "year": "Tech Expo 2024",
            "badge": "⚙️ Servo Mechanics",
            "badgeColor": "coral",
            "shortDesc": "Metal-gear micro servo actuator delivering high-torque mechanical grip for automated sorting.",
            "tags": ["MG90S Metal Gear", "PWM Signal", "Mechanical Gripper"],
        },
        {
            "id": "stem-lab-prototype",
            "title": "Student STEM Innovation Lab",
            "type": "image",
            "src": "/api/assets/image0038WDK.jpg",
            "category": "engineering",
            "year": "Previous Expos",
            "badge": "💡 Lab Innovation",
            "badgeColor": "teal",
            "shortDesc": "Where code meets copper: students testing circuit breadboards, sensors, and calibration parameters.",
            "tags": ["Circuit Prototyping", "Breadboard Testing", "Student STEM"],
        },
    ]
    return jsonify(ok=True, items=items)


@bp.post("/register")
@limiter.limit(lambda: Config.REGISTER_RATE_LIMIT)
def register():
    data = clean_registration(request.get_json(silent=True))
    record = get_repo().create_participant(data)
    # Only return what the student needs to see.
    return jsonify({k: record[k] for k in PUBLIC_FIELDS} | {"mobile": data["mobile"]}), 201

