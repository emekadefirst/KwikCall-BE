import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { GalleryService } from "./services.gallery";
import {
    createGallerySchema,
    updateGallerySchema,
    GalleryQueryParamSchema
} from "./schemas.gallery";

const galleryService = new GalleryService();
const galleryController = new OpenAPIHono();

/* --- 1. Create Gallery Route --- */
const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: createGallerySchema } }
        },
    },
    responses: {
        201: { description: 'Gallery created successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['Galleries'],
});

galleryController.openapi(createRoute_, async (c) => {
    const data = c.req.valid('json');
    const result = await galleryService.createGallery(data);
    return c.json(result, 201);
});

/* --- 2. Fetch Galleries Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: GalleryQueryParamSchema,
    },
    responses: {
        200: { description: 'List of galleries' },
    },
    tags: ['Galleries'],
});

galleryController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await galleryService.fetchGalleries(query);
    return c.json(result, 200);
});

/* --- 3. Update Gallery Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateGallerySchema } }
        }
    },
    responses: {
        200: { description: 'Gallery updated successfully' },
        404: { description: 'Gallery not found' },
    },
    tags: ['Galleries'],
});

galleryController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await galleryService.updateGallery(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete Gallery Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'Gallery deleted successfully' },
    },
    tags: ['Galleries'],
});

galleryController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await galleryService.deleteGallery(id);
    return c.json(result, 200);
});

export default galleryController;
