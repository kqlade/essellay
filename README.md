# SLA Credit Tool

A single-page static tool for estimating AWS SLA credits in the browser. Export
your CloudWatch metrics, upload the CSV, and the page shows potential credit
amounts—no backend required.

**Disclaimer**: These calculations are approximations and may differ from
official AWS SLA metrics.

---
## 1.  Local development on Windows / Linux PC (with hot-reload)

### Prerequisites
| Tool | Why |
|------|-----|
| **Node ≥ 18** | serves the static site with hot reload |
| **Python ≥ 3.9** *(optional)* | only if you want to run your own Python scripts |
| **Git** | commit / push to GitHub |

### Steps
```bash
# 1  Clone the repo
git clone https://github.com/<YOUR-FORK>/essellay.git
cd essellay

# 2  Install dev server (one-off)
npm install -g http-server           # tiny static server with livereload flag

# 3  Start the dev server w/ live reload
http-server . -c-1 --cors -o --watch
#  • -c -1  = disable cache
#  • --watch = livereload on file changes
#  • -o      = auto-open browser
```
Edit any HTML / CSS / JS file → browser refreshes instantly.

> ⚠️  If you prefer Vite / Parcel / Webpack, feel free to swap in your favourite bundler; this repo is plain static so nothing is locked in.

---
## 2.  Python virtual-env (optional)
Only needed if you want to experiment with Python scripts (none shipped here):
```bash
python -m venv .venv
source .venv/bin/activate   # Windows 👉 .venv\Scripts\activate
pip install -r requirements.txt
```

---
## 3.  Git workflow
```bash
git status                 # see changed files
git add .                  # stage
git commit -m "feat: <your message>"
git push                   # push to origin/main
```
> After pushing, Railway (static deployment) will auto-build and redeploy.

If you're working on a feature branch:
```bash
git checkout -b feat/new-ui
# work …
git push -u origin feat/new-ui
```
Open a PR on GitHub → merge → Railway redeploys.

---
## 4.  Deploying on Railway (static site)
1. Login to Railway → **New Project ▸ Deploy from GitHub**.
2. Point at this repository.
3. Select **Static** when prompted.
4. Build command → leave blank (no build step).
5. Output directory → `./` (root).
6. Click **Deploy**.  Railway will serve the site over HTTPS.

Future pushes to `main` redeploy automatically.

---
## 5.  Useful npm Scripts (optional)
If you later add a bundler, add scripts to `package.json`, e.g.
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "http-server dist -o"
  }
}
```
Then use `npm run dev` for hot reload.

---
