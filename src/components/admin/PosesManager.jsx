import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { normalizeMediaUrl } from "../../utils/blobClient";
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
  Users,
  Lock,
  Palette,
  Award,
  Globe,
  LayoutGrid
} from "lucide-react";

const PosesManager = () => {
  const [artists, setArtists] = useState([]);
  const [catalogFrames, setCatalogFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'scheduled', 'archived', 'featured', 'showcase'
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");

  // Modal State - Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom Agency / Group entry toggles in modal
  const [isCustomAgency, setIsCustomAgency] = useState(false);
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  // Modal State - Live Camera Overlay Inspector
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
    isFeaturedOnShowcase: true,
    showcaseBadge: "★ BIRTHDAY SPECIAL",
    showcaseTagline: "Celebrate with exclusive 4-pose idol deck & dedicated birthday collector frame",
    dedicatedFrameId: "custom-event-frame",
    dedicatedFrame: {
      id: "custom-event-frame",
      name: "IVE Wonyoung Official Birthday Frame",
      layout: "3-grid",
      bgColor: "#0e0048",
      bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
      borderColor: "#F042FF",
      watermarkText: "IVE WONYOUNG ✦ OFFICIAL BIRTHDAY EVENT",
      padding: 16,
      innerGap: 12,
      borderRadius: 8
    },
    finalPreviewFile: null,
    finalPreviewPreview: "",
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
      if (res.data) {
        if (res.data.artists) {
          const resolved = res.data.artists.map(a => ({
            ...a,
            avatar: normalizeMediaUrl(a.avatar),
            finalPreviewImage: normalizeMediaUrl(a.finalPreviewImage),
            poses: (a.poses || []).map(p => normalizeMediaUrl(p))
          }));
          setArtists(resolved);
        }
        if (res.data.frames) setCatalogFrames(res.data.frames);
      }
    } catch (err) {
      console.error("Error fetching artist campaigns:", err);
      setError("Failed to load artist campaigns. Please check server status.");
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
      isFeaturedOnShowcase: true,
      showcaseBadge: "★ OFFICIAL COLLAB",
      showcaseTagline: "Official idol collab deck & exclusive collector frame",
      dedicatedFrameId: "custom-event-frame",
      dedicatedFrame: {
        id: "custom-event-frame",
        name: "Official Idol Event Frame",
        layout: "3-grid",
        overlayUrl: "",
        watermarkText: "SNPSHOT ✦ OFFICIAL ARTIST EVENT"
      },
      frameOverlayFile: null,
      frameOverlayPreview: "",
      finalPreviewFile: null,
      finalPreviewPreview: "",
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

    const existingOverlay = normalizeMediaUrl(artist.dedicatedFrame?.overlayUrl || artist.frameOverlayUrl || "");

    const initialDedicatedFrame = artist.dedicatedFrame || {
      id: artist.dedicatedFrameId || "custom-event-frame",
      name: `${artist.name} Official Event Frame`,
      layout: "3-grid",
      overlayUrl: existingOverlay,
      watermarkText: `${(artist.groupName || "").toUpperCase()} ${artist.name.toUpperCase()} ✦ OFFICIAL EVENT`
    };

    const existingFinalPreview = normalizeMediaUrl(artist.finalPreviewImage || artist.avatar || existingPoses[0] || "");

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
      isFeaturedOnShowcase: artist.isFeaturedOnShowcase !== undefined ? Boolean(artist.isFeaturedOnShowcase) : true,
      showcaseBadge: artist.showcaseBadge || "★ OFFICIAL EVENT",
      showcaseTagline: artist.showcaseTagline || "Official idol collab deck & exclusive collector frame",
      dedicatedFrameId: artist.dedicatedFrameId || initialDedicatedFrame.id || "custom-event-frame",
      dedicatedFrame: {
        ...initialDedicatedFrame,
        overlayUrl: existingOverlay
      },
      frameOverlayFile: null,
      frameOverlayPreview: existingOverlay,
      finalPreviewFile: null,
      finalPreviewPreview: existingFinalPreview,
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
    const watermark = `${(formData.groupName || "").toUpperCase()} ${member.name.toUpperCase()} ✦ OFFICIAL EVENT`;
    setFormData(prev => ({
      ...prev,
      name: member.name,
      role: member.role || prev.role,
      color: member.color || prev.color,
      dedicatedFrame: {
        ...prev.dedicatedFrame,
        name: `${member.name} Dedicated Event Frame`,
        watermarkText: watermark
      }
    }));
  };

  const handleFrameOverlayFileChange = (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData(prev => ({
      ...prev,
      frameOverlayFile: file,
      frameOverlayPreview: previewUrl,
      dedicatedFrame: {
        ...prev.dedicatedFrame,
        overlayUrl: previewUrl
      }
    }));
  };

  const handleClearFrameOverlay = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      frameOverlayFile: null,
      frameOverlayPreview: "",
      dedicatedFrame: {
        ...prev.dedicatedFrame,
        overlayUrl: ""
      }
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
      finalPreviewPreview: previewUrl
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
      data.append("isFeaturedOnShowcase", formData.isFeaturedOnShowcase);
      data.append("showcaseBadge", formData.showcaseBadge);
      data.append("showcaseTagline", formData.showcaseTagline);
      data.append("dedicatedFrameId", formData.dedicatedFrameId);
      const dedicatedFramePayload = {
        ...(formData.dedicatedFrame || {}),
        overlayUrl: formData.frameOverlayPreview || (formData.dedicatedFrame && formData.dedicatedFrame.overlayUrl) || "",
        frameOverlayUrl: formData.frameOverlayPreview || (formData.dedicatedFrame && formData.dedicatedFrame.frameOverlayUrl) || ""
      };
      data.append("dedicatedFrame", JSON.stringify(dedicatedFramePayload));
      data.append("posesGuidance", JSON.stringify(formData.posesGuidance));

      // Append frame overlay image file if uploaded
      if (formData.frameOverlayFile) {
        data.append("frameOverlayImage", formData.frameOverlayFile);
        data.append("frameOverlayFile", formData.frameOverlayFile);
      } else if (formData.frameOverlayPreview) {
        data.append("frameOverlayUrl", formData.frameOverlayPreview);
      }

      // Append final preview image file if uploaded
      if (formData.finalPreviewFile) {
        data.append("finalPreviewImage", formData.finalPreviewFile);
      } else if (formData.finalPreviewPreview) {
        data.append("finalPreviewImageUrl", formData.finalPreviewPreview);
      }

      // Append pose files with both slot-specific and general keys
      formData.posesFiles.forEach((file, idx) => {
        if (file) {
          data.append(`pose_${idx}`, file);
          data.append("poses", file);
        }
      });

      // Pass existing pose URLs if editing without re-uploading all files
      const config = {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      };

      if (editingArtist) {
        data.append("existingPoses", JSON.stringify(formData.posesPreview));
        await axios.put(`/api/creator/artist/${encodeURIComponent(editingArtist.id)}`, data, config);
      } else {
        await axios.post("/api/creator/artist", data, config);
      }

      setIsModalOpen(false);
      await fetchStudioData();
    } catch (err) {
      console.error("Error saving artist campaign:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error saving artist campaign.";
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickToggleStatus = async (artist, newStatus) => {
    try {
      await axios.patch(`/api/creator/artist/${encodeURIComponent(artist.id)}/quick-toggle`, {
        status: newStatus
      });
      await fetchStudioData();
    } catch (err) {
      console.error("Error toggling campaign status:", err);
      alert(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleQuickToggleFeatured = async (artist) => {
    try {
      await axios.patch(`/api/creator/artist/${encodeURIComponent(artist.id)}/quick-toggle`, {
        isFeatured: !artist.isFeatured
      });
      await fetchStudioData();
    } catch (err) {
      console.error("Error toggling featured campaign:", err);
      alert(err.response?.data?.message || "Failed to toggle featured status.");
    }
  };

  const handleQuickToggleShowcase = async (artist) => {
    try {
      await axios.patch(`/api/creator/artist/${encodeURIComponent(artist.id)}/quick-toggle`, {
        isFeaturedOnShowcase: !artist.isFeaturedOnShowcase
      });
      await fetchStudioData();
    } catch (err) {
      console.error("Error toggling showcase campaign:", err);
      alert(err.response?.data?.message || "Failed to toggle showcase status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this artist campaign?")) return;
    try {
      await axios.delete(`/api/creator/artist/${encodeURIComponent(id)}`);
      await fetchStudioData();
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert(err.response?.data?.message || "Failed to delete artist campaign.");
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
      (artist.agencyName && artist.agencyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (artist.dedicatedFrame?.name && artist.dedicatedFrame.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = artist.status === "active" || !artist.status;
    else if (statusFilter === "scheduled") matchesStatus = artist.status === "scheduled";
    else if (statusFilter === "archived") matchesStatus = artist.status === "archived";
    else if (statusFilter === "featured") matchesStatus = Boolean(artist.isFeatured);
    else if (statusFilter === "showcase") matchesStatus = Boolean(artist.isFeaturedOnShowcase);

    const matchesAgency = agencyFilter === "all" || artist.agencyId === agencyFilter;
    const matchesGroup = groupFilter === "all" || artist.groupId === groupFilter;

    return matchesSearch && matchesStatus && matchesAgency && matchesGroup;
  });

  // Groups available for the currently selected agency in the filter bar
  const filterAvailableGroups = useMemo(() => {
    if (agencyFilter === "all") {
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
  const showcaseCount = artists.filter(a => a.isFeaturedOnShowcase).length;
  const totalShotsCount = artists.reduce((sum, a) => sum + (a.poses?.length || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              Featured Header
            </span>
            <div className="text-3xl font-black text-[#7226FF]">{featuredCount}</div>
            <span className="text-[10px] text-[#7226FF] font-medium">Header Pop-Up Drops</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center">
            <Star className="w-5 h-5 fill-[#7226FF]" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Showcase Active
            </span>
            <div className="text-3xl font-black text-[#F042FF]">{showcaseCount}</div>
            <span className="text-[10px] text-[#F042FF] font-medium">On Homepage Showcase</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#F042FF] flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Scheduled Drops
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
              Total Pose Shots
            </span>
            <div className="text-3xl font-black text-[#010030]">{totalShotsCount}</div>
            <span className="text-[10px] text-[#625b82] font-medium">Exclusive Guidance Decks</span>
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
              placeholder="Search artist campaign, idol group, agency, or dedicated frame..."
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
              <span className="text-[11px] font-bold text-[#625b82] uppercase px-1.5 shrink-0">Filter:</span>
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "showcase", label: "Showcase ✦" },
                { id: "featured", label: "Featured ★" },
                { id: "scheduled", label: "Scheduled" },
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
              <span>Add Artist Campaign</span>
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
          <span>Loading Artist Campaigns...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs">
          No artist campaigns found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredArtists.map((artist) => {
            const posesList = artist.poses || [];
            const guidanceList = artist.posesGuidance || [];
            const status = artist.status || "active";
            const dedicatedFrame = artist.dedicatedFrame;

            return (
              <div 
                key={artist.id}
                className="bg-white border border-[#e2dced] rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Top Status & Featured Banner Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                        HEADER DROP
                      </span>
                    )}

                    {artist.isFeaturedOnShowcase && (
                      <span className="bg-gradient-to-r from-[#010030] to-[#160078] text-[#FFE5F1] border border-[#7226FF]/40 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5 text-[#F042FF]" />
                        SHOWCASE
                      </span>
                    )}
                  </div>

                  {/* Quick Toggles */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickToggleShowcase(artist)}
                      className={`admin-btn p-1.5 rounded-xl border transition-colors cursor-pointer ${
                        artist.isFeaturedOnShowcase 
                          ? "bg-pink-50 text-[#F042FF] border-[#F042FF]/30" 
                          : "bg-[#f8f7fc] text-slate-400 border-[#e2dced] hover:text-[#F042FF]"
                      }`}
                      title={artist.isFeaturedOnShowcase ? "Remove from Homepage Showcase" : "Feature on Homepage Showcase"}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleQuickToggleFeatured(artist)}
                      className={`admin-btn p-1.5 rounded-xl border transition-colors cursor-pointer ${
                        artist.isFeatured 
                          ? "bg-purple-50 text-[#7226FF] border-[#7226FF]/30" 
                          : "bg-[#f8f7fc] text-slate-400 border-[#e2dced] hover:text-[#7226FF]"
                      }`}
                      title={artist.isFeatured ? "Unfeature from Header Drop" : "Feature on Header Drop"}
                    >
                      <Star className={`w-3.5 h-3.5 ${artist.isFeatured ? "fill-[#7226FF]" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Card Header Info */}
                <div className="flex items-start justify-between gap-3 mb-3">
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

                {/* DEDICATED EVENT FRAME OVERLAY & SHOWCASE STRIP PREVIEW */}
                <div className="bg-[#f0ecf8]/60 border border-[#e2dced] rounded-2xl p-3 mb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#7226FF]" />
                      <span className="text-[10px] font-bold text-[#010030] uppercase tracking-wider">
                        Dedicated Frame Overlay & Showcase Strip
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(artist.frameOverlayUrl || dedicatedFrame?.overlayUrl) && (
                        <span className="text-[8px] font-mono font-bold bg-purple-100 text-[#7226FF] px-1.5 py-0.5 rounded uppercase">
                          PNG Overlay
                        </span>
                      )}
                      <span className="text-[9px] font-mono font-bold bg-white text-[#7226FF] border border-[#7226FF]/20 px-2 py-0.5 rounded-md uppercase">
                        {dedicatedFrame?.layout || "3-grid"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#e2dced]">
                    {artist.finalPreviewImage ? (
                      <div 
                        className="w-9 h-12 rounded-lg shrink-0 border border-[#e2dced] bg-contain bg-center bg-no-repeat bg-[#0e0048] shadow-xs"
                        style={{ backgroundImage: `url(${normalizeMediaUrl(artist.finalPreviewImage)})` }}
                        title="Final Photostrip Preview Render"
                      />
                    ) : (artist.frameOverlayUrl || dedicatedFrame?.overlayUrl) ? (
                      <div 
                        className="w-9 h-12 rounded-lg shrink-0 border border-[#e2dced] bg-contain bg-center bg-no-repeat shadow-xs"
                        style={{ backgroundImage: `url(${normalizeMediaUrl(artist.frameOverlayUrl || dedicatedFrame?.overlayUrl)})` }}
                        title="Dedicated Frame Overlay PNG"
                      />
                    ) : (
                      <div 
                        className="w-8 h-10 rounded-lg shrink-0 border border-dashed border-[#7226FF]/40 flex flex-col items-center justify-center p-1 bg-purple-50/50"
                      >
                        <Layers className="w-4 h-4 text-[#7226FF]/60" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-[#010030] truncate">
                        {dedicatedFrame?.name || `${artist.name} Dedicated Frame`}
                      </h5>
                      <p className="text-[10px] text-[#625b82] font-mono truncate">
                        {dedicatedFrame?.watermarkText || `${artist.groupName} ${artist.name} ✦ OFFICIAL EVENT`}
                      </p>
                      {(artist.frameOverlayUrl || dedicatedFrame?.overlayUrl) ? (
                        <span className="text-[9px] font-mono text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> Frame Overlay PNG Ready
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-amber-600 font-medium flex items-center gap-0.5 mt-0.5">
                          <Clock className="w-2.5 h-2.5" /> Clean Viewfinder Frame
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pose Deck Guidance Grid */}
                <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#625b82] uppercase">
                      Pose Deck ({posesList.length} Shots)
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
                      title="Edit Artist Campaign Deck"
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
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-lg text-[#010030] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7226FF]" />
                <span>{editingArtist ? "Edit Artist Campaign Deck" : "Create Artist Campaign"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* 1. Campaign Lifecycle & Scheduling Controls */}
              <div className="bg-[#f8f7fc] border border-[#e2dced] p-3.5 rounded-2xl space-y-3">
                <span className="text-[11px] font-bold text-[#7226FF] uppercase tracking-wider block">
                  1. Lifecycle & Drop Scheduling
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-2.5 py-2 text-[#010030]"
                    >
                      <option value="active">Active (Live in Studio)</option>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 font-bold text-[#010030] cursor-pointer bg-white p-2.5 rounded-xl border border-[#e2dced]">
                    <input 
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-[#7226FF] rounded border-[#e2dced] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#7226FF] fill-[#7226FF]" />
                      <span>Feature in Live Header Banner</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 font-bold text-[#010030] cursor-pointer bg-white p-2.5 rounded-xl border border-[#e2dced]">
                    <input 
                      type="checkbox"
                      checked={formData.isFeaturedOnShowcase}
                      onChange={(e) => setFormData({ ...formData, isFeaturedOnShowcase: e.target.checked })}
                      className="w-4 h-4 text-[#F042FF] rounded border-[#e2dced] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#F042FF]" />
                      <span>Sync to Homepage Photoshoot Showcase</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* 2. Artist Metadata & Agency Hierarchy */}
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          name: val,
                          dedicatedFrame: {
                            ...prev.dedicatedFrame,
                            watermarkText: `${(prev.groupName || "").toUpperCase()} ${val.toUpperCase()} ✦ OFFICIAL EVENT`
                          }
                        }));
                      }}
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
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            color: val,
                            dedicatedFrame: {
                              ...prev.dedicatedFrame,
                              borderColor: val
                            }
                          }));
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-[#e2dced]"
                      />
                      <input 
                        type="text" 
                        value={formData.color}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            color: val,
                            dedicatedFrame: {
                              ...prev.dedicatedFrame,
                              borderColor: val
                            }
                          }));
                        }}
                        className="admin-ui flex-1 bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. DEDICATED FRAME OVERLAY PNG (EXCLUSIVE SNPSHOT COLLAB) */}
              <div className="bg-purple-50/80 border-2 border-[#7226FF]/50 rounded-2xl p-4 space-y-3 shadow-xs">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7226FF] animate-pulse" />
                      <span className="font-bold text-xs sm:text-sm text-[#010030] uppercase tracking-wide">
                        ✦ Dedicated Frame Overlay PNG (Transparent Cutouts)
                      </span>
                    </div>
                    <span className="text-[11px] text-[#4d2892] block">
                      Upload the exclusive high-resolution frame PNG with transparent photo cutouts. In SNPSHOT Collab mode, this graphic is automatically composited over the user's shots.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] font-mono font-bold bg-[#7226FF] text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                      Folder: /frames/
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white text-[#7226FF] border border-purple-300 px-2 py-0.5 rounded uppercase">
                      PNG Transparency
                    </span>
                    <span className="text-[10px] bg-purple-100 text-[#7226FF] px-2 py-0.5 rounded-full font-bold">
                      Auto-Locked
                    </span>
                  </div>
                </div>

                {/* Visual Preview / Upload Card */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/90 p-3 rounded-xl border border-purple-200">
                  {/* Visual Preview / Upload Box with transparency checkerboard */}
                  <label className="cursor-pointer shrink-0 block group">
                    <div 
                      className="w-28 h-40 border-2 border-dashed border-[#7226FF]/60 hover:border-[#7226FF] rounded-xl flex flex-col items-center justify-center relative overflow-hidden text-center p-1.5 transition-all shadow-xs group-hover:shadow-md"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, #f0f0f4 25%, transparent 25%), 
                          linear-gradient(-45deg, #f0f0f4 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #f0f0f4 75%), 
                          linear-gradient(-45deg, transparent 75%, #f0f0f4 75%)
                        `,
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                        backgroundColor: "#ffffff"
                      }}
                    >
                      {formData.frameOverlayPreview ? (
                        <div className="w-full h-full relative group/img">
                          <img 
                            src={formData.frameOverlayPreview} 
                            alt="Dedicated Frame Overlay" 
                            className="w-full h-full object-contain rounded-lg drop-shadow-xs"
                          />
                          <div className="absolute inset-0 bg-[#010030]/80 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1 backdrop-blur-[1px]">
                            <Upload className="w-5 h-5 text-purple-300" />
                            <span className="text-[9px] font-bold uppercase tracking-wider">Replace PNG</span>
                            <span className="text-[7px] text-purple-200">to /frames/</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center mb-1 text-[#7226FF]">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold text-[#010030] leading-tight">Upload Frame PNG</span>
                          <span className="text-[8px] text-[#7226FF] font-mono mt-0.5">Transparent PNG</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept="image/png"
                      onChange={(e) => handleFrameOverlayFileChange(e.target.files[0])}
                      className="hidden"
                    />
                  </label>

                  {/* Format controls & Specs */}
                  <div className="space-y-2 text-xs text-[#010030] flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#010030] mb-1">
                          Locked Layout Format
                        </label>
                        <select
                          value={formData.dedicatedFrame?.layout || "3-grid"}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            dedicatedFrame: { ...prev.dedicatedFrame, layout: e.target.value }
                          }))}
                          className="admin-ui bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-xs text-[#010030] font-medium"
                        >
                          <option value="3-grid">3-Grid Vertical Photostrip (1:3)</option>
                          <option value="4-grid">Classic 4-Cut Vertical Strip (1:4)</option>
                          <option value="2x2">2x2 Square Grid (1:1)</option>
                          <option value="2x3">2x3 Postcard Grid (2:3)</option>
                        </select>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[10px] text-[#7226FF] font-mono font-bold bg-purple-100 px-2 py-0.5 rounded inline-block">
                          {formData.dedicatedFrame?.layout === "3-grid" ? "Recommended: 1200 × 3600 px (300 DPI)" : 
                           formData.dedicatedFrame?.layout === "4-grid" ? "Recommended: 1200 × 4800 px (300 DPI)" : 
                           formData.dedicatedFrame?.layout === "2x2" ? "Recommended: 2400 × 2400 px (300 DPI)" : 
                           "Recommended: 2400 × 3600 px (300 DPI)"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#4d2892] leading-relaxed">
                      The <strong>SNPSHOT Studio</strong> engine will automatically lock the user's photostrip to this custom PNG. User portraits will sit behind the transparent cutouts, preserving all idol signatures, agency branding, and decorative elements.
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      {formData.frameOverlayPreview ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            Frame Overlay PNG Ready
                          </span>
                          <button
                            type="button"
                            onClick={handleClearFrameOverlay}
                            className="text-[10px] text-red-600 hover:text-red-700 hover:underline font-mono"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Awaiting PNG Upload (Defaults to clean border)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Watermark and Showcase Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Official Frame Watermark Text</label>
                    <input 
                      type="text" 
                      placeholder="e.g. IVE WONYOUNG ✦ OFFICIAL BIRTHDAY EVENT"
                      value={formData.dedicatedFrame?.watermarkText || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dedicatedFrame: { ...prev.dedicatedFrame, watermarkText: e.target.value }
                      }))}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Showcase Badge Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. ★ BIRTHDAY SPECIAL, ✦ Y2K DROP"
                      value={formData.showcaseBadge || ""}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        showcaseBadge: e.target.value
                      }))}
                      className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>
                </div>

                {/* Showcase Tagline */}
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Homepage Showcase Description Tagline</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Celebrate with exclusive 4-pose idol deck & dedicated birthday collector frame"
                    value={formData.showcaseTagline || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      showcaseTagline: e.target.value
                    }))}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  />
                </div>
              </div>

                {/* Live Frame Preview Box & Final Showcase Preview Image Uploader (GREEN AREA - SHOWCASE STORAGE) */}
                <div className="bg-emerald-50/70 border-2 border-emerald-500/50 rounded-2xl p-4 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-xs sm:text-sm text-[#010030] uppercase tracking-wide">
                          ✦ Frame & Showcase Strip Preview (Composite Photostrip)
                        </span>
                      </div>
                      <span className="text-[11px] text-[#2d5a43] block">
                        Upload the completed aesthetic photostrip layout render (e.g. 3-grid vertical strip) showcased on the homepage and photobooth preview cards.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                        Folder: /showcase/
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded uppercase">
                        {formData.dedicatedFrame?.layout || "3-grid"} Format
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/90 p-3 rounded-xl border border-emerald-200">
                    {/* Visual Preview / Upload Box */}
                    <label className="cursor-pointer shrink-0 block group">
                      <div className="w-28 h-40 border-2 border-dashed border-emerald-500/60 hover:border-emerald-600 rounded-xl flex flex-col items-center justify-center bg-emerald-50/30 relative overflow-hidden text-center p-1.5 transition-all shadow-xs group-hover:shadow-md">
                        {formData.finalPreviewPreview ? (
                          <div className="w-full h-full relative group/img">
                            <img 
                              src={formData.finalPreviewPreview} 
                              alt="Final Photostrip Preview" 
                              className="w-full h-full object-contain rounded-lg"
                            />
                            <div className="absolute inset-0 bg-[#010030]/75 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1 backdrop-blur-[1px]">
                              <Upload className="w-5 h-5 text-emerald-400" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Replace Strip</span>
                              <span className="text-[7px] text-emerald-200">to /showcase/</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-2 text-center">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center mb-1 text-emerald-700">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-[#010030] leading-tight">Upload Final Strip</span>
                            <span className="text-[8px] text-emerald-700 font-mono mt-0.5">PNG / JPG (300 DPI)</span>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFinalPreviewFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>

                    {/* Metadata & Layout Guidance note */}
                    <div className="space-y-1.5 text-xs text-[#010030] flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Matched Photostrip Ratio</span>
                        </span>
                        <span className="text-[10px] text-emerald-800 font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                          {formData.dedicatedFrame?.layout === "3-grid" ? "Vertical 3-Strip (1:3)" : formData.dedicatedFrame?.layout === "4-grid" ? "Classic 4-Strip (1:4)" : formData.dedicatedFrame?.layout === "2x2" ? "Square Grid (1:1)" : "Postcard (2:3)"}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#2d5a43] leading-relaxed">
                        This high-resolution composite preview is displayed in the <strong>PHOTOSHOOT SHOWCASE</strong>, <strong>COMMUNITY GALLERY</strong>, and the <strong>IDOL SELECTION CAROUSEL</strong>, preserving your exact frame colors, badges, and layout branding.
                      </p>
                      {formData.finalPreviewPreview ? (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                            Showcase Preview Strip Ready
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Awaiting upload (defaults to avatar)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Dynamic Pose Deck Editor & Guidance Captions (BLUE AREA - POSES STORAGE) */}
              <div className="bg-sky-50/70 border-2 border-sky-500/50 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-200/80 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                      <span className="font-bold text-xs sm:text-sm text-[#010030] uppercase tracking-wide">
                        ✦ Sample Ghost Pose Guides (Camera Overlays)
                      </span>
                    </div>
                    <span className="text-[11px] text-[#214f6b] block">
                      Individual cutout shots loaded into the live photobooth camera as translucent alignment guides for users.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[10px] font-mono font-bold bg-sky-600 text-white px-2 py-0.5 rounded uppercase tracking-wider shadow-2xs">
                      Folder: /poses/
                    </span>
                    <div className="flex items-center gap-1 bg-white border border-sky-300 rounded-lg px-2 py-0.5">
                      <span className="text-[10px] text-sky-900 font-semibold">Shots:</span>
                      <select
                        value={formData.deckSize}
                        onChange={(e) => handleDeckSizeChange(e.target.value)}
                        className="admin-ui bg-transparent border-none font-bold text-[#010030] text-xs p-0 cursor-pointer"
                      >
                        <option value="3">3 Shots</option>
                        <option value="4">4 Shots (Classic)</option>
                        <option value="5">5 Shots</option>
                        <option value="6">6 Shots (Postcard)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: formData.deckSize }).map((_, idx) => (
                    <div key={idx} className="bg-white/90 border border-sky-200 hover:border-sky-400 rounded-xl p-2 flex flex-col gap-2 shadow-2xs transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] font-bold text-sky-800 bg-sky-100 px-1.5 py-0.5 rounded">
                          POSE #{idx + 1}
                        </span>
                        {formData.posesPreview[idx] ? (
                          <span className="text-[8px] font-mono text-emerald-600 font-bold">READY</span>
                        ) : (
                          <span className="text-[8px] font-mono text-zinc-400">EMPTY</span>
                        )}
                      </div>

                      <label className="cursor-pointer block group/pose">
                        <div className="w-full h-24 border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-lg flex flex-col items-center justify-center bg-sky-50/30 relative overflow-hidden text-center p-1 transition-all">
                          {formData.posesPreview[idx] ? (
                            <div className="w-full h-full relative">
                              <img src={formData.posesPreview[idx]} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover rounded" />
                              <div className="absolute inset-0 bg-[#010030]/70 opacity-0 group-hover/pose:opacity-100 transition-opacity flex flex-col items-center justify-center gap-0.5 text-white p-1">
                                <Upload className="w-3.5 h-3.5 text-sky-300" />
                                <span className="text-[8px] font-bold uppercase">Replace</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-sky-600 mb-1" />
                              <span className="text-[9px] font-bold text-sky-800">Upload P{idx + 1}</span>
                              <span className="text-[7px] text-sky-600 font-mono">PNG Overlay</span>
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
                        placeholder={`Guidance cue ${idx + 1} (e.g. Heart Cheek)`}
                        value={formData.posesGuidance[idx] || ""}
                        onChange={(e) => handleGuidanceChange(idx, e.target.value)}
                        className="admin-ui w-full bg-[#f8fbfe] border border-sky-200 rounded-lg px-2 py-1 text-[10px] text-[#010030]"
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
                  {submitting ? "Saving Deck..." : (editingArtist ? "Save Campaign Changes" : "Publish Artist Campaign")}
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
              
              {/* Simulated Live User Webcam Stream */}
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
