/**
 * KDP Intelligence Pro - Niche Validation Engine
 * Calculates 'Niche Score' (0-100), 'Market Saturation' status, and 'Profit Potential'
 * based on complex Amazon sales velocity and organic signal matrices.
 */

export interface MarketSignals {
  demandScore?: number;        // Organic demand estimation (1 - 100)
  bsr?: number;                // Amazon Best Seller Rank (BSR, lower BSR means higher velocity)
  competitionScore?: number;   // Competition index (1 - 100)
  reviews?: number;            // Average review count for top catalog listings
  price?: number;              // Average sales price in USD (influence on margins)
  trendScore?: number;         // Google and Amazon search velocity trend (1 - 100)
}

export interface NicheValidationResult {
  nicheScore: number;          // Overall commercial index (0 - 100)
  marketSaturation: "Low Saturation" | "Moderately Saturated" | "Highly Saturated";
  profitPotential: "Low" | "Medium" | "High" | "Exceptional";
  difficultyRating: "Easy" | "Moderate" | "Hard";
  calculatedSearchesCount: number;
}

/**
 * Validates and scores a KDP publishing node based on raw market metrics.
 */
export function NicheValidationEngine(signals: MarketSignals): NicheValidationResult {
  // 1. Sanitize & Normalize Inputs
  const rawDemand = signals.demandScore !== undefined ? signals.demandScore : 55;
  const rawComp = signals.competitionScore !== undefined ? signals.competitionScore : 50;
  const bsrVal = signals.bsr !== undefined ? signals.bsr : 150000;
  const reviewCount = signals.reviews !== undefined ? signals.reviews : 100;
  const priceVal = signals.price !== undefined ? signals.price : 6.99;
  const trend = signals.trendScore !== undefined ? signals.trendScore : 70;

  const demand = Math.max(1, Math.min(100, rawDemand));
  const codeComp = Math.max(1, Math.min(100, rawComp));

  // Translate BSR (Best Seller Rank) to a 0-100 velocity score (Lower BSR = Higher score)
  // Exceptional BSR is < 20,000. Moderate is 20,000 - 150,000. Low is > 150,000.
  let bsrScore = 30;
  if (bsrVal < 10000) bsrScore = 98;
  else if (bsrVal < 30000) bsrScore = 90;
  else if (bsrVal < 80000) bsrScore = 78;
  else if (bsrVal < 150000) bsrScore = 60;
  else if (bsrVal < 300000) bsrScore = 45;
  else bsrScore = 20;

  // Translate Reviews to competition penalty matrix
  let reviewPenalty = 0;
  if (reviewCount > 1000) reviewPenalty = 30;
  else if (reviewCount > 500) reviewPenalty = 20;
  else if (reviewCount > 150) reviewPenalty = 10;
  else if (reviewCount > 50) reviewPenalty = 5;

  // Translate Price to profit multiplier (Standard KDP prices: $4.99 to $12.99 offer best royalties)
  let profitScore = 55;
  if (priceVal >= 6.99 && priceVal <= 11.99) {
    profitScore = 92; // Sweet spot for maximum organic profit margin
  } else if (priceVal >= 4.99 && priceVal < 6.99) {
    profitScore = 75;
  } else if (priceVal > 11.99) {
    profitScore = 65; // High pricing can suppress purchase frequency
  } else {
    profitScore = 40; // Too cheap, royalties eaten by print costs
  }

  // 2. Compute the formulated Niche Score (Market Opportunity Index)
  // Weights: demand * 30%, bsrScore * 25%, competitionEase * 20%, profitScore * 15%, trend * 10%
  const competitionEase = Math.max(0, 100 - codeComp);
  
  const weightedValue = 
    (demand * 0.30) + 
    (bsrScore * 0.25) + 
    (competitionEase * 0.20) + 
    (profitScore * 0.15) + 
    (trend * 0.10);
  
  // Apply minor penalty if review counts are extremely saturated
  const nicheScore = Math.max(1, Math.min(100, Math.round(weightedValue - reviewPenalty)));

  // 3. Determine Market Saturation Status
  let marketSaturation: "Low Saturation" | "Moderately Saturated" | "Highly Saturated";
  if (codeComp > 65 || reviewCount > 600) {
    marketSaturation = "Highly Saturated";
  } else if (codeComp > 42 || reviewCount > 120) {
    marketSaturation = "Moderately Saturated";
  } else {
    marketSaturation = "Low Saturation";
  }

  // 4. Calculate Profit Potential
  let profitPotential: "Low" | "Medium" | "High" | "Exceptional";
  if (profitScore >= 90 && codeComp < 60) {
    profitPotential = "Exceptional";
  } else if (profitScore >= 70 && codeComp < 75) {
    profitPotential = "High";
  } else if (profitScore >= 50) {
    profitPotential = "Medium";
  } else {
    profitPotential = "Low";
  }

  // 5. Calculate Difficulty Rating
  let difficultyRating: "Easy" | "Moderate" | "Hard";
  if (codeComp < 42 && reviewCount < 80) {
    difficultyRating = "Easy";
  } else if (codeComp < 65 && reviewCount < 400) {
    difficultyRating = "Moderate";
  } else {
    difficultyRating = "Hard";
  }

  // Backwards compatible calculated search volumes
  const calculatedSearchesCount = Math.round(demand * 125);

  return {
    nicheScore,
    marketSaturation,
    profitPotential,
    difficultyRating,
    calculatedSearchesCount
  };
}
