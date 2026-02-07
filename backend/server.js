// server.js - Backend API Server for Budget Cockpit
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// NewsAPI Configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY || '187a27a4b76c415e93bf20ef3b7b3fee';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Budget Cockpit API is running' });
});

// Fetch news based on persona
app.get('/api/news/:persona', async (req, res) => {
  const { persona } = req.params;

  // Define search queries for each persona
  const personaQueries = {
    salaried: 'india (income tax OR tax slab OR tax deduction OR salary tax) budget 2026',
    business: 'india (GST OR MSME OR corporate tax OR business finance) budget 2026',
    student: 'india (education loan OR student finance OR internship scheme) budget 2026',
    senior: 'india (senior citizen OR pension OR FD interest OR healthcare) budget 2026'
  };

  const query = personaQueries[persona];

  if (!query) {
    return res.status(400).json({ error: 'Invalid persona' });
  }

  try {
    // Check if API key is configured
    if (NEWS_API_KEY === '187a27a4b76c415e93bf20ef3b7b3fee') {
      console.log('NewsAPI key not configured, returning sample data');
      return res.json({ 
        status: 'ok',
        articles: getSampleNews(persona),
        source: 'sample'
      });
    }

    const url = `${NEWS_API_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=6&apiKey=${NEWS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      res.json({
        status: 'ok',
        articles: data.articles,
        source: 'newsapi'
      });
    } else {
      console.error('NewsAPI error:', data);
      res.json({
        status: 'ok',
        articles: getSampleNews(persona),
        source: 'sample'
      });
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    res.json({
      status: 'ok',
      articles: getSampleNews(persona),
      source: 'sample'
    });
  }
});

// Sample news data (fallback)
function getSampleNews(persona) {
  const sampleNewsByPersona = {
    salaried: [
      {
        title: 'Union Budget 2026: Standard Deduction Hiked to ₹1 Lakh',
        description: 'Finance Minister announces major relief for salaried professionals with increased standard deduction.',
        url: 'https://economictimes.indiatimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'New Tax Regime vs Old: What Salaried Employees Should Choose',
        description: 'Experts weigh in on optimal tax planning strategies for 2026.',
        url: 'https://www.business-standard.com',
        urlToImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Business Standard' }
      },
      {
        title: 'LTCG Tax Limit Raised: Impact on Your Mutual Fund Returns',
        description: 'Analysis of how the new ₹2 Lakh LTCG exemption affects investors.',
        url: 'https://www.moneycontrol.com',
        urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'Tax Planning 2026: How to Save Maximum Under New Regime',
        description: 'Complete guide to maximizing tax savings with latest budget provisions.',
        url: 'https://www.livemint.com',
        urlToImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: '80C Limit Remains Unchanged: What It Means for You',
        description: 'Despite expectations, Section 80C deduction limit stays at ₹1.5 Lakh.',
        url: 'https://economictimes.indiatimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'HRA Exemption Rules: Complete Breakdown for 2026',
        description: 'Understanding house rent allowance calculations under new tax regime.',
        url: 'https://www.financialexpress.com',
        urlToImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Financial Express' }
      }
    ],
    business: [
      {
        title: 'GST Threshold Increased to ₹40 Lakh for Small Businesses',
        description: 'MSMEs celebrate as government reduces compliance burden.',
        url: 'https://www.financialexpress.com',
        urlToImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Financial Express' }
      },
      {
        title: '₹2,000 Crore MSME Credit Guarantee Fund Announced',
        description: 'New fund aims to ease credit access for small and medium enterprises.',
        url: 'https://www.thehindubusinessline.com',
        urlToImage: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Business Line' }
      },
      {
        title: 'Corporate Tax Cut: 2% Relief for MSMEs Under ₹5 Crore',
        description: 'Government incentivizes growth in MSME sector with tax benefits.',
        url: 'https://www.businesstoday.in',
        urlToImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Business Today' }
      },
      {
        title: 'GST Compliance Simplified: E-Invoicing Threshold Raised',
        description: 'Businesses with turnover below ₹10 crore get relief from e-invoicing.',
        url: 'https://economictimes.indiatimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'Startup India: New Tax Holidays Extended to 2030',
        description: 'Eligible startups can continue to avail 3-year tax exemption benefits.',
        url: 'https://www.moneycontrol.com',
        urlToImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'Export Incentive Schemes: ₹5,000cr Allocation for FY27',
        description: 'Government boosts export sector with enhanced RoDTEP benefits.',
        url: 'https://www.business-standard.com',
        urlToImage: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Business Standard' }
      }
    ],
    student: [
      {
        title: 'Education Loan Tax Deduction Doubled to ₹2 Lakh',
        description: 'Students get major relief as education loan interest deduction increases.',
        url: 'https://timesofindia.indiatimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Times of India' }
      },
      {
        title: '₹500 Crore AI Education Fund: 50% Subsidy on Certified Courses',
        description: 'Government launches massive skill development initiative for youth.',
        url: 'https://indianexpress.com',
        urlToImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Indian Express' }
      },
      {
        title: 'Internship Scheme Expanded: ₹5,000/Month for 1 Crore Youth',
        description: 'Five-year program aims to boost employability of Indian youth.',
        url: 'https://www.hindustantimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Hindustan Times' }
      },
      {
        title: 'NEET Coaching Subsidy: 50% Fee Waiver for EWS Students',
        description: 'Budget 2026 allocates ₹1,000cr for competitive exam preparation support.',
        url: 'https://www.thehindu.com',
        urlToImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'The Hindu' }
      },
      {
        title: 'Digital University Initiative: 100 New Campuses Announced',
        description: 'Government plans virtual universities to increase higher education access.',
        url: 'https://www.livemint.com',
        urlToImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: 'Skill India Mission 2.0: Focus on AI, Robotics, Green Energy',
        description: 'Budget allocates ₹3,000cr for future-ready skill development programs.',
        url: 'https://economictimes.indiatimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Economic Times' }
      }
    ],
    senior: [
      {
        title: 'Senior Citizens: FD Interest Tax Exemption Doubled to ₹1 Lakh',
        description: 'Major relief for retirees as tax-free FD interest limit increases.',
        url: 'https://www.livemint.com',
        urlToImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: 'SCSS Limit Raised to ₹30 Lakh: What It Means for Retirees',
        description: 'Analysis of increased Senior Citizen Savings Scheme limits.',
        url: 'https://economictimes.indiatimes.com',
        urlToImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'Ayushman Bharat Expanded: Free Health Checkups for 70+ Citizens',
        description: 'Healthcare benefits enhanced for senior citizens across India.',
        url: 'https://www.thehindu.com',
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'The Hindu' }
      },
      {
        title: 'Senior Citizen FD Rates: Banks Offer Up to 8.5% Interest',
        description: 'Comparison of fixed deposit rates across major banks for seniors.',
        url: 'https://www.moneycontrol.com',
        urlToImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'Pension Portability: New Rules Make Switching Easier',
        description: 'EPFO introduces seamless pension transfer between jobs and states.',
        url: 'https://www.business-standard.com',
        urlToImage: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'Business Standard' }
      },
      {
        title: 'Elderly Care Services: ₹2,000cr Allocation for Home Healthcare',
        description: 'Budget focuses on improving quality of life for senior citizens.',
        url: 'https://indianexpress.com',
        urlToImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Indian Express' }
      }
    ]
  };

  return sampleNewsByPersona[persona] || [];
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Budget Cockpit API Server running on http://localhost:${PORT}`);
  console.log(`📰 NewsAPI Status: ${NEWS_API_KEY !== '187a27a4b76c415e93bf20ef3b7b3fee' ? 'Configured ✅' : 'Using Sample Data 📋'}`);
});
