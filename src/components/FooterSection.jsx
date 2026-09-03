import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Camera, Globe, Share2, Sparkles, Send } from "lucide-react";

const FooterSection = () => {
  const [content, setContent] = useState({
    brandName: "SNPSHOT Studio",
    tagline: "Digital Self-Photo Booth & High-Res Photostrip Studio",
    copyrightText: "© 2026 SNPSHOT VIBES. ALL RIGHTS RESERVED.",
    contactEmail: "hello@snpshot.studio",
    socials: {
      instagram: "https://instagram.com/snpshot.studio",
      tiktok: "https://tiktok.com/@snpshot.studio",
      twitter: "https://twitter.com/snpshotstudio",
      youtube: "https://youtube.com/@snpshotstudio"
    }
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get("/api/creator/website-content");
        if (res.data && res.data.websiteContent) {
          setContent(prev => ({ ...prev, ...res.data.websiteContent }));
        }
      } catch (err) {
        console.warn("Failed to fetch footer content, using defaults:", err);
      }
    };
    fetchContent();
  }, []);

  return (
    <footer className="bg-[#FAF6F9] text-[#010030] border-t border-[#160078]/15 py-12 md:py-16 relative z-10 mt-0">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* BRAND & COPYRIGHT INFO */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#160078] via-[#7226FF] to-[#F042FF] rounded-full border border-white/50 flex items-center justify-center shadow-[0_4px_14px_rgba(22,0,120,0.2)]">
              <Camera className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-[#010030]">
              SN<span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">PSHOT</span>
            </span>
          </div>

          <p className="font-mono text-[11px] font-bold text-[#160078]/80 uppercase tracking-widest text-center md:text-left">
            {content.copyrightText || "© 2026 SNPSHOT VIBES. ALL RIGHTS RESERVED."}
          </p>

          {/* SOCIAL LINKS */}
          {content.socials && (
            <div className="flex items-center gap-2.5 mt-1">
              {content.socials.instagram && (
                <a 
                  href={content.socials.instagram} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-full bg-white border border-[#160078]/15 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#7226FF] hover:text-[#F042FF] hover:border-[#F042FF] transition-all shadow-xs"
                  aria-label="Instagram"
                >
                  <Sparkles className="w-3.5 h-3.5" /> IG
                </a>
              )}
              {content.socials.tiktok && (
                <a 
                  href={content.socials.tiktok} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-full bg-white border border-[#160078]/15 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#7226FF] hover:text-[#F042FF] hover:border-[#F042FF] transition-all shadow-xs"
                  aria-label="TikTok"
                >
                  <Share2 className="w-3.5 h-3.5" /> TT
                </a>
              )}
              {content.socials.twitter && (
                <a 
                  href={content.socials.twitter} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-full bg-white border border-[#160078]/15 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#7226FF] hover:text-[#F042FF] hover:border-[#F042FF] transition-all shadow-xs"
                  aria-label="Twitter / X"
                >
                  <Globe className="w-3.5 h-3.5" /> X
                </a>
              )}
            </div>
          )}
        </div>

        {/* NAVIGATION ACTIONS */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link 
            to="/welcome" 
            className="btn-studio-primary font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 shadow-[0_4px_16px_rgba(22,0,120,0.25)]"
          >
            ✦ LAUNCH PHOTOBOOTH ✦
          </Link>
          <Link 
            to="/privacy-policy" 
            className="btn-studio-secondary font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/contact" 
            className="btn-studio-secondary font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default FooterSection;
