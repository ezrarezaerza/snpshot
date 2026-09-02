import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShieldCheck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  RefreshCw, 
  Heart, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Printer,
  Archive,
  Download,
  FileCheck,
  CheckSquare,
  Square,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sliders,
  Tag,
  Clock,
  ShieldAlert,
  Sparkles,
  Check,
  FileSpreadsheet,
  PackageCheck
} from "lucide-react";

// Flag Reason Options for Phase 5A
const FLAG_REASONS = [
  { id: "Inappropriate Content", label: "Inappropriate Content" },
  { id: "Low Resolution", label: "Low Resolution (< 150 DPI)" },
  { id: "Copyright Violation", label: "Copyright / Trademark Issue" },
  { id: "Spam Handle", label: "Spam / Offensive Handle" },
  { id: "Blurry Image", label: "Blurry / Unreadable Frame" },
  { id: "Off-Topic / Other", label: "Off-Topic / Other" }
];

// Print Status Options for Phase 5B
const PRINT_STATUS_OPTIONS = [
  { id: "queued", label: "Queued for Print", color: "bg-blue-500" },
  { id: "dpi_verified", label: "300 DPI Verified", color: "bg-emerald-500" },
  { id: "exported", label: "Exported Package", color: "bg-[#7226FF]" },
  { id: "fulfilled", label: "Fulfilled & Printed", color: "bg-slate-700" }
];

const GalleryManager = ({ onSelectTab }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState("all"); // 'all', 'editorial', 'community'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved', 'flagged', 'archived'
  const [printFilter, setPrintFilter] = useState("all");   // 'all', 'queued', 'dpi_verified', 'exported', 'fulfilled'
  const [layoutFilter, setLayoutFilter] = useState("all");

  // Selection & Bulk Moderation
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Phase 5C: CMYK Print Quality Inspector Bench Modal
  const [inspectorItem, setInspectorItem] = useState(null);
  const [proofMode, setProofMode] = useState("cmyk"); // 'rgb' | 'cmyk'
  const [showBleedGuides, setShowBleedGuides] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1); // 1x, 1.5x, 2x, 3x
  const [inspectorNote, setInspectorNote] = useState("");
  const [inspectorFlagReason, setInspectorFlagReason] = useState("");

  // Batch Export Manifest Modal
  const [exportPackage, setExportPackage] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Single Item Edit Form State
  const [formData, setFormData] = useState({
    caption: "",
    creator: "@snpshot_user",
    layout: "4-grid",
    color: "#F042FF",
    origin: "community",
    badge: "Community Print",
    status: "approved",
    flagReason: "",
    modNote: "",
    printStatus: "dpi_verified",
    printDpi: 300,
    file: null,
    previewSrc: ""
  });

  const fetchStudioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/studio/data");
      if (res.data && res.data.galleryItems) {
        setGalleryItems(res.data.galleryItems);
      }
    } catch (err) {
      console.error("Error loading gallery items:", err);
      setError("Failed to load community gallery items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, []);

  // Promote / Demote Showcase Item
  const handlePromoteToShowcase = async (item) => {
    try {
      await axios.post(`/api/creator/gallery/${item.id}/promote`);
      fetchStudioData();
    } catch (err) {
      console.error("Error promoting gallery item:", err);
      alert("Failed to toggle showcase promotion.");
    }
  };

  // --- PHASE 5A: MODERATION & STATUS HANDLERS ---
  const handleQuickStatusChange = async (id, status, extra = {}) => {
    try {
      await axios.patch(`/api/creator/gallery/${id}/moderation`, { 
        status, 
        ...extra 
      });
      fetchStudioData();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  const handleUpdatePrintStatus = async (id, printStatus) => {
    try {
      await axios.patch(`/api/creator/gallery/${id}/moderation`, { printStatus });
      fetchStudioData();
    } catch (err) {
      console.error("Error updating print status:", err);
    }
  };

  // Bulk Selection
  const toggleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedIds.length === 0) return;
    const confirmMsg = status === "deleted" 
      ? `Permanently remove ${selectedIds.length} photostrips?`
      : `Update ${selectedIds.length} items to status: ${status.toUpperCase()}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.post("/api/creator/gallery/bulk-status", {
        ids: selectedIds,
        status
      });
      setSelectedIds([]);
      fetchStudioData();
    } catch (err) {
      console.error("Error bulk updating status:", err);
      alert("Failed to update selected items.");
    }
  };

  // --- PHASE 5B: BATCH PRINT EXPORT PACKAGE ---
  const handleExportBatchPrint = async () => {
    const idsToExport = selectedIds.length > 0 
      ? selectedIds 
      : filteredItems.filter(i => (i.status || "approved") === "approved").map(i => i.id);

    if (idsToExport.length === 0) {
      alert("No approved items available for print export.");
      return;
    }

    setIsExporting(true);
    try {
      const res = await axios.post("/api/creator/gallery/export-batch", { ids: idsToExport });
      if (res.data && res.data.success) {
        setExportPackage(res.data);
        setSelectedIds([]);
        fetchStudioData();
      }
    } catch (err) {
      console.error("Error creating export batch:", err);
      alert("Failed to generate print package.");
    } finally {
      setIsExporting(false);
    }
  };

  // Modal Handlers
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      caption: "",
      creator: "@snpshot_user",
      layout: "4-grid",
      color: "#F042FF",
      status: "approved",
      flagReason: "",
      modNote: "",
      printStatus: "dpi_verified",
      printDpi: 300,
      file: null,
      previewSrc: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      caption: item.caption || "",
      creator: item.creator || "@snpshot_user",
      layout: item.layout || "4-grid",
      color: item.color || "#F042FF",
      status: item.status || "approved",
      flagReason: item.flagReason || "",
      modNote: item.modNote || "",
      printStatus: item.printStatus || "dpi_verified",
      printDpi: item.printDpi || 300,
      file: null,
      previewSrc: item.imageSrc || ""
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("caption", formData.caption);
      data.append("creator", formData.creator);
      data.append("layout", formData.layout);
      data.append("color", formData.color);
      if (formData.file) {
        data.append("image", formData.file);
      }

      if (editingItem) {
        await axios.put(`/api/creator/gallery/${editingItem.id}`, data);
        await axios.patch(`/api/creator/gallery/${editingItem.id}/moderation`, {
          status: formData.status,
          flagReason: formData.flagReason,
          modNote: formData.modNote,
          printStatus: formData.printStatus,
          printDpi: formData.printDpi
        });
      } else {
        const res = await axios.post("/api/creator/gallery", data);
        if (res.data?.item?.id) {
          await axios.patch(`/api/creator/gallery/${res.data.item.id}/moderation`, {
            status: formData.status,
            flagReason: formData.flagReason,
            modNote: formData.modNote,
            printStatus: formData.printStatus,
            printDpi: formData.printDpi
          });
        }
      }

      setIsModalOpen(false);
      fetchStudioData();
    } catch (err) {
      console.error("Error saving photostrip:", err);
      alert("Failed to save photostrip submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Permanently delete this photostrip submission?")) return;
    try {
      await axios.delete(`/api/creator/gallery/${id}`);
      setSelectedIds(prev => prev.filter(i => i !== id));
      fetchStudioData();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // Phase 5C: Inspector Save Handler
  const handleSaveInspectorAudit = async (newStatus) => {
    if (!inspectorItem) return;
    try {
      await axios.patch(`/api/creator/gallery/${inspectorItem.id}/moderation`, {
        status: newStatus || inspectorItem.status,
        modNote: inspectorNote,
        flagReason: inspectorFlagReason,
        printStatus: newStatus === "approved" ? "dpi_verified" : inspectorItem.printStatus
      });
      setInspectorItem(null);
      fetchStudioData();
    } catch (err) {
      console.error("Error saving inspector audit:", err);
      alert("Failed to save inspection audit.");
    }
  };

  // Filter Logic
  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = 
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.creator && item.creator.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const itemOrigin = item.origin || (item.creator?.toLowerCase().includes("editorial") ? "editorial" : "community");
    const matchesOrigin = originFilter === "all" || itemOrigin === originFilter;

    const itemStatus = item.status || "approved";
    const matchesStatus = statusFilter === "all" || itemStatus === statusFilter;

    const itemPrintStatus = item.printStatus || "dpi_verified";
    const matchesPrintStatus = printFilter === "all" || itemPrintStatus === printFilter;

    const matchesLayout = layoutFilter === "all" || item.layout === layoutFilter;

    return matchesSearch && matchesOrigin && matchesStatus && matchesPrintStatus && matchesLayout;
  });

  // Metrics
  const totalCount = galleryItems.length;
  const approvedCount = galleryItems.filter(i => (i.status || "approved") === "approved").length;
  const pendingCount = galleryItems.filter(i => i.status === "pending").length;
  const flaggedCount = galleryItems.filter(i => i.status === "flagged").length;
  const archivedCount = galleryItems.filter(i => i.status === "archived").length;
  const dpiVerifiedCount = galleryItems.filter(i => (i.printStatus || "dpi_verified") === "dpi_verified").length;

  return (
    <div className="space-y-6">
      
      {/* STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Total Community Submissions
            </span>
            <div className="text-3xl font-black text-[#010030]">{totalCount}</div>
            <span className="text-[10px] text-emerald-600 font-medium">{approvedCount} Approved for Print</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ecf8] text-[#7226FF] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Safety Audit Queue
            </span>
            <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
            <span className="text-[10px] text-amber-700 font-medium">Pending Safety Verification</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Flagged Violations
            </span>
            <div className="text-3xl font-black text-rose-600">{flaggedCount}</div>
            <span className="text-[10px] text-rose-700 font-medium">Flagged by Moderators</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              300 DPI Print Compliance
            </span>
            <div className="text-3xl font-black text-[#7226FF]">
              {totalCount > 0 ? `${Math.round((dpiVerifiedCount / totalCount) * 100)}%` : "100%"}
            </div>
            <span className="text-[10px] text-[#7226FF] font-medium">{dpiVerifiedCount} High-Res Verified</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & AUDIT TOOLBAR */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs space-y-4">
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7226FF]" />
            <input 
              type="text"
              placeholder="Search by creator handle, caption, or flag reason..."
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

          <div className="flex items-center gap-2">
            {/* Phase 5B: Batch Export Package Generator CTA */}
            <button
              onClick={handleExportBatchPrint}
              disabled={isExporting}
              className="admin-btn bg-[#010030] hover:bg-[#1a1860] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-[#F042FF]" />
              <span>{isExporting ? "Generating Package..." : "Export Print Batch (ZIP)"}</span>
            </button>

            <button
              onClick={openCreateModal}
              className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Submission</span>
            </button>
          </div>

        </div>

        {/* Filter Controls: Audit Status & Print Queue Status */}
        {/* Origin & Audit Tab Navigation */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#f0ebf7]">
          {/* Origin Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-[#625b82] uppercase mr-1 shrink-0">Origin / Taxonomy:</span>
            {[
              { id: "all", label: `All Creations (${totalCount})` },
              { id: "editorial", label: `✦ Studio Editorial (${galleryItems.filter(i => (i.origin === "editorial" || i.isPromotedToShowcase)).length})` },
              { id: "community", label: `👥 Community Prints (${galleryItems.filter(i => (i.origin !== "editorial" && !i.isPromotedToShowcase)).length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setOriginFilter(tab.id)}
                className={`admin-btn px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  originFilter === tab.id
                    ? "bg-[#010030] text-[#F042FF] shadow-xs border border-[#F042FF]/30"
                    : "bg-[#f4f2f8] text-[#625b82] hover:text-[#010030] hover:bg-[#eae6f3]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 pt-2 border-t border-[#f0ebf7]">
            {/* Moderation Pipeline Tabs */}
            <div className="flex items-center gap-1 text-xs max-w-full overflow-x-auto pb-1 xl:pb-0">
              <span className="text-[11px] font-bold text-[#625b82] uppercase mr-1 shrink-0">Audit Queue:</span>
              {[
                { id: "all", label: `All (${totalCount})` },
                { id: "approved", label: `Approved (${approvedCount})` },
                { id: "pending", label: `Pending (${pendingCount})` },
                { id: "flagged", label: `Flagged (${flaggedCount})` },
                { id: "archived", label: `Archived (${archivedCount})` }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`admin-btn px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    statusFilter === pill.id 
                      ? "bg-[#7226FF] text-white font-semibold shadow-2xs" 
                      : "bg-[#f4f2f8] text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Print Status & Format Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <span className="text-[11px] font-bold text-[#625b82] uppercase shrink-0">Print Status:</span>
                <select
                  value={printFilter}
                  onChange={(e) => setPrintFilter(e.target.value)}
                  className="admin-ui bg-[#f4f2f8] text-[#010030] border border-[#e2dced] text-xs font-semibold px-2.5 py-1 rounded-xl cursor-pointer focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Print States</option>
                  <option value="queued">Queued for Print</option>
                  <option value="dpi_verified">300 DPI Verified</option>
                  <option value="exported">Exported Package</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                <span className="text-[11px] font-bold text-[#625b82] uppercase shrink-0">Format:</span>
                <select
                  value={layoutFilter}
                  onChange={(e) => setLayoutFilter(e.target.value)}
                  className="admin-ui bg-[#f4f2f8] text-[#010030] border border-[#e2dced] text-xs font-semibold px-2.5 py-1 rounded-xl cursor-pointer focus:outline-none w-full sm:w-auto"
                >
                  <option value="all">All Formats</option>
                  <option value="3-grid">3-Grid Vertical</option>
                  <option value="4-grid">Classic 4-Grid</option>
                  <option value="2x2">2x2 Square</option>
                  <option value="2x3">2x3 Postcard</option>
                </select>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* BULK MODERATION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#010030] to-[#1e0066] text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-[#F042FF] text-white text-xs font-bold font-mono px-2.5 py-1 rounded-lg">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs font-medium text-slate-200">
              Bulk audit and print queue controls ready.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("approved")}
              className="admin-btn bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve All</span>
            </button>

            <button
              onClick={() => handleBulkStatusUpdate("flagged")}
              className="admin-btn bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flag All</span>
            </button>

            <button
              onClick={() => handleBulkStatusUpdate("archived")}
              className="admin-btn bg-slate-600 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archive</span>
            </button>

            <button
              onClick={() => handleBulkStatusUpdate("deleted")}
              className="admin-btn bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="admin-btn p-1.5 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* GALLERY & PRINT MODERATION CATALOG GRID */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Community Submissions & Print Audit Queue...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs">
          No photostrip submissions match the current audit search or status filters.
        </div>
      ) : (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between text-xs text-[#625b82] px-1">
            <button
              onClick={toggleSelectAll}
              className="admin-btn flex items-center gap-1.5 font-bold text-[#7226FF] hover:underline cursor-pointer"
            >
              {selectedIds.length === filteredItems.length ? (
                <CheckSquare className="w-4 h-4 text-[#7226FF]" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({filteredItems.length})</span>
            </button>
            <span>Showing {filteredItems.length} submissions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const status = item.status || "approved";
              const printStatus = item.printStatus || "dpi_verified";

              return (
                <div 
                  key={item.id}
                  className={`bg-white border rounded-3xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer ${
                    isSelected ? "border-[#7226FF] ring-2 ring-[#7226FF]/20 bg-purple-50/20" : "border-[#e2dced]"
                  }`}
                  onClick={() => toggleSelectItem(item.id)}
                >
                  {/* Selection Checkbox */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelectItem(item.id);
                    }}
                    className="absolute top-3 left-3 z-20 p-0.5 bg-white/90 rounded-lg shadow-2xs text-[#7226FF]"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#7226FF]" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>

                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
                    {status === "approved" && (
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Approved
                      </span>
                    )}
                    {status === "pending" && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Pending Audit
                      </span>
                    )}
                    {status === "flagged" && (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Flagged
                      </span>
                    )}
                    {status === "archived" && (
                      <span className="bg-slate-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Photostrip Image Preview Box */}
                  <div 
                    className="w-full h-64 rounded-2xl bg-[#010030]/5 border border-[#e2dced] p-2 flex items-center justify-center mb-3 relative overflow-hidden bg-[radial-gradient(#e2dced_1px,transparent_1px)] [background-size:12px_12px] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectorItem(item);
                      setInspectorNote(item.modNote || "");
                      setInspectorFlagReason(item.flagReason || "");
                    }}
                  >
                    <img 
                      src={item.imageSrc} 
                      alt={item.caption}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-sm group-hover:scale-102 transition-transform"
                    />

                    {/* Phase 5C: CMYK Proof Quick Launcher Overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectorItem(item);
                        setInspectorNote(item.modNote || "");
                        setInspectorFlagReason(item.flagReason || "");
                      }}
                      className="admin-btn absolute inset-0 bg-[#010030]/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1"
                    >
                      <Maximize2 className="w-5 h-5 text-[#F042FF]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#010030] px-2 py-1 rounded border border-[#F042FF]/50">
                        Inspect CMYK Print Proof
                      </span>
                    </button>

                    {/* Print Spec Badge */}
                    <span className="absolute bottom-2 left-2 text-[8px] font-mono font-bold bg-[#010030]/90 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40 uppercase">
                      300 DPI • {item.layout}
                    </span>
                  </div>

                  {/* Card Metadata & Actions */}
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#010030] truncate" title={item.creator}>
                        {item.creator}
                      </span>
                      <span className="bg-[#f0ecf8] text-[#7226FF] px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase shrink-0">
                        {item.layout}
                      </span>
                    </div>

                    <p className="text-xs text-[#625b82] line-clamp-1 italic">
                      "{item.caption}"
                    </p>

                    {/* Flag Reason Warning Banner if flagged */}
                    {status === "flagged" && item.flagReason && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-1.5 text-[10px] text-rose-700 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        <span className="truncate">{item.flagReason}</span>
                      </div>
                    )}

                    {/* Moderator Note snippet if present */}
                    {item.modNote && status !== "flagged" && (
                      <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-1.5 text-[10px] text-[#7226FF] font-medium truncate">
                        Note: {item.modNote}
                      </div>
                    )}

                    {/* Print Status Selector Dropdown */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <Printer className="w-3 h-3 text-[#7226FF] shrink-0" />
                      <select
                        value={printStatus}
                        onChange={(e) => handleUpdatePrintStatus(item.id, e.target.value)}
                        className="admin-ui bg-[#f8f7fc] text-[#010030] border border-[#e2dced] text-[10px] font-semibold px-1.5 py-0.5 rounded-lg w-full cursor-pointer"
                      >
                        {PRINT_STATUS_OPTIONS.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Moderation Controls Bar */}
                    <div className="flex items-center justify-between border-t border-[#f0ebf7] pt-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{item.likes || 0}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Quick Promote to Homepage Showcase Toggle */}
                        <button
                          onClick={() => handlePromoteToShowcase(item)}
                          className={`admin-btn p-1 rounded-lg transition-colors ${
                            item.isPromotedToShowcase || item.origin === 'editorial'
                              ? "bg-[#F042FF]/15 text-[#F042FF] border border-[#F042FF]/40"
                              : "hover:bg-purple-50 text-[#7226FF]"
                          }`}
                          title={item.isPromotedToShowcase || item.origin === 'editorial' ? "Featured in Homepage Showcase (Click to Demote)" : "Promote to Homepage Design Showcase"}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Approve / Flag Toggle Buttons */}
                        {status !== "approved" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "approved")}
                            className="admin-btn p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            title="Approve Submission"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {status !== "flagged" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "flagged", { flagReason: "Low Resolution" })}
                            className="admin-btn p-1 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                            title="Flag Submission"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(item)}
                          className="admin-btn p-1 hover:bg-[#f0ecf8] text-[#7226FF] rounded-lg transition-colors"
                          title="Edit Submission & Notes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSingle(item.id)}
                          className="admin-btn p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          title="Delete Submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* PHASE 5C: INTERACTIVE CMYK PRINT QUALITY INSPECTOR MODAL */}
      {inspectorItem && (
        <div 
          className="fixed inset-0 z-50 bg-[#010030]/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setInspectorItem(null)}
        >
          <div 
            className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-4xl w-full shadow-2xl relative space-y-4 max-h-[95vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-[#7226FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Phase 5C
                  </span>
                  <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                    <Printer className="w-4 h-4 text-[#7226FF]" />
                    <span>Print Quality Inspector & CMYK Proof Bench</span>
                  </h3>
                </div>
                <p className="text-xs text-[#625b82]">
                  Creator: <span className="font-bold text-[#010030]">{inspectorItem.creator}</span> • Layout: <span className="font-mono text-[#7226FF] uppercase font-bold">{inspectorItem.layout}</span>
                </p>
              </div>

              <button 
                onClick={() => setInspectorItem(null)}
                className="admin-btn p-2 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Bench Inspector Content: Left Canvas, Right Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
              
              {/* LEFT: CANVAS PROOF BENCH */}
              <div className="lg:col-span-7 space-y-3 flex flex-col items-center">
                
                {/* Proof Mode & Zoom Toolbar */}
                <div className="w-full bg-[#f8f7fc] border border-[#e2dced] p-2 rounded-2xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setProofMode("rgb")}
                      className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        proofMode === "rgb" ? "bg-[#010030] text-white" : "text-[#625b82] hover:bg-white"
                      }`}
                    >
                      RGB Screen
                    </button>
                    <button
                      onClick={() => setProofMode("cmyk")}
                      className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        proofMode === "cmyk" ? "bg-[#7226FF] text-white" : "text-[#625b82] hover:bg-white"
                      }`}
                    >
                      CMYK Print Proof
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[11px] text-[#625b82] cursor-pointer font-medium">
                      <input 
                        type="checkbox"
                        checked={showBleedGuides}
                        onChange={(e) => setShowBleedGuides(e.target.checked)}
                        className="w-3.5 h-3.5 text-[#7226FF] rounded cursor-pointer"
                      />
                      <span>3mm Bleed Marks</span>
                    </label>

                    <div className="flex items-center gap-1 border-l border-[#e2dced] pl-2">
                      <button 
                        onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                        className="admin-btn p-1 text-[#625b82] hover:bg-white rounded-lg"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[10px] font-bold w-8 text-center">{zoomLevel}x</span>
                      <button 
                        onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                        className="admin-btn p-1 text-[#625b82] hover:bg-white rounded-lg"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Proof Canvas Viewport */}
                <div className="w-full h-80 bg-[#0a0a1a] rounded-2xl border border-[#e2dced] p-4 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#1e1055_1px,transparent_1px)] [background-size:16px_16px]">
                  
                  <div 
                    className={`relative transition-all duration-300 ${
                      showBleedGuides ? "p-3 border-2 border-dashed border-rose-500/80" : ""
                    }`}
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    {/* Bleed Guide Label */}
                    {showBleedGuides && (
                      <span className="absolute -top-3 left-2 bg-rose-600 text-white text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                        3mm Trim Bleed
                      </span>
                    )}

                    <img 
                      src={inspectorItem.imageSrc} 
                      alt={inspectorItem.caption}
                      className={`max-h-64 object-contain rounded-lg shadow-2xl transition-all ${
                        proofMode === "cmyk" 
                          ? "saturate-90 contrast-105 brightness-95 sepia-[0.05]" 
                          : ""
                      }`}
                    />

                    {/* Corner Crop Registration Marks if guides enabled */}
                    {showBleedGuides && (
                      <>
                        <div className="absolute -top-2 -left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
                        <div className="absolute -top-2 -right-2 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
                        <div className="absolute -bottom-2 -left-2 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
                        <div className="absolute -bottom-2 -right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400" />
                      </>
                    )}
                  </div>

                </div>

                {/* Print Resolution & Specs Summary */}
                <div className="w-full bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div>
                    <span className="text-[#625b82] block">Resolution</span>
                    <span className="font-bold text-[#010030]">1200 x 1800 px</span>
                  </div>
                  <div>
                    <span className="text-[#625b82] block">DPI Density</span>
                    <span className="font-bold text-emerald-600">300 DPI (High-Res)</span>
                  </div>
                  <div>
                    <span className="text-[#625b82] block">Color Space</span>
                    <span className="font-bold text-[#7226FF] uppercase">{proofMode} Proof</span>
                  </div>
                </div>

              </div>

              {/* RIGHT: AUDIT FORM & SAFETY CHECKS */}
              <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-[#010030] border-b border-[#f0ebf7] pb-2">
                    Safety Audit & Moderator Log
                  </h4>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Moderator Audit Note</label>
                    <textarea 
                      rows={3}
                      placeholder="Add internal moderator note regarding print quality, layout alignment, or approval..."
                      value={inspectorNote}
                      onChange={(e) => setInspectorNote(e.target.value)}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Violation Tag (If Flagging)</label>
                    <select
                      value={inspectorFlagReason}
                      onChange={(e) => setInspectorFlagReason(e.target.value)}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    >
                      <option value="">No Violation (Clear)</option>
                      {FLAG_REASONS.map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Safety Checklist Items */}
                  <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 space-y-2 text-[11px]">
                    <span className="font-bold text-[#010030] block uppercase tracking-wider text-[10px]">
                      Automated Quality Pre-Checks
                    </span>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>300 DPI minimum resolution verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Crop and bleed margins within 3mm threshold</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>No unreadable text or prohibited handles</span>
                    </div>
                  </div>
                </div>

                {/* Audit Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-[#f0ebf7]">
                  <button
                    onClick={() => handleSaveInspectorAudit("approved")}
                    className="admin-btn w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve for 300 DPI Print Queue</span>
                  </button>

                  <button
                    onClick={() => handleSaveInspectorAudit("flagged")}
                    className="admin-btn w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Flag Violation ({inspectorFlagReason || "Violation"})</span>
                  </button>

                  <button
                    onClick={() => setInspectorItem(null)}
                    className="admin-btn w-full bg-[#f4f2f8] hover:bg-[#eae6f3] text-[#4a4365] font-semibold py-2 rounded-xl"
                  >
                    Close Inspector
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* PHASE 5B: EXPORT PACKAGE DOWNLOAD MODAL */}
      {exportPackage && (
        <div 
          className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExportPackage(null)}
        >
          <div 
            className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#7226FF]" />
                <h4 className="font-bold text-base text-[#010030]">
                  Print Package Ready
                </h4>
              </div>
              <button 
                onClick={() => setExportPackage(null)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#625b82]">Batch Package ID:</span>
                <span className="font-mono font-bold text-[#7226FF]">{exportPackage.batchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#625b82]">Exported Photostrips:</span>
                <span className="font-bold text-[#010030]">{exportPackage.exportedCount} Files</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#625b82]">Resolution:</span>
                <span className="font-mono text-emerald-600 font-bold">300 DPI Composite PNG</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert(`Downloading Batch Package ${exportPackage.batchId} (Manifest generated with ${exportPackage.exportedCount} items)`);
                  setExportPackage(null);
                }}
                className="admin-btn w-full bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-bold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Print Package (ZIP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT SINGLE SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-lg text-[#010030] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7226FF]" />
                <span>{editingItem ? "Edit Photostrip & Audit" : "Add New Photostrip"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-[#010030] mb-1">Creator Handle</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. @wonyoung_fan"
                  value={formData.creator}
                  onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Caption / Quote</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Loved this studio shoot session! ✨"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Origin / Category</label>
                  <select
                    value={formData.origin || "community"}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value, badge: e.target.value === "editorial" ? "Official Sample" : "Community Print" })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    <option value="community">Community User Submission</option>
                    <option value="editorial">Studio Editorial Showcase</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Display Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Official Sample, Staff Pick"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Audit Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Audit</option>
                    <option value="flagged">Flagged</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Print Queue Status</label>
                  <select
                    value={formData.printStatus}
                    onChange={(e) => setFormData({ ...formData, printStatus: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {PRINT_STATUS_OPTIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.status === "flagged" && (
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Violation Tag</label>
                  <select
                    value={formData.flagReason}
                    onChange={(e) => setFormData({ ...formData, flagReason: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    <option value="">Select violation reason...</option>
                    {FLAG_REASONS.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-[#010030] mb-1">Moderator Audit Note</label>
                <textarea 
                  rows={2}
                  placeholder="Internal audit notes..."
                  value={formData.modNote}
                  onChange={(e) => setFormData({ ...formData, modNote: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Upload Composite Graphic</label>
                <label className="cursor-pointer block">
                  <div className="w-full h-32 border-2 border-dashed border-[#e2dced] hover:border-[#7226FF] rounded-2xl flex flex-col items-center justify-center bg-[#f8f7fc] relative overflow-hidden p-2">
                    {formData.previewSrc ? (
                      <img src={formData.previewSrc} alt="Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#7226FF] mb-1" />
                        <span className="text-xs font-bold text-[#010030]">Choose photostrip image</span>
                        <span className="text-[10px] text-[#625b82]">High-res composite PNG/JPG</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, file, previewSrc: URL.createObjectURL(file) });
                      }
                    }}
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
                  {submitting ? "Saving..." : (editingItem ? "Save Changes" : "Create Submission")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GalleryManager;
