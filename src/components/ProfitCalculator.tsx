import React, { useState, useEffect } from "react";
import { Calculator, HelpCircle, DollarSign, Sparkles, TrendingUp, Download } from "lucide-react";
import { exportProfitCalculatorCSV, exportToPDF } from "../utils/exportUtils";

type InteriorType = "bw" | "standard_color" | "premium_color";
type CoverType = "paperback" | "hardcover";
type Marketplace = "com" | "uk" | "de" | "jp";

export default function ProfitCalculator() {
  const [pageCount, setPageCount] = useState<number>(120);
  const [price, setPrice] = useState<string>("9.99");
  const [interiorType, setInteriorType] = useState<InteriorType>("bw");
  const [coverType, setCoverType] = useState<CoverType>("paperback");
  const [marketplace, setMarketplace] = useState<Marketplace>("com");
  const [expandedDistribution, setExpandedDistribution] = useState<boolean>(false);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(150);

  // Result metrics
  const [printingCost, setPrintingCost] = useState<number>(0);
  const [royaltyPerBook, setRoyaltyPerBook] = useState<number>(0);
  const [marginPercent, setMarginPercent] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);
  const [annualEarnings, setAnnualEarnings] = useState<number>(0);

  useEffect(() => {
    calculateProfit();
  }, [pageCount, price, interiorType, coverType, marketplace, expandedDistribution, monthlyVolume]);

  const calculateProfit = () => {
    const bookPrice = parseFloat(price) || 0;
    let cost = 0;

    // Standard Amazon calculations based on KDP Printing Costs Help Center
    if (coverType === "paperback") {
      if (interiorType === "bw") {
        if (pageCount <= 108) {
          cost = 2.30;
        } else {
          cost = 1.00 + (pageCount * 0.012);
        }
      } else if (interiorType === "standard_color") {
        if (pageCount <= 108) {
          cost = 3.25;
        } else {
          cost = 1.15 + (pageCount * 0.019);
        }
      } else { // premium_color
        if (pageCount <= 40) {
          cost = 3.85;
        } else {
          cost = 1.00 + (pageCount * 0.0712);
        }
      }
    } else { // hardcover
      if (interiorType === "bw") {
        cost = 5.85 + (pageCount > 108 ? (pageCount - 108) * 0.012 : 0);
      } else if (interiorType === "standard_color") {
        cost = 6.85 + (pageCount > 108 ? (pageCount - 108) * 0.019 : 0);
      } else { // premium_color
        cost = 7.85 + (pageCount > 40 ? (pageCount - 40) * 0.0712 : 0);
      }
    }

    // Adjust rate currency multiplier weights
    let currencyMultiplier = 1.0;
    if (marketplace === "uk") currencyMultiplier = 1.25; // approximate FX weights
    if (marketplace === "de") currencyMultiplier = 1.1;
    if (marketplace === "jp") currencyMultiplier = 0.0075;

    // Royalties
    const multiplier = expandedDistribution ? 0.40 : 0.60;
    const grossRoyalty = bookPrice * multiplier;
    const netRoyalty = Math.max(0, grossRoyalty - cost);
    const unitMargin = bookPrice > 0 ? (netRoyalty / bookPrice) * 100 : 0;

    setPrintingCost(cost);
    setRoyaltyPerBook(netRoyalty);
    setMarginPercent(unitMargin);

    const monthlyEarn = netRoyalty * monthlyVolume;
    setMonthlyEarnings(monthlyEarn);
    setAnnualEarnings(monthlyEarn * 12);
  };

  const getCurrencySymbol = () => {
    if (marketplace === "uk") return "£";
    if (marketplace === "de") return "€";
    if (marketplace === "jp") return "¥";
    return "$";
  };

  const handleExportCSV = () => {
    const rawPrice = parseFloat(price) || 0;
    const inputData = {
      pageCount,
      bookPrice: rawPrice,
      bindingType: interiorType === "bw" ? "black-white" : interiorType === "standard_color" ? "color-standard" : "color-premium" as any,
      format: coverType,
      marketplace: marketplace === "com" ? "amazon.com" : marketplace === "uk" ? "amazon.co.uk" : "amazon.de" as any,
      monthlyEstimatedSales: monthlyVolume
    };

    const outputData = {
      printingCost,
      royaltyRate: expandedDistribution ? 0.40 : 0.60,
      royaltyPerSale: royaltyPerBook,
      monthlyEarnings,
      annualEarnings
    };

    exportProfitCalculatorCSV(inputData, outputData);
  };

  const handleExportPDF = () => {
    const rawPrice = parseFloat(price) || 0;
    const inputData = {
      pageCount,
      bookPrice: rawPrice,
      bindingType: interiorType === "bw" ? "black-white" : interiorType === "standard_color" ? "color-standard" : "color-premium" as any,
      format: coverType,
      marketplace: marketplace === "com" ? "amazon.com" : marketplace === "uk" ? "amazon.co.uk" : "amazon.de" as any,
      monthlyEstimatedSales: monthlyVolume
    };

    const outputData = {
      printingCost,
      royaltyRate: expandedDistribution ? 0.40 : 0.60,
      royaltyPerSale: royaltyPerBook,
      monthlyEarnings,
      annualEarnings
    };

    exportToPDF("profit", { input: inputData, output: outputData }, `KDP_Royalty_Financial_Analysis_${pageCount}pg.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-505" />
          KDP Royalty & Profit Calculator
        </h2>
        <p className="text-xs text-slate-505 font-medium">
          Pre-calculate exact Amazon printing costs and dynamic sliding royalty margins using live parameters for paperback or hardcover listings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form Parameter Panel */}
        <div className="lg:col-span-1 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150 border-b pb-2">Listing Attributes</h3>
          
          <div className="space-y-4">
            {/* Page Count */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Estimated Page Count</label>
              <input
                type="number"
                min={24}
                max={1000}
                value={pageCount}
                onChange={(e) => setPageCount(Math.max(24, parseInt(e.target.value) || 24))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-805 dark:text-slate-100 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block">Paperbacks require a minimum of 24 pages.</span>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Book List Price</label>
              <div className="relative">
                <span className="text-sm font-bold text-slate-400 absolute left-3 top-2">{getCurrencySymbol()}</span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.99"
                  className="w-full pl-7 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-805 dark:text-slate-100 font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cover Type Binding</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setCoverType("paperback")}
                  className={`py-2 rounded font-semibold border transition-all cursor-pointer ${
                    coverType === "paperback"
                      ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500"
                  }`}
                >
                  Paperback
                </button>
                <button
                  onClick={() => setCoverType("hardcover")}
                  className={`py-2 rounded font-semibold border transition-all cursor-pointer ${
                    coverType === "hardcover"
                      ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500"
                  }`}
                >
                  Hardcover
                </button>
              </div>
            </div>

            {/* Interior color */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-405 uppercase tracking-wider block">Interior Ink & Paper</label>
              <select
                value={interiorType}
                onChange={(e: any) => setInteriorType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="bw">Black & White Interior</option>
                <option value="standard_color">Standard Color (Value Plan)</option>
                <option value="premium_color">Premium Color (High Quality Gloss)</option>
              </select>
            </div>

            {/* Marketplace */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Amazon Marketplace Hub</label>
              <select
                value={marketplace}
                onChange={(e: any) => setMarketplace(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-205 focus:outline-none"
              >
                <option value="com">Amazon.com (USD)</option>
                <option value="uk">Amazon.co.uk (GBP)</option>
                <option value="de">Amazon.de/fr/es (EUR)</option>
                <option value="jp">Amazon.co.jp (JPY)</option>
              </select>
            </div>

            {/* Expanded distribution */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <input
                id="exp_dist"
                type="checkbox"
                checked={expandedDistribution}
                onChange={(e) => setExpandedDistribution(e.target.checked)}
                className="w-4 h-4 rounded border-slate-200 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="exp_dist" className="text-xs font-semibold text-slate-650 dark:text-slate-350 cursor-pointer">
                Expanded Distribution (40% rate)
              </label>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-150">Unit Royalty Breakdown</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  title="Export details to CSV"
                  className="px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> CSV Ledger
                </button>
                <button
                  onClick={handleExportPDF}
                  title="Export report to PDF"
                  className="px-2.5 py-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 rounded transition-all cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> PDF Report
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unit printing cost */}
              <div className="p-5 rounded-lg border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Printing Cost per unit</span>
                <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">
                  {getCurrencySymbol()}{printingCost.toFixed(3)}
                </p>
                <span className="text-[9px] text-slate-400 block font-semibold">fixed cost of KDP interior</span>
              </div>

              {/* Unit royalty */}
              <div className="p-5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/10 bg-emerald-500/5 text-center space-y-1">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider block">Net Royalty per sale</span>
                <p className="text-2xl font-black text-emerald-500 font-mono">
                  {getCurrencySymbol()}{royaltyPerBook.toFixed(2)}
                </p>
                <span className="text-[9px] text-emerald-600 block font-semibold">your net passive earnings</span>
              </div>

              {/* Net profit margin */}
              <div className="p-5 rounded-lg border border-indigo-100/50 dark:border-indigo-900/10 bg-indigo-550/5 text-center space-y-1">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-wider block">Profit Margin Percentage</span>
                <p className="text-2xl font-black text-indigo-500 font-mono">
                  {marginPercent.toFixed(1)}%
                </p>
                <span className="text-[9px] text-indigo-500 block font-semibold font-mono">ROI index rating</span>
              </div>
            </div>

            {/* Formulas explanations */}
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1 block leading-normal">
              <span className="font-bold text-slate-700 dark:text-slate-300">How this gets calculated:</span>
              <p>Royalty Rate matches KDP default rules ({expandedDistribution ? "40%" : "60%"} Gross MSRP). Inside Amazon, your actual earnings are derived as: <b>(Book MSRP * Royalty Rate) - Printing Overhead.</b></p>
            </div>
          </div>

          {/* Monthly slider projections */}
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-150">Passive Earnings Forecasting</h3>
              <span className="text-xs font-mono text-slate-450">Multiplier volume: {monthlyVolume} units/mo</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <input
                  type="range"
                  min={1}
                  max={2000}
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer bg-slate-200 dark:bg-slate-800 rounded-lg height-1.5"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>1 book</span>
                  <span>500 books</span>
                  <span>1000 books</span>
                  <span>2000 books</span>
                </div>
              </div>

              {/* Final projection displays */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-4 py-3.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Projected Monthly Profit
                  </span>
                  <span className="font-black text-slate-800 dark:text-emerald-450 text-base">
                    {getCurrencySymbol()}{monthlyEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/20 px-4 py-3.5 rounded-lg border border-slate-100 dark:border-slate-800 font-mono text-xs">
                  <span className="text-slate-505 flex items-center gap-1">
                    Proj. Annualized Earnings
                  </span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400 text-base text-right">
                    {getCurrencySymbol()}{annualEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
