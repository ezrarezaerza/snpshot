import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Users, Layers, Smile, ShieldAlert, Key, Settings, Upload, Trash2, 
  Edit3, Eye, Sliders, Layout, CheckCircle, AlertTriangle, LogOut, ChevronRight,
  Heart, Image as ImageIcon, Sparkles
} from "lucide-react";
import Navbar from "./Navbar";
import "../App.css";

const CreatorDashboard = () => {
  const navigate = useNavigate();
  
  // Protection state
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState("artist"); // "artist" | "frame" | "sticker" | "gallery" | "showcase"

  // Dynamic lists from backend
  const [customArtists, setCustomArtists] = useState([]);
  const [customFrames, setCustomFrames] = useState([]);
  const [customStickers, setCustomStickers] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [customShowcases, setCustomShowcases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State: Custom Showcase Themes (Photo Output & Overlays Reference)
  const [showcaseName, setShowcaseName] = useState("");
  const [showcaseBadge, setShowcaseBadge] = useState("CELEB_EVENT");
  const [showcaseCaption, setShowcaseCaption] = useState("");
  const [showcaseDesc, setShowcaseDesc] = useState("");
  const [showcaseColor, setShowcaseColor] = useState("#F042FF");
  const [showcaseBg, setShowcaseBg] = useState("linear-gradient(135deg, #020617, #0F3AE2)");
  const [showcaseOverlayFrameId, setShowcaseOverlayFrameId] = useState("");
  const [showcaseFile, setShowcaseFile] = useState(null);
  const [showcaseError, setShowcaseError] = useState("");
  const [showcaseSuccess, setShowcaseSuccess] = useState("");

  // Form State: Custom Artist (Campaign)
  const [artistName, setArtistName] = useState("");
  const [artistRole, setArtistRole] = useState("");
  const [artistColor, setArtistColor] = useState("#F042FF");
  const [agencySelectMode, setAgencySelectMode] = useState("existing");
  const [selectedAgencyId, setSelectedAgencyId] = useState("starship");
  const [newAgencyId, setNewAgencyId] = useState("");
  const [newAgencyName, setNewAgencyName] = useState("");
  const [groupSelectMode, setGroupSelectMode] = useState("existing");
  const [selectedGroupId, setSelectedGroupId] = useState("ive");
  const [newGroupId, setNewGroupId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupLogo, setNewGroupLogo] = useState("✨");
  const [isMale, setIsMale] = useState("false");
  const [artistPoses, setArtistPoses] = useState([null, null, null, null]);
  const [artistError, setArtistError] = useState("");
  const [artistSuccess, setArtistSuccess] = useState("");

  // Form State: Custom Theme Overlay
  const [frameName, setFrameName] = useState("");
  const [frameLayout, setFrameLayout] = useState("4-grid");
  const [frameFile, setFrameFile] = useState(null);
  const [frameError, setFrameError] = useState("");
  const [frameSuccess, setFrameSuccess] = useState("");

  // Form State: Custom Stickers & Doodles
  const [stickerName, setStickerName] = useState("");
  const [stickerType, setStickerType] = useState("sticker");
  const [stickerFile, setStickerFile] = useState(null);
  const [stickerError, setStickerError] = useState("");
  const [stickerSuccess, setStickerSuccess] = useState("");

  // Form State: Custom Gallery Items
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryCreator, setGalleryCreator] = useState("");
  const [galleryLayout, setGalleryLayout] = useState("4-grid"); // '3-grid' | '4-grid' | '2x2' | '2x3'
  const [galleryColor, setGalleryColor] = useState("#F042FF");
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryError, setGalleryError] = useState("");
  const [gallerySuccess, setGallerySuccess] = useState("");

  // Editing states
  const [editingSticker, setEditingSticker] = useState(null);
  const [editStickerName, setEditStickerName] = useState("");
  const [editStickerType, setEditStickerType] = useState("sticker");
  const [editStickerFile, setEditStickerFile] = useState(null);
  const [editStickerError, setEditStickerError] = useState("");

  const [editingArtist, setEditingArtist] = useState(null);
  const [editArtistName, setEditArtistName] = useState("");
  const [editArtistRole, setEditArtistRole] = useState("");
  const [editArtistColor, setEditArtistColor] = useState("");
  const [editAgencyId, setEditAgencyId] = useState("");
  const [editAgencyName, setEditAgencyName] = useState("");
  const [editGroupId, setEditGroupId] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupLogo, setEditGroupLogo] = useState("");
  const [editIsMale, setEditIsMale] = useState("false");
  const [editArtistPoses, setEditArtistPoses] = useState([null, null, null, null]);
  const [editArtistError, setEditArtistError] = useState("");

  const [editingFrame, setEditingFrame] = useState(null);
  const [editFrameName, setEditFrameName] = useState("");
  const [editFrameLayout, setEditFrameLayout] = useState("");
  const [editFrameFile, setEditFrameFile] = useState(null);
  const [editFrameError, setEditFrameError] = useState("");

  const [editingGallery, setEditingGallery] = useState(null);
  const [editGalleryCaption, setEditGalleryCaption] = useState("");
  const [editGalleryCreator, setEditGalleryCreator] = useState("");
  const [editGalleryLayout, setEditGalleryLayout] = useState("4-grid");
  const [editGalleryColor, setEditGalleryColor] = useState("#F042FF");
  const [editGalleryFile, setEditGalleryFile] = useState(null);
  const [editGalleryError, setEditGalleryError] = useState("");

  const [editingShowcase, setEditingShowcase] = useState(null);
  const [editShowcaseName, setEditShowcaseName] = useState("");
  const [editShowcaseBadge, setEditShowcaseBadge] = useState("CELEB_EVENT");
  const [editShowcaseCaption, setEditShowcaseCaption] = useState("");
  const [editShowcaseDesc, setEditShowcaseDesc] = useState("");
  const [editShowcaseColor, setEditShowcaseColor] = useState("#F042FF");
  const [editShowcaseBg, setEditShowcaseBg] = useState("");
  const [editShowcaseOverlayFrameId, setEditShowcaseOverlayFrameId] = useState("");
  const [editShowcaseFile, setEditShowcaseFile] = useState(null);
  const [editShowcaseError, setEditShowcaseError] = useState("");

  // Live Theme Previewer state
  const [previewSelectedFrame, setPreviewSelectedFrame] = useState("");
  const [previewLayout, setPreviewLayout] = useState("4-grid");
  const [customPreviewImage, setCustomPreviewImage] = useState(null);
  const [simulatedBackground, setSimulatedBackground] = useState("linear-gradient(135deg, #FFE5F1 0%, #F042FF 50%, #7226FF 100%)");

  useEffect(() => {
    const isAuthed = localStorage.getItem("snpshot_creator_auth") === "true";
    if (isAuthed) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCreatorData();
    }
  }, [isAuthenticated]);

  const fetchCreatorData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/creator/data");
      const artists = res.data.artists || [];
      const frames = res.data.frames || [];
      const stickers = res.data.stickers || [];
      const gallery = res.data.galleryItems || [];
      const showcase = res.data.showcaseThemes || [];
      setCustomArtists(artists);
      setCustomFrames(frames);
      setCustomStickers(stickers);
      setGalleryItems(gallery);
      setCustomShowcases(showcase);

      if (frames.length > 0 && !previewSelectedFrame) {
        setPreviewSelectedFrame(frames[0].imageSrc);
        setPreviewLayout(frames[0].layout);
      }
    } catch (err) {
      console.error("Error fetching creator data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "snpshot" || password === "creator") {
      setIsAuthenticated(true);
      localStorage.setItem("snpshot_creator_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect passcode. Hint: Try 'snpshot'");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("snpshot_creator_auth");
    setPassword("");
  };

  const defaultAgencies = [
    { id: "starship", name: "Starship Ent." },
    { id: "hybe", name: "HYBE" },
    { id: "sm", name: "SM Entertainment" }
  ];

  const defaultGroups = [
    { id: "ive", name: "IVE" },
    { id: "newjeans", name: "NewJeans" },
    { id: "bts", name: "BTS" }
  ];

  const handlePoseChange = (index, file) => {
    const updated = [...artistPoses];
    updated[index] = file;
    setArtistPoses(updated);
  };

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    setArtistError("");
    setArtistSuccess("");

    if (!artistName.trim() || !artistRole.trim()) return setArtistError("Name and role are required");

    const validPosesCount = artistPoses.filter(Boolean).length;
    if (validPosesCount < 4) {
      return setArtistError(`Please select exactly 4 pose PNG overlay files (selected: ${validPosesCount}/4)`);
    }

    let finalAgencyId = selectedAgencyId;
    let finalAgencyName = defaultAgencies.find(a => a.id === selectedAgencyId)?.name || "";
    if (agencySelectMode === "new") {
      finalAgencyId = newAgencyId.toLowerCase().replace(/\s+/g, "-");
      finalAgencyName = newAgencyName;
    }

    let finalGroupId = selectedGroupId;
    let finalGroupName = defaultGroups.find(g => g.id === selectedGroupId)?.name || "";
    if (groupSelectMode === "new") {
      finalGroupId = newGroupId.toLowerCase().replace(/\s+/g, "-");
      finalGroupName = newGroupName;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", artistName);
      formData.append("role", artistRole);
      formData.append("color", artistColor);
      formData.append("agencyId", finalAgencyId);
      formData.append("agencyName", finalAgencyName);
      formData.append("groupId", finalGroupId);
      formData.append("groupName", finalGroupName);
      formData.append("groupLogo", newGroupLogo);
      formData.append("isMale", isMale);

      artistPoses.forEach(pose => {
        formData.append("poses", pose);
      });

      await axios.post("/api/creator/artist", formData);

      setArtistSuccess(`Campaign for "${artistName}" successfully launched!`);
      setArtistName("");
      setArtistRole("");
      setArtistPoses([null, null, null, null]);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
      setArtistError("Failed to create artist collab campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleFrameSubmit = async (e) => {
    e.preventDefault();
    setFrameError("");
    setFrameSuccess("");

    if (!frameName.trim()) return setFrameError("Overlay name is required");
    if (!frameFile) return setFrameError("Please upload the Theme Overlay PNG design file");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", frameName);
      formData.append("layout", frameLayout);
      formData.append("image", frameFile);

      const res = await axios.post("/api/creator/frame", formData);

      setFrameSuccess(`Theme Overlay "${frameName}" registered successfully!`);
      if (res.data?.frame) {
        setPreviewSelectedFrame(res.data.frame.imageSrc);
        setPreviewLayout(res.data.frame.layout);
      }
      setFrameName("");
      setFrameFile(null);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
      setFrameError("Failed to register Theme Overlay");
    } finally {
      setLoading(false);
    }
  };

  const startEditArtist = (art) => {
    setEditingArtist(art);
    setEditArtistName(art.name);
    setEditArtistRole(art.role);
    setEditArtistColor(art.color || "#F042FF");
    setEditAgencyId(art.agencyId);
    setEditAgencyName(art.agencyName);
    setEditGroupId(art.groupId);
    setEditGroupName(art.groupName);
    setEditGroupLogo(art.groupLogo || "✨");
    setEditIsMale(String(art.isMale));
    setEditArtistPoses([null, null, null, null]);
  };

  const handleEditArtistSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editArtistName);
      formData.append("role", editArtistRole);
      formData.append("color", editArtistColor);
      formData.append("agencyId", editAgencyId);
      formData.append("agencyName", editAgencyName);
      formData.append("groupId", editGroupId);
      formData.append("groupName", editGroupName);
      formData.append("groupLogo", editGroupLogo);
      formData.append("isMale", editIsMale);

      editArtistPoses.forEach((pose, i) => {
        if (pose) {
          formData.append(`poses`, pose);
          formData.append(`poseIndex_${i}`, String(i));
        }
      });

      await axios.put(`/api/creator/artist/${editingArtist.id}`, formData);

      setEditingArtist(null);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
      setEditArtistError("Failed to update artist campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleStickerSubmit = async (e) => {
    e.preventDefault();
    if (!stickerName.trim()) return setStickerError("Sticker name is required");
    if (!stickerFile) return setStickerError("Please upload the sticker/doodle PNG file");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", stickerName);
      formData.append("type", stickerType);
      formData.append("image", stickerFile);

      await axios.post("/api/creator/sticker", formData);

      setStickerSuccess(`Sticker "${stickerName}" registered successfully!`);
      setStickerName("");
      setStickerFile(null);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
      setStickerError("Failed to register custom design element");
    } finally {
      setLoading(false);
    }
  };

  const startEditSticker = (stk) => {
    setEditingSticker(stk);
    setEditStickerName(stk.name);
    setEditStickerType(stk.type);
    setEditStickerFile(null);
  };

  const handleEditStickerSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editStickerName);
      formData.append("type", editStickerType);
      if (editStickerFile) {
        formData.append("image", editStickerFile);
      }

      await axios.put(`/api/creator/sticker/${editingSticker.id}`, formData);

      setEditingSticker(null);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryCaption.trim()) return setGalleryError("Caption / Vibe is required");
    if (!galleryCreator.trim()) return setGalleryError("Creator handle / Name is required");
    if (!galleryFile) return setGalleryError("Please upload the finished output JPG/PNG file");

    try {
      setLoading(true);
      setGalleryError("");
      setGallerySuccess("");
      
      const formData = new FormData();
      formData.append("caption", galleryCaption);
      formData.append("creator", galleryCreator);
      formData.append("layout", galleryLayout);
      formData.append("color", galleryColor);
      formData.append("image", galleryFile);

      await axios.post("/api/creator/gallery", formData);

      setGallerySuccess("Photostrip preview registered successfully!");
      setGalleryCaption("");
      setGalleryCreator("");
      setGalleryFile(null);
      
      const fileInput = document.getElementById("gallery-file-input");
      if (fileInput) fileInput.value = "";
      
      fetchCreatorData();
    } catch (err) {
      console.error(err);
      setGalleryError("Failed to register photostrip preview");
    } finally {
      setLoading(false);
    }
  };

  const startEditGallery = (item) => {
    setEditingGallery(item);
    setEditGalleryCaption(item.caption);
    setEditGalleryCreator(item.creator);
    setEditGalleryLayout(item.layout);
    setEditGalleryColor(item.color || "#F042FF");
    setEditGalleryFile(null);
    setEditGalleryError("");
  };

  const handleEditGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setEditGalleryError("");
      const formData = new FormData();
      formData.append("caption", editGalleryCaption);
      formData.append("creator", editGalleryCreator);
      formData.append("layout", editGalleryLayout);
      formData.append("color", editGalleryColor);
      if (editGalleryFile) {
        formData.append("image", editGalleryFile);
      }

      await axios.put(`/api/creator/gallery/${editingGallery.id}`, formData);

      setEditingGallery(null);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
      setEditGalleryError("Failed to update gallery item");
    } finally {
      setLoading(false);
    }
  };

  const deleteGalleryItem = async (id, caption) => {
    if (!window.confirm(`Are you sure you want to remove photostrip preview "${caption}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/creator/gallery/${id}`);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteArtist = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/creator/artist/${id}`);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFrame = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove Theme Overlay "${name}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/creator/frame/${id}`);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSticker = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove custom sticker "${name}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/creator/sticker/${id}`);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowcaseSubmit = async (e) => {
    e.preventDefault();
    setShowcaseError("");
    setShowcaseSuccess("");

    if (!showcaseName.trim()) {
      return setShowcaseError("Theme title is required");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", showcaseName);
      formData.append("badge", showcaseBadge);
      formData.append("caption", showcaseCaption);
      formData.append("desc", showcaseDesc);
      formData.append("color", showcaseColor);
      formData.append("bg", showcaseBg);
      formData.append("overlayFrameId", showcaseOverlayFrameId);
      if (showcaseFile) {
        formData.append("image", showcaseFile);
      }

      const res = await axios.post("/api/creator/showcase", formData);

      if (res.data.success) {
        setShowcaseSuccess("Showcase theme registered successfully!");
        setShowcaseName("");
        setShowcaseBadge("CELEB_EVENT");
        setShowcaseCaption("");
        setShowcaseDesc("");
        setShowcaseColor("#F042FF");
        setShowcaseBg("linear-gradient(135deg, #020617, #0F3AE2)");
        setShowcaseOverlayFrameId("");
        setShowcaseFile(null);

        const fileInput = document.getElementById("showcase-file-input");
        if (fileInput) fileInput.value = "";

        fetchCreatorData();
      }
    } catch (err) {
      console.error(err);
      setShowcaseError(err.response?.data?.message || "Failed to register showcase theme");
    } finally {
      setLoading(false);
    }
  };

  const startEditShowcase = (theme) => {
    setEditingShowcase(theme);
    setEditShowcaseName(theme.name || "");
    setEditShowcaseBadge(theme.badge || "CELEB_EVENT");
    setEditShowcaseCaption(theme.caption || "");
    setEditShowcaseDesc(theme.desc || "");
    setEditShowcaseColor(theme.color || "#F042FF");
    setEditShowcaseBg(theme.bg || "linear-gradient(135deg, #020617, #0F3AE2)");
    setEditShowcaseOverlayFrameId(theme.overlayFrameId || "");
    setEditShowcaseFile(null);
    setEditShowcaseError("");
  };

  const handleEditShowcaseSubmit = async (e) => {
    e.preventDefault();
    setEditShowcaseError("");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", editShowcaseName);
      formData.append("badge", editShowcaseBadge);
      formData.append("caption", editShowcaseCaption);
      formData.append("desc", editShowcaseDesc);
      formData.append("color", editShowcaseColor);
      formData.append("bg", editShowcaseBg);
      formData.append("overlayFrameId", editShowcaseOverlayFrameId);
      if (editShowcaseFile) {
        formData.append("image", editShowcaseFile);
      }

      const res = await axios.put(`/api/creator/showcase/${editingShowcase.id}`, formData);

      if (res.data.success) {
        setEditingShowcase(null);
        fetchCreatorData();
      }
    } catch (err) {
      console.error(err);
      setEditShowcaseError(err.response?.data?.message || "Failed to update showcase theme");
    } finally {
      setLoading(false);
    }
  };

  const deleteShowcaseTheme = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove showcase theme "${title}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`/api/creator/showcase/${id}`);
      fetchCreatorData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomMockPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay flex items-center justify-center p-4">
        <div className="web3-grid-overlay" />
        <div className="web3-glass-card max-w-sm w-full p-6 bg-zinc-950/95 border-zinc-800 text-center relative z-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#F042FF] flex items-center justify-center text-[#F042FF]">
              <Key className="w-6 h-6" />
            </div>
          </div>
          <h2 className="font-display font-black text-white text-lg uppercase tracking-wider mb-1">CREATOR SECURITY GATE</h2>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-6">[ CREATOR ACCESS ONLY ]</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="ENTER CREATOR PASSCODE..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-center font-mono py-2.5"
            />
            <button type="submit" className="y2k-button w-full animate-hover-lift" style={{ padding: "10px" }}>
              AUTHENTICATE <ChevronRight className="w-4 h-4 inline" />
            </button>
          </form>
          {authError && (
            <p className="font-mono text-xs text-red-500 uppercase mt-4 tracking-wider animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> {authError}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay pb-24">
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar onLogout={handleLogout} />

      <div id="content" className="content max-w-7xl mx-auto px-4 pt-20 relative z-10">
        <div className="text-center mb-8">
          <div className="y2k-subtitle mb-2">✦ CAMPAIGN & ASSET CONTROLLER ✦</div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            DESIGNER
            <div className="y2k-highlight ml-2">PORTAL</div>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* COLUMN 1: UPLOAD FORMS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="web3-glass-card p-5">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-900">
                <span className="font-mono text-xs text-[#F042FF] tracking-wider">ASSET REGISTRATION</span>
                <span className="font-mono text-[9px] text-zinc-500">CREATOR STATION</span>
              </div>

              <div className="grid grid-cols-5 gap-1 mb-5">
                <button
                  onClick={() => { setActiveTab("artist"); setArtistError(""); setArtistSuccess(""); }}
                  className={`py-2 px-0.5 text-center font-mono text-[8px] sm:text-[9px] font-bold tracking-tight transition-all rounded-lg border ${
                    activeTab === "artist" 
                      ? "border-[#F042FF] bg-[#F042FF]/10 text-[#F042FF]" 
                      : "border-zinc-800 text-zinc-400 bg-none hover:border-zinc-700"
                  }`}
                  style={{ margin: 0 }}
                >
                  <Users className="w-3.5 h-3.5 mx-auto mb-1" /> COLLAB
                </button>
                <button
                  onClick={() => { setActiveTab("frame"); setFrameError(""); setFrameSuccess(""); }}
                  className={`py-2 px-0.5 text-center font-mono text-[8px] sm:text-[9px] font-bold tracking-tight transition-all rounded-lg border ${
                    activeTab === "frame" 
                      ? "border-[#F042FF] bg-[#F042FF]/10 text-[#F042FF]" 
                      : "border-zinc-800 text-zinc-400 bg-none hover:border-zinc-700"
                  }`}
                  style={{ margin: 0 }}
                >
                  <Layers className="w-3.5 h-3.5 mx-auto mb-1" /> OVERLAYS
                </button>
                <button
                  onClick={() => { setActiveTab("sticker"); setStickerError(""); setStickerSuccess(""); }}
                  className={`py-2 px-0.5 text-center font-mono text-[8px] sm:text-[9px] font-bold tracking-tight transition-all rounded-lg border ${
                    activeTab === "sticker" 
                      ? "border-[#F042FF] bg-[#F042FF]/10 text-[#F042FF]" 
                      : "border-zinc-800 text-zinc-400 bg-none hover:border-zinc-700"
                  }`}
                  style={{ margin: 0 }}
                >
                  <Smile className="w-3.5 h-3.5 mx-auto mb-1" /> DECOR
                </button>
                <button
                  onClick={() => { setActiveTab("gallery"); setGalleryError(""); setGallerySuccess(""); }}
                  className={`py-2 px-0.5 text-center font-mono text-[8px] sm:text-[9px] font-bold tracking-tight transition-all rounded-lg border ${
                    activeTab === "gallery" 
                      ? "border-[#F042FF] bg-[#F042FF]/10 text-[#F042FF]" 
                      : "border-zinc-800 text-zinc-400 bg-none hover:border-zinc-700"
                  }`}
                  style={{ margin: 0 }}
                >
                  <ImageIcon className="w-3.5 h-3.5 mx-auto mb-1" /> GALLERY
                </button>
                <button
                  onClick={() => { setActiveTab("showcase"); setShowcaseError(""); setShowcaseSuccess(""); }}
                  className={`py-2 px-0.5 text-center font-mono text-[8px] sm:text-[9px] font-bold tracking-tight transition-all rounded-lg border ${
                    activeTab === "showcase" 
                      ? "border-[#F042FF] bg-[#F042FF]/10 text-[#F042FF]" 
                      : "border-zinc-800 text-zinc-400 bg-none hover:border-zinc-700"
                  }`}
                  style={{ margin: 0 }}
                >
                  <Sparkles className="w-3.5 h-3.5 mx-auto mb-1" /> SHOWCASE
                </button>
              </div>

              {activeTab === "artist" && (
                <form onSubmit={handleArtistSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Collab Name</label>
                    <input
                      type="text"
                      placeholder="E.G. WONYOUNG..."
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Subtitle/Role</label>
                    <input
                      type="text"
                      placeholder="E.G. VISUAL VOCALIST..."
                      value={artistRole}
                      onChange={(e) => setArtistRole(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Accent Theme Color</label>
                      <input
                        type="color"
                        value={artistColor}
                        onChange={(e) => setArtistColor(e.target.value)}
                        className="w-full h-10 p-1 bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Gender</label>
                      <select value={isMale} onChange={(e) => setIsMale(e.target.value)}>
                        <option value="false">Female</option>
                        <option value="true">Male</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/50 border border-zinc-900 rounded-lg">
                    <span className="font-mono text-[9.5px] text-[#F042FF] uppercase tracking-wider block mb-2">4 REQUIRED POSE OVERLAYS (PNG)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col gap-0.5">
                          <span className="font-mono text-[8px] text-zinc-500">POSE #{i + 1} OVERLAY</span>
                          <input
                            type="file"
                            accept="image/png"
                            onChange={(e) => handlePoseChange(i, e.target.files[0])}
                            required
                            style={{ fontSize: "9px", padding: "4px" }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="y2k-button w-full" style={{ padding: "10px" }}>
                    LAUNCH CAMPAIGN <Upload className="w-4 h-4 inline" />
                  </button>

                  {artistError && <p className="font-mono text-xs text-red-500 text-center">{artistError}</p>}
                  {artistSuccess && <p className="font-mono text-xs text-green-400 text-center">{artistSuccess}</p>}
                </form>
              )}

              {activeTab === "frame" && (
                <form onSubmit={handleFrameSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Overlay Theme Name</label>
                    <input
                      type="text"
                      placeholder="E.G. HOLOGRAM STRIP..."
                      value={frameName}
                      onChange={(e) => setFrameName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Grid Layout</label>
                    <select value={frameLayout} onChange={(e) => setFrameLayout(e.target.value)}>
                      <option value="3-grid">3-Grid Film Strip</option>
                      <option value="4-grid">4-Grid Film Strip</option>
                      <option value="2x2">4 Photos (2x2 Grid)</option>
                      <option value="3x2">6 Photos (3x2 Grid)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Design File (Transparent PNG)</label>
                    <input
                      id="frame-file-input"
                      type="file"
                      accept="image/png"
                      onChange={(e) => setFrameFile(e.target.files[0])}
                      required
                    />
                  </div>

                  <button type="submit" className="y2k-button w-full" style={{ padding: "10px" }}>
                    REGISTER THEME OVERLAY <Upload className="w-4 h-4 inline" />
                  </button>

                  {frameError && <p className="font-mono text-xs text-red-500 text-center">{frameError}</p>}
                  {frameSuccess && <p className="font-mono text-xs text-green-400 text-center">{frameSuccess}</p>}
                </form>
              )}

              {activeTab === "sticker" && (
                <form onSubmit={handleStickerSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Sticker Name</label>
                    <input
                      type="text"
                      placeholder="E.G. HEART SHINE..."
                      value={stickerName}
                      onChange={(e) => setStickerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Sticker Type</label>
                    <select value={stickerType} onChange={(e) => setStickerType(e.target.value)}>
                      <option value="sticker">PNG Sticker</option>
                      <option value="doodle">PNG Doodle Stamp</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Element File (Transparent PNG)</label>
                    <input
                      type="file"
                      accept="image/png"
                      onChange={(e) => setStickerFile(e.target.files[0])}
                      required
                    />
                  </div>

                  <button type="submit" className="y2k-button w-full" style={{ padding: "10px" }}>
                    REGISTER ELEMENT <Upload className="w-4 h-4 inline" />
                  </button>

                  {stickerError && <p className="font-mono text-xs text-red-500 text-center">{stickerError}</p>}
                  {stickerSuccess && <p className="font-mono text-xs text-green-400 text-center">{stickerSuccess}</p>}
                </form>
              )}

              {activeTab === "gallery" && (
                <form onSubmit={handleGallerySubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Caption / Vibe Phrase</label>
                    <input
                      type="text"
                      placeholder="E.G. CLASSIC Y2K AURA ✦..."
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Creator Handle / Name</label>
                    <input
                      type="text"
                      placeholder="E.G. @lily..."
                      value={galleryCreator}
                      onChange={(e) => setGalleryCreator(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Grid Layout Mode</label>
                    <select value={galleryLayout} onChange={(e) => setGalleryLayout(e.target.value)}>
                      <option value="3-grid">3-Grid Film Strip</option>
                      <option value="4-grid">4-Grid Film Strip</option>
                      <option value="2x2">4 Photos (2x2 Grid)</option>
                      <option value="2x3">6 Photos (2x3 Grid)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Accent Theme Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={galleryColor}
                        onChange={(e) => setGalleryColor(e.target.value)}
                        className="w-10 h-8 p-0 border-2 border-zinc-800 bg-transparent rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={galleryColor}
                        onChange={(e) => setGalleryColor(e.target.value)}
                        placeholder="#F042FF"
                        className="font-mono uppercase flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Finished Output (JPG/PNG)</label>
                    <input
                      id="gallery-file-input"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => setGalleryFile(e.target.files[0])}
                      required
                    />
                  </div>

                  <button type="submit" className="y2k-button w-full" style={{ padding: "10px" }}>
                    REGISTER GALLERY STRIP <Upload className="w-4 h-4 inline" />
                  </button>

                  {galleryError && <p className="font-mono text-xs text-red-500 text-center">{galleryError}</p>}
                  {gallerySuccess && <p className="font-mono text-xs text-green-400 text-center">{gallerySuccess}</p>}
                </form>
              )}

              {activeTab === "showcase" && (
                <form onSubmit={handleShowcaseSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Theme Title / Name *</label>
                    <input
                      type="text"
                      placeholder="E.G. WONYOUNG BIRTHDAY SPECIAL..."
                      value={showcaseName}
                      onChange={(e) => setShowcaseName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Style Badge</label>
                      <select value={showcaseBadge} onChange={(e) => setShowcaseBadge(e.target.value)}>
                        <option value="CELEB_EVENT">CELEB_EVENT</option>
                        <option value="RETRO_POP">RETRO_POP</option>
                        <option value="SOFT_GIRL">SOFT_GIRL</option>
                        <option value="90S_CORE">90S_CORE</option>
                        <option value="GLITCH_99">GLITCH_99</option>
                        <option value="PIXEL_POP">PIXEL_POP</option>
                        <option value="LIMITED">LIMITED_EDITION</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={showcaseColor}
                          onChange={(e) => setShowcaseColor(e.target.value)}
                          className="w-9 h-9 p-0.5 border border-zinc-800 bg-transparent rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={showcaseColor}
                          onChange={(e) => setShowcaseColor(e.target.value)}
                          placeholder="#F042FF"
                          className="font-mono uppercase py-1 px-2 text-xs flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Caption / Quote Tagline</label>
                    <input
                      type="text"
                      placeholder="E.G. Aura: maxed out ✦"
                      value={showcaseCaption}
                      onChange={(e) => setShowcaseCaption(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Theme Description</label>
                    <textarea
                      placeholder="High-contrast frames with solid grid borders..."
                      value={showcaseDesc}
                      onChange={(e) => setShowcaseDesc(e.target.value)}
                      rows={2}
                      className="py-1.5 px-2 text-xs bg-zinc-900 border border-zinc-800 text-white rounded"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Link Blank Overlay (Optional)</label>
                    <select value={showcaseOverlayFrameId} onChange={(e) => setShowcaseOverlayFrameId(e.target.value)}>
                      <option value="">None / Custom Frame</option>
                      {customFrames.map(frm => (
                        <option key={frm.id} value={frm.id}>{frm.name} ({frm.layout})</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider">Sample Photoshoot Strip Output (JPG/PNG) *</label>
                    <input
                      id="showcase-file-input"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => setShowcaseFile(e.target.files[0])}
                    />
                    <span className="font-mono text-[8px] text-zinc-500">Upload sample photoshoot output combined with frame overlay for reference.</span>
                  </div>

                  <button type="submit" className="y2k-button w-full" style={{ padding: "10px" }}>
                    REGISTER SHOWCASE THEME <Upload className="w-4 h-4 inline" />
                  </button>

                  {showcaseError && <p className="font-mono text-xs text-red-500 text-center">{showcaseError}</p>}
                  {showcaseSuccess && <p className="font-mono text-xs text-green-400 text-center">{showcaseSuccess}</p>}
                </form>
              )}
            </div>

            {/* EDITING SUBPANELS */}
            {editingArtist && (
              <div className="web3-glass-card p-5 border-amber-500 bg-zinc-950/95">
                <div className="flex justify-between items-center mb-3 pb-1 border-b border-zinc-900 font-mono text-xs text-amber-500">
                  <span>✍️ EDIT ARTIST CAMPAIGN</span>
                  <button type="button" onClick={() => setEditingArtist(null)} className="admin-close-btn">✕</button>
                </div>
                <form onSubmit={handleEditArtistSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Artist Name"
                    value={editArtistName}
                    onChange={(e) => setEditArtistName(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Subtitle/Role"
                    value={editArtistRole}
                    onChange={(e) => setEditArtistRole(e.target.value)}
                  />
                  <button type="submit" className="y2k-button w-full" style={{ padding: "8px" }}>
                    SAVE CHANGES
                  </button>
                  {editArtistError && <p className="text-red-500 font-mono text-xs text-center">{editArtistError}</p>}
                </form>
              </div>
            )}

            {editingGallery && (
              <div className="web3-glass-card p-5 border-amber-500 bg-zinc-950/95">
                <div className="flex justify-between items-center mb-3 pb-1 border-b border-zinc-900 font-mono text-xs text-amber-500">
                  <span>✍️ EDIT GALLERY STRIP</span>
                  <button type="button" onClick={() => setEditingGallery(null)} className="admin-close-btn">✕</button>
                </div>
                <form onSubmit={handleEditGallerySubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Caption / Vibe</label>
                    <input
                      type="text"
                      placeholder="Caption"
                      value={editGalleryCaption}
                      onChange={(e) => setEditGalleryCaption(e.target.value)}
                      required
                      className="py-1.5 px-2 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Creator Handle</label>
                    <input
                      type="text"
                      placeholder="Creator"
                      value={editGalleryCreator}
                      onChange={(e) => setEditGalleryCreator(e.target.value)}
                      required
                      className="py-1.5 px-2 text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Layout Mode</label>
                    <select 
                      value={editGalleryLayout} 
                      onChange={(e) => setEditGalleryLayout(e.target.value)}
                      className="py-1.5 px-2 text-xs bg-zinc-900 border border-zinc-800 text-white rounded"
                    >
                      <option value="3-grid">3-Grid Film Strip</option>
                      <option value="4-grid">4-Grid Film Strip</option>
                      <option value="2x2">4 Photos (2x2 Grid)</option>
                      <option value="2x3">6 Photos (2x3 Grid)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Theme Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editGalleryColor}
                        onChange={(e) => setEditGalleryColor(e.target.value)}
                        className="w-8 h-8 p-0 border border-zinc-800 bg-transparent rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editGalleryColor}
                        onChange={(e) => setEditGalleryColor(e.target.value)}
                        placeholder="#F042FF"
                        className="font-mono uppercase py-1 px-2 text-xs flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Replacement File (Optional)</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => setEditGalleryFile(e.target.files[0])}
                      className="text-xs"
                    />
                  </div>

                  <button type="submit" className="y2k-button w-full" style={{ padding: "8px" }}>
                    SAVE GALLERY CHANGES
                  </button>

                  {editGalleryError && <p className="text-red-500 font-mono text-xs text-center">{editGalleryError}</p>}
                </form>
              </div>
            )}

            {editingShowcase && (
              <div className="web3-glass-card p-5 border-amber-500 bg-zinc-950/95">
                <div className="flex justify-between items-center mb-3 pb-1 border-b border-zinc-900 font-mono text-xs text-amber-500">
                  <span>✍️ EDIT SHOWCASE THEME</span>
                  <button type="button" onClick={() => setEditingShowcase(null)} className="admin-close-btn">✕</button>
                </div>
                <form onSubmit={handleEditShowcaseSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Theme Title</label>
                    <input
                      type="text"
                      placeholder="Theme Title"
                      value={editShowcaseName}
                      onChange={(e) => setEditShowcaseName(e.target.value)}
                      required
                      className="py-1.5 px-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-500 uppercase">Badge</label>
                      <select 
                        value={editShowcaseBadge} 
                        onChange={(e) => setEditShowcaseBadge(e.target.value)}
                        className="py-1.5 px-2 text-xs bg-zinc-900 border border-zinc-800 text-white rounded"
                      >
                        <option value="CELEB_EVENT">CELEB_EVENT</option>
                        <option value="RETRO_POP">RETRO_POP</option>
                        <option value="SOFT_GIRL">SOFT_GIRL</option>
                        <option value="90S_CORE">90S_CORE</option>
                        <option value="GLITCH_99">GLITCH_99</option>
                        <option value="PIXEL_POP">PIXEL_POP</option>
                        <option value="LIMITED">LIMITED_EDITION</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-[8px] text-zinc-500 uppercase">Accent Color</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={editShowcaseColor}
                          onChange={(e) => setEditShowcaseColor(e.target.value)}
                          className="w-7 h-7 p-0 bg-zinc-900 border border-zinc-800 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editShowcaseColor}
                          onChange={(e) => setEditShowcaseColor(e.target.value)}
                          className="py-1 px-1.5 text-xs font-mono uppercase bg-zinc-900 border border-zinc-800 text-white rounded flex-1 min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Caption / Tagline</label>
                    <input
                      type="text"
                      placeholder="Caption"
                      value={editShowcaseCaption}
                      onChange={(e) => setEditShowcaseCaption(e.target.value)}
                      className="py-1.5 px-2 text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Description</label>
                    <textarea
                      placeholder="Description"
                      value={editShowcaseDesc}
                      onChange={(e) => setEditShowcaseDesc(e.target.value)}
                      rows={2}
                      className="py-1.5 px-2 text-xs bg-zinc-900 border border-zinc-800 text-white rounded"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">Link Blank Overlay (Optional)</label>
                    <select 
                      value={editShowcaseOverlayFrameId} 
                      onChange={(e) => setEditShowcaseOverlayFrameId(e.target.value)}
                      className="py-1.5 px-2 text-xs bg-zinc-900 border border-zinc-800 text-white rounded"
                    >
                      <option value="">None / Custom Frame</option>
                      {customFrames.map(frm => (
                        <option key={frm.id} value={frm.id}>{frm.name} ({frm.layout})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[8px] text-zinc-500 uppercase">New Sample Output Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={(e) => setEditShowcaseFile(e.target.files[0])}
                      className="text-xs"
                    />
                  </div>
                  <button type="submit" className="y2k-button w-full" style={{ padding: "8px" }}>
                    SAVE SHOWCASE CHANGES
                  </button>
                  {editShowcaseError && <p className="text-red-500 font-mono text-xs text-center">{editShowcaseError}</p>}
                </form>
              </div>
            )}
          </div>

          {/* COLUMN 2: ACTIVE ASSET LOGS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="web3-glass-card p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <span className="font-mono text-xs text-[#F042FF] tracking-wider">LIVE DESIGNER ASSETS</span>
              </div>

              <div className="flex flex-col gap-3 overflow-y-auto max-h-[580px] pr-1 scrollbar-thin">
                {activeTab === "artist" && (
                  customArtists.length === 0 ? (
                    <p className="font-mono text-[10px] text-zinc-500 text-center py-6">NO ACTIVE CAMPAIGNS</p>
                  ) : (
                    customArtists.map(art => (
                      <div key={art.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0" style={{ background: art.color || "#F042FF", color: "#ffffff" }}>
                            {art.name[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs text-white truncate max-w-[140px]">{art.name}</div>
                            <span className="font-mono text-[8px] text-zinc-500 uppercase block truncate">{art.role}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => startEditArtist(art)} className="admin-icon-btn" title="Edit Artist Campaign">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => deleteArtist(art.id, art.name)} className="admin-icon-btn-danger" title="Delete Artist Campaign">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTab === "frame" && (
                  customFrames.length === 0 ? (
                    <p className="font-mono text-[10px] text-zinc-500 text-center py-6">NO ACTIVE OVERLAYS</p>
                  ) : (
                    customFrames.map(frm => (
                      <div key={frm.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <button type="button" onClick={() => { setPreviewSelectedFrame(frm.imageSrc); setPreviewLayout(frm.layout); }} className="w-8 h-8 bg-zinc-950 border border-zinc-800 flex items-center justify-center hover:border-[#F042FF] transition cursor-pointer shrink-0 rounded">
                            <Eye className="w-4 h-4 text-[#F042FF]" />
                          </button>
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs text-white truncate max-w-[140px]">{frm.name}</div>
                            <span className="font-mono text-[8px] text-zinc-500 uppercase block truncate">{frm.layout}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => deleteFrame(frm.id, frm.name)} className="admin-icon-btn-danger" title="Delete Overlay Frame">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTab === "sticker" && (
                  customStickers.length === 0 ? (
                    <p className="font-mono text-[10px] text-zinc-500 text-center py-6">NO ACTIVE STICKERS</p>
                  ) : (
                    customStickers.map(stk => (
                      <div key={stk.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img src={stk.imageSrc} alt={stk.name} referrerPolicy="no-referrer" className="w-8 h-8 object-contain bg-zinc-950 p-1 border border-zinc-800 rounded shrink-0" />
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs text-white truncate max-w-[140px]">{stk.name}</div>
                            <span className="font-mono text-[8px] text-zinc-500 uppercase block truncate">{stk.type}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => deleteSticker(stk.id, stk.name)} className="admin-icon-btn-danger" title="Delete Sticker">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTab === "gallery" && (
                  galleryItems.length === 0 ? (
                    <p className="font-mono text-[10px] text-zinc-500 text-center py-6">NO ACTIVE GALLERY PREVIEWS</p>
                  ) : (
                    galleryItems.map(item => (
                      <div key={item.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img 
                            src={item.imageSrc} 
                            alt={item.caption} 
                            referrerPolicy="no-referrer" 
                            className="w-8 h-12 object-cover bg-zinc-950 border border-zinc-800 rounded shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs text-white truncate max-w-[140px]">{item.caption}</div>
                            <div className="flex items-center gap-1.5 font-mono text-[8px] text-zinc-500 uppercase">
                              <span>{item.creator}</span>
                              <span>•</span>
                              <span style={{ color: item.color }}>{item.layout}</span>
                              <span>•</span>
                              <span className="flex items-center text-rose-400 gap-0.5">
                                <Heart className="w-2 h-2 fill-current" /> {item.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => startEditGallery(item)} className="admin-icon-btn" title="Edit Gallery Item">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => deleteGalleryItem(item.id, item.caption)} className="admin-icon-btn-danger" title="Delete Gallery Item">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}

                {activeTab === "showcase" && (
                  customShowcases.length === 0 ? (
                    <p className="font-mono text-[10px] text-zinc-500 text-center py-6">NO ACTIVE SHOWCASE THEMES</p>
                  ) : (
                    customShowcases.map(thm => (
                      <div key={thm.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img 
                            src={thm.image} 
                            alt={thm.name} 
                            referrerPolicy="no-referrer" 
                            className="w-8 h-10 object-cover bg-zinc-950 border border-zinc-800 rounded shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-xs text-white truncate max-w-[140px]">{thm.name}</div>
                            <div className="flex items-center gap-1.5 font-mono text-[8px] text-zinc-500 uppercase">
                              <span style={{ color: thm.color || "#F042FF" }}>{thm.badge}</span>
                              {thm.caption && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[80px]">{thm.caption}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button type="button" onClick={() => startEditShowcase(thm)} className="admin-icon-btn" title="Edit Showcase Theme">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button type="button" onClick={() => deleteShowcaseTheme(thm.id, thm.name)} className="admin-icon-btn-danger" title="Delete Showcase Theme">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: REALTIME LIVE PREVIEW */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="web3-glass-card p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                <span className="font-mono text-xs text-purple-400 tracking-wider">REALTIME THEME PREVIEW</span>
              </div>

              <div className="flex flex-col gap-3 font-mono text-[10px] text-zinc-500 leading-normal">
                <div className="flex justify-between items-center">
                  <span>Layout Selector:</span>
                  <select 
                    value={previewLayout} 
                    onChange={(e) => setPreviewLayout(e.target.value)}
                    className="p-1 bg-zinc-900 border border-zinc-800 text-[9px]"
                  >
                    <option value="3-grid">3-Grid Strip</option>
                    <option value="4-grid">4-Grid Strip</option>
                    <option value="2x2">2x2 Square</option>
                    <option value="3x2">3x2 Portfolio</option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <span>Simulated BG:</span>
                  <select 
                    value={simulatedBackground} 
                    onChange={(e) => setSimulatedBackground(e.target.value)}
                    className="p-1 bg-zinc-900 border border-zinc-800 text-[9px]"
                  >
                    <option value="linear-gradient(135deg, #FFE5F1 0%, #F042FF 50%, #7226FF 100%)">🍭 Electric Neon Dream</option>
                    <option value="#ffffff">⚪ Solid White</option>
                    <option value="#000000">⚫ Solid Black</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-900 bg-black/80 flex items-center justify-center min-h-[300px] overflow-hidden">
                {previewSelectedFrame ? (
                  <div className="relative p-3 bg-white shadow-[0_0_15px_rgba(255,255,255,0.05)] flex flex-col items-center gap-1.5 w-full max-w-[180px]">
                    
                    <div className={`grid gap-1 w-full ${previewLayout === "2x2" || previewLayout === "3x2" ? "grid-cols-2" : "grid-cols-1"}`}>
                      {Array.from({ length: previewLayout === "3-grid" ? 3 : previewLayout === "4-grid" ? 4 : previewLayout === "2x2" ? 4 : 6 }).map((_, slotIdx) => (
                        <div
                          key={slotIdx}
                          style={{
                            aspectRatio: "3/2.2",
                            background: customPreviewImage ? `url(${customPreviewImage}) center/cover` : simulatedBackground,
                            borderRadius: "0px"
                          }}
                          className="border border-black/10 flex items-center justify-center text-[7px] text-white/50 font-mono font-bold"
                        >
                          {!customPreviewImage && `SL_0${slotIdx + 1}`}
                        </div>
                      ))}
                    </div>

                    <img
                      src={previewSelectedFrame}
                      alt="Overlay Viewport"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-stretch pointer-events-none z-10"
                    />
                    <span className="text-[6px] tracking-widest text-zinc-500 font-mono mt-1 z-20">SNPSHOT PREVIEW</span>
                  </div>
                ) : (
                  <p className="font-mono text-[9px] text-zinc-600 text-center">NO OVERLAY SELECTED</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[9px] text-zinc-500">SIMULATE MOCK IMAGE</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomMockPhoto}
                  style={{ fontSize: "8.5px", padding: "4px" }}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
