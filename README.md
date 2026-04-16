# MailIQ — AI-Powered Email Triage SaaS

> Receive a phone call when an AI determines an email contains a **real deadline** that requires your action.

## Architecture

```
stacksprint/
├── backend/     # Node.js + Express API (port 3001)
├── frontend/    # React + Vite + Tailwind (port 5173)
└── docker-compose.yml  # Local PostgreSQL
```

## Quick Start

### 1. Launch PostgreSQL (Docker)
```bash
docker-compose up -d
```
The schema is automatically applied on first start.

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials (see below)
npm install
npm run dev
```

### 3. Configure Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with your Firebase config
npm install
npm run dev
```

Open http://localhost:5173

---

## Required Credentials

| Service | Where to Get | Backend `.env` Key |
|---|---|---|
| **PostgreSQL** | Docker Compose (local) or cloud | `DATABASE_URL` |
| **Firebase** | [Firebase Console](https://console.firebase.google.com) → Service Accounts | `FIREBASE_SERVICE_ACCOUNT` |
| **Firebase (client)** | Firebase Console → Project Settings → Apps | `VITE_FIREBASE_*` in `frontend/.env` |
| **Google OAuth / Gmail API** | [GCP Console](https://console.cloud.google.com/apis/credentials) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **Anthropic Claude** | [console.anthropic.com](https://console.anthropic.com) | `ANTHROPIC_API_KEY` |
| **Twilio** | [console.twilio.com](https://console.twilio.com) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |

### Firebase Setup Checklist
- [ ] Enable **Phone Authentication** in Firebase Console → Authentication → Sign-in methods
- [ ] Add `localhost` to **Authorized domains** (Firebase → Authentication → Settings)
- [ ] Download **service account JSON** → paste as single-line string into `FIREBASE_SERVICE_ACCOUNT`

### GCP / Gmail API Checklist
- [ ] Enable **Gmail API** in API Library
- [ ] Create **OAuth 2.0 Client ID** (Web application type)
- [ ] Add `http://localhost:3001/api/gmail/callback` as an **Authorized redirect URI**

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/verify-otp` | Exchange Firebase token → session cookie |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Get current user |
| `GET` | `/api/gmail/auth` | Start Gmail OAuth2 flow |
| `GET` | `/api/gmail/callback` | Gmail OAuth2 callback |
| `GET` | `/api/gmail/emails` | Fetch inbox emails |
| `GET` | `/api/gmail/status` | Gmail connection status |
| `GET/POST/DELETE` | `/api/gmail/filters` | Keyword filter CRUD |
| `POST` | `/api/triage/process` | Run AI triage on email |
| `GET` | `/api/triage/history` | Call trigger history |

---

## Security Features

| Layer | Implementation |
|---|---|
| HTTP Headers | `helmet` |
| CORS | Frontend URL whitelist only |
| Rate Limiting | 100 req/15min (global), 10 req/15min (auth) |
| Session | JWT in `HttpOnly` + `Secure` + `SameSite=Strict` cookie |
| SQL | Parameterized queries (no ORM string interpolation) |
| Prompt Injection | Pre-filter drops `List-Unsubscribe` / `Precedence: bulk` emails |
| Spam Protection | Circuit breaker: max 2 Twilio calls/sender/24h |
| Secrets | Zod env validation — server exits on startup if any key is missing |

---

## AI Triage Flow

```
Email arrives with "deadline" keyword
    ↓
Security Pre-Filter
  • Has List-Unsubscribe header? → DROP
  • Has Precedence: bulk? → DROP
    ↓
Claude Sonnet AI Analysis
  Input:  Sender, Subject, Body
  Output: { is_real_deadline, action_required, deadline_datetime, reasoning, trigger_call }
    ↓
Circuit Breaker Check (PostgreSQL)
  • Same sender triggered ≥ 2 calls in 24h? → BLOCK
    ↓
Twilio Voice Call
  Subject sanitization:
  • Empty → "Deadline"
  • > 50 chars → "Deadline. Please check your application."
  TwiML: <Say voice="alice">Urgent alert. [subject].</Say>
```
