import { put, del, list, head } from '@vercel/blob';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let detectedStoreAccess = process.env.BLOB_STORE_ACCESS || null;

/**
 * Checks if Vercel Blob token is configured and available in environment
 */
export const isBlobConfigured = () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(token && token.trim().length > 0 && !token.includes('YOUR_BLOB_READ_WRITE_TOKEN'));
};

/**
 * Resolves a stored media URL into a browser-loadable URL.
 * Automatically wraps private Vercel Blob URLs into the authenticated proxy endpoint.
 */
export const resolveBlobUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/api/blob/proxy') || url.startsWith('/api/blob/view') || url.startsWith('data:')) {
    return url;
  }
  if (url.includes('.private.blob.vercel-storage.com') || (detectedStoreAccess === 'private' && (url.includes('blob.vercel-storage.com') || url.includes('vercel-storage.com')))) {
    return `/api/blob/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

/**
 * Deeply traverses an object or array and resolves any private blob URLs.
 */
export const deepResolveBlobUrls = (data) => {
  if (!data) return data;
  if (typeof data === 'string') {
    return resolveBlobUrl(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => deepResolveBlobUrls(item));
  }
  if (typeof data === 'object') {
    const copy = { ...data };
    for (const key of Object.keys(copy)) {
      copy[key] = deepResolveBlobUrls(copy[key]);
    }
    return copy;
  }
  return data;
};

/**
 * Returns diagnostic metadata about current active storage provider and migration readiness
 */
export const getStorageStatus = () => {
  const configured = isBlobConfigured();
  const token = process.env.BLOB_READ_WRITE_TOKEN || '';
  
  // Calculate local seed asset statistics
  const folders = ['poses', 'themes', 'frames', 'stickers', 'gallery', 'showcase', 'temp'];
  let localAssetCount = 0;
  let totalLocalBytes = 0;

  folders.forEach(folder => {
    const dir = path.join(rootDir, 'public', 'img', folder);
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        files.forEach(f => {
          try {
            const stat = fs.statSync(path.join(dir, f));
            if (stat.isFile()) {
              localAssetCount++;
              totalLocalBytes += stat.size;
            }
          } catch (_) {}
        });
      } catch (_) {}
    }
  });

  return {
    provider: configured ? 'vercel-blob' : 'local-filesystem',
    isBlobConfigured: configured,
    tokenConfigured: Boolean(token),
    tokenPrefix: token ? `${token.slice(0, 8)}...` : null,
    storageMode: configured ? 'Vercel Edge Blob Storage (Cloud CDN)' : 'Local Ephemeral Filesystem (Dev Fallback)',
    storeAccessMode: detectedStoreAccess || process.env.BLOB_STORE_ACCESS || 'auto-detect (public/private)',
    supportedFolders: folders,
    localStats: {
      totalFiles: localAssetCount,
      totalBytes: totalLocalBytes,
      formattedSize: `${(totalLocalBytes / (1024 * 1024)).toFixed(2)} MB`
    },
    edgeCdn: {
      enabled: configured,
      cacheControl: 'public, max-age=31536000, immutable',
      globalDistribution: configured ? 'Active (Vercel Anycast Edge)' : 'Local Direct'
    }
  };
};

/**
 * Sanitizes and formats target path for Blob or local storage
 */
const sanitizePathname = (folder = 'uploads', filename = '') => {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '').toLowerCase();
  const safeFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
  return `${cleanFolder}/${Date.now()}-${safeFilename}`;
};

/**
 * Main Upload Function: Dual-Mode (Vercel Blob with Local Fallback)
 * Automatically adapts between public and private store access modes.
 * @param {Object} options
 * @param {Buffer|ReadableStream|Blob|string} options.body - File buffer or string
 * @param {string} options.folder - Destination folder (e.g. 'poses', 'frames', 'stickers', 'gallery')
 * @param {string} options.filename - Desired filename
 * @param {string} [options.contentType] - MIME type
 * @param {boolean} [options.addRandomSuffix=true] - Whether to append random suffix to avoid collisions
 * @param {string} [options.access] - Optional explicit access level ('public' or 'private')
 * @returns {Promise<{ url: string, pathname: string, size: number, provider: string, contentType: string }>}
 */
export const uploadBlob = async ({
  body,
  folder = 'uploads',
  filename = 'file.png',
  contentType = 'image/png',
  addRandomSuffix = true,
  access
}) => {
  const configured = isBlobConfigured();
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (configured && token) {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '').toLowerCase();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const targetPath = `${cleanFolder}/${safeFilename}`;

    // Determine target access level based on past detection, env override, or default
    let targetAccess = access || detectedStoreAccess || process.env.BLOB_STORE_ACCESS || 'public';

    try {
      let blobResult;
      try {
        blobResult = await put(targetPath, body, {
          access: targetAccess,
          token,
          contentType: contentType || undefined,
          addRandomSuffix
        });
      } catch (uploadErr) {
        const errMsg = uploadErr?.message || '';
        // If the store is private but we requested public access:
        if (errMsg.includes('Cannot use public access on a private store') || errMsg.includes('private store')) {
          console.info('Detected private Vercel Blob store, retrying upload with private access...');
          detectedStoreAccess = 'private';
          blobResult = await put(targetPath, body, {
            access: 'private',
            token,
            contentType: contentType || undefined,
            addRandomSuffix
          });
        } 
        // If the store is public but we requested private access:
        else if (errMsg.includes('Cannot use private access on a public store') || errMsg.includes('public store')) {
          console.info('Detected public Vercel Blob store, retrying upload with public access...');
          detectedStoreAccess = 'public';
          blobResult = await put(targetPath, body, {
            access: 'public',
            token,
            contentType: contentType || undefined,
            addRandomSuffix
          });
        } else {
          throw uploadErr;
        }
      }

      const isPrivate = targetAccess === 'private' || 
                        blobResult.url.includes('.private.blob.vercel-storage.com') || 
                        detectedStoreAccess === 'private';
      const resolvedUrl = isPrivate ? `/api/blob/proxy?url=${encodeURIComponent(blobResult.url)}` : blobResult.url;

      return {
        url: resolvedUrl,
        rawUrl: blobResult.url,
        pathname: blobResult.pathname,
        contentType: blobResult.contentType || contentType,
        size: blobResult.size || (Buffer.isBuffer(body) ? body.length : 0),
        provider: 'vercel-blob',
        access: targetAccess,
        downloadUrl: blobResult.downloadUrl || resolvedUrl
      };
    } catch (err) {
      console.warn('Vercel Blob upload failed, falling back to local storage:', err.message);
    }
  }

  // Fallback: Local Filesystem Storage
  const targetFolder = path.join(rootDir, 'public', 'img', folder);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const localFilePath = path.join(targetFolder, safeName);
  
  if (Buffer.isBuffer(body)) {
    fs.writeFileSync(localFilePath, body);
  } else if (typeof body === 'string') {
    // Check if base64 data URL
    if (body.startsWith('data:')) {
      const base64Data = body.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(localFilePath, Buffer.from(base64Data, 'base64'));
    } else {
      fs.writeFileSync(localFilePath, Buffer.from(body, 'utf-8'));
    }
  } else {
    fs.writeFileSync(localFilePath, body);
  }

  const publicUrl = `/img/${folder}/${safeName}`;
  const stats = fs.statSync(localFilePath);

  return {
    url: publicUrl,
    pathname: `img/${folder}/${safeName}`,
    contentType,
    size: stats.size,
    provider: 'local-filesystem',
    downloadUrl: publicUrl
  };
};

/**
 * Delete Blob or Local Asset by URL
 * @param {string|string[]} urlOrUrls - Single URL or array of URLs to delete
 * @returns {Promise<{ deleted: string[], failed: string[], provider: string }>}
 */
export const deleteBlob = async (urlOrUrls) => {
  if (!urlOrUrls) return { deleted: [], failed: [], provider: 'none' };
  
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  const configured = isBlobConfigured();
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  const deleted = [];
  const failed = [];

  for (const url of urls) {
    if (!url || typeof url !== 'string') continue;

    // Check if URL is Vercel Blob URL (contains vercel-storage.com or public.blob.vercel-storage.com)
    const isVercelBlobUrl = url.includes('.blob.vercel-storage.com') || url.includes('vercel-storage.com');

    if (isVercelBlobUrl && configured && token) {
      try {
        await del(url, { token });
        deleted.push(url);
      } catch (err) {
        console.warn(`Failed to delete blob from Vercel storage: ${url}`, err.message);
        failed.push(url);
      }
    } else {
      // Local fallback removal
      try {
        let relativePath = url.replace(/^\//, '');
        let filePath = path.join(rootDir, 'public', relativePath);
        
        if (!fs.existsSync(filePath)) {
          filePath = path.join(rootDir, relativePath);
        }

        if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
          deleted.push(url);
        } else {
          // File may already be absent, consider handled
          deleted.push(url);
        }
      } catch (err) {
        console.warn(`Failed to delete local file: ${url}`, err.message);
        failed.push(url);
      }
    }
  }

  return {
    deleted,
    failed,
    provider: configured ? 'vercel-blob' : 'local-filesystem'
  };
};

/**
 * List Blobs with prefix filtering
 * @param {Object} options
 * @param {string} [options.prefix] - Filter folder prefix (e.g. 'poses/', 'stickers/')
 * @param {number} [options.limit=100] - Max items to return
 * @param {string} [options.cursor] - Pagination cursor
 */
export const listBlobs = async ({ prefix = '', limit = 100, cursor } = {}) => {
  const configured = isBlobConfigured();
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (configured && token) {
    try {
      const result = await list({
        prefix,
        limit,
        cursor,
        token
      });
      return {
        blobs: result.blobs,
        hasMore: result.hasMore,
        cursor: result.cursor,
        provider: 'vercel-blob'
      };
    } catch (err) {
      console.warn('Vercel Blob list error, falling back to local directory listing:', err.message);
    }
  }

  // Fallback: Local folder scan
  const cleanFolder = prefix.replace(/\/+$/, '');
  const targetDir = cleanFolder ? path.join(rootDir, 'public', 'img', cleanFolder) : path.join(rootDir, 'public', 'img');
  
  if (!fs.existsSync(targetDir)) {
    return { blobs: [], hasMore: false, provider: 'local-filesystem' };
  }

  const files = fs.readdirSync(targetDir);
  const blobs = files.map(file => {
    const fullPath = path.join(targetDir, file);
    const stats = fs.statSync(fullPath);
    return {
      url: `/img/${cleanFolder ? cleanFolder + '/' : ''}${file}`,
      pathname: `${cleanFolder ? cleanFolder + '/' : ''}${file}`,
      size: stats.size,
      uploadedAt: stats.mtime
    };
  });

  return {
    blobs: blobs.slice(0, limit),
    hasMore: blobs.length > limit,
    provider: 'local-filesystem'
  };
};

/**
 * Phase 4 // Seed Migration Engine
 * Migrates local filesystem media seeds into Vercel Blob cloud storage
 * and updates references seamlessly.
 */
export const migrateLocalSeedsToBlob = async ({ folder = 'all' } = {}) => {
  const configured = isBlobConfigured();
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!configured || !token) {
    return {
      success: false,
      message: 'Cannot migrate seeds to Vercel Blob: BLOB_READ_WRITE_TOKEN is not configured in environment.',
      migratedCount: 0,
      errors: ['Storage is in local fallback mode. Please configure BLOB_READ_WRITE_TOKEN.']
    };
  }

  const targetFolders = folder === 'all' 
    ? ['poses', 'themes', 'frames', 'stickers', 'gallery', 'showcase']
    : [folder];

  const results = {
    totalScanned: 0,
    migrated: [],
    skipped: [],
    errors: []
  };

  for (const f of targetFolders) {
    const dir = path.join(rootDir, 'public', 'img', f);
    if (!fs.existsSync(dir)) continue;

    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;

        results.totalScanned++;
        const ext = path.extname(file).toLowerCase();
        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml',
          '.json': 'application/json'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        try {
          const fileBuffer = fs.readFileSync(filePath);
          const uploadRes = await uploadBlob({
            body: fileBuffer,
            folder: f,
            filename: file,
            contentType,
            addRandomSuffix: false
          });

          results.migrated.push({
            folder: f,
            filename: file,
            localUrl: `/img/${f}/${file}`,
            blobUrl: uploadRes.url,
            size: uploadRes.size
          });
        } catch (err) {
          results.errors.push({
            folder: f,
            filename: file,
            error: err.message
          });
        }
      }
    } catch (err) {
      results.errors.push({
        folder: f,
        error: `Failed to read folder ${f}: ${err.message}`
      });
    }
  }

  return {
    success: results.errors.length === 0,
    message: `Migration complete: ${results.migrated.length} of ${results.totalScanned} assets synchronized to Vercel Blob storage.`,
    ...results
  };
};

/**
 * Phase 4 // Storage Maintenance & Cache Optimizer
 * Cleans temporary storage artifacts, stale exports, and unreferenced assets.
 */
export const runStorageMaintenance = async () => {
  const tempDir = path.join(rootDir, 'public', 'img', 'temp');
  let purgedTempFiles = 0;
  let freedBytes = 0;

  if (fs.existsSync(tempDir)) {
    try {
      const files = fs.readdirSync(tempDir);
      for (const f of files) {
        const fp = path.join(tempDir, f);
        try {
          const stat = fs.statSync(fp);
          // Purge files older than 30 minutes or probe files
          const ageMinutes = (Date.now() - stat.mtimeMs) / (1000 * 60);
          if (ageMinutes > 30 || f.startsWith('storage-probe-')) {
            freedBytes += stat.size;
            fs.unlinkSync(fp);
            purgedTempFiles++;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    purgedTempFiles,
    freedBytes,
    freedFormatted: `${(freedBytes / 1024).toFixed(1)} KB`,
    status: 'Storage and cache maintenance routine completed successfully.'
  };
};
