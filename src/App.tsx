import React, { useEffect, useState } from "react";
import { Shield } from "lucide-react";
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
      

      // Use the base URL from your env
      const API_BASE = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_BASE}/auth/signup`, { // Removed extra '/api' here
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: user.displayName || 'Google User',
          email: user.email,
          firebaseUid: user.uid
        })
      });
      
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
};

  const handleSetActiveSection = (section: string) => {
    console.log("Switching to:", section);
    setActiveSection(section);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setActiveSection("home");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <Header
        activeSection={activeSection}
        setActiveSection={handleSetActiveSection}
        onLogout={handleLogout}
      />

      <main className="fade-in pt-20">{renderActiveSection()}</main>

      <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-t border-cyan-500/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    FinSaarthi
                  </h3>
                  <p className="text-xs text-gray-400">AI Finance Platform</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                Your smart AI-powered financial companion — simplifying money, banking, and investments for everyone.
              </p>
              {/* Social Media Icons */}
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 hover:border-cyan-500/50"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 hover:border-cyan-500/50"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 hover:border-cyan-500/50"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-white/10 hover:bg-cyan-500/20 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 hover:border-cyan-500/50"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-gray-400 hover:text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400 text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleSetActiveSection("home")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("ai-chat")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    AI Chat
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("calculators")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Tools
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("education")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Learn
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400 text-lg">Features</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => handleSetActiveSection("smart-budget")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Smart Budgeting
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("investment-comparator")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Investment Comparator
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("smart-savings")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Smart Savings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("stock-mentor")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    StockMentor AI
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSetActiveSection("career-income")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm"
                  >
                    Career Income AI
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h4 className="font-semibold mb-4 text-cyan-400 text-lg">Legal & Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Report Issue
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-sm">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-cyan-500/20 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm text-center md:text-left">
                © 2025 FinSaarthi AI. All Rights Reserved.
              </p>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>Your data stays private</span>
                <span className="mx-2">•</span>
                <span>🇮🇳 Built for India</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;