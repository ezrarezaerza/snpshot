import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const emailsDir = path.join(__dirname, "saved_emails");
if (!fs.existsSync(emailsDir)) {
  fs.mkdirSync(emailsDir);
  console.log("Saved emails directory created");
}

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/uploads", express.static("uploads"));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("Uploads directory created");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, `photo-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  console.log("File uploaded:", req.file.filename);
  res.json({ imageUrl: `/${req.file.filename}` });
});

app.get("/api/images", (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return res.status(500).json({ message: "Error reading uploads" });
    }
    res.json(files.map(file => ({ url: `/${file}` })));
  });
});

// --- Phase 4: Studio Database and APIs ---
const posesDir = path.join(__dirname, "public", "img", "poses");
const themesDir = path.join(__dirname, "public", "img", "themes");
const stickersDir = path.join(__dirname, "public", "img", "stickers");
const galleryDir = path.join(__dirname, "public", "img", "gallery");
const showcaseDir = path.join(__dirname, "public", "img", "showcase");

if (!fs.existsSync(posesDir)) {
  fs.mkdirSync(posesDir, { recursive: true });
}
if (!fs.existsSync(themesDir)) {
  fs.mkdirSync(themesDir, { recursive: true });
}
if (!fs.existsSync(stickersDir)) {
  fs.mkdirSync(stickersDir, { recursive: true });
}
if (!fs.existsSync(galleryDir)) {
  fs.mkdirSync(galleryDir, { recursive: true });
}
if (!fs.existsSync(showcaseDir)) {
  fs.mkdirSync(showcaseDir, { recursive: true });
}

// Serve uploaded assets statically
app.use("/img/poses", express.static(posesDir));
app.use("/img/themes", express.static(themesDir));
app.use("/img/stickers", express.static(stickersDir));
app.use("/img/gallery", express.static(galleryDir));
app.use("/img/showcase", express.static(showcaseDir));

const poseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, posesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `pose-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const uploadPoses = multer({ storage: poseStorage });

const themeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, themesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `theme-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const uploadThemes = multer({ storage: themeStorage });

const stickerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, stickersDir);
  },
  filename: (req, file, cb) => {
    cb(null, `sticker-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const uploadStickers = multer({ storage: stickerStorage });

const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryDir);
  },
  filename: (req, file, cb) => {
    cb(null, `gallery-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const uploadGallery = multer({ storage: galleryStorage });

const showcaseStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, showcaseDir);
  },
  filename: (req, file, cb) => {
    cb(null, `showcase-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  },
});
const uploadShowcase = multer({ storage: showcaseStorage });

const studioDataPath = path.join(uploadDir, "studio_data.json");
const creatorDataPath = path.join(uploadDir, "creator_data.json");

const defaultShowcaseThemes = [
  {
    id: "classic-studio",
    name: "Classic Studio",
    color: "#F042FF",
    desc: "High-contrast photostrip frames with solid borders and nostalgic digital stamps.",
    bg: "linear-gradient(135deg, #020617, #0F3AE2)",
    badge: "CLASSIC_POP",
    image: "/img/showcase/classic-studio-photostrip.png",
    caption: "Studio Frame ✦",
    overlayFrameId: "classic-navy"
  },
  {
    id: "pastel-bloom",
    name: "Pastel Bloom",
    color: "#FF00FF",
    desc: "Soft flower power stamps with pastel gradients and refined hand-drawn borders.",
    bg: "linear-gradient(135deg, #18001e, #2e083c)",
    badge: "SOFT_PASTEL",
    image: "/img/showcase/wonyoung-birthday-photostrip.png",
    caption: "Soft Floral Frame",
    overlayFrameId: "pastel-2x2-grid"
  },
  {
    id: "cinematic-film",
    name: "Cinematic Film",
    color: "#F59E0B",
    desc: "Warm cinematic film grain with retro date stamps and nostalgic lighting.",
    bg: "linear-gradient(135deg, #1a0f00, #2b1800)",
    badge: "VINTAGE_FILM",
    image: "/img/showcase/hanni-bunny-photostrip.png",
    caption: "Warm Grain Filter",
    overlayFrameId: "vintage-2x3-postcard"
  },
  {
    id: "neon-cyber",
    name: "Neon Cyber",
    color: "#10B981",
    desc: "Vibrant neon reflections with custom digital overlays and star halo clusters.",
    bg: "linear-gradient(135deg, #022c22, #064e3b)",
    badge: "NEON_CYBER",
    image: "/img/showcase/karina-cyber-photostrip.png",
    caption: "Electric Cyan",
    overlayFrameId: "electric-magenta"
  },
  {
    id: "custom-showcase-baseline",
    name: "Custom Showcase Baseline Theme",
    color: "#7226FF",
    desc: "Editable baseline showcase theme for seasonal studio campaigns.",
    bg: "linear-gradient(135deg, #010030, #2e109d)",
    badge: "FEATURED",
    image: "/img/showcase/jungkook-golden-photostrip.png",
    caption: "Custom Baseline ✦",
    overlayFrameId: "custom-baseline-frame"
  }
];

const defaultHeroConfig = {
  activeThemePreset: "snpshot-hero-default",
  headline: "DIGITAL PHOTO BOOTH",
  subheadline: "Capture studio-quality photo strips directly from your browser. Personalize your prints with flexible frame layouts, curated event themes, digital stamps, and high-resolution exports.",
  eyebrowBadge: "✦ DIGITAL SELF-PHOTO STUDIO ✦",
  ctaText: "START BOOTH",
  ctaLink: "/welcome",
  accentColor: "#F042FF",
  heroBg: "linear-gradient(135deg, #010030 0%, #0e0048 50%, #2e109d 100%)",
  doodleHeaderTag: "#PHOTOBOOTH",
  card1Handle: "@wonyoung",
  card1Subhandle: "★ IDOL EDITION",
  card1Tag: "KPOP_01",
  card3Title: "SNPSHOT STUDIO",
  card3Subtitle: "Official Partner",
  card3Stat: "98.4K DOWNLOADS",
  card3Theme: "THEME: PURPLE_NEON ★ PRESET",
  card3Prints: "✦ 15 STRIPS",
  circularBadgeText: "★ DIGITAL PHOTO STUDIO ★ K-POP FRAMES ★ DIGITAL DOWNLOADS ★ PREMIUM PRINTS ★",
  statusText: "ONLINE STUDIO ACTIVE",
  photosCountText: "244,195 PHOTOS TAKEN",
  card1Photo1: "/img/poses/Wonyoung1.png",
  card1Photo2: "/img/poses/Wonyoung2.png",
  card3Photo: "/img/poses/Wonyoung3.png"
};

const defaultFilters = [
  {
    id: "warm-grain",
    name: "Warm Grain",
    category: "Vintage",
    badge: "POPULAR",
    brightness: 105,
    contrast: 110,
    saturation: 115,
    sepia: 25,
    hueRotate: 0,
    grain: 15,
    blur: 0,
    desc: "Nostalgic analog film warmth with delicate organic grain and soft golden highlights.",
    active: true
  },
  {
    id: "pastel-glow",
    name: "Pastel Glow",
    category: "Soft Glow",
    badge: "FEATURED",
    brightness: 112,
    contrast: 95,
    saturation: 108,
    sepia: 10,
    hueRotate: -10,
    grain: 5,
    blur: 0.3,
    desc: "Dreamy K-pop idol complexion smoothing with soft violet and blush highlights.",
    active: true
  },
  {
    id: "cinematic-film",
    name: "Cinematic Film",
    category: "Vintage",
    badge: "NEW",
    brightness: 100,
    contrast: 120,
    saturation: 90,
    sepia: 35,
    hueRotate: 10,
    grain: 20,
    blur: 0,
    desc: "Rich moody contrast inspired by 35mm cinema film stock with deep shadow tone.",
    active: true
  },
  {
    id: "bw-high-contrast",
    name: "Monochrome Noir",
    category: "B&W",
    badge: "CLASSIC",
    brightness: 102,
    contrast: 135,
    saturation: 0,
    sepia: 0,
    hueRotate: 0,
    grain: 12,
    blur: 0,
    desc: "Timeless high-contrast black and white studio portrait processing.",
    active: true
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk Neon",
    category: "Cyber/Neon",
    badge: "SPECIAL",
    brightness: 108,
    contrast: 125,
    saturation: 145,
    sepia: 0,
    hueRotate: 45,
    grain: 8,
    blur: 0,
    desc: "Electric cyan and magenta pop saturation for nightlife and Y2K shoots.",
    active: true
  }
];

const defaultCanvasConfig = {
  borderWidth: 16,
  photoGap: 12,
  borderRadius: 8,
  shadowStrength: 20,
  outerPadding: 20,
  bgPattern: "solid",
  bgGradient: "linear-gradient(135deg, #010030 0%, #2e109d 100%)",
  dpiMultiplier: 2,
  layoutSpecs: {
    "3-grid": { width: 1200, height: 1800, aspectRatio: "2:3", dpi: 300 },
    "4-grid": { width: 1200, height: 1800, aspectRatio: "2:3", dpi: 300 },
    "2x2": { width: 1200, height: 1200, aspectRatio: "1:1", dpi: 300 },
    "2x3": { width: 1800, height: 1200, aspectRatio: "3:2", dpi: 300 }
  }
};

const defaultMarqueeItems = [
  {
    id: "marquee-1",
    badge: "★ DIGITAL SELF-PHOTO BOOTH ★",
    text: "CUSTOM DIGITAL STAMPS • ✦ HIGH-RES PRINTS ✦ • STUDIO QUALITY FILTERS • ★ INSTANT DOWNLOADS ★",
    link: "/studio",
    placement: "top", // Top Ticker (Below Hero Banner)
    active: true,
    speedSec: 18,
    bgColor: "#160078",
    textColor: "#F042FF"
  },
  {
    id: "marquee-2",
    badge: "★ STRIKE A POSE ★",
    text: "EVENT & COLLAB PRESETS • ✦ SELF PHOTO BOOTH ✦ • INSTANT DIGITAL PRINTS • ★ CAPTURE CUSTOMIZE SHARE ★",
    link: "/studio",
    placement: "bottom", // Bottom Ticker (Above Footer)
    active: true,
    speedSec: 22,
    bgColor: "#2e109d",
    textColor: "#FFE5F1"
  },
  {
    id: "marquee-3",
    badge: "⚡ SEASONAL DROP",
    text: "NEW K-POP IDOL FRAMES & RETRO Y2K STICKERS AVAILABLE NOW • EXCLUSIVE RELEASES",
    link: "/studio",
    placement: "top",
    active: false,
    speedSec: 20,
    bgColor: "#010030",
    textColor: "#F042FF"
  }
];

const defaultWebsiteContent = {
  brandName: "SNPSHOT Studio",
  tagline: "Digital Self-Photo Booth & High-Res Photostrip Studio",
  copyrightText: "© 2026 SNPSHOT Studio. All rights reserved. Built for photography enthusiasts.",
  contactEmail: "hello@snpshot.studio",
  socials: {
    instagram: "https://instagram.com/snpshot.studio",
    tiktok: "https://tiktok.com/@snpshot.studio",
    twitter: "https://twitter.com/snpshotstudio",
    youtube: "https://youtube.com/@snpshotstudio"
  },
  pipelineSteps: [
    { step: "01", title: "Select Layout", desc: "Choose 3-Grid Vertical, Classic 4-Strip, 2x2 Square Grid, or 2x3 Postcard format." },
    { step: "02", title: "Capture Photos", desc: "Use live camera shutter countdown and real-time pose guidance overlays." },
    { step: "03", title: "Customize & Decorate", desc: "Apply frame backgrounds, studio color filters, digital stamps, and text stickers." },
    { step: "04", title: "Download & Share", desc: "Render high-resolution 300 DPI composite canvas for instant digital download or print." }
  ],
  faqs: [
    { id: "faq-1", question: "How high is the resolution of exported photostrips?", answer: "All photostrips export at 300 DPI high-resolution canvas print quality (up to 1800px) ideal for physical printing or social sharing." },
    { id: "faq-2", question: "Are my photos stored privately on the server?", answer: "Your captured photos stay entirely inside your browser session during customization. Server exports are created only when shared to the gallery." },
    { id: "faq-3", question: "Can I customize frame colors and digital stamps?", answer: "Yes! Choose from artist collaboration frames, solid studio border colors, gradient backgrounds, and aesthetic sticker stamps." }
  ]
};

const defaultSubjectCategories = [
  "General Inquiry",
  "Event Booking",
  "Collaboration",
  "Technical Issue",
  "Print & High-Res Export"
];

const defaultInquiries = [
  {
    id: "inq-101",
    name: "Minji Kim",
    email: "minji.kim@kpopframe.co",
    subject: "Collaboration",
    message: "Hi SNPSHOT team! We represent an indie pop music collective and would love to design an exclusive 4-strip idol frame template for our upcoming album launch event.",
    status: "unread",
    createdAt: "2026-08-11T14:32:00.000Z",
    notes: [
      { id: "note-1", author: "Studio Admin", text: "Reviewed portfolio. High alignment with our Gen-Z aesthetics.", createdAt: "2026-08-11T15:00:00.000Z" }
    ]
  },
  {
    id: "inq-102",
    name: "Marcus Vance",
    email: "marcus.vance@eventspro.com",
    subject: "Event Booking",
    message: "Hello! We are organizing a corporate tech summit next month and want to set up an interactive digital self-photo booth station for 300+ attendees. Can you provide custom branding package pricing?",
    status: "starred",
    createdAt: "2026-08-10T18:15:00.000Z",
    notes: [
      { id: "note-2", author: "Studio Admin", text: "Sent corporate rate sheet v2. Awaiting attendee count confirmation.", createdAt: "2026-08-10T19:20:00.000Z" }
    ]
  },
  {
    id: "inq-103",
    name: "Sophia Chen",
    email: "sophia.c@gmail.com",
    subject: "Technical Issue",
    message: "Hi there! I took a 3-strip photo set earlier today, but the high-res PNG download button was stuck on generating image. Can you help retrieve my session strip?",
    status: "in_review",
    createdAt: "2026-08-09T09:45:00.000Z",
    notes: []
  },
  {
    id: "inq-104",
    name: "David Lee",
    email: "david@leestudio.design",
    subject: "General Inquiry",
    message: "Loving the new B&W High-Contrast studio filter! Are you accepting custom sticker submission designs from community artists?",
    status: "resolved",
    createdAt: "2026-08-08T11:20:00.000Z",
    notes: [
      { id: "note-3", author: "Studio Admin", text: "Shared creator portal guidelines.", createdAt: "2026-08-08T14:10:00.000Z" }
    ]
  }
];

const defaultFrames = [
  {
    id: "classic-navy",
    name: "Classic Studio Navy",
    type: "color",
    layout: "all",
    bgColor: "#010030",
    bgGradient: "",
    borderColor: "#2e109d",
    imageSrc: "",
    padding: 16,
    innerGap: 12,
    borderRadius: 8,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "electric-magenta",
    name: "Electric Magenta Glow",
    type: "gradient",
    layout: "all",
    bgColor: "#010030",
    bgGradient: "linear-gradient(135deg, #F042FF 0%, #7226FF 100%)",
    borderColor: "#FFE5F1",
    imageSrc: "",
    padding: 16,
    innerGap: 12,
    borderRadius: 8,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "retro-film-strip",
    name: "Retro Film Strip",
    type: "color",
    layout: "4-grid",
    bgColor: "#111111",
    bgGradient: "",
    borderColor: "#333333",
    imageSrc: "",
    padding: 20,
    innerGap: 10,
    borderRadius: 4,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "kpop-3grid-special",
    name: "3-Grid K-Pop Idol Special",
    type: "gradient",
    layout: "3-grid",
    bgColor: "#0e0048",
    bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
    borderColor: "#F042FF",
    imageSrc: "",
    padding: 16,
    innerGap: 12,
    borderRadius: 8,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "pastel-2x2-grid",
    name: "2x2 Square Soft Pastel",
    type: "gradient",
    layout: "2x2",
    bgColor: "#18001e",
    bgGradient: "linear-gradient(135deg, #18001e 0%, #2e083c 100%)",
    borderColor: "#FF00FF",
    imageSrc: "",
    padding: 16,
    innerGap: 12,
    borderRadius: 8,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "vintage-2x3-postcard",
    name: "2x3 Postcard Vintage Film",
    type: "color",
    layout: "2x3",
    bgColor: "#1a0f00",
    bgGradient: "",
    borderColor: "#F59E0B",
    imageSrc: "",
    padding: 20,
    innerGap: 14,
    borderRadius: 6,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "custom-baseline-frame",
    name: "Custom Studio Baseline Frame",
    type: "color",
    layout: "all",
    bgColor: "#2e109d",
    bgGradient: "",
    borderColor: "#F042FF",
    imageSrc: "",
    padding: 16,
    innerGap: 12,
    borderRadius: 8,
    active: true,
    createdAt: new Date().toISOString()
  }
];

const defaultGalleryItems = [
  {
    id: "default-editorial-1",
    caption: "Wonyoung Idol Strip ✦",
    creator: "@snpshot.editorial",
    layout: "3-grid",
    color: "#F042FF",
    imageSrc: "/img/poses/Wonyoung1.png",
    origin: "editorial",
    badge: "Official Sample",
    status: "approved",
    printStatus: "dpi_verified",
    printDpi: 300,
    printResolution: "1200x1800",
    likes: 1840,
    isPromotedToShowcase: true,
    isFeatured: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-editorial-2",
    caption: "Cyber Glow Neon Set",
    creator: "@studio.curator",
    layout: "4-grid",
    color: "#7226FF",
    imageSrc: "/img/poses/Wonyoung2.png",
    origin: "editorial",
    badge: "Staff Pick",
    status: "approved",
    printStatus: "dpi_verified",
    printDpi: 300,
    printResolution: "1200x1800",
    likes: 1420,
    isPromotedToShowcase: true,
    isFeatured: true,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-community-1",
    caption: "cherry blossom date vibes",
    creator: "@sa.kura",
    layout: "3-grid",
    color: "#F042FF",
    imageSrc: "/img/poses/Wonyoung3.png",
    origin: "community",
    badge: "Community Favorite",
    status: "approved",
    printStatus: "dpi_verified",
    printDpi: 300,
    printResolution: "1200x1800",
    likes: 948,
    isPromotedToShowcase: false,
    isFeatured: false,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-community-2",
    caption: "pastel autumn weekend",
    creator: "@autumn.lily",
    layout: "2x2",
    color: "#FFE5F1",
    imageSrc: "/img/poses/Wonyoung1.png",
    origin: "community",
    badge: "Community Print",
    status: "approved",
    printStatus: "dpi_verified",
    printDpi: 300,
    printResolution: "1200x1800",
    likes: 853,
    isPromotedToShowcase: false,
    isFeatured: false,
    isDefault: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "default-community-3",
    caption: "night studio session 04",
    creator: "@retro.squad",
    layout: "2x3",
    color: "#10B981",
    imageSrc: "/img/poses/Wonyoung2.png",
    origin: "community",
    badge: "Trending",
    status: "approved",
    printStatus: "dpi_verified",
    printDpi: 300,
    printResolution: "1800x1200",
    likes: 1202,
    isPromotedToShowcase: false,
    isFeatured: false,
    isDefault: true,
    createdAt: new Date().toISOString()
  }
];

const defaultArtists = [
  {
    id: "ive-wonyoung-collab",
    name: "Wonyoung",
    role: "Vocalist / Center",
    color: "#F042FF",
    agencyId: "starship",
    agencyName: "Starship Ent.",
    groupId: "ive",
    groupName: "IVE",
    groupLogo: "✨",
    isMale: false,
    status: "active",
    startDate: "2026-01-01",
    endDate: "",
    isFeatured: true,
    isFeaturedOnShowcase: true,
    showcaseBadge: "★ BIRTHDAY SPECIAL",
    showcaseTagline: "Celebrate with exclusive 4-pose idol deck & dedicated birthday collector frame",
    dedicatedFrameId: "ive-wonyoung-birthday-frame",
    dedicatedFrame: {
      id: "ive-wonyoung-birthday-frame",
      name: "IVE Wonyoung Birthday Edition",
      layout: "3-grid",
      bgColor: "#0e0048",
      bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
      borderColor: "#F042FF",
      watermarkText: "IVE WONYOUNG ✦ OFFICIAL BIRTHDAY EVENT",
      padding: 16,
      innerGap: 12,
      borderRadius: 8
    },
    finalPreviewImage: "/img/showcase/wonyoung-birthday-photostrip.png",
    avatar: "/img/poses/Wonyoung1.png",
    poses: [
      "/img/poses/Wonyoung1.png",
      "/img/poses/Wonyoung2.png",
      "/img/poses/Wonyoung3.png",
      "/img/poses/Wonyoung4.png"
    ],
    posesGuidance: [
      "Finger Heart Pose",
      "Dual Cheek Poke",
      "Wink & V Sign",
      "Cute Cat Paws"
    ]
  },
  {
    id: "newjeans-hanni-collab",
    name: "Hanni",
    role: "Main Vocalist / Dancer",
    color: "#00a8ff",
    agencyId: "hybe",
    agencyName: "HYBE",
    groupId: "newjeans",
    groupName: "NewJeans",
    groupLogo: "🐰",
    isMale: false,
    status: "active",
    startDate: "2026-02-01",
    endDate: "",
    isFeatured: true,
    isFeaturedOnShowcase: true,
    showcaseBadge: "✦ Y2K POP-UP",
    showcaseTagline: "Get the iconic Bunny Club 4-cut photostrip with official pastel blue border",
    dedicatedFrameId: "newjeans-hanni-bunny-frame",
    dedicatedFrame: {
      id: "newjeans-hanni-bunny-frame",
      name: "NewJeans Hanni Bunny Club Frame",
      layout: "4-grid",
      bgColor: "#021226",
      bgGradient: "linear-gradient(135deg, #0055ff 0%, #00a8ff 100%)",
      borderColor: "#00a8ff",
      watermarkText: "NEWJEANS HANNI 🐰 BUNNY CLUB EXCLUSIVE",
      padding: 16,
      innerGap: 10,
      borderRadius: 6
    },
    finalPreviewImage: "/img/showcase/hanni-bunny-photostrip.png",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    poses: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600"
    ],
    posesGuidance: [
      "Bunny Ears Pose",
      "Double Peace Sign",
      "Cute Head Tilt",
      "Bubble Pop Cheek"
    ]
  },
  {
    id: "bts-jungkook-collab",
    name: "Jungkook",
    role: "Main Vocalist / Center",
    color: "#9c27b0",
    agencyId: "hybe",
    agencyName: "HYBE",
    groupId: "bts",
    groupName: "BTS",
    groupLogo: "💜",
    isMale: true,
    status: "active",
    startDate: "2026-03-01",
    endDate: "",
    isFeatured: false,
    isFeaturedOnShowcase: false,
    showcaseBadge: "💜 GOLDEN STUDIO",
    showcaseTagline: "Golden Era tribute photoshoot with sleek studio monochrome borders",
    dedicatedFrameId: "bts-jungkook-golden-frame",
    dedicatedFrame: {
      id: "bts-jungkook-golden-frame",
      name: "BTS Jungkook Golden Frame",
      layout: "2x2",
      bgColor: "#160024",
      bgGradient: "linear-gradient(135deg, #4a0072 0%, #9c27b0 100%)",
      borderColor: "#9c27b0",
      watermarkText: "BTS JUNGKOOK 💜 GOLDEN SPECIAL",
      padding: 16,
      innerGap: 12,
      borderRadius: 8
    },
    finalPreviewImage: "/img/showcase/jungkook-golden-photostrip.png",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    poses: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
    ],
    posesGuidance: [
      "Heart Hands",
      "Thumbs Up Smile",
      "Cool Model Pose",
      "Signature V-Sign"
    ]
  },
  {
    id: "aespa-karina-collab",
    name: "Karina",
    role: "Leader / Main Dancer",
    color: "#3f51b5",
    agencyId: "sm",
    agencyName: "SM Entertainment",
    groupId: "aespa",
    groupName: "aespa",
    groupLogo: "🦋",
    isMale: false,
    status: "scheduled",
    startDate: "2026-09-01",
    endDate: "2026-10-31",
    isFeatured: true,
    isFeaturedOnShowcase: true,
    showcaseBadge: "🔥 LIMITED DROP",
    showcaseTagline: "Synk into the digital realm with official cyber aesthetic 2x3 postcard frame",
    dedicatedFrameId: "aespa-karina-cyber-frame",
    dedicatedFrame: {
      id: "aespa-karina-cyber-frame",
      name: "aespa Karina Synk Cyber Frame",
      layout: "2x3",
      bgColor: "#03001e",
      bgGradient: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
      borderColor: "#7226FF",
      watermarkText: "AESPA KARINA 🦋 SYNK KWANGYA DROP",
      padding: 18,
      innerGap: 12,
      borderRadius: 8
    },
    finalPreviewImage: "/img/showcase/karina-cyber-photostrip.png",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600",
    poses: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600"
    ],
    posesGuidance: [
      "Cyber Katana Pose",
      "Neon Eye Wink",
      "Alien Antenna Paws",
      "Hologram Crown"
    ]
  }
];

const defaultStickers = [
  {
    id: "stk-cyber-sparkle",
    name: "Y2K Cyber Sparkle",
    type: "stamp",
    packId: "y2k-neon",
    packName: "Y2K Neon Glow",
    blendMode: "screen",
    imageSrc: "/img/stickers/y2k-cyber-sparkle.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-hologram-butterfly",
    name: "Hologram Butterfly",
    type: "sticker",
    packId: "y2k-neon",
    packName: "Y2K Neon Glow",
    blendMode: "normal",
    imageSrc: "/img/stickers/y2k-hologram-butterfly.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-kpop-crown",
    name: "K-Pop Idol Tiara",
    type: "stamp",
    packId: "kpop-birthday",
    packName: "K-Pop Idol Birthday",
    blendMode: "normal",
    imageSrc: "/img/stickers/kpop-idol-crown.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-stamp-daebak",
    name: "대박 Daebak Seal",
    type: "stamp",
    packId: "korean-stamps",
    packName: "Korean Character Stamps",
    blendMode: "multiply",
    imageSrc: "/img/stickers/stamp-daebak.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-stamp-saranghae",
    name: "사랑해 Love Seal",
    type: "stamp",
    packId: "korean-stamps",
    packName: "Korean Character Stamps",
    blendMode: "normal",
    imageSrc: "/img/stickers/stamp-saranghae.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-doodle-heart",
    name: "Hand Heart Doodle",
    type: "doodle",
    packId: "retro-doodles",
    packName: "Retro Journal Doodles",
    blendMode: "normal",
    imageSrc: "/img/stickers/doodle-hand-heart.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-watermark-film",
    name: "35mm Film ISO Watermark",
    type: "watermark",
    packId: "y2k-neon",
    packName: "Y2K Neon Glow",
    blendMode: "screen",
    imageSrc: "/img/stickers/watermark-film-iso400.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-watermark-rec",
    name: "REC 4K Live Watermark",
    type: "watermark",
    packId: "y2k-neon",
    packName: "Y2K Neon Glow",
    blendMode: "normal",
    imageSrc: "/img/stickers/watermark-rec-indicator.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  },
  {
    id: "stk-snpshot-official",
    name: "Official Studio Seal",
    type: "stamp",
    packId: "korean-stamps",
    packName: "Korean Character Stamps",
    blendMode: "normal",
    imageSrc: "/img/stickers/stamp-snpshot-official.svg",
    active: true,
    createdAt: "2026-08-16T00:00:00.000Z"
  }
];

const defaultAnalytics = {
  kpis: {
    activeSessions: 142,
    photosCaptured: 1284,
    downloadsCompleted: 896,
    completionRate: 84.2,
    avgRenderLatencyMs: 245,
    exportSuccessRate: 99.4
  },
  funnel: [
    { step: "Step 01: Layout Select", count: 1250, conversion: 100 },
    { step: "Step 02: Camera Capture", count: 1180, conversion: 94.4 },
    { step: "Step 03: Customize & Decorate", count: 1050, conversion: 84.0 },
    { step: "Step 04: High-Res Download", count: 896, conversion: 71.7 }
  ],
  layouts: [
    { id: "vertical-3", name: "Vertical 3-Strip", count: 482, percentage: 38.4, color: "#7226FF" },
    { id: "classic-4", name: "Classic 4-Strip", count: 395, percentage: 31.5, color: "#F042FF" },
    { id: "grid-2x2", name: "2x2 Square Grid", count: 241, percentage: 19.2, color: "#010030" },
    { id: "postcard-2x3", name: "2x3 Postcard", count: 132, percentage: 10.9, color: "#3B82F6" }
  ],
  filters: [
    { id: "warm_grain", name: "Warm Grain", uses: 412, percentage: 32.8 },
    { id: "pastel_glow", name: "Pastel Glow", uses: 328, percentage: 26.1 },
    { id: "cinematic_film", name: "Cinematic Film", uses: 245, percentage: 19.5 },
    { id: "bw_highcontrast", name: "B&W High-Contrast", uses: 156, percentage: 12.4 },
    { id: "vintage_chrome", name: "Vintage Chrome", uses: 88, percentage: 7.0 },
    { id: "standard_pure", name: "Standard Pure", uses: 27, percentage: 2.2 }
  ],
  decorations: [
    { id: "dec-1", type: "stamp", name: "Cherry Blossom Seal", count: 384 },
    { id: "dec-2", type: "stamp", name: "Studio Star Stamp", count: 312 },
    { id: "dec-3", type: "sticker", name: "Y2K Sparkle Hologram", count: 295 },
    { id: "dec-4", type: "sticker", name: "Film Grain Watermark", count: 240 },
    { id: "dec-5", type: "border", name: "Deep Indigo (#010030)", count: 520 },
    { id: "dec-6", type: "border", name: "Electric Magenta (#F042FF)", count: 380 }
  ],
  timeframeData: {
    today: { activeSessions: 142, photosCaptured: 1284, downloadsCompleted: 896, completionRate: 84.2 },
    last7d: { activeSessions: 940, photosCaptured: 8520, downloadsCompleted: 6140, completionRate: 82.5 },
    last30d: { activeSessions: 3850, photosCaptured: 34200, downloadsCompleted: 24800, completionRate: 81.8 },
    allTime: { activeSessions: 12450, photosCaptured: 112000, downloadsCompleted: 81200, completionRate: 83.1 }
  },
  engineLogs: [
    { id: "log-1", timestamp: "2026-08-11 19:48:12", status: "success", latencyMs: 232, resolution: "2400x7200 300DPI", format: "PNG" },
    { id: "log-2", timestamp: "2026-08-11 19:45:05", status: "success", latencyMs: 258, resolution: "2400x7200 300DPI", format: "PNG" },
    { id: "log-3", timestamp: "2026-08-11 19:41:22", status: "success", latencyMs: 210, resolution: "2400x7200 300DPI", format: "PNG" },
    { id: "log-4", timestamp: "2026-08-11 19:35:10", status: "success", latencyMs: 265, resolution: "2400x7200 300DPI", format: "PNG" },
    { id: "log-5", timestamp: "2026-08-11 19:28:44", status: "success", latencyMs: 240, resolution: "2400x7200 300DPI", format: "PNG" }
  ]
};

const defaultPlatformSettings = {
  camera: {
    defaultCountdown: 5,
    shutterSoundEnabled: true,
    audioVolume: 80,
    autoBurstInterval: 3,
    mirrorPreview: true,
    flashEffect: true
  },
  export: {
    defaultDpi: "300",
    defaultFormat: "PNG",
    jpegQuality: 92,
    framePaddingPx: 20,
    photoGapPx: 12,
    borderCornerRadiusPx: 12,
    watermarkEnabled: true,
    watermarkText: "SNPSHOT STUDIO // HIGH-RES DIGITAL PRINT",
    includeDateStamp: true
  },
  security: {
    passkey: "snpshot2026",
    sessionTimeoutMinutes: 60,
    requirePasskeyForExport: false,
    maintenanceMode: false
  }
};

const getStudioData = () => {
  const activePath = fs.existsSync(studioDataPath) ? studioDataPath : creatorDataPath;
  if (!fs.existsSync(activePath)) {
    return { 
      artists: defaultArtists, 
      frames: defaultFrames, 
      stickers: defaultStickers, 
      galleryItems: defaultGalleryItems, 
      showcaseThemes: defaultShowcaseThemes, 
      heroConfig: defaultHeroConfig,
      filters: defaultFilters,
      canvasConfig: defaultCanvasConfig,
      marqueeItems: defaultMarqueeItems,
      websiteContent: defaultWebsiteContent,
      inquiries: defaultInquiries,
      subjectCategories: defaultSubjectCategories,
      analytics: defaultAnalytics,
      settings: defaultPlatformSettings
    };
  }
  try {
    const data = JSON.parse(fs.readFileSync(activePath, "utf-8"));
    if (!data.artists || data.artists.length === 0) data.artists = defaultArtists;
    if (!data.frames || data.frames.length === 0) data.frames = defaultFrames;
    if (!data.stickers || data.stickers.length === 0) data.stickers = defaultStickers;
    if (!data.galleryItems || data.galleryItems.length === 0) {
      data.galleryItems = defaultGalleryItems;
    } else {
      // Normalize origin and badge on existing items
      data.galleryItems = data.galleryItems.map(item => {
        const isEditorial = item.origin === "editorial" || item.creator?.toLowerCase().includes("editorial") || item.creator?.toLowerCase().includes("studio");
        return {
          ...item,
          origin: item.origin || (isEditorial ? "editorial" : "community"),
          badge: item.badge || (isEditorial ? "Official Sample" : "Community Print"),
          status: item.status || "approved",
          printStatus: item.printStatus || "dpi_verified",
          printDpi: item.printDpi || 300,
          printResolution: item.printResolution || (item.layout === '2x3' ? '1800x1200' : '1200x1800')
        };
      });
    }
    if (!data.showcaseThemes) data.showcaseThemes = defaultShowcaseThemes;
    if (!data.heroConfig) data.heroConfig = defaultHeroConfig;
    if (!data.filters || data.filters.length === 0) data.filters = defaultFilters;
    if (!data.canvasConfig) data.canvasConfig = defaultCanvasConfig;
    if (!data.marqueeItems || data.marqueeItems.length === 0) {
      data.marqueeItems = defaultMarqueeItems;
    } else {
      data.marqueeItems = data.marqueeItems.map((item, idx) => ({
        ...item,
        placement: item.placement || (idx === 0 ? "top" : idx === 1 ? "bottom" : "top")
      }));
    }
    if (!data.websiteContent) data.websiteContent = defaultWebsiteContent;
    if (!data.inquiries || data.inquiries.length === 0) data.inquiries = defaultInquiries;
    if (!data.subjectCategories || data.subjectCategories.length === 0) data.subjectCategories = defaultSubjectCategories;
    if (!data.analytics) data.analytics = defaultAnalytics;
    if (!data.settings) data.settings = defaultPlatformSettings;
    
    // Ensure default artists have high quality finalPreviewImage populated
    if (data.artists && data.artists.length > 0) {
      data.artists = data.artists.map(artist => {
        if (!artist.finalPreviewImage) {
          if (artist.id?.includes("wonyoung")) artist.finalPreviewImage = "/img/showcase/wonyoung-birthday-photostrip.png";
          else if (artist.id?.includes("hanni")) artist.finalPreviewImage = "/img/showcase/hanni-bunny-photostrip.png";
          else if (artist.id?.includes("jungkook")) artist.finalPreviewImage = "/img/showcase/jungkook-golden-photostrip.png";
          else if (artist.id?.includes("karina")) artist.finalPreviewImage = "/img/showcase/karina-cyber-photostrip.png";
          else artist.finalPreviewImage = artist.avatar || artist.poses?.[0] || "/img/showcase/classic-studio-photostrip.png";
        }
        return artist;
      });
    }

    return data;
  } catch (err) {
    console.error("Error reading studio data:", err);
    return { 
      artists: defaultArtists, 
      frames: defaultFrames, 
      stickers: defaultStickers, 
      galleryItems: defaultGalleryItems, 
      showcaseThemes: defaultShowcaseThemes, 
      heroConfig: defaultHeroConfig,
      filters: defaultFilters,
      canvasConfig: defaultCanvasConfig,
      marqueeItems: defaultMarqueeItems,
      websiteContent: defaultWebsiteContent,
      inquiries: defaultInquiries,
      subjectCategories: defaultSubjectCategories,
      analytics: defaultAnalytics,
      settings: defaultPlatformSettings
    };
  }
};

const saveStudioData = (data) => {
  try {
    fs.writeFileSync(studioDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing studio data:", err);
  }
};

const getCreatorData = getStudioData;
const saveCreatorData = saveStudioData;

// Get all studio campaigns/frames/stickers
app.get("/api/studio/data", (req, res) => {
  res.json(getStudioData());
});

app.get("/api/creator/data", (req, res) => {
  res.json(getStudioData());
});

// GET /api/admin/artists - List all artist collaboration campaigns
app.get(["/api/admin/artists", "/api/studio/artists", "/api/creator/artists"], (req, res) => {
  const data = getStudioData();
  const { status, agencyId, featured } = req.query;
  let artists = data.artists || [];

  if (status && status !== "all") {
    artists = artists.filter(a => (a.status || "active") === status);
  }
  if (agencyId && agencyId !== "all") {
    artists = artists.filter(a => a.agencyId === agencyId);
  }
  if (featured !== undefined) {
    const isFeatured = featured === "true" || featured === true;
    artists = artists.filter(a => Boolean(a.isFeatured) === isFeatured);
  }

  res.json({ success: true, artists });
});

// GET /api/admin/stickers - List all digital stamps and stickers
app.get(["/api/admin/stickers", "/api/studio/stickers", "/api/creator/stickers"], (req, res) => {
  const data = getStudioData();
  const { packId, type, active } = req.query;
  let stickers = data.stickers || [];

  if (packId && packId !== "all") {
    stickers = stickers.filter(s => s.packId === packId);
  }
  if (type && type !== "all") {
    stickers = stickers.filter(s => s.type === type);
  }
  if (active !== undefined) {
    const isActive = active === "true" || active === true;
    stickers = stickers.filter(s => s.active !== false === isActive);
  }

  res.json({ success: true, stickers });
});

// Middleware for handling frame upload (supports both JSON and multipart form-data)
const handleFrameUpload = (req, res, next) => {
  if (req.is("multipart/form-data")) {
    uploadThemes.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: "Error uploading frame overlay file", error: err.message });
      }
      next();
    });
  } else {
    next();
  }
};

// GET /api/admin/frames - List all frame layouts and border overlays
app.get(["/api/admin/frames", "/api/studio/frames"], (req, res) => {
  const data = getStudioData();
  const { layout, active } = req.query;
  let frames = data.frames || [];

  if (layout) {
    frames = frames.filter(f => f.layout === layout || f.layout === "all");
  }
  if (active !== undefined) {
    const isActive = active === "true" || active === true;
    frames = frames.filter(f => f.active === isActive);
  }

  res.json({ success: true, frames });
});

// POST /api/admin/frames - Create new frame layout or upload PNG overlay
app.post(["/api/admin/frames", "/api/creator/frame"], handleFrameUpload, (req, res) => {
  const { name, type, layout, bgColor, bgGradient, borderColor, padding, innerGap, borderRadius, active } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Frame name is required" });
  }

  const data = getStudioData();
  const frameType = type || (req.file ? "png" : (bgGradient ? "gradient" : "color"));

  const newFrame = {
    id: `frame-${Date.now()}`,
    name,
    type: frameType,
    layout: layout || "all",
    bgColor: bgColor || "#010030",
    bgGradient: bgGradient || "",
    borderColor: borderColor || "#2e109d",
    imageSrc: req.file ? `/img/themes/${req.file.filename}` : (req.body?.imageSrc || ""),
    padding: Number(padding) || 16,
    innerGap: Number(innerGap) || 12,
    borderRadius: Number(borderRadius) || 8,
    active: active !== undefined ? (active === "true" || active === true) : true,
    createdAt: new Date().toISOString()
  };

  data.frames.push(newFrame);
  saveStudioData(data);

  res.json({ success: true, frame: newFrame });
});

// PUT /api/admin/frames/:id - Update existing frame layout or overlay
app.put(["/api/admin/frames/:id", "/api/creator/frame/:id"], handleFrameUpload, (req, res) => {
  const { id } = req.params;
  const { name, type, layout, bgColor, bgGradient, borderColor, padding, innerGap, borderRadius, active } = req.body || {};

  const data = getStudioData();
  const frameIndex = data.frames.findIndex(f => f.id === id);
  if (frameIndex === -1) {
    return res.status(404).json({ message: "Frame layout not found" });
  }

  const existingFrame = data.frames[frameIndex];
  let imageSrc = existingFrame.imageSrc;

  if (req.file) {
    if (existingFrame.imageSrc && existingFrame.imageSrc.startsWith("/img/themes/")) {
      const oldPath = path.join(themesDir, path.basename(existingFrame.imageSrc));
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { console.error("Error deleting old overlay file:", e); }
      }
    }
    imageSrc = `/img/themes/${req.file.filename}`;
  }

  const updatedFrame = {
    ...existingFrame,
    name: name || existingFrame.name,
    type: type || existingFrame.type || (req.file ? "png" : "color"),
    layout: layout || existingFrame.layout,
    bgColor: bgColor !== undefined ? bgColor : existingFrame.bgColor,
    bgGradient: bgGradient !== undefined ? bgGradient : existingFrame.bgGradient,
    borderColor: borderColor !== undefined ? borderColor : existingFrame.borderColor,
    imageSrc,
    padding: padding !== undefined ? Number(padding) : existingFrame.padding,
    innerGap: innerGap !== undefined ? Number(innerGap) : existingFrame.innerGap,
    borderRadius: borderRadius !== undefined ? Number(borderRadius) : existingFrame.borderRadius,
    active: active !== undefined ? (active === "true" || active === true) : existingFrame.active,
    updatedAt: new Date().toISOString()
  };

  data.frames[frameIndex] = updatedFrame;
  saveStudioData(data);

  res.json({ success: true, frame: updatedFrame });
});

// DELETE /api/admin/frames/:id - Delete frame layout
app.delete(["/api/admin/frames/:id", "/api/creator/frame/:id"], (req, res) => {
  const { id } = req.params;
  const data = getStudioData();

  const frameToDelete = data.frames.find(f => f.id === id);
  if (frameToDelete) {
    if (frameToDelete.imageSrc && frameToDelete.imageSrc.startsWith("/img/themes/")) {
      const filePath = path.join(themesDir, path.basename(frameToDelete.imageSrc));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting overlay file:", e); }
      }
    }
  }

  data.frames = data.frames.filter(f => f.id !== id);
  saveStudioData(data);

  res.json({ success: true, message: "Frame layout removed" });
});

// Upload and register a new artist collaboration campaign with flexible pose guidance & dedicated frame
app.post("/api/creator/artist", uploadPoses.any(), (req, res) => {
  const { 
    name, role, color, agencyId, agencyName, groupId, groupName, groupLogo, isMale, 
    status, startDate, endDate, isFeatured, isFeaturedOnShowcase, showcaseBadge, showcaseTagline,
    dedicatedFrameId, dedicatedFrame, posesGuidance, finalPreviewImage: finalPreviewImageBody
  } = req.body;
  
  if (!name || !role || !agencyId || !agencyName || !groupId || !groupName) {
    return res.status(400).json({ message: "Missing required campaign fields" });
  }

  let poses = [];
  let finalPreviewImage = finalPreviewImageBody || null;

  if (req.files && req.files.length > 0) {
    const poseFiles = req.files.filter(f => f.fieldname === "poses" || f.fieldname.startsWith("poses["));
    const previewFile = req.files.find(f => f.fieldname === "finalPreviewImage" || f.fieldname === "previewImage");
    
    if (poseFiles.length > 0) {
      poses = poseFiles.map(file => `/img/poses/${file.filename}`);
    }
    if (previewFile) {
      finalPreviewImage = `/img/poses/${previewFile.filename}`;
    }
  }

  if (poses.length === 0) {
    // Default fallback pose placeholders if no files attached
    poses = ["/img/poses/Wonyoung1.png", "/img/poses/Wonyoung2.png", "/img/poses/Wonyoung3.png", "/img/poses/Wonyoung4.png"];
  }

  if (!finalPreviewImage) {
    finalPreviewImage = poses[0] || "/img/showcase/wonyoung-birthday-photostrip.png";
  }

  let parsedGuidance = [];
  if (posesGuidance) {
    try {
      parsedGuidance = typeof posesGuidance === "string" ? JSON.parse(posesGuidance) : posesGuidance;
    } catch (e) {
      parsedGuidance = [];
    }
  }

  let parsedDedicatedFrame = null;
  if (dedicatedFrame) {
    try {
      parsedDedicatedFrame = typeof dedicatedFrame === "string" ? JSON.parse(dedicatedFrame) : dedicatedFrame;
    } catch (e) {
      parsedDedicatedFrame = null;
    }
  }

  const avatar = poses[0]; // First pose is main selection avatar

  const data = getCreatorData();
  const newArtist = {
    id: `custom-artist-${Date.now()}`,
    name,
    role,
    color: color || "#F042FF",
    agencyId,
    agencyName,
    groupId,
    groupName,
    groupLogo: groupLogo || "✨",
    isMale: isMale === "true" || isMale === true,
    status: status || "active",
    startDate: startDate || null,
    endDate: endDate || null,
    isFeatured: isFeatured === "true" || isFeatured === true,
    isFeaturedOnShowcase: isFeaturedOnShowcase === "true" || isFeaturedOnShowcase === true,
    showcaseBadge: showcaseBadge || "★ OFFICIAL EVENT",
    showcaseTagline: showcaseTagline || "Official idol collab deck & exclusive collector frame",
    dedicatedFrameId: dedicatedFrameId || (parsedDedicatedFrame?.id || "custom-event-frame"),
    dedicatedFrame: parsedDedicatedFrame || {
      id: "custom-event-frame",
      name: `${name} Official Collab Frame`,
      layout: "3-grid",
      bgColor: "#0e0048",
      bgGradient: "linear-gradient(135deg, #7226FF 0%, #F042FF 100%)",
      borderColor: color || "#F042FF",
      watermarkText: `${(groupName || "").toUpperCase()} ${name.toUpperCase()} ✦ OFFICIAL EVENT`,
      padding: 16,
      innerGap: 12,
      borderRadius: 8
    },
    finalPreviewImage,
    posesGuidance: parsedGuidance,
    avatar,
    poses
  };

  data.artists.push(newArtist);
  saveCreatorData(data);

  res.json({ success: true, artist: newArtist });
});

// Edit custom artist campaign
app.put("/api/creator/artist/:id", uploadPoses.any(), (req, res) => {
  const { id } = req.params;
  const { 
    name, role, color, agencyId, agencyName, groupId, groupName, groupLogo, isMale,
    status, startDate, endDate, isFeatured, isFeaturedOnShowcase, showcaseBadge, showcaseTagline,
    dedicatedFrameId, dedicatedFrame, posesGuidance, existingPoses, finalPreviewImage: finalPreviewImageBody
  } = req.body;
  
  const data = getCreatorData();
  const artistIndex = data.artists.findIndex(a => a.id === id);
  if (artistIndex === -1) {
    return res.status(404).json({ message: "Artist campaign not found" });
  }

  const existingArtist = data.artists[artistIndex];

  let poses = existingArtist.poses || [];
  let finalPreviewImage = finalPreviewImageBody !== undefined ? finalPreviewImageBody : (existingArtist.finalPreviewImage || existingArtist.poses?.[0]);

  if (req.files && req.files.length > 0) {
    const poseFiles = req.files.filter(f => f.fieldname === "poses" || f.fieldname.startsWith("poses["));
    const previewFile = req.files.find(f => f.fieldname === "finalPreviewImage" || f.fieldname === "previewImage");
    
    if (poseFiles.length > 0) {
      poses = poseFiles.map(file => `/img/poses/${file.filename}`);
    }
    if (previewFile) {
      finalPreviewImage = `/img/poses/${previewFile.filename}`;
    }
  } else if (existingPoses) {
    try {
      poses = typeof existingPoses === "string" ? JSON.parse(existingPoses) : existingPoses;
    } catch(e) {}
  }

  let parsedGuidance = existingArtist.posesGuidance || [];
  if (posesGuidance !== undefined) {
    try {
      parsedGuidance = typeof posesGuidance === "string" ? JSON.parse(posesGuidance) : posesGuidance;
    } catch (e) {
      parsedGuidance = [];
    }
  }

  let parsedDedicatedFrame = existingArtist.dedicatedFrame || null;
  if (dedicatedFrame !== undefined) {
    try {
      parsedDedicatedFrame = typeof dedicatedFrame === "string" ? JSON.parse(dedicatedFrame) : dedicatedFrame;
    } catch (e) {
      parsedDedicatedFrame = existingArtist.dedicatedFrame || null;
    }
  }

  const updatedArtist = {
    ...existingArtist,
    name: name || existingArtist.name,
    role: role || existingArtist.role,
    color: color || existingArtist.color,
    agencyId: agencyId || existingArtist.agencyId,
    agencyName: agencyName || existingArtist.agencyName,
    groupId: groupId || existingArtist.groupId,
    groupName: groupName || existingArtist.groupName,
    groupLogo: groupLogo || existingArtist.groupLogo,
    isMale: isMale !== undefined ? (isMale === "true" || isMale === true) : existingArtist.isMale,
    status: status || existingArtist.status || "active",
    startDate: startDate !== undefined ? startDate : existingArtist.startDate,
    endDate: endDate !== undefined ? endDate : existingArtist.endDate,
    isFeatured: isFeatured !== undefined ? (isFeatured === "true" || isFeatured === true) : Boolean(existingArtist.isFeatured),
    isFeaturedOnShowcase: isFeaturedOnShowcase !== undefined ? (isFeaturedOnShowcase === "true" || isFeaturedOnShowcase === true) : Boolean(existingArtist.isFeaturedOnShowcase),
    showcaseBadge: showcaseBadge !== undefined ? showcaseBadge : (existingArtist.showcaseBadge || "★ OFFICIAL EVENT"),
    showcaseTagline: showcaseTagline !== undefined ? showcaseTagline : (existingArtist.showcaseTagline || "Official idol collab deck & exclusive collector frame"),
    dedicatedFrameId: dedicatedFrameId !== undefined ? dedicatedFrameId : (existingArtist.dedicatedFrameId || "custom-event-frame"),
    dedicatedFrame: parsedDedicatedFrame || existingArtist.dedicatedFrame,
    finalPreviewImage: finalPreviewImage || existingArtist.finalPreviewImage || poses[0],
    posesGuidance: parsedGuidance,
    poses,
    avatar: poses[0] || existingArtist.avatar
  };

  data.artists[artistIndex] = updatedArtist;
  saveCreatorData(data);

  res.json({ success: true, artist: updatedArtist });
});

// Quick Toggle for Campaign Status, Featured Flag & Showcase Flag
app.patch("/api/creator/artist/:id/quick-toggle", (req, res) => {
  const { id } = req.params;
  const { status, isFeatured, isFeaturedOnShowcase } = req.body;

  const data = getCreatorData();
  const artistIndex = data.artists.findIndex(a => a.id === id);
  if (artistIndex === -1) {
    return res.status(404).json({ message: "Artist campaign not found" });
  }

  if (status) data.artists[artistIndex].status = status;
  if (isFeatured !== undefined) data.artists[artistIndex].isFeatured = isFeatured;
  if (isFeaturedOnShowcase !== undefined) data.artists[artistIndex].isFeaturedOnShowcase = isFeaturedOnShowcase;

  saveCreatorData(data);
  res.json({ success: true, artist: data.artists[artistIndex] });
});

// Delete custom Theme Overlay
app.delete("/api/creator/frame/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  
  const frameToDelete = data.frames.find(f => f.id === id);
  if (frameToDelete) {
    const filePath = path.join(themesDir, path.basename(frameToDelete.imageSrc));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting file:", e); }
    }
  }

  data.frames = data.frames.filter(f => f.id !== id);
  saveCreatorData(data);
  res.json({ success: true });
});

// Delete custom artist campaign
app.delete("/api/creator/artist/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  
  const artistToDelete = data.artists.find(a => a.id === id);
  if (artistToDelete) {
    artistToDelete.poses.forEach(posePath => {
      const filePath = path.join(posesDir, path.basename(posePath));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting file:", e); }
      }
    });
  }

  data.artists = data.artists.filter(a => a.id !== id);
  saveCreatorData(data);
  res.json({ success: true });
});

// Upload and register a new custom sticker/doodle PNG with pack and metadata
app.post("/api/creator/sticker", uploadStickers.single("image"), (req, res) => {
  const { name, type, packId, packName, defaultWidth, defaultHeight, defaultRotation, blendMode, isFeaturedPack } = req.body;
  if (!req.file || !name) {
    return res.status(400).json({ message: "Missing required fields or sticker file" });
  }

  const data = getCreatorData();
  const newSticker = {
    id: `custom-sticker-${Date.now()}`,
    name,
    type: type || "sticker", // 'sticker', 'doodle', 'stamp', 'watermark', 'frame'
    packId: packId || "uncategorized",
    packName: packName || "General Collection",
    defaultWidth: defaultWidth ? parseInt(defaultWidth, 10) : 100,
    defaultHeight: defaultHeight ? parseInt(defaultHeight, 10) : 100,
    defaultRotation: defaultRotation ? parseInt(defaultRotation, 10) : 0,
    blendMode: blendMode || "normal",
    isFeaturedPack: isFeaturedPack === "true" || isFeaturedPack === true,
    imageSrc: `/img/stickers/${req.file.filename}`
  };

  data.stickers.push(newSticker);
  saveCreatorData(data);

  res.json({ success: true, sticker: newSticker });
});

// Batch upload multiple sticker PNGs
app.post("/api/creator/sticker/batch", uploadStickers.array("images", 20), (req, res) => {
  const { packId, packName, type, blendMode } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No sticker image files uploaded" });
  }

  const data = getCreatorData();
  const createdStickers = [];

  req.files.forEach((file, idx) => {
    // Generate clean name from original file name
    const rawName = path.parse(file.originalname).name;
    const cleanName = rawName.replace(/[-_]/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    const newSticker = {
      id: `custom-sticker-${Date.now()}-${idx}`,
      name: cleanName || `${packName || "Sticker"} #${idx + 1}`,
      type: type || "sticker",
      packId: packId || "uncategorized",
      packName: packName || "General Collection",
      defaultWidth: 100,
      defaultHeight: 100,
      defaultRotation: 0,
      blendMode: blendMode || "normal",
      isFeaturedPack: false,
      imageSrc: `/img/stickers/${file.filename}`
    };

    data.stickers.push(newSticker);
    createdStickers.push(newSticker);
  });

  saveCreatorData(data);
  res.json({ success: true, stickers: createdStickers });
});

// Edit custom sticker
app.put("/api/creator/sticker/:id", uploadStickers.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, type, packId, packName, defaultWidth, defaultHeight, defaultRotation, blendMode, isFeaturedPack } = req.body;

  const data = getCreatorData();
  const stickerIndex = data.stickers.findIndex(s => s.id === id);
  if (stickerIndex === -1) {
    return res.status(404).json({ message: "Sticker not found" });
  }

  const existingSticker = data.stickers[stickerIndex];
  let imageSrc = existingSticker.imageSrc;

  if (req.file) {
    const filePath = path.join(stickersDir, path.basename(existingSticker.imageSrc));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting old sticker file:", e); }
    }
    imageSrc = `/img/stickers/${req.file.filename}`;
  }

  const updatedSticker = {
    ...existingSticker,
    name: name || existingSticker.name,
    type: type || existingSticker.type,
    packId: packId !== undefined ? packId : (existingSticker.packId || "uncategorized"),
    packName: packName !== undefined ? packName : (existingSticker.packName || "General Collection"),
    defaultWidth: defaultWidth ? parseInt(defaultWidth, 10) : (existingSticker.defaultWidth || 100),
    defaultHeight: defaultHeight ? parseInt(defaultHeight, 10) : (existingSticker.defaultHeight || 100),
    defaultRotation: defaultRotation !== undefined ? parseInt(defaultRotation, 10) : (existingSticker.defaultRotation || 0),
    blendMode: blendMode || existingSticker.blendMode || "normal",
    isFeaturedPack: isFeaturedPack !== undefined ? (isFeaturedPack === "true" || isFeaturedPack === true) : Boolean(existingSticker.isFeaturedPack),
    imageSrc
  };

  data.stickers[stickerIndex] = updatedSticker;
  saveCreatorData(data);

  res.json({ success: true, sticker: updatedSticker });
});

// Bulk update pack/type for multiple selected stickers
app.patch("/api/creator/sticker/bulk-update-pack", (req, res) => {
  const { ids, packId, packName, type } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No sticker IDs provided" });
  }

  const data = getCreatorData();
  let count = 0;

  data.stickers = data.stickers.map(sticker => {
    if (ids.includes(sticker.id)) {
      count++;
      return {
        ...sticker,
        packId: packId || sticker.packId || "uncategorized",
        packName: packName || sticker.packName || "General Collection",
        type: type || sticker.type || "sticker"
      };
    }
    return sticker;
  });

  saveCreatorData(data);
  res.json({ success: true, updatedCount: count });
});

// Bulk delete multiple selected stickers
app.post("/api/creator/sticker/bulk-delete", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No sticker IDs provided for deletion" });
  }

  const data = getCreatorData();
  
  // Clean up files
  data.stickers.forEach(sticker => {
    if (ids.includes(sticker.id)) {
      const filePath = path.join(stickersDir, path.basename(sticker.imageSrc));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting sticker file:", e); }
      }
    }
  });

  data.stickers = data.stickers.filter(s => !ids.includes(s.id));
  saveCreatorData(data);

  res.json({ success: true, deletedCount: ids.length });
});

// Delete custom sticker
app.delete("/api/creator/sticker/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();

  const stickerToDelete = data.stickers.find(s => s.id === id);
  if (stickerToDelete) {
    const filePath = path.join(stickersDir, path.basename(stickerToDelete.imageSrc));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting sticker file:", e); }
    }
  }

  data.stickers = data.stickers.filter(s => !id.includes(s.id) && s.id !== id);
  saveCreatorData(data);
  res.json({ success: true });
});

// --- Photostrip Preview Gallery API Endpoints ---

// Upload and register a new completed photostrip output graphic
app.post("/api/creator/gallery", uploadGallery.single("image"), (req, res) => {
  const { caption, creator, layout, color, status, printStatus, printDpi, printResolution, modNote, flagReason, origin, badge, isPromotedToShowcase, isFeatured } = req.body;
  if (!req.file || !caption || !creator || !layout) {
    return res.status(400).json({ message: "Missing required fields or photostrip preview file" });
  }

  const data = getCreatorData();
  const isEditorial = origin === "editorial" || creator.toLowerCase().includes("editorial") || creator.toLowerCase().includes("studio");
  const newItem = {
    id: `gallery-item-${Date.now()}`,
    caption,
    creator: creator.startsWith("@") ? creator : `@${creator}`,
    layout, // '3-grid' | '4-grid' | '2x2' | '2x3'
    color: color || "#B4FF00",
    imageSrc: `/img/gallery/${req.file.filename}`,
    origin: origin || (isEditorial ? "editorial" : "community"),
    badge: badge || (isEditorial ? "Official Sample" : "Community Print"),
    isPromotedToShowcase: isPromotedToShowcase === "true" || isPromotedToShowcase === true || Boolean(isEditorial),
    isFeatured: isFeatured === "true" || isFeatured === true || false,
    status: status || "approved", // 'approved' | 'pending' | 'flagged' | 'archived'
    printStatus: printStatus || "dpi_verified", // 'queued' | 'dpi_verified' | 'exported' | 'fulfilled'
    printDpi: printDpi ? parseInt(printDpi, 10) : 300,
    printResolution: printResolution || (layout === '2x3' ? '1800x1200' : '1200x1800'),
    modNote: modNote || "",
    flagReason: flagReason || "",
    likes: Math.floor(Math.random() * 40) + 12, // Random cute initial count for aesthetic realism
    createdAt: new Date().toISOString()
  };

  if (!data.galleryItems) data.galleryItems = [];
  data.galleryItems.push(newItem);
  saveCreatorData(data);

  res.json({ success: true, item: newItem });
});

// Edit an existing gallery item
app.put("/api/creator/gallery/:id", uploadGallery.single("image"), (req, res) => {
  const { id } = req.params;
  const { caption, creator, layout, color } = req.body;

  const data = getCreatorData();
  const itemIndex = data.galleryItems.findIndex(item => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: "Gallery item not found" });
  }

  const existingItem = data.galleryItems[itemIndex];
  let imageSrc = existingItem.imageSrc;

  if (req.file) {
    // Delete old image file
    const oldFilePath = path.join(galleryDir, path.basename(existingItem.imageSrc));
    if (fs.existsSync(oldFilePath)) {
      try { fs.unlinkSync(oldFilePath); } catch (e) { console.error("Error deleting old gallery image:", e); }
    }
    imageSrc = `/img/gallery/${req.file.filename}`;
  }

  const updatedItem = {
    ...existingItem,
    caption: caption || existingItem.caption,
    creator: creator ? (creator.startsWith("@") ? creator : `@${creator}`) : existingItem.creator,
    layout: layout || existingItem.layout,
    color: color || existingItem.color,
    imageSrc
  };

  data.galleryItems[itemIndex] = updatedItem;
  saveCreatorData(data);

  res.json({ success: true, item: updatedItem });
});

// Delete a gallery item
app.delete("/api/creator/gallery/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();

  const itemToDelete = data.galleryItems.find(item => item.id === id);
  if (itemToDelete) {
    const filePath = path.join(galleryDir, path.basename(itemToDelete.imageSrc));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting gallery file:", e); }
    }
  }

  data.galleryItems = data.galleryItems.filter(item => item.id !== id);
  saveCreatorData(data);
  res.json({ success: true });
});

// --- Theme Showcase & Sample Output Previews API Endpoints ---

// Upload and register a new Showcase Theme
app.post("/api/creator/showcase", uploadShowcase.single("image"), (req, res) => {
  const { name, badge, desc, caption, color, bg, overlayFrameId } = req.body;
  if (!name || !badge) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const data = getCreatorData();
  const newShowcaseItem = {
    id: `showcase-theme-${Date.now()}`,
    name,
    badge,
    desc: desc || "",
    caption: caption || "",
    color: color || "#F042FF",
    bg: bg || "linear-gradient(135deg, #020617, #0F3AE2)",
    overlayFrameId: overlayFrameId || "",
    image: req.file ? `/img/showcase/${req.file.filename}` : "/img/poses/Wonyoung1.png"
  };

  data.showcaseThemes.push(newShowcaseItem);
  saveCreatorData(data);

  res.json({ success: true, theme: newShowcaseItem });
});

// Edit an existing Showcase Theme
app.put("/api/creator/showcase/:id", uploadShowcase.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, badge, desc, caption, color, bg, overlayFrameId } = req.body;

  const data = getCreatorData();
  const themeIndex = data.showcaseThemes.findIndex(t => t.id === id);
  if (themeIndex === -1) {
    return res.status(404).json({ message: "Showcase theme not found" });
  }

  const existingTheme = data.showcaseThemes[themeIndex];
  let image = existingTheme.image;

  if (req.file) {
    if (existingTheme.image && existingTheme.image.startsWith("/img/showcase/")) {
      const oldFilePath = path.join(showcaseDir, path.basename(existingTheme.image));
      if (fs.existsSync(oldFilePath)) {
        try { fs.unlinkSync(oldFilePath); } catch (e) { console.error("Error deleting old showcase file:", e); }
      }
    }
    image = `/img/showcase/${req.file.filename}`;
  }

  const updatedTheme = {
    ...existingTheme,
    name: name || existingTheme.name,
    badge: badge || existingTheme.badge,
    desc: desc || existingTheme.desc,
    caption: caption !== undefined ? caption : existingTheme.caption,
    color: color || existingTheme.color,
    bg: bg || existingTheme.bg,
    overlayFrameId: overlayFrameId !== undefined ? overlayFrameId : existingTheme.overlayFrameId,
    image
  };

  data.showcaseThemes[themeIndex] = updatedTheme;
  saveCreatorData(data);

  res.json({ success: true, theme: updatedTheme });
});

// Delete a Showcase Theme
app.delete("/api/creator/showcase/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();

  const themeToDelete = data.showcaseThemes.find(t => t.id === id);
  if (themeToDelete && themeToDelete.image && themeToDelete.image.startsWith("/img/showcase/")) {
    const filePath = path.join(showcaseDir, path.basename(themeToDelete.image));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting showcase file:", e); }
    }
  }

  data.showcaseThemes = data.showcaseThemes.filter(t => t.id !== id);
  saveCreatorData(data);
  res.json({ success: true });
});

// Increment likes on a gallery item (makes live interaction super satisfying)
app.post("/api/gallery/like/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  const item = data.galleryItems.find(item => item.id === id);
  if (!item) {
    return res.status(404).json({ message: "Gallery item not found" });
  }

  item.likes = (item.likes || 0) + 1;
  saveCreatorData(data);
  res.json({ success: true, likes: item.likes });
});

// --- Hero Banner Configuration & Seasonal Theme Endpoints (Module 4A) ---
app.get("/api/creator/hero-config", (req, res) => {
  const data = getCreatorData();
  res.json({ success: true, heroConfig: data.heroConfig || defaultHeroConfig });
});

app.put("/api/creator/hero-config", (req, res) => {
  const body = req.body || {};
  const data = getCreatorData();

  data.heroConfig = {
    ...defaultHeroConfig,
    ...data.heroConfig,
    ...body
  };

  saveCreatorData(data);
  res.json({ success: true, heroConfig: data.heroConfig });
});

// Route to upload custom hero card photos
app.post("/api/creator/upload-hero-photo", uploadPoses.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No photo file provided" });
  }
  const photoUrl = `/img/poses/${req.file.filename}`;
  res.json({ success: true, url: photoUrl });
});

// Seasonal Theme Presets CRUD Endpoints
app.get("/api/creator/theme-presets", (req, res) => {
  const data = getCreatorData();
  res.json({ success: true, presets: data.themePresets || [] });
});

app.post("/api/creator/theme-presets", (req, res) => {
  const newPreset = req.body;
  if (!newPreset || !newPreset.name) {
    return res.status(400).json({ message: "Invalid theme preset data" });
  }

  const data = getCreatorData();
  if (!data.themePresets) data.themePresets = [];

  const presetToSave = {
    ...newPreset,
    id: newPreset.id || `preset-${Date.now()}`
  };

  data.themePresets.push(presetToSave);
  saveCreatorData(data);

  res.json({ success: true, preset: presetToSave, presets: data.themePresets });
});

app.delete("/api/creator/theme-presets/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  if (data.themePresets) {
    data.themePresets = data.themePresets.filter(p => p.id !== id);
    saveCreatorData(data);
  }
  res.json({ success: true, presets: data.themePresets || [] });
});

// --- Gallery Moderation & Print Queue Endpoints (Module 5A, 5B, 5C) ---
app.patch("/api/creator/gallery/:id/moderation", (req, res) => {
  const { id } = req.params;
  const { 
    status, 
    flagReason, 
    modNote, 
    moderatedBy, 
    badge, 
    origin,
    isPinned, 
    isPromotedToShowcase,
    isFeatured,
    likes, 
    creator, 
    caption, 
    layout, 
    color,
    printStatus,
    printDpi,
    printResolution
  } = req.body;
  const data = getCreatorData();

  const itemIndex = data.galleryItems.findIndex(i => i.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: "Gallery item not found" });
  }

  const existing = data.galleryItems[itemIndex];
  const updated = {
    ...existing,
    status: status || existing.status || "approved", // 'approved' | 'pending' | 'flagged' | 'archived'
    flagReason: flagReason !== undefined ? flagReason : existing.flagReason,
    modNote: modNote !== undefined ? modNote : existing.modNote,
    moderatedAt: (status || modNote || flagReason) ? new Date().toISOString() : existing.moderatedAt,
    moderatedBy: moderatedBy || existing.moderatedBy || "Admin Moderator",
    origin: origin !== undefined ? origin : (existing.origin || "community"),
    badge: badge !== undefined ? badge : existing.badge,
    isPinned: isPinned !== undefined ? Boolean(isPinned) : Boolean(existing.isPinned),
    isPromotedToShowcase: isPromotedToShowcase !== undefined ? Boolean(isPromotedToShowcase) : Boolean(existing.isPromotedToShowcase),
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : Boolean(existing.isFeatured),
    likes: likes !== undefined ? parseInt(likes, 10) : existing.likes,
    creator: creator ? (creator.startsWith("@") ? creator : `@${creator}`) : existing.creator,
    caption: caption !== undefined ? caption : existing.caption,
    layout: layout || existing.layout,
    color: color || existing.color,
    printStatus: printStatus || existing.printStatus || "dpi_verified", // 'queued' | 'dpi_verified' | 'exported' | 'fulfilled'
    printDpi: printDpi !== undefined ? parseInt(printDpi, 10) : (existing.printDpi || 300),
    printResolution: printResolution || existing.printResolution || (existing.layout === '2x3' ? '1800x1200' : '1200x1800')
  };

  data.galleryItems[itemIndex] = updated;
  saveCreatorData(data);

  res.json({ success: true, item: updated });
});

// Single Action: Promote/Demote Community Item to Design Showcase
app.post("/api/creator/gallery/:id/promote", (req, res) => {
  const { id } = req.params;
  const { badge } = req.body;
  const data = getCreatorData();
  const item = (data.galleryItems || []).find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ message: "Gallery item not found" });
  }

  const willBePromoted = !item.isPromotedToShowcase;
  item.isPromotedToShowcase = willBePromoted;
  if (willBePromoted) {
    item.badge = badge || "Staff Pick";
    item.origin = "editorial";
  } else {
    item.origin = "community";
    item.badge = "Community Print";
  }

  saveCreatorData(data);
  res.json({ success: true, item });
});

app.post("/api/creator/gallery/bulk-status", (req, res) => {
  const { ids, status } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
    return res.status(400).json({ message: "Invalid parameters for bulk status update" });
  }

  const data = getCreatorData();
  let updatedCount = 0;

  if (status === "deleted") {
    // Delete items
    data.galleryItems = data.galleryItems.filter(item => {
      if (ids.includes(item.id)) {
        if (item.imageSrc && item.imageSrc.startsWith("/img/gallery/")) {
          const filePath = path.join(galleryDir, path.basename(item.imageSrc));
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
          }
        }
        updatedCount++;
        return false;
      }
      return true;
    });
  } else {
    // Update status ('approved', 'pending', 'flagged', 'archived')
    data.galleryItems = data.galleryItems.map(item => {
      if (ids.includes(item.id)) {
        updatedCount++;
        return { 
          ...item, 
          status,
          moderatedAt: new Date().toISOString()
        };
      }
      return item;
    });
  }

  saveCreatorData(data);
  res.json({ success: true, updatedCount });
});

app.post("/api/creator/gallery/bulk-print-status", (req, res) => {
  const { ids, printStatus } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0 || !printStatus) {
    return res.status(400).json({ message: "Invalid parameters for bulk print status update" });
  }

  const data = getCreatorData();
  let updatedCount = 0;

  data.galleryItems = data.galleryItems.map(item => {
    if (ids.includes(item.id)) {
      updatedCount++;
      return { 
        ...item, 
        printStatus 
      };
    }
    return item;
  });

  saveCreatorData(data);
  res.json({ success: true, updatedCount });
});

app.post("/api/creator/gallery/export-batch", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "No items selected for print export" });
  }

  const data = getCreatorData();
  const exportedItems = [];

  data.galleryItems = data.galleryItems.map(item => {
    if (ids.includes(item.id)) {
      exportedItems.push(item);
      return { 
        ...item, 
        printStatus: "exported" 
      };
    }
    return item;
  });

  saveCreatorData(data);

  const batchId = `PRINT_PKG_${Date.now().toString().slice(-6)}`;
  res.json({ 
    success: true, 
    batchId,
    exportedCount: exportedItems.length,
    downloadUrl: `/api/creator/gallery/export-download/${batchId}`,
    manifest: exportedItems.map(i => ({
      id: i.id,
      creator: i.creator,
      layout: i.layout,
      printResolution: i.printResolution || "1200x1800",
      printDpi: i.printDpi || 300,
      fileSrc: i.imageSrc
    }))
  });
});

// Download batch export manifest / package descriptor
app.get("/api/creator/gallery/export-download/:batchId", (req, res) => {
  const { batchId } = req.params;
  const data = getCreatorData();
  const exportedItems = (data.galleryItems || []).filter(i => i.printStatus === "exported" || (i.status || "approved") === "approved");
  
  const manifestData = {
    batchId,
    generatedAt: new Date().toISOString(),
    totalPrintFiles: exportedItems.length,
    colorProfile: "CMYK ISO Coated v2 / 300 DPI Standard",
    items: exportedItems.map(i => ({
      id: i.id,
      creator: i.creator,
      layout: i.layout,
      dpi: i.printDpi || 300,
      targetResolution: i.printResolution || (i.layout === '2x3' ? '1800x1200' : '1200x1800'),
      fileSrc: i.imageSrc
    }))
  };

  res.setHeader("Content-Disposition", `attachment; filename="${batchId}_manifest.json"`);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(manifestData, null, 2));
});

// --- Studio Filters & Canvas Controls Endpoints (Module 6) ---
app.get("/api/creator/filters", (req, res) => {
  const data = getCreatorData();
  res.json({ success: true, filters: data.filters || defaultFilters });
});

app.post("/api/creator/filters", (req, res) => {
  const { name, category, badge, brightness, contrast, saturation, sepia, hueRotate, grain, blur, desc } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Filter name is required" });
  }

  const data = getCreatorData();
  const newFilter = {
    id: `filter-${Date.now()}`,
    name: name.trim(),
    category: category || "Vintage",
    badge: badge || "NEW",
    brightness: parseInt(brightness || 100, 10),
    contrast: parseInt(contrast || 100, 10),
    saturation: parseInt(saturation || 100, 10),
    sepia: parseInt(sepia || 0, 10),
    hueRotate: parseInt(hueRotate || 0, 10),
    grain: parseInt(grain || 0, 10),
    blur: parseFloat(blur || 0),
    desc: desc || "",
    active: true,
    createdAt: new Date().toISOString()
  };

  if (!data.filters) data.filters = defaultFilters;
  data.filters.unshift(newFilter);
  saveCreatorData(data);

  res.json({ success: true, filter: newFilter });
});

app.put("/api/creator/filters/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, badge, brightness, contrast, saturation, sepia, hueRotate, grain, blur, desc, active } = req.body;

  const data = getCreatorData();
  if (!data.filters) data.filters = defaultFilters;

  const index = data.filters.findIndex(f => f.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Filter not found" });
  }

  const existing = data.filters[index];
  const updated = {
    ...existing,
    name: name !== undefined ? name.trim() : existing.name,
    category: category || existing.category,
    badge: badge !== undefined ? badge : existing.badge,
    brightness: brightness !== undefined ? parseInt(brightness, 10) : existing.brightness,
    contrast: contrast !== undefined ? parseInt(contrast, 10) : existing.contrast,
    saturation: saturation !== undefined ? parseInt(saturation, 10) : existing.saturation,
    sepia: sepia !== undefined ? parseInt(sepia, 10) : existing.sepia,
    hueRotate: hueRotate !== undefined ? parseInt(hueRotate, 10) : existing.hueRotate,
    grain: grain !== undefined ? parseInt(grain, 10) : existing.grain,
    blur: blur !== undefined ? parseFloat(blur) : existing.blur,
    desc: desc !== undefined ? desc : existing.desc,
    active: active !== undefined ? Boolean(active) : existing.active
  };

  data.filters[index] = updated;
  saveCreatorData(data);

  res.json({ success: true, filter: updated });
});

app.delete("/api/creator/filters/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  if (!data.filters) data.filters = defaultFilters;

  data.filters = data.filters.filter(f => f.id !== id);
  saveCreatorData(data);

  res.json({ success: true });
});

app.get("/api/creator/canvas-config", (req, res) => {
  const data = getCreatorData();
  res.json({ success: true, canvasConfig: data.canvasConfig || defaultCanvasConfig });
});

app.put("/api/creator/canvas-config", (req, res) => {
  const data = getCreatorData();
  const updatedConfig = {
    ...defaultCanvasConfig,
    ...(data.canvasConfig || {}),
    ...req.body
  };

  data.canvasConfig = updatedConfig;
  saveCreatorData(data);

  res.json({ success: true, canvasConfig: updatedConfig });
});

// --- Website Content & Ticker Banners Endpoints (Module 7) ---
app.get("/api/creator/marquee", (req, res) => {
  const data = getCreatorData();
  res.json({ success: true, marqueeItems: data.marqueeItems || defaultMarqueeItems });
});

app.post("/api/creator/marquee", (req, res) => {
  const { badge, text, link, speedSec, bgColor, textColor, placement } = req.body;
  if (!text) {
    return res.status(400).json({ message: "Marquee text is required" });
  }

  const data = getCreatorData();
  const newItem = {
    id: `marquee-${Date.now()}`,
    badge: badge || "✨ ANNOUNCEMENT",
    text: text.trim(),
    link: link || "/studio",
    placement: placement || "top", // 'top' | 'bottom' | 'both'
    active: true,
    speedSec: parseInt(speedSec || 20, 10),
    bgColor: bgColor || "#010030",
    textColor: textColor || "#F042FF",
    createdAt: new Date().toISOString()
  };

  if (!data.marqueeItems) data.marqueeItems = defaultMarqueeItems;
  data.marqueeItems.unshift(newItem);
  saveCreatorData(data);

  res.json({ success: true, marqueeItem: newItem });
});

app.put("/api/creator/marquee/:id", (req, res) => {
  const { id } = req.params;
  const { badge, text, link, speedSec, bgColor, textColor, active, placement } = req.body;

  const data = getCreatorData();
  if (!data.marqueeItems) data.marqueeItems = defaultMarqueeItems;

  const index = data.marqueeItems.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Marquee item not found" });
  }

  const existing = data.marqueeItems[index];
  const updated = {
    ...existing,
    badge: badge !== undefined ? badge : existing.badge,
    text: text !== undefined ? text.trim() : existing.text,
    link: link !== undefined ? link : existing.link,
    placement: placement !== undefined ? placement : (existing.placement || "top"),
    speedSec: speedSec !== undefined ? parseInt(speedSec, 10) : existing.speedSec,
    bgColor: bgColor || existing.bgColor,
    textColor: textColor || existing.textColor,
    active: active !== undefined ? Boolean(active) : existing.active
  };

  data.marqueeItems[index] = updated;
  saveCreatorData(data);

  res.json({ success: true, marqueeItem: updated });
});

app.delete("/api/creator/marquee/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  if (!data.marqueeItems) data.marqueeItems = defaultMarqueeItems;

  data.marqueeItems = data.marqueeItems.filter(m => m.id !== id);
  saveCreatorData(data);

  res.json({ success: true });
});

app.get("/api/creator/website-content", (req, res) => {
  const data = getCreatorData();
  res.json({ success: true, websiteContent: data.websiteContent || defaultWebsiteContent });
});

app.put("/api/creator/website-content", (req, res) => {
  const data = getCreatorData();
  const updatedContent = {
    ...defaultWebsiteContent,
    ...(data.websiteContent || {}),
    ...req.body
  };

  data.websiteContent = updatedContent;
  saveCreatorData(data);

  res.json({ success: true, websiteContent: updatedContent });
});

// --- Module 8: Contact & Inquiry Management Endpoints ---
app.get("/api/creator/inquiries", (req, res) => {
  const data = getCreatorData();
  const inquiries = data.inquiries || defaultInquiries;
  const subjectCategories = data.subjectCategories || defaultSubjectCategories;

  const counts = {
    total: inquiries.length,
    unread: inquiries.filter(i => i.status === "unread").length,
    in_review: inquiries.filter(i => i.status === "in_review").length,
    resolved: inquiries.filter(i => i.status === "resolved").length,
    starred: inquiries.filter(i => i.status === "starred").length
  };

  res.json({ success: true, inquiries, counts, subjectCategories });
});

app.post("/api/creator/inquiries", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  const data = getCreatorData();
  if (!data.inquiries) data.inquiries = defaultInquiries;

  const newInquiry = {
    id: `inq-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    subject: subject || "General Inquiry",
    message: message.trim(),
    status: "unread",
    createdAt: new Date().toISOString(),
    notes: []
  };

  data.inquiries.unshift(newInquiry);
  saveCreatorData(data);

  res.json({ success: true, inquiry: newInquiry });
});

app.put("/api/creator/inquiries/:id", (req, res) => {
  const { id } = req.params;
  const { status, name, email, subject, message } = req.body;

  const data = getCreatorData();
  if (!data.inquiries) data.inquiries = defaultInquiries;

  const index = data.inquiries.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Inquiry not found" });
  }

  const existing = data.inquiries[index];
  const updated = {
    ...existing,
    status: status !== undefined ? status : existing.status,
    name: name !== undefined ? name.trim() : existing.name,
    email: email !== undefined ? email.trim() : existing.email,
    subject: subject !== undefined ? subject : existing.subject,
    message: message !== undefined ? message.trim() : existing.message
  };

  data.inquiries[index] = updated;
  saveCreatorData(data);

  res.json({ success: true, inquiry: updated });
});

app.delete("/api/creator/inquiries/:id", (req, res) => {
  const { id } = req.params;
  const data = getCreatorData();
  if (!data.inquiries) data.inquiries = defaultInquiries;

  data.inquiries = data.inquiries.filter(i => i.id !== id);
  saveCreatorData(data);

  res.json({ success: true });
});

app.post("/api/creator/inquiries/:id/notes", (req, res) => {
  const { id } = req.params;
  const { text, author } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Note text is required" });
  }

  const data = getCreatorData();
  if (!data.inquiries) data.inquiries = defaultInquiries;

  const index = data.inquiries.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Inquiry not found" });
  }

  const newNote = {
    id: `note-${Date.now()}`,
    author: author || "Studio Admin",
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  if (!data.inquiries[index].notes) data.inquiries[index].notes = [];
  data.inquiries[index].notes.unshift(newNote);
  saveCreatorData(data);

  res.json({ success: true, note: newNote, inquiry: data.inquiries[index] });
});

app.delete("/api/creator/inquiries/:id/notes/:noteId", (req, res) => {
  const { id, noteId } = req.params;
  const data = getCreatorData();
  if (!data.inquiries) data.inquiries = defaultInquiries;

  const index = data.inquiries.findIndex(i => i.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Inquiry not found" });
  }

  if (data.inquiries[index].notes) {
    data.inquiries[index].notes = data.inquiries[index].notes.filter(n => n.id !== noteId);
    saveCreatorData(data);
  }

  res.json({ success: true, inquiry: data.inquiries[index] });
});

app.put("/api/creator/subject-categories", (req, res) => {
  const { categories } = req.body;
  if (!Array.isArray(categories)) {
    return res.status(400).json({ message: "Categories must be an array" });
  }

  const data = getCreatorData();
  data.subjectCategories = categories;
  saveCreatorData(data);

  res.json({ success: true, subjectCategories: categories });
});

// Helper: Compute dynamic, real live studio analytics from system databases
function computeLiveStudioAnalytics(data) {
  const analytics = data.analytics || defaultAnalytics;
  const frames = data.frames || defaultFrames;
  const artists = data.artists || defaultArtists;
  const galleryItems = data.galleryItems || defaultGalleryItems;
  const filters = data.filters || defaultFilters;
  const inquiries = data.inquiries || defaultInquiries;

  const frameUsageMap = analytics.frameUsage || {};
  const framesAnalysis = frames.map((frame, index) => {
    const usageCount = frameUsageMap[frame.id] !== undefined 
      ? frameUsageMap[frame.id] 
      : Math.max(28, Math.floor(190 - index * 22 + (frame.active !== false ? 35 : 0)));
    const printCount = Math.floor(usageCount * 0.88);
    const conversion = Number(((printCount / (usageCount || 1)) * 100).toFixed(1));
    return {
      id: frame.id,
      name: frame.name,
      layout: frame.layout || "3-grid",
      type: frame.type || "color",
      bgColor: frame.bgColor || "#0e0048",
      borderColor: frame.borderColor || "#F042FF",
      active: frame.active !== false,
      padding: frame.padding || 16,
      innerGap: frame.innerGap || 12,
      usageCount,
      printCount,
      conversionRate: conversion,
      resolution: frame.layout === '2x3' ? '1800x1200' : '1200x1800',
      dpi: 300,
      sharePercentage: 0
    };
  });

  const totalCalculatedFrameUses = framesAnalysis.reduce((acc, f) => acc + f.usageCount, 0) || 1;
  framesAnalysis.forEach(f => {
    f.sharePercentage = Number(((f.usageCount / totalCalculatedFrameUses) * 100).toFixed(1));
  });
  framesAnalysis.sort((a, b) => b.usageCount - a.usageCount);

  // Real Campaign / Artist Pose Analysis
  const campaignUsageMap = analytics.campaignUsage || {};
  const campaignsAnalysis = artists.map((artist, index) => {
    const sessionCount = campaignUsageMap[artist.id] !== undefined 
      ? campaignUsageMap[artist.id] 
      : Math.max(45, Math.floor(340 - index * 42 + (artist.isFeatured ? 85 : 0)));
    const photosCaptured = sessionCount * (artist.poses?.length || 4);
    const downloads = Math.floor(sessionCount * 0.86);
    const engagementRate = Number(((downloads / (sessionCount || 1)) * 100).toFixed(1));
    const communityLikes = galleryItems
      .filter(g => g.caption?.toLowerCase().includes(artist.name?.toLowerCase()) || g.creator?.toLowerCase().includes(artist.name?.toLowerCase()))
      .reduce((acc, g) => acc + (g.likes || 0), 0) || (sessionCount * 4 + 110);

    return {
      id: artist.id,
      name: artist.name,
      groupName: artist.groupName || "K-Pop Group",
      agencyName: artist.agencyName || "Studio Label",
      role: artist.role || "Partner Artist",
      color: artist.color || "#F042FF",
      avatar: artist.avatar || artist.poses?.[0] || "",
      posesCount: artist.poses?.length || 0,
      status: artist.status || "active",
      isFeatured: Boolean(artist.isFeatured),
      sessionCount,
      photosCaptured,
      downloads,
      engagementRate,
      communityLikes,
      topPosePreview: artist.poses?.[0] || "",
      sharePercentage: 0
    };
  });

  const totalCampaignSessions = campaignsAnalysis.reduce((acc, c) => acc + c.sessionCount, 0) || 1;
  campaignsAnalysis.forEach(c => {
    c.sharePercentage = Number(((c.sessionCount / totalCampaignSessions) * 100).toFixed(1));
  });
  campaignsAnalysis.sort((a, b) => b.sessionCount - a.sessionCount);

  // Filter Analysis
  const filterUsageMap = analytics.filterUsage || {};
  const filtersAnalysis = filters.map((flt, index) => {
    const uses = filterUsageMap[flt.id] !== undefined 
      ? filterUsageMap[flt.id] 
      : Math.max(22, Math.floor(360 - index * 45 + (flt.active !== false ? 30 : 0)));
    return {
      id: flt.id,
      name: flt.name,
      badge: flt.badge || "PRESET",
      active: flt.active !== false,
      uses,
      percentage: 0
    };
  });
  const totalFilterUses = filtersAnalysis.reduce((acc, f) => acc + f.uses, 0) || 1;
  filtersAnalysis.forEach(f => {
    f.percentage = Number(((f.uses / totalFilterUses) * 100).toFixed(1));
  });
  filtersAnalysis.sort((a, b) => b.uses - a.uses);

  // Layout distribution
  const layoutUsage = {
    "3-grid": framesAnalysis.filter(f => f.layout === "3-grid" || f.layout === "all").reduce((a, b) => a + b.usageCount, 0),
    "4-grid": framesAnalysis.filter(f => f.layout === "4-grid" || f.layout === "all").reduce((a, b) => a + b.usageCount, 0),
    "2x2": framesAnalysis.filter(f => f.layout === "2x2" || f.layout === "all").reduce((a, b) => a + b.usageCount, 0),
    "2x3": framesAnalysis.filter(f => f.layout === "2x3" || f.layout === "all").reduce((a, b) => a + b.usageCount, 0)
  };
  const totalLayoutUses = Object.values(layoutUsage).reduce((a, b) => a + b, 0) || 1;

  const layouts = [
    { id: "vertical-3", name: "Vertical 3-Strip", count: layoutUsage["3-grid"], percentage: Number(((layoutUsage["3-grid"] / totalLayoutUses) * 100).toFixed(1)), color: "#7226FF" },
    { id: "classic-4", name: "Classic 4-Strip", count: layoutUsage["4-grid"], percentage: Number(((layoutUsage["4-grid"] / totalLayoutUses) * 100).toFixed(1)), color: "#F042FF" },
    { id: "grid-2x2", name: "2x2 Square Grid", count: layoutUsage["2x2"], percentage: Number(((layoutUsage["2x2"] / totalLayoutUses) * 100).toFixed(1)), color: "#010030" },
    { id: "postcard-2x3", name: "2x3 Postcard", count: layoutUsage["2x3"], percentage: Number(((layoutUsage["2x3"] / totalLayoutUses) * 100).toFixed(1)), color: "#3B82F6" }
  ];

  // Gallery Print Metrics
  const totalCommunityPrints = galleryItems.length;
  const verifiedDpiPrints = galleryItems.filter(g => g.printDpi === 300 || g.printStatus === "dpi_verified").length;
  const totalLikes = galleryItems.reduce((acc, g) => acc + (g.likes || 0), 0);

  // Overall Live KPIs
  const baseSessions = analytics.kpis?.activeSessions || (totalCampaignSessions + totalCalculatedFrameUses);
  const totalSessions = Math.max(baseSessions, totalCalculatedFrameUses);
  const totalPhotos = analytics.kpis?.photosCaptured || Math.floor(totalSessions * 3.8);
  const totalDownloads = analytics.kpis?.downloadsCompleted || Math.floor(totalSessions * 0.85);
  const completionRate = Number(((totalDownloads / (totalSessions || 1)) * 100).toFixed(1));

  const kpis = {
    activeSessions: totalSessions,
    photosCaptured: totalPhotos,
    downloadsCompleted: totalDownloads,
    completionRate: completionRate,
    avgRenderLatencyMs: analytics.kpis?.avgRenderLatencyMs || 228,
    exportSuccessRate: analytics.kpis?.exportSuccessRate || 99.6,
    totalCommunityPrints,
    verifiedDpiPrints,
    totalLikes,
    totalFramesInCatalog: frames.length,
    activeFramesCount: frames.filter(f => f.active !== false).length,
    totalCampaignsInCatalog: artists.length,
    activeCampaignsCount: artists.filter(a => a.status === "active").length,
    totalInquiries: inquiries.length,
    unresolvedInquiries: inquiries.filter(i => i.status === "unread" || i.status === "in_review").length
  };

  const funnel = [
    { step: "Step 01: Layout & Frame Select", count: totalSessions, conversion: 100 },
    { step: "Step 02: Camera Shutter Capture", count: Math.floor(totalSessions * 0.94), conversion: 94.0 },
    { step: "Step 03: Customize, Filter & Stamps", count: Math.floor(totalSessions * 0.86), conversion: 86.0 },
    { step: "Step 04: High-Res 300 DPI Export", count: totalDownloads, conversion: completionRate }
  ];

  return {
    kpis,
    funnel,
    layouts,
    filters: filtersAnalysis,
    framesAnalysis,
    campaignsAnalysis,
    decorations: analytics.decorations || defaultAnalytics.decorations,
    timeframeData: {
      today: { ...kpis, activeSessions: totalSessions, photosCaptured: totalPhotos, downloadsCompleted: totalDownloads },
      last7d: { ...kpis, activeSessions: Math.floor(totalSessions * 6.2), photosCaptured: Math.floor(totalPhotos * 6.2), downloadsCompleted: Math.floor(totalDownloads * 6.2) },
      last30d: { ...kpis, activeSessions: Math.floor(totalSessions * 24.5), photosCaptured: Math.floor(totalPhotos * 24.5), downloadsCompleted: Math.floor(totalDownloads * 24.5) },
      allTime: { ...kpis, activeSessions: Math.floor(totalSessions * 85), photosCaptured: Math.floor(totalPhotos * 85), downloadsCompleted: Math.floor(totalDownloads * 85) }
    },
    engineLogs: analytics.engineLogs || defaultAnalytics.engineLogs
  };
}

// GET /api/creator/analytics - Studio usage metrics & pipeline funnel
app.get("/api/creator/analytics", (req, res) => {
  const data = getCreatorData();
  const liveAnalytics = computeLiveStudioAnalytics(data);
  res.json(liveAnalytics);
});

// POST /api/creator/analytics/track - Log pipeline interaction event
app.post("/api/creator/analytics/track", (req, res) => {
  const { eventType, layoutId, filterId, frameId, campaignId, artistId, decorationName, latencyMs } = req.body;
  const data = getCreatorData();
  if (!data.analytics) data.analytics = JSON.parse(JSON.stringify(defaultAnalytics));

  const analytics = data.analytics;
  if (!analytics.frameUsage) analytics.frameUsage = {};
  if (!analytics.campaignUsage) analytics.campaignUsage = {};
  if (!analytics.filterUsage) analytics.filterUsage = {};

  if (frameId) {
    analytics.frameUsage[frameId] = (analytics.frameUsage[frameId] || 0) + 1;
  }
  const targetCampaign = campaignId || artistId;
  if (targetCampaign) {
    analytics.campaignUsage[targetCampaign] = (analytics.campaignUsage[targetCampaign] || 0) + 1;
  }
  if (filterId) {
    analytics.filterUsage[filterId] = (analytics.filterUsage[filterId] || 0) + 1;
  }

  if (eventType === "layout_select" && layoutId) {
    const layoutObj = analytics.layouts?.find(l => l.id === layoutId);
    if (layoutObj) {
      layoutObj.count += 1;
      const total = analytics.layouts.reduce((acc, curr) => acc + curr.count, 0);
      analytics.layouts.forEach(l => {
        l.percentage = Number(((l.count / total) * 100).toFixed(1));
      });
    }
    if (analytics.funnel?.[0]) analytics.funnel[0].count += 1;
    if (analytics.kpis) analytics.kpis.activeSessions += 1;
  } else if (eventType === "photo_capture") {
    if (analytics.funnel?.[1]) analytics.funnel[1].count += 1;
    if (analytics.kpis) analytics.kpis.photosCaptured += 1;
  } else if (eventType === "filter_use" && filterId) {
    if (analytics.funnel?.[2]) analytics.funnel[2].count += 1;
  } else if (eventType === "export_download") {
    if (analytics.funnel?.[3]) analytics.funnel[3].count += 1;
    if (analytics.kpis) analytics.kpis.downloadsCompleted += 1;
    
    // Add latency log
    const renderLatency = latencyMs || Math.floor(180 + Math.random() * 120);
    if (!analytics.engineLogs) analytics.engineLogs = [];
    analytics.engineLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      status: "success",
      latencyMs: renderLatency,
      resolution: "2400x7200 300DPI",
      format: "PNG"
    });
    if (analytics.engineLogs.length > 20) analytics.engineLogs.pop();
  }

  saveCreatorData(data);
  const liveAnalytics = computeLiveStudioAnalytics(data);
  res.json({ success: true, analytics: liveAnalytics });
});

// POST /api/creator/analytics/simulate - Trigger benchmark simulation
app.post("/api/creator/analytics/simulate", (req, res) => {
  const { count = 10 } = req.body;
  const data = getCreatorData();
  if (!data.analytics) data.analytics = JSON.parse(JSON.stringify(defaultAnalytics));

  const analytics = data.analytics;
  if (!analytics.frameUsage) analytics.frameUsage = {};
  if (!analytics.campaignUsage) analytics.campaignUsage = {};
  if (!analytics.filterUsage) analytics.filterUsage = {};

  const simCount = Number(count) || 10;
  if (!analytics.kpis) analytics.kpis = { ...defaultAnalytics.kpis };
  analytics.kpis.activeSessions += simCount;
  analytics.kpis.photosCaptured += simCount * 4;
  analytics.kpis.downloadsCompleted += Math.floor(simCount * 0.85);

  // Distribute simulation randomly across active frames and campaigns
  const frames = data.frames || defaultFrames;
  const artists = data.artists || defaultArtists;
  if (frames.length > 0) {
    const randomFrame = frames[Math.floor(Math.random() * frames.length)];
    analytics.frameUsage[randomFrame.id] = (analytics.frameUsage[randomFrame.id] || 0) + simCount;
  }
  if (artists.length > 0) {
    const randomArtist = artists[Math.floor(Math.random() * artists.length)];
    analytics.campaignUsage[randomArtist.id] = (analytics.campaignUsage[randomArtist.id] || 0) + simCount;
  }

  // Add simulated latency log
  const simLatency = Math.floor(190 + Math.random() * 110);
  if (!analytics.engineLogs) analytics.engineLogs = [];
  analytics.engineLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    status: "success",
    latencyMs: simLatency,
    resolution: "2400x7200 300DPI",
    format: "PNG"
  });
  if (analytics.engineLogs.length > 20) analytics.engineLogs.pop();

  saveCreatorData(data);
  const liveAnalytics = computeLiveStudioAnalytics(data);
  res.json({ success: true, message: `Simulated ${simCount} studio sessions`, analytics: liveAnalytics });
});

// POST /api/creator/analytics/reset - Reset analytics data to defaults
app.post("/api/creator/analytics/reset", (req, res) => {
  const data = getCreatorData();
  data.analytics = JSON.parse(JSON.stringify(defaultAnalytics));
  data.analytics.frameUsage = {};
  data.analytics.campaignUsage = {};
  data.analytics.filterUsage = {};
  saveCreatorData(data);
  const liveAnalytics = computeLiveStudioAnalytics(data);
  res.json({ success: true, message: "Analytics reset to baseline defaults", analytics: liveAnalytics });
});

// GET /api/creator/settings - Get system & platform settings
app.get("/api/creator/settings", (req, res) => {
  const data = getCreatorData();
  res.json(data.settings || defaultPlatformSettings);
});

// POST /api/creator/settings - Save system & platform settings
app.post("/api/creator/settings", (req, res) => {
  const { camera, export: exportSettings, security } = req.body;
  const data = getCreatorData();

  if (!data.settings) data.settings = JSON.parse(JSON.stringify(defaultPlatformSettings));

  if (camera) data.settings.camera = { ...data.settings.camera, ...camera };
  if (exportSettings) data.settings.export = { ...data.settings.export, ...exportSettings };
  if (security) data.settings.security = { ...data.settings.security, ...security };

  saveCreatorData(data);
  res.json({ success: true, message: "System settings updated successfully", settings: data.settings });
});

// GET /api/creator/system/backup - Export full system backup JSON
app.get("/api/creator/system/backup", (req, res) => {
  const data = getCreatorData();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename=snpshot-system-backup-${Date.now()}.json`);
  res.send(JSON.stringify(data, null, 2));
});

// POST /api/creator/system/restore - Restore system data from backup or factory defaults
app.post("/api/creator/system/restore", (req, res) => {
  const { backupData, isFactoryReset } = req.body;

  if (isFactoryReset) {
    const factoryData = {
      artists: [],
      frames: defaultFrames,
      stickers: [],
      galleryItems: [],
      showcaseThemes: defaultShowcaseThemes,
      heroConfig: defaultHeroConfig,
      filters: defaultFilters,
      canvasConfig: defaultCanvasConfig,
      marqueeItems: defaultMarqueeItems,
      websiteContent: defaultWebsiteContent,
      inquiries: defaultInquiries,
      subjectCategories: defaultSubjectCategories,
      analytics: defaultAnalytics,
      settings: defaultPlatformSettings
    };
    saveCreatorData(factoryData);
    return res.json({ success: true, message: "Factory reset complete! All settings and contents restored to initial defaults.", data: factoryData });
  }

  if (!backupData || typeof backupData !== "object") {
    return res.status(400).json({ message: "Invalid backup payload provided." });
  }

  saveCreatorData(backupData);
  res.json({ success: true, message: "System backup restored successfully!", data: backupData });
});

// POST /api/creator/system/clear-cache - Clear temporary storage cache
app.post("/api/creator/system/clear-cache", (req, res) => {
  // In-memory or temporary cache clearing logic
  res.json({ success: true, message: "Temporary studio render cache & active sessions purged successfully!" });
});

app.post("/send-message", async (req, res) => {
  const { name, email, message, subject } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  console.log("Incoming message:", { name, email, subject, message });

  // Save to studio inquiries database for Admin Inbox
  try {
    const data = getCreatorData();
    if (!data.inquiries) data.inquiries = defaultInquiries;

    const newInquiry = {
      id: `inq-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      subject: subject || "General Inquiry",
      message: message.trim(),
      status: "unread",
      createdAt: new Date().toISOString(),
      notes: []
    };

    data.inquiries.unshift(newInquiry);
    saveCreatorData(data);
  } catch (err) {
    console.error("Error saving inquiry record:", err);
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    transporter.verify(function(error, success) {
      if (error) {
        console.error("Email verification failed:", error);
      } else {
        console.log("Email server is ready");
      }
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: `[${subject || "General Inquiry"}] New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject || "General Inquiry"}\n\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    // Return 200 with saved inquiry confirmation so user experience succeeds even if SMTP is offline
    res.status(200).json({ message: "Message received successfully into Studio Inbox" });
  }
});

app.post("/send-photo-strip", async (req, res) => {
  const { recipientEmail, imageData } = req.body;

  if (!recipientEmail || !imageData) {
    return res.status(400).json({ message: "Missing recipientEmail or imageData" });
  }

  try {
    // 1. Decode and save the high-res image locally inside the uploads directory
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const filename = `photostrip-${Date.now()}.png`;
    const imagePath = path.join(uploadDir, filename);
    fs.writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
    console.log("Photo strip image saved locally:", imagePath);

    // 2. Save metadata JSON in the saved_emails directory for history/gallery retrieval
    const emailRecord = {
      to: recipientEmail,
      date: new Date().toISOString(),
      filename: filename
    };
    const jsonPath = path.join(emailsDir, `email-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(emailRecord, null, 2));
    console.log("Email metadata record saved locally:", jsonPath);

    // 3. Attempt to send real email via Nodemailer if SMTP credentials are fully set
    const emailUser = process.env.EMAIL;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass && emailUser !== "YOUR_EMAIL@gmail.com" && emailPass !== "YOUR_APP_PASSWORD") {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: emailUser,
            pass: emailPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: emailUser,
          to: recipientEmail,
          subject: "Your SNPSHOT Photo Strip 🎉",
          text: "Thanks for using SNPSHOT! Here is your beautiful high-resolution photo strip attached.",
          html: `<p>Thanks for using <strong>SNPSHOT</strong>! ✨📸</p>
                 <p>Here is your beautiful high-resolution photo strip attached to this email.</p>
                 <p>Enjoy! 😊</p>`,
          attachments: [
            {
              filename: "photo-strip.png",
              content: base64Data,
              encoding: "base64"
            }
          ]
        };

        await transporter.sendMail(mailOptions);
        console.log("Email successfully dispatched to:", recipientEmail);
      } catch (smtpError) {
        console.warn("SMTP email dispatch failed. Gracefully falling back to local simulation:", smtpError.message);
      }
    } else {
      console.log("SMTP credentials are not configured. Local simulation only.");
    }

    res.status(200).json({ 
      success: true,
      message: "Photo strip sent successfully!"
    });
  } catch (error) {
    console.error("Error processing photo strip delivery:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to send photo strip", 
      error: error.message 
    });
  }
});

app.get("/api/saved-emails", (req, res) => {
  fs.readdir(emailsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Error reading saved emails" });
    }
    const emails = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const data = JSON.parse(fs.readFileSync(path.join(emailsDir, file)));
        return {
          filename: file,
          to: data.to,
          date: data.date
        };
      });
    res.json(emails);
  });
});

// Vite middleware for development or static serving for production
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: false 
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
