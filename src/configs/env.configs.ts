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
  const host = configProxy.DB_HOST;
  const user = configProxy.DB_USER;
  const pass = encodeURIComponent(configProxy.DB_PASSWORD || '');
  const port = configProxy.DB_PORT || '6543';
  const db = configProxy.DB_DATABASE || 'postgres';

  if (!host || !user) return ""; 
  return `postgresql://${user}:${pass}@${host}:${port}/${db}${port === '6543' ? '?sslmode=require' : ''}`;
};