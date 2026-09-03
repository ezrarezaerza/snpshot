import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { agencies, groupsByAgency, membersByGroup } from "../../data/artists";
import { 
  Sparkles, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Image as ImageIcon,
  Layers,
  Star,
  Clock,
  Archive,
  Calendar,
  Camera,
  Play,
  Sliders,
  Eye,
  Info,
  Tag,
  Check,
  ChevronRight,
  HelpCircle,
  Building2,
  Users
} from "lucide-react";

const PosesManager = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'scheduled', 'archived', 'featured'
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  // Modal State - Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom Agency / Group entry toggles in modal
  const [isCustomAgency, setIsCustomAgency] = useState(false);
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  // Modal State - Live Camera Overlay Inspector (Phase 2C)
  const [inspectArtist, setInspectArtist] = useState(null);
  const [activeShotIndex, setActiveShotIndex] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(45); // %
  const [countdown, setCountdown] = useState(null);
  const [flashActive, setFlashActive] = useState(false);

  // Dynamic Agency & Group Hierarchy from Database Campaigns & Base Presets
  const availableAgencies = useMemo(() => {
    const map = new Map();
    // 1. Initial presets
    agencies.forEach(a => map.set(a.id, { id: a.id, name: a.name }));
    // 2. Database campaigns
    artists.forEach(art => {
      if (art.agencyId && art.agencyName) {
        if (!map.has(art.agencyId)) {
          map.set(art.agencyId, { id: art.agencyId, name: art.agencyName });
        }
      }
    });
    return Array.from(map.values());
  }, [artists]);

  const availableGroupsByAgency = useMemo(() => {
    const result = {};
    // 1. Presets
    Object.entries(groupsByAgency).forEach(([agencyId, grps]) => {
      result[agencyId] = [...grps];
    });
    // 2. Database artists
    artists.forEach(art => {
      if (art.agencyId && art.groupId && art.groupName) {
        if (!result[art.agencyId]) {
          result[art.agencyId] = [];
        }
        if (!result[art.agencyId].some(g => g.id === art.groupId)) {
          result[art.agencyId].push({
            id: art.groupId,
            name: art.groupName,
            logo: art.groupLogo || "✨",
            isMale: Boolean(art.isMale)
          });
        }
      }
    });
    return result;
  }, [artists]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    color: "#F042FF",
    agencyId: "starship",
    agencyName: "Starship Ent.",
    groupId: "ive",
    groupName: "IVE",
    groupLogo: "✨",
    isMale: false,
    status: "active", // 'active', 'scheduled', 'archived'
    startDate: "",
    endDate: "",
    isFeatured: false,
    deckSize: 4,
    posesGuidance: ["Finger Heart Pose", "Dual Cheek Poke", "Wink & V Sign", "Cute Cat Paws"],
    posesFiles: [null, null, null, null],
    posesPreview: ["", "", "", ""]
  });

  const fetchStudioData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/studio/data");
      if (res.data && res.data.artists) {
        setArtists(res.data.artists);
      }
    } catch (err) {
      console.error("Error fetching pose campaigns:", err);
      setError("Failed to load pose campaigns. Please check server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, []);

  const openCreateModal = () => {
    setEditingArtist(null);
    setIsCustomAgency(false);
    setIsCustomGroup(false);

    const defaultAgency = availableAgencies[0] || { id: "starship", name: "Starship Ent." };
    const defaultGroups = availableGroupsByAgency[defaultAgency.id] || [];
    const defaultGroup = defaultGroups[0] || { id: "ive", name: "IVE", logo: "✨", isMale: false };

    setFormData({
      name: "",
      role: "",
      color: "#F042FF",
      agencyId: defaultAgency.id,
      agencyName: defaultAgency.name,
      groupId: defaultGroup.id,
      groupName: defaultGroup.name,
      groupLogo: defaultGroup.logo || "✨",
      isMale: Boolean(defaultGroup.isMale),
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      isFeatured: false,
      finalPreviewImage: "/photobooth-strip.png",
      finalPreviewFile: null,
      deckSize: 4,
      posesGuidance: ["Finger Heart Pose", "Dual Cheek Poke", "Wink & V Sign", "Cute Cat Paws"],
      posesFiles: [null, null, null, null],
      posesPreview: ["", "", "", ""]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (artist) => {
    setEditingArtist(artist);
    const existingPoses = artist.poses || ["", "", "", ""];
    const guidance = artist.posesGuidance || ["Finger Heart", "Cheek Poke", "V Sign", "Wink"];
    
    const isAgencyKnown = availableAgencies.some(a => a.id === artist.agencyId);
    const agencyGroups = availableGroupsByAgency[artist.agencyId] || [];
    const isGroupKnown = agencyGroups.some(g => g.id === artist.groupId);

    setIsCustomAgency(!isAgencyKnown);
    setIsCustomGroup(!isGroupKnown);

    setFormData({
      name: artist.name || "",
      role: artist.role || "",
      color: artist.color || "#F042FF",
      agencyId: artist.agencyId || "starship",
      agencyName: artist.agencyName || "",
      groupId: artist.groupId || "ive",
      groupName: artist.groupName || "",
      groupLogo: artist.groupLogo || "✦",
      isMale: Boolean(artist.isMale),
      status: artist.status || "active",
      startDate: artist.startDate || "",
      endDate: artist.endDate || "",
      isFeatured: Boolean(artist.isFeatured),
      finalPreviewImage: artist.finalPreviewImage || artist.previewImage || "/photobooth-strip.png",
      finalPreviewFile: null,
      deckSize: existingPoses.length,
      posesGuidance: guidance,
      posesFiles: new Array(existingPoses.length).fill(null),
      posesPreview: existingPoses
    });
    setIsModalOpen(true);
  };

  // Handler for Agency dropdown selection
  const handleAgencySelect = (agencyId) => {
    if (agencyId === "__new__") {
      setIsCustomAgency(true);
      setIsCustomGroup(true);
      setFormData(prev => ({
        ...prev,
        agencyId: "",
        agencyName: "",
        groupId: "",
        groupName: "",
        groupLogo: "✨"
      }));
      return;
    }

    setIsCustomAgency(false);
    const selected = availableAgencies.find(a => a.id === agencyId);
    const agencyName = selected ? selected.name : agencyId;
    const groups = availableGroupsByAgency[agencyId] || [];
    const firstGroup = groups[0] || { id: "", name: "", logo: "✨", isMale: false };

    setIsCustomGroup(groups.length === 0);

    setFormData(prev => ({
      ...prev,
      agencyId,
      agencyName,
      groupId: firstGroup.id,
      groupName: firstGroup.name,
      groupLogo: firstGroup.logo || "✨",
      isMale: Boolean(firstGroup.isMale)
    }));
  };

  // Handler for Group dropdown selection
  const handleGroupSelect = (groupId) => {
    if (groupId === "__new__") {
      setIsCustomGroup(true);
      setFormData(prev => ({
        ...prev,
        groupId: "",
        groupName: "",
        groupLogo: "✨"
      }));
      return;
    }

    setIsCustomGroup(false);
    const groups = availableGroupsByAgency[formData.agencyId] || [];
    const selected = groups.find(g => g.id === groupId);

    setFormData(prev => ({
      ...prev,
      groupId,
      groupName: selected ? selected.name : groupId,
      groupLogo: selected?.logo || "✨",
      isMale: selected ? Boolean(selected.isMale) : prev.isMale
    }));
  };

  // Quick preset member auto-fill
  const handleQuickFillMember = (member) => {
    setFormData(prev => ({
      ...prev,
      name: member.name,
      role: member.role || prev.role,
      color: member.color || prev.color
    }));
  };

  const handleDeckSizeChange = (newSize) => {
    const size = parseInt(newSize, 10);
    setFormData(prev => {
      const currentPreviews = [...prev.posesPreview];
      const currentFiles = [...prev.posesFiles];
      const currentGuidance = [...prev.posesGuidance];

      while (currentPreviews.length < size) {
        currentPreviews.push("");
        currentFiles.push(null);
        currentGuidance.push(`Pose ${currentPreviews.length + 1} Guidance`);
      }

      return {
        ...prev,
        deckSize: size,
        posesPreview: currentPreviews.slice(0, size),
        posesFiles: currentFiles.slice(0, size),
        posesGuidance: currentGuidance.slice(0, size)
      };
    });
  };

  const handleGuidanceChange = (index, value) => {
    const newGuidance = [...formData.posesGuidance];
    newGuidance[index] = value;
    setFormData(prev => ({ ...prev, posesGuidance: newGuidance }));
  };

  const handlePoseFileChange = (index, file) => {
    if (!file) return;
    const newFiles = [...formData.posesFiles];
    newFiles[index] = file;

    const newPreviews = [...formData.posesPreview];
    newPreviews[index] = URL.createObjectURL(file);

    setFormData(prev => ({
      ...prev,
      posesFiles: newFiles,
      posesPreview: newPreviews
    }));
  };

  const handleFinalPreviewFileChange = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      finalPreviewFile: file,
      finalPreviewImage: previewUrl
    }));
  };

  const handleFinalPreviewUrlChange = (url) => {
    setFormData(prev => ({
      ...prev,
      finalPreviewImage: url,
      finalPreviewFile: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("role", formData.role);
      data.append("color", formData.color);
      data.append("agencyId", formData.agencyId);
      data.append("agencyName", formData.agencyName);
      data.append("groupId", formData.groupId);
      data.append("groupName", formData.groupName);
      data.append("groupLogo", formData.groupLogo);
      data.append("isMale", formData.isMale);
      data.append("status", formData.status);
      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      data.append("isFeatured", formData.isFeatured);
      data.append("posesGuidance", JSON.stringify(formData.posesGuidance));

      // Append final preview image if file uploaded or url string
      if (formData.finalPreviewFile) {
        data.append("finalPreview", formData.finalPreviewFile);
      } else if (formData.finalPreviewImage) {
        data.append("finalPreviewImage", formData.finalPreviewImage);
      }

      // Append pose files
      formData.posesFiles.forEach((file) => {
        if (file) {
          data.append("poses", file);
        }
      });

      // Pass existing pose URLs if editing without re-uploading all files
      if (editingArtist) {
        data.append("existingPoses", JSON.stringify(formData.posesPreview));
        await axios.put(`/api/creator/artist/${editingArtist.id}`, data);
      } else {
        await axios.post("/api/creator/artist", data);
      }

      setIsModalOpen(false);
      fetchStudioData();
    } catch (err) {
      console.error("Error saving pose campaign:", err);
      alert(err.response?.data?.message || "Error saving campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickToggleStatus = async (artist, newStatus) => {
    try {
      await axios.patch(`/api/creator/artist/${artist.id}/quick-toggle`, {
        status: newStatus
      });
      fetchStudioData();
    } catch (err) {
      console.error("Error toggling campaign status:", err);
    }
  };

  const handleQuickToggleFeatured = async (artist) => {
    try {
      await axios.patch(`/api/creator/artist/${artist.id}/quick-toggle`, {
        isFeatured: !artist.isFeatured
      });
      fetchStudioData();
    } catch (err) {
      console.error("Error toggling featured campaign:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pose campaign?")) return;
    try {
      await axios.delete(`/api/creator/artist/${id}`);
      fetchStudioData();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert("Failed to delete pose campaign.");
    }
  };

  // Live Shutter Simulation Trigger
  const triggerShutterTest = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 700);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setFlashActive(true);
      const flashTimer = setTimeout(() => {
        setFlashActive(false);
        setCountdown(null);
        // Advance shot index
        if (inspectArtist && inspectArtist.poses) {
          setActiveShotIndex((prev) => (prev + 1) % inspectArtist.poses.length);
        }
      }, 400);
      return () => clearTimeout(flashTimer);
    }
  }, [countdown, inspectArtist]);

  // Filter Logic
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (artist.groupName && artist.groupName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (artist.agencyName && artist.agencyName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = artist.status === "active" || !artist.status;
    else if (statusFilter === "scheduled") matchesStatus = artist.status === "scheduled";
    else if (statusFilter === "archived") matchesStatus = artist.status === "archived";
    else if (statusFilter === "featured") matchesStatus = Boolean(artist.isFeatured);

    const matchesAgency = agencyFilter === "all" || artist.agencyId === agencyFilter;
    const matchesGroup = groupFilter === "all" || artist.groupId === groupFilter;

    return matchesSearch && matchesStatus && matchesAgency && matchesGroup;
  });

  // Groups available for the currently selected agency in the filter bar
  const filterAvailableGroups = useMemo(() => {
    if (agencyFilter === "all") {
      // Gather all unique groups across all agencies
      const allGrps = [];
      const seen = new Set();
      Object.values(availableGroupsByAgency).flat().forEach(g => {
        if (!seen.has(g.id)) {
          seen.add(g.id);
          allGrps.push(g);
        }
      });
      return allGrps;
    }
    return availableGroupsByAgency[agencyFilter] || [];
  }, [agencyFilter, availableGroupsByAgency]);

  // Analytics Stats
  const activeCount = artists.filter(a => a.status === "active" || !a.status).length;
  const scheduledCount = artists.filter(a => a.status === "scheduled").length;
  const featuredCount = artists.filter(a => a.isFeatured).length;
  const totalShotsCount = artists.reduce((sum, a) => sum + (a.poses?.length || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* SECTION BANNER */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              K-POP & IDOL COLLABS
            </span>
            <span className="text-xs font-mono text-[#625b82]">STUDIO_CORE // V2.6</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#010030] tracking-tight uppercase font-display">
            ARTIST CAMPAIGNS STUDIO
          </h2>
          <p className="text-xs text-[#625b82] mt-0.5">
            Manage idol collaboration campaigns, pose guidance decks, and showcase photostrip preview composites.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Artist Campaign</span>
        </button>
      </div>

      {/* STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Active Campaigns
            </span>
            <div className="text-3xl font-black text-emerald-600">{activeCount}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Live on Photo Booth</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Scheduled Pop-Ups
            </span>
            <div className="text-3xl font-black text-amber-600">{scheduledCount}</div>
            <span className="text-[10px] text-amber-700 font-medium">Upcoming Launch Dates</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Featured Collabs
            </span>
            <div className="text-3xl font-black text-[#7226FF]">{featuredCount}</div>
            <span className="text-[10px] text-[#7226FF] font-medium">Top Priority Collabs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center">
            <Star className="w-5 h-5 fill-[#7226FF]" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Total Pose Guide Shots
            </span>
            <div className="text-3xl font-black text-[#010030]">{totalShotsCount}</div>
            <span className="text-[10px] text-[#625b82] font-medium">Across All Artist Decks</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ecf8] text-[#010030] flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CONTROL TOOLBAR & HIERARCHY FILTER BAR */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7226FF]" />
            <input 
              type="text"
              placeholder="Search campaign by artist, group, agency..."
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

          {/* Status Filter Pills & Add Campaign CTA */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 bg-[#f4f2f8] p-1 rounded-xl border border-[#e2dced] text-xs max-w-full overflow-x-auto">
              <span className="text-[11px] font-bold text-[#625b82] uppercase px-1.5 shrink-0">Status:</span>
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "scheduled", label: "Scheduled" },
                { id: "featured", label: "Featured ★" },
                { id: "archived", label: "Archived" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStatusFilter(item.id)}
                  className={`admin-btn px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    statusFilter === item.id 
                      ? "bg-[#7226FF] text-white font-semibold shadow-2xs" 
                      : "text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={openCreateModal}
              className="admin-btn bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(114,38,255,0.35)] flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto sm:ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Pose Campaign</span>
            </button>
          </div>
        </div>

        {/* Database Agency & Group Hierarchy Filter Bar */}
        <div className="pt-2 border-t border-[#f0ebf7] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#7226FF]" />
              <span>Agency:</span>
            </span>
            <select
              value={agencyFilter}
              onChange={(e) => {
                setAgencyFilter(e.target.value);
                setGroupFilter("all");
              }}
              className="admin-ui bg-[#f8f7fc] border border-[#e2dced] text-[#010030] font-medium rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:border-[#7226FF] focus:outline-none"
            >
              <option value="all">All Agencies ({availableAgencies.length})</option>
              {availableAgencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider flex items-center gap-1.5 ml-2">
              <Users className="w-3.5 h-3.5 text-[#7226FF]" />
              <span>Group / Label:</span>
            </span>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="admin-ui bg-[#f8f7fc] border border-[#e2dced] text-[#010030] font-medium rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:border-[#7226FF] focus:outline-none"
            >
              <option value="all">All Groups ({filterAvailableGroups.length})</option>
              {filterAvailableGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.logo || "✦"} {group.name}
                </option>
              ))}
            </select>

            {(agencyFilter !== "all" || groupFilter !== "all") && (
              <button
                onClick={() => {
                  setAgencyFilter("all");
                  setGroupFilter("all");
                }}
                className="admin-btn text-[11px] text-[#7226FF] hover:underline font-semibold flex items-center gap-1 ml-1"
              >
                <X className="w-3 h-3" />
                Reset Hierarchy
              </button>
            )}
          </div>

          <div className="text-[11px] text-[#625b82]">
            Showing <strong className="text-[#010030] font-bold">{filteredArtists.length}</strong> of {artists.length} campaigns
          </div>
        </div>

      </div>

      {/* CAMPAIGNS GRID */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Pose Campaigns...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs">
          No pose campaigns found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredArtists.map((artist) => {
            const posesList = artist.poses || [];
            const guidanceList = artist.posesGuidance || [];
            const status = artist.status || "active";

            return (
              <div 
                key={artist.id}
                className="bg-white border border-[#e2dced] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Top Status & Featured Banner Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {status === "active" && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        ACTIVE
                      </span>
                    )}
                    {status === "scheduled" && (
                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        SCHEDULED {artist.startDate ? `(${artist.startDate})` : ""}
                      </span>
                    )}
                    {status === "archived" && (
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        ARCHIVED
                      </span>
                    )}

                    {artist.isFeatured && (
                      <span className="bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-2xs">
                        <Star className="w-3 h-3 fill-white" />
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Star Toggle Quick Action */}
                  <button
                    onClick={() => handleQuickToggleFeatured(artist)}
                    className={`admin-btn p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      artist.isFeatured 
                        ? "bg-purple-50 text-[#7226FF] border-[#7226FF]/30" 
                        : "bg-[#f8f7fc] text-slate-400 border-[#e2dced] hover:text-[#7226FF]"
                    }`}
                    title={artist.isFeatured ? "Unfeature Campaign" : "Feature Campaign"}
                  >
                    <Star className={`w-3.5 h-3.5 ${artist.isFeatured ? "fill-[#7226FF]" : ""}`} />
                  </button>
                </div>

                {/* Card Header Info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl bg-cover bg-center border border-[#e2dced] shadow-2xs shrink-0 overflow-hidden"
                      style={{ backgroundImage: `url(${artist.avatar || posesList[0]})` }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-[#010030] leading-tight">
                          {artist.name}
                        </h4>
                        <span className="text-xs">{artist.groupLogo || "✦"}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#f0ecf8] text-[#7226FF] px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase">
                          {artist.groupName}
                        </span>
                        <span className="text-xs text-[#625b82]">
                          {artist.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className="w-4 h-4 rounded-full border shadow-2xs shrink-0 mt-1"
                    style={{ backgroundColor: artist.color || "#F042FF" }}
                    title={`Brand Accent: ${artist.color}`}
                  />
                </div>

                {/* Final Photostrip Preview & Pose Deck Guidance Grid */}
                <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 mb-4 space-y-3">
                  {/* Final Composite Preview Banner */}
                  <div className="bg-white border border-[#e2dced] rounded-xl p-2 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-14 rounded-lg bg-[#010030] overflow-hidden border border-[#e2dced] shrink-0 flex items-center justify-center">
                        <img 
                          src={artist.finalPreviewImage || artist.previewImage || "/photobooth-strip.png"} 
                          alt="Showcase Strip" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/photobooth-strip.png";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-[#7226FF] uppercase tracking-wider block">
                          Showcase Strip Preview
                        </span>
                        <p className="text-[11px] font-semibold text-[#010030] truncate">
                          Final Composite Preview
                        </p>
                        <span className="text-[9px] text-[#625b82] block truncate">
                          Displayed in Photoshoot Showcase
                        </span>
                      </div>
                    </div>
                    <span className="bg-purple-50 text-[#7226FF] text-[9px] font-mono font-bold px-2 py-1 rounded-md border border-purple-100 shrink-0">
                      SHOWCASE PREVIEW
                    </span>
                  </div>

                  {/* Pose Deck Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#625b82] uppercase">
                        Pose Deck ({posesList.length} Guidance Shots)
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#7226FF] bg-purple-50 px-1.5 py-0.5 rounded">
                        Guidance Active
                      </span>
                    </div>

                    <div className={`grid gap-2 ${posesList.length <= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                      {posesList.map((poseUrl, idx) => (
                        <div 
                          key={idx}
                          className="bg-white border border-[#e2dced] rounded-xl p-1.5 flex flex-col items-center shadow-2xs group/shot"
                        >
                          <div 
                            className="w-full h-20 bg-cover bg-center rounded-lg border border-[#e2dced] shadow-2xs relative overflow-hidden mb-1"
                            style={{ backgroundImage: `url(${poseUrl})` }}
                          >
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/shot:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[9px] font-mono text-white font-bold bg-slate-900/70 px-1 py-0.5 rounded">
                                P{idx + 1}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-medium text-[#010030] text-center line-clamp-1 w-full truncate" title={guidanceList[idx] || `Pose ${idx + 1}`}>
                            {guidanceList[idx] || `Shot ${idx + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specs, Live Camera Inspection & Actions */}
                <div className="flex items-center justify-between border-t border-[#f0ebf7] pt-3 text-xs text-[#625b82]">
                  <div className="flex items-center gap-2">
                    {/* Live Camera Inspection Trigger Button */}
                    <button
                      onClick={() => {
                        setInspectArtist(artist);
                        setActiveShotIndex(0);
                      }}
                      className="admin-btn bg-[#010030] hover:bg-[#1a1860] text-white font-semibold text-[11px] px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#F042FF]" />
                      <span>Inspect Overlay</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Quick Status Select Dropdown */}
                    <select
                      value={status}
                      onChange={(e) => handleQuickToggleStatus(artist, e.target.value)}
                      className="admin-ui bg-[#f4f2f8] text-[#010030] border border-[#e2dced] text-[10px] font-semibold px-2 py-1 rounded-xl cursor-pointer focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="archived">Archived</option>
                    </select>

                    <button
                      onClick={() => openEditModal(artist)}
                      className="admin-btn p-2 bg-[#f4f2f8] hover:bg-[#eae6f3] text-[#010030] rounded-xl transition-colors cursor-pointer border border-[#e2dced]"
                      title="Edit Campaign Deck"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#7226FF]" />
                    </button>
                    <button
                      onClick={() => handleDelete(artist.id)}
                      className="admin-btn p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CAMPAIGN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-lg text-[#010030] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7226FF]" />
                <span>{editingArtist ? "Edit Pose Campaign Deck" : "Create Pose Campaign"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Campaign Lifecycle & Scheduling Controls */}
              <div className="bg-[#f8f7fc] border border-[#e2dced] p-3.5 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-[#7226FF] uppercase tracking-wider block">
                  1. Lifecycle & Schedule Settings
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2.5 py-2 text-[#010030]"
                    >
                      <option value="active">Active (Live)</option>
                      <option value="scheduled">Scheduled (Pop-Up)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Launch Date</label>
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2 py-1.5 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">End Date</label>
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2 py-1.5 text-[#010030]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input 
                    type="checkbox"
                    id="isFeaturedCheck"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-[#7226FF] rounded border-[#e2dced] focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isFeaturedCheck" className="font-bold text-[#010030] cursor-pointer flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-[#7226FF] fill-[#7226FF]" />
                    <span>Feature this campaign on live studio header</span>
                  </label>
                </div>
              </div>

              {/* Artist Metadata & Agency Hierarchy */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7226FF] uppercase tracking-wider block">
                    2. Agency & Group Hierarchy & Profile
                  </span>
                  <span className="text-[10px] font-mono text-[#625b82] bg-[#f0ecf8] px-2 py-0.5 rounded-md font-semibold">
                    Database Linked
                  </span>
                </div>

                {/* Live Hierarchy Breadcrumb Preview */}
                <div className="bg-[#f0ecf8]/70 border border-[#e2dced] rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs text-[#010030] overflow-x-auto">
                  <span className="font-bold text-[#7226FF] uppercase text-[10px] shrink-0">Hierarchy:</span>
                  <span className="font-semibold px-2 py-0.5 bg-white border border-[#e2dced] rounded-md shrink-0">
                    {formData.agencyName || "Select Agency"}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7226FF] shrink-0" />
                  <span className="font-semibold px-2 py-0.5 bg-white border border-[#e2dced] rounded-md shrink-0 flex items-center gap-1">
                    <span>{formData.groupLogo || "✦"}</span>
                    <span>{formData.groupName || "Select Group"}</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#7226FF] shrink-0" />
                  <span className="font-bold px-2 py-0.5 bg-gradient-to-r from-[#7226FF]/10 to-[#F042FF]/10 border border-[#7226FF]/30 text-[#7226FF] rounded-md shrink-0">
                    {formData.name || "Artist Name"}
                  </span>
                </div>

                {/* Agency & Group Dropdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f8f7fc] p-3 rounded-2xl border border-[#e2dced]">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1 flex items-center justify-between">
                      <span>Agency (Database Selection)</span>
                      <Building2 className="w-3.5 h-3.5 text-[#7226FF]" />
                    </label>
                    <select
                      value={isCustomAgency ? "__new__" : formData.agencyId}
                      onChange={(e) => handleAgencySelect(e.target.value)}
                      className="admin-ui w-full bg-white border border-[#e2dced] focus:border-[#7226FF] rounded-xl px-2.5 py-2 text-[#010030] font-medium"
                    >
                      {availableAgencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name}
                        </option>
                      ))}
                      <option value="__new__">＋ Add New Custom Agency...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1 flex items-center justify-between">
                      <span>Group / Label (Database Selection)</span>
                      <Users className="w-3.5 h-3.5 text-[#7226FF]" />
                    </label>
                    <select
                      value={isCustomGroup ? "__new__" : formData.groupId}
                      onChange={(e) => handleGroupSelect(e.target.value)}
                      disabled={isCustomAgency}
                      className="admin-ui w-full bg-white border border-[#e2dced] focus:border-[#7226FF] rounded-xl px-2.5 py-2 text-[#010030] font-medium disabled:opacity-50"
                    >
                      {(availableGroupsByAgency[formData.agencyId] || []).map((grp) => (
                        <option key={grp.id} value={grp.id}>
                          {grp.logo || "✦"} {grp.name}
                        </option>
                      ))}
                      <option value="__new__">＋ Add New Custom Group...</option>
                    </select>
                  </div>
                </div>

                {/* Custom Agency / Group inputs when selected */}
                {(isCustomAgency || isCustomGroup) && (
                  <div className="bg-[#fff9fc] border border-[#F042FF]/30 p-3 rounded-2xl space-y-3">
                    <span className="text-[10px] font-bold text-[#F042FF] uppercase tracking-wider block">
                      Custom Hierarchy Details
                    </span>
                    
                    {isCustomAgency && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-[#010030] mb-1">New Agency Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. ADOR, BigHit, Custom Studio"
                            value={formData.agencyName}
                            onChange={(e) => {
                              const val = e.target.value;
                              const id = val.toLowerCase().replace(/[^a-z0-9]/g, "");
                              setFormData(prev => ({ ...prev, agencyName: val, agencyId: id }));
                            }}
                            className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#010030] mb-1">Agency Key / ID</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. ador"
                            value={formData.agencyId}
                            onChange={(e) => setFormData(prev => ({ ...prev, agencyId: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") }))}
                            className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {isCustomGroup && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block font-bold text-[#010030] mb-1">New Group / Label Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. NewJeans, TWS, Solos"
                            value={formData.groupName}
                            onChange={(e) => {
                              const val = e.target.value;
                              const id = val.toLowerCase().replace(/[^a-z0-9]/g, "");
                              setFormData(prev => ({ ...prev, groupName: val, groupId: id }));
                            }}
                            className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-[#010030] mb-1">Group Logo Icon</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 🐰, ✦, ✨"
                            value={formData.groupLogo}
                            onChange={(e) => setFormData(prev => ({ ...prev, groupLogo: e.target.value }))}
                            className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Preset Members Quick-Fill Pills (if available) */}
                {membersByGroup[formData.groupId] && membersByGroup[formData.groupId].length > 0 && (
                  <div className="bg-[#f8f7fc] p-2.5 rounded-xl border border-[#e2dced] space-y-1.5">
                    <span className="text-[10px] font-bold text-[#625b82] uppercase tracking-wider block">
                      Quick Auto-Fill Member from {formData.groupName}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {membersByGroup[formData.groupId].map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleQuickFillMember(member)}
                          className="admin-btn text-[11px] bg-white hover:bg-[#f0ecf8] hover:text-[#7226FF] border border-[#e2dced] rounded-lg px-2 py-1 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color || "#7226FF" }} />
                          <span className="font-semibold text-[#010030]">{member.name}</span>
                          <span className="text-[9px] text-[#625b82]">({member.role})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artist Name & Role inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Artist / Partner Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Wonyoung"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Role / Tagline</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Center & Visual"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>
                </div>

                {/* Gender Style Concept & Accent Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Group Styling Preset</label>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isMale: false }))}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          !formData.isMale 
                            ? "bg-[#7226FF] text-white border-[#7226FF]" 
                            : "bg-[#f8f7fc] text-[#625b82] border-[#e2dced]"
                        }`}
                      >
                        Girl Group / Idol
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isMale: true }))}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          formData.isMale 
                            ? "bg-[#7226FF] text-white border-[#7226FF]" 
                            : "bg-[#f8f7fc] text-[#625b82] border-[#e2dced]"
                        }`}
                      >
                        Boy Group / Idol
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Brand Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#e2dced]"
                      />
                      <input 
                        type="text" 
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="admin-ui flex-1 bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Photostrip Preview Image (Showcase Display) */}
              <div className="space-y-3 border-t border-[#f0ebf7] pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#7226FF] uppercase tracking-wider block">
                      3. Final Preview Image (Photostrip Showcase Composite)
                    </span>
                    <span className="text-[10px] text-[#625b82]">
                      This complete photostrip image will be displayed in the Photoshoot Showcase section.
                    </span>
                  </div>
                  <span className="bg-purple-50 text-[#7226FF] text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-purple-100">
                    SHOWCASE DISPLAY
                  </span>
                </div>

                <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-4">
                  {/* Preview Box */}
                  <div className="w-24 h-36 rounded-xl border-2 border-dashed border-[#e2dced] bg-white overflow-hidden shrink-0 flex items-center justify-center shadow-2xs relative group">
                    {formData.finalPreviewImage ? (
                      <img 
                        src={formData.finalPreviewImage} 
                        alt="Final Showcase Preview" 
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/photobooth-strip.png";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-[#625b82]">
                        <ImageIcon className="w-6 h-6 text-[#7226FF] mb-1 opacity-60" />
                        <span className="text-[9px] font-bold">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Input controls */}
                  <div className="flex-1 w-full space-y-2.5">
                    <div>
                      <label className="block text-xs font-bold text-[#010030] mb-1">
                        Upload Final Photostrip Composite
                      </label>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#e2dced] hover:border-[#7226FF] rounded-xl text-xs font-semibold text-[#010030] transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#7226FF]" />
                        <span>Choose Photostrip File...</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleFinalPreviewFileChange(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                      {formData.finalPreviewFile && (
                        <span className="text-[10px] text-emerald-600 font-semibold ml-2">
                          ✓ {formData.finalPreviewFile.name}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#010030] mb-1">
                        Or Image URL / Path
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder="/photobooth-strip.png or https://..."
                          value={formData.finalPreviewImage}
                          onChange={(e) => handleFinalPreviewUrlChange(e.target.value)}
                          className="admin-ui flex-1 bg-white border border-[#e2dced] rounded-xl px-3 py-1.5 text-xs text-[#010030] font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleFinalPreviewUrlChange("/photobooth-strip.png")}
                          className="admin-btn px-2.5 py-1.5 bg-[#f0ecf8] hover:bg-[#e4ddf4] text-[#7226FF] text-[10px] font-bold rounded-lg transition-colors shrink-0"
                          title="Reset to default photostrip"
                        >
                          Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Pose Deck Editor & Guidance Captions */}
              <div className="space-y-3 border-t border-[#f0ebf7] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7226FF] uppercase tracking-wider">
                    4. Pose Deck Builder & Guidance Captions
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#625b82] font-semibold">Deck Shots:</span>
                    <select
                      value={formData.deckSize}
                      onChange={(e) => handleDeckSizeChange(e.target.value)}
                      className="admin-ui bg-[#f4f2f8] border border-[#e2dced] rounded-lg px-2 py-0.5 font-bold text-[#010030]"
                    >
                      <option value="3">3 Shots</option>
                      <option value="4">4 Shots (Classic)</option>
                      <option value="5">5 Shots</option>
                      <option value="6">6 Shots (Postcard)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: formData.deckSize }).map((_, idx) => (
                    <div key={idx} className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-2 flex flex-col gap-2">
                      <label className="cursor-pointer block">
                        <div className="w-full h-24 border-2 border-dashed border-[#e2dced] hover:border-[#7226FF] rounded-xl flex flex-col items-center justify-center bg-white relative overflow-hidden text-center p-1">
                          {formData.posesPreview[idx] ? (
                            <img src={formData.posesPreview[idx]} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-[#7226FF] mb-1" />
                              <span className="text-[9px] font-bold text-[#625b82]">Upload P{idx + 1}</span>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handlePoseFileChange(idx, e.target.files[0])}
                          className="hidden"
                        />
                      </label>

                      <input 
                        type="text"
                        placeholder={`Guidance ${idx + 1}`}
                        value={formData.posesGuidance[idx] || ""}
                        onChange={(e) => handleGuidanceChange(idx, e.target.value)}
                        className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[10px] text-[#010030]"
                      />
                    </div>
                  ))}
                </div>
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
                  {submitting ? "Saving Deck..." : (editingArtist ? "Save Deck Changes" : "Publish Campaign")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 2C: LIVE CAMERA OVERLAY INSPECTOR MODAL */}
      {inspectArtist && (
        <div 
          className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setInspectArtist(null)}
        >
          <div 
            className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-xl w-full shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl bg-cover bg-center border border-[#e2dced]"
                  style={{ backgroundImage: `url(${inspectArtist.avatar})` }}
                />
                <div>
                  <h4 className="font-bold text-base text-[#010030]">
                    {inspectArtist.name} ({inspectArtist.groupName})
                  </h4>
                  <span className="text-xs text-[#625b82]">
                    Studio Camera Overlay Inspector • Shot {activeShotIndex + 1} of {inspectArtist.poses?.length || 4}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setInspectArtist(null)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Live Studio Camera Viewfinder */}
            <div className="relative w-full h-80 bg-slate-900 rounded-2xl border-2 border-[#010030] overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* Simulated Live User Webcam Stream (Abstract Studio Backdrop) */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 via-indigo-950 to-slate-900 flex items-center justify-center opacity-80">
                <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white/20" />
                </div>
              </div>

              {/* Viewfinder Grid Overlay */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* ARTIST POSE GUIDE OVERLAY LAYER */}
              {inspectArtist.poses && inspectArtist.poses[activeShotIndex] && (
                <img 
                  src={inspectArtist.poses[activeShotIndex]}
                  alt={`Pose Guidance Shot ${activeShotIndex + 1}`}
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-200"
                  style={{ opacity: overlayOpacity / 100 }}
                />
              )}

              {/* Camera Shutter Countdown Animation overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-[#010030]/60 backdrop-blur-2xs flex items-center justify-center z-20">
                  <span className="text-6xl font-black text-white font-mono animate-bounce drop-shadow-md">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Flash effect overlay */}
              {flashActive && (
                <div className="absolute inset-0 bg-white z-30 animate-ping" />
              )}

              {/* Live Guidance Banner HUD */}
              <div className="absolute top-3 left-3 right-3 bg-black/60 backdrop-blur-xs border border-white/20 rounded-xl p-2.5 flex items-center justify-between text-white text-xs z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-[11px] uppercase">
                    SHOT {activeShotIndex + 1}:
                  </span>
                  <span className="font-semibold text-pink-300">
                    "{inspectArtist.posesGuidance?.[activeShotIndex] || `Pose ${activeShotIndex + 1}`}"
                  </span>
                </div>

                <span className="text-[10px] font-mono opacity-70">
                  OPACITY: {overlayOpacity}%
                </span>
              </div>

              {/* Bottom Camera Controls Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                {/* Shot Stepper Pills */}
                <div className="flex gap-1 bg-black/60 backdrop-blur-xs p-1 rounded-xl border border-white/20">
                  {(inspectArtist.poses || []).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveShotIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        activeShotIndex === idx 
                          ? "bg-[#F042FF] text-white shadow-2xs" 
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      P{idx + 1}
                    </button>
                  ))}
                </div>

                {/* Shutter Test Trigger Button */}
                <button
                  onClick={triggerShutterTest}
                  disabled={countdown !== null}
                  className="bg-[#7226FF] hover:bg-[#5f1ee0] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Test Countdown</span>
                </button>
              </div>

            </div>

            {/* Interactive Opacity Slider & Controls */}
            <div className="bg-[#f8f7fc] border border-[#e2dced] p-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <Sliders className="w-4 h-4 text-[#7226FF]" />
                <span className="font-bold text-[#010030]">Overlay Opacity:</span>
                <input 
                  type="range"
                  min="10"
                  max="90"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(e.target.value)}
                  className="flex-1 accent-[#7226FF] cursor-pointer"
                />
                <span className="font-mono font-bold text-[#010030] w-8">{overlayOpacity}%</span>
              </div>

              <div className="text-[11px] text-[#625b82] italic">
                Simulates real photo booth webcam experience
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PosesManager;
