import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { agencies, groupsByAgency, membersByGroup } from "../data/artists";
import { 
  Film, 
  Sparkles, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Star, 
  Layers, 
  Grid, 
  Building2, 
  User, 
  Eye, 
  X,
  ZoomIn
} from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import "../App.css";
import { playClickSound } from "../utils/audio";
import { normalizeMediaUrl } from "../utils/blobClient";

const LAYOUTS = [
  {
    id: "3-grid",
    name: "Vertical 3-Strip",
    subtitle: "3-Cut Strip",
    count: 3,
    ratio: "1:3",
    description: "Spacious vertical cuts with wide borders. Great for solo portraits and high-fashion poses.",
    badge: "MINIMAL"
  },
  {
    id: "4-grid",
    name: "Classic 4-Strip",
    subtitle: "Classic 4-Cut",
    count: 4,
    ratio: "1:4",
    description: "The iconic Korean photobooth strip. 4 sequential shots with customizable margins and dates.",
    badge: "POPULAR"
  },
  {
    id: "2x2",
    name: "2x2 Square Grid",
    subtitle: "Square Quad",
    count: 4,
    ratio: "1:1",
    description: "Balanced four-window square grid. Perfect for polaroid aesthetics and social media sharing.",
    badge: "TRENDING"
  },
  {
    id: "3x2",
    name: "2x3 Postcard Layout",
    subtitle: "Postcard 6-Cut",
    count: 6,
    ratio: "4:6",
    description: "Generous landscape postcard layout accommodating 6 expressive moments on a single print.",
    badge: "DELUXE"
  }
];

const StudioSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Wizard Stage State: 1 = Experience Selection, 2 = Format or Artist Funnel
  const searchParams = new URLSearchParams(location.search);
  const initialStep = parseInt(searchParams.get("step") || "1", 10);
  const [step, setStep] = useState(initialStep);

  // Category State: "basic" (Original Photo Strip) | "artist" (Artist Collaboration)
  const [category, setCategory] = useState(() => {
    return location.state?.category || searchParams.get("category") || "basic";
  });

  // Basic layout state
  const [selectedLayout, setSelectedLayout] = useState(() => {
    return location.state?.layout || searchParams.get("layout") || "4-grid";
  });

  // Dynamic campaigns state merged with custom campaign assets from server
  const [dynamicAgencies, setDynamicAgencies] = useState(agencies);
  const [dynamicGroupsByAgency, setDynamicGroupsByAgency] = useState(groupsByAgency);
  const [dynamicMembersByGroup, setDynamicMembersByGroup] = useState(membersByGroup);

  // Artist Navigation State (Tier 1: Agency, Tier 2: Group, Tier 3: Artist)
  const [selectedAgency, setSelectedAgency] = useState("starship");
  const [selectedGroup, setSelectedGroup] = useState("ive");
  const [selectedArtist, setSelectedArtist] = useState(membersByGroup.ive ? membersByGroup.ive[0] : null);

  // Sequential Funnel Tier: 1 = Agency, 2 = Group, 3 = Idol
  const [artistTier, setArtistTier] = useState(() => {
    const tierParam = parseInt(searchParams.get("tier") || "1", 10);
    return tierParam >= 1 && tierParam <= 3 ? tierParam : 1;
  });
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);

  // Gallery slider window index for Member selection in Tier 3 (displays 6 on desktop, 3 on mobile)
  const [memberSliderIndex, setMemberSliderIndex] = useState(0);

  // Track viewport width for responsive photostrip slider (6 on desktop >= 1024px, 3 on mobile/tablet < 1024px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset memberSliderIndex whenever selectedGroup, selectedAgency, or screen tier changes
  useEffect(() => {
    setMemberSliderIndex(0);
  }, [selectedGroup, selectedAgency, isDesktop]);

  // Manage modal backdrop scroll locking
  useEffect(() => {
    if (showRoadmapModal) {
      window.lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      window.lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      window.lenis?.start();
      document.body.style.overflow = "";
    };
  }, [showRoadmapModal]);

  // Fetch custom studio campaigns on mount and merge them
  useEffect(() => {
    axios.get("/api/studio/data")
      .then(res => {
        const { artists } = res.data;
        if (artists && artists.length > 0) {
          const updatedAgencies = [...agencies];
          const updatedGroupsByAgency = { ...groupsByAgency };
          const updatedMembersByGroup = { ...membersByGroup };

          artists.forEach(art => {
            if (art.status === "archived") return;

            if (art.agencyId && art.agencyName) {
              if (!updatedAgencies.some(a => a.id === art.agencyId)) {
                updatedAgencies.push({ id: art.agencyId, name: art.agencyName });
              }
            }

            if (art.agencyId && art.groupId && art.groupName) {
              if (!updatedGroupsByAgency[art.agencyId]) {
                updatedGroupsByAgency[art.agencyId] = [];
              }
              const groupIndex = updatedGroupsByAgency[art.agencyId].findIndex(g => g.id === art.groupId);
              const groupObj = {
                id: art.groupId,
                name: art.groupName,
                logo: art.groupLogo || "✦",
                isMale: Boolean(art.isMale)
              };
              if (groupIndex >= 0) {
                updatedGroupsByAgency[art.agencyId][groupIndex] = { ...updatedGroupsByAgency[art.agencyId][groupIndex], ...groupObj };
              } else {
                updatedGroupsByAgency[art.agencyId].push(groupObj);
              }
            }

            if (art.groupId) {
              if (!updatedMembersByGroup[art.groupId]) {
                updatedMembersByGroup[art.groupId] = [];
              }
              const memberIndex = updatedMembersByGroup[art.groupId].findIndex(m => m.id === art.id);
              const memberObj = {
                id: art.id,
                name: art.name,
                role: art.role,
                color: art.color || "#F042FF",
                avatar: normalizeMediaUrl(art.avatar || (art.poses && art.poses[0]) || ""),
                finalPreviewImage: normalizeMediaUrl(art.finalPreviewImage || art.avatar || (art.poses && art.poses[0]) || ""),
                poses: (art.poses || []).map(p => normalizeMediaUrl(p)),
                posesGuidance: art.posesGuidance || [],
                isFeatured: Boolean(art.isFeatured),
                status: art.status || "active",
                agencyId: art.agencyId,
                agencyName: art.agencyName,
                groupId: art.groupId,
                groupName: art.groupName,
                groupLogo: art.groupLogo || "✦",
                dedicatedFrameId: art.dedicatedFrameId || null,
                dedicatedFrame: art.dedicatedFrame || null,
                isFeaturedOnShowcase: Boolean(art.isFeaturedOnShowcase),
                showcaseBadge: art.showcaseBadge || "",
                showcaseTagline: art.showcaseTagline || ""
              };
              if (memberIndex >= 0) {
                updatedMembersByGroup[art.groupId][memberIndex] = { ...updatedMembersByGroup[art.groupId][memberIndex], ...memberObj };
              } else {
                updatedMembersByGroup[art.groupId].push(memberObj);
              }
            }
          });

          setDynamicAgencies(updatedAgencies);
          setDynamicGroupsByAgency(updatedGroupsByAgency);
          setDynamicMembersByGroup(updatedMembersByGroup);

          const targetArtistId = location.state?.artistId || location.state?.artist?.id || searchParams.get("artist");
          const targetCategory = location.state?.category || searchParams.get("category");
          const targetLayout = location.state?.layout || searchParams.get("layout");

          if (targetLayout) {
            setSelectedLayout(targetLayout);
          }

          if (targetCategory === "artist" || targetArtistId) {
            setCategory("artist");
          }

          if (targetArtistId) {
            let foundArtist = null;
            let foundGroup = null;
            let foundAgency = null;

            for (const [groupId, members] of Object.entries(updatedMembersByGroup)) {
              const match = members.find(m => m.id === targetArtistId || m.name?.toLowerCase() === targetArtistId.toLowerCase());
              if (match) {
                foundArtist = match;
                foundGroup = groupId;
                for (const [agencyId, groups] of Object.entries(updatedGroupsByAgency)) {
                  if (groups.some(g => g.id === groupId)) {
                    foundAgency = agencyId;
                    break;
                  }
                }
                break;
              }
            }

            if (foundArtist && foundGroup) {
              if (foundAgency) setSelectedAgency(foundAgency);
              setSelectedGroup(foundGroup);
              setSelectedArtist(foundArtist);
              return;
            }
          }

          const activeAgency = updatedAgencies.some(a => a.id === selectedAgency) ? selectedAgency : updatedAgencies[0]?.id;
          const activeGroups = updatedGroupsByAgency[activeAgency] || [];
          const activeGroup = activeGroups.some(g => g.id === selectedGroup) ? selectedGroup : (activeGroups[0]?.id || "");
          const activeMembers = updatedMembersByGroup[activeGroup] || [];
          
          if (activeMembers.length > 0) {
            if (!selectedArtist || !activeMembers.some(m => m.id === selectedArtist.id)) {
              setSelectedArtist(activeMembers[0]);
            }
          }
        }
      })
      .catch(err => console.error("Error loading custom campaigns:", err));
  }, []);

  // Synchronize browser history / URL query parameters when step changes
  const updateStep = (newStep) => {
    setStep(newStep);
    const newParams = new URLSearchParams(location.search);
    newParams.set("step", newStep.toString());
    newParams.set("category", category);
    if (category === "basic") {
      newParams.set("layout", selectedLayout);
    } else if (selectedArtist) {
      newParams.set("artist", selectedArtist.id);
    }
    navigate({ search: newParams.toString() }, { replace: true });
  };

  const handleNextStep = () => {
    playClickSound();
    updateStep(step + 1);
  };

  const handlePrevStep = () => {
    playClickSound();
    if (step > 1) {
      updateStep(step - 1);
    } else {
      navigate("/");
    }
  };

  // Launch the live photobooth station with full payload
  const handleStartBooth = () => {
    playClickSound();
    if (category === "basic") {
      const layoutConfig = LAYOUTS.find(l => l.id === selectedLayout) || LAYOUTS[1];
      navigate("/photobooth", {
        state: {
          count: layoutConfig.count,
          layout: selectedLayout,
          category: "basic",
          artist: null
        }
      });
    } else {
      const dedicatedFrameId = selectedArtist?.dedicatedFrameId || (selectedArtist?.id === "wonyoung" ? "wonyoung-special" : null);
      navigate("/photobooth", {
        state: {
          count: 4,
          layout: "4-grid",
          category: "artist",
          artist: selectedArtist,
          dedicatedFrameId: dedicatedFrameId,
          dedicatedFrame: selectedArtist?.dedicatedFrame || null
        }
      });
    }
  };

  // Agency selection handler (advances to Tier 2)
  const handleSelectAgency = (agencyId, advance = true) => {
    playClickSound();
    setSelectedAgency(agencyId);
    const availableGroups = dynamicGroupsByAgency[agencyId] || [];
    if (availableGroups.length > 0) {
      const firstGroup = availableGroups[0].id;
      setSelectedGroup(firstGroup);
      const members = dynamicMembersByGroup[firstGroup] || [];
      if (members.length > 0) {
        setSelectedArtist(members[0]);
      }
    }
    if (advance) {
      setArtistTier(2);
    }
  };

  // Group selection handler (advances to Tier 3)
  const handleSelectGroup = (groupId, advance = true) => {
    playClickSound();
    setSelectedGroup(groupId);
    const members = dynamicMembersByGroup[groupId] || [];
    if (members.length > 0) {
      setSelectedArtist(members[0]);
    }
    if (advance) {
      setArtistTier(3);
    }
  };

  // Artist selection handler
  const handleSelectArtist = (artist) => {
    playClickSound();
    setSelectedArtist(artist);
  };

  // Funnel Back / Previous Step Handler
  const handleArtistPrev = () => {
    playClickSound();
    if (artistTier === 3) {
      setArtistTier(2);
    } else if (artistTier === 2) {
      setArtistTier(1);
    } else {
      updateStep(1);
    }
  };

  // Funnel Forward / Next Step Handler
  const handleArtistNext = () => {
    playClickSound();
    if (artistTier === 1) {
      setArtistTier(2);
    } else if (artistTier === 2) {
      setArtistTier(3);
    } else {
      handleStartBooth();
    }
  };

  // Active groups for currently selected agency
  const currentGroups = dynamicGroupsByAgency[selectedAgency] || [];
  // Active members for currently selected group
  const currentMembers = dynamicMembersByGroup[selectedGroup] || [];

  // Active objects for headings and specs
  const currentAgency = dynamicAgencies.find(a => a.id === selectedAgency) || dynamicAgencies[0];
  const currentGroup = currentGroups.find(g => g.id === selectedGroup) || currentGroups[0];

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay" style={{ paddingBottom: "100px", overflowY: "auto" }}>
      {/* Background Ambience & Subtle Grid */}
      <div className="web3-grid-overlay" />

      {/* Main Studio Navigation Bar */}
      <Navbar />

      <main id="content" className="content max-w-5xl mx-auto px-4 pt-20 sm:pt-24 relative z-10">
        
        {/* ========================================================================= */}
        {/* STAGE 1: Experience Selection (Studio Signature vs Artist Collaboration)  */}
        {/* ========================================================================= */}
        {step === 1 && (
          <section className="flex flex-col items-center">
            {/* Header Title section - Aligned side-by-side with STUDIO SETUP with proper top clearance */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 text-center">
              <div className="y2k-subtitle text-xs py-1.5 px-4 whitespace-nowrap shrink-0">
                ✦ STUDIO SETUP ✦
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 m-0 leading-none">
                <span>SELECT YOUR</span>
                <span className="y2k-highlight my-0 leading-none">EXPERIENCE</span>
              </h1>
            </div>

            {/* Experience Selection Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-5xl mx-auto items-stretch">
              
              {/* CARD 1: Studio Signature — Original Photo Strip */}
              <div
                onClick={() => {
                  setCategory("basic");
                  playClickSound();
                }}
                className={`group relative rounded-2xl p-6 sm:p-8 cursor-pointer transition-colors duration-200 flex flex-col justify-between border ${
                  category === "basic"
                    ? "bg-[#16023d] border-[#F042FF] shadow-[0_0_35px_rgba(240,66,255,0.25)] ring-1 ring-[#F042FF]"
                    : "bg-[#080026] border-[#2e109d] hover:border-purple-400/60 hover:bg-[#0f0238]"
                }`}
              >
                <div>
                  {/* Top Row: Icon & Checkmark Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#21054a] border border-purple-500/30 flex items-center justify-center text-purple-300 shadow-inner">
                      <Film className="w-6 h-6 text-[#F042FF]" />
                    </div>

                    {category === "basic" && (
                      <div className="w-6 h-6 rounded-full bg-[#F042FF] text-white flex items-center justify-center shadow-[0_0_12px_#F042FF]">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Eyebrow */}
                  <div className="font-mono text-xs font-bold tracking-widest text-purple-400 uppercase mb-1.5">
                    STUDIO SIGNATURE
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase italic tracking-tight mb-3">
                    ORIGINAL PHOTO STRIP
                  </h2>

                  {/* Description */}
                  <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Classic Korean 4-Cut, 3-Strip, and 2x2 multi-shot formats. Complete freedom over aesthetic filters, dynamic stamps, and 300 DPI composite exports.
                  </p>
                </div>

                {/* Footer Divider & Metadata */}
                <div className="mt-8 pt-4 border-t border-purple-500/20 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    4 FORMATS • FULL SANDBOX
                  </span>

                  <span className={`font-display font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    category === "basic" ? "text-[#F042FF]" : "text-zinc-400 group-hover:text-white"
                  }`}>
                    {category === "basic" ? "SELECTED ✓" : "SELECT >"}
                  </span>
                </div>
              </div>

              {/* CARD 2: Special Campaign — Artist Collaboration */}
              <div
                onClick={() => {
                  setCategory("artist");
                  playClickSound();
                }}
                className={`group relative rounded-2xl p-6 sm:p-8 cursor-pointer transition-colors duration-200 flex flex-col justify-between border ${
                  category === "artist"
                    ? "bg-[#16023d] border-[#F042FF] shadow-[0_0_35px_rgba(240,66,255,0.25)] ring-1 ring-[#F042FF]"
                    : "bg-[#080026] border-[#2e109d] hover:border-purple-400/60 hover:bg-[#0f0238]"
                }`}
              >
                <div>
                  {/* Top Row: Icon & Checkmark Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#21054a] border border-purple-500/30 flex items-center justify-center text-amber-300 shadow-inner">
                      <Sparkles className="w-6 h-6 text-[#F042FF]" />
                    </div>

                    {category === "artist" && (
                      <div className="w-6 h-6 rounded-full bg-[#F042FF] text-white flex items-center justify-center shadow-[0_0_12px_#F042FF]">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Eyebrow with HOT pill */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold tracking-widest text-purple-400 uppercase">
                      SPECIAL CAMPAIGN
                    </span>
                    <span className="bg-[#7226FF] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      HOT
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase italic tracking-tight mb-3">
                    ARTIST COLLABORATION
                  </h2>

                  {/* Description */}
                  <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Pose alongside verified K-Pop idol campaigns (Starship IVE, HYBE NewJeans/BTS, SM aespa). Dedicated official frames, pose-matching guides, and split-screen alignment.
                  </p>
                </div>

                {/* Footer Divider & Metadata */}
                <div className="mt-8 pt-4 border-t border-purple-500/20 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    OFFICIAL FRAMES • POSE GUIDES
                  </span>

                  <span className={`font-display font-black text-xs uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    category === "artist" ? "text-[#F042FF]" : "text-zinc-400 group-hover:text-white"
                  }`}>
                    {category === "artist" ? "SELECTED ✓" : "SELECT >"}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Step Navigation Bar */}
            <div className="flex items-center justify-between w-full max-w-5xl mx-auto mt-10 pt-6 border-t border-purple-500/20">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl border border-[#2e109d] bg-[#0c0333] hover:border-purple-400 hover:bg-[#150444] text-zinc-300 hover:text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREVIOUS STEP</span>
              </button>

              <button
                onClick={handleNextStep}
                className="px-7 py-3 rounded-xl bg-[#7226FF] hover:bg-[#F042FF] text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(114,38,255,0.4)] cursor-pointer"
              >
                <span>NEXT STEP</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2A: Original Mode Layout Selection (Phase 3)                        */}
        {/* ========================================================================= */}
        {step === 2 && category === "basic" && (
          <section className="flex flex-col items-center">
            {/* Header Title section - Preserves exact requested styling & alignment */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 text-center">
              <div className="y2k-subtitle text-xs py-1.5 px-4 whitespace-nowrap shrink-0">
                ✦ STUDIO SETUP ✦
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 m-0 leading-none">
                <span>CHOOSE PHOTOSTRIP</span>
                <span className="y2k-highlight my-0 leading-none">FORMAT</span>
              </h1>
            </div>

            {/* Layout Options Grid (4 Formats) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-5xl mx-auto items-stretch">
              {LAYOUTS.map((layout) => {
                const isSelected = selectedLayout === layout.id;

                return (
                  <div
                    key={layout.id}
                    onClick={() => {
                      setSelectedLayout(layout.id);
                      playClickSound();
                    }}
                    className={`group relative rounded-2xl p-5 cursor-pointer transition-colors duration-200 flex flex-col justify-between border ${
                      isSelected
                        ? "bg-[#16023d] border-[#F042FF] shadow-[0_0_30px_rgba(240,66,255,0.25)] ring-1 ring-[#F042FF]"
                        : "bg-[#080026] border-[#2e109d] hover:border-purple-400/60 hover:bg-[#0f0238]"
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full bg-[#240342] text-[#F042FF] border border-purple-500/30 uppercase">
                          {layout.badge}
                        </span>

                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#F042FF] text-white flex items-center justify-center shadow-[0_0_10px_#F042FF]">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-purple-700/60" />
                        )}
                      </div>

                      {/* Visual Miniature Wireframe of Layout */}
                      <div className="h-40 w-full rounded-xl bg-[#030018] border border-purple-900/50 p-2.5 mb-4 flex items-center justify-center">
                        {/* 3-grid: 3 vertical cuts */}
                        {layout.id === "3-grid" && (
                          <div className="w-16 h-36 bg-[#16023d] border border-purple-500/40 rounded-sm p-1 flex flex-col justify-between shadow-inner">
                            <div className="w-full h-8 bg-purple-500/20 rounded-xs flex items-center justify-center text-[9px] font-mono font-bold text-purple-300">01</div>
                            <div className="w-full h-8 bg-purple-500/20 rounded-xs flex items-center justify-center text-[9px] font-mono font-bold text-purple-300">02</div>
                            <div className="w-full h-8 bg-purple-500/20 rounded-xs flex items-center justify-center text-[9px] font-mono font-bold text-purple-300">03</div>
                            <div className="w-full h-2.5 flex items-center justify-between px-0.5">
                              <span className="text-[6px] font-mono text-zinc-500">SNPSHOT</span>
                              <span className="text-[6px] font-mono text-[#F042FF]">300DPI</span>
                            </div>
                          </div>
                        )}

                        {/* 4-grid: 4 vertical cuts */}
                        {layout.id === "4-grid" && (
                          <div className="w-16 h-36 bg-[#16023d] border border-purple-500/40 rounded-sm p-1 flex flex-col justify-between shadow-inner">
                            <div className="w-full h-6 bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">01</div>
                            <div className="w-full h-6 bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">02</div>
                            <div className="w-full h-6 bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">03</div>
                            <div className="w-full h-6 bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">04</div>
                            <div className="w-full h-2 flex items-center justify-between px-0.5">
                              <span className="text-[5px] font-mono text-zinc-500">SNPSHOT</span>
                              <span className="text-[5px] font-mono text-[#F042FF]">4-CUT</span>
                            </div>
                          </div>
                        )}

                        {/* 2x2: Square quad */}
                        {layout.id === "2x2" && (
                          <div className="w-32 h-32 bg-[#16023d] border border-purple-500/40 rounded-sm p-1.5 flex flex-col justify-between shadow-inner">
                            <div className="grid grid-cols-2 gap-1 flex-1">
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">01</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">02</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">03</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[8px] font-mono font-bold text-purple-300">04</div>
                            </div>
                            <div className="w-full pt-1 flex items-center justify-between px-0.5">
                              <span className="text-[6px] font-mono text-zinc-500">2x2 QUAD</span>
                              <span className="text-[6px] font-mono text-[#F042FF]">1:1 SQ</span>
                            </div>
                          </div>
                        )}

                        {/* 3x2: Postcard 6-cut */}
                        {layout.id === "3x2" && (
                          <div className="w-36 h-28 bg-[#16023d] border border-purple-500/40 rounded-sm p-1.5 flex flex-col justify-between shadow-inner">
                            <div className="grid grid-cols-3 gap-1 flex-1">
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-purple-300">01</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-purple-300">02</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-purple-300">03</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-purple-300">04</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-purple-300">05</div>
                              <div className="bg-purple-500/20 rounded-xs flex items-center justify-center text-[7px] font-mono font-bold text-purple-300">06</div>
                            </div>
                            <div className="w-full pt-1 flex items-center justify-between px-0.5">
                              <span className="text-[6px] font-mono text-zinc-500">POSTCARD</span>
                              <span className="text-[6px] font-mono text-[#F042FF]">4:6 CARD</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Format Title */}
                      <h3 className="font-display font-black text-lg text-white uppercase italic tracking-tight mb-1">
                        {layout.name}
                      </h3>

                      {/* Description */}
                      <p className="font-sans text-xs text-zinc-300 leading-relaxed mb-3">
                        {layout.description}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-3 border-t border-purple-500/20 flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-purple-300 uppercase">
                        {layout.count} CUTS • {layout.ratio}
                      </span>
                      <span className={`font-display font-black text-[11px] uppercase tracking-wider ${
                        isSelected ? "text-[#F042FF]" : "text-zinc-400 group-hover:text-white"
                      }`}>
                        {isSelected ? "SELECTED ✓" : "SELECT >"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Step Navigation Bar for Step 2A */}
            <div className="flex items-center justify-between w-full max-w-5xl mx-auto mt-10 pt-6 border-t border-purple-500/20">
              <button
                onClick={handlePrevStep}
                className="px-5 py-2.5 rounded-xl border border-[#2e109d] bg-[#0c0333] hover:border-purple-400 hover:bg-[#150444] text-zinc-300 hover:text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREVIOUS STEP</span>
              </button>

              <button
                onClick={handleStartBooth}
                className="px-7 py-3 rounded-xl bg-[#7226FF] hover:bg-[#F042FF] text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(114,38,255,0.4)] cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>START PHOTOBOOTH</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2B: Collaboration Mode Sequential 3-Tier Visual Funnel              */}
        {/* Company -> Group -> Idols                                                 */}
        {/* ========================================================================= */}
        {step === 2 && category === "artist" && (
          <section className="flex flex-col items-center w-full">
            {/* Header row: Left-aligned stacked subtitle & title, right-aligned navigation breadcrumb */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-3 w-full max-w-5xl ${artistTier === 3 ? "mb-2 sm:mb-2.5" : "mb-6 sm:mb-8"}`}>
              <div className="flex flex-col items-start text-left">
                <div className="y2k-subtitle text-[11px] py-0.5 px-3 whitespace-nowrap mb-1 inline-block">
                  Artist Collaboration
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 m-0 leading-none">
                  {artistTier === 1 && (
                    <>
                      <span>SELECT ENTERTAINMENT</span>
                      <span className="y2k-highlight my-0 leading-none">AGENCY</span>
                    </>
                  )}
                  {artistTier === 2 && (
                    <>
                      <span>CHOOSE ARTIST</span>
                      <span className="y2k-highlight my-0 leading-none">GROUP</span>
                    </>
                  )}
                  {artistTier === 3 && (
                    <>
                      <span>CHOOSE YOUR</span>
                      <span className="y2k-highlight my-0 leading-none">IDOL</span>
                    </>
                  )}
                </h1>
              </div>

              {/* Breadcrumb pill bar aligned properly on the right side */}
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-[#080026] border border-[#2e109d] font-mono text-xs self-start md:self-auto shadow-inner">
                <button
                  onClick={() => { playClickSound(); setArtistTier(1); }}
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
                    artistTier === 1
                      ? "bg-[#F042FF] text-white shadow-[0_0_12px_rgba(240,66,255,0.6)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  AGENCY
                </button>
                <button
                  onClick={() => {
                    if (artistTier >= 2) {
                      playClickSound();
                      setArtistTier(2);
                    }
                  }}
                  disabled={artistTier < 2}
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                    artistTier === 2
                      ? "bg-[#F042FF] text-white shadow-[0_0_12px_rgba(240,66,255,0.6)] cursor-pointer"
                      : artistTier > 2
                      ? "text-zinc-400 hover:text-white cursor-pointer"
                      : "text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  GROUP
                </button>
                <button
                  onClick={() => {
                    if (artistTier >= 3) {
                      playClickSound();
                      setArtistTier(3);
                    }
                  }}
                  disabled={artistTier < 3}
                  className={`px-4 py-1 rounded-full text-xs font-bold uppercase transition-all ${
                    artistTier === 3
                      ? "bg-[#F042FF] text-white shadow-[0_0_12px_rgba(240,66,255,0.6)] cursor-pointer"
                      : "text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  MEMBER
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* TIER 01: SELECT ENTERTAINMENT AGENCY                          */}
            {/* ============================================================= */}
            {artistTier === 1 && (
              <div className="w-full max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                  {dynamicAgencies.map((agency) => {
                    const isSelected = selectedAgency === agency.id;
                    const agencyGroups = dynamicGroupsByAgency[agency.id] || [];
                    const campaignCount = agencyGroups.length;

                    return (
                      <div
                        key={agency.id}
                        onClick={() => handleSelectAgency(agency.id, true)}
                        className={`group relative rounded-2xl p-6 flex flex-col justify-between items-center text-center cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-[#16023d] border-[#F042FF] shadow-[0_0_25px_rgba(240,66,255,0.3)] ring-1 ring-[#F042FF]"
                            : "bg-[#080026] border-[#2e109d] hover:border-purple-400/60 hover:bg-[#0f0238]"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-xl bg-[#21054a] border border-purple-500/30 flex items-center justify-center text-[#F042FF] mb-4 shadow-inner">
                            <Building2 className="w-6 h-6" />
                          </div>

                          <h3 className="font-display font-black text-base sm:text-lg text-white uppercase italic tracking-tight mb-1">
                            {agency.name}
                          </h3>

                          <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider mb-6 block">
                            {campaignCount} ACTIVE CAMPAIGN{campaignCount > 1 ? "S" : ""}
                          </span>
                        </div>

                        <div className="w-full pt-4 border-t border-purple-500/20 flex items-center justify-center">
                          {isSelected ? (
                            <span className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1">
                              ACTIVE →
                            </span>
                          ) : (
                            <span className="font-display font-black text-xs text-[#F042FF] uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                              SELECT AGENCY →
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TIER 02: SELECT GROUP                                         */}
            {/* ============================================================= */}
            {artistTier === 2 && (
              <div className="w-full max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                  {currentGroups.map((group) => {
                    const isSelected = selectedGroup === group.id;
                    const members = dynamicMembersByGroup[group.id] || [];

                    return (
                      <div
                        key={group.id}
                        onClick={() => handleSelectGroup(group.id, true)}
                        className={`group p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-[#16023d] border-[#F042FF] shadow-[0_0_25px_rgba(240,66,255,0.3)] ring-1 ring-[#F042FF]"
                            : "bg-[#080026] border-[#2e109d] hover:border-[#F042FF] hover:bg-[#16023d]"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-xl bg-[#21054a] border border-purple-500/30 flex items-center justify-center text-amber-300 text-xl font-display font-black mr-4 shadow-inner">
                            {group.logo || "✦"}
                          </div>
                          <div>
                            <h3 className="font-display font-black text-xl text-white uppercase italic tracking-tight m-0">
                              {group.name}
                            </h3>
                            <span className="font-mono text-xs text-zinc-400 uppercase tracking-wider mt-0.5 block">
                              {members.length} MEMBERS AVAILABLE
                            </span>
                          </div>
                        </div>

                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-[#F042FF] text-white border-[#F042FF]"
                            : "bg-purple-900/40 border-purple-500/40 text-purple-300 group-hover:bg-[#F042FF] group-hover:text-white"
                        }`}>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TIER 03: SELECT MEMBER PHOTOSTRIP GALLERY                     */}
            {/* ============================================================= */}
            {artistTier === 3 && (() => {
              const itemsPerView = isDesktop ? 6 : 3;
              const maxSliderIndex = Math.max(0, currentMembers.length - itemsPerView);
              const canPrev = memberSliderIndex > 0;
              const canNext = memberSliderIndex < maxSliderIndex;

              return (
                <div className="w-full max-w-5xl mx-auto space-y-2 sm:space-y-2.5">
                  {/* Photostrip Slider Track with Left & Right Circular Navigation Arrows */}
                  <div className="relative group/slider">
                    {/* Left Navigation Arrow (<) */}
                    {currentMembers.length > itemsPerView && (
                      <button
                        type="button"
                        onClick={() => {
                          if (canPrev) {
                            playClickSound();
                            setMemberSliderIndex((prev) => Math.max(0, prev - 1));
                          }
                        }}
                        disabled={!canPrev}
                        className={`absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_25px_rgba(1,0,48,0.95)] cursor-pointer ${
                          canPrev
                            ? "bg-[#0c0333]/95 border-[#7226FF] hover:border-[#F042FF] text-white hover:text-[#F042FF] hover:scale-110 hover:shadow-[0_0_20px_rgba(240,66,255,0.6)] ring-1 ring-purple-500/40"
                            : "bg-[#060020]/75 border-[#2e109d]/30 text-zinc-600 cursor-not-allowed opacity-35"
                        }`}
                        aria-label="Previous Members"
                        title="Previous photostrips"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}

                    {/* Viewport window: 6 cards on desktop (lg:w-1/6), 3 cards on mobile (w-1/3) */}
                    <div className="relative w-full overflow-hidden rounded-2xl">
                      <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{
                          transform: `translateX(-${memberSliderIndex * (100 / itemsPerView)}%)`
                        }}
                      >
                        {currentMembers.map((member) => {
                          const isSelected = selectedArtist?.id === member.id;
                          const previewImg = normalizeMediaUrl(member.finalPreviewImage || member.avatar || (member.poses && member.poses[0]));

                          return (
                            <div
                              key={member.id}
                              className="w-1/3 lg:w-1/6 shrink-0 px-1 sm:px-1.5"
                            >
                              <div
                                onClick={() => handleSelectArtist(member)}
                                className={`group relative p-1.5 sm:p-2 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
                                  isSelected
                                    ? "bg-[#16023d] border-[#F042FF] shadow-[0_0_20px_rgba(240,66,255,0.35)] ring-2 ring-[#F042FF]/70"
                                    : "bg-[#080026] border-[#2e109d] hover:border-purple-400/70 hover:bg-[#0f0238] hover:shadow-[0_6px_16px_rgba(114,38,255,0.15)]"
                                }`}
                              >
                                {/* Top Badge Bar */}
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[8px] sm:text-[9px] font-bold text-purple-300 bg-[#1e0242] px-1.5 py-0.5 rounded border border-purple-500/30 uppercase tracking-tight truncate max-w-[50px] sm:max-w-[65px]">
                                    {member.dedicatedFrame?.layout || "4-GRID"}
                                  </span>

                                  {isSelected ? (
                                    <span className="w-3.5 h-3.5 rounded-full bg-[#F042FF] text-white flex items-center justify-center shadow-[0_0_8px_#F042FF] shrink-0">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                  ) : member.id === "wonyoung" ? (
                                    <span className="bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs shrink-0">
                                      HOT
                                    </span>
                                  ) : (
                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: member.color || "#F042FF" }} />
                                  )}
                                </div>

                                {/* Photostrip Preview Frame Container */}
                                <div className="relative aspect-[1/2] rounded-md sm:rounded-lg overflow-hidden bg-gradient-to-b from-[#0c0128] to-[#040014] border border-purple-900/60 p-0.5 flex items-center justify-center shadow-inner group/strip">
                                  {previewImg ? (
                                    <img
                                      src={previewImg}
                                      alt={`${member.name} Photostrip Preview`}
                                      className="w-full h-full object-contain drop-shadow-md rounded transition-transform duration-500 group-hover:scale-[1.03]"
                                      onError={(e) => {
                                        if (member.avatar && e.target.src !== member.avatar) {
                                          e.target.src = member.avatar;
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-purple-400 font-mono text-[9px] p-1 text-center">
                                      <Film className="w-4 h-4 mb-0.5 text-purple-400/50" />
                                      <span>PREVIEW</span>
                                    </div>
                                  )}

                                  {/* Hover & Active Indicator Overlay */}
                                  <div className={`absolute inset-0 bg-[#010030]/40 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 backdrop-blur-[1px] pointer-events-none ${
                                    isSelected ? "opacity-100 bg-[#F042FF]/10" : "opacity-0 group-hover:opacity-100"
                                  }`}>
                                    <span className={`font-mono text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border shadow-md ${
                                      isSelected 
                                        ? "bg-[#F042FF] text-white border-white/40 shadow-[0_0_10px_#F042FF]" 
                                        : "bg-[#010030]/90 text-purple-200 border-purple-500/40"
                                    }`}>
                                      {isSelected ? "SELECTED" : "CHOOSE"}
                                    </span>
                                  </div>
                                </div>

                                {/* Member Meta Info */}
                                <div className="mt-1 pt-1 border-t border-purple-500/20 text-left">
                                  <h4 className="font-display font-black text-[11px] sm:text-xs text-white uppercase italic tracking-tight m-0 truncate">
                                    {member.name}
                                  </h4>
                                  <p className="font-mono text-[8px] sm:text-[9px] text-zinc-400 truncate mt-0.5">
                                    {member.role || "Center / Vocalist"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Navigation Arrow (>) */}
                    {currentMembers.length > itemsPerView && (
                      <button
                        type="button"
                        onClick={() => {
                          if (canNext) {
                            playClickSound();
                            setMemberSliderIndex((prev) => Math.min(maxSliderIndex, prev + 1));
                          }
                        }}
                        disabled={!canNext}
                        className={`absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-[0_4px_25px_rgba(1,0,48,0.95)] cursor-pointer ${
                          canNext
                            ? "bg-[#0c0333]/95 border-[#7226FF] hover:border-[#F042FF] text-white hover:text-[#F042FF] hover:scale-110 hover:shadow-[0_0_20px_rgba(240,66,255,0.6)] ring-1 ring-purple-500/40"
                            : "bg-[#060020]/75 border-[#2e109d]/30 text-zinc-600 cursor-not-allowed opacity-35"
                        }`}
                        aria-label="Next Members"
                        title="Next photostrips"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}
                  </div>

                  {/* Slider Pagination & Roster Meta Indicator (when roster exceeds visible count) */}
                  {currentMembers.length > itemsPerView && (
                    <div className="flex items-center justify-between px-2 pt-0.5 font-mono text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-300 font-bold">
                          {memberSliderIndex + 1}–{Math.min(memberSliderIndex + itemsPerView, currentMembers.length)}
                        </span>
                        <span>OF</span>
                        <span className="text-white font-bold">{currentMembers.length} MEMBERS</span>
                      </div>

                      {/* Interactive Pagination Track Indicators */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: maxSliderIndex + 1 }).map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setMemberSliderIndex(dotIdx);
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              memberSliderIndex === dotIdx
                                ? "w-4 bg-[#F042FF] shadow-[0_0_8px_#F042FF]"
                                : "w-1.5 bg-purple-900/60 hover:bg-purple-400"
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Bottom Step Navigation Bar for Step 2B (Shifted upward for single screenshot fit) */}
            <div className="flex items-center justify-between w-full max-w-5xl mx-auto mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-purple-500/20">
              <button
                onClick={handleArtistPrev}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-[#2e109d] bg-[#0c0333] hover:border-purple-400 hover:bg-[#150444] text-zinc-300 hover:text-white font-mono text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>PREVIOUS STEP</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                {artistTier === 3 && (
                  <button
                    type="button"
                    onClick={() => setShowRoadmapModal(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-500/30 bg-[#16023d] hover:bg-[#24035a] text-purple-200 hover:text-white font-mono text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    title="Preview official frame and poses roadmap"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F042FF]" />
                    <span>PREVIEW ROADMAP</span>
                  </button>
                )}

                <button
                  onClick={handleArtistNext}
                  className="px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-[#7226FF] hover:bg-[#F042FF] text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(114,38,255,0.4)] cursor-pointer"
                >
                  {artistTier === 3 ? (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>ENTER BOOTH WITH {selectedArtist?.name?.toUpperCase() || "IDOL"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>NEXT STEP</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ROADMAP PREVIEW MODAL (Portaled with Lenis scroll lock) */}
        {showRoadmapModal && selectedArtist && createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0c0128] border border-[#F042FF]/50 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(240,66,255,0.25)]">
              <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-5">
                <div>
                  <div className="flex items-center gap-2 text-[#F042FF] font-mono text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ARTIST COLLABORATION ROADMAP</span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tight mt-1">
                    {selectedArtist.name} // {currentGroup?.name || "IVE"}
                  </h2>
                </div>
                <button
                  onClick={() => setShowRoadmapModal(false)}
                  className="w-8 h-8 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Frame & Poses Details */}
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[#080020] border border-purple-500/30">
                  <div className="text-xs font-mono text-purple-300 font-bold uppercase mb-2">
                    ✦ OFFICIAL COLLECTOR FRAME
                  </div>
                  <p className="text-xs font-sans text-zinc-300 mb-3">
                    Includes high-resolution custom framing with official group branding, collector seals, and 300 DPI layout matching.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#1e0242] border border-[#F042FF]/40 text-[#F042FF] font-mono text-[11px] font-bold uppercase">
                      {selectedArtist.name} Special Edition
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      Format: 4-Cut Strip (Split-Screen Match)
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-purple-300 font-bold uppercase mb-3">
                    ✦ 4-SHOT GHOST POSE SEQUENCE
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(selectedArtist.poses || []).slice(0, 4).map((poseUrl, idx) => (
                      <div key={idx} className="rounded-xl bg-[#030018] border border-purple-500/40 p-2 text-center">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-[#0a0024]">
                          <img src={poseUrl} alt={`Pose ${idx + 1}`} className="w-full h-full object-cover object-top" />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-[#F042FF] uppercase">
                          SHOT 0{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-500/20">
                  <button
                    onClick={() => setShowRoadmapModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-purple-500/40 text-zinc-300 hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    CLOSE
                  </button>
                  <button
                    onClick={() => {
                      setShowRoadmapModal(false);
                      handleStartBooth();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#7226FF] hover:bg-[#F042FF] text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(114,38,255,0.4)] cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>START WITH {selectedArtist.name.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      </main>
    </div>
  );
};

export default StudioSetup;
