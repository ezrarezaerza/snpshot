import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Camera, 
  Download, 
  Layers, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  FileText, 
  Sliders, 
  Filter,
  ArrowDownRight,
  ShieldCheck
} from "lucide-react";

const AnalyticsManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("funnel"); // "funnel", "distribution", "health"
  const [timeframe, setTimeframe] = useState("today"); // "today", "last7d", "last30d", "allTime"
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSimulate = async (count = 10) => {
    setSimulating(true);
    setStatusMessage(`Simulating ${count} active studio sessions...`);
    try {
      const res = await fetch("/api/creator/analytics/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count })
      });
      if (res.ok) {
        const json = await res.json();
        setAnalyticsData(json.analytics);
        setStatusMessage(`Successfully simulated ${count} studio sessions!`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Simulation failed:", err);
      setStatusMessage("Simulation failed.");
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset analytics metrics to baseline defaults?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/creator/analytics/reset", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setAnalyticsData(json.analytics);
        setStatusMessage("Analytics reset to default baseline.");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    } catch (err) {
      console.error("Reset failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!analyticsData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(analyticsData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `snpshot-analytics-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    if (!analyticsData) return;
    const rows = [
      ["SNPSHOT Studio Analytics Report"],
      ["Generated At", new Date().toISOString()],
      ["Timeframe", timeframe],
      [""],
      ["KPIs"],
      ["Active Sessions", kpis.activeSessions],
      ["Photos Captured", kpis.photosCaptured],
      ["Downloads Completed", kpis.downloadsCompleted],
      ["Completion Rate (%)", kpis.completionRate],
      ["Avg Render Latency (ms)", kpis.avgRenderLatencyMs],
      ["Export Success Rate (%)", kpis.exportSuccessRate],
      [""],
      ["Pipeline Funnel"],
      ["Step", "Count", "Conversion %"],
      ...funnel.map(f => [f.step, f.count, f.conversion + "%"]),
      [""],
      ["Layout Formats"],
      ["Layout Name", "Count", "Percentage %"],
      ...layouts.map(l => [l.name, l.count, l.percentage + "%"]),
      [""],
      ["Filter Popularity"],
      ["Filter Name", "Uses", "Percentage %"],
      ...filters.map(f => [f.name, f.uses, f.percentage + "%"])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `snpshot-analytics-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!analyticsData) {
    return (
      <div className="p-12 text-center">
        <RefreshCw className="w-8 h-8 text-[#7226FF] animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#010030]">Loading Studio Analytics Engine...</p>
      </div>
    );
  }

  const { kpis, funnel, layouts, filters, decorations, timeframeData, engineLogs } = analyticsData;
  const currentTimeframeKPIs = timeframeData?.[timeframe] || kpis;

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e2dced] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#7226FF]/10 text-[#7226FF] font-bold">
              Module 09 // Studio Analytics
            </span>
            <span className="text-xs text-[#625b82] font-mono">
              Live Tracker
            </span>
          </div>
          <h1 className="text-xl font-black text-[#010030] tracking-tight">
            Studio Usage & Pipeline Performance
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={fetchAnalytics}
            className="admin-btn p-2.5 border border-[#e2dced] bg-white rounded-xl text-[#010030] hover:bg-[#f0ecf8] transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#7226FF]" : ""}`} />
          </button>

          <button
            onClick={() => handleSimulate(10)}
            disabled={simulating}
            className="admin-btn px-3.5 py-2.5 bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(114,38,255,0.3)] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${simulating ? "animate-spin" : ""}`} />
            <span>Simulate Sessions</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="admin-btn px-3 py-2.5 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#7226FF]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sub-Tab Navigation Bar & Timeframe Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#f8f6fc] p-2 rounded-2xl border border-[#e2dced]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: "funnel", label: "Session KPIs & 4-Step Funnel", icon: TrendingUp },
            { id: "distribution", label: "Layouts, Filters & Assets", icon: BarChart3 },
            { id: "health", label: "Engine Health & Latency", icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`admin-btn px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? "bg-[#010030] text-white shadow-xs"
                    : "text-[#625b82] hover:bg-[#f0ecf8] hover:text-[#010030]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#e2dced] shrink-0 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-[#625b82] px-2 font-bold uppercase">Timeframe:</span>
          {[
            { id: "today", label: "Today" },
            { id: "last7d", label: "7 Days" },
            { id: "last30d", label: "30 Days" },
            { id: "allTime", label: "All-Time" }
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                timeframe === tf.id ? "bg-[#7226FF] text-white" : "text-[#010030] hover:bg-[#f0ecf8]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: SESSION KPIS & 4-STEP FUNNEL (PHASE 9A) */}
      {activeSubTab === "funnel" && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Active Sessions</span>
                <UsersIcon className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.activeSessions.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ↑ +12% from previous period
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Photos Captured</span>
                <Camera className="w-4 h-4 text-[#F042FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.photosCaptured.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ↑ ~4.1 photos / session
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Downloads</span>
                <Download className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.downloadsCompleted.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ↑ 300 DPI High-Res Exports
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Completion Rate</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.completionRate}%</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                Step 01 → Step 04 Success
              </span>
            </div>
          </div>

          {/* 4-Step Studio Conversion Funnel */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#e2dced] pb-4">
              <div>
                <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#7226FF]" />
                  <span>4-Step Studio Conversion Funnel</span>
                </h2>
                <p className="text-xs text-[#625b82]">
                  Real-time progression rate from layout selection through camera capture, decoration, and download.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#7226FF] bg-[#7226FF]/10 px-2.5 py-1 rounded-full">
                Conversion Standard: {currentTimeframeKPIs.completionRate}%
              </span>
            </div>

            <div className="space-y-4">
              {funnel.map((step, idx) => {
                const prevCount = idx === 0 ? step.count : funnel[idx - 1].count;
                const dropoff = idx === 0 ? 0 : (100 - (step.count / prevCount) * 100).toFixed(1);

                return (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#010030]">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#010030] text-white flex items-center justify-center font-mono text-[10px]">
                          0{idx + 1}
                        </span>
                        <span>{step.step}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#625b82] font-mono">{step.count.toLocaleString()} sessions</span>
                        <span className="text-[#7226FF] font-black w-14 text-right">{step.conversion}%</span>
                      </div>
                    </div>

                    <div className="w-full h-4 bg-[#f0ecf8] rounded-full overflow-hidden p-0.5 border border-[#e2dced]">
                      <div
                        className="h-full bg-gradient-to-r from-[#010030] via-[#7226FF] to-[#F042FF] rounded-full transition-all duration-500"
                        style={{ width: `${step.conversion}%` }}
                      />
                    </div>

                    {idx < funnel.length - 1 && (
                      <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 pt-1 pr-1 font-mono">
                        <ArrowDownRight className="w-3 h-3 text-red-400" />
                        <span>Step Drop-off: <strong className="text-red-500">{dropoff}%</strong></span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: LAYOUTS, FILTERS & DECORATION USAGE (PHASE 9B) */}
      {activeSubTab === "distribution" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Layout Formats Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dced] pb-3">
              <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#7226FF]" />
                <span>Layout Format Preference</span>
              </h2>
              <span className="text-[10px] font-mono text-[#625b82]">
                {layouts.reduce((a, b) => a + b.count, 0).toLocaleString()} Total Picks
              </span>
            </div>

            <div className="space-y-3.5">
              {layouts.map((layout) => (
                <div key={layout.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#010030]">
                    <span>{layout.name}</span>
                    <span className="font-mono text-[#7226FF]">{layout.count} picks ({layout.percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#f0ecf8] rounded-full overflow-hidden p-0.5 border border-[#e2dced]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${layout.percentage}%`, backgroundColor: layout.color || "#7226FF" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aesthetic Filter Popularity */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dced] pb-3">
              <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F042FF]" />
                <span>Studio Aesthetic Filter Usage</span>
              </h2>
              <span className="text-[10px] font-mono text-[#625b82]">
                {filters.reduce((a, b) => a + b.uses, 0).toLocaleString()} Renders
              </span>
            </div>

            <div className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between p-2.5 bg-[#f8f6fc] rounded-xl border border-[#e2dced]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles className="w-4 h-4 text-[#7226FF] shrink-0" />
                    <span className="text-xs font-bold text-[#010030] truncate">{filter.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24 h-2 bg-[#e2dced] rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-[#7226FF] rounded-full" style={{ width: `${filter.percentage}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#7226FF] w-16 text-right">
                      {filter.uses} ({filter.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Decoration Leaderboard */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e2dced] pb-3">
              <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Canvas Decoration Assets Leaderboard</span>
              </h2>
              <span className="text-xs text-[#625b82]">Most applied digital stamps, stickers & borders</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {decorations.map((item) => (
                <div key={item.id || item.name} className="p-3 bg-[#f8f6fc] border border-[#e2dced] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#7226FF] font-bold block">{item.type}</span>
                    <span className="text-xs font-bold text-[#010030]">{item.name}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-[#e2dced] rounded-lg text-xs font-mono font-bold text-[#010030]">
                    {item.count} uses
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: ENGINE HEALTH & LATENCY BENCH (PHASE 9C) */}
      {activeSubTab === "health" && (
        <div className="space-y-6">
          
          {/* Health Metrics Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Avg Render Latency</span>
                <Clock className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{kpis.avgRenderLatencyMs} ms</div>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Optimal Canvas Performance</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Export Success Rate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{kpis.exportSuccessRate}%</div>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Zero canvas raster failures</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Export Standard</span>
                <FileText className="w-4 h-4 text-[#F042FF]" />
              </div>
              <div className="text-2xl font-black text-[#010030] tracking-tight">2400x7200 PNG</div>
              <span className="text-[10px] text-[#625b82] font-bold mt-1 block">300 DPI Printable Output</span>
            </div>
          </div>

          {/* Engine Render Log Suite */}
          <div className="bg-white p-6 rounded-2xl border border-[#e2dced] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2dced] pb-4">
              <div>
                <h2 className="font-bold text-base text-[#010030] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#7226FF]" />
                  <span>Studio Canvas Engine Logs</span>
                </h2>
                <p className="text-xs text-[#625b82]">
                  Recent high-resolution photostrip composite generation benchmarks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSimulate(50)}
                  disabled={simulating}
                  className="admin-btn px-3 py-1.5 bg-[#7226FF] text-white hover:bg-[#5f1ce0] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Benchmark +50 Sessions</span>
                </button>

                <button
                  onClick={handleReset}
                  className="admin-btn px-3 py-1.5 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset Baseline</span>
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2dced] text-[#625b82] font-mono text-[10px] uppercase">
                    <th className="py-2.5 px-3">Log ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Resolution & Standard</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2dced]/60">
                  {engineLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#f8f6fc] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#7226FF]">{log.id}</td>
                      <td className="py-2.5 px-3 text-[#625b82] font-mono">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-medium text-[#010030]">{log.resolution} ({log.format})</td>
                      <td className="py-2.5 px-3 font-mono text-[#010030]">{log.latencyMs} ms</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Export JSON Report Option */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleExportJSON}
                className="admin-btn px-3 py-1.5 bg-[#f0ecf8] hover:bg-[#e2dced] text-[#010030] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#7226FF]" />
                <span>Export Full Diagnostics JSON</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

// Helper Icon
function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default AnalyticsManager;
