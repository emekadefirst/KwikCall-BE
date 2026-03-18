import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { FaqService } from "./services.faq";
import {
    createFaqSchema,
    updateFaqSchema,
    FaqQueryParamSchema
} from "./schemas.faq";

const faqService = new FaqService();
const faqController = new OpenAPIHono();

/* --- 1. Create Faq Route --- */
const createRoute_ = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: { 'application/json': { schema: createFaqSchema } }
        },
    },
    responses: {
        201: { description: 'FAQ created successfully' },
        500: { description: 'Server Error' },
    },
    tags: ['FAQs'],
});

faqController.openapi(createRoute_, async (c) => {
    const data = c.req.valid('json');
    const result = await faqService.createFaq(data);
    return c.json(result, 201);
});

/* --- 2. Fetch FAQs Route --- */
const fetchRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: FaqQueryParamSchema,
    },
    responses: {
        200: { description: 'List of FAQs' },
    },
    tags: ['FAQs'],
});

faqController.openapi(fetchRoute, async (c) => {
    const query = c.req.valid('query');
    const result = await faqService.fetchFaqs(query);
    return c.json(result, 200);
});

/* --- 3. Update FAQ Route --- */
const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: {
            content: { 'application/json': { schema: updateFaqSchema } }
        }
    },
    responses: {
        200: { description: 'FAQ updated successfully' },
        404: { description: 'FAQ not found' },
    },
    tags: ['FAQs'],
});

faqController.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const result = await faqService.updateFaq(id, data);
    return c.json(result, 200);
});

/* --- 4. Delete FAQ Route --- */
const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: { description: 'FAQ deleted successfully' },
    },
    tags: ['FAQs'],
});

faqController.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const result = await faqService.deleteFaq(id);
    return c.json(result, 200);
});

export default faqController;
