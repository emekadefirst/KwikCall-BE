import { z } from '@hono/zod-openapi';
import { fileType, NestedResponseSchema, createFileSchema, updateFileSchema, FileResponseSchema, PaginatedFileResponse, FileQueryParamSchema } from './schemas.file';


export type FileQueryParamsDTO = z.infer<typeof FileQueryParamSchema>;
export type CreateFileDTO      = z.infer<typeof createFileSchema>;
export type UpdateFileDTO      = z.infer<typeof updateFileSchema>;


// Enum DTOs

export type FileTypeEnumDTO    = z.infer<typeof fileType>

// Response DTOs
export type FileResponseDTO          = z.infer<typeof FileResponseSchema>;
export type FilePaginatedResponseDTO = z.infer<typeof PaginatedFileResponse>;
export type NestedFileResponseDTO = z.infer<typeof NestedResponseSchema>;