import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Camera, RefreshCw, Zap, Play, Layout, Image as ImageIcon, Sparkles, ChevronLeft, Clock, RotateCcw, Check, Film, Smile, Heart } from "lucide-react";
import Navbar from "./Navbar";
import "../App.css";
import { playShutterSound, playClickSound, playBeepSound } from "../utils/audio";
import { normalizeMediaUrl } from "../utils/blobClient";

const CLASSIC_POSE_GUIDES = [
  { emoji: "😊", label: "Center Smile", tip: "Look straight into camera lens & natural warm smile" },
  { emoji: "✌️", label: "Peace Sign", tip: "Hold a classic V-sign by your cheek or chin" },
  { emoji: "🫰", label: "Finger Heart", tip: "K-pop finger heart or double-hand heart pose" },
  { emoji: "😉", label: "Playful Wink", tip: "Wink or tilted head candid expression" },
  { emoji: "🫶", label: "Cheek Heart", tip: "Half-heart against cheek or over the eye" },
  { emoji: "✨", label: "Free Pose", tip: "Expressive candid pose, look away, or big laugh!" },
  { emoji: "🌸", label: "Flower Cup", tip: "Cup chin in hands for flower cup pose" },
  { emoji: "😎", label: "Chic Look", tip: "Cool editorial gaze with chin slightly down" }
];

const PhotoBooth = ({ setCapturedImages }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract configuration from location state
  const { 
    count: photoCount = 4, 
    layout = '4-grid', 
    category = 'basic', 
    artist = null,
    dedicatedFrame = null,
    dedicatedFrameId = null,
    presetFrameId = null
  } = location.state || {};

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [capturedImages, setImages] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(5);

  // Custom states for Live Camera Session & Guided Overlay
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const totalShots = category === "artist" ? 8 : (photoCount + 2); // 8 shots for artist collab, otherwise photoCount + 2

  // Track layout selection analytics & load system settings
  useEffect(() => {
    // 1. Log layout selection in studio analytics
    axios.post("/api/creator/analytics/track", {
      eventType: "layout_select",
      layoutId: layout || "3-grid"
    }).catch(() => {});

    // 2. Fetch system settings for custom countdown duration
    const loadSettings = async () => {
      try {
        const res = await axios.get("/api/creator/settings");
        if (res.data?.camera?.defaultCountdown) {
          setCountdownSeconds(Number(res.data.camera.defaultCountdown) || 5);
        }
      } catch (e) {
        console.warn("Using default booth settings:", e);
      }
    };
    loadSettings();
  }, [layout]);

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
              state: { photoCount, layout, category, artist, dedicatedFrame, dedicatedFrameId, initialFilter: "none", presetFrameId }
            });
          }, 400);
        } catch (error) {
          console.error("Error navigating to preview:", error);
        }
        return;
      }

      setCurrentShotIndex(photosTaken);
      let timeLeft = countdownSeconds || 5; // Configured countdown duration from system settings
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
            // Track photo capture in studio analytics
            axios.post("/api/creator/analytics/track", { eventType: "photo_capture" }).catch(() => {});
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

  const handleResetImages = () => {
    if (capturing) return;
    setImages([]);
    setCurrentShotIndex(0);
    playClickSound();
  };

  // Keyboard shortcut: Spacebar triggers camera capture
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space" && !capturing && cameraReady) {
        e.preventDefault();
        playClickSound();
        startCountdown();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [capturing, cameraReady, countdownSeconds, totalShots]);

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
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay" style={{ paddingBottom: "24px", overflowY: "auto", overflowX: "hidden" }}>
      {/* Dynamic Grid Background line */}
      <div className="web3-grid-overlay" />

      {/* Navigation Header */}
      <Navbar />

      <div id="content" className="content max-w-7xl mx-auto px-3 sm:px-6 pt-16 sm:pt-20 relative z-10">

        {/* Header Bar with Single-Line Headline (matching Welcome.jsx style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full mb-3 sm:mb-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="y2k-subtitle text-xs py-1.5 px-4 whitespace-nowrap shrink-0">
              ✦ PHOTOBOOTH SHUTTER STATION ✦
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 m-0 leading-none">
              <span>SAY</span>
              <span className="y2k-highlight my-0 leading-none">CHEESE!</span>
            </h1>
          </div>

          {/* Quick Navigation & Stream Status */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-[#16023d]/80 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">STREAM:</span>
              <span className="text-purple-300 font-bold">1080P HD</span>
            </div>
            <Link
              to="/welcome"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2e109d] bg-[#0c0333]/90 hover:bg-[#16023d] hover:border-[#F042FF]/50 text-zinc-300 hover:text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Return to layout & idol selection"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>BACK TO STUDIO</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Studio Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-4 xl:gap-5 w-full items-start">
          
          {/* LEFT COLUMN: LIVE FEED CAMERA VIEWFINDER (FOCAL POINT) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-2.5">
            <div className="w-full relative bg-[#060020] p-1.5 sm:p-2 rounded-2xl border border-[#2e109d] shadow-[0_12px_40px_rgba(1,0,48,0.9)] overflow-hidden group/cam">
              
              {/* Screen Flash Overlay */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white z-50 animate-pulse pointer-events-none" style={{ animationDuration: "150ms" }} />
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
                      className="btn-studio-primary text-xs py-2 px-4"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> TRY AGAIN
                    </button>
                    <a 
                      href={window.location.href} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn-studio-secondary text-xs"
                    >
                      NEW TAB ↗
                    </a>
                  </div>
                </div>
              )}

              {/* CONDITIONAL CAM STACK */}
              {category === "artist" && artist ? (
                <div className="relative w-full aspect-[4/3] max-h-[min(510px,62vh)] rounded-xl overflow-hidden bg-black mx-auto">
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
                      transform: "scaleX(-1)",
                      opacity: cameraError ? 0.15 : 1,
                      zIndex: 1,
                      borderRadius: "0px"
                    }} 
                  />

                  {/* Layer 2: Artist Transparent Overlay */}
                  <img
                    id="active-artist-pose"
                    src={normalizeMediaUrl((artist.poses && artist.poses.length > 0) ? artist.poses[Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1)] : (artist.avatar || ""))}
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

                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none z-10" />

                  {/* Top HUD Indicators */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
                    <div className="bg-black/75 backdrop-blur-sm border border-[#2e109d] text-white font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md tracking-widest uppercase flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE FEED
                    </div>
                    <div className="hidden sm:block bg-black/60 border border-zinc-800 text-zinc-300 font-mono text-[9px] px-2 py-1 rounded-md">
                      {countdownSeconds}s TIMER
                    </div>
                  </div>

                  <div 
                    className="absolute top-3 right-3 text-white font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md tracking-widest uppercase z-20 font-bold flex items-center gap-1.5 shadow-md"
                    style={{ backgroundColor: artist.color || "#F042FF", boxShadow: `0 0 14px ${artist.color || "#F042FF"}90` }}
                  >
                    ✦ PARTNER: {artist.name.toUpperCase()} {(artist.poses && artist.poses.length > 0) ? `POSE_${Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1) + 1}` : ""}
                  </div>

                  {/* Live Action Pose prompt overlay */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm border border-[#F042FF]/40 text-[#F042FF] font-mono text-[10px] sm:text-[11px] text-center py-2 px-4 rounded-lg tracking-wider z-20 shadow-lg font-bold">
                    {artist.posesGuidance && artist.posesGuidance[Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1)] 
                      ? artist.posesGuidance[Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1)].toUpperCase()
                      : `POSITION YOURSELF ON THE LEFT SIDE TO POSE WITH ${artist.name.toUpperCase()}`
                    }
                  </div>

                  {/* Subtle Top-Center Viewfinder Countdown HUD (Non-obstructing, translucent) */}
                  {countdown !== null && (
                    <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(240,66,255,0.25)]">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F042FF] animate-ping shrink-0" />
                        <span 
                          key={countdown} 
                          className="font-display font-black text-xl sm:text-2xl text-white/90 tracking-tight drop-shadow-[0_0_8px_rgba(240,66,255,0.6)] leading-none"
                        >
                          {countdown}
                        </span>
                        <span className="font-mono text-[8px] sm:text-[9px] text-purple-200/80 uppercase tracking-widest font-bold">
                          SEC
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Basic stream overlay */
                <div className="relative w-full aspect-[4/3] max-h-[min(510px,62vh)] rounded-xl overflow-hidden bg-black mx-auto">
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
                      transform: "scaleX(-1)",
                      opacity: cameraError ? 0.15 : 1,
                      borderRadius: "0px"
                    }} 
                  />
                  
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-sm border border-[#2e109d] text-[#F042FF] font-mono text-[9px] sm:text-[10px] px-2.5 py-1 rounded-md tracking-widest uppercase flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    LIVE VIEWFINDER
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm border border-[#2e109d] text-zinc-200 font-mono text-[10px] sm:text-[11px] text-center py-2 px-4 rounded-lg tracking-wider z-20 flex items-center justify-center gap-2">
                    <span className="text-sm sm:text-base">{CLASSIC_POSE_GUIDES[currentShotIndex % CLASSIC_POSE_GUIDES.length]?.emoji || "✨"}</span>
                    <span className="font-bold text-[#F042FF] uppercase">{CLASSIC_POSE_GUIDES[currentShotIndex % CLASSIC_POSE_GUIDES.length]?.label || "Studio Pose"}</span>
                    <span className="text-zinc-400 hidden sm:inline">— {CLASSIC_POSE_GUIDES[currentShotIndex % CLASSIC_POSE_GUIDES.length]?.tip || "Center yourself for crisp studio shots"}</span>
                  </div>

                  {/* Subtle Top-Center Viewfinder Countdown HUD (Non-obstructing, translucent) */}
                  {countdown !== null && (
                    <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none select-none flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_12px_rgba(240,66,255,0.25)]">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#F042FF] animate-ping shrink-0" />
                        <span 
                          key={countdown} 
                          className="font-display font-black text-xl sm:text-2xl text-white/90 tracking-tight drop-shadow-[0_0_8px_rgba(240,66,255,0.6)] leading-none"
                        >
                          {countdown}
                        </span>
                        <span className="font-mono text-[8px] sm:text-[9px] text-purple-200/80 uppercase tracking-widest font-bold">
                          SEC
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </div>

          {/* RIGHT COLUMN: STUDIO CONTROL CONSOLE & ROADMAP */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-2 sm:gap-2.5 min-w-0 max-w-full">
            
            {/* 1. Active Session & Shutter Timer Card */}
            <div 
              className="web3-glass-card p-3 flex flex-col gap-2 border-[#2e109d] bg-[#0c0333]/90 shadow-md rounded-xl"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#F042FF] animate-ping shrink-0" />
                  <span className="text-zinc-400 font-medium">SESSION:</span>
                  <span className="text-white font-bold uppercase truncate max-w-[150px] sm:max-w-[200px]">
                    {category === "artist" ? `Collab with ${artist?.name || 'Artist'}` : "Classic Strip"}
                  </span>
                  {category === "artist" && (
                    <span className="text-[9px] bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2 py-0.5 rounded font-bold uppercase shrink-0">
                      🔒 {dedicatedFrame?.name || `${artist?.name || 'Collab'} Frame`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 font-mono text-xs shrink-0">
                  <span className="bg-[#F042FF]/15 border border-[#F042FF]/40 text-[#F042FF] font-bold px-2.5 py-0.5 rounded text-[11px]">
                    SHOT: {capturing ? `${currentShotIndex + 1} / ${totalShots}` : `${capturedImages.length} / ${totalShots}`}
                  </span>
                </div>
              </div>

              {/* Timer Selector Toolbar */}
              <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/80 font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>SELF-TIMER:</span>
                </div>
                <div className="flex items-center gap-1">
                  {[3, 5, 10].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      disabled={capturing}
                      onClick={() => {
                        setCountdownSeconds(sec);
                        playClickSound();
                      }}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        countdownSeconds === sec
                          ? "bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white shadow-[0_0_8px_rgba(240,66,255,0.4)]"
                          : "bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800 hover:border-purple-500/40"
                      }`}
                      title={`Set camera countdown to ${sec} seconds`}
                    >
                      {sec}S
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Pose Sequence (Artist Mode) */}
            {category === "artist" && artist && artist.poses && artist.poses.length > 0 && (
              <div 
                className="web3-glass-card p-3 w-full border-[#2e109d] bg-[#0c0333]/85 shadow-md overflow-hidden rounded-xl"
              >
                <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-300 uppercase tracking-widest font-bold">
                    <Sparkles className="w-3 h-3 text-[#F042FF]" />
                    <span>ARTIST POSE SEQUENCE</span>
                  </div>
                  <span style={{ color: artist.color || "#F042FF" }} className="font-bold">
                    ACTIVE: {Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1) + 1} OF {artist.poses.length}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {artist.poses.map((poseUrl, idx) => {
                    const activePoseIdx = Math.min(Math.floor(currentShotIndex / 2), artist.poses.length - 1);
                    const isPast = idx < activePoseIdx;
                    const isActive = idx === activePoseIdx;
                    
                    return (
                      <div 
                        key={idx}
                        className={`relative rounded-lg p-1 flex flex-col items-center border transition-all duration-300 ${
                          isActive 
                            ? "border-[#F042FF] bg-[#F042FF]/15 shadow-[0_0_12px_rgba(240,66,255,0.35)] scale-[1.02]" 
                            : isPast
                              ? "border-emerald-500/40 bg-emerald-950/20 opacity-85"
                              : "border-zinc-800/80 bg-zinc-950/40 opacity-70"
                        }`}
                      >
                        <div className="w-full aspect-[4/3] bg-zinc-900 rounded overflow-hidden flex items-center justify-center relative">
                          <img 
                            src={normalizeMediaUrl(poseUrl)} 
                            alt={`Pose ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-full h-full object-contain"
                          />
                          {isPast && (
                            <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center text-white font-mono text-[8px] font-bold">
                              ✓ READY
                            </div>
                          )}
                          {isActive && (
                            <div 
                              className="absolute bottom-1 right-1 text-white font-mono text-[7px] px-1 py-0.2 rounded font-bold shadow-sm"
                              style={{ backgroundColor: artist.color || "#F042FF" }}
                            >
                              LIVE
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-[8px] text-zinc-400 mt-1 font-semibold">POSE_0{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2b. Classic Studio Pose Sequence (Original Mode) */}
            {category !== "artist" && (
              <div 
                className="web3-glass-card p-3 w-full border-[#2e109d] bg-[#0c0333]/85 shadow-md overflow-hidden rounded-xl"
              >
                <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-300 uppercase tracking-widest font-bold">
                    <Smile className="w-3 h-3 text-[#F042FF]" />
                    <span>POSE INSPIRATION ROADMAP</span>
                  </div>
                  <span className="text-[#F042FF] font-bold">
                    {capturing ? `SHOT 0${currentShotIndex + 1} OF 0${totalShots}` : `${totalShots} SHOT SET`}
                  </span>
                </div>

                <div className={`grid gap-1 sm:gap-1.5 ${totalShots <= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-4 sm:grid-cols-8'}`}>
                  {Array.from({ length: totalShots }).map((_, idx) => {
                    const guide = CLASSIC_POSE_GUIDES[idx % CLASSIC_POSE_GUIDES.length];
                    const isTaken = idx < capturedImages.length;
                    const isActive = capturing && idx === currentShotIndex;

                    return (
                      <div
                        key={idx}
                        className={`rounded-lg p-1.5 flex flex-col items-center text-center border transition-all duration-200 ${
                          isActive
                            ? "border-[#F042FF] bg-[#F042FF]/20 shadow-[0_0_12px_rgba(240,66,255,0.4)] scale-105"
                            : isTaken
                              ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-300"
                              : "border-zinc-800/80 bg-zinc-950/40 text-zinc-400"
                        }`}
                        title={guide.tip}
                      >
                        <span className="text-base sm:text-lg mb-0.5 leading-none">{guide.emoji}</span>
                        <span className={`font-mono text-[8px] font-bold truncate max-w-full leading-tight ${isActive ? 'text-white' : isTaken ? 'text-emerald-300' : 'text-zinc-400'}`}>
                          {guide.label}
                        </span>
                        <div className="mt-1">
                          {isTaken ? (
                            <span className="text-[7px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/30">
                              ✓ DONE
                            </span>
                          ) : isActive ? (
                            <span className="text-[7px] font-mono font-bold text-white bg-[#F042FF] px-1 py-0.2 rounded animate-pulse">
                              NOW
                            </span>
                          ) : (
                            <span className="text-[7px] font-mono text-zinc-600">
                              0{idx + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1 text-purple-300">
                    <Sparkles className="w-2.5 h-2.5 text-[#F042FF]" /> Filters & frames customized on next canvas step
                  </span>
                  <span className="text-zinc-500">PRO-STUDIO</span>
                </div>
              </div>
            )}

            {/* 3. Filmstrip: Captured Frames Buffer (Aspect ratio matches 4:3 camera view, no overflow) */}
            <div 
              className="web3-glass-card p-3 w-full border-[#2e109d] bg-[#0c0333]/85 shadow-md overflow-hidden rounded-xl"
            >
              <div className="flex justify-between items-center mb-1.5 font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <ImageIcon className="w-3 h-3 text-purple-400" />
                  <span className="uppercase tracking-widest font-bold">FILMSTRIP BUFFER</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#F042FF] font-bold">{capturedImages.length} of {totalShots} taken</span>
                  {capturedImages.length > 0 && !capturing && (
                    <button
                      type="button"
                      onClick={handleResetImages}
                      className="text-[9px] text-zinc-400 hover:text-red-400 flex items-center gap-0.5 border border-zinc-800 hover:border-red-500/40 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                      title="Clear taken shots to start over"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> RETAKE
                    </button>
                  )}
                </div>
              </div>

              {/* Perforated Film Roll Edge */}
              <div className="p-2 bg-[#060020] rounded-lg border border-zinc-800/80 shadow-inner overflow-hidden w-full max-w-full">
                <div className={`grid gap-2 w-full max-w-full ${totalShots <= 4 ? 'grid-cols-4' : totalShots === 6 ? 'grid-cols-3 sm:grid-cols-3' : 'grid-cols-4'}`}>
                  {Array.from({ length: totalShots }).map((_, index) => {
                    const capturedImg = capturedImages[index];
                    const isLatest = index === capturedImages.length - 1 && capturedImages.length > 0;
                    return (
                      <div 
                        key={index}
                        className={`relative w-full aspect-[4/3] rounded-md overflow-hidden border transition-all duration-300 ${
                          capturedImg 
                            ? "border-[#F042FF] bg-black shadow-[0_0_8px_rgba(240,66,255,0.3)]" 
                            : "border-white/10 bg-black/60"
                        }`}
                      >
                        {capturedImg ? (
                          <>
                            <img
                              src={capturedImg}
                              alt={`Capture ${index + 1}`}
                              className="w-full h-full object-cover photobooth-print-image"
                            />
                            <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs text-white font-mono text-[7px] px-1 rounded-xs font-bold leading-tight shadow border border-white/10">
                              0{index + 1}
                            </div>
                            {isLatest && (
                              <div className="absolute bottom-1 right-1 bg-[#F042FF] text-white font-mono text-[6.5px] px-1 rounded-xs font-bold uppercase leading-tight shadow-sm animate-pulse">
                                NEW
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center font-mono text-[8.5px] text-zinc-600 font-bold">
                            <span>0{index + 1}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Big Shutter Capture CTA Trigger & Keyboard Hint */}
            <div className="w-full pt-1 flex flex-col gap-1">
              <div className="shutter-outer">
                <div className="shutter-pulse-ring" />
                <button 
                  onClick={() => { startCountdown(); playClickSound(); }} 
                  disabled={capturing || !cameraReady}
                  className="btn-studio-primary w-full py-3 sm:py-3.5 text-sm sm:text-base relative z-10 font-display font-black tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(240,66,255,0.4)] cursor-pointer"
                  style={{ borderRadius: "12px" }}
                >
                  {!cameraReady 
                    ? "⌛ STARTING CAMERA..." 
                    : capturing 
                      ? `CAPTURING SHOT ${currentShotIndex + 1} OF ${totalShots}...` 
                      : `✧ TAKE PHOTOS (${totalShots} SHOTS) ✧`
                  }
                </button>
              </div>
              <div className="text-center font-mono text-[10px] text-zinc-400 flex items-center justify-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-300">SPACE</span>
                <span>or CLICK to capture</span>
              </div>
            </div>

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
