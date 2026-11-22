# ShortList – Menu Intelligence & Decision Platform

ShortList is a web application that lets restaurant customers upload or scan menus, filter out allergens and dislikes, and create a personalised shortlist. The platform captures behavioural intent data — what customers *almost* ordered — for restaurant analytics.

**Repo:** `SecondOrderResearch/shortlist` (private)

## Project structure

```
/backend          Express.js + PostgreSQL API (Node.js)
  server.js       Entry point — /api/ping health endpoint
  schema.sql      Database schema (users, restaurants, menus, menu_items, sessions)
  Dockerfile      Production image (Render)
  Dockerfile.dev  Dev container
/frontend         React + Vite + Tailwind CSS
  src/App.jsx     Landing shell — calls /api/ping
  src/main.jsx    React bootstrap
  index.html      Entry HTML
  vite.config.js  Dev server with /api proxy → localhost:3000
  Dockerfile.dev  Dev container
.github/workflows/deploy-frontend.yml   Deploys frontend to Vercel (free)
.github/workflows/deploy-backend.yml    Triggers Render deploy for backend (free)
docker-compose.yml
```

## Getting started (dev)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (optional, for Postgres + backend)

### Option A: Docker Compose (recommended)

```bash
cp backend/.env.example backend/.env
# edit backend/.env if you want different DB credentials
docker compose up -d
```

- Backend API: http://localhost:3000
- Frontend: http://localhost:5173

### Option B: Local Postgres + Node

```bash
# backend
cd backend
npm install
cp .env.example .env
# set DATABASE_URL to your local Postgres instance
npm run dev

# frontend (new terminal)
cd frontend
npm install
npm run dev
```

Then visit http://localhost:5173 — it proxies `/api` to the backend.

## Database schema

Run `backend/schema.sql` against your Postgres instance:

```bash
psql -U postgres -d shortlist -f backend/schema.sql
```

## Free deployment options

### Frontend — Vercel (free tier)

1. Create a free account at https://vercel.com.
2. Import the `SecondOrderResearch/shortlist` repo (you’ll need admin access).
3. Set **Root Directory** to `frontend`, **Build Command** to `npm run build`, **Output Directory** to `dist`, **Install Command** to `npm install`.
4. Add an environment variable: `VITE_API_BASE_URL` = your Render backend URL (e.g. `https://shortlist-backend.onrender.com`).
5. Deploy.

For GitHub‑installed deploys on push to `main`, set these secrets in GitHub (repo Settings → Secrets → Actions):

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Backend — Render (free tier)

1. Create a free account at https://render.com.
2. Create a new **Web Service**, connect the `SecondOrderResearch/shortlist` repo, root directory `backend`, runtime Node, build command `npm install`, start command `npm run start`.
3. Create a free **PostgreSQL** database on Render; set `DATABASE_URL` on the web service.
4. Set environment variables: `PORT=3000`, `DATABASE_URL`, `JWT_SECRET`.

For GitHub‑installed deploys on push to `main`, set the secret:

- `RENDER_DEPLOY_HOOK_URL` (from Render’s Deploy Hooks section of the web service)

## Roadmap (MVP)

1. **Auth** — email/password register/login + password recovery for both customer & restaurant_admin roles.
2. **Menu upload** — image/PDF/text upload, OCR extraction (Google Vision API), structured items stored in `menu_items`.
3. **Customer flow** — allergen checklist, manual dislike filter, shortlist card UI (3 taps), session tracking (`viewed_items`, `allergen_filtered_items`, `manually_removed_items`, `shortlisted_items`, `final_choice`).
4. **Admin dashboard** — dish-level metrics, funnel chart, “nearly ordered” insights, behaviour heatmap.
5. **Seed data** — sample menus and restaurant demo data.

## GitHub

This repository is separate from the sports-research (`SecondOrderResearch/second-order-research`) repo. Keep ShortList code, issues, and PRs here.