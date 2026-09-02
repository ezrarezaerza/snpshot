import React, { useState } from "react";
import { Link } from "react-router-dom";
import FramesManager from "./FramesManager";
import PosesManager from "./PosesManager";
import StickersManager from "./StickersManager";
import GalleryManager from "./GalleryManager";
import ShowcaseManager from "./ShowcaseManager";
import FiltersManager from "./FiltersManager";
import WebsiteContentManager from "./WebsiteContentManager";
import InquiriesManager from "./InquiriesManager";
import AnalyticsManager from "./AnalyticsManager";
import SystemSettingsManager from "./SystemSettingsManager";
import { 
  Layers, 
  Sparkles, 
  Image as ImageIcon, 
  ShieldCheck, 
  ArrowLeft, 
  Activity, 
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Globe,
  Palette,
  Sliders,
  Megaphone,
  Inbox,
  BarChart3,
  Settings,
  Menu,
  X
} from "lucide-react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("frames");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "frames", label: "Frame Layouts", icon: Layers },
    { id: "poses", label: "Artist Campaigns Studio", icon: Sparkles },
    { id: "stickers", label: "Digital Stamps", icon: ImageIcon },
    { id: "gallery", label: "Community Gallery", icon: ShieldCheck },
    { id: "showcase", label: "Design Showcase & Themes", icon: Globe },
    { id: "filters", label: "Aesthetic Filters & Canvas", icon: Sliders },
    { id: "website-content", label: "Website Content & Tickers", icon: Megaphone },
    { id: "inquiries", label: "Contact & Inquiries", icon: Inbox },
    { id: "analytics", label: "Analytics & Metrics", icon: BarChart3 },
    { id: "settings", label: "System & Settings", icon: Settings }
  ];

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-container admin-ui min-h-screen bg-[#f8f7fc] text-[#010030] font-sans antialiased flex flex-col md:flex-row">
      
      {/* MOBILE TOP BAR (< md) */}
      <div className="md:hidden bg-white border-b border-[#e2dced] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center text-white font-bold text-base shadow-xs">
            S
          </div>
          <div>
            <span className="font-sans font-black text-sm text-[#010030] tracking-wider block uppercase">SNPSHOT OS</span>
            <span className="text-[10px] font-bold text-[#7226FF] uppercase font-mono">
              {navItems.find(i => i.id === activeTab)?.label}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="admin-btn p-2 rounded-xl bg-[#f8f7fc] border border-[#e2dced] text-[#010030] hover:bg-[#f0ecf8] cursor-pointer transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-[#7226FF]" /> : <Menu className="w-5 h-5 text-[#010030]" />}
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY (< md) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#010030]/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop static, Mobile drawer) */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50 md:z-30 h-screen md:h-auto
        w-72 md:w-64 bg-white border-r border-[#e2dced] flex flex-col justify-between shrink-0 p-5 shadow-lg md:shadow-xs
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="space-y-6 overflow-y-auto">
          
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center text-white font-black text-base shadow-xs shrink-0">
                S
              </div>
              <div className="min-w-0">
                <h1 className="font-sans font-black text-base text-[#010030] tracking-wider uppercase leading-none mb-1 truncate">SNPSHOT</h1>
                <span className="text-[10px] font-bold text-[#7226FF] bg-[#f0ecf8] px-2 py-0.5 rounded-md border border-[#e2dced] uppercase tracking-wider block w-fit whitespace-nowrap font-mono">
                  STUDIO OS ADMIN
                </span>
              </div>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="admin-btn md:hidden p-1.5 text-[#625b82] hover:text-[#010030] hover:bg-[#f0ecf8] rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section 1: Core Controls */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-2 px-3">
              Studio Management
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`admin-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer relative ${
                    isActive
                      ? "bg-[#7226FF] text-white shadow-xs font-semibold"
                      : "text-[#4a4365] hover:bg-[#f0ecf8] hover:text-[#010030]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation Section 2: Shortcuts */}
          <div className="space-y-1 pt-4 border-t border-[#f0ebf7]">
            <span className="text-[11px] font-bold text-[#625b82] uppercase tracking-wider block mb-2 px-3">
              Shortcuts
            </span>

            <Link
              to="/"
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#4a4365] hover:bg-[#f0ecf8] hover:text-[#010030] transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#7226FF]" />
              <span>View Main App</span>
            </Link>
          </div>

        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-[#f0ebf7] space-y-3 shrink-0">
          <div className="bg-[#f8f7fc] border border-[#e2dced] rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-[11px]">
              <div className="font-semibold text-[#010030]">System Online</div>
              <div className="text-[#625b82]">v2.4.0 Studio Kernel</div>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* TOP MAIN HEADER BAR */}
        <header className="bg-white border-b border-[#e2dced] px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="font-sans font-black uppercase text-base sm:text-lg text-[#010030] tracking-wide truncate">ADMIN CONTROL PANEL</h2>
            <span className="hidden sm:inline-block text-xs text-[#625b82] font-mono shrink-0">
              / {navItems.find(i => i.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/"
              className="bg-[#f4f2f8] hover:bg-[#eae6f3] text-[#010030] text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2 border border-[#e2dced]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#7226FF]" />
              <span className="hidden sm:inline">Back to Studio</span>
              <span className="sm:hidden">Studio</span>
            </Link>
          </div>
        </header>

        {/* MAIN BODY CONTAINER (FLUID UP TO 1800px) */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1800px] w-full mx-auto space-y-6">
          
          {/* COMPACT STUDIO HEADER CARD */}
          <div className="bg-white border border-[#e2dced] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
            <div className="space-y-2 relative z-10 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_4px_12px_rgba(114,38,255,0.35)] flex items-center gap-1 whitespace-nowrap">
                  ✦ STUDIO OS ✦
                </span>
                <span className="text-xs font-bold text-[#625b82] uppercase tracking-wider font-mono">
                  {activeTab === "frames" && "Frame Layouts & Border Presets"}
                  {activeTab === "poses" && "Artist Campaigns Studio & Event Collabs"}
                  {activeTab === "stickers" && "Digital Stamps & Overlay Suite"}
                  {activeTab === "gallery" && "Community Gallery & Print Moderation"}
                  {activeTab === "showcase" && "Design Showcase & Homepage Themes"}
                  {activeTab === "filters" && "Studio Aesthetic Filters & Canvas Controls"}
                  {activeTab === "website-content" && "Website Content & Ticker Banners"}
                  {activeTab === "inquiries" && "Studio Contact & Inquiry Management"}
                  {activeTab === "analytics" && "Studio Analytics & Pipeline Metrics"}
                  {activeTab === "settings" && "System & Platform Control Plane"}
                </span>
              </div>
              <h2 className="font-sans font-black uppercase text-2xl sm:text-3xl text-[#010030] tracking-tight leading-none">
                {activeTab === "frames" && (
                  <>FRAME LAYOUTS <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">CATALOG</span></>
                )}
                {activeTab === "poses" && (
                  <>ARTIST CAMPAIGNS <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">STUDIO</span></>
                )}
                {activeTab === "stickers" && (
                  <>DIGITAL STAMPS <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">LIBRARY</span></>
                )}
                {activeTab === "gallery" && (
                  <>COMMUNITY GALLERY <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">& MODERATION</span></>
                )}
                {activeTab === "showcase" && (
                  <>DESIGN SHOWCASE <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">& SEASONS</span></>
                )}
                {activeTab === "filters" && (
                  <>STUDIO AESTHETIC <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">FILTERS & CANVAS</span></>
                )}
                {activeTab === "website-content" && (
                  <>WEBSITE CONTENT <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">& TICKER BANNERS</span></>
                )}
                {activeTab === "inquiries" && (
                  <>STUDIO CONTACT <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">& INQUIRIES CRM</span></>
                )}
                {activeTab === "analytics" && (
                  <>STUDIO ANALYTICS <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">& PIPELINE METRICS</span></>
                )}
                {activeTab === "settings" && (
                  <>SYSTEM & PLATFORM <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">CONTROL PLANE</span></>
                )}
              </h2>
              <p className="text-xs text-[#4a4365] max-w-3xl">
                {activeTab === "poses"
                  ? "Manage exclusive idol partnerships, pose guidance decks, dedicated event frames, and featured homepage showcase drops."
                  : activeTab === "gallery" 
                  ? "Audit community photostrip submissions, inspect 300 DPI CMYK print quality, manage flag reasons, and export print-ready batch packages."
                  : activeTab === "filters"
                  ? "Configure real-time CSS aesthetic filters (Warm Grain, Pastel Glow, Cinematic Film), border geometry, gap spacing, and test live in the split-screen bench."
                  : activeTab === "website-content"
                  ? "Manage scrolling marquee announcement tickers, footer social media links, brand tagline, 4-step studio pipeline guide copy, and FAQ accordions."
                  : activeTab === "inquiries"
                  ? "Manage event bookings, artist collaborations, user feedback messages, internal staff notes, canned response templates, and CSV export records."
                  : activeTab === "analytics"
                  ? "Track active studio sessions, 4-step conversion funnel drop-offs, format popularity, filter usage, canvas render latencies, and export diagnostic logs."
                  : activeTab === "settings"
                  ? "Configure camera shutter defaults, audio feedback volume, 300 DPI canvas export quality, admin security credentials, full system backups, and factory resets."
                  : "Configure background colors, gradient presets, frame padding, hero banners, and high-resolution PNG overlays for the live photostrip studio."
                }
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#f8f7fc] border border-[#e2dced] px-3.5 py-2 rounded-xl text-xs font-mono text-[#010030]">
                <Activity className="w-3.5 h-3.5 text-[#7226FF] animate-pulse" />
                <span className="font-semibold text-[11px]">Canvas Engine Live</span>
              </div>
            </div>
          </div>

          {/* ACTIVE MODULE CONTAINER */}
          <div>
            {activeTab === "frames" && <FramesManager onSelectTab={setActiveTab} />}
            {activeTab === "poses" && <PosesManager onSelectTab={setActiveTab} />}
            {activeTab === "stickers" && <StickersManager onSelectTab={setActiveTab} />}
            {activeTab === "gallery" && <GalleryManager onSelectTab={setActiveTab} />}
            {activeTab === "showcase" && <ShowcaseManager onSelectTab={setActiveTab} />}
            {activeTab === "filters" && <FiltersManager onSelectTab={setActiveTab} />}
            {activeTab === "website-content" && <WebsiteContentManager onSelectTab={setActiveTab} />}
            {activeTab === "inquiries" && <InquiriesManager onSelectTab={setActiveTab} />}
            {activeTab === "analytics" && <AnalyticsManager onSelectTab={setActiveTab} />}
            {activeTab === "settings" && <SystemSettingsManager onSelectTab={setActiveTab} />}
          </div>

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;
