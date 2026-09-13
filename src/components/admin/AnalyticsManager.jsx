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
  ShieldCheck,
  Users,
  Search,
  ArrowUpRight,
  Heart,
  Grid,
  ExternalLink,
  Award,
  Flame,
  Check,
  Image as ImageIcon
} from "lucide-react";

const AnalyticsManager = () => {
  const [activeSubTab, setActiveSubTab] = useState("funnel"); // "funnel", "campaigns", "frames", "distribution", "health"
  const [timeframe, setTimeframe] = useState("today"); // "today", "last7d", "last30d", "allTime"
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Campaign search & filters
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("all"); // "all", "active", "featured"
  const [campaignSort, setCampaignSort] = useState("sessions"); // "sessions", "engagement", "poses"

  // Frame search & filters
  const [frameSearch, setFrameSearch] = useState("");
  const [frameLayoutFilter, setFrameLayoutFilter] = useState("all"); // "all", "3-grid", "4-grid", "2x2", "2x3"
  const [frameSort, setFrameSort] = useState("usage"); // "usage", "prints", "conversion"

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
    const { kpis, funnel, layouts, filters, framesAnalysis = [], campaignsAnalysis = [] } = analyticsData;

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
      ["Total Frames in Catalog", kpis.totalFramesInCatalog || framesAnalysis.length],
      ["Total Campaigns in Catalog", kpis.totalCampaignsInCatalog || campaignsAnalysis.length],
      [""],
      ["Pipeline Funnel"],
      ["Step", "Count", "Conversion %"],
      ...funnel.map(f => [f.step, f.count, f.conversion + "%"]),
      [""],
      ["Artist Campaign Analysis"],
      ["Campaign Name", "Group / Agency", "Poses Count", "Sessions", "Photos Captured", "Downloads", "Engagement Rate %", "Likes", "Status"],
      ...campaignsAnalysis.map(c => [c.name, `${c.groupName} (${c.agencyName})`, c.posesCount, c.sessionCount, c.photosCaptured, c.downloads, c.engagementRate + "%", c.communityLikes, c.status]),
      [""],
      ["Frame Layout & Theme Analysis"],
      ["Frame Name", "Layout Format", "Type", "Usage Count", "Share %", "High-Res Prints", "Conversion %", "DPI Standard", "Status"],
      ...framesAnalysis.map(f => [f.name, f.layout, f.type, f.usageCount, f.sharePercentage + "%", f.printCount, f.conversionRate + "%", f.dpi + " DPI", f.active ? "Active" : "Inactive"]),
      [""],
      ["Layout Formats Market Share"],
      ["Layout Name", "Count", "Percentage %"],
      ...layouts.map(l => [l.name, l.count, l.percentage + "%"]),
      [""],
      ["Filter Popularity"],
      ["Filter Name", "Uses", "Percentage %"],
      ...filters.map(f => [f.name, f.uses, f.percentage + "%"])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `snpshot-studio-analytics-${Date.now()}.csv`);
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

  const { kpis, funnel, layouts, filters, decorations, timeframeData, engineLogs, framesAnalysis = [], campaignsAnalysis = [] } = analyticsData;
  const currentTimeframeKPIs = timeframeData?.[timeframe] || kpis;

  // Filtered campaigns
  const filteredCampaigns = campaignsAnalysis
    .filter(c => {
      const matchSearch = c.name.toLowerCase().includes(campaignSearch.toLowerCase()) || 
                          c.groupName.toLowerCase().includes(campaignSearch.toLowerCase()) ||
                          c.agencyName.toLowerCase().includes(campaignSearch.toLowerCase());
      const matchStatus = campaignStatusFilter === "all" ? true :
                          campaignStatusFilter === "active" ? c.status === "active" :
                          campaignStatusFilter === "featured" ? Boolean(c.isFeatured) : true;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (campaignSort === "sessions") return b.sessionCount - a.sessionCount;
      if (campaignSort === "engagement") return b.engagementRate - a.engagementRate;
      if (campaignSort === "poses") return b.posesCount - a.posesCount;
      return 0;
    });

  // Filtered frames
  const filteredFrames = framesAnalysis
    .filter(f => {
      const matchSearch = f.name.toLowerCase().includes(frameSearch.toLowerCase());
      const matchLayout = frameLayoutFilter === "all" ? true : f.layout === frameLayoutFilter;
      return matchSearch && matchLayout;
    })
    .sort((a, b) => {
      if (frameSort === "usage") return b.usageCount - a.usageCount;
      if (frameSort === "prints") return b.printCount - a.printCount;
      if (frameSort === "conversion") return b.conversionRate - a.conversionRate;
      return 0;
    });

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e2dced] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#7226FF]/10 text-[#7226FF] font-bold">
              Module 09 // Studio Analytics
            </span>
            <span className="text-xs text-[#625b82] font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
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
            { id: "funnel", label: "Session KPIs & Funnel", icon: TrendingUp },
            { id: "campaigns", label: `Campaign Analysis (${campaignsAnalysis.length})`, icon: Award },
            { id: "frames", label: `Frame Analysis (${framesAnalysis.length})`, icon: Layers },
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

      {/* SUB-TAB 1: SESSION KPIS & 4-STEP FUNNEL */}
      {activeSubTab === "funnel" && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Active Sessions</span>
                <Users className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.activeSessions.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ↑ Dynamic database telemetry
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Photos Captured</span>
                <Camera className="w-4 h-4 text-[#F042FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.photosCaptured.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ↑ ~3.8 captures / session
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Downloads</span>
                <Download className="w-4 h-4 text-[#7226FF]" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.downloadsCompleted.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                ↑ 300 DPI High-Res Prints
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold">Completion Rate</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-[#010030] tracking-tight">{currentTimeframeKPIs.completionRate}%</div>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                Step 01 → Step 04 Conversion
              </span>
            </div>
          </div>

          {/* Real Gallery & Community Activity Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block">Published Community Prints</span>
                <span className="text-2xl font-black text-[#010030]">{kpis.totalCommunityPrints} prints</span>
              </div>
              <ImageIcon className="w-8 h-8 text-[#7226FF]/30" />
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block">300 DPI Print Verified</span>
                <span className="text-2xl font-black text-emerald-600">{kpis.verifiedDpiPrints} Verified</span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-500/30" />
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block">Total Community Likes</span>
                <span className="text-2xl font-black text-[#F042FF]">{kpis.totalLikes?.toLocaleString()} likes</span>
              </div>
              <Heart className="w-8 h-8 text-[#F042FF]/30" />
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

      {/* SUB-TAB 2: POSE CAMPAIGN ANALYSIS */}
      {activeSubTab === "campaigns" && (
        <div className="space-y-6">
          
          {/* Campaign Overview Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Total Campaigns</span>
              <span className="text-3xl font-black text-[#010030]">{campaignsAnalysis.length}</span>
              <span className="text-[10px] text-[#625b82] font-bold mt-1 block">Registered Artist Collabs</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Active Collabs</span>
              <span className="text-3xl font-black text-emerald-600">{campaignsAnalysis.filter(c => c.status === "active").length}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live in Photo Booth</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Total Pose Inventory</span>
              <span className="text-3xl font-black text-[#7226FF]">{campaignsAnalysis.reduce((acc, c) => acc + (c.posesCount || 0), 0)} poses</span>
              <span className="text-[10px] text-[#625b82] font-bold mt-1 block">Guidance & Templates</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Avg Engagement</span>
              <span className="text-3xl font-black text-[#F042FF]">
                {campaignsAnalysis.length > 0 ? (campaignsAnalysis.reduce((acc, c) => acc + c.engagementRate, 0) / campaignsAnalysis.length).toFixed(1) : 0}%
              </span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Session to Export Rate</span>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-white p-4 rounded-2xl border border-[#e2dced] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search campaign, artist name, group, or agency..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f8f6fc] text-xs font-mono rounded-xl border border-[#e2dced] focus:border-[#7226FF] outline-none text-[#010030]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#f8f6fc] p-1 rounded-xl border border-[#e2dced]">
                <span className="text-[10px] font-mono text-[#625b82] px-2 font-bold uppercase">Status:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "featured", label: "Featured" }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setCampaignStatusFilter(st.id)}
                    className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      campaignStatusFilter === st.id ? "bg-[#7226FF] text-white" : "text-[#010030] hover:bg-[#e2dced]"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#f8f6fc] p-1 rounded-xl border border-[#e2dced]">
                <span className="text-[10px] font-mono text-[#625b82] px-2 font-bold uppercase">Sort:</span>
                {[
                  { id: "sessions", label: "Sessions" },
                  { id: "engagement", label: "Engagement" },
                  { id: "poses", label: "Poses" }
                ].map((so) => (
                  <button
                    key={so.id}
                    onClick={() => setCampaignSort(so.id)}
                    className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      campaignSort === so.id ? "bg-[#010030] text-white" : "text-[#010030] hover:bg-[#e2dced]"
                    }`}
                  >
                    {so.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaign Analytics Leaderboard & Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map((camp, idx) => (
              <div key={camp.id} className="bg-white p-5 rounded-2xl border border-[#e2dced] shadow-xs space-y-4 hover:border-[#7226FF] transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#0e0048] border border-[#2e109d] shrink-0">
                      {camp.avatar ? (
                        <img src={camp.avatar} alt={camp.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-white text-base">
                          {camp.name.charAt(0)}
                        </div>
                      )}
                      {camp.isFeatured && (
                        <span className="absolute top-0 right-0 bg-[#F042FF] text-[8px] font-black text-[#010030] px-1 rounded-bl">
                          HOT
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-[#010030]">{camp.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#7226FF]/10 text-[#7226FF]">
                          {camp.groupName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#625b82] font-mono">
                        {camp.agencyName} • {camp.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-[#7226FF]">#{idx + 1} Rank</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold mt-1 ${
                      camp.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {camp.status}
                    </span>
                  </div>
                </div>

                {/* Campaign Metric Bars */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e2dced]/60">
                  <div className="p-2 bg-[#f8f6fc] rounded-xl text-center">
                    <span className="text-[10px] font-mono text-[#625b82] block font-bold">Sessions</span>
                    <span className="text-sm font-black text-[#010030]">{camp.sessionCount.toLocaleString()}</span>
                    <span className="text-[9px] text-[#7226FF] font-bold block">{camp.sharePercentage}% share</span>
                  </div>

                  <div className="p-2 bg-[#f8f6fc] rounded-xl text-center">
                    <span className="text-[10px] font-mono text-[#625b82] block font-bold">Captures</span>
                    <span className="text-sm font-black text-[#010030]">{camp.photosCaptured.toLocaleString()}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">{camp.posesCount} poses</span>
                  </div>

                  <div className="p-2 bg-[#f8f6fc] rounded-xl text-center">
                    <span className="text-[10px] font-mono text-[#625b82] block font-bold">Engagement</span>
                    <span className="text-sm font-black text-[#F042FF]">{camp.engagementRate}%</span>
                    <span className="text-[9px] text-amber-600 font-bold block">{camp.communityLikes} likes</span>
                  </div>
                </div>

                {/* Share bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[#625b82]">
                    <span>Studio Session Adoption</span>
                    <span className="font-bold text-[#010030]">{camp.sharePercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f0ecf8] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#7226FF] to-[#F042FF] rounded-full"
                      style={{ width: `${Math.max(5, camp.sharePercentage * 2.5)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-[#e2dced] text-center text-xs text-[#625b82]">
              No artist campaigns match your search criteria.
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: FRAME LAYOUT & THEME ANALYSIS */}
      {activeSubTab === "frames" && (
        <div className="space-y-6">
          
          {/* Frame Overview Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Total Frames</span>
              <span className="text-3xl font-black text-[#010030]">{framesAnalysis.length}</span>
              <span className="text-[10px] text-[#625b82] font-bold mt-1 block">In Design Catalog</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Active Frames</span>
              <span className="text-3xl font-black text-emerald-600">{framesAnalysis.filter(f => f.active).length}</span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Live in Photo Booth</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Total Prints Made</span>
              <span className="text-3xl font-black text-[#7226FF]">
                {framesAnalysis.reduce((acc, f) => acc + (f.printCount || 0), 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-[#625b82] font-bold mt-1 block">300 DPI Photostrips</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#e2dced] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#625b82] font-bold block mb-1">Avg Frame Conversion</span>
              <span className="text-3xl font-black text-[#F042FF]">
                {framesAnalysis.length > 0 ? (framesAnalysis.reduce((acc, f) => acc + f.conversionRate, 0) / framesAnalysis.length).toFixed(1) : 0}%
              </span>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Select to Download</span>
            </div>
          </div>

          {/* Search, Filter & Sort Controls */}
          <div className="bg-white p-4 rounded-2xl border border-[#e2dced] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search frame name or layout format..."
                value={frameSearch}
                onChange={(e) => setFrameSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#f8f6fc] text-xs font-mono rounded-xl border border-[#e2dced] focus:border-[#7226FF] outline-none text-[#010030]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#f8f6fc] p-1 rounded-xl border border-[#e2dced]">
                <span className="text-[10px] font-mono text-[#625b82] px-2 font-bold uppercase">Layout:</span>
                {[
                  { id: "all", label: "All" },
                  { id: "3-grid", label: "3-Grid" },
                  { id: "4-grid", label: "4-Grid" },
                  { id: "2x2", label: "2x2" },
                  { id: "2x3", label: "2x3" }
                ].map((ly) => (
                  <button
                    key={ly.id}
                    onClick={() => setFrameLayoutFilter(ly.id)}
                    className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      frameLayoutFilter === ly.id ? "bg-[#7226FF] text-white" : "text-[#010030] hover:bg-[#e2dced]"
                    }`}
                  >
                    {ly.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-[#f8f6fc] p-1 rounded-xl border border-[#e2dced]">
                <span className="text-[10px] font-mono text-[#625b82] px-2 font-bold uppercase">Sort:</span>
                {[
                  { id: "usage", label: "Usage" },
                  { id: "prints", label: "Prints" },
                  { id: "conversion", label: "Conversion" }
                ].map((so) => (
                  <button
                    key={so.id}
                    onClick={() => setFrameSort(so.id)}
                    className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                      frameSort === so.id ? "bg-[#010030] text-white" : "text-[#010030] hover:bg-[#e2dced]"
                    }`}
                  >
                    {so.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Frames Table & Performance Cards */}
          <div className="bg-white rounded-2xl border border-[#e2dced] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2dced] text-[#625b82] font-mono text-[10px] uppercase bg-[#f8f6fc]">
                    <th className="py-3 px-4">Frame & Swatch</th>
                    <th className="py-3 px-4">Layout Format</th>
                    <th className="py-3 px-4">Canvas Standard</th>
                    <th className="py-3 px-4">Usage Count</th>
                    <th className="py-3 px-4">Share %</th>
                    <th className="py-3 px-4">Prints Exported</th>
                    <th className="py-3 px-4">Conversion</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2dced]/60">
                  {filteredFrames.map((frm) => (
                    <tr key={frm.id} className="hover:bg-[#f8f6fc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg border shadow-xs shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ 
                              backgroundColor: frm.bgColor || "#0e0048",
                              borderColor: frm.borderColor || "#2e109d"
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: frm.borderColor || "#F042FF" }} />
                          </div>
                          <div>
                            <span className="font-bold text-[#010030] block">{frm.name}</span>
                            <span className="text-[10px] font-mono text-[#625b82] uppercase">{frm.type} frame</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#7226FF]">
                        {frm.layout === "3-grid" ? "Vertical 3-Strip" :
                         frm.layout === "4-grid" ? "Classic 4-Strip" :
                         frm.layout === "2x2" ? "2x2 Square" :
                         frm.layout === "2x3" ? "2x3 Postcard" : "All Layouts"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#625b82]">
                        {frm.resolution} <span className="text-emerald-600 font-bold">({frm.dpi} DPI)</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#010030]">
                        {frm.usageCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-[#f0ecf8] rounded-full overflow-hidden">
                            <div className="h-full bg-[#7226FF] rounded-full" style={{ width: `${frm.sharePercentage * 3}%` }} />
                          </div>
                          <span className="font-mono text-[11px] font-bold text-[#7226FF]">{frm.sharePercentage}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {frm.printCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-black text-[#F042FF]">
                        {frm.conversionRate}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold ${
                          frm.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {frm.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredFrames.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-[#e2dced] text-center text-xs text-[#625b82]">
              No frames match your search or layout filter.
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 4: LAYOUTS, FILTERS & DECORATION USAGE */}
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

      {/* SUB-TAB 5: ENGINE HEALTH & LATENCY BENCH */}
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

export default AnalyticsManager;
