import path from 'node:path';

// Storage for Cloudflare environment
let _cf_env: any = null;

export const setGlobalEnv = (env: any) => {
  _cf_env = env;
};

// This Proxy intercepts every variable access. 
// It checks Cloudflare first, then Bun/Node process.env.
const configProxy = new Proxy({}, {
  get(_, prop: string) {
    return _cf_env?.[prop] ?? (process as any).env?.[prop] ?? '';
  }
}) as any;

const getVar = (key: string, fallback: string = ''): string => {
  // 1. Check Cloudflare (Production)
  if (_cf_env?.[key]) return _cf_env[key];
  // 2. Check Bun/Node (Local terminal/CLI)
  if (process.env[key]) return process.env[key];
  // 3. Use default
  return fallback;
};

// Explicit exports so TypeScript doesn't complain
export const DB_HOST = configProxy.DB_HOST;
export const DB_PORT = configProxy.DB_PORT || '6543';
export const DB_USER = configProxy.DB_USER;
export const DB_PASSWORD = configProxy.DB_PASSWORD;
export const DB_DATABASE = configProxy.DB_DATABASE || 'postgres';

export const JWT_SECRET_KEY = configProxy.JWT_SECRET_KEY;
export const JWT_REFRESH_SECRET = configProxy.JWT_REFRESH_SECRET;
export const JWT_ACCESS_EXPIRY = configProxy.JWT_ACCESS_EXPIRY;
export const JWT_REFRESH_EXPIRY = configProxy.JWT_REFRESH_EXPIRY;
export const JWT_ALGORITHM = configProxy.JWT_ALGORITHM;

export const LIVEKIT_API_KEY = configProxy.LIVEKIT_API_KEY;
export const LIVEKIT_API_SECRET = configProxy.LIVEKIT_API_SECRET;
export const LIVEKIT_URL = configProxy.LIVEKIT_URL || configProxy.LIVEKIT_HOST;

export const CLOUDINARY_CLOUD_NAME = configProxy.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = configProxy.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = configProxy.CLOUDINARY_API_SECRET;

// The DBURL must be calculated dynamically via a function to avoid the "Invalid URL" crash
export const getDBURL = () => {
  const user = getVar('DB_USER');
  const pass = encodeURIComponent(getVar('DB_PASSWORD'));
  const host = getVar('DB_HOST');
  const port = getVar('DB_PORT', '6543');
  const db = getVar('DB_DATABASE', 'postgres');

  if (!host || !user) return ""; 

  // Force the search_path to 'public' so it finds YOUR users table first
  return `postgresql://${user}:${pass}@${host}:${port}/${db}?sslmode=require&options=-c%20search_path%3Dpublic`;
};