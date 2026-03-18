import { z } from '@hono/zod-openapi';
import { User } from './models.user';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { fi } from 'zod/v4/locales';


export const userRoleEnum = z.enum(["user", "admin", "moderator"]);



export const UserQueryParamsSchema = z.object({
    id: z.string().uuid().optional(),
    search: z.string().optional(),
    role: userRoleEnum.optional(),
    email: z.string().email().optional(),
    isActive: z.coerce.boolean().optional(),
    isVerified: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const CreateUserSchema = createInsertSchema(User).omit({
    id: true,
    isActive: true,
    isVerified: true,
    lastLogin: true,
    role: true,
    createdAt: true,
    updatedAt: true,
    deviceTokens: true
}).partial({
    phoneNumber: true,
    password: true
})


export const UpdateUserSchema = createInsertSchema(User).omit({
    id: true,
    email: true,
    password: true,
    createdAt: true,
    updatedAt: true,
    lastLogin: true,
    deviceTokens: true
}).partial({
    phoneNumber: true,
    firstName: true,
    lastName: true,
    role: true,
    isActive: true,
    isVerified: true
})

export const UserObjectSchema = createSelectSchema(User).omit({
    password: true
})

export const UserPaginatedResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(UserObjectSchema),
})


export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const RequestResetPasswordSchema = z.object({
    email: z.string().email(),
})

export const ResetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(6),
})


export const NestUserSchema = z.object({
    id: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string()
}).openapi('UserNestedObject');