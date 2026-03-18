import { z } from '@hono/zod-openapi';


export const LiveSessionSchema = z.object({
    shortCode: z.string().optional(),
    hostId: z.string().optional(),
    id: z.string().optional(),
})