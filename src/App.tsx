import React, { useState, useEffect } from "react";
import {
  Compass,
  Key,
  Layers,
  ShieldAlert,
  Sparkles,
  FileText,
  Tags,
  BarChart2,
  Calculator,
  TrendingUp,
  LayoutGrid,
  Sun,
  Moon,
  FolderLock,
  User,
  ExternalLink,
  BookOpen
} from "lucide-react";

import Dashboard from "./components/Dashboard";
import NicheFinder from "./components/NicheFinder";
import KeywordResearch from "./components/KeywordResearch";
import CompetitionAnalyzer from "./components/CompetitionAnalyzer";
import BookGenerator from "./components/BookGenerator";
import ListingOptimizer from "./components/ListingOptimizer";
import CategoryFinder from "./components/CategoryFinder";
import RankTracker from "./components/RankTracker";
import ProfitCalculator from "./components/ProfitCalculator";
import TrendDiscovery from "./components/TrendDiscovery";
import { SavedProject } from "./types";

type Page =
  | "Cockpit"
  | "Niche Finder"
  | "Keyword Research"
  | "Competitor Audit"
  | "Book Generator"
  | "Listing Optimizer"
  | "Category Finder"
  | "Rank Tracker"
  | "Profit Calculator"
  | "Trend Discovery";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("Cockpit");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<"Beginner" | "Low-Content Creator" | "KDP Agency">("Low-Content Creator");
  
  // Navigation parameter targets
  const [navParams, setNavParams] = useState<any>({});

  useEffect(() => {
    // Initial fetch of campaigns list
    fetchProjects();
    fetchSearchHistory();
    
    // Apply dark mode theme
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/db/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load user campaigns database.", err);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const res = await fetch("/api/db/history");
      if (res.ok) {
        const data = await res.json();
        setSearchHistory(data);
      }
    } catch (err) {
      console.error("Failed to load search static history.", err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/db/history", { method: "DELETE" });
      if (res.ok) {
        setSearchHistory([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleNavigate = (page: string, params: any = {}) => {
    setNavParams(params);
    setCurrentPage(page as Page);
  };

  const menuItems = [
    { name: "Cockpit", icon: LayoutGrid },
    { name: "Niche Finder", icon: Compass },
    { name: "Keyword Research", icon: Key },
    { name: "Competitor Audit", icon: ShieldAlert },
    { name: "Book Generator", icon: Sparkles },
    { name: "Listing Optimizer", icon: FileText },
    { name: "Category Finder", icon: Tags },
    { name: "Rank Tracker", icon: BarChart2 },
    { name: "Profit Calculator", icon: Calculator },
    { name: "Trend Discovery", icon: TrendingUp },
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "Cockpit":
        return (
          <Dashboard
            projects={projects}
            onRefreshProjects={fetchProjects}
            onNavigate={handleNavigate}
            searchHistory={searchHistory}
            onClearHistory={handleClearHistory}
          />
        );
      case "Niche Finder":
        return (
          <NicheFinder
            initialQuery={navParams.initialQuery}
            projects={projects}
            onRefreshProjects={fetchProjects}
            onNavigate={handleNavigate}
          />
        );
      case "Keyword Research":
        return (
          <KeywordResearch
            initialQuery={navParams.initialQuery}
            openClusterTopic={navParams.openClusterTopic}
            projects={projects}
            onRefreshProjects={fetchProjects}
            onNavigate={handleNavigate}
          />
        );
      case "Competitor Audit":
        return <CompetitionAnalyzer />;
      case "Book Generator":
        return (
          <BookGenerator
            initialNiche={navParams.initialNiche}
            openOutlineWithTitle={navParams.openOutlineWithTitle}
            openOutlineWithNiche={navParams.openOutlineWithNiche}
            onNavigate={handleNavigate}
          />
        );
      case "Listing Optimizer":
        return <ListingOptimizer />;
      case "Category Finder":
        return <CategoryFinder />;
      case "Rank Tracker":
        return <RankTracker />;
      case "Profit Calculator":
        return <ProfitCalculator />;
      case "Trend Discovery":
        return <TrendDiscovery onNavigate={handleNavigate} />;
      default:
        return (
          <Dashboard
            projects={projects}
            onRefreshProjects={fetchProjects}
            onNavigate={handleNavigate}
            searchHistory={searchHistory}
            onClearHistory={handleClearHistory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-250 flex">
      {/* Sidebar navigation */}
      <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="p-6 space-y-6">
          {/* Logo Section from Sophisticated Dark */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md">
              K
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-850 dark:text-slate-200 font-sans tracking-tight leading-none">
                KDP Intelligence <span className="text-blue-500 font-bold">Pro</span>
              </h1>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold tracking-widest block mt-1 uppercase">INTELLIGENCE SUITE</span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1 block">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    isActive
                      ? "bg-slate-100 text-slate-900 border-slate-200 dark:bg-[#1c1c1e] dark:text-white dark:border-[#27272a] shadow-sm font-bold"
                      : "text-slate-550 dark:text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-[#1c1c1e]/70 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4 text-blue-550 dark:text-slate-400" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Switcher based on Sophisticated Dark design */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs text-white font-bold shrink-0">
              {userRole[0] || "U"}
            </div>
            <div className="truncate text-xs">
              <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase font-bold">Active Role</span>
              <select
                value={userRole}
                onChange={(e: any) => setUserRole(e.target.value)}
                className="font-bold text-slate-800 dark:text-slate-200 bg-transparent border-none outline-none p-0 cursor-pointer text-xs focus:ring-0"
              >
                <option value="Beginner" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Beginner KDP</option>
                <option value="Low-Content Creator" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Low-Content Creator</option>
                <option value="KDP Agency" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">KDP Agency Mode</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-[#1c1c1e] dark:border dark:border-[#27272a] text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition-all cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
              v1.2.0 Cloud <FolderLock className="w-3.5 h-3.5 text-emerald-500" />
            </span>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header toolbar */}
        <header className="p-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center md:hidden gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
              K
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">KDP INTELLIGENCE PRO</span>
          </div>

          <div>
            <span className="hidden md:inline text-xs font-bold text-slate-450 dark:text-slate-500">
              Welcome back to your publishing cockpit
            </span>
          </div>

          {/* Quick theme config / Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="px-2 py-1 text-[10px] font-mono font-bold bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20 rounded">
              ● AI Insights Active
            </span>
          </div>
        </header>

        {/* Mobile quick scroll header list */}
        <div className="md:hidden p-1.5 bg-slate-200/50 dark:bg-slate-950/80 border-b border-slate-250 dark:border-slate-800 flex gap-2 overflow-x-auto select-none px-4 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.name)}
                className={`py-1.5 px-3 rounded-full text-[11px] font-bold whitespace-nowrap flex items-center gap-1.5 transition-all outline-none border ${
                  isActive
                    ? "bg-slate-100 dark:bg-[#1c1c1e] text-slate-900 dark:text-white border-slate-300 dark:border-[#27272a]"
                    : "bg-white dark:bg-slate-900 text-slate-550 border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </button>
            );
          })}
        </div>

        {/* Content body component */}
        <main className="flex-grow p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
