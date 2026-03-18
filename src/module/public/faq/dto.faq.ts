import { z } from '@hono/zod-openapi';
import { faqStatus, NestedResponseSchema, createFaqSchema, updateFaqSchema, FaqResponseSchema, FaqWithCategoryResponseSchema, PaginatedFaqResponse, FaqQueryParamSchema } from './schemas.faq';


export type FaqQueryParamsDTO = z.infer<typeof FaqQueryParamSchema>;
export type CreateFaqDTO = z.infer<typeof createFaqSchema>;
export type UpdateFaqDTO = z.infer<typeof updateFaqSchema>;

// Enum DTOs

export type FaqStatusEnumDTO = z.infer<typeof faqStatus>

// Response DTOs
export type FaqResponseDTO = z.infer<typeof FaqResponseSchema>;
export type FaqWithCategoryResponseDTO = z.infer<typeof FaqWithCategoryResponseSchema>;
export type FaqPaginatedResponseDTO = z.infer<typeof PaginatedFaqResponse>;
export type NestedFaqResponseDTO = z.infer<typeof NestedResponseSchema>;
