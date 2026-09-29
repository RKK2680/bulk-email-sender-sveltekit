# Bulk Email Sender

A web app for sending personalised bulk email campaigns from an Excel/CSV contact list, with batching, scheduling, per-user SMTP configurations, and send reports.

This repo was migrated from a vanilla HTML/CSS/JS frontend to **SvelteKit**. The **backend is unchanged** — same Hono app, same Bun runtime, same SQLite database, same business logic. Only the frontend and the small amount of static-file wiring in `src/app.ts` were touched.

## Architecture

```
├── src/                 # Hono API backend (Bun) — UNCHANGED business logic
│   ├── app.ts           # Now API-only: no static files, no HTML routes
│   ├── routes/          # auth, send, config, report, dashboard
│   ├── services/        # email sending, batching, scheduling, SQLite access
│   └── middleware/      # session auth
├── data/                # SQLite databases (git-ignored)
├── uploads/             # Temp storage for uploaded Excel files (git-ignored)
├── logs/                # App logs (git-ignored)
└── frontend/            # SvelteKit app (new)
    ├── src/routes/
    │   ├── (auth)/      # /login, /register
    │   ├── (app)/       # /compose, /configs, /reports (session-protected)
    │   └── api/[...path]/+server.ts   # proxies /api/* to the backend
    ├── src/hooks.server.ts            # resolves the signed-in user server-side
    └── src/lib/
        ├── api/         # typed fetch wrappers, one file per resource
        ├── schemas/     # Zod validation (mirrors backend's own rules)
        ├── components/  # reusable UI (forms, modal, editor, dashboard…)
        └── queries.ts   # TanStack Query keys + adaptive polling
```

### Why a proxy instead of calling the backend directly from the browser

The backend authenticates with an `httpOnly` session cookie. Rather than dealing with CORS and cross-site cookies, the SvelteKit server exposes `/api/*`, which forwards the request (headers, body, and cookies included) to the Hono backend server-to-server. From the browser's point of view, everything — pages and API calls — comes from one origin, so the cookie just works, exactly as it did in the original app. `src/hooks.server.ts` also calls `/auth/me` on the server for protected pages, so a signed-out visit to `/compose` redirects to `/login` before any HTML is sent.

### What moved where

| Old (vanilla) | New (SvelteKit) |
|---|---|
| `public/index.html` tabs (Compose / Configs / Report) | `frontend/src/routes/(app)/{compose,configs,reports}` |
| `public/login.html` | `frontend/src/routes/(auth)/login` |
| `public/js/app.js` (~2500 lines, one file) | Split into `lib/api/*`, `lib/components/*`, `lib/utils/*` per concern |
| Bootstrap 5 + hand-written CSS | Small custom CSS design system in `app.css` (light/dark aware) |
| Quill (loaded via CDN `<script>`) | Quill as an npm dependency, loaded client-side in `RichTextEditor.svelte` |
| Manual `setInterval` polling for job status | TanStack Query with the same adaptive interval (3s active batch / 10s running schedule / 30s idle), read from `GET /dashboard/poll-status` |
| `public/samples/sample-contacts.xlsx` | `frontend/static/sample-contacts.xlsx` |

Nothing in `src/services/*` (email sending, batching, scheduler, SQLite schema) was changed.

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0 (for the backend)
- [Node.js](https://nodejs.org) ≥ 18 (for the SvelteKit frontend)

## Setup

### 1. Backend (API)

```bash
bun install
cp .env.example .env   # fill in your SMTP / session secret values
bun run dev            # starts the API on http://localhost:3000
```

`GET http://localhost:3000/health` should return `{"status":"OK", ...}`.

### 2. Frontend (SvelteKit)

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env   # BACKEND_URL defaults to http://localhost:3000, which is fine locally
npm run dev            # starts the app on http://localhost:5173
```

Open **http://localhost:5173** — register an account, add an SMTP configuration (Configs tab), then compose a campaign. A sample contact file is available at `frontend/static/sample-contacts.xlsx`.

### Production build

```bash
# Backend
bun run start                 # or: bun build src/app.ts --outdir=dist

# Frontend
cd frontend
npm run build
BACKEND_URL=http://your-backend-host:3000 node build/index.js
```

The frontend uses `@sveltejs/adapter-node`, so `npm run build` produces a standalone Node server in `frontend/build/`.

## Environment variables

**Backend** (`.env`, see `.env.example`): `PORT`, `SESSION_SECRET`, default `SMTP_*` / `FROM_*` values used before a user adds their own configuration, and optional `NOTIFICATION_SMTP_*` settings used for "campaign finished" emails.

**Frontend** (`frontend/.env`, see `frontend/.env.example`): `BACKEND_URL` — where the SvelteKit server should forward `/api/*` requests. Only read server-side; never exposed to the browser.

## Features

- **Auth** — register, log in, log out; session cookie set by the backend, validated on every protected page load.
- **SMTP configurations** — add, edit, delete, set a default, and test a connection before saving. Gmail app-password hints (16-character check, space stripping) shown inline.
- **Compose** — rich-text editor (Quill) or upload a ready-made HTML template; upload an Excel/CSV contact list with a live preview table; choose to send to all contacts, the first N, or a specific range; optional batching (batch size, delay between emails, delay between batches) with a live estimate of total send time; optional scheduling for a later date/time (converted to UTC for the backend) with an email/browser notification when the job finishes; a preview modal that fills in `{{ColumnName}}` placeholders using the first uploaded contact.
- **Live dashboard** — while a campaign is running or scheduled, Compose shows progress, a pause/resume/cancel control, and the list of scheduled jobs, polling only as often as the backend says is needed.
- **Reports** — totals (sent/failed/errors), a full log table, CSV/JSON export, and a "clear logs" action.

## API reference

All endpoints are served by the Hono backend (unchanged) and reached by the frontend through `frontend/src/routes/api/[...path]/+server.ts`, i.e. `https://your-frontend/api/<path>` → `http://your-backend/<path>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/register` | Create an account |
| POST | `/auth/login` | Log in, sets the session cookie |
| POST | `/auth/logout` | Clear the session |
| GET | `/auth/me` | Current signed-in user |
| GET | `/config/smtp` | List the user's SMTP configurations |
| POST | `/config/smtp` | Create a configuration |
| PUT | `/config/smtp/:id` | Update a configuration (blank password keeps the existing one) |
| DELETE | `/config/smtp/:id` | Delete a configuration |
| POST | `/config/smtp/:id/default` | Mark a configuration as the default |
| POST | `/config/smtp/test` | Test an SMTP connection without saving |
| POST | `/parse-excel` | Upload an Excel/CSV file, get back parsed contacts |
| POST | `/send` | Start (or schedule) a campaign — multipart form, see below |
| POST | `/test-notification` | Send a test "campaign finished" email |
| GET | `/batch-status` | Current batch job progress |
| POST | `/batch-pause` / `/batch-resume` | Pause/resume the active batch |
| DELETE | `/batch-cancel` | Cancel the active batch |
| GET | `/scheduled-jobs` | List scheduled campaigns |
| DELETE | `/scheduled-jobs/:id` | Cancel a scheduled campaign |
| GET | `/dashboard/poll-status` | Whether the client should poll, and how often |
| GET | `/report` | Send logs + summary stats |
| GET | `/report/export/csv` \| `/report/export/json` | Download the report |
| DELETE | `/report/clear` | Clear all logs |

`POST /send` is a `multipart/form-data` request with: `configId`, `subject`, `htmlContent` (or an `htmlTemplate` file instead), `excelFile`, `emailRangeStart`, `emailRangeCount`, and optionally `useBatch`/`batchSize`/`batchDelay`/`emailDelay` and `scheduleEmail`/`scheduledTime` (ISO/UTC)/`notifyEmail`/`notifyBrowser` (boolean flags are sent as the string `"on"`, matching the backend's parsing).

## Notes for reviewers

- `/report`, `/scheduled-jobs`, and the `/batch-*` endpoints return data across **all** users, not just the caller — that's existing backend behaviour, left as-is since backend logic was out of scope for this migration.
- The old `public/` folder and its static-serving routes in `src/app.ts` were removed per the assignment; `src/app.ts` is otherwise the same file with the HTML/static-file wiring stripped out.
- No design-system library was added; `frontend/src/app.css` is a small, self-contained set of CSS custom properties and utility classes (light/dark aware) used by every component.
