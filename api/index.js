import app, { initServerless } from "../server.js";

/**
 * Vercel Serverless Function Handler
 * Automatically wraps the Express app with lazy initialization of Postgres database schemas
 * and handles path normalization when Vercel routes /api requests.
 */
export default async function handler(req, res) {
  try {
    // Lazily ensure database schema and in-memory cache are initialized
    await initServerless();
  } catch (initErr) {
    console.warn("[Vercel Serverless] DB initialization warning:", initErr.message);
  }

  // If Vercel rewrites strip the /api prefix, prepend /api so Express routes match seamlessly
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/uploads") && !req.url.startsWith("/send-photo-strip")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }

  return app(req, res);
}
