import { OpenAPIHono } from '@hono/zod-openapi';
import { getCookie } from 'hono/cookie';
import { EventService } from './services.event';
import * as routes from './routes.event';
import { getUserIdFromHeader } from '../../../hooks/header.hooks';

const eventController = new OpenAPIHono();
const service = new EventService();

const getAuthToken = (c: any) => {
    return getCookie(c, 'accessToken') || c.req.header('Authorization')?.replace('Bearer ', '');
};

// 1. List Events
eventController.openapi(routes.listEventsRoute, async (c) => {
    // Validating 'query' returns the exact type defined in ListEventsSchema
    const query = c.req.valid('query'); 
    const result = await service.fetch(query);
    return c.json(result, 200);
});

// 2. Create Event
eventController.openapi(routes.createEventRoute, async (c) => {
    const token = getAuthToken(c);
    const hostId = await getUserIdFromHeader(token as string);
    
    const body = c.req.valid('json');
    // We merge the hostId into the result if your service expects it inside one object
    const result = await service.create({ ...body, hostId });
    return c.json(result, 201);
});

// 3. Update Event
eventController.openapi(routes.updateEventRoute, async (c) => {
    const token = getAuthToken(c);
    const hostId = await getUserIdFromHeader(token as string);
    
    // c.req.valid('param') now knows 'id' exists
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    
    const result = await service.update(id, hostId, body);
    return c.json(result, 200);
});

// 4. Delete Event
eventController.openapi(routes.deleteEventRoute, async (c) => {
    const token = getAuthToken(c);
    const hostId = await getUserIdFromHeader(token as string);
    
    const { id } = c.req.valid('param');
    await service.delete(id, hostId);
    
    return c.body(null, 204);
});

export default eventController;