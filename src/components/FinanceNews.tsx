import React, { useState, useEffect } from "react";
import {
    Newspaper,
    TrendingUp,
    Clock,
    ExternalLink,
    Briefcase,
    GraduationCap,
    Users,
    DollarSign,
    RefreshCw,
    AlertCircle,
    Star,
    ChevronRight,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface NewsArticle {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: { name: string };
}

type PersonaType = "salaried" | "business" | "student" | "senior";

const FinanceNews: React.FC = () => {
    const [selectedPersona, setSelectedPersona] = useState<PersonaType>("salaried");
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<string>("");

    const personas = [
        {
            id: "salaried" as PersonaType,
            label: "Salaried Professional",
            icon: DollarSign,
            color: "from-blue-500 to-cyan-500",
            description: "Tax saving, salary hikes, EPF updates",
        },
        {
            id: "business" as PersonaType,
            label: "Business Owner",
            icon: Briefcase,
            color: "from-purple-500 to-pink-500",
            description: "GST, MSME schemes, startup funding",
        },
        {
            id: "student" as PersonaType,
            label: "Student",
            icon: GraduationCap,
            color: "from-green-500 to-emerald-500",
            description: "Education loans, scholarships, internships",
        },
        {
            id: "senior" as PersonaType,
            label: "Senior Citizen",
            icon: Users,
            color: "from-orange-500 to-amber-500",
            description: "Pension, SCSS, health benefits",
        },
    ];

    const fetchNews = async (persona: PersonaType) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`${API_BASE_URL}/news/${persona}`, {
                headers: {
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            const data = await response.json();

            if (data.status === "ok") {
                setNews(data.articles || []);
                setSource(data.source || "unknown");
            } else {
                throw new Error(data.message || "Failed to fetch news");
            }
        } catch (err: any) {
            console.error("Error fetching news:", err);
            setError(err.message || "Failed to load news");
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews(selectedPersona);
    }, [selectedPersona]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return "Just now";
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    };

    const getSelectedPersona = () => personas.find((p) => p.id === selectedPersona);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-3 rounded-full border border-cyan-500/30 mb-6">
                        <Newspaper className="w-6 h-6 text-cyan-400" />
                        <span className="text-cyan-400 font-semibold">Financial News Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-400 bg-clip-text text-transparent mb-4">
                        Personalized Finance News
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Stay updated with the latest financial news tailored to your profile. Select your category to get relevant updates.
                    </p>
                </div>

                {/* Persona Selector */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {personas.map((persona) => {
                        const Icon = persona.icon;
                        const isSelected = selectedPersona === persona.id;
                        return (
                            <button
                                key={persona.id}
                                onClick={() => setSelectedPersona(persona.id)}
                                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden ${isSelected
                                        ? `bg-gradient-to-br ${persona.color} border-transparent shadow-lg shadow-cyan-500/20`
                                        : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50"
                                    }`}
                            >
                                <div className="relative z-10">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isSelected ? "bg-white/20" : `bg-gradient-to-br ${persona.color} bg-opacity-20`
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-cyan-400"}`} />
                                    </div>
                                    <h3 className={`font-bold mb-1 ${isSelected ? "text-white" : "text-gray-200"}`}>
                                        {persona.label}
                                    </h3>
                                    <p className={`text-xs ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                                        {persona.description}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="absolute top-3 right-3">
                                        <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* News Source Badge */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${source === "newsapi"
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                }`}
                        >
                            {source === "newsapi" ? "📡 Live News" : "📰 Curated Updates"}
                        </div>
                        <span className="text-gray-500 text-sm">
                            {news.length} articles for {getSelectedPersona()?.label}
                        </span>
                    </div>
                    <button
                        onClick={() => fetchNews(selectedPersona)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-300 text-sm transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-400">Loading latest news...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                        <h3 className="text-xl font-bold text-red-400 mb-2">Failed to Load News</h3>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button
                            onClick={() => fetchNews(selectedPersona)}
                            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* News Grid */}
                {!loading && !error && news.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((article, index) => (
                            <a
                                key={index}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-slate-800/50 hover:bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10"
                            >
                                {/* Article Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={article.urlToImage || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                        <span className="px-2 py-1 bg-cyan-500/80 text-white text-xs font-medium rounded">
                                            {article.source?.name || "News"}
                                        </span>
                                    </div>
                                </div>

                                {/* Article Content */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-100 mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                        {article.description || "Click to read more about this financial update."}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatTimeAgo(article.publishedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium group-hover:gap-2 transition-all">
                                            Read more
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && news.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Newspaper className="w-16 h-16 text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No News Available</h3>
                        <p className="text-gray-500">Check back later for updates.</p>
                    </div>
                )}

                {/* Tips Section */}
                <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-500/20">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-100 mb-2">Stay Financially Informed</h3>
                            <p className="text-gray-400 mb-4">
                                Keep track of policy changes, tax updates, and financial opportunities relevant to your profile.
                                Our AI-powered news feed ensures you never miss important updates that could impact your finances.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {["Tax Updates", "Budget News", "Investment Tips", "Policy Changes"].map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 bg-slate-800 text-gray-300 text-sm rounded-full border border-slate-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceNews;
