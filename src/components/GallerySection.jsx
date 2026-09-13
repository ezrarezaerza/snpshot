import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Heart, 
  X, 
  Sparkles, 
  Printer, 
  ArrowRight, 
  Users, 
  Award, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Share2, 
  Check, 
  Sliders, 
  Layers, 
  Maximize2,
  FileCheck,
  CheckCircle2,
  PackageCheck
} from "lucide-react";
import { playClickSound, playSuccessChime, playShutterSound } from "../utils/audio";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const GallerySection = ({ tunerConfig }) => {
  const navigate = useNavigate();
  const gallerySectionRef = useRef(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [originFilter, setOriginFilter] = useState("all"); // 'all' | 'editorial' | 'community'
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState("all"); // 'all' | '3-grid' | '4-grid' | '2x2' | '2x3'
  
  // Lightbox Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [isZoomLoupe, setIsZoomLoupe] = useState(false);
  const [loupePosition, setLoupePosition] = useState({ x: 50, y: 50 });
  const [showPrintGuides, setShowPrintGuides] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Community Print Order Dialog
  const [isPrintOrderOpen, setIsPrintOrderOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(2);
  const [paperFinish, setPaperFinish] = useState("glossy"); // 'glossy' | 'matte'
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    axios.get("/api/studio/data")
      .then(res => {
        if (res.data && res.data.galleryItems && res.data.galleryItems.length > 0) {
          setGalleryItems(res.data.galleryItems);
        }
      })
      .catch(err => console.error("Error fetching gallery items:", err));
  }, []);

  const handleLike = async (id) => {
    playSuccessChime();
    setGalleryItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, likes: (item.likes || 0) + 1, hasLiked: true };
      }
      return item;
    }));

    if (selectedItem && selectedItem.id === id) {
      setSelectedItem(prev => prev ? { ...prev, likes: (prev.likes || 0) + 1, hasLiked: true } : null);
    }

    try {
      await axios.post(`/api/gallery/like/${id}`);
    } catch (err) {
      console.error("Error liking gallery item:", err);
    }
  };

  // Fallback / default items if backend items are still loading
  const allItems = galleryItems.length > 0 ? galleryItems : [
    {
      id: "default-editorial-1",
      caption: "Y2K Cyber Idol Edition",
      creator: "SNPSHOT Studio",
      origin: "editorial",
      badge: "Official Sample",
      layout: "4-grid",
      color: "#7226FF",
      imageSrc: "/img/poses/Wonyoung2.png",
      likes: 1240,
      isPromotedToShowcase: true,
      status: "approved"
    },
    {
      id: "default-editorial-2",
      caption: "Pastel Dreamscape 2x2",
      creator: "SNPSHOT Studio",
      origin: "editorial",
      badge: "Staff Pick",
      layout: "2x2",
      color: "#FFE5F1",
      imageSrc: "/img/poses/Wonyoung3.png",
      likes: 890,
      isPromotedToShowcase: true,
      status: "approved"
    },
    {
      id: "default-community-1",
      caption: "Cherry Blossom Vibes 🌸",
      creator: "@sakura.lens",
      origin: "community",
      badge: "Community Print",
      layout: "3-grid",
      color: "#F042FF",
      imageSrc: "/img/poses/Wonyoung1.png",
      likes: 642,
      isPromotedToShowcase: false,
      status: "approved"
    },
    {
      id: "default-community-2",
      caption: "Night Studio Gang Session",
      creator: "@retro.squad",
      origin: "community",
      badge: "Trending",
      layout: "2x3",
      color: "#B4FF00",
      imageSrc: "/img/poses/Wonyoung1.png",
      likes: 512,
      isPromotedToShowcase: false,
      status: "approved"
    }
  ];

  // Counts for Tabs
  const totalApproved = allItems.filter(i => (i.status || "approved") === "approved").length;
  const editorialCount = allItems.filter(i => (i.status || "approved") === "approved" && (i.origin === "editorial" || i.isPromotedToShowcase)).length;
  const communityCount = allItems.filter(i => (i.status || "approved") === "approved" && (i.origin !== "editorial" && !i.isPromotedToShowcase)).length;

  // Filter Logic
  const filteredItems = allItems.filter(item => {
    const isApproved = (item.status || "approved") === "approved";
    if (!isApproved) return false;

    const isEditorial = item.origin === "editorial" || item.isPromotedToShowcase;
    const matchesOrigin = 
      originFilter === "all" || 
      (originFilter === "editorial" && isEditorial) || 
      (originFilter === "community" && !isEditorial);

    const matchesLayout = selectedLayoutFilter === "all" || item.layout === selectedLayoutFilter;

    return matchesOrigin && matchesLayout;
  });

  // Navigation within Lightbox
  const currentIndex = selectedItem ? filteredItems.findIndex(i => i.id === selectedItem.id) : -1;

  const navigateLightbox = useCallback((direction) => {
    if (currentIndex === -1 || filteredItems.length === 0) return;
    playClickSound();
    setIsZoomLoupe(false);
    setShowPrintGuides(false);
    setIsPrintOrderOpen(false);
    setOrderSuccess(false);

    let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= filteredItems.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = filteredItems.length - 1;

    setSelectedItem(filteredItems[nextIndex]);
  }, [currentIndex, filteredItems]);

  // Scroll locking when Lightbox is active
  useEffect(() => {
    if (selectedItem) {
      if (typeof window !== "undefined") {
        if (window.lenis && typeof window.lenis.stop === "function") {
          window.lenis.stop();
        }
        document.body.style.overflow = "hidden";
      }
    } else {
      if (typeof window !== "undefined") {
        if (window.lenis && typeof window.lenis.start === "function") {
          window.lenis.start();
        }
        document.body.style.overflow = "";
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        if (window.lenis && typeof window.lenis.start === "function") {
          window.lenis.start();
        }
        document.body.style.overflow = "";
      }
    };
  }, [selectedItem]);

  // Keyboard navigation listener for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;
      if (e.key === "Escape") {
        setSelectedItem(null);
        setIsPrintOrderOpen(false);
        setIsZoomLoupe(false);
      } else if (e.key === "ArrowRight") {
        navigateLightbox("next");
      } else if (e.key === "ArrowLeft") {
        navigateLightbox("prev");
      } else if (e.key === " " || e.key === "l" || e.key === "L") {
        e.preventDefault();
        handleLike(selectedItem.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, navigateLightbox]);

  // Handle Pan in Loupe Magnifier
  const handleMouseMove = (e) => {
    if (!isZoomLoupe) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLoupePosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleShareLink = () => {
    playSuccessChime();
    navigator.clipboard.writeText(`${window.location.origin}/#gallery?item=${selectedItem.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleDownloadHighRes = () => {
    playShutterSound();
    const link = document.createElement("a");
    link.href = selectedItem.imageSrc;
    link.download = `SNPSHOT_${selectedItem.caption.replace(/[^a-zA-Z0-9]/g, "_")}_300DPI.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmOrder = () => {
    playSuccessChime();
    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setIsPrintOrderOpen(false);
    }, 2500);
  };

  // Gallery Section Parallax & Scroll reveals
  useEffect(() => {
    const cards = gsap.utils.toArray(".gallery-parallax-card");
    if (cards.length === 0) return;

    const killTriggers = [];
    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.2)";

    cards.forEach((card, idx) => {
      const speed = idx % 2 === 0 ? -10 : 10;
      const rotationFactor = idx % 2 === 0 ? -2.5 : 2.5;

      const anim = gsap.to(card, {
        yPercent: speed,
        rotate: `+=${rotationFactor}`,
        ease: "none",
        scrollTrigger: {
          trigger: gallerySectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        }
      });

      killTriggers.push(anim);
    });

    // Bidirectional scroll-reveal for Header Block
    const headerBlock = gallerySectionRef.current?.querySelector(".gallery-header-block");
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

    // Gallery Cards Bidirectional Scroll-based Reveals with Stagger
    const contentBlock = gallerySectionRef.current?.querySelector(".gallery-content-block");
    let contentTrigger;
    if (contentBlock) {
      contentTrigger = ScrollTrigger.create({
        trigger: contentBlock,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          gsap.fromTo(".gallery-parallax-card", 
            { y: 50, opacity: 0, scale: 0.94 }, 
            { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.08, overwrite: "auto" }
          );
        },
        onEnterBack: () => {
          gsap.fromTo(".gallery-parallax-card", 
            { y: -50, opacity: 0, scale: 0.94 }, 
            { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.08, overwrite: "auto" }
          );
        },
        onLeave: () => {
          gsap.fromTo(".gallery-parallax-card", 
            { y: 0, opacity: 1, scale: 1 },
            { y: -50, opacity: 0, scale: 0.94, duration: duration * 0.75, ease: "power2.in", stagger: 0.04, overwrite: "auto" }
          );
        },
        onLeaveBack: () => {
          gsap.fromTo(".gallery-parallax-card", 
            { y: 0, opacity: 1, scale: 1 },
            { y: 50, opacity: 0, scale: 0.94, duration: duration * 0.75, ease: "power2.in", stagger: 0.04, overwrite: "auto" }
          );
        }
      });
    }

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);

    return () => {
      clearTimeout(refreshTimeout);
      killTriggers.forEach(anim => anim.kill());
      if (headerTrigger) headerTrigger.kill();
      if (contentTrigger) contentTrigger.kill();
      ScrollTrigger.refresh();
    };
  }, [originFilter, selectedLayoutFilter, galleryItems, tunerConfig]);

  return (
    <section ref={gallerySectionRef} className="px-6 py-16 relative z-10 bg-[#010030]">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* PHOTOSTRIP PREVIEW & COMMUNITY PRINTS GALLERY */}
        <div className="mb-24 relative z-10">
          <div className="gallery-header-block text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#0f0054]/90 backdrop-blur-md text-[#FFE5F1] font-mono text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 border border-[#F042FF]/40 shadow-[0_4px_20px_rgba(240,66,255,0.18)]">
              <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
              <span>FINISHED PREVIEWS & COMMUNITY PRINTS</span>
            </div>
            <h3 className="font-display font-black text-3xl md:text-5xl text-white uppercase leading-tight tracking-tight">
              DESIGN <span className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] bg-clip-text text-transparent px-2 inline-block">SHOWCASE & COMMUNITY</span>
            </h3>
            <p className="font-sans text-xs md:text-sm text-zinc-300 max-w-2xl mx-auto mt-4 leading-relaxed mb-6 font-medium">
              Explore official studio editorial layouts alongside real user-submitted prints. Select any editorial style to launch directly into the studio or hype your favorite community prints!
            </p>

            {/* PRIMARY ORIGIN / TAXONOMY TABS */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-4">
              {[
                { id: "all", label: `★ ALL CREATIONS (${totalApproved})`, icon: Sparkles },
                { id: "editorial", label: `✦ STUDIO EDITORIAL (${editorialCount})`, icon: Award },
                { id: "community", label: `👥 COMMUNITY PRINTS (${communityCount})`, icon: Users }
              ].map(tab => {
                const Icon = tab.icon;
                const isSelected = originFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playClickSound();
                      setOriginFilter(tab.id);
                    }}
                    className={isSelected ? "btn-filter-pill-active" : "btn-filter-pill"}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#F042FF]" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SECONDARY FORMAT / LAYOUT FILTER TABS */}
            <div className="flex flex-wrap justify-center items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mr-1">
                Format:
              </span>
              {[
                { id: "all", label: "ALL FORMATS" },
                { id: "3-grid", label: "3-GRID STRIP" },
                { id: "4-grid", label: "4-GRID STRIP" },
                { id: "2x2", label: "2x2 SQUARE" },
                { id: "2x3", label: "2x3 POSTCARD" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedLayoutFilter(tab.id);
                  }}
                  className={selectedLayoutFilter === tab.id ? "btn-format-chip-active" : "btn-format-chip"}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrapbook Board Grid */}
          <div className="gallery-content-block relative p-5 md:p-8 rounded-[28px] border border-white/15 bg-[#160078]/30 backdrop-blur-xl shadow-[0_15px_40px_rgba(1,0,48,0.5)] overflow-hidden min-h-[420px]">
            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: "radial-gradient(#F042FF 1px, transparent 1px)", 
              backgroundSize: "24px 24px" 
            }} />

            {/* Empty state */}
            {filteredItems.length === 0 ? (
              <div className="relative z-10 py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-display font-black text-lg text-white uppercase">No Creations Found</h4>
                <p className="font-mono text-xs text-zinc-400">Try switching your origin or layout filters above.</p>
              </div>
            ) : (
              /* Layout container */
              <div className="relative z-10 flex flex-wrap justify-center items-start gap-6 md:gap-8">
                {filteredItems.slice(0, 16).map((item, index) => {
                  const isEditorial = item.origin === "editorial" || item.isPromotedToShowcase;
                  let sizeClass = "";
                  let layoutLabel = "";
                  
                  const rotations = ["rotate-[-2.5deg]", "rotate-[2deg]", "rotate-[-1.5deg]", "rotate-[2.5deg]", "rotate-[-2deg]", "rotate-[1.5deg]"];
                  const rotationClass = rotations[index % rotations.length];

                  if (item.layout === "3-grid") {
                    sizeClass = "w-[160px] h-[375px]";
                    layoutLabel = "3-Grid Strip";
                  } else if (item.layout === "4-grid") {
                    sizeClass = "w-[160px] h-[445px]";
                    layoutLabel = "4-Grid Strip";
                  } else if (item.layout === "2x2") {
                    sizeClass = "w-[220px] h-[280px]";
                    layoutLabel = "2x2 Grid";
                  } else {
                    sizeClass = "w-[220px] h-[360px]";
                    layoutLabel = "2x3 Postcard";
                  }

                  return (
                    <div 
                      key={item.id} 
                      onClick={() => {
                        playClickSound();
                        setSelectedItem(item);
                        setIsZoomLoupe(false);
                        setShowPrintGuides(false);
                        setIsPrintOrderOpen(false);
                        setOrderSuccess(false);
                      }}
                      className={`gallery-parallax-card relative flex flex-col justify-between bg-[#FAF6F9] border p-3 shadow-[0_14px_32px_rgba(0,0,0,0.4)] rounded-2xl transition-all duration-300 hover:z-20 cursor-pointer group ${
                        isEditorial
                          ? "border-[#F042FF]/60 hover:border-[#F042FF] hover:shadow-[0_0_30px_rgba(240,66,255,0.35)]"
                          : "border-[#160078]/20 hover:border-[#7226FF]"
                      } ${rotationClass} ${sizeClass}`}
                    >
                      {/* Washi Tape / Pin Decoration */}
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-[#F042FF] to-[#7226FF] border border-white/80 shadow-md z-30 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-90" />
                      </div>

                      {/* Origin Ribbon Badge */}
                      <div className="absolute -top-2 -right-2 z-30">
                        {isEditorial ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white shadow-md border border-white/40">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{item.badge || "EDITORIAL"}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-[#010030] text-emerald-400 shadow-md border border-emerald-400/40">
                            <span>COMMUNITY</span>
                          </span>
                        )}
                      </div>

                      {/* Filmstrip Sprocket holes for strip layouts */}
                      {(item.layout === "3-grid" || item.layout === "4-grid") && (
                        <>
                          <div className="absolute top-4 bottom-4 left-1.5 w-1 flex flex-col justify-between items-center pointer-events-none opacity-40">
                            {Array.from({ length: item.layout === "3-grid" ? 12 : 15 }).map((_, i) => (
                              <div key={i} className="w-1.5 h-2 bg-[#160078]/30 rounded-[1px]" />
                            ))}
                          </div>
                          <div className="absolute top-4 bottom-4 right-1.5 w-1 flex flex-col justify-between items-center pointer-events-none opacity-40">
                            {Array.from({ length: item.layout === "3-grid" ? 12 : 15 }).map((_, i) => (
                              <div key={i} className="w-1.5 h-2 bg-[#160078]/30 rounded-[1px]" />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Photo Content Area */}
                      <div className="relative flex-1 bg-[#010030] rounded-lg overflow-hidden border border-[#160078]/20 flex flex-col justify-around p-1">
                        <img 
                          src={item.imageSrc} 
                          alt={item.caption} 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover rounded-sm transition-opacity duration-300"
                        />

                        {/* Interactive Overlay on Hover */}
                        <div className="absolute inset-0 bg-[#010030]/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-center">
                          {isEditorial ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playClickSound();
                                navigate("/setup");
                              }}
                              className="btn-studio-primary text-[10px] py-1.5 px-3 shadow-md flex items-center gap-1"
                            >
                              <span>USE STYLE</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-white bg-[#010030]/90 px-2.5 py-1 rounded-full border border-white/20">
                              <Eye className="w-3 h-3 text-[#F042FF]" />
                              <span>INSPECT 300 DPI</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tactile Polaroid Label */}
                      <div className="mt-2.5 flex flex-col gap-0.5 select-none text-left">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-display font-black text-[11px] text-[#010030] tracking-tight uppercase truncate flex-1 leading-none">
                            {item.caption}
                          </span>
                          <span 
                            className="font-mono text-[8px] font-black px-1.5 py-0.5 border border-[#160078]/15 rounded-sm shrink-0 leading-none text-white bg-gradient-to-r from-[#F042FF] to-[#7226FF]"
                          >
                            {layoutLabel}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-dashed border-[#160078]/15">
                          <span className="font-mono text-[8px] text-[#160078]/70 uppercase tracking-wider font-bold truncate max-w-[90px]">
                            BY {item.creator}
                          </span>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(item.id);
                            }}
                            disabled={item.hasLiked}
                            className={`btn-micro-like ${item.hasLiked ? "liked" : ""}`}
                            title={item.hasLiked ? "Liked" : "Hype creation"}
                          >
                            <Heart className={`w-2.5 h-2.5 transition-transform ${item.hasLiked ? "fill-current scale-110 text-[#F042FF]" : ""}`} />
                            <span>{item.likes || 0}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* HIGH-RES LIGHTBOX MODAL WITH DEEP INSPECTION & 300 DPI ZOOM */}
        {selectedItem && typeof document !== "undefined" && createPortal(
          <div 
            className="fixed inset-0 z-[99999] bg-[#010030]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none"
            onClick={() => {
              setSelectedItem(null);
              setIsPrintOrderOpen(false);
            }}
          >
            {/* Modal Box */}
            <div 
              className="bg-white border-2 border-[#2e109d] rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-[0_25px_70px_rgba(1,0,48,0.8)] relative text-[#010030] space-y-4 max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Prev & Next Nav Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("prev");
                }}
                className="carousel-control-btn absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 z-30"
                title="Previous creation (← Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateLightbox("next");
                }}
                className="carousel-control-btn absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 z-30"
                title="Next creation (→ Right Arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-[#e2dced] pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase shrink-0 ${
                    selectedItem.origin === "editorial" || selectedItem.isPromotedToShowcase
                      ? "bg-[#F042FF]/15 text-[#7226FF] border-[#F042FF]/40"
                      : "bg-emerald-50 text-emerald-700 border-emerald-300"
                  }`}>
                    {selectedItem.origin === "editorial" || selectedItem.isPromotedToShowcase ? "✦ STUDIO EDITORIAL" : "👥 COMMUNITY PRINT"}
                  </span>
                  <h4 className="font-display font-black text-sm sm:text-base uppercase text-[#010030] truncate">
                    {selectedItem.caption}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono text-[#625b82] mr-2">
                    {currentIndex + 1} / {filteredItems.length}
                  </span>
                  <button 
                    onClick={() => {
                      setSelectedItem(null);
                      setIsPrintOrderOpen(false);
                    }}
                    className="p-1.5 text-[#625b82] hover:text-[#010030] rounded-xl hover:bg-[#f0ecf8] transition-colors cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Inspection Toolbar (Zoom Loupe + Print Guides + Share) */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f8f7fc] p-2.5 rounded-2xl border border-[#e2dced] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsZoomLoupe(!isZoomLoupe);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isZoomLoupe
                        ? "bg-[#7226FF] text-white shadow-xs"
                        : "bg-white text-[#010030] border border-[#e2dced] hover:bg-[#f0ecf8]"
                    }`}
                  >
                    {isZoomLoupe ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5 text-[#7226FF]" />}
                    <span>{isZoomLoupe ? "Reset Fit" : "2.5x Loupe Pan"}</span>
                  </button>

                  <button
                    onClick={() => {
                      playClickSound();
                      setShowPrintGuides(!showPrintGuides);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showPrintGuides
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-[#010030] border border-[#e2dced] hover:bg-[#f0ecf8]"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{showPrintGuides ? "Hide Safe Margins" : "300 DPI Guides"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleShareLink}
                    className="p-1.5 bg-white border border-[#e2dced] hover:bg-[#f0ecf8] text-[#010030] rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    title="Copy Share Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-[#7226FF]" />}
                    <span className="text-[11px] font-bold">{copiedLink ? "Copied!" : "Share"}</span>
                  </button>

                  <button
                    onClick={handleDownloadHighRes}
                    className="p-1.5 bg-white border border-[#e2dced] hover:bg-[#f0ecf8] text-[#010030] rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                    title="Download High-Res 300 DPI PNG"
                  >
                    <Download className="w-3.5 h-3.5 text-[#7226FF]" />
                    <span className="text-[11px] font-bold">Export</span>
                  </button>
                </div>
              </div>

              {/* Photostrip Canvas / Inspection Window */}
              <div 
                onMouseMove={handleMouseMove}
                className="relative bg-[#010030]/5 border border-[#e2dced] rounded-2xl p-4 flex items-center justify-center min-h-[320px] max-h-[50vh] overflow-hidden cursor-crosshair group"
              >
                {isZoomLoupe ? (
                  <div 
                    className="w-full h-[45vh] rounded-xl overflow-hidden shadow-inner border border-[#7226FF]/40"
                    style={{
                      backgroundImage: `url(${selectedItem.imageSrc})`,
                      backgroundPosition: `${loupePosition.x}% ${loupePosition.y}%`,
                      backgroundSize: "280% auto",
                      backgroundRepeat: "no-repeat"
                    }}
                  >
                    <div className="bg-[#010030]/80 text-white text-[10px] font-mono font-bold px-2 py-1 rounded-br-lg inline-block">
                      LOUPE PAN: {Math.round(loupePosition.x)}%, {Math.round(loupePosition.y)}%
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block max-h-[46vh]">
                    <img 
                      src={selectedItem.imageSrc} 
                      alt={selectedItem.caption}
                      className="max-h-[46vh] w-auto object-contain rounded-lg shadow-md border border-black/10"
                    />

                    {/* 300 DPI Print Bleed & Safe Margin Overlay Guides */}
                    {showPrintGuides && (
                      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-red-500 m-2 rounded-sm flex flex-col justify-between p-1.5">
                        <div className="flex justify-between items-start text-[9px] font-mono font-black text-red-500 bg-white/90 px-1 rounded shadow-xs">
                          <span>0.125" BLEED BOUNDARY</span>
                          <span>SAFE PRINT ZONE</span>
                        </div>
                        <div className="flex justify-between items-end text-[9px] font-mono font-black text-emerald-600 bg-white/90 px-1 rounded shadow-xs">
                          <span>300 DPI CMYK CALIBRATED</span>
                          <span>{selectedItem.layout?.toUpperCase()} FORMAT</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Specs & Creator info Bar */}
              <div className="grid grid-cols-3 gap-2 bg-[#f8f7fc] p-3 rounded-2xl border border-[#e2dced] text-xs font-mono">
                <div>
                  <span className="text-[#625b82] block text-[10px]">CREATOR</span>
                  <strong className="text-[#010030] text-xs font-bold truncate block">{selectedItem.creator}</strong>
                </div>
                <div>
                  <span className="text-[#625b82] block text-[10px]">PRINT SPEC</span>
                  <strong className="text-emerald-600 text-xs font-bold block">300 DPI • {selectedItem.layout?.toUpperCase()}</strong>
                </div>
                <div>
                  <span className="text-[#625b82] block text-[10px]">ACCENT COLOR</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: selectedItem.color || "#F042FF" }} />
                    <span className="text-[11px] font-bold text-[#010030]">{selectedItem.color || "#F042FF"}</span>
                  </div>
                </div>
              </div>

              {/* Print Order Drawer Dialog for Community Prints */}
              {isPrintOrderOpen && (
                <div className="bg-[#f0ecf8] border-2 border-[#7226FF]/40 rounded-2xl p-4 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-[#e2dced] pb-2">
                    <div className="flex items-center gap-2">
                      <PackageCheck className="w-4 h-4 text-[#7226FF]" />
                      <span className="font-display font-black text-xs uppercase text-[#010030]">Studio Print Order Verification</span>
                    </div>
                    <button 
                      onClick={() => setIsPrintOrderOpen(false)}
                      className="text-[#625b82] hover:text-[#010030]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {orderSuccess ? (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-mono">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Print order queued successfully! 300 DPI CMYK package sent to studio lab.</span>
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#625b82] uppercase mb-1">Paper Finish</label>
                          <div className="flex gap-2">
                            {["glossy", "matte"].map(finish => (
                              <button
                                key={finish}
                                onClick={() => setPaperFinish(finish)}
                                className={`flex-1 py-1.5 px-2 rounded-xl font-bold uppercase text-[10px] cursor-pointer border ${
                                  paperFinish === finish
                                    ? "bg-[#7226FF] text-white border-[#7226FF]"
                                    : "bg-white text-[#010030] border-[#e2dced]"
                                }`}
                              >
                                {finish}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#625b82] uppercase mb-1">Copies</label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 4, 8].map(qty => (
                              <button
                                key={qty}
                                onClick={() => setOrderQuantity(qty)}
                                className={`w-8 h-8 rounded-xl font-bold text-xs cursor-pointer border ${
                                  orderQuantity === qty
                                    ? "bg-[#010030] text-white border-[#010030]"
                                    : "bg-white text-[#010030] border-[#e2dced]"
                                }`}
                              >
                                {qty}x
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-[#e2dced]">
                        <span className="text-[#625b82] text-[11px]">Est. Lab Dispatch: <strong>24-48 Hours</strong></span>
                        <button
                          onClick={handleConfirmOrder}
                          className="btn-studio-primary text-xs py-2 px-4 flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Dispatch {orderQuantity} Print{orderQuantity > 1 ? "s" : ""}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#f0ebf7]">
                <button 
                  onClick={() => handleLike(selectedItem.id)}
                  className={`btn-filter-pill ${selectedItem.hasLiked ? "btn-filter-pill-active" : ""}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${selectedItem.hasLiked ? "fill-current text-[#F042FF] scale-110" : "text-[#F042FF]"}`} />
                  <span>{selectedItem.likes || 0} Hypes</span>
                </button>

                <div className="flex items-center gap-2">
                  {(selectedItem.origin === "editorial" || selectedItem.isPromotedToShowcase) ? (
                    <button
                      onClick={() => {
                        setSelectedItem(null);
                        navigate("/setup");
                      }}
                      className="btn-studio-primary text-xs py-2.5 px-6 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#FFE5F1]" />
                      <span>Use Style in Booth</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playClickSound();
                        setIsPrintOrderOpen(!isPrintOrderOpen);
                      }}
                      className="btn-studio-secondary text-xs py-2.5 px-5 flex items-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-[#F042FF]" />
                      <span>{isPrintOrderOpen ? "Close Order" : "Order Print Copy"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </section>
  );
};

export default GallerySection;
