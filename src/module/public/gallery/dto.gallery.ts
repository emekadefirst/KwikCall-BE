import { z } from '@hono/zod-openapi';
import { galleryStatus, NestedResponseSchema, createGallerySchema, updateGallerySchema, GalleryResponseSchema, GalleryWithFilesResponseSchema, PaginatedGalleryResponse, GalleryQueryParamSchema } from './schemas.gallery';


export type GalleryQueryParamsDTO = z.infer<typeof GalleryQueryParamSchema>;
export type CreateGalleryDTO = z.infer<typeof createGallerySchema>;
export type UpdateGalleryDTO = z.infer<typeof updateGallerySchema>;

// Enum DTOs

export type GalleryStatusEnumDTO = z.infer<typeof galleryStatus>

// Response DTOs
export type GalleryResponseDTO = z.infer<typeof GalleryResponseSchema>;
export type GalleryWithFilesResponseDTO = z.infer<typeof GalleryWithFilesResponseSchema>;
export type GalleryPaginatedResponseDTO = z.infer<typeof PaginatedGalleryResponse>;
export type NestedGalleryResponseDTO = z.infer<typeof NestedResponseSchema>;
