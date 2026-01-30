import React, { useState } from 'react';
import { Brain, TrendingUp, MapPin, Award, AlertTriangle, Download, Target, DollarSign, BarChart3, PieChart } from 'lucide-react';
import jsPDF from 'jspdf';

const CareerIncomeIntelligence: React.FC = () => {
  const [careerData, setCareerData] = useState({
    jobRole: '',
    experience: '',
    location: '',
    skills: '',
    education: '',
    industry: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setCareerData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeCareer = async () => {
    if (!careerData.jobRole || !careerData.experience) return;
    
    setIsAnalyzing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const baseExp = parseInt(careerData.experience);
    const locationMultiplier = careerData.location.toLowerCase().includes('bangalore') || careerData.location.toLowerCase().includes('mumbai') ? 1.3 : 
                              careerData.location.toLowerCase().includes('delhi') || careerData.location.toLowerCase().includes('pune') ? 1.2 : 1.0;
    
    const baseSalary = Math.round((baseExp * 150000 + 300000) * locationMultiplier);
    
    setAnalysis({
      currentSalary: {
        min: Math.round(baseSalary * 0.8),
        max: Math.round(baseSalary * 1.4),
        average: baseSalary
      },
      growthPrediction: {
        oneYear: Math.round(baseSalary * 1.15),
        threeYear: Math.round(baseSalary * 1.45),
        fiveYear: Math.round(baseSalary * 1.85)
      },
      careerAnalysis: {
        stabilityScore: Math.min(95, 60 + baseExp * 5),
        growthPotential: baseExp < 3 ? "High" : baseExp < 7 ? "Medium" : "Moderate",
        automationRisk: careerData.jobRole.toLowerCase().includes('software') ? "Low" : 
                       careerData.jobRole.toLowerCase().includes('data') ? "Very Low" : "Medium"
      },
      skillAnalysis: {
        highValue: ["AI/ML", "Cloud Computing", "Data Science", "Full Stack Development"],
        mediumValue: ["Project Management", "Digital Marketing", "UI/UX Design"],
        lowValue: ["Basic Excel", "Manual Testing", "Legacy Systems"]
      },
      financialAdvice: {
        monthlySavings: Math.round(baseSalary * 0.2 / 12),
        emergencyFund: Math.round(baseSalary * 0.5),
        investmentReady: baseSalary > 600000,
        loanEligibility: Math.round(baseSalary * 8)
      },
      lifeGoals: {
        houseAffordability: Math.round(baseSalary * 12),
        carBudget: Math.round(baseSalary * 0.8),
        travelBudget: Math.round(baseSalary * 0.15),
        retirementCorpus: Math.round(baseSalary * 25)
      },
      marketComparison: {
        nationalAverage: 650000,
        industryAverage: Math.round(baseSalary * 1.1),
        percentile: Math.min(95, Math.max(10, Math.round((baseSalary / 800000) * 100)))
      },
      careerOpportunities: [
        { role: "Senior " + careerData.jobRole, salaryIncrease: 40, timeline: "1-2 years" },
        { role: "Lead " + careerData.jobRole, salaryIncrease: 70, timeline: "2-3 years" },
        { role: "Manager/Architect", salaryIncrease: 100, timeline: "3-5 years" }
      ],
      sideIncomeIdeas: [
        { idea: "Freelance Consulting", potential: Math.round(baseSalary * 0.3), effort: "Medium" },
        { idea: "Online Course Creation", potential: Math.round(baseSalary * 0.2), effort: "High" },
        { idea: "Technical Writing", potential: Math.round(baseSalary * 0.15), effort: "Low" }
      ]
    });

    setIsAnalyzing(false);
  };

  const LineChartComponent = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 300,
      y: 150 - (item.value / maxValue) * 120
    }));

    return (
      <div className="bg-jet-black rounded-xl p-6">
        <h4 className="text-lg font-bold text-soft-white mb-4 text-center">{title}</h4>
        <svg width="320" height="180" className="mx-auto">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="50%" stopColor="#B76E79" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="10" y1={30 + i * 30} x2="310" y2={30 + i * 30} stroke="#374151" strokeWidth="0.5" />
          ))}
          
          {/* Line path */}
          <path
            d={`M ${points.map(p => `${p.x + 10},${p.y + 30}`).join(' L ')}`}
            stroke="url(#lineGradient)"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x + 10}
              cy={point.y + 30}
              r="4"
              fill="#D4AF37"
              className="hover:r-6 transition-all"
            />
          ))}
        </svg>
        
        <div className="flex justify-between mt-4 text-sm">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-slate-gray">{item.label}</p>
              <p className="text-soft-white font-bold">₹{(item.value / 100000).toFixed(1)}L</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RadialProgressChart = ({ value, max, title, color }: { value: number, max: number, title: string, color: string }) => {
    const percentage = (value / max) * 100;
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

    return (
      <div className="bg-jet-black rounded-xl p-6 text-center">
        <h4 className="text-lg font-bold text-soft-white mb-4">{title}</h4>
        <div className="relative w-24 h-24 mx-auto">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="45" stroke="#374151" strokeWidth="6" fill="transparent" />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke={color}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-soft-white">{Math.round(percentage)}%</span>
          </div>
        </div>
        <p className="text-slate-gray text-sm mt-2">{value.toLocaleString()}</p>
      </div>
    );
  };

  const generatePDFReport = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Career Income Intelligence Report', 20, 30);
    
    // Career Details
    doc.setFontSize(14);
    doc.text('Career Profile:', 20, 50);
    doc.setFontSize(10);
    doc.text(`Role: ${careerData.jobRole}`, 20, 60);
    doc.text(`Experience: ${careerData.experience} years`, 20, 70);
    doc.text(`Location: ${careerData.location}`, 20, 80);
    
    // Salary Analysis
    doc.setFontSize(14);
    doc.text('Salary Analysis:', 20, 100);
    doc.setFontSize(10);
    doc.text(`Current Range: ₹${(analysis.currentSalary.min / 100000).toFixed(1)}L - ₹${(analysis.currentSalary.max / 100000).toFixed(1)}L`, 20, 110);
    doc.text(`1 Year Projection: ₹${(analysis.growthPrediction.oneYear / 100000).toFixed(1)}L`, 20, 120);
    doc.text(`3 Year Projection: ₹${(analysis.growthPrediction.threeYear / 100000).toFixed(1)}L`, 20, 130);
    doc.text(`5 Year Projection: ₹${(analysis.growthPrediction.fiveYear / 100000).toFixed(1)}L`, 20, 140);
    
    // Financial Advice
    doc.setFontSize(14);
    doc.text('Financial Recommendations:', 20, 160);
    doc.setFontSize(10);
    doc.text(`Monthly Savings Target: ₹${analysis.financialAdvice.monthlySavings.toLocaleString()}`, 20, 170);
    doc.text(`Emergency Fund: ₹${(analysis.financialAdvice.emergencyFund / 100000).toFixed(1)}L`, 20, 180);
    doc.text(`Home Loan Eligibility: ₹${(analysis.financialAdvice.loanEligibility / 100000).toFixed(1)}L`, 20, 190);
    
    // Career Opportunities
    doc.setFontSize(14);
    doc.text('Career Growth Opportunities:', 20, 210);
    doc.setFontSize(10);
    analysis.careerOpportunities.forEach((opp: any, index: number) => {
      doc.text(`${index + 1}. ${opp.role} (+${opp.salaryIncrease}% in ${opp.timeline})`, 20, 220 + index * 10);
    });
    
    doc.save('career-income-intelligence-report.pdf');
  };

  return (
    <section className="py-16 relative overflow-hidden bg-[#0C2B4E]">
  <div className="
    absolute inset-0
    bg-gradient-to-br from-black/40 to-slate-900/60
    backdrop-blur-xl
  "></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-ubuntu font-bold text-soft-white mb-4">
            Career Income <span className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">Intelligence</span>
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-ubuntu">
            Know your present value. Plan your future income.
          </p>
        </div>

        {!analysis ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl p-8 border border-emerald-500/20">
                <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                  🎯 Enter Your Career Profile
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-soft-white font-medium mb-2">Current Job Role *</label>
                    <input
                      type="text"
                      value={careerData.jobRole}
                      onChange={(e) => handleInputChange('jobRole', e.target.value)}
                      placeholder="e.g., Software Engineer, Data Analyst"
                      className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-soft-white font-medium mb-2">Years of Experience *</label>
                    <input
                      type="number"
                      value={careerData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-soft-white font-medium mb-2">Work Location</label>
                    <input
                      type="text"
                      value={careerData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Bangalore, Mumbai, Remote"
                      className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-soft-white font-medium mb-2">Key Skills</label>
                    <input
                      type="text"
                      value={careerData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      placeholder="e.g., React, Python, AWS, Machine Learning"
                      className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white placeholder-slate-gray focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-soft-white font-medium mb-2">Industry</label>
                    <select
                      value={careerData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="">Select Industry</option>
                      <option value="IT">Information Technology</option>
                      <option value="Finance">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Startup">Startup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-soft-white font-medium mb-2">Education Level</label>
                    <select
                      value={careerData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="w-full bg-jet-black border border-slate-gray/30 rounded-xl px-4 py-3 text-soft-white focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="">Select Education</option>
                      <option value="Bachelor's">Bachelor's Degree</option>
                      <option value="Master's">Master's Degree</option>
                      <option value="PhD">PhD</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certification">Professional Certification</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-2xl p-8 border border-emerald-500/20">
                <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">
                  🚀 What You'll Get
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-soft-white">Current salary range prediction</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-soft-white">1, 3, 5 year growth projections</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-soft-white">AI-powered career insights</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-soft-white">Skill value analysis</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-soft-white">Financial planning advice</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-soft-white">Life goals feasibility</span>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={analyzeCareer}
                    disabled={isAnalyzing || !careerData.jobRole || !careerData.experience}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300 disabled:opacity-50"
                  >
                    {isAnalyzing ? '🧠 AI Analyzing Career...' : '🚀 Analyze My Career Income'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Salary Prediction Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <DollarSign className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">Current Range</h4>
                <p className="text-2xl font-bold">₹{(analysis.currentSalary.min / 100000).toFixed(1)}L - ₹{(analysis.currentSalary.max / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <TrendingUp className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">1 Year Growth</h4>
                <p className="text-2xl font-bold">₹{(analysis.growthPrediction.oneYear / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <BarChart3 className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">3 Year Growth</h4>
                <p className="text-2xl font-bold">₹{(analysis.growthPrediction.threeYear / 100000).toFixed(1)}L</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                <Target className="w-8 h-8 mb-3" />
                <h4 className="font-bold mb-1">5 Year Potential</h4>
                <p className="text-2xl font-bold">₹{(analysis.growthPrediction.fiveYear / 100000).toFixed(1)}L</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <LineChartComponent
                title="📈 Income Growth Projection"
                data={[
                  { label: 'Current', value: analysis.currentSalary.average },
                  { label: '1 Year', value: analysis.growthPrediction.oneYear },
                  { label: '3 Years', value: analysis.growthPrediction.threeYear },
                  { label: '5 Years', value: analysis.growthPrediction.fiveYear }
                ]}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <RadialProgressChart
                  value={analysis.careerAnalysis.stabilityScore}
                  max={100}
                  title="Career Stability"
                  color="#10B981"
                />
                <RadialProgressChart
                  value={analysis.marketComparison.percentile}
                  max={100}
                  title="Market Percentile"
                  color="#3B82F6"
                />
              </div>
            </div>

            {/* Career Analysis */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">🎯 Career Strength Analysis</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                  <h4 className="font-bold text-soft-white mb-3">Growth Potential</h4>
                  <p className="text-2xl font-bold text-emerald-400 mb-2">{analysis.careerAnalysis.growthPotential}</p>
                  <p className="text-slate-gray text-sm">Based on experience and market trends</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                  <h4 className="font-bold text-soft-white mb-3">Automation Risk</h4>
                  <p className="text-2xl font-bold text-blue-400 mb-2">{analysis.careerAnalysis.automationRisk}</p>
                  <p className="text-slate-gray text-sm">Job security in AI era</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl p-6 border border-purple-500/20">
                  <h4 className="font-bold text-soft-white mb-3">Market Position</h4>
                  <p className="text-2xl font-bold text-purple-400 mb-2">{analysis.marketComparison.percentile}th</p>
                  <p className="text-slate-gray text-sm">Percentile in market</p>
                </div>
              </div>
            </div>

            {/* Skill Analysis */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">🏆 Skill Value Analysis</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20">
                  <h4 className="font-bold text-emerald-400 mb-4">🔥 High-Value Skills</h4>
                  <ul className="space-y-2">
                    {analysis.skillAnalysis.highValue.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center text-soft-white text-sm">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                  <h4 className="font-bold text-yellow-400 mb-4">⚡ Medium-Value Skills</h4>
                  <ul className="space-y-2">
                    {analysis.skillAnalysis.mediumValue.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center text-soft-white text-sm">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl p-6 border border-red-500/20">
                  <h4 className="font-bold text-red-400 mb-4">⚠️ Low-Demand Skills</h4>
                  <ul className="space-y-2">
                    {analysis.skillAnalysis.lowValue.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center text-soft-white text-sm">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-3"></span>
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Financial Advice */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">💰 Career-Based Financial Advice</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/20">
                    <h4 className="font-bold text-soft-white mb-4">💳 Monthly Financial Plan</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Recommended Savings:</span>
                        <span className="text-emerald-400 font-bold">₹{analysis.financialAdvice.monthlySavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Emergency Fund Target:</span>
                        <span className="text-emerald-400 font-bold">₹{(analysis.financialAdvice.emergencyFund / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Investment Ready:</span>
                        <span className={`font-bold ${analysis.financialAdvice.investmentReady ? 'text-green-400' : 'text-orange-400'}`}>
                          {analysis.financialAdvice.investmentReady ? 'Yes' : 'Build Emergency Fund First'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                    <h4 className="font-bold text-soft-white mb-4">🏠 Loan Eligibility</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Home Loan Eligibility:</span>
                        <span className="text-blue-400 font-bold">₹{(analysis.financialAdvice.loanEligibility / 100000).toFixed(1)}L</span>
                      </div>
                      <p className="text-slate-gray text-sm">Based on 8x annual income rule</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                    <h4 className="font-bold text-soft-white mb-4">🎯 Life Goals Feasibility</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-gray">House Budget:</span>
                        <span className="text-purple-400 font-bold">₹{(analysis.lifeGoals.houseAffordability / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Car Budget:</span>
                        <span className="text-purple-400 font-bold">₹{(analysis.lifeGoals.carBudget / 100000).toFixed(1)}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Annual Travel:</span>
                        <span className="text-purple-400 font-bold">₹{(analysis.lifeGoals.travelBudget / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20">
                    <h4 className="font-bold text-soft-white mb-4">🏖️ Retirement Planning</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-gray">Target Corpus:</span>
                        <span className="text-orange-400 font-bold">₹{(analysis.lifeGoals.retirementCorpus / 10000000).toFixed(1)}Cr</span>
                      </div>
                      <p className="text-slate-gray text-sm">25x annual expense rule</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Opportunities */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">🚀 Career Growth Opportunities</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {analysis.careerOpportunities.map((opp: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
                    <h4 className="font-bold text-soft-white mb-3">{opp.role}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-gray text-sm">Salary Increase:</span>
                        <span className="text-green-400 font-bold">+{opp.salaryIncrease}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray text-sm">Timeline:</span>
                        <span className="text-blue-400 font-bold">{opp.timeline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side Income Ideas */}
            <div className="bg-charcoal-gray rounded-2xl p-8 border border-slate-gray/20">
              <h3 className="text-2xl font-bold text-soft-white mb-6 text-center">💡 Side Income Opportunities</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {analysis.sideIncomeIdeas.map((idea: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/20">
                    <h4 className="font-bold text-soft-white mb-3">{idea.idea}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-gray text-sm">Potential Income:</span>
                        <span className="text-emerald-400 font-bold">₹{(idea.potential / 100000).toFixed(1)}L/year</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-gray text-sm">Effort Level:</span>
                        <span className={`font-bold text-sm ${
                          idea.effort === 'Low' ? 'text-green-400' : 
                          idea.effort === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {idea.effort}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={generatePDFReport}
                className="bg-gradient-to-r from-gold to-rose-gold text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Career Report</span>
              </button>
              
              <button
                onClick={() => {
                  setAnalysis(null);
                  setCareerData({jobRole: '', experience: '', location: '', skills: '', education: '', industry: ''});
                }}
                className="bg-charcoal-gray text-soft-white px-6 py-3 rounded-xl font-semibold hover:bg-jet-black transition-all duration-300"
              >
                ← New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CareerIncomeIntelligence;