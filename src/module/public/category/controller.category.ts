import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CategoryService } from "./services.category";
import {
    createCategorySchema,
    updateCategorySchema,
    CategoryQueryParamSchema
} from "./schemas.category";

const categoryService = new CategoryService();
const categoryController = new OpenAPIHono();

/* --- 1. Create Category Route --- */
const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: createCategorySchema } }
        },
    },
    responses: {
        201: { description: 'Category created successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['Categories'],
});

categoryController.openapi(createRoute_, async (c) => {
    const data = c.req.valid('json');
    const result = await categoryService.createCategory(data);
    return c.json(result, 201);
});

/* --- 2. Fetch Categories Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: CategoryQueryParamSchema,
    },
    responses: {
        200: { description: 'List of categories' },
    },
    tags: ['Categories'],
});

categoryController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await categoryService.fetchCategories(query);
    return c.json(result, 200);
});

/* --- 3. Update Category Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateCategorySchema } }
        }
    },
    responses: {
        200: { description: 'Category updated successfully' },
        404: { description: 'Category not found' },
    },
    tags: ['Categories'],
});

categoryController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await categoryService.updateCategory(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete Category Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'Category deleted successfully' },
    },
    tags: ['Categories'],
});

categoryController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await categoryService.deleteCategory(id);
    return c.json(result, 200);
});

export default categoryController;
