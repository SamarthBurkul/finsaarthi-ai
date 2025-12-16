import React, { useState, useEffect } from 'react';
import {
  Calculator,
  BookOpen,
  Shield,
  TrendingUp,
  Brain,
  Target,
  Star,
  CheckCircle,
  Heart,
  MapPin,
  PiggyBank,
  CreditCard,
  FileText,
  Briefcase,
  BarChart3,
  Sparkles
} from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ setActiveSection }) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'AI Chat',
      description: 'Real-time financial advice and personalized recommendations.',
      action: () => setActiveSection('ai-chat'),
      gradient: 'from-purple-600 via-violet-600 to-purple-800',
      emoji: '🤖'
    },
    {
      icon: Calculator,
      title: 'Calculators',
      description: 'EMI, SIP, FD, RD, Interest, Savings Growth & Business calculators.',
      action: () => setActiveSection('calculators'),
      gradient: 'from-blue-600 via-indigo-600 to-blue-800',
      emoji: '🧮'
    },
    {
      icon: BookOpen,
      title: 'Learn Finance',
      description: 'Banking basics, quizzes, gamified learning & progress tracking.',
      action: () => setActiveSection('education'),
      gradient: 'from-green-600 via-emerald-600 to-green-800',
      emoji: '📚'
    },
    {
      icon: MapPin,
      title: 'Find Banks',
      description: 'Locate nearby banks & ATMs with directions.',
      action: () => setActiveSection('bank-locator'),
      gradient: 'from-teal-600 via-cyan-600 to-teal-800',
      emoji: '📍'
    },
    {
      icon: FileText,
      title: 'Government Benefits',
      description: 'AI-based eligibility checks and scheme reports.',
      action: () => setActiveSection('government-benefits'),
      gradient: 'from-pink-600 via-rose-600 to-pink-800',
      emoji: '🏛️'
    },
    {
      icon: PiggyBank,
      title: 'Smart Savings',
      description: 'Daily savings tracking with AI habit insights.',
      action: () => setActiveSection('smart-savings'),
      gradient: 'from-yellow-600 via-amber-500 to-yellow-800',
      emoji: '🐷'
    },
    {
      icon: TrendingUp,
      title: 'Investment Comparator',
      description: 'Compare FD, Gold & Mutual Funds with AI advice.',
      action: () => setActiveSection('investment-comparator'),
      gradient: 'from-indigo-600 via-purple-600 to-indigo-800',
      emoji: '📈'
    },
    {
      icon: BarChart3,
      title: 'StockMentor AI',
      description: 'Educational stock analysis & risk insights.',
      action: () => setActiveSection('stock-mentor'),
      gradient: 'from-sky-600 via-blue-500 to-sky-800',
      emoji: '📊'
    },
    {
      icon: Briefcase,
      title: 'Career Income AI',
      description: 'Salary projection & skill-based income growth.',
      action: () => setActiveSection('career-income'),
      gradient: 'from-lime-600 via-green-500 to-lime-800',
      emoji: '💼'
    },
    {
      icon: Target,
      title: 'SmartBudget AI',
      description: 'Expense tracking, budgeting & financial health score.',
      action: () => setActiveSection('smart-budget'),
      gradient: 'from-blue-800 via-indigo-700 to-blue-900',
      emoji: '🎯'
    },
    {
      icon: Shield,
      title: 'CyberShield',
      description: 'Fraud detection, scam alerts & safety guides.',
      action: () => setActiveSection('cyber-shield'),
      gradient: 'from-red-800 via-rose-700 to-red-900',
      emoji: '🛡️'
    },
    {
      icon: CreditCard,
      title: 'Credit Doctor',
      description: 'Credit score improvement & loan approval analysis.',
      action: () => setActiveSection('credit-doctor'),
      gradient: 'from-violet-600 via-purple-600 to-violet-800',
      emoji: '💳'
    },
    {
      icon: CheckCircle,
      title: 'LoanGuard',
      description: 'Loan trap detection & interest evaluation.',
      action: () => setActiveSection('loan-guard'),
      gradient: 'from-amber-700 via-orange-600 to-amber-800',
      emoji: '🔒'
    },
    {
      icon: Heart,
      title: 'PolicySense AI',
      description: 'Insurance comparison & hidden clause detection.',
      action: () => setActiveSection('policy-sense'),
      gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
      emoji: '❤️'
    },
    {
      icon: Sparkles,
      title: 'Coming Soon',
      description: 'More AI-powered financial tools on the way.',
      action: () => {},
      gradient: 'from-gray-600 via-gray-700 to-gray-800',
      emoji: '🚀'
    }
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <section className="relative z-10 pt-16 pb-12">
        <div className="container mx-auto px-4 text-center">
          <img
            src="/finsaarthi.png"
            alt="FinSaarthi"
            className="h-48 md:h-64 mx-auto mb-6 rounded-2xl border-4 border-purple-500 shadow-lg"
          />
          <h1 className="text-3xl md:text-4xl text-yellow-400 font-bold mb-4">
            FinSaarthi – Your Smart AI Finance Guide
          </h1>
          <p className="text-gray-200 max-w-3xl mx-auto">
            Empowering every Indian with AI-driven financial insights, tools and education.
          </p>
        </div>
      </section>

      <section className="relative z-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={feature.action}
                className={`cursor-pointer bg-gradient-to-br ${feature.gradient} rounded-2xl p-6 hover:scale-105 transition`}
              >
                <div className="flex justify-center mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-white/90 text-center mt-2">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Hero;