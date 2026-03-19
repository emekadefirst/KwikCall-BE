import { z } from "@hono/zod-openapi"


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
