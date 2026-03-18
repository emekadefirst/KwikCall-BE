import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { NewsService } from "./services.news";
import {
    createNewsSchema,
    updateNewsSchema,
    NewsQueryParamSchema
} from "./schemas.news";

const newsService = new NewsService();
const newsController = new OpenAPIHono();

/* --- 1. Create News Route --- */
const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: createNewsSchema } }
        },
    },
    responses: {
        201: { description: 'News created successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['News'],
});

newsController.openapi(createRoute_, async (c) => {
    const data = c.req.valid('json');
    const result = await newsService.createNews(data);
    return c.json(result, 201);
});

/* --- 2. Fetch News Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: NewsQueryParamSchema,
    },
    responses: {
        200: { description: 'List of news' },
    },
    tags: ['News'],
});

newsController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await newsService.fetchNews(query);
    return c.json(result, 200);
});

/* --- 3. Update News Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateNewsSchema } }
        }
    },
    responses: {
        200: { description: 'News updated successfully' },
        404: { description: 'News not found' },
    },
    tags: ['News'],
});

newsController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await newsService.updateNews(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete News Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'News deleted successfully' },
    },
    tags: ['News'],
});

newsController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await newsService.deleteNews(id);
    return c.json(result, 200);
});

export default newsController;
