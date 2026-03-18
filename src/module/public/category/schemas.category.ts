import { z } from '@hono/zod-openapi';
import { Category } from './models.category';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const createCategorySchema = createInsertSchema(Category).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export const updateCategorySchema = createSelectSchema(Category).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial()

export const CategoryResponseSchema = createSelectSchema(Category)

export const PaginatedCategoryResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(CategoryResponseSchema),
})

export const CategoryQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
})
