import { z } from "zod";
import { EmailSchema } from "./schemas.mail";

export type EmailPayload = z.infer<typeof EmailSchema>;