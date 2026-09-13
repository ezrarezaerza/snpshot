import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Sparkles, 
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
  Pin,
  Tag,
  Palette,
  Layout,
  Maximize2,
  Smartphone,
  Monitor,
  Tablet,
  Check,
  Star,
  Zap,
  Layers,
  ArrowRight,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  CheckSquare,
  Square,
  Globe,
  SlidersHorizontal,
  FolderCheck,
  Copy,
  ExternalLink
} from "lucide-react";

// Pre-built Seasonal Theme Presets with complete attributes (Phase 4A)
const DEFAULT_SEASONAL_THEMES = [
  {
    id: "snpshot-hero-default",
    name: "SNPSHOT Studio Default (Official)",
    accentColor: "#F042FF",
    heroBg: "linear-gradient(135deg, #010030 0%, #0e0048 50%, #2e109d 100%)",
    headline: "DIGITAL PHOTO BOOTH",
    subheadline: "Capture studio-quality photo strips directly from your browser. Personalize your prints with flexible frame layouts, curated event themes, digital stamps, and high-resolution exports.",
    eyebrowBadge: "✦ DIGITAL SELF-PHOTO STUDIO ✦",
    ctaText: "START BOOTH",
    ctaLink: "/setup",
    doodleHeaderTag: "#PHOTOBOOTH",
    card1Handle: "@wonyoung",
    card1Subhandle: "★ IDOL EDITION",
    card1Tag: "KPOP_01",
    card3Title: "SNPSHOT STUDIO",
    card3Subtitle: "Official Partner",
    card3Stat: "98.4K DOWNLOADS",
    card3Theme: "THEME: PURPLE_NEON ★ PRESET",
    card3Prints: "✦ 15 STRIPS",
    circularBadgeText: "★ DIGITAL PHOTO STUDIO ★ K-POP FRAMES ★ DIGITAL DOWNLOADS ★ PREMIUM PRINTS ★",
    statusText: "ONLINE STUDIO ACTIVE",
    photosCountText: "244,195 PHOTOS TAKEN",
    card1Photo1: "/img/poses/Wonyoung1.png",
    card1Photo2: "/img/poses/Wonyoung2.png",
    card3Photo: "/img/poses/Wonyoung3.png",
    desc: "Signature SNPSHOT Studio deep indigo canvas with electric magenta accents & K-Pop Idol aesthetic."
  },
  {
    id: "y2k-neon",
    name: "Y2K Cyber Pink & Indigo",
    accentColor: "#F042FF",
    heroBg: "linear-gradient(135deg, #010030 0%, #0e0048 50%, #2e109d 100%)",
    headline: "Y2K CYBER PHOTO BOOTH",
    subheadline: "Flash back to 2000s cyber aesthetics. Create glowing photostrips with neon chrome overlays, retro sticker stamps, and high-definition exports.",
    eyebrowBadge: "★ Y2K CYBER EDITION ★",
    ctaText: "ENTER Y2K STUDIO",
    ctaLink: "/setup",
    doodleHeaderTag: "#Y2K_NEON",
    card1Handle: "@cyber_babe",
    card1Subhandle: "⚡ CYBER POP",
    card1Tag: "NEON_99",
    card3Title: "CYBER STUDIO",
    card3Subtitle: "Limited Y2K Drop",
    card3Stat: "124.2K DOWNLOADS",
    card3Theme: "THEME: CYBER_GLOW ★ PRESET",
    card3Prints: "✦ 42 STRIPS",
    circularBadgeText: "★ Y2K NEON STUDIO ★ CYBER GLOW FRAMES ★ RETRO STICKERS ★ HIGH-RES EXPORTS ★",
    statusText: "CYBER NODE ONLINE",
    photosCountText: "512,890 PHOTOS TAKEN",
    card1Photo1: "/img/poses/Wonyoung2.png",
    card1Photo2: "/img/poses/Wonyoung1.png",
    card3Photo: "/img/poses/Wonyoung3.png",
    desc: "Deep indigo canvas with electric magenta highlights & cyber glow badges."
  },
  {
    id: "studio-midnight",
    name: "Studio Midnight & Amber",
    accentColor: "#F59E0B",
    heroBg: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
    headline: "MIDNIGHT FILM STUDIO",
    subheadline: "Experience luxury dark room aesthetics with warm amber grain filters, analog watermarks, and high-contrast monochrome frames.",
    eyebrowBadge: "✦ MIDNIGHT EXCLUSIVE ✦",
    ctaText: "SHOOT IN MIDNIGHT",
    ctaLink: "/setup",
    doodleHeaderTag: "#MIDNIGHT_FILM",
    card1Handle: "@noir_film",
    card1Subhandle: "🎞️ VINTAGE GRAIN",
    card1Tag: "FILM_35MM",
    card3Title: "NOIR STUDIO",
    card3Subtitle: "Analog Film Club",
    card3Stat: "88.9K DOWNLOADS",
    card3Theme: "THEME: AMBER_GRAIN ★ PRESET",
    card3Prints: "✦ 28 STRIPS",
    circularBadgeText: "★ MIDNIGHT FILM STUDIO ★ ANALOG GRAIN ★ RETRO WATERMARKS ★ VINTAGE PRINTS ★",
    statusText: "DARKROOM ACTIVE",
    photosCountText: "189,430 PHOTOS TAKEN",
    card1Photo1: "/img/poses/Wonyoung3.png",
    card1Photo2: "/img/poses/Wonyoung1.png",
    card3Photo: "/img/poses/Wonyoung2.png",
    desc: "Sleek dark obsidian backdrop with warm amber accents & luxury studio aesthetic."
  },
  {
    id: "pastel-bloom",
    name: "Pastel Bloom & Violet",
    accentColor: "#FF00FF",
    heroBg: "linear-gradient(135deg, #18001e 0%, #2e083c 50%, #4a105c 100%)",
    headline: "PASTEL BLOOM STUDIO",
    subheadline: "Soft flower power aesthetics paired with delicate pastel gradients, floral doodle stamps, and romantic event overlays.",
    eyebrowBadge: "🌸 PASTEL BLOOM EDITION 🌸",
    ctaText: "CREATE BLOOM PRINT",
    ctaLink: "/setup",
    doodleHeaderTag: "#PASTEL_BLOOM",
    card1Handle: "@flower_child",
    card1Subhandle: "🌸 BLOOM SPECIAL",
    card1Tag: "PASTEL_04",
    card3Title: "BLOOM STUDIO",
    card3Subtitle: "Spring Collection",
    card3Stat: "156.0K DOWNLOADS",
    card3Theme: "THEME: SOFT_VIOLET ★ PRESET",
    card3Prints: "✦ 35 STRIPS",
    circularBadgeText: "★ PASTEL BLOOM STUDIO ★ FLORAL FRAMES ★ DOODLE STAMPS ★ SPRING PRINTS ★",
    statusText: "GARDEN STUDIO OPEN",
    photosCountText: "310,780 PHOTOS TAKEN",
    card1Photo1: "/img/poses/Wonyoung1.png",
    card1Photo2: "/img/poses/Wonyoung3.png",
    card3Photo: "/img/poses/Wonyoung2.png",
    desc: "Soft flower power dark violet gradients with pastel accents & delicate doodle stamps."
  },
  {
    id: "retro-monochrome",
    name: "Retro Monochrome Film",
    accentColor: "#10B981",
    heroBg: "linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #262626 100%)",
    headline: "MONOCHROME FILM LAB",
    subheadline: "High-contrast black & white photostrips infused with electric emerald highlights and timeless timestamp watermarks.",
    eyebrowBadge: "✦ MONOCHROME HIGH CONTRAST ✦",
    ctaText: "START B&W SHOOT",
    ctaLink: "/setup",
    doodleHeaderTag: "#MONOCHROME_LAB",
    card1Handle: "@retro_mono",
    card1Subhandle: "⚫ HIGH CONTRAST",
    card1Tag: "BW_RETRO",
    card3Title: "MONO STUDIO",
    card3Subtitle: "Pro Black & White",
    card3Stat: "72.4K DOWNLOADS",
    card3Theme: "THEME: EMERALD_MONO ★ PRESET",
    card3Prints: "✦ 19 STRIPS",
    circularBadgeText: "★ MONOCHROME FILM LAB ★ HIGH CONTRAST B&W ★ ELECTRIC EMERALD ★ TIMELOCK PRINTS ★",
    statusText: "MONO LAB ACTIVE",
    photosCountText: "145,910 PHOTOS TAKEN",
    card1Photo1: "/img/poses/Wonyoung2.png",
    card1Photo2: "/img/poses/Wonyoung3.png",
    card3Photo: "/img/poses/Wonyoung1.png",
    desc: "Pitch black high-contrast monochrome style with electric green highlights."
  }
];

const BADGE_OPTIONS = [
  { id: "STAFF PICK", label: "STAFF PICK" },
  { id: "POPULAR", label: "POPULAR" },
  { id: "NEW SEASON", label: "NEW SEASON" },
  { id: "K-POP COLLAB", label: "K-POP COLLAB" },
  { id: "FEATURED", label: "FEATURED" }
];

const ShowcaseManager = ({ onSelectTab }) => {
  // Phase 4A: Hero Banner Config State
  const [heroConfig, setHeroConfig] = useState({
    activeThemePreset: "snpshot-hero-default",
    headline: "DIGITAL PHOTO BOOTH",
    subheadline: "Capture studio-quality photo strips directly from your browser. Personalize your prints with flexible frame layouts, curated event themes, digital stamps, and high-resolution exports.",
    eyebrowBadge: "✦ DIGITAL SELF-PHOTO STUDIO ✦",
    ctaText: "START BOOTH",
    ctaLink: "/setup",
    accentColor: "#F042FF",
    heroBg: "linear-gradient(135deg, #010030 0%, #0e0048 50%, #2e109d 100%)",
    doodleHeaderTag: "#PHOTOBOOTH",
    card1Handle: "@wonyoung",
    card1Subhandle: "★ IDOL EDITION",
    card1Tag: "KPOP_01",
    card3Title: "SNPSHOT STUDIO",
    card3Subtitle: "Official Partner",
    card3Stat: "98.4K DOWNLOADS",
    card3Theme: "THEME: PURPLE_NEON ★ PRESET",
    card3Prints: "✦ 15 STRIPS",
    circularBadgeText: "★ DIGITAL PHOTO STUDIO ★ K-POP FRAMES ★ DIGITAL DOWNLOADS ★ PREMIUM PRINTS ★",
    statusText: "ONLINE STUDIO ACTIVE",
    photosCountText: "244,195 PHOTOS TAKEN",
    card1Photo1: "/img/poses/Wonyoung1.png",
    card1Photo2: "/img/poses/Wonyoung2.png",
    card3Photo: "/img/poses/Wonyoung3.png"
  });

  const [themePresets, setThemePresets] = useState(DEFAULT_SEASONAL_THEMES);
  const [savingHero, setSavingHero] = useState(false);
  const [heroSuccessMsg, setHeroSuccessMsg] = useState("");

  const fetchThemePresets = async () => {
    try {
      const res = await axios.get("/api/creator/theme-presets");
      if (res.data && res.data.presets && res.data.presets.length > 0) {
        setThemePresets(res.data.presets);
      } else {
        setThemePresets(DEFAULT_SEASONAL_THEMES);
      }
    } catch (err) {
      console.warn("Using fallback theme presets:", err);
      setThemePresets(DEFAULT_SEASONAL_THEMES);
    }
  };

  // Phase 4B: Gallery Submissions & Moderation Queue State
  const [galleryItems, setGalleryItems] = useState([]);
  const [showcaseThemes, setShowcaseThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [originFilter, setOriginFilter] = useState("all"); // 'all', 'editorial', 'community'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'approved', 'pending', 'flagged'
  const [layoutFilter, setLayoutFilter] = useState("all");

  // Selection & Bulk Moderation
  const [selectedIds, setSelectedIds] = useState([]);

  // Single Item Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Phase 4C: Live Homepage Simulator Bench Modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorDevice, setSimulatorDevice] = useState("desktop"); // 'desktop' (1280px), 'tablet' (768px), 'mobile' (375px)

  // Single Form State for Gallery Item
  const [formData, setFormData] = useState({
    caption: "",
    creator: "@snpshot_user",
    layout: "4-grid",
    color: "#F042FF",
    status: "approved",
    badge: "STAFF PICK",
    isPinned: false,
    likes: 24,
    file: null,
    previewSrc: ""
  });

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/studio/data");
      if (res.data) {
        if (res.data.galleryItems) setGalleryItems(res.data.galleryItems);
        if (res.data.showcaseThemes) setShowcaseThemes(res.data.showcaseThemes);
        if (res.data.heroConfig) setHeroConfig(res.data.heroConfig);
      }
      await fetchThemePresets();
    } catch (err) {
      console.error("Error loading showcase data:", err);
      setError("Failed to load showcase and gallery data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- PHASE 4A: HERO BANNER & THEME HANDLERS ---
  const handleApplyPreset = (preset) => {
    setHeroConfig({
      ...preset,
      activeThemePreset: preset.id
    });
  };

  const handleDeletePreset = async (presetId) => {
    if (!window.confirm("Are you sure you want to delete this theme preset?")) return;
    try {
      await axios.delete(`/api/creator/theme-presets/${presetId}`);
      setThemePresets(prev => prev.filter(p => p.id !== presetId));
    } catch (err) {
      console.error("Error deleting theme preset:", err);
      setThemePresets(prev => prev.filter(p => p.id !== presetId));
    }
  };

  const handleSaveAsNewPreset = async () => {
    const presetName = window.prompt("Enter a name for your new Theme Preset:", "Custom Campaign Theme");
    if (!presetName) return;

    const newPreset = {
      ...heroConfig,
      id: `custom-preset-${Date.now()}`,
      name: presetName,
      desc: `Custom user theme saved on ${new Date().toLocaleDateString()}`
    };

    try {
      const res = await axios.post("/api/creator/theme-presets", newPreset);
      if (res.data && res.data.presets) {
        setThemePresets(res.data.presets);
      } else {
        setThemePresets(prev => [...prev, newPreset]);
      }
      alert(`Saved "${presetName}" preset successfully!`);
    } catch (err) {
      console.error("Error saving preset:", err);
      setThemePresets(prev => [...prev, newPreset]);
    }
  };

  const handleHeroPhotoUpload = async (e, photoKey) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("photo", file);

    try {
      const res = await axios.post("/api/creator/upload-hero-photo", data);
      if (res.data && res.data.url) {
        setHeroConfig(prev => ({
          ...prev,
          [photoKey]: res.data.url
        }));
      }
    } catch (err) {
      console.error("Error uploading hero photo:", err);
      alert("Failed to upload photo.");
    }
  };

  const handleSaveHeroConfig = async (e) => {
    if (e) e.preventDefault();
    setSavingHero(true);
    setHeroSuccessMsg("");
    try {
      await axios.put("/api/creator/hero-config", heroConfig);
      setHeroSuccessMsg("Homepage hero banner & seasonal theme published!");
      setTimeout(() => setHeroSuccessMsg(""), 3500);
      fetchAllData();
    } catch (err) {
      console.error("Error saving hero config:", err);
      alert("Failed to save hero configuration.");
    } finally {
      setSavingHero(false);
    }
  };

  // --- PHASE 4B: MODERATION & GALLERY HANDLERS ---
  const handleQuickStatusChange = async (id, status) => {
    try {
      await axios.patch(`/api/creator/gallery/${id}/moderation`, { status });
      fetchAllData();
    } catch (err) {
      console.error("Error updating item status:", err);
    }
  };

  const handleTogglePinned = async (item) => {
    try {
      await axios.patch(`/api/creator/gallery/${item.id}/moderation`, { 
        isPinned: !item.isPinned 
      });
      fetchAllData();
    } catch (err) {
      console.error("Error toggling pinned status:", err);
    }
  };

  const handleUpdateBadge = async (id, badge) => {
    try {
      await axios.patch(`/api/creator/gallery/${id}/moderation`, { badge });
      fetchAllData();
    } catch (err) {
      console.error("Error updating item badge:", err);
    }
  };

  // Bulk Actions
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
      ? `Are you sure you want to delete ${selectedIds.length} gallery items?`
      : `Update ${selectedIds.length} items to status: ${status.toUpperCase()}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.post("/api/creator/gallery/bulk-status", {
        ids: selectedIds,
        status
      });
      setSelectedIds([]);
      fetchAllData();
    } catch (err) {
      console.error("Error performing bulk status update:", err);
      alert("Failed to perform bulk action.");
    }
  };

  // Modal Create/Edit Handlers
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      caption: "",
      creator: "@snpshot_user",
      layout: "4-grid",
      color: "#F042FF",
      status: "approved",
      badge: "STAFF PICK",
      isPinned: false,
      likes: 28,
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
      badge: item.badge || "STAFF PICK",
      isPinned: Boolean(item.isPinned),
      likes: item.likes || 24,
      file: null,
      previewSrc: item.imageSrc || ""
    });
    setIsModalOpen(true);
  };

  const handleSingleSubmit = async (e) => {
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
        // Also update moderation fields
        await axios.patch(`/api/creator/gallery/${editingItem.id}/moderation`, {
          status: formData.status,
          badge: formData.badge,
          isPinned: formData.isPinned,
          likes: formData.likes
        });
      } else {
        const res = await axios.post("/api/creator/gallery", data);
        if (res.data?.item?.id) {
          await axios.patch(`/api/creator/gallery/${res.data.item.id}/moderation`, {
            status: formData.status,
            badge: formData.badge,
            isPinned: formData.isPinned,
            likes: formData.likes
          });
        }
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err) {
      console.error("Error saving gallery submission:", err);
      alert("Failed to save gallery submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm("Delete this submission from the community gallery?")) return;
    try {
      await axios.delete(`/api/creator/gallery/${id}`);
      setSelectedIds(prev => prev.filter(i => i !== id));
      fetchAllData();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // Toggle Showcase Promotion (Editorial / Staff Pick promotion)
  const handlePromoteToShowcase = async (item) => {
    try {
      await axios.post(`/api/creator/gallery/${item.id}/promote`);
      fetchAllData();
    } catch (err) {
      console.error("Error toggling showcase promotion:", err);
      alert("Failed to toggle showcase status.");
    }
  };

  // Filter Logic
  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = 
      (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.creator && item.creator.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const isEditorial = item.origin === "editorial" || item.isPromotedToShowcase;
    const matchesOrigin = 
      originFilter === "all" || 
      (originFilter === "editorial" && isEditorial) || 
      (originFilter === "community" && !isEditorial);

    const itemStatus = item.status || "approved";
    const matchesStatus = statusFilter === "all" || itemStatus === statusFilter;
    const matchesLayout = layoutFilter === "all" || item.layout === layoutFilter;

    return matchesSearch && matchesOrigin && matchesStatus && matchesLayout;
  });

  // Summary Metrics
  const approvedCount = galleryItems.filter(i => (i.status || "approved") === "approved").length;
  const editorialCount = galleryItems.filter(i => (i.origin === "editorial" || i.isPromotedToShowcase)).length;
  const communityCount = galleryItems.filter(i => (i.origin !== "editorial" && !i.isPromotedToShowcase)).length;
  const pendingCount = galleryItems.filter(i => i.status === "pending").length;
  const flaggedCount = galleryItems.filter(i => i.status === "flagged").length;
  const pinnedCount = galleryItems.filter(i => i.isPinned).length;
  const totalLikes = galleryItems.reduce((acc, i) => acc + (i.likes || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Active Hero Theme
            </span>
            <div className="text-base font-black text-[#010030] capitalize truncate max-w-[180px]">
              {themePresets.find(t => t.id === heroConfig.activeThemePreset)?.name || "Y2K Cyber Pink"}
            </div>
            <span className="text-[10px] text-[#7226FF] font-medium">
              Accent: {heroConfig.accentColor}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Approved & Featured
            </span>
            <div className="text-3xl font-black text-emerald-600">{approvedCount}</div>
            <span className="text-[10px] text-emerald-700 font-medium">
              {pinnedCount} Pinned Showcase Strips
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Pending Queue
            </span>
            <div className="text-3xl font-black text-amber-600">{pendingCount}</div>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting Admin Moderation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Total Community Likes
            </span>
            <div className="text-3xl font-black text-[#7226FF]">{totalLikes}</div>
            <span className="text-[10px] text-rose-600 font-medium">Live Showcase Engagement</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
        </div>
      </div>

      {/* PHASE 4A: HOMEPAGE HERO BANNER & SEASONAL THEMES SUITE */}
      <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#f0ebf7] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#7226FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Hero Suite
              </span>
              <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#7226FF]" />
                <span>Homepage Hero Banner & Seasonal Theme Presets</span>
              </h3>
            </div>
            <p className="text-xs text-[#625b82]">
              Customize homepage headlines, marquee ticker copy, accent colors, and quick-switch seasonal visual themes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Phase 4C: Live Homepage Simulator Launcher */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="admin-btn bg-[#010030] hover:bg-[#1a1860] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Maximize2 className="w-3.5 h-3.5 text-[#F042FF]" />
              <span>Live Homepage Simulator</span>
            </button>
          </div>
        </div>

        {/* Quick Seasonal Theme Preset Cards */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-[#010030] uppercase tracking-wider">
                One-Click Seasonal Theme Presets
              </label>
              <span className="text-[11px] text-[#625b82]">
                Click a preset to quickly apply curated color gradients, headlines & ticker copy
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveAsNewPreset}
              className="admin-btn bg-[#7226FF]/10 hover:bg-[#7226FF]/20 text-[#7226FF] border border-[#7226FF]/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Form as Preset</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {themePresets.map((theme) => {
              const isSelected = heroConfig.activeThemePreset === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleApplyPreset(theme)}
                  className={`admin-btn w-full text-left rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer p-4 shadow-xs ${
                    isSelected 
                      ? "border-[#7226FF] ring-2 ring-[#7226FF]/25 bg-purple-50/50 shadow-md" 
                      : "border-[#e2dced] bg-white hover:bg-[#f8f7fc] hover:border-[#7226FF]/50 hover:shadow-xs"
                  }`}
                >
                  <div>
                    {/* Visual Color Swatch Banner Header */}
                    <div 
                      className="h-10 w-full rounded-xl border border-black/10 overflow-hidden flex items-center justify-between px-3 text-white font-mono text-[10px] uppercase font-bold shadow-2xs mb-3"
                      style={{ background: theme.heroBg }}
                    >
                      <span className="drop-shadow-sm truncate max-w-[120px]">{theme.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0" 
                          style={{ backgroundColor: theme.accentColor }} 
                        />
                        <button
                          type="button"
                          title="Delete Preset"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePreset(theme.id);
                          }}
                          className="w-6 h-6 rounded-lg bg-black/30 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#010030] tracking-tight truncate max-w-[130px]">{theme.name}</span>
                      {isSelected && (
                        <span className="bg-[#7226FF] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#625b82] line-clamp-2 leading-snug mb-3 font-normal">
                      {theme.desc || theme.headline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-2.5 border-t border-[#e2dced]/60">
                    <span className="text-[#7226FF] font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                      {theme.accentColor}
                    </span>
                    <span className="text-[#625b82] font-sans text-[10px]">
                      {isSelected ? "Selected" : "Click to Apply"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hero Form Controls */}
        <form onSubmit={handleSaveHeroConfig} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-[#010030] mb-1">Eyebrow Badge Tag</label>
              <input 
                type="text" 
                value={heroConfig.eyebrowBadge || ""}
                onChange={(e) => setHeroConfig({ ...heroConfig, eyebrowBadge: e.target.value })}
                className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#010030] mb-1">Main Hero Headline</label>
              <input 
                type="text" 
                required
                value={heroConfig.headline || ""}
                onChange={(e) => setHeroConfig({ ...heroConfig, headline: e.target.value })}
                className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030] font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-[#010030] mb-1">Subheadline Caption</label>
              <textarea 
                rows={2}
                value={heroConfig.subheadline || ""}
                onChange={(e) => setHeroConfig({ ...heroConfig, subheadline: e.target.value })}
                className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#010030] mb-1">Primary CTA Text</label>
                <input 
                  type="text" 
                  value={heroConfig.ctaText || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, ctaText: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Primary CTA Link</label>
                <input 
                  type="text" 
                  value={heroConfig.ctaLink || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, ctaLink: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030] font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#010030] mb-1">Top Doodle Tag (#Tag)</label>
              <input 
                type="text" 
                value={heroConfig.doodleHeaderTag || ""}
                onChange={(e) => setHeroConfig({ ...heroConfig, doodleHeaderTag: e.target.value })}
                className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030] font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#010030] mb-1">Circular Stamp Rotating Text</label>
              <input 
                type="text" 
                value={heroConfig.circularBadgeText || ""}
                onChange={(e) => setHeroConfig({ ...heroConfig, circularBadgeText: e.target.value })}
                className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030] font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-3">
            {/* Custom Hero Card Photos Upload Section */}
            <div className="p-3 bg-[#f8f7fc] border border-[#e2dced] rounded-xl space-y-2.5">
              <span className="font-bold text-[#7226FF] uppercase text-[10px] tracking-wider block">
                📸 Hero Header Card Photos (3 Slots)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Photo 1: Card 1 Top */}
                <div className="bg-white p-2 rounded-lg border border-[#e2dced] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#010030] block">Card 1 Top Photo</span>
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={heroConfig.card1Photo1 || "/img/poses/Wonyoung1.png"} 
                      alt="Card 1 Top" 
                      className="w-9 h-9 object-cover rounded border border-[#e2dced] shrink-0"
                    />
                    <label className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer shrink-0">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleHeroPhotoUpload(e, 'card1Photo1')}
                      />
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Photo URL..." 
                    value={heroConfig.card1Photo1 || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card1Photo1: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded px-1.5 py-0.5 text-[9px] font-mono text-[#010030]"
                  />
                </div>

                {/* Photo 2: Card 1 Bottom */}
                <div className="bg-white p-2 rounded-lg border border-[#e2dced] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#010030] block">Card 1 Bottom Photo</span>
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={heroConfig.card1Photo2 || "/img/poses/Wonyoung2.png"} 
                      alt="Card 1 Bottom" 
                      className="w-9 h-9 object-cover rounded border border-[#e2dced] shrink-0"
                    />
                    <label className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer shrink-0">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleHeroPhotoUpload(e, 'card1Photo2')}
                      />
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Photo URL..." 
                    value={heroConfig.card1Photo2 || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card1Photo2: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded px-1.5 py-0.5 text-[9px] font-mono text-[#010030]"
                  />
                </div>

                {/* Photo 3: Card 3 Photo */}
                <div className="bg-white p-2 rounded-lg border border-[#e2dced] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#010030] block">Card 3 Featured Photo</span>
                  <div className="flex items-center gap-1.5">
                    <img 
                      src={heroConfig.card3Photo || "/img/poses/Wonyoung3.png"} 
                      alt="Card 3 Photo" 
                      className="w-9 h-9 object-cover rounded border border-[#e2dced] shrink-0"
                    />
                    <label className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer shrink-0">
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleHeroPhotoUpload(e, 'card3Photo')}
                      />
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Photo URL..." 
                    value={heroConfig.card3Photo || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card3Photo: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded px-1.5 py-0.5 text-[9px] font-mono text-[#010030]"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#f8f7fc] border border-[#e2dced] rounded-xl space-y-2">
              <span className="font-bold text-[#7226FF] uppercase text-[10px] tracking-wider block">Card 1 Elements (@wonyoung)</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Handle</label>
                  <input 
                    type="text" 
                    value={heroConfig.card1Handle || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card1Handle: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Subhandle</label>
                  <input 
                    type="text" 
                    value={heroConfig.card1Subhandle || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card1Subhandle: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Tag</label>
                  <input 
                    type="text" 
                    value={heroConfig.card1Tag || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card1Tag: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#f8f7fc] border border-[#e2dced] rounded-xl space-y-2">
              <span className="font-bold text-[#7226FF] uppercase text-[10px] tracking-wider block">Card 3 Elements (SNPSHOT STUDIO)</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Title</label>
                  <input 
                    type="text" 
                    value={heroConfig.card3Title || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card3Title: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Subtitle</label>
                  <input 
                    type="text" 
                    value={heroConfig.card3Subtitle || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card3Subtitle: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Stat Pill</label>
                  <input 
                    type="text" 
                    value={heroConfig.card3Stat || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card3Stat: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#010030] mb-0.5">Theme Tag</label>
                  <input 
                    type="text" 
                    value={heroConfig.card3Theme || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, card3Theme: e.target.value })}
                    className="admin-ui w-full bg-white border border-[#e2dced] rounded-lg px-2 py-1 text-[#010030]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#010030] mb-1">Status Bar Label</label>
                <input 
                  type="text" 
                  value={heroConfig.statusText || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, statusText: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Photos Count Counter</label>
                <input 
                  type="text" 
                  value={heroConfig.photosCountText || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, photosCountText: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] focus:bg-white focus:border-[#7226FF] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#010030] mb-1">Accent Theme Color</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={heroConfig.accentColor || "#F042FF"}
                    onChange={(e) => setHeroConfig({ ...heroConfig, accentColor: e.target.value })}
                    className="w-10 h-9 rounded-xl border border-[#e2dced] cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={heroConfig.accentColor || ""}
                    onChange={(e) => setHeroConfig({ ...heroConfig, accentColor: e.target.value })}
                    className="admin-ui flex-1 bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Hero Background Gradient</label>
                <input 
                  type="text" 
                  value={heroConfig.heroBg || ""}
                  onChange={(e) => setHeroConfig({ ...heroConfig, heroBg: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-[#f0ebf7]">
            {heroSuccessMsg ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {heroSuccessMsg}
              </span>
            ) : (
              <span className="text-[11px] text-[#625b82]">
                Changes affect live homepage banner and seasonal styling.
              </span>
            )}

            <button
              type="submit"
              disabled={savingHero}
              className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{savingHero ? "Publishing..." : "Publish Hero & Theme Settings"}</span>
            </button>
          </div>

        </form>

      </div>

      {/* PHASE 4B: FEATURED PHOTOSTRIP SHOWCASE & MODERATION QUEUE */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Explanatory Banner for Homepage Gallery Section */}
        <div className="p-4 bg-gradient-to-r from-[#160078]/10 via-[#F042FF]/10 to-[#7226FF]/10 border border-[#7226FF]/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
              ✦
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#010030] flex items-center gap-2">
                <span>Design Showcase & Curated Editorial Highlights</span>
                <span className="bg-[#7226FF] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Homepage Section
                </span>
              </h4>
              <p className="text-[11px] text-[#625b82] leading-relaxed mt-0.5 max-w-2xl">
                Photostrips marked as <span className="font-bold text-[#7226FF]">Studio Editorial</span> or promoted with showcase badges (<span className="font-bold text-[#F042FF]">Staff Pick, Official Sample</span>) appear in the prominent Design Showcase on the homepage. General community submissions & print orders are managed in the Community Gallery.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onSelectTab && (
              <button
                type="button"
                onClick={() => onSelectTab("gallery")}
                className="admin-btn bg-white hover:bg-[#f8f7fc] text-[#7226FF] border border-[#7226FF]/30 font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Community Gallery</span>
              </button>
            )}
            <a
              href="/#gallery-section"
              target="_blank"
              rel="noreferrer"
              className="admin-btn bg-[#010030] hover:bg-[#160078] text-white font-bold text-[11px] px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#F042FF]" />
              <span>Live Gallery</span>
            </a>
          </div>
        </div>

        {/* Section Title & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7226FF]" />
            <input 
              type="text"
              placeholder="Search by creator handle or caption..."
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
            <button
              onClick={openCreateModal}
              className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Feature Photostrip</span>
            </button>
          </div>

        </div>

        {/* Filter Toolbar: Origin Taxonomy & Moderation Status & Layout Format */}
        <div className="space-y-2.5 pt-2 border-t border-[#f0ebf7]">
          {/* Origin Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs max-w-full overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-[#625b82] uppercase mr-1 shrink-0">Origin:</span>
            {[
              { id: "all", label: `All (${galleryItems.length})` },
              { id: "editorial", label: `✦ Studio Editorial (${editorialCount})` },
              { id: "community", label: `👥 Community (${communityCount})` }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setOriginFilter(pill.id)}
                className={`admin-btn px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
                  originFilter === pill.id 
                    ? "bg-[#010030] text-white border-[#010030] shadow-2xs" 
                    : "bg-white text-[#4a4365] border-[#e2dced] hover:text-[#010030] hover:bg-[#eae6f3]"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Moderation Status Pills & Format Selector */}
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
            <div className="flex items-center gap-1 text-xs max-w-full overflow-x-auto pb-1 xl:pb-0">
              <span className="text-[11px] font-bold text-[#625b82] uppercase mr-1 shrink-0">Status:</span>
              {[
                { id: "all", label: `All Statuses` },
                { id: "approved", label: `Approved (${approvedCount})` },
                { id: "pending", label: `Pending (${pendingCount})` },
                { id: "flagged", label: `Flagged (${flaggedCount})` }
              ].map(pill => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`admin-btn px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                    statusFilter === pill.id 
                      ? "bg-[#7226FF] text-white font-semibold shadow-2xs" 
                      : "bg-[#f4f2f8] text-[#4a4365] hover:text-[#010030] hover:bg-[#eae6f3]"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Layout Filter Dropdown */}
            <div className="flex items-center gap-2 self-start xl:self-auto w-full xl:w-auto justify-between xl:justify-end">
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

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-[#010030] to-[#1e0066] text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <span className="bg-[#F042FF] text-white text-xs font-bold font-mono px-2.5 py-1 rounded-lg">
              {selectedIds.length} Selected
            </span>
            <span className="text-xs font-medium text-slate-200">
              Bulk moderation actions ready for selected photostrips.
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
              onClick={() => handleBulkStatusUpdate("deleted")}
              className="admin-btn bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
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

      {/* SHOWCASE & MODERATION CATALOG GRID */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Community Showcase & Moderation Queue...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs">
          No photostrip submissions found matching current search or status filters.
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
              <span>Select All Shown ({filteredItems.length})</span>
            </button>
            <span>Showing {filteredItems.length} submissions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const status = item.status || "approved";

              return (
                <div 
                  key={item.id}
                  className={`bg-white border rounded-3xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group cursor-pointer ${
                    isSelected ? "border-[#7226FF] ring-2 ring-[#7226FF]/20 bg-purple-50/20" : "border-[#e2dced]"
                  }`}
                  onClick={() => toggleSelectItem(item.id)}
                >
                  {/* Checkbox */}
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

                  {/* Status & Pin Badges */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
                    {/* Pin Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePinned(item);
                      }}
                      className={`p-1 rounded-lg text-xs font-bold shadow-2xs transition-all ${
                        item.isPinned ? "bg-[#7226FF] text-white" : "bg-white/90 text-slate-400 hover:text-[#7226FF]"
                      }`}
                      title={item.isPinned ? "Unpin from Homepage Hero Showcase" : "Pin to Homepage Hero Showcase"}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Status Pill */}
                    {status === "approved" && (
                      <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Approved
                      </span>
                    )}
                    {status === "pending" && (
                      <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Pending
                      </span>
                    )}
                    {status === "flagged" && (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow-2xs">
                        Flagged
                      </span>
                    )}
                  </div>

                  {/* Photostrip Image Box */}
                  <div 
                    className="w-full h-64 rounded-2xl bg-[#010030]/5 border border-[#e2dced] p-2 flex items-center justify-center mb-3 relative overflow-hidden bg-[radial-gradient(#e2dced_1px,transparent_1px)] [background-size:12px_12px] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImageModal(item);
                    }}
                  >
                    <img 
                      src={item.imageSrc} 
                      alt={item.caption}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-sm group-hover:scale-102 transition-transform"
                    />

                    {/* Origin Badge */}
                    <span className={`absolute top-2 left-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase shadow-2xs ${
                      item.origin === "editorial" || item.isPromotedToShowcase
                        ? "bg-[#010030] text-[#F042FF] border border-[#F042FF]/40"
                        : "bg-white/90 text-[#625b82] border border-[#e2dced]"
                    }`}>
                      {item.origin === "editorial" ? "✦ EDITORIAL" : item.isPromotedToShowcase ? "★ SHOWCASE" : "👥 COMMUNITY"}
                    </span>

                    {/* Badge Overlay */}
                    {item.badge && (
                      <span className="absolute bottom-2 left-2 text-[9px] font-mono font-bold bg-[#010030]/90 text-[#F042FF] px-2 py-0.5 rounded border border-[#F042FF]/40 uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Info & Moderation Controls */}
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#010030] truncate" title={item.creator}>
                        {item.creator}
                      </span>
                      <span className="bg-[#f0ecf8] text-[#7226FF] px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase shrink-0">
                        {item.layout}
                      </span>
                    </div>

                    <p className="text-xs text-[#625b82] line-clamp-2 italic">
                      "{item.caption}"
                    </p>

                    {/* Quick Promote / Showcase Feature Button */}
                    <button
                      type="button"
                      onClick={() => handlePromoteToShowcase(item)}
                      className={`w-full py-1 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                        item.isPromotedToShowcase || item.origin === "editorial"
                          ? "bg-gradient-to-r from-[#7226FF]/10 to-[#F042FF]/10 border-[#7226FF]/30 text-[#7226FF]"
                          : "bg-[#f8f7fc] border-[#e2dced] text-[#625b82] hover:text-[#7226FF] hover:border-[#7226FF]/30"
                      }`}
                      title="Toggle whether this photostrip is highlighted in the Design Showcase on Homepage"
                    >
                      <Sparkles className="w-3 h-3 text-[#F042FF]" />
                      <span>{item.isPromotedToShowcase || item.origin === "editorial" ? "In Showcase (Featured)" : "Feature in Showcase"}</span>
                    </button>

                    {/* Quick Badge Selector Dropdown */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Tag className="w-3 h-3 text-[#7226FF] shrink-0" />
                      <select
                        value={item.badge || "STAFF PICK"}
                        onChange={(e) => handleUpdateBadge(item.id, e.target.value)}
                        className="admin-ui bg-[#f8f7fc] text-[#010030] border border-[#e2dced] text-[10px] font-semibold px-1.5 py-0.5 rounded-lg w-full cursor-pointer"
                      >
                        {BADGE_OPTIONS.map(b => (
                          <option key={b.id} value={b.id}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Moderation Bar & Like Count */}
                    <div className="flex items-center justify-between border-t border-[#f0ebf7] pt-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{item.likes || 0}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Quick Approve / Flag Toggle Buttons */}
                        {status !== "approved" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "approved")}
                            className="admin-btn p-1 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            title="Approve for Showcase"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {status !== "flagged" && (
                          <button
                            onClick={() => handleQuickStatusChange(item.id, "flagged")}
                            className="admin-btn p-1 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors"
                            title="Flag Submission"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(item)}
                          className="admin-btn p-1 hover:bg-[#f0ecf8] text-[#7226FF] rounded-lg transition-colors"
                          title="Edit Submission"
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

      {/* CREATE / EDIT SINGLE SUBMISSION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-lg text-[#010030] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7226FF]" />
                <span>{editingItem ? "Edit Gallery Item" : "Feature New Photostrip"}</span>
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
                  <label className="block font-bold text-[#010030] mb-1">Moderation Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Queue</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Showcase Badge Tag</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  >
                    {BADGE_OPTIONS.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Layout Format</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-2.5 py-1.5 text-[#010030]"
                  >
                    <option value="3-grid">3-Grid</option>
                    <option value="4-grid">4-Grid</option>
                    <option value="2x2">2x2 Square</option>
                    <option value="2x3">2x3 Postcard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Likes Count</label>
                  <input 
                    type="number" 
                    value={formData.likes}
                    onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-2.5 py-1.5 text-[#010030]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-[#010030] mb-1.5">
                    <input 
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-[#7226FF] rounded cursor-pointer"
                    />
                    <span>Pin to Hero</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Upload Photostrip Graphic</label>
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
                  {submitting ? "Saving..." : (editingItem ? "Save Changes" : "Publish Photostrip")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT HIGH-RES PREVIEW MODAL */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#010030]">
                  {previewImageModal.creator}
                </h4>
                <p className="text-xs text-[#625b82]">
                  "{previewImageModal.caption}"
                </p>
              </div>
              <button 
                onClick={() => setPreviewImageModal(null)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center bg-[#f8f7fc] p-4 rounded-2xl border border-[#e2dced]">
              <img 
                src={previewImageModal.imageSrc} 
                alt={previewImageModal.caption}
                className="max-h-[60vh] object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4C: INTERACTIVE LIVE HOMEPAGE SIMULATOR BENCH MODAL */}
      {isSimulatorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#010030]/85 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsSimulatorOpen(false)}
        >
          <div 
            className="bg-[#020617] border border-[#2e109d] rounded-3xl p-6 max-w-6xl w-full shadow-2xl relative space-y-4 max-h-[94vh] overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7226FF] flex items-center justify-center text-white">
                  <Globe className="w-5 h-5 text-[#F042FF]" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white flex items-center gap-2">
                    <span>Live Homepage Hero & Showcase Bench</span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                      LIVE RENDER
                    </span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    Simulate active seasonal hero banner, ticker headline, and featured showcase cards in real time
                  </span>
                </div>
              </div>

              {/* Device Viewport Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#0f172a] p-1.5 rounded-xl border border-white/10 shadow-inner">
                  <button
                    onClick={() => setSimulatorDevice("desktop")}
                    className={`admin-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      simulatorDevice === "desktop" 
                        ? "bg-[#7226FF] text-white shadow-xs border border-purple-400/30 font-bold" 
                        : "bg-transparent text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-purple-300" />
                    <span>Desktop</span>
                    <span className="text-[10px] font-mono opacity-70">(1280px)</span>
                  </button>

                  <button
                    onClick={() => setSimulatorDevice("tablet")}
                    className={`admin-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      simulatorDevice === "tablet" 
                        ? "bg-[#7226FF] text-white shadow-xs border border-purple-400/30 font-bold" 
                        : "bg-transparent text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5 text-purple-300" />
                    <span>Tablet</span>
                    <span className="text-[10px] font-mono opacity-70">(768px)</span>
                  </button>

                  <button
                    onClick={() => setSimulatorDevice("mobile")}
                    className={`admin-btn px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      simulatorDevice === "mobile" 
                        ? "bg-[#7226FF] text-white shadow-xs border border-purple-400/30 font-bold" 
                        : "bg-transparent text-slate-300 hover:text-white hover:bg-white/10 font-medium"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-purple-300" />
                    <span>Mobile</span>
                    <span className="text-[10px] font-mono opacity-70">(375px)</span>
                  </button>
                </div>

                <button 
                  onClick={() => setIsSimulatorOpen(false)}
                  className="admin-btn p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Close Simulator"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* SIMULATED BROWSER FRAME CONTAINER */}
            <div className="flex justify-center bg-black/40 p-4 rounded-2xl border border-white/10 overflow-x-auto">
              
              <div 
                className={`transition-all duration-300 bg-[#010030] rounded-2xl border border-[#2e109d] overflow-hidden shadow-2xl flex flex-col ${
                  simulatorDevice === "desktop" ? "w-full max-w-5xl" : simulatorDevice === "tablet" ? "w-[768px]" : "w-[375px]"
                }`}
              >
                {/* Browser Address Bar Header */}
                <div className="bg-[#0e0048] px-4 py-2 flex items-center justify-between border-b border-[#2e109d] text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="bg-black/40 text-slate-300 font-mono text-[10px] px-3 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                    <span className="text-emerald-400">https://</span>
                    <span>snpshot.studio/</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-300 uppercase">
                    Theme: {heroConfig.activeThemePreset}
                  </span>
                </div>

                {/* Simulated Announcement Ticker Bar */}
                <div className="bg-[#7226FF] text-white py-1.5 px-3 text-[10px] font-mono font-bold overflow-hidden whitespace-nowrap shadow-xs">
                  <div className="animate-marquee inline-block">
                    {heroConfig.announcementTicker}
                  </div>
                </div>

                {/* Simulated Hero Section */}
                <div 
                  className="p-8 text-center space-y-4 relative overflow-hidden flex flex-col items-center justify-center min-h-[320px]"
                  style={{ background: heroConfig.heroBg }}
                >
                  <span className="bg-white/10 border border-white/20 text-[#F042FF] font-mono font-bold text-[10px] px-3 py-1 rounded-md uppercase tracking-widest shadow-xs">
                    ✦ DIGITAL SELF-PHOTO BOOTH STUDIO ✦
                  </span>

                  <h1 className="font-sans font-black text-2xl sm:text-4xl text-white uppercase tracking-tight leading-tight max-w-2xl">
                    {heroConfig.headline}
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-200 max-w-lg font-medium leading-relaxed">
                    {heroConfig.subheadline}
                  </p>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button 
                      className="admin-btn px-6 py-2.5 rounded-2xl font-bold text-xs text-white shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                      style={{ backgroundColor: heroConfig.accentColor }}
                    >
                      <span>{heroConfig.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Simulated Featured Showcase Carousel (Phase 4B Preview) */}
                <div className="p-6 bg-[#020617] border-t border-[#2e109d] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#F042FF]" />
                        <span>Live Featured Photostrips</span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Curated high-res strips pinned and approved for public showcase
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-[#F042FF] bg-[#F042FF]/10 px-2 py-0.5 rounded border border-[#F042FF]/30">
                      {galleryItems.filter(i => i.isPinned || (i.status || "approved") === "approved").length} SHOWCASE STRIPS
                    </span>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {galleryItems
                      .filter(i => i.isPinned || (i.status || "approved") === "approved")
                      .slice(0, 4)
                      .map((item) => (
                        <div 
                          key={item.id}
                          className="bg-slate-900 border border-white/10 rounded-2xl p-2.5 flex flex-col justify-between relative group hover:border-[#F042FF] transition-all"
                        >
                          <div className="w-full h-36 rounded-xl bg-black/50 p-1 flex items-center justify-center mb-2 overflow-hidden relative">
                            <img src={item.imageSrc} alt={item.caption} className="max-h-full max-w-full object-contain" />
                            {item.badge && (
                              <span className="absolute bottom-1 left-1 text-[8px] font-mono font-bold bg-[#010030]/90 text-[#F042FF] px-1.5 py-0.5 rounded border border-[#F042FF]/40">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 text-[10px]">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white truncate">{item.creator}</span>
                              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5 fill-rose-500" /> {item.likes || 0}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[9px] truncate">"{item.caption}"</p>
                          </div>
                        </div>
                      ))}
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ShowcaseManager;
