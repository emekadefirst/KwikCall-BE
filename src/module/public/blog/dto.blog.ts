import { z } from '@hono/zod-openapi';
import { blogStatus, NestedResponseSchema, createBlogSchema, updateBlogSchema, BlogResponseSchema, BlogWithFilesResponseSchema, PaginatedBlogResponse, BlogQueryParamSchema } from './schemas.blog';


export type BlogQueryParamsDTO = z.infer<typeof BlogQueryParamSchema>;
export type CreateBlogDTO = z.infer<typeof createBlogSchema>;
export type UpdateBlogDTO = z.infer<typeof updateBlogSchema>;

// Enum DTOs

export type BlogStatusEnumDTO = z.infer<typeof blogStatus>

// Response DTOs
export type BlogResponseDTO = z.infer<typeof BlogResponseSchema>;
export type BlogWithFilesResponseDTO = z.infer<typeof BlogWithFilesResponseSchema>;
export type BlogPaginatedResponseDTO = z.infer<typeof PaginatedBlogResponse>;
export type NestedBlogResponseDTO = z.infer<typeof NestedResponseSchema>;
