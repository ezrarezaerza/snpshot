import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { uploadBlob, isBlobConfigured } from '../server/blobStorage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runMigration() {
  console.log("=== STARTING ASSET MIGRATION TO VERCEL BLOB ===");
  if (!isBlobConfigured()) {
    console.error("Error: BLOB_READ_WRITE_TOKEN is not configured!");
    process.exit(1);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log("Storage token active. Running upload batch...");

  const urlMapping = {};

  // 1. Migrate poses
  const posesDir = path.join(rootDir, 'public', 'img', 'poses');
  if (fs.existsSync(posesDir)) {
    const poseFiles = fs.readdirSync(posesDir).filter(f => f.endsWith('.png'));
    for (const file of poseFiles) {
      console.log(`Uploading pose: ${file}...`);
      const buffer = fs.readFileSync(path.join(posesDir, file));
      const res = await uploadBlob({
        body: buffer,
        folder: 'poses',
        filename: file,
        contentType: 'image/png',
        addRandomSuffix: false
      });
      urlMapping[`/img/poses/${file}`] = res.url;
      console.log(`✓ Migrated /img/poses/${file} -> ${res.url}`);
    }
  }

  // 2. Migrate frames & themes
  const themesDir = path.join(rootDir, 'public', 'img', 'themes');
  if (fs.existsSync(themesDir)) {
    const themeFiles = fs.readdirSync(themesDir).filter(f => f.endsWith('.png'));
    for (const file of themeFiles) {
      console.log(`Uploading frame/theme: ${file}...`);
      const buffer = fs.readFileSync(path.join(themesDir, file));
      const safeName = file.replace(/\s+/g, '_');
      const res = await uploadBlob({
        body: buffer,
        folder: 'frames',
        filename: safeName,
        contentType: 'image/png',
        addRandomSuffix: false
      });
      urlMapping[`/img/themes/${file}`] = res.url;
      urlMapping[`/img/themes/${encodeURI(file)}`] = res.url;
      urlMapping['/img/themes/theme-1786530214397-960268073.png'] = res.url;
      console.log(`✓ Migrated /img/themes/${file} -> ${res.url}`);
    }
  }

  // 3. Migrate stickers
  const stickersDir = path.join(rootDir, 'public', 'img', 'stickers');
  if (fs.existsSync(stickersDir)) {
    const stickerFiles = fs.readdirSync(stickersDir).filter(f => f.endsWith('.svg'));
    for (const file of stickerFiles) {
      console.log(`Uploading sticker: ${file}...`);
      const buffer = fs.readFileSync(path.join(stickersDir, file));
      const res = await uploadBlob({
        body: buffer,
        folder: 'stickers',
        filename: file,
        contentType: 'image/svg+xml',
        addRandomSuffix: false
      });
      urlMapping[`/img/stickers/${file}`] = res.url;
      console.log(`✓ Migrated /img/stickers/${file} -> ${res.url}`);
    }
  }

  // 4. Migrate the user's uploaded photostrip preview from poses/ into showcase/
  const oldPhotostripRawUrl = 'https://4gjcgshhaspf84hn.private.blob.vercel-storage.com/poses/IVE-Wonyoung_Birthday-Photostrip-1-VaWfgtfm9BbQNODUaGD8wknGVujXr3.png';
  console.log(`Transferring user photostrip preview into showcase/ folder...`);
  try {
    const fetchRes = await fetch(oldPhotostripRawUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (fetchRes.ok) {
      const arrayBuf = await fetchRes.arrayBuffer();
      const showcaseRes = await uploadBlob({
        body: Buffer.from(arrayBuf),
        folder: 'showcase',
        filename: 'IVE-Wonyoung_Birthday-Photostrip-1.png',
        contentType: 'image/png',
        addRandomSuffix: false
      });
      console.log(`✓ Photostrip preview transferred to showcase: ${showcaseRes.url}`);
      urlMapping[oldPhotostripRawUrl] = showcaseRes.url;
      urlMapping['https://4gjcgshhaspf84hn.private.blob.vercel-storage.com/poses/IVE-Wonyoung_Birthday-Photostrip-1-VaWfgtfm9BbQNODUaGD8wknGVujXr3.png'] = showcaseRes.url;
    } else {
      console.warn(`Could not fetch old photostrip: ${fetchRes.status}`);
    }
  } catch (err) {
    console.warn(`Photostrip transfer warning:`, err.message);
  }

  // 5. Update database files (studio_data.json and creator_data.json)
  const dbFiles = [
    path.join(rootDir, 'uploads', 'studio_data.json'),
    path.join(rootDir, 'uploads', 'creator_data.json')
  ];

  for (const dbPath of dbFiles) {
    if (fs.existsSync(dbPath)) {
      console.log(`Updating database references in ${dbPath}...`);
      let content = fs.readFileSync(dbPath, 'utf-8');
      for (const [oldUrl, newUrl] of Object.entries(urlMapping)) {
        content = content.replaceAll(oldUrl, newUrl);
      }

      // Also ensure ive-wonyoung-collab structure is updated
      try {
        const json = JSON.parse(content);
        if (json.artists && json.artists.length > 0) {
          const wonyoung = json.artists.find(a => a.id === 'ive-wonyoung-collab');
          if (wonyoung) {
            if (urlMapping['/img/poses/Wonyoung1.png']) {
              wonyoung.avatar = urlMapping['/img/poses/Wonyoung1.png'];
              wonyoung.poses = [
                urlMapping['/img/poses/Wonyoung1.png'] || wonyoung.poses[0],
                urlMapping['/img/poses/Wonyoung2.png'] || wonyoung.poses[1],
                urlMapping['/img/poses/Wonyoung3.png'] || wonyoung.poses[2],
                urlMapping['/img/poses/Wonyoung4.png'] || wonyoung.poses[3]
              ];
            }
            if (urlMapping[oldPhotostripRawUrl]) {
              wonyoung.finalPreviewImage = urlMapping[oldPhotostripRawUrl];
            }
          }
        }
        content = JSON.stringify(json, null, 2);
      } catch (e) {
        console.warn(`JSON parse error during normalization:`, e.message);
      }

      fs.writeFileSync(dbPath, content, 'utf-8');
      console.log(`✓ Updated ${dbPath}`);
    }
  }

  console.log("=== ASSET MIGRATION COMPLETED SUCCESSFULLY ===");
}

runMigration().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
