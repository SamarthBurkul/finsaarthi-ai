import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import AdvancedCalculatorHub from "./components/AdvancedCalculatorHub";
import FinancialEducation from "./components/FinancialEducation";
import BankingBasics from "./components/BankingBasics";
import BankLocator from "./components/BankLocator";
import Leaderboard from "./components/Leaderboard";
import SmartSavings from "./components/SmartSavings";
import SmartBudgetAI from "./components/SmartBudgetAI";
import CareerIncomeIntelligence from "./components/CareerIncomeIntelligence";
import AIFinanceBot from "./components/AIFinanceBot";
import StockMentorAI from "./components/StockMentorAI";
import SmartInvestmentComparator from "./components/SmartInvestmentComparator";
import GovernmentBenefits from "./components/GovernmentBenefits";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { auth, googleProvider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import {
  AuthPageName,
  SignInValues,
  SignUpValues,
} from "./types/auth";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPage, setAuthPage] = useState<AuthPageName>("signup");
  const [activeSection, setActiveSection] = useState("home");

  // Check if user is already logged in (has valid token)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionally verify token with backend
      setIsAuthenticated(true);
    }
  }, []);

  // MongoDB signup (no Firebase)
  const handleEmailSignUp = async (values: SignUpValues) => {
    // SignUp component handles the API call
    // This is just a placeholder callback
  };

  // MongoDB signin (no Firebase)
  const handleEmailSignIn = async (values: SignInValues) => {
    // SignIn component handles the API call and sets auth
    setIsAuthenticated(true);
  };

  // Google authentication (Firebase + MongoDB sync)
  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Sync with MongoDB backend
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: user.displayName || 'Google User',
          email: user.email,
          firebaseUid: user.uid
        })
      });
      
      const data = await response.json();
      
      // Save JWT token
      localStorage.setItem('authToken', data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const handleSetActiveSection = (section: string) => {
    console.log("Switching to:", section);
    setActiveSection(section);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "ai-chat":
        return <AIFinanceBot />;
      case "investment-comparator":
        return <SmartInvestmentComparator />;
      case "stock-mentor":
        return <StockMentorAI />;
      case "calculators":
        return <AdvancedCalculatorHub />;
      case "education":
        return <FinancialEducation />;
      case "banking-basics":
        return <BankingBasics />;
      case "bank-locator":
        return <BankLocator />;
      case "smart-savings":
        return <SmartSavings />;
      case "career-income":
        return <CareerIncomeIntelligence />;
      case "smart-budget":
        return <SmartBudgetAI />;
      case "government-benefits":
        return <GovernmentBenefits />;
      default:
        return <Hero setActiveSection={handleSetActiveSection} />;
    }
  };

  if (!isAuthenticated) {
    return authPage === "signup" ? (
      <SignUp
        onEmailSignUp={handleEmailSignUp}
        onGoogleAuth={handleGoogleAuth}
        onNavigateTo={setAuthPage}
      />
    ) : (
      <SignIn
        onEmailSignIn={handleEmailSignIn}
        onGoogleAuth={handleGoogleAuth}
        onNavigateTo={setAuthPage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-cream-white">
      <Header
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
      />

      <main className="fade-in">{renderActiveSection()}</main>

      <footer className="luxury-gradient text-soft-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-playfair font-bold mb-4">
                FinSaarthi AI
              </h3>
              <p className="text-emerald-300 mb-4">
                Your smart AI-powered financial companion — simplifying money,
                banking, and investments for everyone.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-white font-bold">
                  F
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-blue-400">Features</h4>
              <ul className="space-y-2 text-blue-200">
                <li>EMI &amp; SIP Calculators</li>
                <li>Smart Budgeting</li>
                <li>AI Financial Advisor</li>
                <li>Bank Locator</li>
                <li>Fraud Protection</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-teal-400">Learn</h4>
              <ul className="space-y-2 text-teal-200">
                <li>Banking Basics</li>
                <li>Savings &amp; Budgeting</li>
                <li>Loans &amp; Credit</li>
                <li>Insurance</li>
                <li>Investing 101</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-purple-400">Support</h4>
              <ul className="space-y-2 text-purple-200">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Report Fraud</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-300">
            <p>
              &copy; 2025 FinSaarthi AI — An AI-powered inclusive financial
              platform. All rights reserved.
            </p>
            <p className="mt-2">
              🛡️ Your data stays private | 🇮🇳 Built for India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
