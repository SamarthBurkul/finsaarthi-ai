import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, GraduationCap, Heart, Briefcase, Building2, DollarSign, TrendingDown, ArrowRight, Check, Zap, Newspaper, ExternalLink, Clock, RefreshCw } from 'lucide-react';

// Types
interface Persona {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  description: string;
  color: string;
  newsKeywords: string;
  insights: {
    savings: string;
    investment: string;
    benefit: string;
  };
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

const BudgetCockpit: React.FC = () => {
  const [currentState, setCurrentState] = useState<'home' | 'profile' | 'decoding' | 'results'>('home');
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loadingNews, setLoadingNews] = useState<boolean>(false);
  const [newsError, setNewsError] = useState<string>('');

  // Backend API Configuration
  const BACKEND_API_URL = 'http://localhost:5000/api';

  const personas: Persona[] = [
    {
      id: 'salaried',
      title: 'Salaried Professional',
      icon: Briefcase,
      emoji: '🧑‍💻',
      description: 'Tax Slabs, 80C & Standard Deductions',
      color: 'from-blue-500 to-cyan-500',
      newsKeywords: 'income tax OR tax slabs OR tax deduction OR salary tax India',
      insights: {
        savings: 'Standard deduction increased to ₹1 Lakh. You save ₹7,500 annually.',
        investment: 'LTCG limit raised to ₹2 Lakh. Good time to review your Mutual Funds.',
        benefit: 'New tax regime now default. Switch strategically based on your investments.'
      }
    },
    {
      id: 'business',
      title: 'Business/MSME',
      icon: Building2,
      emoji: '🏢',
      description: 'GST, Corporate Tax & Business Schemes',
      color: 'from-orange-500 to-red-500',
      newsKeywords: 'GST India OR MSME OR corporate tax OR business finance India',
      insights: {
        savings: 'GST threshold increased to ₹40 Lakh. Small businesses save on compliance.',
        investment: 'Corporate tax rate reduced by 2% for MSMEs under ₹5cr turnover.',
        benefit: 'New ₹2,000cr MSME Credit Guarantee Fund launched. Check eligibility.'
      }
    },
    {
      id: 'student',
      title: 'Student/Youth',
      icon: GraduationCap,
      emoji: '🎓',
      description: 'Education Loans, Skill Schemes & Jobs',
      color: 'from-green-500 to-emerald-500',
      newsKeywords: 'education loan India OR student finance OR internship scheme India',
      insights: {
        savings: 'Education loan interest deduction increased to ₹2 Lakh annually.',
        investment: 'New ₹500cr AI Education Fund. 50% subsidy on certified courses.',
        benefit: 'Internship scheme expanded: ₹5,000/month for 1 crore youth over 5 years.'
      }
    },
    {
      id: 'senior',
      title: 'Senior Citizen',
      icon: Heart,
      emoji: '👴',
      description: 'FD Interest, Pension & Healthcare',
      color: 'from-purple-500 to-pink-500',
      newsKeywords: 'senior citizen scheme India OR pension India OR FD interest rate',
      insights: {
        savings: 'FD interest up to ₹1 Lakh now tax-free (was ₹50,000).',
        investment: 'Senior Citizen Savings Scheme limit increased to ₹30 Lakh.',
        benefit: 'New Ayushman Bharat coverage: Free health checkups for 70+ citizens.'
      }
    }
  ];

  // Fetch news based on persona
  const fetchNews = async (persona: Persona) => {
    setLoadingNews(true);
    setNewsError('');

    try {
      const response = await fetch(`${BACKEND_API_URL}/news/${persona.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();

      if (data.status === 'ok' && data.articles) {
        setNewsArticles(data.articles);

        // Show info if using sample data
        if (data.source === 'sample') {
          console.log('Using sample news data. Configure NewsAPI key in backend for real-time news.');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsError('Unable to connect to news service. Make sure the backend server is running on http://localhost:5000');
      // Fallback to sample news
      setNewsArticles(getSampleNews(persona));
    } finally {
      setLoadingNews(false);
    }
  };

  // Sample fallback news (in case API fails or key not provided)
  const getSampleNews = (persona: Persona): NewsArticle[] => {
    const sampleNewsByPersona: Record<string, NewsArticle[]> = {
      salaried: [
        {
          title: 'Union Budget 2026: Standard Deduction Hiked to ₹1 Lakh',
          description: 'Finance Minister announces major relief for salaried professionals with increased standard deduction.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Economic Times' }
        },
        {
          title: 'New Tax Regime vs Old: What Salaried Employees Should Choose',
          description: 'Experts weigh in on optimal tax planning strategies for 2026.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Business Standard' }
        },
        {
          title: 'LTCG Tax Limit Raised: Impact on Your Mutual Fund Returns',
          description: 'Analysis of how the new ₹2 Lakh LTCG exemption affects investors.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Money Control' }
        }
      ],
      business: [
        {
          title: 'GST Threshold Increased to ₹40 Lakh for Small Businesses',
          description: 'MSMEs celebrate as government reduces compliance burden.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Financial Express' }
        },
        {
          title: '₹2,000 Crore MSME Credit Guarantee Fund Announced',
          description: 'New fund aims to ease credit access for small and medium enterprises.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Business Today' }
        },
        {
          title: 'Corporate Tax Cut: 2% Relief for MSMEs Under ₹5 Crore',
          description: 'Government incentivizes growth in MSME sector with tax benefits.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'The Hindu BusinessLine' }
        }
      ],
      student: [
        {
          title: 'Education Loan Tax Deduction Doubled to ₹2 Lakh',
          description: 'Students get major relief as education loan interest deduction increases.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'The Times of India' }
        },
        {
          title: '₹500 Crore AI Education Fund: 50% Subsidy on Certified Courses',
          description: 'Government launches massive skill development initiative for youth.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Indian Express' }
        },
        {
          title: 'Internship Scheme Expanded: ₹5,000/Month for 1 Crore Youth',
          description: 'Five-year program aims to boost employability of Indian youth.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Hindustan Times' }
        }
      ],
      senior: [
        {
          title: 'Senior Citizens: FD Interest Tax Exemption Doubled to ₹1 Lakh',
          description: 'Major relief for retirees as tax-free FD interest limit increases.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'LiveMint' }
        },
        {
          title: 'SCSS Limit Raised to ₹30 Lakh: What It Means for Retirees',
          description: 'Analysis of increased Senior Citizen Savings Scheme limits.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Economic Times' }
        },
        {
          title: 'Ayushman Bharat Expanded: Free Health Checkups for 70+ Citizens',
          description: 'Healthcare benefits enhanced for senior citizens across India.',
          url: '#',
          urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
          publishedAt: new Date().toISOString(),
          source: { name: 'Health News' }
        }
      ]
    };

    return sampleNewsByPersona[persona.id] || [];
  };

  useEffect(() => {
    if (currentState === 'decoding') {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentState('results'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentState]);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    fetchNews(persona);
  };

  const startDecoding = () => {
    setCurrentState('decoding');
    setScanProgress(0);
  };

  const resetApp = () => {
    setCurrentState('home');
    setSelectedPersona(null);
    setScanProgress(0);
    setNewsArticles([]);
  };

  const refreshNews = () => {
    if (selectedPersona) {
      fetchNews(selectedPersona);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <section className="min-h-screen bg-[#0C2B4E] text-white overflow-hidden relative">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-slate-900/60 backdrop-blur-xl"></div>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Sticky Banner */}
      {showBanner && currentState === 'home' && (
        <div className="relative z-50 bg-gradient-to-r from-cyan-600 via-blue-500 to-teal-600 border-b-2 border-cyan-400 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-black animate-pulse" />
              <p className="text-black font-bold text-lg">
                📢 Union Budget 2026 is LIVE. How does the ₹12 Lakh tax-free limit affect you?
              </p>
            </div>
            <button
              onClick={() => setCurrentState('profile')}
              className="bg-black text-cyan-400 px-6 py-2 rounded-lg font-bold hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Decode Now
            </button>
            <button
              onClick={() => setShowBanner(false)}
              className="ml-4 text-black hover:text-slate-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* HOME STATE */}
        {currentState === 'home' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-300 to-teal-400 bg-clip-text text-transparent font-ubuntu">
                The Budget Cockpit
              </h1>
              <p className="text-2xl text-slate-400 font-light">
                Your Personal Finance Command Center
              </p>
            </div>

            <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center gap-3 justify-center">
                  <Zap className="w-8 h-8 text-cyan-400" />
                  <h2 className="text-3xl font-bold">Union Budget 2026</h2>
                </div>
                <p className="text-slate-300 text-lg">
                  We've decoded the 50-page Finance Bill so you don't have to. Get personalized insights in under 30 seconds.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center pt-4">
                  <div>
                    <div className="text-3xl font-bold text-cyan-400">4</div>
                    <div className="text-sm text-slate-400">Personas</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cyan-400">50+</div>
                    <div className="text-sm text-slate-400">Pages Analyzed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cyan-400">30s</div>
                    <div className="text-sm text-slate-400">To Insights</div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentState('profile')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  Start Decoding →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE SELECTION STATE */}
        {currentState === 'profile' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent font-ubuntu">
                Choose Your Profile
              </h1>
              <p className="text-xl text-slate-400">
                We'll tailor the insights to what matters most to you
              </p>
            </div>

            {/* Name Input */}
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Enter your name (optional)"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl px-6 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>

            {/* Persona Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {personas.map((persona) => {
                const Icon = persona.icon;
                return (
                  <div
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona)}
                    className={`group relative bg-slate-900/40 backdrop-blur-xl border-2 rounded-2xl p-8 cursor-pointer transition-all hover:shadow-2xl transform hover:scale-105 ${selectedPersona?.id === persona.id
                      ? 'border-cyan-400 shadow-cyan-500/30 shadow-xl'
                      : 'border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20'
                      }`}
                  >
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`}></div>

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{persona.emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {persona.title}
                          </h3>
                          <p className="text-slate-400 text-sm mt-1">
                            {persona.description}
                          </p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NEWS SECTION IN PROFILE SELECTION */}
            {newsArticles.length > 0 && (
              <div className="max-w-6xl mx-auto mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Newspaper className="w-8 h-8 text-cyan-400" />
                    <h2 className="text-3xl font-bold text-white font-ubuntu">Latest Finance News</h2>
                  </div>
                  <button
                    onClick={refreshNews}
                    disabled={loadingNews}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg hover:bg-slate-700 hover:border-cyan-400 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingNews ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {newsError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-red-400">{newsError}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                  {newsArticles.slice(0, 9).map((article, index) => (
                    <a
                      key={index}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-slate-900/40 backdrop-blur-xl border border-slate-700 hover:border-cyan-500/50 rounded-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-cyan-500/10 transform hover:scale-105"
                    >
                      {article.urlToImage && (
                        <div className="h-40 overflow-hidden bg-slate-800">
                          <img
                            src={article.urlToImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(article.publishedAt)}
                          <span className="mx-1">•</span>
                          <span>{article.source.name}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        {article.description && (
                          <p className="text-slate-400 text-sm line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium pt-2">
                          Read More
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* DECODE BUTTON - Only show when persona is selected */}
            {selectedPersona && (
              <div className="max-w-md mx-auto mt-8">
                <button
                  onClick={startDecoding}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3"
                >
                  <Zap className="w-6 h-6" />
                  Decode My Budget Insights
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="text-center mt-8">
              <button
                onClick={resetApp}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}

        {/* DECODING STATE */}
        {currentState === 'decoding' && selectedPersona && (
          <div className="max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">{selectedPersona.emoji}</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent font-ubuntu">
                Decoding Your Budget
              </h1>
            </div>

            {/* AI Pulse Animation */}
            <div className="relative h-64 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-yellow-500/20 rounded-full animate-ping"></div>
                <div className="absolute w-24 h-24 bg-cyan-500/40 rounded-full animate-pulse"></div>
                <div className="absolute w-16 h-16 bg-cyan-500/60 rounded-full"></div>
                <Sparkles className="absolute w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            </div>

            {/* Scanning Text */}
            <div className="space-y-3">
              <p className="text-xl text-slate-300 font-medium">
                Scanning Finance Bill 2026...
              </p>
              <p className="text-lg text-cyan-400">
                Cross-referencing with <span className="font-bold">{selectedPersona.title}</span> profile...
              </p>
              <p className="text-md text-slate-500">
                Fetching latest finance news...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-300 ease-out relative"
                  style={{ width: `${scanProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
              <p className="text-slate-500 text-sm">{scanProgress}% Complete</p>
            </div>

            {/* Scanning Line Effect */}
            <div className="relative h-32 border border-yellow-500/20 rounded-lg overflow-hidden">
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan"></div>
              <div className="flex items-center justify-center h-full text-slate-600 font-mono text-sm">
                {'<'} ANALYZING BUDGET DATA {'>'}
              </div>
            </div>
          </div>
        )}

        {/* RESULTS STATE */}
        {currentState === 'results' && selectedPersona && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="text-5xl">{selectedPersona.emoji}</div>
              <h1 className="text-4xl font-black">
                Hey {userName || 'there'}, here are your{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent font-ubuntu">
                  3 Big Takeaways
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Personalized for {selectedPersona.title}
              </p>
            </div>

            {/* Bento Grid - 3 Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Card 1: Tax Savings */}
              <div className="bg-slate-900/60 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl p-6 hover:border-green-400 transition-all hover:shadow-2xl hover:shadow-green-500/20 transform hover:scale-105">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-400">Tax Savings</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedPersona.insights.savings}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-green-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Immediate Impact
                  </div>
                </div>
              </div>

              {/* Card 2: Investment */}
              <div className="bg-slate-900/60 backdrop-blur-xl border-2 border-yellow-500/30 rounded-2xl p-6 hover:border-yellow-400 transition-all hover:shadow-2xl hover:shadow-yellow-500/20 transform hover:scale-105">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-yellow-400">Investment</h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedPersona.insights.investment}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-yellow-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Action Required
                  </div>
                </div>
              </div>

              {/* Card 3: Career/Benefit */}
              <div className="bg-slate-900/60 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl p-6 hover:border-blue-400 transition-all hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-400">
                      {selectedPersona.id === 'student' ? 'Career' : 'Benefit'}
                    </h3>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedPersona.insights.benefit}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-blue-400 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    New Opportunity
                  </div>
                </div>
              </div>
            </div>


            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-bold py-4 rounded-xl hover:from-cyan-500 hover:to-blue-400 transition-all shadow-lg hover:shadow-2xl transform hover:scale-105">
                Update My Smart Savings
              </button>
              <button className="flex-1 bg-slate-800 border-2 border-cyan-500/30 text-cyan-400 font-bold py-4 rounded-xl hover:bg-slate-700 hover:border-cyan-400 transition-all">
                Ask AI a Follow-up
              </button>
            </div>

            {/* Try Another Profile */}
            <div className="text-center">
              <button
                onClick={() => setCurrentState('profile')}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Try Another Profile
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scan {
          0% {
            top: 0%;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default BudgetCockpit;