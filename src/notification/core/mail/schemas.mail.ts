import { z } from "zod";

export const EmailSchema = z.object({
  to: z.array(z.string().email()).nonempty(),
  from: z.string().email().optional(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  templateName: z.enum(['event', 'password', 'signupsuccess', 'verify', 'contactreply', 'contactadmin', 'newsletter']).optional(),
  templateData: z.record(z.string(), z.any()).optional(),
  cc: z.array(z.string().email()).optional(),
});