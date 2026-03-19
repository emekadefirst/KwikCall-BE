import { type Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'; // Added deleteCookie
import { AuthService } from './services.auth';
import { JwtService } from '../../../auth/jwt.auth';

const authService = new AuthService();

export const loginHandler = async (c: Context) => {
    const data = await c.req.valid('json' as never);
    const user = await authService.login(data);
    
    const { accessToken, refreshToken } = await JwtService.generateTokens(user.id); 

    // Helper for consistent cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: true, 
        sameSite: 'Strict' as const,
        path: '/',
    };

    setCookie(c, 'accessToken', accessToken, { ...cookieOptions, maxAge: 60 * 15 });
    setCookie(c, 'refreshToken', refreshToken, { ...cookieOptions, maxAge: 60 * 60 * 24 * 7 });

    return c.json(null, 200);
};

export const whoamiHandler = async (c: Context) => {
    // If you're using HTTP-only cookies, you should probably check the cookie 
    // instead of the Authorization header, or check both.
    const token = getCookie(c, 'accessToken') || c.req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) throw new Error("No token provided");

    const user = await authService.whoami(token);
    return c.json(user, 200);
};

export const refreshHandler = async (c: Context) => {
    // FIX: getCookie is the correct way to read cookies in Hono
    const refreshToken = getCookie(c, 'refreshToken');
    
    if (!refreshToken) {
        return c.json({ message: "No refresh token" }, 401);
    }

    const user = await authService.refresh(refreshToken);
    return c.json(user, 200);
};

export const logoutHandler = async (c: Context) => {
    // FIX: Use deleteCookie for clean removal
    deleteCookie(c, 'accessToken', { path: '/' });
    deleteCookie(c, 'refreshToken', { path: '/' });
    
    return c.json({ success: true }, 200);
};


import { OpenAPIHono } from '@hono/zod-openapi';
import { loginRoute, logoutRoute, refreshRoute, whoamiRoute } from './routes.auth';

const authController = new OpenAPIHono();

// Bind the OpenAPI routes to the actual logic handlers
authController.openapi(loginRoute, loginHandler);
authController.openapi(whoamiRoute, whoamiHandler);
authController.openapi(refreshRoute, refreshHandler);
authController.openapi(logoutRoute, logoutHandler);

export default authController;