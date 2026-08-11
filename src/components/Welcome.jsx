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

  // Fetch custom creator campaigns on mount and merge them
  useEffect(() => {
    axios.get("/api/creator/data")
      .then(res => {
        const { artists } = res.data;
        if (artists && artists.length > 0) {
          const updatedAgencies = [...agencies];
          const updatedGroupsByAgency = { ...groupsByAgency };
          const updatedMembersByGroup = { ...membersByGroup };

          artists.forEach(art => {
            // Merge custom agency
            if (!updatedAgencies.some(a => a.id === art.agencyId)) {
              updatedAgencies.push({ id: art.agencyId, name: art.agencyName });
            }
            // Merge custom group
            if (!updatedGroupsByAgency[art.agencyId]) {
              updatedGroupsByAgency[art.agencyId] = [];
            }
            if (!updatedGroupsByAgency[art.agencyId].some(g => g.id === art.groupId)) {
              updatedGroupsByAgency[art.agencyId].push({
                id: art.groupId,
                name: art.groupName,
                logo: art.groupLogo,
                isMale: art.isMale
              });
            }
            // Merge custom artist member
            if (!updatedMembersByGroup[art.groupId]) {
              updatedMembersByGroup[art.groupId] = [];
            }
            if (!updatedMembersByGroup[art.groupId].some(m => m.id === art.id)) {
              updatedMembersByGroup[art.groupId].push({
                id: art.id,
                name: art.name,
                role: art.role,
                color: art.color,
                avatar: art.avatar,
                poses: art.poses
              });
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
          <div className="y2k-subtitle mb-2">✦ PRE-CAPTURE LOBBY ✦</div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
            ENTER THE
            <div className="y2k-highlight ml-3">BOOTH</div>
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
                    <Camera className="w-3.5 h-3.5" /> ✧ LIVE CAM VIEWFINDER ✧
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
                    SAY CHEESE! 📸
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
                  <strong>Position Calibration:</strong> Center your shoulders inside the viewfinder frame. When choosing an <strong>Artist Collab</strong>, they will occupy the right side of the frame as a transparent guide overlay!
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
                  1. SELECT YOUR EXPERIENCE
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Basic selector */}
                <div 
                  onClick={() => { setCategory("basic"); playClickSound(); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    category === "basic" 
                      ? "border-[#F042FF] bg-[#F042FF]/10 shadow-[0_4px_12px_rgba(240,66,255,0.15)]" 
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">🎞️</span>
                    {category === "basic" && <Check className="w-4 h-4 text-[#F042FF]" />}
                  </div>
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-wider mb-1">Basic Strip</h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                    Standard retro photobooth layout configs with full customizable border textures.
                  </p>
                </div>

                {/* Artist selector */}
                <div 
                  onClick={() => { setCategory("artist"); playClickSound(); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    category === "artist" 
                      ? "border-purple-500 bg-purple-500/5 shadow-[0_0_15px_rgba(138,43,226,0.1)]" 
                      : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">🤝</span>
                    {category === "artist" && <Check className="w-4 h-4 text-purple-500" />}
                  </div>
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-wider mb-1">Artist Collab</h4>
                  <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                    Snap high-energy frames side-by-side with digital K-Pop & J-Pop star pose guides.
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
                  <button
                    className={`count-button ${selectedLayout === "3-grid" ? "selected" : ""}`}
                    onClick={() => { setSelectedLayout("3-grid"); playClickSound(); }}
                    style={{ margin: 0, padding: "12px 6px!" }}
                  >
                    <span className="flex flex-col items-center text-center gap-1">
                      <span className="font-bold text-xs">🎞️ 3-GRID</span>
                      <span className="text-[9px] font-mono opacity-60">3_S_VERT</span>
                    </span>
                  </button>
                  <button
                    className={`count-button ${selectedLayout === "4-grid" ? "selected" : ""}`}
                    onClick={() => { setSelectedLayout("4-grid"); playClickSound(); }}
                    style={{ margin: 0, padding: "12px 6px!" }}
                  >
                    <span className="flex flex-col items-center text-center gap-1">
                      <span className="font-bold text-xs">🎞️ 4-GRID</span>
                      <span className="text-[9px] font-mono opacity-60">4_S_VERT</span>
                    </span>
                  </button>
                  <button
                    className={`count-button ${selectedLayout === "2x2" ? "selected" : ""}`}
                    onClick={() => { setSelectedLayout("2x2"); playClickSound(); }}
                    style={{ margin: 0, padding: "12px 6px!" }}
                  >
                    <span className="flex flex-col items-center text-center gap-1">
                      <span className="font-bold text-xs">🖼️ 2x2 GRID</span>
                      <span className="text-[9px] font-mono opacity-60">4_S_SQUARE</span>
                    </span>
                  </button>
                  <button
                    className={`count-button ${selectedLayout === "3x2" ? "selected" : ""}`}
                    onClick={() => { setSelectedLayout("3x2"); playClickSound(); }}
                    style={{ margin: 0, padding: "12px 6px!" }}
                  >
                    <span className="flex flex-col items-center text-center gap-1">
                      <span className="font-bold text-xs">🖼️ 3x2 GRID</span>
                      <span className="text-[9px] font-mono opacity-60">6_S_LAND</span>
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* 2B. Artist Navigation HUD */}
            {category === "artist" && (
              <div className="web3-glass-card p-6">
                <div className="flex items-center gap-2 mb-4 pb-1 border-b border-zinc-800">
                  <User className="text-[#F042FF] w-4 h-4" />
                  <h3 className="font-display font-black text-sm tracking-wider uppercase text-zinc-200">
                    2. SELECT YOUR CO-STAR
                  </h3>
                </div>

                {/* Sub-step A: Agency Selector */}
                <div className="mb-4">
                  <label className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1.5 tracking-wider">
                    CHOOSE AGENCY / CREATOR
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {dynamicAgencies.map((agency) => (
                      <button
                        key={agency.id}
                        onClick={() => handleAgencyChange(agency.id)}
                        className={`camera-ctrl ${
                          selectedAgency === agency.id 
                            ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_10px_rgba(138,43,226,0.25)]" 
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                        style={{
                          margin: 0,
                          padding: "6px 14px",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          borderWidth: "1px",
                          fontWeight: "700"
                        }}
                      >
                        {agency.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-step B: Group Selector */}
                <div className="mb-5">
                  <label className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1.5 tracking-wider">
                    CHOOSE GROUP / LABEL
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(dynamicGroupsByAgency[selectedAgency] || []).map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupChange(group.id)}
                        className={`camera-ctrl ${
                          selectedGroup === group.id 
                            ? "bg-[#F042FF] text-white border-[#F042FF] shadow-[0_0_10px_rgba(240,66,255,0.25)]" 
                            : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                        }`}
                        style={{
                          margin: 0,
                          padding: "8px 16px",
                          borderRadius: "999px",
                          fontSize: "0.85rem",
                          borderWidth: "1px",
                          fontWeight: "700"
                        }}
                      >
                        {group.logo} {group.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-step C: Member Grid Selector */}
                <div>
                  <label className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-2 tracking-wider">
                    CHOOSE CO-STAR GUIDE
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[190px] overflow-y-auto pr-1">
                    {(dynamicMembersByGroup[selectedGroup] || []).map((member) => {
                      const isSelected = selectedArtist?.id === member.id;
                      return (
                        <div
                          key={member.id}
                          onClick={() => setSelectedArtist(member)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? "border-purple-400 bg-purple-500/10 shadow-[0_0_12px_rgba(138,43,226,0.15)]" 
                              : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                          }`}
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                            style={{
                              border: isSelected ? `2px solid ${member.color}` : "1.5px solid rgba(255,255,255,0.1)"
                            }}
                          />
                          <div className="text-left overflow-hidden">
                            <div className="font-display font-black text-xs text-zinc-200 truncate leading-none mb-1">
                              {member.name}
                            </div>
                            <div className="font-mono text-[8.5px] text-zinc-500 truncate uppercase">
                              {member.role}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 p-3 rounded-lg border border-purple-500/25 bg-purple-500/5 font-mono text-[10.5px] text-purple-300 leading-relaxed">
                    ℹ️ <strong>Selected Guide:</strong> {selectedArtist?.name || "NONE"} ({selectedGroup.toUpperCase()}). Layout strictly locked to **4-Grid Photo Strip** for side-by-side posing companion templates.
                  </div>
                </div>
              </div>
            )}

            {/* Launch Shutter console */}
            <div className="shutter-outer">
              <div className="shutter-pulse-ring" />
              <button
                onClick={() => { handleStart(); playClickSound(); }}
                className="y2k-button w-full relative z-10"
                style={{
                  padding: "16px",
                  fontSize: "1.2rem",
                  justifyContent: "center"
                }}
              >
                ✦ CALIBRATION COMPLETE // ENTER THE PHOTOBOOTH ✦
              </button>
            </div>
            
          </div>

        </div>

      </div>
    </div>
  );
};

export default Welcome;
