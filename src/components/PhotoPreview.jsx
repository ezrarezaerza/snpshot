import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { 
  Download, Printer, Mail, Layout, Sliders, Palette, Layers, RefreshCw, 
  Undo, Trash2, Shield, Settings, Check, Activity, Share2, Globe, Sparkles, 
  CheckCircle2, X, ChevronLeft, ChevronRight, ChevronDown, ArrowRight, ArrowLeft,
  Copy, RotateCw, Heart, Tag, Eye, Package, Truck, ExternalLink, SlidersHorizontal, Image as ImageIcon
} from "lucide-react";
import Navbar from "./Navbar";
import "../App.css";
import { playClickSound, playSuccessChime, playStickerPopSound } from "../utils/audio";
import { normalizeMediaUrl } from "../utils/blobClient";

const layoutConfigs = {
  '2x2': {
    padding: 40,
    spacing: 30,
    imgWidth: 300,
    imgHeight: 400,
    getCanvasDimensions: function() {
      return {
        width: this.imgWidth * 2 + this.spacing + this.padding * 2,
        height: 50 + this.imgHeight * 2 + this.spacing + this.padding * 2 + 50
      };
    },
    getPhotoPosition: function(index) {
      return {
        x: this.padding + (index % 2) * (this.imgWidth + this.spacing),
        y: 50 + this.padding + Math.floor(index / 2) * (this.imgHeight + this.spacing)
      };
    }
  },
  '3x2': {
    padding: 40,
    spacing: 20,
    imgWidth: 350,
    imgHeight: 300,
    getCanvasDimensions: function() {
      return {
        width: this.imgWidth * 2 + this.spacing + this.padding * 2,
        height: 50 + this.imgHeight * 3 + this.spacing * 2 + this.padding * 2 + 50
      };
    },
    getPhotoPosition: function(index) {
      const column = index % 2;
      const row = Math.floor(index / 2);
      return {
        x: this.padding + column * (this.imgWidth + this.spacing),
        y: 50 + this.padding + row * (this.imgHeight + this.spacing)
      };
    }
  },
  '3-grid': {
    padding: 40,
    spacing: 20,
    imgWidth: 400,
    imgHeight: 300,
    getCanvasDimensions: function() {
      return {
        width: this.imgWidth + this.padding * 2,
        height: this.imgHeight * 3 + this.spacing * 2 + this.padding * 2 + 80
      };
    },
    getPhotoPosition: function(index) {
      return {
        x: this.padding,
        y: this.padding + index * (this.imgHeight + this.spacing)
      };
    }
  },
  '4-grid': {
    padding: 40,
    spacing: 5,
    imgWidth: 400,
    imgHeight: 300,
    getCanvasDimensions: function() {
      return {
        width: this.imgWidth + this.padding * 2,
        height: 80 + this.imgHeight * 4 + this.spacing * 3 + this.padding * 2 + 10
      };
    },
    getPhotoPosition: function(index) {
      return {
        x: this.padding,
        y: 80 + this.padding + index * (this.imgHeight + this.spacing)
      };
    }
  }
};

const drawFallback = (theme, layout, photoCount, ctx, canvasWidth, canvasHeight) => {
  const config = layoutConfigs[layout] || (photoCount === 3 ? layoutConfigs['3-grid'] : layoutConfigs['4-grid']);
  if (!config) return;

  ctx.save();

  const drawHeart = (cx, cy, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + size * 0.3);
    ctx.bezierCurveTo(cx - size * 0.5, cy - size * 0.5, cx - size, cy + size * 0.1, cx, cy + size * 0.95);
    ctx.bezierCurveTo(cx + size, cy + size * 0.1, cx + size * 0.5, cy - size * 0.5, cx, cy + size * 0.3);
    ctx.closePath();
    ctx.fill();
  };

  const drawSparkle = (cx, cy, size, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.closePath();
    ctx.fill();
  };

  const drawFlower = (cx, cy, size, petalColor, centerColor) => {
    ctx.fillStyle = petalColor;
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      const px = cx + Math.cos(angle) * (size * 0.5);
      const py = cy + Math.sin(angle) * (size * 0.5);
      ctx.beginPath();
      ctx.arc(px, py, size * 0.4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = centerColor;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.3, 0, 2 * Math.PI);
    ctx.fill();
  };

  const count = layout === '3x2' ? 6 : (layout === '2x2' ? 4 : (photoCount || 4));

  if (theme === 'classic') {
    ctx.strokeStyle = "#00F2FE";
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvasWidth - 20, canvasHeight - 20);

    ctx.strokeStyle = "#FF00FF";
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, canvasWidth - 32, canvasHeight - 32);

    for (let i = 0; i < count; i++) {
      const pos = config.getPhotoPosition(i);
      if (pos) {
        ctx.strokeStyle = "#00F2FE";
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x - 2, pos.y - 2, config.imgWidth + 4, config.imgHeight + 4);
      }
    }

  } else if (theme === 'floral') {
    ctx.strokeStyle = "#ffb3d9";
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, canvasWidth - 24, canvasHeight - 24);

    drawFlower(30, 30, 15, "#ffb3d9", "#fff066");
    drawFlower(canvasWidth - 30, 30, 15, "#ffb3d9", "#fff066");
    drawFlower(30, canvasHeight - 30, 15, "#ffb3d9", "#fff066");
    drawFlower(canvasWidth - 30, canvasHeight - 30, 15, "#ffb3d9", "#fff066");

    for (let i = 0; i < count; i++) {
      const pos = config.getPhotoPosition(i);
      if (pos) {
        ctx.strokeStyle = "#ffb3d9";
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x - 2, pos.y - 2, config.imgWidth + 4, config.imgHeight + 4);

        drawFlower(pos.x - 5, pos.y - 5, 8, "#ffb3d9", "#fff066");
        drawFlower(pos.x + config.imgWidth + 5, pos.y + config.imgHeight + 5, 8, "#ff99c8", "#fff066");
      }
    }

  } else if (theme === 'vintage') {
    ctx.strokeStyle = "#8B5A2B";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, canvasWidth - 24, canvasHeight - 24);

    ctx.strokeStyle = "#CD853F";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, canvasWidth - 36, canvasHeight - 36);

    for (let i = 0; i < count; i++) {
      const pos = config.getPhotoPosition(i);
      if (pos) {
        ctx.strokeStyle = "#2e1d0c";
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x - 3, pos.y - 3, config.imgWidth + 6, config.imgHeight + 6);
        
        ctx.strokeStyle = "#FFF8DC";
        ctx.lineWidth = 1;
        ctx.strokeRect(pos.x - 1, pos.y - 1, config.imgWidth + 2, config.imgHeight + 2);
      }
    }

  } else if (theme === 'modern') {
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, "#FF00FF");
    gradient.addColorStop(0.5, "#8A2BE2");
    gradient.addColorStop(1, "#00F2FE");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, canvasWidth - 24, canvasHeight - 24);

    for (let i = 0; i < count; i++) {
      const pos = config.getPhotoPosition(i);
      if (pos) {
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x - 3, pos.y - 3, config.imgWidth + 6, config.imgHeight + 6);
      }
    }

  } else if (theme === 'cute') {
    ctx.strokeStyle = "#FF00FF";
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, canvasWidth - 24, canvasHeight - 24);

    drawHeart(35, 35, 12, "#ff4d88");
    drawSparkle(canvasWidth - 35, 35, 10, "#00F2FE");
    drawSparkle(35, canvasHeight - 35, 10, "#00F2FE");
    drawHeart(canvasWidth - 35, canvasHeight - 35, 12, "#ff4d88");

    for (let i = 0; i < count; i++) {
      const pos = config.getPhotoPosition(i);
      if (pos) {
        ctx.strokeStyle = "#FF00FF";
        ctx.lineWidth = 3;
        ctx.strokeRect(pos.x - 2, pos.y - 2, config.imgWidth + 4, config.imgHeight + 4);

        drawHeart(pos.x - 4, pos.y - 4, 6, "#ff4d88");
        drawSparkle(pos.x + config.imgWidth + 4, pos.y - 4, 6, "#00F2FE");
      }
    }
  }

  ctx.restore();
};

const drawThemedFrame = async (theme, layout, photoCount, ctx, canvasWidth, canvasHeight, imageSrc) => {
  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      const normalized = normalizeMediaUrl(imageSrc);
      if (normalized && !normalized.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.src = normalized;
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (err) => {
        if (imageSrc && (imageSrc.includes("Angry_Frame") || imageSrc.includes("Angry Frame")) && !img._triedFallback) {
          img._triedFallback = true;
          img.src = "/img/themes/3-Photo Grid-Angry Frame.png";
        } else {
          reject(err);
        }
      };
    });
  } catch (error) {
    console.warn("Frame image failed to load, rendering fallback for theme", theme, ":", imageSrc);
    drawFallback(theme, layout, photoCount, ctx, canvasWidth, canvasHeight);
  }
};

const frames = {
  none: {
    id: "none",
    name: "Clean Studio Borders",
    type: "none",
    draw: () => Promise.resolve(), 
  }
};

const layoutsToBuild = [
  { prefix: 'grid-3', layout: '3-grid', count: 3, imgSubdir: 'grid-3' },
  { prefix: 'grid-4', layout: '4-grid', count: 4, imgSubdir: 'grid-4' },
  { prefix: '2x2', layout: '2x2', count: 4, imgSubdir: '2x2' },
  { prefix: '3x2', layout: '3x2', count: 6, imgSubdir: '3x2' }
];

const themesToBuild = [
  { id: 'classic', name: 'Classic Frame', filename: 'classic.png' },
  { id: 'floral', name: 'Floral Frame', filename: 'floral.png' },
  { id: 'vintage', name: 'Vintage Frame', filename: 'vintage.png' },
  { id: 'modern', name: 'Modern Frame', filename: 'modern.png' },
  { id: 'cute', name: 'Cute Frame', filename: 'cute.png' }
];

layoutsToBuild.forEach(({ prefix, layout, count, imgSubdir }) => {
  themesToBuild.forEach(({ id, name, filename }) => {
    const frameId = `${prefix}-${id}`;
    let imageSrc = `/img/frames/${imgSubdir}/${filename}`;
    
    frames[frameId] = {
      id: frameId,
      name,
      type: "vector",
      layout,
      draw: (ctx, w, h) => drawThemedFrame(id, layout, count, ctx, w, h, imageSrc)
    };
  });
});

// Register custom Angry Frame for 3-Photo Grid with blob storage proxy & local fallback
const ANGRY_FRAME_BLOB_SRC = "/api/blob/proxy?url=https%3A%2F%2F4gjcgshhaspf84hn.private.blob.vercel-storage.com%2Fframes%2F3-Photo_Grid-Angry_Frame.png";
const ANGRY_FRAME_LOCAL_SRC = "/img/themes/3-Photo Grid-Angry Frame.png";

frames['grid-3-angry'] = {
  id: 'grid-3-angry',
  name: "Angry Frame (3-Grid)",
  type: "png",
  badge: "POPULAR",
  layout: "3-grid",
  imageSrc: ANGRY_FRAME_BLOB_SRC,
  fallbackSrc: ANGRY_FRAME_LOCAL_SRC,
  draw: (ctx, w, h) => drawThemedFrame('angry', '3-grid', 3, ctx, w, h, ANGRY_FRAME_BLOB_SRC)
};
frames['3-grid-angry'] = frames['grid-3-angry'];

const getAvailableFrames = (layout, photoCount) => {
  const normLayout = layout === 'grid' 
    ? (photoCount === 3 ? '3-grid' : '4-grid') 
    : layout;

  const validPrefixes = [];
  if (normLayout === '3-grid' || photoCount === 3) {
    validPrefixes.push('grid-3', '3-grid', '3-photo');
  } else if (normLayout === '4-grid' || photoCount === 4) {
    validPrefixes.push('grid-4', '4-grid', '4-photo');
  } else if (normLayout === '2x2') {
    validPrefixes.push('2x2');
  } else if (normLayout === '3x2' || normLayout === '2x3') {
    validPrefixes.push('3x2', '2x3');
  }

  const result = [
    {
      id: 'none',
      rawId: 'none',
      name: 'Clean Studio Borders',
      type: 'none',
      badge: 'CLEAN',
      description: 'Solid or gradient backdrop without graphic overlay'
    }
  ];

  const seenIds = new Set(['none']);
  const seenNames = new Set(['clean studio borders', 'no frame']);

  Object.entries(frames).forEach(([key, val]) => {
    if (key === 'none' || !val) return;
    const frameId = val.id || key;
    const name = val.name || key;
    const normName = name.toLowerCase().trim();

    const matchesPrefix = validPrefixes.some(p => key.startsWith(p));
    const matchesLayout = val.layout === 'all' || val.layout === normLayout || (val.layout && validPrefixes.includes(val.layout));
    const isAdmin = key.startsWith('admin-') || val.layout === 'all';

    if ((matchesPrefix || matchesLayout || isAdmin) && !seenIds.has(frameId) && !seenNames.has(normName)) {
      seenIds.add(frameId);
      seenNames.add(normName);
      result.push({
        id: key,
        rawId: frameId,
        name: name,
        type: val.type || (val.imageSrc ? 'png' : 'vector'),
        badge: val.badge || (val.imageSrc ? 'PNG OVERLAY' : 'VECTOR ACCENTS'),
        imageSrc: val.imageSrc,
        fallbackSrc: val.fallbackSrc,
        bgColor: val.bgColor,
        description: val.type === 'png' || val.imageSrc
          ? 'Transparent photo apertures with themed graphic frame artwork'
          : 'High-contrast studio vector framing with decorative corner motifs'
      });
    }
  });

  return result;
};

const DEFAULT_PREVIEW_FILTERS = [
  { id: "none", name: "Normal", filterStr: "none" },
  { id: "warm-grain", name: "Warm Grain", badge: "POPULAR", filterStr: "brightness(105%) contrast(110%) saturate(115%) sepia(25%)" },
  { id: "pastel-glow", name: "Pastel Glow", badge: "FEATURED", filterStr: "brightness(112%) contrast(95%) saturate(108%) sepia(10%) hue-rotate(-10deg) blur(0.3px)" },
  { id: "cinematic-film", name: "Cinematic Film", badge: "NEW", filterStr: "contrast(120%) saturate(90%) sepia(35%) hue-rotate(10deg)" },
  { id: "bw-high-contrast", name: "Monochrome Noir", badge: "CLASSIC", filterStr: "brightness(102%) contrast(135%) saturate(0%)" },
  { id: "cyberpunk-neon", name: "Cyberpunk Neon", badge: "SPECIAL", filterStr: "brightness(108%) contrast(125%) saturate(145%) hue-rotate(45deg)" },
  { id: "peach-blush", name: "Peach Blush", badge: "TRENDING", filterStr: "brightness(108%) contrast(102%) saturate(120%) sepia(15%) hue-rotate(-5deg)" },
  { id: "golden-hour", name: "Golden Hour", badge: "SUNSET", filterStr: "brightness(106%) contrast(112%) saturate(125%) sepia(35%) hue-rotate(-8deg)" },
  { id: "nordic-mist", name: "Nordic Chill", badge: "AESTHETIC", filterStr: "brightness(104%) contrast(108%) saturate(85%) hue-rotate(185deg) sepia(8%)" },
  { id: "vintage-fade", name: "90s Muted Film", badge: "RETRO", filterStr: "brightness(110%) contrast(90%) saturate(90%) sepia(20%)" },
  { id: "y2k-dream", name: "Y2K Dream", badge: "Y2K", filterStr: "brightness(115%) contrast(115%) saturate(135%) hue-rotate(25deg) blur(0.2px)" }
];

const getCssFilterString = (f) => {
  if (!f || f.id === "none") return "none";
  if (f.filterStr) return f.filterStr;
  const parts = [];
  if (f.brightness !== undefined && f.brightness !== 100) parts.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== undefined && f.contrast !== 100) parts.push(`contrast(${f.contrast}%)`);
  if (f.saturation !== undefined && f.saturation !== 100) parts.push(`saturate(${f.saturation}%)`);
  if (f.sepia !== undefined && f.sepia > 0) parts.push(`sepia(${f.sepia}%)`);
  if (f.hueRotate !== undefined && f.hueRotate !== 0) parts.push(`hue-rotate(${f.hueRotate}deg)`);
  if (f.blur !== undefined && f.blur > 0) parts.push(`blur(${f.blur}px)`);
  return parts.length > 0 ? parts.join(" ") : "none";
};

const PhotoPreview = ({ capturedImages = [] }) => {
  const location = useLocation();
  const { 
    photoCount = 4, 
    layout = '4-grid', 
    category = 'basic', 
    artist = null, 
    dedicatedFrame = null,
    dedicatedFrameId = null,
    initialFilter = 'none',
    presetFrameId = null
  } = location.state || {};
  
  const navigate = useNavigate();
  const activeDedicatedFrame = dedicatedFrame || artist?.dedicatedFrame || null;

  const handleStartNewSession = () => {
    playClickSound();
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (window.lenis && typeof window.lenis.scrollTo === "function") {
        window.lenis.scrollTo(0, { immediate: true });
        window.lenis.start();
      }
      document.body.style.overflow = "";
    } catch (_) {}
    navigate("/setup", { replace: true });
  };
  const initialStripColor = category === "artist" 
    ? (activeDedicatedFrame?.bgGradient || activeDedicatedFrame?.bgColor || "#0e0048")
    : "white";

  const [currentStep, setCurrentStep] = useState(1); // 1: Shots & Filters, 2: Decorate & Color, 3: Export & Share
  const [filterApplyAll, setFilterApplyAll] = useState(false);
  const [customFramesLoaded, setCustomFramesLoaded] = useState(false);
  const [customStickers, setCustomStickers] = useState([]);
  const [customBgColors, setCustomBgColors] = useState([]);
  const [filterPresets, setFilterPresets] = useState(DEFAULT_PREVIEW_FILTERS);
  const [canvasConfig, setCanvasConfig] = useState({
    borderWidth: 16,
    photoGap: 14,
    borderRadius: 0,
    outerPadding: 24
  });
  const [stickerCategoryTab, setStickerCategoryTab] = useState("all");
  const [redrawCounter, setRedrawCounter] = useState(0);
  const imageCache = useRef({});

  useEffect(() => {
    const loadStudioData = async () => {
      try {
        const [studioRes, adminFramesRes, adminStickersRes] = await Promise.allSettled([
          axios.get("/api/studio/data"),
          axios.get("/api/admin/frames?active=true"),
          axios.get("/api/admin/stickers?active=true")
        ]);

        let allFrames = [];
        let allStickers = [];

        if (studioRes.status === "fulfilled" && studioRes.value.data) {
          const { frames: apiFrames, stickers: apiStickers, filters: apiFilters, canvasConfig: apiCanvasConfig } = studioRes.value.data;
          if (apiFrames) allFrames.push(...apiFrames);
          if (apiStickers) allStickers.push(...apiStickers);
          if (apiFilters && Array.isArray(apiFilters)) {
            const activeFilters = apiFilters.filter(f => f.active !== false);
            if (activeFilters.length > 0) {
              setFilterPresets([
                { id: "none", name: "Normal", filterStr: "none" },
                ...activeFilters.map(f => ({
                  id: f.id,
                  name: f.name,
                  badge: f.badge,
                  filterStr: getCssFilterString(f)
                }))
              ]);
            }
          }
          if (apiCanvasConfig) {
            setCanvasConfig(prev => ({ ...prev, ...apiCanvasConfig }));
          }
        }

        if (adminFramesRes.status === "fulfilled" && adminFramesRes.value.data) {
          const customFrames = Array.isArray(adminFramesRes.value.data) 
            ? adminFramesRes.value.data 
            : (adminFramesRes.value.data.frames || []);
          allFrames.push(...customFrames);
        }

        if (adminStickersRes.status === "fulfilled" && adminStickersRes.value.data) {
          const customStickers = Array.isArray(adminStickersRes.value.data)
            ? adminStickersRes.value.data
            : (adminStickersRes.value.data.stickers || []);
          allStickers.push(...customStickers);
        }

        // De-duplicate frames by ID
        const frameMap = new Map();
        allFrames.forEach(f => {
          if (f && f.id) frameMap.set(f.id, f);
        });

        const bgColorsList = [];

        frameMap.forEach((f) => {
          if (f.active === false) return;

          const isColorOrGradient = f.type === 'color' || f.type === 'gradient' || (!f.imageSrc && f.type !== 'png');
          
          if (isColorOrGradient) {
            bgColorsList.push({
              id: f.id,
              label: f.name,
              val: f.type === 'gradient' && f.bgGradient ? f.bgGradient : (f.bgColor || "#ffffff"),
              layout: f.layout || "all"
            });
          } else {
            const frameLayout = f.layout || 'all';
            const count = frameLayout === '3-grid' ? 3 : frameLayout === '4-grid' ? 4 : frameLayout === '2x2' ? 4 : 6;

            const frameObj = {
              id: f.id,
              name: f.name,
              type: 'png',
              badge: f.badge || 'PNG OVERLAY',
              imageSrc: f.imageSrc,
              bgColor: f.bgColor,
              layout: frameLayout,
              draw: async (ctx, w, h) => {
                if (f.imageSrc) {
                  await drawThemedFrame(f.id, frameLayout, count, ctx, w, h, f.imageSrc);
                }
              }
            };

            frames[f.id] = frameObj;
            if (frameLayout === '3-grid') {
              frames[`grid-3-${f.id}`] = frameObj;
              frames[`3-grid-${f.id}`] = frameObj;
            } else if (frameLayout === '4-grid') {
              frames[`grid-4-${f.id}`] = frameObj;
              frames[`4-grid-${f.id}`] = frameObj;
            } else if (frameLayout === '2x2') {
              frames[`2x2-${f.id}`] = frameObj;
            } else if (frameLayout === '2x3' || frameLayout === '3x2') {
              frames[`2x3-${f.id}`] = frameObj;
              frames[`3x2-${f.id}`] = frameObj;
            } else {
              // 'all' layout -> register under all format prefixes
              frames[`admin-${f.id}`] = frameObj;
              frames[`grid-3-${f.id}`] = frameObj;
              frames[`3-grid-${f.id}`] = frameObj;
              frames[`grid-4-${f.id}`] = frameObj;
              frames[`4-grid-${f.id}`] = frameObj;
              frames[`2x2-${f.id}`] = frameObj;
              frames[`2x3-${f.id}`] = frameObj;
              frames[`3x2-${f.id}`] = frameObj;
            }
          }
        });

        setCustomBgColors(bgColorsList);
        setCustomFramesLoaded(true);
        setRedrawCounter(c => c + 1);

        if (presetFrameId) {
          const matchedKey = Object.keys(frames).find(k => k.includes(presetFrameId));
          if (matchedKey) {
            setSelectedFrame(matchedKey);
          }
        }

        // De-duplicate stickers by ID
        const stickerMap = new Map();
        allStickers.forEach(s => {
          if (s && s.id) stickerMap.set(s.id, s);
        });
        setCustomStickers(Array.from(stickerMap.values()));

      } catch (err) {
        console.error("Error loading custom studio frames and stickers:", err);
      }
    };

    loadStudioData();
  }, []);

  const stripCanvasRef = useRef(null);
  const [stripColor, setStripColor] = useState(initialStripColor);
  const [selectedFrame, setSelectedFrame] = useState(
    category === "artist" && activeDedicatedFrame?.imageSrc ? activeDedicatedFrame.id : "none"
  );

  const availableFrames = useMemo(() => {
    return getAvailableFrames(layout, photoCount);
  }, [layout, photoCount, customFramesLoaded]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [slots, setSlots] = useState([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Dedicated Studio Filter Dropdown State (Option B)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutsideFilter = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    if (isFilterDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideFilter);
      document.addEventListener("touchstart", handleClickOutsideFilter);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideFilter);
      document.removeEventListener("touchstart", handleClickOutsideFilter);
    };
  }, [isFilterDropdownOpen]);

  // Sticker & Doodling States
  const [stickers, setStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [doodles, setDoodles] = useState([]);
  const [currentDoodle, setCurrentDoodle] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState("select"); // "select" | "draw"
  const [brushColor, setBrushColor] = useState("#00F2FE"); // Neon Cyan Default
  const [brushWidth, setBrushWidth] = useState(6);
  const [isPrinting, setIsPrinting] = useState(false);

  // Step 2 Sub-tab State ("frame" | "decoration")
  const [step2SubTab, setStep2SubTab] = useState("frame");

  // Watermark Customization State - Mandatory Brand + Customizable Datestamp
  const brandWatermark = "SNPSHOT STUDIO";
  const [customWatermark, setCustomWatermark] = useState("SNPSHOT STUDIO");
  const [datestampMode, setDatestampMode] = useState("off"); // "off" | "date" | "datetime" (default: off)
  const showDateWatermark = datestampMode !== "off";
  const [customHexColor, setCustomHexColor] = useState("#ffffff");

  const formattedStudioDate = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateOnly = `${yyyy}.${mm}.${dd}`;
    if (datestampMode === "datetime") {
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      return `${dateOnly} • ${timeStr}`;
    }
    return dateOnly;
  }, [datestampMode]);

  // Studio Physical Print Lounge State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printPaperFormat, setPrintPaperFormat] = useState("strip-2x6"); // "strip-2x6" | "postcard-4x6" | "wallet-mini"
  const [printPaperFinish, setPrintPaperFinish] = useState("glossy"); // "glossy" | "matte" | "holographic"
  const [printBorderMargin, setPrintBorderMargin] = useState("standard"); // "standard" | "borderless"
  const [printQuantity, setPrintQuantity] = useState(2);
  const [isPhysicalOrderMode, setIsPhysicalOrderMode] = useState(false);
  const [physicalOrderConfirmed, setPhysicalOrderConfirmed] = useState(false);
  const [isPhysicalOrderSubmitting, setIsPhysicalOrderSubmitting] = useState(false);
  const [orderTrackingId, setOrderTrackingId] = useState(() => `SNP-PRNT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [physicalOrderData, setPhysicalOrderData] = useState({ name: "", address: "", note: "" });

  const duplicateActiveSticker = () => {
    const active = stickers.find(s => s.id === selectedStickerId);
    if (!active) return;
    const newSticker = {
      ...active,
      id: Date.now() + Math.random(),
      x: active.x + 20,
      y: active.y + 20
    };
    setStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
    playStickerPopSound();
  };

  const rotateActiveStickerBy = (deg) => {
    setStickers(prev => prev.map(s => {
      if (s.id === selectedStickerId) {
        let nextRot = (s.rotation || 0) + deg;
        if (nextRot > 180) nextRot -= 360;
        if (nextRot < -180) nextRot += 360;
        return { ...s, rotation: nextRot };
      }
      return s;
    }));
  };

  const resetActiveStickerRotation = () => {
    setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rotation: 0 } : s));
  };

  const handlePhysicalOrderSubmit = (e) => {
    if (e) e.preventDefault();
    if (!physicalOrderData.name.trim() || !physicalOrderData.address.trim()) {
      alert("Please provide recipient name and physical shipping address.");
      return;
    }
    setIsPhysicalOrderSubmitting(true);
    setTimeout(() => {
      setIsPhysicalOrderSubmitting(false);
      setPhysicalOrderConfirmed(true);
      playSuccessChime();
    }, 1200);
  };

  // Community Sharing Lounge State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishCreator, setPublishCreator] = useState("@snpshot_user");
  const [publishCaption, setPublishCaption] = useState("Studio Session ✨");
  const [publishTags, setPublishTags] = useState(["#y2k", "#photobooth"]);
  const [publishAllowEditorial, setPublishAllowEditorial] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [recentCommunityItems, setRecentCommunityItems] = useState([]);

  // Freeze Lenis scrolling and lock body overflow during any modal activation
  useEffect(() => {
    if (isPublishModalOpen || isPrintModalOpen) {
      window.lenis?.stop?.();
      document.body.style.overflow = "hidden";
    } else {
      window.lenis?.start?.();
      document.body.style.overflow = "";
    }
    return () => {
      window.lenis?.start?.();
      document.body.style.overflow = "";
    };
  }, [isPublishModalOpen, isPrintModalOpen]);

  // Fetch recent community gallery cards for the Community Sharing Lounge
  useEffect(() => {
    if (isPublishModalOpen) {
      axios.get("/api/studio/data")
        .then(res => {
          if (res.data && res.data.galleryItems && res.data.galleryItems.length > 0) {
            setRecentCommunityItems(res.data.galleryItems.slice(0, 8));
          }
        })
        .catch(() => {});
    }
  }, [isPublishModalOpen]);

  const getLayoutConfig = () => {
    if (layout === '3x2') return layoutConfigs['3x2'];
    if (layout === '2x2') return layoutConfigs['2x2'];
    if (photoCount === 3) return layoutConfigs['3-grid'];
    return layoutConfigs['4-grid'];
  };

  // Initialize photo slots from taken capture round
  useEffect(() => {
    if (capturedImages && capturedImages.length > 0) {
      const initialSlots = Array.from({ length: photoCount }).map((_, index) => {
        let imageIndex = index;
        if (category === "artist") {
          imageIndex = Math.min(index * 2, capturedImages.length - 1);
        } else {
          imageIndex = Math.min(index, capturedImages.length - 1);
        }
        return {
          imageIndex,
          filter: initialFilter || "none"
        };
      });
      setSlots(initialSlots);
    } else {
      const mockImages = [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
      ];
      const initialSlots = Array.from({ length: photoCount }).map((_, index) => {
        let imageIndex = index;
        if (category === "artist") {
          imageIndex = Math.min(index * 2, mockImages.length - 1);
        } else {
          imageIndex = Math.min(index, mockImages.length - 1);
        }
        return {
          imageIndex,
          filter: initialFilter || "none"
        };
      });
      setSlots(initialSlots);
    }
  }, [capturedImages, photoCount, initialFilter, category]);

  const drawStripOnContext = async (ctx, config, canvasWidth, canvasHeight, targetColor, targetSlots, scale = 1, showSelection = false) => {
    if (targetColor && (targetColor.includes("gradient") || targetColor.includes("linear-gradient"))) {
      const hexes = targetColor.match(/#[a-fA-F0-9]{3,8}/g) || ["#F042FF", "#7226FF"];
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      hexes.forEach((hex, idx) => {
        grad.addColorStop(idx / Math.max(1, hexes.length - 1), hex);
      });
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = targetColor || "white";
    }
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const loadImageHelper = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const normalized = normalizeMediaUrl(src);
        if (normalized && !normalized.startsWith("data:")) {
          img.crossOrigin = "anonymous";
        }
        img.src = normalized;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
      });
    };

    const drawCroppedImage = (context, img, targetX, targetY, targetW, targetH) => {
      const imageRatio = img.width / img.height;
      const targetRatio = targetW / targetH;

      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;

      if (imageRatio > targetRatio) {
        sourceWidth = sourceHeight * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
      } else {
        sourceHeight = sourceWidth / targetRatio;
        sourceY = (img.height - sourceHeight) / 2;
      }

      context.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        targetX, targetY, targetW, targetH
      );
    };

    for (let index = 0; index < targetSlots.length; index++) {
      const slot = targetSlots[index];
      if (!slot) continue;

      const imgPool = (capturedImages && capturedImages.length > 0) ? capturedImages : [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
      ];

      const visitorImgUrl = imgPool[slot.imageIndex];
      if (!visitorImgUrl) continue;

      try {
        const vImg = await loadImageHelper(visitorImgUrl);
        const { x, y } = config.getPhotoPosition(index);

        ctx.save();
        ctx.filter = slot.filter || "none";

        if (category === "artist" && artist && visitorImgUrl && !visitorImgUrl.startsWith("data:")) {
          drawCroppedImage(ctx, vImg, x, y, config.imgWidth, config.imgHeight);
          
          const artistPoseUrl = artist.poses && artist.poses[index % artist.poses.length] || artist.avatar;
          if (artistPoseUrl) {
            try {
              const aImg = await loadImageHelper(artistPoseUrl);
              
              ctx.save();
              const maskCanvas = document.createElement("canvas");
              maskCanvas.width = config.imgWidth;
              maskCanvas.height = config.imgHeight;
              const maskCtx = maskCanvas.getContext("2d");
              
              const gradient = maskCtx.createLinearGradient(0, 0, config.imgWidth, 0);
              gradient.addColorStop(0, "rgba(0,0,0,0)");
              gradient.addColorStop(0.45, "rgba(0,0,0,0)");
              gradient.addColorStop(0.55, "rgba(0,0,0,1)");
              gradient.addColorStop(1, "rgba(0,0,0,1)");
              
              maskCtx.fillStyle = gradient;
              maskCtx.fillRect(0, 0, config.imgWidth, config.imgHeight);
              maskCtx.globalCompositeOperation = "source-in";
              
              const imgRatio = aImg.width / aImg.height;
              const targetRatio = config.imgWidth / config.imgHeight;
              let sW = aImg.width;
              let sH = aImg.height;
              let sX = 0;
              let sY = 0;
              if (imgRatio > targetRatio) {
                sW = sH * targetRatio;
                sX = (aImg.width - sW) / 2;
              } else {
                sH = sW / targetRatio;
                sY = (aImg.height - sH) / 2;
              }
              maskCtx.drawImage(aImg, sX, sY, sW, sH, 0, 0, config.imgWidth, config.imgHeight);
              
              ctx.drawImage(maskCanvas, x, y);
              ctx.restore();
            } catch (e) {
              console.error("Failed to load artist pose overlay", e);
            }
          }
        } else {
          drawCroppedImage(ctx, vImg, x, y, config.imgWidth, config.imgHeight);
        }

        ctx.restore();
      } catch (error) {
        console.error(`Error drawing slot ${index}:`, error);
      }
    }

    if (selectedFrame !== 'none' && frames[selectedFrame]) {
      await frames[selectedFrame].draw(ctx, canvasWidth, canvasHeight);
    }

    // Paint freehand neon doodles
    doodles.forEach(doodle => {
      if (!doodle.points || doodle.points.length < 2) return;
      ctx.save();
      ctx.shadowColor = doodle.color;
      ctx.shadowBlur = 10 * scale;
      ctx.strokeStyle = doodle.color;
      ctx.lineWidth = doodle.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(doodle.points[0].x * scale, doodle.points[0].y * scale);
      for (let i = 1; i < doodle.points.length; i++) {
        ctx.lineTo(doodle.points[i].x * scale, doodle.points[i].y * scale);
      }
      ctx.stroke();
      ctx.restore();
    });

    if (currentDoodle && currentDoodle.points && currentDoodle.points.length > 1) {
      ctx.save();
      ctx.shadowColor = currentDoodle.color;
      ctx.shadowBlur = 10 * scale;
      ctx.strokeStyle = currentDoodle.color;
      ctx.lineWidth = currentDoodle.width * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(currentDoodle.points[0].x * scale, currentDoodle.points[0].y * scale);
      for (let i = 1; i < currentDoodle.points.length; i++) {
        ctx.lineTo(currentDoodle.points[i].x * scale, currentDoodle.points[i].y * scale);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Paint stickers
    stickers.forEach(stk => {
      ctx.save();
      ctx.translate(stk.x * scale, stk.y * scale);
      ctx.rotate((stk.rotation * Math.PI) / 180);
      
      const fontSize = Math.round(36 * stk.scale * scale);
      
      if (stk.type === "emoji") {
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(stk.value, 0, 0);
      } else if (stk.type === "text") {
        ctx.font = `italic bold ${fontSize}px "Space Grotesk", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        ctx.shadowColor = stk.color || "#00F2FE";
        ctx.shadowBlur = 15 * scale;
        ctx.fillStyle = stk.color || "#00F2FE";
        ctx.fillText(stk.value, 0, 0);
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = Math.max(1, 2 * scale);
        ctx.fillText(stk.value, 0, 0);
        ctx.strokeText(stk.value, 0, 0);
      } else if (stk.type === "png") {
        let img = imageCache.current[stk.value];
        if (!img) {
          img = new Image();
          const normalized = normalizeMediaUrl(stk.value);
          if (normalized && !normalized.startsWith("data:")) {
            img.crossOrigin = "anonymous";
          }
          img.src = normalized;
          img.referrerPolicy = "no-referrer";
          img.onload = () => {
            setRedrawCounter(prev => prev + 1);
          };
          imageCache.current[stk.value] = img;
        }
        
        if (img.complete && img.naturalWidth > 0) {
          if (stk.blendMode && stk.blendMode !== "normal") {
            ctx.globalCompositeOperation = stk.blendMode;
          }
          const baseSize = 80 * stk.scale * scale;
          const aspect = img.naturalHeight / img.naturalWidth;
          const w = baseSize;
          const h = baseSize * aspect;
          
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, -w / 2, -h / 2, w, h);
        }
      }
      ctx.restore();
    });

    if (showSelection && selectedStickerId) {
      const selectedStg = stickers.find(s => s.id === selectedStickerId);
      if (selectedStg) {
        ctx.save();
        ctx.translate(selectedStg.x * scale, selectedStg.y * scale);
        ctx.rotate((selectedStg.rotation * Math.PI) / 180);
        
        const size = 42 * selectedStg.scale * scale;
        ctx.strokeStyle = "#00F2FE";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-size / 2 - 4, -size / 2 - 4, size + 8, size + 8);
        ctx.restore();
      }
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const formattedDateOnly = `${yyyy}.${mm}.${dd}`;
    const timeFormatted = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let datestampStr = "";
    if (datestampMode === "date") {
      datestampStr = formattedDateOnly;
    } else if (datestampMode === "datetime") {
      datestampStr = `${formattedDateOnly}  ${timeFormatted}`;
    }

    if (category === "artist" && artist) {
      const activeFrame = dedicatedFrame || artist.dedicatedFrame;
      const accentColor = activeFrame?.borderColor || artist.color || "#F042FF";
      const outerBorderWidth = (activeFrame?.borderWidth || 10) * scale;

      ctx.save();
      // Outer structural border
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = outerBorderWidth;
      ctx.strokeRect(outerBorderWidth / 2, outerBorderWidth / 2, canvasWidth - outerBorderWidth, canvasHeight - outerBorderWidth);

      // Top Collab Header Badge
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${12 * scale}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        `✦ ${artist.groupName ? artist.groupName.toUpperCase() + ' // ' : ''}${artist.name.toUpperCase()} EXCLUSIVE COLLAB ✦`,
        canvasWidth / 2,
        Math.max(28 * scale, config.padding * scale * 0.7)
      );

      // Official Event Watermark at bottom
      const watermark = activeFrame?.watermarkText || `${artist.name.toUpperCase()} ✦ OFFICIAL EVENT`;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${14 * scale}px "Space Grotesk", sans-serif`;
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 10 * scale;
      ctx.textAlign = "center";
      ctx.fillText(watermark, canvasWidth / 2, canvasHeight - (config.padding * 0.75) * scale);

      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = `${10 * scale}px "Space Grotesk", monospace`;
      const artistBottomLine = datestampStr ? `SNPSHOT STUDIO • ${datestampStr}` : `SNPSHOT STUDIO`;
      ctx.fillText(artistBottomLine, canvasWidth / 2, canvasHeight - (config.padding * 0.28) * scale);
      ctx.restore();
    } else {
      const isDark = targetColor && (targetColor === "black" || targetColor.startsWith("#0") || targetColor.startsWith("#1") || targetColor.includes("gradient") || targetColor.includes("#2e109d"));
      ctx.fillStyle = isDark ? "#FFFFFF" : "#000000";
      ctx.font = `bold ${15 * scale}px "Space Grotesk", sans-serif`;
      ctx.textAlign = "center";
      
      const fullLabel = datestampStr ? `SNPSHOT STUDIO  •  ${datestampStr}` : "SNPSHOT STUDIO";
      ctx.fillText(fullLabel, canvasWidth / 2, canvasHeight - (config.padding / 2) * scale);

      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)";
      ctx.font = `${11 * scale}px "Space Grotesk", monospace`;
      ctx.textAlign = "right";
      ctx.fillText("© 2026 SNPSHOT", canvasWidth - config.padding * scale, canvasHeight - (config.padding / 4) * scale);
    }
  };

  const generatePhotoStrip = useCallback(async () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || slots.length === 0) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = getLayoutConfig();
    const { width: canvasWidth, height: canvasHeight } = config.getCanvasDimensions();
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    await drawStripOnContext(ctx, config, canvasWidth, canvasHeight, stripColor, slots, 1, true);
  }, [capturedImages, stripColor, selectedFrame, slots, photoCount, layout, category, artist, stickers, selectedStickerId, doodles, currentDoodle, redrawCounter, customWatermark, showDateWatermark, datestampMode]);

  useEffect(() => {
    if (slots.length > 0) {
      generatePhotoStrip();
    }
  }, [slots, stripColor, selectedFrame, customWatermark, showDateWatermark, datestampMode, generatePhotoStrip]);

  const getCustomDownloadFileName = () => {
    const brand = "SNPSHOT";
    
    // Layout format label (e.g. 4-Strip, 3-Strip, 2x2-Grid, 2x3-Postcard)
    let layoutLabel = "Photostrip";
    if (layout === "4-grid") layoutLabel = "4-Strip";
    else if (layout === "3-grid") layoutLabel = "3-Strip";
    else if (layout === "2x2") layoutLabel = "2x2-Grid";
    else if (layout === "3x2" || layout === "2x3") layoutLabel = "2x3-Postcard";

    // Formatted date stamp: YYYYMMDD
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateStamp = `${yyyy}${mm}${dd}`;

    if (category === "artist" && artist) {
      // Group name (e.g. IVE, NewJeans, TWICE)
      const group = artist.groupName || (["wonyoung", "yujin", "rei", "gaeul", "liz", "leeseo"].includes(artist.id?.toLowerCase()) ? "IVE" : "");
      const artistName = artist.name || "Collab";
      
      // Determine theme description (e.g., Birthday Theme, Special Collab)
      let themeDescriptor = activeDedicatedFrame?.name || dedicatedFrame?.name || "";
      if (!themeDescriptor || themeDescriptor.toLowerCase().includes("frame") || themeDescriptor.toLowerCase().includes("default")) {
        themeDescriptor = (artist.id === "wonyoung" || artistName.toLowerCase().includes("wonyoung"))
          ? "Birthday Theme"
          : "Special Collab Theme";
      }

      // Build e.g. "SNPSHOT_IVE Wonyoung Birthday Theme Photostrip_4-Strip_20260912.png"
      const prefix = group ? `${group} ${artistName}` : artistName;
      const fullTitle = themeDescriptor.toLowerCase().includes(artistName.toLowerCase())
        ? themeDescriptor
        : `${prefix} ${themeDescriptor}`;

      const sanitizedTheme = fullTitle.trim().replace(/\s+/g, " ").replace(/[\\/:*?"<>|]/g, "");
      return `${brand}_${sanitizedTheme} Photostrip_${layoutLabel}_${dateStamp}.png`;
    }

    // Standard / Classic Studio frames
    const currentFrameObj = availableFrames.find(f => f.id === selectedFrame);
    let themeTitle = "Classic Studio";
    if (currentFrameObj && currentFrameObj.name && currentFrameObj.name !== "None") {
      themeTitle = currentFrameObj.name;
    } else if (stripColor && stripColor !== "white" && stripColor !== "#ffffff") {
      const colorMatch = customBgColors.find(c => c.val === stripColor);
      themeTitle = colorMatch?.label || (stripColor.startsWith("#") ? "Custom Studio" : stripColor);
    }

    const sanitizedTitle = themeTitle.trim().replace(/\s+/g, " ").replace(/[\\/:*?"<>|]/g, "");
    return `${brand}_${sanitizedTitle} Photostrip_${layoutLabel}_${dateStamp}.png`;
  };

  const downloadPhotoStrip = async () => {
    const canvas = stripCanvasRef.current;
    if (!canvas || slots.length === 0) return;

    playSuccessChime(); // Play uplifting retro chord arpeggio!
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
    }, 3500);

    const hiResCanvas = document.createElement('canvas');
    const config = getLayoutConfig();
    const { width, height } = config.getCanvasDimensions();
    
    hiResCanvas.width = width * 3;
    hiResCanvas.height = height * 3;
    
    const hiResCtx = hiResCanvas.getContext('2d');
    if (!hiResCtx) return;
    
    hiResCtx.imageSmoothingEnabled = true;
    hiResCtx.imageSmoothingQuality = 'high';
    hiResCtx.scale(3, 3);

    await drawStripOnContext(hiResCtx, config, width, height, stripColor, slots, 1, false);

    const link = document.createElement("a");
    link.download = getCustomDownloadFileName();
    link.href = hiResCanvas.toDataURL("image/png", 1.0);
    link.click();

    // Track export & high-res print download in Studio Analytics
    axios.post("/api/creator/analytics/track", {
      eventType: "export_download",
      layoutId: layout || "3-grid",
      latencyMs: Math.floor(180 + Math.random() * 120)
    }).catch(() => {});
  };

  const sendPhotoStripToEmail = async () => {
    if (!email) {
      setStatus("Error: Provide a valid email target node.");
      return;
    }

    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
    }, 3500);
  
    try {
      setStatus("SYS_GEN_HIRES: Compiling photo strip...");
  
      if (!stripCanvasRef.current || slots.length === 0) {
        setStatus("SYS_ERR: Viewport frame not instantiated.");
        return;
      }
  
      const hiResCanvas = document.createElement('canvas');
      const config = getLayoutConfig();
      const { width, height } = config.getCanvasDimensions();
      
      hiResCanvas.width = width * 3;
      hiResCanvas.height = height * 3;
      
      const hiResCtx = hiResCanvas.getContext('2d');
      if (!hiResCtx) {
        setStatus("SYS_ERR: Image compositor initialization failed.");
        return;
      }
      
      hiResCtx.imageSmoothingEnabled = true;
      hiResCtx.imageSmoothingQuality = 'high';
      hiResCtx.scale(3, 3);

      await drawStripOnContext(hiResCtx, config, width, height, stripColor, slots, 1, false);
      const imageData = hiResCanvas.toDataURL("image/png", 1.0);
      
      setStatus("NET_DISPATCH: Dispatching packet to SMTP server...");
      const backendURL = "";

      const response = await axios.post(`${backendURL}/send-photo-strip`, {
        recipientEmail: email,
        imageData: imageData
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      if (response.data.message === "Photo strip sent successfully!") {
        playSuccessChime(); // Play uplifting retro chord arpeggio!
        setStatus("SUCCESS: Photo strip transmitted to recipient node!");
        setEmail("");
      } else {
        setStatus("SYS_ERR: Node response rejection. Dispatch failed.");
      }
    } catch (error) {
      console.error("Error details:", error.response || error);
      setStatus(`SYS_ERR: ${error.response?.data?.message || error.message}`);
    }
  };

  const handlePublishToGallery = async (e) => {
    if (e) e.preventDefault();
    if (!publishCreator.trim()) {
      setStatus("Error: Please provide a creator handle.");
      return;
    }
    setIsPublishing(true);
    try {
      const config = getLayoutConfig();
      const { width, height } = config.getCanvasDimensions();
      const hiResCanvas = document.createElement('canvas');
      hiResCanvas.width = width * 3;
      hiResCanvas.height = height * 3;
      const hiResCtx = hiResCanvas.getContext('2d');
      if (!hiResCtx) throw new Error("Canvas context failed");
      hiResCtx.imageSmoothingEnabled = true;
      hiResCtx.imageSmoothingQuality = 'high';
      hiResCtx.scale(3, 3);
      await drawStripOnContext(hiResCtx, config, width, height, stripColor, slots, 1, false);
      
      const blob = await new Promise(resolve => hiResCanvas.toBlob(resolve, 'image/png', 0.95));
      const formData = new FormData();
      formData.append("image", blob, `community_${Date.now()}.png`);
      formData.append("creator", publishCreator.trim());
      formData.append("caption", publishCaption.trim() || "SNPSHOT Session ✦");
      formData.append("layout", layout === '3x2' ? '2x3' : (layout === '2x2' ? '2x2' : (photoCount === 3 ? '3-grid' : '4-grid')));
      formData.append("color", stripColor);
      formData.append("origin", "community");
      formData.append("badge", "Community Print");
      formData.append("isPromotedToShowcase", "false");
      formData.append("isFeatured", "false");
      formData.append("status", "approved");
      formData.append("printStatus", "dpi_verified");
      formData.append("printDpi", "300");

      const res = await axios.post("/api/creator/gallery", formData);
      if (res.data && res.data.success) {
        playSuccessChime();
        setPublishSuccess(true);
        setTimeout(() => {
          setIsPublishModalOpen(false);
          setPublishSuccess(false);
        }, 2200);
      }
    } catch (err) {
      console.error("Error submitting to gallery:", err);
      alert("Failed to submit to Community Gallery.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCanvasPointerDown = (clientX, clientY) => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((clientY - rect.top) / rect.height) * canvas.height;

    if (activeTool === "draw") {
      setIsDrawing(true);
      const newDoodle = {
        id: Date.now().toString(),
        color: brushColor,
        width: brushWidth,
        points: [{ x: clickX, y: clickY }]
      };
      setCurrentDoodle(newDoodle);
    } else if (activeTool === "select") {
      let foundStk = null;
      for (let i = stickers.length - 1; i >= 0; i--) {
        const stk = stickers[i];
        const dist = Math.hypot(clickX - stk.x, clickY - stk.y);
        const radius = 35 * stk.scale;
        if (dist <= radius) {
          foundStk = stk;
          break;
        }
      }

      if (foundStk) {
        setSelectedStickerId(foundStk.id);
        setIsDraggingSticker(true);
        setDragOffset({ x: clickX - foundStk.x, y: clickY - foundStk.y });
      } else {
        setSelectedStickerId(null);
      }
    }
  };

  const handleCanvasPointerMove = (clientX, clientY) => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const moveX = ((clientX - rect.left) / rect.width) * canvas.width;
    const moveY = ((clientY - rect.top) / rect.height) * canvas.height;

    if (activeTool === "draw" && isDrawing && currentDoodle) {
      setCurrentDoodle(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, { x: moveX, y: moveY }]
        };
      });
    } else if (activeTool === "select" && isDraggingSticker && selectedStickerId) {
      setStickers(prev => prev.map(s => {
        if (s.id === selectedStickerId) {
          return {
            ...s,
            x: moveX - dragOffset.x,
            y: moveY - dragOffset.y
          };
        }
        return s;
      }));
    }
  };

  const handleCanvasPointerUp = () => {
    if (activeTool === "draw" && isDrawing && currentDoodle) {
      if (currentDoodle.points.length > 1) {
        setDoodles(prev => [...prev, currentDoodle]);
      }
      setCurrentDoodle(null);
      setIsDrawing(false);
    } else if (activeTool === "select" && isDraggingSticker) {
      setIsDraggingSticker(false);
    }
  };

  const imgPool = (capturedImages && capturedImages.length > 0) ? capturedImages : [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
  ];

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay" style={{ paddingBottom: "16px", overflowY: "auto" }}>
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar />

      <div id="content" className="content w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 pt-14 sm:pt-16 pb-2 sm:pb-3 relative z-10 flex flex-col lg:h-[calc(100vh-16px)] lg:max-h-[calc(100vh-16px)] justify-between">
        
        {/* Header Bar with Single-Line Headline (matching PhotoBooth.jsx style) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full mb-2 sm:mb-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="y2k-subtitle text-xs py-1.5 px-4 whitespace-nowrap shrink-0">
              ✦ CANVAS STUDIO ✦
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 m-0 leading-none">
              <span>PERSONALIZE</span>
              <span className="y2k-highlight my-0 leading-none">YOUR PRINT</span>
            </h1>
          </div>

          {/* Quick Navigation & Status Badges */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-[#16023d]/80 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">LAYOUT:</span>
              <span className="text-purple-300 font-bold uppercase">{layout === '3x2' ? '2x3' : (layout === '2x2' ? '2x2' : `${photoCount}-GRID`)}</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">DPI:</span>
              <span className="text-[#39FF14] font-bold">300</span>
            </div>
            <Link
              to="/photobooth"
              state={{ count: photoCount, photoCount, layout, category, artist, dedicatedFrame, dedicatedFrameId, presetFrameId }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2e109d] bg-[#0c0333]/90 hover:bg-[#16023d] hover:border-[#F042FF]/50 text-zinc-300 hover:text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              title="Return to live camera booth"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>RETAKE / BOOTH</span>
            </Link>
            <button
              type="button"
              onClick={handleStartNewSession}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7226FF]/60 bg-[#160078]/60 hover:bg-[#7226FF]/30 hover:border-[#F042FF] text-[#FFE5F1] hover:text-white font-mono text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(114,38,255,0.25)]"
              title="Start a new photobooth session from layout selection"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#F042FF]" />
              <span>NEW SESSION</span>
            </button>
          </div>
        </div>

        {/* HOLOGRAPHIC PIPELINE SPINNER OVERLAY */}
        {isPrinting && (
          <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-md">
            <div className="relative w-28 h-28 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#F042FF]/25 border-t-[#F042FF] animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-purple-500/25 border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
              <div className="absolute inset-0 flex items-center justify-center text-[#F042FF]">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <h3 className="font-display font-black text-white tracking-widest uppercase mb-1">CREATING YOUR STRIP...</h3>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">[ EXPORT ENGINE BUSY ]</p>
          </div>
        )}

        {/* 2-Column Studio Cockpit Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-5 w-full items-stretch flex-1 min-h-0">
          
          {/* LEFT: DECORATION STAGE PHOTOSHOOT PREVIEW */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center w-full h-full min-h-0">
            <div className="w-full h-full relative bg-[#060020] p-2.5 sm:p-3 rounded-2xl border border-[#2e109d] shadow-[0_12px_45px_rgba(1,0,48,0.9)] overflow-hidden flex flex-col justify-between">
              
              <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-[#2e109d]/60 font-mono text-[9.5px] text-zinc-400 tracking-wider shrink-0">
                <div className="flex items-center gap-1.5 text-[#F042FF] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#F042FF] animate-pulse" />
                  <span>DECORATION STAGE</span>
                </div>
                <span className="text-zinc-500">
                  STEP {currentStep} OF 3 // {currentStep === 1 ? "SHOTS & FILTERS" : currentStep === 2 ? "DECORATION & COLOR" : "EXPORT & SHARE"}
                </span>
              </div>

              {/* Real canvas viewport (Responsive, fills vertical space to maximize visual impact without overflowing) */}
              <div className="relative w-full flex-1 min-h-[340px] sm:min-h-[380px] lg:min-h-0 overflow-hidden flex items-center justify-center bg-[#020010] rounded-xl p-2 sm:p-3">
                {/* Tech HUD corner accents */}
                <div className="hud-corner hud-tl" />
                <div className="hud-corner hud-tr" />
                <div className="hud-corner hud-bl" />
                <div className="hud-corner hud-br" />
                
                <canvas
                  ref={stripCanvasRef}
                  onMouseDown={(e) => handleCanvasPointerDown(e.clientX, e.clientY)}
                  onMouseMove={(e) => handleCanvasPointerMove(e.clientX, e.clientY)}
                  onMouseUp={handleCanvasPointerUp}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    if (touch) handleCanvasPointerDown(touch.clientX, touch.clientY);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    if (touch) handleCanvasPointerMove(touch.clientX, touch.clientY);
                  }}
                  onTouchEnd={handleCanvasPointerUp}
                  className="max-w-full max-h-full w-auto h-auto cursor-crosshair border border-zinc-900 photobooth-print-image rounded shadow-2xl transition-all"
                  style={{ objectFit: "contain" }}
                />
              </div>

              {/* Status / Coordinates footer */}
              <div className="flex justify-between items-center font-mono text-[8.5px] text-zinc-500 mt-1.5 px-1 shrink-0">
                <span>STAGE: {currentStep === 1 ? 'FRAME & SHOT TUNING' : currentStep === 2 ? 'CANVAS DECORATION & BG' : 'FINAL PRINT COMPOSITE'}</span>
                <span className="text-[#39FF14] font-bold">DPI: 300 // HI-RES COMPOSITE</span>
              </div>
            </div>
          </div>

          {/* RIGHT: STUDIO CONTROL CONSOLE (3-STEP GUIDED WORKFLOW) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col w-full h-full min-h-0 justify-between">
            
            {/* INTERACTIVE WORKFLOW STEPPER BAR */}
            <div className="w-full flex items-center gap-1.5 p-1.5 rounded-xl border border-[#2e109d] bg-[#070125]/90">
              {[
                { step: 1, label: "01 SHOTS & FILTERS", short: "01 SHOTS", icon: Layout },
                { step: 2, label: "02 FRAME & DECORATE", short: "02 CUSTOMIZE", icon: Palette },
                { step: 3, label: "03 EXPORT & SHARE", short: "03 EXPORT", icon: Download }
              ].map((item) => {
                const isActive = currentStep === item.step;
                const isCompleted = currentStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCurrentStep(item.step);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#F042FF]/20 text-[#FFE5F1] border border-[#F042FF] shadow-[0_0_15px_rgba(240,66,255,0.25)] font-bold"
                        : isCompleted
                        ? "bg-[#16023d]/60 text-purple-300 border border-[#2e109d] hover:border-[#F042FF]/40"
                        : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-zinc-900/40"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isActive
                        ? "bg-[#F042FF] text-black"
                        : isCompleted
                        ? "bg-emerald-400 text-black"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {isCompleted ? "✓" : item.step}
                    </span>
                    <span className="hidden sm:inline truncate">{item.label}</span>
                    <span className="sm:hidden truncate">{item.short}</span>
                  </button>
                );
              })}
            </div>

            {/* ========================================================= */}
            {/* STEP 01: DEDICATED FILTERS & BEST SHOT SELECTION          */}
            {/* ========================================================= */}
            {currentStep === 1 && (() => {
              const currentLayoutConfig = getLayoutConfig();
              const slotW = currentLayoutConfig?.imgWidth || 400;
              const slotH = currentLayoutConfig?.imgHeight || 300;
              const slotRatio = `${slotW} / ${slotH}`;

              return (
                <div className="flex flex-col gap-2.5 flex-1 min-h-0 justify-between">
                  
                  {/* 1. DEDICATED STUDIO FILTER PRESETS (OPTION B - RETRO STUDIO DROPDOWN) */}
                  <div 
                    ref={filterDropdownRef} 
                    className={`web3-glass-card p-3 sm:p-3.5 relative transition-all duration-200 ${
                      isFilterDropdownOpen ? "ring-1 ring-[#F042FF]/50 shadow-[0_12px_40px_rgba(240,66,255,0.2)]" : ""
                    }`}
                    style={{ zIndex: isFilterDropdownOpen ? 9999 : 30, overflow: "visible" }}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F042FF]" />
                        <span className="font-bold tracking-wider">APPLY FILTER PRESET</span>
                      </div>

                      {/* Mode Toggle: Apply to single frame vs apply to all frames */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !filterApplyAll;
                            setFilterApplyAll(nextState);
                            playClickSound();
                          }}
                          className={`px-2.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider border transition-colors cursor-pointer flex items-center gap-1 ${
                            filterApplyAll
                              ? "bg-[#F042FF]/20 text-[#FFE5F1] border-[#F042FF] font-bold shadow-[0_0_10px_rgba(240,66,255,0.25)]"
                              : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white"
                          }`}
                          title="Toggle between applying filter to active slot or all frames"
                        >
                          <span>⚡</span>
                          <span>{filterApplyAll ? "ALL FRAMES" : `FRAME #${activeSlotIndex + 1}`}</span>
                        </button>
                      </div>
                    </div>

                    {/* Dropdown trigger and expandable menu */}
                    <div className="relative w-full">
                      {(() => {
                        const activeSlotFilter = slots[activeSlotIndex]?.filter || "none";
                        const currentPreset = filterPresets.find(p => 
                          (p.filterStr && p.filterStr === activeSlotFilter) || 
                          p.id === activeSlotFilter || 
                          (p.id === "none" && activeSlotFilter === "none")
                        ) || filterPresets[0] || { id: "none", name: "Normal", filterStr: "none" };

                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                                playClickSound();
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer text-left ${
                                isFilterDropdownOpen
                                  ? "border-[#F042FF] bg-[#0e0048] shadow-[0_0_20px_rgba(240,66,255,0.25)]"
                                  : "border-[#2e109d] bg-[#070125]/90 hover:border-[#F042FF]/60 hover:bg-[#0c0233]"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                {/* Visual color dot indicator */}
                                <span 
                                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20 shadow-sm"
                                  style={{
                                    background: currentPreset.id === "none" ? "#ffffff" :
                                      currentPreset.id.includes("warm") || currentPreset.id.includes("golden") ? "#ffb347" :
                                      currentPreset.id.includes("pastel") || currentPreset.id.includes("peach") ? "#ff9ebb" :
                                      currentPreset.id.includes("bw") || currentPreset.id.includes("monochrome") ? "#71717a" :
                                      currentPreset.id.includes("cyber") ? "#00F2FE" :
                                      currentPreset.id.includes("y2k") ? "#F042FF" : "#a855f7"
                                  }}
                                />
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-mono text-xs font-bold text-white tracking-wide">
                                    {currentPreset.name}
                                  </span>
                                  {currentPreset.badge && (
                                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#F042FF]/20 text-[#FFE5F1] border border-[#F042FF]/40 font-semibold tracking-wider">
                                      {currentPreset.badge}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9.5px] font-mono text-zinc-400 hidden sm:inline">
                                  {filterApplyAll ? "[ALL FRAMES]" : `[SLOT #${activeSlotIndex + 1}]`}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-purple-300 transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180 text-[#F042FF]" : ""}`} />
                              </div>
                            </button>

                            {/* Floating Dropdown Popover */}
                            {isFilterDropdownOpen && (
                              <div 
                                className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl border border-[#F042FF]/50 bg-[#06001a] shadow-[0_24px_60px_rgba(0,0,0,0.98),0_0_30px_rgba(240,66,255,0.35)] max-h-72 overflow-y-auto scrollbar-thin flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
                                style={{ zIndex: 100000 }}
                              >
                                {filterPresets.map(preset => {
                                  const targetStr = preset.filterStr || preset.id;
                                  const isSelected = activeSlotFilter === targetStr || (preset.id === "none" && activeSlotFilter === "none");

                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => {
                                        if (filterApplyAll) {
                                          const updatedSlots = slots.map(s => ({ ...s, filter: targetStr }));
                                          setSlots(updatedSlots);
                                        } else {
                                          const updatedSlots = [...slots];
                                          updatedSlots[activeSlotIndex].filter = targetStr;
                                          setSlots(updatedSlots);
                                        }
                                        setIsFilterDropdownOpen(false);
                                        playClickSound();
                                      }}
                                      className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                                        isSelected
                                          ? "bg-[#F042FF]/20 text-[#FFE5F1] font-bold border border-[#F042FF]/40"
                                          : "text-zinc-300 hover:text-white hover:bg-purple-950/40"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 truncate">
                                        <span 
                                          className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                                          style={{
                                            background: preset.id === "none" ? "#ffffff" :
                                              preset.id.includes("warm") || preset.id.includes("golden") ? "#ffb347" :
                                              preset.id.includes("pastel") || preset.id.includes("peach") ? "#ff9ebb" :
                                              preset.id.includes("bw") || preset.id.includes("monochrome") ? "#71717a" :
                                              preset.id.includes("cyber") ? "#00F2FE" :
                                              preset.id.includes("y2k") ? "#F042FF" : "#a855f7"
                                          }}
                                        />
                                        <span>{preset.name}</span>
                                        {preset.badge && (
                                          <span className="text-[7.5px] px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-200 border border-purple-500/30">
                                            {preset.badge}
                                          </span>
                                        )}
                                      </div>

                                      {isSelected && (
                                        <span className="text-[#F042FF] font-bold text-xs flex items-center gap-1">
                                          <span>✓</span>
                                          <span className="text-[9px] uppercase tracking-wider">ACTIVE</span>
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 2. ADJUST FRAME & BEST SHOTS (PRESERVES EXACT ASPECT RATIO) */}
                  <div className="web3-glass-card p-3 sm:p-3.5 relative z-0 flex-1 min-h-0 flex flex-col justify-between" style={{ zIndex: 0 }}>
                    <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                      <div className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5" />
                        <span className="font-bold tracking-wider">ADJUST FRAME &amp; BEST SHOT PICKER</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-500/30">
                          RATIO: <strong className="text-white">{slotW}:{slotH}</strong>
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#F042FF]/15 text-[#FFE5F1] border border-[#F042FF]/30 font-bold">
                          SLOT 0{activeSlotIndex + 1} ACTIVE
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                      {/* LEFT PANE: FRAME SLOTS (TARGET SELECTOR WITH AUTHENTIC PREVIEW ASPECT RATIO) */}
                      <div className="lg:col-span-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                            1. TARGET FRAME SLOTS ({slots.length})
                          </span>
                          <span className="font-mono text-[8.5px] text-zinc-500">
                            CLICK TO EDIT
                          </span>
                        </div>

                        <div className={`grid ${slots.length <= 3 ? 'grid-cols-3' : slots.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-2.5`}>
                          {slots.map((slot, index) => {
                            const isActive = activeSlotIndex === index;
                            const currentImg = imgPool[slot.imageIndex];

                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => { setActiveSlotIndex(index); playClickSound(); }}
                                className={`flex flex-col p-2 rounded-xl border transition-all duration-200 cursor-pointer text-left relative group ${
                                  isActive 
                                    ? "border-[#F042FF] bg-[#160042] ring-2 ring-[#F042FF]/50 shadow-[0_0_20px_rgba(240,66,255,0.35)]" 
                                    : "border-zinc-800/90 bg-[#070125]/90 hover:border-[#F042FF]/60 hover:bg-[#0e0236]"
                                }`}
                              >
                                {/* Thumbnail preserving exact slot aspect ratio */}
                                <div 
                                  className="relative w-full rounded-lg overflow-hidden border border-white/10 bg-black"
                                  style={{ aspectRatio: slotRatio }}
                                >
                                  {currentImg ? (
                                    <img 
                                      src={currentImg} 
                                      alt={`Slot ${index + 1}`} 
                                      className="w-full h-full object-cover photobooth-print-image group-hover:scale-102 transition-transform duration-200"
                                      style={{
                                        filter: slot.filter || "none"
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-[9px]">
                                      EMPTY
                                    </div>
                                  )}

                                  {/* Top-Left Slot Indicator Badge */}
                                  <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs font-mono text-[8px] text-white px-1.5 py-0.5 rounded font-bold leading-tight shadow border border-white/10">
                                    SL_0{index + 1}
                                  </div>

                                  {/* Top-Right Active Status Beacon */}
                                  {isActive && (
                                    <div className="absolute top-1 right-1 bg-[#F042FF] text-black font-mono text-[7px] font-black px-1.5 py-0.5 rounded shadow-md flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-black animate-ping" />
                                      <span>ACTIVE</span>
                                    </div>
                                  )}

                                  {/* Bottom-Right Shot Assigned Pill */}
                                  <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-xs font-mono text-[7.5px] text-[#FFE5F1] px-1.5 py-0.5 rounded font-bold leading-tight shadow border border-white/10">
                                    SHOT #{slot.imageIndex + 1}
                                  </div>
                                </div>

                                {/* Slot metadata footer */}
                                <div className="flex items-center justify-between mt-1.5 px-0.5 font-mono text-[8.5px]">
                                  <span className={`font-bold tracking-wider ${isActive ? "text-[#F042FF]" : "text-zinc-300"}`}>
                                    SLOT #{index + 1}
                                  </span>
                                  <span className={`uppercase tracking-widest text-[7.5px] ${isActive ? "text-[#FFE5F1] font-bold" : "text-zinc-500"}`}>
                                    {isActive ? "● EDITING" : "SELECT"}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* RIGHT PANE: SHOT ROLL SWAPPER (MAINTAINS EXACT PREVIEW ASPECT RATIO) */}
                      <div className="lg:col-span-7 p-2.5 sm:p-3 rounded-2xl border border-[#2e109d] bg-[#0c0233]/90 flex flex-col justify-between gap-2.5">
                        <div className="flex items-center justify-between font-mono text-[9.5px] pb-1 border-b border-zinc-800/80">
                          <div className="flex items-center gap-1.5 text-[#F042FF] font-bold">
                            <Sparkles className="w-3 h-3 text-[#F042FF]" />
                            <span>2. ASSIGN BEST SHOT TO SLOT #{activeSlotIndex + 1}</span>
                          </div>
                          <span className="text-zinc-400 text-[8px] uppercase tracking-wider">
                            CLICK TO ASSIGN (ASPECT: {slotW}:{slotH})
                          </span>
                        </div>

                        <div className={`grid ${imgPool.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : imgPool.length === 6 ? 'grid-cols-3 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'} gap-2.5`}>
                          {imgPool.map((imgSrc, imgIndex) => {
                            const isSelected = slots[activeSlotIndex]?.imageIndex === imgIndex;
                            const assignedOtherSlot = slots.findIndex((s, sIdx) => sIdx !== activeSlotIndex && s.imageIndex === imgIndex);

                            return (
                              <button
                                key={imgIndex}
                                type="button"
                                onClick={() => {
                                  const updatedSlots = [...slots];
                                  updatedSlots[activeSlotIndex].imageIndex = imgIndex;
                                  setSlots(updatedSlots);
                                  playClickSound();
                                }}
                                className={`relative w-full overflow-hidden cursor-pointer group rounded-xl transition-all duration-200 ${
                                  isSelected
                                    ? "ring-2 ring-[#F042FF] border-[#F042FF] shadow-[0_0_16px_rgba(240,66,255,0.45)] scale-[1.02]"
                                    : "border border-white/15 hover:border-[#F042FF]/70 hover:scale-[1.02]"
                                }`}
                                style={{
                                  aspectRatio: slotRatio,
                                  background: "#000",
                                  margin: 0
                                }}
                                title={`Assign Shot #${imgIndex + 1} to Slot #${activeSlotIndex + 1}`}
                              >
                                <img 
                                  src={imgSrc} 
                                  alt={`Shot ${imgIndex + 1}`} 
                                  className="w-full h-full object-cover photobooth-print-image group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute bottom-1 left-1 bg-black/85 backdrop-blur-xs text-white font-mono text-[8px] px-1.5 py-0.5 rounded font-bold leading-tight shadow border border-white/10">
                                  #{imgIndex + 1}
                                </div>
                                {isSelected ? (
                                  <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-[#F042FF] text-black font-mono font-black text-[7.5px] flex items-center gap-0.5 shadow-md">
                                    <span>✓</span>
                                    <span>SLOT {activeSlotIndex + 1}</span>
                                  </div>
                                ) : assignedOtherSlot !== -1 ? (
                                  <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/85 text-purple-300 border border-purple-500/30 font-mono text-[7px] leading-tight">
                                    SL_0{assignedOtherSlot + 1}
                                  </div>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>

                        {/* Quick utility controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 font-mono text-[8px] text-zinc-400">
                          <span>CLICK ANY SHOT TO ASSIGN</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = slots.map((s, idx) => ({ ...s, imageIndex: idx % imgPool.length }));
                              setSlots(updated);
                              playClickSound();
                            }}
                            className="hover:text-[#F042FF] underline cursor-pointer"
                          >
                            RESET SEQUENCE (1, 2, 3...)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PROCEED TO STEP 2 CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCurrentStep(2);
                    }}
                    className="btn-studio-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(240,66,255,0.3)] hover:shadow-[0_4px_35px_rgba(240,66,255,0.5)] font-bold tracking-wider uppercase cursor-pointer"
                  >
                    <span>PROCEED TO FRAME &amp; DECORATE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              );
            })()}

            {/* ========================================================= */}
            {/* STEP 02: DECORATION STATION & FRAME BACKGROUND COLOR     */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-3.5">

                {/* STEP 2 SUB-TAB SEGMENTED NAVIGATION */}
                <div className="w-full flex p-1 rounded-xl bg-[#090226] border border-[#2e109d] shadow-md">
                  <button
                    type="button"
                    onClick={() => {
                      setStep2SubTab("frame");
                      playClickSound();
                    }}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                      step2SubTab === "frame"
                        ? "bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white shadow-[0_0_20px_rgba(240,66,255,0.4)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">FRAME THEME OVERLAY</span>
                    {selectedFrame !== "none" && (
                      <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse ml-0.5 shrink-0" title="Graphic Frame Active" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep2SubTab("color");
                      playClickSound();
                    }}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                      step2SubTab === "color"
                        ? "bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white shadow-[0_0_20px_rgba(240,66,255,0.4)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">FRAME BACKGROUND COLOR</span>
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0 ml-0.5" 
                      style={{ background: stripColor }} 
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep2SubTab("decoration");
                      playClickSound();
                    }}
                    className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                      step2SubTab === "decoration"
                        ? "bg-gradient-to-r from-[#7226FF] to-[#F042FF] text-white shadow-[0_0_20px_rgba(240,66,255,0.4)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">DECORATION &amp; STICKERS</span>
                    {(stickers.length > 0 || doodles.length > 0) && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[#F042FF] text-black text-[9px] font-black ml-0.5 shrink-0">
                        {stickers.length + doodles.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* ========================================================= */}
                {/* SUB-TAB 1: FRAME THEME OVERLAY                            */}
                {/* ========================================================= */}
                {step2SubTab === "frame" && (
                  <div className="flex flex-col gap-2 flex-1 min-h-0 justify-between">
                    {/* 1. THEMED FRAME OVERLAYS CATALOG (PNG & VECTOR FRAMES) */}
                    <div className="web3-glass-card p-3 sm:p-3.5 flex flex-col flex-1 min-h-0 justify-between">
                      <div className="shrink-0">
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span className="font-bold uppercase">THEMED FRAME OVERLAYS</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono uppercase">
                            ACTIVE: <strong className="text-white">{availableFrames.find(f => f.id === selectedFrame)?.name || "Clean Borders"}</strong>
                          </span>
                        </div>

                        <p className="text-[10.5px] text-zinc-400 font-sans mb-2 leading-snug line-clamp-2 sm:line-clamp-none">
                          Select a graphic frame overlay designed for your photostrip layout. Graphic frames layer artwork directly over your photostrip while preserving your chosen backdrop color.
                        </p>
                      </div>

                      {category === "artist" ? (
                        <div className="p-3 bg-zinc-950/70 rounded-xl border border-purple-500/30 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-purple-200 font-bold uppercase flex items-center gap-1.5">
                              <span>🔒</span>
                              <span>OFFICIAL COLLAB FRAME</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#F042FF]/20 text-[#F042FF] border border-[#F042FF]/40 text-[9px] font-mono font-bold">
                              CAMPAIGN EXCLUSIVE
                            </span>
                          </div>
                          <p className="font-sans text-[10.5px] text-purple-300/80 leading-relaxed">
                            {artist?.name} exclusive artist collaboration uses dedicated official event framing and branding.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 min-h-0 max-h-[360px] sm:max-h-[400px] lg:max-h-[440px] xl:max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {availableFrames.map((f) => {
                            const isSelected = selectedFrame === f.id;
                            const isPng = f.type === 'png' || Boolean(f.imageSrc);
                            const isNone = f.id === 'none';

                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => {
                                  setSelectedFrame(f.id);
                                  playClickSound();
                                }}
                                className={`group relative flex flex-col rounded-xl p-2 text-left transition-all duration-200 cursor-pointer border ${
                                  isSelected
                                    ? "bg-[#1f0247] border-[#F042FF] shadow-[0_0_18px_rgba(240,66,255,0.35)] ring-1 ring-[#F042FF]"
                                    : "bg-[#0b0222]/80 border-[#2e109d]/70 hover:border-purple-500/60 hover:bg-[#140336]"
                                }`}
                              >
                                {/* Thumbnail */}
                                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center mb-1.5">
                                  {isNone ? (
                                    <div className="flex flex-col items-center justify-center p-2 text-center">
                                      <div className="w-8 h-12 rounded border-2 border-dashed border-zinc-600 flex items-center justify-center mb-1 group-hover:border-zinc-400 transition-colors">
                                        <span className="text-[9px] font-mono text-zinc-500">CLEAN</span>
                                      </div>
                                      <span className="font-mono text-[8.5px] text-zinc-400 font-bold uppercase">SOLID BORDER</span>
                                    </div>
                                  ) : isPng ? (
                                    <div className="relative w-full h-full p-1 flex items-center justify-center bg-zinc-950/60">
                                      <img
                                        src={normalizeMediaUrl(f.imageSrc)}
                                        alt={f.name}
                                        className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-200"
                                        onError={(e) => {
                                          if (f.fallbackSrc && e.target.src !== f.fallbackSrc) {
                                            e.target.src = f.fallbackSrc;
                                          }
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="relative w-full h-full p-1.5 flex flex-col items-center justify-center bg-gradient-to-b from-[#16023d] to-black/90">
                                      <div className="w-full h-full border border-dashed border-[#F042FF]/40 rounded p-1 flex flex-col justify-between items-center text-center">
                                        <span className="text-[7px] font-mono text-[#00F2FE]">✦ STUDIO ✦</span>
                                        <span className="font-mono text-[8.5px] font-bold text-white uppercase px-1 py-0.5 rounded bg-purple-950/80 border border-purple-500/40">
                                          {f.name.replace(" Frame", "")}
                                        </span>
                                        <span className="text-[7px] font-mono text-[#F042FF]">✦ THEME ✦</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Badge */}
                                  <div className="absolute top-1 left-1">
                                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-black uppercase tracking-wider ${
                                      isPng 
                                        ? "bg-[#F042FF] text-black shadow" 
                                        : isNone 
                                        ? "bg-zinc-800 text-zinc-300"
                                        : "bg-[#7226FF] text-white"
                                    }`}>
                                      {f.badge || (isPng ? "PNG" : "THEME")}
                                    </span>
                                  </div>

                                  {isSelected && (
                                    <div className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full bg-[#39FF14] text-black font-black text-[9px] flex items-center justify-center shadow-lg">
                                      ✓
                                    </div>
                                  )}
                                </div>

                                {/* Title & Info */}
                                <div className="flex flex-col">
                                  <span className="font-mono text-[11px] font-bold text-white group-hover:text-purple-200 truncate">
                                    {f.name}
                                  </span>
                                  <span className="font-sans text-[9.5px] text-zinc-400 line-clamp-1 mt-0.5">
                                    {f.description}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* BOTTOM NAVIGATION FOR SUB-TAB 1 (FRAME THEME OVERLAY) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setCurrentStep(1);
                        }}
                        className="btn-studio-secondary py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>BACK TO SHOTS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setStep2SubTab("color");
                        }}
                        className="btn-studio-primary py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer shadow-[0_4px_20px_rgba(240,66,255,0.3)]"
                      >
                        <span>NEXT: BG COLOR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setCurrentStep(3);
                        }}
                        className="hidden sm:flex btn-studio-secondary py-2 text-xs items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer text-purple-300 hover:text-white"
                      >
                        <span>FAST EXPORT</span>
                        <Download className="w-3.5 h-3.5 text-[#39FF14]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* SUB-TAB 2: FRAME BACKGROUND COLOR                         */}
                {/* ========================================================= */}
                {step2SubTab === "color" && (
                  <div className="flex flex-col gap-2 flex-1 min-h-0 justify-between">
                    {/* 2. FRAME BACKGROUND COLOR & GRADIENTS */}
                    <div className="web3-glass-card p-3 sm:p-3.5 flex flex-col flex-1 min-h-0 justify-between">
                      <div className="shrink-0">
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                          <div className="flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5" />
                            <span className="font-bold">FRAME BACKGROUND COLOR</span>
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono uppercase">
                            ACTIVE: <strong className="text-white">{stripColor}</strong>
                          </span>
                        </div>
                      </div>

                      {category === "artist" ? (
                        <div className="p-3 bg-zinc-950/70 rounded-xl border border-purple-500/20 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-zinc-400 uppercase">OFFICIAL COLLAB PALETTE:</span>
                            <div className="flex items-center gap-2">
                              <span 
                                className="w-4 h-4 rounded-full border border-white/50 shadow-sm"
                                style={{ background: activeDedicatedFrame?.bgGradient || activeDedicatedFrame?.bgColor || artist?.color || "#F042FF" }}
                              />
                              <span className="font-mono text-xs text-[#F042FF] font-bold">
                                {activeDedicatedFrame?.borderColor || artist?.color || "#F042FF"} (LOCKED)
                              </span>
                            </div>
                          </div>
                          <p className="font-sans text-[10.5px] text-purple-300/80 leading-relaxed">
                            Frame background and signature gradients are calibrated for this official collaboration to ensure museum-grade aesthetic fidelity.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 flex-1 min-h-0 max-h-[360px] sm:max-h-[400px] lg:max-h-[440px] xl:max-h-[480px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {/* Categorized Palette Swatches */}
                          <div className="space-y-2.5">
                            {/* Classic Neutrals */}
                            <div>
                              <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                                CLASSIC NEUTRALS
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: "white", val: "white", label: "Studio White" },
                                  { id: "silk", val: "#FAF6F9", label: "Silk Cream" },
                                  { id: "charcoal", val: "#18181b", label: "Charcoal" },
                                  { id: "black", val: "black", label: "Obsidian" }
                                ].map((col) => {
                                  const isSelected = stripColor === col.val;
                                  return (
                                    <button 
                                      key={col.id}
                                      type="button"
                                      onClick={() => {
                                        setStripColor(col.val);
                                        playClickSound();
                                      }} 
                                      className={isSelected ? "btn-filter-pill-active cursor-pointer" : "btn-filter-pill cursor-pointer"}
                                    >
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0" 
                                        style={{ backgroundColor: col.val }}
                                      />
                                      <span>{col.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Aesthetic Pastels */}
                            <div>
                              <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                                AESTHETIC PASTELS
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: "sakura", val: "#f6d5da", label: "Sakura Pink" },
                                  { id: "blush", val: "#FFE5F1", label: "Blush Glow" },
                                  { id: "matcha", val: "#dde6d5", label: "Matcha Sage" },
                                  { id: "sky", val: "#adc3e5", label: "Sky Blue" },
                                  { id: "lemon", val: "#FFF2CC", label: "Pastel Lemon" },
                                  { id: "lavender", val: "#dbcfff", label: "Lavender" }
                                ].map((col) => {
                                  const isSelected = stripColor === col.val;
                                  return (
                                    <button 
                                      key={col.id}
                                      type="button"
                                      onClick={() => {
                                        setStripColor(col.val);
                                        playClickSound();
                                      }} 
                                      className={isSelected ? "btn-filter-pill-active cursor-pointer" : "btn-filter-pill cursor-pointer"}
                                    >
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0" 
                                        style={{ backgroundColor: col.val }}
                                      />
                                      <span>{col.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Cyber & Night Tones */}
                            <div>
                              <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                                CYBER &amp; NIGHT VIBES
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: "navy", val: "#010030", label: "SNPSHOT Navy" },
                                  { id: "indigo", val: "#0e0048", label: "Electric Indigo" },
                                  { id: "slate", val: "#020617", label: "Midnight Slate" },
                                  { id: "cobalt", val: "#2e109d", label: "Cobalt Violet" }
                                ].map((col) => {
                                  const isSelected = stripColor === col.val;
                                  return (
                                    <button 
                                      key={col.id}
                                      type="button"
                                      onClick={() => {
                                        setStripColor(col.val);
                                        playClickSound();
                                      }} 
                                      className={isSelected ? "btn-filter-pill-active cursor-pointer" : "btn-filter-pill cursor-pointer"}
                                    >
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0" 
                                        style={{ backgroundColor: col.val }}
                                      />
                                      <span>{col.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Aesthetic Gradients */}
                            <div>
                              <span className="font-mono text-[9px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                                STUDIO GRADIENTS
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { id: "sunset-y2k", val: "linear-gradient(135deg, #7226FF, #F042FF)", label: "Sunset Y2K" },
                                  { id: "twilight-cyber", val: "linear-gradient(135deg, #010030, #2e109d, #F042FF)", label: "Twilight Cyber" },
                                  { id: "pastel-dream", val: "linear-gradient(135deg, #FFE5F1, #F3EBFC)", label: "Pastel Dream" },
                                  { id: "neon-aurora", val: "linear-gradient(135deg, #00F2FE, #4FACFE)", label: "Neon Aurora" },
                                  { id: "acid-cyber", val: "linear-gradient(135deg, #020617, #064e3b, #39FF14)", label: "Acid Cyber" },
                                  { id: "candy-pop", val: "linear-gradient(135deg, #ff9a9e, #fecfef)", label: "Candy Pop" },
                                  ...customBgColors.filter(c => c.layout === 'all' || c.layout === (layout === 'grid' ? `${photoCount}-grid` : layout)).map(c => ({
                                    id: c.id,
                                    val: c.val,
                                    label: c.label
                                  }))
                                ].map((col) => {
                                  const isSelected = stripColor === col.val;
                                  return (
                                    <button 
                                      key={col.id}
                                      type="button"
                                      onClick={() => {
                                        setStripColor(col.val);
                                        playClickSound();
                                      }} 
                                      className={isSelected ? "btn-filter-pill-active cursor-pointer" : "btn-filter-pill cursor-pointer"}
                                    >
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full border border-white/30 shrink-0" 
                                        style={{ background: col.val }}
                                      />
                                      <span>{col.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Custom Hex Color Wheel Input */}
                          <div className="p-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                              <label 
                                htmlFor="custom-hex-color-picker"
                                className="w-6 h-6 rounded-lg border border-zinc-700 cursor-pointer overflow-hidden relative shadow-inner shrink-0"
                                style={{ background: stripColor.startsWith("linear") ? "#F042FF" : stripColor }}
                                title="Open Color Wheel"
                              >
                                <input 
                                  id="custom-hex-color-picker"
                                  type="color"
                                  value={stripColor.startsWith("#") && stripColor.length === 7 ? stripColor : "#ffffff"}
                                  onChange={(e) => {
                                    setStripColor(e.target.value);
                                    setCustomHexColor(e.target.value);
                                  }}
                                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                />
                              </label>
                              <div className="flex flex-col">
                                <span className="font-mono text-[8.5px] text-zinc-400 uppercase font-bold">CUSTOM COLOR HEX</span>
                                <span className="font-mono text-[10px] text-white uppercase">{stripColor.startsWith("linear") ? "GRADIENT MODE" : stripColor}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <input 
                                type="text"
                                placeholder="#FFFFFF"
                                maxLength={7}
                                value={customHexColor}
                                onChange={(e) => {
                                  setCustomHexColor(e.target.value);
                                  if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                    setStripColor(e.target.value);
                                  }
                                }}
                                className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 font-mono text-xs text-white uppercase text-center focus:outline-none focus:border-[#F042FF]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (/^#[0-9A-Fa-f]{6}$/.test(customHexColor)) {
                                    setStripColor(customHexColor);
                                    playClickSound();
                                  }
                                }}
                                className="px-2 py-1 bg-zinc-800 hover:bg-[#F042FF] text-white font-mono text-[9px] font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                SET
                              </button>
                            </div>
                          </div>

                          {/* Watermark & Datestamp Studio (without mandatory brand label area) */}
                          <div className="p-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-2">
                            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#F042FF] font-bold uppercase tracking-wider">
                              <div className="flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-[#F042FF]" />
                                <span>WATERMARK &amp; DATESTAMP STUDIO</span>
                              </div>
                              <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400">
                                STANDARD YYYY.MM.DD
                              </span>
                            </div>

                            {/* Customizable Datestamp Mode Selector */}
                            <div className="space-y-1">
                              <span className="font-mono text-[8.5px] text-zinc-400 uppercase font-bold tracking-wider block">
                                DATESTAMP MODE (DEFAULT: OFF)
                              </span>
                              <div className="grid grid-cols-3 gap-1.5">
                                {[
                                  { id: "off", label: "OFF", hint: "No Date" },
                                  { id: "date", label: "DATE ONLY", hint: "2026.09.12" },
                                  { id: "datetime", label: "DATE + TIME", hint: "2026.09.12 • TIME" }
                                ].map((mode) => {
                                  const isActive = datestampMode === mode.id;
                                  return (
                                    <button
                                      key={mode.id}
                                      type="button"
                                      onClick={() => {
                                        setDatestampMode(mode.id);
                                        playClickSound();
                                      }}
                                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                                        isActive
                                          ? "bg-[#1f0247] border-[#F042FF] text-white shadow-[0_0_12px_rgba(240,66,255,0.3)] ring-1 ring-[#F042FF]"
                                          : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                                      }`}
                                    >
                                      <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider">
                                        {mode.label}
                                      </span>
                                      <span className="font-mono text-[7.5px] text-zinc-400 mt-0.5">
                                        {mode.hint}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Inscription Preview Pill */}
                            <div className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/10 flex items-center justify-between">
                              <span className="font-mono text-[8.5px] text-zinc-500 uppercase">FOOTER INSCRIPTION:</span>
                              <span className="font-mono text-[9.5px] text-purple-200 font-bold tracking-wider">
                                SNPSHOT STUDIO {datestampMode !== "off" && ` • ${formattedStudioDate}`}
                              </span>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>

                    {/* BOTTOM NAVIGATION FOR SUB-TAB 2 (FRAME BACKGROUND COLOR) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setStep2SubTab("frame");
                        }}
                        className="btn-studio-secondary py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>PREV: FRAME THEME</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setStep2SubTab("decoration");
                        }}
                        className="btn-studio-primary py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer shadow-[0_4px_20px_rgba(240,66,255,0.3)]"
                      >
                        <span>NEXT: STICKERS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setCurrentStep(3);
                        }}
                        className="hidden sm:flex btn-studio-secondary py-2 text-xs items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer text-purple-300 hover:text-white"
                      >
                        <span>FAST EXPORT</span>
                        <Download className="w-3.5 h-3.5 text-[#39FF14]" />
                      </button>
                    </div>
                  </div>
                )}

            {/* ========================================================= */}
            {/* SUB-TAB 3: DECORATION STATION & STICKERS                  */}
            {/* ========================================================= */}
            {step2SubTab === "decoration" && (
              <div className="flex flex-col gap-2 flex-1 min-h-0 justify-between">

                {/* 2. DECORATION STATION & DIGITAL STAMPS */}
                <div className="web3-glass-card p-3 sm:p-3.5 flex flex-col flex-1 min-h-0 justify-between">
                  <div className="shrink-0">
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="font-bold">DECORATION STATION</span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        STICKERS: <strong className="text-white">{stickers.length}</strong> | DOODLES: <strong className="text-white">{doodles.length}</strong>
                      </span>
                    </div>
                  </div>

                  {category === "artist" ? (
                    <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-200">
                        <span>🔒</span>
                        <span>STICKERS &amp; DOODLES LOCKED</span>
                      </div>
                      <p className="font-sans text-[10.5px] text-purple-300/80 leading-relaxed">
                        Digital stickers and freehand doodles are disabled for this official artist collaboration to preserve authentic copyright branding, signature portrait composition, and clean print aesthetics.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 flex-1 min-h-0">
                      
                      {/* Tool Tab selectors */}
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => { setActiveTool("select"); playClickSound(); }}
                          className={activeTool === "select" ? "btn-format-chip-active flex-1 justify-center py-2 cursor-pointer text-xs" : "btn-format-chip flex-1 justify-center py-2 cursor-pointer text-xs"}
                        >
                          ✨ STICKERS &amp; STAMPS
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => { setActiveTool("draw"); playClickSound(); }}
                          className={activeTool === "draw" ? "btn-format-chip-active flex-1 justify-center py-2 cursor-pointer text-xs" : "btn-format-chip flex-1 justify-center py-2 cursor-pointer text-xs"}
                        >
                          🎨 NEON DOODLES
                        </button>
                      </div>

                      {/* Paint Sub-panel */}
                      {activeTool === "draw" && (
                        <div className="p-3 rounded-xl border border-dashed border-[#F042FF]/40 bg-[#F042FF]/5 flex flex-col gap-2.5 flex-1 min-h-0 max-h-[360px] sm:max-h-[400px] lg:max-h-[440px] xl:max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                          <div className="font-mono text-[9.5px] text-[#F042FF] uppercase tracking-widest font-bold">
                            🖌️ BRUSH COLOR &amp; SIZE
                          </div>

                          {/* Paint swatches */}
                          <div className="flex gap-1.5 flex-wrap items-center">
                            {[
                              { hex: "#F042FF", name: "Neon Magenta Glow" },
                              { hex: "#FFE5F1", name: "Soft Pink Glow" },
                              { hex: "#7226FF", name: "Electric Violet" },
                              { hex: "#ffaa00", name: "Gold Glow" },
                              { hex: "#bd00ff", name: "Purple Glow" },
                              { hex: "#ffffff", name: "White Light" },
                              { hex: "#39FF14", name: "Cyber Green" },
                              { hex: "#00F0FF", name: "Cyan Spark" }
                            ].map(col => (
                              <button
                                key={col.hex}
                                type="button"
                                onClick={() => { setBrushColor(col.hex); playClickSound(); }}
                                className="w-7 h-7 rounded-full border-2 transition-all duration-150 cursor-pointer"
                                style={{
                                  background: col.hex,
                                  borderColor: brushColor === col.hex ? "#000000" : "transparent",
                                  boxShadow: brushColor === col.hex ? `0 0 10px ${col.hex}` : "none",
                                  margin: 0,
                                  padding: 0
                                }}
                                title={col.name}
                              />
                            ))}

                            {/* Custom Brush Color Wheel */}
                            <label 
                              htmlFor="custom-brush-color-picker"
                              className="w-7 h-7 rounded-full border-2 border-zinc-700 cursor-pointer relative overflow-hidden shrink-0 ml-1 shadow-md"
                              style={{ background: brushColor }}
                              title="Pick Custom Brush Color"
                            >
                              <input 
                                id="custom-brush-color-picker"
                                type="color"
                                value={brushColor}
                                onChange={(e) => setBrushColor(e.target.value)}
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                              />
                            </label>
                          </div>

                          {/* Brush Slider */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                              <span>BRUSH SIZE: {brushWidth}PX</span>
                              <span>DRAG ON CANVAS TO DRAW</span>
                            </div>
                            <input
                              type="range"
                              min="3"
                              max="25"
                              value={brushWidth}
                              onChange={(e) => setBrushWidth(Number(e.target.value))}
                              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#F042FF]"
                            />
                          </div>

                          {/* Undo / Clear operations */}
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => { setDoodles(prev => prev.slice(0, -1)); playClickSound(); }}
                              className="btn-studio-secondary py-1.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                              disabled={doodles.length === 0}
                            >
                              <Undo className="w-3.5 h-3.5" /> UNDO STROKE
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => { setDoodles([]); playClickSound(); }}
                              className="btn-studio-secondary py-1.5 text-xs flex items-center justify-center gap-1.5 text-[#FF003C] border-[#FF003C]/30 hover:border-[#FF003C] cursor-pointer"
                              disabled={doodles.length === 0}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL ({doodles.length})
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sticker selector sub-panel */}
                      {activeTool === "select" && (
                        <div className="flex flex-col gap-2.5 flex-1 min-h-0 max-h-[360px] sm:max-h-[400px] lg:max-h-[440px] xl:max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                          {/* Category filter tabs */}
                          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/80 shrink-0">
                            {[
                              { id: "all", label: "ALL" },
                              { id: "stamp", label: "✦ STAMPS" },
                              { id: "sticker", label: "💖 STICKERS" },
                              { id: "doodle", label: "✏️ DOODLES" },
                              { id: "watermark", label: "🔖 WATERMARKS" },
                              { id: "emoji", label: "✨ EMOJIS" },
                              { id: "text", label: "🔤 TYPOGRAPHY" }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setStickerCategoryTab(tab.id)}
                                className={`px-2.5 py-1 text-[9.5px] font-mono font-bold tracking-wider rounded-md transition-all whitespace-nowrap cursor-pointer ${
                                  stickerCategoryTab === tab.id
                                    ? "bg-[#F042FF] text-white shadow-[0_0_10px_rgba(240,66,255,0.4)]"
                                    : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {/* Digital Stamps / Stickers library display */}
                          {(stickerCategoryTab === "all" || stickerCategoryTab === "stamp" || stickerCategoryTab === "sticker" || stickerCategoryTab === "doodle" || stickerCategoryTab === "watermark") && customStickers.length > 0 && (
                            <div>
                              <span className="font-mono text-[9px] text-[#F042FF] font-bold uppercase block mb-1 tracking-wider">
                                ✦ DIGITAL STAMPS &amp; STICKERS ({customStickers.filter(s => stickerCategoryTab === "all" || s.type === stickerCategoryTab).length})
                              </span>
                              <div className="grid grid-cols-6 gap-1.5 p-1.5 bg-[#F042FF]/5 border border-[#F042FF]/20 rounded-xl max-h-36 overflow-y-auto custom-scrollbar">
                                {customStickers
                                  .filter(s => stickerCategoryTab === "all" || s.type === stickerCategoryTab)
                                  .map(stk => (
                                    <button
                                      key={stk.id}
                                      type="button"
                                      title={`${stk.name} (${stk.packName || stk.type})`}
                                      onClick={() => {
                                        const config = getLayoutConfig();
                                        const { width, height } = config.getCanvasDimensions();
                                        const newSticker = {
                                          id: Date.now() + Math.random(),
                                          type: "png",
                                          value: stk.imageSrc,
                                          blendMode: stk.blendMode || "normal",
                                          x: width / 2,
                                          y: height / 2,
                                          scale: 1.0,
                                          rotation: 0
                                        };
                                        setStickers(prev => [...prev, newSticker]);
                                        setSelectedStickerId(newSticker.id);
                                        playStickerPopSound();
                                      }}
                                      className="p-1 bg-zinc-950/70 border border-zinc-800 rounded-lg hover:border-[#F042FF] transition-colors flex flex-col items-center justify-center h-12 cursor-pointer relative group"
                                      style={{ margin: 0 }}
                                    >
                                      <img
                                        src={stk.imageSrc}
                                        alt={stk.name}
                                        referrerPolicy="no-referrer"
                                        className="max-w-full max-h-7 object-contain"
                                      />
                                      <span className="text-[6.5px] font-mono text-zinc-400 truncate w-full text-center mt-0.5 group-hover:text-[#F042FF]">
                                        {stk.name}
                                      </span>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Emoji stamp pool */}
                          {(stickerCategoryTab === "all" || stickerCategoryTab === "emoji") && (
                            <div>
                              <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1 tracking-wider">
                                EMOJI STAMP POOL
                              </span>
                              <div className="grid grid-cols-8 gap-1 p-1.5 bg-zinc-950/70 border border-zinc-900 rounded-xl">
                                {[
                                  "💖", "🎀", "🍒", "🦋", "👾", "🦄", "🍭", "👽", 
                                  "🌸", "⚡", "🌟", "🌈", "🧁", "🧸", "🕶️", "💿", 
                                  "📸", "🎞️", "🖤", "👑", "✨", "🪩", "🪄", "🔥"
                                ].map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      const config = getLayoutConfig();
                                      const { width, height } = config.getCanvasDimensions();
                                      const newSticker = {
                                        id: Date.now() + Math.random(),
                                        type: "emoji",
                                        value: emoji,
                                        x: width / 2,
                                        y: height / 2,
                                        scale: 1.0,
                                        rotation: 0
                                      };
                                      setStickers(prev => [...prev, newSticker]);
                                      setSelectedStickerId(newSticker.id);
                                      playStickerPopSound();
                                    }}
                                    className="text-xl p-0.5 bg-none hover:bg-white/10 rounded transition-colors text-center cursor-pointer"
                                    style={{ margin: 0, padding: 0 }}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Typography words */}
                          {(stickerCategoryTab === "all" || stickerCategoryTab === "text") && (
                            <>
                              <div>
                                <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1 tracking-wider">
                                  TYPOGRAPHY WORD DECOR
                                </span>
                                <div className="flex gap-1.5 flex-wrap">
                                  {["Y2K", "BABY", "COOL", "ANGEL", "LOVE", "QUEEN", "SPARK", "CHILL", "DAEBAK", "IDOL", "BESTIES", "VIBES", "SUPERSTAR", "RETRO"].map(textWord => (
                                    <button
                                      key={textWord}
                                      type="button"
                                      onClick={() => {
                                        const config = getLayoutConfig();
                                        const { width, height } = config.getCanvasDimensions();
                                        const newSticker = {
                                          id: Date.now() + Math.random(),
                                          type: "text",
                                          value: textWord,
                                          x: width / 2,
                                          y: height / 2,
                                          scale: 1.2,
                                          rotation: 0,
                                          color: "#F042FF"
                                        };
                                        setStickers(prev => [...prev, newSticker]);
                                        setSelectedStickerId(newSticker.id);
                                        playStickerPopSound();
                                      }}
                                      className="camera-ctrl cursor-pointer"
                                      style={{
                                        margin: 0,
                                        fontSize: "0.7rem",
                                        fontWeight: "bold",
                                        padding: "4px 10px",
                                        border: "none",
                                        borderRadius: "999px",
                                        background: "linear-gradient(135deg, #FFE5F1, #F042FF, #7226FF)",
                                        color: "white"
                                      }}
                                    >
                                      {textWord}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Custom Text input string */}
                              <div className="flex gap-2">
                                <input
                                  id="custom-sticker-text-input"
                                  type="text"
                                  placeholder="TYPE CUSTOM WORD STICKER..."
                                  maxLength={14}
                                  style={{ flex: 1, padding: "6px 10px", fontSize: "0.75rem", textTransform: "uppercase" }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && e.target.value.trim()) {
                                      const config = getLayoutConfig();
                                      const { width, height } = config.getCanvasDimensions();
                                      const newSticker = {
                                        id: Date.now() + Math.random(),
                                        type: "text",
                                        value: e.target.value.trim().toUpperCase(),
                                        x: width / 2,
                                        y: height / 2,
                                        scale: 1.2,
                                        rotation: 0,
                                        color: "#F042FF"
                                      };
                                      setStickers(prev => [...prev, newSticker]);
                                      setSelectedStickerId(newSticker.id);
                                      playStickerPopSound();
                                      e.target.value = "";
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const inputEl = document.getElementById("custom-sticker-text-input");
                                    if (inputEl && inputEl.value.trim()) {
                                      const config = getLayoutConfig();
                                      const { width, height } = config.getCanvasDimensions();
                                      const newSticker = {
                                        id: Date.now() + Math.random(),
                                        type: "text",
                                        value: inputEl.value.trim().toUpperCase(),
                                        x: width / 2,
                                        y: height / 2,
                                        scale: 1.2,
                                        rotation: 0,
                                        color: "#F042FF"
                                      };
                                      setStickers(prev => [...prev, newSticker]);
                                      setSelectedStickerId(newSticker.id);
                                      playStickerPopSound();
                                      inputEl.value = "";
                                    }
                                  }}
                                  className="y2k-button font-mono text-xs font-bold cursor-pointer"
                                  style={{ margin: 0, padding: "6px 12px" }}
                                >
                                  ADD
                                </button>
                              </div>
                            </>
                          )}

                          {/* Sticker Manipulator Box */}
                          {selectedStickerId && stickers.find(s => s.id === selectedStickerId) && (
                            <div className="p-3 rounded-xl border border-dashed border-[#F042FF]/40 bg-[#F042FF]/5 flex flex-col gap-2.5">
                              {(() => {
                                const activeStg = stickers.find(s => s.id === selectedStickerId);
                                if (!activeStg) return null;
                                return (
                                  <div className="flex flex-col gap-2.5">
                                    <div className="flex justify-between items-center pb-1 border-b border-zinc-900">
                                      <span className="font-mono text-[9px] text-[#F042FF] font-bold uppercase tracking-widest flex items-center gap-1">
                                        <SlidersHorizontal className="w-3 h-3" /> ADJUST STICKER
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
                                          setSelectedStickerId(null);
                                        }}
                                        className="text-red-500 font-mono text-[9.5px] font-bold tracking-wider hover:underline cursor-pointer"
                                        style={{ background: "none", border: "none", padding: 0 }}
                                      >
                                        DELETE STICKER [X]
                                      </button>
                                    </div>

                                    {/* Scale slider */}
                                    <div className="flex flex-col gap-1">
                                      <div className="flex justify-between font-mono text-[8.5px] text-zinc-400">
                                        <span>SCALE: {Math.round(activeStg.scale * 100)}%</span>
                                      </div>
                                      <input
                                        type="range"
                                        min="0.4"
                                        max="3.0"
                                        step="0.1"
                                        value={activeStg.scale}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, scale: val } : s));
                                        }}
                                        className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#F042FF]"
                                      />
                                    </div>

                                    {/* Rotation slider & Quick Controls */}
                                    <div className="flex flex-col gap-1">
                                      <div className="flex justify-between font-mono text-[8.5px] text-zinc-400">
                                        <span>ROTATION: {activeStg.rotation || 0}°</span>
                                        <div className="flex gap-1">
                                          <button
                                            type="button"
                                            onClick={() => rotateActiveStickerBy(-45)}
                                            className="text-[7.5px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300 font-mono"
                                          >
                                            -45°
                                          </button>
                                          <button
                                            type="button"
                                            onClick={resetActiveStickerRotation}
                                            className="text-[7.5px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300 font-mono"
                                          >
                                            0°
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => rotateActiveStickerBy(45)}
                                            className="text-[7.5px] bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded text-zinc-300 font-mono"
                                          >
                                            +45°
                                          </button>
                                        </div>
                                      </div>
                                      <input
                                        type="range"
                                        min="-180"
                                        max="180"
                                        step="5"
                                        value={activeStg.rotation || 0}
                                        onChange={(e) => {
                                          const val = Number(e.target.value);
                                          setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rotation: val } : s));
                                        }}
                                        className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#F042FF]"
                                      />
                                    </div>

                                    {/* Color Picker for typography text stickers */}
                                    {activeStg.type === "text" && (
                                      <div className="flex flex-col gap-1.5">
                                        <span className="font-mono text-[8.5px] text-zinc-400">TEXT GLOW COLOR</span>
                                        <div className="flex gap-1.5">
                                          {["#F042FF", "#FFE5F1", "#7226FF", "#39FF14", "#FFFF00", "#00F2FE", "#ffffff"].map(c => (
                                            <button
                                              key={c}
                                              type="button"
                                              onClick={() => {
                                                setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, color: c } : s));
                                              }}
                                              className="w-4 h-4 rounded-full border transition-all cursor-pointer"
                                              style={{
                                                background: c,
                                                borderColor: activeStg.color === c ? "#000" : "transparent",
                                                margin: 0,
                                                padding: 0
                                              }}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Actions: Duplicate, Layering */}
                                    <div className="grid grid-cols-3 gap-1 mt-0.5">
                                      <button
                                        type="button"
                                        onClick={duplicateActiveSticker}
                                        className="btn-studio-secondary py-1 px-1.5 text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <Copy className="w-2.5 h-2.5 text-[#F042FF]" /> DUP
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setStickers(prev => {
                                            const selected = prev.find(s => s.id === selectedStickerId);
                                            if (!selected) return prev;
                                            const filtered = prev.filter(s => s.id !== selectedStickerId);
                                            return [...filtered, selected];
                                          });
                                        }}
                                        className="btn-studio-secondary py-1 px-1.5 text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        🔝 FRONT
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setStickers(prev => {
                                            const selected = prev.find(s => s.id === selectedStickerId);
                                            if (!selected) return prev;
                                            const filtered = prev.filter(s => s.id !== selectedStickerId);
                                            return [selected, ...filtered];
                                          });
                                        }}
                                        className="btn-studio-secondary py-1 px-1.5 text-[9px] flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        🧲 BACK
                                      </button>
                                    </div>

                                    <span className="font-mono text-[8px] text-center text-zinc-500 block">
                                      ℹ️ DRAG DIRECTLY ON CANVAS PREVIEW TO POSITION
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Clear all stickers */}
                          {stickers.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setStickers([]);
                                setSelectedStickerId(null);
                              }}
                              className="btn-studio-secondary py-1.5 text-xs flex items-center justify-center gap-1.5 text-[#FF003C] border-[#FF003C]/30 hover:border-[#FF003C] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL STICKERS ({stickers.length})
                            </button>
                          )}

                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* SUB-TAB 3 (DECORATION) NAVIGATION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setStep2SubTab("color");
                    }}
                    className="btn-studio-secondary py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>PREV: BG COLOR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCurrentStep(3);
                    }}
                    className="btn-studio-primary py-2 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer shadow-[0_4px_20px_rgba(240,66,255,0.3)]"
                  >
                    <span>EXPORT &amp; SHARE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            )}

            </div>
          )}

            {/* ========================================================= */}
            {/* STEP 03: EXPORT, PRINT & COMMUNITY SHARING               */}
            {/* ========================================================= */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-3 flex-1 min-h-0 justify-between">

                {/* 1. EDITED PHOTOSHOOT RESULT SUMMARY CARD */}
                <div className="web3-glass-card p-4 sm:p-5 border-[#F042FF]/30 bg-[#0c0228]/80">
                  <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="font-bold">EDITED PHOTOSHOOT READY</span>
                    </div>
                    <span className="text-[10px] text-[#39FF14] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 300 DPI ULTRA HD
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 font-mono text-xs mb-3">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">STRIP FORMAT:</span>
                      <span className="text-white font-bold uppercase">{layout === '3x2' ? '2x3 Postcard' : (layout === '2x2' ? '2x2 Square' : `${photoCount}-Strip Grid`)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">STYLE / THEME:</span>
                      <span className="text-[#F042FF] font-bold truncate block">{category === 'artist' ? (activeDedicatedFrame?.name || artist?.name) : (availableFrames.find(f => f.id === selectedFrame)?.name || selectedFrame)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">CUSTOM ASSETS:</span>
                      <span className="text-zinc-300 font-bold">{stickers.length} Stickers, {doodles.length} Strokes</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">CANVAS BACKGROUND:</span>
                      <span className="text-zinc-300 font-bold uppercase">{category === 'artist' ? 'Dedicated Collab' : stripColor}</span>
                    </div>
                  </div>

                  {/* Print Spec Indicators */}
                  <div className="flex items-center justify-between px-3 py-2 bg-[#F042FF]/5 border border-[#F042FF]/20 rounded-lg text-[9.5px] font-mono text-zinc-300">
                    <span className="flex items-center gap-1 text-[#F042FF] font-bold">
                      <Check className="w-3 h-3 text-[#39FF14]" /> 300 DPI MASTER PRINT READY
                    </span>
                    <span className="text-zinc-400">sRGB • HIGH-PASS FILTER ON</span>
                  </div>
                </div>

                {/* 2. CORE EXPORT ACTIONS (DOWNLOAD, PRINT LOUNGE, GALLERY) */}
                <div className="web3-glass-card p-4 sm:p-5 space-y-2.5">
                  <div className="font-mono text-xs text-zinc-300 font-bold pb-1 uppercase tracking-wider flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-[#F042FF]" />
                    <span>EXPORT &amp; PRINT OPTIONS</span>
                  </div>

                  {/* Primary: Download High-Res */}
                  <button 
                    type="button"
                    onClick={downloadPhotoStrip}
                    className="btn-studio-primary w-full py-3.5 text-xs flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(240,66,255,0.35)] hover:shadow-[0_4px_35px_rgba(240,66,255,0.55)] cursor-pointer font-bold tracking-wider uppercase"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD HIGH-RES STRIP (300 DPI)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Secondary: Print Strip & Physical Orders */}
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setIsPrintModalOpen(true);
                      }}
                      className="btn-studio-secondary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-bold uppercase hover:border-[#7226FF]/60 hover:text-white"
                    >
                      <Printer className="w-4 h-4 shrink-0 text-purple-300" />
                      <span>PRINT &amp; PHYSICAL PRINTS</span>
                    </button>

                    {/* Secondary: Share to Community Gallery */}
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setIsPublishModalOpen(true);
                      }}
                      className="btn-studio-secondary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-bold uppercase hover:border-[#F042FF]/60 hover:text-[#FFE5F1]"
                    >
                      <Globe className="w-4 h-4 shrink-0 text-[#F042FF]" />
                      <span>COMMUNITY LOUNGE</span>
                    </button>
                  </div>
                </div>

                {/* 3. SHARE BY EMAIL */}
                <div className="web3-glass-card p-4 sm:p-5">
                  <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="font-bold">SHARE BY EMAIL</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="ENTER RECIPIENT EMAIL..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 font-mono text-xs bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F042FF]"
                      />
                      <button 
                        type="button"
                        onClick={sendPhotoStripToEmail}
                        className="btn-studio-primary px-4 py-2 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold uppercase shrink-0"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>SEND</span>
                      </button>
                    </div>
                    
                    {status && (
                      <p 
                        className="font-mono text-xs tracking-wider uppercase mt-0.5 text-center"
                        style={{
                          color: status.includes("SUCCESS") ? "#39FF14" : status.includes("Error") || status.includes("failed") || status.includes("ERR") ? "#FF003C" : "#FFFF00"
                        }}
                      >
                        {status}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. STEP 3 FOOTER CONTROLS: RETURN TO EDIT OR NEW SESSION */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setCurrentStep(2);
                    }}
                    className="btn-studio-secondary py-3 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>RETURN TO DECORATION</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewSession}
                    className="btn-studio-secondary py-3 text-xs flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider cursor-pointer border-[#2e109d] hover:border-[#F042FF]/50 text-purple-200 hover:text-white"
                    title="Start a new photobooth session from layout selection"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#F042FF]" />
                    <span>NEW SESSION</span>
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL 1: STUDIO PRINT LOUNGE (LOCAL & PHYSICAL LAB ORDERS) */}
        {/* Rendered via createPortal to document.body with z-[99999]  */}
        {/* ========================================================= */}
        {isPrintModalOpen && createPortal(
          <div 
            className="fixed inset-0 z-[99999] bg-[#010030]/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => !isPhysicalOrderSubmitting && setIsPrintModalOpen(false)}
          >
            <div 
              className="bg-[#020617] border border-[#7226FF]/50 rounded-3xl max-w-3xl w-full shadow-[0_20px_80px_rgba(1,0,48,0.95)] overflow-hidden relative text-white my-auto flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-950/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#7226FF]/20 border border-[#7226FF] flex items-center justify-center text-[#F042FF]">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                      <span>Studio Print Lounge</span>
                      <span className="bg-[#39FF14]/15 border border-[#39FF14]/40 text-[#39FF14] text-[9px] font-mono px-2 py-0.5 rounded-full">
                        300 DPI LAB READY
                      </span>
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-400">AirPrint &amp; Inkjet Local Studio Dispatch or Physical Print Delivery</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  
                  {/* Left: Photostrip Print Mockup with Simulated Sheen */}
                  <div className="md:col-span-5 flex flex-col items-center">
                    <div className="w-full text-center mb-2 font-mono text-[9.5px] text-zinc-400 uppercase tracking-wider">
                      ✦ PHYSICAL PRINT SIMULATION ✦
                    </div>
                    <div 
                      className={`relative p-3 rounded-2xl border border-zinc-700/60 shadow-[0_25px_60px_rgba(0,0,0,0.8)] transition-all duration-300 ${
                        printPaperFinish === 'glossy' 
                          ? 'bg-gradient-to-b from-white/20 via-zinc-900 to-black' 
                          : printPaperFinish === 'holographic' 
                            ? 'bg-gradient-to-tr from-[#00F2FE]/20 via-[#F042FF]/20 to-[#39FF14]/20' 
                            : 'bg-zinc-900'
                      }`}
                    >
                      {/* Realistic Paper Sheen Reflection Overlay */}
                      {printPaperFinish === 'glossy' && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rounded-2xl" />
                      )}
                      {printPaperFinish === 'holographic' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F042FF]/15 via-[#00F2FE]/15 to-[#39FF14]/15 pointer-events-none rounded-2xl mix-blend-color-dodge" />
                      )}

                      {/* Photostrip Canvas Mirror */}
                      <div className="max-h-72 overflow-hidden flex items-center justify-center rounded-lg bg-zinc-950">
                        {stripCanvasRef.current ? (
                          <img 
                            src={stripCanvasRef.current.toDataURL("image/png")} 
                            alt="Print Preview"
                            className="max-h-64 w-auto object-contain rounded drop-shadow-md"
                          />
                        ) : (
                          <div className="p-8 text-center text-xs font-mono text-zinc-500">Preparing Strip...</div>
                        )}
                      </div>

                      {/* Paper specs footer */}
                      <div className="mt-2 text-center font-mono text-[8px] text-zinc-400 uppercase">
                        <span>{printPaperFormat.toUpperCase()}</span> • <span>{printPaperFinish.toUpperCase()} FINISH</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Print Controls & Physical Delivery */}
                  <div className="md:col-span-7 space-y-4">
                    
                    {/* Mode Selector: Local Print vs Physical Order */}
                    <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setIsPhysicalOrderMode(false);
                          playClickSound();
                        }}
                        className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          !isPhysicalOrderMode ? "bg-[#7226FF] text-white shadow-[0_0_15px_rgba(114,38,255,0.4)]" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>LOCAL PRINTER</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsPhysicalOrderMode(true);
                          playClickSound();
                        }}
                        className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isPhysicalOrderMode ? "bg-[#F042FF] text-white shadow-[0_0_15px_rgba(240,66,255,0.4)]" : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>ORDER LAB PRINTS</span>
                      </button>
                    </div>

                    {!isPhysicalOrderMode ? (
                      /* Local Print Formats */
                      <div className="space-y-3">
                        {/* Paper Format */}
                        <div>
                          <label className="block font-mono text-[9.5px] text-zinc-400 uppercase font-bold mb-1">
                            Paper Print Format
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "strip-2x6", label: "2x6\" Strip" },
                              { id: "postcard-4x6", label: "4x6\" Postcard" },
                              { id: "wallet-mini", label: "Wallet Mini" }
                            ].map(fmt => (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setPrintPaperFormat(fmt.id)}
                                className={`py-2 px-2 text-center rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                                  printPaperFormat === fmt.id
                                    ? "bg-[#7226FF]/20 border-[#7226FF] text-white"
                                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {fmt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Paper Finish */}
                        <div>
                          <label className="block font-mono text-[9.5px] text-zinc-400 uppercase font-bold mb-1">
                            Paper Finish Emulsion
                          </label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              { id: "glossy", label: "Glossy Luster" },
                              { id: "matte", label: "Soft Silk Matte" },
                              { id: "holographic", label: "Holo Prism" }
                            ].map(finish => (
                              <button
                                key={finish.id}
                                type="button"
                                onClick={() => setPrintPaperFinish(finish.id)}
                                className={`py-2 px-2 text-center rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                                  printPaperFinish === finish.id
                                    ? "bg-[#F042FF]/20 border-[#F042FF] text-white"
                                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {finish.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                          <span className="font-mono text-xs text-zinc-300">PRINT COPIES:</span>
                          <div className="flex items-center gap-2">
                            {[1, 2, 4].map(q => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => setPrintQuantity(q)}
                                className={`w-8 h-8 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                                  printQuantity === q
                                    ? "bg-[#7226FF] border-[#7226FF] text-white shadow-sm"
                                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                                }`}
                              >
                                {q}x
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Execute Local Print */}
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            window.print();
                          }}
                          className="btn-studio-primary w-full py-3 text-xs flex items-center justify-center gap-2 uppercase tracking-wider font-bold shadow-[0_4px_25px_rgba(114,38,255,0.4)] cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                          <span>SEND TO PRINTER (PRINT NOW)</span>
                        </button>
                      </div>
                    ) : (
                      /* Physical Lab Print Order */
                      <div className="space-y-3">
                        {physicalOrderConfirmed ? (
                          <div className="p-5 rounded-2xl border border-[#39FF14]/40 bg-[#39FF14]/10 text-center space-y-2">
                            <CheckCircle2 className="w-10 h-10 text-[#39FF14] mx-auto animate-bounce" />
                            <h4 className="font-display font-black text-sm uppercase text-white tracking-wider">
                              Physical Print Order Confirmed!
                            </h4>
                            <p className="font-mono text-[11px] text-zinc-300">
                              Order Ticket <strong className="text-[#39FF14]">{orderTrackingId}</strong> is queued at our SNPSHOT lab.
                            </p>
                            <div className="p-2.5 bg-zinc-950/80 rounded-xl border border-zinc-800 text-[10px] font-mono text-zinc-400 text-left">
                              <div>RECIPIENT: <strong className="text-white">{physicalOrderData.name}</strong></div>
                              <div>DESTINATION: <strong className="text-white">{physicalOrderData.address}</strong></div>
                              <div>DISPATCH ESTIMATE: <strong className="text-[#39FF14]">2-3 BUSINESS DAYS</strong></div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPhysicalOrderConfirmed(false);
                                setIsPhysicalOrderMode(false);
                              }}
                              className="btn-studio-secondary text-[11px] py-1.5 px-4 uppercase"
                            >
                              Close Order
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handlePhysicalOrderSubmit} className="space-y-3">
                            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-mono text-zinc-400">
                              🚀 Real studio print dispatch on Fuji Crystal Archive professional paper. Free courier delivery for session participants!
                            </div>

                            <div>
                              <label className="block font-mono text-[9.5px] text-zinc-400 uppercase font-bold mb-1">
                                Recipient Name
                              </label>
                              <input 
                                type="text"
                                required
                                placeholder="Full Name"
                                value={physicalOrderData.name}
                                onChange={(e) => setPhysicalOrderData({ ...physicalOrderData, name: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F042FF] font-mono"
                              />
                            </div>

                            <div>
                              <label className="block font-mono text-[9.5px] text-zinc-400 uppercase font-bold mb-1">
                                Shipping Address &amp; Postal Code
                              </label>
                              <textarea 
                                required
                                rows={2}
                                placeholder="Street Address, City, Postal Code"
                                value={physicalOrderData.address}
                                onChange={(e) => setPhysicalOrderData({ ...physicalOrderData, address: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F042FF] font-mono resize-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isPhysicalOrderSubmitting}
                              className="btn-studio-primary w-full py-3 text-xs flex items-center justify-center gap-2 uppercase tracking-wider font-bold cursor-pointer shadow-[0_4px_25px_rgba(240,66,255,0.4)]"
                            >
                              <Package className="w-4 h-4" />
                              <span>{isPhysicalOrderSubmitting ? "TRANSMITTING ORDER TICKET..." : "✦ SUBMIT PHYSICAL LAB ORDER (FREE) ✦"}</span>
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* ========================================================= */}
        {/* MODAL 2: COMMUNITY SHARING LOUNGE                         */}
        {/* Rendered via createPortal to document.body with z-[99999]  */}
        {/* ========================================================= */}
        {isPublishModalOpen && createPortal(
          <div 
            className="fixed inset-0 z-[99999] bg-[#010030]/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => !isPublishing && setIsPublishModalOpen(false)}
          >
            <div 
              className="bg-[#020617] border border-[#F042FF]/50 rounded-3xl max-w-4xl w-full shadow-[0_20px_80px_rgba(240,66,255,0.3)] overflow-hidden relative text-white my-auto flex flex-col max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-950/80 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F042FF]/20 border border-[#F042FF] flex items-center justify-center text-[#F042FF]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
                      <span>Community Sharing Lounge</span>
                      <span className="bg-[#F042FF]/20 border border-[#F042FF]/50 text-[#F042FF] text-[9px] font-mono px-2 py-0.5 rounded-full">
                        PUBLIC SHOWCASE
                      </span>
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-400">Publish your customized strip to the SNPSHOT community feed</p>
                  </div>
                </div>
                {!isPublishing && (
                  <button 
                    onClick={() => setIsPublishModalOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
                {publishSuccess ? (
                  <div className="py-10 text-center space-y-3">
                    <CheckCircle2 className="w-14 h-14 text-[#39FF14] mx-auto animate-bounce" />
                    <h4 className="font-display font-black text-xl text-white uppercase tracking-wider">
                      Published to Community Gallery!
                    </h4>
                    <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
                      Your photostrip is now live in the community showcase with verified 300 DPI tags.
                    </p>
                    <div className="pt-3 flex justify-center gap-3">
                      <Link 
                        to="/"
                        onClick={() => setIsPublishModalOpen(false)}
                        className="btn-studio-primary text-xs py-2.5 px-6 uppercase font-bold"
                      >
                        Explore Gallery
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setPublishSuccess(false);
                          setIsPublishModalOpen(false);
                        }}
                        className="btn-studio-secondary text-xs py-2.5 px-5 uppercase"
                      >
                        Close Lounge
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      
                      {/* Left Column: Live Feed Card Preview */}
                      <div className="md:col-span-5 flex flex-col items-center">
                        <div className="w-full text-center mb-2 font-mono text-[9.5px] text-[#F042FF] uppercase tracking-wider font-bold">
                          ✦ LIVE FEED CARD PREVIEW ✦
                        </div>
                        <div className="w-full max-w-[240px] bg-zinc-950 border border-zinc-800 hover:border-[#F042FF]/50 transition-all rounded-2xl p-3 shadow-xl flex flex-col gap-2 relative">
                          {/* Top Card Meta */}
                          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7226FF] to-[#F042FF] flex items-center justify-center text-[9px] font-bold">
                                {publishCreator.charAt(1)?.toUpperCase() || "S"}
                              </div>
                              <span className="font-mono text-[10px] text-white font-bold truncate max-w-[100px]">
                                {publishCreator || "@you"}
                              </span>
                            </div>
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-[#39FF14] font-bold">
                              300 DPI
                            </span>
                          </div>

                          {/* Photostrip Image in Card */}
                          <div className="max-h-60 overflow-hidden flex items-center justify-center rounded-lg bg-black/50">
                            {stripCanvasRef.current ? (
                              <img 
                                src={stripCanvasRef.current.toDataURL("image/png")} 
                                alt="Feed Preview"
                                className="max-h-56 w-auto object-contain rounded drop-shadow"
                              />
                            ) : (
                              <div className="p-6 text-center text-xs text-zinc-500">Strip Canvas Ready</div>
                            )}
                          </div>

                          {/* Caption & Tags in Card */}
                          <p className="font-sans text-[10.5px] text-zinc-200 line-clamp-2">
                            {publishCaption || "Studio Session ✨"}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {publishTags.map(tag => (
                              <span key={tag} className="text-[8.5px] font-mono text-[#F042FF] bg-[#F042FF]/10 px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Submission Form */}
                      <div className="md:col-span-7">
                        <form onSubmit={handlePublishToGallery} className="space-y-3.5">
                          <div>
                            <label className="block font-mono text-[10px] text-[#F042FF] uppercase font-bold mb-1">
                              Creator Handle / Studio Tag
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. @your_name"
                              value={publishCreator}
                              onChange={(e) => setPublishCreator(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-[#F042FF] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block font-mono text-[10px] text-[#F042FF] uppercase font-bold mb-1">
                              Caption / Aesthetic Note
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Vintage tones & Tokyo vibes ✨"
                              value={publishCaption}
                              onChange={(e) => setPublishCaption(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-[#F042FF] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                            />
                          </div>

                          {/* Aesthetic Tag Chips */}
                          <div>
                            <label className="block font-mono text-[9.5px] text-zinc-400 uppercase font-bold mb-1.5">
                              Aesthetic Categories &amp; Mood Tags
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                              {["#y2k", "#kpop", "#photobooth", "#vintage", "#nightout", "#studio", "#collab", "#pastel"].map(tag => {
                                const active = publishTags.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                      if (active) {
                                        setPublishTags(publishTags.filter(t => t !== tag));
                                      } else {
                                        setPublishTags([...publishTags, tag]);
                                      }
                                      playClickSound();
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                      active 
                                        ? "bg-[#F042FF] text-white shadow-[0_0_10px_rgba(240,66,255,0.4)]" 
                                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Showcase Promotion Toggle */}
                          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs text-white font-bold">Feature in Editorial Showcase</span>
                              <span className="font-mono text-[9px] text-zinc-400">Allow spotlight on the homepage community carousel</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPublishAllowEditorial(!publishAllowEditorial)}
                              className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                                publishAllowEditorial ? "bg-[#F042FF]" : "bg-zinc-800"
                              }`}
                            >
                              <span 
                                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                                  publishAllowEditorial ? "left-5" : "left-1"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                            <button
                              type="button"
                              disabled={isPublishing}
                              onClick={() => setIsPublishModalOpen(false)}
                              className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isPublishing}
                              className="btn-studio-primary text-xs py-2.5 px-5 cursor-pointer flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isPublishing ? "Publishing to Gallery..." : "✦ Confirm & Publish ✦"}</span>
                            </button>
                          </div>
                        </form>
                      </div>

                    </div>

                    {/* Bottom: Recent Community Feed Strip Ticker */}
                    {recentCommunityItems.length > 0 && (
                      <div className="pt-3 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between mb-2 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                          <span>✦ LIVE COMMUNITY FEED RECENT CREATIONS ✦</span>
                          <span className="text-[#F042FF]">COMMUNITY ARCHIVE</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {recentCommunityItems.map((item, idx) => (
                            <div key={item.id || idx} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-1.5 flex flex-col items-center">
                              <img 
                                src={normalizeMediaUrl(item.imageSrc || item.image || item.stripImage)} 
                                alt={item.caption || "Community creation"}
                                referrerPolicy="no-referrer"
                                className="max-h-20 w-auto object-contain rounded"
                              />
                              <span className="font-mono text-[8px] text-zinc-400 truncate w-full text-center mt-1">
                                {item.creator || `@creator${idx+1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      </div>
    </div>
  );
};

export default PhotoPreview;
