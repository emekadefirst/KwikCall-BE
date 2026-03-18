import path from 'node:path';


let _cf_env: any = null;

export const setGlobalEnv = (env: any) => {
  _cf_env = env;
};


const getInternalVar = (key: string): string => {
  return _cf_env?.[key] ?? process.env[key] ?? '';
};

export const DB_HOST = getInternalVar('DB_HOST');
export const DB_PORT = getInternalVar('DB_PORT') || '6543';
export const DB_USER = getInternalVar('DB_USER');
export const DB_PASSWORD = getInternalVar('DB_PASSWORD');
export const DB_DATABASE = getInternalVar('DB_DATABASE') || 'postgres';

export const JWT_SECRET_KEY = getInternalVar('JWT_SECRET_KEY');
export const LIVEKIT_API_KEY = getInternalVar('LIVEKIT_API_KEY');
export const LIVEKIT_API_SECRET = getInternalVar('LIVEKIT_API_SECRET');
export const LIVEKIT_URL = getInternalVar('LIVEKIT_URL');

export const CLOUDINARY_CLOUD_NAME = getInternalVar('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = getInternalVar('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = getInternalVar('CLOUDINARY_API_SECRET');

// --- THE FIX FOR THE "INVALID URL" CRASH ---
// This MUST be a function. If it's a constant, it crashes the Cloudflare build.
export const getDBURL = () => {
  const host = _cf_env?.DB_HOST ?? process.env.DB_HOST;
  const user = _cf_env?.DB_USER ?? process.env.DB_USER;
  const pass = encodeURIComponent(_cf_env?.DB_PASSWORD ?? process.env.DB_PASSWORD ?? '');
  const port = _cf_env?.DB_PORT ?? process.env.DB_PORT ?? '6543';
  const db = _cf_env?.DB_DATABASE ?? process.env.DB_DATABASE ?? 'postgres';

  if (!host || !user) return ""; 

  return `postgresql://${user}:${pass}@${host}:${port}/${db}${port === '6543' ? '?sslmode=require' : ''}`;
};