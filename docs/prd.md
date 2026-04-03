# 📋 Product Requirements Document (PRD)
# **Dukaan Dosth** — దుకాణ్ దోస్త్ — AI Daily Business Summary & Expense Tracker

> *"Aapka dukaan ka dosth, AI ke saath"* | *"మీ దుకాణం దోస్త్, AI తో"*

---

## 1. Problem Statement

### The Reality of Indian Small Businesses
India has **63 million+ MSMEs** (Micro, Small, and Medium Enterprises), and the vast majority — kirana stores, street vendors, chai stalls, vegetable sellers — run their businesses with:
- A **paper notebook** (bahi khata) or no records at all
- **Mental math** for daily profit/loss
- **Trust-based** udhaar (credit) systems with no tracking
- **Zero visibility** into weekly/monthly trends

### Pain Points We Solve

| Pain Point | Impact | Our Solution |
|---|---|---|
| ❌ No clear understanding of daily profit/loss | Shop owners don't know if they're actually making money | ✅ AI-generated end-of-day summary with clear profit/loss |
| ❌ Difficulty managing udhaar (credit) | ₹000s lost in forgotten credits | ✅ Simple credit logging: "Ramesh ko 500 udhaar diya" |
| ❌ Poor inventory awareness | Stockouts lose customers, overstocking wastes money | ✅ AI insights: "You sold 50kg rice this week, consider restocking" |
| ❌ Manual record-keeping errors | Wrong totals, missed entries | ✅ Voice/text input → AI parses automatically |
| ❌ Language barriers | Existing apps are English-only | ✅ Telugu + English + Tenglish support |
| ❌ Tech intimidation | "I can't use apps" | ✅ 3-button interface, voice-first design |

---

## 2. Target Users

### Primary Persona: Ramesh — Kirana Store Owner
- **Age**: 45 years
- **Location**: Vijayawada, Andhra Pradesh
- **Education**: 10th pass
- **Phone**: Android smartphone (₹8,000 range), 5-inch screen
- **Language**: Telugu (speaks), Tenglish (types), basic English (reads)
- **Current Method**: Paper notebook, mental math
- **Tech Comfort**: Uses WhatsApp, YouTube, PhonePe
- **Daily Revenue**: ₹5,000–₹25,000

### Secondary Personas
- **Lakshmi** — Street food vendor, uses voice only, Telugu speaker
- **Suresh** — Small general store, tracks 20+ daily udhaar transactions
- **Priya** — Boutique owner, wants weekly profit/loss insights

---

## 3. Product Overview

**Dukaan Dosth** ("Your Shop's Friend") is a mobile-first web application that lets small business owners log daily sales and expenses through **voice or text in Telugu/English/Tenglish**. An AI engine (Google Gemini) parses the natural language input into structured transactions, generates clean end-of-day summaries, and produces weekly profit/loss charts.

### Core Value Proposition
> *"Speak your sales. AI does your accounting."*

---

## 4. Feature Specifications

### 4.1 User Authentication & Onboarding
- **Phone number + password login** (simple, reliable, no paid OTP service needed)
- **Simple onboarding**: Name, Shop Name, Language preference
- **No email required** — phone number is the identity
- **Session persistence** — stay logged in on the same device (JWT in localStorage)

### 4.2 Transaction Input (Voice + Text)
- **Voice Input**: Tap microphone → speak in Telugu/English/Tenglish → AI transcribes and parses
  - Example: *"Aaj Ramesh ko 500 ka rice becha"* → `{type: SALE, amount: 500, item: "rice", customer: "Ramesh"}`
  - Example: *"Dukaan ka bijli bill 2000 rupay bhara"* → `{type: EXPENSE, amount: 2000, category: "electricity"}`
  - Example: *"Suresh ki 300 udhaar diya"* → `{type: CREDIT_GIVEN, amount: 300, customer: "Suresh"}`
- **Text Input**: Type in a text box in any language
- **Quick Buttons**: Pre-set buttons for common actions (Sale, Expense, Udhaar Given, Udhaar Received)
- **Confirmation Screen**: Show parsed transaction for user to confirm/edit before saving

### 4.3 AI-Powered Parsing (Google Gemini)
- Parse natural language (Telugu/English/Tenglish) into structured data
- Extract: transaction type, amount, item/category, customer name, date
- Handle ambiguous inputs gracefully with clarifying prompts
- Support mixed-language input (Tenglish)

### 4.4 Dashboard — Today's Summary
- **Total Sales** today (big, prominent number)
- **Total Expenses** today
- **Net Profit/Loss** today (color-coded: green/red)
- **Recent Transactions** list (last 10)
- **Pending Udhaar** total

### 4.5 AI Daily Summary
- End-of-day AI-generated summary in user's preferred language
- Key insights: top-selling items, biggest expenses, udhaar status
- Tone: Simple, conversational, like a helpful assistant
- Example: *"మీరు ఈరోజు ₹15,000 అమ్మకాలు చేశారు. ₹3,000 ఖర్చు అయింది. మీ లాభం ₹12,000. Ramesh కి ₹500 ఉధార్ ఇచ్చారు."*

### 4.6 Weekly Profit/Loss Chart
- Bar chart showing daily profit/loss for the past 7 days
- Line chart showing cumulative trend
- Simple, visual, color-coded (green = profit, red = loss)
- Weekly AI insight: *"This week your profit increased by 15% compared to last week"*

### 4.7 Udhaar (Credit) Tracker
- Log credit given and received
- Customer-wise udhaar balance
- Simple list view: Customer Name → Amount → Date
- Total outstanding udhaar prominently displayed

### 4.8 Transaction History
- Search/filter by date, type, customer
- Edit or delete transactions
- Export option (future scope)

---

## 5. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                    │
│              Deployed on Vercel (Free Tier)                   │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐    │
│  │  Voice   │ │  Text    │ │Dashboard │ │  Charts &    │    │
│  │  Input   │ │  Input   │ │  View    │ │  Reports     │    │
│  │(Web      │ │          │ │          │ │ (Recharts)   │    │
│  │Speech API)│ │          │ │          │ │              │    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘    │
│       │             │            │               │            │
│       └─────────────┴────────────┴───────────────┘            │
│                 │ REST API (HTTPS)   │ REST API (HTTPS)       │
│          ┌──────┘                    └──────┐                 │
└──────────┼──────────────────────────────────┼─────────────────┘
           │                                  │
┌──────────┼──────────────┐   ┌───────────────┼────────────────┐
│  BACKEND (Spring Boot) │   │  AI SERVICE (Python FastAPI)   │
│  Render (Free Tier)     │   │  Render (Free Tier)            │
│                         │   │                                │
│  ┌──────┐ ┌──────────┐ │   │  ┌──────────┐ ┌────────────┐  │
│  │ Auth │ │Transaction│ │   │  │ Parse    │ │  Summary   │  │
│  │(JWT) │ │  CRUD     │ │   │  │ NL Input │ │  Generator │  │
│  └──┬───┘ └────┬─────┘ │   │  └────┬─────┘ └──────┬─────┘  │
│     │          │        │   │       │              │         │
│     └──────────┘        │   │       └──────────────┘         │
│          │ JDBC         │   │          │ Gemini API          │
└──────────┼──────────────┘   └──────────┼─────────────────────┘
           │                             │
┌──────────┼─────────────────┐  ┌────────┼─────────────────────┐
│  DATABASE (Supabase PG)    │  │  Google Gemini API           │
│  Free Tier — 500MB         │  │  gemini-2.0-flash            │
│                            │  │  • NL → structured data      │
│  users | transactions      │  │  • Daily summaries           │
│  daily_summaries           │  │  • Weekly insights           │
└────────────────────────────┘  └──────────────────────────────┘

Uptime: UptimeRobot pings both services every 5 min (free)
```

> **3-Service Architecture**: Frontend calls Spring Boot for auth/data AND FastAPI for AI.
> Person B works in Java, Person C works in Python — no conflicts.

---

## 6. Tech Stack

| Layer | Technology | Owner | Why |
|---|---|---|---|
| **Frontend** | React 18 + Vite | Person A | Fast dev, component-based |
| **UI Library** | Custom CSS + Google Fonts | Person A | Lightweight, mobile-optimized |
| **Charts** | Recharts | Person A | Simple, React-native charting |
| **Voice Input** | Web Speech API (browser) | Person A | Free, no API needed, supports Telugu |
| **i18n** | react-i18next | Person A | Telugu/English language toggle |
| **Backend** | Spring Boot 3 (Java 17) | Person B | Person B's preference, robust REST APIs |
| **Auth** | Spring Security + JWT | Person B | Industry standard, hackathon-appropriate |
| **ORM** | Spring Data JPA + Hibernate | Person B | Fast DB development |
| **AI Service** | Python FastAPI | Person C | Person C stays in Python |
| **AI Model** | Google Gemini API (gemini-2.0-flash) | Person C | Free tier, best multilingual support |
| **Database** | PostgreSQL (Supabase) | Person B+D | Free, managed, reliable |
| **Frontend Deploy** | Vercel | Person A | Free, instant deploys, HTTPS |
| **Backend Deploy** | Render | Person B | Free tier for Spring Boot |
| **AI Deploy** | Render | Person C | Free tier for FastAPI |
| **Uptime** | UptimeRobot | Person D | Free pings every 5 min to prevent cold starts |
| **Version Control** | GitHub | All | Standard, free |

---

## 7. Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| phone_number | VARCHAR(15) | Unique, login identifier |
| password_hash | VARCHAR(255) | BCrypt hashed |
| owner_name | VARCHAR(100) | Shop owner's name |
| shop_name | VARCHAR(100) | Business name |
| language_pref | VARCHAR(5) | `en` or `te` |
| created_at | TIMESTAMP | Auto |

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK → users) | Transaction owner |
| type | ENUM | `SALE`, `EXPENSE`, `CREDIT_GIVEN`, `CREDIT_RECEIVED` |
| amount | DECIMAL(12,2) | In INR |
| description | TEXT | Parsed description |
| category | VARCHAR(50) | e.g., "grocery", "electricity", "rent" |
| customer_name | VARCHAR(100) | Nullable, for udhaar |
| raw_input | TEXT | Original voice/text input |
| transaction_date | DATE | Date of transaction |
| created_at | TIMESTAMP | Auto |

### `daily_summaries`
| Column | Type | Notes |
|---|---|---|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK → users) | Summary owner |
| summary_date | DATE | The day being summarized |
| total_sales | DECIMAL(12,2) | Sum of sales |
| total_expenses | DECIMAL(12,2) | Sum of expenses |
| total_credit_given | DECIMAL(12,2) | Udhaar given |
| total_credit_received | DECIMAL(12,2) | Udhaar received |
| net_profit | DECIMAL(12,2) | Sales - Expenses |
| ai_summary | TEXT | AI-generated summary text |
| created_at | TIMESTAMP | Auto |

---

## 8. API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with phone + password + shop details |
| POST | `/api/auth/login` | Login, returns JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transactions` | Create transaction (from parsed AI input) |
| GET | `/api/transactions?date=2026-04-03` | Get transactions for a date |
| GET | `/api/transactions/today` | Get today's transactions |
| PUT | `/api/transactions/{id}` | Edit transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/parse` | Send raw text → get parsed transaction data |
| GET | `/api/ai/daily-summary?date=2026-04-03` | Generate AI daily summary |
| GET | `/api/ai/weekly-insight` | Generate weekly AI insight |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/today` | Today's totals (sales, expenses, profit) |
| GET | `/api/dashboard/weekly` | Last 7 days data for charts |
| GET | `/api/dashboard/udhaar` | Outstanding credit summary |

---

## 9. AI Integration Details

### Gemini Prompt for Transaction Parsing
```
You are a financial assistant for a small Indian shop. 
Parse the following input from a shop owner and extract structured transaction data.
The input may be in Telugu, English, Hindi, or Tenglish (Telugu words in English script).

Input: "{user_input}"

Respond in JSON format:
{
  "type": "SALE" | "EXPENSE" | "CREDIT_GIVEN" | "CREDIT_RECEIVED",
  "amount": <number>,
  "description": "<item or description in English>",
  "category": "<category>",
  "customer_name": "<name if mentioned, else null>",
  "confidence": <0.0 to 1.0>
}

If confidence < 0.7, add a "clarification" field asking for more details.
```

### Gemini Prompt for Daily Summary
```
You are a friendly business assistant for a small Indian shop owner.
Generate a simple, warm end-of-day summary from the following transaction data.
Write in {user_language} (Telugu/English).
Keep it conversational, like talking to a friend.
Use ₹ symbol for amounts.

Transactions: {transactions_json}

Include:
1. Total sales
2. Total expenses  
3. Net profit/loss
4. Top-selling items
5. Udhaar status
6. One encouraging insight
```

---

## 10. UI/UX Design Principles

1. **Mobile-First**: Designed for 5-inch screens, touch-friendly
2. **Big Touch Targets**: Buttons minimum 48px height
3. **3-Button Philosophy**: Main actions reachable in 1 tap
4. **Dark/Light Mode**: Default to light (most used by target users)
5. **Telugu Typography**: Noto Sans Telugu for Telugu text
6. **Color Coding**: Green = profit/income, Red = loss/expense, Blue = udhaar
7. **Voice-First**: Microphone button is the most prominent element
8. **Instant Feedback**: Loading states, success animations
9. **No Jargon**: Use words like "becha" (sold), "kharcha" (spent), "udhaar" (credit)

---

## 11. Language Support

| Feature | English | Telugu | Tenglish |
|---|---|---|---|
| UI Labels | ✅ | ✅ | — |
| Voice Input | ✅ | ✅ | ✅ (parsed by AI) |
| Text Input | ✅ | ✅ | ✅ (parsed by AI) |
| AI Summaries | ✅ | ✅ | — |
| Charts | ✅ (labels) | ✅ (labels) | — |

---

## 12. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Page Load Time | < 3 seconds on 4G |
| API Response Time | < 2 seconds (including AI) |
| Mobile Responsiveness | Works on 5-inch screens |
| Browser Support | Chrome Android 80+ |
| Uptime | ~99% via UptimeRobot pings (prevents cold starts) |
| Data Security | JWT auth, HTTPS, hashed passwords |
| Demo Strategy | Pre-loaded realistic data for polished demo |

---

## 13. Success Metrics (Hackathon Judging Alignment)

| Criteria (Weight) | How We Score |
|---|---|
| **Working Features (25%)** | Voice input, text input, AI parsing, dashboard, charts, udhaar — all functional |
| **AI Integration (20%)** | Gemini-powered NLP parsing, multilingual, daily summaries, weekly insights |
| **Performance (15%)** | Fast load, smooth animations, responsive UI |
| **UI Aesthetics (10%)** | Premium mobile-first design, Telugu fonts, micro-animations |
| **Auth & Security (10%)** | JWT auth, password hashing, protected routes |
| **Problem Statement (10%)** | Clear real-world problem with validated pain points |
| **Data Persistence (10%)** | PostgreSQL with proper schema, CRUD operations, data integrity |

---

## 14. Out of Scope (NOT building)

- ❌ Full GST/tax filing
- ❌ E-commerce or online ordering
- ❌ Barcode scanning
- ❌ Multi-user per shop (single owner account)
- ❌ Offline mode
- ❌ SMS/WhatsApp notifications
- ❌ Inventory management system (only basic AI insights)
- ❌ Payment gateway integration

---

## 15. Future Scope (Post-Hackathon)

- 📱 PWA with offline support
- 📸 Photo receipt scanning
- 💬 WhatsApp integration for daily summaries
- 📊 Monthly/yearly reports
- 🔔 Smart restock reminders
- 👥 Multi-user support (family business)
- 🏦 UPI payment tracking integration
