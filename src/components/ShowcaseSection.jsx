import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Sparkles, ZoomIn, ChevronLeft, ChevronRight, Eye } from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const defaultDesignThemes = [
  {
    id: "classic",
    name: "Classic Studio",
    color: "#F042FF",
    desc: "High-contrast photostrip frames with solid borders and nostalgic digital stamps.",
    bg: "linear-gradient(135deg, #020617, #0F3AE2)",
    badge: "CLASSIC_POP",
    image: "/photobooth-strip.png",
    caption: "Studio Frame ✦"
  },
  {
    id: "floral",
    name: "Pastel Bloom",
    color: "#FF00FF",
    desc: "Soft flower power stamps with pastel gradients and refined hand-drawn borders.",
    bg: "linear-gradient(135deg, #18001e, #2e083c)",
    badge: "SOFT_PASTEL",
    image: "/photobooth-strip.png",
    caption: "Soft Floral Frame"
  },
  {
    id: "vintage",
    name: "Cinematic Film",
    color: "#F59E0B",
    desc: "Warm cinematic film grain with retro date stamps and nostalgic lighting.",
    bg: "linear-gradient(135deg, #1a0f00, #2b1800)",
    badge: "VINTAGE_FILM",
    image: "/photobooth-strip.png",
    caption: "Warm Grain Filter"
  },
  {
    id: "modern",
    name: "Neon Cyber",
    color: "#10B981",
    desc: "Vibrant neon reflections with custom digital overlays and star halo clusters.",
    bg: "linear-gradient(135deg, #022c22, #064e3b)",
    badge: "NEON_CYBER",
    image: "/photobooth-strip.png",
    caption: "Electric Cyan"
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
  const clickOriginRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const stickerLeft1Ref = useRef(null);
  const stickerRight1Ref = useRef(null);
  const stickerLeft2Ref = useRef(null);
  const stickerRight2Ref = useRef(null);

  const [designThemes, setDesignThemes] = useState(defaultDesignThemes);
  const [activeZoomItem, setActiveZoomItem] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const res = await axios.get("/api/studio/data");
        if (res.data && res.data.showcaseThemes && res.data.showcaseThemes.length > 0) {
          // Ensure showcase images use final preview photostrips
          const normalized = res.data.showcaseThemes.map(theme => ({
            ...theme,
            image: theme.image?.includes("/img/poses/Wonyoung") ? "/photobooth-strip.png" : (theme.image || "/photobooth-strip.png")
          }));
          setDesignThemes(normalized);
        }
      } catch (err) {
        console.error("Error fetching showcase themes:", err);
      }
    };
    fetchShowcaseData();
  }, []);

  // GSAP Smooth Horizontal Scroll with Prev/Next buttons
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 360;
      const targetScroll = direction === "left" 
        ? carouselRef.current.scrollLeft - scrollAmount 
        : carouselRef.current.scrollLeft + scrollAmount;
      
      gsap.to(carouselRef.current, {
        scrollLeft: targetScroll,
        duration: 0.6,
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
          scrollLeft: carouselEl.scrollLeft + e.deltaY * 1.5,
          duration: 0.5,
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

  // Modal open trigger with click coordinate tracking
  const handleOpenZoomModal = (e, theme) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      clickOriginRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    } else if (e) {
      clickOriginRef.current = {
        x: e.clientX || window.innerWidth / 2,
        y: e.clientY || window.innerHeight / 2
      };
    }
    setActiveZoomItem(theme);
  };

  // Lock body scroll and animate from click position when lightbox opens
  useEffect(() => {
    if (activeZoomItem && modalRef.current && modalContentRef.current) {
      setIsClosingModal(false);
      document.body.style.overflow = "hidden";

      const originX = clickOriginRef.current.x;
      const originY = clickOriginRef.current.y;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      const deltaX = originX - viewportCenterX;
      const deltaY = originY - viewportCenterY;

      // Animate backdrop
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Animate zoomed container smoothly expanding directly from the click origin
      gsap.fromTo(
        modalContentRef.current,
        { 
          x: deltaX, 
          y: deltaY, 
          scale: 0.25, 
          opacity: 0 
        },
        { 
          x: 0, 
          y: 0, 
          scale: 1, 
          opacity: 1, 
          duration: 0.45, 
          ease: "back.out(1.15)",
          clearProps: "transform"
        }
      );
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeZoomItem]);

  // Modal close trigger with GSAP animation back to origin
  const handleCloseZoomModal = () => {
    if (isClosingModal || !modalRef.current) return;
    setIsClosingModal(true);

    const originX = clickOriginRef.current.x;
    const originY = clickOriginRef.current.y;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const deltaX = originX - viewportCenterX;
    const deltaY = originY - viewportCenterY;

    if (modalContentRef.current) {
      gsap.to(modalContentRef.current, {
        x: deltaX,
        y: deltaY,
        scale: 0.3,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
      });
    }

    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        document.body.style.overflow = "";
        setActiveZoomItem(null);
        setIsClosingModal(false);
      }
    });
  };

  // Keyboard shortcut listener for ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && activeZoomItem) {
        handleCloseZoomModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZoomItem]);

  useEffect(() => {
    // Parallax Stickers
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
      yPercent: -60,
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
      yPercent: -20,
      rotate: "-=10",
      ease: "none",
      scrollTrigger: {
        trigger: showcaseParentRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });

    // CHOOSE YOUR AESTHETIC background highlight drawing on scroll
    const highlightTrigger = gsap.fromTo(
      ".aesthetic-highlight-bar",
      { width: "0%" },
      {
        width: "100%",
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: showcaseParentRef.current,
          start: "top 75%",
        }
      }
    );

    // Showcase Theme Cards Bidirectional Scroll-based Reveals with Stagger
    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.2)";

    let contentTrigger;
    contentTrigger = ScrollTrigger.create({
      trigger: ".showcase-content-block",
      start: "top 85%",
      end: "bottom 15%",
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
      },
      onLeave: () => {
        gsap.fromTo(".showcase-theme-card", 
          { y: 0, opacity: 1, scale: 1 },
          { y: -50, opacity: 0, scale: 0.94, duration: duration * 0.75, ease: "power2.in", stagger: 0.04, overwrite: "auto" }
        );
      },
      onLeaveBack: () => {
        gsap.fromTo(".showcase-theme-card", 
          { y: 0, opacity: 1, scale: 1 },
          { y: 50, opacity: 0, scale: 0.94, duration: duration * 0.75, ease: "power2.in", stagger: 0.04, overwrite: "auto" }
        );
      }
    });

    // Bidirectional scroll-reveal for Header Block
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
        },
        onEnterBack: () => {
          gsap.fromTo(headerBlock,
            { y: -45, opacity: 0 },
            { y: 0, opacity: 1, duration: duration, ease: "power2.out", overwrite: "auto" }
          );
        },
        onLeave: () => {
          gsap.fromTo(headerBlock,
            { y: 0, opacity: 1 },
            { y: -45, opacity: 0, duration: duration * 0.75, ease: "power2.in", overwrite: "auto" }
          );
        },
        onLeaveBack: () => {
          gsap.fromTo(headerBlock,
            { y: 0, opacity: 1 },
            { y: 45, opacity: 0, duration: duration * 0.75, ease: "power2.in", overwrite: "auto" }
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
    <section ref={showcaseParentRef} className="px-6 py-24 relative overflow-hidden bg-[#FAF6F9] text-[#010030] border-y border-[#160078]/10">
      {/* Scrapbook stickers floating absolutely */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-100">
        <div ref={stickerLeft1Ref} className="absolute top-[8%] left-[4%] bg-white text-[#160078] text-[10px] font-black border border-[#160078]/20 px-3 py-1.5 rounded-full rotate-[-12deg] uppercase tracking-wider hidden lg:block shadow-md">
          ★ Custom Stamp Set ★
        </div>
        <div ref={stickerRight1Ref} className="absolute top-[20%] right-[3%] bg-[#160078] text-white text-[10px] font-mono border border-[#7226FF]/40 px-2.5 py-1 rounded-md rotate-[8deg] uppercase hidden lg:block shadow-md">
          ID: SNPSHOT_STUDIO
        </div>
        <div ref={stickerLeft2Ref} className="absolute bottom-[25%] left-[6%] bg-white text-[#160078] text-xs font-black border border-[#160078]/20 px-3 py-1.5 rounded-md rotate-[15deg] hidden lg:block shadow-md">
          ✦ Studio Quality Prints
        </div>
        <div ref={stickerRight2Ref} className="absolute bottom-[40%] right-[4%] bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white text-[10px] font-display font-black border border-white/20 px-3 py-1.5 rounded-full rotate-[-6deg] uppercase hidden lg:block shadow-md">
          ✦ Self Photo Booth ✦
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER */}
        <div className="showcase-header-block text-center mb-12 relative">
          <div className="inline-flex items-center gap-2 bg-[#010030] text-white font-mono text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-[#7226FF]/40 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
            <span>THEMES & FRAME OVERLAYS</span>
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-[#010030] tracking-tight uppercase leading-none">
            PHOTOSHOOT{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">SHOWCASE</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 h-3 md:h-5 bg-[#F042FF]/20 -rotate-1 z-0 rounded-sm aesthetic-highlight-bar origin-left"></span>
            </span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[#160078]/80 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Explore our curated theme collection and frame overlay references. Click any photostrip composite to inspect it in full screen!
          </p>
        </div>

        {/* FRAME DESIGN SHOWCASE (GSAP Horizontal Smooth Track) */}
        <div ref={showcaseSectionRef} className="showcase-content-block mb-8 relative">
          
          {/* Refined Modern Navigation Controls */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#010030]/60 uppercase tracking-wider">
                Browse Photostrips
              </span>
              <span className="bg-[#f0ecf8] text-[#7226FF] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                {designThemes.length} STYLES
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => scrollCarousel("left")}
                aria-label="Previous Photostrip"
                className="w-11 h-11 rounded-full bg-white hover:bg-[#7226FF] text-[#010030] hover:text-white border border-[#2e109d]/20 hover:border-[#7226FF] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-[0_8px_20px_rgba(114,38,255,0.3)] active:scale-95 cursor-pointer group"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => scrollCarousel("right")}
                aria-label="Next Photostrip"
                className="w-11 h-11 rounded-full bg-white hover:bg-[#7226FF] text-[#010030] hover:text-white border border-[#2e109d]/20 hover:border-[#7226FF] flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-[0_8px_20px_rgba(114,38,255,0.3)] active:scale-95 cursor-pointer group"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Smooth horizontal track */}
          <div 
            ref={carouselRef}
            className="web3-showcase-container gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none flex items-stretch select-none"
            style={{ scrollBehavior: "smooth" }}
          >
            {designThemes.map((theme, index) => (
              <div 
                key={theme.id || index}
                className="showcase-theme-card flex-none w-[280px] sm:w-[320px] p-4 rounded-[24px] border border-[#160078]/15 bg-white shadow-[0_15px_35px_rgba(22,0,120,0.06)] transition-all duration-300 hover:border-[#F042FF] hover:shadow-[0_20px_45px_rgba(240,66,255,0.22)] relative flex flex-col justify-between"
              >
                {/* Clean Full Uncropped Photostrip Container */}
                <div 
                  onClick={(e) => handleOpenZoomModal(e, theme)}
                  className="gallery__item-imginner relative cursor-zoom-in overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF6F9] to-[#F3EBFC] border border-[#160078]/12 p-3 flex items-center justify-center min-h-[400px] group/img shadow-inner transition-transform duration-300 hover:scale-[1.01]"
                  title="Click to view full screen composite preview"
                >
                  <img 
                    src={theme.image || "/photobooth-strip.png"} 
                    alt={theme.name} 
                    className="w-full h-auto object-contain max-h-[520px] rounded-xl shadow-[0_8px_25px_rgba(1,0,48,0.15)] transition-transform duration-500 group-hover/img:scale-[1.03] block"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/photobooth-strip.png";
                    }}
                  />

                  {/* Hover Overlay Zoom Indicator */}
                  <div className="absolute inset-0 bg-[#010030]/50 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center gap-2 text-white pointer-events-none backdrop-blur-[2px]">
                    <div className="p-3.5 bg-[#7226FF] rounded-full text-white shadow-xl transform group-hover/img:scale-110 transition-transform">
                      <ZoomIn className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#010030]/90 px-3 py-1 rounded-full border border-white/20">
                      FULL PREVIEW INSPECTOR
                    </span>
                  </div>
                </div>

                {/* Clean Theme Info Header */}
                <div className="border-t border-[#160078]/10 pt-3 mt-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-mono text-[9px] font-black uppercase text-[#160078]/70 bg-[#160078]/5 px-2 py-0.5 border border-[#160078]/15 rounded">
                      STYLE_0{index + 1}
                    </span>
                    <span className="font-mono text-[9px] font-black text-white bg-gradient-to-r from-[#F042FF] to-[#7226FF] px-2.5 py-0.5 border border-white/30 rounded-full shadow-[0_2px_8px_rgba(240,66,255,0.3)] tracking-wider">
                      {theme.badge || "FEATURED"}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-lg text-[#010030] uppercase tracking-tight text-center">
                    {theme.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FULL-SCREEN GSAP LIGHTBOX RENDERED VIA PORTAL TO BODY (Eliminates ancestor transform positioning bugs) */}
      {activeZoomItem && createPortal(
        <div 
          ref={modalRef}
          onClick={handleCloseZoomModal}
          className="fixed inset-0 z-[99999] bg-[#010030]/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 select-none"
          style={{ top: 0, left: 0, width: "100vw", height: "100vh" }}
        >
          {/* Top Bar with Title, Badge and Close Action */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex justify-between items-center mb-4 px-2 text-white"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold bg-[#F042FF] text-white px-3 py-1 rounded-full border border-white/20 shadow-md">
                {activeZoomItem.badge || "SHOWCASE"}
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight uppercase">
                {activeZoomItem.name}
              </h3>
            </div>

            <button 
              onClick={handleCloseZoomModal}
              className="p-2.5 rounded-full bg-white/10 hover:bg-[#F042FF] text-white transition-all border border-white/20 shadow-lg cursor-pointer group"
              title="Close (ESC)"
            >
              <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Main Zoomed High-Resolution Image Container */}
          <div 
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[82vh] flex items-center justify-center p-3 rounded-2xl bg-zinc-950/80 border border-[#F042FF]/30 shadow-[0_0_60px_rgba(240,66,255,0.35)] overflow-hidden"
          >
            <img 
              ref={modalImageRef}
              src={activeZoomItem.image || "/photobooth-strip.png"} 
              alt={activeZoomItem.name} 
              className="max-h-[76vh] w-auto max-w-full object-contain rounded-xl shadow-2xl block"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/photobooth-strip.png";
              }}
            />
          </div>

          {/* Bottom Instruction Hint */}
          <div className="mt-4 text-center font-mono text-[11px] text-zinc-400 tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
            <span>CLICK ANYWHERE OR PRESS <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-white font-bold">ESC</kbd> TO CLOSE PREVIEW</span>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default ShowcaseSection;

