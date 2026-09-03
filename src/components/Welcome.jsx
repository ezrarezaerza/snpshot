import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { agencies, groupsByAgency, membersByGroup } from "../data/artists";
import { Camera, Layers, Check, RefreshCw, AlertTriangle, User, Sliders } from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import "../App.css";
import { playClickSound } from "../utils/audio";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Category State
  const [category, setCategory] = useState("basic"); // "basic" | "artist"

  // Basic layout state
  const [selectedLayout, setSelectedLayout] = useState("4-grid"); // "3-grid" | "4-grid" | "2x2" | "3x2"

  // Dynamic campaigns state merged with custom campaign assets
  const [dynamicAgencies, setDynamicAgencies] = useState(agencies);
  const [dynamicGroupsByAgency, setDynamicGroupsByAgency] = useState(groupsByAgency);
  const [dynamicMembersByGroup, setDynamicMembersByGroup] = useState(membersByGroup);

  // Artist Navigation State
  const [selectedAgency, setSelectedAgency] = useState("starship");
  const [selectedGroup, setSelectedGroup] = useState("ive");
  const [selectedArtist, setSelectedArtist] = useState(membersByGroup.ive ? membersByGroup.ive[0] : null);

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
            // Only include active or non-archived campaigns in photo booth
            if (art.status === "archived") return;

            // Merge / update custom agency
            if (art.agencyId && art.agencyName) {
              if (!updatedAgencies.some(a => a.id === art.agencyId)) {
                updatedAgencies.push({ id: art.agencyId, name: art.agencyName });
              }
            }

            // Merge / update custom group
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

            // Merge / update custom artist member
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
                avatar: art.avatar || (art.poses && art.poses[0]) || "",
                poses: art.poses || [],
                posesGuidance: art.posesGuidance || [],
                isFeatured: Boolean(art.isFeatured),
                status: art.status || "active"
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

          // Correct selected artist references if we just merged new ones
          const activeAgency = updatedAgencies.some(a => a.id === selectedAgency) ? selectedAgency : updatedAgencies[0].id;
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

  // Camera preview states
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  // Initialize camera stream for pre-capture test
  useEffect(() => {
    let active = true;

    const startWebcam = async () => {
      try {
        setCameraLoading(true);
        setCameraError(null);

        const constraints = {
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (active) {
          setCameraStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.style.transform = "scaleX(-1)";
            videoRef.current.style.objectFit = "cover";
            
            videoRef.current.onloadedmetadata = () => {
              if (active && videoRef.current) {
                videoRef.current.play().catch(e => console.log("Video play interrupted:", e));
              }
            };
          }
          setCameraLoading(false);
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error("Camera access error on Welcome page:", error);
        if (active) {
          setCameraLoading(false);
          setCameraError(
            error.name === "NotAllowedError" || error.message?.includes("Permission")
              ? "Webcam authorization failed. Please grant camera access in your browser preferences to take photos."
              : "No webcam device detected. Please connect your camera to continue."
          );
        }
      }
    };

    startWebcam();

    return () => {
      active = false;
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleAgencyChange = (agencyId) => {
    setSelectedAgency(agencyId);
    const groups = dynamicGroupsByAgency[agencyId] || [];
    if (groups.length > 0) {
      setSelectedGroup(groups[0].id);
      const members = dynamicMembersByGroup[groups[0].id] || [];
      if (members.length > 0) {
        setSelectedArtist(members[0]);
      }
    }
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    const members = dynamicMembersByGroup[groupId] || [];
    if (members.length > 0) {
      setSelectedArtist(members[0]);
    }
  };

  const handleStart = () => {
    let photoCount = 4;
    let layoutType = "grid";

    if (category === "basic") {
      if (selectedLayout === "3-grid") {
        photoCount = 3;
        layoutType = "grid";
      } else if (selectedLayout === "4-grid") {
        photoCount = 4;
        layoutType = "grid";
      } else if (selectedLayout === "2x2") {
        photoCount = 4;
        layoutType = "2x2";
      } else if (selectedLayout === "3x2") {
        photoCount = 6;
        layoutType = "3x2";
      }
    } else {
      photoCount = 4;
      layoutType = "grid";
    }

    const navigationState = {
      category,
      count: photoCount,
      layout: layoutType,
      artist: category === "artist" ? selectedArtist : null,
      presetFrameId: location.state?.presetFrameId || null
    };

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }

    navigate("/photobooth", { state: navigationState });
  };

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay" style={{ paddingBottom: "80px", overflowY: "auto" }}>
      {/* Dynamic Grid Background line */}
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar />

      <div id="content" className="content max-w-6xl mx-auto px-4 pt-20 relative z-10">
        
        {/* Header Title section */}
        <div className="text-center mb-10">
          <div className="y2k-subtitle mb-2">✦ STUDIO SETUP ✦</div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
            PREPARE YOUR
            <div className="y2k-highlight ml-3">PHOTO BOOTH</div>
          </h1>
        </div>

        {/* Dynamic Two Column Workspace: Left (Active HUD Viewfinder), Right (Tac-OS Setup Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live camera feedback HUD */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="web3-glass-card p-5 flex flex-col justify-between" style={{ minHeight: "440px" }}>
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-800">
                  <span className="font-mono text-[11px] text-[#F042FF] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> ✧ LIVE CAMERA FEED ✧
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 flex items-center gap-1.5 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                    {cameraLoading ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                        CONNECTING...
                      </>
                    ) : cameraError ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        CAMERA OFFLINE
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F042FF] animate-pulse" />
                        CAMERA READY
                      </>
                    )}
                  </span>
                </div>

                {/* Simulated Lens brackets & Scanning viewfinder */}
                <div className="relative w-full aspect-[4/3] bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 shadow-inner">
                  {/* Viewfinder crosshairs */}
                  <div className="hud-corner hud-tl" />
                  <div className="hud-corner hud-tr" />
                  <div className="hud-corner hud-bl" />
                  <div className="hud-corner hud-br" />
                  <div className="hud-crosshair" />

                  {/* Playful indicator */}
                  <div className="absolute top-2.5 right-2.5 font-mono text-[9px] text-[#F042FF] font-bold tracking-wider bg-black/50 px-2.5 py-0.5 rounded-full">
                    READY 📸
                  </div>

                  {cameraLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/90">
                      <RefreshCw className="w-8 h-8 text-[#F042FF] animate-spin mb-3" />
                      <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">LOADING LIVE FEED...</span>
                    </div>
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-red-950/20 backdrop-blur">
                      <AlertTriangle className="w-8 h-8 text-red-500 mb-3" />
                      <h4 className="font-display font-black text-xs text-white uppercase tracking-wider mb-2">CAMERA DISCONNECTED</h4>
                      <p className="font-sans text-[11px] text-zinc-400 max-w-[240px] leading-relaxed mx-auto">
                        {cameraError}
                      </p>
                    </div>
                  )}

                  <video
                    ref={videoRef}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      opacity: cameraLoading || cameraError ? 0 : 1,
                      transition: "opacity 0.4s ease"
                    }}
                    muted
                    playsInline
                  />
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F042FF]/15 border border-[#F042FF]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#F042FF] text-xs font-bold">i</span>
                </div>
                <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                  <strong>Camera Positioning:</strong> Center yourself inside the frame. When selecting an <strong>Idol Collab</strong> pose guide, they will appear as a transparent overlay in your viewfinder.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: OS Parameter Calibrators */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. Category Calibrator */}
            <div className="web3-glass-card p-6">
              <div className="flex items-center gap-2 mb-4 pb-1 border-b border-zinc-800">
                <Layers className="text-[#F042FF] w-4 h-4" />
                <h3 className="font-display font-black text-sm tracking-wider uppercase text-zinc-200">
                  1. SELECT EXPERIENCE TYPE
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Basic selector */}
                <div 
                  onClick={() => { setCategory("basic"); playClickSound(); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    category === "basic" 
                      ? "border-[#F042FF] bg-[#0e0048] shadow-[0_4px_20px_rgba(240,66,255,0.2)]" 
                      : "border-zinc-800/80 bg-[#010030] hover:border-[#7226FF]/60 hover:bg-[#0e0048]/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">🎞️</span>
                    {category === "basic" && (
                      <span className="w-5 h-5 rounded-full bg-[#F042FF]/20 border border-[#F042FF] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-[#F042FF]" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-wider mb-1">Classic Photo Strip</h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                    Classic photobooth layouts with customizable frames, colors, and background textures.
                  </p>
                </div>

                {/* Artist selector */}
                <div 
                  onClick={() => { setCategory("artist"); playClickSound(); }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${
                    category === "artist" 
                      ? "border-[#7226FF] bg-[#0e0048] shadow-[0_4px_20px_rgba(114,38,255,0.25)]" 
                      : "border-zinc-800/80 bg-[#010030] hover:border-[#7226FF]/60 hover:bg-[#0e0048]/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">🤝</span>
                    {category === "artist" && (
                      <span className="w-5 h-5 rounded-full bg-[#7226FF]/20 border border-[#7226FF] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-[#7226FF]" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-wider mb-1">Event & Collab Themes</h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                    Capture photo strips with curated event themes, idol pose guides, and special collab frames.
                  </p>
                </div>

              </div>
            </div>

            {/* 2A. Basic Grid Calibration */}
            {category === "basic" && (
              <div className="web3-glass-card p-6">
                <div className="flex items-center gap-2 mb-4 pb-1 border-b border-zinc-800">
                  <Sliders className="text-[#F042FF] w-4 h-4" />
                  <h3 className="font-display font-black text-sm tracking-wider uppercase text-zinc-200">
                    2. CHOOSE YOUR PHOTO LAYOUT
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: "3-grid", icon: "🎞️", label: "3-GRID", code: "3_S_VERT" },
                    { id: "4-grid", icon: "🎞️", label: "4-GRID", code: "4_S_VERT" },
                    { id: "2x2", icon: "🖼️", label: "2x2 GRID", code: "4_S_SQUARE" },
                    { id: "3x2", icon: "🖼️", label: "3x2 GRID", code: "6_S_LAND" },
                  ].map((layoutItem) => {
                    const isSelected = selectedLayout === layoutItem.id;
                    return (
                      <button
                        key={layoutItem.id}
                        onClick={() => { setSelectedLayout(layoutItem.id); playClickSound(); }}
                        className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer ${
                          isSelected
                            ? "bg-[#160078] border-[#F042FF] text-white shadow-[0_0_16px_rgba(240,66,255,0.25)]"
                            : "bg-[#010030] border-[#7226FF]/30 text-zinc-400 hover:border-[#7226FF] hover:text-white"
                        }`}
                      >
                        <span className="font-mono font-bold text-xs flex items-center gap-1">
                          <span>{layoutItem.icon}</span> {layoutItem.label}
                        </span>
                        <span className="text-[9px] font-mono opacity-60 mt-0.5">{layoutItem.code}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2B. Artist Navigation HUD */}
            {category === "artist" && (
              <div className="web3-glass-card p-6">
                <div className="flex items-center gap-2 mb-4 pb-1 border-b border-zinc-800">
                  <User className="text-[#F042FF] w-4 h-4" />
                  <h3 className="font-display font-black text-sm tracking-wider uppercase text-zinc-200">
                    2. SELECT THEME & POSE GUIDE
                  </h3>
                </div>

                {/* Sub-step A: Theme Selector */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      CHOOSE THEME / AGENCY ({dynamicAgencies.length})
                    </label>
                    <span className="font-mono text-[9px] text-purple-400 font-semibold">
                      STEP 2A
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {dynamicAgencies.map((agency) => {
                      const agencyGroups = dynamicGroupsByAgency[agency.id] || [];
                      const isSelected = selectedAgency === agency.id;
                      return (
                        <button
                          key={agency.id}
                          onClick={() => handleAgencyChange(agency.id)}
                          className={isSelected ? "btn-studio-tab-active" : "btn-studio-tab"}
                        >
                          <span>{agency.name}</span>
                          {agencyGroups.length > 0 && (
                            <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                              isSelected ? "bg-white/20 text-white" : "bg-[#160078] text-zinc-400"
                            }`}>
                              {agencyGroups.length}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-step B: Group Selector */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      CHOOSE GROUP / LABEL
                    </label>
                    <span className="font-mono text-[9px] text-[#F042FF] font-semibold">
                      STEP 2B
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(dynamicGroupsByAgency[selectedAgency] || []).length === 0 ? (
                      <div className="text-xs text-zinc-500 font-mono py-2">
                        No groups available under this agency.
                      </div>
                    ) : (
                      (dynamicGroupsByAgency[selectedAgency] || []).map((group) => {
                        const isSelected = selectedGroup === group.id;
                        const groupMembers = dynamicMembersByGroup[group.id] || [];
                        return (
                          <button
                            key={group.id}
                            onClick={() => handleGroupChange(group.id)}
                            className={isSelected ? "btn-studio-tab-active" : "btn-studio-tab"}
                          >
                            <span>{group.logo || "✦"} {group.name}</span>
                            {groupMembers.length > 0 && (
                              <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                                isSelected ? "bg-white/20 text-white" : "bg-[#160078] text-zinc-400"
                              }`}>
                                {groupMembers.length}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Sub-step C: Member Grid Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      CHOOSE CO-STAR GUIDE ({ (dynamicMembersByGroup[selectedGroup] || []).length })
                    </label>
                    <span className="font-mono text-[9px] text-purple-400 font-semibold">
                      STEP 2C
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[210px] overflow-y-auto pr-1">
                    {(dynamicMembersByGroup[selectedGroup] || []).length === 0 ? (
                      <div className="col-span-3 text-center py-6 text-zinc-500 font-mono text-xs border border-zinc-800 rounded-xl bg-zinc-950/40">
                        No co-star guides found for this group.
                      </div>
                    ) : (
                      (dynamicMembersByGroup[selectedGroup] || []).map((member) => {
                        const isSelected = selectedArtist?.id === member.id;
                        const posesCount = member.poses?.length || 4;
                        return (
                          <div
                            key={member.id}
                            onClick={() => setSelectedArtist(member)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all duration-200 relative overflow-hidden ${
                              isSelected 
                                ? "border-[#F042FF] bg-[#160078]/80 shadow-[0_0_14px_rgba(240,66,255,0.25)]" 
                                : "border-zinc-800 bg-[#010030] hover:border-[#7226FF]"
                            }`}
                          >
                            <img
                              src={member.avatar || (member.poses && member.poses[0])}
                              alt={member.name}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                              style={{
                                border: isSelected ? `2px solid ${member.color || "#F042FF"}` : "1.5px solid rgba(255,255,255,0.1)"
                              }}
                            />
                            <div className="text-left overflow-hidden flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <div className="font-display font-black text-xs text-zinc-200 truncate leading-tight">
                                  {member.name}
                                </div>
                                {member.isFeatured && (
                                  <span className="text-[8px] bg-gradient-to-r from-amber-400 to-pink-500 text-black px-1 rounded font-bold uppercase tracking-wider shrink-0">
                                    ★
                                  </span>
                                )}
                              </div>
                              <div className="font-mono text-[8.5px] text-zinc-400 truncate uppercase mt-0.5">
                                {member.role}
                              </div>
                              <div className="font-mono text-[8px] text-purple-300 flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.color || "#F042FF" }} />
                                <span>{posesCount} Poses</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="mt-4 p-3 rounded-xl border border-purple-500/25 bg-[#010030] font-mono text-[10.5px] text-purple-300 leading-relaxed flex items-center justify-between">
                    <div>
                      ℹ️ <strong>Active Guide:</strong> <span className="text-white font-bold">{selectedArtist?.name || "NONE"}</span> {selectedGroup ? `(${selectedGroup.toUpperCase()})` : ""}.
                    </div>
                    <span className="text-[10px] bg-purple-500/20 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                      4-Grid Collab Strip
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Launch Shutter console */}
            <div className="w-full">
              <button
                onClick={() => { handleStart(); playClickSound(); }}
                className="btn-studio-primary w-full py-4.5 px-6 rounded-2xl text-base tracking-wider cursor-pointer shadow-[0_10px_30px_rgba(1,0,48,0.7)] hover:border-[#F042FF]"
              >
                <span>✦ START PHOTO BOOTH ✦</span>
              </button>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  );
};

export default Welcome;
