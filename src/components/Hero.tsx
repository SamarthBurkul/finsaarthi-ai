import React, { useState, useEffect, useRef } from "react";
import {
  Calculator,
  BookOpen,
  Brain,
  Target,
  MapPin,
  PiggyBank,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  Shield,
  Sparkles,
  ArrowRight,
  BookMarked,
} from "lucide-react";

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ setActiveSection }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fadeInUp");
          entry.target.classList.add("visible");
        }
      });
    }, observerOptions);

    [aboutRef, featuresRef].forEach((ref) => {
      if (ref.current) {
        ref.current.classList.add("scroll-section");
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI Financial Guidance",
      description: "Get personalized financial advice powered by advanced AI",
      gradient: "from-purple-500 via-violet-500 to-purple-600",
      action: () => setActiveSection("ai-chat"),
    },
    {
      icon: DollarSign,
      title: "Smart Budgeting",
      description: "Track expenses and optimize your budget with AI insights",
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      action: () => setActiveSection("smart-budget"),
    },
    {
      icon: BarChart3,
      title: "Investment Comparison",
      description: "Compare FD, Gold, Mutual Funds with intelligent analysis",
      gradient: "from-indigo-500 via-purple-500 to-indigo-600",
      action: () => setActiveSection("investment-comparator"),
    },
    {
      icon: Calculator,
      title: "Credit & Loan Assistance",
      description: "EMI, SIP, FD calculators and loan planning tools",
      gradient: "from-teal-500 via-cyan-500 to-teal-600",
      action: () => setActiveSection("calculators"),
    },
    {
      icon: FileText,
      title: "Government Benefits Finder",
      description: "Discover eligible schemes and benefits with AI analysis",
      gradient: "from-pink-500 via-rose-500 to-pink-600",
      action: () => setActiveSection("government-benefits"),
    },
    {
      icon: BookMarked,
      title: "Educate Yourself",
      description: "Empowering you with the knowledge to make smarter financial decisions",
      gradient: "from-green-500 via-emerald-500 to-green-600",
      action: () => setActiveSection("education"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements with Parallax */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ transform: 'translateZ(0)' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "5s", transform: 'translateZ(0)' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s", transform: 'translateZ(0)' }} />
      </div>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative z-10 pt-24 pb-20 px-4 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full border border-teal-500/30 mb-6 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span className="text-sm text-teal-300 font-medium">AI-Powered Finance Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            Smart Finance,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Smarter Future
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            Your AI-powered financial companion helping you manage money, savings, investments, and security with intelligent insights and personalized guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn" style={{ animationDelay: "0.6s" }}>
            <button
              onClick={() => setActiveSection("ai-chat")}
              className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/40 hover:shadow-xl hover:shadow-teal-500/60 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveSection("calculators")}
              className="px-8 py-4 bg-white/5 backdrop-blur-lg text-white rounded-xl font-semibold border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              Explore Tools
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto animate-fadeIn" style={{ animationDelay: "0.8s" }}>
            {[
              { label: "AI Tools", value: "10+" },
              { label: "Calculators", value: "15+" },
              { label: "Users", value: "50K+" },
              { label: "Accuracy", value: "99%" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-teal-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={aboutRef}
        className="relative z-10 py-20 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-black/40 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-teal-500/20 shadow-2xl">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/40">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                  About FinSaarthi
                </h2>
                <p className="text-lg text-gray-300 leading-relaxed mb-4">
                  FinSaarthi is your comprehensive AI-powered personal finance platform designed to help you take control of your financial future. We combine cutting-edge artificial intelligence with practical financial tools to provide personalized guidance on money management, savings strategies, investment decisions, career planning, and security.
                </p>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Whether you're planning your first budget, comparing investment options, exploring government benefits, or seeking career growth insights, our intelligent platform adapts to your needs and provides trustworthy, actionable advice to help you make informed financial decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="relative z-10 py-20 px-4"
      >
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage your finances intelligently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                  onClick={feature.action}
                  className={`group relative bg-gradient-to-br from-black/50 to-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-500 cursor-pointer ${
                    activeFeature === index
                      ? "border-teal-500/50 shadow-2xl shadow-teal-500/10 scale-105"
                      : "border-white/5 hover:border-teal-500/20"
                  }`}
                >
                  {/* Gradient Background on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <div
                    className={`relative w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg transition-transform duration-500 ${
                      activeFeature === index ? "scale-110 rotate-3" : "group-hover:scale-105"
                    }`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div
                    className={`mt-6 flex items-center text-teal-400 transition-all duration-300 ${
                      activeFeature === index ? "translate-x-2 opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </div>

                  {/* Glow Effect */}
                  {activeFeature === index && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-teal-900/20 via-blue-900/20 to-black/20 backdrop-blur-xl rounded-3xl p-12 border border-teal-500/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your journey towards financial freedom today
            </p>
            <button
              onClick={() => setActiveSection("ai-chat")}
              className="px-10 py-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/40 hover:shadow-xl hover:shadow-teal-500/60 transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Chat with AI Advisor</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;