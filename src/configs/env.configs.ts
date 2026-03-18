import path from 'path';

export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DB_DATABASE = process.env.DB_DATABASE;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL;



export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

export const AUTH_SECRET = process.env.AUTH_SECRET;

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';


export const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://happyfit:happyfit123@localhost:5672";

export const FIREBASE_SECRET_PATH = path.resolve(process.cwd(), './firebase.json');

// Use encodeURIComponent to safely handle the '@' in your password
export const DBURL = `postgresql://${DB_USER}:${encodeURIComponent(DB_PASSWORD!)}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}${DB_PORT === '6543' ? '?sslmode=require' : ''}`;

export const LIVEKIT_HOST = process.env.LIVEKIT_HOST || process.env.LIVEKIT_URL;
export const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
export const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;