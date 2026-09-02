import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layers, Users, Sparkles } from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const FeaturesSection = ({ tunerConfig }) => {
  const featuresSectionRef = useRef(null);

  useEffect(() => {
    // ScrollTrigger Bidirectional Reveals for Features
    const featureCards = gsap.utils.toArray(".reveal-card");
    const revealTriggers = [];

    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.2)";

    // Self-drawing marker lines simulation
    const drawTrigger = gsap.fromTo(
      ".doodle-arrow",
      { strokeDashoffset: 100, opacity: 0 },
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: featuresSectionRef.current,
          start: "top 80%",
        }
      }
    );

    // Alternating speed vertical depth parallax for feature cards
    const featureParallaxAnims = [];
    featureCards.forEach((card, idx) => {
      const shift = (idx - 1) * -15; 
      const anim = gsap.to(card, {
        yPercent: shift,
        ease: "none",
        scrollTrigger: {
          trigger: featuresSectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });
      featureParallaxAnims.push(anim);
    });

    // Bidirectional scroll-reveal for Header Block
    const headerBlock = featuresSectionRef.current.querySelector(".features-header-block");
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

    // Features Bidirectional Scroll-based Reveals with Stagger
    const contentBlock = featuresSectionRef.current.querySelector(".features-content-block");
    let contentTrigger;
    if (contentBlock) {
      contentTrigger = ScrollTrigger.create({
        trigger: contentBlock,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          gsap.fromTo(".reveal-card", 
            { y: 60, opacity: 0, scale: 0.95 }, 
            { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.1, overwrite: "auto" }
          );
        },
        onEnterBack: () => {
          gsap.fromTo(".reveal-card", 
            { y: -60, opacity: 0, scale: 0.95 }, 
            { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.1, overwrite: "auto" }
          );
        },
        onLeave: () => {
          gsap.fromTo(".reveal-card", 
            { y: 0, opacity: 1, scale: 1 },
            { y: -60, opacity: 0, scale: 0.95, duration: duration * 0.75, ease: "power2.in", stagger: 0.05, overwrite: "auto" }
          );
        },
        onLeaveBack: () => {
          gsap.fromTo(".reveal-card", 
            { y: 0, opacity: 1, scale: 1 },
            { y: 60, opacity: 0, scale: 0.95, duration: duration * 0.75, ease: "power2.in", stagger: 0.05, overwrite: "auto" }
          );
        }
      });
    }

    return () => {
      drawTrigger.kill();
      featureParallaxAnims.forEach(anim => anim.kill());
      if (headerTrigger) headerTrigger.kill();
      if (contentTrigger) contentTrigger.kill();
    };
  }, [tunerConfig]);

  return (
    <section ref={featuresSectionRef} className="px-6 py-20 relative z-10 bg-[#FAF6F9] text-[#010030] border-y border-[#160078]/10">
      <div className="max-w-6xl mx-auto relative z-10">
        
        <div className="mb-8 relative z-10">
          <div className="features-header-block text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] text-white font-display font-black text-xs uppercase tracking-widest px-5 py-2 rounded-full mb-4 shadow-[0_4px_15px_rgba(22,0,120,0.2)] border border-white/30">
              ✦ CORE CAPABILITIES ✦
            </div>
            <h3 className="font-display font-black text-3xl md:text-5xl text-[#010030] uppercase leading-tight tracking-tight">
              ENGINEERED FOR YOUR <span className="bg-gradient-to-r from-[#7226FF] via-[#160078] to-[#010030] bg-clip-text text-transparent px-2 inline-block">STUDIO EXPERIENCE</span>
            </h3>
            <p className="font-sans text-sm md:text-base text-[#160078]/80 max-w-xl mx-auto mt-4 leading-relaxed font-medium">
              Designed for seamless captures, instant customization, and studio-quality digital photo strips.
            </p>
          </div>

          <div className="features-content-block grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Hand-drawn connector line pointing from Card 1 to Card 2 */}
            <div className="absolute top-[30%] left-[28%] w-[12%] text-[#7226FF]/40 pointer-events-none hidden lg:block">
              <svg viewBox="0 0 100 40" className="w-full h-auto fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5,10 Q50,35 95,15" className="doodle-arrow" />
                <path d="M80,10 L95,15 L85,30" className="doodle-arrow" />
              </svg>
            </div>

            {/* Hand-drawn connector line pointing from Card 2 to Card 3 */}
            <div className="absolute top-[30%] left-[61%] w-[12%] text-[#7226FF]/40 pointer-events-none hidden lg:block">
              <svg viewBox="0 0 100 40" className="w-full h-auto fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5,10 Q50,35 95,15" className="doodle-arrow" />
                <path d="M80,10 L95,15 L85,30" className="doodle-arrow" />
              </svg>
            </div>

            {/* Feature Card 1 */}
            <div className="reveal-card will-change-[transform,opacity] p-8 flex flex-col justify-between min-h-[300px] bg-white rounded-[28px] border border-[#160078]/15 shadow-[0_15px_35px_rgba(22,0,120,0.06)] hover:border-[#7226FF] hover:shadow-[0_20px_45px_rgba(114,38,255,0.15)] transition-[border-color,box-shadow] duration-300">
              <div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFE5F1] via-[#F042FF] to-[#7226FF] border border-white/60 flex items-center justify-center mb-6 shadow-[0_6px_20px_rgba(240,66,255,0.3)]">
                  <Layers className="text-white w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="font-display font-black text-xl text-[#010030] uppercase tracking-tight mb-3">
                  01 // Layout Formats
                </h4>
                <p className="font-sans text-sm text-[#160078]/80 leading-relaxed font-medium">
                  Select from 4 classic photo strip layouts and composite grids. Customize with adjustable border colors, retro textures, and sleek gradients.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#160078]/10 flex justify-between items-center text-xs font-mono text-[#160078]/70">
                <span>MODULE: LAYOUTS</span>
                <span className="font-bold text-[#7226FF]">4 FORMATS</span>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="reveal-card will-change-[transform,opacity] p-8 flex flex-col justify-between min-h-[300px] bg-white rounded-[28px] border border-[#160078]/15 shadow-[0_15px_35px_rgba(22,0,120,0.06)] hover:border-[#7226FF] hover:shadow-[0_20px_45px_rgba(114,38,255,0.15)] transition-[border-color,box-shadow] duration-300">
              <div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7226FF] to-[#160078] border border-white/60 flex items-center justify-center mb-6 shadow-[0_6px_20px_rgba(114,38,255,0.3)]">
                  <Users className="text-white w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="font-display font-black text-xl text-[#010030] uppercase tracking-tight mb-3">
                  02 // Pose Guides & Event Collabs
                </h4>
                <p className="font-sans text-sm text-[#160078]/80 leading-relaxed font-medium">
                  Capture perfect shots using real-time pose references and interactive overlays from featured event themes, idol collabs, and pop culture celebrations.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#160078]/10 flex justify-between items-center text-xs font-mono text-[#160078]/70">
                <span>MODULE: POSE GUIDE</span>
                <span className="font-bold text-[#7226FF]">EVENT COLLABS</span>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="reveal-card will-change-[transform,opacity] p-8 flex flex-col justify-between min-h-[300px] bg-white rounded-[28px] border border-[#160078]/15 shadow-[0_15px_35px_rgba(22,0,120,0.06)] hover:border-[#7226FF] hover:shadow-[0_20px_45px_rgba(114,38,255,0.15)] transition-[border-color,box-shadow] duration-300">
              <div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F042FF] to-[#7226FF] border border-white/60 flex items-center justify-center mb-6 shadow-[0_6px_20px_rgba(240,66,255,0.3)]">
                  <Sparkles className="text-white w-6 h-6 stroke-[2.5]" />
                </div>
                <h4 className="font-display font-black text-xl text-[#010030] uppercase tracking-tight mb-3">
                  03 // Decoration Suite
                </h4>
                <p className="font-sans text-sm text-[#160078]/80 leading-relaxed font-medium">
                  Add custom digital stamps, aesthetic stickers, and personal timestamps. Draw glowing vector artwork using our interactive canvas brush tools.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-[#160078]/10 flex justify-between items-center text-xs font-mono text-[#160078]/70">
                <span>MODULE: DECORATION</span>
                <span className="font-bold text-[#7226FF]">STAMPS & DRAW</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
