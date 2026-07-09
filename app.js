/* ========================================
   CMA Finalist OS — app.js
   Premium Single Page Application Engine
======================================== */

// ── 1. GLOBAL STATE ──
const S = {
  syllabus: {},        // key: "paper_id.module_idx.chapter_idx", value: true/false
  hours: {},           // key: "YYYY-MM-DD", value: { "CEL": 2, "SFM": 1.5, ... }
  dailyChecks: {},     // key: "daily-xxx", value: true/false
  pyqSolved: {},       // key: "pyq_id", value: true/false
  streak: 0,
  lastActive: null,
  xp: 0,
  level: 1,
  
  elective: "20A",     // 20A, 20B, 20C
  goals: [],           // array of { id, title, type: 'daily'|'weekly'|'monthly'|'exam', date, subject, completed: false }
  pomoHistory: [],     // array of { id, timestamp, duration, subject, type: 'study'|'short'|'long' }
  
  folders: ["General Notes", "Corporate Laws", "Strategic Finance", "Direct Taxes", "Strategic Costs"],
  notes: [],           // array of { id, folder, title, content, tags: [], updatedAt }
  activeNoteId: null,
  
  revisions: [],       // array of { id, topic, subject, schedule: '1-3-7-30'|'1-2-4-8-16'|'3-10-30', dateScheduled, lastRevisionDate, nextDueDate, level: 0, completed: false }
  quizLog: [],         // array of { id, subject, score, total, date }
  flashcardMastery: {},// key: cardId, value: 'mastered' | 'practice'
  customFlashcards: [],// array of { id, subject, front, back }
  chatHistory: [],     // array of { sender: 'user'|'ai', text, timestamp }
  tasks: []            // array of { id, title, priority: 'High'|'Medium'|'Low', deadline, subject, status: 'Todo'|'InProgress'|'Completed' }
};

// ── 2. DATABASE PRESETS ──

const SUBJECT_KEYS = {
  CEL: "Paper 13: Corporate & Economic Laws",
  SFM: "Paper 14: Strategic Financial Management",
  DTIT: "Paper 15: Direct Taxes & International Tax",
  SCM: "Paper 16: Strategic Cost Management",
  CMAD: "Paper 17: Cost & Management Audit",
  CFR: "Paper 18: Corporate Financial Reporting",
  ITLP: "Paper 19: Indirect Tax Laws",
  ELECTIVE: "Paper 20: Selected Elective"
};

const CMA_SYLLABUS = {
  Group3: [
    {
      id: "CEL",
      title: "Paper 13: Corporate & Economic Laws (CEL)",
      weightage: { A: "60% Corporate Laws", B: "40% Economic Laws" },
      modules: [
        {
          name: "Companies Act, 2013 (Part 1)",
          chapters: ["Company Formation and Types", "Public Deposits & Debentures", "Board Management & Directors (Sec 149-172)"]
        },
        {
          name: "Companies Act, 2013 (Part 2)",
          chapters: ["Board Meetings & Committees (Sec 173-195)", "Accounts & Audit of Companies", "Compromise, Arrangement & Amalgamations"]
        },
        {
          name: "Insolvency and Bankruptcy Code, 2016",
          chapters: ["Corporate Insolvency Resolution Process (CIRP)", "Liquidation Process & Authorities"]
        },
        {
          name: "Corporate Governance & CSR",
          chapters: ["Corporate Governance Principles", "Corporate Social Responsibility (Sec 135)"]
        },
        {
          name: "Economic Laws & SEBI",
          chapters: ["SEBI (LODR) Regulations", "FEMA, 1999 (Current/Capital Account Rules)", "Competition Act, 2002"]
        },
        {
          name: "Other Financial Regulations",
          chapters: ["Banking Laws & Regulations", "Insurance Sector Laws", "MSME Development Act, 2006", "PMLA, 2002 (Money Laundering)"]
        }
      ]
    },
    {
      id: "SFM",
      title: "Paper 14: Strategic Financial Management (SFM)",
      weightage: { A: "25% Decisions", B: "20% Markets", C: "25% Portfolio", D: "20% Derivatives", E: "10% Valuation" },
      modules: [
        {
          name: "Investment Decisions",
          chapters: ["Capital Budgeting & Risk Analysis", "Lease vs Buy Decisions", "Project Financing Options"]
        },
        {
          name: "Financial Markets & Institutions",
          chapters: ["Capital Market Instruments", "Mutual Funds Regulation & Analysis", "RBI Rules & Banking Systems"]
        },
        {
          name: "Security Analysis & Portfolio Management",
          chapters: ["Portfolio Theories (Markowitz, Sharpe)", "Capital Asset Pricing Model (CAPM)", "Security Valuation & EMH"]
        },
        {
          name: "Derivatives & Risk Management",
          chapters: ["Forwards & Futures Contracts", "Option Pricing Models (Black-Scholes, Binomial)", "Hedging & Swap Strategies", "Foreign Exchange Risk Management"]
        },
        {
          name: "Valuation & Restructuring",
          chapters: ["Business Valuation Models", "Mergers, Acquisitions & Corporate Restructuring"]
        }
      ]
    },
    {
      id: "DTIT",
      title: "Paper 15: Direct Tax Laws & International Taxation (DTIT)",
      weightage: { A: "60% Direct Taxes", B: "30% International Tax", C: "10% Black Money" },
      modules: [
        {
          name: "Assessment of Entities",
          chapters: ["Assessment of Companies", "Minimum Alternate Tax (MAT - Sec 115JB)", "Assessment of Partnership Firms & AOPs"]
        },
        {
          name: "Tax Management & Procedure",
          chapters: ["Assessment Procedures & Filing", "Appeals, Revisions & Settlements", "Penalties & Prosecutions"]
        },
        {
          name: "International Taxation",
          chapters: ["Transfer Pricing & ALP computation", "Advance Pricing Agreement (APA)", "Double Taxation Avoidance Agreement (DTAA)", "Non-Resident Taxation & Equalisation Levy"]
        },
        {
          name: "Black Money Act, 2015",
          chapters: ["Scope of Undisclosed Foreign Asset", "Assessments, Penalties & Appeals"]
        }
      ]
    },
    {
      id: "SCM",
      title: "Paper 16: Strategic Cost Management (SCM)",
      weightage: { A: "20% Framework", B: "30% Decisions", C: "20% Variances", D: "20% Performance", E: "10% Quality" },
      modules: [
        {
          name: "Cost Management Framework",
          chapters: ["Life Cycle Costing", "Target Costing & Kaizen Costing", "Value Chain Analysis & Porter's 5 Forces"]
        },
        {
          name: "Strategic Decision Making",
          chapters: ["Marginal Costing & CVP Analysis", "Relevant Costing & Special Orders", "Pricing Strategies & Transfer Pricing"]
        },
        {
          name: "Standard Costing",
          chapters: ["Material, Labour & Overhead Variances", "Sales & Profit Variance Analysis", "Planning vs Operational Variances"]
        },
        {
          name: "Performance Measurement",
          chapters: ["Balanced Scorecard & Benchmarking", "ROI and Residual Income Metrics"]
        },
        {
          name: "Supply Chain & Quality",
          chapters: ["Total Quality Management (TQM) & Six Sigma", "Lean Accounting & Just-in-Time (JIT)"]
        }
      ]
    }
  ],
  Group4: [
    {
      id: "CMAD",
      title: "Paper 17: Cost & Management Audit (CMAD)",
      weightage: { A: "35% Audit Rules", B: "30% Reports", C: "25% Management Audit", D: "10% Forensic" },
      modules: [
        {
          name: "Cost Audit Framework",
          chapters: ["Cost Accounting Standards (CAS 1-24)", "Companies Cost Records Rules, 2014"]
        },
        {
          name: "Cost Audit Reporting",
          chapters: ["Form CRA-1, CRA-2, CRA-3 & CRA-4", "Qualifications & Appointment of Cost Auditor", "Audit Planning & Working Papers"]
        },
        {
          name: "Management & Operational Audit",
          chapters: ["Operational Audit & Internal Control Evaluation", "Efficiency Audit & Energy Audit", "Environmental Audit & Social Audit"]
        },
        {
          name: "Forensic Audit",
          chapters: ["Fraud Detection Techniques", "Forensic Audit Report drafting"]
        }
      ]
    },
    {
      id: "CFR",
      title: "Paper 18: Corporate Financial Reporting (CFR)",
      weightage: { A: "30% Accounting Standards", B: "35% Consolidation", C: "20% Business Valuation", D: "15% Government" },
      modules: [
        {
          name: "Indian Accounting Standards (Ind AS)",
          chapters: ["First time adoption of Ind AS", "Ind AS 16 (PPE) & Ind AS 116 (Leases)", "Ind AS 115 (Revenue from Contracts)"]
        },
        {
          name: "Consolidated Financial Statements",
          chapters: ["Holding & Subsidiary Accounting", "Accounting for Associates & Joint Ventures", "Amalgamation of Companies (Ind AS 103)"]
        },
        {
          name: "Valuation & Reporting Developments",
          chapters: ["Valuation of Goodwill & Shares", "Triple Bottom Line & CSR Reporting"]
        },
        {
          name: "Government Accounting",
          chapters: ["Government Accounting Principles", "CAG Duties & Reports"]
        }
      ]
    },
    {
      id: "ITLP",
      title: "Paper 19: Indirect Tax Laws & Practice (ITLP)",
      weightage: { A: "70% GST", B: "30% Customs & FTP" },
      modules: [
        {
          name: "GST Core Concepts",
          chapters: ["Concept of Supply & Levies", "Time & Place of Supply", "Value of Supply"]
        },
        {
          name: "GST Compliance & Credit",
          chapters: ["Input Tax Credit (ITC - Sec 16/17)", "Registration & Invoicing", "Returns, Audits & Refunds"]
        },
        {
          name: "Customs Law",
          chapters: ["Customs Valuation & Duties", "Import & Export Procedures", "Baggage & Transit Rules"]
        },
        {
          name: "Foreign Trade Policy (FTP)",
          chapters: ["FTP Incentives & Duty Drawbacks", "Export Oriented Units (EOU) & SEZ"]
        }
      ]
    },
    {
      id: "ELECTIVE",
      title: "Paper 20: Elective",
      modules: [] // Populated dynamically in app.js
    }
  ]
};

const ELECTIVES_SYLLABUS = {
  "20A": {
    title: "Paper 20A: Strategic Performance Management & Business Valuation (SPMBV)",
    modules: [
      {
        name: "Strategic Performance Management",
        chapters: ["Performance Management Frameworks", "Enterprise Risk Management (ERM)", "Business Forecasting & Productivity Analysis"]
      },
      {
        name: "Business Valuation",
        chapters: ["Valuation Basics & Asset-Liability Valuation", "Valuation of Brands & Intangibles", "Mergers & Acquisitions Valuation Models"]
      }
    ]
  },
  "20B": {
    title: "Paper 20B: Risk Management in Banking and Insurance (RMBI)",
    modules: [
      {
        name: "Risk Management in Banking",
        chapters: ["Credit, Market & Operational Risk", "Basel Accords (I, II, III)", "NPA Management & ALM"]
      },
      {
        name: "Risk Management in Insurance",
        chapters: ["Underwriting Risks & Reinsurance", "Solvency Margins & IRDA Guidelines"]
      }
    ]
  },
  "20C": {
    title: "Paper 20C: Entrepreneurship and Startup (ENTS)",
    modules: [
      {
        name: "Entrepreneurship Development",
        chapters: ["Idea Generation & Business Plan Drafting", "Startup Valuation & Funding Tiers"]
      },
      {
        name: "Legal Framework & Benefits",
        chapters: ["DPIIT Recognition & Startup Benefits", "Intellectual Property Rights (IPR)"]
      }
    ]
  }
};

const MOTIVATION_QUOTES = [
  { q: "Professional competence and integrity are the cornerstones of management accounting.", a: "ICMAI Core Values" },
  { q: "Concentrated study hours compound over time. Every formula you memorize gets you closer to the credentials.", a: "Anonymous" },
  { q: "Behind every successful business decision stands a Cost Accountant controlling risk and value.", a: "Industry Saying" },
  { q: "Success is the sum of small efforts, repeated day in and day out.", a: "Robert Collier" },
  { q: "An investment in knowledge pays the best interest. Spaced revision compounds your score.", a: "Benjamin Franklin (adapted)" },
  { q: "The Companies Act, Tax Codes, and Financial Models are not barriers, they are your tools of trade.", a: "CMA Mentor" }
];

const PREPOPULATED_FLASHCARDS = [
  { id: "fc_capm", subject: "SFM", front: "Capital Asset Pricing Model (CAPM) Formula", back: "Expected Return (Ke) = Rf + Beta * (Rm - Rf)\n\nWhere:\nRf = Risk Free Rate\nBeta = Systematic Risk\nRm = Market Return\n(Rm - Rf) = Market Risk Premium" },
  { id: "fc_quorum", subject: "CEL", front: "Board Meeting Quorum (Companies Act 2013 Section 174)", back: "1/3rd of the total strength of the Board of Directors, or 2 directors, whichever is HIGHER.\n\nDirectors participating through video conferencing count towards quorum." },
  { id: "fc_relevant_costing", subject: "SCM", front: "Relevant Costing: Opportunity Cost of scarce resource", back: "Contribution lost from the next best alternative use when a scarce resource is diverted to a special order.\n\nRelevant Cost = Direct Cash Outflow + Opportunity Cost." },
  { id: "fc_tp_methods", subject: "DTIT", front: "Transfer Pricing: Arm's Length Price (ALP) Methods (Section 92C)", back: "1. Comparable Uncontrolled Price (CUP) Method\n2. Resale Price Method (RPM)\n3. Cost Plus Method (CPM)\n4. Profit Split Method (PSM)\n5. Transactional Net Margin Method (TNMM)" },
  { id: "fc_cost_audit_regulated", subject: "CMAD", front: "Cost Audit Applicability: Regulated Sectors", back: "Under Companies Cost Records Rules 2014:\n1. Overall annual turnover of all products of INR 50 Crore or more, AND\n2. Turnover of individual product of INR 25 Crore or more." },
  { id: "fc_ind_as_115", subject: "CFR", front: "Ind AS 115: 5-Step Model for Revenue Recognition", back: "1. Identify the contract with customer\n2. Identify separate performance obligations\n3. Determine transaction price\n4. Allocate transaction price to obligations\n5. Recognize revenue when obligations are satisfied." },
  { id: "fc_blocked_credits", subject: "ITLP", front: "GST Blocked Credits under Section 17(5)", back: "No Input Tax Credit (ITC) allowed for:\n- Motor vehicles (exceptions apply)\n- Food & beverages, outdoor catering, beauty treatments\n- Club memberships\n- Travel benefits to employees\n- Lost/stolen/destroyed goods or goods given as free gifts" },
  { id: "fc_mos", subject: "SCM", front: "Margin of Safety (MoS) Formula", back: "MoS = Actual Sales - Break-Even Sales\nOR\nMoS = Profit / PV Ratio\n\nRepresents the sales volume cushion before a company starts incurring losses." },
  { id: "fc_put_call", subject: "SFM", front: "Put-Call Parity Theorem Formula", back: "Stock Price (S) + Put Price (P) = Call Price (C) + Present Value of Strike Price (K * e^-rt)\n\nEnsures arbitrage-free pricing of options." },
  { id: "fc_mat", subject: "DTIT", front: "Minimum Alternate Tax (MAT) Rate Section 115JB", back: "15% of the book profits of the company (plus applicable surcharge and health/education cess).\n\nNot applicable to foreign companies under specific treaties." },
  { id: "fc_115baa", subject: "DTIT", front: "Section 115BAA Concessional Tax Rate", back: "Tax rate is 22% (effective rate is 25.17% including 10% surcharge and 4% cess).\n\nRequires domestic companies to waive specified incentives/deductions and MAT credit. MAT is not applicable once opted." },
  { id: "fc_115bab", subject: "DTIT", front: "Section 115BAB Concessional Tax Rate for New Manufacturers", back: "Tax rate is 15% (effective rate is 17.16% including 10% surcharge and 4% cess).\n\nFor domestic companies incorporated on or after Oct 1, 2019, commencing manufacturing before March 31, 2024. Waives incentives & MAT." },
  { id: "fc_secondary_tp", subject: "DTIT", front: "Secondary Adjustment in Transfer Pricing (Sec 92CE)", back: "Applicable if primary adjustment exceeds INR 1 Crore AND relates to AY 2017-18 onwards.\n\nRequires the excess money to be repatriated to India within 90 days, failing which it is treated as an advance and interest is charged." },
  { id: "fc_black_scholes", subject: "SFM", front: "Black-Scholes Option Pricing Variables", back: "Determines Call Option Price using 5 inputs:\n1. Current Stock Price (S)\n2. Strike Price (K)\n3. Risk-free interest rate (r)\n4. Time to expiration (t)\n5. Volatility / standard deviation of stock return (σ)" },
  { id: "fc_beta_portfolio", subject: "SFM", front: "Portfolio Beta Formula", back: "Beta of Portfolio (βp) = Weighted average of individual asset betas.\n\nβp = Σ (wi * βi)\nWhere wi is the weight of asset i and βi is its beta." },
  { id: "fc_bond_duration", subject: "SFM", front: "Macaulay Duration of a Bond", back: "Measures the weighted average time to receive all cash flows.\n\nDuration = Σ [t * PV(CFt)] / Current Bond Price\n\nIndicates bond price price sensitivity to interest rate changes." },
  { id: "fc_six_sigma", subject: "SCM", front: "Six Sigma Quality DMAIC Phases", back: "DMAIC stands for:\n1. Define: Project goals & customer requirements.\n2. Measure: Process performance.\n3. Analyze: Root causes of defects.\n4. Improve: Process optimization.\n5. Control: Process standardization & monitoring." },
  { id: "fc_balanced_scorecard", subject: "SCM", front: "Balanced Scorecard (BSC) 4 Perspectives", back: "1. Financial: How do we look to shareholders?\n2. Customer: How do customers see us?\n3. Internal Business Processes: What must we excel at?\n4. Learning & Growth: How can we continue to improve & create value?" },
  { id: "fc_transfer_pricing_scm", subject: "SCM", front: "SCM Transfer Pricing: Minimum Transfer Price", back: "Minimum TP = Variable Cost of transferring division + Opportunity Cost for the company.\n\nOpportunity Cost = 0 if there is excess capacity, or Contribution lost if operating at full capacity." },
  { id: "fc_directors_sec149", subject: "CEL", front: "Independent Director Qualifications (Section 149(6))", back: "An ID is a director other than a nominee/managing/whole-time director who:\n- Is a person of integrity & possesses relevant expertise.\n- Is not a promoter or related to promoters of the company/subsidiaries." },
  { id: "fc_directors_sec164", subject: "CEL", front: "Director Disqualifications under Section 164(2)", back: "A person is disqualified if a company they are a director of:\n1. Fails to file financial statements/annual returns for 3 consecutive financial years, OR\n2. Fails to repay deposits/interests or redeem debentures for 1 year." },
  { id: "fc_board_loans", subject: "CEL", front: "Loans to Directors under Section 185", back: "Directly or indirectly providing loans, book debts, or guarantees to directors, their relatives, or partner firms is generally PROHIBITED.\n\nExceptions apply for MD/WTD as part of service conditions." },
  { id: "fc_gstr_2b", subject: "ITLP", front: "GSTR-2B Input Tax Credit Mandate", back: "GSTR-2B is an auto-drafted, static ITC statement.\n\nUnder CGST Section 16(2)(aa), ITC can only be claimed if matching invoices are uploaded by suppliers in GSTR-1 and reflected in buyer's GSTR-2B. 0% provisional buffer." },
  { id: "fc_e_invoicing", subject: "ITLP", front: "E-Invoicing Threshold (GST Rule 48(4))", back: "Mandatory for taxpayers with aggregate annual turnover exceeding INR 5 Crore in any preceding financial year (from 2017-18 onwards).\n\nRequires uploading B2B invoices to Invoice Registration Portal (IRP) to get IRN." }
];

const PREPOPULATED_MCQS = [
  {
    id: "mcq_1",
    subject: "CMAD",
    question: "What is the time limit for a company to submit Cost Audit Report in Form CRA-3 to the Central Government?",
    options: [
      "Within 30 days from the date of receipt of the cost audit report by the company (filed in CRA-4)",
      "Within 180 days from the close of the financial year",
      "Within 60 days from the close of the financial year",
      "Within 90 days from the receipt of the report by board of directors"
    ],
    correct: 0,
    explanation: "Under the Companies Rules 2014, the company must file the report in Form CRA-4 with the Central Government within 30 days of receiving the Cost Audit Report (Form CRA-3)."
  },
  {
    id: "mcq_2",
    subject: "SFM",
    question: "Using CAPM, if Risk-Free Rate = 6%, Beta = 1.2, and Market Risk Premium = 8%, what is the Cost of Equity (Ke)?",
    options: [
      "12.8%",
      "15.6%",
      "14.4%",
      "9.6%"
    ],
    correct: 1,
    explanation: "Ke = Rf + Beta * (Market Risk Premium) = 6% + 1.2 * 8% = 6% + 9.6% = 15.6%."
  },
  {
    id: "mcq_3",
    subject: "CEL",
    question: "What is the mandatory CSR spend requirement for companies meeting thresholds under Section 135(5) of the Companies Act 2013?",
    options: [
      "At least 2% of the average net profits made during the three immediately preceding financial years",
      "At least 5% of the average net profits made during the three immediately preceding financial years",
      "At least 2% of the net worth of the company in the current financial year",
      "At least 1% of the annual turnover of the company"
    ],
    correct: 0,
    explanation: "Section 135(5) mandates that eligible companies spend at least 2% of their average net profits made during the three immediately preceding financial years."
  },
  {
    id: "mcq_4",
    subject: "SCM",
    question: "Which of the following is considered a sunk cost in relevant costing decision analysis?",
    options: [
      "Opportunity cost of choosing Option A over Option B",
      "The purchase cost of existing stock purchased last month with no resale value",
      "The salary of a supervisor specifically hired for a new project",
      "Incremental cost of buying extra raw materials"
    ],
    correct: 1,
    explanation: "Sunk costs are historical cost commitments that have already occurred, cannot be recovered, and are irrelevant to future decisions."
  },
  {
    id: "mcq_5",
    subject: "DTIT",
    question: "An Equalisation Levy of what percentage is charged on consideration received by a non-resident for online advertisement services?",
    options: [
      "2%",
      "5%",
      "6%",
      "10%"
    ],
    correct: 2,
    explanation: "Equalisation Levy is charged at 6% on consideration received by non-resident companies for specified online advertising services exceeding INR 1 Lakh annually."
  },
  {
    id: "mcq_6",
    subject: "ITLP",
    question: "What is the normal time limit for issuing a tax invoice for supply of services under GST?",
    options: [
      "Within 30 days from the date of supply of service (45 days for banking/financial institutions)",
      "Within 15 days from the date of supply of service",
      "On or before the time of supply of service",
      "Within 45 days from the date of supply for all companies"
    ],
    correct: 0,
    explanation: "Rule 47 of CGST Rules mandates invoice issuance within 30 days of service provision, extended to 45 days for insurers, banking institutions, and NBFCs."
  },
  {
    id: "mcq_7",
    subject: "CMAD",
    question: "Which Cost Accounting Standard (CAS) deals with Cost Classification?",
    options: [
      "CAS-1",
      "CAS-2",
      "CAS-3",
      "CAS-4"
    ],
    correct: 0,
    explanation: "Cost Accounting Standard 1 (CAS-1) deals with Cost Classification principles, whereas CAS-2 deals with Capacity Determination."
  },
  {
    id: "mcq_8",
    subject: "SCM",
    question: "If Selling Price is $25, Variable Cost is $15, and Fixed Cost is $50,000, what is the Break-Even Point in units?",
    options: [
      "2,000 units",
      "3,333 units",
      "5,000 units",
      "1,500 units"
    ],
    correct: 2,
    explanation: "BEP (units) = Fixed Cost / Contribution Margin per unit = $50,000 / ($25 - $15) = $50,000 / $10 = 5,000 units."
  },
  {
    id: "mcq_9",
    subject: "DTIT",
    question: "What is the rate of secondary transfer pricing interest surcharge if the primary adjustment is not repatriated to India?",
    options: [
      "No separate surcharge, added as interest on normal tax",
      "Treated as deemed dividend taxed at 20% if not repatriated within 90 days",
      "Interest calculated at SBI one-year MCLR + 3.25% (for INR transactions) or SOFR + 3% (for foreign currency)",
      "Direct penalty of 30% on the un-repatriated amount"
    ],
    correct: 2,
    explanation: "If the primary transfer pricing adjustment is not repatriated to India within 90 days, interest is computed at SBI one-year MCLR + 3.25% (if transaction is in INR) or LIBOR/SOFR + 3% (for foreign currency)."
  },
  {
    id: "mcq_10",
    subject: "DTIT",
    question: "Under Section 115JB, which of the following is ADDED back to net profit to compute Book Profits for MAT?",
    options: [
      "Amount of income-tax paid or payable including interest, surcharge & cess",
      "Amount of transfer from reserves or provisions",
      "Amount of dividends received from domestic companies",
      "Share of profit from a partnership firm"
    ],
    correct: 0,
    explanation: "Income-tax paid or payable, including interest, surcharges, and cesses, must be added back to net profit when calculating Book Profits under Section 115JB."
  },
  {
    id: "mcq_11",
    subject: "DTIT",
    question: "In a transfer pricing audit, the Arm's Length Range percentile method is applicable if the number of comparables is:",
    options: [
      "3 or more",
      "6 or more",
      "10 or more",
      "Exactly 5"
    ],
    correct: 1,
    explanation: "Under Indian transfer pricing rules, the percentile range method (35th to 65th percentile) is applicable only if there are 6 or more comparable entities."
  },
  {
    id: "mcq_12",
    subject: "SFM",
    question: "In Black-Scholes Option Pricing, if volatility (standard deviation) increases, what is the effect on Call and Put Option prices?",
    options: [
      "Call price increases, Put price decreases",
      "Call price decreases, Put price increases",
      "Both Call and Put prices increase",
      "Both Call and Put prices decrease"
    ],
    correct: 2,
    explanation: "An increase in volatility increases the probability of extreme price movements, which makes options more valuable. Therefore, both call and put option values increase."
  },
  {
    id: "mcq_13",
    subject: "SFM",
    question: "Under the Sharpe Single Index Model, what does the Beta of a security represent?",
    options: [
      "The unsystematic or firm-specific risk",
      "The systematic risk relative to the market index",
      "The standard deviation of historical prices",
      "The alpha intercept of returns"
    ],
    correct: 1,
    explanation: "Beta measures the security's volatility or systematic risk relative to the overall market portfolio or index."
  },
  {
    id: "mcq_14",
    subject: "SFM",
    question: "If a bond's coupon rate is equal to its Yield to Maturity (YTM), the bond will trade at:",
    options: [
      "A premium above face value",
      "A discount below face value",
      "Its par value (face value)",
      "Its Macaulay duration value"
    ],
    correct: 2,
    explanation: "When the coupon rate matches the required rate of return (YTM), the present value of all coupon and principal cash flows equals the par value."
  },
  {
    id: "mcq_15",
    subject: "SCM",
    question: "In target costing, how is the target cost calculated?",
    options: [
      "Target Cost = Estimated Cost + Desired Profit Margin",
      "Target Cost = Competitive Target Selling Price - Desired Profit Margin",
      "Target Cost = Standard Cost * PV Ratio",
      "Target Cost = Opportunity Cost + Variable Cost"
    ],
    correct: 1,
    explanation: "Target Costing works backwards from market conditions: Target Cost = Competitive Target Selling Price - Desired Profit Margin."
  },
  {
    id: "mcq_16",
    subject: "SCM",
    question: "Which variance is calculated as (Actual Mix Quantity - Revised Standard Mix Quantity) * Standard Price?",
    options: [
      "Material Price Variance",
      "Material Yield Variance",
      "Material Mix Variance",
      "Material Usage Variance"
    ],
    correct: 2,
    explanation: "Material Mix Variance measures the deviation in the proportions of inputs used: (Actual Quantity in Actual Mix - Actual Quantity in Standard Mix) * Standard Price."
  },
  {
    id: "mcq_17",
    subject: "SCM",
    question: "In a transfer pricing scenario with excess capacity in the transferring division, what is the minimum transfer price?",
    options: [
      "Full standard manufacturing cost",
      "Incremental variable cost of transfer only",
      "Variable cost + contribution lost from external sales",
      "Market price of the product"
    ],
    correct: 1,
    explanation: "If there is excess capacity, there is no opportunity cost from lost external sales. Therefore, the minimum transfer price is the incremental variable cost of producing the transferred unit."
  },
  {
    id: "mcq_18",
    subject: "CEL",
    question: "According to Section 188 of the Companies Act 2013, related party transactions exceeding specified limits require:",
    options: [
      "Approval by the Central Government",
      "Unanimous approval of all directors",
      "Prior approval of the company by an Ordinary Resolution in general meeting",
      "Special Resolution with 75% majority"
    ],
    correct: 2,
    explanation: "Transactions with related parties that exceed prescribed limits under Section 188 require prior approval by Ordinary Resolution, and interested shareholders cannot vote."
  },
  {
    id: "mcq_19",
    subject: "CEL",
    question: "What is the maximum number of directorships (including alternate directorships) a person can hold at any one time?",
    options: [
      "10 directorships",
      "20 directorships (out of which max 10 in public companies)",
      "15 directorships",
      "Unlimited for private companies"
    ],
    correct: 1,
    explanation: "Section 165 limits directorships to 20 companies, with a maximum of 10 in public companies."
  },
  {
    id: "mcq_20",
    subject: "CEL",
    question: "An Independent Director can be appointed for a maximum of how many consecutive terms?",
    options: [
      "Up to 3 terms of 3 years each",
      "Up to 2 terms of 5 years each",
      "Up to 5 terms of 1 year each",
      "Unlimited subject to shareholder approval every year"
    ],
    correct: 1,
    explanation: "Section 149(11) states that an Independent Director can hold office for up to two consecutive terms of up to five years each."
  },
  {
    id: "mcq_21",
    subject: "ITLP",
    question: "Input Tax Credit (ITC) under GST is completely BLOCKED for which of the following goods or services?",
    options: [
      "Motor vehicles used for transportation of goods",
      "Food and beverages provided as part of commercial catering business",
      "Goods given as free gifts or free samples",
      "Raw materials purchased for manufacturing taxable products"
    ],
    correct: 2,
    explanation: "Under Section 17(5)(h), ITC is blocked for goods lost, stolen, destroyed, written off, or disposed of by way of gift or free samples."
  },
  {
    id: "mcq_22",
    subject: "ITLP",
    question: "Which of the following is a mandatory condition under CGST Section 16(2) to claim Input Tax Credit?",
    options: [
      "The buyer has received the goods or services",
      "The supplier has paid the tax to the government",
      "The invoice details are uploaded by the supplier in GSTR-1 and reflected in GSTR-2B",
      "All of the above"
    ],
    correct: 3,
    explanation: "Section 16(2) lists multiple concurrent conditions: possession of tax invoice, physical receipt of goods/services, payment of tax by supplier, filing of returns, and GSTR-2B matching."
  },
  {
    id: "mcq_23",
    subject: "CMAD",
    question: "Form CRA-1 under the Cost Records and Audit Rules 2014 specifies the format for:",
    options: [
      "Filing the cost audit report to Central Govt",
      "Maintenance of Cost Records by the company",
      "Appointment of the cost auditor",
      "Cost Audit Report by the auditor"
    ],
    correct: 1,
    explanation: "CRA-1 outlines the guidelines and format for maintaining Cost Records. CRA-2 is for auditor appointment, CRA-3 is the auditor's report, and CRA-4 is the filing form."
  },
  {
    id: "mcq_24",
    subject: "CFR",
    question: "Which of the following Ind AS deals with Financial Instruments (Presentation)?",
    options: [
      "Ind AS 109",
      "Ind AS 32",
      "Ind AS 115",
      "Ind AS 103"
    ],
    correct: 1,
    explanation: "Ind AS 32 deals with presentation of Financial Instruments. Ind AS 109 deals with classification and measurement, and Ind AS 115 deals with Revenue from Contracts."
  }
];

const DOUBT_SOLVER_MAP = {
  "transfer pricing": "Transfer Pricing is governed by Section 92 to 92F of the Income Tax Act, 1961. The core principle is that transactions between Associated Enterprises (AEs) must be computed at the **Arm's Length Price (ALP)** to ensure fair taxation.\n\nMethods to compute ALP:\n1. **Comparable Uncontrolled Price (CUP)**: Direct price comparison.\n2. **Resale Price Method (RPM)**: Based on resale margins.\n3. **Cost Plus Method (CPM)**: Direct costs + gross profit markup.\n4. **Profit Split Method (PSM)**: Splitting consolidated profits based on assets and risk.\n5. **Transactional Net Margin Method (TNMM)**: Net profit comparison relative to appropriate base (costs, sales).",
  "quorum": "Under Section 174 of the Companies Act 2013, the **Quorum for Board Meetings** of a company is:\n- **One-third (1/3rd)** of its total strength, or\n- **Two (2) directors**,\nwhichever is higher.\n\nImportant details:\n- Interested directors are excluded from counting towards quorum. If interested directors exceed 2/3rd, the remaining present directors (minimum 2) form quorum.\n- Directors attending via video conferencing or audio-visual means are counted.",
  "capm": "The **Capital Asset Pricing Model (CAPM)** describes expected returns relative to systematic market risk:\n\n`Ke = Rf + Beta * (Rm - Rf)`\n\nWhere:\n- `Ke`: Cost of Equity\n- `Rf`: Risk-Free Rate (e.g. Government Bonds)\n- `Beta (β)`: Asset volatility relative to market\n- `Rm`: Market return rate\n- `(Rm - Rf)`: Market Risk Premium",
  "value chain": "In SCM, Michael Porter's **Value Chain Analysis (VCA)** evaluates activities to build competitive advantage.\n\nActivities split:\n- **Primary Activities**: Inbound Logistics, Operations, Outbound Logistics, Marketing & Sales, Service.\n- **Support Activities**: Procurement, Human Resource Management, Technology Development, Firm Infrastructure.",
  "corporate tax": "Corporate tax in India depends on the chosen regime:\n- **Domestic Company (Normal)**: 30% (or 25% if turnover is within INR 400 Cr in baseline year).\n- **Section 115BAA**: Option to pay **22%** (effective ~25.17% with cess) if exemptions & MAT are waived.\n- **Section 115BAB**: Option for new manufacturing companies to pay **15%** (effective ~17.16%).\n\n**MAT (Minimum Alternate Tax)** is 15% under Section 115JB on book profits, if normal tax liability falls below it.",
  "cost audit": "Under Section 148 of Companies Act 2013 and Cost Records and Audit Rules 2014, cost audits are mandatory for companies meeting turnover limits:\n- **Regulated Sectors** (Telecom, Power, Sugar, etc.): Overall turnover >= INR 50 Cr, and product turnover >= INR 25 Cr.\n- **Non-Regulated Sectors** (Steel, Pharma, Cement, etc.): Overall turnover >= INR 100 Cr, and product turnover >= INR 35 Cr.\n\nReports are drafted in Form **CRA-3** and submitted to company. Company files CRA-4 to Central Govt within 30 days.",
  "fema": "The **Foreign Exchange Management Act (FEMA), 1999** governs currency and cross-border trade transactions in India.\n- **Residential Status (Sec 2(v))**: Dependent on stay in India during previous FY (> 182 days) and purpose of stay.\n- **Current Account Transactions (Sec 5)**: Freely permitted unless restricted under schedules.\n- **Capital Account Transactions (Sec 6)**: Regulated/Restricted by RBI (e.g., FDI, ECB, Overseas Investments).",
  "mat": "**Minimum Alternate Tax (MAT)** is governed by Section 115JB of the Income Tax Act.\n- **Rate**: 15% of Book Profits (10% under Section 115BAA/BAB normal regimes, but MAT does not apply once you opt into Section 115BAA/BAB concessional rates).\n- **Applicability**: If normal income-tax payable by a company is less than 15% of its book profits, the book profit is deemed to be the total income, and the company pays 15% tax.\n- **MAT Credit**: Credit can be carried forward for up to 15 Assessment Years.",
  "concessional": "**Concessional Tax Regimes** for domestic companies:\n- **Section 115BAA**: Tax rate of **22%** (effective rate ~25.17% with surcharge & cess). Applicable to all domestic companies if they waive specific exemptions and MAT credit.\n- **Section 115BAB**: Tax rate of **15%** (effective rate ~17.16% with surcharge & cess). For new domestic manufacturing companies incorporated on/after Oct 1, 2019, which commence manufacturing before March 31, 2024.",
  "six sigma": "**Six Sigma** is a data-driven quality framework targeting no more than **3.4 defects per million opportunities (DPMO)**.\nIt uses the **DMAIC** methodology:\n1. **Define** goals and customer requirements.\n2. **Measure** current process performance.\n3. **Analyze** root causes of defects.\n4. **Improve** processes by removing root causes.\n5. **Control** future process performance.",
  "balanced scorecard": "The **Balanced Scorecard (BSC)** is a strategic performance management tool that tracks financial and non-financial metrics across four perspectives:\n1. **Financial**: Profitability, ROI, cost reduction.\n2. **Customer**: Customer satisfaction, retention, market share.\n3. **Internal Processes**: Quality, cycle time, efficiency.\n4. **Learning & Growth**: Employee training, corporate culture, knowledge management.",
  "directors": "**Directors Regulations under Companies Act 2013**:\n- **Section 149(4)**: Public listed companies must have at least **1/3rd Independent Directors**.\n- **Section 149(6)**: Independent Director qualifications (no promoter/financial interest).\n- **Section 164(2)**: Disqualification rules (failure to file financial statements for 3 years, default on deposits/debentures for 1 year).\n- **Section 185**: Prohibition on loans, guarantees, or security to directors or their relatives.",
  "gst": "**Key GST Regulations**:\n- **Input Tax Credit (ITC)**: Governed by Section 16 & 17. Blocked credits under **Section 17(5)** include motor vehicles, food & beverages, gifts, and personal consumption.\n- **GSTR-2B Matching**: ITC can only be claimed if invoices are uploaded by suppliers in GSTR-1 and are visible in the buyer's auto-generated, static GSTR-2B statement.\n- **E-Invoicing**: Mandated for taxpayers with turnover exceeding **INR 5 Crore** in any preceding FY.",
  "ibc": "The **Insolvency and Bankruptcy Code (IBC), 2016**:\n- **Corporate Insolvency Resolution Process (CIRP)**: Can be initiated by Financial Creditors (Sec 7), Operational Creditors (Sec 9), or Corporate Applicant (Sec 10) on default threshold of **INR 1 Crore**.\n- **Moratorium (Sec 14)**: Suspends all debt collection actions, suits, foreclosure during the resolution period.\n- **Committee of Creditors (CoC)**: Consists of financial creditors, takes decisions by 66% majority vote (except routine items at 51%)."
};

const BADGES = [
  { id: "hours_10", icon: "⏱️", label: "Dedicated", desc: "Logged 10 total study hours", check: () => totalHours() >= 10 },
  { id: "hours_50", icon: "🏆", label: "Power House", desc: "Logged 50 total study hours", check: () => totalHours() >= 50 },
  { id: "streak_3", icon: "🔥", label: "Consistent", desc: "Maintained a 3-day active streak", check: () => S.streak >= 3 },
  { id: "streak_7", icon: "🌟", label: "Disciplined", desc: "Maintained a 7-day active streak", check: () => S.streak >= 7 },
  { id: "quiz_5", icon: "✏️", label: "MCQ Master", desc: "Completed 5 mock quizzes", check: () => S.quizLog.length >= 5 },
  { id: "fc_10", icon: "🃏", label: "Memorizer", desc: "Mastered 10 flashcards", check: () => countMasteredFlashcards() >= 10 },
  { id: "notes_5", icon: "📝", label: "Scribe", desc: "Created 5 digital notes", check: () => S.notes.length >= 5 },
  { id: "syllabus_25", icon: "📚", label: "Progressor", desc: "Completed 25% of the syllabus", check: () => syllabusCompletionPct() >= 25 },
  { id: "syllabus_50", icon: "🎓", label: "CMA Finalist", desc: "Completed 50% of the syllabus", check: () => syllabusCompletionPct() >= 50 }
];

const TODAY_KEY = new Date().toISOString().slice(0, 10);

// ── 3. STATE CONTROLLERS ──

function load() {
  const saved = localStorage.getItem("CMA_FinalistOS_v1");
  if (saved) {
    try {
      Object.assign(S, JSON.parse(saved));
    } catch(e) {
      console.error("Load failed, reset state used.", e);
    }
  } else {
    // Check if older version exists to migrate, otherwise seed presets
    const oldSaved = localStorage.getItem("placementOS_v2");
    if (oldSaved) {
      toast("ℹ️ Found existing workspace. Setting up CMA syllabus profile...", "info");
    }
    // Seed default notes
    S.notes = [
      { id: "n_1", folder: "Corporate Laws", title: "Board Quorum Notes", content: "Section 174 of Companies Act 2013:\nQuorum is 1/3rd of total strength or 2 directors, whichever is higher.\nIf interested directors exceed 2/3rd, then present non-interested directors (min 2) form quorum.\nVideo conference attendance is allowed.", tags: "Companies Act, Board Meetings", updatedAt: Date.now() },
      { id: "n_2", folder: "Strategic Finance", title: "CAPM Summary & Beta", content: "CAPM: Ke = Rf + Beta * (Rm - Rf).\nBeta measures systematic risk. Portfolio Beta is weighted average of individual betas.\nLeasing decisions compare NPV of leasing vs buying using post-tax cost of debt.", tags: "CAPM, Portfolio", updatedAt: Date.now() }
    ];
    S.tasks = [
      { id: "t_1", title: "Memorize Directors Appointment Sections (Sec 149-160)", priority: "High", deadline: TODAY_KEY, subject: "CEL", status: "Todo" },
      { id: "t_2", title: "Practice SFM Derivatives Options formulas", priority: "High", deadline: TODAY_KEY, subject: "SFM", status: "InProgress" },
      { id: "t_3", title: "Read Cost Records Rule 2014 boundaries", priority: "Medium", deadline: TODAY_KEY, subject: "CMAD", status: "Completed" }
    ];
    S.goals = [
      { id: "g_1", title: "Complete Capital Budgeting Risk Analysis", type: "weekly", date: TODAY_KEY, subject: "SFM", completed: false },
      { id: "g_2", title: "June Exam Cycle Registration", type: "exam", date: "2026-12-10", subject: "ELECTIVE", completed: false }
    ];
    save();
  }
  
  // Clean structure checks
  if (!S.customFlashcards) S.customFlashcards = [];
  if (!S.flashcardMastery) S.flashcardMastery = {};
  if (!S.quizLog) S.quizLog = [];
  if (!S.revisions) S.revisions = [];
  if (!S.goals) S.goals = [];
  if (!S.pomoHistory) S.pomoHistory = [];
  if (!S.chatHistory) S.chatHistory = [];
  if (!S.tasks) S.tasks = [];
  if (!S.folders) S.folders = ["General Notes", "Corporate Laws", "Strategic Finance", "Direct Taxes", "Strategic Costs"];
  if (!S.notes) S.notes = [];
  if (!S.pyqSolved) S.pyqSolved = {};

  initStreakCheck();
  buildElectiveSyllabus();
}

function save() {
  S.updatedAt = Date.now();
  localStorage.setItem("CMA_FinalistOS_v1", JSON.stringify(S));
  if (typeof window.syncPush === 'function') {
    window.syncPush(S);
  }
}

function buildElectiveSyllabus() {
  const code = S.elective || "20A";
  const elData = ELECTIVES_SYLLABUS[code] || ELECTIVES_SYLLABUS["20A"];
  CMA_SYLLABUS.Group4[3] = {
    id: "ELECTIVE",
    title: elData.title,
    weightage: { A: "50% Strategic Performance", B: "50% Business Valuation" },
    modules: elData.modules
  };
}

function initStreakCheck() {
  const today = TODAY_KEY;
  if (!S.lastActive) {
    S.lastActive = today;
    S.streak = 1;
    save();
    return;
  }
  
  const diff = daysBetween(S.lastActive, today);
  if (diff === 0) return;
  if (diff === 1) {
    S.streak++;
  } else {
    S.streak = 1;
  }
  S.dailyChecks = {}; // Reset checklist on new day
  S.lastActive = today;
  save();
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function addXP(pts) {
  S.xp += pts;
  const newLevel = Math.floor(S.xp / 100) + 1;
  if (newLevel > S.level) {
    S.level = newLevel;
    toast(`🎉 Level Up! You reached Level ${S.level}!`, "success");
    triggerConfetti();
  }
  save();
  renderXPBar();
}

function triggerConfetti() {
  // Spawn sparkles/confetti in CSS
  for (let i = 0; i < 20; i++) {
    const p = document.createElement("div");
    p.className = "xp-particle";
    p.style.left = Math.random() * 100 + "vw";
    p.style.top = Math.random() * 40 + "vh";
    p.style.color = i % 2 === 0 ? "var(--accent)" : "var(--accent2)";
    p.style.setProperty("--dx", (Math.random() * 150 - 75) + "px");
    p.style.setProperty("--dy", (Math.random() * 150 - 75) + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

// ── 4. UI INITIALIZATION ──

let activeLoggerTab = "manual";
let activeGoalTab = "active";
let activeRevisionFilter = "all";
let calendarCurrentDate = new Date();

window.addEventListener("DOMContentLoaded", () => {
  load();
  setupSidebarNav();
  setupTopbar();
  initLoggerSubjectDropdowns();
  
  // Render SPA modules
  renderAll();
  
  // Timer systems
  loadTimerState();
  initQuoteRotator();
  
  // Custom interactive setups
  initSyllabusTracker();
  initCalendar();
  initNotesFolders();
  initNotesList();
  initDoubtSolver();
});

function setupSidebarNav() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      const section = item.dataset.section;
      if (section) switchSection(section);
      if (window.innerWidth < 900) {
        document.getElementById("sidebar")?.classList.remove("open");
        document.querySelector(".sidebar-overlay")?.classList.remove("show");
      }
    });
  });
}

function switchSection(sec) {
  document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
  document.querySelector(`.nav-item[data-section="${sec}"]`)?.classList.add('active');
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(`section-${sec}`)?.classList.add("active");
  
  // Title update
  const sectionTitles = {
    dashboard: "Dashboard",
    syllabus: "Syllabus Tracker",
    planner: "Study Planner & Calendar",
    timer: "Focus Pomodoro Timer",
    notes: "Digital Notes",
    revision: "Spaced Repetition Revision",
    quizzes: "Quizzes & Practice MCQs",
    flashcards: "Interactive Flashcards",
    doubt_solver: "AI Doubt Solver Chat",
    tasks: "Kanban Task Manager",
    analytics: "Study Analytics",
    exampapers: "PYQs & Trends"
  };
  document.getElementById("topbar-title").textContent = sectionTitles[sec] || "Dashboard";
  
  // Refresh section calculations
  if (sec === "dashboard") {
    renderDashboard();
  } else if (sec === "syllabus") {
    renderSyllabus();
  } else if (sec === "planner") {
    renderPlannerGoals();
    renderCalendar();
  } else if (sec === "revision") {
    renderRevisionQueue();
  } else if (sec === "quizzes") {
    showQuizSetup();
    renderQuizHistory();
  } else if (sec === "flashcards") {
    renderFlashcards();
  } else if (sec === "tasks") {
    renderTaskManager();
  } else if (sec === "analytics") {
    renderAnalytics();
  } else if (sec === "exampapers") {
    renderPYQTracker();
  }
}

function setupTopbar() {
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.toggle("open");
    document.querySelector(".sidebar-overlay")?.classList.toggle("show");
  });
  
  document.querySelector(".sidebar-overlay")?.addEventListener("click", () => {
    document.getElementById("sidebar")?.classList.remove("open");
    document.querySelector(".sidebar-overlay")?.classList.remove("show");
  });
  
  // Date chip
  const dateStr = new Date().toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' });
  const dateChip = document.getElementById("date-chip");
  if (dateChip) dateChip.textContent = dateStr;
  
  // Sync Status
  renderSyncStatusUI();
}

function renderSyncStatusUI() {
  const syncCode = localStorage.getItem("placementOS_sync_code") || "OS-XXXXXX";
  const display = document.getElementById("sync-code-display");
  if (display) display.textContent = syncCode;
}

function initLoggerSubjectDropdowns() {
  const selects = ["log-subject", "timer-subject", "pomo-subject", "goal-subject", "rev-subject", "task-subject", "new-fc-subject"];
  
  selects.forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    
    // Clear and populate
    select.innerHTML = "";
    Object.keys(SUBJECT_KEYS).forEach(k => {
      const opt = document.createElement("option");
      opt.value = k;
      opt.textContent = SUBJECT_KEYS[k];
      select.appendChild(opt);
    });
  });
}

function renderXPBar() {
  const lvlElement = document.getElementById("sb-level");
  const xpElement = document.getElementById("sb-xp");
  const fillElement = document.getElementById("sb-xp-fill");
  const nextElement = document.getElementById("sb-xp-next");
  
  if (lvlElement) lvlElement.textContent = S.level;
  
  const xpBase = (S.level - 1) * 100;
  const currentXP = S.xp - xpBase;
  const pct = Math.max(0, Math.min(100, currentXP));
  
  if (xpElement) xpElement.textContent = `${S.xp} XP`;
  if (fillElement) fillElement.style.width = `${pct}%`;
  if (nextElement) nextElement.textContent = `${100 - pct} XP to Level ${S.level + 1}`;
}

function renderAll() {
  renderXPBar();
  renderDashboard();
  renderSyllabus();
  renderPlannerGoals();
  renderCalendar();
  renderRevisionQueue();
  renderQuizHistory();
  renderFlashcards();
  renderTaskManager();
  renderAnalytics();
}

// ── 5. MODULE: DASHBOARD ──

function renderDashboard() {
  // Streak
  const streakTop = document.getElementById("top-streak");
  const rStreak = document.getElementById("r-streak");
  if (streakTop) streakTop.textContent = S.streak;
  if (rStreak) rStreak.textContent = S.streak;
  
  // Total XP
  const rXP = document.getElementById("r-xp");
  if (rXP) rXP.textContent = S.xp;
  
  // Syllabus completion
  const readinessPct = document.getElementById("readiness-pct");
  const completionSummary = document.getElementById("syllabus-completion-summary");
  const overallPct = Math.round(syllabusCompletionPct());
  if (readinessPct) readinessPct.textContent = `${overallPct}%`;
  if (completionSummary) completionSummary.textContent = `${overallPct}%`;
  
  const ring = document.getElementById("readiness-ring");
  if (ring) {
    const totalLength = 326.7;
    const offset = totalLength - (overallPct / 100) * totalLength;
    ring.style.strokeDashoffset = offset;
  }
  
  // Hours Logged
  const todayHrs = dailyHours(TODAY_KEY);
  const weekHrs = weeklyHours();
  const allTimeHrs = totalHours();
  
  const hToday = document.getElementById("hours-today");
  const hWeek = document.getElementById("hours-week");
  const hTotal = document.getElementById("hours-total");
  const rHours = document.getElementById("r-hours");
  
  if (hToday) hToday.textContent = `${todayHrs}h`;
  if (hWeek) hWeek.textContent = `${weekHrs}h`;
  if (hTotal) hTotal.textContent = `${allTimeHrs}h`;
  if (rHours) rHours.textContent = `${allTimeHrs}h`;
  
  // Revision, Quiz, Flashcards badges
  const rRevision = document.getElementById("r-revision");
  const rQuizzes = document.getElementById("r-quizzes");
  const rFlashcards = document.getElementById("r-flashcards");
  
  if (rRevision) rRevision.textContent = S.revisions.filter(r => r.completed).length;
  if (rQuizzes) rQuizzes.textContent = S.quizLog.length;
  if (rFlashcards) rFlashcards.textContent = countMasteredFlashcards();
  
  // Load checklist checklist checked states
  document.querySelectorAll("#daily-checklist input[type='checkbox']").forEach(inp => {
    const key = inp.dataset.key;
    inp.checked = !!S.dailyChecks[key];
  });
  updateDailyProgressMeter();
  
  // Dashboard quote
  rotateQuote(true);
  
  // Render badges
  renderAchievementsBadges();
  
  // Dash Mini lists
  renderDashboardMiniTasks();
  renderDashboardMiniRevisions();
  
  // Render Today's Target Card
  renderDashboardTodaysTarget();
}

function rotateQuote(isInitial = false) {
  const quote = document.getElementById("dash-quote");
  const author = document.getElementById("dash-quote-author");
  if (!quote || !author) return;
  
  // Pull random or sequential
  let idx = 0;
  if (isInitial) {
    idx = 0;
  } else {
    idx = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
  }
  quote.textContent = `"${MOTIVATION_QUOTES[idx].q}"`;
  author.textContent = `— ${MOTIVATION_QUOTES[idx].a}`;
}

function initQuoteRotator() {
  setInterval(() => rotateQuote(), 30000); // 30s rotate
}

function switchLoggerTab(tab) {
  activeLoggerTab = tab;
  document.getElementById("tab-manual")?.classList.toggle("active", tab === "manual");
  document.getElementById("tab-timer")?.classList.toggle("active", tab === "timer");
  
  document.getElementById("logger-manual-form").style.display = tab === "manual" ? "flex" : "none";
  document.getElementById("logger-timer-form").style.display = tab === "timer" ? "flex" : "none";
}

function logHours() {
  const sub = document.getElementById("log-subject").value;
  const hrs = parseInt(document.getElementById("log-hrs").value) || 0;
  const mins = parseInt(document.getElementById("log-mins").value) || 0;
  
  if (hrs === 0 && mins === 0) {
    toast("⚠️ Please enter a study duration.", "error");
    return;
  }
  
  const total = parseFloat((hrs + mins / 60).toFixed(1));
  recordHours(TODAY_KEY, sub, total);
  
  // Reset
  document.getElementById("log-hrs").value = "";
  document.getElementById("log-mins").value = "";
  
  toast(`Logged ${total} hours of study under ${SUBJECT_KEYS[sub]}`, "success");
  addXP(Math.round(total * 15));
  renderDashboard();
}

function recordHours(date, subject, val) {
  if (!S.hours[date]) S.hours[date] = {};
  if (!S.hours[date][subject]) S.hours[date][subject] = 0;
  S.hours[date][subject] = parseFloat((S.hours[date][subject] + val).toFixed(1));
  
  // Auto check study goal if hours >= 4
  if (dailyHours(TODAY_KEY) >= 4) {
    const chk = document.querySelector("#daily-checklist input[data-key='daily-hours']");
    if (chk && !chk.checked) {
      chk.checked = true;
      toggleDaily(chk);
    }
  }
  save();
}

function dailyHours(date) {
  if (!S.hours[date]) return 0;
  return Object.values(S.hours[date]).reduce((a, b) => a + b, 0);
}

function weeklyHours() {
  let sum = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    sum += dailyHours(key);
  }
  return parseFloat(sum.toFixed(1));
}

function totalHours() {
  let sum = 0;
  Object.keys(S.hours).forEach(d => {
    sum += Object.values(S.hours[d]).reduce((a, b) => a + b, 0);
  });
  return parseFloat(sum.toFixed(1));
}

function toggleDaily(checkbox) {
  const key = checkbox.dataset.key;
  S.dailyChecks[key] = checkbox.checked;
  
  if (checkbox.checked) {
    addXP(10);
    toast("+10 XP for Daily Consistency", "success");
  } else {
    addXP(-10);
  }
  save();
  updateDailyProgressMeter();
}

function updateDailyProgressMeter() {
  const checks = document.querySelectorAll("#daily-checklist input[type='checkbox']");
  const done = Array.from(checks).filter(c => c.checked).length;
  const total = checks.length;
  
  const lbl = document.getElementById("daily-pct-label");
  const fill = document.getElementById("daily-fill");
  
  if (lbl) lbl.textContent = `${done} / ${total} done`;
  if (fill) fill.style.width = `${(done / total) * 100}%`;
}

function renderAchievementsBadges() {
  const grid = document.getElementById("badges-grid");
  if (!grid) return;
  
  grid.innerHTML = "";
  BADGES.forEach(b => {
    const unlocked = b.check();
    const div = document.createElement("div");
    div.className = `badge-item ${unlocked ? 'unlocked' : 'locked'}`;
    div.title = b.desc;
    div.innerHTML = `
      <div class="badge-icon" style="font-size:26px; filter:${unlocked ? 'none' : 'grayscale(100%) brightness(0.6)'}">${b.icon}</div>
      <div class="badge-label" style="font-size:10px; font-weight:700; margin-top:4px; opacity:${unlocked ? 1 : 0.5}">${b.label}</div>
    `;
    grid.appendChild(div);
  });
}

function renderDashboardMiniTasks() {
  const container = document.getElementById("dash-tasks");
  if (!container) return;
  
  container.innerHTML = "";
  const pending = S.tasks.filter(t => t.status !== "Completed").slice(0, 3);
  if (pending.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--text3); padding:10px 0;">No pending tasks. You are all set!</div>`;
    return;
  }
  
  pending.forEach(t => {
    const div = document.createElement("div");
    div.className = `mini-list-item`;
    div.style.borderLeft = `3px solid ${t.priority === 'High' ? 'var(--hard)' : t.priority === 'Medium' ? 'var(--med)' : 'var(--easy)'}`;
    div.innerHTML = `
      <div style="font-weight:600; font-size:12.5px;">${t.title}</div>
      <div style="font-size:10px; color:var(--text2); display:flex; justify-content:space-between; margin-top:2px;">
        <span>${SUBJECT_KEYS[t.subject] || t.subject}</span>
        <span>Due: ${t.deadline}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderDashboardMiniRevisions() {
  const container = document.getElementById("dash-revisions");
  if (!container) return;
  
  container.innerHTML = "";
  const today = TODAY_KEY;
  const due = S.revisions.filter(r => !r.completed && r.nextDueDate <= today);
  
  if (due.length === 0) {
    container.innerHTML = `<div style="font-size:12px; color:var(--text3); padding:10px 0;">No revisions due today. Keep it up!</div>`;
    return;
  }
  
  due.slice(0, 3).forEach(r => {
    const div = document.createElement("div");
    div.className = "mini-list-item";
    div.innerHTML = `
      <div style="font-weight:600; font-size:12.5px;">${r.topic}</div>
      <div style="font-size:10px; color:var(--text2); display:flex; justify-content:space-between; margin-top:2px;">
        <span>${SUBJECT_KEYS[r.subject] || r.subject}</span>
        <span style="color:var(--accent3); font-weight:700;">Leitner Level ${r.level}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// ── 6. MODULE: SYLLABUS TRACKER ──

function initSyllabusTracker() {
  const sel = document.getElementById("elective-selector");
  if (sel) sel.value = S.elective;
  buildElectiveSyllabus();
}

function changeElective(val) {
  S.elective = val;
  save();
  buildElectiveSyllabus();
  renderSyllabus();
  toast(`Elective updated to Paper ${val}`, "info");
}

function syllabusCompletionPct() {
  let totalChapters = 0;
  let completedChapters = 0;
  
  Object.keys(CMA_SYLLABUS).forEach(groupKey => {
    CMA_SYLLABUS[groupKey].forEach(subj => {
      subj.modules.forEach(mod => {
        mod.chapters.forEach((ch, idx) => {
          totalChapters++;
          const chKey = `${subj.id}.${mod.name}.${ch}`;
          if (S.syllabus[chKey]) completedChapters++;
        });
      });
    });
  });
  
  if (totalChapters === 0) return 0;
  return (completedChapters / totalChapters) * 100;
}

function subjectCompletionPct(subjId) {
  let total = 0;
  let done = 0;
  
  // Find subject in syllabus
  let subjObj = null;
  Object.keys(CMA_SYLLABUS).forEach(g => {
    const match = CMA_SYLLABUS[g].find(s => s.id === subjId);
    if (match) subjObj = match;
  });
  
  if (!subjObj) return 0;
  
  subjObj.modules.forEach(mod => {
    mod.chapters.forEach(ch => {
      total++;
      const chKey = `${subjId}.${mod.name}.${ch}`;
      if (S.syllabus[chKey]) done++;
    });
  });
  
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function renderSyllabus() {
  renderSyllabusGroup("Group3", "group3-subjects");
  renderSyllabusGroup("Group4", "group4-subjects");
  
  const overall = Math.round(syllabusCompletionPct());
  const display = document.getElementById("syllabus-completion-summary");
  if (display) display.textContent = `${overall}%`;
  
  // Check achievements
  checkUnlockedBadges();
}

function renderSyllabusGroup(groupKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = "";
  CMA_SYLLABUS[groupKey].forEach(subj => {
    const pct = subjectCompletionPct(subj.id);
    
    const div = document.createElement("div");
    div.className = "subject-collapse-container";
    div.innerHTML = `
      <div class="subject-collapse-header" onclick="toggleSyllabusSubjectCollapse('${subj.id}')">
        <div>
          <span style="font-weight:700; font-size:14px; color:var(--text);">${subj.title}</span>
          <span style="font-size:10px; color:var(--text2); margin-left:12px;">${Object.values(subj.weightage).join(' · ')}</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-weight:700; font-size:13px; color:var(--accent2);">${pct}%</span>
          <div class="mini-bar" style="width:60px;"><div class="mini-fill" style="width:${pct}%; background:var(--accent2);"></div></div>
          <i class="fas fa-chevron-down" id="arrow-${subj.id}" style="transition:transform 0.2s;"></i>
        </div>
      </div>
      <div class="subject-collapse-content" id="content-${subj.id}">
        <!-- Modules load here -->
      </div>
    `;
    container.appendChild(div);
    
    // Render modules of this subject
    const contentBox = div.querySelector(`#content-${subj.id}`);
    subj.modules.forEach((mod, modIdx) => {
      const modDiv = document.createElement("div");
      modDiv.className = "module-row";
      
      let chaptersHTML = "";
      mod.chapters.forEach((ch, chIdx) => {
        const chKey = `${subj.id}.${mod.name}.${ch}`;
        const checked = !!S.syllabus[chKey];
        chaptersHTML += `
          <label class="chapter-checkbox-item">
            <input type="checkbox" data-key="${chKey}" onchange="toggleSyllabusChapter(this, '${subj.id}')" ${checked ? 'checked' : ''}/>
            <span>${ch}</span>
          </label>
        `;
      });
      
      modDiv.innerHTML = `
        <div class="module-title">${mod.name}</div>
        <div style="display:flex; flex-direction:column; gap:4px; padding-left:10px;">
          ${chaptersHTML}
        </div>
      `;
      contentBox.appendChild(modDiv);
    });
  });
}

function toggleSyllabusSubjectCollapse(id) {
  const box = document.getElementById(`content-${id}`);
  const arrow = document.getElementById(`arrow-${id}`);
  if (!box) return;
  
  const open = box.classList.toggle("open");
  if (arrow) arrow.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
}

function toggleSyllabusChapter(checkbox, subjId) {
  const key = checkbox.dataset.key;
  S.syllabus[key] = checkbox.checked;
  
  if (checkbox.checked) {
    addXP(15);
    toast("+15 XP for completing syllabus topic", "success");
    
    // Auto check daily checklist 'daily-syllabus'
    const dChk = document.querySelector("#daily-checklist input[data-key='daily-syllabus']");
    if (dChk && !dChk.checked) {
      dChk.checked = true;
      toggleDaily(dChk);
    }
  } else {
    addXP(-15);
  }
  save();
  
  // Re-render subject completion indicators
  renderSyllabus();
}

// ── 7. MODULE: STUDY PLANNER & CALENDAR ──

function initCalendar() {
  calendarCurrentDate = new Date();
}

function addGoal() {
  const title = document.getElementById("goal-title").value.trim();
  const type = document.getElementById("goal-type").value;
  const date = document.getElementById("goal-date").value;
  const subject = document.getElementById("goal-subject").value;
  
  if (!title) {
    toast("⚠️ Please enter a goal description.", "error");
    return;
  }
  if (!date) {
    toast("⚠️ Please pick a target date.", "error");
    return;
  }
  
  const goal = {
    id: "g_" + Date.now(),
    title,
    type,
    date,
    subject,
    completed: false
  };
  
  S.goals.push(goal);
  save();
  
  // Reset fields
  document.getElementById("goal-title").value = "";
  document.getElementById("goal-date").value = "";
  
  toast("Goal scheduled successfully!", "success");
  renderPlannerGoals();
  renderCalendar();
  renderDashboard();
}

function toggleGoalCompletion(id) {
  const goal = S.goals.find(g => g.id === id);
  if (!goal) return;
  
  goal.completed = !goal.completed;
  if (goal.completed) {
    addXP(20);
    toast("Goal completed! +20 XP awarded.", "success");
  } else {
    addXP(-20);
  }
  save();
  renderPlannerGoals();
  renderCalendar();
}

function deleteGoal(id) {
  S.goals = S.goals.filter(g => g.id !== id);
  save();
  renderPlannerGoals();
  renderCalendar();
}

function switchGoalTab(tab) {
  activeGoalTab = tab;
  document.getElementById("tab-goal-active")?.classList.toggle("active", tab === "active");
  document.getElementById("tab-goal-completed")?.classList.toggle("active", tab === "completed");
  renderPlannerGoals();
}

function renderPlannerGoals() {
  const container = document.getElementById("planner-goals-list");
  if (!container) return;
  
  container.innerHTML = "";
  
  const filtered = S.goals.filter(g => activeGoalTab === 'completed' ? g.completed : !g.completed);
  if (filtered.length === 0) {
    container.innerHTML = `<div style="font-size:13px; color:var(--text3); padding:20px; text-align:center;">No goals found in this tab. Set one to start.</div>`;
    return;
  }
  
  filtered.sort((a,b) => new Date(a.date) - new Date(b.date)).forEach(g => {
    const div = document.createElement("div");
    div.className = "goal-item";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";
    div.style.padding = "10px 12px";
    div.style.background = "var(--bg2)";
    div.style.border = "1px solid var(--border)";
    div.style.borderRadius = "8px";
    div.style.marginBottom = "8px";
    div.style.gap = "10px";
    
    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;">
        <input type="checkbox" onchange="toggleGoalCompletion('${g.id}')" ${g.completed ? 'checked' : ''}/>
        <div style="min-width:0; flex:1;">
          <div style="font-size:13px; font-weight:600; text-decoration:${g.completed ? 'line-through' : 'none'}; color:${g.completed ? 'var(--text3)' : 'var(--text)'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${g.title}">${g.title}</div>
          <div style="font-size:10px; color:var(--text2); margin-top:2px;">
            <span class="note-tag-pill" style="text-transform:uppercase;">${g.type}</span> · 
            <span>${SUBJECT_KEYS[g.subject] || g.subject}</span> · 
            <span>Due: ${g.date}</span>
          </div>
        </div>
      </div>
      <button class="btn btn-sm" onclick="deleteGoal('${g.id}')" style="padding:4px 8px; color:var(--accent3); background:transparent; border:none;"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
  });
}

function navigateCalendar(dir) {
  calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + dir);
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById("calendar-days-grid");
  const monthYearLabel = document.getElementById("calendar-month-year");
  if (!grid || !monthYearLabel) return;
  
  grid.innerHTML = "";
  
  const year = calendarCurrentDate.getFullYear();
  const month = calendarCurrentDate.getMonth();
  
  monthYearLabel.textContent = calendarCurrentDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  
  // Get first day and number of days in month
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  
  // Previous month padding
  const prevMonthTotalDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const div = document.createElement("div");
    div.className = "calendar-cell inactive";
    div.innerHTML = `<span class="cell-day-num">${prevMonthTotalDays - i}</span>`;
    grid.appendChild(div);
  }
  
  // Current month days
  const todayKey = new Date().toISOString().slice(0, 10);
  for (let d = 1; d <= totalDays; d++) {
    const div = document.createElement("div");
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const cellDateKey = `${year}-${monthStr}-${dayStr}`;
    
    const isToday = cellDateKey === todayKey;
    div.className = `calendar-cell ${isToday ? 'today' : ''}`;
    
    // Add cell number
    let eventsHTML = "";
    
    // Get calendar goals and tasks due this day
    const dayGoals = S.goals.filter(g => g.date === cellDateKey);
    dayGoals.forEach(g => {
      const displayTitle = g.title.length > 18 ? g.title.substring(0, 16) + "..." : g.title;
      eventsHTML += `<span class="calendar-event-badge ${g.type}" title="${g.title}">${displayTitle}</span>`;
    });
    
    const dayTasks = S.tasks.filter(t => t.deadline === cellDateKey && t.status !== "Completed");
    dayTasks.forEach(t => {
      const displayTitle = t.title.length > 18 ? t.title.substring(0, 16) + "..." : t.title;
      eventsHTML += `<span class="calendar-event-badge exam" title="TASK: ${t.title}">⚠️ ${displayTitle}</span>`;
    });
    
    div.innerHTML = `
      <span class="cell-day-num">${d}</span>
      <div class="cell-events">${eventsHTML}</div>
    `;
    grid.appendChild(div);
  }
}

// ── 8. MODULE: FOCUS TIMER (POMODORO) ──

let pomoMinutes = 25;
let pomoSeconds = 0;
let pomoInterval = null;
let pomoRunning = false;
let pomoMode = "study"; // study, short, long
let pomoTimeTotalLength = 25 * 60;

function loadTimerState() {
  const select = document.getElementById("pomo-subject");
  if (select) {
    // Populate subjects
    initLoggerSubjectDropdowns();
  }
}

function setPomoMode(mode) {
  pomoMode = mode;
  pomoRunning = false;
  clearInterval(pomoInterval);
  pomoInterval = null;
  
  document.querySelectorAll("#pomo-tabs button").forEach(b => {
    b.classList.remove("active");
  });
  
  let mins = 25;
  if (mode === "study") {
    mins = 25;
    document.querySelector("#pomo-tabs button[onclick*='study']")?.classList.add("active");
  } else if (mode === "short") {
    mins = 5;
    document.querySelector("#pomo-tabs button[onclick*='short']")?.classList.add("active");
  } else if (mode === "long") {
    mins = 15;
    document.querySelector("#pomo-tabs button[onclick*='long']")?.classList.add("active");
  }
  
  pomoMinutes = mins;
  pomoSeconds = 0;
  pomoTimeTotalLength = mins * 60;
  
  updatePomoDisplay();
  const playBtn = document.getElementById("pomo-start-btn");
  if (playBtn) playBtn.innerHTML = `<i class="fas fa-play"></i> Start Focus`;
}

function updatePomoDisplay() {
  const display = document.getElementById("pomo-time-display");
  if (display) {
    const minsStr = String(pomoMinutes).padStart(2, '0');
    const secsStr = String(pomoSeconds).padStart(2, '0');
    display.textContent = `${minsStr}:${secsStr}`;
  }
  
  // Progress ring calculation
  const ring = document.getElementById("pomo-progress-ring");
  if (ring) {
    const elapsed = pomoTimeTotalLength - (pomoMinutes * 60 + pomoSeconds);
    const pct = elapsed / pomoTimeTotalLength;
    const totalLength = 282.7;
    const offset = totalLength - pct * totalLength;
    ring.style.strokeDashoffset = offset;
  }
}

function togglePomo() {
  const btn = document.getElementById("pomo-start-btn");
  if (!btn) return;
  
  if (pomoRunning) {
    // Pause
    pomoRunning = false;
    clearInterval(pomoInterval);
    pomoInterval = null;
    btn.innerHTML = `<i class="fas fa-play"></i> Resume`;
  } else {
    // Start
    pomoRunning = true;
    btn.innerHTML = `<i class="fas fa-pause"></i> Pause`;
    pomoInterval = setInterval(() => {
      if (pomoSeconds === 0) {
        if (pomoMinutes === 0) {
          // Timer finished!
          clearInterval(pomoInterval);
          pomoInterval = null;
          pomoRunning = false;
          handlePomoFinished();
          return;
        }
        pomoMinutes--;
        pomoSeconds = 59;
      } else {
        pomoSeconds--;
      }
      updatePomoDisplay();
    }, 1000);
  }
}

function resetPomo() {
  setPomoMode(pomoMode);
}

function handlePomoFinished() {
  // Play alarm sound
  const alarm = document.getElementById("alarm-audio");
  if (alarm) alarm.play();
  
  toast(`⏰ Timer finished: ${pomoMode.toUpperCase()} session complete!`, "success");
  
  if (pomoMode === "study") {
    const subj = document.getElementById("pomo-subject").value;
    const hoursEarned = parseFloat((25 / 60).toFixed(2));
    
    // Log Pomodoro record
    S.pomoHistory.push({
      id: "p_" + Date.now(),
      timestamp: Date.now(),
      duration: 25,
      subject: subj,
      type: "study"
    });
    
    recordHours(TODAY_KEY, subj, hoursEarned);
    addXP(10);
    save();
    
    renderPomoHistory();
    renderDashboard();
  }
  
  // Set next logic state
  if (pomoMode === "study") {
    setPomoMode("short");
  } else {
    setPomoMode("study");
  }
}

function renderPomoHistory() {
  const container = document.getElementById("pomo-history-list");
  if (!container) return;
  
  container.innerHTML = "";
  if (S.pomoHistory.length === 0) {
    container.innerHTML = `<div style="font-size:13px; color:var(--text3); padding:20px; text-align:center;">No completed study sessions yet. Focus up!</div>`;
    return;
  }
  
  // Render in reverse order
  [...S.pomoHistory].reverse().slice(0, 10).forEach(h => {
    const div = document.createElement("div");
    div.className = "mini-list-item";
    const dateStr = new Date(h.timestamp).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <div style="font-weight:600; font-size:13px;">💻 Study Focus Completed</div>
      <div style="font-size:10px; color:var(--text2); display:flex; justify-content:space-between; margin-top:2px;">
        <span>${SUBJECT_KEYS[h.subject] || h.subject} · ${h.duration} mins</span>
        <span>At: ${dateStr}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// Live timer stopwatch code
let swInterval = null;
let swSecs = 0;
let swRunning = false;

function toggleStopwatch() {
  const btn = document.getElementById("sw-start-btn");
  const stopBtn = document.getElementById("sw-stop-btn");
  if (!btn || !stopBtn) return;
  
  if (swRunning) {
    // Pause
    swRunning = false;
    clearInterval(swInterval);
    swInterval = null;
    btn.innerHTML = `<i class="fas fa-play"></i> Resume`;
  } else {
    // Start
    swRunning = true;
    btn.innerHTML = `<i class="fas fa-pause"></i> Pause`;
    stopBtn.disabled = false;
    stopBtn.style.opacity = 1;
    stopBtn.style.cursor = "pointer";
    
    swInterval = setInterval(() => {
      swSecs++;
      updateStopwatchDisplay();
    }, 1000);
  }
}

function updateStopwatchDisplay() {
  const display = document.getElementById("stopwatch-display");
  if (!display) return;
  
  const hrs = Math.floor(swSecs / 3600);
  const mins = Math.floor((swSecs % 3600) / 60);
  const secs = swSecs % 60;
  
  display.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function stopStopwatch() {
  clearInterval(swInterval);
  swInterval = null;
  swRunning = false;
  
  const durationHrs = parseFloat((swSecs / 3600).toFixed(2));
  const sub = document.getElementById("timer-subject").value;
  
  if (durationHrs >= 0.05) {
    recordHours(TODAY_KEY, sub, durationHrs);
    addXP(Math.round(durationHrs * 15));
    save();
    
    S.pomoHistory.push({
      id: "p_" + Date.now(),
      timestamp: Date.now(),
      duration: Math.round(swSecs / 60),
      subject: sub,
      type: "stopwatch"
    });
    save();
    
    toast(`Logged ${durationHrs} hours of study under ${SUBJECT_KEYS[sub]}`, "success");
    renderDashboard();
    renderPomoHistory();
  } else {
    toast("⚠️ Session too short to log (minimum 3 minutes needed).", "info");
  }
  
  // Reset
  swSecs = 0;
  updateStopwatchDisplay();
  
  const startBtn = document.getElementById("sw-start-btn");
  const stopBtn = document.getElementById("sw-stop-btn");
  if (startBtn) startBtn.innerHTML = `<i class="fas fa-play"></i> Start`;
  if (stopBtn) {
    stopBtn.disabled = true;
    stopBtn.style.opacity = 0.5;
    stopBtn.style.cursor = "not-allowed";
  }
}

function playAmbientSound(type) {
  // Stop all sounds
  document.getElementById("ambient-audio-rain")?.pause();
  document.getElementById("ambient-audio-beats")?.pause();
  document.getElementById("ambient-audio-white")?.pause();
  
  if (type === "none") return;
  const audio = document.getElementById(`ambient-audio-${type}`);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Ambient audio play failed, needs user click."));
  }
}

// ── 9. MODULE: DIGITAL NOTES ──

function initNotesFolders() {
  renderNotesFoldersList();
}

function initNotesList() {
  renderNotesList();
}

function renderNotesFoldersList() {
  const container = document.getElementById("notes-folders-list");
  const select = document.getElementById("note-folder-select");
  if (!container) return;
  
  container.innerHTML = "";
  if (select) select.innerHTML = "";
  
  S.folders.forEach(f => {
    const div = document.createElement("div");
    div.className = "note-folder-item";
    div.innerHTML = `<span><i class="fas fa-folder"></i> ${f}</span>`;
    div.onclick = () => selectFolder(f, div);
    container.appendChild(div);
    
    if (select) {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      select.appendChild(opt);
    }
  });
}

let activeNotesFolder = null;

function selectFolder(folder, elem) {
  document.querySelectorAll(".note-folder-item").forEach(item => item.classList.remove("active"));
  elem?.classList.add("active");
  
  activeNotesFolder = folder;
  renderNotesList();
}

function promptCreateFolder() {
  const name = prompt("Enter folder name:");
  if (name && name.trim()) {
    const cleaned = name.trim();
    if (S.folders.includes(cleaned)) {
      toast("⚠️ Folder already exists.", "error");
      return;
    }
    S.folders.push(cleaned);
    save();
    renderNotesFoldersList();
    toast(`Folder '${cleaned}' created!`, "success");
  }
}

function createNewNote() {
  const note = {
    id: "n_" + Date.now(),
    folder: activeNotesFolder || S.folders[0],
    title: "Untitled Note",
    content: "",
    tags: "",
    updatedAt: Date.now()
  };
  S.notes.push(note);
  S.activeNoteId = note.id;
  save();
  
  initNotesList();
  openNoteEditor(note.id);
}

function renderNotesList() {
  const container = document.getElementById("notes-list-container");
  if (!container) return;
  
  container.innerHTML = "";
  const query = document.getElementById("note-search")?.value.trim().toLowerCase() || "";
  
  const filtered = S.notes.filter(n => {
    const folderMatch = !activeNotesFolder || n.folder === activeNotesFolder;
    const searchMatch = !query || n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query) || n.tags.toLowerCase().includes(query);
    return folderMatch && searchMatch;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = `<div style="font-size:11px; text-align:center; padding:12px; color:var(--text3);">No notes found</div>`;
    return;
  }
  
  filtered.sort((a,b) => b.updatedAt - a.updatedAt).forEach(n => {
    const div = document.createElement("div");
    div.className = `note-list-item ${S.activeNoteId === n.id ? 'active' : ''}`;
    div.onclick = () => openNoteEditor(n.id);
    
    let tagsHTML = "";
    if (n.tags) {
      n.tags.split(",").forEach(t => {
        if (t.trim()) tagsHTML += `<span class="note-tag-pill">${t.trim()}</span>`;
      });
    }
    
    div.innerHTML = `
      <div class="note-list-item-title">${n.title || "Untitled Note"}</div>
      <div class="note-list-item-meta">
        <span style="font-size:9.5px; opacity:0.6;">${n.folder}</span>
        <div style="display:flex; gap:2px;">${tagsHTML}</div>
      </div>
    `;
    container.appendChild(div);
  });
}

function openNoteEditor(id) {
  S.activeNoteId = id;
  const note = S.notes.find(n => n.id === id);
  if (!note) return;
  
  document.getElementById("note-editor-empty").style.display = "none";
  const editor = document.getElementById("note-editor-active");
  editor.style.display = "flex";
  
  document.getElementById("note-title").value = note.title;
  document.getElementById("note-folder-select").value = note.folder;
  document.getElementById("note-tags").value = note.tags || "";
  document.getElementById("note-content").value = note.content || "";
  
  // Active highlight note lists
  document.querySelectorAll(".note-list-item").forEach(item => item.classList.remove("active"));
  
  updateWordCount();
  save();
}

function updateActiveNote() {
  if (!S.activeNoteId) return;
  const note = S.notes.find(n => n.id === S.activeNoteId);
  if (!note) return;
  
  note.title = document.getElementById("note-title").value || "Untitled Note";
  note.folder = document.getElementById("note-folder-select").value;
  note.tags = document.getElementById("note-tags").value;
  note.content = document.getElementById("note-content").value;
  note.updatedAt = Date.now();
  
  save();
  
  // Refresh note list without fully closing editor
  renderNotesList();
  updateWordCount();
  
  const status = document.getElementById("note-save-status");
  if (status) {
    status.textContent = "Auto-saving...";
    setTimeout(() => {
      status.textContent = "Saved locally";
    }, 800);
  }
}

function updateWordCount() {
  const content = document.getElementById("note-content")?.value || "";
  const count = content.trim() ? content.trim().split(/\s+/).length : 0;
  const elem = document.getElementById("note-word-count");
  if (elem) elem.textContent = `Words: ${count}`;
}

function deleteActiveNote() {
  if (!S.activeNoteId) return;
  if (confirm("Are you sure you want to delete this note?")) {
    S.notes = S.notes.filter(n => n.id !== S.activeNoteId);
    S.activeNoteId = null;
    save();
    
    document.getElementById("note-editor-active").style.display = "none";
    document.getElementById("note-editor-empty").style.display = "flex";
    
    initNotesList();
    toast("Note deleted successfully.", "info");
  }
}

function clearNotesSearch() {
  const search = document.getElementById("note-search");
  if (search) search.value = "";
  initNotesList();
}

// ── 10. MODULE: REVISION HUB (SPACED REPETITION) ──

function addRevisionTopic() {
  const topic = document.getElementById("rev-topic").value.trim();
  const subject = document.getElementById("rev-subject").value;
  const schedule = document.getElementById("rev-schedule").value;
  
  if (!topic) {
    toast("⚠️ Please enter a topic to revise.", "error");
    return;
  }
  
  const intervals = schedule.split("-").map(Number);
  const nextDays = intervals[0] || 1;
  
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + nextDays);
  
  const rev = {
    id: "r_" + Date.now(),
    topic,
    subject,
    schedule,
    dateScheduled: TODAY_KEY,
    lastRevisionDate: null,
    nextDueDate: nextDue.toISOString().slice(0, 10),
    level: 1,
    completed: false
  };
  
  S.revisions.push(rev);
  save();
  
  // Clear field
  document.getElementById("rev-topic").value = "";
  
  toast(`Topic scheduled for first revision on ${rev.nextDueDate}`, "success");
  renderRevisionQueue();
  renderDashboard();
}

function handleRevisionPass(id) {
  const rev = S.revisions.find(r => r.id === id);
  if (!rev) return;
  
  const intervals = rev.schedule.split("-").map(Number);
  
  // Level up in spaced repetition queue
  rev.level++;
  rev.lastRevisionDate = TODAY_KEY;
  
  if (rev.level > intervals.length) {
    // Spaced repetition complete!
    rev.completed = true;
    addXP(40);
    toast(`🎉 Spaced Repetition Complete for: ${rev.topic}! +40 XP`, "success");
  } else {
    const gap = intervals[rev.level - 1] || 7;
    const next = new Date();
    next.setDate(next.getDate() + gap);
    rev.nextDueDate = next.toISOString().slice(0, 10);
    
    addXP(15);
    toast(`Revision Pass! Next session scheduled in ${gap} days.`, "success");
  }
  
  // Mark consistency checklist
  const revChk = document.querySelector("#daily-checklist input[data-key='daily-revision']");
  if (revChk && !revChk.checked) {
    revChk.checked = true;
    toggleDaily(revChk);
  }
  
  save();
  renderRevisionQueue();
  renderDashboard();
}

function handleRevisionReset(id) {
  const rev = S.revisions.find(r => r.id === id);
  if (!rev) return;
  
  // Reset level to 1
  rev.level = 1;
  rev.lastRevisionDate = TODAY_KEY;
  
  const intervals = rev.schedule.split("-").map(Number);
  const gap = intervals[0] || 1;
  
  const next = new Date();
  next.setDate(next.getDate() + gap);
  rev.nextDueDate = next.toISOString().slice(0, 10);
  
  toast("Revision reset. Added back to tomorrow's list.", "info");
  
  save();
  renderRevisionQueue();
  renderDashboard();
}

function deleteRevision(id) {
  S.revisions = S.revisions.filter(r => r.id !== id);
  save();
  renderRevisionQueue();
  renderDashboard();
}

function filterRevision(type, elem) {
  activeRevisionFilter = type;
  document.querySelectorAll("#rev-filter-chips .chip").forEach(c => c.classList.remove("active"));
  elem?.classList.add("active");
  renderRevisionQueue();
}

function renderRevisionQueue() {
  const tbody = document.getElementById("revision-queue-tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  const today = TODAY_KEY;
  let filtered = S.revisions;
  
  if (activeRevisionFilter === "due") {
    filtered = S.revisions.filter(r => !r.completed && r.nextDueDate <= today);
  } else if (activeRevisionFilter === "upcoming") {
    filtered = S.revisions.filter(r => !r.completed && r.nextDueDate > today);
  } else if (activeRevisionFilter === "completed") {
    filtered = S.revisions.filter(r => r.completed);
  }
  
  // Set counters
  const dueCount = S.revisions.filter(r => !r.completed && r.nextDueDate <= today).length;
  const activeCount = S.revisions.filter(r => !r.completed).length;
  const doneCount = S.revisions.filter(r => r.completed).length;
  
  document.getElementById("rev-count-due").textContent = dueCount;
  document.getElementById("rev-count-active").textContent = activeCount;
  document.getElementById("rev-count-done").textContent = doneCount;
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text3);">No topics in this queue.</td></tr>`;
    return;
  }
  
  filtered.sort((a,b) => new Date(a.nextDueDate) - new Date(b.nextDueDate)).forEach(r => {
    const isDue = !r.completed && r.nextDueDate <= today;
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";
    tr.style.background = isDue ? "rgba(255, 107, 107, 0.02)" : "transparent";
    
    tr.innerHTML = `
      <td style="padding:12px 8px; font-weight:600; color:${r.completed ? 'var(--text3)' : 'var(--text)'};">${r.topic}</td>
      <td style="padding:12px 8px; font-size:12px; color:var(--accent2);">${SUBJECT_KEYS[r.subject] || r.subject}</td>
      <td style="padding:12px 8px;">
        <span class="note-tag-pill" style="background:${r.completed ? 'var(--bg3)' : 'var(--border2)'}; color:${r.completed ? 'var(--text3)' : 'var(--text)'};">
          ${r.completed ? 'Finished' : `Lvl ${r.level}`}
        </span>
      </td>
      <td style="padding:12px 8px; color:${isDue ? 'var(--accent3)' : 'var(--text2)'}; font-weight:${isDue ? '700' : 'normal'};">
        ${r.completed ? '✓ Done' : isDue ? '⚠️ Due Today' : r.nextDueDate}
      </td>
      <td style="padding:12px 8px; font-size:11.5px; color:var(--text2);">${r.lastRevisionDate || 'None'}</td>
      <td style="padding:12px 8px; text-align:right;">
        <div style="display:flex; gap:6px; justify-content:flex-end;">
          ${!r.completed ? `
            <button class="btn btn-sm" onclick="handleRevisionPass('${r.id}')" style="background:rgba(0, 212, 170, 0.12); color:var(--accent2); border:1px solid rgba(0,212,170,0.2);">Pass</button>
            <button class="btn btn-sm" onclick="handleRevisionReset('${r.id}')" style="background:rgba(255, 107, 107, 0.08); color:var(--accent3); border:1px solid rgba(255,107,107,0.15);">Reset</button>
          ` : ''}
          <button class="btn btn-sm" onclick="deleteRevision('${r.id}')" style="padding:4px 8px; color:var(--text3);"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── 11. MODULE: QUIZ ARENA ──

let activeQuizList = [];
let currentQuizIdx = 0;
let quizScore = 0;
let quizSubject = "ALL";
let quizTimeStart = 0;
let quizTimerInterval = null;
let quizWeakTopics = [];

function showQuizSetup() {
  document.getElementById("quiz-setup-panel").style.display = "block";
  document.getElementById("quiz-active-panel").style.display = "none";
  document.getElementById("quiz-results-panel").style.display = "none";
}

function startQuiz() {
  const subSelect = document.getElementById("quiz-subject-select").value;
  const countSelect = parseInt(document.getElementById("quiz-count-select").value) || 5;
  
  quizSubject = subSelect;
  
  // Filter questions
  let bank = PREPOPULATED_MCQS;
  if (subSelect !== "ALL") {
    bank = PREPOPULATED_MCQS.filter(q => q.subject === subSelect);
  }
  
  if (bank.length === 0) {
    toast("⚠️ No questions preloaded for this specific subject yet. Try 'All Subjects Mix'!", "error");
    return;
  }
  
  // Shuffle and slice
  activeQuizList = [...bank].sort(() => 0.5 - Math.random()).slice(0, countSelect);
  currentQuizIdx = 0;
  quizScore = 0;
  quizWeakTopics = [];
  
  document.getElementById("quiz-setup-panel").style.display = "none";
  document.getElementById("quiz-active-panel").style.display = "block";
  
  // Start timer
  quizTimeStart = Date.now();
  updateQuizTimer();
  quizTimerInterval = setInterval(updateQuizTimer, 1000);
  
  loadQuizQuestion();
}

function updateQuizTimer() {
  const elapsed = Math.round((Date.now() - quizTimeStart) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const display = document.getElementById("quiz-timer-display");
  if (display) display.textContent = `Time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function loadQuizQuestion() {
  const q = activeQuizList[currentQuizIdx];
  if (!q) return;
  
  document.getElementById("quiz-progress-text").textContent = `Question ${currentQuizIdx + 1} of ${activeQuizList.length}`;
  document.getElementById("quiz-question").textContent = q.question;
  
  const optionsBox = document.getElementById("quiz-options");
  optionsBox.innerHTML = "";
  
  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.textContent = opt;
    btn.onclick = () => gradeQuizAnswer(idx, btn);
    optionsBox.appendChild(btn);
  });
  
  document.getElementById("quiz-feedback").style.display = "none";
  const nextBtn = document.getElementById("quiz-next-btn");
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = currentQuizIdx === activeQuizList.length - 1 ? "Finish Test" : "Next Question";
  }
}

function gradeQuizAnswer(idx, selectedBtn) {
  const q = activeQuizList[currentQuizIdx];
  const nextBtn = document.getElementById("quiz-next-btn");
  if (!q || !nextBtn) return;
  
  // Disable all options
  document.querySelectorAll(".quiz-opt-btn").forEach((btn, bIdx) => {
    btn.disabled = true;
    if (bIdx === q.correct) {
      btn.classList.add("correct");
    }
  });
  
  const feedback = document.getElementById("quiz-feedback");
  feedback.style.display = "block";
  
  if (idx === q.correct) {
    quizScore++;
    feedback.className = "quiz-feedback-box correct";
    feedback.innerHTML = `<strong>🟢 Correct Answer!</strong><br/>${q.explanation}`;
    toast("Correct! +5 XP earned.", "success");
    addXP(5);
  } else {
    selectedBtn.classList.add("incorrect");
    feedback.className = "quiz-feedback-box incorrect";
    feedback.innerHTML = `<strong>🔴 Incorrect Answer.</strong><br/>${q.explanation}`;
    
    // Log weak topic
    const subName = SUBJECT_KEYS[q.subject] || q.subject;
    if (!quizWeakTopics.includes(subName)) {
      quizWeakTopics.push(subName);
    }
  }
  
  nextBtn.disabled = false;
}

function nextQuizQuestion() {
  if (currentQuizIdx === activeQuizList.length - 1) {
    // Finish Quiz
    finishQuiz();
  } else {
    currentQuizIdx++;
    loadQuizQuestion();
  }
}

function finishQuiz() {
  clearInterval(quizTimerInterval);
  quizTimerInterval = null;
  
  document.getElementById("quiz-active-panel").style.display = "none";
  document.getElementById("quiz-results-panel").style.display = "block";
  
  const scorePercent = Math.round((quizScore / activeQuizList.length) * 100);
  const scoreDisp = document.getElementById("result-score");
  if (scoreDisp) scoreDisp.textContent = `${quizScore} / ${activeQuizList.length} (${scorePercent}%)`;
  
  const greetDisp = document.getElementById("result-greeting");
  if (greetDisp) {
    if (scorePercent >= 80) greetDisp.textContent = "🏆 Outstanding Performance!";
    else if (scorePercent >= 50) greetDisp.textContent = "⚡ Good Job! Keep Practice.";
    else greetDisp.textContent = "📚 Need more study. Review weak topics.";
  }
  
  const xpReward = quizScore * 10;
  const xpDisp = document.getElementById("result-xp-reward");
  if (xpDisp) xpDisp.textContent = `+${xpReward} XP Awarded`;
  if (xpReward > 0) addXP(xpReward);
  
  // Weak topics list
  const weakBox = document.getElementById("result-weak-topics");
  if (weakBox) {
    weakBox.innerHTML = "";
    if (quizWeakTopics.length === 0) {
      weakBox.innerHTML = `<li style="color:var(--accent2)">None! Excellent concept accuracy.</li>`;
    } else {
      quizWeakTopics.forEach(t => {
        weakBox.innerHTML += `<li>${t}</li>`;
      });
    }
  }
  
  // Log quiz history
  S.quizLog.push({
    id: "q_" + Date.now(),
    subject: quizSubject,
    score: quizScore,
    total: activeQuizList.length,
    date: TODAY_KEY
  });
  
  // Auto tick consistency checklist daily-quiz
  const qChk = document.querySelector("#daily-checklist input[data-key='daily-quiz']");
  if (qChk && !qChk.checked) {
    qChk.checked = true;
    toggleDaily(qChk);
  }
  
  save();
  renderQuizHistory();
  renderDashboard();
}

function quitQuiz() {
  if (confirm("Are you sure you want to quit the current quiz? Progress will be lost.")) {
    clearInterval(quizTimerInterval);
    quizTimerInterval = null;
    showQuizSetup();
  }
}

function renderQuizHistory() {
  const container = document.getElementById("quiz-history-list");
  if (!container) return;
  
  container.innerHTML = "";
  if (S.quizLog.length === 0) {
    container.innerHTML = `<div style="font-size:13px; color:var(--text3); padding:20px; text-align:center;">No quiz records. Take your first test!</div>`;
    return;
  }
  
  [...S.quizLog].reverse().slice(0, 10).forEach(q => {
    const div = document.createElement("div");
    div.className = "mini-list-item";
    const subName = q.subject === "ALL" ? "Mix Subject Quiz" : SUBJECT_KEYS[q.subject];
    div.innerHTML = `
      <div style="font-weight:600; font-size:13px; display:flex; justify-content:space-between;">
        <span>${subName}</span>
        <span style="color:var(--accent2); font-weight:700;">${q.score}/${q.total}</span>
      </div>
      <div style="font-size:10px; color:var(--text2); display:flex; justify-content:space-between; margin-top:2px;">
        <span>Accuracy: ${Math.round((q.score/q.total)*100)}%</span>
        <span>Date: ${q.date}</span>
      </div>
    `;
    container.appendChild(div);
  });
}

// ── 12. MODULE: FLASHCARD DECK ──

let activeFlashcardIdx = 0;
let flashcardFlipped = false;

function countMasteredFlashcards() {
  return Object.values(S.flashcardMastery).filter(v => v === "mastered").length;
}

function getActiveFlashcardsList() {
  const subFilter = document.getElementById("flash-subject-filter")?.value || "ALL";
  let pool = [...PREPOPULATED_FLASHCARDS, ...S.customFlashcards];
  
  if (subFilter !== "ALL") {
    pool = pool.filter(c => c.subject === subFilter);
  }
  return pool;
}

function renderFlashcards() {
  const list = getActiveFlashcardsList();
  
  // Bound limits
  if (activeFlashcardIdx >= list.length) activeFlashcardIdx = 0;
  if (activeFlashcardIdx < 0) activeFlashcardIdx = Math.max(0, list.length - 1);
  
  const totalLabel = document.getElementById("fc-stats-total");
  const masteredLabel = document.getElementById("fc-stats-mastered");
  const practiceLabel = document.getElementById("fc-stats-practice");
  
  const pool = [...PREPOPULATED_FLASHCARDS, ...S.customFlashcards];
  if (totalLabel) totalLabel.textContent = pool.length;
  if (masteredLabel) masteredLabel.textContent = countMasteredFlashcards();
  if (practiceLabel) {
    const totalM = countMasteredFlashcards();
    practiceLabel.textContent = Math.max(0, pool.length - totalM);
  }
  
  const indexDisplay = document.getElementById("fc-index-display");
  if (indexDisplay) {
    indexDisplay.textContent = list.length === 0 ? "0 of 0" : `${activeFlashcardIdx + 1} of ${list.length}`;
  }
  
  const inner = document.getElementById("flashcard-inner");
  if (inner) {
    inner.classList.remove("flipped");
    flashcardFlipped = false;
  }
  
  if (list.length === 0) {
    document.getElementById("fc-front-text").textContent = "No flashcards found in this subject.";
    document.getElementById("fc-back-text").textContent = "Create custom cards or change filter.";
    document.getElementById("fc-subject").textContent = "";
    return;
  }
  
  const card = list[activeFlashcardIdx];
  document.getElementById("fc-front-text").textContent = card.front;
  document.getElementById("fc-back-text").innerHTML = card.back.replace(/\n/g, "<br/>");
  document.getElementById("fc-subject").textContent = SUBJECT_KEYS[card.subject] || card.subject;
  
  // Highlight mastery status buttons
  const status = S.flashcardMastery[card.id] || "practice";
  const mastBtn = document.getElementById("fc-mastered-btn");
  const practiceBtn = document.getElementById("fc-need-practice-btn");
  
  if (mastBtn) mastBtn.style.opacity = status === "mastered" ? 1 : 0.6;
  if (practiceBtn) practiceBtn.style.opacity = status === "practice" ? 1 : 0.6;
}

function flipFlashcard() {
  const inner = document.getElementById("flashcard-inner");
  if (inner) {
    flashcardFlipped = !flashcardFlipped;
    inner.classList.toggle("flipped", flashcardFlipped);
  }
}

function prevFlashcard() {
  activeFlashcardIdx--;
  renderFlashcards();
}

function nextFlashcard() {
  activeFlashcardIdx++;
  renderFlashcards();
}

function markCardMastery(isMastered) {
  const list = getActiveFlashcardsList();
  if (list.length === 0) return;
  
  const card = list[activeFlashcardIdx];
  const prevStatus = S.flashcardMastery[card.id] || "practice";
  const newStatus = isMastered ? "mastered" : "practice";
  
  S.flashcardMastery[card.id] = newStatus;
  
  if (newStatus === "mastered" && prevStatus !== "mastered") {
    addXP(10);
    toast("+10 XP card mastered!", "success");
    
    // Auto check daily-flashcard
    const fChk = document.querySelector("#daily-checklist input[data-key='daily-flashcard']");
    if (fChk && !fChk.checked) {
      fChk.checked = true;
      toggleDaily(fChk);
    }
  }
  save();
  renderFlashcards();
  renderDashboard();
}

function addCustomFlashcard() {
  const sub = document.getElementById("new-fc-subject").value;
  const front = document.getElementById("new-fc-front").value.trim();
  const back = document.getElementById("new-fc-back").value.trim();
  
  if (!front || !back) {
    toast("⚠️ Please fill in both front and back text.", "error");
    return;
  }
  
  const card = {
    id: "fc_c_" + Date.now(),
    subject: sub,
    front,
    back
  };
  
  S.customFlashcards.push(card);
  save();
  
  // Clear
  document.getElementById("new-fc-front").value = "";
  document.getElementById("new-fc-back").value = "";
  
  toast("Custom flashcard added to deck!", "success");
  
  activeFlashcardIdx = getActiveFlashcardsList().length - 1; // Focus newly created card
  renderFlashcards();
}

// ── 13. MODULE: AI DOUBT SOLVER ──

function initDoubtSolver() {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Default greeting
  container.innerHTML = `
    <div class="chat-bubble ai">
      👋 Hello! I am your <strong>CMA AI Doubt Assistant</strong>. Ask me anything about Companies Act rules, portfolio variances, cost CAS standards, or transfer pricing mechanisms.
      <br/><br/>
      Select a query from the sidebar or type a custom doubt in the box below!
    </div>
  `;
}

function handleChatSubmit(event) {
  if (event.key === "Enter") {
    sendChat();
  }
}

function sendChat() {
  const input = document.getElementById("chat-input");
  if (!input) return;
  
  const text = input.value.trim();
  if (!text) return;
  
  input.value = "";
  
  // Append User message
  appendChatMessage("user", text);
  
  // Typing state
  const typing = document.getElementById("chat-typing-indicator");
  if (typing) typing.style.display = "flex";
  
  scrollChatToBottom();
  
  setTimeout(() => {
    // Generate AI response
    let answer = "";
    const cleanText = text.toLowerCase();
    
    // Simple matching
    let found = false;
    Object.keys(DOUBT_SOLVER_MAP).forEach(k => {
      if (cleanText.includes(k)) {
        answer = DOUBT_SOLVER_MAP[k];
        found = true;
      }
    });
    
    if (!found) {
      answer = `Thank you for asking this CMA Final conceptual question about <em>"${text}"</em>.<br/><br/>
      Based on the <strong>ICMAI Syllabus 2022 guidelines</strong>, this topic is tested under corporate/tax frameworks.
      To solve your doubt dynamically, here is a core concept recall:
      <pre>CONCEPT SUMMARY: Always ensure audit trails comply with Section 143 corporate audits. If calculating financial risk, check portfolio standard deviation curves or the MAT rules under 115JB.</pre>
      We suggest creating a dedicated note in the **Digital Notes** tab or scheduling this under **Revision Hub** for spaced repetition.`;
    }
    
    if (typing) typing.style.display = "none";
    appendChatMessage("ai", answer);
    scrollChatToBottom();
  }, 1000);
}

function sendQuickPrompt(promptText) {
  document.getElementById("chat-input").value = promptText;
  sendChat();
}

function appendChatMessage(sender, text) {
  const container = document.getElementById("chat-messages-container");
  if (!container) return;
  
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text;
  container.appendChild(bubble);
}

function scrollChatToBottom() {
  const container = document.getElementById("chat-messages-container");
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// ── 14. MODULE: TASK MANAGER ──

function addTask() {
  const title = document.getElementById("task-title").value.trim();
  const priority = document.getElementById("task-priority").value;
  const deadline = document.getElementById("task-deadline").value;
  const subject = document.getElementById("task-subject").value;
  
  if (!title) {
    toast("⚠️ Please enter a task title.", "error");
    return;
  }
  
  const task = {
    id: "t_" + Date.now(),
    title,
    priority,
    deadline: deadline || TODAY_KEY,
    subject,
    status: "Todo"
  };
  
  S.tasks.push(task);
  save();
  
  // Clear
  document.getElementById("task-title").value = "";
  document.getElementById("task-deadline").value = "";
  
  toast("Task created successfully!", "success");
  renderTaskManager();
  renderDashboard();
}

function moveTask(id, targetStatus) {
  const task = S.tasks.find(t => t.id === id);
  if (!task) return;
  
  task.status = targetStatus;
  if (targetStatus === "Completed") {
    addXP(15);
    toast("Task Completed! +15 XP", "success");
  }
  save();
  renderTaskManager();
  renderDashboard();
}

function deleteTask(id) {
  S.tasks = S.tasks.filter(t => t.id !== id);
  save();
  renderTaskManager();
  renderDashboard();
}

function renderTaskManager() {
  const todoBox = document.getElementById("tasks-todo");
  const progressBox = document.getElementById("tasks-inprogress");
  const completedBox = document.getElementById("tasks-completed");
  
  if (!todoBox || !progressBox || !completedBox) return;
  
  todoBox.innerHTML = "";
  progressBox.innerHTML = "";
  completedBox.innerHTML = "";
  
  let todoCount = 0;
  let progressCount = 0;
  let completedCount = 0;
  
  S.tasks.forEach(t => {
    const card = document.createElement("div");
    card.className = `task-card priority-${t.priority}`;
    
    let actionsHTML = "";
    if (t.status === "Todo") {
      todoCount++;
      actionsHTML = `
        <button onclick="moveTask('${t.id}', 'InProgress')" title="Start Task"><i class="fas fa-play"></i></button>
        <button onclick="deleteTask('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      `;
      card.innerHTML = `
        <div class="task-card-title">${t.title}</div>
        <div class="task-card-subject">${SUBJECT_KEYS[t.subject] || t.subject}</div>
        <div class="task-card-footer">
          <span>Due: ${t.deadline}</span>
          <div class="task-card-actions">${actionsHTML}</div>
        </div>
      `;
      todoBox.appendChild(card);
    } else if (t.status === "InProgress") {
      progressCount++;
      actionsHTML = `
        <button onclick="moveTask('${t.id}', 'Completed')" title="Complete Task"><i class="fas fa-check"></i></button>
        <button onclick="moveTask('${t.id}', 'Todo')" title="Send back"><i class="fas fa-undo"></i></button>
      `;
      card.innerHTML = `
        <div class="task-card-title">${t.title}</div>
        <div class="task-card-subject">${SUBJECT_KEYS[t.subject] || t.subject}</div>
        <div class="task-card-footer">
          <span>Due: ${t.deadline}</span>
          <div class="task-card-actions">${actionsHTML}</div>
        </div>
      `;
      progressBox.appendChild(card);
    } else if (t.status === "Completed") {
      completedCount++;
      actionsHTML = `
        <button onclick="moveTask('${t.id}', 'InProgress')" title="Reopen Task"><i class="fas fa-undo"></i></button>
        <button onclick="deleteTask('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
      `;
      card.innerHTML = `
        <div class="task-card-title" style="text-decoration:line-through; opacity:0.6;">${t.title}</div>
        <div class="task-card-subject" style="opacity:0.6;">${SUBJECT_KEYS[t.subject] || t.subject}</div>
        <div class="task-card-footer">
          <span style="opacity:0.6;">Completed</span>
          <div class="task-card-actions">${actionsHTML}</div>
        </div>
      `;
      completedBox.appendChild(card);
    }
  });
  
  // Set headers count
  document.getElementById("task-todo-count").textContent = todoCount;
  document.getElementById("task-progress-count").textContent = progressCount;
  document.getElementById("task-completed-count").textContent = completedCount;
}

// ── 15. MODULE: ANALYTICS ──

function renderAnalytics() {
  const overallPct = syllabusCompletionPct();
  const acc = getQuizAccuracy();
  
  const aHoursTotal = document.getElementById("a-hours-total");
  const aHoursToday = document.getElementById("a-hours-today");
  const aQuizPct = document.getElementById("a-quiz-pct");
  const aSyllablePct = document.getElementById("a-syllabus-pct");
  
  if (aHoursTotal) aHoursTotal.textContent = `${totalHours()}h`;
  if (aHoursToday) aHoursToday.textContent = `${dailyHours(TODAY_KEY)}h`;
  if (aQuizPct) aQuizPct.textContent = `${acc}%`;
  if (aSyllablePct) aSyllablePct.textContent = `${Math.round(overallPct)}%`;
  
  // Render Subject Hour distribution chart
  renderSubjectHoursChart();
  
  // Render Syllabus Progress by Paper chart
  renderSyllabusProgressChart();
  
  // Render Heatmap / Last 14 days chart
  renderLastFortnightHoursChart();
  
  // Generate smart recommendations
  renderStudyInsights();
}

function getQuizAccuracy() {
  if (S.quizLog.length === 0) return 0;
  const correct = S.quizLog.reduce((sum, q) => sum + q.score, 0);
  const total = S.quizLog.reduce((sum, q) => sum + q.total, 0);
  return Math.round((correct / total) * 100);
}

function renderSubjectHoursChart() {
  const container = document.getElementById("subj-chart");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Sum hours by subject
  const sums = {};
  Object.keys(SUBJECT_KEYS).forEach(k => sums[k] = 0);
  
  Object.keys(S.hours).forEach(date => {
    Object.keys(S.hours[date]).forEach(sub => {
      if (sums[sub] !== undefined) {
        sums[sub] += S.hours[date][sub];
      }
    });
  });
  
  const max = Math.max(...Object.values(sums), 1);
  
  Object.keys(sums).forEach(k => {
    const val = sums[k];
    const pct = Math.max(5, Math.round((val / max) * 100));
    
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
        <span>${SUBJECT_KEYS[k]}</span>
        <span style="font-weight:700; color:var(--accent2);">${val} hrs</span>
      </div>
      <div class="mini-bar" style="height:10px;"><div class="mini-fill" style="width:${pct}%; background:var(--accent); height:100%; border-radius:4px;"></div></div>
    `;
    container.appendChild(div);
  });
}

function renderSyllabusProgressChart() {
  const container = document.getElementById("cat-chart");
  if (!container) return;
  
  container.innerHTML = "";
  
  Object.keys(SUBJECT_KEYS).forEach(k => {
    const pct = subjectCompletionPct(k);
    const div = document.createElement("div");
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:4px;">
        <span>${SUBJECT_KEYS[k]}</span>
        <span style="font-weight:700; color:var(--accent2);">${pct}%</span>
      </div>
      <div class="mini-bar" style="height:10px;"><div class="mini-fill" style="width:${pct}%; background:var(--accent2); height:100%; border-radius:4px;"></div></div>
    `;
    container.appendChild(div);
  });
}

function renderLastFortnightHoursChart() {
  const container = document.getElementById("hours-chart");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Get last 14 days
  const list = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    list.push({
      key,
      dateLabel: d.toLocaleDateString("en-IN", { day: 'numeric', month: 'short' }),
      hours: dailyHours(key)
    });
  }
  
  const max = Math.max(...list.map(l => l.hours), 2);
  
  const flex = document.createElement("div");
  flex.style.display = "flex";
  flex.style.alignItems = "flex-end";
  flex.style.justifyContent = "space-between";
  flex.style.height = "120px";
  flex.style.borderBottom = "1px solid var(--border)";
  flex.style.paddingBottom = "8px";
  flex.style.gap = "4px";
  
  list.forEach(item => {
    const barPct = Math.round((item.hours / max) * 100);
    const col = document.createElement("div");
    col.style.flex = "1";
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.alignItems = "center";
    col.style.gap = "4px";
    
    col.innerHTML = `
      <span style="font-size:9px; color:var(--accent2); font-weight:700;">${item.hours > 0 ? item.hours + 'h' : ''}</span>
      <div style="width:100%; height:${barPct}%; background:${item.hours >= 4 ? 'var(--accent)' : 'rgba(108, 99, 255, 0.3)'}; border-radius: 4px 4px 0 0; min-height: 4px;" title="${item.hours} hours logged on ${item.key}"></div>
      <span style="font-size:8.5px; color:var(--text2); white-space:nowrap; text-transform:uppercase;">${item.dateLabel}</span>
    `;
    flex.appendChild(col);
  });
  
  container.appendChild(flex);
}

function renderStudyInsights() {
  const container = document.getElementById("study-insights-container");
  if (!container) return;
  
  container.innerHTML = "";
  
  // Rule checks for smart suggestions
  const insights = [];
  
  const total = totalHours();
  const overallSyllPct = syllabusCompletionPct();
  const quizAcc = getQuizAccuracy();
  
  if (total === 0) {
    insights.push("💡 **Get Started**: You haven't logged any study hours yet. Switch to the **Focus Timer** and run a 25-minute Pomodoro session under Strategic Cost Management (SCM) or Law to start!");
  } else if (total < 10) {
    insights.push("📈 **Building Momentum**: You logged some study hours! Consistency is key for Group III/IV. Strive for 4+ hours daily to stay on track.");
  }
  
  // Find weak subjects based on syllabus
  const completionList = Object.keys(SUBJECT_KEYS).map(k => ({ key: k, name: SUBJECT_KEYS[k], pct: subjectCompletionPct(k) }));
  completionList.sort((a,b) => a.pct - b.pct);
  
  if (overallSyllPct < 80) {
    const weakest = completionList[0];
    if (weakest && weakest.pct < 40) {
      insights.push(`📚 **Syllabus Priority**: Your syllabus completion in **${weakest.name}** is quite low (${weakest.pct}%). We recommend focusing your next 3 study sessions on this paper.`);
    }
  }
  
  // Spaced repetition due alarm
  const today = TODAY_KEY;
  const dueCount = S.revisions.filter(r => !r.completed && r.nextDueDate <= today).length;
  if (dueCount > 0) {
    insights.push(`🔄 **Revision Alert**: You have **${dueCount} spaced revision topics due today** in the Leitner queue. Completing these prevents memory decay!`);
  }
  
  // Quiz accuracy insight
  if (S.quizLog.length > 0 && quizAcc < 70) {
    insights.push("✏️ **MCQ Performance**: Your quiz accuracy is currently at **" + quizAcc + "%**. Review tax provisions and Companies Act sections in **Flashcards** deck to improve conceptual recall.");
  } else if (S.quizLog.length > 3 && quizAcc >= 85) {
    insights.push("🌟 **Excellent Accuracy**: Your MCQ score averages above **85%**. Excellent logic mapping! Challenge yourself with Case Studies in Direct Tax.");
  }
  
  // Default recommendations if list is short
  if (insights.length < 2) {
    insights.push("💡 **Governance Practice**: Keep a daily target of reviewing 10 flashcards and testing yourself with a 5-question MCQ mock block.");
  }
  
  insights.forEach(ins => {
    const div = document.createElement("div");
    div.style.padding = "8px 12px";
    div.style.background = "var(--bg3)";
    div.style.borderRadius = "8px";
    div.style.borderLeft = "4px solid var(--accent)";
    div.innerHTML = ins;
    container.appendChild(div);
  });
}

function checkUnlockedBadges() {
  BADGES.forEach(b => {
    const previouslyMastered = S.flashcardMastery[b.id] === "unlocked_notified";
    if (b.check() && !previouslyMastered) {
      S.flashcardMastery[b.id] = "unlocked_notified";
      toast(`🏆 Achievement Unlocked: ${b.label}!`, "success");
      addXP(50);
      save();
      renderAchievementsBadges();
      renderDashboard();
    }
  });
}

// ── 16. TOASTS & MODALS ──

function toast(msg, type = "info") {
  const container = document.getElementById("toast");
  if (!container) return;
  
  container.textContent = msg;
  container.className = `toast show ${type}`;
  
  setTimeout(() => {
    container.classList.remove("show");
  }, 3500);
}

function confirmReset() {
  document.getElementById("modal-overlay").classList.add("show");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("show");
}

function doReset() {
  localStorage.removeItem("CMA_FinalistOS_v1");
  closeModal();
  toast("Data successfully reset! Reloading application...", "info");
  setTimeout(() => {
    location.reload();
  }, 1000);
}

// ── 17. MODULE: PYQ & TRENDS ──

const PYQ_PAPERS_DB = [
  { id: "pyq_cel_dec25", subject: "CEL", term: "December 2025", paper: "Paper 13: Corporate & Economic Laws" },
  { id: "pyq_cel_june25", subject: "CEL", term: "June 2025", paper: "Paper 13: Corporate & Economic Laws" },
  { id: "pyq_cel_dec24", subject: "CEL", term: "December 2024", paper: "Paper 13: Corporate & Economic Laws" },
  { id: "pyq_sfm_dec25", subject: "SFM", term: "December 2025", paper: "Paper 14: Strategic Financial Management" },
  { id: "pyq_sfm_june25", subject: "SFM", term: "June 2025", paper: "Paper 14: Strategic Financial Management" },
  { id: "pyq_sfm_dec24", subject: "SFM", term: "December 2024", paper: "Paper 14: Strategic Financial Management" },
  { id: "pyq_dtit_dec25", subject: "DTIT", term: "December 2025", paper: "Paper 15: Direct Tax Laws & International Taxation" },
  { id: "pyq_dtit_june25", subject: "DTIT", term: "June 2025", paper: "Paper 15: Direct Tax Laws & International Taxation" },
  { id: "pyq_dtit_dec24", subject: "DTIT", term: "December 2024", paper: "Paper 15: Direct Tax Laws & International Taxation" },
  { id: "pyq_scm_dec25", subject: "SCM", term: "December 2025", paper: "Paper 16: Strategic Cost Management" },
  { id: "pyq_scm_june25", subject: "SCM", term: "June 2025", paper: "Paper 16: Strategic Cost Management" },
  { id: "pyq_scm_dec24", subject: "SCM", term: "December 2024", paper: "Paper 16: Strategic Cost Management" },
  { id: "pyq_cmad_dec25", subject: "CMAD", term: "December 2025", paper: "Paper 17: Cost & Management Audit" },
  { id: "pyq_cmad_june25", subject: "CMAD", term: "June 2025", paper: "Paper 17: Cost & Management Audit" },
  { id: "pyq_cfr_dec25", subject: "CFR", term: "December 2025", paper: "Paper 18: Corporate Financial Reporting" },
  { id: "pyq_cfr_june25", subject: "CFR", term: "June 2025", paper: "Paper 18: Corporate Financial Reporting" },
  { id: "pyq_itlp_dec25", subject: "ITLP", term: "December 2025", paper: "Paper 19: Indirect Tax Laws & Practice" },
  { id: "pyq_itlp_june25", subject: "ITLP", term: "June 2025", paper: "Paper 19: Indirect Tax Laws & Practice" }
];

function renderPYQTracker() {
  const filterSub = document.getElementById("pyq-subject-filter")?.value || "ALL";
  const container = document.getElementById("pyq-papers-list");
  if (!container) return;

  container.innerHTML = "";
  
  let pool = PYQ_PAPERS_DB;
  if (filterSub !== "ALL") {
    pool = PYQ_PAPERS_DB.filter(p => p.subject === filterSub);
  }

  // Count stats
  const totalCount = pool.length;
  const solvedCount = pool.filter(p => !!S.pyqSolved[p.id]).length;
  const pct = totalCount === 0 ? 0 : Math.round((solvedCount / totalCount) * 100);

  const solvedLabel = document.getElementById("pyq-solved-count");
  const totalLabel = document.getElementById("pyq-total-count");
  const pctLabel = document.getElementById("pyq-completed-pct");

  if (solvedLabel) solvedLabel.textContent = solvedCount;
  if (totalLabel) totalLabel.textContent = totalCount;
  if (pctLabel) pctLabel.textContent = `${pct}%`;

  if (pool.length === 0) {
    container.innerHTML = `<div style="font-size:13px; color:var(--text3); padding:20px; text-align:center;">No question papers found for this selection.</div>`;
    return;
  }

  pool.forEach(p => {
    const isSolved = !!S.pyqSolved[p.id];
    const div = document.createElement("div");
    div.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg2); border:1px solid var(--border); border-radius:8px; gap:12px; flex-wrap:wrap; width: 100%;";
    
    // Official ICMAI Links
    const qpLink = "https://www.icmai.in/studentswebsite/exam-question-papers.php";
    const ansLink = "https://www.icmai.in/studentswebsite/suggested-answers.php";

    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:200px;">
        <input type="checkbox" onchange="togglePYQStatus('${p.id}', this)" ${isSolved ? 'checked' : ''} style="width:16px; height:16px; cursor:pointer;"/>
        <div>
          <span style="font-weight:600; font-size:13px; color:${isSolved ? 'var(--text3)' : 'var(--text)'}; text-decoration:${isSolved ? 'line-through' : 'none'};">${p.term} - ${p.paper}</span>
          <div style="font-size:10px; color:var(--text2); margin-top:2px;">Subject Code: ${p.subject}</div>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <a href="${qpLink}" target="_blank" class="btn btn-sm" style="background:var(--bg3); font-size:11px; padding:6px 10px; text-decoration:none;"><i class="fas fa-file-pdf"></i> Question Paper</a>
        <a href="${ansLink}" target="_blank" class="btn btn-sm" style="background:var(--bg3); font-size:11px; padding:6px 10px; text-decoration:none; color:var(--accent2);"><i class="fas fa-key"></i> Suggested Answer</a>
      </div>
    `;
    container.appendChild(div);
  });
}

function togglePYQStatus(id, checkbox) {
  if (!S.pyqSolved) S.pyqSolved = {};
  S.pyqSolved[id] = checkbox.checked;
  
  if (checkbox.checked) {
    addXP(50); // Solving previous year paper is highly valued!
    toast("🏆 PYQ paper marked as Solved! +50 XP awarded.", "success");
    triggerConfetti();
  } else {
    addXP(-50);
  }
  save();
  renderPYQTracker();
  renderDashboard();
}

function seedGroup3Plan() {
  if (confirm("🔄 Seed 150-Day Group III Prep Schedule?\nThis will add Group III goals, milestones, and weekly study tasks from July 10 to December 10, 2026. This will not delete your existing custom data.")) {
    
    // 1. Seed milestones as goals
    const milestones = [
      { id: "g_ms1", title: "Milestone: 25% Group III Syllabus (SFM & CEL Core)", type: "exam", date: "2026-07-31", subject: "SFM", completed: false },
      { id: "g_ms2", title: "Milestone: 60% Group III Syllabus (DTIT & SCM Start)", type: "exam", date: "2026-08-31", subject: "DTIT", completed: false },
      { id: "g_ms3", title: "Milestone: 85% Group III Syllabus (SCM Variances)", type: "exam", date: "2026-09-30", subject: "SCM", completed: false },
      { id: "g_ms4", title: "Milestone: 100% Group III Syllabus Completion 🎉", type: "exam", date: "2026-10-10", subject: "CEL", completed: false },
      { id: "g_ms5", title: "Milestone: First Revision Cycle Complete (Leitner Level 3)", type: "exam", date: "2026-11-10", subject: "SCM", completed: false },
      { id: "g_ms6", title: "Milestone: Solved 5 Past Year Papers per Subject", type: "exam", date: "2026-11-30", subject: "DTIT", completed: false },
      { id: "g_ms7", title: "CMA Final Group III Examination Begins!", type: "exam", date: "2026-12-10", subject: "CEL", completed: false }
    ];

    milestones.forEach(m => {
      if (!S.goals.some(g => g.id === m.id)) {
        S.goals.push(m);
      }
    });

    // 2. Seed daily study tasks for Phase 1 (July 10 - October 10)
    const dailyTasks = [
      { id: "td_1", title: "Day 1 (July 10): SFM: Capital Cash Flow / CEL: Director Sec 149", priority: "High", deadline: "2026-07-10", subject: "SFM", status: "Todo" },
      { id: "td_2", title: "Day 2 (July 11): SFM: RADR & Risk / CEL: Director Disqualifications Sec 164", priority: "High", deadline: "2026-07-11", subject: "CEL", status: "Todo" },
      { id: "td_3", title: "Day 3 (July 12): SFM: Sensitivity & Scenario / CEL: Director Duties Sec 166/168", priority: "Medium", deadline: "2026-07-12", subject: "CEL", status: "Todo" },
      { id: "td_4", title: "Day 4 (July 13): SFM: Inflation in projects / CEL: Appointment Sec 152/161", priority: "Medium", deadline: "2026-07-13", subject: "SFM", status: "Todo" },
      { id: "td_5", title: "Day 5 (July 14): SFM: Lease Cash Flows / CEL: Independent Directors Schedule IV", priority: "High", deadline: "2026-07-14", subject: "CEL", status: "Todo" },
      { id: "td_6", title: "Day 6 (July 15): SFM: Lease Cost of Debt / CEL: KMP Remuneration rules", priority: "High", deadline: "2026-07-15", subject: "SFM", status: "Todo" },
      { id: "td_7", title: "Day 7 (July 16): SFM: Portfolio Return & Risk / CEL: Board Meetings Notice Sec 173", priority: "High", deadline: "2026-07-16", subject: "CEL", status: "Todo" },
      { id: "td_8", title: "Day 8 (July 17): Weekly Revision & Director Section Recall", priority: "Medium", deadline: "2026-07-17", subject: "CEL", status: "Todo" },
      { id: "td_9", title: "Day 9 (July 18): SFM: Co-variance & Correlation / CEL: Meeting Quorum Sec 174", priority: "High", deadline: "2026-07-18", subject: "SFM", status: "Todo" },
      { id: "td_10", title: "Day 10 (July 19): SFM: Markowitz Efficient Frontier / CEL: Audit Committee Sec 177", priority: "Medium", deadline: "2026-07-19", subject: "CEL", status: "Todo" },
      { id: "td_11", title: "Day 11 (July 20): SFM: Sharpe Single Index Model / CEL: Nomination Committee Sec 178", priority: "Medium", deadline: "2026-07-20", subject: "CEL", status: "Todo" },
      { id: "td_12", title: "Day 12 (July 21): SFM: CAPM Cost of Equity Ke / CEL: Board Powers Sec 179/180", priority: "High", deadline: "2026-07-21", subject: "SFM", status: "Todo" },
      { id: "td_13", title: "Day 13 (July 22): SFM: Project Betas / CEL: Loans to Directors Sec 185/186", priority: "High", deadline: "2026-07-22", subject: "CEL", status: "Todo" },
      { id: "td_14", title: "Day 14 (July 23): SFM: Arbitrage Pricing Theory / CEL: Related Party Sec 188", priority: "Medium", deadline: "2026-07-23", subject: "CEL", status: "Todo" },
      { id: "td_15", title: "Day 15 (July 24): SFM: Security Dividend Models / CEL: Books of Accounts Sec 128", priority: "High", deadline: "2026-07-24", subject: "SFM", status: "Todo" },
      { id: "td_16", title: "Day 16 (July 25): Weekly Revision & Related Party Rules Recap", priority: "Medium", deadline: "2026-07-25", subject: "CEL", status: "Todo" },
      { id: "td_17", title: "Day 17 (July 26): SFM: Bond YTM & Duration / CEL: CSR Spends Sec 135", priority: "High", deadline: "2026-07-26", subject: "SFM", status: "Todo" },
      { id: "td_18", title: "Day 18 (July 27): SFM: Money & Capital Markets / CEL: Auditor Rotation Sec 139-140", priority: "Medium", deadline: "2026-07-27", subject: "CEL", status: "Todo" },
      { id: "td_19", title: "Day 19 (July 28): SFM: Mutual Funds NAV / CEL: Auditor Duties Sec 143", priority: "Medium", deadline: "2026-07-28", subject: "SFM", status: "Todo" },
      { id: "td_20", title: "Day 20 (July 29): SFM: Fund Sharpe/Treynor / CEL: Cost Records Sec 148", priority: "High", deadline: "2026-07-29", subject: "CEL", status: "Todo" },
      { id: "td_21", title: "Day 21 (July 30): SFM: Efficient Market Hypothesis / CEL: SEBI LODR Board rules", priority: "Medium", deadline: "2026-07-30", subject: "SFM", status: "Todo" },
      { id: "td_22", title: "Day 22 (July 31): Monthly Milestone: Check 25% Group III Syllabus Complete", priority: "High", deadline: "2026-07-31", subject: "SFM", status: "Todo" },
      
      { id: "td_23", title: "Day 23 (Aug 1): SFM: Forward Contracts Pricing / CEL: SEBI LODR Audit Committee", priority: "High", deadline: "2026-08-01", subject: "SFM", status: "Todo" },
      { id: "td_24", title: "Day 24 (Aug 2): SFM: Futures Margins & MTM / CEL: FEMA Resident Status", priority: "High", deadline: "2026-08-02", subject: "CEL", status: "Todo" },
      { id: "td_25", title: "Day 25 (Aug 3): SFM: Options Payoffs / CEL: FEMA Current Account rules", priority: "High", deadline: "2026-08-03", subject: "SFM", status: "Todo" },
      { id: "td_26", title: "Day 26 (Aug 4): SFM: Put-Call Parity / CEL: FEMA Capital Account restrictions", priority: "High", deadline: "2026-08-04", subject: "CEL", status: "Todo" },
      { id: "td_27", title: "Day 27 (Aug 5): SFM: Black-Scholes Model / CEL: FEMA FDI guidelines", priority: "High", deadline: "2026-08-05", subject: "SFM", status: "Todo" },
      { id: "td_28", title: "Day 28 (Aug 6): SFM: Binomial Options Model / CEL: Competition Anti-competitive", priority: "Medium", deadline: "2026-08-06", subject: "CEL", status: "Todo" },
      { id: "td_29", title: "Day 29 (Aug 7): SFM: Swaps Interest & benefit / CEL: Competition Dominant Position", priority: "Medium", deadline: "2026-08-07", subject: "SFM", status: "Todo" },
      { id: "td_30", title: "Day 30 (Aug 8): Weekly Revision & Option pricing formulas recap", priority: "Medium", deadline: "2026-08-08", subject: "SFM", status: "Todo" },
      { id: "td_31", title: "Day 31 (Aug 9): SFM: Forex Bid/Ask spreads / CEL: Insolvency CIRP process", priority: "High", deadline: "2026-08-09", subject: "CEL", status: "Todo" },
      
      { id: "td_32", title: "Day 32 (Aug 10): SFM: Forex PPP & Interest Parity / CEL: IBC Waterfall rules", priority: "High", deadline: "2026-08-10", subject: "SFM", status: "Todo" },
      { id: "td_33", title: "Day 33 (Aug 11): SFM: Forex exposures / CEL: Banking NPA management", priority: "Medium", deadline: "2026-08-11", subject: "CEL", status: "Todo" },
      { id: "td_34", title: "Day 34 (Aug 12): SFM: Forex hedging forwards / CEL: PMLA offence & attachments", priority: "High", deadline: "2026-08-12", subject: "SFM", status: "Todo" },
      { id: "td_35", title: "Day 35 (Aug 13): SFM: Valuation FCFF & FCFE / CEL: Cyber Security rules", priority: "High", deadline: "2026-08-13", subject: "SFM", status: "Todo" },
      { id: "td_36", title: "Day 36 (Aug 14): SFM: Mergers Synergy & post EPS / CEL: OECD governance", priority: "High", deadline: "2026-08-14", subject: "CEL", status: "Todo" },
      { id: "td_37", title: "Day 37 (Aug 15): Weekly Revision & Forex hedging formulas recap", priority: "Medium", deadline: "2026-08-15", subject: "SFM", status: "Todo" },
      { id: "td_38", title: "Day 38 (Aug 16): SFM: Mergers Swap ratios / DTIT: Resident Status & Scope", priority: "High", deadline: "2026-08-16", subject: "DTIT", status: "Todo" },
      { id: "td_39", title: "Day 39 (Aug 17): SFM: Corporate Buybacks / DTIT: Normal corporate assessment", priority: "High", deadline: "2026-08-17", subject: "SFM", status: "Todo" },
      { id: "td_40", title: "Day 40 (Aug 18): SCM: Life Cycle Costing / DTIT: Concessional tax Sec 115BAA", priority: "High", deadline: "2026-08-18", subject: "DTIT", status: "Todo" },
      { id: "td_41", title: "Day 41 (Aug 19): SCM: Target Costing / DTIT: Concessional tax new manufacturers Sec 115BAB", priority: "High", deadline: "2026-08-19", subject: "SCM", status: "Todo" },
      { id: "td_42", title: "Day 42 (Aug 20): SCM: Kaizen Costing / DTIT: MAT Book Profit additions", priority: "High", deadline: "2026-08-20", subject: "DTIT", status: "Todo" },
      { id: "td_43", title: "Day 43 (Aug 21): SCM: Value Chain Analysis / DTIT: MAT Book Profit deletions", priority: "Medium", deadline: "2026-08-21", subject: "SCM", status: "Todo" },
      { id: "td_44", title: "Day 44 (Aug 22): SCM: Relevant Costing / DTIT: MAT Credit & 15-year carryforward", priority: "High", deadline: "2026-08-22", subject: "DTIT", status: "Todo" },
      { id: "td_45", title: "Day 45 (Aug 23): Weekly Revision & MAT adjustments recap", priority: "Medium", deadline: "2026-08-23", subject: "DTIT", status: "Todo" },
      { id: "td_46", title: "Day 46 (Aug 24): SCM: Relevant Make or Buy / DTIT: Firm Assessment Sec 40(b)", priority: "High", deadline: "2026-08-24", subject: "SCM", status: "Todo" },
      { id: "td_47", title: "Day 47 (Aug 25): SCM: Cost-plus, skimming / DTIT: Assessment of AOP & BOI", priority: "Medium", deadline: "2026-08-25", subject: "DTIT", status: "Todo" },
      { id: "td_48", title: "Day 48 (Aug 26): SCM: Intra Transfer Pricing cost / CEL: Compromises Sec 230-240", priority: "High", deadline: "2026-08-26", subject: "SCM", status: "Todo" },
      { id: "td_49", title: "Day 49 (Aug 27): SCM: Transfer pricing market / CEL: SEBI LODR compliance", priority: "Medium", deadline: "2026-08-27", subject: "CEL", status: "Todo" },
      { id: "td_50", title: "Day 50 (Aug 28): SCM: Dual transfer pricing / CEL: FEMA Capital vs Current", priority: "High", deadline: "2026-08-28", subject: "SCM", status: "Todo" },
      { id: "td_51", title: "Day 51 (Aug 29): SCM: Material Variances / CEL: FEMA FDI rules", priority: "High", deadline: "2026-08-29", subject: "SCM", status: "Todo" },
      { id: "td_52", title: "Day 52 (Aug 30): SCM: Material mix variances / CEL: Competition Dominant Position", priority: "High", deadline: "2026-08-30", subject: "CEL", status: "Todo" },
      { id: "td_53", title: "Day 53 (Aug 31): Monthly Milestone: Check 60% Group III Syllabus Complete", priority: "High", deadline: "2026-08-31", subject: "SCM", status: "Todo" },

      { id: "td_54", title: "Day 54 (Sept 1): SCM: Labour rate & efficiency / CEL: Banking NPA", priority: "High", deadline: "2026-09-01", subject: "SCM", status: "Todo" },
      { id: "td_55", title: "Day 55 (Sept 2): SCM: Labour idle time / DTIT: DTAA Bilateral relief Sec 90", priority: "High", deadline: "2026-09-02", subject: "DTIT", status: "Todo" },
      { id: "td_56", title: "Day 56 (Sept 3): SCM: Variable Overhead / DTIT: DTAA Unilateral relief Sec 91", priority: "Medium", deadline: "2026-09-03", subject: "SCM", status: "Todo" },
      { id: "td_57", title: "Day 57 (Sept 4): SCM: Fixed Overhead volume / DTIT: Non-Resident Income deemed", priority: "High", deadline: "2026-09-04", subject: "DTIT", status: "Todo" },
      { id: "td_58", title: "Day 58 (Sept 5): SCM: Fixed Overhead capacity / DTIT: Equalisation Levy 6%", priority: "High", deadline: "2026-09-05", subject: "DTIT", status: "Todo" },
      { id: "td_59", title: "Day 59 (Sept 6): SCM: Sales margin volume / DTIT: Equalisation Levy 2% e-commerce", priority: "High", deadline: "2026-09-06", subject: "SCM", status: "Todo" },
      { id: "td_60", title: "Day 60 (Sept 7): SCM: Sales mix & quantity / DTIT: Filing returns timelines", priority: "High", deadline: "2026-09-07", subject: "DTIT", status: "Todo" },
      { id: "td_61", title: "Day 61 (Sept 8): Weekly Revision & Variance formulas recap", priority: "Medium", deadline: "2026-09-08", subject: "SCM", status: "Todo" },
      
      { id: "td_62", title: "Day 62 (Sept 9): SCM: Planning vs Operational variances / DTIT: Appeals Commissioner", priority: "High", deadline: "2026-09-09", subject: "SCM", status: "Todo" },
      { id: "td_63", title: "Day 63 (Sept 10): SCM: Balanced Scorecard design / DTIT: Revisions Sec 263/264", priority: "High", deadline: "2026-09-10", subject: "DTIT", status: "Todo" },
      { id: "td_64", title: "Day 64 (Sept 11): SCM: Benchmarking / DTIT: Dispute Resolution Committee", priority: "Medium", deadline: "2026-09-11", subject: "SCM", status: "Todo" },
      { id: "td_65", title: "Day 65 (Sept 12): SCM: ROI & Residual Income / DTIT: Penalties undisclosed income", priority: "High", deadline: "2026-09-12", subject: "DTIT", status: "Todo" },
      { id: "td_66", title: "Day 66 (Sept 13): SCM: Customer perspective / DTIT: Prosecutions & offences", priority: "Medium", deadline: "2026-09-13", subject: "SCM", status: "Todo" },
      { id: "td_67", title: "Day 67 (Sept 14): SCM: TQM Costs of Quality / DTIT: Black Money Act foreign assets", priority: "High", deadline: "2026-09-14", subject: "DTIT", status: "Todo" },
      { id: "td_68", title: "Day 68 (Sept 15): Weekly Revision & Balanced Scorecard recap", priority: "Medium", deadline: "2026-09-15", subject: "SCM", status: "Todo" },
      
      { id: "td_69", title: "Day 69 (Sept 16): SCM: TQM quality circles / DTIT: Black Money penalties", priority: "High", deadline: "2026-09-16", subject: "DTIT", status: "Todo" },
      { id: "td_70", title: "Day 70 (Sept 17): SCM: Six Sigma DMAIC / CEL: Tribunal compounding", priority: "High", deadline: "2026-09-17", subject: "CEL", status: "Todo" },
      { id: "td_71", title: "Day 71 (Sept 18): SCM: Lean Accounting streams / CEL: Compromises", priority: "Medium", deadline: "2026-09-18", subject: "SCM", status: "Todo" },
      { id: "td_72", title: "Day 72 (Sept 19): SCM: JIT backflush costing / CEL: Amalgamations Sec 232", priority: "High", deadline: "2026-09-19", subject: "CEL", status: "Todo" },
      { id: "td_73", title: "Day 73 (Sept 20): SCM: SCM in Services / CEL: Fast Track Mergers Sec 233", priority: "Medium", deadline: "2026-09-20", subject: "SCM", status: "Todo" },
      { id: "td_74", title: "Day 74 (Sept 21): SCM: Logistics SCM / CEL: Oppression & Mismanagement Sec 241", priority: "High", deadline: "2026-09-21", subject: "CEL", status: "Todo" },
      { id: "td_75", title: "Day 75 (Sept 22): Weekly Revision & Lean costing methods recap", priority: "Medium", deadline: "2026-09-22", subject: "SCM", status: "Todo" },
      
      { id: "td_76", title: "Day 76 (Sept 23): SCM: Strategic Position / CEL: Class action suits Sec 245", priority: "High", deadline: "2026-09-23", subject: "CEL", status: "Todo" },
      { id: "td_77", title: "Day 77 (Sept 24): SCM: Business Forecasting / CEL: NCLT Tribunal powers", priority: "Medium", deadline: "2026-09-24", subject: "SCM", status: "Todo" },
      { id: "td_78", title: "Day 78 (Sept 25): SCM: Learning Curve theory / CEL: RoC filings", priority: "Medium", deadline: "2026-09-25", subject: "CEL", status: "Todo" },
      { id: "td_79", title: "Day 79 (Sept 26): SCM: Linear Programming / CEL: Fast Track Insolvency", priority: "High", deadline: "2026-09-26", subject: "SCM", status: "Todo" },
      { id: "td_80", title: "Day 80 (Sept 27): SCM: Transportation & Assignment / CEL: Voluntary Liquidation", priority: "High", deadline: "2026-09-27", subject: "CEL", status: "Todo" },
      { id: "td_81", title: "Day 81 (Sept 28): SCM: ESG carbon emissions / CEL: SEBI Insider Trading", priority: "Medium", deadline: "2026-09-28", subject: "SCM", status: "Todo" },
      { id: "td_82", title: "Day 82 (Sept 29): SCM: ESG audit records / CEL: SEBI Substantial Acquisitions", priority: "Medium", deadline: "2026-09-29", subject: "CEL", status: "Todo" },
      { id: "td_83", title: "Day 83 (Sept 30): Monthly Milestone: Check 85% Group III Syllabus Complete", priority: "High", deadline: "2026-09-30", subject: "SCM", status: "Todo" },
      
      { id: "td_84", title: "Day 84 (Oct 1): SCM: Cost case review / CEL: FEMA ODI guidelines", priority: "High", deadline: "2026-10-01", subject: "SCM", status: "Todo" },
      { id: "td_85", title: "Day 85 (Oct 2): SCM: Transfer pricing case / CEL: FEMA ECB rules", priority: "High", deadline: "2026-10-02", subject: "CEL", status: "Todo" },
      { id: "td_86", title: "Day 86 (Oct 3): SCM: Costing vs Kaizen / CEL: SARFAESI Act rules", priority: "High", deadline: "2026-10-03", subject: "SCM", status: "Todo" },
      { id: "td_87", title: "Day 87 (Oct 4): SCM: JIT automotive / CEL: IRDA insurance audits", priority: "Medium", deadline: "2026-10-04", subject: "CEL", status: "Todo" },
      { id: "td_88", title: "Day 88 (Oct 5): SCM: Formula revision / CEL: MSMED Act delayed payments", priority: "High", deadline: "2026-10-05", subject: "SCM", status: "Todo" },
      { id: "td_89", title: "Day 89 (Oct 6): SCM: Practice test block / CEL: AML obligations", priority: "Medium", deadline: "2026-10-06", subject: "CEL", status: "Todo" },
      { id: "td_90", title: "Day 90 (Oct 7): SCM: Practice test 2 / CEL: IBC individual bankruptcy", priority: "Medium", deadline: "2026-10-07", subject: "SCM", status: "Todo" },
      { id: "td_93", title: "Day 93 (Oct 10): 100% Group III Syllabus Completion Milestone 🎉", priority: "High", deadline: "2026-10-10", subject: "SFM", status: "Todo" }
    ];

    dailyTasks.forEach(t => {
      if (!S.tasks.some(task => task.id === t.id)) {
        S.tasks.push(t);
      }
    });

    save();
    toast("📅 Group III 150-Day Prep Schedule seeded successfully!", "success");
    addXP(30);
    
    // Refresh panels
    renderPlannerGoals();
    renderCalendar();
    renderTaskManager();
    renderDashboard();
  }
}

function renderDashboardTodaysTarget() {
  const dateLabel = document.getElementById("todays-target-date");
  const titleLabel = document.getElementById("todays-target-title");
  const subLabel = document.getElementById("todays-target-sub");
  const btn = document.getElementById("todays-target-btn");
  const noteBtn = document.getElementById("todays-target-note-btn");
  if (!titleLabel || !subLabel || !btn) return;

  const today = new Date();
  if (dateLabel) {
    dateLabel.textContent = today.toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Find a task due today that starts with "Day " or contains the today date
  const todayKey = TODAY_KEY;
  const todayTasks = S.tasks.filter(t => t.deadline === todayKey);
  const activeTarget = todayTasks.find(t => t.status !== "Completed");

  if (activeTarget) {
    titleLabel.textContent = activeTarget.title;
    subLabel.innerHTML = `<span class="badge ${activeTarget.priority === 'High' ? 'badge-high' : 'badge-med'}" style="margin-right:6px; background:${activeTarget.priority === 'High' ? 'var(--accent3)' : 'var(--accent)'}; color:#fff; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:600;">${activeTarget.priority} Priority</span> Subject: <strong>${activeTarget.subject}</strong>`;
    btn.style.display = "block";
    btn.onclick = () => completeTodaysTarget(activeTarget.id);
    if (noteBtn) noteBtn.style.display = "block";
  } else {
    // Check if there's any task completed today
    const completedTarget = todayTasks.find(t => t.status === "Completed");
    if (completedTarget) {
      titleLabel.innerHTML = `🎉 <span style="text-decoration: line-through; color: var(--text3);">${completedTarget.title}</span>`;
      subLabel.textContent = "Great job! You have completed today's study target. Keep up the streak!";
      btn.style.display = "none";
      if (noteBtn) noteBtn.style.display = "none";
    } else {
      titleLabel.textContent = "No study target set for today.";
      subLabel.textContent = "Seed your 150-day schedule under Study Planner or create custom tasks!";
      btn.style.display = "none";
      if (noteBtn) noteBtn.style.display = "none";
    }
  }
}

function completeTodaysTarget(taskId) {
  const idx = S.tasks.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    S.tasks[idx].status = "Completed";
    addXP(50);
    toast("🏆 Today's study target completed! +50 XP awarded.", "success");
    triggerConfetti();
    save();
    renderDashboard();
    renderCalendar();
  }
}

// ── 18. MODALS & TEMPLATES FOR TARGET NOTES ──

function openNoteTypeModal() {
  document.getElementById("note-type-modal-overlay")?.classList.add("show");
}

function closeNoteTypeModal() {
  document.getElementById("note-type-modal-overlay")?.classList.remove("show");
}

function createTargetStudyNote(type) {
  const todayKey = TODAY_KEY;
  const todayTasks = S.tasks.filter(t => t.deadline === todayKey);
  const activeTarget = todayTasks.find(t => t.status !== "Completed");
  if (!activeTarget) {
    toast("No active study target found for today.", "error");
    closeNoteTypeModal();
    return;
  }

  // Map subjects to folders
  let folder = "General Notes";
  if (activeTarget.subject === "SFM") folder = "Strategic Finance";
  else if (activeTarget.subject === "CEL") folder = "Corporate Laws";
  else if (activeTarget.subject === "DTIT") folder = "Direct Taxes";
  else if (activeTarget.subject === "SCM") folder = "Strategic Costs";

  const cleanTitle = activeTarget.title.replace(/^Day \d+\s*\([^)]*\):\s*/, "");
  const noteTitle = `[${type}] ${cleanTitle}`;
  
  let template = "";
  if (type === "Theory") {
    template = `### CONCEPT SUMMARY (THEORY)\n\n- **Core Theory Concept**: \n- **Syllabus / Section References**: \n- **Key Explanations & Provisions**: \n- **Important Points to Remember**: \n`;
  } else {
    template = `### PRACTICAL PROBLEM PRACTICE (SUM)\n\n- **Question / Scenario Details**: \n- **Core Formula Used**: \n- **Step-by-step Calculations**: \n- **Key Errors / Tricks to Avoid**: \n`;
  }

  const newNote = {
    id: `n_target_${Date.now()}`,
    folder: folder,
    title: noteTitle,
    content: template,
    tags: `${type}, ${activeTarget.subject}`,
    updatedAt: Date.now()
  };

  S.notes.push(newNote);
  S.activeNoteId = newNote.id;
  
  save();
  closeNoteTypeModal();
  
  // Switch to notes section
  switchSection("notes");
  
  // Refresh notes UI & select note
  renderNotesList();
  openNoteEditor(newNote.id);
  
  toast(`📝 New [${type}] note created under ${folder}!`, "success");
}
