import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { UserService } from './services.user';
import { 
    UserQueryParamsSchema, 
    CreateUserSchema, 
    UpdateUserSchema, 
    UserObjectSchema, 
    LoginSchema,
    UserPaginatedResponseSchema 
} from './schemas.user';
import { hasBrowserAgent } from '../../../hooks/browser.hooks';
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { JwtService } from '../../../auth/jwt.auth';

const userService = new UserService();

export const userController = new OpenAPIHono();
export const authController = new OpenAPIHono();

// Common Error Schema for 401/400
const ErrorSchema = z.object({
    message: z.string()
});

// --- Route Definitions ---

const getUsersRoute = createRoute({
    method: 'get',
    path: '/',
    request: { query: UserQueryParamsSchema },
    responses: {
        200: {
            content: { 'application/json': { schema: UserPaginatedResponseSchema } },
            description: 'Retrieve paginated users',
        },
    },
    tags: ['Users'],
});

const createUserRoute = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: { content: { 'application/json': { schema: CreateUserSchema } } },
    },
    responses: {
        201: {
            description: 'User created successfully',
        },
        400: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Validation error or User already exists',
        },
    },
    tags: ['Users'],
});

const updateUserRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: UpdateUserSchema } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: UserObjectSchema } },
            description: 'User updated successfully',
        },
    },
    tags: ['Users'],
});

const deleteUserRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
            description: 'User deleted successfully',
        },
    },
    tags: ['Users'],
});

// --- User Implementation ---

userController.openapi(getUsersRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await userService.getAllUsers(query);
    return c.json(result, 200);
});

userController.openapi(createUserRoute, async (c) => {
    const body = c.req.valid('json');
    try {
        await userService.createUser(body);
        return c.body(null, 201);
    } catch (error: any) {
        return c.json({ message: error.message }, 400);
    }
});

userController.openapi(updateUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await userService.updateUser(id, body);
    return c.json(result, 200);
});

userController.openapi(deleteUserRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await userService.deleteUser(id);
    return c.json(result, 200);
});


const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax' as const,
    path: '/',
};

// --- Auth Route Definitions ---

const authWhoamiRoute = createRoute({
    method: 'get',
    path: '/whoami',
    responses: {
        200: {
            content: { 'application/json': { schema: UserObjectSchema } },
            description: 'Retrieve current user information',
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Unauthorized access',
        }
    },
    tags: ['Authentication'],
});

const authLoginRoute = createRoute({
    method: 'post',
    path: '/login',
    request: {
        body: { content: { 'application/json': { schema: LoginSchema } } },
    },
    responses: {
        200: {
            // Updated to handle both null (browser) and tokens (mobile)
            content: { 'application/json': { schema: z.union([z.null(), z.object({ accessToken: z.string(), refreshToken: z.string() })]) } },
            description: 'Login successful'
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Invalid credentials'
        }
    },
    tags: ['Authentication'],
});

const authLogoutRoute = createRoute({
    method: 'post',
    path: '/logout',
    responses: {
        200: {
            content: { 'application/json': { schema: z.null() } },
            description: 'Logout successful'
        },
    },
    tags: ['Authentication'],
});

const authRefreshTokenRoute = createRoute({
    method: 'post',
    path: '/refresh-token',
    responses: {
        200: {
            content: { 'application/json': { schema: z.union([z.null(), z.object({ accessToken: z.string(), refreshToken: z.string() })]) } },
            description: 'Token refreshed successfully'
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Invalid refresh token'
        }
    },
    tags: ['Authentication'],
});

// --- Auth Implementation ---


authController.openapi(authLogoutRoute, async (c) => {
    deleteCookie(c, 'accessToken');
    deleteCookie(c, 'refreshToken');
    return c.json(null, 200);
});

authController.openapi(authRefreshTokenRoute, async (c) => {
    const isBrowser = await hasBrowserAgent(c.req.header('User-Agent'));
    
    let rfToken: string | undefined;
    if (isBrowser) {
        rfToken = getCookie(c, 'refreshToken');
    } else {
        const body = await c.req.json().catch(() => ({}));
        rfToken = body.refreshToken;
    }

    if (!rfToken) return c.json({ message: 'No refresh token' }, 401);

    const tokens = await JwtService.refreshSession(rfToken);
    if (!tokens) return c.json({ message: 'Invalid refresh token' }, 401);

    if (isBrowser) {
        setCookie(c, 'accessToken', tokens.accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });
        setCookie(c, 'refreshToken', tokens.refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 });
        return c.json(null, 200);
    }

    return c.json(tokens, 200);
});

authController.openapi(authWhoamiRoute, async (c) => {
    const isBrowser = await hasBrowserAgent(c.req.header('User-Agent'));
    
    const token = isBrowser 
        ? getCookie(c, 'accessToken') 
        : c.req.header('Authorization')?.replace('Bearer ', '');

    if (!token) return c.json({ message: 'Unauthorized' }, 401);

    const user = await JwtService.getCurrentUser(token);
    if (!user) return c.json({ message: 'User not found' }, 401);

    // Date values in Drizzle/TS need to be cast to strings for JSON responses 
    // if the Zod schema expects strings (ISO dates).
    return c.json(user as any, 200);
});