import React, { useState, useEffect } from "react";
import { FolderPlus, Trash2, Search, ArrowUpRight, TrendingUp, BookOpen, Key, Activity, Loader2 } from "lucide-react";
import { KeywordResearchResult, NicheAnalysisResult, SavedProject, SearchHistoryEntry } from "../types";

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
  projects: SavedProject[];
  onRefreshProjects: () => void;
  searchHistory: SearchHistoryEntry[];
  onClearHistory: () => void;
}

export default function Dashboard({
  onNavigate,
  projects,
  onRefreshProjects,
  searchHistory,
  onClearHistory,
}: DashboardProps) {
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStatus, setNewProjectStatus] = useState<"Draft" | "Published" | "Researching">("Researching");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");
  const [activeProjectTab, setActiveProjectTab] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !activeProjectTab) {
      setActiveProjectTab(projects[0].id);
    }
  }, [projects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setIsCreatingProject(true);
      const res = await fetch("/api/db/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc, status: newProjectStatus }),
      });
      if (res.ok) {
        setNewProjectName("");
        setNewProjectDesc("");
        setNewProjectStatus("Researching");
        onRefreshProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, status: "Draft" | "Published" | "Researching") => {
    try {
      setIsUpdatingStatus(projectId);
      const res = await fetch(`/api/db/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        onRefreshProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project? All saved keywords and niches within it will be removed.")) return;
    try {
      const res = await fetch(`/api/db/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshProjects();
        if (activeProjectTab === id) {
          setActiveProjectTab(projects.filter((p) => p.id !== id)[0]?.id || null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedProject = projects.find((p) => p.id === activeProjectTab);

  // Statistics calculation
  const totalKeywords = projects.reduce((acc, p) => acc + p.keywords.length, 0);
  const totalNiches = projects.reduce((acc, p) => acc + p.niches.length, 0);
  
  let avgOppScore = 0;
  let nicheCount = 0;
  projects.forEach((p) => {
    p.niches.forEach((n) => {
      avgOppScore += n.marketOpportunityScore;
      nicheCount++;
    });
    p.keywords.forEach((k) => {
      avgOppScore += k.opportunityScore;
      nicheCount++;
    });
  });
  const avgNicheScoreResult = nicheCount > 0 ? Math.round(avgOppScore / nicheCount) : 0;

  return (
    <div id="kdp_dashboard" className="space-y-8 animate-fade-in">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl bg-[#111113] border border-[#27272a] text-white shadow-xl animate-fade-in">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">Publishing Dashboard</span>
          <h1 className="text-3xl font-light accent-text mt-1">KDP Intelligence Pro</h1>
          <p className="mt-2 text-slate-400 text-xs max-w-xl leading-relaxed">
            Welcome back to your publishing cockpit. Identify profitable niches, test search volumes, organize metadata, and monitor Amazon positions in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Quick Keyword Check..."
            value={quickSearchQuery}
            onChange={(e) => setQuickSearchQuery(e.target.value)}
            className="px-4 py-2 text-xs bg-[#1c1c1e] hover:bg-[#27272a]/80 focus:bg-[#27272a] border border-[#27272a] rounded-lg text-white placeholder-slate-500 focus:outline-none transition-all w-48 md:w-64"
            onKeyDown={(e) => {
              if (e.key === "Enter" && quickSearchQuery.trim()) {
                onNavigate("Keyword Research", { initialQuery: quickSearchQuery });
              }
            }}
          />
          <button
            onClick={() => quickSearchQuery.trim() && onNavigate("Keyword Research", { initialQuery: quickSearchQuery })}
            className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-550 rounded-lg shadow-md transition-all active:scale-95 flex items-center gap-2 text-white font-semibold"
          >
            <Search className="w-4 h-4" />
            Check
          </button>
        </div>
      </div>

      {/* Quick Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Projects</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{projects.length}</h3>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Keywords</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalKeywords}</h3>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monitored Niches</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{totalNiches}</h3>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Avg KDP Score</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {avgNicheScoreResult > 0 ? `${avgNicheScoreResult}/100` : "No Data"}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Publisher Campaigns & Projects</h2>
                <p className="text-xs text-slate-500">Group and archive your research lists into distinct campaigns</p>
              </div>
              <form onSubmit={handleCreateProject} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="New Project Name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={newProjectStatus}
                  onChange={(e) => setNewProjectStatus(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-305 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
                >
                  <option value="Researching">🔬 Researching</option>
                  <option value="Draft">✍️ Draft</option>
                  <option value="Published">🚀 Published</option>
                </select>
                <button
                  type="submit"
                  disabled={isCreatingProject || !newProjectName.trim()}
                  className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 rounded-lg flex items-center gap-1 cursor-pointer font-semibold"
                >
                  {isCreatingProject ? <Loader2 className="w-3 h-3 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                  Add
                </button>
              </form>
            </div>

            {projects.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <FolderPlus className="w-10 h-10 mx-auto text-slate-400" />
                <h4 className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">No campaigns created yet</h4>
                <p className="mt-1 text-xs text-slate-400 max-w-xs mx-auto">
                  Use the quick form above to establish your first book campaign, allowing you to save keywords and niches.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto gap-4 scrollbar-thin">
                  {projects.map((p) => {
                    const statusColor = 
                      p.status === "Published" 
                        ? "bg-emerald-500" 
                        : p.status === "Draft" 
                        ? "bg-amber-500" 
                        : "bg-blue-500";
                    
                    const statusLabel = p.status || "Researching";

                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveProjectTab(p.id)}
                        className={`pb-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 px-1 flex items-center gap-1.5 relative ${
                          activeProjectTab === p.id
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        <span 
                          title={`Status: ${statusLabel}`} 
                          className={`w-2 h-2 rounded-full ${statusColor}`}
                        />
                        <span>{p.name}</span>
                        <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {p.keywords.length + p.niches.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Project Content */}
                {selectedProject && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Status inline editor controller */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Project Status</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            selectedProject.status === "Published" ? "bg-emerald-500" : selectedProject.status === "Draft" ? "bg-amber-500" : "bg-blue-500"
                          }`} />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-350">
                            Currently marked as <span className="font-bold text-slate-900 dark:text-slate-100">{selectedProject.status || "Researching"}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/40 dark:border-slate-800/80">
                        {(["Researching", "Draft", "Published"] as const).map((st) => (
                          <button
                            key={st}
                            disabled={isUpdatingStatus === selectedProject.id}
                            onClick={() => handleUpdateProjectStatus(selectedProject.id, st)}
                            className={`px-3 py-1.5 text-[11px] rounded font-semibold transition-all cursor-pointer ${
                              (selectedProject.status || "Researching") === st
                                ? st === "Published"
                                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                                  : st === "Draft"
                                  ? "bg-amber-500 text-white shadow-sm font-bold"
                                  : "bg-indigo-600 text-white shadow-sm font-bold"
                                : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedProject.description && (
                      <p className="text-xs text-slate-400 italic">
                        &ldquo;{selectedProject.description}&rdquo;
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Saved Keywords Section */}
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-emerald-500" />
                            Keywords ({selectedProject.keywords.length})
                          </h4>
                          {selectedProject.keywords.length > 0 && (
                            <button
                              onClick={() => onNavigate("Keyword Research")}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              Explore <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {selectedProject.keywords.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-xs text-slate-400">No saved terms in this project.</p>
                            <button
                              onClick={() => onNavigate("Keyword Research")}
                              className="mt-2 text-[11px] px-2.5 py-1 font-medium rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                            >
                              Research New Keyword
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {selectedProject.keywords.map((k, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{k.keyword}</span>
                                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400">
                                    <span>Vol: {k.searchVolume.toLocaleString()}</span>
                                    <span>Diff: {k.keywordDifficulty}/100</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    k.opportunityScore >= 80 
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : k.opportunityScore >= 60
                                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                  }`}>
                                    Score {k.opportunityScore}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Saved Niches Section */}
                      <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                            Profitable Niches ({selectedProject.niches.length})
                          </h4>
                          {selectedProject.niches.length > 0 && (
                            <button
                              onClick={() => onNavigate("Niche Finder")}
                              className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                            >
                              Explore <ArrowUpRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {selectedProject.niches.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-xs text-slate-400">No saved niches in this project.</p>
                            <button
                              onClick={() => onNavigate("Niche Finder")}
                              className="mt-2 text-[11px] px-2.5 py-1 font-medium rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                            >
                              Scan New Niche
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {selectedProject.niches.map((n, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs"
                              >
                                <div className="max-w-[140px] md:max-w-none truncate">
                                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">{n.nicheName}</span>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                    <span>Dem: {n.demandScore}</span>
                                    <span>Comp: {n.competitionScore}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                    Opp: {n.marketOpportunityScore}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={(e) => handleDeleteProject(selectedProject.id, e)}
                        className="text-xs text-rose-500 hover:text-rose-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete This Project
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Search Logs History & KDP Score Guide */}
        <div className="space-y-6">
          {/* Recent Searches */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Search Activity</h3>
              {searchHistory.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-slate-400 hover:text-rose-500 hover:underline font-medium"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Your recent search terms will appear here.</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {searchHistory.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      if (h.type === "keyword") {
                        onNavigate("Keyword Research", { initialQuery: h.query });
                      } else if (h.type === "niche") {
                        onNavigate("Niche Finder", { initialQuery: h.query });
                      }
                    }}
                    className="p-2 rounded bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-44 block">{h.query}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider">{h.type}</span>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-mono font-bold flex items-center gap-0.5">
                      Verify <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proprietary AI Score Reference */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-900/40 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              KDP AI Opportunity Score
            </h3>
            <p className="text-xs text-slate-500">
              Our unique algorithm computes publishing potential based on a 4-ratio formula:
            </p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Demand Volume</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">40% Grid weight</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Deficit of competition</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">30% Grid weight</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Historical growth trends</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">20% Grid weight</span>
              </div>
              <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded border border-slate-100 dark:border-slate-800 font-mono text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">Category profit margin</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">10% Grid weight</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">90-100 Range:</span>
              <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Excellent (Publish ASAP!)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">70-89 Range:</span>
              <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                Very Good (Strong Potential)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">60-69 Range:</span>
              <span className="px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Good/Average (Needs Niche Subtitle)
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Under 60:</span>
              <span className="px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                Avoid (Red Ocean Market)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
