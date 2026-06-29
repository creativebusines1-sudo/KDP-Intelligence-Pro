export interface KeywordResearchResult {
  keyword: string;
  searchVolume: number;
  competition: "Low" | "Medium" | "High";
  trendScore: number; // 0-100
  opportunityScore: number; // 0-100
  keywordDifficulty: number; // 0-100
  recommended: boolean;
  buyerIntent: "Informational" | "High Intent" | "Transactional";
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  buyerIntentKeywords: string[];
  relatedKeywords: string[];

  // Multi-Source Intelligence & Confidence extensions
  volumeConfidence?: number;
  competitionConfidence?: number;
  trendConfidence?: number;
  revenueConfidence?: number;
  opportunityConfidence?: number;
  difficultyConfidence?: number;
  searchTrendPercent?: string;
  category?: string;
  seasonality?: string;
  estimatedSalesPotential?: number;
  recommendationCategory?: "Publish Immediately" | "Strong Opportunity" | "Worth Testing" | "Monitor Trend" | "Avoid";
  decisionExplanation?: string;
  validationStatus?: {
    validated: string[];
    unvalidated: string[];
    emerging: string[];
    declining: string[];
  };
  trustReasoning?: {
    why: string;
    factors: string[];
    sourcesUsed: string[];
  };
  competitorsTop20?: Array<{
    title: string;
    subtitle?: string;
    author: string;
    bsr: number;
    price: number;
    reviews: number;
    rating: number;
    pageCount: number;
    publishedDate: string;
    categories: string[];
  }>;
  competitorInsights?: {
    strengths: string[];
    weaknesses: string[];
    contentGaps: string[];
    keywordGaps: string[];
    categoryGaps: string[];
    marketOpportunities: string[];
  };
  reviewAnalysis?: {
    complaints: string[];
    requests: string[];
    missingFeatures: string[];
    improvements: string[];
    suggestions: string[];
  };
  trendForecast?: {
    days30: "Rising" | "Stable" | "Declining";
    days90: "Rising" | "Stable" | "Declining";
    days180: "Rising" | "Stable" | "Declining";
    year1: "Rising" | "Stable" | "Declining";
    year3: "Rising" | "Stable" | "Declining";
    sourceGoogleTrends: number[];
    sourceAmazonTrends: number[];
    explanation: string;
  };
  seasonalityReport?: {
    peakHoliday: string;
    bestPublishingDate: string;
    bestLaunchDate: string;
    expectedPeakDemand: "Extreme" | "High" | "Moderate" | "Steady";
  };
}

export interface KeywordCluster {
  id: string;
  topic: string;
  keywords: string[];
}

export interface NicheAnalysisResult {
  id: string;
  nicheName: string;
  demandScore: number; // 1-100
  competitionScore: number; // 1-100
  profitabilityScore: number; // 1-100
  trendScore: number; // 1-100
  marketOpportunityScore: number; // 0-100 formula-based
  estimatedMonthlySearches: number;
  averageBSR: number;
  competingBooks: number;
  tags: string[];

  // Advanced validation extensions
  nicheScore?: number;
  marketSaturation?: string;
  difficultyRating?: "Easy" | "Moderate" | "Hard";
  profitPotential?: "Low" | "Medium" | "High" | "Exceptional";
  recommended?: boolean;
  averageReviewCount?: number;
  priceRange?: string;
  competitionDensity?: string;
  salesVelocity?: number;
  trendGrowth?: number;
  categoryStrength?: number;
  volumeConfidence?: number;
  competitionConfidence?: number;
  demandConfidence?: number;
  trendConfidence?: number;
  opportunityConfidence?: number;
  trustReasoning?: {
    why: string;
    factors: string[];
    sourcesUsed: string[];
  };
}

export interface CompetitionAnalysisResult {
  keywordOrNiche: string;
  totalCompetingBooks: number;
  averageReviews: number;
  averagePrice: number;
  averageBSR: number;
  estimatedSalesVolume: number;
  marketSaturationLevel: "Low" | "Medium" | "High";
  rating: "Easy" | "Moderate" | "Hard";
  competitors: Array<{
    title: string;
    author: string;
    bsr: number;
    price: number;
    reviews: number;
    estSales: number;
    publishedDate: string;
    coverUrl?: string;
  }>;
}

export interface BookIdeaResult {
  niche: string;
  targetAudience: string;
  titles: string[]; // up to 50
  subtitles: string[]; // up to 20
  categories: string[]; // up to 10
  keywordOpportunities: string[];
  validation?: {
    demandScore: number;
    competitionScore: number;
    trendScore: number;
    categoryStrength: number;
    revenuePotential: number;
    successProbability: number; // 0-100%
    explanation: string;
  };
}

export interface ListingOptimizerInput {
  title: string;
  subtitle: string;
  description: string;
  targetNiche?: string;
}

export interface ListingOptimizerResult {
  seoScore: number; // 0-100
  keywordDensity: Array<{ keyword: string; count: number; percentage: number }>;
  missingKeywords: string[];
  recommendations: string[];
  optimizedTitle: string;
  optimizedSubtitle: string;
  optimizedDescription: string;
  backendKeywords: string[]; // 7 slots standard
}

export interface CategoryFinderResult {
  niche: string;
  categories: Array<{
    name: string;
    type: "Primary" | "Secondary" | "Hidden";
    avgBSR: number;
    competitionLevel: "Low" | "Medium" | "High";
    estimatedSales: number;
    relevanceScore: number;
  }>;
}

export interface BookOutlineResult {
  title: string;
  niche: string;
  bookType: "Non-Fiction" | "Workbook" | "Journal" | "Planner";
  targetAudience: string;
  tableOfContents: string[];
  chapters: Array<{
    chapterNumber: number;
    title: string;
    sections: string[];
    activities?: string[];
    kdpTips?: string; // Guidance for formatting or structure for low/medium content
  }>;
}

export interface ProfitCalculatorInput {
  pageCount: number;
  bookPrice: number;
  bindingType: "black-white" | "color-standard" | "color-premium";
  format: "paperback" | "hardcover";
  marketplace: "amazon.com" | "amazon.co.uk" | "amazon.de";
  monthlyEstimatedSales: number;
}

export interface ProfitCalculatorResult {
  printingCost: number;
  royaltyRate: number; // percentage, e.g. 0.60
  royaltyPerSale: number;
  monthlyEarnings: number;
  annualEarnings: number;
}

export interface RankTrackerItem {
  id: string;
  type: "book" | "keyword";
  name: string; // book title or keyword
  asin?: string; // if book
  currentRank: number;
  previousRank: number;
  rankType: "BSR" | "Keyword Search";
  category?: string; // if tracking BSR in a specific category
  updatedAt: string;
  history: Array<{
    date: string; // YYYY-MM-DD
    rank: number;
  }>;
}

export interface TrendNicheItem {
  niche: string;
  type: "Rising" | "Seasonal" | "Evergreen" | "Trending Category";
  growthRate: number; // percentage
  opportunityScore: number;
  competitionLevel: "Low" | "Medium" | "High";
  avgBSR: number;
}

export interface SearchHistoryEntry {
  id: string;
  type: "keyword" | "niche" | "competition" | "optimization" | "outline";
  query: string;
  timestamp: string;
}

export interface SavedProject {
  id: string;
  name: string;
  description?: string;
  status?: "Draft" | "Published" | "Researching";
  createdAt: string;
  keywords: KeywordResearchResult[];
  niches: NicheAnalysisResult[];
  rankTrackers: RankTrackerItem[];
}

export interface KdpDashboardData {
  summary: {
    totalProjectCount: number;
    trackedKeywordsCount: number;
    trackedBooksCount: number;
    savedIdeasCount: number;
    averageOpportunityScore: number;
  };
  recentHistory: SearchHistoryEntry[];
}
