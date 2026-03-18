import { z } from '@hono/zod-openapi';
import { File } from './models.file';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { url } from 'zod';

export const fileType = z.enum(['image', 'video', 'document', 'audio']);


export const createFileSchema = createInsertSchema(File).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})


export const updateFileSchema = createSelectSchema(File).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial()

export const FileResponseSchema = createSelectSchema(File)

export const PaginatedFileResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(FileResponseSchema),
})


export const FileQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    type: fileType.optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    url: z.string().url(),
    type: fileType,
})