import { z } from '@hono/zod-openapi';
import { Blog } from './models.blog';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { NestedResponseSchema as FileNestedResponseSchema } from '../../core/file/schemas.file';
import { NestedResponseSchema as CategoryNestedResponseSchema } from '../category/schemas.category';

export const blogStatus = z.enum(['draft', 'archive', 'published']);

export const createBlogSchema = createInsertSchema(Blog).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    fileIds: z.array(z.string().uuid()).optional(),
})

export const updateBlogSchema = createSelectSchema(Blog).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial().extend({
    fileIds: z.array(z.string().uuid()).optional(),
})

export const BlogResponseSchema = createSelectSchema(Blog)

export const BlogWithFilesResponseSchema = BlogResponseSchema.extend({
    files: z.array(FileNestedResponseSchema),
    category: CategoryNestedResponseSchema,
})

export const PaginatedBlogResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(BlogWithFilesResponseSchema),
})

export const BlogQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    status: blogStatus.optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    status: blogStatus,
})
