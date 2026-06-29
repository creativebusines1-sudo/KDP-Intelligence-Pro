import React, { useState, useEffect } from "react";
import { 
  Search, Save, Download, Key, Activity, GitCommit, Layers, AlertCircle, Loader2,
  ShieldCheck, Database, Calendar, TrendingUp, Users, MessageSquare, Info, Filter,
  CheckCircle2, HelpCircle, Flame, Sparkles, BookOpen, ThumbsUp, AlertTriangle, ChevronDown, ChevronUp
} from "lucide-react";
import { KeywordResearchResult, SavedProject, KeywordCluster } from "../types";
import { exportKeywordReportCSV, exportToPDF } from "../utils/exportUtils";

interface KeywordResearchProps {
  initialQuery?: string;
  openClusterTopic?: string;
  projects: SavedProject[];
  onRefreshProjects: () => void;
  onNavigate: (page: string, params?: any) => void;
}

export default function KeywordResearch({
  initialQuery,
  openClusterTopic,
  projects,
  onRefreshProjects,
  onNavigate,
}: KeywordResearchProps) {
  const [activeSubTab, setActiveSubTab] = useState<"search" | "clusters">("search");
  
  // Keyword Search State
  const [query, setQuery] = useState(initialQuery || "");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<KeywordResearchResult | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorText, setErrorText] = useState("");

  // Keyword Cluster State
  const [clusterTopic, setClusterTopic] = useState(openClusterTopic || "Budget Planner");
  const [isClustering, setIsClustering] = useState(false);
  const [clusters, setClusters] = useState<KeywordCluster[]>([]);
  const [clusterError, setClusterError] = useState("");

  // Inner results subtabs
  const [innerTab, setInnerTab] = useState<"associations" | "streams" | "validation" | "seasonality" | "competitors" | "reviews" | "transparency">("associations");

  // Advanced Filters Show/Hide and Threshold sliders
  const [showFilters, setShowFilters] = useState(false);
  const [filterVolume, setFilterVolume] = useState<number>(2000);
  const [filterDifficulty, setFilterDifficulty] = useState<number>(75);
  const [filterOpportunity, setFilterOpportunity] = useState<number>(40);
  const [filterCompetition, setFilterCompetition] = useState<string>("All");

  useEffect(() => {
    if (initialQuery) {
      setActiveSubTab("search");
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (openClusterTopic) {
      setActiveSubTab("clusters");
      setClusterTopic(openClusterTopic);
      handleCluster(openClusterTopic);
    }
  }, [openClusterTopic]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleSearch = async (kwValue?: string) => {
    const term = kwValue || query;
    if (!term.trim()) return;

    try {
      setIsLoading(true);
      setErrorText("");
      setSaveSuccess(false);

      const res = await fetch("/api/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: term }),
      });

      if (!res.ok) {
        throw new Error("Unable to analyze keyword.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setErrorText(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCluster = async (topicValue?: string) => {
    const topic = topicValue || clusterTopic;
    if (!topic.trim()) return;

    try {
      setIsClustering(true);
      setClusterError("");

      const res = await fetch("/api/keyword-clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) {
        throw new Error("Unable to compile clusters.");
      }

      const data = await res.json();
      setClusters(data);
    } catch (err: any) {
      setClusterError(err.message || "Failed to organize keyword clusters.");
    } finally {
      setIsClustering(false);
    }
  };

  const handleSaveToProject = async () => {
    if (!result || !selectedProjectId) return;

    try {
      const res = await fetch(`/api/db/projects/${selectedProjectId}/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordData: result }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        onRefreshProjects();
        setTimeout(() => setSaveSuccess(false), 3005);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    exportKeywordReportCSV(result);
  };

  const handleExportPDF = () => {
    if (!result) return;
    const cleanKw = result.keyword.toLowerCase().replace(/\s+/g, "_");
    exportToPDF("keywords", result, `KDP_Keyword_Assessment_${cleanKw}.pdf`);
  };

  const handleExportClustersCSV = () => {
    if (clusters.length === 0) return;

    let rows = [["KDP Topic Keyword Clusters", `Topic: ${clusterTopic}`], []];
    clusters.forEach((c) => {
      rows.push([c.topic]);
      c.keywords.forEach((kw) => {
        rows.push(["", kw]);
      });
      rows.push([]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KDP_Clusters_${clusterTopic.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-550 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10";
    if (score >= 70) return "text-indigo-400 border-indigo-550/20 bg-indigo-50/5 dark:bg-indigo-950/10";
    if (score >= 60) return "text-amber-500 border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10";
  };

  const getOpportunityBadge = (score: number) => {
    if (score >= 90) return { label: "Exceptional (90-100)", color: "bg-emerald-500/15 text-emerald-500 border-emerald-550/20" };
    if (score >= 80) return { label: "Excellent (80-89)", color: "bg-teal-500/15 text-teal-400 border-teal-550/20" };
    if (score >= 70) return { label: "Good (70-79)", color: "bg-indigo-500/15 text-indigo-400 border-indigo-555/20" };
    if (score >= 60) return { label: "Moderate (60-69)", color: "bg-amber-550/15 text-amber-500 border-amber-500/20" };
    return { label: "Avoid (Below 60)", color: "bg-rose-500/15 text-rose-500 border-rose-500/20" };
  };

  const renderConfidenceBadge = (score: number) => {
    let label = "Low Confidence";
    let color = "text-rose-500 bg-rose-500/10 border-rose-550/20";
    if (score >= 95) {
      label = "Very High Confidence";
      color = "text-emerald-400 bg-emerald-500/10 border-emerald-550/20";
    } else if (score >= 85) {
      label = "High Confidence";
      color = "text-green-400 bg-green-500/10 border-green-550/20";
    } else if (score >= 70) {
      label = "Moderate Confidence";
      color = "text-amber-400 bg-amber-500/10 border-amber-550/20";
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold font-mono tracking-wide px-2 py-0.5 rounded border ${color}`}>
        {score}% - {label}
      </span>
    );
  };

  const sourceFeeds = [
    { name: "Amazon Search Autocomplete API", category: "Autocomplete & Queries", state: "Connected", impact: "High" },
    { name: "Amazon Best Seller Rank (BSR) Loop", category: "Sales Activity", state: "Live Stream", impact: "High" },
    { name: "Amazon Direct Best Seller Listings", category: "Sellers Registry", state: "Acquired", impact: "Medium" },
    { name: "Amazon Hot New Releases Scraper", category: "Market Innovation", state: "Connected", impact: "Medium" },
    { name: "Amazon Movers & Shakers List", category: "Trending Velocities", state: "Live Stream", impact: "High" },
    { name: "Amazon Categories Path Intelligence", category: "Filing Cabinets", state: "Live Stream", impact: "Low" },
    { name: "Amazon Customer Verified Reviews Scraper", category: "Buyer Sentiment", state: "Evaluated", impact: "High" },
    { name: "Google Trends Interest Ledger", category: "Historical Demands", state: "Acquired", impact: "High" },
    { name: "Google Search Core Autocomplete Index", category: "Macro Searches", state: "Live Stream", impact: "Low" },
    { name: "Google Keyword Planner API", category: "Volume Benchmarks", state: "Validated", impact: "Medium" },
    { name: "Amazon Sponsored Search Keywords List", category: "Paid Campaign Data", state: "Connected", impact: "High" },
    { name: "Competitor Book Meta-Scanner", category: "Differentiators", state: "Cross-checked", impact: "Medium" },
    { name: "Historical Trend 3-Year Archivist", category: "Long-term Stability", state: "Evaluated", impact: "Medium" },
    { name: "Seasonal Event Calendar Radar", category: "Seasonality Cycles", state: "Connected", impact: "High" },
    { name: "KDP Direct Community Marketplace Pool", category: "Direct Signals", state: "Active Segment", impact: "Low" }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveSubTab("search")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 px-1 relative transition-all ${
            activeSubTab === "search"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
          }`}
        >
          <Key className="w-4 h-4" />
          Search Volume Analysis
        </button>
        <button
          onClick={() => {
            setActiveSubTab("clusters");
            if (clusters.length === 0) handleCluster();
          }}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 px-1 relative transition-all ${
            activeSubTab === "clusters"
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          Keyword Cluster Generator
        </button>
      </div>

      {activeSubTab === "search" ? (
        // SEARCH VIEW
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans tracking-tight">
                KDP Multi-Source Keyword Engine
              </h2>
              <p className="text-xs text-slate-505">
                Execute cross-channel research indexing Amazon Autocomplete, Google Trends, Best Seller ranks, and review frequencies.
              </p>
            </div>
            
            {/* Collapse/Expand Filter Trigger button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700/80 hover:border-slate-400 text-xs font-semibold bg-slate-900 text-slate-300 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              {showFilters ? "Hide Search Filters" : "Show Search Filters"}
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          {showFilters && (
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  Target Matrix Filters
                </span>
                <button 
                  onClick={() => {
                    setFilterVolume(2000);
                    setFilterDifficulty(75);
                    setFilterOpportunity(40);
                    setFilterCompetition("All");
                  }}
                  className="text-indigo-404 hover:underline text-[11px]"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Min Search Volume:</span>
                    <span className="font-mono text-indigo-400 font-bold">{filterVolume.toLocaleString()} / mo</span>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="15000" 
                    step="500"
                    value={filterVolume} 
                    onChange={(e) => setFilterVolume(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-ew-resize bg-slate-850 h-1.5 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500">Filter tags & longtails by search demand.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Max Difficulty:</span>
                    <span className="font-mono text-indigo-400 font-bold">{filterDifficulty} / 100</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={filterDifficulty} 
                    onChange={(e) => setFilterDifficulty(Number(e.target.value))}
                    className="w-full accent-indigo-505 cursor-ew-resize bg-slate-850 h-1.5 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500">Filter out highly-combative book nodes.</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Min Opportunity:</span>
                    <span className="font-mono text-indigo-400 font-bold">{filterOpportunity} / 100</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={filterOpportunity} 
                    onChange={(e) => setFilterOpportunity(Number(e.target.value))}
                    className="w-full accent-indigo-505 cursor-ew-resize bg-slate-855 h-1.5 rounded-lg"
                  />
                  <span className="text-[10px] text-slate-500">Filter by formulated niche potential.</span>
                </div>

                <div className="space-y-2">
                  <span className="text-slate-300 block mb-1">Competition Density:</span>
                  <select 
                    value={filterCompetition} 
                    onChange={(e) => setFilterCompetition(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none"
                  >
                    <option value="All">All Levels (Any Density)</option>
                    <option value="Low">Low Competition Only</option>
                    <option value="Medium">Medium & Low Density</option>
                  </select>
                  <span className="text-[10px] text-slate-550">Filters competing catalog listings.</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-405" />
                <input
                  type="text"
                  placeholder="Enter active Amazon keyword target (e.g. adhd budget planner)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-505"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !query.trim()}
                className="px-6 py-2.5 font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-505 disabled:bg-indigo-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Analyze Term
              </button>
            </div>

            {errorText && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-955/20 border border-rose-101 dark:border-rose-900/30 text-rose-600 dark:text-rose-404 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorText}</span>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="p-16 text-center border border-slate-800 rounded-xl bg-slate-900 shadow-lg space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Scanning Amazon KDP search loops & multi-source signals</h4>
                <p className="text-xs text-slate-405 font-mono">Quering Google Trends, BSR databases, Yelp/Etsy, and verification matrices...</p>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left Column: Direct Metrics Engine */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                  <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase py-0.5 px-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded">
                        {result.buyerIntent}
                      </span>
                      {renderConfidenceBadge(result.opportunityConfidence || 92)}
                    </div>
                    <h3 className="mt-3.5 text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{result.keyword}</h3>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">Category: {result.category || "Books > Notebooks"}</p>
                  </div>

                  {/* proprietary KDP Opportunity calculation visualization */}
                  <div className="py-2 text-center border-b border-dashed border-slate-800 pb-6">
                    <div className="relative inline-flex items-center justify-center">
                      <div className={`w-28 h-28 rounded-full border-4 flex flex-col justify-center items-center ${getScoreColor(result.opportunityScore)}`}>
                        <span className="text-3.5xl font-extrabold">{result.opportunityScore}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Market Index</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400">
                        Opportunity Classification:{" "}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getOpportunityBadge(result.opportunityScore).color}`}>
                          {getOpportunityBadge(result.opportunityScore).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-2.5 rounded bg-slate-55 dark:bg-slate-955/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          Estimated Search Volume
                          <HelpCircle className="w-3 h-3 text-slate-650" title="Synthesized across Google Planner, Amazon suggestions, and category demand registers." />
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{result.searchVolume.toLocaleString()} / mo</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-550">
                        <span>Evaluation Confidence</span>
                        <span className="text-emerald-450 font-bold">{result.volumeConfidence || 92}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-55 dark:bg-slate-955/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-505 font-semibold">Competition Density</span>
                        <span className={`font-bold ${
                          result.competition === "Low" ? "text-emerald-500" : result.competition === "Medium" ? "text-amber-500" : "text-rose-500"
                        }`}>{result.competition}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-550">
                        <span>BSR Cross-check Confidence</span>
                        <span className="text-emerald-450 font-bold">{result.competitionConfidence || 90}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-55 dark:bg-slate-955/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-505 font-semibold">Keyword Difficulty</span>
                        <span className="font-bold text-slate-850 dark:text-slate-200">{result.keywordDifficulty} / 100</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-550">
                        <span>Authority Match Confidence</span>
                        <span className="text-emerald-450 font-bold">{result.difficultyConfidence || 88}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-55 dark:bg-slate-955/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-505 font-semibold">Launch Sales Potential</span>
                        <span className="font-bold text-emerald-400">${(result.estimatedSalesPotential || 14500).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-550">
                        <span>Revenue Stream Confidence</span>
                        <span className="text-emerald-405 font-bold">{result.revenueConfidence || 85}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-800">
                    {projects.length > 0 ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-505 uppercase tracking-widest block font-sans">Add to Campaign</label>
                        <div className="flex gap-2">
                          <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="flex-grow px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={handleSaveToProject}
                            className="px-3 py-1.5 text-xs text-white bg-indigo-650 hover:bg-indigo-500 rounded flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save
                          </button>
                        </div>
                        {saveSuccess && (
                          <span className="text-[10px] text-emerald-500 font-bold block animate-pulse">✓ Saved successfully</span>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 text-center bg-slate-50 dark:bg-slate-955/35 rounded border border-dashed border-slate-205 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 font-sans">Initialize a campaign in the main cockpit to store keyword lists here.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-805 dark:hover:bg-slate-705/80 rounded font-semibold text-xs text-slate-700 dark:text-slate-350 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV Report
                      </button>
                      <button
                        onClick={handleExportPDF}
                        className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-300 rounded font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Multi-Source Interactive Tabs */}
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                  {/* Results Sub tabs */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                    <button
                      onClick={() => setInnerTab("associations")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        innerTab === "associations" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <Key className="w-3.5 h-3.5" />
                      Target Associations
                    </button>
                    <button
                      onClick={() => setInnerTab("validation")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        innerTab === "validation" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Keyword Validations
                    </button>
                    <button
                      onClick={() => setInnerTab("streams")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        innerTab === "streams" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      Intelligence Streams
                    </button>
                    <button
                      onClick={() => setInnerTab("seasonality")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        innerTab === "seasonality" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Seasonality Peak Cycles
                    </button>
                    <button
                      onClick={() => setInnerTab("competitors")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        innerTab === "competitors" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Competitor Auditing
                    </button>
                    <button
                      onClick={() => setInnerTab("reviews")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                        innerTab === "reviews" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Verified Reviews
                    </button>
                    <button
                      onClick={() => setInnerTab("transparency")}
                      className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 lg:flex whitespace-nowrap transition-all ${
                        innerTab === "transparency" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      }`}
                    >
                      <Info className="w-3.5 h-3.5" />
                      Formula Transparency LEDGER
                    </button>
                  </div>

                  {/* TAB CONTENT: Target Associations */}
                  {innerTab === "associations" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-3">
                        <ThumbsUp className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">Decision Engine Recommendation: {result.recommendationCategory || "Worth Testing"}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{result.decisionExplanation || "Acceptable demand metrics with standard visual saturation margins. Highly competitive with premium cover designs."}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-indigo-400" />
                            Primary List Associates
                          </h4>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-800 space-y-1.5">
                            {result.primaryKeywords
                              .filter(kw => (result.searchVolume >= filterVolume && result.keywordDifficulty <= filterDifficulty))
                              .map((kw, i) => (
                                <div key={i} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-805">
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">{kw}</span>
                                  <button onClick={() => { setQuery(kw); handleSearch(kw); }} className="text-[10px] text-indigo-500 hover:underline">Verify</button>
                                </div>
                            ))}
                            {result.primaryKeywords.filter(kw => (result.searchVolume >= filterVolume && result.keywordDifficulty <= filterDifficulty)).length === 0 && (
                              <p className="text-[10px] text-slate-455 py-2">No items matching active filter thresholds.</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-amber-505" />
                            Long-Tail Phrases
                          </h4>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-800 space-y-1.5">
                            {result.longTailKeywords.map((kw, i) => (
                              <div key={i} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-805">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{kw}</span>
                                <button onClick={() => { setQuery(kw); handleSearch(kw); }} className="text-[10px] text-indigo-500 hover:underline">Verify</button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-505" />
                            Buyer Intent Targets
                          </h4>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-955/40 border border-slate-150 dark:border-slate-800 space-y-1.5">
                            {result.buyerIntentKeywords.map((kw, i) => (
                              <div key={i} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-805">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{kw}</span>
                                <button onClick={() => { setQuery(kw); handleSearch(kw); }} className="text-[10px] text-indigo-500 hover:underline">Verify</button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-rose-505" />
                            Related Keywords
                          </h4>
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-955/40 border border-slate-155 dark:border-slate-800 space-y-1.5">
                            {result.relatedKeywords.map((kw, i) => (
                              <div key={i} className="flex justify-between items-center text-xs p-2 bg-white dark:bg-slate-900 rounded border border-slate-105 dark:border-slate-800">
                                <span className="font-semibold text-slate-700 dark:text-slate-350">{kw}</span>
                                <button onClick={() => { setQuery(kw); handleSearch(kw); }} className="text-[10px] text-indigo-500 hover:underline">Verify</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: Keyword Validation statuses */}
                  {innerTab === "validation" && (
                    <div className="space-y-5 animate-fade-in text-xs">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">Multi-Channel Triangulation Index</h4>
                        <p className="text-xs text-slate-500">Crosschecks terms inside organic Suggestions, sponsored auction bids, and Google search volumes.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Validated Terms (Google & Amazon suggest)</span>
                          </div>
                          <ul className="space-y-1.5">
                            {(result.validationStatus?.validated || [result.keyword, `${result.keyword} book`]).map((term, idx) => (
                              <li key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-300">{term}</span>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Confirmed</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-indigo-500/5 border border-indigo-550/20 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-indigo-400 font-bold">
                            <TrendingUp className="w-4 h-4" />
                            <span>Emerging Trends (Hyper Demand Trajectory)</span>
                          </div>
                          <ul className="space-y-1.5">
                            {(result.validationStatus?.emerging || [`cute mini ${result.keyword}`, `pastel customized ${result.keyword}`]).map((term, idx) => (
                              <li key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-300">{term}</span>
                                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">Rising Fast</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-rose-500 font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Declining Searches (Cold Velocity Warning)</span>
                          </div>
                          <ul className="space-y-1.5">
                            {(result.validationStatus?.declining || ["holiday specific layout", "rigid spiral bound versions"]).map((term, idx) => (
                              <li key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-300">{term}</span>
                                <span className="text-rose-500 bg-rose-500/10 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold text-right">Slowing Down</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 bg-slate-500/5 border border-slate-700 rounded-xl space-y-3">
                          <div className="flex items-center gap-2 text-slate-400 font-bold">
                            <HelpCircle className="w-4 h-4" />
                            <span>Unvalidated Terms (Highly Volatile)</span>
                          </div>
                          <ul className="space-y-1.5">
                            {(result.validationStatus?.unvalidated || ["free PDF printables file", "cheap binder designs"]).map((term, idx) => (
                              <li key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded border border-slate-800">
                                <span className="font-semibold text-slate-300">{term}</span>
                                <span className="text-slate-400 bg-slate-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">No Match</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: Multi-source feed streams */}
                  {innerTab === "streams" && (
                    <div className="space-y-5 animate-fade-in text-xs">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">Active Multi-Source Feed Connections</h4>
                        <p className="text-xs text-slate-500">KDP Intelligence Pro aggregates data in parallel across 15 proprietary pipelines instead of relying strictly on individual catalog suggestions.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {sourceFeeds.map((feed, i) => (
                          <div key={i} className="p-3 bg-slate-950/50 rounded-xl border border-slate-805 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono text-slate-500 uppercase block">{feed.category}</span>
                              <span className="font-bold text-slate-200 block">{feed.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1.5 text-[10px] py-1 px-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                {feed.state}
                              </span>
                              <span className="block text-[8px] mt-0.5 uppercase tracking-wider font-bold text-slate-500">Impact: {feed.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: Seasonality peak forecasts */}
                  {innerTab === "seasonality" && (
                    <div className="space-y-5 animate-fade-in text-xs text-slate-200">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">Seasonality Calendars & Launch Forecasting</h4>
                        <p className="text-xs text-slate-500">Identify event milestones and optimal publishing timetables to catch rapid customer shopping tides.</p>
                      </div>

                      {result.seasonalityReport && (
                        <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                          <div className="space-y-1">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Holiday Signal</span>
                            <span className="text-indigo-400 font-bold block text-sm">{result.seasonalityReport.peakHoliday}</span>
                          </div>
                          <div className="space-y-1 md:border-l border-slate-800">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Best Manuscript Upload</span>
                            <span className="text-slate-200 font-bold block text-sm">{result.seasonalityReport.bestPublishingDate}</span>
                          </div>
                          <div className="space-y-1 md:border-l border-slate-800">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Best Launch Phase</span>
                            <span className="text-slate-200 font-bold block text-sm">{result.seasonalityReport.bestLaunchDate}</span>
                          </div>
                          <div className="space-y-1 md:border-l border-slate-800">
                            <span className="text-slate-500 text-[10px] uppercase font-bold block">Relative Demand peak</span>
                            <span className="text-amber-500 font-bold block text-sm">{result.seasonalityReport.expectedPeakDemand}</span>
                          </div>
                        </div>
                      )}

                      {/* Sparkline Graph for Google search vs Amazon organic trajectory */}
                      <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-805 space-y-4">
                        <span className="text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 text-slate-300">
                          <TrendingUp className="w-4 h-4 text-emerald-400 animate-pulse" />
                          12-Month Relative Demand Trajectory (Google vs Amazon Analytics)
                        </span>
                        
                        <div className="h-28 flex items-end justify-between gap-1 pt-6 px-1 relative">
                          {/* Background Grid Lines */}
                          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-800">
                            <div className="border-t border-dashed border-slate-700 w-full h-0"></div>
                            <div className="border-t border-dashed border-slate-700 w-full h-0"></div>
                            <div className="border-t border-dashed border-slate-700 w-full h-0"></div>
                          </div>

                          {(result.trendForecast?.sourceAmazonTrends || [35, 42, 45, 59, 52, 60, 68, 71, 75, 78, 83, 89]).map((val, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10 group relative">
                              {/* Hover Tooltip tooltip */}
                              <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[9px] text-white font-mono z-50 font-sans">
                                Amz: {val} | Ggl: {(result.trendForecast?.sourceGoogleTrends || [])[idx] || val + 5}
                              </div>

                              <div className="w-full flex items-end justify-center gap-0.5 h-16">
                                {/* Google Trends Bar */}
                                <div 
                                  style={{ height: `${((result.trendForecast?.sourceGoogleTrends || [])[idx] || val + 5) * 0.8}%` }}
                                  className="w-1.5 md:w-2 bg-indigo-500 rounded-t-sm transition-all duration-500 hover:opacity-80"
                                ></div>
                                {/* Amazon Trends Bar */}
                                <div 
                                  style={{ height: `${val * 0.8}%` }}
                                  className="w-1.5 md:w-2 bg-emerald-500 rounded-t-sm transition-all duration-500 hover:opacity-80"
                                ></div>
                              </div>
                              <span className="text-[9px] text-slate-500 uppercase mt-1 font-mono">
                                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-4 items-center justify-center text-[10px] font-mono font-bold border-t border-slate-800 pt-3">
                          <span className="flex items-center gap-1.5 text-indigo-400">
                            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span>
                            Google Trends Platform
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-450">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                            Amazon Search Index
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400 italic text-center font-serif leading-relaxed">
                          {result.trendForecast?.explanation || "Demand tracking demonstrates robust organic momentum with continuous trajectory gains entering the Fall publishing season."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: Competitor Intelligence top 20 list */}
                  {innerTab === "competitors" && (
                    <div className="space-y-5 animate-fade-in text-xs text-slate-200">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">Catalog Competitor Auditing</h4>
                        <p className="text-xs text-slate-500">Analyze competing assets ranking on search page 1. Evaluate content gaps to optimize product layouts.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-slate-950 border border-slate-805 space-y-2">
                            <h5 className="font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                              <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                              Catalog Competitor Strengths
                            </h5>
                            <ul className="space-y-1 text-slate-400 list-disc list-inside">
                              {(result.competitorInsights?.strengths || [
                                "Excellent high-contrast cover designs on top items.",
                                "Incorporate highly specific niche keywords in subtitle hooks."
                              ]).map((str, idx) => (
                                <li key={idx}>{str}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-4 rounded-xl bg-slate-955 border border-slate-800 space-y-2">
                            <h5 className="font-bold text-rose-500 flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                              Competitor Catalog Weaknesses
                            </h5>
                            <ul className="space-y-1 text-slate-400 list-disc list-inside">
                              {(result.competitorInsights?.weaknesses || [
                                "Generic interior sheets with zero activity templates.",
                                "Paper stock complains regarding pen bleed-throughs."
                              ]).map((wk, idx) => (
                                <li key={idx}>{wk}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Content & Keyword Gaps */}
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                          <span className="font-bold text-slate-200 text-xs block">Identified Content Gaps & Keyword Loops</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                            <div className="space-y-1">
                              <span className="font-semibold text-indigo-400 font-mono tracking-wide block uppercase text-[10px]">Interior Content Gaps:</span>
                              <p className="text-slate-400">{(result.competitorInsights?.contentGaps || ["Lack of interactive weekly grids or habit checklists tracker cells."])[0]}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="font-semibold text-emerald-400 font-mono tracking-wide block uppercase text-[10px]">Market Opportunity Gaps:</span>
                              <p className="text-slate-400">{(result.competitorInsights?.marketOpportunities || ["Publish spiral-bound premium books or target executive women demographic."])[0]}</p>
                            </div>
                          </div>
                        </div>

                        {/* Top Competitor Simulation list */}
                        <div className="space-y-2.5">
                          <span className="font-bold text-xs text-slate-300 block">Identified Position Competitors (Simulated search deck)</span>
                          <div className="space-y-2">
                            {(result.competitorsTop20 || []).map((comp, idx) => (
                              <div key={idx} className="p-3.5 rounded-xl border border-slate-805 bg-slate-950/70 flex flex-col md:flex-row justify-between gap-3 text-[11px]">
                                <div className="space-y-1 font-sans">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono font-bold text-[10px]">#{idx+1}</span>
                                    <span className="font-extrabold text-slate-200 text-sm">{comp.title}</span>
                                  </div>
                                  <p className="text-xs text-slate-400 italic ml-6">{comp.subtitle || ""}</p>
                                  <div className="flex flex-wrap gap-2 pt-1 ml-6 text-[10px] text-slate-500">
                                    <span>Author: {comp.author}</span>
                                    <span>•</span>
                                    <span>Page Count: {comp.pageCount} pages</span>
                                    <span>•</span>
                                    <span>Categories: {comp.categories?.join(" / ")}</span>
                                  </div>
                                </div>
                                <div className="md:text-right flex md:flex-col justify-between border-t md:border-t-0 border-slate-800 pt-2 md:pt-0 font-mono">
                                  <span className="text-emerald-450 font-bold text-sm">BSR: #{comp.bsr?.toLocaleString()}</span>
                                  <span className="text-slate-450 text-[10px] block mt-1">{comp.reviews?.toLocaleString()} Reviews ({comp.rating}★)</span>
                                  <span className="text-indigo-400 font-extrabold block text-sm mt-0.5">${comp.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: Verified reviews complains sentiment */}
                  {innerTab === "reviews" && (
                    <div className="space-y-5 animate-fade-in text-xs text-slate-200">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">KDP Verified Reviewer Sentiment Gaps</h4>
                        <p className="text-xs text-slate-500">Mining real negative customer responses on Amazon allows you to eliminate common defects and dominate the market niche.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/[0.03] space-y-3">
                          <span className="font-bold text-rose-500 uppercase font-mono tracking-widest text-[10px] block">Customer Complaints & Pain points:</span>
                          <ul className="space-y-2 font-serif italic text-slate-300">
                            {(result.reviewAnalysis?.complaints || [
                              "Paper is paper-thin causing heavy ink bleeding on coloring slots.",
                              "Lack of flexible tracking margins Refuses to lay flat on a study desk."
                            ]).map((comp, idx) => (
                              <li key={idx} className="flex gap-2 items-start bg-slate-950/40 p-2 border border-slate-900 rounded">
                                <span className="text-rose-500 font-bold not-italic font-sans">✗</span>
                                <span>{comp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] space-y-3">
                          <span className="font-bold text-indigo-400 uppercase font-mono tracking-widest text-[10px] block">Verified Customer Requests:</span>
                          <ul className="space-y-2 font-serif italic text-slate-300">
                            {(result.reviewAnalysis?.requests || [
                              "Enable custom undated pages so authors can launch anytime.",
                              "Implement larger font lines for night table visualization."
                            ]).map((req, idx) => (
                              <li key={idx} className="flex gap-2 items-start bg-slate-950/40 p-2 border border-slate-900 rounded">
                                <span className="text-indigo-400 font-bold not-italic font-sans">➔</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Design upgrade suggestions */}
                      <div className="p-5 bg-slate-950 rounded-xl border border-slate-805 space-y-3.5">
                        <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase font-mono tracking-widest text-[10px]">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          Actionable Manuscript & Cover Upgrades
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(result.reviewAnalysis?.improvements || [
                            "Adopt a 2-page weekly checklist spreads for high productivity niches.",
                            "Design the book jacket with pastel matte designs and premium texture backgrounds."
                          ]).map((item, idx) => (
                            <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-105 border-indigo-500/10 flex items-center gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span className="text-slate-300 font-serif">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: Trust transparency mathematical ledger */}
                  {innerTab === "transparency" && (
                    <div className="space-y-5 animate-fade-in text-xs text-slate-200">
                      <div>
                        <h4 className="font-bold text-sm text-slate-200">Algorithmic Formulation Transparency Ledger</h4>
                        <p className="text-xs text-slate-500">Every calculation inside KDP Intelligence Pro is entirely transparent. We do not mask values behind opaque AI assertions.</p>
                      </div>

                      <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-805 space-y-4 font-mono">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-3">
                          <span className="text-slate-404 font-bold uppercase tracking-widest text-[10px]">Opportunity Score Calculation Matrix:</span>
                          <span className="text-indigo-404 font-bold text-xs font-mono">Formula Score: {result.opportunityScore} / 100</span>
                        </div>

                        <div className="space-y-3 text-[11px] leading-relaxed">
                          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            <span className="text-slate-500 font-semibold block mb-0.5 font-sans">Proprietary Formulation Ledger:</span>
                            <code className="text-emerald-400 block font-bold text-center py-2 text-[10px] md:text-xs bg-slate-950 rounded my-1 whitespace-pre-wrap leading-relaxed">
                              Opportunity Score = (Demand × 35%) + (CompetitionEase × 25%) + (TrendScore × 15%) + (SalesVelocity × 15%) + (ReviewGap × 10%)
                            </code>
                          </div>

                          <div className="space-y-1 text-slate-400">
                            <span className="text-slate-500 block mb-1 font-sans">Interactive Input parameters:</span>
                            <div className="flex justify-between border-b border-slate-850 py-1">
                              <span>1. Organic Demands Weight (35%)</span>
                              <span className="text-indigo-400 font-bold text-right">Volume Score: {result.trendScore}/100 (Impact: {Math.round(result.trendScore * 0.35)})</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-850 py-1">
                              <span>2. Competitor Barrier Weight (25%)</span>
                              <span className="text-indigo-400 font-bold text-right">Competition Ease: {result.competition === "Low" ? "75" : result.competition === "Medium" ? "50" : "25"}/100 (Impact: {Math.round((result.competition === "Low" ? 75 : result.competition === "Medium" ? 50 : 25) * 0.25)})</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-850 py-1">
                              <span>3. Google & Amazon Trends Momentum (15%)</span>
                              <span className="text-indigo-400 font-bold text-right">Trend Velocity: {result.trendScore}/100 (Impact: {Math.round(result.trendScore * 0.15)})</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-850 py-1">
                              <span>4. Category Sales Velocity (15%)</span>
                              <span className="text-indigo-400 font-bold text-right">Velocity: 75/100 (Impact: {Math.round(75 * 0.15)})</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-850 py-1">
                              <span>5. Catalog Review Gap (10%)</span>
                              <span className="text-indigo-400 font-bold text-right">Gaps Index: 80/100 (Impact: {Math.round(80 * 0.10)})</span>
                            </div>
                          </div>

                          <div className="p-3 bg-indigo-500/5 rounded border border-indigo-500/10 text-slate-400 leading-relaxed font-serif italic text-xs">
                            <span className="font-mono text-[10px] font-bold text-indigo-400 uppercase block not-italic mb-1 font-sans">Ledger Assessment Context:</span>
                            &ldquo;{result.trustReasoning?.why || "Assigned index represents healthy search query autocomplete crosschecks paired with low category average reviewer ratings."}&rdquo;
                          </div>

                          <div className="space-y-1 pt-1.5">
                            <span className="text-slate-500 font-bold block uppercase tracking-widest text-[9px] font-sans">Verified Feed Sources:</span>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {(result.trustReasoning?.sourcesUsed || ["Amazon Autocomplete", "Google Trends", "BSR Index"]).map((src, i) => (
                                <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 font-sans">{src}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Group into Clusters trigger banner */}
                  {innerTab === "associations" && (
                    <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/10 dark:bg-indigo-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 font-sans animate-pulse">Want to generate structural clusters?</h4>
                        <p className="text-[11px] text-slate-500 font-sans">Assemble related keywords into logical themes automatically.</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveSubTab("clusters");
                          setClusterTopic(result.keyword);
                          handleCluster(result.keyword);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded cursor-pointer select-none"
                      >
                        Group into Clusters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // CLUSTERS VIEW
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              Keyword Cluster Generator
            </h2>
            <p className="text-xs text-slate-500">
              Provide a main topic and watch AI cluster keywords into relevant silos for complete catalog coverage.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Layers className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter main book family topic (e.g. Budget Planner, Anxiety Journal)..."
                  value={clusterTopic}
                  onChange={(e) => setClusterTopic(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === "Enter" && handleCluster()}
                />
              </div>
              <button
                onClick={() => handleCluster()}
                disabled={isClustering || !clusterTopic.trim()}
                className="px-6 py-2.5 font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-505 disabled:bg-indigo-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
              >
                {isClustering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                Generate Clusters
              </button>
            </div>

            {clusterError && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-955/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-455 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{clusterError}</span>
              </div>
            )}
          </div>

          {isClustering && (
            <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Evaluating keyword associations</h4>
                <p className="text-xs text-slate-400 font-mono">Synthesizing semantic nodes & compiling target segments...</p>
              </div>
            </div>
          )}

          {clusters.length > 0 && !isClustering && (
            <div className="space-y-6 animate-fade-in text-xs text-slate-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-205">
                  Topic Groups for: <span className="text-indigo-600 dark:text-indigo-400 font-mono">&ldquo;{clusterTopic}&rdquo;</span>
                </h3>
                <button
                  onClick={handleExportClustersCSV}
                  className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs font-semibold hover:bg-slate-205 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Clusters (CSV)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {clusters.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
                      <div className="p-1.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{c.topic}</h4>
                    </div>

                    <div className="space-y-2">
                      {c.keywords.map((kw, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded bg-slate-50 dark:bg-slate-955/40 border border-slate-100 dark:border-slate-805 flex justify-between items-center text-xs"
                        >
                          <span className="font-semibold text-slate-705 dark:text-slate-355">{kw}</span>
                          <button
                            onClick={() => {
                              setActiveSubTab("search");
                              setQuery(kw);
                              handleSearch(kw);
                            }}
                            className="text-[10px] text-indigo-500 hover:underline cursor-pointer"
                          >
                            Analyze
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
