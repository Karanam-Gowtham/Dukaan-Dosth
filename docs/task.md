# Dukaan Dosth (దుకాణ్ దోస్త్) — Build Task Tracker

## Phase 1: Setup (Hour 0–1) — EVERYONE
- [x] Create project directories (frontend, backend, ai-service, docs)
- [x] Scaffold React frontend (Vite)
- [x] Install frontend npm dependencies
- [x] Set up i18n (Telugu + English translation files)
- [x] Create index.css design system
- [x] Create API service layer (services/api.js)
- [x] Create Auth context (context/AuthContext.jsx)
- [x] Create Toast context (context/ToastContext.jsx)
- [ ] Person B: Scaffold Spring Boot backend (via start.spring.io)
- [ ] Person C: Scaffold FastAPI AI service (Python venv + deps)
- [ ] Person D: Set up Supabase database
- [ ] Person C: Get Gemini API key
- [ ] Create GitHub repo and push initial code
- [ ] Create .gitignore
- [ ] Set up branches (frontend-dev, backend-dev, ai-integration)

## Phase 2: Frontend Foundation (Hour 1–3) — Person A
- [ ] Layout components (Header.jsx, BottomNav.jsx, Layout.jsx, Layout.css)
- [ ] Auth pages (LoginPage.jsx, RegisterPage.jsx)
- [ ] Routing setup in App.jsx with protected routes
- [ ] Main entry point (main.jsx with providers)

## Phase 3: Frontend Core Pages (Hour 3–6) — Person A
- [ ] Transaction Input page (TransactionInput.jsx) ⭐ MOST IMPORTANT
- [ ] Voice Recorder component (VoiceRecorder.jsx)
- [ ] Dashboard page (DashboardPage.jsx)
- [ ] Weekly Charts page (WeeklyChart.jsx)
- [ ] History page (HistoryPage.jsx)

## Phase 4: Backend Foundation (Hour 1–3) — Person B
- [ ] application.properties configuration
- [ ] Entity classes (User.java, Transaction.java, DailySummary.java)
- [ ] Repository interfaces
- [ ] DTO classes
- [ ] Security config (JWT: SecurityConfig, JwtTokenProvider, JwtAuthFilter)
- [ ] Auth controller + service (register, login)
- [ ] CORS configuration

## Phase 5: Backend Core APIs (Hour 3–6) — Person B
- [ ] Transaction CRUD APIs (create, read by date, update, delete)
- [ ] Dashboard APIs (today totals, weekly data, udhaar summary)
- [ ] Health check endpoint
- [ ] API validation & error handling

## Phase 6: AI Service (Hour 1–6) — Person C
- [ ] FastAPI project setup (main.py, models.py, prompts.py, gemini_client.py)
- [ ] Gemini API integration (google-generativeai SDK)
- [ ] POST /api/ai/parse — transaction parsing endpoint
- [ ] POST /api/ai/daily-summary — daily summary endpoint
- [ ] POST /api/ai/weekly-insight — weekly insight endpoint
- [ ] Prompt engineering & testing (Telugu, English, Tenglish)
- [ ] CORS middleware for frontend origin
- [ ] Health check endpoint
- [ ] Edge case handling (missing amounts, gibberish, unrelated input)

## Phase 7: Integration & Polish (Hour 6–10)
- [ ] Connect frontend → Spring Boot backend (auth, transactions, dashboard)
- [ ] Connect frontend → FastAPI AI service (parse, summary, insight)
- [ ] UI micro-animations (fade, slide, pulse mic, success pop)
- [ ] Loading states & skeleton loaders
- [ ] Error handling & toast notifications
- [ ] Responsiveness checks (360px, 390px, 768px)
- [ ] Telugu language completeness check
- [ ] Full flow end-to-end testing (Person D)

## Phase 8: Deploy & Demo (Hour 10–12)
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Deploy AI service to Render
- [ ] Set environment variables in Vercel & Render
- [ ] Smoke test live URLs
- [ ] Set up UptimeRobot monitors (backend + AI service)
- [ ] Load pre-loaded demo data (20-30 transactions)
- [ ] Prepare presentation slides (Person D)
- [ ] Practice demo run 2-3 times
