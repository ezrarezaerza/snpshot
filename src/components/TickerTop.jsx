import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";

const TickerTop = () => {
  const tickerContentRef = useRef(null);
  const [marqueeItems, setMarqueeItems] = useState([
    {
      id: "default-1",
      badge: "★ DIGITAL SELF-PHOTO BOOTH ★",
      text: "CUSTOM DIGITAL STAMPS • ✦ HIGH-RES PRINTS ✦ • STUDIO QUALITY FILTERS • ★ INSTANT DOWNLOADS ★"
    }
  ]);

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const res = await axios.get("/api/creator/marquee");
        if (res.data && Array.isArray(res.data.marqueeItems)) {
          // Filter for active items assigned to the top ticker or both
          const topActiveItems = res.data.marqueeItems.filter(
            item => item.active !== false && (item.placement === "top" || item.placement === "both" || !item.placement)
          );
          if (topActiveItems.length > 0) {
            setMarqueeItems(topActiveItems);
          } else {
            const anyActive = res.data.marqueeItems.filter(item => item.active !== false);
            if (anyActive.length > 0) setMarqueeItems(anyActive);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch marquee items, using fallback:", err);
      }
    };
    fetchMarquee();
  }, []);

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
  }, [marqueeItems]);

  return (
    <div className="bg-[#160078] border-y border-[#2d129d] py-4 overflow-hidden relative z-20 flex whitespace-nowrap shadow-[0_4px_20px_rgba(1,0,48,0.5)]">
      <div ref={tickerContentRef} className="flex gap-16 text-[#FFE5F1] font-display font-black text-2xl md:text-3xl uppercase tracking-wider select-none pointer-events-none">
        <div className="flex gap-16 shrink-0 items-center">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`rep1-${item.id || idx}`}>
              {item.badge && (
                <span className="text-[#F042FF] drop-shadow-[0_0_12px_rgba(240,66,255,0.4)]">
                  {item.badge}
                </span>
              )}
              <span className="text-white">{item.text}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="flex gap-16 shrink-0 items-center">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`rep2-${item.id || idx}`}>
              {item.badge && (
                <span className="text-[#F042FF] drop-shadow-[0_0_12px_rgba(240,66,255,0.4)]">
                  {item.badge}
                </span>
              )}
              <span className="text-white">{item.text}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerTop;
