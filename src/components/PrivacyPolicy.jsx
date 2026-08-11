import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { Shield, Lock, EyeOff, CheckCircle, Database } from 'lucide-react';
import Navbar from './Navbar';

const PrivacyPolicy = () => {
  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay">
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar />

      <div id="content" className="content max-w-3xl mx-auto px-4 pt-20 pb-24 relative z-10">
        
        <div className="text-center mb-10">
          <div className="y2k-subtitle mb-2">✦ PRIVACY DEFENSE PROTOCOL ✦</div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            DATA PRIVACY
            <div className="y2k-highlight ml-2">CHARTER</div>
          </h1>
        </div>

        <div className="web3-glass-card p-6 md:p-8 bg-zinc-950/90 border-zinc-800">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-900 font-mono text-[10px] text-zinc-500">
            <span>POLICY CHARTER</span>
            <span>LAST REVISED: 2026-07-14</span>
          </div>

          <div className="flex flex-col gap-6 font-mono text-xs text-zinc-400 leading-relaxed">
            
            {/* Section 1 */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold mb-2 uppercase tracking-widest text-[11px]">
                <Shield className="w-4 h-4" /> 01 // COMMITMENT OVERVIEW
              </div>
              <p>
                At SNPSHOT, your digital safety and image integrity are strictly guaranteed. We do not track, collect, index, or parse any personal identifier information. The experience is fully local-first.
              </p>
            </div>

            {/* Section 2 */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold mb-2 uppercase tracking-widest text-[11px]">
                <EyeOff className="w-4 h-4" /> 02 // SCREEN CAPTURE RULE
              </div>
              <p>
                All captured photo-booth streams are processed inside your device's browser using client-side Canvas Rendering Context. No image frames, face coordinates, or raw pixel data are transmitted to cloud storage nodes or external telemetry engines.
              </p>
            </div>

            {/* Section 3 */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold mb-2 uppercase tracking-widest text-[11px]">
                <Database className="w-4 h-4" /> 03 // ZERO STORAGE
              </div>
              <p>
                We do not save tracking cookies, analytics identifiers, or browser fingerprints. Your session cache is completely purged immediately upon closing the workspace window node or reloading.
              </p>
            </div>

            {/* Section 4 */}
            <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-lg">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold mb-2 uppercase tracking-widest text-[11px]">
                <Lock className="w-4 h-4" /> 04 // EMAIL SHARING
              </div>
              <p>
                When utilizing our secure email sharing feature, your address is used only as a target endpoint for immediate SMTP dispatch and is never saved, distributed, or stored in any marketing lists.
              </p>
            </div>

          </div>

          {/* Secure watermark */}
          <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between font-mono text-[9px] text-zinc-600">
            <span>SECURE PROTOCOL ACTIVE</span>
            <div className="flex items-center gap-1 text-[#F042FF] font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> VERIFIED
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
