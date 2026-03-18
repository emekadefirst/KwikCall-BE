import { z } from '@hono/zod-openapi';
import { Gallery } from './models.gallery';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { NestedResponseSchema as FileNestedResponseSchema } from '../../core/file/schemas.file';
import { NestedResponseSchema as CategoryNestedResponseSchema } from '../category/schemas.category';

export const galleryStatus = z.enum(['draft', 'archive', 'published']);

export const createGallerySchema = createInsertSchema(Gallery).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    fileIds: z.array(z.string().uuid()).optional(),
})

export const updateGallerySchema = createSelectSchema(Gallery).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial().extend({
    fileIds: z.array(z.string().uuid()).optional(),
})

export const GalleryResponseSchema = createSelectSchema(Gallery)

export const GalleryWithFilesResponseSchema = GalleryResponseSchema.extend({
    files: z.array(FileNestedResponseSchema),
    category: CategoryNestedResponseSchema,
})

export const PaginatedGalleryResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(GalleryWithFilesResponseSchema),
})

export const GalleryQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    status: galleryStatus.optional(),
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    title: z.string(),
    status: galleryStatus,
})
