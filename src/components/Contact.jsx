import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';
import { Link } from 'react-router-dom';
import { Mail, Send, User, Sparkles, MessageSquare } from 'lucide-react';
import Navbar from './Navbar';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Sending message...');
    try {
      const BACKEND_URL = "";
      const res = await axios.post(`${BACKEND_URL}/send-message`, formData, {
        withCredentials: true
      });
      if (res.status === 200) {
        setStatus('Success: Message received!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Error: Something went wrong. Try again.');
      }
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
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
          <div className="y2k-subtitle mb-2">✦ TRANSMISSION TERMINAL ✦</div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            GET IN
            <div className="y2k-highlight ml-2">TOUCH</div>
          </h1>
        </div>

        <div className="web3-glass-card p-6 md:p-8 bg-zinc-950/90 border-zinc-800">
          <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-900 font-mono text-[10px] text-zinc-500">
            <span>CREATOR CONTACT</span>
            <span>ONLINE</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#F042FF]" /> Sender Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="ENTER YOUR FULL NAME..."
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900/50 text-white font-mono placeholder-zinc-600 text-sm py-2.5 px-4"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#F042FF]" /> Your Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="ENTER YOUR EMAIL ADDRESS..."
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900/50 text-white font-mono placeholder-zinc-600 text-sm py-2.5 px-4"
              />
            </div>

            {/* Message input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#F042FF]" /> Your Message
              </label>
              <textarea
                name="message"
                placeholder="TYPE MESSAGE HERE..."
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-zinc-900/50 text-white font-mono placeholder-zinc-600 text-sm py-2.5 px-4"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="y2k-button mt-4 flex items-center justify-center gap-2"
              style={{ padding: "12px" }}
            >
              <Send className="w-4 h-4 shrink-0" /> {isSubmitting ? "TRANSMITTING..." : "SEND MESSAGE"}
            </button>

          </form>

          {status && (
            <div className="mt-5 p-3.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-center">
              <p 
                className="font-mono text-xs uppercase tracking-widest"
                style={{
                  color: status.includes("SUCCESS") ? "#39FF14" : status.includes("SYS_ERR") ? "#FF003C" : "#FFFF00"
                }}
              >
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
