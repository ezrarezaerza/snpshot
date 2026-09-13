# SNPSHOT Studio 📸✨
### *Modern Web-Based Digital Self-Photo Booth & Canvas Suite*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-white.svg)](https://expressjs.com/)

**SNPSHOT Studio** is a full-stack digital self-photo booth and canvas editing suite. Designed for photography enthusiasts and creators, SNPSHOT brings Korean-style photo booth culture directly into the browser with real-time WebRTC camera capture, aesthetic filters, custom frames, digital stamps, and crisp 300 DPI composite print exports.

---

## ⚡ Key Features

### 1. Multi-Format Photostrip Layouts
- **Vertical 3-Strip (`3-grid`)**: Spacious vertical cuts with wide borders for portraits and fashion poses.
- **Classic 4-Strip (`4-grid`)**: The iconic Korean 4-cut photostrip with customizable margins and date stamps.
- **2x2 Square Grid (`2x2`)**: Balanced four-window square format tailored for social media and polaroid aesthetics.
- **2x3 Postcard Layout (`3x2`)**: Generous 6-cut landscape postcard accommodating group shots and special memories.
- **Artist Campaigns**: Exclusive celebrity collaborations, idol pose guides, and themed collector frames.

### 2. Studio-Grade WebRTC Camera Capture
- **Real-Time Video Feed**: In-browser mirrored camera capture with live filter previewing.
- **Configurable Countdown**: Visual countdown timer (3s to 10s) with synthesized audio cues.
- **Audio Synthesizer**: Zero-latency Web Audio API shutter clicks, countdown beeps, and success chimes.
- **Ghost Pose Guides**: Visual pose guide overlays for effortless framing and idol-inspired poses.
- **Live Filmstrip Roll**: Instant review of captured shots with slot-by-slot re-take capabilities.

### 3. Comprehensive Canvas Studio & Decoration Suite
- **Studio Aesthetic Filters**: Normal, Warm Grain, Pastel Glow, Cinematic Film, Monochrome Noir, Cyberpunk Neon.
- **Themed Frame Overlays**: PNG overlays, vector borders, SVG accents, and custom gradient backgrounds.
- **Digital Stamps & Stickers**: Freely placeable, draggable, resizable, and rotatable aesthetic stickers.
- **Freehand Brush & Doodles**: Custom color palette, adjustable stroke widths, and undo/clear controls.
- **Personalized Inscriptions**: Custom typography, date watermarks, and event timestamps.

### 4. High-Resolution Print Export & Delivery
- **300 DPI Print Upscaling**: Composite canvas rendering optimized for crisp physical photo printing.
- **Direct PNG Download**: Instant client-side download without watermarking.
- **Instant Email Dispatch**: Send high-resolution photostrips directly to inboxes with Nodemailer integration.
- **Community Gallery**: Share creations to the public community showcase with moderation controls.

### 5. Studio Operating System (Admin Dashboard)
A complete 10-module back-office suite accessible at `/admin`:
1. **Frame Layouts Manager**: Create and toggle frame styles, dimensions, and aspect ratios.
2. **Artist Campaigns Studio**: Manage creator partnerships and celebrity pose guide sets.
3. **Digital Stamps Manager**: Upload and categorize aesthetic PNG stickers and icons.
4. **Community Gallery Moderation**: Review user-submitted photostrips and feature top creations.
5. **Showcase & Themes**: Configure homepage cards, gradient backdrops, and active badges.
6. **Filters & Canvas Shader**: Fine-tune CSS shader parameters (brightness, contrast, sepia, hue-rotate).
7. **Website Content & Tickers**: Edit live headlines, announcements, and infinite marquee banners.
8. **Inquiries & CRM**: Track customer booking requests, collaborations, and resolution status.
9. **Analytics & Metrics**: Monitor layout usage, capture volume, and export statistics.
10. **System & Storage Settings**: Test Vercel Blob connections, manage storage, and set camera countdowns.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Vite |
| **Styling** | Tailwind CSS v4, Lucide React Icons, Custom Web3/Y2K CSS Utilities |
| **Motion & Animation** | GSAP (ScrollTrigger, FLIP animations), Lenis Smooth Scroll |
| **Canvas & Media** | HTML5 Canvas 2D Context, WebRTC API, Web Audio API Synthesizer |
| **Backend & API** | Node.js (ES Modules), Express (`server.js`) |
| **Storage Architecture** | Dual-mode: Vercel Blob Cloud Storage (`@vercel/blob`) with Local Filesystem Fallback |
| **Delivery & Mail** | Nodemailer with responsive HTML photostrip email templates |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A modern web browser with camera permissions enabled (Chrome, Safari, Firefox, Edge)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/snpshot.git
   cd snpshot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Application Routes

| Path | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page featuring GSAP parallax hero, infinite tickers, showcase cards, and community feed |
| `/setup` | `Welcome.jsx` | Onboarding wizard to select photostrip formats, themes, and artist campaigns |
| `/photobooth` | `PhotoBooth.jsx` | WebRTC live camera capture booth with countdown cues and pose guides |
| `/preview` | `PhotoPreview.jsx` | Canvas customization studio: frame tuning, filters, stickers, brush, and 300 DPI exports |
| `/contact` | `Contact.jsx` | Studio booking inquiries, artist collaboration submissions, and feedback |
| `/privacy-policy` | `PrivacyPolicy.jsx` | Biometric privacy disclosure, local media retention terms, and FAQs |
| `/admin` | `AdminDashboard.jsx` | 10-module comprehensive Studio OS for real-time asset and content management |

---

## 🔒 Privacy & Media Handling

- **Camera Feed**: Video streams are processed purely within the user's browser using the WebRTC API. No raw camera feed is ever transmitted or recorded remotely without user consent.
- **Session Privacy**: Captured snapshots stay in client-side memory during editing. Media is only uploaded when users explicitly choose to dispatch via email or publish to the Community Gallery.

---

## 📜 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

© 2026 **SNPSHOT Studio**. Designed & engineered for modern digital photography.
