import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  ImageIcon, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  RefreshCw, 
  Smile, 
  Tag, 
  Layers,
  CheckCircle2,
  FolderPlus,
  Star,
  Sliders,
  Maximize2,
  RotateCw,
  Move,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  Zap,
  Grid,
  Filter,
  Check,
  Package,
  Layers3,
  Copy,
  FolderCheck,
  ChevronRight,
  HelpCircle
} from "lucide-react";

const BUILTIN_PACKS = [
  { id: "all", name: "All Collections" },
  { id: "y2k-neon", name: "Y2K Neon Glow" },
  { id: "kpop-birthday", name: "K-Pop Idol Birthday" },
  { id: "retro-doodles", name: "Retro Journal Doodles" },
  { id: "korean-stamps", name: "Korean Character Stamps" },
  { id: "uncategorized", name: "General Collection" }
];

const EXTENDED_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "sticker", label: "Sticker (PNG)" },
  { id: "doodle", label: "Hand-Drawn Doodle" },
  { id: "stamp", label: "Event Stamp" },
  { id: "watermark", label: "Date Watermark" },
  { id: "frame", label: "Mini Accent Frame" }
];

const BLEND_MODES = [
  { id: "normal", label: "Normal (Opaque)" },
  { id: "multiply", label: "Multiply (Darken)" },
  { id: "screen", label: "Screen (Glow)" },
  { id: "overlay", label: "Overlay (Vibrant)" },
  { id: "hard-light", label: "Hard Light (High Contrast)" }
];

const StickersManager = () => {
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPack, setSelectedPack] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Selection & Bulk Actions (Phase 3B)
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkPackTarget, setBulkPackTarget] = useState({ packId: "y2k-neon", packName: "Y2K Neon Glow", type: "sticker" });

  // Single Item Modal (Phase 3A)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Batch Upload Modal (Phase 3B)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchFiles, setBatchFiles] = useState([]);
  const [batchPreviews, setBatchPreviews] = useState([]);
  const [batchConfig, setBatchConfig] = useState({
    packId: "y2k-neon",
    packName: "Y2K Neon Glow",
    type: "sticker",
    blendMode: "normal"
  });

  // Test Canvas Bench Modal (Phase 3C)
  const [isBenchOpen, setIsBenchOpen] = useState(false);
  const [benchCanvasStickers, setBenchCanvasStickers] = useState([]);
  const [activeCanvasStickerId, setActiveCanvasStickerId] = useState(null);
  const [benchBgColor, setBenchBgColor] = useState("#010030");
  const [benchLayoutFormat, setBenchLayoutFormat] = useState("strip-3"); // 'strip-3', 'strip-4', 'grid-2x2'

  // Single Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "sticker",
    packId: "y2k-neon",
    packName: "Y2K Neon Glow",
    defaultWidth: 100,
    defaultHeight: 100,
    defaultRotation: 0,
    blendMode: "normal",
    isFeaturedPack: false,
    file: null,
    previewSrc: ""
  });

  const fetchStudioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/studio/data");
      if (res.data && res.data.stickers) {
        setStickers(res.data.stickers);
      }
    } catch (err) {
      console.error("Error fetching digital stamps:", err);
      setError("Failed to load digital stamps catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, []);

  // --- SINGLE MODAL HANDLERS (Phase 3A) ---
  const openCreateModal = () => {
    setEditingSticker(null);
    setFormData({
      name: "",
      type: "sticker",
      packId: "y2k-neon",
      packName: "Y2K Neon Glow",
      defaultWidth: 100,
      defaultHeight: 100,
      defaultRotation: 0,
      blendMode: "normal",
      isFeaturedPack: false,
      file: null,
      previewSrc: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sticker) => {
    setEditingSticker(sticker);
    setFormData({
      name: sticker.name || "",
      type: sticker.type || "sticker",
      packId: sticker.packId || "y2k-neon",
      packName: sticker.packName || "Y2K Neon Glow",
      defaultWidth: sticker.defaultWidth || 100,
      defaultHeight: sticker.defaultHeight || 100,
      defaultRotation: sticker.defaultRotation || 0,
      blendMode: sticker.blendMode || "normal",
      isFeaturedPack: Boolean(sticker.isFeaturedPack),
      file: null,
      previewSrc: sticker.imageSrc || ""
    });
    setIsModalOpen(true);
  };

  const handleSingleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      file,
      previewSrc: URL.createObjectURL(file)
    }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("type", formData.type);
      data.append("packId", formData.packId);
      data.append("packName", formData.packName);
      data.append("defaultWidth", formData.defaultWidth);
      data.append("defaultHeight", formData.defaultHeight);
      data.append("defaultRotation", formData.defaultRotation);
      data.append("blendMode", formData.blendMode);
      data.append("isFeaturedPack", formData.isFeaturedPack);

      if (formData.file) {
        data.append("image", formData.file);
      }

      if (editingSticker) {
        await axios.put(`/api/creator/sticker/${editingSticker.id}`, data);
      } else {
        await axios.post("/api/creator/sticker", data);
      }

      setIsModalOpen(false);
      fetchStudioData();
    } catch (err) {
      console.error("Error saving digital stamp:", err);
      alert(err.response?.data?.message || "Error saving digital stamp.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this digital stamp asset?")) return;
    try {
      await axios.delete(`/api/creator/sticker/${id}`);
      setSelectedIds(prev => prev.filter(item => item !== id));
      fetchStudioData();
    } catch (err) {
      console.error("Error deleting stamp:", err);
      alert("Failed to delete digital stamp asset.");
    }
  };

  // --- BATCH UPLOAD HANDLERS (Phase 3B) ---
  const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setBatchFiles(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setBatchPreviews(previews);
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (batchFiles.length === 0) {
      alert("Please select at least one image file.");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append("packId", batchConfig.packId);
      data.append("packName", batchConfig.packName);
      data.append("type", batchConfig.type);
      data.append("blendMode", batchConfig.blendMode);

      batchFiles.forEach(file => {
        data.append("images", file);
      });

      await axios.post("/api/creator/sticker/batch", data);

      setIsBatchModalOpen(false);
      setBatchFiles([]);
      setBatchPreviews([]);
      fetchStudioData();
    } catch (err) {
      console.error("Error batch uploading stamps:", err);
      alert("Failed to batch upload digital stamps.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- BULK SELECTION HANDLERS (Phase 3B) ---
  const toggleSelectSticker = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStickers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStickers.map(s => s.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected stickers?`)) return;

    try {
      await axios.post("/api/creator/sticker/bulk-delete", { ids: selectedIds });
      setSelectedIds([]);
      fetchStudioData();
    } catch (err) {
      console.error("Error bulk deleting stickers:", err);
      alert("Failed to perform bulk deletion.");
    }
  };

  const handleBulkMoveSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;

    try {
      await axios.patch("/api/creator/sticker/bulk-update-pack", {
        ids: selectedIds,
        packId: bulkPackTarget.packId,
        packName: bulkPackTarget.packName,
        type: bulkPackTarget.type
      });
      setIsBulkMoveModalOpen(false);
      setSelectedIds([]);
      fetchStudioData();
    } catch (err) {
      console.error("Error bulk re-assigning pack:", err);
      alert("Failed to update sticker pack.");
    }
  };

  // --- CANVAS BENCH TESTERS (Phase 3C) ---
  const addStickerToBenchCanvas = (sticker) => {
    const newCanvasItem = {
      instanceId: `bench-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      id: sticker.id,
      name: sticker.name,
      imageSrc: sticker.imageSrc,
      x: 120 + Math.floor(Math.random() * 60 - 30),
      y: 160 + Math.floor(Math.random() * 60 - 30),
      scale: 1,
      rotation: sticker.defaultRotation || 0,
      blendMode: sticker.blendMode || "normal"
    };

    setBenchCanvasStickers(prev => [...prev, newCanvasItem]);
    setActiveCanvasStickerId(newCanvasItem.instanceId);
  };

  const updateActiveCanvasSticker = (key, value) => {
    if (!activeCanvasStickerId) return;
    setBenchCanvasStickers(prev => 
      prev.map(item => item.instanceId === activeCanvasStickerId ? { ...item, [key]: value } : item)
    );
  };

  const removeActiveCanvasSticker = () => {
    if (!activeCanvasStickerId) return;
    setBenchCanvasStickers(prev => prev.filter(item => item.instanceId !== activeCanvasStickerId));
    setActiveCanvasStickerId(null);
  };

  // Filter Logic
  const filteredStickers = stickers.filter(sticker => {
    const matchesSearch = sticker.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPack = selectedPack === "all" || sticker.packId === selectedPack;
    const matchesCategory = selectedCategory === "all" || sticker.type === selectedCategory;
    return matchesSearch && matchesPack && matchesCategory;
  });

  // Unique Packs derived from data + builtin
  const availablePacksMap = {};
  stickers.forEach(s => {
    if (s.packId) {
      availablePacksMap[s.packId] = s.packName || s.packId;
    }
  });

  const allPackOptions = BUILTIN_PACKS.map(p => ({
    id: p.id,
    name: p.name,
    count: p.id === "all" ? stickers.length : stickers.filter(s => s.packId === p.id).length
  }));

  const activePackCount = Object.keys(availablePacksMap).length;
  const featuredPackCount = stickers.filter(s => s.isFeaturedPack).length;
  const doodlesAndStampsCount = stickers.filter(s => s.type === "doodle" || s.type === "stamp" || s.type === "watermark").length;

  return (
    <div className="space-y-6">
      
      {/* STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Total Catalog Assets
            </span>
            <div className="text-3xl font-black text-[#010030]">{stickers.length}</div>
            <span className="text-[10px] text-[#625b82] font-medium">Stickers, Doodles & Stamps</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ecf8] text-[#7226FF] flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Active Collection Packs
            </span>
            <div className="text-3xl font-black text-[#7226FF]">{activePackCount || 4}</div>
            <span className="text-[10px] text-[#7226FF] font-medium">Themed Event Collections</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Doodles & Watermarks
            </span>
            <div className="text-3xl font-black text-emerald-600">{doodlesAndStampsCount}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Special Canvas Layers</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Featured Packs
            </span>
            <div className="text-3xl font-black text-amber-600">{featuredPackCount || 2}</div>
            <span className="text-[10px] text-amber-700 font-medium">Top Studio Collections</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* CONTROL TOOLBAR & PACK FILTERS */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs space-y-3">
        
        {/* Top Search & Action CTAs */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7226FF]" />
            <input 
              type="text"
              placeholder="Search assets by name or collection..."
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

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Phase 3C: Test Canvas Bench Launcher */}
            <button
              onClick={() => setIsBenchOpen(true)}
              className="admin-btn bg-[#010030] hover:bg-[#1a1860] text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#F042FF]" />
              <span>Canvas Test Bench</span>
            </button>

            {/* Phase 3B: Batch Multi-Upload CTA */}
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="admin-btn bg-purple-50 hover:bg-purple-100 text-[#7226FF] border border-[#7226FF]/30 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <FolderPlus className="w-3.5 h-3.5 text-[#7226FF]" />
              <span>Batch Multi-Upload</span>
            </button>

            {/* Single Add Asset CTA */}
            <button
              onClick={openCreateModal}
              className="admin-btn bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(114,38,255,0.35)] flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add Single Asset</span>
            </button>
          </div>

        </div>

        {/* Collection Pack Pills & Category Filter Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2 border-t border-[#f0ebf7]">
          
          {/* Pack Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-[11px] font-bold text-[#625b82] uppercase mr-1">Pack:</span>
            {allPackOptions.map(pack => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  selectedPack === pack.id 
                    ? "bg-[#7226FF] text-white font-semibold shadow-2xs" 
                    : "bg-[#f4f2f8] text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                }`}
              >
                {pack.name} ({pack.count})
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-[11px] font-bold text-[#625b82] uppercase">Type:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-ui bg-[#f4f2f8] text-[#010030] border border-[#e2dced] text-xs font-semibold px-2.5 py-1 rounded-xl cursor-pointer focus:outline-none"
            >
              {EXTENDED_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* PHASE 3B: BULK SELECTION ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#010030] to-[#1e0066] text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-[#F042FF] text-white text-xs font-bold font-mono px-2.5 py-1 rounded-lg">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs font-medium text-slate-200">
              Bulk actions ready for selected digital stamps.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBulkPackTarget({ packId: "y2k-neon", packName: "Y2K Neon Glow", type: "sticker" });
                setIsBulkMoveModalOpen(true);
              }}
              className="admin-btn bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Bulk Move Pack</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="admin-btn bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="admin-btn p-1.5 text-slate-300 hover:text-white"
              title="Clear Selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STICKERS CATALOG GRID */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Digital Stamps Catalog...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : filteredStickers.length === 0 ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs">
          No digital stamps found matching current collection pack or search filters.
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* Select All Toggle Bar */}
          <div className="flex items-center justify-between text-xs text-[#625b82] px-1">
            <button
              onClick={toggleSelectAll}
              className="admin-btn flex items-center gap-1.5 font-bold text-[#7226FF] hover:underline cursor-pointer"
            >
              {selectedIds.length === filteredStickers.length ? (
                <CheckSquare className="w-4 h-4 text-[#7226FF]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All Shown ({filteredStickers.length})</span>
            </button>
            <span>Showing {filteredStickers.length} assets</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-4">
            {filteredStickers.map((sticker) => {
              const isSelected = selectedIds.includes(sticker.id);

              return (
                <div 
                  key={sticker.id}
                  className={`bg-white border rounded-2xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer ${
                    isSelected ? "border-[#7226FF] ring-2 ring-[#7226FF]/20 bg-purple-50/20" : "border-[#e2dced]"
                  }`}
                  onClick={() => toggleSelectSticker(sticker.id)}
                >
                  {/* Selection Checkbox */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectSticker(sticker.id);
                    }}
                    className="absolute top-2.5 left-2.5 z-10 p-0.5 bg-white rounded-lg shadow-2xs text-[#7226FF]"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#7226FF]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>

                  {/* Stamp Preview Box */}
                  <div className="w-full h-28 rounded-xl bg-[#010030]/5 border border-[#e2dced] p-3 flex items-center justify-center mb-2.5 relative overflow-hidden bg-[radial-gradient(#e2dced_1px,transparent_1px)] [background-size:12px_12px]">
                    <img 
                      src={sticker.imageSrc} 
                      alt={sticker.name}
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform"
                      style={{ mixBlendMode: sticker.blendMode || "normal" }}
                    />

                    {/* Blend mode pill badge if special */}
                    {sticker.blendMode && sticker.blendMode !== "normal" && (
                      <span className="absolute bottom-1 right-1 text-[8px] font-mono bg-[#010030]/80 text-white px-1 rounded uppercase">
                        {sticker.blendMode}
                      </span>
                    )}
                  </div>

                  {/* Stamp Info */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <h5 className="font-bold text-xs text-[#010030] truncate mb-1" title={sticker.name}>
                      {sticker.name}
                    </h5>

                    <div className="text-[10px] text-[#625b82] space-y-1 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#f0ecf8] text-[#7226FF] px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                          {sticker.type || "sticker"}
                        </span>
                        <span className="font-mono text-[9px] text-[#010030]/60">
                          {sticker.defaultWidth || 100}px
                        </span>
                      </div>
                      
                      <p className="text-[9px] text-slate-500 truncate" title={sticker.packName || "General"}>
                        📦 {sticker.packName || "General Collection"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#f0ebf7] pt-1.5">
                      {/* Test in Canvas Bench button */}
                      <button
                        onClick={() => {
                          addStickerToBenchCanvas(sticker);
                          setIsBenchOpen(true);
                        }}
                        className="admin-btn text-[10px] font-bold text-[#7226FF] hover:underline flex items-center gap-0.5"
                        title="Test on Canvas Bench"
                      >
                        <Zap className="w-3 h-3 text-[#F042FF]" />
                        <span>Test</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(sticker)}
                          className="admin-btn p-1 hover:bg-[#f0ecf8] text-[#7226FF] rounded transition-colors"
                          title="Edit Stamp"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(sticker.id)}
                          className="admin-btn p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                          title="Delete Stamp"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* PHASE 3A: CREATE / EDIT SINGLE STAMP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-lg text-[#010030] flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#7226FF]" />
                <span>{editingSticker ? "Edit Digital Stamp Asset" : "Add Digital Stamp Asset"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-[#010030] mb-1">Asset Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Neon Heart Halo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Collection Pack</label>
                  <select
                    value={formData.packId}
                    onChange={(e) => {
                      const selectedPackObj = BUILTIN_PACKS.find(p => p.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        packId: e.target.value,
                        packName: selectedPackObj ? selectedPackObj.name : "General Collection" 
                      });
                    }}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {BUILTIN_PACKS.filter(p => p.id !== "all").map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Asset Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {EXTENDED_CATEGORIES.filter(c => c.id !== "all").map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interaction Specs & Canvas Controls */}
              <div className="bg-[#f8f7fc] border border-[#e2dced] p-3 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-[#7226FF] uppercase tracking-wider block">
                  Canvas Interaction Specs
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Default Width</label>
                    <input 
                      type="number"
                      value={formData.defaultWidth}
                      onChange={(e) => setFormData({ ...formData, defaultWidth: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2.5 py-1.5 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Default Rotation</label>
                    <input 
                      type="number"
                      value={formData.defaultRotation}
                      onChange={(e) => setFormData({ ...formData, defaultRotation: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2.5 py-1.5 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Blend Mode</label>
                    <select
                      value={formData.blendMode}
                      onChange={(e) => setFormData({ ...formData, blendMode: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2 py-1.5 text-[#010030]"
                    >
                      {BLEND_MODES.map(bm => (
                        <option key={bm.id} value={bm.id}>{bm.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Image Upload Box */}
              <div>
                <label className="block font-bold text-[#010030] mb-1">Upload Transparent Asset (PNG/SVG)</label>
                <label className="cursor-pointer block">
                  <div className="w-full h-32 border-2 border-dashed border-[#e2dced] hover:border-[#7226FF] rounded-2xl flex flex-col items-center justify-center bg-[#f8f7fc] relative overflow-hidden p-2">
                    {formData.previewSrc ? (
                      <img src={formData.previewSrc} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#7226FF] mb-1" />
                        <span className="text-xs font-bold text-[#010030]">Choose file to upload</span>
                        <span className="text-[10px] text-[#625b82]">PNG or SVG with transparent background</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleSingleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ebf7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="admin-btn px-4 py-2 rounded-xl text-[#625b82] hover:bg-[#f0ecf8] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold px-5 py-2 rounded-xl shadow-xs"
                >
                  {submitting ? "Saving..." : (editingSticker ? "Save Asset" : "Publish Asset")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 3B: BATCH MULTI-UPLOAD MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-lg text-[#010030] flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#7226FF]" />
                <span>Batch Multi-File Asset Importer</span>
              </h3>
              <button 
                onClick={() => setIsBatchModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Target Collection Pack</label>
                  <select
                    value={batchConfig.packId}
                    onChange={(e) => {
                      const selectedPackObj = BUILTIN_PACKS.find(p => p.id === e.target.value);
                      setBatchConfig({ 
                        ...batchConfig, 
                        packId: e.target.value,
                        packName: selectedPackObj ? selectedPackObj.name : "General Collection" 
                      });
                    }}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {BUILTIN_PACKS.filter(p => p.id !== "all").map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Category</label>
                  <select
                    value={batchConfig.type}
                    onChange={(e) => setBatchConfig({ ...batchConfig, type: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {EXTENDED_CATEGORIES.filter(c => c.id !== "all").map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-file Upload Dropzone */}
              <div>
                <label className="block font-bold text-[#010030] mb-1">
                  Select Multiple Files (Up to 20 PNG/SVG files)
                </label>
                <label className="cursor-pointer block">
                  <div className="w-full h-32 border-2 border-dashed border-[#7226FF]/50 hover:border-[#7226FF] rounded-2xl flex flex-col items-center justify-center bg-purple-50/30 p-3 text-center">
                    <Upload className="w-6 h-6 text-[#7226FF] mb-1" />
                    <span className="text-xs font-bold text-[#010030]">Drop files here or click to browse</span>
                    <span className="text-[10px] text-[#625b82]">PNG or SVG with transparent background</span>
                  </div>
                  <input 
                    type="file" 
                    multiple
                    accept="image/*"
                    onChange={handleBatchFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Batch Previews */}
              {batchPreviews.length > 0 && (
                <div className="bg-[#f8f7fc] border border-[#e2dced] p-3 rounded-2xl space-y-2">
                  <span className="text-[10px] font-bold text-[#7226FF] uppercase">
                    Files to Import ({batchPreviews.length} Assets Selected)
                  </span>
                  <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1">
                    {batchPreviews.map((src, idx) => (
                      <div key={idx} className="w-full h-16 bg-white border border-[#e2dced] rounded-xl p-1 flex items-center justify-center">
                        <img src={src} alt={`Batch ${idx}`} className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ebf7]">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="admin-btn px-4 py-2 rounded-xl text-[#625b82] hover:bg-[#f0ecf8] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || batchFiles.length === 0}
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold px-5 py-2 rounded-xl shadow-xs"
                >
                  {submitting ? "Importing..." : `Import ${batchFiles.length} Assets`}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* PHASE 3B: BULK MOVE PACK MODAL */}
      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <FolderCheck className="w-5 h-5 text-[#7226FF]" />
                <span>Bulk Move Collection Pack</span>
              </h3>
              <button 
                onClick={() => setIsBulkMoveModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBulkMoveSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Move <strong className="text-[#7226FF]">{selectedIds.length} selected stickers</strong> into a target collection pack and category:
              </p>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Target Collection Pack</label>
                <select
                  value={bulkPackTarget.packId}
                  onChange={(e) => {
                    const packObj = BUILTIN_PACKS.find(p => p.id === e.target.value);
                    setBulkPackTarget({
                      ...bulkPackTarget,
                      packId: e.target.value,
                      packName: packObj ? packObj.name : "General Collection"
                    });
                  }}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                >
                  {BUILTIN_PACKS.filter(p => p.id !== "all").map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Target Asset Category</label>
                <select
                  value={bulkPackTarget.type}
                  onChange={(e) => setBulkPackTarget({ ...bulkPackTarget, type: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                >
                  {EXTENDED_CATEGORIES.filter(c => c.id !== "all").map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0ebf7]">
                <button
                  type="button"
                  onClick={() => setIsBulkMoveModalOpen(false)}
                  className="admin-btn px-4 py-2 rounded-xl text-[#625b82] hover:bg-[#f0ecf8] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold px-5 py-2 rounded-xl shadow-xs"
                >
                  Update {selectedIds.length} Stickers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 3C: INTERACTIVE CANVAS PLACEMENT TEST BENCH MODAL */}
      {isBenchOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsBenchOpen(false)}
        >
          <div 
            className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center">
                  <Maximize2 className="w-5 h-5 text-[#F042FF]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#010030]">
                    Photostrip Canvas Test Bench
                  </h4>
                  <span className="text-xs text-[#625b82]">
                    Drag, scale, rotate, and test stamp rendering crispness on live photostrips
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setIsBenchOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Test Bench Main Layout (Side Catalog + Center Canvas + Right Property Controls) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              
              {/* LEFT: Stamp Drawer Selector (Col 3) */}
              <div className="md:col-span-3 bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 flex flex-col space-y-2 max-h-[420px] overflow-y-auto">
                <span className="text-[10px] font-bold text-[#7226FF] uppercase block">
                  Click to Add to Canvas
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {stickers.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => addStickerToBenchCanvas(st)}
                      className="bg-white border border-[#e2dced] hover:border-[#7226FF] rounded-xl p-2 flex flex-col items-center shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="w-full h-12 flex items-center justify-center mb-1">
                        <img src={st.imageSrc} alt={st.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-[9px] font-medium text-[#010030] line-clamp-1 w-full text-center">
                        {st.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* CENTER: Simulated Live Photostrip Canvas (Col 6) */}
              <div className="md:col-span-6 bg-slate-900 rounded-2xl p-4 border-2 border-[#010030] flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
                
                {/* Background Frame Format Selector */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-[10px] z-20">
                  <span className="font-mono bg-black/60 px-2 py-0.5 rounded border border-white/20">
                    CANVAS: {benchLayoutFormat.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/20">
                    <button
                      onClick={() => setBenchBgColor("#010030")}
                      className={`w-4 h-4 rounded-full border border-white ${benchBgColor === "#010030" ? "ring-2 ring-pink-400" : ""}`}
                      style={{ backgroundColor: "#010030" }}
                      title="Indigo Deep"
                    />
                    <button
                      onClick={() => setBenchBgColor("#F042FF")}
                      className={`w-4 h-4 rounded-full border border-white ${benchBgColor === "#F042FF" ? "ring-2 ring-pink-400" : ""}`}
                      style={{ backgroundColor: "#F042FF" }}
                      title="Electric Magenta"
                    />
                    <button
                      onClick={() => setBenchBgColor("#ffffff")}
                      className={`w-4 h-4 rounded-full border border-white ${benchBgColor === "#ffffff" ? "ring-2 ring-pink-400" : ""}`}
                      style={{ backgroundColor: "#ffffff" }}
                      title="Studio White"
                    />
                  </div>
                </div>

                {/* THE PHOTOSTRIP CONTAINER */}
                <div 
                  className="w-48 py-4 px-3 rounded-xl shadow-2xl relative border transition-all"
                  style={{ backgroundColor: benchBgColor }}
                >
                  {/* Simulated Photo Boxes */}
                  <div className="space-y-2">
                    {[1, 2, 3].map((num) => (
                      <div 
                        key={num}
                        className="w-full h-20 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden text-white/30 text-[9px] font-mono"
                      >
                        SAMPLE PHOTO #{num}
                      </div>
                    ))}
                  </div>

                  {/* Date Watermark Sample */}
                  <div className="text-center font-mono text-[8px] text-white/70 mt-2">
                    SNPSHOT STUDIO • 2026.08.11
                  </div>

                  {/* STICKERS LAYERED ON CANVAS */}
                  {benchCanvasStickers.map((item) => {
                    const isSelected = item.instanceId === activeCanvasStickerId;

                    return (
                      <div
                        key={item.instanceId}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCanvasStickerId(item.instanceId);
                        }}
                        className={`absolute cursor-grab active:cursor-grabbing p-1 transition-transform ${
                          isSelected ? "outline-2 outline-dashed outline-[#F042FF] z-30" : "z-10"
                        }`}
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
                          mixBlendMode: item.blendMode || "normal"
                        }}
                      >
                        <img 
                          src={item.imageSrc} 
                          alt={item.name} 
                          className="w-12 h-12 object-contain pointer-events-none drop-shadow-md"
                        />
                      </div>
                    );
                  })}

                </div>

                {/* Reset Bench Canvas CTA */}
                <button
                  onClick={() => {
                    setBenchCanvasStickers([]);
                    setActiveCanvasStickerId(null);
                  }}
                  className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white font-mono text-[10px] px-2.5 py-1 rounded-xl border border-white/20 transition-colors cursor-pointer"
                >
                  Clear Canvas
                </button>

              </div>

              {/* RIGHT: Active Canvas Sticker Controls (Col 3) */}
              <div className="md:col-span-3 bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 flex flex-col justify-between space-y-3">
                
                <div>
                  <span className="text-[10px] font-bold text-[#7226FF] uppercase block mb-2">
                    Active Layer Controls
                  </span>

                  {activeCanvasStickerId ? (() => {
                    const activeItem = benchCanvasStickers.find(i => i.instanceId === activeCanvasStickerId);
                    if (!activeItem) return null;

                    return (
                      <div className="space-y-3">
                        <div className="bg-white border border-[#e2dced] p-2 rounded-xl flex items-center gap-2">
                          <img src={activeItem.imageSrc} className="w-8 h-8 object-contain" />
                          <span className="font-bold text-xs text-[#010030] truncate">{activeItem.name}</span>
                        </div>

                        {/* Scale Slider */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#010030] mb-1">
                            Scale: {activeItem.scale.toFixed(1)}x
                          </label>
                          <input 
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.1"
                            value={activeItem.scale}
                            onChange={(e) => updateActiveCanvasSticker("scale", parseFloat(e.target.value))}
                            className="w-full accent-[#7226FF] cursor-pointer"
                          />
                        </div>

                        {/* Rotation Slider */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#010030] mb-1">
                            Rotation: {activeItem.rotation}°
                          </label>
                          <input 
                            type="range"
                            min="-180"
                            max="180"
                            step="5"
                            value={activeItem.rotation}
                            onChange={(e) => updateActiveCanvasSticker("rotation", parseInt(e.target.value, 10))}
                            className="w-full accent-[#7226FF] cursor-pointer"
                          />
                        </div>

                        {/* Blend Mode */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#010030] mb-1">
                            Canvas Blend Mode
                          </label>
                          <select
                            value={activeItem.blendMode}
                            onChange={(e) => updateActiveCanvasSticker("blendMode", e.target.value)}
                            className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[10px] font-bold text-[#010030]"
                          >
                            {BLEND_MODES.map(bm => (
                              <option key={bm.id} value={bm.id}>{bm.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Remove Active Sticker */}
                        <button
                          onClick={removeActiveCanvasSticker}
                          className="admin-btn w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Layer</span>
                        </button>
                      </div>
                    );
                  })() : (
                    <div className="text-center text-slate-400 py-8 text-[11px] italic">
                      Click a sticker on the photostrip canvas to adjust scale, rotation & blend modes.
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#625b82] bg-white p-2.5 rounded-xl border border-[#e2dced]">
                  💡 <strong>Tip:</strong> You can drag stamps onto different background colors to verify transparency.
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StickersManager;
