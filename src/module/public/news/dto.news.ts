import { z } from '@hono/zod-openapi';
import { newsStatus, NestedResponseSchema, createNewsSchema, updateNewsSchema, NewsResponseSchema, NewsWithFilesResponseSchema, PaginatedNewsResponse, NewsQueryParamSchema } from './schemas.news';


export type NewsQueryParamsDTO = z.infer<typeof NewsQueryParamSchema>;
export type CreateNewsDTO = z.infer<typeof createNewsSchema>;
export type UpdateNewsDTO = z.infer<typeof updateNewsSchema>;

// Enum DTOs

export type NewsStatusEnumDTO = z.infer<typeof newsStatus>

// Response DTOs
export type NewsResponseDTO = z.infer<typeof NewsResponseSchema>;
export type NewsWithFilesResponseDTO = z.infer<typeof NewsWithFilesResponseSchema>;
export type NewsPaginatedResponseDTO = z.infer<typeof PaginatedNewsResponse>;
export type NestedNewsResponseDTO = z.infer<typeof NestedResponseSchema>;
