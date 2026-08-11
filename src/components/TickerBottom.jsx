import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const TickerBottom = () => {
  const bottomTickerContentRef = useRef(null);

  useEffect(() => {
    let bottomTickerX = 0;
    const updateBottomTicker = (time, deltaTime) => {
      const deltaSec = deltaTime / 1000;
      const baseSpeed = 80; 
      bottomTickerX += baseSpeed * deltaSec;
      
      const bottomTickerContent = bottomTickerContentRef.current;
      if (bottomTickerContent) {
        const halfWidth = bottomTickerContent.scrollWidth / 2;
        if (bottomTickerX >= 0) {
          bottomTickerX -= halfWidth;
        } else if (bottomTickerX < -halfWidth) {
          bottomTickerX += halfWidth;
        }
        gsap.set(bottomTickerContent, { x: bottomTickerX });
      }
    };
    gsap.ticker.add(updateBottomTicker);

    return () => {
      gsap.ticker.remove(updateBottomTicker);
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] border-y border-white/30 py-4 overflow-hidden relative z-20 flex whitespace-nowrap shadow-[0_-4px_20px_rgba(240,66,255,0.4)]">
      <div ref={bottomTickerContentRef} className="flex gap-16 text-white font-display font-black text-2xl md:text-3xl uppercase tracking-wider select-none pointer-events-none">
        <div className="flex gap-16 shrink-0 items-center">
          <span>★ STRIKE A POSE ★</span>
          <span className="text-[#010030] bg-white px-3 py-1 border border-white/40 rounded-full inline-block rotate-1 shadow-sm">WONYOUNG STYLE</span>
          <span>✦ UNLEASH YOUR ERA ✦</span>
          <span className="text-[#010030]">AURA +999 GUARANTEED</span>
          <span>★ SNAP SAVE SHARE ★</span>
        </div>
        <div className="flex gap-16 shrink-0 items-center">
          <span>★ STRIKE A POSE ★</span>
          <span className="text-[#010030] bg-white px-3 py-1 border border-white/40 rounded-full inline-block rotate-1 shadow-sm">WONYOUNG STYLE</span>
          <span>✦ UNLEASH YOUR ERA ✦</span>
          <span className="text-[#010030]">AURA +999 GUARANTEED</span>
          <span>★ SNAP SAVE SHARE ★</span>
        </div>
      </div>
    </div>
  );
};

export default TickerBottom;
