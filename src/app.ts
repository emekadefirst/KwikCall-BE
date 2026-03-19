import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi'
import { setGlobalEnv } from './configs/env.configs';
import eventController from './module/core/event/controller.event';
import fileController from './module/core/file/controller.file';
import { userController } from './module/core/user/controller.user';
import liveController from './module/core/live/controller.live';
import authController from './module/core/auth/controllers.auth';

export const app = new OpenAPIHono()


app.get('/', (c) => c.text('Hello Bun!'));

app.use('*', async (c, next) => {
  setGlobalEnv(c.env);
  await next();
});

// --- CORS Configuration ---
const trustedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500',
  'https://lucky-people.outray.app'
];

interface CorsOptions {
  origin: (origin: string) => string;
  allowMethods: string[];
  allowHeaders: string[];
  exposeHeaders: string[];
  maxAge: number;
  credentials: boolean;
}

app.use('*', cors({
  origin: (origin?: string): string => {
    if (origin && trustedOrigins.includes(origin)) {
      return origin;
    }
    return trustedOrigins[0] ?? '';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
  maxAge: 600,
  credentials: true,
} as CorsOptions));

app.doc('/doc', {
  openapi: '3.0.0',
  info: { title: 'KwikCall API', version: '1.0.0' },
});

app.route("v1/auth", authController)
app.route('v1/users', userController)
app.route('v1/events', eventController)
app.route('v1/live', liveController)
app.route('v1/files', fileController)
app.get('/docs', swaggerUI({ url: '/doc' }));


export default app;

