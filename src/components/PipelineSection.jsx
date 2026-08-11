import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const PipelineSection = ({ tunerConfig }) => {
  const pipelineSectionRef = useRef(null);

  useEffect(() => {
    // Pipeline Steps Bidirectional Reveals
    const pipelineSteps = gsap.utils.toArray(".pipeline-step-card");
    const revealTriggers = [];

    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.4)";

    // Dynamic vertical shift for left vs right columns in the steps grid
    const pipelineParallaxAnims = [];
    pipelineSteps.forEach((card, idx) => {
      const shift = idx % 2 === 0 ? -10 : 10;
      const anim = gsap.to(card, {
        yPercent: shift,
        ease: "none",
        scrollTrigger: {
          trigger: pipelineSectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        }
      });
      pipelineParallaxAnims.push(anim);
    });

    // Bidirectional scroll-reveal for Header Block
    const headerBlock = pipelineSectionRef.current?.querySelector(".pipeline-header-block");
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

    // Pipeline Steps Bidirectional Scroll-based Reveals with Stagger
    const contentBlock = pipelineSectionRef.current?.querySelector(".pipeline-content-block");
    let contentTrigger;
    if (contentBlock) {
      contentTrigger = ScrollTrigger.create({
        trigger: contentBlock,
        start: "top 85%",
        end: "bottom 15%",
        onEnter: () => {
          gsap.fromTo(".pipeline-step-card", 
            { y: 50, opacity: 0, scale: 0.92 }, 
            { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.1, overwrite: "auto" }
          );
        },
        onEnterBack: () => {
          gsap.fromTo(".pipeline-step-card", 
            { y: -50, opacity: 0, scale: 0.92 }, 
            { y: 0, opacity: 1, scale: 1, duration: duration, ease: ease, stagger: 0.1, overwrite: "auto" }
          );
        },
        onLeave: () => {
          gsap.fromTo(".pipeline-step-card", 
            { y: 0, opacity: 1, scale: 1 },
            { y: -50, opacity: 0, scale: 0.92, duration: duration * 0.75, ease: "power2.in", stagger: 0.05, overwrite: "auto" }
          );
        },
        onLeaveBack: () => {
          gsap.fromTo(".pipeline-step-card", 
            { y: 0, opacity: 1, scale: 1 },
            { y: 50, opacity: 0, scale: 0.92, duration: duration * 0.75, ease: "power2.in", stagger: 0.05, overwrite: "auto" }
          );
        }
      });
    }

    return () => {
      pipelineParallaxAnims.forEach(anim => anim.kill());
      if (headerTrigger) headerTrigger.kill();
      if (contentTrigger) contentTrigger.kill();
    };
  }, [tunerConfig]);

  return (
    <section className="px-6 py-16 relative z-10 bg-[#010030]">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* PLAYFUL PIPELINE STEP-BY-STEP */}
        <div ref={pipelineSectionRef} className="bg-[#160078]/60 backdrop-blur-2xl rounded-[40px] p-8 md:p-12 text-white border border-white/20 shadow-[0_20px_60px_rgba(1,0,48,0.7)] relative overflow-hidden z-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#F042FF]/20 to-[#7226FF]/20 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="pipeline-header-block max-w-md">
              <span className="font-mono text-xs text-[#FFE5F1] font-black uppercase tracking-widest bg-gradient-to-r from-[#F042FF]/30 to-[#7226FF]/30 border border-white/30 px-3.5 py-1.5 rounded-full shadow-sm">
                GET THE PRINTS
              </span>
              <h3 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight leading-none mt-5">
                HOW TO GET <br/>YOUR <span className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] bg-clip-text text-transparent">PRINTS</span>
              </h3>
              <p className="font-sans text-sm text-zinc-300 leading-relaxed mt-4 font-medium">
                SNPSHOT operates on a super clean, tactile pipeline. No complex setups—just calibrate, strike your pose, decorate, and get your print instantly.
              </p>
            </div>

            <div className="pipeline-content-block w-full lg:max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="pipeline-step-card bg-[#010030]/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-[#F042FF]/50 transition-colors">
                <div className="font-display font-black text-2xl text-[#F042FF] mb-2">01</div>
                <h5 className="font-display font-black text-sm text-white uppercase mb-1">Calibrate Layout</h5>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  Choose your dimensions, theme colors, and select a creator collab guide overlay.
                </p>
              </div>

              <div className="pipeline-step-card bg-[#010030]/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-[#F042FF]/50 transition-colors">
                <div className="font-display font-black text-2xl text-[#F042FF] mb-2">02</div>
                <h5 className="font-display font-black text-sm text-white uppercase mb-1">Strike Your Poses</h5>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  Take 4 snappy pictures with real-time digital viewfinder flashes.
                </p>
              </div>

              <div className="pipeline-step-card bg-[#010030]/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-[#F042FF]/50 transition-colors">
                <div className="font-display font-black text-2xl text-[#F042FF] mb-2">03</div>
                <h5 className="font-display font-black text-sm text-white uppercase mb-1">Brush & Stamp</h5>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  Affix cute interactive stamps and draw glowing neon doodles.
                </p>
              </div>

              <div className="pipeline-step-card bg-[#010030]/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:border-[#F042FF]/50 transition-colors">
                <div className="font-display font-black text-2xl text-[#F042FF] mb-2">04</div>
                <h5 className="font-display font-black text-sm text-white uppercase mb-1">Instant Save</h5>
                <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                  Download, copy, or share your completed aesthetic strip to your feed instantly!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
