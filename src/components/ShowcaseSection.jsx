import React, { useRef, useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Sparkles, 
  ZoomIn, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Camera, 
  Star, 
  ArrowRight,
  Info,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import { playClickSound } from "../utils/audio";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Fallback baseline items with high-res 300 DPI photostrip composites
const fallbackThemes = [
  {
    id: "ive-wonyoung-collab",
    type: "collab",
    name: "IVE Wonyoung Birthday Edition",
    role: "Vocalist / Center",
    agencyName: "Starship Ent.",
    groupName: "IVE",
    groupLogo: "✨",
    color: "#F042FF",
    desc: "Celebrate with exclusive 4-pose idol deck & dedicated birthday collector frame with official magenta glow.",
    badge: "★ BIRTHDAY SPECIAL",
    image: "/img/showcase/wonyoung-birthday-photostrip.png",
    caption: "Wonyoung Idol Strip ✦",
    layout: "3-grid",
    watermarkText: "IVE WONYOUNG ✦ OFFICIAL BIRTHDAY EVENT",
    posesGuidance: ["Finger Heart Pose", "Dual Cheek Poke", "Wink & V Sign", "Cute Cat Paws"],
    artistId: "ive-wonyoung-collab",
    isCollab: true
  },
  {
    id: "newjeans-hanni-collab",
    type: "collab",
    name: "NewJeans Hanni Bunny Club",
    role: "Main Vocalist / Dancer",
    agencyName: "HYBE",
    groupName: "NewJeans",
    groupLogo: "🐰",
    color: "#00a8ff",
    desc: "Get the iconic Bunny Club 4-cut photostrip with official pastel blue border and Y2K aesthetic stamps.",
    badge: "✦ Y2K POP-UP",
    image: "/img/showcase/hanni-bunny-photostrip.png",
    caption: "Bunny Club Exclusive",
    layout: "4-grid",
    watermarkText: "NEWJEANS HANNI 🐰 BUNNY CLUB EXCLUSIVE",
    posesGuidance: ["Bunny Ears Pose", "Double Peace Sign", "Cute Head Tilt", "Bubble Pop Cheek"],
    artistId: "newjeans-hanni-collab",
    isCollab: true
  },
  {
    id: "aespa-karina-collab",
    type: "collab",
    name: "aespa Karina Synk Cyber Drop",
    role: "Leader / Main Dancer",
    agencyName: "SM Entertainment",
    groupName: "aespa",
    groupLogo: "🦋",
    color: "#7226FF",
    desc: "Synk into the digital realm with official cyber aesthetic postcard frame and holographic stamp set.",
    badge: "🔥 LIMITED DROP",
    image: "/img/showcase/karina-cyber-photostrip.png",
    caption: "Synk Cyber Postcard",
    layout: "2x3",
    watermarkText: "AESPA KARINA 🦋 SYNK KWANGYA DROP",
    posesGuidance: ["Cyber Katana Pose", "Neon Eye Wink", "Alien Antenna Paws", "Hologram Crown"],
    artistId: "aespa-karina-collab",
    isCollab: true
  },
  {
    id: "bts-jungkook-collab",
    type: "collab",
    name: "BTS Jungkook Golden Special",
    role: "Main Vocalist / Center",
    agencyName: "HYBE",
    groupName: "BTS",
    groupLogo: "💜",
    color: "#9c27b0",
    desc: "Golden Era tribute photoshoot with sleek studio monochrome borders and custom stage stamps.",
    badge: "💜 GOLDEN STUDIO",
    image: "/img/showcase/jungkook-golden-photostrip.png",
    caption: "Golden Studio Edition",
    layout: "2x2",
    watermarkText: "BTS JUNGKOOK 💜 GOLDEN SPECIAL",
    posesGuidance: ["Heart Hands", "Thumbs Up Smile", "Cool Model Pose", "Signature V-Sign"],
    artistId: "bts-jungkook-collab",
    isCollab: true
  },
  {
    id: "theme-classic-pop",
    type: "theme",
    name: "Classic Studio Pop",
    color: "#F042FF",
    desc: "High-contrast photostrip frames with solid borders and nostalgic digital stamps.",
    bg: "linear-gradient(135deg, #020617, #0F3AE2)",
    badge: "CLASSIC_POP",
    image: "/img/showcase/classic-studio-photostrip.png",
    caption: "Studio Frame ✦",
    layout: "4-grid",
    watermarkText: "SNPSHOT STUDIO // CLASSIC 4-STRIP",
    isCollab: false
  }
];

const ShowcaseSection = ({ tunerConfig }) => {
  const navigate = useNavigate();
  const showcaseParentRef = useRef(null);
  const showcaseSectionRef = useRef(null);
  const carouselRef = useRef(null);

  const modalRef = useRef(null);
  const modalContentRef = useRef(null);
  const modalImageRef = useRef(null);

  const stickerLeft1Ref = useRef(null);
  const stickerRight1Ref = useRef(null);
  const stickerLeft2Ref = useRef(null);
  const stickerRight2Ref = useRef(null);

  // Dynamic state
  const [allItems, setAllItems] = useState(fallbackThemes);
  const [activeZoomItem, setActiveZoomItem] = useState(null);
  const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic studio data and construct unified showcase cards
  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const res = await axios.get("/api/studio/data");
        const data = res.data || {};
        const unifiedItems = [];

        // 1. Ingest Artist Collaboration Campaigns
        if (data.artists && data.artists.length > 0) {
          data.artists.forEach(art => {
            if (art.status === "archived") return;
            
            // Prioritize finalPreviewImage composite strip over single pose photo
            let finalImage = art.finalPreviewImage;
            if (!finalImage || finalImage.includes("Wonyoung1.png") || finalImage.includes("Wonyoung2.png")) {
              if (art.id?.includes("wonyoung")) finalImage = "/img/showcase/wonyoung-birthday-photostrip.png";
              else if (art.id?.includes("hanni")) finalImage = "/img/showcase/hanni-bunny-photostrip.png";
              else if (art.id?.includes("jungkook")) finalImage = "/img/showcase/jungkook-golden-photostrip.png";
              else if (art.id?.includes("karina")) finalImage = "/img/showcase/karina-cyber-photostrip.png";
              else finalImage = (art.poses && art.poses.length > 0) ? art.poses[0] : (art.avatar || "/img/showcase/classic-studio-photostrip.png");
            }
            
            unifiedItems.push({
              id: art.id,
              type: "collab",
              name: `${art.groupName || ""} ${art.name}`.trim(),
              rawName: art.name,
              role: art.role || "Featured Artist",
              agencyName: art.agencyName || "Official Agency",
              groupName: art.groupName || "Collab",
              groupLogo: art.groupLogo || "✦",
              color: art.color || "#F042FF",
              desc: art.showcaseTagline || art.desc || `Official collab photostrip frame and pose guidance set with ${art.name}.`,
              badge: art.showcaseBadge || (art.isFeatured ? "★ FEATURED COLLAB" : "✦ IDOL DROP"),
              image: finalImage,
              caption: `${art.name} Official Strip ✦`,
              layout: art.dedicatedFrame?.layout || "3-grid",
              watermarkText: art.dedicatedFrame?.watermarkText || `${(art.groupName || "").toUpperCase()} ${art.name.toUpperCase()} ✦ OFFICIAL EVENT`,
              posesGuidance: art.posesGuidance || [],
              artistId: art.id,
              dedicatedFrame: art.dedicatedFrame || null,
              isCollab: true,
              isFeatured: Boolean(art.isFeatured || art.isFeaturedOnShowcase)
            });
          });
        }

        // 2. Ingest Showcase Themes
        if (data.showcaseThemes && data.showcaseThemes.length > 0) {
          data.showcaseThemes.forEach(theme => {
            let themeImage = theme.image;
            if (theme.id === "classic-studio" || !themeImage) themeImage = "/img/showcase/classic-studio-photostrip.png";
            else if (theme.id === "pastel-bloom") themeImage = "/img/showcase/wonyoung-birthday-photostrip.png";
            else if (theme.id === "cinematic-film") themeImage = "/img/showcase/hanni-bunny-photostrip.png";
            else if (theme.id === "neon-cyber") themeImage = "/img/showcase/karina-cyber-photostrip.png";
            else if (theme.id === "custom-showcase-baseline") themeImage = "/img/showcase/jungkook-golden-photostrip.png";

            unifiedItems.push({
              id: theme.id,
              type: "theme",
              name: theme.name,
              color: theme.color || "#7226FF",
              desc: theme.desc || "Curated aesthetic studio frame overlay.",
              bg: theme.bg || "linear-gradient(135deg, #010030, #2e109d)",
              badge: theme.badge || "THEME_PRESET",
              image: themeImage,
              caption: theme.caption || theme.name,
              layout: theme.overlayFrameId?.includes("2x2") ? "2x2" : theme.overlayFrameId?.includes("2x3") ? "2x3" : "4-grid",
              watermarkText: `SNPSHOT STUDIO // ${theme.name.toUpperCase()}`,
              isCollab: false
            });
          });
        }

        // 3. Ingest Promoted / Pinned Gallery Masterworks (Staff Picks & Trending)
        if (data.galleryItems && data.galleryItems.length > 0) {
          data.galleryItems
            .filter(g => g.isPromotedToShowcase || g.isPinned || g.origin === "editorial" || (g.likes && g.likes > 800))
            .forEach(gal => {
              unifiedItems.push({
                id: gal.id,
                type: "top_pick",
                name: gal.caption || "Community Showcase Print",
                creator: gal.creator,
                color: gal.color || "#F042FF",
                desc: `Created by ${gal.creator}. High-resolution 300 DPI verified studio composite.`,
                badge: gal.badge || (gal.origin === "editorial" ? "STAFF PICK" : "TRENDING ★"),
                image: gal.imageSrc || "/img/showcase/classic-studio-photostrip.png",
                caption: gal.caption,
                layout: gal.layout || "4-grid",
                watermarkText: `SNPSHOT STUDIO // ${gal.creator.toUpperCase()}`,
                likes: gal.likes || 0,
                isCollab: false,
                isTopPick: true
              });
            });
        }

        if (unifiedItems.length > 0) {
          setAllItems(unifiedItems);
        }
      } catch (err) {
        console.error("Error fetching dynamic showcase data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowcaseData();
  }, []);

  // Launch Photo Booth directly with selected showcase item
  const handleLaunchBooth = (item) => {
    playClickSound();
    if (item.isCollab && item.artistId) {
      navigate("/welcome", { 
        state: { 
          category: "artist", 
          artistId: item.artistId,
          layout: item.layout,
          presetFrameId: item.dedicatedFrame?.id || null
        } 
      });
    } else {
      navigate("/welcome", { 
        state: { 
          category: "basic", 
          layout: item.layout || "4-grid",
          presetThemeId: item.id
        } 
      });
    }
  };

  // GSAP Smooth Horizontal Scroll with Prev/Next buttons
  const scrollCarousel = (direction) => {
    playClickSound();
    if (carouselRef.current) {
      const scrollAmount = 380;
      const targetScroll = direction === "left" 
        ? carouselRef.current.scrollLeft - scrollAmount 
        : carouselRef.current.scrollLeft + scrollAmount;
      
      gsap.to(carouselRef.current, {
        scrollLeft: targetScroll,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  };

  // Wheel Horizontal Scroll handler using GSAP tween
  useEffect(() => {
    const carouselEl = carouselRef.current;
    if (!carouselEl) return;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        gsap.to(carouselEl, {
          scrollLeft: carouselEl.scrollLeft + e.deltaY * 1.4,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto"
        });
      }
    };

    carouselEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      carouselEl.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Modal open trigger with click origin coordinate calculation & body scroll lock
  const handleOpenZoomModal = (item, e) => {
    if (e) {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      setClickPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    } else {
      setClickPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    }
    playClickSound();
    setActiveZoomItem(item);
  };

  // Lock body scroll and animate lightbox modal from click origin
  useEffect(() => {
    if (activeZoomItem) {
      document.body.style.overflow = "hidden";
      setIsClosingModal(false);

      if (modalRef.current && modalContentRef.current) {
        gsap.fromTo(
          modalRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: "power2.out" }
        );

        const originX = clickPosition.x || window.innerWidth / 2;
        const originY = clickPosition.y || window.innerHeight / 2;

        gsap.fromTo(
          modalContentRef.current,
          { 
            scale: 0.35, 
            opacity: 0,
            x: (originX - window.innerWidth / 2) * 0.4,
            y: (originY - window.innerHeight / 2) * 0.4
          },
          { 
            scale: 1, 
            opacity: 1, 
            x: 0,
            y: 0,
            duration: 0.4, 
            ease: "power3.out" 
          }
        );
      }
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeZoomItem, clickPosition]);

  // Modal close trigger with smooth shrink animation
  const handleCloseZoomModal = () => {
    if (isClosingModal || !modalRef.current) return;
    setIsClosingModal(true);

    const originX = clickPosition.x || window.innerWidth / 2;
    const originY = clickPosition.y || window.innerHeight / 2;

    if (modalContentRef.current) {
      gsap.to(modalContentRef.current, {
        scale: 0.4,
        opacity: 0,
        x: (originX - window.innerWidth / 2) * 0.3,
        y: (originY - window.innerHeight / 2) * 0.3,
        duration: 0.2,
        ease: "power2.in"
      });
    }

    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.inOut",
      onComplete: () => {
        setActiveZoomItem(null);
        setIsClosingModal(false);
        document.body.style.overflow = "";
      }
    });
  };

  // Keyboard navigation listener (ESC to close, ArrowLeft/ArrowRight to cycle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeZoomItem) return;

      if (e.key === "Escape") {
        handleCloseZoomModal();
      } else if (e.key === "ArrowLeft") {
        const currentIndex = allItems.findIndex(i => i.id === activeZoomItem.id);
        if (currentIndex > 0) {
          setActiveZoomItem(allItems[currentIndex - 1]);
        }
      } else if (e.key === "ArrowRight") {
        const currentIndex = allItems.findIndex(i => i.id === activeZoomItem.id);
        if (currentIndex < allItems.length - 1) {
          setActiveZoomItem(allItems[currentIndex + 1]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZoomItem, allItems]);

  // GSAP Parallax Stickers and Scroll Reveal
  useEffect(() => {
    const scrollStickerLeft1 = gsap.to(stickerLeft1Ref.current, {
      yPercent: -45,
      rotate: "-=15",
      ease: "none",
      scrollTrigger: {
        trigger: showcaseParentRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollStickerRight1 = gsap.to(stickerRight1Ref.current, {
      yPercent: -30,
      rotate: "+=12",
      ease: "none",
      scrollTrigger: {
        trigger: showcaseParentRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollStickerLeft2 = gsap.to(stickerLeft2Ref.current, {
      yPercent: -40,
      rotate: "+=20",
      ease: "none",
      scrollTrigger: {
        trigger: showcaseParentRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollStickerRight2 = gsap.to(stickerRight2Ref.current, {
      yPercent: -35,
      rotate: "-=10",
      ease: "none",
      scrollTrigger: {
        trigger: showcaseParentRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

    const highlightTrigger = ScrollTrigger.create({
      trigger: showcaseParentRef.current,
      start: "top 75%",
      onEnter: () => {
        gsap.fromTo(
          ".aesthetic-highlight-bar",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: "power3.out", transformOrigin: "left center" }
        );
      }
    });

    const duration = (tunerConfig?.duration || 800) / 1000;
    const ease = tunerConfig?.ease || "power3.out";

    const contentTrigger = ScrollTrigger.create({
      trigger: showcaseSectionRef.current,
      start: "top 80%",
      onEnter: () => {
        gsap.fromTo(".showcase-theme-card", 
          { y: 50, opacity: 0, scale: 0.94 }, 
          { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.08, overwrite: "auto" }
        );
      },
      onEnterBack: () => {
        gsap.fromTo(".showcase-theme-card", 
          { y: -50, opacity: 0, scale: 0.94 }, 
          { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.08, overwrite: "auto" }
        );
      }
    });

    const headerBlock = showcaseParentRef.current?.querySelector(".showcase-header-block");
    let headerTrigger;
    if (headerBlock) {
      headerTrigger = ScrollTrigger.create({
        trigger: headerBlock,
        start: "top 90%",
        end: "bottom 10%",
        onEnter: () => {
          gsap.fromTo(headerBlock,
            { y: 45, opacity: 0 },
            { y: 0, opacity: 1, duration: duration, ease: "power2.out", overwrite: "auto" }
          );
        }
      });
    }

    return () => {
      scrollStickerLeft1.kill();
      scrollStickerRight1.kill();
      scrollStickerLeft2.kill();
      scrollStickerRight2.kill();
      highlightTrigger.kill();
      if (headerTrigger) headerTrigger.kill();
      if (contentTrigger) contentTrigger.kill();
    };
  }, [tunerConfig]);

  return (
    <section 
      id="showcase-section"
      ref={showcaseParentRef} 
      className="px-4 sm:px-6 py-16 md:py-24 relative overflow-hidden bg-[#FAF6F9] text-[#010030] border-y border-[#160078]/10 select-none"
    >
      {/* Scrapbook stickers floating absolutely */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-100">
        <div ref={stickerLeft1Ref} className="absolute top-[8%] left-[4%] bg-white text-[#160078] text-[10px] font-black border border-[#160078]/20 px-3 py-1.5 rounded-full rotate-[-12deg] uppercase tracking-wider hidden lg:block shadow-md">
          ★ Studio Collab Drop ★
        </div>
        <div ref={stickerRight1Ref} className="absolute top-[18%] right-[3%] bg-[#160078] text-white text-[10px] font-mono border border-[#7226FF]/40 px-2.5 py-1 rounded-md rotate-[8deg] uppercase hidden lg:block shadow-md">
          300 DPI HIGH-RES PRINT
        </div>
        <div ref={stickerLeft2Ref} className="absolute bottom-[20%] left-[5%] bg-white text-[#160078] text-xs font-black border border-[#160078]/20 px-3 py-1.5 rounded-md rotate-[15deg] hidden lg:block shadow-md">
          ✦ Official Photostrip Sets
        </div>
        <div ref={stickerRight2Ref} className="absolute bottom-[35%] right-[4%] bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white text-[10px] font-display font-black border border-white/20 px-3 py-1.5 rounded-full rotate-[-6deg] uppercase hidden lg:block shadow-md">
          ★ DIGITAL PHOTO BOOTH ★
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER BLOCK */}
        <div className="showcase-header-block text-center mb-10 relative">
          <div className="inline-flex items-center gap-2 bg-[#0e0048] text-[#FFE5F1] font-mono font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-[#2e109d] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
            <span>IDOL COLLABS, THEMES & OFFICIAL PHOTOSTRIP FRAMES</span>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#010030] tracking-tight uppercase leading-none">
            PHOTOSHOOT{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">SHOWCASE</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 h-3 md:h-5 bg-[#F042FF]/20 -rotate-1 z-0 rounded-sm aesthetic-highlight-bar origin-left"></span>
            </span>
          </h2>

          <p className="font-sans text-sm md:text-base text-[#160078]/80 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Explore our curated 300 DPI high-resolution photostrip series, active K-Pop idol partnership drops, and official frame overlays. Click any strip to inspect specs or launch your photoshoot session immediately!
          </p>
        </div>

        {/* FRAME DESIGN SHOWCASE CAROUSEL */}
        <div ref={showcaseSectionRef} className="showcase-content-block mb-4 relative">
          
          {/* Refined Navigation Bar Header */}
          <div className="flex items-center justify-between mb-5 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold text-[#160078] uppercase tracking-wider">
                {allItems.length} OFFICIAL PHOTOSTRIP EDITIONS
              </span>
            </div>

            {/* Redesigned Sleek Tactile Navigation Controls */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#160078]/15 shadow-[0_4px_20px_rgba(22,0,120,0.06)]">
              <button 
                type="button"
                onClick={() => scrollCarousel("left")}
                className="carousel-control-btn w-10 h-10 rounded-xl bg-[#FAF6F9] hover:bg-gradient-to-r hover:from-[#160078] hover:to-[#7226FF] text-[#160078] hover:text-white border border-[#160078]/15 hover:border-transparent flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 cursor-pointer group"
                title="Scroll Left"
                aria-label="Previous Showcase Items"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              
              <div className="h-5 w-[1px] bg-[#160078]/15 mx-0.5" />

              <button 
                type="button"
                onClick={() => scrollCarousel("right")}
                className="carousel-control-btn w-10 h-10 rounded-xl bg-[#FAF6F9] hover:bg-gradient-to-r hover:from-[#7226FF] hover:to-[#F042FF] text-[#160078] hover:text-white border border-[#160078]/15 hover:border-transparent flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 cursor-pointer group"
                title="Scroll Right"
                aria-label="Next Showcase Items"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Smooth horizontal track */}
          <div 
            ref={carouselRef}
            className="web3-showcase-container gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none flex items-stretch select-none scroll-smooth"
          >
            {allItems.map((item, index) => (
              <div 
                key={item.id}
                className="showcase-theme-card flex-none w-[300px] sm:w-[335px] p-4 rounded-[28px] border border-[#160078]/15 bg-white shadow-[0_15px_35px_rgba(22,0,120,0.06)] transition-all duration-300 hover:border-[#F042FF] hover:shadow-[0_20px_45px_rgba(240,66,255,0.22)] relative flex flex-col justify-between group"
              >
                {/* Top Badge & Type Bar */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-black uppercase text-[#160078]/70 bg-[#160078]/5 px-2 py-0.5 border border-[#160078]/15 rounded">
                      {item.isCollab ? `IDOL_0${index + 1}` : `STYLE_0${index + 1}`}
                    </span>
                    {item.layout && (
                      <span className="font-mono text-[9px] font-bold text-[#7226FF] bg-[#7226FF]/10 px-2 py-0.5 rounded uppercase">
                        {item.layout}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-[9px] font-black text-white bg-gradient-to-r from-[#F042FF] to-[#7226FF] px-2.5 py-0.5 border border-white/30 rounded-full shadow-[0_2px_8px_rgba(240,66,255,0.3)] tracking-wider">
                    {item.badge}
                  </span>
                </div>

                {/* Final Photostrip Composite Preview Container */}
                <div 
                  onClick={(e) => handleOpenZoomModal(item, e)}
                  className="gallery__item-imginner relative cursor-zoom-in overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF6F9] to-[#F3EBFC] border border-[#160078]/12 p-3 flex items-center justify-center min-h-[380px] max-h-[460px] group/img shadow-inner transition-transform duration-300 hover:scale-[1.01]"
                  title="Click to view full-screen high resolution photostrip & specs"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-auto h-auto object-contain max-h-[440px] max-w-full rounded-xl shadow-[0_10px_30px_rgba(1,0,48,0.18)] transition-transform duration-500 group-hover/img:scale-[1.03] block"
                    onError={(e) => { 
                      e.target.src = "/img/showcase/classic-studio-photostrip.png"; 
                    }}
                  />

                  {/* Hover Overlay Zoom Indicator */}
                  <div className="absolute inset-0 bg-[#010030]/55 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center gap-2 text-white pointer-events-none backdrop-blur-[2px]">
                    <div className="p-3.5 bg-gradient-to-r from-[#F042FF] to-[#7226FF] rounded-full text-white shadow-xl transform group-hover/img:scale-110 transition-transform">
                      <ZoomIn className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#010030]/90 px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
                      INSPECT 300 DPI STRIP
                    </span>
                  </div>
                </div>

                {/* Theme / Collab Info Header & Watermark Preview */}
                <div className="border-t border-[#160078]/10 pt-3.5 mt-3 space-y-2">
                  
                  {/* Agency / Group Pill if Collab */}
                  {item.isCollab && item.groupName && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#7226FF] font-bold">
                      <span className="flex items-center gap-1">
                        <span>{item.groupLogo || "✦"}</span>
                        <span>{item.groupName}</span>
                        <span className="text-[#160078]/40">•</span>
                        <span className="text-[#160078]/70">{item.agencyName}</span>
                      </span>
                      <span className="text-[9px] text-[#F042FF] font-sans font-bold bg-[#F042FF]/10 px-1.5 py-0.5 rounded">
                        {item.role}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="font-display font-black text-lg text-[#010030] uppercase tracking-tight line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#160078]/70 line-clamp-2 leading-relaxed mt-0.5 font-medium">
                      {item.desc}
                    </p>
                  </div>

                  {/* Dedicated Watermark Stamp Preview */}
                  {item.watermarkText && (
                    <div className="bg-[#160078]/5 border border-[#160078]/10 rounded-lg px-2.5 py-1 text-[9px] font-mono text-[#160078]/80 truncate">
                      <span className="text-[#7226FF] font-bold">STAMP: </span>
                      <span>{item.watermarkText}</span>
                    </div>
                  )}

                  {/* Action Launch Bar */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLaunchBooth(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#160078] to-[#7226FF] hover:from-[#7226FF] hover:to-[#F042FF] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md cursor-pointer group/btn"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#FFE5F1] group-hover/btn:scale-110 transition-transform" />
                      <span>{item.isCollab ? "Shoot with Collab" : "Launch This Theme"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleOpenZoomModal(item, e)}
                      className="p-2.5 rounded-xl border border-[#160078]/20 bg-white hover:bg-[#F3EBFC] text-[#010030] hover:text-[#7226FF] transition-all shadow-xs cursor-pointer"
                      title="Inspect Full Specs"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FULL-SCREEN GSAP LIGHTBOX / ZOOM MODAL VIA REACT PORTAL (Fixes Transform Ancestor Trapping) */}
      {activeZoomItem && createPortal(
        <div 
          ref={modalRef}
          onClick={handleCloseZoomModal}
          className="fixed inset-0 z-[999999] bg-[#010030]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto"
          style={{ width: "100vw", height: "100vh" }}
        >
          {/* Main Zoomed Container Card */}
          <div 
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[92vh] flex flex-col md:flex-row rounded-3xl bg-zinc-950/95 border border-[#F042FF]/30 shadow-[0_0_80px_rgba(240,66,255,0.4)] overflow-hidden text-white my-auto"
          >
            {/* Left: Uncropped High-Res Photostrip Display */}
            <div className="flex-1 p-4 sm:p-8 flex items-center justify-center bg-black/60 overflow-hidden relative min-h-[360px] md:min-h-[520px]">
              <img 
                ref={modalImageRef}
                src={activeZoomItem.image} 
                alt={activeZoomItem.name} 
                className="max-h-[76vh] w-auto max-w-full object-contain rounded-xl shadow-2xl block"
                onError={(e) => { 
                  e.target.src = "/img/showcase/classic-studio-photostrip.png"; 
                }}
              />

              {/* Watermark Overlay Stamp */}
              <div className="absolute top-4 left-4 bg-black/70 border border-white/20 px-3 py-1 rounded-full text-[10px] font-mono text-[#F042FF] flex items-center gap-1.5 shadow-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>300 DPI PRINT QUALITY COMPOSITE</span>
              </div>
            </div>

            {/* Right: Rich Details & Direct Launch CTA */}
            <div className="w-full md:w-[380px] p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 space-y-4">
              
              <div>
                {/* Header Action Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold bg-[#F042FF] text-white px-3 py-1 rounded-full border border-white/20 shadow-md">
                    {activeZoomItem.badge}
                  </span>

                  <button 
                    type="button"
                    onClick={handleCloseZoomModal}
                    className="p-2 rounded-full bg-white/10 hover:bg-[#F042FF] text-white transition-all border border-white/20 shadow-lg cursor-pointer group"
                    title="Close (ESC)"
                  >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Collab Badge Header */}
                {activeZoomItem.isCollab && (
                  <div className="flex items-center gap-2 text-xs font-mono text-[#F042FF] font-bold mb-1">
                    <span>{activeZoomItem.groupLogo || "✦"}</span>
                    <span>{activeZoomItem.groupName}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">{activeZoomItem.agencyName}</span>
                  </div>
                )}

                <h3 className="font-display font-black text-2xl text-white tracking-tight uppercase">
                  {activeZoomItem.name}
                </h3>

                <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                  {activeZoomItem.desc}
                </p>

                {/* Specs Box */}
                <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Layout Format:</span>
                    <span className="font-bold text-[#F042FF] uppercase">{activeZoomItem.layout || "3-Grid Strip"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-400">Resolution:</span>
                    <span className="font-bold text-white">300 DPI Canvas</span>
                  </div>

                  {activeZoomItem.watermarkText && (
                    <div className="pt-1.5 border-t border-white/10">
                      <span className="text-zinc-400 block text-[10px] mb-0.5">Frame Watermark Stamp:</span>
                      <span className="text-[10px] text-purple-300 font-bold bg-purple-950/60 p-1.5 rounded border border-purple-800/40 block break-all">
                        {activeZoomItem.watermarkText}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pose Guidance (if Collab) */}
                {activeZoomItem.posesGuidance && activeZoomItem.posesGuidance.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[11px] font-mono text-zinc-400 font-bold block uppercase tracking-wider">
                      ✦ Included Pose Deck
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeZoomItem.posesGuidance.map((pose, idx) => (
                        <span key={idx} className="text-[10px] bg-white/10 border border-white/15 px-2 py-0.5 rounded-md text-zinc-200">
                          {idx + 1}. {pose}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Launch Action */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseZoomModal();
                    handleLaunchBooth(activeZoomItem);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#9d35ff] hover:from-[#7226FF] hover:to-[#F042FF] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/20 shadow-[0_4px_16px_rgba(114,38,255,0.3)] hover:shadow-[0_6px_22px_rgba(240,66,255,0.4)] cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#FFE5F1]" />
                  <span>Start Photoshoot Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center font-mono text-[10px] text-zinc-400 flex items-center justify-center gap-2">
                  <span>USE <kbd className="px-1 py-0.5 bg-white/10 rounded border border-white/20 text-white font-bold">←</kbd> <kbd className="px-1 py-0.5 bg-white/10 rounded border border-white/20 text-white font-bold">→</kbd> OR <kbd className="px-1 py-0.5 bg-white/10 rounded border border-white/20 text-white font-bold">ESC</kbd></span>
                </div>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default ShowcaseSection;
