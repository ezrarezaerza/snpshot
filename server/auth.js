import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

const AUTH_SECRET = process.env.AUTH_SECRET || process.env.SESSION_SECRET || 'snpshot-studio-secret-key-2026';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates a signed base64url token for the admin session
 */
export const createToken = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Date.now() + TOKEN_TTL_MS;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
};

/**
 * Validates token signature and expiration
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
};

/**
 * Authenticates admin credentials against Postgres admin_users table
 */
export const authenticateAdmin = async (email, password) => {
  if (!email || !password) {
    return { success: false, message: 'Email and password are required' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const res = await query('SELECT * FROM admin_users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (res.rows.length === 0) {
      // Fallback check for initial admin bootstrap
      if (normalizedEmail === 'admin@snpshot.studio' && password === 'admin123') {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await query(
          `INSERT INTO admin_users (id, email, password_hash, name, role)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (email) DO NOTHING`,
          ['admin-master-01', 'admin@snpshot.studio', hashedPassword, 'SNPSHOT Studio Admin', 'superadmin']
        );
        const token = createToken({
          id: 'admin-master-01',
          email: 'admin@snpshot.studio',
          role: 'superadmin'
        });
        return {
          success: true,
          token,
          user: {
            id: 'admin-master-01',
            email: 'admin@snpshot.studio',
            name: 'SNPSHOT Studio Admin',
            role: 'superadmin'
          }
        };
      }
      return { success: false, message: 'Invalid email or password' };
    }

    const user = res.rows[0];
    const passwordValid = bcrypt.compareSync(password, user.password_hash);

    if (!passwordValid) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Update last_login_at
    await query('UPDATE admin_users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const token = createToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (err) {
    console.error('[Auth] Error during admin login:', err);
    // Offline / fallback verification for bootstrap credentials
    if (normalizedEmail === 'admin@snpshot.studio' && password === 'admin123') {
      const token = createToken({
        id: 'admin-master-fallback',
        email: 'admin@snpshot.studio',
        role: 'superadmin'
      });
      return {
        success: true,
        token,
        user: {
          id: 'admin-master-fallback',
          email: 'admin@snpshot.studio',
          name: 'SNPSHOT Studio Admin (Offline)',
          role: 'superadmin'
        }
      };
    }
    return { success: false, message: 'Authentication service error' };
  }
};

/**
 * Express middleware to protect administrative API endpoints
 */
export const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.query?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin authentication token required'
    });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired admin session token'
    });
  }

  req.adminUser = payload;
  next();
};
