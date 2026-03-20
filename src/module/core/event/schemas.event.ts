import { z } from '@hono/zod-openapi';
import { Event } from './models.event';
import { NestUserSchema } from '../user/schemas.user';
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const MeetingStatus = z.enum(["IDLE", "LIVE", "ENDED", "CANCELLED"]);
export const EventType = z.enum(["INSTANT", "SCHEDULED", "RECURRING", "WEBINAR"]);

export const ErrorSchema = z.object({
    message: z.string()
});


export const EventQueryParamsSchema = z.object({
    id: z.string().uuid().optional().openapi({ 
        param: { name: 'id', in: 'query' },
        example: '550e8400-e29b-41d4-a716-446655440000' 
    }),
    
    search: z.string().optional().openapi({
        description: 'Fuzzy search across title and description',
        example: 'Planning Sync'
    }),

    shortCode: z.string().max(12).optional().openapi({
        description: 'The random 12-character meeting code (Google Meet style)',
        example: 'abc-defg-hij'
    }),

    slug: z.string().optional().openapi({
        description: 'The custom vanity URL path (Zoom style)',
        example: 'monthly-all-hands'
    }),

    type: EventType.optional(),
    status: MeetingStatus.optional(),
    hostId: z.string().uuid().optional(),

    
    startTimeFrom: z.coerce.date().optional().openapi({
        description: 'Filter events starting after this ISO date',
        type: 'string',
        format: 'date-time'
    }),
    
    startTimeTo: z.coerce.date().optional(),

    page: z.coerce.number().int().min(1).default(1).openapi({
        description: 'Current page number'
    }),
    
    pageSize: z.coerce.number().int().min(1).max(100).default(10).openapi({
        description: 'Number of items per page'
    }),
}).openapi('EventQueryParams');

export const CreateEventSchema = createInsertSchema(Event, {
    // Override the auto-generated z.date() with z.coerce.date()
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    actualStartedAt: z.coerce.date(),
}).omit({
    id: true,
    shortCode: true,
    slug: true,
    actualStartedAt: true,
    createdAt: true,
    updatedAt: true,
}).partial({
    hostId: true,   
    description: true,
    startTime: true,
    endTime: true,
    inviteesEmail: true,
    recurrenceRule: true,
    isRecordingEnabled: true,
    requiresApproval: true
});

export const UpdateEventSchema = createSelectSchema(Event, {
    // Apply the same coercion here for updates
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    actualStartedAt: z.coerce.date(),
}).omit({
    id: true,
    shortCode: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
}).partial(); // .partial() without args makes all fields optional



export const EventObjectSchema = createSelectSchema(Event)

export const EventWithHostSchema = EventObjectSchema.extend({
    host: NestUserSchema 
});

export const EventPaginatedResponseSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    data: z.array(EventObjectSchema),
})