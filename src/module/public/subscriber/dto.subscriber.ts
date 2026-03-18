import { z } from '@hono/zod-openapi';
import { NestedResponseSchema, createSubscriberSchema, updateSubscriberSchema, SubscriberResponseSchema, PaginatedSubscriberResponse, SubscriberQueryParamSchema } from './schemas.subscriber';


export type SubscriberQueryParamsDTO = z.infer<typeof SubscriberQueryParamSchema>;
export type CreateSubscriberDTO = z.infer<typeof createSubscriberSchema>;
export type UpdateSubscriberDTO = z.infer<typeof updateSubscriberSchema>;

// Response DTOs
export type SubscriberResponseDTO = z.infer<typeof SubscriberResponseSchema>;
export type SubscriberPaginatedResponseDTO = z.infer<typeof PaginatedSubscriberResponse>;
export type NestedSubscriberResponseDTO = z.infer<typeof NestedResponseSchema>;
