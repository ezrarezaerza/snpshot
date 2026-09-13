import React, { useState, useEffect } from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, EyeOff, CheckCircle, Database, HelpCircle, ChevronDown, Sparkles, Printer, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';

const PrivacyPolicy = () => {
  const [faqs, setFaqs] = useState([
    {
      id: "faq-1",
      question: "How high is the resolution of exported photostrips?",
      answer: "All photostrips export at 300 DPI high-resolution canvas print quality (up to 1800px) ideal for physical printing or social sharing."
    },
    {
      id: "faq-2",
      question: "Are my photos stored privately on the server?",
      answer: "Your captured photos stay entirely inside your browser session during customization. Server exports are created only when shared to the gallery."
    },
    {
      id: "faq-3",
      question: "Can I customize frame colors and digital stamps?",
      answer: "Yes! Choose from artist collaboration frames, solid studio border colors, gradient backgrounds, and aesthetic sticker stamps."
    }
  ]);
  const [openFaqId, setOpenFaqId] = useState("faq-1");

  useEffect(() => {
    const fetchWebsiteContent = async () => {
      try {
        const res = await axios.get("/api/creator/website-content");
        if (res.data && res.data.websiteContent && Array.isArray(res.data.websiteContent.faqs)) {
          if (res.data.websiteContent.faqs.length > 0) {
            setFaqs(res.data.websiteContent.faqs);
            setOpenFaqId(res.data.websiteContent.faqs[0].id);
          }
        }
      } catch (err) {
        console.warn("Using default FAQs for privacy policy page:", err);
      }
    };
    fetchWebsiteContent();
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden selection:bg-[#F042FF] selection:text-white">
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar />

      <div id="content" className="content max-w-4xl mx-auto px-4 pt-24 pb-24 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#160078] border border-[#2d129d] text-[#F042FF] font-display font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-[0_4px_14px_rgba(22,0,120,0.4)]">
            <Shield className="w-3.5 h-3.5" />
            <span>✦ PRIVACY & FAQ PROTOCOL ✦</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
            DATA PRIVACY & <span className="bg-gradient-to-r from-[#F042FF] to-[#7226FF] bg-clip-text text-transparent">HELP CENTER</span>
          </h1>
          <p className="font-sans text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto mt-2">
            Everything you need to know about our local-first camera processing, 300 DPI high-res exports, and data security.
          </p>
        </div>

        {/* SECTION 1: PRIVACY CHARTER */}
        <div className="bg-[#050020] p-6 md:p-8 rounded-3xl border border-[#2b109e] shadow-[0_10px_40px_rgba(1,0,48,0.8)] mb-8">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#2b109e]/60 font-mono text-[10px] text-zinc-400">
            <span className="text-[#F042FF] font-bold">SNPSHOT ZERO-TELEMETRY CHARTER</span>
            <span>LAST REVISED: 2026-08-16</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs text-zinc-300">
            
            {/* Rule 1 */}
            <div className="p-4 bg-[#010030]/80 border border-[#2b109e] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold uppercase tracking-wider text-[11px]">
                <Shield className="w-4 h-4" /> 01 // LOCAL-FIRST CAMERA
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                All live video feeds and photo captures execute purely inside your browser using client-side Canvas APIs. Raw camera streams are never sent to external servers.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-4 bg-[#010030]/80 border border-[#2b109e] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold uppercase tracking-wider text-[11px]">
                <Database className="w-4 h-4" /> 02 // ZERO TRACKING STORAGE
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                We do not track cookies, analytics identifiers, or device fingerprints. Your session workspace cache is immediately cleared upon closing or reloading.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-4 bg-[#010030]/80 border border-[#2b109e] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold uppercase tracking-wider text-[11px]">
                <Printer className="w-4 h-4" /> 03 // 300 DPI PRINT GUARANTEE
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Rendered photostrips are generated directly at high-resolution 300 DPI raster specs for professional physical printing and lossless digital sharing.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-4 bg-[#010030]/80 border border-[#2b109e] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#F042FF] font-bold uppercase tracking-wider text-[11px]">
                <Lock className="w-4 h-4" /> 04 // PRIVATE DISPATCH
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                When using instant email or QR dispatch, recipient addresses are used strictly for immediate transfer and never added to marketing databases.
              </p>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-[#2b109e]/60 flex items-center justify-between font-mono text-[9px] text-zinc-500">
            <span>CLIENT CANVAS RENDERING ACTIVE</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle className="w-3.5 h-3.5" /> VERIFIED PRIVATE
            </div>
          </div>
        </div>

        {/* SECTION 2: FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <div className="bg-[#050020] p-6 md:p-8 rounded-3xl border border-[#2b109e] shadow-[0_10px_40px_rgba(1,0,48,0.8)]">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#2b109e]/60">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#F042FF]" />
              <h2 className="font-display font-bold text-lg text-white uppercase tracking-wide">
                FREQUENTLY ASKED QUESTIONS
              </h2>
            </div>
            <span className="font-mono text-[10px] text-zinc-400">
              {faqs.length} QUESTIONS ANSWERED
            </span>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div 
                  key={faq.id || idx}
                  className={`bg-[#010030]/90 rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? "border-[#F042FF] shadow-[0_4px_20px_rgba(240,66,255,0.15)] ring-1 ring-[#F042FF]/30" : "border-[#2b109e] hover:border-[#7226FF]"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display font-bold text-xs sm:text-sm text-white uppercase tracking-wide flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[#160078] text-[#F042FF] font-mono text-xs font-black flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      {faq.question}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "bg-[#F042FF] text-[#010030] rotate-180" : "bg-[#160078] text-white"
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 border-t border-[#2b109e]/40">
                      <p className="font-sans text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-4 border-t border-[#2b109e]/60 flex flex-wrap items-center justify-between gap-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Link>
            
            <Link 
              to="/setup"
              className="btn-studio-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFE5F1]" />
              <span>Launch Studio Booth</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;

