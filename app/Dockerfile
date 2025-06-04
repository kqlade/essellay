# Base image with Python 3.11
FROM python:3.11-slim AS base

# Install system packages if needed (none for now)

# ---- Install Python deps ----
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# ---- Copy application ----
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8000

# Default command: run Uvicorn
CMD ["uvicorn", "app.sla_checker_backend:app", "--host", "0.0.0.0", "--port", "8000"]
