import { z } from '@hono/zod-openapi';

export const createContactSchema = z.object({
    name: z.string().min(3).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(15).optional(),
    category: z.enum(['general', 'support', 'feedback', 'other']).optional(),  
    message: z.string().min(10).max(1000),
})

export const contactResponseSchema = z.object({
    message: z.string().min(10).max(1000),
})


