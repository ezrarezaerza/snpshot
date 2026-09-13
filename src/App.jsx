import "./App.css";
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";  
import Lenis from "lenis";
import Home from "./components/Home";
import Welcome from "./components/Welcome";
import PhotoBooth from "./components/PhotoBooth";
import PhotoPreview from "./components/PhotoPreview";
import PrivacyPolicy from './components/PrivacyPolicy';
import Contact from "./components/Contact";
import AdminDashboard from "./components/admin/AdminDashboard";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [capturedImages, setCapturedImages] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const routeSeo = {
      "/": {
        title: "SNPSHOT Studio",
        description: "SNPSHOT Digital Self-Photo Booth Studio — Online WebRTC photostrips, studio filters, custom frames, digital stamps, and 300 DPI prints."
      },
      "/setup": {
        title: "Layout & Theme Selection | SNPSHOT Studio",
        description: "Choose your photo strip layout: Vertical 3-Strip, Classic 4-Strip, 2x2 Square Grid, or 2x3 Postcard format with exclusive idol themes."
      },
      "/welcome": {
        title: "Layout & Theme Selection | SNPSHOT Studio",
        description: "Choose your photo strip layout: Vertical 3-Strip, Classic 4-Strip, 2x2 Square Grid, or 2x3 Postcard format with exclusive idol themes."
      },
      "/photobooth": {
        title: "Live Camera Capture Booth | SNPSHOT Studio",
        description: "Capture studio-grade portraits directly in your browser with real-time aesthetic filters, countdown cues, and ghost pose guides."
      },
      "/preview": {
        title: "Canvas Studio & Print Customization | SNPSHOT Studio",
        description: "Decorate your photostrip with studio filters, digital stamps, custom text inscriptions, and export crisp 300 DPI high-resolution prints."
      },
      "/privacy-policy": {
        title: "Privacy Policy & Biometrics | SNPSHOT Studio",
        description: "Learn how SNPSHOT Studio protects your privacy, handles camera feeds strictly in-browser, and secures your photos."
      },
      "/contact": {
        title: "Contact & Studio Bookings | SNPSHOT Studio",
        description: "Get in touch with SNPSHOT Studio for event photo booth rentals, artist collaborations, high-res print support, and press inquiries."
      },
      "/admin": {
        title: "Studio Operating System | SNPSHOT Studio Admin",
        description: "SNPSHOT Studio OS — Real-time content management, asset uploads, frame designs, filters, inquiries, and analytics."
      }
    };

    const currentSeo = routeSeo[location.pathname] || {
      title: "SNPSHOT Studio",
      description: "SNPSHOT Digital Self-Photo Booth Studio — Online WebRTC photostrips, studio filters, custom frames, digital stamps, and 300 DPI prints."
    };

    document.title = currentSeo.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", currentSeo.description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", currentSeo.title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", currentSeo.description);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", currentSeo.title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", currentSeo.description);
  }, [location.pathname]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      autoResize: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    window.lenis = lenis;

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  return (
    <div className="App">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<Welcome />} />
          <Route path="/welcome" element={<Navigate to="/setup" replace />} />
          <Route path="/photobooth" element={<PhotoBooth setCapturedImages={setCapturedImages} />} />
          <Route path="/preview" element={<PhotoPreview capturedImages={capturedImages} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;