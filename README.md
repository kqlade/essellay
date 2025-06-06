# SimpleScrollSpy
Simple ScrollSpy example done with pure JavaScript and CS

I noticed that many people strugle with scroll spy. Lots of them try to 
use some existing plugin but in the end get more problems then benefit. 

This very simple example probably could be done better, but it will fit 
its purpose.

## HTML & CSS
There are 5 div tags nested in body. Each one has full width and heght of
screen. Body has auto height with auto overflow so if the content is larger 
than screen it will get an scroll. There is also nav tag with 5 spans. One 
as a indicator for each div. They are conected by data attributes. So 
span with attribute data-scrollspy-indicator="target2" is indicator for
div with attribute data-scrollspy-target="target2". 

## JavaScript.
Since there is overflow scroll on my body I am attaching event listener on it. 
On each scroll I am looking at window height and going trough divs
that cointain data-scrollspy-target attribute. When I find one I am 
searching for span whos data-scrollspy-indicator attribute values
is same as this divs data-scrollspy-target attribute value. To that 
span I am setting class active and removing it from other.

Yes this could be easier to do with jQuery or whatever else in better way. 
Idea was to make it very simple as an example how it works.

# SLA-Credit Site

A single-page static tool that helps users export CloudWatch metrics, upload CSVs, and calculate their AWS SLA credits — all in the browser (no backend).

---
## 1.  Local development on Windows / Linux PC (with hot-reload)

### Prerequisites
| Tool | Why |
|------|-----|
| **Node ≥ 18** | serves the static site with hot reload |
| **Python ≥ 3.9** *(optional)* | only if you want to run the old back-end script `backend/sla_calc.py` |
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
Only needed if you experiment with `backend/` scripts:
```bash
python -m venv .venv
source .venv/bin/activate   # Windows 👉 .venv\Scripts\activate
pip install -r requirements.txt
```
Run: `python backend/sla_calc.py samples/*.csv`

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
### Enjoy hacking! 🎉