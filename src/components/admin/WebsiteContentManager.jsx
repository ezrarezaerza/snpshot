import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Tv, 
  Megaphone, 
  Globe, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  RefreshCw, 
  Check, 
  Save, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Layers, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Link as LinkIcon, 
  Share2, 
  MessageCircle, 
  ExternalLink,
  Sparkles,
  Zap,
  Play,
  Pause,
  MessageSquare
} from "lucide-react";

const WebsiteContentManager = () => {
  const [marqueeItems, setMarqueeItems] = useState([]);
  const [websiteContent, setWebsiteContent] = useState({
    brandName: "SNPSHOT Studio",
    tagline: "Digital Self-Photo Booth & High-Res Photostrip Studio",
    copyrightText: "© 2026 SNPSHOT Studio. All rights reserved. Built for photography enthusiasts.",
    contactEmail: "hello@snpshot.studio",
    socials: {
      instagram: "https://instagram.com/snpshot.studio",
      tiktok: "https://tiktok.com/@snpshot.studio",
      twitter: "https://twitter.com/snpshotstudio",
      youtube: "https://youtube.com/@snpshotstudio"
    },
    pipelineSteps: [
      { step: "01", title: "Select Layout", desc: "Choose 3-Grid Vertical, Classic 4-Strip, 2x2 Square Grid, or 2x3 Postcard format." },
      { step: "02", title: "Capture Photos", desc: "Use live camera shutter countdown and real-time pose guidance overlays." },
      { step: "03", title: "Customize & Decorate", desc: "Apply frame backgrounds, studio color filters, digital stamps, and text stickers." },
      { step: "04", title: "Download & Share", desc: "Render high-resolution 300 DPI composite canvas for instant digital download or print." }
    ],
    faqs: [
      { id: "faq-1", question: "How high is the resolution of exported photostrips?", answer: "All photostrips export at 300 DPI high-resolution canvas print quality (up to 1800px) ideal for physical printing or social sharing." },
      { id: "faq-2", question: "Are my photos stored privately on the server?", answer: "Your captured photos stay entirely inside your browser session during customization. Server exports are created only when shared to the gallery." },
      { id: "faq-3", question: "Can I customize frame colors and digital stamps?", answer: "Yes! Choose from artist collaboration frames, solid studio border colors, gradient backgrounds, and aesthetic sticker stamps." }
    ]
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("marquee"); // 'marquee' (7A) | 'content' (7B) | 'workbench' (7C)
  const [marqueeFilter, setMarqueeFilter] = useState("all"); // 'all' | 'top' | 'bottom'

  // Phase 7A: Marquee Modal State
  const [isMarqueeModalOpen, setIsMarqueeModalOpen] = useState(false);
  const [editingMarquee, setEditingMarquee] = useState(null);
  const [savingMarquee, setSavingMarquee] = useState(false);
  const [marqueeFormData, setMarqueeFormData] = useState({
    badge: "✨ FEATURED",
    text: "",
    link: "/studio",
    placement: "top", // 'top' | 'bottom' | 'both'
    speedSec: 20,
    bgColor: "#010030",
    textColor: "#F042FF",
    active: true
  });

  // Phase 7B: Content Save State
  const [savingContent, setSavingContent] = useState(false);
  const [contentSuccess, setContentSuccess] = useState(false);

  // FAQ Edit State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqFormData, setFaqFormData] = useState({
    question: "",
    answer: ""
  });

  // Phase 7C: Motion Bench & Viewport State
  const [previewViewport, setPreviewViewport] = useState("desktop"); // 'desktop' (100%), 'tablet' (768px), 'mobile' (375px)
  const [activeTestMarqueeId, setActiveTestMarqueeId] = useState("");
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);

  // Fetch Marquee & Content
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMarquee, resContent] = await Promise.all([
        axios.get("/api/creator/marquee"),
        axios.get("/api/creator/website-content")
      ]);

      if (resMarquee.data && resMarquee.data.marqueeItems) {
        setMarqueeItems(resMarquee.data.marqueeItems);
        if (resMarquee.data.marqueeItems.length > 0) {
          setActiveTestMarqueeId(resMarquee.data.marqueeItems[0].id);
        }
      }

      if (resContent.data && resContent.data.websiteContent) {
        setWebsiteContent(resContent.data.websiteContent);
      }
    } catch (err) {
      console.error("Error fetching marquee and website content:", err);
      setError("Failed to load website content and announcement banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Marquee CRUD
  const handleToggleActiveMarquee = async (id, currentActive) => {
    try {
      await axios.put(`/api/creator/marquee/${id}`, { active: !currentActive });
      fetchData();
    } catch (err) {
      console.error("Error toggling marquee active status:", err);
    }
  };

  const handleDeleteMarquee = async (id) => {
    if (!window.confirm("Delete this marquee announcement banner?")) return;
    try {
      await axios.delete(`/api/creator/marquee/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting marquee item:", err);
    }
  };

  const openCreateMarqueeModal = () => {
    setEditingMarquee(null);
    setMarqueeFormData({
      badge: "✨ FEATURED",
      text: "",
      link: "/studio",
      placement: "top",
      speedSec: 20,
      bgColor: "#010030",
      textColor: "#F042FF",
      active: true
    });
    setIsMarqueeModalOpen(true);
  };

  const openEditMarqueeModal = (item) => {
    setEditingMarquee(item);
    setMarqueeFormData({
      badge: item.badge || "✨ FEATURED",
      text: item.text || "",
      link: item.link || "/studio",
      placement: item.placement || "top",
      speedSec: item.speedSec || 20,
      bgColor: item.bgColor || "#010030",
      textColor: item.textColor || "#F042FF",
      active: item.active !== undefined ? item.active : true
    });
    setIsMarqueeModalOpen(true);
  };

  const handleMarqueeFormSubmit = async (e) => {
    e.preventDefault();
    setSavingMarquee(true);

    try {
      if (editingMarquee) {
        await axios.put(`/api/creator/marquee/${editingMarquee.id}`, marqueeFormData);
      } else {
        await axios.post("/api/creator/marquee", marqueeFormData);
      }
      setIsMarqueeModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Error saving marquee item:", err);
      alert("Failed to save marquee banner.");
    } finally {
      setSavingMarquee(false);
    }
  };

  // Phase 7B: Save Website Content
  const handleSaveWebsiteContent = async () => {
    setSavingContent(true);
    setContentSuccess(false);

    try {
      await axios.put("/api/creator/website-content", websiteContent);
      setContentSuccess(true);
      setTimeout(() => setContentSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving website content:", err);
      alert("Failed to save website content.");
    } finally {
      setSavingContent(false);
    }
  };

  // FAQ Handlers
  const openCreateFaqModal = () => {
    setEditingFaq(null);
    setFaqFormData({ question: "", answer: "" });
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = (faq) => {
    setEditingFaq(faq);
    setFaqFormData({ question: faq.question || "", answer: faq.answer || "" });
    setIsFaqModalOpen(true);
  };

  const handleFaqFormSubmit = (e) => {
    e.preventDefault();
    const updatedFaqs = [...(websiteContent.faqs || [])];

    if (editingFaq) {
      const idx = updatedFaqs.findIndex(f => f.id === editingFaq.id);
      if (idx !== -1) {
        updatedFaqs[idx] = { ...editingFaq, ...faqFormData };
      }
    } else {
      updatedFaqs.push({
        id: `faq-${Date.now()}`,
        ...faqFormData
      });
    }

    setWebsiteContent({ ...websiteContent, faqs: updatedFaqs });
    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = (id) => {
    const updatedFaqs = (websiteContent.faqs || []).filter(f => f.id !== id);
    setWebsiteContent({ ...websiteContent, faqs: updatedFaqs });
  };

  const filteredMarqueeItems = marqueeItems.filter(item => {
    if (marqueeFilter === "all") return true;
    if (marqueeFilter === "top") return item.placement === "top" || item.placement === "both" || !item.placement;
    if (marqueeFilter === "bottom") return item.placement === "bottom" || item.placement === "both";
    return true;
  });

  const selectedTestMarquee = marqueeItems.find(m => m.id === activeTestMarqueeId) || marqueeItems[0];

  return (
    <div className="space-y-6">

      {/* TOP STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Active Marquee Banners
            </span>
            <div className="text-3xl font-black text-[#010030]">
              {marqueeItems.filter(m => m.active).length} / {marqueeItems.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Scrolling Header Ticker</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f0ecf8] text-[#7226FF] flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              How-It-Works Pipeline Steps
            </span>
            <div className="text-3xl font-black text-[#7226FF]">
              {websiteContent.pipelineSteps?.length || 4} Steps
            </div>
            <span className="text-[10px] text-[#7226FF] font-medium">Studio Workflow Guide</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7226FF] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Privacy & FAQ Items
            </span>
            <div className="text-3xl font-black text-[#010030]">
              {websiteContent.faqs?.length || 0}
            </div>
            <span className="text-[10px] text-[#7226FF] font-medium">Rendered on /privacy-policy</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#010030] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e2dced] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-1">
              Connected Socials
            </span>
            <div className="text-3xl font-black text-[#F042FF]">
              {Object.keys(websiteContent.socials || {}).filter(k => websiteContent.socials[k]).length} Links
            </div>
            <span className="text-[10px] text-[#F042FF] font-medium">Footer Social Handles</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#F042FF] flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-white border border-[#e2dced] rounded-2xl p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "marquee", label: "Marquee Ticker & Announcement Banners", icon: Megaphone },
            { id: "content", label: "Website Content, Workflow & FAQs", icon: FileText },
            { id: "workbench", label: "Live Motion Bench & Viewport Preview", icon: Monitor }
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

        {activeTab === "marquee" && (
          <button
            onClick={openCreateMarqueeModal}
            className="admin-btn bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_4px_12px_rgba(114,38,255,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Marquee Banner</span>
          </button>
        )}

        {activeTab === "content" && (
          <button
            onClick={handleSaveWebsiteContent}
            disabled={savingContent}
            className="admin-btn bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] hover:opacity-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_4px_12px_rgba(114,38,255,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{savingContent ? "Saving..." : "Save Website Content"}</span>
          </button>
        )}
      </div>

      {/* MAIN TAB CONTENT */}
      {loading ? (
        <div className="bg-white border border-[#e2dced] rounded-3xl p-12 text-center text-[#625b82] text-xs flex items-center justify-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-[#7226FF]" />
          <span>Loading Announcement Banners & Website Content...</span>
        </div>
      ) : error ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 text-center text-rose-600 text-xs">
          {error}
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* PHASE 7A: MARQUEE TICKER & ANNOUNCEMENT BANNER MANAGER */}
          {/* ========================================================================= */}
          {activeTab === "marquee" && (
            <div className="space-y-6">

              {/* HOMEPAGE TICKER ARCHITECTURE MAP & GUIDE */}
              <div className="bg-gradient-to-br from-[#0e0048] via-[#010030] to-[#160078] border border-[#2e109d] rounded-3xl p-6 text-white shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F042FF] font-mono block">
                      HOMEPAGE TICKER PLACEMENT MAP
                    </span>
                    <h4 className="font-sans font-black text-lg text-white uppercase tracking-tight flex items-center gap-2">
                      <span>Where Marquee Tickers Appear On The Homepage</span>
                    </h4>
                  </div>
                  <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full text-slate-300 font-mono">
                    2 Live Ticker Locations on Homepage
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Position 1: Top Ticker */}
                  <div className="bg-white/5 border border-white/15 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F042FF] text-[#010030]">
                        1. Top Ticker (Below Hero Banner)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {marqueeItems.filter(m => m.active && (m.placement === 'top' || m.placement === 'both' || !m.placement)).length} Active
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Displays in a dark navy strip right below the main photo booth Hero section on the homepage. All active Top banners loop infinitely from right to left.
                    </p>
                  </div>

                  {/* Position 2: Bottom Ticker */}
                  <div className="bg-white/5 border border-white/15 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#7226FF] text-white">
                        2. Bottom Ticker (Above Footer)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">
                        {marqueeItems.filter(m => m.active && (m.placement === 'bottom' || m.placement === 'both')).length} Active
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Displays in a vibrant magenta/purple gradient strip directly above the footer. All active Bottom banners loop infinitely across the bottom of the page.
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-3 text-[11px] text-slate-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#F042FF] shrink-0 mt-0.5" />
                  <span>
                    <strong>Why Multiple Banners Are Active:</strong> All active banners for each position are concatenated together and scroll continuously in a seamless infinite marquee strip. If you only want one banner to appear, simply click <strong>"Disabled"</strong> on the others.
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ebf7] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                      <Megaphone className="w-5 h-5 text-[#7226FF]" />
                      <span>Studio Announcement Marquee Banners</span>
                    </h3>
                    <p className="text-xs text-[#625b82]">
                      Configure banner text, colors, scroll duration, and homepage position (Top vs Bottom).
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center bg-[#f8f7fc] border border-[#e2dced] p-1 rounded-2xl gap-1">
                    {[
                      { id: "all", label: "All Banners" },
                      { id: "top", label: "Top Ticker (Hero)" },
                      { id: "bottom", label: "Bottom Ticker (Footer)" }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setMarqueeFilter(f.id)}
                        className={`admin-btn px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          marqueeFilter === f.id
                            ? "bg-[#010030] text-white shadow-2xs"
                            : "text-[#625b82] hover:text-[#010030]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Marquee Banner List */}
                <div className="space-y-3">
                  {filteredMarqueeItems.map((item) => {
                    const placementLabel = 
                      item.placement === "bottom" ? "Bottom Ticker (Above Footer)" :
                      item.placement === "both" ? "Both Top & Bottom" : "Top Ticker (Below Hero)";
                    const placementBadgeColor = 
                      item.placement === "bottom" ? "bg-purple-100 text-purple-800 border-purple-200" :
                      item.placement === "both" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-blue-100 text-blue-800 border-blue-200";

                    return (
                      <div 
                        key={item.id}
                        className="bg-white border border-[#e2dced] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden max-w-full"
                      >
                        {/* Left: Marquee Live Pill Preview */}
                        <div className="space-y-2 flex-1 min-w-0 max-w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span 
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-white/20 shrink-0"
                              style={{ backgroundColor: item.bgColor, color: item.textColor }}
                            >
                              {item.badge}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${placementBadgeColor} shrink-0`}>
                              📍 {placementLabel}
                            </span>

                            <span className="text-[11px] font-mono text-[#625b82] truncate">
                              Speed: {item.speedSec}s • Target: {item.link}
                            </span>
                          </div>

                          {/* Scrolling Banner Strip Preview */}
                          <div 
                            className="w-full py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-wider overflow-hidden shadow-inner border border-white/10"
                            style={{ backgroundColor: item.bgColor, color: item.textColor }}
                          >
                            <span className="block truncate">
                              {item.badge} &nbsp;•&nbsp; {item.text}
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => handleToggleActiveMarquee(item.id, item.active)}
                            className={`admin-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              item.active ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {item.active ? "Active" : "Disabled"}
                          </button>

                          <button
                            onClick={() => {
                              setActiveTestMarqueeId(item.id);
                              setActiveTab("workbench");
                            }}
                            className="admin-btn p-2 hover:bg-[#f0ecf8] text-[#7226FF] rounded-xl"
                            title="Test Motion in Workbench"
                          >
                            <Tv className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => openEditMarqueeModal(item)}
                            className="admin-btn p-2 hover:bg-[#f0ecf8] text-[#7226FF] rounded-xl"
                            title="Edit Banner"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteMarquee(item.id)}
                            className="admin-btn p-2 hover:bg-rose-50 text-rose-600 rounded-xl"
                            title="Delete Banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 7B: WEBSITE CONTENT, HOW-IT-WORKS STEPS & FAQ MANAGER */}
          {/* ========================================================================= */}
          {activeTab === "content" && (
            <div className="space-y-6">
              
              {contentSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-3 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Website content & FAQ settings saved successfully!</span>
                </div>
              )}

              {/* 1. BRANDING & FOOTER COPY */}
              <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#010030] flex items-center gap-2 border-b border-[#f0ebf7] pb-3">
                  <Globe className="w-5 h-5 text-[#7226FF]" />
                  <span>Brand Info & Footer Configuration</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Brand Name</label>
                    <input 
                      type="text"
                      value={websiteContent.brandName || ""}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, brandName: e.target.value })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1">Contact Email</label>
                    <input 
                      type="email"
                      value={websiteContent.contactEmail || ""}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, contactEmail: e.target.value })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#010030] mb-1">Brand Tagline</label>
                    <input 
                      type="text"
                      value={websiteContent.tagline || ""}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, tagline: e.target.value })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-[#010030] mb-1">Copyright Footer Text</label>
                    <input 
                      type="text"
                      value={websiteContent.copyrightText || ""}
                      onChange={(e) => setWebsiteContent({ ...websiteContent, copyrightText: e.target.value })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. SOCIAL MEDIA LINKS */}
              <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#010030] flex items-center gap-2 border-b border-[#f0ebf7] pb-3">
                  <LinkIcon className="w-5 h-5 text-[#F042FF]" />
                  <span>Social Media Links</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#010030] mb-1 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-pink-600" /> Instagram
                    </label>
                    <input 
                      type="text"
                      value={websiteContent.socials?.instagram || ""}
                      onChange={(e) => setWebsiteContent({ 
                        ...websiteContent, 
                        socials: { ...(websiteContent.socials || {}), instagram: e.target.value } 
                      })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7226FF]" /> TikTok
                    </label>
                    <input 
                      type="text"
                      value={websiteContent.socials?.tiktok || ""}
                      onChange={(e) => setWebsiteContent({ 
                        ...websiteContent, 
                        socials: { ...(websiteContent.socials || {}), tiktok: e.target.value } 
                      })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-sky-500" /> Twitter / X
                    </label>
                    <input 
                      type="text"
                      value={websiteContent.socials?.twitter || ""}
                      onChange={(e) => setWebsiteContent({ 
                        ...websiteContent, 
                        socials: { ...(websiteContent.socials || {}), twitter: e.target.value } 
                      })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#010030] mb-1 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-red-600" /> YouTube
                    </label>
                    <input 
                      type="text"
                      value={websiteContent.socials?.youtube || ""}
                      onChange={(e) => setWebsiteContent({ 
                        ...websiteContent, 
                        socials: { ...(websiteContent.socials || {}), youtube: e.target.value } 
                      })}
                      className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. HOW IT WORKS PIPELINE STEPS */}
              <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#010030] flex items-center gap-2 border-b border-[#f0ebf7] pb-3">
                  <Layers className="w-5 h-5 text-[#7226FF]" />
                  <span>Studio 4-Step Pipeline Guide Copy</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(websiteContent.pipelineSteps || []).map((pStep, index) => (
                    <div key={index} className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-4 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#010030] text-[#F042FF] font-mono font-bold flex items-center justify-center text-[10px]">
                          {pStep.step}
                        </span>
                        <input 
                          type="text"
                          value={pStep.title}
                          onChange={(e) => {
                            const newSteps = [...websiteContent.pipelineSteps];
                            newSteps[index].title = e.target.value;
                            setWebsiteContent({ ...websiteContent, pipelineSteps: newSteps });
                          }}
                          className="admin-ui flex-1 bg-white border border-[#e2dced] font-bold text-[#010030] px-2.5 py-1 rounded-lg"
                        />
                      </div>
                      <textarea 
                        rows={2}
                        value={pStep.desc}
                        onChange={(e) => {
                          const newSteps = [...websiteContent.pipelineSteps];
                          newSteps[index].desc = e.target.value;
                          setWebsiteContent({ ...websiteContent, pipelineSteps: newSteps });
                        }}
                        className="admin-ui w-full bg-white border border-[#e2dced] text-[#625b82] p-2 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. FAQ ACCORDION MANAGER (Rendered on /privacy-policy) */}
              <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0ebf7] pb-3">
                  <div>
                    <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[#7226FF]" />
                      <span>Privacy Policy & FAQ Questions (/privacy-policy Page)</span>
                    </h3>
                    <p className="text-xs text-[#625b82]">
                      Manage frequently asked questions, print specifications (300 DPI), and data privacy statements displayed on the <code className="bg-[#f0ecf8] text-[#7226FF] px-1 py-0.5 rounded font-mono">/privacy-policy</code> page.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn bg-[#f8f7fc] hover:bg-[#eae6f3] border border-[#e2dced] text-[#010030] font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#7226FF]" />
                      <span>View Live Page ↗</span>
                    </a>

                    <button
                      type="button"
                      onClick={openCreateFaqModal}
                      className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ Item</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(websiteContent.faqs || []).map((faq) => (
                    <div key={faq.id} className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-4 text-xs space-y-1.5 flex justify-between items-start gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="font-bold text-[#010030] flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-[#7226FF]" />
                          <span>{faq.question}</span>
                        </div>
                        <p className="text-[#625b82] pl-5">{faq.answer}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditFaqModal(faq)}
                          className="admin-btn p-1.5 hover:bg-white text-[#7226FF] rounded-lg"
                          title="Edit FAQ Item"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(faq.id)}
                          className="admin-btn p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg"
                          title="Delete FAQ Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 7C: LIVE MOTION BENCH & VIEWPORT PREVIEW */}
          {/* ========================================================================= */}
          {activeTab === "workbench" && (
            <div className="bg-white border border-[#e2dced] rounded-3xl p-6 shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#f0ebf7] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#F042FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Motion Bench
                    </span>
                    <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                      <Tv className="w-5 h-5 text-[#7226FF]" />
                      <span>Live Marquee Motion Bench & Multi-Device Viewport</span>
                    </h3>
                  </div>
                  <p className="text-xs text-[#625b82]">
                    Simulate real-time CSS marquee ticker animation scrolling speed, color contrast, and responsive layout across devices.
                  </p>
                </div>

                {/* Viewport Switcher Buttons */}
                <div className="flex items-center bg-[#f8f7fc] border border-[#e2dced] p-1 rounded-2xl gap-1">
                  {[
                    { id: "desktop", label: "Desktop", icon: Monitor, width: "w-full" },
                    { id: "tablet", label: "Tablet (768px)", icon: Tablet, width: "max-w-2xl" },
                    { id: "mobile", label: "Mobile (375px)", icon: Smartphone, width: "max-w-xs" }
                  ].map(vp => {
                    const Icon = vp.icon;
                    const isActive = previewViewport === vp.id;
                    return (
                      <button
                        key={vp.id}
                        onClick={() => setPreviewViewport(vp.id)}
                        className={`admin-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive 
                            ? "bg-[#010030] text-white shadow-2xs" 
                            : "text-[#625b82] hover:text-[#010030]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{vp.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Marquee Banner Selection Bar */}
              <div className="flex items-center justify-between gap-4 bg-[#f8f7fc] p-3 rounded-2xl border border-[#e2dced]">
                <div className="flex items-center gap-2 overflow-x-auto">
                  <span className="text-xs font-bold text-[#625b82] uppercase shrink-0">Banner:</span>
                  {marqueeItems.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setActiveTestMarqueeId(m.id)}
                      className={`admin-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeTestMarqueeId === m.id
                          ? "bg-[#7226FF] text-white shadow-xs"
                          : "bg-white text-[#4a4365] hover:bg-[#eae6f3]"
                      }`}
                    >
                      {m.badge}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsAnimationPaused(!isAnimationPaused)}
                  className="admin-btn bg-white hover:bg-[#eae6f3] text-[#010030] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#e2dced] flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isAnimationPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                  <span>{isAnimationPaused ? "Resume Motion" : "Pause Motion"}</span>
                </button>
              </div>

              {/* SIMULATED DEVICE VIEWPORT BENCH */}
              <div className="w-full bg-[#0a0a1a] rounded-3xl p-8 flex justify-center items-center overflow-hidden min-h-[380px] relative bg-[radial-gradient(#1e1055_1px,transparent_1px)] [background-size:16px_16px]">
                
                {/* Simulated Screen Container */}
                <div className={`transition-all duration-300 bg-[#010030] border-2 border-[#7226FF]/50 rounded-2xl shadow-2xl overflow-hidden ${
                  previewViewport === "mobile" ? "w-[360px]" : previewViewport === "tablet" ? "w-[680px]" : "w-full"
                }`}>
                  
                  {/* Top Navbar Header Simulator */}
                  <div className="bg-[#0e0048] border-b border-[#2e109d] px-4 py-3 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black tracking-wider text-[#F042FF] text-sm">SNPSHOT</span>
                      <span className="text-[10px] text-slate-400">STUDIO</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-white/80">Gallery</span>
                      <span className="text-white/80">Pricing</span>
                      <span className="bg-[#7226FF] text-white px-3 py-1 rounded-full">Studio Shoot</span>
                    </div>
                  </div>

                  {/* REAL-TIME ANIMATED MARQUEE TICKER STRIP */}
                  {selectedTestMarquee && (
                    <div 
                      className="w-full py-2.5 overflow-hidden border-b border-white/10 relative"
                      style={{ 
                        backgroundColor: selectedTestMarquee.bgColor, 
                        color: selectedTestMarquee.textColor 
                      }}
                    >
                      <div 
                        className={`whitespace-nowrap flex gap-8 items-center font-bold text-xs uppercase tracking-wider ${
                          isAnimationPaused ? "" : "animate-marquee"
                        }`}
                        style={{
                          animationDuration: `${selectedTestMarquee.speedSec || 20}s`
                        }}
                      >
                        {[1, 2, 3, 4].map(idx => (
                          <div key={idx} className="flex items-center gap-3 shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/20 border border-white/30">
                              {selectedTestMarquee.badge}
                            </span>
                            <span>{selectedTestMarquee.text}</span>
                            <span className="text-white/40">•</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body Content Placeholder */}
                  <div className="p-8 text-center space-y-3">
                    <div className="inline-block bg-[#F042FF]/10 text-[#F042FF] text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border border-[#F042FF]/20">
                      Studio Live Preview Area
                    </div>
                    <h4 className="font-sans font-black text-xl text-white uppercase tracking-tight">
                      {websiteContent.tagline || "Digital Self-Photo Booth & Photostrip Studio"}
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Simulating top ticker announcement scroll across {previewViewport.toUpperCase()} screen layout.
                    </p>
                  </div>

                  {/* Simulated Footer */}
                  <div className="bg-[#0a0a1a] border-t border-[#2e109d] p-4 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <span>{websiteContent.copyrightText}</span>
                    <div className="flex gap-3 text-slate-300">
                      <span>Instagram</span>
                      <span>TikTok</span>
                      <span>Twitter</span>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </>
      )}

      {/* CREATE / EDIT MARQUEE MODAL */}
      {isMarqueeModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#7226FF]" />
                <span>{editingMarquee ? "Edit Marquee Banner" : "New Announcement Marquee"}</span>
              </h3>
              <button 
                onClick={() => setIsMarqueeModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarqueeFormSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Badge Text</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. ✨ FEATURED"
                    value={marqueeFormData.badge}
                    onChange={(e) => setMarqueeFormData({ ...marqueeFormData, badge: e.target.value })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Scroll Speed (Seconds)</label>
                  <input 
                    type="number"
                    min={5}
                    max={60}
                    value={marqueeFormData.speedSec}
                    onChange={(e) => setMarqueeFormData({ ...marqueeFormData, speedSec: parseInt(e.target.value, 10) })}
                    className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Ticker Message Copy</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="e.g. NEW K-POP IDOL COLLAB FRAMES LIVE NOW • PRINT 2 GET 1 FREE"
                  value={marqueeFormData.text}
                  onChange={(e) => setMarqueeFormData({ ...marqueeFormData, text: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              {/* Placement Selector */}
              <div>
                <label className="block font-bold text-[#010030] mb-1.5">
                  Homepage Placement Location
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "top", label: "Top Ticker", desc: "Below Hero Banner" },
                    { id: "bottom", label: "Bottom Ticker", desc: "Above Footer" },
                    { id: "both", label: "Both Tickers", desc: "All Locations" }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setMarqueeFormData({ ...marqueeFormData, placement: p.id })}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        marqueeFormData.placement === p.id
                          ? "bg-[#f0ecf8] border-[#7226FF] text-[#010030] ring-1 ring-[#7226FF]"
                          : "bg-[#f8f7fc] border-[#e2dced] text-[#625b82] hover:bg-[#eae6f3]"
                      }`}
                    >
                      <span className="font-bold block text-xs">{p.label}</span>
                      <span className="text-[10px] text-[#625b82] block">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#010030] mb-1">Background Color</label>
                  <input 
                    type="color"
                    value={marqueeFormData.bgColor}
                    onChange={(e) => setMarqueeFormData({ ...marqueeFormData, bgColor: e.target.value })}
                    className="w-full h-9 rounded-xl border border-[#e2dced] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#010030] mb-1">Text Color</label>
                  <input 
                    type="color"
                    value={marqueeFormData.textColor}
                    onChange={(e) => setMarqueeFormData({ ...marqueeFormData, textColor: e.target.value })}
                    className="w-full h-9 rounded-xl border border-[#e2dced] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMarqueeModalOpen(false)}
                  className="admin-btn bg-[#f4f2f8] text-[#4a4365] font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMarquee}
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  {savingMarquee ? "Saving..." : "Save Banner"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FAQ EDIT MODAL */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#010030]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#e2dced] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#f0ebf7] pb-3">
              <h3 className="font-bold text-base text-[#010030] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#7226FF]" />
                <span>{editingFaq ? "Edit FAQ Item" : "Add New FAQ Item"}</span>
              </h3>
              <button 
                onClick={() => setIsFaqModalOpen(false)}
                className="admin-btn p-1.5 rounded-xl hover:bg-[#f0ecf8] text-[#625b82]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFaqFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#010030] mb-1">Question</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. How high is the export resolution?"
                  value={faqFormData.question}
                  onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#010030] mb-1">Answer</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Provide helpful guidance..."
                  value={faqFormData.answer}
                  onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                  className="admin-ui w-full bg-[#f8f7fc] border border-[#e2dced] rounded-xl px-3 py-2 text-[#010030]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="admin-btn bg-[#f4f2f8] text-[#4a4365] font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn bg-[#7226FF] hover:bg-[#5f1ee0] text-white font-bold px-5 py-2 rounded-xl shadow-xs"
                >
                  Save FAQ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default WebsiteContentManager;
