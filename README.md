# Dukaan Dosth (దుకాణ్ దోస్త్)

### *"Aapka dukaan ka dosth, AI ke saath"* · *"మీ దుకాణం దోస్త్, AI తో"*

[![Frontend: React + Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb?style=for-the-badge&logo=react)](./frontend)
[![Backend: Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-6db33f?style=for-the-badge&logo=spring)](./backend)
[![AI: Groq + optional Gemini](https://img.shields.io/badge/AI-Groq%20%2F%20Gemini-8E75B2?style=for-the-badge)](./ai-service)

**Dukaan Dosth** is an AI-assisted operations companion for small Indian shops (kirana / MSME). Owners can record **sales**, **expenses**, **inventory**, and **udhaar (credit)** in one place, see **analytics**, a unified **ledger**, and get **voice + text AI** help in Telugu or English.

---

## Features

| Area | What you get |
|------|----------------|
| **Billing & sales** | Record sales (with optional line items); today’s totals. |
| **Expenses** | Categorized expenses (rent, transport, purchase, etc.). |
| **Inventory** | Stock levels and low-stock awareness on the dashboard. |
| **Udhaar** | Credit given, partial payments, pending totals. |
| **Business ledger** | Unified timeline of sales, expenses, and udhaar events; search, filters, **CSV export**. |
| **Business pulse** | 0–100 **health score** from last 7 days’ P&amp;L, pending udhaar, and low stock. |
| **AI** | **Groq**-powered voice assistant (`/api/ai/ask`), daily summary (`/api/summary/daily`), **natural-language parse** for quick add (`/api/ai/parse`). |
| **Auth** | JWT login/register; BCrypt passwords. |

Optional **Python `ai-service`** (FastAPI + Google Gemini) can run separately for additional NLP experiments; the main app’s primary AI path is **Spring Boot → Groq**.

---

## Architecture

```text
┌─────────────┐     JWT REST      ┌──────────────────┐
│   React     │ ◄──────────────► │  Spring Boot     │
│   (Vite)    │    localhost:8080 │  + JPA + Postgres │
└─────────────┘                   └────────┬─────────┘
                                           │
                                    Groq API (LLM)
```

- **Frontend** — React 19, React Router, Axios, Framer Motion, Recharts.  
- **Backend** — Spring Boot 3, Spring Security + JWT, JPA/Hibernate, **PostgreSQL**.  
- **AI (primary)** — Groq Chat Completions from the Java backend.  
- **AI (optional)** — `ai-service/` FastAPI + Gemini for parse/summary endpoints if you deploy it.

---

## Repository layout

```text
dukaan-dosth/
├── frontend/          # React + Vite SPA
├── backend/           # Spring Boot API (main backend)
├── ai-service/        # Optional FastAPI + Gemini service
├── docs/              # Extra notes / plans
└── README.md
```

---

## Prerequisites

- **JDK 17**  
- **Node.js 18+** (20+ recommended)  
- **PostgreSQL** (connection string in backend config)  
- **Groq API key** (for AI assistant, daily summary, transaction parse)  
- *(Optional)* **Python 3.10+** and **Gemini API key** for `ai-service`

---

## Configuration

### Backend (`backend/src/main/resources/application.properties`)

Set at least:

- `spring.datasource.url`, `username`, `password` — PostgreSQL  
- `jwt.secret` — strong secret for signing tokens  
- `groq.api.key`, `groq.api.url`, `groq.api.model` — Groq chat API  

> **Security:** Do not commit real production secrets. Prefer environment-specific overrides or env vars (e.g. `SPRING_DATASOURCE_PASSWORD`, custom properties) for deployment.

### Frontend

Optional `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

If unset, the app defaults to `http://localhost:8080`.

### CORS

Spring security CORS is configured for local Vite ports (`5173`, `5174`, `127.0.0.1`). Add your production frontend origin in `SecurityConfig` when you deploy.

---

## Run locally

### 1. Database

Create a PostgreSQL database and point `spring.datasource.*` at it. With `spring.jpa.hibernate.ddl-auto=update`, schema is created/updated on startup.

### 2. Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

API base: **http://localhost:8080**  
Swagger (if enabled in your build): check `application` / dependencies for springdoc.

Notable routes (all authenticated except `/auth/**`):

- `POST /auth/register`, `POST /auth/login`  
- `GET|POST /api/sales`, `GET|POST /api/expenses`  
- `GET|POST /api/inventory`, `GET|POST /api/udhaar` (+ payments)  
- `GET /api/ledger` — unified ledger (optional `?limit=500`)  
- `GET /api/analytics/profit-loss`, `GET /api/analytics/weekly`, `GET /api/analytics/health`  
- `GET /api/summary/daily` — AI daily summary  
- `POST /api/ai/ask` — voice assistant backend  
- `POST /api/ai/parse` — natural-language → structured transaction  

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually **http://localhost:5173**). Register a user, then use the app with the JWT stored in `localStorage`.

### 4. Optional: Python AI service

```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
# Set GEMINI_API_KEY / CORS_ORIGINS in .env as needed
uvicorn main:app --reload --port 8000
```

This service is **not** required for the default Spring + Groq flow.

---

## Scripts

| Location | Command | Purpose |
|----------|---------|---------|
| `frontend` | `npm run dev` | Dev server |
| `frontend` | `npm run build` | Production build → `dist/` |
| `frontend` | `npm run lint` | ESLint |
| `backend` | `.\mvnw.cmd clean compile` | Compile |
| `backend` | `.\mvnw.cmd spring-boot:run` | Run API |

---

## License

**MIT** — use it to support small businesses and hackathon demos; rotate keys before going public.
