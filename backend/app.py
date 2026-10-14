"""
Tech Expo backend (Flask).

Run for development:   python app.py
Run for production:    waitress-serve --port=5000 app:app
"""
import logging

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from config import Config
from routes import admin, public
from utils.errors import ApiError
from utils.limiter import limiter

log = logging.getLogger("tech-expo")


def create_app():
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 64 * 1024  # requests are tiny JSON bodies
    app.json.sort_keys = False

    CORS(app, resources={
        r"/api/*": {"origins": Config.FRONTEND_ORIGINS},
        r"/assets/*": {"origins": Config.FRONTEND_ORIGINS}
    }, expose_headers=["Content-Disposition"])

    limiter.init_app(app)
    app.register_blueprint(public.bp)
    app.register_blueprint(admin.bp)

    @app.route("/assets/<path:filename>")
    def direct_assets(filename):
        import os
        from flask import send_from_directory
        assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "assets"))
        return send_from_directory(assets_dir, filename)

    @app.errorhandler(ApiError)
    def api_error(e):
        body = {"error": e.message}
        body.update(e.extra)
        return jsonify(body), e.status

    @app.errorhandler(404)
    def not_found(_):
        return jsonify(error="Not found."), 404

    @app.errorhandler(405)
    def bad_method(_):
        return jsonify(error="Method not allowed."), 405

    @app.errorhandler(429)
    def too_many(_):
        return jsonify(error="Too many attempts. Please wait a minute and try again."), 429

    @app.errorhandler(Exception)
    def crash(e):
        if isinstance(e, HTTPException):
            return jsonify(error=e.description), e.code
        log.exception("Unhandled error")
        return jsonify(error="Something went wrong on the server. Please try again."), 500

    for problem in Config.problems():
        log.warning("⚠ CONFIG: %s (edit backend/.env)", problem)
    if Config.DATABASE == "memory":
        log.warning("⚠ DATABASE=memory: data is NOT saved. Set DATABASE=firestore for the real event.")
    if not Config.email_configured():
        log.warning("ℹ Email not configured: PDFs work, emailing is turned off.")
    return app


app = create_app()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    app.run(host="0.0.0.0", port=Config.PORT, debug=False)
