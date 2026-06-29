import React, { useState } from "react";
import { Sparkles, Copy, FileText, Check, HelpCircle, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import { ListingOptimizerResult } from "../types";

export default function ListingOptimizer() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetNiche, setTargetNiche] = useState("ADHD Planner");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ListingOptimizerResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/listing-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, description, targetNiche }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-505 border-emerald-500/20 bg-emerald-500/5";
    if (score >= 60) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-rose-500 border-rose-500/20 bg-rose-500/5";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-505" />
          Amazon KDP Listing Optimizer
        </h2>
        <p className="text-xs text-slate-505 font-medium">
          Audit book details, measure target keyword weights, discover missed category words, and generate HTML formatted search description blurb layouts designed to convert searchers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Pane */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Current Book Metadata</h3>
          
          <form onSubmit={handleOptimize} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Book Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Anxiety Journal for Women..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-805 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Subtitle (KDP Keyword Line)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. A guided 90 day notebook with prompts..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-805 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block">Target Specific Niche</label>
              <input
                type="text"
                value={targetNiche}
                onChange={(e) => setTargetNiche(e.target.value)}
                placeholder="e.g. ADHD Planners, Anxiety Workbook, Bible Study..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-805 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Amazon Buyer Blurb description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste your current description text here..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-850 dark:text-slate-100 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-xs font-semibold text-white rounded-lg flex items-center gap-1.5 cursor-pointer leading-none"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Audit Listing Blurb
              </button>
            </div>
          </form>
        </div>

        {/* Output Diagnostics Panel */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="p-16 text-center border rounded-xl bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
              <div>
                <h4 className="text-sm font-semibold text-slate-705 dark:text-slate-350">Analyzing Listing Blurbs</h4>
                <p className="text-xs text-slate-400 font-mono">Examining keyword density, counting tags, and generating SEO enhancements...</p>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-fade-in">
              {/* Broad audit overview */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150">SEO Diagnostics Report</h3>
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-sm leading-none font-black ${getScoreColor(result.seoScore)}`}>
                    SEO Score: {result.seoScore}/100
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Keyword Density listing */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/20 rounded border border-slate-150 dark:border-slate-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] block">Density Indexers</span>
                    {result.keywordDensity.length === 0 ? (
                      <p className="text-[11px] text-slate-400 pt-1">No major target words identified.</p>
                    ) : (
                      <div className="space-y-1 font-mono">
                        {result.keywordDensity.slice(0, 4).map((kd, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-slate-650 dark:text-slate-400">{kd.keyword}:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{kd.count}x ({kd.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Terms */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/20 rounded-lg border border-slate-150 dark:border-slate-800 space-y-1.5 text-xs">
                    <span className="font-semibold text-slate-405 uppercase text-[10px] block">Relevance Gaps (Missing)</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-50/50 text-rose-500 border border-rose-100/30">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-1 text-xs">
                  <span className="font-semibold text-slate-400 uppercase text-[10px] block">Strategic Revisions</span>
                  <div className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="text-indigo-400">&#8226;</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optimized Previews Card */}
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-3 border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Proposed Amazon Metadata</h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Copy slots with one click</span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Title */}
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Pro Title Option</span>
                      <button
                        onClick={() => copyToClipboard(result.optimizedTitle, "opt_title")}
                        className="text-[10px] text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === "opt_title" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        Copy
                      </button>
                    </div>
                    <p className="font-bold text-slate-800 dark:text-slate-150 mt-1">{result.optimizedTitle}</p>
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Pro Subtitle Option (Keyword-Rich)</span>
                      <button
                        onClick={() => copyToClipboard(result.optimizedSubtitle, "opt_subtitle")}
                        className="text-[10px] text-indigo-505 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === "opt_subtitle" ? <Check className="w-3 h-3 text-emerald-505" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{result.optimizedSubtitle}</p>
                  </div>

                  {/* blurb description */}
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-3 rounded border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Pro Amazon HTML Blurb Layout</span>
                      <button
                        onClick={() => copyToClipboard(result.optimizedDescription, "opt_desc")}
                        className="text-[10px] text-indigo-505 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedSection === "opt_desc" ? <Check className="w-3 h-3 text-emerald-505" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy HTML
                      </button>
                    </div>
                    <pre className="font-mono text-[10px] text-slate-500 mt-1 max-h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed bg-white dark:bg-slate-900 border p-2.5 rounded">
                      {result.optimizedDescription}
                    </pre>
                  </div>

                  {/* Backend 7 slots */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Backend 7 Keyword Boxes</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {result.backendKeywords.map((tag, i) => (
                        <span
                          key={i}
                          onClick={() => copyToClipboard(tag, `tag_${i}`)}
                          className="px-2 py-1 bg-indigo-50/40 hover:bg-indigo-100/40 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg cursor-pointer flex items-center gap-1.5 font-mono text-[11px] font-semibold transition-all border border-indigo-100/20"
                        >
                          Slot {i + 1}: {tag}
                          {copiedSection === `tag_${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400 opacity-60" />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-slate-50 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Sparkles className="w-12 h-12 mx-auto text-slate-400 animate-pulse" />
              <h4 className="mt-2 text-sm font-bold text-slate-705 dark:text-slate-300">Ready to audit your metadata?</h4>
              <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
                Fill out the left metadata block input boxes and prompt the auditor to output your customized Amazon listing blueprint.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
