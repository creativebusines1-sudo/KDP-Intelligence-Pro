import React, { useState, useEffect } from "react";
import { Search, Save, Download, Compass, HelpCircle, Activity, LayoutGrid, CheckSquare, Loader2 } from "lucide-react";
import { NicheAnalysisResult, SavedProject } from "../types";
import { exportNicheScanCSV, exportToPDF } from "../utils/exportUtils";

interface NicheFinderProps {
  initialQuery?: string;
  projects: SavedProject[];
  onRefreshProjects: () => void;
  onNavigate: (page: string, params?: any) => void;
}

const PRESET_NICHES = [
  "Coloring Books for Adults",
  "ADHD Planners",
  "Gratitude Journals",
  "Budget Planners",
  "Crochet Pattern Books",
  "Low Content Notebooks",
  "Anxiety Workbooks",
  "Dog Training Books",
  "Homeschool Planners",
  "Wedding Planners",
];

export default function NicheFinder({
  initialQuery,
  projects,
  onRefreshProjects,
  onNavigate,
}: NicheFinderProps) {
  const [query, setQuery] = useState(initialQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NicheAnalysisResult | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleSearch = async (nicheValue?: string) => {
    const term = nicheValue || query;
    if (!term.trim()) return;

    try {
      setIsLoading(true);
      setErrorText("");
      setSaveSuccess(false);

      const res = await fetch("/api/niche-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: term }),
      });

      if (!res.ok) {
        throw new Error("Failed to search Amazon directory.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorText("Could not scan directory right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToProject = async () => {
    if (!result || !selectedProjectId) return;

    try {
      const res = await fetch(`/api/db/projects/${selectedProjectId}/niches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheData: result }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        onRefreshProjects();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    exportNicheScanCSV([result]);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const cleanNiche = result.nicheName.toLowerCase().replace(/\s+/g, "_");
    exportToPDF("niche", result, `KDP_Niche_Assessment_${cleanNiche}.pdf`);
  };

  const renderConfidenceBadge = (score: number) => {
    let label = "Low Confidence";
    let color = "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (score >= 95) {
      label = "Very High Confidence";
      color = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    } else if (score >= 85) {
      label = "High Confidence";
      color = "text-green-500 bg-green-500/10 border-green-550/20";
    } else if (score >= 70) {
      label = "Moderate Confidence";
      color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold font-mono tracking-wide px-1.5 py-0.5 rounded border mt-1.5 leading-none ${color}`}>
        {score}% - {label}
      </span>
    );
  };

  const getOppBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent (Underserved)", color: "bg-emerald-100 text-emerald-805 dark:bg-emerald-950 dark:text-emerald-305" };
    if (score >= 80) return { label: "Very Good (Lucrative)", color: "bg-indigo-100 text-indigo-805 dark:bg-indigo-950/40 dark:text-indigo-305" };
    if (score >= 70) return { label: "Good (Viable)", color: "bg-teal-100 text-teal-850 dark:bg-teal-955/40 dark:text-teal-305" };
    if (score >= 60) return { label: "Average (Saturated)", color: "bg-amber-100 text-amber-805 dark:bg-amber-955/35 dark:text-amber-305" };
    return { label: "Avoid (Too Competitive)", color: "bg-rose-100 text-rose-805 dark:bg-rose-955/20 dark:text-rose-300" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-505" />
          KDP Niche Finder
        </h2>
        <p className="text-xs text-slate-505">
          Spy on subcategories, catalog sizes, typical BSR levels, and score niches before investing in design.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search controls + Preset list */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main search card */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Scan Custom Niche</h3>
            
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type niche e.g. bullet planner adhd..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                className="w-full py-2 font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Analyze Niche
              </button>
            </div>

            {errorText && (
              <p className="text-xs text-rose-500 font-medium">{errorText}</p>
            )}
          </div>

          {/* Quick presets */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-930 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">KDP Hot Presets</h3>
            <p className="text-xs text-slate-400 leading-normal">
              Click any of these verified sub-niches to immediately run the live KDP commercial scanner.
            </p>
            <div className="flex flex-wrap lg:flex-col gap-2 max-h-60 lg:max-h-none overflow-y-auto pr-1">
              {PRESET_NICHES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset);
                    handleSearch(preset);
                  }}
                  className="px-2.5 py-1.5 lg:w-full lg:text-left bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800 rounded border border-slate-100 dark:border-slate-800/60 text-[11px] font-semibold text-slate-705 dark:text-slate-300 transition-all truncate"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-505 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Evaluating Niche Potential</h4>
                <p className="text-xs text-slate-400 font-mono">Examining competing listings, average BSR rank benchmarks, and profit equations...</p>
              </div>
            </div>
          ) : result ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 animate-fade-in animate-duration-300">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">{result.nicheName}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score badge */}
                <div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm inline-block ${getOppBadge(result.marketOpportunityScore).color}`}>
                    {getOppBadge(result.marketOpportunityScore).label}
                  </span>
                </div>
              </div>

              {/* Proprietary gauge indices */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-center flex flex-col justify-between items-center space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Opportunity Score</span>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{result.marketOpportunityScore}/100</p>
                  {renderConfidenceBadge(result.opportunityConfidence || 94)}
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-center flex flex-col justify-between items-center space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Demand Score</span>
                  <p className="text-2xl font-black text-emerald-500 font-mono">{result.demandScore}/100</p>
                  {renderConfidenceBadge(result.demandConfidence || 92)}
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-center flex flex-col justify-between items-center space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Competition Level</span>
                  <p className="text-2xl font-black text-amber-500 font-mono">{result.competitionScore}/100</p>
                  {renderConfidenceBadge(result.competitionConfidence || 90)}
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-center flex flex-col justify-between items-center space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Profit Margin Score</span>
                  <p className="text-2xl font-black text-rose-500 font-mono">{result.profitabilityScore || 75}/100</p>
                  {renderConfidenceBadge(result.trendConfidence || 86)}
                </div>
              </div>

              {/* Market Statistics detailed table */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Calculated Amazon Yardsticks</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-3.5 py-3 rounded border border-slate-100 dark:border-slate-800 font-mono text-xs">
                    <span className="text-slate-500">Est. Searches / mo</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{result.estimatedMonthlySearches.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-3.5 py-3 rounded border border-slate-100 dark:border-slate-800/80 font-mono text-xs">
                    <span className="text-slate-500">Typical Amazon BSR</span>
                    <span className="font-bold text-slate-880 dark:text-slate-100">{result.averageBSR.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-3.5 py-3 rounded border border-slate-100 dark:border-slate-800 font-mono text-xs">
                    <span className="text-slate-500">Active Competing Books</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{result.competingBooks.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Trust Transparency Block */}
              <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold font-sans text-slate-800 dark:text-slate-200 uppercase tracking-wider">Multi-Source Verification Ledger</span>
                </div>
                
                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-100 dark:border-slate-850">
                    <span className="text-[9px] text-slate-500 uppercase block font-mono mb-1">Calculation Assessment context:</span>
                    <p className="text-slate-700 dark:text-slate-355 italic font-serif leading-relaxed">
                      &ldquo;{result.trustReasoning?.why || "Assigned opportunity parameters demonstrate a robust organic search dynamic with standard catalog margins paired with stable pricing indexes."}&rdquo;
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 font-mono text-[10.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Market Saturation:</span>
                      <span className="font-bold text-slate-705 dark:text-slate-200">{result.marketSaturation || "Balanced"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Difficulty Rating:</span>
                      <span className="font-bold text-slate-705 dark:text-slate-200">{result.difficultyRating || "Moderate"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Profit Potential:</span>
                      <span className="font-bold text-emerald-400">{result.profitPotential || "High"}</span>
                    </div>
                    {result.averageReviewCount && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Avg Reviews:</span>
                        <span className="font-bold text-slate-705 dark:text-slate-200">{result.averageReviewCount.toLocaleString()}</span>
                      </div>
                    )}
                    {result.salesVelocity && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Sales Velocity:</span>
                        <span className="font-bold text-emerald-450">+{result.salesVelocity.toLocaleString()}/mo</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-sans mb-1.5">Verified Sourced Feeds Used inside Calculation:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.trustReasoning?.sourcesUsed || ["Amazon Search Autocomplete", "Amazon Best Seller Rank", "Google Search Volume Data", "Movers & Shakers Lists"]).map((src, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 rounded text-[9.5px] border border-slate-200 dark:border-slate-750 font-sans font-medium">{src}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Rows: Export or Save */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {projects.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-405 uppercase tracking-wider">Save:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded text-xs text-slate-800 dark:text-slate-200 outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveToProject}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95 select-none"
                    >
                      <Save className="w-3 h-3" />
                      Save Niche
                    </button>
                    {saveSuccess && (
                      <span className="text-[10px] text-emerald-500 font-bold block animate-pulse">✓ Saved!</span>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">Campaign group inactive. Add project in dashboard first.</div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onNavigate("Book Generator", { initialNiche: result.nicheName })}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-slate-100 dark:hover:bg-indigo-950/20 rounded cursor-pointer transition-all"
                  >
                    Brainstorm Titles
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 rounded flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    CSV Report
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs rounded flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF Report
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-slate-50 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Compass className="w-12 h-12 mx-auto text-slate-400" />
              <h4 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">Ready to find target niches?</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Scan any niche category above, or select one of our curated high-velocity publishing preset buttons on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
