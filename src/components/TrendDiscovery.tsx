import React from "react";
import { TrendingUp, Flame, Calendar, RefreshCw, Compass, Clock, Search } from "lucide-react";

interface TrendDiscoveryProps {
  onNavigate: (page: string, params?: any) => void;
}

const RISING_TRENDS = [
  { term: "Neurodiversity Planners", growth: 340, opportunities: 87, competition: "Low" },
  { term: "Cozy Coloring Books for Seniors", growth: 220, opportunities: 79, competition: "Medium" },
  { term: "Dual Language Baby Books", growth: 180, opportunities: 71, competition: "Low" },
  { term: "Miniature Crochet Pattern Pads", growth: 155, opportunities: 68, competition: "Medium" },
];

const SEASONAL_TRENDS = [
  { term: "Teacher Gratitude Planners (Q2)", growth: 420, opportunities: 82, competition: "Medium" },
  { term: "Back to School Activity Kits (Q3)", growth: 610, opportunities: 90, competition: "High" },
  { term: "Christmas Coloring for Toddlers (Q4)", growth: 890, opportunities: 95, competition: "High" },
  { term: "Academic Planners 2026-2027 (Q2)", growth: 310, opportunities: 76, competition: "Medium" },
];

const EVERGREEN_TRENDS = [
  { term: "Password Logbook Large Print", growth: 15, opportunities: 74, competition: "High" },
  { term: "Daily Task Organizer Checklist", growth: 22, opportunities: 81, competition: "Medium" },
  { term: "Food Sensitivity Tracker Log", growth: 48, opportunities: 79, competition: "Low" },
  { term: "Sobriety Milestones Journal", growth: 35, opportunities: 85, competition: "Low" },
];

export default function TrendDiscovery({ onNavigate }: TrendDiscoveryProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-505" />
          KDP Trend Discovery Dashboard
        </h2>
        <p className="text-xs text-slate-505 font-medium">
          Monitor surging Amazon consumer trends, recurring holiday seasonal books, and dependable evergreen planners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* surger column */}
        <div className="p-6 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Surging / Rising Niches</h3>
          </div>

          <div className="space-y-3">
            {RISING_TRENDS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 font-mono">
                    +{item.growth}% Growth
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                  <span>Score: {item.opportunities}/100</span>
                  <span className={`font-semibold ${
                    item.competition === "Low" ? "text-emerald-500" : "text-amber-500"
                  }`}>Comp: {item.competition}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100/10 text-[10px] font-bold justify-end">
                  <button
                    onClick={() => onNavigate("Niche Finder", { initialQuery: item.term })}
                    className="text-indigo-550 hover:underline cursor-pointer"
                  >
                    Niche Stats →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Holiday Seasonal column */}
        <div className="p-6 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Seasonal Surges</h3>
          </div>

          <div className="space-y-3">
            {SEASONAL_TRENDS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-805 dark:text-slate-200 text-xs block">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 font-mono">
                    +{item.growth}% Peak
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                  <span>Score: {item.opportunities}/100</span>
                  <span className={`font-semibold ${
                    item.competition === "Low" ? "text-emerald-500" : "text-rose-500"
                  }`}>Comp: {item.competition}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100/10 text-[10px] font-bold justify-end">
                  <button
                    onClick={() => onNavigate("Niche Finder", { initialQuery: item.term })}
                    className="text-indigo-550 hover:underline cursor-pointer"
                  >
                    Review Peak →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stable Evergreen column */}
        <div className="p-6 rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <Clock className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-100">Permanent / Evergreen</h3>
          </div>

          <div className="space-y-3">
            {EVERGREEN_TRENDS.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-805 dark:text-slate-205 text-xs block">{item.term}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 font-mono">
                    +{item.growth}% Steady
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono">
                  <span>Score: {item.opportunities}/100</span>
                  <span className={`font-semibold ${
                    item.competition === "Low" ? "text-emerald-500" : "text-rose-500"
                  }`}>Comp: {item.competition}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-101/10 text-[10px] font-bold justify-end">
                  <button
                    onClick={() => onNavigate("Niche Finder", { initialQuery: item.term })}
                    className="text-indigo-550 hover:underline cursor-pointer"
                  >
                    Deploy Niche →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
