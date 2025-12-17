import React, { useState, useEffect } from "react";
import {
  Calculator,
  BookOpen,
  BookMarked,
  Shield,
  Menu,
  X,
  TrendingUp,
  PiggyBank,
  Brain,
  Award,
  BarChart3,
  DollarSign,
  MapPin,
  FileText,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  const mainNavItems = [
    { id: "home", label: "Home", icon: Shield },
    { id: "ai-chat", label: "AI Chat", icon: Brain },
  ];

  const toolsGroup = [
    { id: "calculators", label: "Calculators", icon: Calculator },
    { id: "smart-savings", label: "Smart Savings", icon: PiggyBank },
    { id: "investment-comparator", label: "InvestCompare", icon: BarChart3 },
    { id: "bank-locator", label: "Find Banks", icon: MapPin },
  ];

  const aiToolsGroup = [
    { id: "stock-mentor", label: "StockMentor AI", icon: TrendingUp },
    { id: "smart-budget", label: "SmartBudget AI", icon: DollarSign },
    { id: "career-income", label: "Career Income AI", icon: Award },
  ];

  const learnGroup = [
    { id: "education", label: "Study", icon: BookMarked },
    { id: "government-benefits", label: "Gov Benefits", icon: FileText },
  ];

  const handleNavClick = (section: string) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
    setOpenMegaMenu(null);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 ${
        isScrolled
          ? "bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl backdrop-blur-xl bg-opacity-95"
          : "bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleNavClick("home")}>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent">
                FinSaarthi
              </h1>
<<<<<<< HEAD
              <p className="text-xs text-gray-400">AI Finance Platform</p>
=======
              <p className="text-xs text-gray-400">Your Smart AI Finance Guide</p>
>>>>>>> 2c869d359dcc3164fe4351cbc819f42190aacbb5
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-600 relative group ${
                    activeSection === item.id
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Tools Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMegaMenu("tools")}
              onMouseLeave={() => setOpenMegaMenu(null)}
            >
              <button
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-600 ${
                  toolsGroup.some((item) => activeSection === item.id)
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span className="font-medium">Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-600 ${openMegaMenu === "tools" ? "rotate-180" : ""}`} />
              </button>
              {openMegaMenu === "tools" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-cyan-500/20 p-4 animate-fadeIn">
                  {toolsGroup.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-600 mb-2 last:mb-0 ${
                          activeSection === item.id
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AI Tools Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMegaMenu("ai-tools")}
              onMouseLeave={() => setOpenMegaMenu(null)}
            >
              <button
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-600 ${
                  aiToolsGroup.some((item) => activeSection === item.id)
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Brain className="w-4 h-4" />
                <span className="font-medium">AI Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-600 ${openMegaMenu === "ai-tools" ? "rotate-180" : ""}`} />
              </button>
              {openMegaMenu === "ai-tools" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-cyan-500/20 p-4 animate-fadeIn">
                  {aiToolsGroup.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-600 mb-2 last:mb-0 ${
                          activeSection === item.id
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Learn & Resources Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setOpenMegaMenu("learn")}
              onMouseLeave={() => setOpenMegaMenu(null)}
            >
              <button
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-600 ${
                  learnGroup.some((item) => activeSection === item.id)
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Learn</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-600 ${openMegaMenu === "learn" ? "rotate-180" : ""}`} />
              </button>
              {openMegaMenu === "learn" && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-cyan-500/20 p-4 animate-fadeIn">
                  {learnGroup.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-600 mb-2 last:mb-0 ${
                          activeSection === item.id
                            ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
<<<<<<< HEAD
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50"
=======
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-600 text-gray-300 hover:text-white hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50"
>>>>>>> 2c869d359dcc3164fe4351cbc819f42190aacbb5
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-6 animate-slideDown">
            <div className="space-y-2 pt-4">
              {[...mainNavItems, ...toolsGroup, ...aiToolsGroup, ...learnGroup].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-600 ${
                      activeSection === item.id
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
<<<<<<< HEAD
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30"
=======
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-600 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30"
>>>>>>> 2c869d359dcc3164fe4351cbc819f42190aacbb5
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;