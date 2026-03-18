import { z } from '@hono/zod-openapi';
import { Subscriber } from './models.subscriber';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const createSubscriberSchema = createInsertSchema(Subscriber).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export const updateSubscriberSchema = createSelectSchema(Subscriber).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).partial()

export const SubscriberResponseSchema = createSelectSchema(Subscriber)

export const PaginatedSubscriberResponse = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(SubscriberResponseSchema),
})

export const SubscriberQueryParamSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const NestedResponseSchema = z.object({
    id: z.string().uuid(),
    email: z.string(),
})
