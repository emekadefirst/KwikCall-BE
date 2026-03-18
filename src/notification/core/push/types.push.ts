import z from "zod";
import { NotificationSchema } from "./schemas.push";

export type NotificationPayload = z.infer<typeof NotificationSchema>;