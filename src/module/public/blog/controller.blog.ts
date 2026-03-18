import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { BlogService } from "./services.blog";
import {
    createBlogSchema,
    updateBlogSchema,
    BlogQueryParamSchema
} from "./schemas.blog";


const blogService = new BlogService();
const blogController = new OpenAPIHono();

/* --- 1. Create Blog Route --- */
const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: createBlogSchema } }
        },
    },
    responses: {
        201: { description: 'Blog created successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['Blogs'],
});

blogController.openapi(createRoute_, async (c) => {
    const data = c.req.valid('json');
    const result = await blogService.createBlog(data);
    return c.json(result, 201);
});

/* --- 2. Fetch Blogs Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: BlogQueryParamSchema,
    },
    responses: {
        200: { description: 'List of blogs' },
    },
    tags: ['Blogs'],
});

blogController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await blogService.fetchBlogs(query);
    return c.json(result, 200);
});

/* --- 3. Update Blog Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateBlogSchema } }
        }
    },
    responses: {
        200: { description: 'Blog updated successfully' },
        404: { description: 'Blog not found' },
    },
    tags: ['Blogs'],
});

blogController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await blogService.updateBlog(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete Blog Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'Blog deleted successfully' },
    },
    tags: ['Blogs'],
});

blogController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await blogService.deleteBlog(id);
    return c.json(result, 200);
});

export default blogController;
