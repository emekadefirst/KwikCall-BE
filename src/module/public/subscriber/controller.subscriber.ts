import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { SubscriberService } from "./services.subscriber";
import {
    createSubscriberSchema,
    updateSubscriberSchema,
    SubscriberQueryParamSchema
} from "./schemas.subscriber";

const subscriberService = new SubscriberService();
const subscriberController = new OpenAPIHono();

/* --- 1. Create Subscriber Route --- */
const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: createSubscriberSchema } }
        },
    },
    responses: {
        201: { description: 'Subscriber created successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['Subscribers'],
});

subscriberController.openapi(createRoute_, async (c) => {
    const data = c.req.valid('json');
    const result = await subscriberService.createSubscriber(data);
    return c.json(result, 201);
});

/* --- 2. Fetch Subscribers Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: SubscriberQueryParamSchema,
    },
    responses: {
        200: { description: 'List of subscribers' },
    },
    tags: ['Subscribers'],
});

subscriberController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await subscriberService.fetchSubscribers(query);
    return c.json(result, 200);
});

/* --- 3. Update Subscriber Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateSubscriberSchema } }
        }
    },
    responses: {
        200: { description: 'Subscriber updated successfully' },
        404: { description: 'Subscriber not found' },
    },
    tags: ['Subscribers'],
});

subscriberController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await subscriberService.updateSubscriber(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete Subscriber Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'Subscriber deleted successfully' },
    },
    tags: ['Subscribers'],
});

subscriberController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await subscriberService.deleteSubscriber(id);
    return c.json(result, 200);
});

export default subscriberController;
