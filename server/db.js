import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

let pool = null;
let isConnected = false;
let connectionError = null;

const getConnectionString = () => {
  return (
    process.env.POSTGRES_URL ||
    process.env.PRISMA_DATABASE_URL ||
    process.env.DATABASE_URL ||
    ''
  );
};

export const getPool = () => {
  if (pool) return pool;

  const connectionString = getConnectionString();
  if (!connectionString) {
    console.warn('[DB] No POSTGRES_URL or PRISMA_DATABASE_URL found in environment.');
    return null;
  }

  try {
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected idle client error on Postgres pool:', err.message);
    });

    return pool;
  } catch (err) {
    connectionError = err.message;
    console.error('[DB] Failed to initialize Postgres pool:', err);
    return null;
  }
};

export const query = async (text, params = []) => {
  const p = getPool();
  if (!p) {
    throw new Error('Database pool not available (missing connection string or initialization failed)');
  }
  return p.query(text, params);
};

export const isDbConnected = () => isConnected;
export const getDbError = () => connectionError;

/**
 * Initialize database tables and seed required schemas
 */
export const initDb = async () => {
  const connectionString = getConnectionString();
  if (!connectionString) {
    console.warn('[DB] Skipping database initialization: No connection string configured.');
    return false;
  }

  try {
    console.log('[DB] Connecting to Postgres and verifying schema...');
    const testResult = await query('SELECT NOW() as current_time, current_database() as db_name');
    isConnected = true;
    connectionError = null;
    console.log(`[DB] Connected to database "${testResult.rows[0].db_name}" at ${testResult.rows[0].current_time}`);

    // 1. Create admin_users table
    await query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) DEFAULT 'Admin',
        role VARCHAR(50) DEFAULT 'superadmin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login_at TIMESTAMP WITH TIME ZONE
      );
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
    `);
    console.log('[DB] Table "admin_users" verified.');

    // 2. Create studio_config table for JSON configuration (frames, artists, stickers, showcase, filters, etc.)
    await query(`
      CREATE TABLE IF NOT EXISTS studio_config (
        key VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_studio_config_key ON studio_config(key);
    `);
    console.log('[DB] Table "studio_config" verified.');

    // 3. Create inquiries table
    await query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(100),
        service VARCHAR(100),
        event_date VARCHAR(100),
        guest_count VARCHAR(50),
        location VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'New',
        notes JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    `);
    console.log('[DB] Table "inquiries" verified.');

    // 4. Create gallery_items table
    await query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id VARCHAR(64) PRIMARY KEY,
        caption TEXT,
        creator VARCHAR(255),
        layout VARCHAR(64),
        image_url TEXT NOT NULL,
        origin VARCHAR(64) DEFAULT 'User Capture',
        badge VARCHAR(64) DEFAULT 'Community',
        status VARCHAR(50) DEFAULT 'published',
        likes INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_promoted_to_showcase BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON gallery_items(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_gallery_items_status ON gallery_items(status);
    `);
    console.log('[DB] Table "gallery_items" verified.');

    // 5. Create analytics_events table
    await query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
    `);
    console.log('[DB] Table "analytics_events" verified.');

    // 6. Seed default superadmin if not already present
    const defaultEmail = 'admin@snpshot.studio';
    const existingAdmin = await query('SELECT id FROM admin_users WHERE email = $1', [defaultEmail]);

    if (existingAdmin.rows.length === 0) {
      const defaultPassword = 'admin123';
      const saltRounds = 10;
      const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);

      await query(
        `INSERT INTO admin_users (id, email, password_hash, name, role)
         VALUES ($1, $2, $3, $4, $5)`,
        ['admin-master-01', defaultEmail, hashedPassword, 'SNPSHOT Studio Admin', 'superadmin']
      );
      console.log(`[DB] Default admin user seeded: ${defaultEmail}`);
    } else {
      console.log(`[DB] Admin user ${defaultEmail} already exists.`);
    }

    return true;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.error('[DB] Schema initialization failed:', err);
    return false;
  }
};

/**
 * Helper to fetch a JSON config block from studio_config
 */
export const getConfig = async (key, fallback = null) => {
  try {
    const res = await query('SELECT data FROM studio_config WHERE key = $1', [key]);
    if (res.rows.length > 0 && res.rows[0].data) {
      return res.rows[0].data;
    }
    return fallback;
  } catch (err) {
    console.error(`[DB] Error fetching config key "${key}":`, err.message);
    return fallback;
  }
};

/**
 * Helper to upsert a JSON config block in studio_config
 */
export const setConfig = async (key, data) => {
  try {
    await query(
      `INSERT INTO studio_config (key, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key)
       DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [key, JSON.stringify(data)]
    );
    return true;
  } catch (err) {
    console.error(`[DB] Error setting config key "${key}":`, err.message);
    return false;
  }
};

/**
 * Loads aggregated studio state directly from Postgres
 */
export const getStudioDataFromDb = async () => {
  try {
    // 1. Fetch all configs
    const cfgRes = await query('SELECT key, data FROM studio_config');
    const configs = {};
    for (const row of cfgRes.rows) {
      configs[row.key] = row.data;
    }

    // 2. Fetch all inquiries
    const inqRes = await query('SELECT * FROM inquiries ORDER BY created_at DESC');
    const inquiries = inqRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      service: r.service,
      eventDate: r.event_date,
      guestCount: r.guest_count,
      location: r.location,
      message: r.message,
      status: r.status,
      notes: r.notes || [],
      createdAt: r.created_at
    }));

    // 3. Fetch all gallery items
    const galRes = await query('SELECT * FROM gallery_items ORDER BY created_at DESC');
    const galleryItems = galRes.rows.map(r => ({
      id: r.id,
      caption: r.caption,
      creator: r.creator,
      layout: r.layout,
      imageUrl: r.image_url,
      origin: r.origin,
      badge: r.badge,
      status: r.status,
      likes: r.likes,
      isFeatured: r.is_featured,
      isPromotedToShowcase: r.is_promoted_to_showcase,
      createdAt: r.created_at
    }));

    return {
      artists: configs['artists'] || [],
      frames: configs['frames'] || [],
      stickers: configs['stickers'] || [],
      galleryItems: galleryItems.length > 0 ? galleryItems : (configs['galleryItems'] || []),
      showcaseThemes: configs['showcase_themes'] || [],
      heroConfig: configs['hero_config'] || {},
      filters: configs['filters'] || [],
      canvasConfig: configs['canvas_config'] || {},
      marqueeItems: configs['marquee_items'] || [],
      websiteContent: configs['website_content'] || {},
      inquiries: inquiries.length > 0 ? inquiries : (configs['inquiries'] || []),
      subjectCategories: configs['subject_categories'] || [],
      analytics: configs['analytics'] || {},
      settings: configs['settings'] || {}
    };
  } catch (err) {
    console.error('[DB] Error loading studio data from database:', err.message);
    return null;
  }
};

/**
 * Persists aggregated studio state into Postgres
 */
export const saveStudioDataToDb = async (data) => {
  if (!data || typeof data !== 'object') return false;

  try {
    const promises = [];

    if (data.artists) promises.push(setConfig('artists', data.artists));
    if (data.frames) promises.push(setConfig('frames', data.frames));
    if (data.stickers) promises.push(setConfig('stickers', data.stickers));
    if (data.showcaseThemes) promises.push(setConfig('showcase_themes', data.showcaseThemes));
    if (data.heroConfig) promises.push(setConfig('hero_config', data.heroConfig));
    if (data.filters) promises.push(setConfig('filters', data.filters));
    if (data.canvasConfig) promises.push(setConfig('canvas_config', data.canvasConfig));
    if (data.marqueeItems) promises.push(setConfig('marquee_items', data.marqueeItems));
    if (data.websiteContent) promises.push(setConfig('website_content', data.websiteContent));
    if (data.subjectCategories) promises.push(setConfig('subject_categories', data.subjectCategories));
    if (data.analytics) promises.push(setConfig('analytics', data.analytics));
    if (data.settings) promises.push(setConfig('settings', data.settings));

    // Persist Inquiries
    if (Array.isArray(data.inquiries)) {
      for (const inq of data.inquiries) {
        promises.push(
          query(
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
          )
        );
      }
    }

    // Persist Gallery Items
    if (Array.isArray(data.galleryItems)) {
      for (const item of data.galleryItems) {
        promises.push(
          query(
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
          )
        );
      }
    }

    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('[DB] Error persisting studio data to database:', err.message);
    return false;
  }
};
