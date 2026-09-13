import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { initDb, query, setConfig } from '../server/db.js';
import { deepResolveBlobUrls } from '../server/blobStorage.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function migrateDataToPostgres() {
  console.log("=== STARTING DATA MIGRATION TO POSTGRES ===");
  
  await initDb();

  const studioDataPath = path.join(rootDir, 'uploads', 'studio_data.json');
  const creatorDataPath = path.join(rootDir, 'uploads', 'creator_data.json');
  const activePath = fs.existsSync(studioDataPath) ? studioDataPath : creatorDataPath;

  if (!fs.existsSync(activePath)) {
    console.error(`Error: Source data file not found at ${activePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(activePath, 'utf-8');
  let data = JSON.parse(raw);
  data = deepResolveBlobUrls(data);

  console.log(`Loaded JSON from ${activePath}`);

  // 1. Migrate Inquiries
  if (Array.isArray(data.inquiries) && data.inquiries.length > 0) {
    console.log(`Migrating ${data.inquiries.length} inquiries to inquiries table...`);
    for (const inq of data.inquiries) {
      await query(
        `INSERT INTO inquiries (id, name, email, phone, service, event_date, guest_count, location, message, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, NOW()), NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           service = EXCLUDED.service,
           event_date = EXCLUDED.event_date,
           guest_count = EXCLUDED.guest_count,
           location = EXCLUDED.location,
           message = EXCLUDED.message,
           status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           updated_at = NOW()`,
        [
          inq.id || `inq-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          inq.name || '',
          inq.email || '',
          inq.phone || '',
          inq.service || '',
          inq.eventDate || inq.event_date || '',
          inq.guestCount || inq.guest_count || '',
          inq.location || '',
          inq.message || '',
          inq.status || 'New',
          JSON.stringify(inq.notes || []),
          inq.createdAt ? new Date(inq.createdAt) : null
        ]
      );
    }
    console.log(`✓ Inquiries migration completed.`);
  }

  // 2. Migrate Gallery Items
  const gallery = data.galleryItems || data.gallery || [];
  if (Array.isArray(gallery) && gallery.length > 0) {
    console.log(`Migrating ${gallery.length} gallery items to gallery_items table...`);
    for (const item of gallery) {
      await query(
        `INSERT INTO gallery_items (id, caption, creator, layout, image_url, origin, badge, status, likes, is_featured, is_promoted_to_showcase, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, COALESCE($12, NOW()), NOW())
         ON CONFLICT (id) DO UPDATE SET
           caption = EXCLUDED.caption,
           creator = EXCLUDED.creator,
           layout = EXCLUDED.layout,
           image_url = EXCLUDED.image_url,
           origin = EXCLUDED.origin,
           badge = EXCLUDED.badge,
           status = EXCLUDED.status,
           likes = EXCLUDED.likes,
           is_featured = EXCLUDED.is_featured,
           is_promoted_to_showcase = EXCLUDED.is_promoted_to_showcase,
           updated_at = NOW()`,
        [
          item.id || `strip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          item.caption || '',
          item.creator || 'Anonymous',
          item.layout || '4-grid',
          item.imageUrl || item.image || '',
          item.origin || 'editorial',
          item.badge || 'Official Sample',
          item.status || 'published',
          item.likes || 0,
          Boolean(item.isFeatured ?? item.is_featured),
          Boolean(item.isPromotedToShowcase ?? item.is_promoted_to_showcase),
          item.createdAt ? new Date(item.createdAt) : null
        ]
      );
    }
    console.log(`✓ Gallery items migration completed.`);
  }

  // 3. Migrate Studio OS Modules into studio_config
  const modules = [
    { key: 'artists', data: data.artists || [] },
    { key: 'frames', data: data.frames || [] },
    { key: 'stickers', data: data.stickers || [] },
    { key: 'showcase_themes', data: data.showcaseThemes || [] },
    { key: 'hero_config', data: data.heroConfig || {} },
    { key: 'filters', data: data.filters || [] },
    { key: 'canvas_config', data: data.canvasConfig || {} },
    { key: 'marquee_items', data: data.marqueeItems || [] },
    { key: 'website_content', data: data.websiteContent || {} },
    { key: 'subject_categories', data: data.subjectCategories || [] },
    { key: 'analytics', data: data.analytics || {} },
    { key: 'settings', data: data.settings || {} }
  ];

  console.log(`Migrating ${modules.length} Studio OS modules to studio_config table...`);
  for (const mod of modules) {
    await setConfig(mod.key, mod.data);
    console.log(`✓ Migrated config key: ${mod.key}`);
  }

  // Verification queries
  const inqCount = await query('SELECT COUNT(*) as count FROM inquiries');
  const galCount = await query('SELECT COUNT(*) as count FROM gallery_items');
  const cfgCount = await query('SELECT COUNT(*) as count FROM studio_config');
  const admCount = await query('SELECT COUNT(*) as count FROM admin_users');

  console.log("=== MIGRATION AUDIT RESULTS ===");
  console.log(`Admin Users: ${admCount.rows[0].count}`);
  console.log(`Inquiries: ${inqCount.rows[0].count}`);
  console.log(`Gallery Items: ${galCount.rows[0].count}`);
  console.log(`Studio Config Modules: ${cfgCount.rows[0].count}`);
  console.log("=== DATA MIGRATION COMPLETE ===");
}

migrateDataToPostgres().catch(err => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
