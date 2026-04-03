# 🚀 Implementation Plan — Dukaan Dosth (దుకాణ్ దోస్త్)
# 12-Hour Hackathon — Complete Step-by-Step Guide

---

## Overview

**Goal**: Build and deploy a working AI-powered Daily Business Summary & Expense Tracker for Indian small shop owners in 12 hours.

**Team**:
| Person | Role | Skills | Focus Area |
|---|---|---|---|
| **Person A** | Frontend Developer | React, Frontend | React UI, Voice Input, Charts, i18n |
| **Person B** | Backend Developer | Java, Spring Boot | REST APIs, Auth, Database, Deployment |
| **Person C** | AI Engineer | Python, AI APIs | Gemini Integration, Prompt Engineering |
| **Person D** | QA & Presenter | Testing, Communication | Testing, Bug Reports, Demo Preparation |

---

## ⏰ Hour-by-Hour Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│ Hour 0-1   │ 🔧 SETUP          │ Everyone sets up tools & repo  │
│ Hour 1-3   │ 🏗️ FOUNDATION      │ Scaffold projects, DB, basics  │
│ Hour 3-6   │ ⚙️ CORE BUILD      │ Build main features            │
│ Hour 6-8   │ 🔗 INTEGRATION     │ Connect everything together    │
│ Hour 8-10  │ ✨ POLISH          │ UI, bugs, performance          │
│ Hour 10-12 │ 🚀 DEPLOY & DEMO   │ Deploy, test, prepare demo     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 PHASE 1: Setup (Hour 0–1) — EVERYONE

> **Goal**: Every team member has all tools installed, the GitHub repo is created, and all three projects (frontend + backend + ai-service) are scaffolded.

### Step 1.1: Install Required Tools (Everyone — 15 min)

> [!IMPORTANT]
> Each person should install ALL of these on their machine. Don't skip any.

#### Everyone Install:
```bash
# 1. Install Git (if not installed)
# Download from: https://git-scm.com/downloads
# Verify:
git --version

# 2. Install Node.js 18+ (needed for frontend)
# Download from: https://nodejs.org/ (LTS version)
# Verify:
node --version
npm --version

# 3. Install Java 17 (needed for backend)
# Download from: https://adoptium.net/ (Temurin JDK 17)
# Verify:
java --version
javac --version

# 4. Install VS Code (recommended IDE for everyone)
# Download from: https://code.visualstudio.com/

# 5. Install Postman (for API testing)
# Download from: https://www.postman.com/downloads/
```

#### Person B additionally:
```bash
# Install Maven (build tool for Spring Boot)
# Download from: https://maven.apache.org/download.cgi
# Or use the Maven wrapper that comes with Spring Boot (./mvnw)
mvn --version
```

#### Person C additionally:
```bash
# Install Python 3.10+ (needed for AI service)
# Download from: https://www.python.org/downloads/
# Verify:
python --version
pip --version
```

### Step 1.2: Create GitHub Repository (Person B — 5 min)

```bash
# 1. Go to https://github.com/new
# 2. Repository name: dukaan-dosth
# 3. Description: "Dukaan Dosth — AI Daily Business Summary & Expense Tracker for Indian Small Businesses"
# 4. Set to Public
# 5. Initialize with README ✅
# 6. Add .gitignore: None (we'll add custom ones)
# 7. License: MIT

# 8. Clone the repo (everyone does this):
git clone https://github.com/<your-username>/dukaan-dosth.git
cd dukaan-dosth
```

### Step 1.3: Create Project Structure (Person A + B + C — 10 min)

```
dukaan-dosth/
├── frontend/          ← Person A creates this (React + Vite)
├── backend/           ← Person B creates this (Spring Boot)
├── ai-service/        ← Person C creates this (Python FastAPI)
├── docs/              ← Person D puts presentation materials here
├── .gitignore
└── README.md
```

#### Person A — Scaffold Frontend:
```bash
cd dukaan-dosth
npx -y create-vite@latest frontend --no-interactive --template react
cd frontend
npm install
npm install react-router-dom recharts react-i18next i18next axios
npm install react-icons
```

#### Person B — Scaffold Backend:
```bash
# Go to https://start.spring.io/ and configure:
# - Project: Maven
# - Language: Java
# - Spring Boot: 3.2.x (latest stable)
# - Group: com.dukaandosth
# - Artifact: backend
# - Name: dukaan-dosth-backend
# - Package name: com.dukaandosth.backend
# - Packaging: Jar
# - Java: 17
# 
# Dependencies to add:
#   ✅ Spring Web
#   ✅ Spring Data JPA
#   ✅ Spring Security
#   ✅ PostgreSQL Driver
#   ✅ Lombok
#   ✅ Validation
#
# Click "Generate" → download ZIP → extract into dukaan-dosth/backend/
```

#### Person C — Scaffold AI Service:
```bash
cd dukaan-dosth/ai-service

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install fastapi uvicorn google-generativeai python-dotenv pydantic

# Create requirements.txt
pip freeze > requirements.txt
```

### Step 1.4: Set Up External Services (Person C + D — 15 min)

#### Person C — Get Gemini API Key:
```
1. Go to https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key — save it somewhere safe
5. Test it works:
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Say hello in Telugu"}]}]}'
```

#### Person D — Set Up Supabase (Database):
```
1. Go to https://supabase.com/ → Sign up (use GitHub login)
2. Click "New Project"
3. Organization: Create new or use existing
4. Project name: dukaan-dosth-db
5. Database password: Generate a strong one → SAVE IT!
6. Region: South Asia (Mumbai) — ap-south-1
7. Click "Create new project" — wait 2 minutes

After project is created:
8. Go to Settings → Database
9. Copy the "Connection string" (URI format):
   postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
10. Share this with Person B
```

### Step 1.5: Configure .gitignore (Person A — 2 min)

Create `dukaan-dosth/.gitignore`:
```gitignore
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env

# Backend
backend/target/
backend/.env
backend/*.jar

# AI Service
ai-service/venv/
ai-service/__pycache__/
ai-service/.env

# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
Thumbs.db

# Environment
.env
*.env.local
```

### Step 1.6: First Commit & Push (Person B — 3 min)
```bash
cd dukaan-dosth
git add .
git commit -m "Initial project setup: React frontend + Spring Boot backend + FastAPI AI service"
git push origin main
```

### Step 1.7: Create Branches (Everyone — 2 min)
```bash
# Person A:
git checkout -b frontend-dev

# Person B:
git checkout -b backend-dev

# Person C:
git checkout -b ai-integration
```

> [!TIP]
> Person D works on `main` branch for docs, or helps others test on their branches.

---

## 🏗️ PHASE 2: Foundation (Hour 1–3)

### Person A — Frontend Foundation (2 hours)

#### Task A1: Project Structure & Routing (30 min)
Create the following file structure inside `frontend/src/`:

```
src/
├── components/
│   ├── Layout/
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx        ← Mobile bottom navigation
│   │   └── Layout.jsx
│   ├── Auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── Dashboard/
│   │   └── DashboardPage.jsx
│   ├── Input/
│   │   ├── TransactionInput.jsx  ← Main voice/text input
│   │   └── VoiceRecorder.jsx
│   ├── History/
│   │   └── HistoryPage.jsx
│   └── Charts/
│       └── WeeklyChart.jsx
├── i18n/
│   ├── en.json                   ← English translations
│   ├── te.json                   ← Telugu translations
│   └── i18n.js                   ← i18n configuration
├── services/
│   └── api.js                    ← Axios API calls
├── context/
│   └── AuthContext.jsx           ← Auth state management
├── App.jsx
├── App.css
├── index.css                     ← Global styles & design system
└── main.jsx
```

Set up React Router with routes:
- `/login` → LoginPage
- `/register` → RegisterPage
- `/` → DashboardPage (protected)
- `/input` → TransactionInput (protected)
- `/history` → HistoryPage (protected)
- `/charts` → WeeklyChart (protected)

#### Task A2: Design System & Global Styles (30 min)
Create `index.css` with:
- CSS custom properties (design tokens)
- Mobile-first media queries
- Color palette: Green (#10B981), Red (#EF4444), Blue (#3B82F6), Dark (#1E293B)
- Typography: Google Fonts — Inter (English) + Noto Sans Telugu (Telugu)
- Button styles, card styles, input styles
- Animations: fade-in, slide-up, pulse (for mic button)

#### Task A3: Auth Pages — Login & Register (30 min)
- Login: Phone number + password
- Register: Phone, password, name, shop name, language preference
- Mobile-optimized forms with large inputs
- Connect to `AuthContext` for state management
- Store JWT token in localStorage

#### Task A4: Bottom Navigation & Layout (30 min)
- Bottom navigation bar with 4 tabs: Home, Add (big center button), History, Charts
- Header with app name (దుకాణ్ దోస్త్), language toggle, logout
- Layout wrapper component

---

### Person B — Backend Foundation (2 hours)

#### Task B1: Configure Database & Application Properties (20 min)

Update `backend/src/main/resources/application.properties`:
```properties
# Server
server.port=8080

# Database (Supabase PostgreSQL)
spring.datasource.url=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres
spring.datasource.username=postgres.[your-ref]
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# CORS (allow frontend + AI service origins)
app.cors.allowed-origins=http://localhost:5173,https://dukaan-dosth.vercel.app
```

Create `backend/.env` (gitignored):
```
DB_PASSWORD=your_supabase_password
JWT_SECRET=your_random_secret_key_at_least_256_bits
```

> [!TIP]
> No Gemini API key needed in backend — AI calls go directly from frontend to the FastAPI service.

#### Task B2: Create Entity Classes (30 min)

Create these Java classes:
```
com.dukaandosth.backend/
├── model/
│   ├── User.java
│   ├── Transaction.java
│   ├── DailySummary.java
│   └── TransactionType.java (enum)
├── repository/
│   ├── UserRepository.java
│   ├── TransactionRepository.java
│   └── DailySummaryRepository.java
├── dto/
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   ├── TransactionRequest.java
│   └── DashboardResponse.java
├── controller/
│   ├── AuthController.java
│   ├── TransactionController.java
│   └── DashboardController.java
├── service/
│   ├── AuthService.java
│   ├── TransactionService.java
│   └── DashboardService.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── SecurityConfig.java
└── config/
    ├── CorsConfig.java
    └── WebConfig.java
```

> [!NOTE]
> No AIController or GeminiService in backend — Person C handles all AI in the FastAPI service.

#### Task B3: Implement Auth — Register, Login, JWT (40 min)
- `SecurityConfig.java` — Configure Spring Security with JWT
- `JwtTokenProvider.java` — Generate and validate JWT tokens
- `JwtAuthenticationFilter.java` — Filter to check JWT on each request
- `AuthController.java` — POST `/api/auth/register`, POST `/api/auth/login`
- `AuthService.java` — Business logic for auth
- Password hashing with BCrypt
- Return JWT token on successful login

#### Task B4: CORS Configuration (10 min)
Allow requests from `localhost:5173` (dev) and Vercel domain (prod).

#### Task B5: Test Auth Endpoints (20 min)
Person B or D tests with Postman:
- Register a user
- Login with that user
- Use JWT token in subsequent requests

---

### Person C — AI Service Foundation (2 hours)

#### Task C1: Gemini API Testing & Prompt Engineering (45 min)

Use Google AI Studio (https://aistudio.google.com/) to test prompts:

**Prompt 1 — Transaction Parsing:**
Test with various inputs:
- English: "Sold rice 500 to Ramesh"
- Telugu: "రామేష్ కి 500 బియ్యం అమ్మాను"
- Tenglish: "Ramesh ki 500 ka rice becha"
- Mixed: "Today bijli bill 2000 paid"
- Udhaar: "Suresh ki 300 udhaar diya"

Iterate on the prompt until it consistently returns correct JSON.

**Prompt 2 — Daily Summary:**
Test with sample transaction data, ensure it generates warm, conversational summaries in both Telugu and English.

**Prompt 3 — Weekly Insight:**
Test with 7 days of sample data, ensure meaningful insights.

#### Task C2: Build FastAPI AI Service (45 min)

Create the following file structure inside `ai-service/`:
```
ai-service/
├── main.py              ← FastAPI app with all endpoints
├── prompts.py           ← All Gemini prompt templates
├── models.py            ← Pydantic request/response models
├── gemini_client.py     ← Gemini API wrapper
├── requirements.txt     ← Python dependencies
├── .env                 ← GEMINI_API_KEY (gitignored)
└── Dockerfile           ← For Render deployment
```

**Endpoints to implement:**
```python
# POST /api/ai/parse
# Body: {"rawInput": "...", "language": "en|te"}
# Returns: {"type": "SALE", "amount": 500, "description": "rice", ...}

# POST /api/ai/daily-summary
# Body: {"transactions": [...], "language": "en|te"}
# Returns: {"summary": "..."}

# POST /api/ai/weekly-insight
# Body: {"dailySummaries": [...], "language": "en|te"}
# Returns: {"insight": "..."}
```

#### Task C3: Test AI Endpoints Locally (30 min)
```bash
cd ai-service
uvicorn main:app --reload --port 8000
# Test: http://localhost:8000/docs (Swagger UI)
```

---

### Person D — Testing & Prep (2 hours)

#### Task D1: Create Test Scenarios Document (30 min)
Write a testing checklist in `docs/test-scenarios.md`:

```markdown
## Test Scenarios

### Auth
- [ ] Register with valid details
- [ ] Register with duplicate phone number (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access protected route without login (should redirect)

### Transaction Input
- [ ] Text input in English → correct parsing
- [ ] Text input in Telugu → correct parsing
- [ ] Text input in Tenglish → correct parsing
- [ ] Voice input in English → correct transcription + parsing
- [ ] Voice input in Telugu → correct transcription + parsing
- [ ] Sale transaction saves correctly
- [ ] Expense transaction saves correctly
- [ ] Udhaar given saves correctly
- [ ] Udhaar received saves correctly

### Dashboard
- [ ] Shows today's total sales
- [ ] Shows today's total expenses
- [ ] Shows today's net profit/loss
- [ ] Shows recent transactions
- [ ] Shows pending udhaar total

### AI Features
- [ ] Daily summary generates in English
- [ ] Daily summary generates in Telugu
- [ ] Weekly chart shows 7 days of data
- [ ] Weekly insight generates correctly

### Responsiveness
- [ ] Works on 5-inch phone screen
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] Bottom navigation works correctly
```

#### Task D2: Prepare Supabase Database (30 min)
- Verify the database is running
- Test connection from Person B's backend
- Monitor database from Supabase dashboard

#### Task D3: Start Presentation Outline (1 hour)
Create `docs/presentation-outline.md`:
```markdown
# Dukaan Dosth — దుకాణ్ దోస్త్ — Presentation Outline

## Slide 1: The Problem (30 sec)
- 63 million small businesses in India
- Paper notebooks, mental math, lost udhaar
- Language barrier with existing apps

## Slide 2: Our Solution (30 sec)
- Dukaan Dosth: Voice-first AI business tracker
- Telugu + English + Tenglish
- Speak your sales, AI does accounting

## Slide 3: Live Demo (3-4 min)
- Register as a shop owner
- Log a sale by voice (Telugu)
- Log an expense by text
- Log an udhaar entry
- Show dashboard with today's summary
- Show AI-generated daily summary in Telugu
- Show weekly profit/loss chart

## Slide 4: Tech Stack & Architecture (30 sec)
- React + Spring Boot + FastAPI + Gemini AI + Supabase

## Slide 5: Impact & Future (30 sec)
- Real problem, real solution
- Future: PWA, WhatsApp integration, offline mode
```

---

## ⚙️ PHASE 3: Core Build (Hour 3–6)

### Person A — Build Core UI Pages (3 hours)

#### Task A5: Transaction Input Page (1.5 hours) ⭐ MOST IMPORTANT PAGE
- **Voice Input**:
  - Large microphone button (pulsing animation)
  - Uses Web Speech API (`webkitSpeechRecognition`)
  - Language selection: Telugu (`te-IN`) or English (`en-IN`)
  - Shows live transcription as user speaks
  - Sends transcribed text to `/api/ai/parse`
- **Text Input**:
  - Large text area for typing
  - Placeholder in Telugu: "మీ అమ్మకం లేదా ఖర్చు ఇక్కడ టైప్ చేయండి..."
  - Send button
- **Quick Action Buttons**:
  - 🛒 Sale | 💰 Expense | 📝 Udhaar Given | 📥 Udhaar Received
  - Tapping reveals a simple form: Amount + Description
- **Confirmation Card**:
  - After AI parses input, show a card: "Sale: ₹500 — Rice — Ramesh"
  - ✅ Confirm | ✏️ Edit | ❌ Cancel buttons
  - On confirm → save to database

#### Task A6: Dashboard Page (1 hour)
- **Top Cards**: Total Sales | Total Expenses | Net Profit (big numbers, color-coded)
- **Udhaar Card**: Total outstanding credit
- **Recent Transactions**: Scrollable list of today's transactions
  - Each item shows: emoji + type + amount + description + time
- **AI Summary Button**: "Generate Today's Summary" → shows AI summary in a modal
- **Pull-to-refresh** or refresh button

#### Task A7: Weekly Charts Page (30 min)
- **Bar Chart**: Daily profit/loss for last 7 days (Recharts)
- **Summary Stats**: Best day, worst day, weekly average
- **AI Insight Box**: Weekly AI-generated insight text

---

### Person B — Build Core APIs (3 hours)

#### Task B5: Transaction CRUD APIs (1.5 hours)
- `TransactionController.java`:
  - `POST /api/transactions` — Create transaction
  - `GET /api/transactions?date=YYYY-MM-DD` — Get by date
  - `GET /api/transactions/today` — Get today's
  - `PUT /api/transactions/{id}` — Update
  - `DELETE /api/transactions/{id}` — Delete
- `TransactionService.java` — Business logic
- `TransactionRepository.java` — JPA queries
  - Custom query: `findByUserIdAndTransactionDate(UUID userId, LocalDate date)`
  - Custom query: `findByUserIdAndTransactionDateBetween(UUID userId, LocalDate start, LocalDate end)`

#### Task B6: Dashboard APIs (45 min)
- `DashboardController.java`:
  - `GET /api/dashboard/today` — Returns `{totalSales, totalExpenses, netProfit, creditGiven, creditReceived, transactionCount}`
  - `GET /api/dashboard/weekly` — Returns array of 7 day-by-day summaries
  - `GET /api/dashboard/udhaar` — Returns customer-wise credit list
- `DashboardService.java` — Aggregation queries

#### Task B7: Integration with AI Service (45 min)
Person B does NOT build AI endpoints — those are in Person C's FastAPI service.
Instead, Person B focuses on:
- Ensure CORS allows requests from frontend to both backend AND ai-service
- Add health check endpoint: `GET /api/health`
- Test that frontend can call both services independently

---

### Person C — AI Service Core Build (3 hours)

#### Task C4: Complete FastAPI Endpoints (1.5 hours)
In `ai-service/main.py`:
- `POST /api/ai/parse` — Takes raw text → calls Gemini → returns structured transaction
- `POST /api/ai/daily-summary` — Takes transaction list → returns AI summary
- `POST /api/ai/weekly-insight` — Takes daily summaries → returns weekly insight
- Add CORS middleware to allow frontend origin
- Add error handling and retry logic
- Use `google-generativeai` Python SDK for Gemini calls

#### Task C5: Fine-tune Prompts (1 hour)
Test ALL of these scenarios via FastAPI's Swagger UI (`/docs`):
```
Input: "aaj 5000 ka sale hua"
Expected: {type: SALE, amount: 5000, description: "general sale"}

Input: "bijli bill bhara 2000"
Expected: {type: EXPENSE, amount: 2000, category: "electricity"}

Input: "రామేష్ కి 500 బియ్యం అమ్మాను"
Expected: {type: SALE, amount: 500, description: "rice", customer: "Ramesh"}

Input: "Suresh ki 300 udhaar diya"
Expected: {type: CREDIT_GIVEN, amount: 300, customer: "Suresh"}

Input: "chai patti 200 ka stock laya"
Expected: {type: EXPENSE, amount: 200, category: "inventory", description: "tea leaves"}

Input: "Lakshmi ne 500 rupay wapas kiye"
Expected: {type: CREDIT_RECEIVED, amount: 500, customer: "Lakshmi"}
```

#### Task C6: Daily Summary & Weekly Insight (30 min)
- Test daily summary generation with sample data
- Verify Telugu output is natural-sounding
- Test weekly insight with multi-day data

---

### Person D — Continuous Testing (3 hours)

#### Task D4: Test Auth Flow End-to-End (1 hour)
- Register via the frontend form
- Login via the frontend form
- Verify JWT token is stored
- Verify protected routes redirect to login
- Test logout

#### Task D5: Test Transaction Input (1 hour)
- Test voice input on a phone (Chrome Android)
- Test text input with various languages
- Verify AI parsing returns correct data
- Verify transactions save to database

#### Task D6: Test Dashboard (1 hour)
- Add several test transactions
- Verify dashboard shows correct totals
- Verify recent transactions list
- Test on multiple screen sizes (phone, tablet)

---

## 🔗 PHASE 4: Integration & Connection (Hour 6–8)

### Person A — Connect Frontend to Backend (2 hours)

#### Task A8: API Service Layer (30 min)
Create `services/api.js`:
- Axios instance with base URL and JWT interceptor
- Functions: `login()`, `register()`, `createTransaction()`, `getTransactions()`, `getDashboard()`, `parseInput()`, `getDailySummary()`, `getWeeklyData()`, `getWeeklyInsight()`

#### Task A9: Integrate Transaction Input (45 min)
- Connect voice transcription → API `/ai/parse` → show confirmation → API `/transactions` (save)
- Connect text input → same flow
- Show loading spinner during AI parsing
- Show success animation on save

#### Task A10: Integrate Dashboard (30 min)
- Fetch dashboard data on mount
- Populate cards with real data
- Fetch and display recent transactions
- Connect daily summary button

#### Task A11: Integrate Charts (15 min)
- Fetch weekly data from API
- Render Recharts bar chart with real data
- Display weekly AI insight

---

### Person B — Final API Polish & Bug Fixes (2 hours)

#### Task B8: Add API Validation (30 min)
- Validate all request DTOs (`@NotNull`, `@Min`, `@Size`)
- Return proper error responses (400, 401, 403, 404)
- Global exception handler

#### Task B9: Add Proper Logging (20 min)
- Log API requests and responses
- Log AI service calls and responses
- Log errors with stack traces

#### Task B10: Test All APIs with Postman (40 min)
Create a Postman collection with all endpoints:
- Auth: register, login
- Transactions: CRUD
- Dashboard: today, weekly, udhaar
- AI: parse, daily-summary, weekly-insight
- Share collection with team

#### Task B11: Fix Any Integration Issues (30 min)
- CORS issues
- Data format mismatches
- Auth token issues

---

### Person C — AI Fine-tuning & Edge Cases (2 hours)

#### Task C7: Handle Edge Cases (1 hour)
- What if user says something unrelated? (e.g., "What's the weather?")
  - → Return friendly error: "I can only help with sales and expenses"
- What if amount is missing? (e.g., "Sold rice to Ramesh")
  - → Return with `clarification: "How much was the sale?"`
- What if input is gibberish?
  - → Handle gracefully
- What if Gemini API is down?
  - → Fallback: show manual entry form

#### Task C8: Optimize AI Response Time (30 min)
- Use `gemini-2.0-flash` (fastest model)
- Keep prompts concise
- Use `maxOutputTokens: 200` for parsing (don't need long responses)
- Use `temperature: 0.1` for parsing (deterministic), `0.7` for summaries (creative)

#### Task C9: Test with Real Telugu Voice Input (30 min)
- Record voice samples in Telugu
- Test transcription → AI parsing pipeline
- Fix any issues with Telugu text processing

---

### Person D — Integration Testing (2 hours)

#### Task D7: Full Flow Testing (2 hours)
Test the complete user journey:
1. Open the app → see login page
2. Register new account (person details + shop name + language: Telugu)
3. Login → see dashboard (empty)
4. Tap "Add" → go to transaction input
5. Tap microphone → speak "aaj 5000 ka sale hua" → see parsed result → confirm
6. Type "bijli bill 2000" → see parsed result → confirm
7. Type "Ramesh ko 500 udhaar diya" → confirm
8. Go back to dashboard → see updated totals
9. Tap "Generate Summary" → see AI summary in Telugu
10. Go to Charts → see weekly chart
11. Test on a mobile phone (Chrome)

**Log every bug found in a shared document.**

---

## ✨ PHASE 5: Polish & Performance (Hour 8–10)

### Person A — UI Polish (2 hours)

#### Task A12: Micro-animations (30 min)
- Page transition animations (fade/slide)
- Card entrance animations (stagger)
- Button press feedback (scale down)
- Mic button pulsing while recording
- Success ✅ animation after saving transaction
- Number counting animation on dashboard cards

#### Task A13: Responsiveness Check (30 min)
- Test on 360px width (small Android)
- Test on 390px width (iPhone)
- Test on 768px width (tablet)
- Fix any overflow, text wrapping, button sizing issues

#### Task A14: Telugu Language Support (30 min)
- Complete all `te.json` translations
- Verify Telugu renders correctly with Noto Sans Telugu font
- Test language toggle works without page reload
- Ensure numbers still show in English numerals (0-9)

#### Task A15: Loading States & Error Handling (30 min)
- Add skeleton loaders for dashboard
- Add spinning loader for AI parsing
- Add error toasts for API failures
- Add empty state illustrations ("No transactions yet")
- Add "No internet" detection

---

### Person B — Performance & Security (2 hours)

#### Task B12: API Response Optimization (45 min)
- Add `@Cacheable` for dashboard aggregations
- Optimize database queries (avoid N+1 queries)
- Add database indexes on `(user_id, transaction_date)`
- Ensure API responses < 500ms

#### Task B13: Security Hardening (45 min)
- Validate JWT expiry properly
- Rate limiting on auth endpoints (optional: use Bucket4j)
- Ensure users can only access their own data
- Sanitize all inputs (prevent SQL injection — JPA handles this)
- Set proper CORS headers for production

#### Task B14: Add Health Check & Info Endpoints (15 min)
```
GET /api/health → {"status": "UP", "timestamp": "..."}
GET /api/info → {"name": "Dukaan Dosth API", "version": "1.0.0"}
```

#### Task B15: Prepare for Deployment (15 min)
- Create `application-prod.properties`
- Set production database URL
- Set production CORS origins
- Create `Dockerfile` (optional) or ensure Maven build works
- Test: `mvn clean package -DskipTests` → `java -jar target/backend.jar`

---

### Person C — Final AI Testing (2 hours)

#### Task C10: Comprehensive Testing (1 hour)
Run through ALL test scenarios from Task C5 again, now through the actual app (not just API).

#### Task C11: Create Demo Data (1 hour)
Create a script or manually enter 20-30 realistic transactions for the demo:
```
Day 1 (3 days ago):
- Sale: Rice 2kg - ₹120
- Sale: Dal 1kg - ₹180
- Sale: Oil 1L - ₹220
- Expense: Wholesale purchase - ₹5,000
- Udhaar: Ramesh - ₹350

Day 2 (2 days ago):
- Sale: Sugar 5kg - ₹275
- Sale: Atta 10kg - ₹480
- Expense: Electricity bill - ₹1,200
...etc.
```
This ensures the demo has realistic data for dashboard and charts.

---

### Person D — Bug Fix Coordination (2 hours)

#### Task D8: Bug Triage & Communication (2 hours)
- Maintain the bug list
- Prioritize: Critical (blocks demo) > Major (looks bad) > Minor (nice to fix)
- Communicate bugs to the right person
- Re-test after fixes
- Test on at least 2 different phones

---

## 🚀 PHASE 6: Deploy & Demo (Hour 10–12)

### Step 6.1: Deploy Frontend to Vercel (Person A — 20 min)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. From frontend directory
cd frontend

# 3. Create .env.production
echo "VITE_API_BASE_URL=https://your-backend.onrender.com/api" > .env.production

# 4. Build for production
npm run build

# 5. Deploy to Vercel
vercel --prod

# OR deploy via Vercel Dashboard:
# 1. Go to https://vercel.com/
# 2. Import Git Repository → select dukaan-dosth
# 3. Root Directory: frontend
# 4. Framework: Vite
# 5. Environment Variables:
#    VITE_API_BASE_URL = https://your-backend.onrender.com/api
#    VITE_AI_BASE_URL = https://your-ai-service.onrender.com/api
# 6. Deploy
```

### Step 6.2: Deploy Backend to Render (Person B — 30 min)

```bash
# Deploy via Render Dashboard
# 1. Go to https://render.com/ → Sign up with GitHub
# 2. New → Web Service
# 3. Connect your GitHub repo (dukaan-dosth)
# 4. Root Directory: backend
# 5. Runtime: Java
# 6. Build Command: mvn clean package -DskipTests
# 7. Start Command: java -jar target/backend-0.0.1-SNAPSHOT.jar
# 8. Environment Variables:
#    DB_PASSWORD = your_supabase_password
#    JWT_SECRET = your_jwt_secret
#    SPRING_DATASOURCE_URL = jdbc:postgresql://...
#    SPRING_PROFILES_ACTIVE = prod
# 9. Instance Type: Free
# 10. Deploy!

# Wait 5-10 minutes for build and deploy
# Test: curl https://your-backend.onrender.com/api/health
```

### Step 6.2b: Deploy AI Service to Render (Person C — 20 min)

```bash
# Deploy via Render Dashboard
# 1. Go to https://render.com/
# 2. New → Web Service
# 3. Connect your GitHub repo (dukaan-dosth)
# 4. Root Directory: ai-service
# 5. Runtime: Python
# 6. Build Command: pip install -r requirements.txt
# 7. Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
# 8. Environment Variables:
#    GEMINI_API_KEY = your_gemini_key
# 9. Instance Type: Free
# 10. Deploy!

# Wait 2-3 minutes for build and deploy
# Test: curl https://your-ai-service.onrender.com/api/ai/health
```

### Step 6.3: Update Frontend Environment (Person A — 5 min)
- Update `VITE_API_BASE_URL` in Vercel to point to Render backend URL
- Update `VITE_AI_BASE_URL` in Vercel to point to Render AI service URL
- Redeploy frontend

### Step 6.4: Smoke Test on Production (Everyone — 20 min)
Test the full flow on the live deployed version:
- [ ] Can access the website URL
- [ ] Can register a new account
- [ ] Can login
- [ ] Can add transaction by text
- [ ] Can add transaction by voice
- [ ] Dashboard shows correct data
- [ ] AI summary generates
- [ ] Weekly chart works
- [ ] Language toggle works
- [ ] Works on mobile phone

### Step 6.5: Load Demo Data (Person C — 15 min)
Enter pre-loaded demo transactions so the app looks populated during the demo.
Use the app's UI or API to add 20-30 realistic transactions across 3-5 days.

### Step 6.5b: Set Up UptimeRobot (Person D — 5 min)
```
1. Go to https://uptimerobot.com/ → Sign up (free)
2. Add New Monitor → HTTP(s)
   - Name: Dukaan Dosth Backend
   - URL: https://your-backend.onrender.com/api/health
   - Monitoring Interval: 5 minutes
3. Add another monitor for AI service:
   - Name: Dukaan Dosth AI
   - URL: https://your-ai-service.onrender.com/api/ai/health
   - Monitoring Interval: 5 minutes
4. This prevents Render from spinning down the services!
```

### Step 6.6: Prepare Final Demo (Person D — 1.5 hours)

#### Create Demo Script (30 min)
Write exact steps for the live demo:
```
1. Open app on phone → show login page
2. "Let me register as a new shop owner"
   → Enter: Phone, Name: "Ramesh", Shop: "Ramesh Kirana Store", Language: Telugu
3. "Now let me log my first sale by voice"
   → Tap mic → Speak: "aaj Suresh ko 500 ka rice becha"
   → Show AI parsing the input
   → Show confirmation card
   → Confirm and save
4. "Let me add an expense"
   → Type: "bijli bill 2000"
   → Show parsing → Confirm
5. "Let me track udhaar"
   → Voice: "Lakshmi ko 300 udhaar diya"
   → Confirm
6. "Now let's see my daily summary"
   → Dashboard → Show totals
   → Tap "AI Summary" → Show Telugu summary
7. "Weekly trends"
   → Show chart with 7 days of data
   → Show AI weekly insight
8. "Switch to English" → Toggle language → Show everything in English
```

#### Practice Demo (30 min)
- Run through the demo 2-3 times
- Time it (should be 3-4 minutes max)
- Have backup plan if voice doesn't work (use text)
- Have backup plan if internet is slow (pre-loaded screenshots)

#### Prepare Slides (30 min)
If needed, create 4-5 simple slides (Google Slides):
1. Problem: India's 63M small businesses struggle with manual record-keeping
2. Solution: Dukaan Dosth — Voice-first AI business tracker in Telugu
3. Live Demo (switch to phone/browser)
4. Tech Stack + Architecture Diagram (React + Spring Boot + FastAPI + Gemini + Supabase)
5. Impact + Future Vision

---

## Decisions (Resolved)

| Decision | Choice | Rationale |
|---|---|---|
| **App Name** | Dukaan Dosth (దుకాణ్ దోస్త్) | "Your Shop's Friend" — user's choice |
| **Auth** | Phone + Password (no OTP) | Simple, free, reliable |
| **AI Architecture** | Separate Python FastAPI service | Person C stays in Python |
| **Downtime** | UptimeRobot pings every 5 min | Prevents Render cold starts |
| **Demo Data** | Pre-loaded | Makes demo look polished |
| **Tech Stack** | React + Spring Boot + FastAPI + Supabase | Matches team skills |

---

## Verification Plan

### Automated Tests
```bash
# Backend
cd backend
mvn test

# Frontend
cd frontend
npm run build  # Verify no build errors
```

### Manual Verification
- [ ] Complete user flow works on deployed URL
- [ ] Voice input works on Chrome Android
- [ ] Telugu text renders correctly
- [ ] AI parsing returns correct results for 10+ test cases
- [ ] Dashboard numbers match actual transactions
- [ ] Charts render with correct data
- [ ] Auth flow is secure (can't access data without login)
- [ ] App works on a 5-inch mobile screen

### Performance Targets
- [ ] Frontend loads in < 3 seconds on 4G
- [ ] API responses < 2 seconds (including AI)
- [ ] No console errors in browser
- [ ] Lighthouse mobile score > 70

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Gemini API rate limit | Medium | High | Use `gemini-2.0-flash` (highest free limit), cache responses |
| Render cold start during demo | Low | Medium | UptimeRobot pings every 5 min prevents this |
| Voice input fails during demo | Medium | High | Always have text input as backup |
| Telugu rendering issues | Low | Medium | Test early with Noto Sans Telugu font |
| Backend build too slow | Medium | Low | Build locally and deploy JAR directly |
| Team merge conflicts | Low | Low | Each person works on separate folders (frontend/backend/ai-service) |
| Database connection issues | Low | High | Test connection in Phase 1, have connection string ready |
| AI service + Backend coordination | Medium | Medium | Frontend calls each service directly, no inter-service calls |
