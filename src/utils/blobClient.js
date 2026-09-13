/**
 * SNPSHOT Studio - Client-Side Storage Helper
 * Provides a unified interface for uploading and managing media assets
 * with Vercel Blob and automatic local fallback.
 */

/**
 * Normalizes any asset URL.
 * Automatically wraps private Vercel Blob URLs in the /api/blob/proxy endpoint
 * so they render reliably in <img> tags and Canvas drawImage without 403 or CORS issues.
 */
export const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('/api/blob/proxy') || url.startsWith('/api/blob/view') || url.startsWith('data:')) {
    return url;
  }
  if (url.includes('.private.blob.vercel-storage.com')) {
    return `/api/blob/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

/**
 * Checks backend storage provider status
 * @returns {Promise<{ isBlobConfigured: boolean, provider: string, storageMode: string }>}
 */
export const checkStorageStatus = async () => {
  try {
    const res = await fetch('/api/blob/status');
    if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('Storage status check error:', err);
    return {
      isBlobConfigured: false,
      provider: 'local-filesystem',
      storageMode: 'Offline / Local Simulation'
    };
  }
};

/**
 * Uploads a File or Blob object via the backend upload pipeline
 * @param {Object} params
 * @param {File|Blob} params.file - The file or blob to upload
 * @param {string} [params.folder='uploads'] - Target folder (poses, themes, frames, stickers, gallery, showcase)
 * @param {string} [params.filename] - Custom filename override
 * @returns {Promise<{ url: string, pathname: string, provider: string, size: number }>}
 */
export const uploadAsset = async ({ file, folder = 'uploads', filename }) => {
  const formData = new FormData();
  formData.append('file', file, filename || (file && file.name) || `upload-${Date.now()}.png`);
  formData.append('folder', folder);
  if (filename) formData.append('filename', filename);

  const res = await fetch('/api/blob/upload', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed with status ${res.status}`);
  }

  return await res.json();
};

/**
 * Uploads a Base64 Data URL (e.g. from Canvas export)
 * @param {Object} params
 * @param {string} params.base64Data - "data:image/png;base64,..." string
 * @param {string} [params.folder='gallery'] - Target folder
 * @param {string} [params.filename='photostrip.png'] - Target filename
 * @returns {Promise<{ url: string, pathname: string, provider: string, size: number }>}
 */
export const uploadBase64Image = async ({ base64Data, folder = 'gallery', filename = 'photostrip.png' }) => {
  const res = await fetch('/api/blob/upload-base64', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base64Data, folder, filename })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Base64 upload failed with status ${res.status}`);
  }

  return await res.json();
};

/**
 * Deletes an asset by its public or CDN URL
 * @param {string|string[]} urlOrUrls - URL or array of URLs to delete
 * @returns {Promise<{ success: boolean, deleted: string[], failed: string[] }>}
 */
export const deleteAsset = async (urlOrUrls) => {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  const res = await fetch('/api/blob/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Delete failed with status ${res.status}`);
  }

  return await res.json();
};

/**
 * Lists stored media files with optional folder prefix
 * @param {string} [prefix=''] - Folder prefix (e.g. 'poses/', 'stickers/')
 * @returns {Promise<{ blobs: Array<{ url: string, pathname: string, size: number }>, provider: string }>}
 */
export const listStoredAssets = async (prefix = '') => {
  const params = new URLSearchParams();
  if (prefix) params.append('prefix', prefix);

  const res = await fetch(`/api/blob/list?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `List failed with status ${res.status}`);
  }

  return await res.json();
};

/**
 * Triggers migration of local seed assets into Vercel Blob cloud storage
 * @param {string} [folder='all']
 * @returns {Promise<{ success: boolean, message: string, migrated: Array, errors: Array }>}
 */
export const migrateLocalSeeds = async (folder = 'all') => {
  const res = await fetch('/api/blob/migrate-seeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Seed migration failed with status ${res.status}`);
  }

  return await res.json();
};

/**
 * Triggers storage maintenance and temporary cache cleanup
 * @returns {Promise<{ success: boolean, purgedTempFiles: number, freedFormatted: string }>}
 */
export const triggerStorageMaintenance = async () => {
  const res = await fetch('/api/blob/maintenance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Storage maintenance failed with status ${res.status}`);
  }

  return await res.json();
};
