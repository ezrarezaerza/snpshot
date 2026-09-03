import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Camera, RefreshCw, Zap, Sliders, Play, Layout, Image as ImageIcon, Sparkles } from "lucide-react";
import Navbar from "./Navbar";
import "../App.css";
import { playShutterSound, playClickSound, playBeepSound } from "../utils/audio";

const DEFAULT_BOOTH_FILTERS = [
  { id: "none", name: "Normal", filterStr: "none" },
  { id: "warm-grain", name: "Warm Grain", badge: "POPULAR", filterStr: "brightness(105%) contrast(110%) saturate(115%) sepia(25%)" },
  { id: "pastel-glow", name: "Pastel Glow", badge: "FEATURED", filterStr: "brightness(112%) contrast(95%) saturate(108%) sepia(10%) hue-rotate(-10deg) blur(0.3px)" },
  { id: "cinematic-film", name: "Cinematic Film", badge: "NEW", filterStr: "contrast(120%) saturate(90%) sepia(35%) hue-rotate(10deg)" },
  { id: "bw-high-contrast", name: "Monochrome Noir", badge: "CLASSIC", filterStr: "brightness(102%) contrast(135%) saturate(0%)" },
  { id: "cyberpunk-neon", name: "Cyberpunk Neon", badge: "SPECIAL", filterStr: "brightness(108%) contrast(125%) saturate(145%) hue-rotate(45deg)" }
];

const getCssFilterString = (f) => {
  if (!f || f.id === "none") return "none";
  if (f.filterStr) return f.filterStr;
  const parts = [];
  if (f.brightness !== undefined && f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== undefined && f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== undefined && f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
  if (f.sepia !== undefined && f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.hueRotate !== undefined && f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.blur !== undefined && f.blur > 0) parts.push(`blur(${f.blur}px)`);
  return parts.length > 0 ? parts.join(" ") : "none";
};

const PhotoBooth = ({ setCapturedImages }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract configuration from location state
  const { 
    count: photoCount = 4, 
    layout = 'grid', 
    category = 'basic', 
    artist = null,
    presetFrameId = null
  } = location.state || {};

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [capturedImages, setImages] = useState([]);
  const [filter, setFilter] = useState("none");
  const [availableFilters, setAvailableFilters] = useState(DEFAULT_BOOTH_FILTERS);
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Custom states for Live Camera Session & Guided Overlay
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const totalShots = category === "artist" ? 8 : (photoCount + 2); // 8 shots for artist collab, otherwise photoCount + 2

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await axios.get("/api/studio/data");
        if (res.data && Array.isArray(res.data.filters)) {
          const active = res.data.filters.filter(f => f.active !== false);
          if (active.length > 0) {
            const mapped = [
              { id: "none", name: "Normal", filterStr: "none" },
              ...active.map(f => ({
                id: f.id,
                name: f.name,
                badge: f.badge,
                filterStr: getCssFilterString(f)
              }))
            ];
            setAvailableFilters(mapped);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch studio filters for booth, using default list:", err);
      }
    };
    loadFilters();
  }, []);

  // Web Audio Context Synthesized Beeps for countdown & capture
  const playBeep = (frequency = 800, duration = 120) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + duration / 1000);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
      console.warn("AudioContext failed or blocked by gesture:", e);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      try {
        setCameraError(null);
        if (!videoRef.current) return;
        
        if (videoRef.current.srcObject) {
          setCameraReady(true);
          return;
        }

        const constraints = {
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 960 },
            frameRate: { ideal: 30 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.style.transform = "scaleX(-1)";
          videoRef.current.style.objectFit = "cover";
          
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });

          if (mounted && videoRef.current) {
            await videoRef.current.play();
            setCameraReady(true);
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        if (mounted) {
          setCameraReady(false);
          setCameraError(
            error.name === "NotAllowedError" || error.message?.includes("Permission")
              ? "Camera permission denied. Please allow camera access in your browser or click 'Open in a New Tab'."
              : error.message || "Could not access camera. Please check your connection and permissions."
          );
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !videoRef.current?.srcObject) {
        startCamera();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (videoRef.current?.srcObject) return;

      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 960 },
          frameRate: { ideal: 30 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = "scaleX(-1)";
        videoRef.current.style.objectFit = "cover";
        
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
        
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraReady(false);
      setCameraError(
        error.name === "NotAllowedError" || error.message?.includes("Permission")
          ? "Camera permission denied. Please allow camera access or click 'Open in a New Tab'."
          : error.message || "Could not access camera."
      );
    }
  };

  const startCountdown = () => {
    if (capturing || !cameraReady) return;
    setCapturing(true);
    setImages([]); // clear past round
    setCurrentShotIndex(0);

    let photosTaken = 0;
    const newCapturedImages = [];

    const captureSequence = async () => {
      if (photosTaken >= totalShots) {
        setCountdown(null);
        setCapturing(false);

        try {
          setCapturedImages([...newCapturedImages]);
          setImages([...newCapturedImages]);

          setTimeout(() => {
            navigate("/preview", { 
              state: { photoCount, layout, category, artist, initialFilter: filter, presetFrameId }
            });
          }, 400);
        } catch (error) {
          console.error("Error navigating to preview:", error);
        }
        return;
      }

      setCurrentShotIndex(photosTaken);
      let timeLeft = 5; // Guided 5-second countdown
      setCountdown(timeLeft);
      playBeepSound(); // programmatically synthesized retro self-timer beep

      const timer = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);

        if (timeLeft > 0) {
          playBeepSound(); // beep on each count
        }

        if (timeLeft === 0) {
          clearInterval(timer);
          playShutterSound(); // classic analog metallic camera shutter release + noise
          
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 150);

          const imageUrl = capturePhoto();
          if (imageUrl) {
            newCapturedImages.push(imageUrl);
            setImages((prevImages) => [...prevImages, imageUrl]);
          }
          photosTaken += 1;
          
          if (photosTaken < totalShots) {
            setTimeout(captureSequence, 1200);
          } else {
            setTimeout(captureSequence, 800);
          }
        }
      }, 1000);
    };

    captureSequence();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const context = canvas.getContext("2d");

      const targetWidth = 1280;
      const targetHeight = 960;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetWidth / targetHeight;
      
      let drawWidth = video.videoWidth;
      let drawHeight = video.videoHeight;
      let startX = 0;
      let startY = 0;

      if (videoRatio > targetRatio) {
        drawWidth = drawHeight * targetRatio;
        startX = (video.videoWidth - drawWidth) / 2;
      } else {
        drawHeight = drawWidth / targetRatio;
        startY = (video.videoHeight - drawHeight) / 2;
      }

      context.save();
      context.translate(canvas.width, 0);
      context.scale(-1, 1); // Mirrored canvas drawing

      context.drawImage(
        video,
        startX, startY, drawWidth, drawHeight,
        0, 0, targetWidth, targetHeight
      );
      context.restore();

      if (category === "artist" && artist) {
        const artistImg = document.getElementById("active-artist-pose");
        if (artistImg) {
          context.save();
          context.drawImage(artistImg, 0, 0, targetWidth, targetHeight);
          context.restore();
        }
      }

      return canvas.toDataURL("image/png");
    }
  };

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay" style={{ paddingBottom: "80px", overflowY: "auto" }}>
      {/* Dynamic Grid Background line */}
      <div className="web3-grid-overlay" />

      {/* Navigation Header */}
      <Navbar />

      <div id="content" className="content max-w-4xl mx-auto px-4 pt-20 relative z-10">
        
        <div className="text-center mb-8">
          <div className="y2k-subtitle mb-2">✦ PHOTOBOOTH SHUTTER STATION ✦</div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            SAY
            <div className="y2k-highlight ml-2">CHEESE!</div>
          </h1>
        </div>

        {/* Dynamic Countdown Display */}
        {countdown !== null && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none select-none">
            <h2 
              key={countdown}
              className="text-scan-glow font-display font-black"
              style={{
                fontSize: "12rem",
                color: "#ffffff",
                textShadow: "0 0 20px #F042FF, 0 0 40px #7226FF, 0 0 60px #8A2BE2",
                animation: "neonPulse 0.9s ease-out forwards",
                textAlign: "center"
              }}
            >
              {countdown}
            </h2>
          </div>
        )}

        {/* Active Session Status Bar */}
        <div className="web3-glass-card p-3.5 mb-6 flex justify-between items-center border-zinc-800/80 bg-zinc-950/65">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#F042FF] animate-ping shrink-0" />
            <span className="text-zinc-400">SESSION:</span>
            <span className="text-white font-bold uppercase">
              {category === "artist" ? `Collab with ${artist?.name}` : "Classic Photo Strip"}
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-[#F042FF]/15 border border-[#F042FF]/40 text-[#F042FF] px-2.5 py-1 rounded">
              SHOT: {capturing ? `${currentShotIndex + 1} / ${totalShots}` : `${capturedImages.length} / ${totalShots}`}
            </span>
          </div>
        </div>

        {/* Main Interface Block */}
        <div className="flex flex-col items-center gap-6">
          
          {/* CAMERA FEED PORTAL */}
          <div className="w-full relative bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Screen Flash Overlay */}
            {isFlashing && (
              <div className="absolute inset-0 bg-white z-50 animate-pulse" style={{ animationDuration: "150ms" }} />
            )}

            {/* Offline/Error HUD */}
            {cameraError && (
              <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center text-center p-6 z-40 border border-red-500/30">
                <Camera className="w-12 h-12 text-red-500 mb-3" />
                <h3 className="font-display font-black text-sm text-red-500 uppercase tracking-widest mb-1.5">CAMERA OFFLINE</h3>
                <p className="font-sans text-[11px] text-zinc-400 max-w-md leading-relaxed mb-5">{cameraError}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={startCamera}
                    className="btn-studio-primary py-2.5 px-5 text-xs font-mono"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> TRY AGAIN
                  </button>
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-studio-tab py-2.5 px-5 text-xs font-mono inline-flex items-center gap-1.5"
                  >
                    NEW TAB ↗
                  </a>
                </div>
              </div>
            )}

            {/* CONDITIONAL CAM STACK */}
            {category === "artist" && artist ? (
              <div className="relative w-full aspect-[4/3] rounded overflow-hidden">
                {/* HUD Viewfinder details */}
                <div className="hud-corner hud-tl" />
                <div className="hud-corner hud-tr" />
                <div className="hud-corner hud-bl" />
                <div className="hud-corner hud-br" />
                <div className="hud-crosshair" />

                {/* Layer 1: Mirrored Live Stream */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    filter, 
                    transform: "scaleX(-1)",
                    opacity: cameraError ? 0.15 : 1,
                    zIndex: 1,
                    borderRadius: "0px" // Strict sharp corners inside booth preview
                  }} 
                />

                {/* Layer 2: Artist Transparent Overlay */}
                <img
                  id="active-artist-pose"
                  src={artist.poses[category === "artist" ? Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1) : currentShotIndex] || artist.avatar}
                  alt={artist.name}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{
                    zIndex: 2,
                    borderRadius: "0px",
                    transition: "opacity 0.25s ease-in-out"
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/25 pointer-events-none z-10" />

                {/* Indicator Labels */}
                <div className="absolute top-3 left-3 bg-black/60 border border-zinc-800 text-white font-mono text-[9px] px-2 py-0.5 rounded tracking-widest uppercase z-20">
                  🔴 LIVE FEED
                </div>

                <div 
                  className="absolute top-3 right-3 text-white font-mono text-[9px] px-2 py-0.5 rounded tracking-widest uppercase z-20"
                  style={{ backgroundColor: artist.color || "#F042FF", boxShadow: `0 0 10px ${artist.color}` }}
                >
                  ✦ PARTNER: {artist.name.toUpperCase()} {`POSE_${Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1) + 1}`}
                </div>

                {/* Live Action Pose prompt overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/75 border border-[#F042FF]/30 text-[#F042FF] font-mono text-[10px] text-center py-2 px-4 rounded-md tracking-wider z-20">
                  POSITION YOURSELF ON THE LEFT SIDE TO POSE WITH {artist.name.toUpperCase()}
                </div>
              </div>
            ) : (
              /* Basic stream overlay */
              <div className="relative w-full aspect-[4/3] rounded overflow-hidden">
                <div className="hud-corner hud-tl" />
                <div className="hud-corner hud-tr" />
                <div className="hud-corner hud-bl" />
                <div className="hud-corner hud-br" />
                <div className="hud-crosshair" />

                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    filter, 
                    transform: "scaleX(-1)",
                    opacity: cameraError ? 0.15 : 1,
                    borderRadius: "0px" // Strict sharp film corners
                  }} 
                />
                
                <div className="absolute top-3 left-3 bg-black/60 border border-zinc-800 text-[#F042FF] font-mono text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                  🔴 LIVE VIEWFINDER
                </div>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* ACTIVE POSE ROADMAP AT THE BOTTOM (ARTIST MODE) */}
          {category === "artist" && artist && artist.poses && artist.poses.length > 0 && (
            <div className="web3-glass-card p-4 w-full border-zinc-800/80">
              <div className="flex justify-between items-center mb-3 font-mono text-[10px]">
                <span className="text-zinc-400 uppercase tracking-widest">POSE SEQUENCE</span>
                <span style={{ color: artist.color }}>
                  ACTIVE: {Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1) + 1} OF {artist.poses.length}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {artist.poses.map((poseUrl, idx) => {
                  const activePoseIdx = Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1);
                  const isPast = idx < activePoseIdx;
                  const isActive = idx === activePoseIdx;
                  
                  return (
                    <div 
                      key={idx}
                      className={`relative rounded-lg p-1.5 flex flex-col items-center border transition-all duration-300 ${
                        isActive 
                          ? "border-[#F042FF] bg-[#F042FF]/10 scale-[1.03]" 
                          : "border-zinc-800 bg-zinc-950/40 opacity-60"
                      }`}
                    >
                      <div className="w-full aspect-[4/3] bg-zinc-900 rounded overflow-hidden flex items-center justify-center relative">
                        <img 
                          src={poseUrl} 
                          alt={`Pose ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="max-w-full max-h-full object-contain"
                        />
                        {isPast && (
                          <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center text-white font-mono text-[10px] font-bold">
                            ✓ READY
                          </div>
                        )}
                        {isActive && (
                          <div 
                            className="absolute bottom-1 right-1 text-white font-mono text-[8px] px-1 py-0.2 rounded"
                            style={{ backgroundColor: artist.color }}
                          >
                            LIVE
                          </div>
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-zinc-500 mt-2">POSE_0{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* FILM STRIP: RECENT CAPTURES RECTANGULAR ROW */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-2.5 font-mono text-xs text-zinc-500">
              <span className="uppercase tracking-widest">CAPTURED FRAMES</span>
              <span>{capturedImages.length} taken (choose best {photoCount} on next screen)</span>
            </div>

            <div className="grid grid-cols-6 gap-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 shadow-inner">
              {Array.from({ length: totalShots }).map((_, index) => {
                const capturedImg = capturedImages[index];
                return (
                  <div 
                    key={index}
                    className="relative aspect-[3/4] overflow-hidden border transition-all duration-300"
                    style={{
                      borderRadius: "0px", // Strict 0px sharp corners to mimic real film prints
                      borderColor: capturedImg ? "#F042FF" : "rgba(255,255,255,0.06)",
                      background: capturedImg ? "#0a0a0a" : "rgba(0,0,0,0.4)",
                      boxShadow: capturedImg ? "0 0 10px rgba(240, 66, 255, 0.25)" : "none"
                    }}
                  >
                    {capturedImg ? (
                      <img
                        src={capturedImg}
                        alt={`Capture ${index}`}
                        className="absolute inset-0 w-full h-full object-cover photobooth-print-image"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-zinc-700 font-bold">
                        0{index + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FILTER CONSOLE SELECTOR */}
          <div className="web3-glass-card p-5 w-full">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> CHOOSE CAMERA FILTER
              </div>
              <span className="text-[10px] text-zinc-400 font-normal">
                {availableFilters.length} STUDIO PRESETS
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {availableFilters.map((filt) => {
                const isSelected = filter === filt.filterStr || (filt.id === "none" && filter === "none");
                return (
                  <button
                    key={filt.id}
                    onClick={() => { setFilter(filt.filterStr); playClickSound(); }}
                    disabled={capturing}
                    className={isSelected ? "btn-studio-tab-active" : "btn-studio-tab"}
                  >
                    {filt.badge && (
                      <span className="mr-1 text-[9px] px-1.5 py-0.2 rounded bg-[#F042FF]/20 text-[#FFE5F1] font-mono">
                        {filt.badge}
                      </span>
                    )}
                    {filt.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* BIG SHUTTER CAPTURE FAB TRIGGER */}
          <div className="w-full">
            <button 
              onClick={() => { startCountdown(); playClickSound(); }} 
              disabled={capturing || !cameraReady}
              className="btn-studio-primary w-full py-4 px-6 rounded-2xl text-base tracking-wider cursor-pointer shadow-[0_10px_30px_rgba(1,0,48,0.7)] hover:border-[#F042FF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {!cameraReady 
                  ? "⌛ STARTING CAMERA..." 
                  : capturing 
                    ? "CAPTURING PHOTOS... STAY STILL" 
                    : `✧ TAKE PHOTOS (${totalShots} SHOTS) ✧`
                }
              </span>
            </button>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes flashEffect {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes neonPulse {
          0% {
            transform: scale(0.5) rotate(-10deg);
            opacity: 0;
            filter: brightness(2);
          }
          40% {
            transform: scale(1.1) rotate(5deg);
            opacity: 1;
            filter: brightness(1.3);
          }
          70% {
            transform: scale(0.95) rotate(-2deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoBooth;
