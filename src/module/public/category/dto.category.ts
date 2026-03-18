import { z } from '@hono/zod-openapi';
import { NestedResponseSchema, createCategorySchema, updateCategorySchema, CategoryResponseSchema, PaginatedCategoryResponse, CategoryQueryParamSchema } from './schemas.category';


export type CategoryQueryParamsDTO = z.infer<typeof CategoryQueryParamSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

// Response DTOs
export type CategoryResponseDTO = z.infer<typeof CategoryResponseSchema>;
export type CategoryPaginatedResponseDTO = z.infer<typeof PaginatedCategoryResponse>;
export type NestedCategoryResponseDTO = z.infer<typeof NestedResponseSchema>;
