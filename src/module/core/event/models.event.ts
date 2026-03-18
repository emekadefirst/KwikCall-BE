import { pgTable, pgEnum, uuid, timestamp, varchar, text, index, boolean, jsonb } from "drizzle-orm/pg-core";
import { User } from "../user/models.user";

export const MeetingStatus = pgEnum("meeting_status", ["IDLE", "LIVE", "ENDED", "CANCELLED"]);
export const EventType = pgEnum("event_type", ["INSTANT", "SCHEDULED", "RECURRING", "WEBINAR"]);

export const Event = pgTable("events", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    shortCode: varchar("short_code", { length: 12 }).notNull().unique(),
    slug: varchar("slug", { length: 500 }).unique(), 
    type: EventType("type").notNull().default("INSTANT"),
    status: MeetingStatus("status").notNull().default("IDLE"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    inviteesEmail: jsonb("invitees_email").default([]),
    actualStartedAt: timestamp("actual_started_at", { withTimezone: true }),
    recurrenceRule: text("recurrence_rule"),
    isRecordingEnabled: boolean("is_recording_enabled").default(false),
    requiresApproval: boolean("requires_approval").default(true),
    hostId: uuid("host_id").notNull().references(() => User.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
    return {
        shortCodeIdx: index("idx_events_short_code").on(table.shortCode),
        hostIdx: index("idx_events_host_id").on(table.hostId),
        statusIdx: index("idx_events_status").on(table.status),
    };
});