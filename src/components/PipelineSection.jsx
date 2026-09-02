import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const PipelineSection = ({ tunerConfig }) => {
  const pipelineSectionRef = useRef(null);
  const [pipelineSteps, setPipelineSteps] = useState([
    { step: "01", title: "Select Layout", desc: "Choose your strip dimensions, theme colors, and frame overlays." },
    { step: "02", title: "Capture Photos", desc: "Take photos with customizable countdown timers and live studio filters." },
    { step: "03", title: "Customize & Decorate", desc: "Add custom digital stamps, aesthetic stickers, and personal timestamps." },
    { step: "04", title: "Download & Share", desc: "Export high-resolution PNGs, animated GIFs, or scan the QR code to save instantly." }
  ]);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const res = await axios.get("/api/creator/website-content");
        if (res.data && res.data.websiteContent && Array.isArray(res.data.websiteContent.pipelineSteps)) {
          if (res.data.websiteContent.pipelineSteps.length > 0) {
            setPipelineSteps(res.data.websiteContent.pipelineSteps);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch pipeline steps, using default:", err);
      }
    };
    fetchPipeline();
  }, []);

  useEffect(() => {
    // Pipeline Steps Bidirectional Reveals
    const cards = gsap.utils.toArray(".pipeline-step-card");

    const duration = tunerConfig?.scrollRevealDuration ?? 0.8;
    const ease = tunerConfig?.scrollRevealEase ?? "back.out(1.4)";

    // Dynamic vertical shift for left vs right columns in the steps grid
    const pipelineParallaxAnims = [];
    cards.forEach((card, idx) => {
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
  }, [tunerConfig, pipelineSteps]);

  return (
    <section className="px-6 py-16 relative z-10 bg-[#010030]">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* PLAYFUL PIPELINE STEP-BY-STEP */}
        <div ref={pipelineSectionRef} className="bg-[#0e0048] rounded-[40px] p-8 md:p-12 text-white border border-[#2b109e] shadow-[0_20px_60px_rgba(1,0,48,0.7)] relative overflow-hidden z-10">
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="pipeline-header-block max-w-md">
              <span className="font-mono text-xs text-[#FFE5F1] font-black uppercase tracking-widest bg-[#160078] border border-[#2b109e] px-3.5 py-1.5 rounded-full shadow-sm">
                GET THE PRINTS
              </span>
              <h3 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight leading-none mt-5">
                HOW TO GET <br/>YOUR <span className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] bg-clip-text text-transparent">PRINTS</span>
              </h3>
              <p className="font-sans text-sm text-zinc-300 leading-relaxed mt-4 font-medium">
                SNPSHOT provides a streamlined, professional photo booth experience. Select your frame, pose with countdown timers, customize with stamps, and download your photostrip.
              </p>
            </div>

            <div className="pipeline-content-block w-full lg:max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pipelineSteps.map((s, idx) => (
                <div key={idx} className="pipeline-step-card bg-[#050020] p-6 rounded-2xl border border-[#2b109e] hover:border-[#F042FF] transition-colors shadow-md">
                  <div className="font-display font-black text-2xl text-[#F042FF] mb-2">{s.step || `0${idx + 1}`}</div>
                  <h5 className="font-display font-black text-sm text-white uppercase mb-1">{s.title}</h5>
                  <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
