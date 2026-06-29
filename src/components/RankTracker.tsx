import React, { useState, useEffect } from "react";
import { Search, Save, Trash2, TrendingUp, AlertCircle, RefreshCw, BarChart2, Plus, Loader2, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RankTrackerItem } from "../types";
import { exportRankTrackerHistoryCSV, exportToPDF } from "../utils/exportUtils";

export default function RankTracker() {
  const [asin, setAsin] = useState("");
  const [keyword, setKeyword] = useState("");
  const [label, setLabel] = useState("");
  const [trackers, setTrackers] = useState<RankTrackerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [selectedTracker, setSelectedTracker] = useState<RankTrackerItem | null>(null);

  useEffect(() => {
    fetchTrackers();
  }, []);

  const fetchTrackers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/rank-trackers");
      if (res.ok) {
        const data = await res.json();
        setTrackers(data);
        if (data.length > 0 && !selectedTracker) {
          setSelectedTracker(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin.trim() || !keyword.trim() || !label.trim()) return;

    try {
      setIsAdding(true);
      setErrorText("");

      const res = await fetch("/api/rank-trackers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin, keyword, label }),
      });

      if (!res.ok) {
        throw new Error("Unable to save rank tracking parameters.");
      }

      await fetchTrackers();
      setAsin("");
      setKeyword("");
      setLabel("");
    } catch (err: any) {
      setErrorText(err.message || "Failed to create rank tracker.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteTracker = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to stop tracking this slot?")) return;

    try {
      const res = await fetch(`/api/rank-trackers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedTracker?.id === id) {
          setSelectedTracker(null);
        }
        await fetchTrackers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Convert position ranks for graph (lower is better, so we can invert the Y-axis conceptually or customize Tooltip)
  const formatHistoryData = (history: { date: string; rankPosition: number }[]) => {
    return history.map((h) => ({
      date: new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      Rank: h.rankPosition,
    }));
  };

  const handleExportCSV = () => {
    if (!selectedTracker) return;
    
    const item: RankTrackerItem = {
      id: selectedTracker.id,
      type: "book",
      name: selectedTracker.label,
      asin: selectedTracker.asin,
      currentRank: selectedTracker.currentKeywordRank,
      previousRank: selectedTracker.currentKeywordRank + (selectedTracker.rankChangeWeekly || 0),
      rankType: "Keyword Search",
      updatedAt: new Date().toISOString(),
      history: (selectedTracker.history || []).map((h: any) => ({
        date: h.date,
        rank: h.rankPosition
      }))
    };

    exportRankTrackerHistoryCSV([item]);
  };

  const handleExportPDF = () => {
    if (!selectedTracker) return;

    const item: RankTrackerItem = {
      id: selectedTracker.id,
      type: "book",
      name: selectedTracker.label,
      asin: selectedTracker.asin,
      currentRank: selectedTracker.currentKeywordRank,
      previousRank: selectedTracker.currentKeywordRank + (selectedTracker.rankChangeWeekly || 0),
      rankType: "Keyword Search",
      updatedAt: new Date().toISOString(),
      history: (selectedTracker.history || []).map((h: any) => ({
        date: h.date,
        rank: h.rankPosition
      }))
    };

    exportToPDF("rank", [item], `KDP_Rank_Trajectory_Tracker_${selectedTracker.asin}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-505" />
          KDP keyword Rank Tracker
        </h2>
        <p className="text-xs text-slate-505 font-medium">
          Monitor your books&apos; rankings on Amazon search pages over time. Track BSR and keyword movements with persistent charts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form to Add Trackers */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleAddTracker} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Plus className="w-4 h-4 text-indigo-500" />
              Add ASIN Tracker
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Book Label (Nickname)</label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. My ADHD Journal Planner"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-201 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Amazon ASIN Code</label>
              <input
                type="text"
                required
                value={asin}
                onChange={(e) => setAsin(e.target.value)}
                placeholder="e.g. B08XML2881"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-201 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 font-mono uppercase focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Keyword to Tracker</label>
              <input
                type="text"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. budget planner with pockets"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-201 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-805 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {errorText && (
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/15 text-rose-505 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorText}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAdding || !asin.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Start Tracking Rank
            </button>
          </form>

          {/* List of active trackers */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Monitored Items</h3>
              <button onClick={fetchTrackers} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {isLoading && trackers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Syncing trackers...</div>
            ) : trackers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-lg bg-slate-50/50 dark:bg-slate-950/20">
                No active trackers. Set up an ASIN tracking slot above.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {trackers.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTracker(t)}
                    className={`p-3.5 rounded-lg border text-xs cursor-pointer select-none transition-all flex justify-between items-center ${
                      selectedTracker?.id === t.id
                        ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/20"
                        : "border-slate-150 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 hover:bg-slate-100"
                    }`}
                  >
                    <div className="space-y-1 truncate pr-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-155 truncate">{t.label}</h4>
                      <p className="text-[10px] text-slate-400 font-mono uppercase truncate">{t.asin} | Keyword: {t.keyword}</p>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block whitespace-nowrap">Current Rank</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">#{t.currentKeywordRank}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteTracker(t.id, e)}
                        className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/25 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected slot charts and history logs */}
        <div className="lg:col-span-2">
          {selectedTracker ? (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 shadow-sm space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <span className="text-[10px] font-mono font-black uppercase py-0.5 px-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded">
                    ASIN: {selectedTracker.asin}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-800 dark:text-slate-150">{selectedTracker.label}</h3>
                  <p className="text-xs text-slate-400">Target Keyword Match: &ldquo;{selectedTracker.keyword}&rdquo;</p>
                </div>

                <div className="flex gap-4 font-mono text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Weekly Delta</span>
                    <span className={`font-black ${
                      selectedTracker.rankChangeWeekly >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}>
                      {selectedTracker.rankChangeWeekly >= 0 ? `+${selectedTracker.rankChangeWeekly}` : selectedTracker.rankChangeWeekly} positions
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current BSR</span>
                    <span className="font-bold text-slate-850 dark:text-slate-150">#{selectedTracker.currentBSR.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Chart of History positions */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between items-center text-xs gap-2">
                  <h4 className="font-bold text-slate-650 dark:text-slate-350">Page 1 Organic Position History</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportCSV}
                      title="Export rank data to CSV"
                      className="px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> CSV History
                    </button>
                    <button
                      onClick={handleExportPDF}
                      title="Export report to PDF"
                      className="px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 rounded transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> PDF Map
                    </button>
                    <span className="text-[10px] text-slate-405 font-mono hidden sm:inline border-l pl-2 border-slate-200 dark:border-slate-800">
                      Lower is better
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatHistoryData(selectedTracker.history)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                      <YAxis reversed={true} tick={{ fill: "#64748b", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "none", color: "#fff", borderRadius: "8px", fontSize: "11px" }} />
                      <Line
                        type="monotone"
                        dataKey="Rank"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 4, stroke: "#4f46e5", strokeWidth: 1 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-36 text-center bg-slate-50 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <TrendingUp className="w-12 h-12 mx-auto text-slate-405 animate-pulse" />
              <h4 className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">Ready to audit rank logs?</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                No monitored ASIN positions selected. Click on an existing tracker from the list or configure a new ASIN slot.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
