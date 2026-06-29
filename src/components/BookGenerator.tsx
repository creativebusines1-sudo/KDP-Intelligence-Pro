import React, { useState, useEffect } from "react";
import { Sparkles, Copy, Download, Lightbulb, UserCheck, BookOpen, Layers, Check, Loader2, ListOrdered } from "lucide-react";
import { BookIdeaResult, BookOutlineResult } from "../types";

interface BookGeneratorProps {
  initialNiche?: string;
  openOutlineWithTitle?: string;
  openOutlineWithNiche?: string;
  onNavigate: (page: string, params?: any) => void;
}

export default function BookGenerator({
  initialNiche,
  openOutlineWithTitle,
  openOutlineWithNiche,
  onNavigate,
}: BookGeneratorProps) {
  const [activeSubTab, setActiveSubTab] = useState<"ideas" | "outline">("ideas");

  // Idea generator states
  const [niche, setNiche] = useState(initialNiche || "Anxiety Journal");
  const [targetAudience, setTargetAudience] = useState("Women in their 30s");
  const [isIdeasLoading, setIsIdeasLoading] = useState(false);
  const [ideasResult, setIdeasResult] = useState<BookIdeaResult | null>(null);

  // Outline generator states
  const [outlineTitle, setOutlineTitle] = useState(openOutlineWithTitle || "My Positive Family Workbook");
  const [outlineNiche, setOutlineNiche] = useState(openOutlineWithNiche || "Positivity journal");
  const [outlineBookType, setOutlineBookType] = useState<"Non-Fiction" | "Workbook" | "Journal" | "Planner">("Journal");
  const [outlineAudience, setOutlineAudience] = useState("Adults and Teens");
  const [isOutlineLoading, setIsOutlineLoading] = useState(false);
  const [outlineResult, setOutlineResult] = useState<BookOutlineResult | null>(null);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (initialNiche) {
      setActiveSubTab("ideas");
      setNiche(initialNiche);
      handleGenerateIdeas(initialNiche);
    }
  }, [initialNiche]);

  useEffect(() => {
    if (openOutlineWithTitle && openOutlineWithNiche) {
      setActiveSubTab("outline");
      setOutlineTitle(openOutlineWithTitle);
      setOutlineNiche(openOutlineWithNiche);
      handleGenerateOutline(openOutlineWithTitle, openOutlineWithNiche);
    }
  }, [openOutlineWithTitle, openOutlineWithNiche]);

  const handleGenerateIdeas = async (nicheValue?: string) => {
    const activeNiche = nicheValue || niche;
    if (!activeNiche.trim()) return;

    try {
      setIsIdeasLoading(true);
      const res = await fetch("/api/book-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: activeNiche, targetAudience }),
      });
      if (res.ok) {
        const data = await res.json();
        setIdeasResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsIdeasLoading(false);
    }
  };

  const handleGenerateOutline = async (tVal?: string, nVal?: string) => {
    const activeTitle = tVal || outlineTitle;
    const activeNiche = nVal || outlineNiche;
    if (!activeTitle.trim()) return;

    try {
      setIsOutlineLoading(true);
      const res = await fetch("/api/book-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeTitle,
          niche: activeNiche,
          bookType: outlineBookType,
          targetAudience: outlineAudience,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOutlineResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOutlineLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleExportIdeasText = () => {
    if (!ideasResult) return;

    const sections = [
      `KDP Book Blueprint - ${ideasResult.niche.toUpperCase()}`,
      `Target Audience: ${ideasResult.targetAudience}`,
      "=".repeat(40),
      "\nBOOK TITLE IDEAS:",
      ...ideasResult.titles.map((t, i) => `${i + 1}. ${t}`),
      "\nBOOK SUBTITLE IDEAS:",
      ...ideasResult.subtitles.map((s, i) => `${i + 1}. ${s}`),
      "\nRECOMMENDED KDP CATEGORY PATHS:",
      ...ideasResult.categories.map((c, i) => `${i + 1}. ${c}`),
      "\nBACKEND KEYWORD OPPORTUNITIES:",
      ...ideasResult.keywordOpportunities.map((k) => `- ${k}`),
    ];

    const element = document.createElement("a");
    const file = new Blob([sections.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `KDP_Book_Blueprint_${ideasResult.niche.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportOutlineText = () => {
    if (!outlineResult) return;

    let txt = [
      `MANUSCRIPT STRUCTURE OUTLINE: ${outlineResult.title.toUpperCase()}`,
      `Niche Category: ${outlineResult.niche}`,
      `Type: ${outlineResult.bookType} | Target Demographics: ${outlineResult.targetAudience}`,
      "=".repeat(50),
      "\nTABLE OF CONTENTS (TOC):",
      ...outlineResult.tableOfContents.map((chap, i) => `[Chapter ${i + 1}] ${chap}`),
      "\n" + "=".repeat(50) + "\n",
    ];

    outlineResult.chapters.forEach((ch) => {
      txt.push(`CHAPTER ${ch.chapterNumber}: ${ch.title}`);
      txt.push("-".repeat(30));
      txt.push("Core Subsections:");
      ch.sections.forEach((sec) => txt.push(`  * ${sec}`));
      if (ch.activities && ch.activities.length > 0) {
        txt.push("Workbook Prompts / Activities:");
        ch.activities.forEach((act) => txt.push(`  [ ] ${act}`));
      }
      if (ch.kdpTips) {
        txt.push(`KDP formatting guide: ${ch.kdpTips}`);
      }
      txt.push("\n");
    });

    const element = document.createElement("a");
    const file = new Blob([txt.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `KDP_Outline_${outlineResult.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-205 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveSubTab("ideas")}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 px-1 relative transition-all ${
            activeSubTab === "ideas"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          KDP Book Idea Generator
        </button>
        <button
          onClick={() => {
            setActiveSubTab("outline");
            if (!outlineResult) handleGenerateOutline();
          }}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 px-1 relative transition-all ${
            activeSubTab === "outline"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          AI Book Outline Generator
        </button>
      </div>

      {activeSubTab === "ideas" ? (
        // TAB 1: BOOK IDEAS GENERATOR
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
              KDP Book Title & Subtitle Generator
            </h2>
            <p className="text-xs text-slate-500">
              Brainstorm highly searchable main titles, optimized subtitles, recommended categories, and backend targets.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Book Niche Core Topic</label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Anxiety Journal, ADHD Planner, Crochet Logbook..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Audience Demographics</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Women in their 30s, Busy homeschool parents..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-805 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-550"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleGenerateIdeas()}
                disabled={isIdeasLoading || !niche.trim()}
                className="px-6 py-2.5 font-medium text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                {isIdeasLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Book Ideas
              </button>
            </div>
          </div>

          {isIdeasLoading && (
            <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Synthesizing Book Variations</h4>
                <p className="text-xs text-slate-400 font-mono">Formulating emotional main titles and subtitle variations aligned with core search hooks...</p>
              </div>
            </div>
          )}

          {ideasResult && !isIdeasLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Title List */}
              <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-indigo-500" />
                    KDP Title Options (50 ideas)
                  </h3>
                  <button onClick={handleExportIdeasText} className="text-[10px] text-indigo-505 font-bold hover:underline">Export</button>
                </div>

                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {ideasResult.titles.map((t, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(t)}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center group transition-all"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-305 leading-relaxed">{t}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedText === t ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Center Subtitles */}
              <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">KDP Subtiltes (20 ideas)</h3>
                </div>

                <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                  {ideasResult.subtitles.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleCopy(s)}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-xs hover:bg-slate-100 dark:hover:bg-slate-801 cursor-pointer flex justify-between items-center group transition-all"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-305 leading-relaxed">{s}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedText === s ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side Categories & Outlining */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">KDP Categories (10 paths)</h3>
                  <div className="space-y-2">
                    {ideasResult.categories.map((c, i) => (
                      <div key={i} className="p-2.5 rounded bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 font-mono text-[10px] text-slate-500 font-semibold">{c}</div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/10 dark:bg-indigo-950/10 space-y-3">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100">Proceed to Chapter Outline</h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Quickly convert the selected title concept into a full structural interior blueprint table of contents.
                  </p>
                  <button
                    onClick={() => {
                      setActiveSubTab("outline");
                      setOutlineTitle(ideasResult.titles[0]);
                      setOutlineNiche(ideasResult.niche);
                      handleGenerateOutline(ideasResult.titles[0], ideasResult.niche);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded cursor-pointer leading-none transition-all"
                  >
                    Build Outline Matrix →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // TAB 2: AI BOOK OUTLINE GENERATOR
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-855 dark:text-slate-100 flex items-center gap-2">
              AI Book Outline Generator
            </h2>
            <p className="text-xs text-slate-500">
              Create comprehensive manuscript interior designs, table of contents, and custom workbook exercises designed specifically for printed books.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Book Title</label>
                <input
                  type="text"
                  value={outlineTitle}
                  onChange={(e) => setOutlineTitle(e.target.value)}
                  placeholder="e.g. The Positive Reflection Logbook..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Book Layout Format</label>
                <select
                  value={outlineBookType}
                  onChange={(e: any) => setOutlineBookType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="Non-Fiction">Non-Fiction (Standard Text)</option>
                  <option value="Workbook">Workbook (Rich Prompts)</option>
                  <option value="Journal">Journal (Interactive Logs)</option>
                  <option value="Planner">Planner (Dated Layouts)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Target Audience</label>
                <input
                  type="text"
                  value={outlineAudience}
                  onChange={(e) => setOutlineAudience(e.target.value)}
                  placeholder="e.g. Adults, Kids under 8..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => handleGenerateOutline()}
                disabled={isOutlineLoading || !outlineTitle.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer leading-none"
              >
                {isOutlineLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                Generate Outline Blueprint
              </button>
            </div>
          </div>

          {isOutlineLoading && (
            <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Formulating Manuscript Blueprint</h4>
                <p className="text-xs text-slate-400 font-mono">Arranging chapters, workbook drills, and writing down interior KDP layout margin tips...</p>
              </div>
            </div>
          )}

          {outlineResult && !isOutlineLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* ToC list */}
              <div className="lg:col-span-1 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 h-fit">
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Table of Contents</h3>
                  <button onClick={handleExportOutlineText} className="text-xs text-indigo-500 hover:underline font-bold flex items-center gap-1">
                    <Download className="w-3 h-3" /> Export
                  </button>
                </div>
                <div className="space-y-1 font-mono text-xs">
                  {outlineResult.tableOfContents.map((chap, i) => (
                    <div key={i} className="p-2.5 rounded bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-450 font-semibold block">
                      Chapter {i + 1}: {chap}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Chapters breakdown */}
              <div className="lg:col-span-2 space-y-6">
                {outlineResult.chapters.map((ch) => (
                  <div
                    key={ch.chapterNumber}
                    className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-center border-b pb-2.5 border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-bold text-slate-850 dark:text-slate-100">
                        Chapter {ch.chapterNumber}: {ch.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-slate-405">Segment</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Structural Sections</span>
                        <div className="space-y-1.5">
                          {ch.sections.map((sec, i) => (
                            <div key={i} className="text-xs text-slate-650 dark:text-slate-350 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              {sec}
                            </div>
                          ))}
                        </div>
                      </div>

                      {ch.activities && ch.activities.length > 0 && (
                        <div className="space-y-2 p-3 rounded-lg bg-emerald-50/10 dark:bg-emerald-950/10 border border-emerald-100/30">
                          <span className="text-[10px] font-bold text-emerald-550 uppercase tracking-widest block">Interactive Worksheets</span>
                          <div className="space-y-1.5">
                            {ch.activities.map((act, i) => (
                              <div key={i} className="text-xs text-slate-605 dark:text-slate-355 flex items-start gap-2">
                                <span className="p-0.5 mt-0.5 border border-emerald-400 rounded text-[9px] text-emerald-500 leading-none">✓</span>
                                {act}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {ch.kdpTips && (
                      <div className="mt-2 p-3 bg-indigo-50/20 dark:bg-indigo-950/20 rounded-lg text-[11px] leading-normal text-slate-500 italic block border-l-2 border-indigo-500">
                        <b>KDP Formatting Guidelines:</b> {ch.kdpTips}
                      </div>
                    )}
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
