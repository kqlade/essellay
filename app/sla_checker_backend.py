from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="SLA Checker Backend")

# Path to the static assets (HTML/JS/CSS)
BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, "static")

# Mount the static directory. Setting html=True allows index.html fallback on unmatched routes.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")

# ---------------------------------------------------------------------------
# Optional: hot-reload the browser during local development.
# If the package isn't installed (e.g. in production), just ignore the import.
# ---------------------------------------------------------------------------
try:
    from fastapi_livereload import LiveReload  # type: ignore

    LiveReload(app)
except ModuleNotFoundError:
    # It's fine—livereload is only useful in dev.
    pass

# ---------------------------------------------------------------------------
# Example API route (all API endpoints should be prefixed with /api to avoid
# clashing with the static frontend files).
# ---------------------------------------------------------------------------

@app.get("/api/ping")
async def ping():
    """Health-check endpoint."""
    return {"message": "pong"}
