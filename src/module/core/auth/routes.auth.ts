import { createRoute, z } from '@hono/zod-openapi';
import { LoginSchema, UserPaginatedResponseSchema } from '../user/schemas.user'; // Assuming UserResponseSchema exists

const tags = ['Auth'];

// --- Login Route ---
export const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    tags,
    request: { 
        body: { 
            content: { 'application/json': { schema: LoginSchema } } 
        } 
    },
    responses: {
        200: { 
            description: 'User logged in successfully (Token set in Cookies)',
            content: { 'application/json': { schema: z.null() } }
        },
        401: { description: 'Invalid credentials' },
        500: { description: 'Internal Server Error' }
    }
});

// --- WhoAmI Route ---
export const whoamiRoute = createRoute({
    method: 'get',
    path: '/whoami',
    tags,
    responses: {
        200: { 
            description: 'Returns the current user data',
            content: { 'application/json': { schema: UserPaginatedResponseSchema } }
        },
        401: { description: 'Unauthorized' },
        404: { description: 'User not found' }
    }
});

// --- Refresh Route ---
export const refreshRoute = createRoute({
    method: 'post',
    path: '/refresh',
    tags,
    responses: {
        200: { 
            description: 'Session refreshed',
            content: { 'application/json': { schema: z.null() } }
        },
        401: { description: 'Invalid or missing refresh token' }
    }
});

// --- Logout Route ---
export const logoutRoute = createRoute({
    method: 'post',
    path: '/logout',
    tags,
    responses: {
        200: { 
            description: 'Cookies cleared',
            content: { 
                'application/json': { 
                    schema: z.object({ success: z.boolean() }) 
                } 
            }
        }
    }
});


