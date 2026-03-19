import { OpenAPIHono } from '@hono/zod-openapi';
import { EventService } from './services.event';
import * as routes from './routes.event';
import { getUserIdFromHeader } from '../../../hooks/header.hooks';
import { getCookie } from 'hono/cookie';

const eventController = new OpenAPIHono();
const service = new EventService();


eventController.openapi(routes.listEventsRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await service.fetch(query);
    return c.json(result, 200);
});

eventController.openapi(routes.createEventRoute, async (c) => {
    const token = getCookie(c, 'accessToken');
    
    if (!token) {
        return c.json({ message: "Unauthorized: No access token" }, 401);
    }

    const hostId = await getUserIdFromHeader(token) as string;
    const body = c.req.valid('json');
    const result = await service.create(body, hostId);

    return c.json(result, 201);
});

eventController.openapi(routes.updateEventRoute, async (c) => {
    const Token = getCookie(c, 'accessToken');
    
    if (!Token) {
        return c.json({ message: "Unauthorized: No access token" }, 401);
    }

    const hostId = await getUserIdFromHeader(Token) as string;
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const result = await service.update(id, hostId, body);
    return c.json(result, 200);
});

eventController.openapi(routes.deleteEventRoute, async (c) => {
    const hostId = await getUserIdFromHeader(c.req.header('Authorization') as string);
    const { id } = c.req.valid('param');
    await service.delete(id, hostId);
    return c.body(null, 204);
});

export default eventController;