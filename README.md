# AW Client Portal

A financial report portal for wealth management firms. Advisors manage clients, track investment accounts by category, generate quarterly reports, and download branded PDF summaries — two report types: **SACS** (Strategic Asset Cashflow Summary) and **TCC** (Total Client Capital).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2, ReportLab |
| Database | SQLite (dev) / PostgreSQL (production) |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Axios |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Project Structure

```
aw-client-portal/
├── backend/
│   ├── main.py               # App entry point, CORS
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models.py             # ORM models: Client, Account, QuarterlyReport, ReportEntry
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── routers/
│   │   ├── clients.py        # Client CRUD endpoints
│   │   ├── accounts.py       # Account CRUD endpoints
│   │   └── reports.py        # Report CRUD + PDF download
│   ├── services/
│   │   ├── clients.py        # Client business logic
│   │   ├── accounts.py       # Account business logic
│   │   └── pdf_generator.py  # ReportLab PDF generation (SACS + TCC)
│   ├── Procfile              # Railway start command
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/       # Shared UI (Layout, nav)
    │   ├── pages/            # Dashboard, Clients, Reports
    │   ├── services/api.ts   # Typed Axios wrappers
    │   └── types/index.ts    # Shared TypeScript types
    ├── vercel.json           # SPA routing for Vercel
    ├── vite.config.ts
    └── .env.example
```

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

API: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App: `http://localhost:5173`

The Vite dev server proxies `/api` requests to `http://localhost:8000`, so no frontend env variable is needed locally.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./portal.db` | SQLAlchemy connection string. Set to a PostgreSQL URL in production. |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed CORS origins. |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | *(empty)* | Backend base URL. Leave empty locally (Vite proxy handles it). Set to the Railway URL in production. |

---

## API Reference

### Clients

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/clients/` | List all clients |
| `POST` | `/api/clients/` | Create a client |
| `GET` | `/api/clients/{id}` | Get a client |
| `PATCH` | `/api/clients/{id}` | Update a client |
| `DELETE` | `/api/clients/{id}` | Delete a client (cascades to accounts + reports) |
| `GET` | `/api/clients/{id}/accounts` | List a client's accounts |

### Accounts

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/accounts/` | List accounts (optional `?client_id=`) |
| `POST` | `/api/accounts/` | Create an account |
| `GET` | `/api/accounts/{id}` | Get an account |
| `PATCH` | `/api/accounts/{id}` | Update an account |
| `DELETE` | `/api/accounts/{id}` | Delete an account |

### Reports

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reports/` | List reports (optional `?client_id=`) |
| `POST` | `/api/reports/` | Create a report with entries |
| `GET` | `/api/reports/{id}` | Get report with calculated totals |
| `POST` | `/api/reports/{id}/entries` | Bulk-add entries to a report |
| `DELETE` | `/api/reports/{id}` | Delete a report |
| `GET` | `/api/reports/{id}/pdf?type=tcc` | Download PDF (`type`: `tcc` or `sacs`) |

#### Account categories

`retirement` · `non_retirement` · `trust` · `liability`

---

## Deployment

### Backend → Render

The `render.yaml` at the repo root defines the web service and a free PostgreSQL database as a blueprint — Render reads it automatically on first deploy.

1. Push the repository to GitHub.
2. In the Render dashboard, click **New → Blueprint** and connect the repository.
3. Render will create the web service and database from `render.yaml`. `DATABASE_URL` is linked automatically.
4. Once created, open the web service's **Environment** tab and set:

   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

5. Click **Manual Deploy → Deploy latest commit**. The API will be live at your `.onrender.com` URL.

> **Manual setup (no blueprint):** New → Web Service → connect repo → Root Directory: `backend` → Build: `pip install -r requirements.txt` → Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Add a PostgreSQL database and link its `DATABASE_URL` to the service.

### Frontend → Vercel

1. Import the repository in Vercel and set the **Root Directory** to `frontend`.
2. Vercel auto-detects Vite; no build command changes needed.
3. Set the following environment variable in Vercel:

   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

4. Deploy. `vercel.json` handles SPA routing so React Router deep links work correctly.
