import { OpenAPIHono } from '@hono/zod-openapi';
import { EventService } from './services.event';
import * as routes from './routes.event';

const eventController = new OpenAPIHono();
const service = new EventService();


eventController.openapi(routes.listEventsRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await service.fetch(query);
    return c.json(result, 200);
});


eventController.openapi(routes.createEventRoute, async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user' as any); 
    const result = await service.create(body, user.id);
    return c.json(result, 201);
});

eventController.openapi(routes.updateEventRoute, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const user = c.get('user' as any);
    const result = await service.update(id, user.id, body);
    return c.json(result, 200);
});

eventController.openapi(routes.deleteEventRoute, async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user' as any);
    await service.delete(id, user.id);
    return c.body(null, 204);
});

export default eventController;