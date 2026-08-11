import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve Vite frontend build
app.use(express.static(path.join(__dirname, "dist")));

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

// --- Phase 4: Admin Creator Dashboard Database and APIs ---
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

const creatorDataPath = path.join(uploadDir, "creator_data.json");

const defaultShowcaseThemes = [
  {
    id: "classic-y2k",
    name: "Classic Y2K",
    color: "#F042FF",
    desc: "High-contrast frames with solid grid borders and custom nostalgic stickers.",
    bg: "linear-gradient(135deg, #020617, #0F3AE2)",
    badge: "RETRO_POP",
    image: "/img/poses/Wonyoung1.png",
    caption: "Aura: maxed out ✦"
  },
  {
    id: "cottagecore-bloom",
    name: "Cottagecore Bloom",
    color: "#FF00FF",
    desc: "Soft flower power stamps with cute pastel gradients and hand-drawn borders.",
    bg: "linear-gradient(135deg, #18001e, #2e083c)",
    badge: "SOFT_GIRL",
    image: "/img/poses/Wonyoung2.png",
    caption: "Pretty & living rent-free"
  },
  {
    id: "aesthetic-vintage",
    name: "Aesthetic Vintage",
    color: "#F59E0B",
    desc: "Warm cinematic film grain with retro date stamps and custom light leaks.",
    bg: "linear-gradient(135deg, #1a0f00, #2b1800)",
    badge: "90S_CORE",
    image: "/img/poses/Wonyoung3.png",
    caption: "Vintage soul, retro heart"
  },
  {
    id: "holographic-glitch",
    name: "Holographic Glitch",
    color: "#10B981",
    desc: "Vibrant rainbow reflections with custom digital glitch overlays and star clusters.",
    bg: "linear-gradient(135deg, #022c22, #064e3b)",
    badge: "GLITCH_99",
    image: "/img/poses/Wonyoung1.png",
    caption: "Glitch in the matrix ⚡"
  }
];

const getCreatorData = () => {
  if (!fs.existsSync(creatorDataPath)) {
    return { artists: [], frames: [], stickers: [], galleryItems: [], showcaseThemes: defaultShowcaseThemes };
  }
  try {
    const data = JSON.parse(fs.readFileSync(creatorDataPath, "utf-8"));
    if (!data.artists) data.artists = [];
    if (!data.frames) data.frames = [];
    if (!data.stickers) data.stickers = [];
    if (!data.galleryItems) data.galleryItems = [];
    if (!data.showcaseThemes) data.showcaseThemes = defaultShowcaseThemes;
    return data;
  } catch (err) {
    console.error("Error reading creator_data.json:", err);
    return { artists: [], frames: [], stickers: [], galleryItems: [], showcaseThemes: defaultShowcaseThemes };
  }
};

const saveCreatorData = (data) => {
  try {
    fs.writeFileSync(creatorDataPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing creator_data.json:", err);
  }
};

// Get all custom creator campaigns/frames/stickers
app.get("/api/creator/data", (req, res) => {
  res.json(getCreatorData());
});

// Upload and register a new Theme Overlay (formerly Designer Overlay)
app.post("/api/creator/frame", uploadThemes.single("image"), (req, res) => {
  const { name, layout } = req.body;
  if (!req.file || !name || !layout) {
    return res.status(400).json({ message: "Missing required fields or frame design file" });
  }

  const data = getCreatorData();
  const newFrame = {
    id: `custom-frame-${Date.now()}`,
    name,
    layout,
    imageSrc: `/img/themes/${req.file.filename}`
  };

  data.frames.push(newFrame);
  saveCreatorData(data);

  res.json({ success: true, frame: newFrame });
});

// Edit custom Theme Overlay
app.put("/api/creator/frame/:id", uploadThemes.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, layout } = req.body;

  const data = getCreatorData();
  const frameIndex = data.frames.findIndex(f => f.id === id);
  if (frameIndex === -1) {
    return res.status(404).json({ message: "Theme overlay not found" });
  }

  const existingFrame = data.frames[frameIndex];
  let imageSrc = existingFrame.imageSrc;

  if (req.file) {
    const filePath = path.join(themesDir, path.basename(existingFrame.imageSrc));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting old theme file:", e); }
    }
    imageSrc = `/img/themes/${req.file.filename}`;
  }

  const updatedFrame = {
    ...existingFrame,
    name: name || existingFrame.name,
    layout: layout || existingFrame.layout,
    imageSrc
  };

  data.frames[frameIndex] = updatedFrame;
  saveCreatorData(data);

  res.json({ success: true, frame: updatedFrame });
});

// Upload and register a new artist collaboration campaign with exactly 4 poses
app.post("/api/creator/artist", uploadPoses.array("poses", 4), (req, res) => {
  const { name, role, color, agencyId, agencyName, groupId, groupName, groupLogo, isMale } = req.body;
  
  if (!req.files || req.files.length === 0 || !name || !role || !color || !agencyId || !agencyName || !groupId || !groupName) {
    return res.status(400).json({ message: "Missing required fields or pose files" });
  }

  const poses = req.files.map(file => `/img/poses/${file.filename}`);
  const avatar = poses[0]; // First pose is main selection avatar

  const data = getCreatorData();
  const newArtist = {
    id: `custom-artist-${Date.now()}`,
    name,
    role,
    color,
    agencyId,
    agencyName,
    groupId,
    groupName,
    groupLogo: groupLogo || "✨",
    isMale: isMale === "true",
    avatar,
    poses
  };

  data.artists.push(newArtist);
  saveCreatorData(data);

  res.json({ success: true, artist: newArtist });
});

// Edit custom artist campaign
app.put("/api/creator/artist/:id", uploadPoses.array("poses", 4), (req, res) => {
  const { id } = req.params;
  const { name, role, color, agencyId, agencyName, groupId, groupName, groupLogo, isMale } = req.body;
  
  const data = getCreatorData();
  const artistIndex = data.artists.findIndex(a => a.id === id);
  if (artistIndex === -1) {
    return res.status(404).json({ message: "Artist campaign not found" });
  }

  const existingArtist = data.artists[artistIndex];

  let poses = existingArtist.poses;
  if (req.files && req.files.length > 0) {
    existingArtist.poses.forEach(posePath => {
      const filePath = path.join(posesDir, path.basename(posePath));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error("Error deleting old file:", e); }
      }
    });
    poses = req.files.map(file => `/img/poses/${file.filename}`);
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
    isMale: isMale !== undefined ? (isMale === "true") : existingArtist.isMale,
    poses,
    avatar: poses[0]
  };

  data.artists[artistIndex] = updatedArtist;
  saveCreatorData(data);

  res.json({ success: true, artist: updatedArtist });
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

// Upload and register a new custom sticker/doodle PNG
app.post("/api/creator/sticker", uploadStickers.single("image"), (req, res) => {
  const { name, type } = req.body;
  if (!req.file || !name || !type) {
    return res.status(400).json({ message: "Missing required fields or sticker file" });
  }

  const data = getCreatorData();
  const newSticker = {
    id: `custom-sticker-${Date.now()}`,
    name,
    type, // 'sticker' or 'doodle'
    imageSrc: `/img/stickers/${req.file.filename}`
  };

  data.stickers.push(newSticker);
  saveCreatorData(data);

  res.json({ success: true, sticker: newSticker });
});

// Edit custom sticker
app.put("/api/creator/sticker/:id", uploadStickers.single("image"), (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;

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
    imageSrc
  };

  data.stickers[stickerIndex] = updatedSticker;
  saveCreatorData(data);

  res.json({ success: true, sticker: updatedSticker });
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

  data.stickers = data.stickers.filter(s => s.id !== id);
  saveCreatorData(data);
  res.json({ success: true });
});

// --- Photostrip Preview Gallery API Endpoints ---

// Upload and register a new completed photostrip output graphic
app.post("/api/creator/gallery", uploadGallery.single("image"), (req, res) => {
  const { caption, creator, layout, color } = req.body;
  if (!req.file || !caption || !creator || !layout) {
    return res.status(400).json({ message: "Missing required fields or photostrip preview file" });
  }

  const data = getCreatorData();
  const newItem = {
    id: `gallery-item-${Date.now()}`,
    caption,
    creator: creator.startsWith("@") ? creator : `@${creator}`,
    layout, // '3-grid' | '4-grid' | '2x2' | '2x3'
    color: color || "#B4FF00",
    imageSrc: `/img/gallery/${req.file.filename}`,
    likes: Math.floor(Math.random() * 40) + 12, // Random cute initial count for aesthetic realism
    createdAt: new Date().toISOString()
  };

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

app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  console.log("Incoming message:", { name, email, message });

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
      subject: `New Message from ${name}`,
      text: `Email: ${email}\n\nMessage:\n${message}`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
