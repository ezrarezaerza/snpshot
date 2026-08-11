import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navbar from "./Navbar";

// Modular Section Components
import HeroSection from "./HeroSection";
import TickerTop from "./TickerTop";
import ShowcaseSection from "./ShowcaseSection";
import GallerySection from "./GallerySection";
import FeaturesSection from "./FeaturesSection";
import PipelineSection from "./PipelineSection";
import TickerBottom from "./TickerBottom";
import FooterSection from "./FooterSection";

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const tunerConfig = {
  heroTextStagger: 0.04,
  heroTextFrom: "random",
  heroTextEase: "back.out(2.2)",
  heroCardsStagger: 0.2,
  heroCardsEase: "back.out(1.5)",
  heroCardsDuration: 1.5,
  scrollRevealDuration: 0.8,
  scrollRevealEase: "back.out(1.2)",
  gridOverlayOpacity: 0.55
};

const Home = () => {
  useEffect(() => {
    // Synchronize GSAP ScrollTrigger with global Lenis smooth scroll
    if (window.lenis) {
      window.lenis.on("scroll", ScrollTrigger.update);
    }
    return () => {
      if (window.lenis) {
        window.lenis.off("scroll", ScrollTrigger.update);
      }
    };
  }, []);

  return (
    <div id="home-root-container" className="web3-home-container min-h-screen relative overflow-x-hidden selection:bg-[#F042FF] selection:text-white">
      <div className="web3-grid-overlay" style={{ opacity: tunerConfig.gridOverlayOpacity }} />
      <Navbar />
      
      <div id="content" className="content pt-16">
        {/* 1. HERO SECTION */}
        <HeroSection tunerConfig={tunerConfig} />

        {/* 2. INFINITE TICKER BAND (TOP) */}
        <TickerTop />

        {/* 3. SHOWCASE SECTION */}
        <ShowcaseSection tunerConfig={tunerConfig} />

        {/* 4. GALLERY SECTION */}
        <GallerySection tunerConfig={tunerConfig} />

        {/* 5. FEATURES SECTION */}
        <FeaturesSection tunerConfig={tunerConfig} />

        {/* 6. PIPELINE SECTION */}
        <PipelineSection tunerConfig={tunerConfig} />

        {/* 7. INFINITE TICKER BAND (BOTTOM) */}
        <TickerBottom />

        {/* 8. FOOTER SECTION */}
        <FooterSection />
      </div>
    </div>
  );
};

export default Home;
