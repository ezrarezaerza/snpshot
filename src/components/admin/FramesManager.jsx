import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  Palette, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Copy, 
  RefreshCw,
  Sliders,
  Check,
  Upload,
  X
} from "lucide-react";

const FramesManager = () => {
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState("all"); // "all", "bg-color", "overlay-theme"
  const [formData, setFormData] = useState({
    name: "",
    type: "color",
    layout: "all",
    bgColor: "#ffffff",
    bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
    borderColor: "#e6e2f2",
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchFrames = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin/frames");
      if (res.data && res.data.frames) {
        setFrames(res.data.frames);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching admin frames:", err);
      setError("Failed to load frames from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleToggleActive = async (frame) => {
    try {
      const updatedStatus = !frame.active;
      const res = await axios.put(`/api/admin/frames/${frame.id}`, { active: updatedStatus });
      if (res.data && res.data.success) {
        setFrames(prev => prev.map(f => f.id === frame.id ? { ...f, active: updatedStatus } : f));
      }
    } catch (err) {
      console.error("Error toggling frame status:", err);
    }
  };

  const handleDeleteFrame = async (id) => {
    if (!window.confirm("Are you sure you want to delete this frame layout?")) return;
    try {
      const res = await axios.delete(`/api/admin/frames/${id}`);
      if (res.data && res.data.success) {
        setFrames(prev => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error("Error deleting frame layout:", err);
    }
  };

  const handleDuplicateFrame = async (frame) => {
    try {
      const duplicatedData = {
        name: `${frame.name} (Copy)`,
        type: frame.type,
        layout: frame.layout,
        bgColor: frame.bgColor,
        bgGradient: frame.bgGradient,
        borderColor: frame.borderColor,
        active: frame.active
      };
      const res = await axios.post("/api/admin/frames", duplicatedData);
      if (res.data && res.data.success) {
        setFrames(prev => [res.data.frame, ...prev]);
      }
    } catch (err) {
      console.error("Error duplicating frame:", err);
    }
  };

  const openCreateModal = (defaultType = "color") => {
    setEditingFrame(null);
    setFormData({
      name: "",
      type: defaultType,
      layout: "all",
      bgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
      borderColor: "#e6e2f2",
      active: true
    });
    setImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (frame) => {
    setEditingFrame(frame);
    setFormData({
      name: frame.name || "",
      type: frame.type || "color",
      layout: frame.layout || "all",
      bgColor: frame.bgColor || "#ffffff",
      bgGradient: frame.bgGradient || "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
      borderColor: frame.borderColor || "#e6e2f2",
      active: frame.active !== undefined ? frame.active : true
    });
    setImageFile(null);
    setImagePreview(frame.imageSrc || "");
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, type: "png" }));
    }
  };

  const handleSaveFrame = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      let res;
      if (imageFile) {
        const payload = new FormData();
        payload.append("name", formData.name);
        payload.append("type", formData.type);
        payload.append("layout", formData.layout);
        payload.append("bgColor", formData.bgColor);
        payload.append("bgGradient", formData.bgGradient);
        payload.append("borderColor", formData.borderColor);
        payload.append("active", formData.active);
        payload.append("image", imageFile);

        if (editingFrame) {
          res = await axios.put(`/api/admin/frames/${editingFrame.id}`, payload);
        } else {
          res = await axios.post("/api/admin/frames", payload);
        }
      } else {
        const payload = {
          name: formData.name,
          type: formData.type,
          layout: formData.layout,
          bgColor: formData.bgColor,
          bgGradient: formData.bgGradient,
          borderColor: formData.borderColor,
          active: formData.active,
          imageSrc: imagePreview || ""
        };

        if (editingFrame) {
          res = await axios.put(`/api/admin/frames/${editingFrame.id}`, payload);
        } else {
          res = await axios.post("/api/admin/frames", payload);
        }
      }

      if (res.data && res.data.success) {
        fetchFrames();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Error saving frame layout:", err);
      alert("Failed to save frame layout. Please check inputs.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered list calculation
  const filteredFrames = frames.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayout = selectedLayoutFilter === "all" || f.layout === selectedLayoutFilter || f.layout === "all";
    const matchesType = selectedTypeFilter === "all" || f.type === selectedTypeFilter;
    const matchesStatus = selectedStatusFilter === "all" || 
      (selectedStatusFilter === "active" && f.active) || 
      (selectedStatusFilter === "inactive" && !f.active);
    
    let matchesCategory = true;
    if (activeCategoryTab === "bg-color") {
      matchesCategory = f.type === "color" || f.type === "gradient" || !f.imageSrc;
    } else if (activeCategoryTab === "overlay-theme") {
      matchesCategory = f.type === "png" || Boolean(f.imageSrc);
    }

    return matchesSearch && matchesLayout && matchesType && matchesStatus && matchesCategory;
  });

  // Quick stats
  const totalFramesCount = frames.length;
  const activeFramesCount = frames.filter(f => f.active).length;
  const bgColorsCount = frames.filter(f => f.type === "color" || f.type === "gradient").length;
  const pngOverlaysCount = frames.filter(f => f.type === "png" || f.imageSrc).length;

  return (
    <div className="space-y-6">
      
      {/* BENTO STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat Tile 1 */}
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Total Frames
            </span>
            <div className="text-3xl font-black text-[#010030]">{totalFramesCount}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#f3eeff] border border-[#e2dced] flex items-center justify-center text-[#7226FF]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Tile 2 */}
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Active Presets
            </span>
            <div className="text-3xl font-black text-emerald-600">{activeFramesCount}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Tile 3 */}
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              PNG Overlays
            </span>
            <div className="text-3xl font-black text-[#7226FF]">{pngOverlaysCount}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#f3eeff] border border-[#e2dced] flex items-center justify-center text-[#7226FF]">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Stat Tile 4 */}
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:shadow-md transition-shadow">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Color & Gradients
            </span>
            <div className="text-3xl font-black text-[#010030]">{totalFramesCount - pngOverlaysCount}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#f3eeff] border border-[#e2dced] flex items-center justify-center text-[#7226FF]">
            <Palette className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* PHOTOBOOTH CATEGORY SELECTOR TABS */}
      <div className="flex items-center gap-2 bg-[#f4f2f8] p-1.5 rounded-2xl border border-[#e2dced] text-xs">
        {[
          { id: "all", label: "All Catalog Presets", icon: Layers, count: totalFramesCount },
          { id: "bg-color", label: "🎨 Frame Background Color", icon: Palette, count: bgColorsCount },
          { id: "overlay-theme", label: "🖼️ Designer Overlay Themes", icon: ImageIcon, count: pngOverlaysCount }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeCategoryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategoryTab(tab.id)}
              className={`admin-btn flex-1 py-2.5 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-xs ${
                isActive 
                  ? "bg-[#7226FF] text-white shadow-xs" 
                  : "text-[#4a4365] hover:text-[#010030] hover:bg-white/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isActive ? "bg-white/20 text-white" : "bg-[#e2dced] text-[#4a4365]"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTROL TOOLBAR: SEARCH, SEGMENTED FILTERS & ADD CTA */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs space-y-3">
        
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          
          {/* Search Bar with Reset */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7226FF]" />
            <input 
              type="text"
              placeholder="Search frame catalog by name or layout..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#010030] placeholder-[#625b82]/60 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="admin-btn absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#010030]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Row & Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Layout Filter Pills */}
            <div className="flex items-center gap-1 bg-[#f4f2f8] p-1 rounded-xl border border-[#e2dced] text-xs max-w-full overflow-x-auto">
              <span className="text-[11px] font-bold text-[#625b82] uppercase px-1.5 shrink-0">Layout:</span>
              {[
                { id: "all", label: "All" },
                { id: "3-grid", label: "3-Grid" },
                { id: "4-grid", label: "4-Grid" },
                { id: "2x2", label: "2x2" },
                { id: "2x3", label: "2x3" }
              ].map((item) => {
                const count = item.id === "all" 
                  ? frames.length 
                  : frames.filter(f => f.layout === item.id || f.layout === "all").length;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLayoutFilter(item.id)}
                    className={`admin-btn px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      selectedLayoutFilter === item.id 
                        ? "bg-[#7226FF] text-white font-semibold shadow-2xs" 
                        : "text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedLayoutFilter === item.id 
                        ? "bg-white/25 text-white" 
                        : "bg-[#e2dced] text-[#4a4365]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 bg-[#f4f2f8] p-1 rounded-xl border border-[#e2dced] text-xs max-w-full overflow-x-auto">
              <span className="text-[11px] font-bold text-[#625b82] uppercase px-1.5 shrink-0">Style:</span>
              {[
                { id: "all", label: "All" },
                { id: "color", label: "Color" },
                { id: "gradient", label: "Gradient" },
                { id: "png", label: "PNG" }
              ].map((item) => {
                const count = item.id === "all" 
                  ? frames.length 
                  : frames.filter(f => f.type === item.id).length;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTypeFilter(item.id)}
                    className={`admin-btn px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      selectedTypeFilter === item.id 
                        ? "bg-[#7226FF] text-white font-semibold shadow-2xs" 
                        : "text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedTypeFilter === item.id 
                        ? "bg-white/25 text-white" 
                        : "bg-[#e2dced] text-[#4a4365]"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Create Button */}
            <button
              onClick={openCreateModal}
              className="admin-btn bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(114,38,255,0.35)] flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto sm:ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Frame Preset</span>
            </button>

          </div>

        </div>

        {/* Results Metadata Summary */}
        <div className="flex items-center justify-between text-xs text-[#625b82] pt-1 px-1 border-t border-[#f0ebf7]">
          <span>
            Showing <strong className="text-[#010030]">{filteredFrames.length}</strong> of <strong className="text-[#010030]">{frames.length}</strong> total frame presets
          </span>
          {(searchQuery || selectedLayoutFilter !== "all" || selectedTypeFilter !== "all" || selectedStatusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLayoutFilter("all");
                setSelectedTypeFilter("all");
                setSelectedStatusFilter("all");
              }}
              className="admin-btn text-[#7226FF] font-medium hover:underline text-[11px]"
            >
              Reset all filters
            </button>
          )}
        </div>

      </div>

      {/* BENTO GRID: FRAME INVENTORY CARDS */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Frame Catalog...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : filteredFrames.length === 0 ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs">
          No frame presets found matching search and filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {filteredFrames.map((frame) => {
            // Frame background preview style
            let previewStyle = {};
            if (frame.type === "gradient" && frame.bgGradient) {
              previewStyle = { background: frame.bgGradient };
            } else if (frame.bgColor) {
              previewStyle = { backgroundColor: frame.bgColor };
            } else {
              previewStyle = { backgroundColor: "#ffffff" };
            }

            return (
              <div 
                key={frame.id}
                className={`bg-white border rounded-3xl p-5 shadow-[0_10px_30px_rgba(114,38,255,0.05)] flex flex-col justify-between transition-all hover:border-[#7226FF] hover:shadow-[0_15px_35px_rgba(114,38,255,0.12)] relative overflow-hidden ${
                  frame.active ? "border-[#e2dced]" : "border-slate-200 opacity-70"
                }`}
              >
                {/* Top Info Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h4 className="font-bold text-base text-[#010030] leading-tight">
                      {frame.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="bg-[#f3eeff] text-[#7226FF] px-2.5 py-0.5 rounded-md border border-[#e2dced] font-mono font-semibold text-[11px] uppercase">
                        {frame.layout}
                      </span>
                      <span className="bg-[#f4f2f8] text-[#4a4365] px-2.5 py-0.5 rounded-md border border-[#e2dced] font-mono font-medium text-[11px] uppercase">
                        {frame.type}
                      </span>
                    </div>
                  </div>

                  {/* Active Toggle Status Pill */}
                  <button
                    onClick={() => handleToggleActive(frame)}
                    title={frame.active ? "Click to disable" : "Click to enable"}
                    className={`admin-btn px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                      frame.active 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                        : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {frame.active ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{frame.active ? "ACTIVE" : "HIDDEN"}</span>
                  </button>
                </div>

                {/* Frame Visual Preview Canvas Swatch */}
                <div 
                  className="w-full h-44 rounded-2xl border border-[#e2dced] p-3 mb-4 relative flex items-center justify-center overflow-hidden bg-[#f8f7fc] shadow-inner"
                  style={previewStyle}
                >
                  {/* If PNG overlay exists: display clean, un-distorted theme image preserving natural aspect ratio */}
                  {frame.type === "png" || Boolean(frame.imageSrc) ? (
                    <img 
                      src={frame.imageSrc} 
                      alt={frame.name} 
                      className="h-38 w-auto max-w-full object-contain rounded-lg drop-shadow-md transition-transform duration-200 hover:scale-[1.02]"
                    />
                  ) : (
                    /* High-Fidelity Photostrip Preview Layouts for Solid/Gradient Color Frames */
                    <div className="relative z-10 transition-all flex items-center justify-center max-h-full max-w-full p-2">
                      {/* Layout Variant Rendering */}
                      {(frame.layout === "3-grid" || frame.layout === "all") && (
                        <div className="flex flex-col gap-1 w-16 h-36 items-center justify-center bg-[#010030]/10 p-1.5 rounded-lg backdrop-blur-2xs border border-white/20 shadow-xs">
                          {[1, 2, 3].map((slotNum) => (
                            <div 
                              key={slotNum}
                              className="w-13 h-9 bg-gradient-to-r from-[#7226FF]/30 to-[#F042FF]/30 border border-white/40 rounded flex items-center justify-center shadow-2xs relative overflow-hidden"
                            >
                              <span className="text-[8px] text-white font-mono font-bold drop-shadow-xs">P{slotNum}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {frame.layout === "4-grid" && (
                        <div className="flex flex-col gap-1 w-16 h-36 items-center justify-center bg-[#010030]/10 p-1.5 rounded-lg backdrop-blur-2xs border border-white/20 shadow-xs">
                          {[1, 2, 3, 4].map((slotNum) => (
                            <div 
                              key={slotNum}
                              className="w-13 h-7 bg-gradient-to-r from-[#7226FF]/30 to-[#F042FF]/30 border border-white/40 rounded flex items-center justify-center shadow-2xs relative overflow-hidden"
                            >
                              <span className="text-[8px] text-white font-mono font-bold drop-shadow-xs">SHOT {slotNum}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {frame.layout === "2x2" && (
                        <div className="grid grid-cols-2 gap-1.5 w-28 h-28 items-center justify-center bg-[#010030]/10 p-1.5 rounded-lg backdrop-blur-2xs border border-white/20 shadow-xs">
                          {[1, 2, 3, 4].map((slotNum) => (
                            <div 
                              key={slotNum}
                              className="w-11 h-11 bg-gradient-to-br from-[#7226FF]/30 to-[#F042FF]/30 border border-white/40 rounded flex items-center justify-center shadow-2xs relative overflow-hidden"
                            >
                              <span className="text-[9px] text-white font-mono font-bold drop-shadow-xs">P{slotNum}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {frame.layout === "2x3" && (
                        <div className="grid grid-cols-2 gap-1 w-28 h-32 items-center justify-center bg-[#010030]/10 p-1.5 rounded-lg backdrop-blur-2xs border border-white/20 shadow-xs">
                          {[1, 2, 3, 4, 5, 6].map((slotNum) => (
                            <div 
                              key={slotNum}
                              className="w-11 h-8 bg-gradient-to-br from-[#7226FF]/30 to-[#F042FF]/30 border border-white/40 rounded flex items-center justify-center shadow-2xs relative overflow-hidden"
                            >
                              <span className="text-[8px] text-white font-mono font-bold drop-shadow-xs">#{slotNum}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Specs Metadata Grid */}
                <div className="grid grid-cols-2 gap-1.5 bg-[#f8f7fc] border border-[#e2dced] p-2.5 rounded-2xl text-xs text-[#4a4365] mb-4">
                  <div className="text-center border-r border-[#e2dced] pr-1">
                    <span className="block text-[9px] font-bold text-[#7226FF] uppercase">Style Category</span>
                    <span className="text-[#010030] font-bold text-[11px] uppercase">
                      {frame.type === "png" || frame.imageSrc ? "Overlay Theme" : "Background Color"}
                    </span>
                  </div>
                  <div className="text-center pl-1">
                    <span className="block text-[9px] font-bold text-[#7226FF] uppercase">Target Format</span>
                    <span className="text-[#010030] font-bold text-[11px] uppercase">{frame.layout}</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex items-center justify-between gap-2 border-t border-[#f0ebf7] pt-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(frame)}
                      className="admin-btn p-2 bg-[#f4f2f8] hover:bg-[#eae6f3] text-[#010030] rounded-xl transition-colors cursor-pointer border border-[#e2dced]"
                      title="Edit Frame"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#7226FF]" />
                    </button>
                    <button
                      onClick={() => handleDuplicateFrame(frame)}
                      className="admin-btn p-2 bg-[#f4f2f8] hover:bg-[#eae6f3] text-[#010030] rounded-xl transition-colors cursor-pointer border border-[#e2dced]"
                      title="Duplicate Frame"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#7226FF]" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteFrame(frame.id)}
                    className="admin-btn p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                    title="Delete Frame"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT FRAME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] bg-[#010030]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#e2dced] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8 text-[#010030]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#f8f7fc] border-b border-[#e2dced] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-[#7226FF]" />
                <h3 className="font-sans font-black text-base text-[#010030] uppercase tracking-wider">
                  {editingFrame ? "Edit Frame Layout" : "Create New Frame Layout"}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn text-[#4a4365] hover:text-[#010030] transition-colors cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveFrame} className="p-6 space-y-5">
              
              {/* Name & Layout Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider mb-1.5">
                    Frame Preset Name *
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Clean Pastel Studio"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3.5 py-2 text-xs text-[#010030] placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider mb-1.5">
                    Target Format Layout
                  </label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3.5 py-2 text-xs text-[#010030] focus:outline-none"
                  >
                    <option value="all">All Grid Formats</option>
                    <option value="3-grid">3-Grid Vertical</option>
                    <option value="4-grid">4-Grid Classic Strip</option>
                    <option value="2x2">2x2 Square Grid</option>
                    <option value="2x3">2x3 Postcard Layout</option>
                  </select>
                </div>
              </div>

              {/* Type Selection Tabs */}
              <div>
                <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider mb-1.5">
                  Frame Style Type
                </label>
                <div className="grid grid-cols-3 gap-2 bg-[#f4f2f8] p-1.5 rounded-2xl border border-[#e2dced]">
                  {["color", "gradient", "png"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`admin-btn py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        formData.type === t 
                          ? "bg-[#7226FF] text-white shadow-2xs" 
                          : "text-[#4a4365] hover:text-[#010030]"
                      }`}
                    >
                      {t === "color" ? "Solid Color" : t === "gradient" ? "Gradient" : "PNG Overlay"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Specific Fields */}
              {formData.type === "color" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
                  <div>
                    <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider mb-1.5">
                      Background Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="admin-ui w-9 h-9 rounded-xl bg-transparent border border-[#e2dced] cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={formData.bgColor}
                        onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                        className="admin-ui flex-1 bg-white border border-[#e2dced] rounded-xl px-3 py-1.5 text-xs text-[#010030] font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider mb-1.5">
                      Border Accent Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color"
                        value={formData.borderColor}
                        onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                        className="admin-ui w-9 h-9 rounded-xl bg-transparent border border-[#e2dced] cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={formData.borderColor}
                        onChange={(e) => setFormData({ ...formData, borderColor: e.target.value })}
                        className="admin-ui flex-1 bg-white border border-[#e2dced] rounded-xl px-3 py-1.5 text-xs text-[#010030] font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === "gradient" && (
                <div className="space-y-3 bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
                  <div>
                    <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider mb-1.5">
                      CSS Gradient String
                    </label>
                    <input 
                      type="text"
                      value={formData.bgGradient}
                      onChange={(e) => setFormData({ ...formData, bgGradient: e.target.value })}
                      placeholder="linear-gradient(135deg, #7226FF 0%, #F042FF 100%)"
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-xs text-[#010030] font-mono"
                    />
                  </div>
                </div>
              )}

              {formData.type === "png" && (
                <div className="bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced] space-y-3">
                  <label className="block text-xs font-semibold text-[#4a4365] uppercase tracking-wider">
                    Upload PNG Frame Overlay (Transparent Cutout)
                  </label>
                  <div className="flex items-center justify-center border-2 border-dashed border-[#e2dced] hover:border-[#7226FF] rounded-2xl p-4 transition-colors cursor-pointer bg-white relative">
                    <input 
                      type="file" 
                      accept="image/png"
                      onChange={handleFileChange}
                      className="admin-ui absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="text-center text-xs text-[#4a4365] flex flex-col items-center gap-1.5">
                      <Upload className="w-5 h-5 text-[#7226FF]" />
                      <span>{imageFile ? imageFile.name : "Click or drag high-res PNG frame file here"}</span>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-2 text-center">
                      <img src={imagePreview} alt="Preview" className="h-24 mx-auto object-contain rounded-xl border border-[#e2dced]" />
                    </div>
                  )}
                </div>
              )}

              {/* Destination Indicator Notice */}
              <div className="bg-[#f3eeff] border border-[#e2dced] rounded-2xl p-3 text-xs text-[#7226FF] flex items-center justify-between font-mono">
                <span>Photobooth Placement:</span>
                <span className="font-bold uppercase">
                  {formData.type === "png" ? "📷 Designer Overlay Themes Section" : "🎨 Frame Background Color Section"}
                </span>
              </div>

              {/* Modal Footer Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[#e2dced]">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#010030]">
                  <input 
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="admin-ui w-4 h-4 accent-[#7226FF] rounded"
                  />
                  <span>Publish as Active Preset</span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="admin-btn px-4 py-2 rounded-xl border border-[#e2dced] text-[#4a4365] hover:text-[#010030] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>{editingFrame ? "Update Preset" : "Save Preset"}</span>
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default FramesManager;
