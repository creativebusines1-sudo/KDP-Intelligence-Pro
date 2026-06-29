/**
 * NicheValidationEngine - Core helper engine for calculating
 * KDP commercial viability metrics including Niche Score, Market Saturation,
 * and Profit Potential based on market data indicators.
 */

export interface MarketDataInput {
  demandScore: number;         // Scale of 1 to 100
  competitionScore: number;    // Scale of 1 to 100
  profitabilityScore: number;  // Scale of 1 to 100
  trendScore?: number;         // Scale of 1 to 100 (optional, default: 70)
  salesVelocity?: number;      // Scale of 1 to 100 (optional, default: 60)
  reviewGap?: number;          // Scale of 1 to 100 (optional, default: 50)
}

export interface ValidationOutput {
  nicheScore: number;
  marketSaturation: "Highly Saturated" | "Moderately Saturated" | "Low Saturation";
  profitPotential: "Low" | "Medium" | "High" | "Exceptional";
  difficultyRating: "Easy" | "Moderate" | "Hard";
  recommended: boolean;
}

export function NicheValidationEngine(data: MarketDataInput): ValidationOutput {
  const demandScore = Math.max(1, Math.min(100, data.demandScore));
  const competitionScore = Math.max(1, Math.min(100, data.competitionScore));
  const profitabilityScore = Math.max(1, Math.min(100, data.profitabilityScore));
  const trendScore = data.trendScore !== undefined ? Math.max(1, Math.min(100, data.trendScore)) : 70;
  const salesVelocity = data.salesVelocity !== undefined ? Math.max(1, Math.min(100, data.salesVelocity)) : 65;
  const reviewGap = data.reviewGap !== undefined ? Math.max(1, Math.min(100, data.reviewGap)) : 55;

  // 1. Calculate Niche Score (Proprietary Market Opportunity Index)
  // Formula: (demandScore * 35%) + ((100 - competitionScore) * 25%) + (trendScore * 15%) + (salesVelocity * 15%) + (reviewGap * 10%)
  const competitionEase = Math.max(0, Math.min(100, 100 - competitionScore));
  const rawScore = 
    (demandScore * 0.35) + 
    (competitionEase * 0.25) + 
    (trendScore * 0.15) + 
    (salesVelocity * 0.15) + 
    (reviewGap * 0.10);
  
  const nicheScore = Math.max(1, Math.min(100, Math.round(rawScore)));

  // 2. Calculate Market Saturation Level
  let marketSaturation: "Highly Saturated" | "Moderately Saturated" | "Low Saturation";
  if (competitionScore > 65) {
    marketSaturation = "Highly Saturated";
  } else if (competitionScore > 45) {
    marketSaturation = "Moderately Saturated";
  } else {
    marketSaturation = "Low Saturation";
  }

  // 3. Calculate Profit Potential
  let profitPotential: "Low" | "Medium" | "High" | "Exceptional";
  if (profitabilityScore > 88) {
    profitPotential = "Exceptional";
  } else if (profitabilityScore > 78) {
    profitPotential = "High";
  } else if (profitabilityScore > 55) {
    profitPotential = "Medium";
  } else {
    profitPotential = "Low";
  }

  // 4. Calculate Difficulty Rating
  let difficultyRating: "Easy" | "Moderate" | "Hard";
  if (competitionScore < 45) {
    difficultyRating = "Easy";
  } else if (competitionScore < 60) {
    difficultyRating = "Moderate";
  } else {
    difficultyRating = "Hard";
  }

  // 5. Determine Overall Recommendation Flag
  const recommended = demandScore >= 75 && competitionScore <= 55;

  return {
    nicheScore,
    marketSaturation,
    profitPotential,
    difficultyRating,
    recommended
  };
}
