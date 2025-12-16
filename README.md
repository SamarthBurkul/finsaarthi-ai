# FinSaarthi - Your Smart Finance Guide 💰

**AI-Powered Financial Platform for Everyone**

FinSaarthi is a comprehensive financial management platform that combines AI technology with practical financial tools to help users manage money, track expenses, protect against fraud, and achieve financial goals.

---

## 🌟 Key Features

### 1. **Smart Budget AI**
- AI-powered budget analysis and recommendations
- Personalized financial advice based on income and expenses
- Smart expense tracking with 13 categories
- Daily/Weekly/Monthly expense charts (Bar & Line)
- 30 days of transaction history

### 2. **Smart Expense Tracker**
- Track expenses across 13 categories: Food, Travel, Shopping, Education, Bills, Family, Entertainment, Healthcare, Fitness, Investment, Insurance, Fuel, Others
- Visual analytics with interactive charts
- AI-powered spending insights
- Dark theme UI with emerald/teal gradients

### 3. **Smart Business Calculator**
- Real-time business profit/loss tracking
- Start/Stop timer for business sessions
- Automatic calculation storage
- Business analytics with daily/weekly/monthly charts
- AI-powered business insights
- 30 days of dummy data for testing

### 4. **Credit Score Doctor**
- Credit score analysis and improvement tips
- Personalized credit health assessment
- AI-powered recommendations
- Credit building strategies

### 5. **CyberShield - Fraud Protection**
- AI fraud detector for suspicious messages/calls
- Real-time scam analysis
- Emergency action panel (Call 1930, Block UPI/Cards)
- Common fraud types education
- Post-fraud recovery guide
- Scam psychology analysis

### 6. **LoanGuard - Loan Safety Analyzer**
- AI-powered loan risk assessment
- Interest rate analysis
- EMI affordability check
- Processing fee evaluation
- Hidden charges detection
- PDF report generation

### 7. **PolicySense AI - Insurance Analyzer**
- Compare multiple insurance policies
- Individual policy analysis
- AI-powered recommendations
- Hidden clause detection
- Claim safety scoring
- Support for Health, Life, and Vehicle insurance

### 8. **My Government Benefits**
- Find eligible government schemes
- Personalized benefit recommendations
- Scheme analysis and verification
- Document guidance
- Fraud protection alerts
- PDF report generation

### 9. **Smart Savings**
- Daily savings goal tracker
- Digital piggy bank
- Wealth projections (10 days to 1 year)
- Life goal attachment
- AI savings habit analysis
- Streak tracking

### 10. **Career Insights AI**
- Career path recommendations
- Skill gap analysis
- Salary insights
- Job market trends
- Personalized career roadmap

### 11. **Financial Education**
- Banking 101: Account types, cards, loans, safety tips
- Investment basics
- Tax planning
- Retirement planning
- Interactive learning modules

### 12. **Advanced Calculator Hub**
- EMI Calculator
- SIP Calculator
- Retirement Calculator
- Tax Calculator
- Loan Comparison
- FD Calculator
- Business Calculator

### 13. **KANIMA AI Assistant**
- 24/7 AI chatbot for financial queries
- Conversational financial advice
- Quick question suggestions
- Real-time responses using Groq API

---

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **AI**: Groq API (LLaMA 3.1-8b-instant)
- **PDF Generation**: jsPDF
- **Build Tool**: Vite
- **Icons**: Lucide React

---

## 🎨 Design System

### Color Palette
- **Primary**: Emerald (#10B981), Teal (#14B8A6), Blue (#3B82F6)
- **Background**: Jet Black (#0A0A0A), Charcoal Gray (#1A1A1A)
- **Text**: Soft White (#F5F5F5), Slate Gray (#94A3B8)
- **Accents**: Gold (#FFD700), Neon Blue (#00E5FF)

### Typography
- **Headings**: Playfair Display
- **Body**: Inter
- **UI Elements**: Poppins

---

## 📁 Project Structure

```
KANIMA/
├── src/
│   ├── components/
│   │   ├── Header.tsx                    # Navigation bar
│   │   ├── Hero.tsx                      # Landing page
│   │   ├── SmartBudgetAI.tsx            # Budget analysis
│   │   ├── SmartExpenseTracker.tsx      # Expense tracking
│   │   ├── SmartBusinessCalculator.tsx  # Business calculator
│   │   ├── CreditScoreDoctor.tsx        # Credit analysis
│   │   ├── CyberShield.tsx              # Fraud protection
│   │   ├── LoanGuard.tsx                # Loan analyzer
│   │   ├── PolicySenseAI.tsx            # Insurance analyzer
│   │   ├── GovernmentBenefits.tsx       # Government schemes
│   │   ├── SmartSavings.tsx             # Savings tracker
│   │   ├── CareerInsightsAI.tsx         # Career guidance
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

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd KANIMA
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

---

## 🔐 Security

- API keys stored in `.env` file (not committed to Git)
- Environment variables accessed via `import.meta.env.VITE_*`
- `.env` file included in `.gitignore`
- No hardcoded credentials in source code

---

## 📊 Data Management

### Dummy Data
- **Expense Tracker**: 30 days of realistic Indian expense scenarios
- **Business Calculator**: 30 days of business transaction data
- Data generated programmatically for testing and demonstration

### AI Integration
- All AI features use Groq API with LLaMA 3.1-8b-instant model
- Prompts structured to provide plain text analysis
- Fallback responses for API failures
- JSON parsing with error handling

---

## 🎯 Navigation Structure

### Top Row (7 items)
- Home
- SmartBudget AI (with Expense Tracker)
- Credit Doctor
- CyberShield
- Career Insights
- Learn (with Banking 101)
- Calculators (with Business Calculator)

### Bottom Row (8 items)
- LoanGuard
- PolicySense
- My Benefits
- Smart Savings
- Invest Smart
- Tax Planner
- Retirement
- AI Assistant

---

## 🌈 Key Highlights

✅ **13 Expense Categories** with detailed tracking  
✅ **AI-Powered Insights** across all major features  
✅ **Dark Theme UI** with gradient accents  
✅ **Interactive Charts** for data visualization  
✅ **PDF Report Generation** for key features  
✅ **Real-time Calculations** for financial tools  
✅ **Fraud Protection** with emergency actions  
✅ **Government Scheme Finder** with eligibility check  
✅ **Career Guidance** with AI recommendations  
✅ **Financial Education** with comprehensive content  

---

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Adaptive layouts

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Developer

**SK WEBSITES**  
Smart Finance Solutions for Everyone

---

## 📞 Support

For support and queries, please contact through the website's AI Assistant or reach out to the development team.

---

**Built with ❤️ using React, TypeScript, and AI Technology**
