import React, { useState } from "react";
import { Search, Copy, Check, Tags, ShieldAlert, Award, Loader2 } from "lucide-react";
import { CategoryFinderResult } from "../types";

export default function CategoryFinder() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CategoryFinderResult[]>([]);
  const [errorText, setErrorText] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setErrorText("");

      const res = await fetch("/api/category-finder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: query }),
      });

      if (!res.ok) {
        throw new Error("Unable to execute category lookups.");
      }

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setErrorText("Category search systems timed out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Tags className="w-5 h-5 text-indigo-505" />
          KDP Amazon Category Finder
        </h2>
        <p className="text-xs text-slate-505 font-medium">
          Identify high-conversion primary, secondary, and hidden sub-genres on Amazon. Discover exact bestseller rankings (BSR) required to claim the coveted #1 bestseller badge.
        </p>
      </div>

      {/* Input controls */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Tags className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search category keyword (e.g. mindfulness, sudoku, adhd, recipes)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-slate-205 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Map Shelves
          </button>
        </div>

        {errorText && (
          <p className="mt-4 text-xs text-rose-500 font-medium">{errorText}</p>
        )}
      </div>

      {isLoading && (
        <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
          <div>
            <h4 className="text-sm font-semibold text-slate-705 dark:text-slate-300">Formulating Category Tree Map</h4>
            <p className="text-xs text-slate-400 font-mono">Tracing BSR thresholds, estimating daily volumes & analyzing sub-shelf density indexes...</p>
          </div>
        </div>
      )}

      {results.length > 0 && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {results.map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2 border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-black uppercase py-0.5 px-2 bg-slate-100 dark:bg-slate-800 text-slate-505 rounded">
                    {item.competition} COMPETITION
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-400"># BSR Rank</span>
                </div>

                {/* Path String */}
                <div className="p-3 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 relative group text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Amazon Path</span>
                  <p className="font-semibold leading-relaxed pr-8">{item.path}</p>
                  <button
                    onClick={() => copyPath(item.path)}
                    className="absolute right-2 top-2.5 p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition"
                  >
                    {copiedPath === item.path ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Yardstick calculations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 font-mono">
                  <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950/20">
                    <span className="text-slate-505">Category Avg BSR</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.avgBSR.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-950/20">
                    <span className="text-slate-505">Est. Sales / mo</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.estSalesVolume.toLocaleString()} units</span>
                  </div>
                </div>
              </div>

              {/* BSR target benchmark indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-650 dark:text-slate-350">To Hit #1 spot, reach under:</span>
                </div>
                <div className="px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold rounded border border-amber-500/20">
                  BSR {item.bsrNeededToRank1.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !isLoading && (
        <div className="py-24 text-center bg-slate-50 dark:bg-slate-955/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 animate-pulse">
          <Tags className="w-12 h-12 mx-auto text-slate-400" />
          <h4 className="mt-2 text-sm font-bold text-slate-750 dark:text-slate-300">Ready to audit bookshelves?</h4>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Find Amazon categories path blueprints. Map BSR levels and competition counts accurately.
          </p>
        </div>
      )}
    </div>
  );
}
