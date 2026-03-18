import { z } from '@hono/zod-openapi';
import { 
    EventQueryParamsSchema, 
    CreateEventSchema, 
    UpdateEventSchema, 
    EventObjectSchema, 
    EventWithHostSchema, 
    MeetingStatus,
    EventType,
    EventPaginatedResponseSchema
} from './schemas.event';

export type MeetingStatus = z.infer<typeof MeetingStatus>;
export type EventType = z.infer<typeof EventType>;
export type EventQueryParams = z.infer<typeof EventQueryParamsSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventObject = z.infer<typeof EventObjectSchema>;
export type EventWithHost = z.infer<typeof EventWithHostSchema>;
export type EventPaginatedResponse = z.infer<typeof EventPaginatedResponseSchema>;