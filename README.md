FinSaarthi – AI Finance Companion for India 💰🇮🇳  
==================================================

FinSaarthi is an AI‑driven finance companion that helps Indian users plan daily money decisions, explore career growth, and compare investments through an interactive, visually rich web experience.  
It blends AI assistance, calculators, and learning content so users can move from **“What is happening with my money?” to “What should I do next?”** in one place.

***

🌍 Vision – Open Innovation for Financial Freedom  
-------------------------------------------------

FinSaarthi is built on the belief that **financial literacy should be intelligent, inclusive, and accessible**.

- 🔓 **Open innovation** – Modern web stack, modular APIs, and AI models that can be extended and improved by the community.  
- 🇮🇳 **India‑first** – Rupee‑based flows, Indian finance scenarios, and culturally relevant examples.  
- 🤖 **AI‑first experience** – Not just calculators, but a friendly guide that explains the *why* behind every decision.

> **FinSaarthi = “Saarthi” (guide) + AI – your smart co‑pilot for money.**

***


### 1. **My Government Benefits**
- Find eligible government schemes
- Personalized benefit recommendations
- Scheme analysis and verification
- Document guidance
- Fraud protection alerts
- PDF report generation

### 2. **Smart Savings**
- Daily savings goal tracker
- Digital piggy bank
- Wealth projections (10 days to 1 year)
- Life goal attachment
- AI savings habit analysis
- Streak tracking


### 3. **Financial Education**
- Banking 101: Account types, cards, loans, safety tips
- Investment basics
- Tax planning
- Retirement planning
- Interactive learning modules

### 4. **Advanced Calculator Hub**
- EMI Calculator
- SIP Calculator
- Retirement Calculator
- Tax Calculator
- Loan Comparison
- FD Calculator
- Business Calculator

### 5. **FinSaarthi AI Assistant**
- 24/7 AI chatbot for financial queries
- Conversational financial advice
- Quick question suggestions
- Real-time responses using Groq API
🎯 Why FinSaarthi?  
------------------

Most people juggle multiple apps and spreadsheets: one for expenses, one for EMIs, one for learning, and none for unbiased, contextual advice.

**Pain points we target:**

- Fragmented tools and no single view of money.  
- Confusing loan / EMI / investment decisions.  
- Lack of personalized guidance for Indian users.  

**FinSaarthi responds with:**

- A single **AI‑enhanced finance surface** for chat, tools, and learning.  
- Clean, visual interfaces that make finance feel less scary and more intuitive.  
- Future‑ready modules that can be extended as an open‑innovation platform.

***

🌟 Main Screens & Features  
--------------------------

### 🏠 Home – Smart Finance, Smarter You

- Hero section with bold tagline: **“Smart Finance, Smarter Future”**.  
- Primary CTAs: **Get Started** and **Explore Tools** for quick onboarding.  
- Highlight counters (AI tools, calculators, users, accuracy) to position FinSaarthi as a complete platform.  
- “About FinSaarthi” block describing the mission in simple, human language.

***

### 💬 AI Chat – Ask Anything About Money

- Chat‑style experience where users type natural questions about:  
  - Budgeting, savings, EMIs, investing basics, and everyday money doubts.  
- AI replies with **clear explanations, not just numbers**, helping users understand trade‑offs and next steps.  
- Designed as a neutral, educational finance buddy (not a product‑pushing bot).

***

### 🧰 Tools Menu

#### 📊 Calculators

- Central place for your financial calculators (EMI, SIP, savings, etc., as currently implemented).  
- Dark theme, card‑based layout with:  
  - Simple inputs  
  - Instant results  
  - Contextual helper text for new users  

#### 💡 Smart Savings

- Screen focused on saving‑oriented thinking and insights.  
- Encourages users to move from random spending to **intentional saving**.  
- Pairs well with the calculator outputs and AI guidance.

```
FIN-MENTOR-AI/
├── src/
│   ├── components/
│   │   ├── Header.tsx                    # Navigation bar
│   │   ├── Hero.tsx                      # Landing page
│   │   ├── SmartBudgetAI.tsx            # Budget analysis
│   │   ├── SmartExpenseTracker.tsx      # Expense tracking
│   │   ├── SmartBusinessCalculator.tsx  # Business calculator
│   │   ├── GovernmentBenefits.tsx       # Government schemes
│   │   ├── SmartSavings.tsx             # Savings tracker
│   │   ├── FinancialEducation.tsx       # Learning modules
│   │   ├── AdvancedCalculatorHub.tsx    # Calculator tools
│   │   └── AIFinanceBot.tsx             # AI chatbot
│   ├── data/
│   │   ├── expenseData.ts               # Expense dummy data
│   │   └── businessData.ts              # Business dummy data
│   ├── utils/
│   │   ├── groqApi.ts                   # Groq API integration
│   │   └── educationGroq.ts             # Education AI
│   ├── App.tsx                          # Main app component
│   └── main.tsx                         # Entry point
├── .env                                 # Environment variables
├── .gitignore                           # Git ignore rules
├── package.json                         # Dependencies
├── tailwind.config.js                   # Tailwind configuration
├── tsconfig.json                        # TypeScript config
└── README.md                            # This file
```
#### 💹 InvestCompare – Smart Investment Comparator

- Dedicated page to configure and compare investment options like:  
  - Gold  
  - Fixed Deposits  
  - Mutual Funds  
- Users pick amount, time period, risk level, and preferences (e.g., liquidity, frequency).  
- Interface walks through steps and shows structured comparison, with an **educational warning banner**:  
  > “Educational prediction – Not a financial guarantee.”

#### 🏦 Find Banks (if enabled)

- Helper area for discovering / thinking about banks and financial institutions.  
- Future‑ready section for integrating curated banking information or discovery tools.

***

### 🤖 AI Tools Menu

#### 📈 StockMentor AI (if present)

- AI helper focused on stock‑related explanations and “what‑if” scenarios.  
- Strictly educational: helps users understand concepts, not give tips.

#### 🧠 SmartBudget AI

- AI layer on top of budgeting to highlight spending patterns, categories, and possible optimizations.  
- Bridges the gap between raw numbers and actionable advice.

#### 💼 Career Income AI – Career Income Intelligence

- Form where users enter:  
  - Current job role  
  - Years of experience  
  - Work location  
  - Key skills  
  - Industry and education level  
- Outputs focus on:  
  - Estimated salary range for current profile  
  - 1, 3, 5‑year growth possibilities  
  - Skill gap analysis and upskilling hints  
  - High‑level financial planning tips linked to income growth  

This module connects **career planning + income + finance** in one flow.

***

### 📚 Learn Menu – Financial Learning Hub

- A colorful, card‑based **Financial Learning Hub** with lessons such as:  
  - Lesson 1 – Introduction to Money & Banking  
  - Lesson 2 – Types of Bank Accounts  
  - Lesson 3 – ATM, Debit Card & UPI Basics  
  - Lesson 4 – What Is Saving & Why It Is Important  
  - Lesson 5 – Budgeting – Managing Income & Expenses  
  - Lesson 6 – Introduction to Loans & EMI  
  - Lesson 7+ – Insurance, investments, and more  
- Progress strip at the top showing level and total points (for future gamification).  
- Tabs like **Lessons**, **Banking 101**, and **Leaderboard** to structure the learning journey.

FinSaarthi is not just a tool – it doubles as a **financial literacy classroom**.

***

🧱 Tech Snapshot  
----------------

- ⚛️ **Frontend:** React, TypeScript, Vite  
- 🎨 **Styling:** Tailwind CSS, custom gradients, dark theme  
- 📊 **Charts / UI visuals:** React components designed for dashboards and forms  
- 🖥️ **Backend:** Node.js, Express.js, MongoDB (for auth and finance‑related data)  
- 🤖 **AI Layer:** LLM integration (e.g., Groq) powering:  
  - AI Chat  
  - SmartBudget AI  
  - Career Income AI  
  - Other AI tools as they evolve  

Design language: **neon gradients on deep navy / black**, soft glows, and rounded cards to feel like a futuristic finance cockpit.

***

⚙️ Getting Started  
------------------

### ✅ Prerequisites

- Node.js 18+  
- npm or yarn  
- MongoDB instance (local or Atlas)  
- AI API key (Groq or compatible provider)

### 1️⃣ Clone the Repo

```bash
git clone <repository-url>
cd FIN-MENTOR-AI
git clone https://github.com/SamarthBurkul/finsaarthi-ai.git
cd finsaarthi-ai
```

### 2️⃣ Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 3️⃣ Environment Variables

Create `.env` in the project root (frontend):

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_GROQ_API_KEY=your_llm_key_here
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_here
PORT=5000
PERPLEXITY_API_KEY=your_optional_perplexity_key
```

Make sure `.env` is in `.gitignore` so secrets are never committed.

### 4️⃣ Run Locally

```bash
# Backend
cd backend
npm run dev

# Frontend (new terminal)
cd ..
npm run dev
```

Open the app at: **http://localhost:5173** 🚀

### 5️⃣ Build for Production

```bash
npm run build
```

Deploy the frontend (e.g., Vercel) and backend (e.g., Render / Railway / VPS) with the same environment variables.

***

🔐 Security & Privacy  
---------------------

- 🔑 JWT‑based authentication for user‑specific features.  
- 🛡️ No direct bank logins or sensitive account integrations.  
- 🔒 Secrets stored only in environment variables, not in the repository.  
- 🧱 Backend includes basic validation and error handling to keep APIs robust.

***

🧭 Roadmap – Open Innovation Ahead  
----------------------------------

- 🌐 Multilingual support (Hindi, Marathi, Tamil, etc.).  
- 🎯 Rich goal‑based planning flows (“education abroad”, “emergency fund”, “first home”).  
- 🏆 Fully gamified learning with quizzes, streaks, and detailed leaderboard.  
- 👥 Community‑driven budgeting templates and finance playbooks.  
- 🏛️ Deeper integration with verified Indian government scheme data.

***

🤝 Team & Contributions  
-----------------------

FinSaarthi is built by a student team as part of an open‑innovation initiative in fintech.  
Suggestions, bug reports, and thoughtful contributions are welcome.

**How to contribute:**

1. Fork this repository.  
2. Create a feature branch (`feature/your-idea`).  
3. Commit and push your changes.  
4. Open a pull request explaining what you improved.

***

📄 License  
---------

FinSaarthi is currently intended for **hackathon, demo, and educational use**.  
For commercial usage or large‑scale deployments, please contact the maintainers.

***

**FinSaarthi – your AI co‑pilot for clearer, smarter, and more confident financial decisions. 🚀💸**