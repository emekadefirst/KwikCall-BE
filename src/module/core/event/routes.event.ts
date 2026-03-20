import { createRoute, z } from '@hono/zod-openapi';
import { 
    EventQueryParamsSchema, 
    CreateEventSchema, 
    UpdateEventSchema, 
    EventObjectSchema, 
    EventPaginatedResponseSchema,
    ErrorSchema
} from './schemas.event';

const tags = ['Events'];

export const listEventsRoute = createRoute({
    method: 'get',
    path: '/',
    tags,
    request: { query: EventQueryParamsSchema },
    responses: {
        200: { content: { 'application/json': { schema: EventPaginatedResponseSchema } }, description: 'List of events' }
    }
});

export const createEventRoute = createRoute({
    method: 'post',
    path: '/',
    tags,
    request: { body: { content: { 'application/json': { schema: CreateEventSchema } } } },
    responses: {
        201: { content: { 'application/json': { schema: EventObjectSchema } }, description: 'Event created' },
        401: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Unauthorized' }
    }
});

export const updateEventRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    tags,
    request: { 
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: UpdateEventSchema } } } 
    },
    responses: {
        200: { content: { 'application/json': { schema: EventObjectSchema } }, description: 'Event updated' },
        401: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Unauthorized' },
        403: { description: 'Forbidden: Not the host' },
        404: { description: 'Event not found' }
    }
});

export const deleteEventRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    tags,
    request: { params: z.object({ id: z.string().uuid() }) },
    responses: {
        204: { description: 'Event deleted' },
        403: { description: 'Forbidden' },
        404: { description: 'Event not found' }
    }
});