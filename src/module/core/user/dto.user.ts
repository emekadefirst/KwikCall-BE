import { z } from '@hono/zod-openapi';
import { 
  UserQueryParamsSchema, 
  CreateUserSchema, 
  UpdateUserSchema, 
  UserObjectSchema, 
  UserPaginatedResponseSchema, 
  LoginSchema, 
  RequestResetPasswordSchema, 
  ResetPasswordSchema 
} from './schemas.user';

// Request DTOs
export type UserQueryParamsDTO = z.infer<typeof UserQueryParamsSchema>;
export type CreateUserDTO      = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO      = z.infer<typeof UpdateUserSchema>;

// Auth DTOs
export type LoginDTO                = z.infer<typeof LoginSchema>;
export type RequestResetPasswordDTO = z.infer<typeof RequestResetPasswordSchema>;
export type ResetPasswordDTO        = z.infer<typeof ResetPasswordSchema>;

// Response DTOs
export type UserResponseDTO          = z.infer<typeof UserObjectSchema>;
export type UserPaginatedResponseDTO = z.infer<typeof UserPaginatedResponseSchema>;