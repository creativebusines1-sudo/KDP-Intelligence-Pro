import React, { useState } from "react";
import { Search, Download, AlertCircle, HelpCircle, ShieldAlert, Award, Loader2 } from "lucide-react";
import { CompetitionAnalysisResult } from "../types";
import { exportCompetitionAnalysisCSV, exportToPDF } from "../utils/exportUtils";

export default function CompetitionAnalyzer() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompetitionAnalysisResult | null>(null);
  const [errorText, setErrorText] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setErrorText("");

      const res = await fetch("/api/competition-analyzer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query }),
      });

      if (!res.ok) {
        throw new Error("Unable to analyze market competition.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorText("Competitior search system timed out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    exportCompetitionAnalysisCSV(result);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const cleanKw = result.keywordOrNiche.toLowerCase().replace(/\s+/g, "_");
    exportToPDF("competition", result, `KDP_Competition_Assessment_${cleanKw}.pdf`);
  };

  const getRatingBadge = (rating: "Easy" | "Moderate" | "Hard") => {
    if (rating === "Easy") {
      return {
        label: "Easy to Rank",
        color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200"
      };
    }
    if (rating === "Moderate") {
      return {
        label: "Moderate Competition",
        color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200"
      };
    }
    return {
      label: "Hard/Extreme Competition",
      color: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200"
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-indigo-500" />
          KDP Competition Analyzer
        </h2>
        <p className="text-xs text-slate-505">
          Scan actual search keyword targets to audit the top three competitor books, average pricing points, monthly units moved, and listing saturation gauges.
        </p>
      </div>

      {/* Input controls */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search active title keywords or BSR topics (e.g. adhd budget agenda parent)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-405 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Audit Competitors
          </button>
        </div>

        {errorText && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorText}</span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-indigo-505 animate-spin" />
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">Running Amazon Competitor Diagnostics</h4>
            <p className="text-xs text-slate-400 font-mono">Compiling rating weights and extracting monthly sales index histories...</p>
          </div>
        </div>
      )}

      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in animate-duration-350">
          {/* Broad Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Competing Listings</span>
              <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">{result.totalCompetingBooks.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Avg Monthly Sales</span>
              <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">{result.estimatedSalesVolume.toLocaleString()} units</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Avg BSR Score</span>
              <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">{result.averageBSR.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Avg Retail Price</span>
              <p className="text-xl font-bold font-mono text-slate-850 dark:text-slate-100">${result.averagePrice.toFixed(2)}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Typical Reviews</span>
              <p className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100">{result.averageReviews.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Saturation Gauge</span>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{result.marketSaturationLevel}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Competitor Listings Detailed Grid */}
            <div className="lg:col-span-2 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Reviewing Live Competitors</h3>
                <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${getRatingBadge(result.rating).color}`}>
                  {getRatingBadge(result.rating).label}
                </span>
              </div>

              <div className="space-y-4">
                {result.competitors.map((bk, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4 text-xs hover:border-slate-310 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{bk.title}</h4>
                      <p className="text-[11px] text-slate-400">Author: {bk.author} | Released: {bk.publishedDate}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[10px] text-slate-500 font-mono">
                        <span>Price: <b className="text-slate-700 dark:text-slate-300">${bk.price}</b></span>
                        <span>BSR: <b className="text-slate-700 dark:text-slate-300">{bk.bsr.toLocaleString()}</b></span>
                        <span>Reviews: <b className="text-slate-700 dark:text-slate-300">{bk.reviews.toLocaleString()}</b></span>
                      </div>
                    </div>

                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded border border-indigo-100 dark:border-indigo-900/40 text-center font-mono whitespace-nowrap">
                      <span className="text-[9px] uppercase text-slate-400 block">Est, Sales</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{bk.estSales} / mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saturation Audit Sidebar */}
            <div className="lg:col-span-1 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Publishing Feasibility</h3>
                <p className="text-xs text-slate-400">Our assessment of whether you can comfortably secure a BSR ranking here.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-650 dark:text-slate-300 block">Rating: {result.rating}</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {result.rating === "Easy"
                      ? "A pristine niche with low listing coverages. Standard self-published titles can claim search-result page 1 using direct backend optimization."
                      : result.rating === "Moderate"
                      ? "Contains active medium-rank players with average review numbers on Amazon. Success requires high-quality customized cover details."
                      : "Strong commercial whales with massive review grids reside here. Proceed only if running targeted, daily Amazon AMS search campaigns."}
                  </p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-slate-650 dark:text-slate-300 block">Market Saturation: {result.marketSaturationLevel}</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {result.marketSaturationLevel === "Low"
                      ? "Subcategory is highly underserved. Plentiful search interest remains completely uncaptured."
                      : result.marketSaturationLevel === "Medium"
                      ? "A healthy, fluid KDP ecosystem with balanced daily trades and listings."
                      : "Heavily flooded with cheap templates. Differentiate by designing extremely specific sub-themes."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportCSV}
                  className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !isLoading && (
        <div className="py-24 text-center bg-slate-50 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <Award className="w-12 h-12 mx-auto text-slate-400" />
          <h4 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">Ready to audit competitors?</h4>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto animate-pulse">
            Enter a book category topic above to execute search queries and compile competitor books.
          </p>
        </div>
      )}
    </div>
  );
}
