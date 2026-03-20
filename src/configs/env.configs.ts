// src/core/config.core.ts

// Storage for Cloudflare environment (injected at runtime by the handler)
let _cf_env: any = null;

export const setGlobalEnv = (env: any) => {
  _cf_env = env;
};

/**
 * Internal helper to fetch variables.
 * Priority: 
 * 1. Cloudflare Environment (Production/Edge)
 * 2. Bun.env (Local/CLI/Migrations)
 * 3. Fallback value
 */
const getVar = (key: string, fallback: string = ''): string => {
  return _cf_env?.[key] ?? process.env[key] ?? fallback;
};

// Database Config
export const DB_HOST = () => getVar('DB_HOST');
export const DB_PORT = () => getVar('DB_PORT', '5432'); // Use 5432 for Direct / 6543 for Pooling
export const DB_USER = () => getVar('DB_USER');
export const DB_PASSWORD = () => getVar('DB_PASSWORD');
export const DB_DATABASE = () => getVar('DB_DATABASE', 'postgres');

// Auth Config
export const JWT_SECRET_KEY = () => getVar('JWT_SECRET_KEY');
export const JWT_REFRESH_SECRET = () => getVar('JWT_REFRESH_SECRET');
export const JWT_ACCESS_EXPIRY = () => getVar('JWT_ACCESS_EXPIRY', '15m');
export const JWT_REFRESH_EXPIRY = () => getVar('JWT_REFRESH_EXPIRY', '7d');
export const JWT_ALGORITHM = () => getVar('JWT_ALGORITHM', 'HS256');

// Third Party
export const LIVEKIT_API_KEY = () => getVar('LIVEKIT_API_KEY');
export const LIVEKIT_API_SECRET = () => getVar('LIVEKIT_API_SECRET');
export const LIVEKIT_URL = () => getVar('LIVEKIT_URL') || getVar('LIVEKIT_HOST');

export const CLOUDINARY_CLOUD_NAME = () => getVar('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = () => getVar('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = () => getVar('CLOUDINARY_API_SECRET');

/**
 * Generates the connection string.
 * Note: Uses 5432 for migrations typically, 6543 for pooled app connections.
 */
export const getDBURL = () => {
  // If you have a full DATABASE_URL in your .env, use it directly
  const directUrl = getVar('DATABASE_URL');
  if (directUrl) return directUrl;

  const user = DB_USER();
  const pass = encodeURIComponent(DB_PASSWORD());
  const host = DB_HOST();
  const port = DB_PORT();
  const db = DB_DATABASE();

  if (!host || !user) {
    console.warn("⚠️ Database configuration is missing. Check your .env file.");
    return "";
  }

  // Adding sslmode=require for hosted DBs (Neon/Supabase)
  // If running locally on Docker without SSL, remove this or make it conditional
  const ssl = host.includes('localhost') || host.includes('127.0.0.1') ? '' : '?sslmode=require';
  
  return `postgresql://${user}:${pass}@${host}:${port}/${db}${ssl}`;
};