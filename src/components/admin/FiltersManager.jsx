import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Sliders, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Layers, 
  Check, 
  Copy, 
  Maximize2, 
  SlidersHorizontal,
  Palette,
  Image as ImageIcon,
  Grid,
  Sun,
  Contrast,
  Aperture,
  Tv,
  Split,
  Globe,
  Radio,
  FileCheck,
  Zap,
  Save,
  CheckSquare
} from "lucide-react";

// Category options
const FILTER_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "Vintage", label: "Vintage Film" },
  { id: "Soft Glow", label: "Soft Glow" },
  { id: "B&W", label: "Monochrome B&W" },
  { id: "Cyber/Neon", label: "Cyber/Neon" },
  { id: "Special", label: "Special Effects" }
];

const FILTER_BADGES = ["POPULAR", "NEW", "FEATURED", "CLASSIC", "SPECIAL", "PRO"];

const SAMPLE_MODELS = [
  { id: "wonyoung1", name: "Studio Portrait 01", src: "/img/poses/Wonyoung1.png" },
  { id: "wonyoung2", name: "Studio Portrait 02", src: "/img/poses/Wonyoung2.png" },
  { id: "wonyoung3", name: "Studio Portrait 03", src: "/img/poses/Wonyoung3.png" }
];

const FiltersManager = () => {
  const [filters, setFilters] = useState([]);
  const [canvasConfig, setCanvasConfig] = useState({
    borderWidth: 16,
    photoGap: 12,
    borderRadius: 8,
    shadowStrength: 20,
    outerPadding: 20,
    bgPattern: "solid",
    bgGradient: "linear-gradient(135deg, #010030 0%, #2e109d 100%)",
    dpiMultiplier: 2,
    layoutSpecs: {
      "3-grid": { width: 1200, height: 1800, aspectRatio: "2:3", dpi: 300 },
      "4-grid": { width: 1200, height: 1800, aspectRatio: "2:3", dpi: 300 },
      "2x2": { width: 1200, height: 1200, aspectRatio: "1:1", dpi: 300 },
      "2x3": { width: 1800, height: 1200, aspectRatio: "3:2", dpi: 300 }
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' (6A) | 'geometry' (6B) | 'simulator' (6C)

  // Filters Catalog State
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState(null);
  const [savingFilter, setSavingFilter] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State for Filter Modal / Tuning
  const [filterFormData, setFilterFormData] = useState({
    name: "",
    category: "Vintage",
    badge: "NEW",
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    hueRotate: 0,
    grain: 0,
    blur: 0,
    desc: "",
    active: true
  });

  // Phase 6B: Canvas Geometry State
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [canvasSuccess, setCanvasSuccess] = useState(false);

  // Phase 6C: Split-Screen Simulator State
  const [simulatorFilterId, setSimulatorFilterId] = useState("warm-grain");
  const [selectedSampleModel, setSelectedSampleModel] = useState(SAMPLE_MODELS[0].src);
  const [splitPos, setSplitPos] = useState(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Fetch Filters & Canvas Config
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resStudio, resCanvas] = await Promise.all([
        axios.get("/api/studio/data"),
        axios.get("/api/creator/canvas-config")
      ]);

      if (resStudio.data && resStudio.data.filters) {
        setFilters(resStudio.data.filters);
        if (resStudio.data.filters.length > 0) {
          setSimulatorFilterId(resStudio.data.filters[0].id);
        }
      }

      if (resCanvas.data && resCanvas.data.canvasConfig) {
        setCanvasConfig(resCanvas.data.canvasConfig);
      }
    } catch (err) {
      console.error("Error fetching filters and canvas config:", err);
      setError("Failed to load filter presets and canvas settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to generate CSS filter string
  const getCssFilterString = (f) => {
    if (!f) return "none";
    const parts = [];
    if (f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
    if (f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
    if (f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
    if (f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
    if (f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
    if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
    return parts.length > 0 ? parts.join(" ") : "none";
  };

  // Copy CSS to clipboard
  const handleCopyCss = (f) => {
    const cssStr = `filter: ${getCssFilterString(f)};`;
    navigator.clipboard.writeText(cssStr);
    setCopiedId(f.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter CRUD Handlers
  const handleToggleActiveFilter = async (id, currentActive) => {
    try {
      await axios.put(`/api/creator/filters/${id}`, { active: !currentActive });
      fetchData();
    } catch (err) {
      console.error("Error toggling filter active state:", err);
    }
  };

  const handleDeleteFilter = async (id) => {
    if (!window.confirm("Delete this aesthetic filter preset?")) return;
    try {
      await axios.delete(`/api/creator/filters/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting filter:", err);
    }
  };

  const openCreateModal = () => {
    setEditingFilter(null);
    setFilterFormData({
      name: "",
      category: "Vintage",
      badge: "NEW",
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sepia: 0,
      hueRotate: 0,
      grain: 0,
      blur: 0,
      desc: "",
      active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFilter(f);
    setFilterFormData({
      name: f.name || "",
      category: f.category || "Vintage",
      badge: f.badge || "NEW",
      brightness: f.brightness !== undefined ? f.brightness : 100,
      contrast: f.contrast !== undefined ? f.contrast : 100,
      saturation: f.saturation !== undefined ? f.saturation : 100,
      sepia: f.sepia !== undefined ? f.sepia : 0,
      hueRotate: f.hueRotate !== undefined ? f.hueRotate : 0,
      grain: f.grain !== undefined ? f.grain : 0,
      blur: f.blur !== undefined ? f.blur : 0,
      desc: f.desc || "",
      active: f.active !== undefined ? f.active : true
    });
    setIsModalOpen(true);
  };

  const handleFilterFormSubmit = async (e) => {
    e.preventDefault();
    setSavingFilter(true);

    try {
      if (editingFilter) {
        await axios.put(`/api/creator/filters/${editingFilter.id}`, filterFormData);
      } else {
        await axios.post("/api/creator/filters", filterFormData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving filter preset:", err);
      alert("Failed to save filter preset.");
    } finally {
      setSavingFilter(false);
    }
  };

  // Phase 6B: Canvas Geometry Form Handler
  const handleSaveCanvasConfig = async () => {
    setSavingCanvas(true);
    setCanvasSuccess(false);
    try {
      await axios.put("/api/creator/canvas-config", canvasConfig);
      setCanvasSuccess(true);
      setTimeout(() => setCanvasSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving canvas config:", err);
      alert("Failed to save canvas geometry.");
    } finally {
      setSavingCanvas(false);
    }
  };

  // Filter Catalog Filtering
  const filteredFilters = filters.filter(f => {
    const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (f.desc && f.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeFilterObj = filters.find(f => f.id === simulatorFilterId) || filters[0];

  return (
    <div className="space-y-6">

      {/* TOP STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Active Studio Filters
            </span>
            <div className="text-3xl font-black text-[#010030]">
              {filters.filter(f => f.active).length} / {filters.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Real-Time Canvas Ready</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ecf8] text-[#7226FF] flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Canvas Border Geometry
            </span>
            <div className="text-3xl font-black text-[#7226FF] font-mono">
              {canvasConfig.borderWidth || 16}px
            </div>
            <span className="text-[10px] text-[#7226FF] font-medium">Padding: {canvasConfig.outerPadding || 20}px</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Photo Slot Gap
            </span>
            <div className="text-3xl font-black text-[#010030] font-mono">
              {canvasConfig.photoGap || 12}px
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Inner Radius: {canvasConfig.borderRadius || 8}px</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#010030] flex items-center justify-center shrink-0">
            <Grid className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Print DPI Multiplier
            </span>
            <div className="text-3xl font-black text-[#F042FF] font-mono">
              300 DPI
            </div>
            <span className="text-[10px] text-[#F042FF] font-medium">High-Res Render Engine</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#F042FF] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "catalog", label: "Filter Presets Catalog", icon: SlidersHorizontal },
            { id: "geometry", label: "Canvas Geometry & Border Suite", icon: Layers },
            { id: "simulator", label: "Live Split-Screen Test Bench", icon: Split }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`admin-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive 
                    ? "bg-[#010030] text-white shadow-xs" 
                    : "bg-[#f8f7fc] text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#F042FF]" : "text-[#7226FF]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "catalog" && (
          <button
            onClick={openCreateModal}
            className="admin-btn bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_4px_12px_rgba(114,38,255,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Filter Preset</span>
          </button>
        )}
      </div>

      {/* MAIN TAB CONTENT */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Filter Presets & Canvas Parameters...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* PHASE 6A: FILTER PRESETS CATALOG & PARAMETER TUNING */}
          {/* ========================================================================= */}
          {activeTab === "catalog" && (
            <div className="space-y-4">
              
              {/* Category Filter Bar */}
              <div className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-xs max-w-full overflow-x-auto pb-1 xl:pb-0">
                  <span className="text-[11px] font-bold text-[#625b82] uppercase mr-1 shrink-0">Category:</span>
                  {FILTER_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`admin-btn px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                        categoryFilter === cat.id
                          ? "bg-[#7226FF] text-white font-bold shadow-2xs"
                          : "bg-[#f4f2f8] text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full xl:w-72">
                  <input 
                    type="text"
                    placeholder="Search filters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-xs text-[#010030]"
                  />
                </div>
              </div>

              {/* Filter Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {filteredFilters.map((f) => {
                  const cssFilter = getCssFilterString(f);

                  return (
                    <div 
                      key={f.id}
                      className="bg-white border border-[#e2dced] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                    >
                      {/* Top Header & Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm text-[#010030]">{f.name}</h3>
                            <span className="bg-[#f0ecf8] text-[#7226FF] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {f.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#625b82] line-clamp-2">{f.desc}</p>
                        </div>

                        <span className="bg-[#010030] text-[#F042FF] font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border border-[#7226FF]/30 shrink-0">
                          {f.badge || "FILTER"}
                        </span>
                      </div>

                      {/* Filter Live Preview Swatch Box */}
                      <div className="w-full h-36 bg-[#0a0a1a] rounded-2xl border border-[#e2dced] overflow-hidden relative p-3 flex items-center justify-center bg-[radial-gradient(#1e1055_1px,transparent_1px)] [background-size:12px_12px]">
                        <div className="flex items-center gap-2">
                          <img 
                            src="/img/poses/Wonyoung1.png" 
                            alt="Filter preview"
                            className="w-24 h-28 object-contain rounded-lg shadow-md"
                            style={{ filter: cssFilter }}
                          />
                          <div className="text-[10px] text-white font-mono space-y-1 bg-[#010030]/80 p-2 rounded-xl border border-[#7226FF]/30">
                            <div>Bri: <span className="text-[#F042FF] font-bold">{f.brightness}%</span></div>
                            <div>Con: <span className="text-cyan-400 font-bold">{f.contrast}%</span></div>
                            <div>Sat: <span className="text-emerald-400 font-bold">{f.saturation}%</span></div>
                            <div>Sep: <span className="text-amber-400 font-bold">{f.sepia}%</span></div>
                            {f.grain > 0 && <div>Grn: <span className="text-rose-400 font-bold">{f.grain}%</span></div>}
                          </div>
                        </div>

                        {/* Grain Simulation Overlay */}
                        {f.grain > 0 && (
                          <div 
                            className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:4px_4px]" 
                          />
                        )}
                      </div>

                      {/* CSS String Box & Copy */}
                      <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-xl p-2.5 flex items-center justify-between gap-2">
                        <code className="text-[10px] font-mono text-[#7226FF] truncate flex-1">
                          filter: {cssFilter};
                        </code>
                        <button
                          onClick={() => handleCopyCss(f)}
                          className="admin-btn p-1 hover:bg-[#f0ecf8] text-[#7226FF] rounded-lg shrink-0"
                          title="Copy CSS Filter"
                        >
                          {copiedId === f.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f0ebf7]">
                        <button
                          onClick={() => handleToggleActiveFilter(f.id, f.active)}
                          className={`admin-btn px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer ${
                            f.active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {f.active ? "Active in Studio" : "Disabled"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSimulatorFilterId(f.id);
                              setActiveTab("simulator");
                            }}
                            className="admin-btn p-1.5 hover:bg-[#f0ecf8] text-[#7226FF] rounded-lg"
                            title="Test in Split Simulator"
                          >
                            <Split className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditModal(f)}
                            className="admin-btn p-1.5 hover:bg-[#f0ecf8] text-[#7226FF] rounded-lg"
                            title="Edit Parameters"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteFilter(f.id)}
                            className="admin-btn p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg"
                            title="Delete Filter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 6B: CANVAS GEOMETRY, BORDER & ASPECT RATIO SUITE */}
          {/* ========================================================================= */}
          {activeTab === "geometry" && (
            <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#7226FF]" />
                    <span>Global Studio Canvas & Border Geometry Suite</span>
                  </h3>
                  <p className="text-xs text-[#625b82]">
                    Tune outer border width, photo slot spacing, frame padding, and print resolution for physical output.
                  </p>
                </div>

                <button
                  onClick={handleSaveCanvasConfig}
                  disabled={savingCanvas}
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingCanvas ? "Saving Geometry..." : "Save Canvas Config"}</span>
                </button>
              </div>

              {canvasSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Canvas geometry parameters saved successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: PARAMETER SLIDERS */}
                <div className="lg:col-span-7 space-y-5">
                  
                  {/* Border Width Slider */}
                  <div className="space-y-1.5 bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-[#010030]">Outer Frame Border Width</label>
                      <span className="font-mono font-bold text-[#7226FF]">{canvasConfig.borderWidth || 16} px</span>
                    </div>
                    <input 
                      type="range"
                      min={4}
                      max={36}
                      value={canvasConfig.borderWidth || 16}
                      onChange={(e) => setCanvasConfig({ ...canvasConfig, borderWidth: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7226FF] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#625b82]">Outer framing edge width enclosing the photostrip.</p>
                  </div>

                  {/* Photo Slot Gap Slider */}
                  <div className="space-y-1.5 bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-[#010030]">Photo Slot Gap Spacing</label>
                      <span className="font-mono font-bold text-[#7226FF]">{canvasConfig.photoGap || 12} px</span>
                    </div>
                    <input 
                      type="range"
                      min={2}
                      max={28}
                      value={canvasConfig.photoGap || 12}
                      onChange={(e) => setCanvasConfig({ ...canvasConfig, photoGap: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7226FF] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#625b82]">Gap distance separating individual photo frames inside the strip.</p>
                  </div>

                  {/* Inner Frame Border Radius Slider */}
                  <div className="space-y-1.5 bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-[#010030]">Inner Corner Radius</label>
                      <span className="font-mono font-bold text-[#7226FF]">{canvasConfig.borderRadius || 8} px</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={24}
                      value={canvasConfig.borderRadius || 8}
                      onChange={(e) => setCanvasConfig({ ...canvasConfig, borderRadius: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7226FF] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#625b82]">Corner curvature applied to individual photo slots.</p>
                  </div>

                  {/* Outer Frame Shadow Strength */}
                  <div className="space-y-1.5 bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-[#010030]">Drop Shadow Softness</label>
                      <span className="font-mono font-bold text-[#7226FF]">{canvasConfig.shadowStrength || 20}%</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={50}
                      value={canvasConfig.shadowStrength || 20}
                      onChange={(e) => setCanvasConfig({ ...canvasConfig, shadowStrength: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#7226FF] cursor-pointer"
                    />
                  </div>

                </div>

                {/* RIGHT: LIVE CANVAS LAYOUT PREVIEW & PRINT SPECS */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="font-bold text-xs text-[#010030] uppercase tracking-wider">
                    Real-Time Geometry Preview
                  </h4>

                  {/* Interactive Photostrip Strip Preview */}
                  <div className="w-full bg-[#0a0a1a] rounded-3xl p-6 flex justify-center items-center relative overflow-hidden bg-[radial-gradient(#1e1055_1px,transparent_1px)] [background-size:16px_16px]">
                    
                    {/* Simulated Photostrip Card */}
                    <div 
                      className="bg-[#010030] border-2 border-[#2e109d] rounded-2xl shadow-2xl flex flex-col transition-all duration-300"
                      style={{
                        padding: `${canvasConfig.outerPadding || 20}px`,
                        gap: `${canvasConfig.photoGap || 12}px`,
                        width: "160px"
                      }}
                    >
                      {[1, 2, 3].map(slot => (
                        <div 
                          key={slot}
                          className="w-full h-20 bg-cover bg-center border border-white/10 shadow-xs relative overflow-hidden"
                          style={{ 
                            borderRadius: `${canvasConfig.borderRadius || 8}px`,
                            backgroundImage: "url('/img/poses/Wonyoung1.png')"
                          }}
                        >
                          <span className="absolute bottom-1 right-1 text-[7px] font-mono text-white/70 bg-black/50 px-1 rounded">
                            #{slot}
                          </span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Format Layout Resolution Chart */}
                  <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-4 text-xs space-y-2">
                    <span className="font-bold text-[#010030] block uppercase tracking-wider text-[10px]">
                      High-Resolution Print Specs (300 DPI)
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-white p-2 rounded-xl border border-[#e2dced]">
                        <span className="text-[#625b82] block text-[9px]">3-Grid / 4-Grid Strip</span>
                        <span className="font-bold text-[#010030]">1200 × 1800 px</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-[#e2dced]">
                        <span className="text-[#625b82] block text-[9px]">2x2 Square Grid</span>
                        <span className="font-bold text-[#010030]">1200 × 1200 px</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 6C: LIVE SPLIT-SCREEN TEST BENCH & SIMULATOR */}
          {/* ========================================================================= */}
          {activeTab === "simulator" && (
            <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#f0ebf7] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#F042FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Live Bench
                    </span>
                    <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                      <Split className="w-5 h-5 text-[#7226FF]" />
                      <span>Live Split-Screen Filter Test Bench & Simulator</span>
                    </h3>
                  </div>
                  <p className="text-xs text-[#625b82]">
                    Drag the split handle to compare Raw Camera Feed (Left) vs. Aesthetic Filtered & Border-Rendered Output (Right).
                  </p>
                </div>

                {/* Model Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#625b82] uppercase">Sample Shot:</span>
                  <select
                    value={selectedSampleModel}
                    onChange={(e) => setSelectedSampleModel(e.target.value)}
                    className="admin-ui bg-[#f8f7fc] text-[#010030] border border-[#e2dced] text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    {SAMPLE_MODELS.map(m => (
                      <option key={m.id} value={m.src}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Selector Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-[#625b82] uppercase shrink-0">Test Filter:</span>
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSimulatorFilterId(f.id)}
                    className={`admin-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      simulatorFilterId === f.id
                        ? "bg-[#7226FF] text-white shadow-xs"
                        : "bg-[#f8f7fc] text-[#4a4365] hover:bg-[#eae6f3]"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>

              {/* SPLIT-SCREEN VIEWPORT BENCH */}
              <div className="w-full h-96 bg-[#0a0a1a] rounded-3xl border border-[#e2dced] relative overflow-hidden select-none bg-[radial-gradient(#1e1055_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-6">
                
                <div className="relative w-80 h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#7226FF]/40 bg-[#010030]">
                  
                  {/* LEFT: RAW UNFILTERED PHOTO */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${selectedSampleModel}')` }}
                  >
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                      Raw Feed (No Filter)
                    </span>
                  </div>

                  {/* RIGHT: FILTERED & BORDER RENDERED CANVAS */}
                  <div 
                    className="absolute inset-y-0 right-0 overflow-hidden"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div 
                      className="absolute top-0 bottom-0 right-0 w-80 h-80 bg-cover bg-center transition-all"
                      style={{ 
                        backgroundImage: `url('${selectedSampleModel}')`,
                        filter: getCssFilterString(activeFilterObj)
                      }}
                    >
                      <span className="absolute top-2 right-2 bg-[#7226FF] text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase shadow-2xs">
                        {activeFilterObj?.name || "Filtered"}
                      </span>
                    </div>
                  </div>

                  {/* DRAGGABLE SPLIT HANDLE BAR */}
                  <div 
                    className="absolute inset-y-0 w-1 bg-[#F042FF] cursor-ew-resize z-30 shadow-lg flex items-center justify-center"
                    style={{ left: `${splitPos}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#010030] border-2 border-[#F042FF] text-[#F042FF] flex items-center justify-center shadow-md text-[10px] font-black">
                      ↔
                    </div>
                  </div>

                </div>

              </div>

              {/* Slider Position Range Controller */}
              <div className="flex items-center gap-4 bg-[#f8f7fc] border border-[#e2dced] p-3 rounded-2xl">
                <span className="text-xs font-bold text-[#010030] shrink-0">Split Position:</span>
                <input 
                  type="range"
                  min={0}
                  max={100}
                  value={splitPos}
                  onChange={(e) => setSplitPos(parseInt(e.target.value, 10))}
                  className="w-full accent-[#7226FF] cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-[#7226FF] shrink-0">{splitPos}%</span>
              </div>

            </div>
          )}

        </>
      )}

      {/* CREATE / EDIT FILTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#7226FF]" />
                <span>{editingFilter ? "Edit Filter Preset Parameters" : "Create New Aesthetic Filter"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFilterFormSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Filter Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Y2K Soft Glow"
                    value={filterFormData.name}
                    onChange={(e) => setFilterFormData({ ...filterFormData, name: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Category</label>
                  <select
                    value={filterFormData.category}
                    onChange={(e) => setFilterFormData({ ...filterFormData, category: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {FILTER_CATEGORIES.filter(c => c.id !== "all").map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="bg-[#f8f7fc] border border-[#e2dced] p-4 rounded-2xl space-y-3">
                <span className="font-bold text-[#010030] uppercase text-[10px] block">
                  Matrix Processing Parameters
                </span>

                <div>
                  <div className="flex justify-between font-bold mb-0.5">
                    <span>Brightness ({filterFormData.brightness}%)</span>
                  </div>
                  <input 
                    type="range" min={50} max={150} value={filterFormData.brightness}
                    onChange={(e) => setFilterFormData({ ...filterFormData, brightness: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#7226FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-0.5">
                    <span>Contrast ({filterFormData.contrast}%)</span>
                  </div>
                  <input 
                    type="range" min={50} max={150} value={filterFormData.contrast}
                    onChange={(e) => setFilterFormData({ ...filterFormData, contrast: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#7226FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-0.5">
                    <span>Saturation ({filterFormData.saturation}%)</span>
                  </div>
                  <input 
                    type="range" min={0} max={200} value={filterFormData.saturation}
                    onChange={(e) => setFilterFormData({ ...filterFormData, saturation: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#7226FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-0.5">
                    <span>Sepia Warmth ({filterFormData.sepia}%)</span>
                  </div>
                  <input 
                    type="range" min={0} max={100} value={filterFormData.sepia}
                    onChange={(e) => setFilterFormData({ ...filterFormData, sepia: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#7226FF]"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold mb-0.5">
                    <span>Film Grain Density ({filterFormData.grain}%)</span>
                  </div>
                  <input 
                    type="range" min={0} max={40} value={filterFormData.grain}
                    onChange={(e) => setFilterFormData({ ...filterFormData, grain: parseInt(e.target.value, 10) })}
                    className="w-full accent-[#7226FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Describe aesthetic feel..."
                  value={filterFormData.desc}
                  onChange={(e) => setFilterFormData({ ...filterFormData, desc: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn bg-[#f4f2f8] text-[#4a4365] font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFilter}
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  {savingFilter ? "Saving..." : "Save Filter"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default FiltersManager;
