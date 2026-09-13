import React, { useRef, useEffect, useState } from "react";
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
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { playClickSound } from "../utils/audio";
import { normalizeMediaUrl } from "../utils/blobClient";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const DEFAULT_SHOWCASE_ITEMS = [
  {
    id: "ive-wonyoung-collab",
    type: "collab",
    name: "IVE Wonyoung",
    rawName: "Wonyoung",
    role: "Vocalist / Center",
    agencyName: "Starship Ent.",
    groupName: "IVE",
    groupLogo: "✨",
    color: "#F042FF",
    desc: "Celebrate with exclusive 4-pose idol deck & dedicated birthday collector frame.",
    badge: "★ BIRTHDAY SPECIAL",
    image: "/img/poses/Wonyoung1.png",
    caption: "Wonyoung Official Strip ✦",
    layout: "3-grid",
    watermarkText: "IVE WONYOUNG ✦ OFFICIAL BIRTHDAY EVENT",
    posesGuidance: ["Bunny Ears Pose", "Double Peace Sign", "Cute Head Tilt", "Bubble Pop Cheek"],
    artistId: "ive-wonyoung-collab",
    dedicatedFrame: {
      id: "ive-wonyoung-birthday-frame",
      name: "IVE Wonyoung Birthday Edition",
      layout: "3-grid",
      bgColor: "#0e0048",
      bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
      borderColor: "#F042FF",
      watermarkText: "IVE WONYOUNG ✦ OFFICIAL BIRTHDAY EVENT",
      padding: 16,
      innerGap: 12,
      borderRadius: 8
    },
    isCollab: true,
    isFeatured: true
  },
  {
    id: "classic-studio",
    type: "theme",
    name: "Classic Studio",
    color: "#F042FF",
    desc: "High-contrast photostrip frames with solid borders and nostalgic digital stamps.",
    bg: "linear-gradient(135deg, #020617, #0F3AE2)",
    badge: "CLASSIC_POP",
    image: "/img/poses/Wonyoung1.png",
    caption: "Studio Frame ✦",
    layout: "4-grid",
    watermarkText: "SNPSHOT STUDIO // CLASSIC STUDIO",
    isCollab: false
  },
  {
    id: "pastel-bloom",
    type: "theme",
    name: "Pastel Bloom",
    color: "#FF00FF",
    desc: "Soft flower power stamps with pastel gradients and refined hand-drawn borders.",
    bg: "linear-gradient(135deg, #18001e, #2e083c)",
    badge: "SOFT_PASTEL",
    image: "/img/poses/Wonyoung2.png",
    caption: "Soft Floral Frame",
    layout: "2x2",
    watermarkText: "SNPSHOT STUDIO // PASTEL BLOOM",
    isCollab: false
  },
  {
    id: "cinematic-film",
    type: "theme",
    name: "Cinematic Film",
    color: "#F59E0B",
    desc: "Warm cinematic film grain with retro date stamps and nostalgic lighting.",
    bg: "linear-gradient(135deg, #1a0f00, #2b1800)",
    badge: "VINTAGE_FILM",
    image: "/img/poses/Wonyoung3.png",
    caption: "Cinema Strip 35mm",
    layout: "4-grid",
    watermarkText: "SNPSHOT STUDIO // CINEMATIC FILM",
    isCollab: false
  },
  {
    id: "cyberpunk-neon",
    type: "theme",
    name: "Cyberpunk Neon",
    color: "#06B6D4",
    desc: "Electric cyan and magenta glow accents with futuristic holographic stamps.",
    bg: "linear-gradient(135deg, #020617, #083344)",
    badge: "CYBER_Y2K",
    image: "/img/poses/Wonyoung4.png",
    caption: "Cyber Frame ✦",
    layout: "2x3",
    watermarkText: "SNPSHOT STUDIO // CYBERPUNK NEON",
    isCollab: false
  },
  {
    id: "aespa-karina-collab",
    type: "collab",
    name: "aespa Karina",
    rawName: "Karina",
    role: "Leader / Main Dancer",
    agencyName: "SM Entertainment",
    groupName: "aespa",
    groupLogo: "🦋",
    color: "#3f51b5",
    desc: "Synk into the digital realm with official cyber aesthetic 2x3 postcard frame.",
    badge: "🔥 LIMITED DROP",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600",
    caption: "Karina Synk Strip ✦",
    layout: "2x3",
    watermarkText: "AESPA KARINA 🦋 SYNK KWANGYA DROP",
    posesGuidance: ["Cyber Katana Pose", "Neon Eye Wink", "Alien Antenna Paws", "Hologram Crown"],
    artistId: "aespa-karina-collab",
    dedicatedFrame: {
      id: "aespa-karina-cyber-frame",
      name: "aespa Karina Synk Cyber Frame",
      layout: "2x3",
      bgColor: "#03001e",
      bgGradient: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
      borderColor: "#7226FF",
      watermarkText: "AESPA KARINA 🦋 SYNK KWANGYA DROP",
      padding: 18,
      innerGap: 12,
      borderRadius: 8
    },
    isCollab: true,
    isFeatured: true
  },
  {
    id: "bts-jungkook-collab",
    type: "collab",
    name: "BTS Jungkook",
    rawName: "Jungkook",
    role: "Main Vocalist / Center",
    agencyName: "HYBE",
    groupName: "BTS",
    groupLogo: "💜",
    color: "#9c27b0",
    desc: "Golden Era tribute photoshoot with sleek studio monochrome borders.",
    badge: "💜 GOLDEN STUDIO",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    caption: "Jungkook Golden ✦",
    layout: "2x2",
    watermarkText: "BTS JUNGKOOK 💜 GOLDEN SPECIAL",
    posesGuidance: ["Heart Hands", "Thumbs Up Smile", "Cool Model Pose", "Signature V-Sign"],
    artistId: "bts-jungkook-collab",
    dedicatedFrame: {
      id: "bts-jungkook-golden-frame",
      name: "BTS Jungkook Golden Frame",
      layout: "2x2",
      bgColor: "#160024",
      bgGradient: "linear-gradient(135deg, #4a0072 0%, #9c27b0 100%)",
      borderColor: "#9c27b0",
      watermarkText: "BTS JUNGKOOK 💜 GOLDEN SPECIAL",
      padding: 16,
      innerGap: 12,
      borderRadius: 8
    },
    isCollab: true,
    isFeatured: false
  },
  {
    id: "default-community-top",
    type: "top_pick",
    name: "Cherry Blossom Date Vibes",
    creator: "@sa.kura",
    color: "#F042FF",
    desc: "Created by @sa.kura. High-resolution 300 DPI verified studio composite.",
    badge: "STAFF PICK",
    image: "/img/poses/Wonyoung3.png",
    caption: "Cherry blossom date vibes",
    layout: "3-grid",
    watermarkText: "SNPSHOT STUDIO // @SA.KURA",
    likes: 1420,
    isCollab: false,
    isTopPick: true
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

  // Dynamic state populated with resilient fallback presets
  const [allItems, setAllItems] = useState(DEFAULT_SHOWCASE_ITEMS);
  const [activeZoomItem, setActiveZoomItem] = useState(null);
  const [originRect, setOriginRect] = useState(null);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dynamic studio data and construct unified showcase cards
  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const res = await axios.get("/api/studio/data");
        const data = res.data || {};
        const unifiedItems = [];

        // 1. Ingest Artist Collaboration Campaigns (only active ones configured in database)
        if (data.artists && data.artists.length > 0) {
          data.artists.forEach(art => {
            if (art.status === "archived" || art.status === "inactive") return;
            const fallbackPose = "/api/blob/proxy?url=https%3A%2F%2F4gjcgshhaspf84hn.private.blob.vercel-storage.com%2Fposes%2FWonyoung1.png";
            const rawStrip = art.finalPreviewImage || ((art.poses && art.poses.length > 0) ? art.poses[0] : (art.avatar || fallbackPose));
            const previewStrip = normalizeMediaUrl(rawStrip);
            
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
              image: previewStrip,
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

        // 2. Ingest Showcase Themes (only active ones from database)
        if (data.showcaseThemes && data.showcaseThemes.length > 0) {
          data.showcaseThemes.forEach(theme => {
            if (theme.active === false) return;
            unifiedItems.push({
              id: theme.id,
              type: "theme",
              name: theme.name,
              color: theme.color || "#7226FF",
              desc: theme.desc || "Curated aesthetic studio frame overlay.",
              bg: theme.bg || "linear-gradient(135deg, #010030, #2e109d)",
              badge: theme.badge || "THEME_PRESET",
              image: normalizeMediaUrl(theme.image),
              caption: theme.caption || theme.name,
              layout: theme.overlayFrameId?.includes("2x2") ? "2x2" : theme.overlayFrameId?.includes("2x3") ? "2x3" : "4-grid",
              watermarkText: `SNPSHOT STUDIO // ${theme.name.toUpperCase()}`,
              isCollab: false
            });
          });
        }

        // 3. Ingest Promoted / Pinned Gallery Masterworks (only approved & explicitly promoted)
        if (data.galleryItems && data.galleryItems.length > 0) {
          data.galleryItems
            .filter(g => (g.status === "approved" || !g.status) && (g.isPromotedToShowcase || g.isPinned))
            .forEach(gal => {
              unifiedItems.push({
                id: gal.id,
                type: "top_pick",
                name: gal.caption || "Community Showcase Print",
                creator: gal.creator,
                color: gal.color || "#F042FF",
                desc: `Created by ${gal.creator}. High-resolution 300 DPI verified studio composite.`,
                badge: gal.badge || (gal.origin === "editorial" ? "STAFF PICK" : "TRENDING ★"),
                image: normalizeMediaUrl(gal.imageSrc),
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
        } else {
          setAllItems(DEFAULT_SHOWCASE_ITEMS);
        }
      } catch (err) {
        console.warn("Failed to fetch dynamic showcase data, keeping curated default presets:", err.message);
        setAllItems(DEFAULT_SHOWCASE_ITEMS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowcaseData();
  }, []);

  const displayedItems = allItems;

  // Launch Photo Booth directly with selected showcase item
  const handleLaunchBooth = (item) => {
    playClickSound();
    if (item.isCollab && item.artistId) {
      navigate("/setup", { 
        state: { 
          category: "artist", 
          artistId: item.artistId,
          layout: item.layout,
          presetFrameId: item.dedicatedFrame?.id || null
        } 
      });
    } else {
      navigate("/setup", { 
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
      const scrollAmount = 260;
      const targetScroll = direction === "left" 
        ? Math.max(0, carouselRef.current.scrollLeft - scrollAmount)
        : carouselRef.current.scrollLeft + scrollAmount;
      
      gsap.to(carouselRef.current, {
        scrollLeft: targetScroll,
        duration: 0.45,
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
          duration: 0.4,
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

  // Modal open trigger with GSAP origin-aware scale & fade animation
  const handleOpenZoomModal = (item, e) => {
    playClickSound();
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setOriginRect(rect);
    } else {
      setOriginRect(null);
    }
    setActiveZoomItem(item);
  };

  useEffect(() => {
    if (activeZoomItem && modalRef.current && modalContentRef.current) {
      setIsClosingModal(false);

      // Lock background smooth scroll (Lenis + standard body)
      if (typeof window !== "undefined") {
        if (window.lenis && typeof window.lenis.stop === "function") {
          window.lenis.stop();
        }
        document.body.style.overflow = "hidden";
      }

      // Animate backdrop fade
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: "power2.out" }
      );

      // Animate modal expanding outward from clicked card coordinates
      let originTransform = "50% 50%";
      let initialScale = 0.6;
      if (originRect) {
        const cx = originRect.left + originRect.width / 2;
        const cy = originRect.top + originRect.height / 2;
        const oxPercent = Math.max(0, Math.min(100, (cx / window.innerWidth) * 100));
        const oyPercent = Math.max(0, Math.min(100, (cy / window.innerHeight) * 100));
        originTransform = `${oxPercent.toFixed(1)}% ${oyPercent.toFixed(1)}%`;
        initialScale = 0.3;
      }

      gsap.fromTo(
        modalContentRef.current,
        { 
          scale: initialScale, 
          opacity: 0, 
          transformOrigin: originTransform 
        },
        { 
          scale: 1, 
          opacity: 1, 
          duration: 0.45, 
          ease: "back.out(1.15)" 
        }
      );
    }

    return () => {
      // Safety unlock if component unmounts with modal open
      if (typeof window !== "undefined") {
        if (window.lenis && typeof window.lenis.start === "function") {
          window.lenis.start();
        }
        document.body.style.overflow = "";
      }
    };
  }, [activeZoomItem, originRect]);

  // Modal close trigger with smooth GSAP shrink-back animation
  const handleCloseZoomModal = () => {
    if (isClosingModal || !modalRef.current) return;
    setIsClosingModal(true);

    let originTransform = "50% 50%";
    if (originRect) {
      const cx = originRect.left + originRect.width / 2;
      const cy = originRect.top + originRect.height / 2;
      const oxPercent = Math.max(0, Math.min(100, (cx / window.innerWidth) * 100));
      const oyPercent = Math.max(0, Math.min(100, (cy / window.innerHeight) * 100));
      originTransform = `${oxPercent.toFixed(1)}% ${oyPercent.toFixed(1)}%`;
    }

    if (modalContentRef.current) {
      gsap.to(modalContentRef.current, {
        scale: 0.7,
        opacity: 0,
        transformOrigin: originTransform,
        duration: 0.25,
        ease: "power2.in"
      });
    }

    gsap.to(modalRef.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.inOut",
      onComplete: () => {
        // Unlock background smooth scroll
        if (typeof window !== "undefined") {
          if (window.lenis && typeof window.lenis.start === "function") {
            window.lenis.start();
          }
          document.body.style.overflow = "";
        }
        setActiveZoomItem(null);
        setOriginRect(null);
        setIsClosingModal(false);
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
        const currentIndex = displayedItems.findIndex(i => i.id === activeZoomItem.id);
        if (currentIndex > 0) {
          setActiveZoomItem(displayedItems[currentIndex - 1]);
        }
      } else if (e.key === "ArrowRight") {
        const currentIndex = displayedItems.findIndex(i => i.id === activeZoomItem.id);
        if (currentIndex < displayedItems.length - 1) {
          setActiveZoomItem(displayedItems[currentIndex + 1]);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeZoomItem, displayedItems]);

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

    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.2)";

    let contentTrigger = ScrollTrigger.create({
      trigger: ".showcase-content-block",
      start: "top 85%",
      end: "bottom 15%",
      onEnter: () => {
        gsap.fromTo(".showcase-theme-card", 
          { y: 40, opacity: 0, scale: 0.96 }, 
          { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.07, overwrite: "auto" }
        );
      },
      onEnterBack: () => {
        gsap.fromTo(".showcase-theme-card", 
          { y: -40, opacity: 0, scale: 0.96 }, 
          { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.07, overwrite: "auto" }
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
            { y: 40, opacity: 0 },
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

  // Helper to format aspect-ratio and dimension classes optimized to photostrip formats with snug fit
  const getFormatSpecs = (layout) => {
    switch (layout) {
      case "3-grid":
        return {
          cardWidth: "w-[200px] sm:w-[220px]",
          imageHeight: "h-[320px] sm:h-[340px]",
          label: "3-Grid Strip (1:3)",
          badge: "3-CUT"
        };
      case "4-grid":
        return {
          cardWidth: "w-[200px] sm:w-[220px]",
          imageHeight: "h-[350px] sm:h-[380px]",
          label: "4-Grid Strip (1:4)",
          badge: "4-CUT"
        };
      case "2x2":
        return {
          cardWidth: "w-[220px] sm:w-[245px]",
          imageHeight: "h-[220px] sm:h-[245px]",
          label: "2x2 Square (1:1)",
          badge: "2x2 GRID"
        };
      case "2x3":
        return {
          cardWidth: "w-[220px] sm:w-[245px]",
          imageHeight: "h-[280px] sm:h-[310px]",
          label: "2x3 Postcard (2:3)",
          badge: "POSTCARD"
        };
      default:
        return {
          cardWidth: "w-[200px] sm:w-[220px]",
          imageHeight: "h-[330px] sm:h-[350px]",
          label: "Photostrip",
          badge: "STRIP"
        };
    }
  };

  return (
    <section 
      id="showcase-section"
      ref={showcaseParentRef} 
      className="px-4 sm:px-6 py-20 md:py-28 relative overflow-hidden bg-[#FAF6F9] text-[#010030] border-y border-[#160078]/10 select-none"
    >
      {/* Scrapbook stickers floating absolutely */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-100">
        <div ref={stickerLeft1Ref} className="absolute top-[8%] left-[4%] bg-white text-[#160078] text-[10px] font-black border border-[#160078]/20 px-3 py-1.5 rounded-full rotate-[-12deg] uppercase tracking-wider hidden lg:block shadow-sm">
          ★ Studio Collab Drop ★
        </div>
        <div ref={stickerRight1Ref} className="absolute top-[18%] right-[3%] bg-[#160078] text-white text-[10px] font-mono border border-[#7226FF]/40 px-2.5 py-1 rounded-md rotate-[8deg] uppercase hidden lg:block shadow-sm">
          300 DPI HIGH-RES PRINT
        </div>
        <div ref={stickerLeft2Ref} className="absolute bottom-[20%] left-[5%] bg-white text-[#160078] text-xs font-black border border-[#160078]/20 px-3 py-1.5 rounded-md rotate-[15deg] hidden lg:block shadow-sm">
          ✦ Official Photostrip Sets
        </div>
        <div ref={stickerRight2Ref} className="absolute bottom-[35%] right-[4%] bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white text-[10px] font-display font-black border border-white/20 px-3 py-1.5 rounded-full rotate-[-6deg] uppercase hidden lg:block shadow-sm">
          ★ DIGITAL PHOTO BOOTH ★
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER BLOCK (Cleaned up, category tabs removed) */}
        <div className="showcase-header-block text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 bg-[#0f0054]/90 backdrop-blur-md text-[#FFE5F1] font-mono text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-[#F042FF]/40 shadow-[0_4px_20px_rgba(240,66,255,0.18)]">
            <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
            <span>THEMES, IDOL COLLABS & FRAME OVERLAYS</span>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-[#010030] tracking-tight uppercase leading-none">
            PHOTOSHOOT{" "}
            <span className="relative inline-block px-1">
              <span className="relative z-10 bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">SHOWCASE</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 h-3 md:h-5 bg-[#F042FF]/20 -rotate-1 z-0 rounded-sm aesthetic-highlight-bar origin-left"></span>
            </span>
          </h2>

          <p className="font-sans text-sm md:text-base text-[#160078]/80 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Explore our curated theme collection, active K-Pop idol partnership drops, and official photostrip frame references. Click any strip to inspect full specs or launch your photoshoot session immediately!
          </p>
        </div>

        {/* FRAME DESIGN SHOWCASE (GSAP Horizontal Smooth Track) */}
        <div ref={showcaseSectionRef} className="showcase-content-block mb-4 relative group/carousel">
          
          {/* Subtle Navigation Header & Controls */}
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="font-mono text-xs font-bold text-[#160078]/70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Showing {displayedItems.length} curated photostrip references</span>
            </span>

            {/* High-Contrast Prev / Next Control Pill */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollCarousel("left")}
                className="h-9 px-3 rounded-full border border-[#160078]/25 bg-white text-[#010030] hover:bg-[#160078] hover:text-white hover:border-[#7226FF] flex items-center gap-1.5 text-xs font-mono font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4 text-[#7226FF] group-hover:text-white" />
                <span className="hidden sm:inline">PREV</span>
              </button>
              <button 
                onClick={() => scrollCarousel("right")}
                className="h-9 px-3 rounded-full border border-[#160078]/25 bg-white text-[#010030] hover:bg-[#160078] hover:text-white hover:border-[#7226FF] flex items-center gap-1.5 text-xs font-mono font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                <span className="hidden sm:inline">NEXT</span>
                <ChevronRight className="w-4 h-4 text-[#F042FF] group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Floating Side Arrow Controls for Instant Navigation */}
          <button 
            type="button"
            onClick={() => scrollCarousel("left")}
            className="absolute left-[-16px] md:left-[-22px] top-[48%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border-2 border-[#160078]/20 text-[#010030] hover:bg-[#160078] hover:text-white hover:border-[#F042FF] shadow-[0_4px_16px_rgba(22,0,120,0.15)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105"
            title="Scroll Previous"
            aria-label="Scroll Previous"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button 
            type="button"
            onClick={() => scrollCarousel("right")}
            className="absolute right-[-16px] md:right-[-22px] top-[48%] -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/95 border-2 border-[#160078]/20 text-[#010030] hover:bg-[#160078] hover:text-white hover:border-[#F042FF] shadow-[0_4px_16px_rgba(22,0,120,0.15)] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 hover:scale-105"
            title="Scroll Next"
            aria-label="Scroll Next"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Smooth horizontal track */}
          <div 
            ref={carouselRef}
            className="web3-showcase-container gap-4 sm:gap-5 overflow-x-auto pb-8 pt-2 px-1 scrollbar-none flex items-stretch select-none"
            style={{ scrollBehavior: "smooth" }}
          >
            {displayedItems.map((item, index) => {
              const formatSpecs = getFormatSpecs(item.layout);

              return (
                <div 
                  key={item.id}
                  className={`showcase-theme-card flex-none ${formatSpecs.cardWidth} p-3 rounded-[22px] border border-[#160078]/15 bg-white shadow-[0_8px_24px_rgba(22,0,120,0.06)] transition-all duration-300 hover:border-[#F042FF] hover:shadow-[0_16px_36px_rgba(240,66,255,0.18)] relative flex flex-col justify-between group`}
                >
                  {/* Top Badge & Format Bar */}
                  <div className="flex justify-between items-center mb-2">
                    {item.layout ? (
                      <span className="font-mono text-[9px] font-bold text-[#7226FF] bg-[#7226FF]/10 px-2 py-0.5 rounded uppercase">
                        {formatSpecs.badge}
                      </span>
                    ) : <span />}

                    <span className="font-mono text-[9px] font-black text-white bg-gradient-to-r from-[#F042FF] to-[#7226FF] px-2 py-0.5 border border-white/30 rounded-full shadow-xs tracking-wider">
                      {item.badge}
                    </span>
                  </div>

                  {/* Clean Full Uncropped Photostrip Container matching Native Layout */}
                  <div 
                    onClick={(e) => handleOpenZoomModal(item, e)}
                    className={`gallery__item-imginner relative cursor-zoom-in overflow-hidden rounded-xl bg-gradient-to-b from-[#FAF6F9] to-[#F3EBFC] border border-[#160078]/10 p-1.5 flex items-center justify-center ${formatSpecs.imageHeight} group/img shadow-inner transition-transform duration-300 hover:scale-[1.01]`}
                    title="Click to view full screen high resolution & specs"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain rounded-lg drop-shadow-sm transition-transform duration-500 group-hover/img:scale-[1.02] block"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />

                    {/* Hover Overlay Zoom Indicator */}
                    <div className="absolute inset-0 bg-[#010030]/50 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 rounded-lg flex flex-col items-center justify-center gap-1.5 text-white pointer-events-none backdrop-blur-[2px]">
                      <div className="p-2 bg-[#F042FF] rounded-full text-white shadow-md transform group-hover/img:scale-110 transition-transform">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-[8px] font-bold uppercase tracking-widest bg-[#010030]/90 px-2 py-0.5 rounded-full border border-white/20">
                        INSPECT 300 DPI
                      </span>
                    </div>
                  </div>

                  {/* Theme / Collab Info Header */}
                  <div className="border-t border-[#160078]/10 pt-2.5 mt-2.5 space-y-1.5">
                    <div>
                      <h3 className="font-display font-black text-sm text-[#010030] uppercase tracking-tight line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-[#160078]/70 line-clamp-2 leading-snug mt-0.5 font-medium">
                        {item.desc}
                      </p>
                    </div>

                    {/* Action Launch Bar - Full Width Primary Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleLaunchBooth(item)}
                        className="btn-studio-primary w-full py-2 px-3 text-xs flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#FFE5F1]" />
                        <span>{item.isCollab ? "Shoot with Collab" : "Launch Theme"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* FULL-SCREEN GSAP LIGHTBOX / ZOOM MODAL MOUNTED DIRECTLY TO DOCUMENT.BODY VIA PORTAL */}
      {activeZoomItem && typeof document !== "undefined" && createPortal(
        <div 
          ref={modalRef}
          onClick={handleCloseZoomModal}
          className="fixed inset-0 z-[99999] bg-[#010030]/92 backdrop-blur-xl flex flex-col items-center justify-center p-3 sm:p-6 select-none"
        >
          {/* Main Zoomed Container Card */}
          <div 
            ref={modalContentRef}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[92vh] flex flex-col md:flex-row rounded-3xl bg-zinc-950/95 border border-[#F042FF]/30 shadow-[0_0_50px_rgba(240,66,255,0.25)] overflow-hidden text-white"
          >
            {/* Left: Uncropped Native Photostrip Display */}
            <div className="flex-1 p-4 sm:p-6 flex items-center justify-center bg-black/50 overflow-hidden relative min-h-[320px] md:min-h-[500px]">
              <img 
                ref={modalImageRef}
                src={activeZoomItem.image} 
                alt={activeZoomItem.name} 
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl block"
              />

              {/* Watermark Overlay Stamp */}
              <div className="absolute top-4 left-4 bg-black/70 border border-white/20 px-3 py-1 rounded-full text-[10px] font-mono text-[#F042FF] flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>300 DPI PRINT QUALITY</span>
              </div>
            </div>

            {/* Right: Rich Details & Direct Launch CTA */}
            <div className="w-full md:w-[380px] p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 space-y-4">
              
              <div>
                {/* Header Action Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold bg-[#F042FF] text-white px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    {activeZoomItem.badge}
                  </span>

                  <button 
                    onClick={handleCloseZoomModal}
                    className="p-2 rounded-full bg-white/10 hover:bg-[#F042FF] text-white transition-all border border-white/20 cursor-pointer group"
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
                    <span className="font-bold text-[#F042FF] uppercase">{getFormatSpecs(activeZoomItem.layout).label}</span>
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
                  className="btn-studio-primary w-full py-3 text-sm flex items-center justify-center gap-2"
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
