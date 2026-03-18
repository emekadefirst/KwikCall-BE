import { z } from '@hono/zod-openapi';
import { Faq } from './models.faq';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { NestedResponseSchema as CategoryNestedResponseSchema } from '../category/schemas.category';

export const faqStatus = z.enum(['draft', 'archive', 'published']);

export const createFaqSchema = createInsertSchema(Faq).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export const updateFaqSchema = createSelectSchema(Faq).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial()

export const FaqResponseSchema = createSelectSchema(Faq)

export const FaqWithCategoryResponseSchema = FaqResponseSchema.extend({
    category: CategoryNestedResponseSchema,
})

export const PaginatedFaqResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(FaqWithCategoryResponseSchema),
})

export const FaqQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    status: faqStatus.optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    question: z.string(),
    status: faqStatus,
})
