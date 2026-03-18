import path from 'node:path';

let _cf_env: any = null;
export const setGlobalEnv = (env: any) => { _cf_env = env; };

// This Proxy intercepts every export. 
// When you call 'JWT_SECRET_KEY', it runs this logic LIVE.
const configProxy = new Proxy({}, {
  get(_, prop: string) {
    return _cf_env?.[prop] ?? process.env[prop] ?? '';
  }
}) as any;

export const DB_HOST = configProxy.DB_HOST;
export const DB_PORT = configProxy.DB_PORT || '6543';
export const DB_USER = configProxy.DB_USER;
export const DB_PASSWORD = configProxy.DB_PASSWORD;
export const DB_DATABASE = configProxy.DB_DATABASE;

export const JWT_SECRET_KEY = configProxy.JWT_SECRET_KEY;
export const LIVEKIT_API_KEY = configProxy.LIVEKIT_API_KEY;
export const LIVEKIT_API_SECRET = configProxy.LIVEKIT_API_SECRET;
export const LIVEKIT_URL = configProxy.LIVEKIT_URL;

export const getDBURL = () => {
  const host = _cf_env?.DB_HOST ?? process.env.DB_HOST;
  const user = _cf_env?.DB_USER ?? process.env.DB_USER;
  const pass = encodeURIComponent(_cf_env?.DB_PASSWORD ?? process.env.DB_PASSWORD ?? '');
  const port = _cf_env?.DB_PORT ?? process.env.DB_PORT ?? '6543';
  const db = _cf_env?.DB_DATABASE ?? process.env.DB_DATABASE ?? 'postgres';
  if (!host || !user) return ""; 
  return `postgresql://${user}:${pass}@${host}:${port}/${db}${port === '6543' ? '?sslmode=require' : ''}`;
};