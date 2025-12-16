import React from 'react';
import {
  Calculator,
  BookOpen,
  Shield,
  Menu,
  TrendingUp,
  ShieldCheck,
  FileSearch,
  Building2,
  PiggyBank,
  AlertTriangle,
  Brain,
  Award,
  BarChart3,
  DollarSign,
  Target
} from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const topRowItems = [
    { id: 'home', label: 'Home', icon: Shield },
    { id: 'ai-chat', label: 'AI Chat', icon: Brain },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'education', label: 'Learn', icon: BookOpen },
    { id: 'bank-locator', label: 'Find Banks', icon: Building2 },
    { id: 'government-benefits', label: 'Gov Benefits', icon: PiggyBank },
    { id: 'smart-savings', label: 'Smart Savings', icon: Target },
    { id: 'investment-comparator', label: 'Investment Comparator', icon: BarChart3 }
    

  ];
const bottomRowItems = [
    
    { id: 'stock-mentor', label: 'StockMentor AI', icon: TrendingUp },
    { id: 'career-income', label: 'Career Income AI', icon: Award },
    { id: 'smart-budget', label: 'SmartBudget AI', icon: DollarSign },
  ];


  return (
    <header className="luxury-gradient text-soft-white shadow-2xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Top Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-playfair font-bold">FinSaarthi</h1>
              <p className="text-xs text-white">Your Smart AI Finance Guide</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-2 xl:space-x-3">
            {topRowItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-1 px-2 xl:px-3 py-2 rounded-lg transition-all duration-300 text-sm border border-gold ${
                    activeSection === item.id
                      ? 'bg-gold text-white'
                      : 'hover:bg-white/10 text-soft-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Row */}
        <div className="hidden lg:flex justify-end pr-20">
          <nav className="flex space-x-2 xl:space-x-3">
            {bottomRowItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center space-x-1 px-2 xl:px-3 py-2 rounded-lg transition-all duration-300 text-sm border border-gold ${
                    activeSection === item.id
                      ? 'bg-gold text-white'
                      : 'hover:bg-white/10 text-soft-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden mt-2">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {[...topRowItems, ...bottomRowItems].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex flex-col items-center px-1 py-2 rounded-lg transition-all duration-300 text-xs border border-gold ${
                    activeSection === item.id
                      ? 'bg-gold text-white'
                      : 'hover:bg-white/10 text-soft-white'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium mt-1 text-center leading-tight">
                    {item.label.includes(' ')
                      ? item.label.split(' ')[0]
                      : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;