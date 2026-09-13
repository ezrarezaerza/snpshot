import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import { Link } from 'react-router-dom';
import { Mail, Send, User, Sparkles, MessageSquare, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';

const DEFAULT_SUBJECTS = [
  "General Inquiry",
  "Artist / Frame Collab",
  "Event Photo Booth Booking",
  "High-Res Print Support",
  "Press & Media"
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [subjectCategories, setSubjectCategories] = useState(DEFAULT_SUBJECTS);
  const [status, setStatus] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/creator/inquiries");
        if (res.data?.subjectCategories && Array.isArray(res.data.subjectCategories)) {
          setSubjectCategories(res.data.subjectCategories);
        }
      } catch (e) {
        // Fallback to default subjects
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubjectSelect = (subj) => {
    setFormData({ ...formData, subject: subj });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Transmitting message to studio CRM...');
    setIsSuccess(false);

    try {
      const res = await axios.post('/send-message', formData, {
        withCredentials: true
      });
      if (res.status === 200) {
        setIsSuccess(true);
        setStatus('Message received! Our studio team will review your inquiry shortly.');
        setFormData({ name: '', email: '', subject: subjectCategories[0] || 'General Inquiry', message: '' });
      } else {
        setIsSuccess(false);
        setStatus('Error: Unable to transmit message. Please try again.');
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setIsSuccess(false);
      setStatus(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay">
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar />

      <div id="content" className="content max-w-xl mx-auto px-4 pt-20 pb-24 relative z-10">
        
        <div className="text-center mb-8">
          <div className="y2k-subtitle mb-2">✦ STUDIO INQUIRIES & COLLABS ✦</div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            GET IN
            <span className="text-[#F042FF] ml-2">TOUCH</span>
          </h1>
          <p className="font-mono text-xs text-zinc-400 mt-2">
            Artist frame collabs, event photo booth station bookings, and high-res print assistance.
          </p>
        </div>

        <div className="web3-glass-card p-6 md:p-8 bg-[#010030]/90 border-[#2e109d] rounded-2xl shadow-[0_20px_60px_rgba(1,0,48,0.8)]">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-[#2e109d]/60 font-mono text-[10px] text-zinc-400">
            <span className="text-[#F042FF] font-bold">SNPSHOT CRM DISPATCH</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE ONLINE
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest flex items-center gap-1 font-bold">
                <User className="w-3.5 h-3.5 text-[#F042FF]" /> Sender Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="ENTER YOUR FULL NAME..."
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0e0048]/80 text-white font-mono placeholder-zinc-500 text-sm py-2.5 px-4 rounded-xl border border-[#2e109d] focus:border-[#F042FF] outline-none"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest flex items-center gap-1 font-bold">
                <Mail className="w-3.5 h-3.5 text-[#F042FF]" /> Email Address *
              </label>
              <input
                type="email"
                name="email"
                placeholder="ENTER YOUR EMAIL ADDRESS..."
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0e0048]/80 text-white font-mono placeholder-zinc-500 text-sm py-2.5 px-4 rounded-xl border border-[#2e109d] focus:border-[#F042FF] outline-none"
              />
            </div>

            {/* Subject Selector Chips */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest flex items-center gap-1 font-bold">
                <Tag className="w-3.5 h-3.5 text-[#F042FF]" /> Inquiry Category
              </label>
              <div className="flex flex-wrap gap-2">
                {subjectCategories.map((cat) => {
                  const isSelected = formData.subject === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSubjectSelect(cat)}
                      className={isSelected ? "btn-filter-pill-active" : "btn-filter-pill"}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-300 uppercase tracking-widest flex items-center gap-1 font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-[#F042FF]" /> Your Message *
              </label>
              <textarea
                name="message"
                placeholder="Describe your event booking details, collaboration concept, or question..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-[#0e0048]/80 text-white font-mono placeholder-zinc-500 text-sm py-2.5 px-4 rounded-xl border border-[#2e109d] focus:border-[#F042FF] outline-none resize-y"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-studio-primary mt-4 py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer w-full"
            >
              <Send className="w-4 h-4 shrink-0" /> 
              <span>{isSubmitting ? "TRANSMITTING..." : "SUBMIT INQUIRY"}</span>
            </button>

          </form>

          {status && (
            <div className={`mt-5 p-4 rounded-xl text-center border flex items-center justify-center gap-2 ${
              isSuccess 
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                : status.includes("Error") 
                  ? "bg-rose-950/60 border-rose-500/50 text-rose-300"
                  : "bg-purple-950/60 border-purple-500/50 text-purple-200"
            }`}>
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-[#F042FF] shrink-0" />
              )}
              <p className="font-mono text-xs uppercase tracking-wider">
                {status}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Contact;
