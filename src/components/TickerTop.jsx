import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const TickerTop = () => {
  const tickerContentRef = useRef(null);

  useEffect(() => {
    let tickerX = 0;
    const updateTicker = (time, deltaTime) => {
      const deltaSec = deltaTime / 1000;
      const baseSpeed = -80; 
      tickerX += baseSpeed * deltaSec;
      
      const tickerContent = tickerContentRef.current;
      if (tickerContent) {
        const halfWidth = tickerContent.scrollWidth / 2;
        if (tickerX <= -halfWidth) {
          tickerX += halfWidth;
        } else if (tickerX > 0) {
          tickerX -= halfWidth;
        }
        gsap.set(tickerContent, { x: tickerX });
      }
    };
    gsap.ticker.add(updateTicker);

    return () => {
      gsap.ticker.remove(updateTicker);
    };
  }, []);

  return (
    <div className="bg-[#160078]/80 backdrop-blur-md border-y border-white/20 py-4 overflow-hidden relative z-20 flex whitespace-nowrap shadow-[0_4px_20px_rgba(1,0,48,0.5)]">
      <div ref={tickerContentRef} className="flex gap-16 text-[#FFE5F1] font-display font-black text-2xl md:text-3xl uppercase tracking-wider select-none pointer-events-none">
        <div className="flex gap-16 shrink-0 items-center">
          <span>★ VIBE CHECK OVERFLOW ★</span>
          <span className="text-white">CUTE STAMPS DAILY</span>
          <span>✦ SNPSHOT CO-POSE ✦</span>
          <span className="text-white">AESTHETIC UPGRADE</span>
          <span>★ CHOOSE YOUR ERA ★</span>
        </div>
        <div className="flex gap-16 shrink-0 items-center">
          <span>★ VIBE CHECK OVERFLOW ★</span>
          <span className="text-white">CUTE STAMPS DAILY</span>
          <span>✦ SNPSHOT CO-POSE ✦</span>
          <span className="text-white">AESTHETIC UPGRADE</span>
          <span>★ CHOOSE YOUR ERA ★</span>
        </div>
      </div>
    </div>
  );
};

export default TickerTop;
