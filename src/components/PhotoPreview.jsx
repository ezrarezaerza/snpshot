import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { Download, Printer, Mail, Layout, Sliders, Palette, Layers, RefreshCw, Undo, Trash2, Shield, Settings, Check, Activity, Share2, Globe, Sparkles, CheckCircle2, X } from "lucide-react";
import Navbar from "./Navbar";
import "../App.css";
import { playClickSound, playSuccessChime, playStickerPopSound } from "../utils/audio";

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
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = (err) => reject(err);
    });
  } catch (error) {
    console.warn("Frame image failed to load, rendering fallback for theme", theme, ":", imageSrc);
    drawFallback(theme, layout, photoCount, ctx, canvasWidth, canvasHeight);
  }
};

const frames = {
  none: {
    name: "No Frame",
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
      name,
      draw: (ctx, w, h) => drawThemedFrame(id, layout, count, ctx, w, h, imageSrc)
    };
  });
});

// Register custom Angry Frame for 3-Photo Grid
frames['grid-3-angry'] = {
  name: "Angry Frame",
  draw: (ctx, w, h) => drawThemedFrame('angry', '3-grid', 3, ctx, w, h, "/img/themes/3-Photo Grid-Angry Frame.png")
};

const getAvailableFrames = (layout, photoCount) => {
  const framePrefix = layout === 'grid' 
    ? `grid-${photoCount}`
    : layout;

  return Object.entries(frames)
    .filter(([key, value]) => key === 'none' || key.startsWith(framePrefix) || key.startsWith('admin-') || (value && value.layout === 'all'))
    .map(([key, value]) => ({
      id: key,
      name: value.name || 'No Frame',
      type: value.type,
      imageSrc: value.imageSrc,
      bgColor: value.bgColor
    }));
};

const DEFAULT_PREVIEW_FILTERS = [
  { id: "none", name: "Normal", filterStr: "none" },
  { id: "warm-grain", name: "Warm Grain", badge: "POPULAR", filterStr: "brightness(105%) contrast(110%) saturate(115%) sepia(25%)" },
  { id: "pastel-glow", name: "Pastel Glow", badge: "FEATURED", filterStr: "brightness(112%) contrast(95%) saturate(108%) sepia(10%) hue-rotate(-10deg) blur(0.3px)" },
  { id: "cinematic-film", name: "Cinematic Film", badge: "NEW", filterStr: "contrast(120%) saturate(90%) sepia(35%) hue-rotate(10deg)" },
  { id: "bw-high-contrast", name: "Monochrome Noir", badge: "CLASSIC", filterStr: "brightness(102%) contrast(135%) saturate(0%)" },
  { id: "cyberpunk-neon", name: "Cyberpunk Neon", badge: "SPECIAL", filterStr: "brightness(108%) contrast(125%) saturate(145%) hue-rotate(45deg)" }
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
  const initialStripColor = category === "artist" 
    ? (activeDedicatedFrame?.bgGradient || activeDedicatedFrame?.bgColor || "#0e0048")
    : "white";

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
              imageSrc: f.imageSrc,
              layout: frameLayout,
              draw: async (ctx, w, h) => {
                if (f.imageSrc) {
                  await drawThemedFrame(f.id, frameLayout, count, ctx, w, h, f.imageSrc);
                }
              }
            };

            if (frameLayout === '3-grid') {
              frames[`grid-3-${f.id}`] = frameObj;
            } else if (frameLayout === '4-grid') {
              frames[`grid-4-${f.id}`] = frameObj;
            } else if (frameLayout === '2x2') {
              frames[`2x2-${f.id}`] = frameObj;
            } else if (frameLayout === '2x3' || frameLayout === '3x2') {
              frames[`2x3-${f.id}`] = frameObj;
              frames[`3x2-${f.id}`] = frameObj;
            } else {
              // 'all' layout -> register under all format prefixes
              frames[`admin-${f.id}`] = frameObj;
              frames[`grid-3-${f.id}`] = frameObj;
              frames[`grid-4-${f.id}`] = frameObj;
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
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [slots, setSlots] = useState([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

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

  // Phase 3: Community Gallery Publishing State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishCreator, setPublishCreator] = useState("@snpshot_user");
  const [publishCaption, setPublishCaption] = useState("Studio Session ✨");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const availableFrames = getAvailableFrames(layout, photoCount);

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
        if (src && !src.startsWith("data:")) {
          img.crossOrigin = "anonymous";
        }
        img.src = src;
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
          img.src = stk.value;
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
    const timestamp = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }) + '  ' + 
    now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

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
      ctx.fillText(`SNPSHOT STUDIO • ${timestamp}`, canvasWidth / 2, canvasHeight - (config.padding * 0.28) * scale);
      ctx.restore();
    } else {
      const isDark = targetColor && (targetColor === "black" || targetColor.startsWith("#0") || targetColor.startsWith("#1") || targetColor.includes("gradient") || targetColor.includes("#2e109d"));
      ctx.fillStyle = isDark ? "#FFFFFF" : "#000000";
      ctx.font = `${16 * scale}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText("SNPSHOT  " + timestamp, canvasWidth / 2, canvasHeight - (config.padding / 2) * scale);

      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)";
      ctx.font = `${12 * scale}px Arial`;
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
  }, [capturedImages, stripColor, selectedFrame, slots, photoCount, layout, category, artist, stickers, selectedStickerId, doodles, currentDoodle, redrawCounter]);

  useEffect(() => {
    if (slots.length > 0) {
      generatePhotoStrip();
    }
  }, [slots, stripColor, selectedFrame, generatePhotoStrip]);

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
    link.download = "photostrip_cyanpop.png";
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

  return (
    <div className="web3-home-container min-h-screen relative w-full overflow-hidden crt-overlay" style={{ paddingBottom: "80px", overflowY: "auto" }}>
      <div className="web3-grid-overlay" />

      {/* Playful Web3 Navigation Bar */}
      <Navbar />

      <div id="content" className="content max-w-6xl mx-auto px-4 pt-20 relative z-10">
        
        <div className="text-center mb-8">
          <div className="y2k-subtitle mb-2">✦ DECORATE STATION ✦</div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase tracking-tight">
            DESIGN
            <div className="y2k-highlight ml-2">YOUR STRIP</div>
          </h1>
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

        {/* Dynamic Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CANVAS DRAWING HUD */}
          <div className="lg:col-span-5 flex flex-col items-center gap-4">
            <div className="web3-glass-card p-4 w-full relative bg-zinc-950/90 border-zinc-800">
              
              <div className="flex justify-between items-center mb-3.5 pb-1 border-b border-zinc-900 font-mono text-[10px] text-zinc-500 tracking-wider">
                <span>DECORATION STAGE</span>
                <span>STATUS: READY</span>
              </div>

              {/* Real canvas viewport */}
              <div className="relative w-full overflow-hidden flex justify-center bg-black">
                {/* Tech HUD overlays */}
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
                  className="max-w-full h-auto cursor-crosshair border border-zinc-900 photobooth-print-image"
                  style={{ maxHeight: "70vh" }}
                />
              </div>

              {/* Coordinates tracker */}
              <div className="flex justify-between font-mono text-[9px] text-zinc-600 mt-3">
                <span>CREATIVE LOBBY</span>
                <span>FORMAT: HIGH-RES PNG</span>
              </div>
            </div>

            {/* Direct Shutter CTA Actions */}
            <div className="flex flex-col gap-2.5 w-full">
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={downloadPhotoStrip}
                  className="y2k-button w-full"
                  style={{ padding: "12px", fontSize: "0.85rem" }}
                >
                  <Download className="w-4 h-4 shrink-0" /> DOWNLOAD STRIP
                </button>
                
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="secondary-btn w-full"
                  style={{ padding: "12px", fontSize: "0.85rem" }}
                >
                  <Printer className="w-4 h-4 shrink-0" /> PRINT STRIP
                </button>
              </div>

              {/* Community Gallery Publishing CTA */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsPublishModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(114,38,255,0.3)] border border-[#F042FF]/40 hover:border-[#F042FF] hover:scale-[1.01]"
                style={{
                  background: "linear-gradient(135deg, rgba(114,38,255,0.8) 0%, rgba(240,66,255,0.8) 100%)"
                }}
              >
                <Globe className="w-4 h-4 text-[#FFE5F1]" />
                <span>✦ Share to Community Gallery ✦</span>
              </button>
            </div>
          </div>

          {/* RIGHT: DECOR & CONTROL DECK */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. SLOT BUFFER MATRIX (IMAGE POOL SWAPPER) */}
            <div className="web3-glass-card p-5">
              <div className="flex items-center gap-1.5 pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                <Layout className="w-3.5 h-3.5" /> STRIP FRAMES
              </div>

              <div className="flex flex-col gap-4">
                
                {/* Horizontal row of slots */}
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {slots.map((slot, index) => {
                    const isActive = activeSlotIndex === index;
                    const imgPool = (capturedImages && capturedImages.length > 0) ? capturedImages : [
                      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
                    ];
                    const currentImg = imgPool[slot.imageIndex];

                    return (
                      <button
                        key={index}
                        onClick={() => { setActiveSlotIndex(index); playClickSound(); }}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-200 min-w-[76px] shrink-0 ${
                          isActive 
                            ? "border-[#F042FF] bg-[#F042FF]/10 shadow-[0_4px_12px_rgba(240,66,255,0.15)]" 
                            : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700"
                        }`}
                        style={{ margin: 0 }}
                      >
                        <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest">SL_0{index + 1}</span>
                        {currentImg && (
                          <img 
                            src={currentImg} 
                            alt={`Slot ${index + 1}`} 
                            className="w-11 h-11 object-cover"
                            style={{
                              borderRadius: "0px", // Strict sharp film edge
                              filter: slot.filter || "none"
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Slot Parameter Adjuster */}
                {slots[activeSlotIndex] && (
                  <div className="p-4 rounded-xl border border-dashed border-[#F042FF]/40 bg-[#F042FF]/5 flex flex-col gap-4">
                    <div className="font-mono text-[10.5px] text-[#F042FF] uppercase tracking-wider flex items-center gap-1">
                      ✏️ ADJUST FRAME #{activeSlotIndex + 1}
                    </div>

                    {/* Image Selector from captures */}
                    <div>
                      <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-2 tracking-wider">
                        SWAP WITH ANOTHER SHOT
                      </span>
                      <div className="grid grid-cols-6 gap-2">
                        {((capturedImages && capturedImages.length > 0) ? capturedImages : [
                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80",
                          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&q=80",
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80",
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80",
                          "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&q=80",
                          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
                        ]).map((imgSrc, imgIndex) => {
                          const isSelected = slots[activeSlotIndex].imageIndex === imgIndex;
                          return (
                            <button
                              key={imgIndex}
                              onClick={() => {
                                const updatedSlots = [...slots];
                                updatedSlots[activeSlotIndex].imageIndex = imgIndex;
                                setSlots(updatedSlots);
                                playClickSound();
                              }}
                              className="relative aspect-square p-0 overflow-hidden"
                              style={{
                                border: isSelected ? "2.5px solid #F042FF" : "1.5px solid rgba(255,255,255,0.08)",
                                borderRadius: "0px", // Sharp film borders
                                background: "none",
                                margin: 0
                              }}
                            >
                              <img 
                                src={imgSrc} 
                                alt={`Frame ${imgIndex}`} 
                                className="absolute inset-0 w-full h-full object-cover photobooth-print-image"
                              />
                              <div className="absolute bottom-1 left-1 bg-black/60 text-white font-mono text-[8px] px-1.5 py-0.2 rounded font-bold">
                                #{imgIndex + 1}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Filter Presets selector */}
                    <div>
                      <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1.5 tracking-wider">
                        APPLY FILTER PRESET
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {filterPresets.map(preset => {
                          const targetStr = preset.filterStr || preset.id;
                          const isFilterSelected = slots[activeSlotIndex].filter === targetStr || (preset.id === "none" && slots[activeSlotIndex].filter === "none");
                          return (
                            <button
                              key={preset.id}
                              onClick={() => {
                                const updatedSlots = [...slots];
                                updatedSlots[activeSlotIndex].filter = targetStr;
                                setSlots(updatedSlots);
                                playClickSound();
                              }}
                              className="camera-ctrl"
                              style={{
                                margin: 0,
                                fontSize: "0.75rem",
                                padding: "5px 12px",
                                border: "1px solid",
                                borderColor: isFilterSelected ? "#F042FF" : "rgba(255,255,255,0.06)",
                                background: isFilterSelected ? "rgba(240, 66, 255, 0.15)" : "rgba(10,10,10,0.5)",
                                color: isFilterSelected ? "#F042FF" : "#A1A1AA",
                                borderRadius: "999px"
                              }}
                            >
                              {preset.badge && (
                                <span className="mr-1 text-[8px] px-1 py-0.2 rounded bg-[#F042FF]/20 text-[#FFE5F1] font-mono">
                                  {preset.badge}
                                </span>
                              )}
                              {preset.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {category === "artist" ? (
              <>
                {/* EXCLUSIVE COLLAB: ARTIST FRAME BOUND PANEL */}
                <div className="web3-glass-card p-5 border-purple-500/40 bg-purple-950/20">
                  <div className="flex items-center justify-between pb-2 mb-3.5 border-b border-purple-500/30 font-mono text-xs text-purple-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">🔒</span>
                      <span className="font-bold">OFFICIAL EVENT FRAME BOUND</span>
                    </div>
                    <span className="text-[9px] bg-[#F042FF]/20 text-[#FFE5F1] px-2 py-0.5 rounded border border-[#F042FF]/40 font-bold uppercase">
                      {layout === '3x2' ? '2x3' : (layout === '2x2' ? '2x2' : `${photoCount}-GRID`)} EXCLUSIVE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-950/70 rounded-xl border border-purple-500/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-400 uppercase">DEDICATED FRAME:</span>
                        <span className="font-display font-black text-xs text-white uppercase">
                          {activeDedicatedFrame?.name || `${artist?.name || 'Artist'} Birthday Edition`}
                        </span>
                      </div>
                      
                      {activeDedicatedFrame?.watermarkText && (
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-zinc-400 uppercase">EVENT STAMP:</span>
                          <span className="font-mono text-[10px] text-[#F042FF] font-bold truncate max-w-[200px]">
                            {activeDedicatedFrame.watermarkText}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                        <span className="font-mono text-[10px] text-zinc-400 uppercase">THEME ACCENT:</span>
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                            style={{ background: activeDedicatedFrame?.bgGradient || activeDedicatedFrame?.bgColor || artist?.color || "#F042FF" }}
                          />
                          <span className="font-mono text-[10px] text-zinc-300">
                            {activeDedicatedFrame?.borderColor || artist?.color || "#F042FF"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 font-mono text-[10px] text-purple-200 leading-relaxed">
                      ℹ️ <strong>Theme Locked:</strong> Frame selection and background palette are locked for this official collaboration. The dedicated artist event frame has been automatically applied.
                    </div>
                  </div>
                </div>

                {/* EXCLUSIVE COLLAB: STICKERS DISABLED PANEL */}
                <div className="web3-glass-card p-5 border-zinc-800/80 bg-zinc-950/40">
                  <div className="flex items-center gap-1.5 pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-zinc-400">
                    <Palette className="w-3.5 h-3.5 text-purple-400" /> DECORATION STATION
                  </div>
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-300">
                      <span>🔒</span>
                      <span>STICKERS & DOODLES DISABLED</span>
                    </div>
                    <p className="font-sans text-[11px] text-zinc-400 leading-relaxed">
                      Stickers, emojis, and neon doodles are locked for this official artist photoshoot to preserve authentic copyright branding, signature portrait composition, and clean print aesthetics.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 2. DECOR DECK PANEL */}
                <div className="web3-glass-card p-5">
                  <div className="flex items-center gap-1.5 pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                    <Palette className="w-3.5 h-3.5" /> DECORATION STATION
                  </div>

                  <div className="flex flex-col gap-4">
                    
                    {/* Tool Tab selectors */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setActiveTool("select"); playClickSound(); }}
                        className="count-button"
                        style={{
                          flex: 1,
                          margin: 0,
                          background: activeTool === "select" ? "rgba(240, 66, 255, 0.1)" : "rgba(10,10,10,0.5)",
                          color: activeTool === "select" ? "#F042FF" : "#A1A1AA",
                          border: activeTool === "select" ? "1.5px solid #F042FF" : "1.5px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          fontSize: "0.8rem"
                        }}
                      >
                        ✨ STICKERS
                      </button>
                      
                      <button
                        onClick={() => { setActiveTool("draw"); playClickSound(); }}
                        className="count-button"
                        style={{
                          flex: 1,
                          margin: 0,
                          background: activeTool === "draw" ? "rgba(240, 66, 255, 0.1)" : "rgba(10,10,10,0.5)",
                          color: activeTool === "draw" ? "#F042FF" : "#A1A1AA",
                          border: activeTool === "draw" ? "1.5px solid #F042FF" : "1.5px solid rgba(255,255,255,0.08)",
                          borderRadius: "12px",
                          fontSize: "0.8rem"
                        }}
                      >
                        🎨 NEON DOODLES
                      </button>
                    </div>

                    {/* Paint Sub-panel */}
                    {activeTool === "draw" && (
                      <div className="p-4 rounded-xl border border-dashed border-[#F042FF]/40 bg-[#F042FF]/5 flex flex-col gap-3">
                        <div className="font-mono text-[10px] text-[#F042FF] uppercase tracking-widest mb-1">
                          🖌️ BRUSH SETTINGS
                        </div>

                        {/* Paint swatches */}
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { hex: "#F042FF", name: "Neon Magenta Glow" },
                            { hex: "#FFE5F1", name: "Soft Pink Glow" },
                            { hex: "#7226FF", name: "Electric Violet" },
                            { hex: "#ffaa00", name: "Gold Glow" },
                            { hex: "#bd00ff", name: "Purple Glow" },
                            { hex: "#ffffff", name: "White Light" }
                          ].map(col => (
                            <button
                              key={col.hex}
                              onClick={() => { setBrushColor(col.hex); playClickSound(); }}
                              className="w-8 h-8 rounded-full border-2 transition-all duration-150"
                              style={{
                                background: col.hex,
                                borderColor: brushColor === col.hex ? "#000000" : "transparent",
                                boxShadow: brushColor === col.hex ? `0 0 10px ${col.hex}` : "none",
                                cursor: "pointer",
                                margin: 0,
                                padding: 0
                              }}
                              title={col.name}
                            />
                          ))}
                        </div>

                        {/* Brush Slider */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between font-mono text-[10px] text-zinc-400">
                            <span>BRUSH SIZE: {brushWidth}PX</span>
                            <span>DRAG ON THE PHOTO STRIP TO DRAW</span>
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
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => { setDoodles(prev => prev.slice(0, -1)); playClickSound(); }}
                            className="secondary-btn flex items-center justify-center gap-1.5 text-xs font-mono font-bold"
                            style={{ padding: "8px" }}
                            disabled={doodles.length === 0}
                          >
                            <Undo className="w-3.5 h-3.5" /> UNDO STROKE
                          </button>
                          
                          <button
                            onClick={() => { setDoodles([]); playClickSound(); }}
                            className="secondary-btn flex items-center justify-center gap-1.5 text-xs font-mono font-bold"
                            style={{ 
                              padding: "8px", 
                              borderColor: "rgba(255, 0, 60, 0.3)", 
                              color: "#FF003C",
                              background: "rgba(255, 0, 60, 0.05)"
                            }}
                            disabled={doodles.length === 0}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sticker selector sub-panel */}
                    {activeTool === "select" && (
                      <div className="flex flex-col gap-3">
                        {/* Category filter tabs */}
                        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/80">
                          {[
                            { id: "all", label: "ALL" },
                            { id: "stamp", label: "STAMPS" },
                            { id: "sticker", label: "STICKERS" },
                            { id: "doodle", label: "DOODLES" },
                            { id: "watermark", label: "WATERMARKS" },
                            { id: "emoji", label: "EMOJIS" },
                            { id: "text", label: "TYPOGRAPHY" }
                          ].map(tab => (
                            <button
                              key={tab.id}
                              onClick={() => setStickerCategoryTab(tab.id)}
                              className={`px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider rounded-md transition-all whitespace-nowrap ${
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
                            <span className="font-mono text-[9px] text-[#F042FF] font-bold uppercase block mb-1.5 tracking-wider">
                              ✦ DIGITAL STAMPS &amp; STICKERS ({customStickers.filter(s => stickerCategoryTab === "all" || s.type === stickerCategoryTab).length})
                            </span>
                            <div className="grid grid-cols-6 gap-2 p-2 bg-[#F042FF]/5 border border-[#F042FF]/20 rounded-xl max-h-48 overflow-y-auto">
                              {customStickers
                                .filter(s => stickerCategoryTab === "all" || s.type === stickerCategoryTab)
                                .map(stk => (
                                  <button
                                    key={stk.id}
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
                                    className="p-1.5 bg-zinc-950/70 border border-zinc-800 rounded-lg hover:border-[#F042FF] hover:scale-105 transition-all flex flex-col items-center justify-center h-14 cursor-pointer relative group"
                                    style={{ margin: 0 }}
                                  >
                                    <img
                                      src={stk.imageSrc}
                                      alt={stk.name}
                                      referrerPolicy="no-referrer"
                                      className="max-w-full max-h-8 object-contain"
                                    />
                                    <span className="text-[7px] font-mono text-zinc-400 truncate w-full text-center mt-1 group-hover:text-[#F042FF]">
                                      {stk.name}
                                    </span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Kawaii stickers selection */}
                        {(stickerCategoryTab === "all" || stickerCategoryTab === "emoji") && (
                          <div>
                            <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1.5 tracking-wider">
                              EMOJI STAMP POOL
                            </span>
                            <div className="grid grid-cols-8 gap-1.5 p-2 bg-zinc-950/70 border border-zinc-900 rounded-xl">
                              {["💖", "🎀", "🍒", "🦋", "👾", "🦄", "🍭", "👽", "🌸", "⚡", "🌟", "🌈", "🧁", "🧸", "🕶️", "💿"].map(emoji => (
                                <button
                                  key={emoji}
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
                                  className="text-2xl p-1 bg-none hover:scale-125 transition-transform text-center cursor-pointer"
                                  style={{ margin: 0, padding: 0 }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Kawaii/Y2K Typography words */}
                        {(stickerCategoryTab === "all" || stickerCategoryTab === "text") && (
                          <>
                            <div>
                              <span className="font-mono text-[9px] text-zinc-500 font-bold uppercase block mb-1.5 tracking-wider">
                                TYPOGRAPHY WORD DECOR
                              </span>
                              <div className="flex gap-1.5 flex-wrap">
                                {["Y2K", "BABY", "COOL", "ANGEL", "LOVE", "QUEEN", "SPARK", "CHILL", "DAEBAK", "IDOL"].map(textWord => (
                                  <button
                                    key={textWord}
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
                                    className="camera-ctrl"
                                    style={{
                                      margin: 0,
                                      fontSize: "0.75rem",
                                      fontWeight: "bold",
                                      padding: "5px 12px",
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
                                placeholder="TYPE STICKER TEXT..."
                                maxLength={12}
                                style={{ flex: 1, padding: "8px 12px", fontSize: "0.8rem", textTransform: "uppercase" }}
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
                                className="y2k-button font-mono text-xs font-bold"
                                style={{ margin: 0, padding: "10px 16px" }}
                              >
                                ADD
                              </button>
                            </div>
                          </>
                        )}

                        {/* Sticker Manipulator Box */}
                        {selectedStickerId && stickers.find(s => s.id === selectedStickerId) && (
                          <div className="p-4 rounded-xl border border-dashed border-[#F042FF]/40 bg-[#F042FF]/5 flex flex-col gap-3">
                            {(() => {
                              const activeStg = stickers.find(s => s.id === selectedStickerId);
                              if (!activeStg) return null;
                              return (
                                <div className="flex flex-col gap-3">
                                  <div className="flex justify-between items-center pb-1 border-b border-zinc-900">
                                    <span className="font-mono text-[9.5px] text-[#F042FF] font-bold uppercase tracking-widest">🛠️ ADJUST STICKER</span>
                                    <button
                                      onClick={() => {
                                        setStickers(prev => prev.filter(s => s.id !== selectedStickerId));
                                        setSelectedStickerId(null);
                                      }}
                                      className="text-red-500 font-mono text-[10px] font-bold tracking-wider hover:underline"
                                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                    >
                                      DELETE STICKER [X]
                                    </button>
                                  </div>

                                  {/* Scale slider */}
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between font-mono text-[9px] text-zinc-400">
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

                                  {/* Rotation slider */}
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between font-mono text-[9px] text-zinc-400">
                                      <span>ROTATION: {activeStg.rotation}°</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="-180"
                                      max="180"
                                      step="5"
                                      value={activeStg.rotation}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, rotation: val } : s));
                                      }}
                                      className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#F042FF]"
                                    />
                                  </div>

                                  {/* Color Picker for typography text stickers */}
                                  {activeStg.type === "text" && (
                                    <div className="flex flex-col gap-2">
                                      <span className="font-mono text-[9px] text-zinc-400">TEXT GLOW COLOR</span>
                                      <div className="flex gap-1.5">
                                        {["#F042FF", "#FFE5F1", "#7226FF", "#39FF14", "#FFFF00", "#ffffff"].map(c => (
                                          <button
                                            key={c}
                                            onClick={() => {
                                              setStickers(prev => prev.map(s => s.id === selectedStickerId ? { ...s, color: c } : s));
                                            }}
                                            className="w-5 h-5 rounded-full border transition-all"
                                            style={{
                                              background: c,
                                              borderColor: activeStg.color === c ? "#000" : "transparent",
                                              cursor: "pointer",
                                              margin: 0,
                                              padding: 0
                                            }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-2 mt-1">
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
                                      className="secondary-btn text-[10px] font-mono"
                                      style={{ padding: "6px" }}
                                    >
                                      🔝 BRING TO FRONT
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
                                      className="secondary-btn text-[10px] font-mono"
                                      style={{ padding: "6px" }}
                                    >
                                      🧲 SEND TO BACK
                                    </button>
                                  </div>

                                  <span className="font-mono text-[8.5px] text-center text-zinc-500 block">
                                    ℹ️ DRAG DIRECTLY ON THE CANVAS PREVIEW TO ADJUST POSITION
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Clear all stickers */}
                        {stickers.length > 0 && (
                          <button
                            onClick={() => {
                              setStickers([]);
                              setSelectedStickerId(null);
                            }}
                            className="secondary-btn flex items-center justify-center gap-1.5 text-xs font-mono font-bold"
                            style={{ 
                              padding: "8px", 
                              borderColor: "rgba(255, 0, 60, 0.3)", 
                              color: "#FF003C",
                              background: "rgba(255, 0, 60, 0.05)"
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> CLEAR ALL STICKERS ({stickers.length})
                          </button>
                        )}

                      </div>
                    )}

                  </div>
                </div>

                {/* 3. FRAME COLOR PALETTE */}
                <div className="web3-glass-card p-5">
                  <div className="flex items-center gap-1.5 pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                    <Palette className="w-3.5 h-3.5" /> FRAME BACKGROUND COLOR
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: "white", val: "white", label: "White" },
                      { id: "black", val: "black", label: "Black" },
                      { id: "pink", val: "#f6d5da", label: "Pink" },
                      { id: "green", val: "#dde6d5", label: "Green" },
                      { id: "blue", val: "#adc3e5", label: "Blue" },
                      { id: "yellow", val: "#FFF2CC", label: "Yellow" },
                      { id: "purple", val: "#dbcfff", label: "Purple" },
                      ...customBgColors.filter(c => c.layout === 'all' || c.layout === (layout === 'grid' ? `${photoCount}-grid` : layout))
                    ].map((col) => {
                      const isSelected = stripColor === col.val;
                      return (
                        <button 
                          key={col.id || col.val}
                          onClick={() => setStripColor(col.val)} 
                          className="camera-ctrl"
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            padding: "6px 14px",
                            border: "1px solid",
                            borderColor: isSelected ? "#F042FF" : "rgba(255,255,255,0.06)",
                            background: isSelected ? "rgba(240, 66, 255, 0.15)" : "rgba(10,10,10,0.5)",
                            color: isSelected ? "#F042FF" : "#A1A1AA",
                            borderRadius: "999px"
                          }}
                        >
                          {col.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. OVERLAY THEMES */}
                <div className="web3-glass-card p-5">
                  <div className="flex items-center gap-1.5 pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                    <Layers className="w-3.5 h-3.5" /> DESIGNER OVERLAY THEMES
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableFrames.map(frame => {
                      const isSelected = selectedFrame === frame.id;
                      return (
                        <button
                          key={frame.id}
                          onClick={() => setSelectedFrame(frame.id)}
                          className="camera-ctrl"
                          style={{
                            margin: 0,
                            fontSize: "0.75rem",
                            padding: "6px 14px",
                            border: "1px solid",
                            borderColor: isSelected ? "#F042FF" : "rgba(255,255,255,0.06)",
                            background: isSelected ? "rgba(240, 66, 255, 0.15)" : "rgba(10,10,10,0.5)",
                            color: isSelected ? "#F042FF" : "#A1A1AA",
                            borderRadius: "999px"
                          }}
                        >
                          {frame.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 5. EMAIL SHARING */}
            <div className="web3-glass-card p-5">
              <div className="flex items-center gap-1.5 pb-2 mb-3.5 border-b border-zinc-800 font-mono text-xs text-[#F042FF]">
                <Mail className="w-3.5 h-3.5" /> SHARE BY EMAIL
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="ENTER EMAIL ADDRESS..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", fontSize: "0.85rem", padding: "10px 14px" }}
                />
                
                <button 
                  onClick={sendPhotoStripToEmail}
                  className="y2k-button w-full"
                  style={{ padding: "12px", fontSize: "0.85rem" }}
                >
                  ✧ SEND TO EMAIL ✧
                </button>
                
                {status && (
                  <p 
                    className="font-mono text-xs tracking-wider uppercase mt-1 text-center"
                    style={{
                      color: status.includes("SUCCESS") ? "#39FF14" : status.includes("Error") || status.includes("failed") || status.includes("ERR") ? "#FF003C" : "#FFFF00"
                    }}
                  >
                    {status}
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Phase 3: Community Gallery Submission Modal */}
        {isPublishModalOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => !isPublishing && setIsPublishModalOpen(false)}
          >
            <div 
              className="bg-zinc-950 border border-[#F042FF]/40 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(240,66,255,0.25)] relative text-white space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F042FF]/20 border border-[#F042FF] flex items-center justify-center text-[#F042FF]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">
                      Community Gallery
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-400">Share your creation with all SNPSHOT users</p>
                  </div>
                </div>
                {!isPublishing && (
                  <button 
                    onClick={() => setIsPublishModalOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {publishSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-[#39FF14] mx-auto animate-bounce" />
                  <h4 className="font-display font-black text-lg text-white uppercase">Published to Gallery!</h4>
                  <p className="font-mono text-xs text-zinc-400">Your photostrip is now live in the Community Gallery.</p>
                </div>
              ) : (
                <form onSubmit={handlePublishToGallery} className="space-y-3.5">
                  <div>
                    <label className="block font-mono text-[10px] text-[#F042FF] uppercase font-bold mb-1">
                      Creator Handle / Tag
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. @your_name"
                      value={publishCreator}
                      onChange={(e) => setPublishCreator(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-[#F042FF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
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
                      className="w-full bg-zinc-900 border border-zinc-700 focus:border-[#F042FF] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>FORMAT: <strong className="text-white uppercase">{layout === '3x2' ? '2x3' : (layout === '2x2' ? '2x2' : `${photoCount}-GRID`)}</strong></span>
                    <span>RESOLUTION: <strong className="text-[#39FF14]">300 DPI HI-RES</strong></span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={() => setIsPublishModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="y2k-button text-xs font-mono font-bold px-5 py-2.5"
                    >
                      {isPublishing ? "Publishing..." : "✦ Confirm & Publish ✦"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PhotoPreview;
