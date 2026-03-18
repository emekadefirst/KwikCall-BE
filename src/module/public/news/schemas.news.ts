import { z } from '@hono/zod-openapi';
import { News } from './models.news';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { NestedResponseSchema as FileNestedResponseSchema } from '../../core/file/schemas.file';
import { NestedResponseSchema as CategoryNestedResponseSchema } from '../category/schemas.category';

export const newsStatus = z.enum(['draft', 'archive', 'published']);

export const createNewsSchema = createInsertSchema(News).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    fileIds: z.array(z.string().uuid()).optional(),
})

export const updateNewsSchema = createSelectSchema(News).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial().extend({
    fileIds: z.array(z.string().uuid()).optional(),
})

export const NewsResponseSchema = createSelectSchema(News)

export const NewsWithFilesResponseSchema = NewsResponseSchema.extend({
    files: z.array(FileNestedResponseSchema),
    category: CategoryNestedResponseSchema,
})

export const PaginatedNewsResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(NewsWithFilesResponseSchema),
})

export const NewsQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    status: newsStatus.optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    status: newsStatus,
})
