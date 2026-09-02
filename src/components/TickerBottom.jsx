import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";

const TickerBottom = () => {
  const bottomTickerContentRef = useRef(null);
  const [marqueeItems, setMarqueeItems] = useState([
    {
      id: "default-bottom-1",
      badge: "★ STRIKE A POSE ★",
      text: "EVENT & COLLAB PRESETS • ✦ SELF PHOTO BOOTH ✦ • INSTANT DIGITAL PRINTS • ★ CAPTURE CUSTOMIZE SHARE ★"
    }
  ]);

  useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const res = await axios.get("/api/creator/marquee");
        if (res.data && Array.isArray(res.data.marqueeItems)) {
          // Filter for active items assigned to the bottom ticker or both
          const bottomActiveItems = res.data.marqueeItems.filter(
            item => item.active !== false && (item.placement === "bottom" || item.placement === "both")
          );
          if (bottomActiveItems.length > 0) {
            setMarqueeItems(bottomActiveItems);
          } else {
            // Fallback to second active item or any active item
            const anyActive = res.data.marqueeItems.filter(item => item.active !== false);
            if (anyActive.length > 1) {
              setMarqueeItems([anyActive[1]]);
            } else if (anyActive.length > 0) {
              setMarqueeItems(anyActive);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch marquee items for bottom ticker:", err);
      }
    };
    fetchMarquee();
  }, []);

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
  }, [marqueeItems]);

  return (
    <div className="bg-gradient-to-r from-[#FFE5F1] via-[#F042FF] to-[#7226FF] border-y border-white/30 py-4 overflow-hidden relative z-20 flex whitespace-nowrap shadow-[0_-4px_20px_rgba(240,66,255,0.4)]">
      <div ref={bottomTickerContentRef} className="flex gap-16 text-white font-display font-black text-2xl md:text-3xl uppercase tracking-wider select-none pointer-events-none">
        <div className="flex gap-16 shrink-0 items-center">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`bot-rep1-${item.id || idx}`}>
              <span>★ {item.badge || "FEATURED"} ★</span>
              <span className="text-[#010030] bg-white px-3 py-1 border border-white/40 rounded-full inline-block rotate-1 shadow-sm">
                {item.text}
              </span>
            </React.Fragment>
          ))}
        </div>
        <div className="flex gap-16 shrink-0 items-center">
          {marqueeItems.map((item, idx) => (
            <React.Fragment key={`bot-rep2-${item.id || idx}`}>
              <span>★ {item.badge || "FEATURED"} ★</span>
              <span className="text-[#010030] bg-white px-3 py-1 border border-white/40 rounded-full inline-block rotate-1 shadow-sm">
                {item.text}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TickerBottom;
