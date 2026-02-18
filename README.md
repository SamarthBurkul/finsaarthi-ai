# FinSaarthi – AI Finance Companion for India 💰🇮🇳

FinSaarthi is an AI-driven finance companion that helps Indian users plan daily money decisions, explore career growth, and compare investments through an interactive, visually rich web experience.

It blends AI assistance, calculators, and learning content so users can move from **"What is happening with my money?" to "What should I do next?"** in one place.

---

## 🌍 Vision

FinSaarthi is built on the belief that **financial literacy should be intelligent, inclusive, and accessible**.

- 🔓 **Open Innovation** – Modern web stack, modular APIs, and AI models.
- 🇮🇳 **India-first** – Rupee-based flows, Indian finance scenarios, and culturally relevant examples.
- 🤖 **AI-first Experience** – A friendly guide that explains the *why* behind every decision.

> **FinSaarthi = "Saarthi" (guide) + AI – your smart co-pilot for money.**

---

## 🚀 Live Deployment

| Layer | URL |
|-------|-----|
| **Frontend** | Deployed on Vercel (auto-deploys from `main` branch) |
| **Backend** | Deployed on Vercel via `backend/vercel.json` |

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, DaisyUI, Framer Motion |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JWT Authentication |
| **AI** | Groq (Llama 3.1), Perplexity API |
| **Auth** | Firebase (Google Sign-In) + JWT (MongoDB sessions) |
| **Other** | Alpha Vantage (stock data), jsPDF (report generation) |

---

## 🌟 Features

### ✅ Implemented

#### 💳 Mock Wallet & Transaction Simulator
- User wallet with balance tracking (INR)
- Credit/debit transactions with full CRUD
- Atomic balance updates using MongoDB `$inc` operators
- Insufficient funds protection
- Transaction reversal (soft delete with balance rollback)
- Transaction summary and statistics aggregation
- Wallet status management (active / frozen / closed)

#### 🛡️ Fraud Detection & Risk Scoring Engine
- Rule-based scoring (0–100) with 7 detection rules:
  - **Large Amount** – dynamic threshold (50% balance, 3x avg spending, ₹50K absolute)
  - **High-Risk Category** – gambling, crypto, adult, etc.
  - **Suspicious Merchant** – keyword matching + trusted list check
  - **Frequent Transactions** – count + sum check in 10-min window
  - **Location Mismatch** – home country vs transaction country
  - **Round Number Pattern** – suspiciously round amounts
  - **Negative Balance Risk** – overdraw detection
- Human-readable risk reasons with weighted breakdown
- Configurable thresholds via `FRAUD_CONFIG`
- Auto-creates alerts for flagged transactions (score ≥ 50)

#### 🔐 JWT Authentication & Audit Trail
- JWT-based auth with Bearer token verification
- Firebase Google Sign-In with MongoDB backend sync
- SHA-256 transaction hash (`txHash`) for tamper-evident audit
- Transaction verification endpoint (`GET /api/transactions/:id/verify`)
- Immutable `txHash` field on schema
- Audit log generation for create/update/reverse actions
- Dev mode bypass with `x-user-id` header

#### 🚨 Smart Alerts System
- Alert model with types: fraud, overdraft, unusual_activity, security
- Severity levels: low, medium, high, critical
- Full alerts API: list, stats, mark read, resolve, delete
- Frontend `FraudAlertsDashboard` with risk badges
- `SmartAlertPanel` component integrated in wallet dashboard

#### 📋 Policy Engine
- Refund eligibility analysis per category
- Legal compliance notices (RBI thresholds)
- Context-aware disclaimers
- Consultation recommendations (CA, lawyer, cyber cell)
- Attached to every transaction response

#### 🤖 AI-Powered Features
- **AI Finance Bot** – 24/7 chatbot for financial queries (Groq API)
- **Smart Budget AI** – spending pattern analysis
- **Career Income Intelligence** – salary estimation and career growth projections
- **Stock Mentor AI** – educational stock analysis
- **Smart Expense Tracker** – AI-powered expense categorization
- **Financial Education** – AI-generated lesson content and quizzes

#### 📊 Calculators & Tools
- EMI, SIP, FD, Tax, Retirement, Loan Comparison calculators
- Smart Business Calculator with AI analysis
- Bank Locator

#### 🏛️ Other Features
- Government Benefits finder with PDF reports
- Smart Savings tracker with streak tracking
- Investment Comparator (Gold, FD, Mutual Funds)
- Finance News (personalized by user persona)
- Financial Education hub with interactive lessons
- Leaderboard system

### 🔜 Planned (Not Yet Implemented)

- **AI Recommendation Hook** – Server-side proxy route (`POST /api/ai/advice`) for contextual fraud advice
- **Real-time Notifications** – Socket.IO for live transaction/alert push events
- Multilingual support (Hindi, Marathi, Tamil)
- Goal-based planning flows

---

## 📁 Project Structure

```
finsaarthi-ai/
├── src/                          # Frontend (React + TypeScript)
│   ├── App.tsx                   # Main app with routing & auth
│   ├── main.tsx                  # Entry point
│   ├── firebase.ts               # Firebase config
│   ├── index.css                 # Global styles
│   ├── components/
│   │   ├── Header.tsx            # Navigation bar
│   │   ├── Hero.tsx              # Landing page
│   │   ├── SignIn.tsx            # Sign-in page
│   │   ├── SignUp.tsx            # Sign-up page
│   │   ├── WalletDashboard.tsx   # Wallet + transactions UI
│   │   ├── FraudAlertsDashboard.tsx  # Fraud alerts & risk monitoring
│   │   ├── SmartAlertPanel.tsx   # Per-transaction fraud/policy panel
│   │   ├── AIFinanceBot.tsx      # AI chatbot
│   │   ├── SmartBudgetAI.tsx     # Budget analysis
│   │   ├── SmartExpenseTracker.tsx   # Expense tracking
│   │   ├── SmartSavings.tsx      # Savings tracker
│   │   ├── SmartInvestmentComparator.tsx  # Investment comparison
│   │   ├── StockMentorAI.tsx     # Stock education AI
│   │   ├── CareerIncomeIntelligence.tsx  # Career/salary AI
│   │   ├── AdvancedCalculatorHub.tsx     # Calculator tools
│   │   ├── SmartBusinessCalculator.tsx   # Business calculator
│   │   ├── FinancialEducation.tsx    # Learning modules
│   │   ├── BankingBasics.tsx     # Banking education
│   │   ├── BankLocator.tsx       # Bank finder
│   │   ├── GovernmentBenefits.tsx    # Govt schemes
│   │   ├── FinanceNews.tsx       # Financial news
│   │   ├── Leaderboard.tsx       # Gamification
│   │   └── ...
│   ├── api/                      # Frontend API services
│   │   ├── walletService.ts      # Wallet API calls
│   │   ├── transactionService.ts # Transaction API calls
│   │   ├── savingsService.ts     # Savings API calls
│   │   ├── budgetService.ts      # Budget API calls
│   │   ├── expenseService.ts     # Expense API calls
│   │   ├── investmentService.ts  # Investment API calls
│   │   └── careerService.ts      # Career API calls
│   ├── utils/
│   │   ├── groqApi.ts            # Groq LLM integration
│   │   ├── educationGroq.ts      # Education AI functions
│   │   ├── authFetch.ts          # Authenticated HTTP client
│   │   ├── calculations.ts       # Financial calculations
│   │   └── chartData.ts          # Chart data utilities
│   ├── types/                    # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── wallet.ts
│   │   ├── transaction.ts
│   │   └── index.ts
│   └── data/                     # Static data
│       ├── educationData.ts
│       ├── expenseData.ts
│       ├── bankData.ts
│       └── quizData.ts
│
├── backend/                      # Backend (Node.js + Express)
│   ├── index.js                  # Server entry point + CORS + routes
│   ├── vercel.json               # Vercel deployment config
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── policies.js           # Policy rules & thresholds
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   └── errorHandler.js       # Error handling middleware
│   ├── models/
│   │   ├── user.js               # User model
│   │   ├── Wallet.js             # Wallet model
│   │   ├── Transaction.js        # Transaction model (with audit)
│   │   ├── Alert.js              # Fraud alert model
│   │   ├── Budget.js             # Budget model
│   │   ├── Expense.js            # Expense model
│   │   ├── saving.js             # Savings model
│   │   ├── Carrer.js             # Career model
│   │   ├── InvestmentComparison.js  # Investment model
│   │   └── stock.js              # Stock model
│   ├── controllers/
│   │   ├── walletController.js   # Wallet CRUD + stats
│   │   ├── transactionController.js  # Transaction CRUD + fraud + verify
│   │   ├── budgetController.js
│   │   ├── expenseController.js
│   │   ├── savingsController.js
│   │   ├── investmentController.js
│   │   └── careerController.js
│   ├── routes/
│   │   ├── auth.js               # Auth routes (signup/signin)
│   │   ├── wallet.js             # Wallet routes (JWT protected)
│   │   ├── transactions.js       # Transaction + alert routes (JWT protected)
│   │   ├── budget.js
│   │   ├── expenses.js
│   │   ├── savings.js
│   │   ├── investment.js
│   │   ├── career.js
│   │   └── news.js
│   ├── helpers/
│   │   └── generateTxHash.js     # SHA-256 tx hash + verification
│   ├── utils/
│   │   ├── fraud.js              # Fraud detection engine (7 rules)
│   │   └── policyEngine.js       # Policy analysis engine
│   └── scripts/                  # Utility scripts
│
├── .env                          # Frontend env (gitignored)
├── .gitignore
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── tsconfig.json                 # TypeScript config
├── tsconfig.app.json
├── eslint.config.js
├── postcss.config.js
└── index.html                    # HTML entry point
```

---

## 🔌 API Reference

All protected routes require `Authorization: Bearer <JWT>` header.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/signin` | Login and get JWT token |

### Wallet
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get user's wallet |
| POST | `/api/wallet` | Create wallet (upsert) |
| PATCH | `/api/wallet` | Update wallet settings |
| DELETE | `/api/wallet` | Delete wallet (if empty) |
| GET | `/api/wallet/stats` | Wallet statistics |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create transaction (with fraud scoring) |
| GET | `/api/transactions` | List transactions (with filters & pagination) |
| GET | `/api/transactions/summary` | Aggregated summary |
| GET | `/api/transactions/:id` | Get single transaction |
| PATCH | `/api/transactions/:id` | Update transaction metadata |
| DELETE | `/api/transactions/:id` | Reverse transaction |
| GET | `/api/transactions/:id/verify` | Verify transaction integrity |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/alerts` | List fraud alerts |
| GET | `/api/transactions/alerts/stats` | Alert statistics |
| PATCH | `/api/transactions/alerts/read-all` | Mark all as read |
| PATCH | `/api/transactions/alerts/:id/read` | Mark alert as read |
| PATCH | `/api/transactions/alerts/:id/resolve` | Resolve alert |
| DELETE | `/api/transactions/alerts/:id` | Delete alert |

### Other APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| * | `/api/savings` | Savings CRUD |
| * | `/api/budget` | Budget CRUD |
| * | `/api/expenses` | Expense CRUD |
| * | `/api/investment` | Investment CRUD |
| * | `/api/career` | Career data |
| * | `/api/news` | Financial news |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB instance (local or Atlas)
- Groq API key

### 1. Clone the Repo

```bash
git clone https://github.com/SamarthBurkul/finsaarthi-ai.git
cd finsaarthi-ai
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3. Environment Variables

Create `.env` in project root (frontend):

```env
VITE_GROQ_API_KEY=your_groq_api_key
VITE_PERPLEXITY_API_KEY=your_perplexity_key
VITE_ALPHA_VANTAGE_KEY=your_alpha_vantage_key
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=https://your-vercel-backend-url
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_secret
REFRESH_TOKEN_EXPIRY=10d
NODE_ENV=development
TX_HASH_SALT=your_secure_random_string
PERPLEXITY_API_KEY=your_perplexity_key
```

> ⚠️ `.env` files are gitignored. Never commit secrets.

### 4. Run Locally

```bash
# Both frontend + backend together
npm run start-all

# Or separately:
# Backend
cd backend && npm run dev

# Frontend (new terminal)
npm run dev
```

Open: **http://localhost:5173** 🚀

### 5. Build for Production

```bash
npm run build
```

---

## 🔐 Security

- 🔑 JWT authentication on all protected routes
- 🛡️ SHA-256 transaction hashes for tamper-evident audit trail
- 🔒 Immutable `txHash` field prevents post-creation modification
- 🧱 Atomic MongoDB operations prevent race conditions
- ✅ Balance rollback on failed transaction creation
- 🚫 CORS configured for allowed origins only
- 📋 Request validation on all endpoints

---

## 🤝 Team & Contributions

FinSaarthi is built by a student team as part of an open-innovation initiative in fintech.

**How to contribute:**

1. Fork this repository
2. Create a feature branch (`feature/your-idea`)
3. Commit and push your changes
4. Open a pull request explaining what you improved

---

## 📄 License

FinSaarthi is currently intended for **hackathon, demo, and educational use**.
For commercial usage, please contact the maintainers.

---

**FinSaarthi – your AI co-pilot for clearer, smarter, and more confident financial decisions. 🚀💸**