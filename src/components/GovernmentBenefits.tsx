import React, { useState } from 'react';
import { Building2, Shield, Users, GraduationCap, Heart, Home, Download, AlertTriangle, CheckCircle, Search, Award, Brain } from 'lucide-react';
import jsPDF from 'jspdf';

const GovernmentBenefits: React.FC = () => {
  const [analysisMode, setAnalysisMode] = useState("profile");
  const [userProfile, setUserProfile] = useState({
    age: "",
    occupation: "",
    income: "",
    location: "",
    category: "",
    gender: "",
    maritalStatus: "",
    education: "",
  });
  const [schemeName, setSchemeName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [benefits, setBenefits] = useState<any>(null);
  const [schemeAnalysis, setSchemeAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  // shared Perplexity helper
  const callPerplexity = async (prompt: string) => {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content:
              "You are FinSaarthi Government Benefits AI, an expert on Indian central and state welfare schemes. Always answer in India context and be concise.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1200,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Perplexity GovBenefits error:", body);
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  };

  const analyzeScheme = async () => {
    if (!schemeName.trim()) return;

    setIsAnalyzing(true);
    setError("");
    setSchemeAnalysis(null);

    try {
      const prompt = `
You are an expert on Indian government schemes.

Analyze this scheme in India: "${schemeName}".

Return ONLY JSON in this exact shape:

{
  "schemeName": "string",
  "type": "Central | State | Local",
  "category": "Health | Education | Pension | Housing | Women | SC/ST | Other",
  "objective": "short description",
  "benefits": "detailed text about monetary and non-monetary benefits",
  "eligibility": "detailed text about who is eligible",
  "documents": ["Required documents"],
  "applicationProcess": "How to apply",
  "processingTime": "Approval time",
  "pros": ["Advantages"],
  "cons": ["Limitations"],
  "fraudAlerts": ["Common scams"],
  "verdict": "Overall assessment"
}
`;

      const content = await callPerplexity(prompt);

      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("No JSON found in Perplexity response");
      }

      const jsonText = content.slice(start, end + 1);
      const result = JSON.parse(jsonText);
      setSchemeAnalysis(result);
    } catch (err) {
      console.error("analyzeScheme error:", err);
      setError(
        "Unable to analyze this scheme right now. Please try again or verify on official portals."
      );
      setSchemeAnalysis({
        schemeName,
        verdict: "Unable to analyze. Please verify through official channels.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeBenefits = async () => {
      console.log("analyzeBenefits clicked", userProfile);

    setIsAnalyzing(true);
    setError("");
    setBenefits(null);

    try {
      const prompt = `
You are an expert Indian government welfare advisor.

User profile:
- Age: ${userProfile.age}
- Occupation: ${userProfile.occupation}
- Annual Income: ₹${userProfile.income}
- State: ${userProfile.location}
- Category: ${userProfile.category}
- Gender: ${userProfile.gender}
- Marital Status: ${userProfile.maritalStatus}
- Education Level: ${userProfile.education}

1) List 5–8 most relevant central or ${userProfile.location || "state"} schemes this user is likely eligible for.
2) Return ONLY valid JSON in this exact shape:

{
  "eligibleSchemes": [
    {
      "name": "string",
      "type": "Central | State | Local",
      "category": "Pension | Education | Housing | Health | Women | SC/ST | Other",
      "benefit": "short benefit text",
      "frequency": "One-time | Monthly | Annual | As per rules",
      "documents": ["Aadhaar Card", "Ration Card"],
      "processingTime": "string"
    }
  ],
  "totalAnnualBenefit": "string describing estimated yearly benefit",
  "notes": "short advice on how to apply and avoid fraud"
}
`;

      const content = await callPerplexity(prompt);

      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("No JSON found in Perplexity response");
      }

      const jsonText = content.slice(start, end + 1);
      const parsed = JSON.parse(jsonText);
      setBenefits(parsed);
    } catch (err) {
      console.error("analyzeBenefits error:", err);
      setError(
        "Unable to find benefits right now. Please try again in a few minutes."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ...keep the rest of your JSX exactly as it is below


  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'health': return <Heart className="w-5 h-5 text-error-red" />;
      case 'education': return <GraduationCap className="w-5 h-5 text-neon-blue" />;
      case 'pension': return <Users className="w-5 h-5 text-teal-green" />;
      case 'housing': return <Home className="w-5 h-5 text-warning-yellow" />;
      default: return <Shield className="w-5 h-5 text-success-green" />;
    }
  };

  return (
    <section className="py-16 bg-jet-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-playfair font-bold text-soft-white mb-4">
            My Government <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">Benefits</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-inter">
            AI-powered digital government assistant that ensures no citizen ever misses a government benefit again
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Analysis Mode Selector */}
          <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20 mb-8">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setAnalysisMode('profile')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  analysisMode === 'profile' 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white' 
                    : 'border border-slate-gray/30 text-soft-white hover:bg-emerald-500/10'
                }`}
              >
                Find My Benefits
              </button>
              <button
                onClick={() => setAnalysisMode('scheme')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  analysisMode === 'scheme' 
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white' 
                    : 'border border-slate-gray/30 text-soft-white hover:bg-emerald-500/10'
                }`}
              >
                Analyze Scheme
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Input Section */}
            <div className="max-w-4xl mx-auto">
              {analysisMode === 'profile' ? (
                <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
                  <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center font-inter">
                    <Building2 className="w-6 h-6 mr-2 text-emerald-400" />
                    Your Profile Details
                  </h3>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Age</label>
                      <input
                        type="number"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile({...userProfile, age: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                        placeholder="e.g., 25"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Occupation</label>
                      <select
                        value={userProfile.occupation}
                        onChange={(e) => setUserProfile({...userProfile, occupation: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                      >
                        <option value="">Select Occupation</option>
                        <option value="student">Student</option>
                        <option value="farmer">Farmer</option>
                        <option value="worker">Worker/Laborer</option>
                        <option value="employee">Private Employee</option>
                        <option value="government">Government Employee</option>
                        <option value="business">Business Owner</option>
                        <option value="unemployed">Unemployed</option>
                        <option value="retired">Retired</option>
                        <option value="housewife">Housewife</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Annual Income (₹)</label>
                      <input
                        type="number"
                        value={userProfile.income}
                        onChange={(e) => setUserProfile({...userProfile, income: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                        placeholder="e.g., 300000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Location (State)</label>
                      <input
                        type="text"
                        value={userProfile.location}
                        onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                        placeholder="e.g., Tamil Nadu"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Category</label>
                      <select
                        value={userProfile.category}
                        onChange={(e) => setUserProfile({...userProfile, category: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                      >
                        <option value="">Select Category</option>
                        <option value="general">General</option>
                        <option value="obc">OBC</option>
                        <option value="sc">SC</option>
                        <option value="st">ST</option>
                        <option value="ews">EWS</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Gender</label>
                      <select
                        value={userProfile.gender}
                        onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Marital Status</label>
                      <select
                        value={userProfile.maritalStatus}
                        onChange={(e) => setUserProfile({...userProfile, maritalStatus: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                      >
                        <option value="">Select Status</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Education Level</label>
                      <select
                        value={userProfile.education}
                        onChange={(e) => setUserProfile({...userProfile, education: e.target.value})}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                      >
                        <option value="">Select Education</option>
                        <option value="illiterate">Illiterate</option>
                        <option value="primary">Primary School</option>
                        <option value="secondary">Secondary School</option>
                        <option value="higher_secondary">Higher Secondary</option>
                        <option value="graduate">Graduate</option>
                        <option value="postgraduate">Post Graduate</option>
                      </select>
                    </div>
                  </div>
                </div>

                  <button
                    onClick={analyzeBenefits}
                    disabled={isAnalyzing}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Finding Your Benefits...</span>
                      </span>
                    ) : (
                      <>🏛️ Find My Government Benefits</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
                  <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center font-inter">
                    <Search className="w-6 h-6 mr-2 text-emerald-400" />
                    Scheme Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-soft-white font-inter">Government Scheme Name</label>
                      <input
                        type="text"
                        value={schemeName}
                        onChange={(e) => setSchemeName(e.target.value)}
                        className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none font-inter"
                        placeholder="e.g., Pradhan Mantri Jan Dhan Yojana, Ayushman Bharat"
                      />
                    </div>
                  </div>

                  <button
                    onClick={analyzeScheme}
                    disabled={isAnalyzing || !schemeName.trim()}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 w-full text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing Scheme...</span>
                      </span>
                    ) : (
                      <>🔍 Analyze Government Scheme</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="max-w-6xl mx-auto bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-xl font-semibold mb-6 text-soft-white flex items-center font-inter">
                <Shield className="w-6 h-6 mr-2 text-emerald-400" />
                {analysisMode === 'profile' ? 'Your Eligible Benefits' : 'Scheme Analysis Results'}
              </h3>

              {analysisMode === 'profile' ? (
                !benefits ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-slate-gray mx-auto mb-4" />
                    <p className="text-slate-gray font-inter">Enter your details to discover government benefits you're eligible for</p>
                  </div>
                ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 bg-gradient-to-r from-success-green/10 to-teal-green/10 border border-success-green/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-success-green" />
                      <span className="font-semibold text-emerald-400">Benefits Summary</span>
                    </div>
                    <p className="text-white font-semibold">
                      You are eligible for {benefits.eligibleSchemes?.length || 0} government schemes
                    </p>
                    <p className="text-sm text-white mt-1">
                      Total estimated annual benefit: {benefits.totalAnnualBenefit}
                    </p>
                  </div>

                  {/* Priority Schemes */}
                  {benefits.prioritySchemes?.length > 0 && (
                    <div className="p-4 bg-neon-blue/10 border border-neon-blue/30 rounded-lg">
                      <h4 className="font-semibold text-blue-400 mb-2">Priority Schemes (Apply First):</h4>
                      <ul className="text-sm text-white space-y-1">
                        {benefits.prioritySchemes.map((scheme: string, i: number) => (
                          <li key={i}>• {scheme}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Eligible Schemes */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">All Eligible Schemes:</h4>
                    {benefits.eligibleSchemes?.map((scheme: any, index: number) => (
                      <div key={index} className="p-4 bg-jet-black/50 rounded-lg border border-emerald-400/20">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(scheme.category)}
                            <div>
                              <h5 className="font-semibold text-emerald-400">{scheme.name}</h5>
                              <span className="text-xs text-white">{scheme.type} • {scheme.category}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-emerald-400">{scheme.benefit}</div>
                            <div className="text-xs text-white">{scheme.frequency}</div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-white mb-3">{scheme.eligibilityReason}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-400 font-semibold">Required Documents:</span>
                            <ul className="text-white mt-1">
                              {scheme.documents?.map((doc: string, i: number) => (
                                <li key={i}>• {doc}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-emerald-400 font-semibold">Application Process:</span>
                            <ul className="text-white mt-1">
                              {scheme.applicationProcess?.map((step: string, i: number) => (
                                <li key={i}>{i + 1}. {step}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-emerald-400/20 text-sm">
                          <p><span className="text-orange-400">Processing Time:</span> <span className="text-white">{scheme.processingTime}</span></p>
                          <p><span className="text-blue-400">Apply:</span> <span className="text-white">{scheme.officialWebsite}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Document Guidance */}
                  {benefits.documentGuidance && (
                    <div className="p-4 bg-warning-yellow/10 border border-warning-yellow/30 rounded-lg">
                      <h4 className="font-semibold text-orange-400 mb-3">Document Guidance:</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-emerald-400 font-semibold">Required:</span>
                          <ul className="text-white mt-1">
                            {benefits.documentGuidance.required?.map((doc: string, i: number) => (
                              <li key={i}>• {doc}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-red-400 font-semibold">May Need to Obtain:</span>
                          <ul className="text-white mt-1">
                            {benefits.documentGuidance.missing?.map((doc: string, i: number) => (
                              <li key={i}>• {doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fraud Warnings */}
                  {benefits.fraudWarnings?.length > 0 && (
                    <div className="p-4 bg-error-red/10 border border-error-red/30 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-error-red" />
                        <span className="font-semibold text-error-red">Fraud Protection Alerts:</span>
                      </div>
                      <ul className="text-sm text-white space-y-1">
                        {benefits.fraudWarnings.map((warning: string, i: number) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Life Stage Advice */}
                  {benefits.lifeStageAdvice && (
                    <div className="p-4 bg-teal-green/10 border border-teal-green/30 rounded-lg">
                      <h4 className="font-semibold text-emerald-400 mb-2">Personalized Advice:</h4>
                      <p className="text-sm text-white">{benefits.lifeStageAdvice}</p>
                    </div>
                  )}

                  {/* Download PDF Report */}
                  <button 
                    onClick={() => {
                      const pdf = new jsPDF();
                      
                      // Header
                      pdf.setFontSize(20);
                      pdf.setTextColor(0, 229, 255);
                      pdf.text('FinSaarthi GOVERNMENT BENEFITS REPORT', 20, 30);
                      
                      // User Profile
                      pdf.setFontSize(12);
                      pdf.setTextColor(0, 0, 0);
                      pdf.text('USER PROFILE', 20, 50);
                      pdf.setFontSize(10);
                      pdf.text(`Age: ${userProfile.age} | Occupation: ${userProfile.occupation}`, 20, 65);
                      pdf.text(`Income: ₹${userProfile.income} | Location: ${userProfile.location}`, 20, 75);
                      pdf.text(`Category: ${userProfile.category} | Gender: ${userProfile.gender}`, 20, 85);
                      
                      // Summary
                      pdf.setFontSize(14);
                      pdf.text('BENEFITS SUMMARY', 20, 105);
                      pdf.setFontSize(10);
                      pdf.text(`Eligible Schemes: ${benefits.eligibleSchemes?.length || 0}`, 20, 120);
                      pdf.text(`Total Annual Benefit: ${benefits.totalAnnualBenefit}`, 20, 130);
                      
                      let yPos = 150;
                      
                      // Schemes
                      pdf.setFontSize(14);
                      pdf.text('ELIGIBLE SCHEMES', 20, yPos);
                      yPos += 15;
                      
                      benefits.eligibleSchemes?.forEach((scheme: any, i: number) => {
                        pdf.setFontSize(12);
                        pdf.text(`${i + 1}. ${scheme.name}`, 20, yPos);
                        yPos += 10;
                        
                        pdf.setFontSize(10);
                        pdf.text(`Type: ${scheme.type} | Category: ${scheme.category}`, 25, yPos);
                        yPos += 8;
                        pdf.text(`Benefit: ${scheme.benefit} (${scheme.frequency})`, 25, yPos);
                        yPos += 8;
                        pdf.text(`Documents: ${scheme.documents?.join(', ') || 'N/A'}`, 25, yPos);
                        yPos += 8;
                        pdf.text(`Processing Time: ${scheme.processingTime}`, 25, yPos);
                        yPos += 15;
                        
                        if (yPos > 250) {
                          pdf.addPage();
                          yPos = 20;
                        }
                      });
                      
                      // Footer
                      pdf.setFontSize(8);
                      pdf.setTextColor(128, 128, 128);
                      pdf.text('Generated by FinSaarthi AI - Your Digital Government Assistant', 20, 280);
                      
                      pdf.save(`Government_Benefits_Report_${userProfile.age}yr_${userProfile.occupation}.pdf`);
                    }}
                    className="fintech-button w-full flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Benefits Report (PDF)</span>
                  </button>
                </div>
                )
              ) : (
                !schemeAnalysis ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-slate-gray mx-auto mb-4" />
                    <p className="text-white">Enter a government scheme name to get detailed analysis</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Scheme Header */}
                    <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/30 rounded-xl">
                      <h4 className="text-2xl font-bold text-white mb-3">{schemeAnalysis.schemeName}</h4>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <span className="text-emerald-400 font-semibold">Type</span>
                          <p className="text-white">{schemeAnalysis.type}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-blue-400 font-semibold">Category</span>
                          <p className="text-white">{schemeAnalysis.category}</p>
                        </div>
                        <div className="text-center">
                          <span className="text-purple-400 font-semibold">Processing Time</span>
                          <p className="text-white">{schemeAnalysis.processingTime}</p>
                        </div>
                      </div>
                      <p className="text-white text-lg">{schemeAnalysis.objective}</p>
                    </div>

                    {/* Benefits & Eligibility */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 rounded-xl">
                        <h5 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
                          <Award className="w-6 h-6 mr-2" />
                          Benefits & Rewards
                        </h5>
                        <p className="text-white leading-relaxed">{schemeAnalysis.benefits}</p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-400/30 rounded-xl">
                        <h5 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                          <Users className="w-6 h-6 mr-2" />
                          Eligibility Criteria
                        </h5>
                        <p className="text-white leading-relaxed">{schemeAnalysis.eligibility}</p>
                      </div>
                    </div>

                    {/* Application Process */}
                    <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-400/30 rounded-xl">
                      <h5 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
                        <Building2 className="w-6 h-6 mr-2" />
                        Application Process & Documents
                      </h5>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h6 className="font-semibold text-emerald-400 mb-3">Required Documents:</h6>
                          <ul className="space-y-2">
                            {schemeAnalysis.documents?.map((doc: string, i: number) => (
                              <li key={i} className="flex items-center text-white">
                                <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-blue-400 mb-3">Application Steps:</h6>
                          <div className="text-white leading-relaxed">
                            <p>{schemeAnalysis.applicationProcess}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pros & Cons Analysis */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-400/30 rounded-xl">
                        <h5 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                          <CheckCircle className="w-6 h-6 mr-2" />
                          Key Advantages
                        </h5>
                        <ul className="space-y-3">
                          {schemeAnalysis.pros?.map((pro: string, i: number) => (
                            <li key={i} className="flex items-start text-white">
                              <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-400/30 rounded-xl">
                        <h5 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                          <AlertTriangle className="w-6 h-6 mr-2" />
                          Limitations & Challenges
                        </h5>
                        <ul className="space-y-3">
                          {schemeAnalysis.cons?.map((con: string, i: number) => (
                            <li key={i} className="flex items-start text-white">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Fraud Protection */}
                    <div className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-400/30 rounded-xl">
                      <div className="flex items-center mb-4">
                        <Shield className="w-6 h-6 text-red-400 mr-2" />
                        <h5 className="text-xl font-bold text-red-400">Fraud Protection & Safety Alerts</h5>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        {schemeAnalysis.fraudAlerts?.map((alert: string, i: number) => (
                          <div key={i} className="flex items-start p-4 bg-red-500/5 rounded-lg border border-red-400/20">
                            <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                            <p className="text-white text-sm">{alert}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Expert Analysis */}
                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border border-indigo-400/30 rounded-xl">
                      <h5 className="text-xl font-bold text-indigo-400 mb-4 flex items-center">
                        <Brain className="w-6 h-6 mr-2" />
                        AI Expert Analysis & Recommendation
                      </h5>
                      <div className="p-4 bg-indigo-500/5 rounded-lg border border-indigo-400/20">
                        <p className="text-white text-lg leading-relaxed">{schemeAnalysis.verdict}</p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GovernmentBenefits;