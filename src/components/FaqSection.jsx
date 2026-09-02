import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

const FaqSection = () => {
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
    const fetchFaqs = async () => {
      try {
        const res = await axios.get("/api/creator/website-content");
        if (res.data && res.data.websiteContent && Array.isArray(res.data.websiteContent.faqs)) {
          if (res.data.websiteContent.faqs.length > 0) {
            setFaqs(res.data.websiteContent.faqs);
            setOpenFaqId(res.data.websiteContent.faqs[0].id);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch FAQs, using fallback:", err);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (id) => {
    setOpenFaqId(prev => (prev === id ? null : id));
  };

  return (
    <section className="px-6 py-16 relative z-10 bg-[#FAF6F9] text-[#010030] border-t border-[#160078]/10">
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#160078] via-[#7226FF] to-[#F042FF] text-white font-display font-black text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-3 shadow-[0_4px_14px_rgba(22,0,120,0.2)] border border-white/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>✦ FREQUENTLY ASKED QUESTIONS ✦</span>
          </div>
          <h3 className="font-display font-black text-3xl md:text-4xl text-[#010030] uppercase tracking-tight">
            EVERYTHING YOU NEED <span className="bg-gradient-to-r from-[#F042FF] via-[#7226FF] to-[#160078] bg-clip-text text-transparent">TO KNOW</span>
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#160078]/80 max-w-lg mx-auto mt-2 font-medium">
            Got questions about print resolution, camera permissions, or custom collaboration frames?
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div 
                key={faq.id || idx}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isOpen ? "border-[#7226FF] shadow-md ring-1 ring-[#7226FF]/20" : "border-[#160078]/15 hover:border-[#160078]/30"
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-display font-bold text-sm sm:text-base text-[#010030] uppercase tracking-wide flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[#f0ecf8] text-[#7226FF] font-mono text-xs font-black flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? "bg-[#7226FF] text-white rotate-180" : "bg-[#f4f2f8] text-[#010030]"
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 border-t border-[#f0ebf7]">
                    <p className="font-sans text-xs sm:text-sm text-[#4a4365] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FaqSection;
