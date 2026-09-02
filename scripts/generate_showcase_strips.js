import sharp from "sharp";
import fs from "fs";
import path from "path";

const showcaseDir = path.resolve("./public/img/showcase");
if (!fs.existsSync(showcaseDir)) {
  fs.mkdirSync(showcaseDir, { recursive: true });
}

async function createAllStrips() {
  const width = 600;
  const height = 1600;
  const marginX = 36;
  const marginTop = 48;
  const photoW = width - (marginX * 2); // 528
  const photoH = 300;
  const gap = 20;

  const y1 = marginTop;
  const y2 = y1 + photoH + gap;
  const y3 = y2 + photoH + gap;
  const y4 = y3 + photoH + gap;
  const bottomSectionY = y4 + photoH + 16;

  // 1. Wonyoung Birthday Strip (Pink ribbon theme)
  const p1 = await sharp("./public/img/poses/Wonyoung1.png").resize(photoW, photoH, { fit: "cover", position: "top" }).png().toBuffer();
  const p2 = await sharp("./public/img/poses/Wonyoung2.png").resize(photoW, photoH, { fit: "cover", position: "top" }).png().toBuffer();
  const p3 = await sharp("./public/img/poses/Wonyoung3.png").resize(photoW, photoH, { fit: "cover", position: "top" }).png().toBuffer();
  const p4 = await sharp("./public/img/poses/Wonyoung4.png").resize(photoW, photoH, { fit: "cover", position: "top" }).png().toBuffer();

  const wonyoungOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#fbcfe8" stroke-width="2" />
      <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="12" fill="none" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4,4" />

      <rect x="${marginX - 4}" y="${y1 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#f472b6" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y2 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#f472b6" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y3 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#f472b6" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y4 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#f472b6" stroke-width="2" />

      <text x="${width / 2}" y="36" text-anchor="middle" font-family="serif" font-size="13" font-weight="bold" fill="#ec4899" letter-spacing="4">✦ WONYOUNG DAY ✦</text>

      <g transform="translate(0, ${bottomSectionY})">
        <path d="M ${width / 2 - 140} 25 Q ${width / 2} 18 ${width / 2 + 140} 25 Q ${width / 2} 32 ${width / 2 - 140} 25" fill="#fbcfe8" stroke="#f472b6" stroke-width="1.5" />
        <text x="${width / 2}" y="28" text-anchor="middle" font-family="cursive, serif" font-style="italic" font-size="16" font-weight="bold" fill="#db2777">Happy Birthday</text>
        <text x="${width / 2}" y="80" text-anchor="middle" font-family="serif" font-size="38" font-style="italic" font-weight="bold" fill="#be185d" letter-spacing="1">IVE Wonyoung</text>
        <text x="${width / 2}" y="112" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="600" fill="#ec4899" letter-spacing="3">♡ WONYOUNG BIRTHDAY EVENT ♡</text>
        <text x="${width / 2}" y="136" text-anchor="middle" font-family="serif" font-size="14" fill="#f472b6">✧ ✧ ✧  iy  ✧ ✧ ✧</text>
      </g>
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 240, b: 245, alpha: 1 } }
  })
  .composite([
    { input: p1, top: y1, left: marginX },
    { input: p2, top: y2, left: marginX },
    { input: p3, top: y3, left: marginX },
    { input: p4, top: y4, left: marginX },
    { input: wonyoungOverlay, top: 0, left: 0 }
  ])
  .png()
  .toFile(path.join(showcaseDir, "wonyoung-birthday-photostrip.png"));

  // 2. NewJeans Hanni Bunny Club Strip (Pastel Blue Y2K)
  const hanniOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#bae6fd" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y1 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#0284c7" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y2 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#0284c7" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y3 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#0284c7" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y4 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#0284c7" stroke-width="2" />

      <text x="${width / 2}" y="36" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="900" fill="#0284c7" letter-spacing="3">🐰 NEWJEANS ✦ BUNNY CLUB 🐰</text>

      <g transform="translate(0, ${bottomSectionY})">
        <text x="${width / 2}" y="60" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="900" fill="#0369a1" letter-spacing="1">NEWJEANS HANNI</text>
        <text x="${width / 2}" y="95" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#0284c7" letter-spacing="2">BUNNY CLUB POP-UP SPECIAL</text>
        <text x="${width / 2}" y="125" text-anchor="middle" font-family="monospace" font-size="11" fill="#0284c7">SNPSHOT X HYBE OFFICIAL COLLAB</text>
      </g>
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: { r: 240, g: 249, b: 255, alpha: 1 } }
  })
  .composite([
    { input: p2, top: y1, left: marginX },
    { input: p1, top: y2, left: marginX },
    { input: p4, top: y3, left: marginX },
    { input: p3, top: y4, left: marginX },
    { input: hanniOverlay, top: 0, left: 0 }
  ])
  .png()
  .toFile(path.join(showcaseDir, "hanni-bunny-photostrip.png"));

  // 3. aespa Karina Cyber Kwangya Postcard Strip (Cyber Violet)
  const karinaOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#7e22ce" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y1 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#a855f7" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y2 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#a855f7" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y3 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#a855f7" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y4 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#a855f7" stroke-width="2" />

      <text x="${width / 2}" y="36" text-anchor="middle" font-family="sans-serif" font-size="14" font-weight="900" fill="#c084fc" letter-spacing="4">🦋 SYNK KWANGYA DROP 🦋</text>

      <g transform="translate(0, ${bottomSectionY})">
        <text x="${width / 2}" y="60" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="900" fill="#f3e8ff" letter-spacing="2">AESPA KARINA</text>
        <text x="${width / 2}" y="95" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#c084fc" letter-spacing="3">DIGITAL POSTCARD EDITION</text>
        <text x="${width / 2}" y="125" text-anchor="middle" font-family="monospace" font-size="11" fill="#a855f7">SM ENTERTAINMENT X SNPSHOT</text>
      </g>
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: { r: 15, g: 10, b: 35, alpha: 1 } }
  })
  .composite([
    { input: p3, top: y1, left: marginX },
    { input: p4, top: y2, left: marginX },
    { input: p1, top: y3, left: marginX },
    { input: p2, top: y4, left: marginX },
    { input: karinaOverlay, top: 0, left: 0 }
  ])
  .png()
  .toFile(path.join(showcaseDir, "karina-cyber-photostrip.png"));

  // 4. BTS Jungkook Golden Strip (Deep Purple/Gold)
  const jungkookOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#eab308" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y1 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#eab308" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y2 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#eab308" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y3 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#eab308" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y4 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#eab308" stroke-width="2" />

      <text x="${width / 2}" y="36" text-anchor="middle" font-family="serif" font-size="14" font-weight="900" fill="#eab308" letter-spacing="4">💜 GOLDEN ERA SPECIAL 💜</text>

      <g transform="translate(0, ${bottomSectionY})">
        <text x="${width / 2}" y="60" text-anchor="middle" font-family="serif" font-size="34" font-weight="900" fill="#fef08a" letter-spacing="2">BTS JUNGKOOK</text>
        <text x="${width / 2}" y="95" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="700" fill="#eab308" letter-spacing="3">GOLDEN STUDIO EDITION</text>
        <text x="${width / 2}" y="125" text-anchor="middle" font-family="monospace" font-size="11" fill="#ca8a04">BIGHIT MUSIC X SNPSHOT</text>
      </g>
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: { r: 24, g: 12, b: 36, alpha: 1 } }
  })
  .composite([
    { input: p4, top: y1, left: marginX },
    { input: p3, top: y2, left: marginX },
    { input: p2, top: y3, left: marginX },
    { input: p1, top: y4, left: marginX },
    { input: jungkookOverlay, top: 0, left: 0 }
  ])
  .png()
  .toFile(path.join(showcaseDir, "jungkook-golden-photostrip.png"));

  // 5. Classic Studio Pop (Pure monochrome high contrast)
  const classicOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="${width - 24}" height="${height - 24}" rx="16" fill="none" stroke="#e2e8f0" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y1 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#cbd5e1" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y2 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#cbd5e1" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y3 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#cbd5e1" stroke-width="2" />
      <rect x="${marginX - 4}" y="${y4 - 4}" width="${photoW + 8}" height="${photoH + 8}" rx="8" fill="none" stroke="#cbd5e1" stroke-width="2" />

      <text x="${width / 2}" y="36" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="900" fill="#0f172a" letter-spacing="4">★ SNPSHOT CLASSIC POP ★</text>

      <g transform="translate(0, ${bottomSectionY})">
        <text x="${width / 2}" y="60" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="900" fill="#0f172a" letter-spacing="2">STUDIO 4-STRIP</text>
        <text x="${width / 2}" y="95" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#475569" letter-spacing="2">HIGH RESOLUTION 300 DPI</text>
        <text x="${width / 2}" y="125" text-anchor="middle" font-family="monospace" font-size="11" fill="#64748b">CLASSIC PHOTO BOOTH EDITION</text>
      </g>
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  })
  .composite([
    { input: p1, top: y1, left: marginX },
    { input: p2, top: y2, left: marginX },
    { input: p3, top: y3, left: marginX },
    { input: p4, top: y4, left: marginX },
    { input: classicOverlay, top: 0, left: 0 }
  ])
  .png()
  .toFile(path.join(showcaseDir, "classic-studio-photostrip.png"));

  console.log("All photostrips generated successfully!");
}

createAllStrips().catch(console.error);
