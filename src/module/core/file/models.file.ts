import { pgTable, pgEnum, uuid, integer, text, timestamp } from "drizzle-orm/pg-core";

export const FileType = pgEnum('file_type', ['image', 'video', 'document', 'audio'])

export const File = pgTable('files', {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url"),
    type: FileType("type").notNull(),
    size: integer('size').notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
})