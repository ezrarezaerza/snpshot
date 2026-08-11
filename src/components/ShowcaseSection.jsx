import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Maximize2, X, Sparkles, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const defaultDesignThemes = [
  {
    id: "classic",
    name: "Classic Y2K",
    color: "#F042FF",
    desc: "High-contrast frames with solid grid borders and custom nostalgic stickers.",
    bg: "linear-gradient(135deg, #020617, #0F3AE2)",
    badge: "RETRO_POP",
    image: "/img/poses/Wonyoung1.png",
    caption: "Aura: maxed out ✦"
  },
  {
    id: "floral",
    name: "Cottagecore Bloom",
    color: "#FF00FF",
    desc: "Soft flower power stamps with cute pastel gradients and hand-drawn borders.",
    bg: "linear-gradient(135deg, #18001e, #2e083c)",
    badge: "SOFT_GIRL",
    image: "/img/poses/Wonyoung2.png",
    caption: "Pretty & living rent-free"
  },
  {
    id: "vintage",
    name: "Aesthetic Vintage",
    color: "#F59E0B",
    desc: "Warm cinematic film grain with retro date stamps and custom light leaks.",
    bg: "linear-gradient(135deg, #1a0f00, #2b1800)",
    badge: "90S_CORE",
    image: "/img/poses/Wonyoung3.png",
    caption: "Vintage soul, retro heart"
  },
  {
    id: "modern",
    name: "Holographic Glitch",
    color: "#10B981",
    desc: "Vibrant rainbow reflections with custom digital glitch overlays and star clusters.",
    bg: "linear-gradient(135deg, #022c22, #064e3b)",
    badge: "GLITCH_99",
    image: "/img/poses/Wonyoung1.png",
    caption: "Glitch in the matrix ⚡"
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

  const [designThemes, setDesignThemes] = useState(defaultDesignThemes);
  const [activeZoomItem, setActiveZoomItem] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const res = await axios.get("/api/creator/data");
        if (res.data && res.data.showcaseThemes && res.data.showcaseThemes.length > 0) {
          setDesignThemes(res.data.showcaseThemes);
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
        duration: 0.7,
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

  // Modal open trigger with GSAP scale & fade animation
  const handleOpenZoomModal = (theme) => {
    setActiveZoomItem(theme);
  };

  useEffect(() => {
    if (activeZoomItem && modalRef.current && modalImageRef.current) {
      setIsClosingModal(false);
      // Animate backdrop fade in
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );
      // Animate zoomed container scale up from center
      gsap.fromTo(
        modalImageRef.current,
        { scale: 0.65, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.3)" }
      );
    }
  }, [activeZoomItem]);

  // Modal close trigger with GSAP animation
  const handleCloseZoomModal = () => {
    if (isClosingModal || !modalRef.current) return;
    setIsClosingModal(true);

    if (modalImageRef.current) {
      gsap.to(modalImageRef.current, {
        scale: 0.75,
        opacity: 0,
        y: -20,
        duration: 0.25,
        ease: "power2.in"
      });
    }

    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
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
    const headerBlock = showcaseParentRef.current.querySelector(".showcase-header-block");
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
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-80">
        <div ref={stickerLeft1Ref} className="absolute top-[8%] left-[4%] bg-[#F042FF]/15 text-[#160078] text-[10px] font-black border border-[#F042FF]/30 px-3 py-1.5 rounded-full rotate-[-12deg] uppercase tracking-wider hidden lg:block shadow-[0_4px_12px_rgba(240,66,255,0.15)]">
          ★ Cute Stamp Set ★
        </div>
        <div ref={stickerRight1Ref} className="absolute top-[20%] right-[3%] bg-[#7226FF]/15 text-[#160078] text-[10px] font-mono border border-[#7226FF]/30 px-2.5 py-1 rounded-md rotate-[8deg] uppercase hidden lg:block">
          ID: SNPSHOT_AESTHETIC
        </div>
        <div ref={stickerLeft2Ref} className="absolute bottom-[25%] left-[6%] bg-[#F042FF]/15 text-[#160078] text-xs font-black border border-[#F042FF]/30 px-3 py-1.5 rounded-md rotate-[15deg] hidden lg:block">
          ✨ Aura Verified +999
        </div>
        <div ref={stickerRight2Ref} className="absolute bottom-[40%] right-[4%] bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white text-[10px] font-display font-black border border-white/20 px-3 py-1.5 rounded-full rotate-[-6deg] uppercase hidden lg:block shadow-[0_4px_15px_rgba(240,66,255,0.25)]">
          ✦ Main Character Only ✦
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER FOR LOWER CONTENT */}
        <div className="showcase-header-block text-center mb-10 relative">
          <div className="inline-block bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] text-white font-display font-black text-xs uppercase tracking-widest px-5 py-2 rounded-full mb-4 border border-white/30 shadow-[0_4px_15px_rgba(22,0,120,0.2)] transform hover:scale-105 transition-transform">
            ✦ THEMES & FRAME OVERLAYS ✦
          </div>
          <h2 className="font-display font-black text-4xl md:text-6xl text-[#010030] tracking-tight uppercase leading-none">
            PHOTOSHOOT{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">SHOWCASE</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 h-3 md:h-5 bg-[#F042FF]/20 -rotate-1 z-0 rounded-sm aesthetic-highlight-bar origin-left"></span>
            </span>
          </h2>
          <p className="font-sans text-sm md:text-base text-[#160078]/80 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Explore our curated theme collection and frame overlay references. Click any photo strip to view it in full screen!
          </p>
        </div>

        {/* FRAME DESIGN SHOWCASE (GSAP Horizontal Smooth Track) */}
        <div ref={showcaseSectionRef} className="showcase-content-block mb-8 relative">
          
          <div className="absolute -top-14 right-2 flex gap-2 z-20">
            <button 
              onClick={() => scrollCarousel("left")}
              className="carousel-control-btn w-9 h-9 rounded-full bg-white hover:bg-[#F042FF] hover:text-white text-[#010030] border border-[#160078]/20 flex items-center justify-center transition-all shadow-md cursor-pointer group"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => scrollCarousel("right")}
              className="carousel-control-btn w-9 h-9 rounded-full bg-white hover:bg-[#F042FF] hover:text-white text-[#010030] border border-[#160078]/20 flex items-center justify-center transition-all shadow-md cursor-pointer group"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Smooth horizontal track */}
          <div 
            ref={carouselRef}
            className="web3-showcase-container gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none flex items-stretch select-none"
            style={{ scrollBehavior: "smooth" }}
          >
            {designThemes.map((theme, index) => (
              <div 
                key={theme.id}
                className="showcase-theme-card flex-none w-[280px] sm:w-[320px] p-4 rounded-[24px] border border-[#160078]/15 bg-white shadow-[0_15px_35px_rgba(22,0,120,0.06)] transition-all duration-300 hover:border-[#F042FF] hover:shadow-[0_20px_45px_rgba(240,66,255,0.22)] relative flex flex-col justify-between"
              >
                {/* Clean Full Uncropped Photostrip Container */}
                <div 
                  onClick={() => handleOpenZoomModal(theme)}
                  className="gallery__item-imginner relative cursor-zoom-in overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF6F9] to-[#F3EBFC] border border-[#160078]/12 p-2 flex items-center justify-center min-h-[380px] group/img shadow-inner transition-transform duration-300 hover:scale-[1.01]"
                  title="Click to view full screen high resolution"
                >
                  <img 
                    src={theme.image} 
                    alt={theme.name} 
                    className="w-full h-auto object-contain max-h-[520px] rounded-xl shadow-[0_8px_25px_rgba(1,0,48,0.15)] transition-transform duration-500 group-hover/img:scale-[1.03] block"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />

                  {/* Hover Overlay Zoom Indicator */}
                  <div className="absolute inset-0 bg-[#010030]/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-xl flex flex-col items-center justify-center gap-2 text-white pointer-events-none backdrop-blur-[2px]">
                    <div className="p-3 bg-[#F042FF] rounded-full text-white shadow-lg transform group-hover/img:scale-110 transition-transform">
                      <ZoomIn className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-[#010030]/90 px-3 py-1 rounded-full border border-white/20">
                      FULL RESOLUTION ZOOM
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
                      {theme.badge}
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

      {/* FULL-SCREEN GSAP LIGHTBOX / ZOOM MODAL */}
      {activeZoomItem && (
        <div 
          ref={modalRef}
          onClick={handleCloseZoomModal}
          className="fixed inset-0 z-[9999] bg-[#010030]/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 select-none"
        >
          {/* Top Bar with Title, Badge and Close Action */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex justify-between items-center mb-4 px-2 text-white"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold bg-[#F042FF] text-white px-3 py-1 rounded-full border border-white/20 shadow-md">
                {activeZoomItem.badge}
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
            className="relative max-w-4xl max-h-[82vh] flex items-center justify-center p-2 rounded-2xl bg-zinc-950/80 border border-[#F042FF]/30 shadow-[0_0_60px_rgba(240,66,255,0.35)] overflow-hidden"
          >
            <img 
              ref={modalImageRef}
              src={activeZoomItem.image} 
              alt={activeZoomItem.name} 
              className="max-h-[78vh] w-auto max-w-full object-contain rounded-xl shadow-2xl block"
            />
          </div>

          {/* Bottom Instruction Hint */}
          <div className="mt-4 text-center font-mono text-[11px] text-zinc-400 tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
            <span>CLICK ANYWHERE OR PRESS <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/20 text-white font-bold">ESC</kbd> TO CLOSE PREVIEW</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShowcaseSection;

