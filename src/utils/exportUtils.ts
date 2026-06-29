import { jsPDF } from "jspdf";
import { 
  KeywordResearchResult, 
  NicheAnalysisResult, 
  CompetitionAnalysisResult, 
  ProfitCalculatorInput, 
  ProfitCalculatorResult, 
  RankTrackerItem,
  KdpDashboardData
} from "../types";

// ==========================================
// 1. GENERIC CSV EXPORTER HELPER
// ==========================================
export function exportToCSV(data: any[], headers: string[], filename: string): void {
  const sanitize = (val: any): string => {
    if (val === undefined || val === null) return "";
    let str = String(val).replace(/"/g, '""');
    if (str.includes(",") || str.includes("\n") || str.includes('"')) {
      str = `"${str}"`;
    }
    return str;
  };

  const csvRows: string[] = [];
  csvRows.push(headers.map(sanitize).join(","));

  for (const row of data) {
    csvRows.push(row.map(sanitize).join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// 2. CONCRETE CSV EXPORT HELPERS FOR KDP MODULES
// ==========================================

export function exportKeywordReportCSV(result: KeywordResearchResult): void {
  const headers = ["Metric", "Value", "Notes"];
  const rows = [
    ["Keyword Topic", result.keyword, "Primary seed term"],
    ["Search Volume", result.searchVolume, "Estimated monthly searches"],
    ["Competition Density", result.competition, "Organic competitor volume"],
    ["Trend Strength Index", result.trendScore, "Search interest momentum"],
    ["Market Opportunity Score", result.opportunityScore, "Scale of 1-100 (high is better)"],
    ["Difficulty Rating Index", result.keywordDifficulty, "Effort target (low is best)"],
    ["Buyer Search Intent", result.buyerIntent, "Monetization clarity"],
    ["Estimated Sales Potential", result.estimatedSalesPotential || "N/A", "Projected monthly copies"],
    ["Relevance Category", result.category || "General", "KDP category association"],
    ["Seasonality Factor", result.seasonality || "Steady", "Peak periods expectation"],
    ["Best Publishing Target", result.recommendationCategory || "Recommended", "KDP action vector"]
  ];

  // Append other lists as comma-separated values
  rows.push(["Primary Keywords", result.primaryKeywords.join("; "), "Co-occurring terms"]);
  rows.push(["Secondary Keywords", result.secondaryKeywords.join("; "), "Broad match modifiers"]);
  rows.push(["Long-Tail Extensions", result.longTailKeywords.join("; "), "Specific multi-word phrases"]);
  rows.push(["High-Intent Multipliers", result.buyerIntentKeywords.join("; "), "Commercial target words"]);
  rows.push(["Related Niche Terms", result.relatedKeywords.join("; "), "Synonyms and alternative topics"]);

  exportToCSV(rows, headers, `KDP_Keyword_Intelligence_${result.keyword.toLowerCase().replace(/\s+/g, "_")}.csv`);
}

export function exportNicheScanCSV(niches: NicheAnalysisResult[]): void {
  const headers = [
    "Niche Name", 
    "Opportunity Index", 
    "Demand Level", 
    "Competition Level", 
    "Profit Margin Index", 
    "Trend Growth %", 
    "Est. Monthly Searches", 
    "Average BSR", 
    "Competing Books", 
    "Recommendation Status"
  ];

  const rows = niches.map(n => [
    n.nicheName,
    n.marketOpportunityScore ?? n.nicheScore ?? 50,
    n.demandScore,
    n.competitionScore,
    n.profitabilityScore,
    n.trendGrowth ?? n.trendScore ?? 0,
    n.estimatedMonthlySearches,
    n.averageBSR,
    n.competingBooks,
    n.recommended ? "HIGH VIABILITY - Publish" : "POTENTIAL BARRIER - Monitor"
  ]);

  exportToCSV(rows, headers, `KDP_Niche_Database_Scan_${new Date().toISOString().split("T")[0]}.csv`);
}

export function exportCompetitionAnalysisCSV(result: CompetitionAnalysisResult): void {
  const headers = ["ASIN/Title", "Author", "Best Seller Rank (BSR)", "Price (USD)", "Reviews Count", "Est. Monthly Sales"];
  
  // Overall Summary Metrics First
  const rows = [
    ["SUM_OVERVIEW: Average Price", `$${result.averagePrice.toFixed(2)}`, "", "", "", ""],
    ["SUM_OVERVIEW: Average Reviews", result.averageReviews.toString(), "", "", "", ""],
    ["SUM_OVERVIEW: Average BSR", Math.round(result.averageBSR).toString(), "", "", "", ""],
    ["SUM_OVERVIEW: Total Estimated Monthly Sales", result.estimatedSalesVolume.toString(), "", "", "", ""],
    ["SUM_OVERVIEW: Market Saturation Rating", result.marketSaturationLevel, "", "", "", ""],
    ["", "", "", "", "", ""] // blank separator line
  ];

  // Add individual competitors
  result.competitors.forEach((c, idx) => {
    rows.push([
      `[Rank #${idx + 1}] ${c.title}`,
      c.author,
      c.bsr.toString(),
      `$${c.price.toFixed(2)}`,
      c.reviews.toString(),
      c.estSales.toString()
    ]);
  });

  exportToCSV(rows, headers, `KDP_Competition_Audit_${result.keywordOrNiche.toLowerCase().replace(/\s+/g, "_")}.csv`);
}

export function exportProfitCalculatorCSV(input: ProfitCalculatorInput, output: ProfitCalculatorResult): void {
  const headers = ["KDP Parameter Variable", "Input Value / Result Output", "Financial Explanation"];
  const rows = [
    ["Page Count", input.pageCount, "Total printed pages inside the book"],
    ["Sales Retail Price", `$${input.bookPrice.toFixed(2)}`, "KDP reader/customer sales price"],
    ["Binding & Interior Ink Type", input.bindingType, "Paper quality and ink cost category"],
    ["Cover/Hardcover Format", input.format, "Binding hardware category"],
    ["Target Domain Marketplace", input.marketplace, "Amazon retail regional sector"],
    ["Estimated Monthly Units sold", input.monthlyEstimatedSales, "Unit projections for earnings calculations"],
    ["----- RESULTS -----", "-----", "-----"],
    ["Printing Unit Production Cost", `$${output.printingCost.toFixed(2)}`, "Unit baseline fabrication cost subtracted from list price"],
    ["Royalty Percentage Rate", `${Math.round(output.royaltyRate * 100)}%`, "Contractual revenue share coefficient"],
    ["Net Royalty Profit Per Sale", `$${output.royaltyPerSale.toFixed(2)}`, "Actual margin payout per book sold"],
    ["Estimated Monthly Royalty Net", `$${output.monthlyEarnings.toFixed(2)}`, "Calculated payout based on volume"],
    ["Estimated Annual Royalty Net", `$${output.annualEarnings.toFixed(2)}`, "Yearly passive income projection"]
  ];

  exportToCSV(rows, headers, `KDP_Royalty_Profit_Projections_${input.pageCount}pg_$${input.bookPrice}.csv`);
}

export function exportRankTrackerHistoryCSV(items: RankTrackerItem[]): void {
  const headers = ["Tracked Subject", "Type", "ASIN / Keyword", "Current Rank", "Weekly Differential", "Log Date", "Log Rank"];
  const rows: any[] = [];

  items.forEach(item => {
    const diff = item.previousRank - item.currentRank;
    const weeklyText = diff > 0 ? `+${diff} places` : `${diff} places`;

    if (item.history && item.history.length > 0) {
      item.history.forEach(h => {
        rows.push([
          item.name,
          item.type.toUpperCase(),
          item.asin || "N/A (Organic Term)",
          item.currentRank,
          weeklyText,
          h.date,
          h.rank
        ]);
      });
    } else {
      rows.push([
        item.name,
        item.type.toUpperCase(),
        item.asin || "N/A (Organic Term)",
        item.currentRank,
        weeklyText,
        item.updatedAt.split("T")[0],
        item.currentRank
      ]);
    }
  });

  exportToCSV(rows, headers, `KDP_Rank_Tracker_Historical_Report_${new Date().toISOString().split("T")[0]}.csv`);
}


// ==========================================
// 3. COLOR PALETTE DEFINITION FOR PDF EXPORTS
// ==========================================
const S_PRIMARY = { r: 15, g: 23, b: 42 };      // Deep Slate (Text & Headers)
const S_ACCENT = { r: 245, g: 158, b: 11 };     // Amber/Gold (Vibrancy & Indicators)
const S_SUCCESS = { r: 34, g: 197, b: 94 };     // Emerald Green (High Score Indicators)
const S_INFO = { r: 59, g: 130, b: 246 };       // Blue (General charts/metrics)
const S_MUTED = { r: 100, g: 116, b: 139 };     // Secondary Slate
const S_LIGHT = { r: 248, g: 250, b: 252 };     // Soft light background card accent

// ==========================================
// 4. HIGHLY FORMATTED NATIVE PDF EXPORTER
// ==========================================
export function exportToPDF(
  docType: "keywords" | "niche" | "competition" | "profit" | "rank" | "dashboard" | "outline", 
  data: any, 
  filename: string
): void {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.width; // A4 standard width is 210mm
  const pageHeight = doc.internal.pageSize.height; // A4 standard height is 297mm
  
  let currentY = 15;

  // Header & Footer Helper functions
  const drawBackgroundDecoration = () => {
    // Elegant left sidebar vertical strip accent
    doc.setFillColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.rect(0, 0, 4, pageHeight, "F");
  };

  const drawDocumentHeader = (title: string, sub: string) => {
    drawBackgroundDecoration();
    
    // Top banner header card
    doc.setFillColor(F_COLOR_MAP(S_PRIMARY));
    doc.rect(10, 10, pageWidth - 20, 26, "F");

    // Decorative Gold border
    doc.setDrawColor(S_ACCENT.r, S_ACCENT.g, S_ACCENT.b);
    doc.setLineWidth(1);
    doc.line(10, 36, pageWidth - 10, 36);

    // Title text
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("AMAZON KDP PUBLISHER INTELLIGENCE PRO", 14, 18);

    // Document Specific Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(S_ACCENT.r, S_ACCENT.g, S_ACCENT.b);
    doc.text(title.toUpperCase(), 14, 25);

    // Subtitle & Time stamp
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    doc.text(`${sub}  |  Generated on ${dateStr}`, 14, 31);

    currentY = 46;
  };

  const drawFooter = (pageNum: number) => {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text("CONFIDENTIAL - FOR PERSONAL KDP PUBLISHING DECISIONS ONLY", 15, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - 22, pageHeight - 10);
  };

  const F_COLOR_MAP = (colorObj: { r: number, g: number, b: number }) => {
    return [colorObj.r, colorObj.g, colorObj.b] as any;
  };

  // ----------------------------------------
  // DRAW CORE Opportunity Dials
  // ----------------------------------------
  const drawScoreDial = (x: number, y: number, label: string, score: number, accentColor: typeof S_SUCCESS) => {
    // Background slot
    doc.setFillColor(230, 230, 230);
    const dialWidth = 40;
    doc.rect(x, y, dialWidth, 6, "F");

    // Filled score bar
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.rect(x, y, Math.max(1, Math.min(dialWidth, dialWidth * (score / 100))), 6, "F");

    // Title label & percentage
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`${label}: ${score}/100`, x, y - 2);
  };

  // ==========================================
  // CASE 1: KEYWORD INTEL REPORT (KDP Blueprints)
  // ==========================================
  if (docType === "keywords") {
    const kw: KeywordResearchResult = data;
    drawDocumentHeader("Keyword Intel & Opportunity blueprint", `Topic Query: "${kw.keyword}"`);

    // High level metrics row
    doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
    doc.rect(10, currentY, pageWidth - 20, 28, "F");
    doc.setDrawColor(218, 223, 230);
    doc.setLineWidth(0.3);
    doc.rect(10, currentY, pageWidth - 20, 28, "S");

    // Draw gauges inside high levels
    drawScoreDial(15, currentY + 12, "Opportunity Index", kw.opportunityScore, S_SUCCESS);
    drawScoreDial(65, currentY + 12, "Keyword Difficulty", kw.keywordDifficulty, kw.keywordDifficulty > 60 ? S_ACCENT : S_SUCCESS);
    drawScoreDial(115, currentY + 12, "Trend Strength Index", kw.trendScore, S_INFO);
    drawScoreDial(160, currentY + 12, "Search Volume Match", Math.min(100, Math.round(kw.searchVolume / 150)), S_MUTED);

    // Small metric texts
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`Buyer Intent: `, 15, currentY + 23);
    doc.setFont("Helvetica", "bold");
    doc.text(kw.buyerIntent, 33, currentY + 23);

    doc.setFont("Helvetica", "normal");
    doc.text(`Est. Sales Volume: `, 65, currentY + 23);
    doc.setFont("Helvetica", "bold");
    doc.text(`${kw.estimatedSalesPotential ?? "Moderate Velocity"} units/mo`, 93, currentY + 23);

    doc.setFont("Helvetica", "normal");
    doc.text(`KDP Classification: `, 130, currentY + 23);
    doc.setFont("Helvetica", "bold");
    doc.text(kw.category || "Unassigned General niche", 157, currentY + 23);

    currentY += 36;

    // Recommendation card
    doc.setFillColor(254, 243, 199); // Light yellow
    doc.rect(10, currentY, pageWidth - 20, 22, "F");
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.rect(10, currentY, pageWidth - 20, 22, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(180, 83, 9);
    doc.text(`PUBLISHING RECOMMENDATION DICTUM: ${kw.recommendationCategory || "WORTHY LAUNCH"}`, 15, currentY + 6);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    const splitEx = doc.splitTextToSize(kw.decisionExplanation || "Highly viable opportunity area with optimized commercial factors. Suitable for immediate release as part of a structured brand ecosystem portfolio expansion.", pageWidth - 30);
    doc.text(splitEx, 15, currentY + 11);

    currentY += 28;

    // Keyword SEO Expansion matrix
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("SEMANTIC KEYWORD TARGET MAP", 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

    currentY += 8;
    const kwBoxWidth = (pageWidth - 25) / 2;

    // Left Column: Semantic targets
    doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
    doc.rect(10, currentY, kwBoxWidth, 48, "F");
    doc.rect(10, currentY, kwBoxWidth, 48, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("Co-occurring & Broad Keywords", 14, currentY + 6);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    const firstList = (kw.primaryKeywords || []).concat(kw.secondaryKeywords || []).slice(0, 6);
    firstList.forEach((term, id) => {
      doc.text(`• ${term}`, 15, currentY + 13 + (id * 5.5));
    });

    // Right Column: Long-Tail opportunities
    doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
    doc.rect(10 + kwBoxWidth + 5, currentY, kwBoxWidth, 48, "F");
    doc.rect(10 + kwBoxWidth + 5, currentY, kwBoxWidth, 48, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("Long-Tail Conversion Captures", 10 + kwBoxWidth + 9, currentY + 6);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    const secondList = (kw.longTailKeywords || []).concat(kw.buyerIntentKeywords || []).slice(0, 6);
    secondList.forEach((term, id) => {
      doc.text(`• ${term}`, 10 + kwBoxWidth + 10, currentY + 13 + (id * 5.5));
    });

    currentY += 56;

    // Competitor Audit list if provided
    if (kw.competitorsTop20 && kw.competitorsTop20.length > 0) {
      if (currentY > pageHeight - 75) {
        doc.addPage();
        drawBackgroundDecoration();
        currentY = 20;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
      doc.text("TOP AMAZON COMPETITOR CATALOG EXPOSITIONS", 10, currentY);
      doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

      currentY += 8;

      // Draw minimal header
      doc.setFillColor(235, 240, 246);
      doc.rect(10, currentY, pageWidth - 20, 7, "F");
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
      doc.text("Rank # / Listing Title", 13, currentY + 5);
      doc.text("BSR Score", 115, currentY + 5);
      doc.text("Price USD", 140, currentY + 5);
      doc.text("Reviews", 160, currentY + 5);
      doc.text("Rating", 182, currentY + 5);

      currentY += 7;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);

      const itemsToRender = kw.competitorsTop20.slice(0, 8);
      itemsToRender.forEach((comp, idx) => {
        // Alternating row colored backgrounds
        if (idx % 2 === 1) {
          doc.setFillColor(247, 249, 251);
          doc.rect(10, currentY, pageWidth - 20, 6, "F");
        }

        const rawTitle = comp.title;
        const truncatedTitle = rawTitle.length > 55 ? rawTitle.substring(0, 52) + "..." : rawTitle;

        doc.text(`${idx + 1}.  ${truncatedTitle}`, 12, currentY + 4.5);
        doc.text(comp.bsr.toLocaleString(), 115, currentY + 4.5);
        doc.text(`$${comp.price.toFixed(2)}`, 140, currentY + 4.5);
        doc.text(comp.reviews.toString(), 160, currentY + 4.5);
        doc.text(`${comp.rating}/5.0`, 182, currentY + 4.5);
        
        currentY += 6;
      });
    }

    drawFooter(1);
  }

  // ==========================================
  // CASE 2: NICHE GRID DISCOVERY DISSERTATIONS
  // ==========================================
  else if (docType === "niche") {
    const niches: NicheAnalysisResult[] = Array.isArray(data) ? data : [data];
    drawDocumentHeader("Niche Core Viability Audit Report", "Comparative Commercial Index Matrix");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("VALUATIONS OF COMPARATIVE KDP STATIONS", 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

    currentY += 8;

    // Header values
    doc.setFillColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.rect(10, currentY, pageWidth - 20, 8, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Target Niche Station", 13, currentY + 5.5);
    doc.text("Demand", 82, currentY + 5.5);
    doc.text("Competition", 100, currentY + 5.5);
    doc.text("Profit Index", 123, currentY + 5.5);
    doc.text("Niche Opportunity Score", 148, currentY + 5.5);
    doc.text("Viability", 188, currentY + 5.5);

    currentY += 8;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    niches.forEach((n, idx) => {
      if (idx % 2 === 1) {
        doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
        doc.rect(10, currentY, pageWidth - 20, 7.5, "F");
      }

      const truncatedName = n.nicheName.length > 34 ? n.nicheName.substring(0, 31) + "..." : n.nicheName;
      doc.text(truncatedName, 12, currentY + 5);
      
      doc.text(`${n.demandScore}/100`, 82, currentY + 5);
      doc.text(`${n.competitionScore}/100`, 100, currentY + 5);
      doc.text(`${n.profitabilityScore}/100`, 123, currentY + 5);
      
      // Color-coded scores
      const score = n.marketOpportunityScore ?? n.nicheScore ?? 50;
      doc.setFont("Helvetica", "bold");
      if (score >= 70) doc.setTextColor(S_SUCCESS.r, S_SUCCESS.g, S_SUCCESS.b);
      else if (score >= 45) doc.setTextColor(S_ACCENT.r, S_ACCENT.g, S_ACCENT.b);
      else doc.setTextColor(239, 68, 68);
      
      doc.text(`${score}`, 148, currentY + 5);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(51, 65, 85);

      const viability = n.recommended ? "EXCELLENT" : "MONITOR";
      if (viability === "EXCELLENT") doc.setTextColor(S_SUCCESS.r, S_SUCCESS.g, S_SUCCESS.b);
      else doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
      
      doc.text(viability, 188, currentY + 5);
      doc.setTextColor(51, 65, 85);

      currentY += 7.5;
    });

    // Drawing simple native visual chart
    if (currentY < pageHeight - 90 && niches.length > 0) {
      currentY += 12;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
      doc.text("CORE COMPARISON GRAPH - OPPORTUNITY INDEXES", 10, currentY);
      doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

      currentY += 10;

      // Draw custom visual bar graph
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      // Y and X axes lines
      doc.line(40, currentY, 40, currentY + 45); // Y
      doc.line(40, currentY + 45, pageWidth - 20, currentY + 45); // X

      const comparisonNiches = niches.slice(0, 5);
      comparisonNiches.forEach((n, i) => {
        const barY = currentY + 5 + (i * 8);
        const score = n.marketOpportunityScore ?? n.nicheScore ?? 50;
        const mappedWidth = (pageWidth - 70) * (score / 100);

        // Draw bar
        doc.setFillColor(S_INFO.r, S_INFO.g, S_INFO.b);
        doc.rect(41, barY, Math.max(2, mappedWidth), 4.5, "F");

        // Bar labels
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
        const nameLabel = n.nicheName.length > 15 ? n.nicheName.substring(0, 13) + "..." : n.nicheName;
        doc.text(nameLabel, 12, barY + 3.5);

        // End score value
        doc.text(score.toString(), 44 + mappedWidth, barY + 3.5);
      });
    }

    drawFooter(1);
  }

  // ==========================================
  // CASE 3: COMPETITION INTENSITY EXPOSURES
  // ==========================================
  else if (docType === "competition") {
    const comp: CompetitionAnalysisResult = data;
    drawDocumentHeader("Competitor Intelligence Assessment", `Target Niche: "${comp.keywordOrNiche}"`);

    // Draw high level grids
    doc.setFillColor(241, 245, 249);
    doc.rect(10, currentY, pageWidth - 20, 22, "F");
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(10, currentY, pageWidth - 20, 22, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    
    doc.text("AVERAGE BOOK PRICE", 15, currentY + 7);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`$${comp.averagePrice.toFixed(2)}`, 15, currentY + 15);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text("AVERAGE REVIEW DECK", 60, currentY + 7);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(Math.round(comp.averageReviews).toLocaleString(), 60, currentY + 15);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text("MIDPOINT CATALOG BSR", 110, currentY + 7);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(Math.round(comp.averageBSR).toLocaleString(), 110, currentY + 15);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text("ESTIMATED MONTHLY SALES", 152, currentY + 7);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`${comp.estimatedSalesVolume.toLocaleString()} units`, 152, currentY + 15);

    currentY += 30;

    // Saturation and difficulty rows
    doc.setFillColor(254, 242, 242); // soft red
    doc.rect(10, currentY, pageWidth - 20, 16, "F");
    doc.setDrawColor(248, 113, 113);
    doc.rect(10, currentY, pageWidth - 20, 16, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(220, 38, 38);
    doc.text(`MARKET SATURATION SPECTRUM: ${comp.marketSaturationLevel.toUpperCase()}`, 15, currentY + 6.5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(127, 29, 29);
    doc.text(`Entering Difficulty Threshold: ${comp.rating} to break organically past the current established high volume catalogs.`, 15, currentY + 11.5);

    currentY += 23;

    // Competitor table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("COMPETING PORTFOLIO ENTRIES DOCKET", 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

    currentY += 8;

    // Header values
    doc.setFillColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.rect(10, currentY, pageWidth - 20, 7.5, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Title Keyword Exposition", 13, currentY + 5);
    doc.text("Author", 95, currentY + 5);
    doc.text("BSR Value", 128, currentY + 5);
    doc.text("Price US", 154, currentY + 5);
    doc.text("Rev Count", 172, currentY + 5);
    doc.text("Est. Sale/Mo", 190, currentY + 5);

    currentY += 7.5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(64, 64, 64);

    comp.competitors.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
        doc.rect(10, currentY, pageWidth - 20, 6.5, "F");
      }

      const truncT = item.title.length > 40 ? item.title.substring(0, 37) + "..." : item.title;
      doc.text(truncT, 12, currentY + 4.5);
      
      const truncA = item.author.length > 15 ? item.author.substring(0, 13) + "..." : item.author;
      doc.text(truncA, 95, currentY + 4.5);
      
      doc.text(item.bsr.toLocaleString(), 128, currentY + 4.5);
      doc.text(`$${item.price.toFixed(2)}`, 154, currentY + 4.5);
      doc.text(item.reviews.toString(), 172, currentY + 4.5);
      doc.text(item.estSales.toString(), 190, currentY + 4.5);

      currentY += 6.5;
    });

    drawFooter(1);
  }

  // ==========================================
  // CASE 4: PROFIT CORE LEDGERS
  // ==========================================
  else if (docType === "profit") {
    const calc: { input: ProfitCalculatorInput; output: ProfitCalculatorResult } = data;
    drawDocumentHeader("Royalty, Margins & Cost Assessment Report", "KDP Printing overhead vs Revenue Yield calculations");

    // Left card box (Config Details)
    doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
    doc.rect(10, currentY, 85, 60, "F");
    doc.setDrawColor(203, 213, 225);
    doc.rect(10, currentY, 85, 60, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("SPECIFICATION METRIC DECK", 14, currentY + 6);
    doc.line(14, currentY + 8, 85, currentY + 8);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text(`Publication Page Length: `, 14, currentY + 14);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`${calc.input.pageCount} pages`, 53, currentY + 14);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text(`Sales Retail Pricing: `, 14, currentY + 20);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`$${calc.input.bookPrice.toFixed(2)}`, 53, currentY + 20);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text(`Ink interior density: `, 14, currentY + 26);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(calc.input.bindingType, 53, currentY + 26);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text(`Format Class: `, 14, currentY + 32);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(calc.input.format, 53, currentY + 32);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text(`Amazon Channel: `, 14, currentY + 38);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(calc.input.marketplace.toUpperCase(), 53, currentY + 38);

    doc.setFont("Helvetica", "normal");
    doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
    doc.text(`Est. Monthly Copies: `, 14, currentY + 44);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`${calc.input.monthlyEstimatedSales} units`, 53, currentY + 44);

    // Right card box (Financial summary projections)
    doc.setFillColor(254, 252, 232); // Amber light focus
    doc.rect(100, currentY, pageWidth - 110, 60, "F");
    doc.setDrawColor(245, 158, 11);
    doc.rect(100, currentY, pageWidth - 110, 60, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9);
    doc.text("ROYALTY MARGIN PERFORMANCE", 104, currentY + 6);
    doc.line(104, currentY + 8, pageWidth - 104, currentY + 8);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 4);
    doc.text(`Printing Unit Cost: `, 104, currentY + 14);
    doc.setFont("Helvetica", "bold");
    doc.text(`$${calc.output.printingCost.toFixed(2)}`, 147, currentY + 14);

    doc.setFont("Helvetica", "normal");
    doc.text(`Contract Royalty: `, 104, currentY + 20);
    doc.setFont("Helvetica", "bold");
    doc.text(`${Math.round(calc.output.royaltyRate * 100)}%`, 147, currentY + 20);

    doc.setFont("Helvetica", "normal");
    doc.text(`Profit margin per sale: `, 104, currentY + 28);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_SUCCESS.r, S_SUCCESS.g, S_SUCCESS.b);
    doc.text(`$${calc.output.royaltyPerSale.toFixed(2)}`, 147, currentY + 28);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(120, 53, 4);
    doc.text(`Est. Monthly Royalties: `, 104, currentY + 38);
    doc.setFont("Helvetica", "bold");
    doc.text(`$${calc.output.monthlyEarnings.toFixed(2)}`, 147, currentY + 38);

    doc.setFont("Helvetica", "normal");
    doc.text(`Est. Annual Passive Income: `, 104, currentY + 44);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`$${calc.output.annualEarnings.toFixed(2)}`, 147, currentY + 44);

    currentY += 72;

    // Draw visual distribution chart inside pdf
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("FINANCIAL SPLIT DISTRIBUTION PIE CHART", 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

    currentY += 10;

    // Let's draw bar distribution comparisons
    const printCost = calc.output.printingCost;
    const netProfit = calc.output.royaltyPerSale;
    const amazonCut = calc.input.bookPrice - (printCost + netProfit);

    const total = calc.input.bookPrice;
    const pctPrint = printCost / total;
    const pctProfit = netProfit / total;
    const pctAmazon = amazonCut / total;

    const fullWidth = pageWidth - 20;
    
    // Draw horizontal split bar representing royalty vs base printing cost
    doc.setFillColor(239, 68, 68); // Red for print core
    doc.rect(10, currentY + 3, fullWidth * pctPrint, 10, "F");

    doc.setFillColor(156, 163, 175); // Gray for Amazon fee
    doc.rect(10 + (fullWidth * pctPrint), currentY + 3, fullWidth * pctAmazon, 10, "F");

    doc.setFillColor(S_SUCCESS.r, S_SUCCESS.g, S_SUCCESS.b); // Green for margin
    doc.rect(10 + (fullWidth * (pctPrint + pctAmazon)), currentY + 3, fullWidth * pctProfit, 10, "F");

    currentY += 22;

    // Legend
    doc.setFillColor(239, 68, 68);
    doc.rect(12, currentY, 3, 3, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`Print overhead cost: $${printCost.toFixed(2)} (${Math.round(pctPrint * 100)}%)`, 18, currentY + 2.5);

    doc.setFillColor(156, 163, 175);
    doc.rect(12, currentY + 6, 3, 3, "F");
    doc.text(`Amazon platform fee: $${amazonCut.toFixed(2)} (${Math.round(pctAmazon * 100)}%)`, 18, currentY + 8.5);

    doc.setFillColor(S_SUCCESS.r, S_SUCCESS.g, S_SUCCESS.b);
    doc.rect(12, currentY + 12, 3, 3, "F");
    doc.text(`NET Margins Royalties: $${netProfit.toFixed(2)} (${Math.round(pctProfit * 100)}%)`, 18, currentY + 14.5);

    drawFooter(1);
  }

  // ==========================================
  // CASE 5: ASIN & KEYWORD TRACKING HISTORIES
  // ==========================================
  else if (docType === "rank") {
    const items: RankTrackerItem[] = Array.isArray(data) ? data : [data];
    drawDocumentHeader("Rank Trajectory Trackers", "Amazon organic tracking timelines and velocity logs");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("ACTIVE KDP ASIN LOGS AND ORGANIC POSITIONS", 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

    currentY += 8;

    items.forEach((item, idx) => {
      if (currentY > pageHeight - 65) {
        doc.addPage();
        drawBackgroundDecoration();
        currentY = 20;
      }

      doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
      doc.rect(10, currentY, pageWidth - 20, 42, "F");
      doc.setDrawColor(218, 223, 230);
      doc.rect(10, currentY, pageWidth - 20, 42, "S");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
      doc.text(`Tracked Target #${idx + 1}: ${item.name}`, 14, currentY + 6);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
      doc.text(`Type: ${item.type.toUpperCase()}`, 14, currentY + 11);
      doc.text(`ID/ASIN: ${item.asin || "Organic Keyword"}`, 55, currentY + 11);
      
      const lastDate = item.updatedAt ? item.updatedAt.split("T")[0] : "N/A";
      doc.text(`Last Logged: ${lastDate}`, 110, currentY + 11);

      // Rank values block
      doc.setFillColor(255, 255, 255);
      doc.rect(14, currentY + 15, pageWidth - 28, 22, "F");
      doc.rect(14, currentY + 15, pageWidth - 28, 22, "S");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
      doc.text("Current Active Rank:", 18, currentY + 22);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`#${item.currentRank.toLocaleString()}`, 18, currentY + 28);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      const diff = item.previousRank - item.currentRank;
      const progressText = diff > 0 ? `Unleashed Gain: +${diff} spots` : `Friction Shift: ${diff} spots`;
      doc.text(progressText, 70, currentY + 22);

      // Draw simple line history visual inside pdf
      doc.setFont("Helvetica", "normal");
      doc.text("Historical Rank Chart Trace:", 120, currentY + 20);

      // Simple ascii timeline or points
      if (item.history && item.history.length > 0) {
        let textTimeline = "";
        item.history.slice(-6).forEach(h => {
          textTimeline += `[${h.date.substring(5)}: #${h.rank}] `;
        });
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
        doc.text(textTimeline, 120, currentY + 26);
      } else {
        doc.setFont("Helvetica", "normal");
        doc.text("Trajectory waiting updates...", 120, currentY + 26);
      }

      currentY += 48;
    });

    drawFooter(1);
  }

  // ==========================================
  // CASE 6: OUTLINE BLUEPRINTS
  // ==========================================
  else if (docType === "outline") {
    const outline = data;
    drawDocumentHeader("Structural KDP Book Outline Blueprint", `Publication: "${outline.title}"`);

    doc.setFillColor(S_LIGHT.r, S_LIGHT.g, S_LIGHT.b);
    doc.rect(10, currentY, pageWidth - 20, 20, "F");
    doc.setDrawColor(220, 225, 230);
    doc.rect(10, currentY, pageWidth - 20, 20, "S");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text(`Format Niche: ${outline.niche}`, 14, currentY + 6);
    doc.text(`Book Pattern Type: ${outline.bookType}`, 14, currentY + 12);
    doc.text(`Target Audience Focus: ${outline.targetAudience}`, 100, currentY + 6);

    currentY += 28;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
    doc.text("CHAPTER OUTLINE STRUCTURAL SEQUENCES", 10, currentY);
    doc.line(10, currentY + 2, pageWidth - 10, currentY + 2);

    currentY += 8;

    const chapters = outline.chapters || [];
    chapters.forEach((ch: any, idx: number) => {
      if (currentY > pageHeight - 55) {
        doc.addPage();
        drawBackgroundDecoration();
        currentY = 20;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(S_PRIMARY.r, S_PRIMARY.g, S_PRIMARY.b);
      doc.text(`Chapter ${ch.chapterNumber}: ${ch.title}`, 12, currentY);
      
      currentY += 4;

      if (ch.sections && ch.sections.length > 0) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(S_MUTED.r, S_MUTED.g, S_MUTED.b);
        ch.sections.forEach((sect: string, sIdx: number) => {
          doc.text(`  Section ${ch.chapterNumber}.${sIdx + 1}: ${sect}`, 15, currentY);
          currentY += 4.5;
        });
      }

      if (ch.kdpTips) {
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(S_ACCENT.r, S_ACCENT.g, S_ACCENT.b);
        doc.text(`* KDP Formatting Tip: ${ch.kdpTips}`, 15, currentY);
        currentY += 5;
      }

      currentY += 3;
    });

    drawFooter(1);
  }

  // Save/Download operation
  doc.save(filename);
}
