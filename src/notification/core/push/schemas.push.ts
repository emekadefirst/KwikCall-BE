import { z } from 'zod';


export const NotificationSchema = z.object({
  tokens: z.array(z.string().min(10).max(4096)).nonempty(),
  title: z.string().min(1),
  body: z.string().min(1),
  data: z.record(z.string(), z.string()).optional(), 
});