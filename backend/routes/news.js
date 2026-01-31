// backend/routes/news.js
const express = require('express');
const router = express.Router();

// NewsAPI Configuration
const NEWS_API_KEY = process.env.NEWS_API_KEY || '187a27a4b76c415e93bf20ef3b7b3fee';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Sample news data (fallback)
function getSampleNews(persona) {
  const sampleNewsByPersona = {
    salaried: [
      {
        title: 'Union Budget 2026: Standard Deduction Hiked to ₹1 Lakh',
        description: 'Finance Minister announces major relief for salaried professionals with increased standard deduction.',
        url: 'https://economictimes.indiatimes.com/wealth/tax/union-budget-2026-standard-deduction-hiked',
        urlToImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'New Tax Regime vs Old: What Salaried Employees Should Choose',
        description: 'Experts weigh in on optimal tax planning strategies for 2026.',
        url: 'https://www.business-standard.com/finance/personal-finance/new-tax-regime-vs-old-salaried-employees',
        urlToImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Business Standard' }
      },
      {
        title: 'LTCG Tax Limit Raised: Impact on Your Mutual Fund Returns',
        description: 'Analysis of how the new ₹2 Lakh LTCG exemption affects investors.',
        url: 'https://www.moneycontrol.com/news/business/personal-finance/ltcg-tax-limit-raised-mutual-funds',
        urlToImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'HRA Exemption Rules Simplified for Salaried Class',
        description: 'Tax department issues new guidelines making HRA claims easier for employees.',
        url: 'https://www.livemint.com/money/personal-finance/hra-exemption-rules-simplified-salaried',
        urlToImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: 'EPF Interest Rate Maintained at 8.25% for FY 2025-26',
        description: 'EPFO keeps interest rate unchanged, benefiting 6 crore employees.',
        url: 'https://timesofindia.indiatimes.com/business/india-business/epf-interest-rate-2025-26',
        urlToImage: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'Times of India' }
      },
      {
        title: 'Section 80C Limit Increased to ₹2 Lakh',
        description: 'Budget 2026 raises tax-saving investment limit, providing more deduction opportunities.',
        url: 'https://indianexpress.com/article/business/budget/section-80c-limit-increased',
        urlToImage: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Indian Express' }
      },
      {
        title: 'NPS Tax Benefits Enhanced: Additional ₹50,000 Deduction',
        description: 'Government increases NPS contribution benefits under Section 80CCD(1B).',
        url: 'https://www.financialexpress.com/money/nps-tax-benefits-enhanced-80ccd',
        urlToImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: 'Financial Express' }
      },
      {
        title: 'Work From Home Expenses Now Tax Deductible',
        description: 'New provision allows ₹50,000 annual deduction for home office expenses.',
        url: 'https://www.hindustantimes.com/business/work-from-home-expenses-tax-deductible',
        urlToImage: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { name: 'Hindustan Times' }
      },
      {
        title: 'Health Insurance Premium Deduction Raised to ₹75,000',
        description: 'Section 80D limits increased for both self and parents, boosting healthcare savings.',
        url: 'https://www.thehindu.com/business/Economy/health-insurance-deduction-section-80d',
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { name: 'The Hindu' }
      }
    ],
    business: [
      {
        title: 'GST Threshold Increased to ₹40 Lakh for Small Businesses',
        description: 'MSMEs celebrate as government reduces compliance burden.',
        url: 'https://www.financialexpress.com/business/sme/gst-threshold-increased-40-lakh-msme',
        urlToImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Financial Express' }
      },
      {
        title: '₹2,000 Crore MSME Credit Guarantee Fund Announced',
        description: 'New fund aims to ease credit access for small and medium enterprises.',
        url: 'https://www.thehindubusinessline.com/economy/msme-credit-guarantee-fund-2000-crore',
        urlToImage: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Business Line' }
      },
      {
        title: 'Corporate Tax Cut: 2% Relief for MSMEs Under ₹5 Crore',
        description: 'Government incentivizes growth in MSME sector with tax benefits.',
        url: 'https://www.businesstoday.in/budget/story/corporate-tax-cut-msme-relief',
        urlToImage: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Business Today' }
      },
      {
        title: 'Startup India: Tax Holiday Extended by 3 More Years',
        description: 'Eligible startups can now enjoy tax exemption for up to 6 years.',
        url: 'https://economictimes.indiatimes.com/small-biz/startups/startup-india-tax-holiday-extended',
        urlToImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'E-Invoice Mandatory for Businesses Above ₹10 Crore',
        description: 'GST Council lowers threshold for mandatory e-invoicing compliance.',
        url: 'https://www.livemint.com/news/india/e-invoice-mandatory-10-crore-gst',
        urlToImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: 'Import Duty Reduced on Raw Materials for Manufacturing',
        description: 'Budget 2026 cuts customs duty to boost Make in India initiative.',
        url: 'https://www.business-standard.com/budget/news/import-duty-reduced-raw-materials-manufacturing',
        urlToImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Business Standard' }
      },
      {
        title: 'Digital Payment Incentives: 1% Cashback for UPI Merchants',
        description: 'Government announces rewards program to promote digital transactions.',
        url: 'https://timesofindia.indiatimes.com/business/india-business/digital-payment-cashback-upi-merchants',
        urlToImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: 'Times of India' }
      },
      {
        title: 'Angel Tax Abolished: Relief for Startup Funding',
        description: 'Investors and entrepreneurs welcome removal of contentious angel tax provision.',
        url: 'https://www.moneycontrol.com/news/business/startup/angel-tax-abolished-startup-funding',
        urlToImage: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'Export Promotion Scheme Gets ₹5,000 Crore Boost',
        description: 'Enhanced incentives announced for exporters to increase global competitiveness.',
        url: 'https://indianexpress.com/article/business/economy/export-promotion-scheme-5000-crore',
        urlToImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { name: 'Indian Express' }
      }
    ],
    student: [
      {
        title: 'Education Loan Tax Deduction Doubled to ₹2 Lakh',
        description: 'Students get major relief as education loan interest deduction increases.',
        url: 'https://timesofindia.indiatimes.com/business/personal-finance/education-loan-tax-deduction-doubled',
        urlToImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'Times of India' }
      },
      {
        title: '₹500 Crore AI Education Fund: 50% Subsidy on Certified Courses',
        description: 'Government launches massive skill development initiative for youth.',
        url: 'https://indianexpress.com/article/education/ai-education-fund-500-crore-subsidy',
        urlToImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Indian Express' }
      },
      {
        title: 'Internship Scheme Expanded: ₹5,000/Month for 1 Crore Youth',
        description: 'Five-year program aims to boost employability of Indian youth.',
        url: 'https://www.hindustantimes.com/education/internship-scheme-expanded-youth-employment',
        urlToImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'Hindustan Times' }
      },
      {
        title: 'Student Startup Policy: ₹10 Lakh Seed Funding Available',
        description: 'Budget allocates funds for student entrepreneurs to launch ventures.',
        url: 'https://economictimes.indiatimes.com/small-biz/startups/student-startup-policy-seed-funding',
        urlToImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'Free Laptop Scheme for Engineering Students Announced',
        description: 'Government to provide laptops to 50 lakh engineering students nationwide.',
        url: 'https://www.livemint.com/education/news/free-laptop-scheme-engineering-students',
        urlToImage: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: 'Scholarship for STEM Students Doubled to ₹1 Lakh/Year',
        description: 'Merit-cum-means scholarship program receives significant funding boost.',
        url: 'https://www.thehindu.com/education/scholarship-stem-students-doubled',
        urlToImage: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'The Hindu' }
      },
      {
        title: 'Digital Learning Platform: Free Access to IIT/IIM Courses',
        description: 'National Education Portal offers premium courses at zero cost for students.',
        url: 'https://www.business-standard.com/education/digital-learning-iit-iim-courses-free',
        urlToImage: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: 'Business Standard' }
      },
      {
        title: 'Study Abroad Loan Scheme: Interest Subsidy for Meritorious Students',
        description: '3% interest subsidy on education loans for students going to top global universities.',
        url: 'https://www.moneycontrol.com/news/education/study-abroad-loan-interest-subsidy',
        urlToImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'Job Guarantee Program for Graduates: 90% Placement Target',
        description: 'New initiative links education with employment outcomes for all graduates.',
        url: 'https://www.financialexpress.com/education/job-guarantee-program-graduates-placement',
        urlToImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { name: 'Financial Express' }
      }
    ],
    senior: [
      {
        title: 'Senior Citizens: FD Interest Tax Exemption Doubled to ₹1 Lakh',
        description: 'Major relief for retirees as tax-free FD interest limit increases.',
        url: 'https://www.livemint.com/money/personal-finance/senior-citizens-fd-interest-tax-exemption',
        urlToImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: 'LiveMint' }
      },
      {
        title: 'SCSS Limit Raised to ₹30 Lakh: What It Means for Retirees',
        description: 'Analysis of increased Senior Citizen Savings Scheme limits.',
        url: 'https://economictimes.indiatimes.com/wealth/invest/scss-limit-raised-30-lakh-retirees',
        urlToImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: 'Economic Times' }
      },
      {
        title: 'Ayushman Bharat Expanded: Free Health Checkups for 70+ Citizens',
        description: 'Healthcare benefits enhanced for senior citizens across India.',
        url: 'https://www.thehindu.com/news/national/ayushman-bharat-free-health-checkups-senior-citizens',
        urlToImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: 'The Hindu' }
      },
      {
        title: 'Pension Hike: 8% DA Increase for Central Government Retirees',
        description: 'Dearness Allowance raised to help pensioners cope with inflation.',
        url: 'https://timesofindia.indiatimes.com/business/pension-hike-da-increase-government-retirees',
        urlToImage: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&q=80',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: { name: 'Times of India' }
      },
      {
        title: 'Medical Expense Deduction Increased to ₹1 Lakh for Seniors',
        description: 'Section 80D benefits enhanced significantly for those above 60 years.',
        url: 'https://www.moneycontrol.com/news/business/personal-finance/medical-expense-deduction-seniors-80d',
        urlToImage: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80',
        publishedAt: new Date(Date.now() - 18000000).toISOString(),
        source: { name: 'Money Control' }
      },
      {
        title: 'Tax-Free Pension Limit Raised to ₹25,000/Month',
        description: 'Budget provides relief to pensioners with higher tax exemption threshold.',
        url: 'https://indianexpress.com/article/business/economy/tax-free-pension-limit-raised',
        urlToImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
        publishedAt: new Date(Date.now() - 21600000).toISOString(),
        source: { name: 'Indian Express' }
      },
      {
        title: 'Senior Citizen Savings Interest Rate Hiked to 8.5%',
        description: 'Government increases returns on SCSS to support retiree income.',
        url: 'https://www.business-standard.com/finance/personal-finance/scss-interest-rate-hiked-8-5-percent',
        urlToImage: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&q=80',
        publishedAt: new Date(Date.now() - 25200000).toISOString(),
        source: { name: 'Business Standard' }
      },
      {
        title: 'Reverse Mortgage Scheme Simplified for Senior Citizens',
        description: 'New guidelines make it easier for seniors to access home equity.',
        url: 'https://www.financialexpress.com/money/reverse-mortgage-scheme-simplified-seniors',
        urlToImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        publishedAt: new Date(Date.now() - 28800000).toISOString(),
        source: { name: 'Financial Express' }
      },
      {
        title: 'Free Prescription Drugs for 75+ at Government Hospitals',
        description: 'Healthcare initiative provides essential medicines at no cost to elderly.',
        url: 'https://www.hindustantimes.com/india-news/free-prescription-drugs-75-plus-government-hospitals',
        urlToImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
        publishedAt: new Date(Date.now() - 32400000).toISOString(),
        source: { name: 'Hindustan Times' }
      }
    ]
  };

  return sampleNewsByPersona[persona] || [];
}

// Fetch from NewsAPI
async function fetchFromNewsAPI(query) {
  try {
    // Use dynamic import for node-fetch (ES module)
    const fetch = (await import('node-fetch')).default;

    const url = `${NEWS_API_URL}?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ok') {
      return data.articles;
    } else {
      console.error('NewsAPI error:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return null;
  }
}

// Main route - GET /api/news/:persona
router.get('/:persona', async (req, res) => {
  try {
    const { persona } = req.params;

    // Validate persona
    const validPersonas = ['salaried', 'business', 'student', 'senior'];
    if (!validPersonas.includes(persona)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid persona. Must be: salaried, business, student, or senior'
      });
    }

    // Try to fetch from NewsAPI first
    let articles = null;

    // Define search queries based on persona
    const newsQueries = {
      salaried: 'income tax india OR salary budget india OR EPF india',
      business: 'GST india OR MSME India OR startup india funding',
      student: 'education loan india OR scholarship india OR student benefits',
      senior: 'senior citizen scheme india OR pension india OR FD interest rate'
    };

    if (NEWS_API_KEY && NEWS_API_KEY !== 'your_newsapi_key_here') {
      articles = await fetchFromNewsAPI(newsQueries[persona]);
    }

    // If NewsAPI fails or no key, use sample data
    if (!articles || articles.length === 0) {
      articles = getSampleNews(persona);
      return res.json({
        status: 'ok',
        source: 'sample',
        totalResults: articles.length,
        articles: articles
      });
    }

    // Return NewsAPI results
    res.json({
      status: 'ok',
      source: 'newsapi',
      totalResults: articles.length,
      articles: articles
    });

  } catch (error) {
    console.error('Error in news route:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;