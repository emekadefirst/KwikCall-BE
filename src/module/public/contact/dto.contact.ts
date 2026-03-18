import { z } from "@hono/zod-openapi";
import { createContactSchema, contactResponseSchema } from "./schemas.contact";


export const createContactDTO = createContactSchema.openapi('createContactDTO');
export const contactResponseDTO = contactResponseSchema.openapi('contactResponseDTO');

    