// import path from 'node:path';

// export const DB_HOST = process.env.DB_HOST || env.DB_HOST;
// export const DB_PORT = process.env.DB_PORT;
// export const DB_DATABASE = process.env.DB_DATABASE;
// export const DB_USER = process.env.DB_USER;
// export const DB_PASSWORD = process.env.DB_PASSWORD;

// export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
// export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
// export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
// export const CLOUDINARY_URL = process.env.CLOUDINARY_URL;



// export const SMTP_HOST = process.env.SMTP_HOST;
// export const SMTP_PORT = process.env.SMTP_PORT;
// export const SMTP_USER = process.env.SMTP_USER;
// export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

// export const AUTH_SECRET = process.env.AUTH_SECRET;

// export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';


// export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://happyfit:happyfit123@localhost:5672";

// export const FIREBASE_SECRET_PATH = path.resolve(process.cwd(), './firebase.json');

// // Use encodeURIComponent to safely handle the '@' in your password
// export const DBURL = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD!)}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}${DB_PORT === '6543' ? '?sslmode=require' : ''}`;

// export const LIVEKIT_HOST = process.env.LIVEKIT_HOST || process.env.LIVEKIT_URL;
// export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
// export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;


import path from 'node:path';

let _env: any = null;

export const setGlobalEnv = (env: any) => {
  _env = env;
};

const getVal = (key: string, fallback?: string): string => {
  return _env?.[key] ?? process.env[key] ?? fallback ?? '';
};

// --- Explicit Exports for TypeScript ---
// These are now real exports that VS Code can find.
export const DB_HOST = getVal('DB_HOST');
export const DB_PORT = getVal('DB_PORT');
export const DB_USER = getVal('DB_USER');
export const DB_PASSWORD = getVal('DB_PASSWORD');
export const DB_DATABASE = getVal('DB_DATABASE');

export const JWT_SECRET_KEY = getVal('JWT_SECRET_KEY');
export const JWT_REFRESH_SECRET = getVal('JWT_REFRESH_SECRET');
export const JWT_ACCESS_EXPIRY = getVal('JWT_ACCESS_EXPIRY');
export const JWT_REFRESH_EXPIRY = getVal('JWT_REFRESH_EXPIRY');
export const JWT_ALGORITHM = getVal('JWT_ALGORITHM', 'HS256');

export const LIVEKIT_URL = getVal('LIVEKIT_URL');
export const LIVEKIT_API_KEY = getVal('LIVEKIT_API_KEY');
export const LIVEKIT_API_SECRET = getVal('LIVEKIT_API_SECRET');

// These aliases fix the specific errors in your 'services.live.ts'
export const LIVEKIT_HOST = LIVEKIT_URL; 

export const CLOUDINARY_CLOUD_NAME = getVal('CLOUDINARY_CLOUD_NAME');
export const CLOUDINARY_API_KEY = getVal('CLOUDINARY_API_KEY');
export const CLOUDINARY_API_SECRET = getVal('CLOUDINARY_API_SECRET');

export const AUTH_SECRET = getVal('AUTH_SECRET');
export const SMTP_HOST = getVal('SMTP_HOST');
export const SMTP_PORT = getVal('SMTP_PORT');
export const SMTP_USER = getVal('SMTP_USER');
export const SMTP_PASSWORD = getVal('SMTP_PASSWORD');

// Calculated variable
export const DBURL = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD)}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}${DB_PORT === '6543' ? '?sslmode=require' : ''}`;