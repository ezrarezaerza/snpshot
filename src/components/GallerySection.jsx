import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Heart } from "lucide-react";
import { playClickSound } from "../utils/audio";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const GallerySection = ({ tunerConfig }) => {
  const gallerySectionRef = useRef(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [selectedLayoutFilter, setSelectedLayoutFilter] = useState("all");

  useEffect(() => {
    axios.get("/api/creator/data")
      .then(res => {
        if (res.data && res.data.galleryItems && res.data.galleryItems.length > 0) {
          setGalleryItems(res.data.galleryItems);
        }
      })
      .catch(err => console.error("Error fetching gallery items:", err));
  }, []);

  const handleLike = async (id) => {
    setGalleryItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, likes: (item.likes || 0) + 1, hasLiked: true };
      }
      return item;
    }));

    try {
      await axios.post(`/api/gallery/like/${id}`);
    } catch (err) {
      console.error("Error liking gallery item:", err);
    }
  };

  // Gallery Section Alternating Scroll-Tied Depth Parallax Effect & Bidirectional Reveals
  useEffect(() => {
    const cards = gsap.utils.toArray(".gallery-parallax-card");
    if (cards.length === 0) return;

    const killTriggers = [];
    const galleryTriggers = [];

    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.2)";

    cards.forEach((card, idx) => {
      // Even index cards drift down slightly, odd index cards drift up
      const speed = idx % 2 === 0 ? -12 : 12;
      const rotationFactor = idx % 2 === 0 ? -3 : 3;

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
    const headerBlock = gallerySectionRef.current.querySelector(".gallery-header-block");
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
    const contentBlock = gallerySectionRef.current.querySelector(".gallery-content-block");
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
  }, [selectedLayoutFilter, galleryItems, tunerConfig]);

  return (
    <section ref={gallerySectionRef} className="px-6 py-16 relative z-10 bg-[#010030]">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* COMMUNITY PHOTOSTRIP PREVIEW GALLERY */}
        <div className="mb-24 relative z-10">
          <div className="gallery-header-block text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] text-white font-display font-black text-xs uppercase tracking-widest px-5 py-2 rounded-full mb-4 border border-white/30 shadow-[0_4px_15px_rgba(240,66,255,0.4)]">
              ✦ SNAPSHOT GALLERY ✦
            </div>
            <h3 className="font-display font-black text-3xl md:text-5xl text-white uppercase leading-tight tracking-tight">
              FINISHED <span className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] bg-clip-text text-transparent px-2 inline-block">PREVIEWS & LAYOUTS</span>
            </h3>
            <p className="font-sans text-xs md:text-sm text-zinc-300 max-w-xl mx-auto mt-4 leading-relaxed mb-8 font-medium">
              Witness real finished prints uploaded directly from the Creator Portal. Pick from four iconic layouts: 3-Grid, 4-Grid, 2x2, or 2x3. Click the heart to hype!
            </p>

            {/* Layout Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {[
                { id: "all", label: "★ ALL LAYOUTS" },
                { id: "3-grid", label: "3-GRID STRIP" },
                { id: "4-grid", label: "4-GRID STRIP" },
                { id: "2x2", label: "2x2 GRID" },
                { id: "2x3", label: "2x3 GRID" }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playClickSound();
                    setSelectedLayoutFilter(tab.id);
                  }}
                  className={`font-display font-black text-[10px] md:text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all cursor-pointer border ${
                    selectedLayoutFilter === tab.id
                      ? "bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] text-white border-white/30 shadow-[0_2px_10px_rgba(240,66,255,0.25)]"
                      : "bg-[#160078]/40 text-zinc-300 border-white/10 hover:border-white/25 hover:text-white"
                  }`}
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

            {/* Layout container */}
            <div className="relative z-10 flex flex-wrap justify-center items-start gap-6 md:gap-10">
              {[
                ...galleryItems,
                {
                  id: "default-g-1",
                  caption: "cherry blossom aura",
                  creator: "@sa.kura",
                  layout: "3-grid",
                  color: "#F042FF",
                  imageSrc: "/img/poses/Wonyoung1.png",
                  likes: 948,
                  isDefault: true
                },
                {
                  id: "default-g-2",
                  caption: "cyber glitch core",
                  creator: "@vj.cyber",
                  layout: "4-grid",
                  color: "#7226FF",
                  imageSrc: "/img/poses/Wonyoung2.png",
                  likes: 1202,
                  isDefault: true
                },
                {
                  id: "default-g-3",
                  caption: "cozy autumn frame",
                  creator: "@autumn.lily",
                  layout: "2x2",
                  color: "#FFE5F1",
                  imageSrc: "/img/poses/Wonyoung3.png",
                  likes: 853,
                  isDefault: true
                },
                {
                  id: "default-g-4",
                  caption: "night arcade run",
                  creator: "@retro.squad",
                  layout: "2x3",
                  color: "#F042FF",
                  imageSrc: "/img/poses/Wonyoung1.png",
                  likes: 1420,
                  isDefault: true
                }
              ].filter(item => selectedLayoutFilter === "all" || item.layout === selectedLayoutFilter)
               .slice(0, 12)
               .map((item, index) => {
                let sizeClass = "";
                let layoutLabel = "";
                let rotationClass = "";
                
                const rotations = ["rotate-[-3deg]", "rotate-[2deg]", "rotate-[-1.5deg]", "rotate-[3deg]", "rotate-[-2.5deg]", "rotate-[2.5deg]"];
                rotationClass = rotations[index % rotations.length];

                if (item.layout === "3-grid") {
                  sizeClass = "w-[155px] h-[370px]";
                  layoutLabel = "3-Grid Strip";
                } else if (item.layout === "4-grid") {
                  sizeClass = "w-[155px] h-[440px]";
                  layoutLabel = "4-Grid Strip";
                } else if (item.layout === "2x2") {
                  sizeClass = "w-[215px] h-[275px]";
                  layoutLabel = "2x2 Grid";
                } else {
                  sizeClass = "w-[215px] h-[355px]";
                  layoutLabel = "2x3 Grid";
                }

                return (
                  <div 
                    key={item.id} 
                    className={`gallery-parallax-card relative flex flex-col justify-between bg-[#FAF6F9] border border-[#160078]/15 p-3 shadow-[0_12px_28px_rgba(0,0,0,0.35)] rounded-2xl transition-[border-color,box-shadow] duration-300 hover:border-[#F042FF] hover:z-20 ${rotationClass} ${sizeClass}`}
                  >
                    {/* Thumbtack pin decoration */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-[#F042FF] to-[#7226FF] border border-white/60 shadow-sm z-30 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white opacity-90" />
                    </div>

                    {/* Filmstrip Sprocket holes */}
                    {(item.layout === "3-grid" || item.layout === "4-grid") && (
                      <>
                        <div className="absolute top-4 bottom-4 left-1.5 w-1 flex flex-col justify-between items-center pointer-events-none opacity-50">
                          {Array.from({ length: item.layout === "3-grid" ? 12 : 15 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-2 bg-[#160078]/25 rounded-[1px]" />
                          ))}
                        </div>
                        <div className="absolute top-4 bottom-4 right-1.5 w-1 flex flex-col justify-between items-center pointer-events-none opacity-50">
                          {Array.from({ length: item.layout === "3-grid" ? 12 : 15 }).map((_, i) => (
                            <div key={i} className="w-1.5 h-2 bg-[#160078]/25 rounded-[1px]" />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Photo Content Area */}
                    <div className="relative flex-1 bg-[#010030] rounded-lg overflow-hidden border border-[#160078]/20 flex flex-col justify-around p-1">
                      {item.isDefault ? (
                        item.layout === "3-grid" ? (
                          <>
                            <div className="w-full h-[28%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung1.png" alt="cell 1" className="w-full h-full object-cover opacity-85 hover:opacity-100 transition" />
                              <div className="absolute inset-0 bg-[#F042FF]/15 mix-blend-color" />
                            </div>
                            <div className="w-full h-[28%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung2.png" alt="cell 2" className="w-full h-full object-cover opacity-85 hover:opacity-100 transition" />
                              <div className="absolute inset-0 bg-[#F042FF]/15 mix-blend-color" />
                            </div>
                            <div className="w-full h-[28%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung3.png" alt="cell 3" className="w-full h-full object-cover opacity-85 hover:opacity-100 transition" />
                              <div className="absolute inset-0 bg-[#F042FF]/15 mix-blend-color" />
                            </div>
                          </>
                        ) : item.layout === "4-grid" ? (
                          <>
                            <div className="w-full h-[21%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung2.png" alt="cell 1" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-[#7226FF]/15 mix-blend-color" />
                            </div>
                            <div className="w-full h-[21%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung3.png" alt="cell 2" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-[#7226FF]/15 mix-blend-color" />
                            </div>
                            <div className="w-full h-[21%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung1.png" alt="cell 3" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-[#7226FF]/15 mix-blend-color" />
                            </div>
                            <div className="w-full h-[21%] bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden flex items-center justify-center">
                              <img src="/img/poses/Wonyoung2.png" alt="cell 4" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-[#7226FF]/15 mix-blend-color" />
                            </div>
                          </>
                        ) : item.layout === "2x2" ? (
                          <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full p-0.5">
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung3.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-pink-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung1.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-pink-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung2.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-pink-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung3.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-pink-500/10 mix-blend-color" />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 grid-rows-3 gap-1 w-full h-full p-0.5">
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung1.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-purple-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung2.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-purple-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung3.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-purple-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung1.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-purple-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung2.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-purple-500/10 mix-blend-color" />
                            </div>
                            <div className="bg-zinc-900 border border-white/10 rounded-sm relative overflow-hidden">
                              <img src="/img/poses/Wonyoung3.png" alt="cell" className="w-full h-full object-cover opacity-85" />
                              <div className="absolute inset-0 bg-purple-500/10 mix-blend-color" />
                            </div>
                          </div>
                        )
                      ) : (
                        <img 
                          src={item.imageSrc} 
                          alt={item.caption} 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover rounded-sm"
                        />
                      )}
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
                        <span className="font-mono text-[8px] text-[#160078]/70 uppercase tracking-wider">
                          BY {item.creator}
                        </span>
                        <button 
                          onClick={() => handleLike(item.id)}
                          disabled={item.hasLiked}
                          className={`flex items-center gap-1 font-mono text-[8px] font-bold border rounded-full px-1.5 py-0.5 cursor-pointer transition-all ${
                            item.hasLiked 
                              ? "text-[#F042FF] bg-[#F042FF]/10 border-[#F042FF]" 
                              : "text-[#010030] bg-white border-[#160078]/20 hover:border-[#F042FF] hover:text-[#F042FF]"
                          }`}
                        >
                          <Heart className={`w-2 h-2 transition-transform ${item.hasLiked ? "fill-current scale-110 text-[#F042FF]" : ""}`} />
                          <span>{item.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default GallerySection;
