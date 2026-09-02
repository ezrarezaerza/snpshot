import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Heart } from "lucide-react";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const DEFAULT_HERO_CONFIG = {
  activeThemePreset: "snpshot-hero-default",
  headline: "DIGITAL PHOTO BOOTH",
  subheadline: "Capture studio-quality photo strips directly from your browser. Personalize your prints with flexible frame layouts, curated event themes, digital stamps, and high-resolution exports.",
  eyebrowBadge: "✦ DIGITAL SELF-PHOTO STUDIO ✦",
  ctaText: "START BOOTH",
  ctaLink: "/welcome",
  accentColor: "#F042FF",
  heroBg: "linear-gradient(135deg, #010030 0%, #0e0048 50%, #2e109d 100%)",
  doodleHeaderTag: "#PHOTOBOOTH",
  card1Handle: "@wonyoung",
  card1Subhandle: "★ IDOL EDITION",
  card1Tag: "KPOP_01",
  card3Title: "SNPSHOT STUDIO",
  card3Subtitle: "Official Partner",
  card3Stat: "98.4K DOWNLOADS",
  card3Theme: "THEME: PURPLE_NEON ★ PRESET",
  card3Prints: "✦ 15 STRIPS",
  circularBadgeText: "★ DIGITAL PHOTO STUDIO ★ K-POP FRAMES ★ DIGITAL DOWNLOADS ★ PREMIUM PRINTS ★",
  statusText: "ONLINE STUDIO ACTIVE",
  photosCountText: "244,195 PHOTOS TAKEN"
};

const HeroSection = ({ tunerConfig }) => {
  const navigate = useNavigate();
  const [heroConfig, setHeroConfig] = useState(DEFAULT_HERO_CONFIG);

  useEffect(() => {
    // Fetch live hero configuration published from Admin Dashboard
    axios.get("/api/creator/hero-config")
      .then(res => {
        if (res.data && res.data.heroConfig) {
          setHeroConfig(prev => ({ ...prev, ...res.data.heroConfig }));
        }
      })
      .catch(err => {
        console.warn("Using default hero config fallback:", err);
      });
  }, []);

  // Animation references
  const heroRef = useRef(null);
  const title1Ref = useRef(null);
  const title2Ref = useRef(null);
  const title3Ref = useRef(null);
  
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);
  
  const doodle1Ref = useRef(null);
  const doodle2Ref = useRef(null);
  const doodle3Ref = useRef(null);
  const doodle4Ref = useRef(null);
  const doodle5Ref = useRef(null);
  const doodle6Ref = useRef(null);
  const doodle7Ref = useRef(null);
  const doodle8Ref = useRef(null);
  const doodle9Ref = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    // 1. Initial Entrance Animations (Pop & Slide with Individual Character Sequence)
    const tl = gsap.timeline();
    
    // Prepare character spans for entrance
    gsap.set(".web3-stacked-title .char-span", { y: 140, opacity: 0, scale: 0.7, rotateX: -45 });
    
    tl.to(
      ".web3-stacked-title .char-span",
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        rotateX: 0, 
        duration: 1.3, 
        stagger: {
          each: tunerConfig?.heroTextStagger ?? 0.04,
          from: tunerConfig?.heroTextFrom ?? "random"
        }, 
        ease: tunerConfig?.heroTextEase ?? "back.out(2.2)" 
      }
    );

    tl.fromTo(
      [card1Ref.current, card2Ref.current, card3Ref.current],
      { y: 180, opacity: 0, scale: 0.8, rotateX: 25, rotate: () => (Math.random() - 0.5) * 20 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1, 
        rotateX: 0, 
        duration: tunerConfig?.heroCardsDuration ?? 1.5, 
        stagger: tunerConfig?.heroCardsStagger ?? 0.2, 
        ease: tunerConfig?.heroCardsEase ?? "back.out(1.5)" 
      },
      "-=0.9"
    );

    tl.fromTo(
      [
        doodle1Ref.current, doodle2Ref.current, doodle3Ref.current, doodle4Ref.current, doodle5Ref.current,
        doodle6Ref.current, doodle7Ref.current, doodle8Ref.current, doodle9Ref.current, badgeRef.current
      ],
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.0, stagger: 0.08, ease: "back.out(2)" },
      "-=0.7"
    );

    // 2. Parallax Scroll Effect on Hero Elements (scrubbed with GSAP)
    const scroll1 = gsap.to(title1Ref.current, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scroll2 = gsap.to(title2Ref.current, {
      yPercent: 6,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scroll3 = gsap.to(title3Ref.current, {
      yPercent: 16,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    const scrollCard1 = gsap.to(card1Ref.current, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    const scrollCard2 = gsap.to(card2Ref.current, {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    const scrollCard3 = gsap.to(card3Ref.current, {
      yPercent: -22,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    const scrollDoodle1 = gsap.to(doodle1Ref.current, {
      yPercent: -28,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle2 = gsap.to(doodle2Ref.current, {
      yPercent: -12,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle3 = gsap.to(doodle3Ref.current, {
      yPercent: -35,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle4 = gsap.to(doodle4Ref.current, {
      yPercent: -20,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle5 = gsap.to(doodle5Ref.current, {
      yPercent: -18,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle6 = gsap.to(doodle6Ref.current, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle7 = gsap.to(doodle7Ref.current, {
      yPercent: -22,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle8 = gsap.to(doodle8Ref.current, {
      yPercent: -32,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });
    const scrollDoodle9 = gsap.to(doodle9Ref.current, {
      yPercent: -26,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      }
    });

    // 3. Continuous Badge Rotation
    let badgeRotation = 0;
    const updateBadgeRotation = (time, deltaTime) => {
      const deltaSec = deltaTime / 1000;
      const baseSpeed = 30;
      badgeRotation += baseSpeed * deltaSec;
      
      const badgeSVG = badgeRef.current ? badgeRef.current.querySelector("svg") : null;
      if (badgeSVG) {
        gsap.set(badgeSVG, { rotate: badgeRotation, force3D: true });
      }
    };
    gsap.ticker.add(updateBadgeRotation);

    // 4. Interactive Mouse-Parallax Effect inside Hero Header
    const title1X = gsap.quickTo(title1Ref.current, "x", { duration: 1.5, ease: "power2.out" });
    const title1Y = gsap.quickTo(title1Ref.current, "y", { duration: 1.5, ease: "power2.out" });
    const title2X = gsap.quickTo(title2Ref.current, "x", { duration: 1.8, ease: "power2.out" });
    const title2Y = gsap.quickTo(title2Ref.current, "y", { duration: 1.8, ease: "power2.out" });
    const title3X = gsap.quickTo(title3Ref.current, "x", { duration: 1.6, ease: "power2.out" });
    const title3Y = gsap.quickTo(title3Ref.current, "y", { duration: 1.6, ease: "power2.out" });

    const card1X = gsap.quickTo(card1Ref.current, "x", { duration: 1.4, ease: "power3.out" });
    const card1Y = gsap.quickTo(card1Ref.current, "y", { duration: 1.4, ease: "power3.out" });

    const card2X = gsap.quickTo(card2Ref.current, "x", { duration: 1.2, ease: "power3.out" });
    const card2Y = gsap.quickTo(card2Ref.current, "y", { duration: 1.2, ease: "power3.out" });

    const card3X = gsap.quickTo(card3Ref.current, "x", { duration: 1.6, ease: "power3.out" });
    const card3Y = gsap.quickTo(card3Ref.current, "y", { duration: 1.6, ease: "power3.out" });

    const doodleGroup = [
      doodle1Ref.current, doodle2Ref.current, doodle3Ref.current, doodle4Ref.current, doodle5Ref.current,
      doodle6Ref.current, doodle7Ref.current, doodle8Ref.current, doodle9Ref.current
    ];
    const doodlesX = gsap.quickTo(doodleGroup, "x", { duration: 2.2, ease: "power2.out" });
    const doodlesY = gsap.quickTo(doodleGroup, "y", { duration: 2.2, ease: "power2.out" });

    const badgeX = gsap.quickTo(badgeRef.current, "x", { duration: 1.5, ease: "power2.out" });
    const badgeY = gsap.quickTo(badgeRef.current, "y", { duration: 1.5, ease: "power2.out" });

    const onMouseMove = (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (clientX - centerX) / window.innerWidth;
      const moveY = (clientY - centerY) / window.innerHeight;
      
      title1X(moveX * -45);
      title1Y(moveY * -45);
      title2X(moveX * -25);
      title2Y(moveY * -25);
      title3X(moveX * -55);
      title3Y(moveY * -55);
      
      card1X(moveX * 65);
      card1Y(moveY * 65);
      
      card2X(moveX * 30);
      card2Y(moveY * 30);
      
      card3X(moveX * 85);
      card3Y(moveY * 85);

      doodlesX(moveX * 95);
      doodlesY(moveY * 95);

      badgeX(moveX * 45);
      badgeY(moveY * 45);
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      gsap.ticker.remove(updateBadgeRotation);

      scroll1.kill();
      scroll2.kill();
      scroll3.kill();
      scrollCard1.kill();
      scrollCard2.kill();
      scrollCard3.kill();
      scrollDoodle1.kill();
      scrollDoodle2.kill();
      scrollDoodle3.kill();
      scrollDoodle4.kill();
      scrollDoodle5.kill();
      scrollDoodle6.kill();
      scrollDoodle7.kill();
      scrollDoodle8.kill();
      scrollDoodle9.kill();
    };
  }, []);

  return (
    <main id="home-hero-section" className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-20 md:pb-36 relative z-10">
      <div ref={heroRef} className="relative w-full min-h-[70vh] md:min-h-[75vh] flex flex-col items-center justify-center">
        
        {/* REFERENCE INSPIRED BACKGROUND TYPOGRAPHY BLOCK */}
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none z-0">
          <h1 ref={title1Ref} className="web3-stacked-title text-white tracking-tighter">
            {"#PHOTO".split("").map((char, index) => (
              <span key={index} className="inline-block char-span" style={{ display: "inline-block" }}>
                {char}
              </span>
            ))}
          </h1>
          <h1 ref={title2Ref} className="web3-stacked-title tracking-tighter" style={{ color: '#F042FF' }}>
            {"SNAPSHOT".split("").map((char, index) => (
              <span key={index} className="inline-block char-span" style={{ display: "inline-block" }}>
                {char}
              </span>
            ))}
          </h1>
          <h1 ref={title3Ref} className="web3-stacked-title text-white tracking-tighter">
            {"STUDIO".split("").map((char, index) => (
              <span key={index} className="inline-block char-span" style={{ display: "inline-block" }}>
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* PLAYFUL HIGH-CONTRAST NEON DOODLES */}
        <div 
          ref={doodle1Ref} 
          className="absolute top-[1%] right-[6%] w-44 h-32 text-[#F042FF] pointer-events-none z-50 hidden lg:block"
        >
          <svg viewBox="0 0 120 80" className="w-full h-full fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10,25 C45,15 95,20 85,50 C80,60 65,65 55,55 C48,48 55,35 70,40" />
            <path d="M60,34 L72,40 L68,52" />
          </svg>
          <div className="absolute -top-[10%] right-[10%] bg-gradient-to-r from-[#160078] to-[#7226FF] text-[#FAF6F9] font-display font-black text-xs px-3 py-1 rounded-full border border-white/30 rotate-[12deg] shadow-[0_4px_15px_rgba(240,66,255,0.4)] select-none uppercase">
            START ✦
          </div>
        </div>

        <div 
          ref={doodle2Ref} 
          className="absolute top-[6%] left-[1.5%] text-[#F042FF] pointer-events-none z-50 hidden lg:block rotate-[-12deg]"
        >
          <div className="font-display font-black text-4xl tracking-tight text-[#FFE5F1] filter drop-shadow-[0_0_10px_rgba(240,66,255,0.5)]">
            {heroConfig.doodleHeaderTag || "#PHOTOBOOTH"}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current text-[#F042FF]">
              <path d="M12,2 L14.5,9 L22,9.5 L16.5,14.5 L18,22 L12,18 L6,22 L7.5,14.5 L2,9.5 L9.5,9 Z" />
            </svg>
          </div>
        </div>

        <div 
          ref={doodle3Ref} 
          className="absolute bottom-[20%] left-[24%] w-24 h-24 text-[#F042FF]/70 pointer-events-none z-50 hidden md:block"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current" strokeWidth="4" strokeLinecap="round">
            <path d="M10,20 Q30,80 80,45" />
            <path d="M60,40 L80,45 L70,65" />
          </svg>
        </div>

        <div 
          ref={doodle4Ref} 
          className="absolute bottom-[10%] left-[5%] text-[#FFE5F1]/80 pointer-events-none z-50 hidden md:block rotate-[-10deg]"
        >
          <svg viewBox="0 0 100 100" className="w-20 h-20 fill-none stroke-current" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50,15 L62,38 L87,40 L68,57 L74,82 L50,68 L26,82 L32,57 L13,40 L38,38 Z" />
          </svg>
        </div>

        <div 
          ref={doodle5Ref} 
          className="absolute bottom-[22%] left-[12%] text-[#F042FF] pointer-events-none z-50 hidden md:block"
        >
          <svg viewBox="0 0 120 120" className="w-20 h-20 text-[#F042FF]" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M30,50 C40,50 40,40 40,30 C40,40 40,50 50,50 C40,50 40,50 40,60 C40,50 40,50 30,50 Z" className="fill-none stroke-current" />
            <path d="M75,25 L78,32 L85,33 L80,38 L81,45 L75,41 L69,45 L70,38 L65,33 L72,32 Z" className="fill-current" />
            <path d="M80,75 C85,75 85,71 85,67 C85,71 85,75 89,75 C85,75 85,75 85,79 C85,75 85,75 80,75 Z" className="fill-none stroke-current" strokeWidth="2.5" />
            <path d="M25,85 L27,90 L32,91 L28,95 L29,100 L25,97 L21,100 L22,95 L18,91 L23,90 Z" className="fill-current" />
          </svg>
        </div>

        <div ref={doodle6Ref} className="absolute top-[8%] left-[28%] text-[#FFE5F1] pointer-events-none z-50 hidden md:block rotate-[15deg]">
          <svg viewBox="0 0 100 100" className="w-10 h-10 fill-none stroke-current" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50,15 C50,38 38,50 15,50 C38,50 50,62 50,85 C50,62 62,50 85,50 C62,50 50,38 50,15 Z" />
          </svg>
        </div>

        <div ref={doodle7Ref} className="absolute top-[6%] right-[28%] text-[#F042FF] pointer-events-none z-50 hidden md:block rotate-[-10deg]">
          <svg viewBox="0 0 80 80" className="w-8 h-8 fill-current">
            <path d="M40,10 L48,30 L68,32 L53,46 L58,66 L40,54 L22,66 L27,46 L12,32 L32,30 Z" />
          </svg>
        </div>

        <div ref={doodle8Ref} className="absolute top-[26%] left-[16%] text-[#F042FF] pointer-events-none z-50 hidden lg:block">
          <svg viewBox="0 0 100 100" className="w-12 h-12 fill-none stroke-current" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50,10 C50,35 35,50 10,50 C35,50 50,65 50,90 C50,65 65,50 90,50 C65,50 50,35 50,10 Z" />
          </svg>
        </div>

        <div ref={doodle9Ref} className="absolute top-[22%] right-[16%] text-[#FFE5F1] pointer-events-none z-50 hidden lg:block animate-pulse">
          <svg viewBox="0 0 100 100" className="w-12 h-12 fill-none stroke-current" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50,15 C50,38 38,50 15,50 C38,50 50,62 50,85 C50,62 62,50 85,50 C62,50 50,38 50,15 Z" />
          </svg>
        </div>

        {/* ROTATING BADGE STICKER */}
        <div 
          ref={badgeRef} 
          className="absolute bottom-4 right-4 md:bottom-10 md:right-10 pointer-events-auto z-50 cursor-pointer hidden sm:block"
          onClick={() => navigate("/welcome")}
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
              <defs>
                <path id="circlePath" d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" />
                <linearGradient id="gradient4Border" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#160078" />
                  <stop offset="50%" stopColor="#7226FF" />
                  <stop offset="100%" stopColor="#F042FF" />
                </linearGradient>
                <linearGradient id="grad2Badge" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE5F1" />
                  <stop offset="50%" stopColor="#F042FF" />
                  <stop offset="100%" stopColor="#7226FF" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="url(#grad2Badge)" stroke="url(#gradient4Border)" strokeWidth="3.5" />
              <text className="font-display font-black text-[7.5px] uppercase fill-white">
                <textPath href="#circlePath" startOffset="0%">
                  {heroConfig.circularBadgeText || "★ DIGITAL PHOTO STUDIO ★ K-POP FRAMES ★ DIGITAL DOWNLOADS ★ PREMIUM PRINTS ★"}
                </textPath>
              </text>
            </svg>
            <div className="z-10 w-11 h-11 bg-[#010030] rounded-full flex items-center justify-center border border-white/40 hover:bg-[#160078] transition-colors shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* FLOATING COLLAGE OF REFINED GLASSMORPHIC CARDS */}
        <div className="relative w-full max-w-4xl min-h-[480px] flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 z-20 mt-4">
          
          {/* CARD 1: @wonyoung Photo Strip Mockup */}
          <div 
            ref={card1Ref} 
            className="p-4 w-[230px] sm:w-[260px] md:-mr-6 flex flex-col gap-3 rotate-[-2deg] md:rotate-[-4deg] relative z-20 group"
          >
            <div className="absolute inset-0 rounded-[28px] bg-[#160078]/50 backdrop-blur-xl border border-white/20 -z-10 pointer-events-none shadow-[0_20px_50px_rgba(1,0,48,0.5)] transition-all duration-400 group-hover:border-[#F042FF]/50" />
            
            <div className="w-8 h-1.5 bg-white/20 rounded-full mx-auto" />
            <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 flex flex-col gap-2.5">
              <div className="aspect-[4/3] bg-[#010030] rounded-lg overflow-hidden border border-white/10 relative">
                <img 
                  src={heroConfig.card1Photo1 || "/img/poses/Wonyoung1.png"} 
                  alt="Hero Card 1 Photo 1" 
                  className="w-full h-full object-cover brightness-110"
                  onError={(e) => { e.target.src = "/img/poses/Wonyoung1.png"; }}
                />
                <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-[#F042FF] to-[#7226FF] text-white text-[8px] font-mono font-black px-1.5 py-0.5 rounded-sm">
                  {heroConfig.card1Tag || "KPOP_01"}
                </div>
              </div>
              <div className="aspect-[4/3] bg-[#010030] rounded-lg overflow-hidden border border-white/10 relative">
                <img 
                  src={heroConfig.card1Photo2 || "/img/poses/Wonyoung2.png"} 
                  alt="Hero Card 1 Photo 2" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/img/poses/Wonyoung2.png"; }}
                />
                <div className="absolute bottom-1.5 right-1.5 text-[#FFE5F1] text-[8px] font-mono">
                  [REC ●]
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <div>
                <span className="font-display font-black text-xs text-white tracking-wide block uppercase">
                  {heroConfig.card1Handle || "@wonyoung"}
                </span>
                <span className="font-mono text-[9px] text-[#FFE5F1] uppercase tracking-widest">
                  {heroConfig.card1Subhandle || "★ IDOL EDITION"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F042FF] to-[#7226FF] flex items-center justify-center border border-white/30 shadow-[0_4px_12px_rgba(240,66,255,0.4)]">
                <Heart className="w-3.5 h-3.5 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* CARD 2: Central Content Glassmorphism Card */}
          <div 
            ref={card2Ref} 
            className="p-6 sm:p-8 w-full max-w-[340px] sm:max-w-[420px] flex flex-col items-center text-center gap-6 relative z-30 scale-100 md:scale-105 group"
          >
            <div className="absolute inset-0 rounded-[32px] bg-[#160078]/60 backdrop-blur-2xl border border-white/30 -z-10 pointer-events-none shadow-[0_30px_70px_rgba(1,0,48,0.6)] transition-all duration-400 group-hover:border-[#F042FF]/60" />
            
            <div className="bg-[#0e0048] text-[#FFE5F1] font-mono font-bold text-xs tracking-widest px-4 py-1.5 rounded-full border border-[#2e109d] shadow-sm uppercase">
              {heroConfig.eyebrowBadge || "✦ DIGITAL SELF-PHOTO STUDIO ✦"}
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-none uppercase">
                {(() => {
                  const headlineText = heroConfig.headline || "DIGITAL PHOTO BOOTH";
                  const parts = headlineText.split(" ");
                  if (parts.length > 1) {
                    const mid = Math.ceil(parts.length / 2);
                    const firstPart = parts.slice(0, mid).join(" ");
                    const secondPart = parts.slice(mid).join(" ");
                    return (
                      <>
                        {firstPart} <br />
                        <span className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] bg-clip-text text-transparent">
                          {secondPart}
                        </span>
                      </>
                    );
                  }
                  return headlineText;
                })()}
              </h2>
              <p className="font-sans text-xs md:text-sm text-zinc-200 mt-2 leading-relaxed">
                {heroConfig.subheadline || "Capture studio-quality photo strips directly from your browser. Personalize your prints with flexible frame layouts, curated event themes, digital stamps, and high-resolution exports."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button 
                onClick={() => navigate(heroConfig.ctaLink || "/welcome")}
                className="snpshot-btn-primary flex-1 flex items-center justify-center gap-2 text-sm font-mono font-bold tracking-wider py-3 px-6 shadow-md"
              >
                <span>{heroConfig.ctaText || "START BOOTH"}</span>
                <ArrowRight className="w-4 h-4 text-[#FFE5F1]" />
              </button>
            </div>

            <div className="flex justify-around w-full border-t border-white/15 pt-4 font-mono text-[10px] text-zinc-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F042FF] animate-pulse" />
                <span>{heroConfig.statusText || "ONLINE STUDIO ACTIVE"}</span>
              </div>
              <div>|</div>
              <div>{heroConfig.photosCountText || "244,195 PHOTOS TAKEN"}</div>
            </div>
          </div>

          {/* CARD 3: @its.baseclub Photo Strip Mockup */}
          <div 
            ref={card3Ref} 
            className="p-4 w-[220px] sm:w-[250px] md:-ml-6 flex flex-col gap-3 rotate-[3deg] md:rotate-[6deg] relative z-20 group"
          >
            <div className="absolute inset-0 rounded-[28px] bg-[#160078]/50 backdrop-blur-xl border border-white/20 -z-10 pointer-events-none shadow-[0_20px_50px_rgba(1,0,48,0.5)] transition-all duration-400 group-hover:border-[#F042FF]/50" />
            
            <div className="flex items-center gap-3 px-1 mb-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FFE5F1] via-[#F042FF] to-[#7226FF] border border-white/40 flex items-center justify-center font-display font-black text-xs text-white">
                S
              </div>
              <div>
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider leading-none">
                   {heroConfig.card3Title || "SNPSHOT STUDIO"}
                </h4>
                <span className="font-mono text-[9px] text-zinc-300">{heroConfig.card3Subtitle || "Official Partner"}</span>
              </div>
            </div>
            
            <div className="bg-black/30 p-2 rounded-xl border border-white/10 flex flex-col gap-2">
              <div className="aspect-square rounded-lg bg-[#010030] overflow-hidden relative border border-white/5">
                <img 
                  src={heroConfig.card3Photo || "/img/poses/Wonyoung3.png"} 
                  alt="Hero Card 3 Photo" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/img/poses/Wonyoung3.png"; }}
                />
                <div className="absolute top-2 right-2 bg-[#010030]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-mono text-[8px] text-[#FFE5F1]">
                  {heroConfig.card3Stat || "98.4K DOWNLOADS"}
                </div>
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                <span>{heroConfig.card3Theme || "THEME: PURPLE_NEON"}</span>
                <span className="text-[#FFE5F1]">★ PRESET</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono border-t border-white/10 pt-3 text-zinc-200">
              <span>PRINTS SAVED:</span>
              <span className="text-[#F042FF] font-black">{heroConfig.card3Prints || "✦ 15 STRIPS"}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default HeroSection;
