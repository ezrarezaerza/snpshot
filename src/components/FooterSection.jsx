import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

const FooterSection = () => {
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
            © 2026 SNPSHOT VIBES. ALL RIGHTS RESERVED.
          </p>
        </div>

        {/* NAVIGATION ACTIONS */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link 
            to="/creator" 
            className="font-mono text-xs font-bold text-white uppercase tracking-wider bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] border border-white/40 px-5 py-2.5 rounded-full shadow-[0_4px_16px_rgba(22,0,120,0.25)] hover:shadow-[0_6px_22px_rgba(240,66,255,0.35)] hover:scale-105 transition-all duration-200"
          >
            ✦ [ CREATOR PORTAL ] ✦
          </Link>
          <Link 
            to="/privacy-policy" 
            className="font-mono text-xs font-bold text-[#010030] uppercase tracking-wider hover:text-[#7226FF] hover:border-[#7226FF] hover:bg-white bg-white/80 border border-[#160078]/20 px-5 py-2.5 rounded-full shadow-sm transition-all duration-200"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/contact" 
            className="font-mono text-xs font-bold text-[#010030] uppercase tracking-wider hover:text-[#7226FF] hover:border-[#7226FF] hover:bg-white bg-white/80 border border-[#160078]/20 px-5 py-2.5 rounded-full shadow-sm transition-all duration-200"
          >
            Contact Support
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default FooterSection;
