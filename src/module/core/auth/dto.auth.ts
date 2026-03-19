import { z } from '@hono/zod-openapi';
import { 
  LoginSchema, 
  RequestResetPasswordSchema, 
  ResetPasswordSchema 
} from './schemas.auth';


// Auth DTOs
export type LoginDTO                = z.infer<typeof LoginSchema>;
export type RequestResetPasswordDTO = z.infer<typeof RequestResetPasswordSchema>;
export type ResetPasswordDTO        = z.infer<typeof ResetPasswordSchema>;